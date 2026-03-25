require('dotenv').config();

const cors = require('cors');
const express = require('express');

const { databaseConfig, pool, query } = require('./db');

const app = express();
const port = Number(process.env.PORT) || 5000;
const PLAYER_TABLE = 'all_players';
let cachedPlayerColumns = null;

app.use(cors());
app.use(express.json());

async function getPlayerColumns() {
  if (cachedPlayerColumns) {
    return cachedPlayerColumns;
  }

  const result = await query(
    `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = $1
      ORDER BY ordinal_position
    `,
    [PLAYER_TABLE]
  );

  cachedPlayerColumns = result.rows.map((row) => row.column_name);
  return cachedPlayerColumns;
}

app.get('/', (req, res) => {
  res.json({
    ok: true,
    message: 'GoalLine API is running',
    endpoints: ['/api/health', '/api/players', '/api/players/:playerName']
  });
});

app.get('/api/health', async (req, res, next) => {
  console.log('[api] GET /api/health');

  try {
    const result = await query('SELECT NOW() AS time');

    res.json({
      ok: true,
      message: 'API and database are working',
      time: result.rows[0].time
    });
  } catch (error) {
    next(error);
  }
});

app.get('/api/players', async (req, res, next) => {
  console.log('[api] GET /api/players');

  try {
    const columns = await getPlayerColumns();

    if (!columns.length) {
      throw new Error(`No columns were found for ${PLAYER_TABLE}`);
    }

    const result = await query(
      `
        SELECT
          ${columns.join(',\n          ')}
        FROM ${PLAYER_TABLE}
        ORDER BY player ASC, season DESC NULLS LAST, squad ASC
      `
    );

    const leagueCounts = await query(
      `
        SELECT
          COALESCE(league, comp, 'Unknown League') AS league_name,
          COUNT(*)::int AS count
        FROM ${PLAYER_TABLE}
        GROUP BY 1
        ORDER BY 2 DESC, 1 ASC
      `
    );

    console.debug('[api] all_players loaded', {
      totalPlayers: result.rowCount,
      leagueCounts: leagueCounts.rows
    });

    res.json({
      ok: true,
      count: result.rowCount,
      columns,
      leagueCounts: leagueCounts.rows,
      source: PLAYER_TABLE,
      players: result.rows
    });
  } catch (error) {
    next(error);
  }
});

app.get('/api/players/:playerName', async (req, res, next) => {
  const { playerName } = req.params;

  console.log(`[api] GET /api/players/${playerName}`);

  try {
    const availableColumns = await getPlayerColumns();

    if (!availableColumns.length) {
      throw new Error(`No compatible player detail columns were found in ${PLAYER_TABLE}`);
    }

    const result = await query(
      `
        SELECT
          ${availableColumns.join(',\n          ')}
        FROM ${PLAYER_TABLE}
        WHERE LOWER(player) = LOWER($1)
        ORDER BY season DESC NULLS LAST, squad ASC
        LIMIT 1
      `,
      [playerName]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        ok: false,
        message: `Player not found: ${playerName}`
      });
    }

    return res.json({
      ok: true,
      player: result.rows[0]
    });
  } catch (error) {
    return next(error);
  }
});

app.use((req, res) => {
  res.status(404).json({
    ok: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

app.use((error, req, res, next) => {
  console.error('[api] Request failed:', error);

  res.status(500).json({
    ok: false,
    message: 'Internal server error',
    error: error.message
  });
});

const server = app.listen(port, async () => {
  console.log(`[api] Server listening on http://localhost:${port}`);
  console.log('[api] Loaded database config', {
    source: databaseConfig.source,
    host: databaseConfig.host,
    port: databaseConfig.port,
    database: databaseConfig.database,
    user: databaseConfig.user
  });

  try {
    const result = await query('SELECT NOW() AS time');
    console.log('[api] Startup database check passed at', result.rows[0].time);

    const leagueCounts = await query(
      `
        SELECT
          COALESCE(league, comp, 'Unknown League') AS league_name,
          COUNT(*)::int AS count
        FROM ${PLAYER_TABLE}
        GROUP BY 1
        ORDER BY 2 DESC, 1 ASC
      `
    );

    console.log('[api] all_players league counts', leagueCounts.rows);
  } catch (error) {
    console.error('[api] Startup database check failed:', error.message);
  }
});

async function shutdown(signal) {
  console.log(`[api] Received ${signal}. Shutting down...`);

  server.close(async () => {
    try {
      await pool.end();
      console.log('[db] PostgreSQL pool closed');
    } catch (error) {
      console.error('[db] Error while closing pool:', error);
    } finally {
      process.exit(0);
    }
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
