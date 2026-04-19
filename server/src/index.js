require('dotenv').config();

const cors = require('cors');
const express = require('express');

const { buildPlayerAnalytics, detectFormation } = require('./analytics');
const { databaseConfig, pool, query } = require('./db');
const { TEAM_PROFILE_OVERRIDES } = require('./teamSeed');

const app = express();
const DEFAULT_PORT = 5000;
const parsedPort = Number.parseInt(process.env.PORT ?? '', 10);
const hasExplicitPort = Number.isInteger(parsedPort) && parsedPort > 0;
const requestedPort = hasExplicitPort ? parsedPort : DEFAULT_PORT;
const PLAYER_TABLE = 'all_players';
const TEAM_TABLE = 'teams';
let cachedPlayerColumns = null;
let teamDatasetPromise = null;
let analyticsReadyPromise = null;
let server = null;

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

function createTeamId(name = '') {
  return String(name)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function getCountryFromLeague(league = '') {
  if (league === 'Premier League') {
    return 'England';
  }

  if (league === 'Bundesliga') {
    return 'Germany';
  }

  return 'Unknown';
}

async function ensureTeamDatasetReady() {
  if (!teamDatasetPromise) {
    teamDatasetPromise = (async () => {
      await query(`
        CREATE TABLE IF NOT EXISTS ${TEAM_TABLE} (
          team_id text PRIMARY KEY,
          name text NOT NULL UNIQUE,
          display_name text,
          league text NOT NULL,
          country text NOT NULL,
          manager text NOT NULL,
          preferred_formation text NOT NULL,
          play_style text NOT NULL,
          form_last_5 text NOT NULL,
          avg_age numeric(4,1),
          squad_size integer,
          logo text,
          goals_scored integer,
          goals_conceded integer,
          clean_sheets integer,
          detected_formation text
        )
      `);

      const dynamicTeams = await query(
        `
          SELECT DISTINCT
            squad AS name,
            COALESCE(league, comp, 'Unknown League') AS league
          FROM ${PLAYER_TABLE}
          WHERE COALESCE(TRIM(squad), '') <> ''
          ORDER BY league ASC, squad ASC
        `
      );

      for (const team of dynamicTeams.rows) {
        await query(
          `
            INSERT INTO ${TEAM_TABLE} (
              team_id,
              name,
              display_name,
              league,
              country,
              manager,
              preferred_formation,
              play_style,
              form_last_5,
              logo
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            ON CONFLICT (name) DO UPDATE SET
              team_id = EXCLUDED.team_id,
              display_name = COALESCE(${TEAM_TABLE}.display_name, EXCLUDED.display_name),
              league = EXCLUDED.league,
              country = CASE
                WHEN ${TEAM_TABLE}.country IS NULL OR ${TEAM_TABLE}.country = '' OR ${TEAM_TABLE}.country = 'Unknown'
                  THEN EXCLUDED.country
                ELSE ${TEAM_TABLE}.country
              END,
              manager = CASE
                WHEN ${TEAM_TABLE}.manager IS NULL OR ${TEAM_TABLE}.manager = ''
                  THEN EXCLUDED.manager
                ELSE ${TEAM_TABLE}.manager
              END,
              preferred_formation = CASE
                WHEN ${TEAM_TABLE}.preferred_formation IS NULL OR ${TEAM_TABLE}.preferred_formation = ''
                  THEN EXCLUDED.preferred_formation
                ELSE ${TEAM_TABLE}.preferred_formation
              END,
              play_style = CASE
                WHEN ${TEAM_TABLE}.play_style IS NULL OR ${TEAM_TABLE}.play_style = ''
                  THEN EXCLUDED.play_style
                ELSE ${TEAM_TABLE}.play_style
              END,
              form_last_5 = CASE
                WHEN ${TEAM_TABLE}.form_last_5 IS NULL OR ${TEAM_TABLE}.form_last_5 = ''
                  THEN EXCLUDED.form_last_5
                ELSE ${TEAM_TABLE}.form_last_5
              END
          `,
          [
            createTeamId(team.name),
            team.name,
            team.name,
            team.league,
            getCountryFromLeague(team.league),
            'Unknown',
            'N/A',
            'N/A',
            'N/A',
            ''
          ]
        );
      }

      for (const team of TEAM_PROFILE_OVERRIDES) {
        await query(
          `
            INSERT INTO ${TEAM_TABLE} (
              team_id,
              name,
              display_name,
              league,
              country,
              manager,
              preferred_formation,
              play_style,
              form_last_5,
              avg_age,
              squad_size,
              logo
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            ON CONFLICT (name) DO UPDATE SET
              team_id = EXCLUDED.team_id,
              display_name = EXCLUDED.display_name,
              league = EXCLUDED.league,
              country = EXCLUDED.country,
              manager = EXCLUDED.manager,
              preferred_formation = EXCLUDED.preferred_formation,
              play_style = EXCLUDED.play_style,
              form_last_5 = EXCLUDED.form_last_5,
              avg_age = COALESCE(EXCLUDED.avg_age, ${TEAM_TABLE}.avg_age),
              squad_size = COALESCE(EXCLUDED.squad_size, ${TEAM_TABLE}.squad_size),
              logo = EXCLUDED.logo
          `,
          [
            createTeamId(team.name),
            team.name,
            team.display_name,
            team.league,
            team.country,
            team.manager,
            team.preferred_formation,
            team.play_style,
            team.form_last_5,
            team.avg_age,
            team.squad_size,
            team.logo
          ]
        );
      }

      await query(
        `
          UPDATE ${TEAM_TABLE} AS team
          SET
            avg_age = stats.avg_age,
            squad_size = stats.squad_size,
            goals_scored = stats.goals_scored,
            clean_sheets = stats.clean_sheets
          FROM (
            SELECT
              squad AS team_name,
              ROUND(AVG(NULLIF(age, '')::numeric), 1) AS avg_age,
              COUNT(*)::int AS squad_size,
              SUM(COALESCE(NULLIF(goals, '')::numeric, 0))::int AS goals_scored,
              SUM(
                CASE
                  WHEN UPPER(COALESCE(pos, '')) = 'GK' THEN COALESCE(NULLIF(clean_sheets, '')::numeric, 0)
                  ELSE 0
                END
              )::int AS clean_sheets
            FROM ${PLAYER_TABLE}
            WHERE squad IN (SELECT name FROM ${TEAM_TABLE})
            GROUP BY squad
          ) AS stats
          WHERE stats.team_name = team.name
        `
      );

      const goalsConcededSource = await query(
        `
          SELECT
            squad AS team_name,
            ROUND(AVG(COALESCE(NULLIF(goals_against_p90, '')::numeric, 0) * COALESCE(NULLIF(avg_mins_per_match, '')::numeric, 0) / 90))::int AS goals_conceded
          FROM ${PLAYER_TABLE}
          WHERE UPPER(COALESCE(pos, '')) = 'GK'
            AND squad IN (SELECT name FROM ${TEAM_TABLE})
          GROUP BY squad
        `
      );

      for (const row of goalsConcededSource.rows) {
        await query(
          `
            UPDATE ${TEAM_TABLE}
            SET goals_conceded = $2
            WHERE name = $1
          `,
          [row.team_name, Number(row.goals_conceded || 0)]
        );
      }
    })().catch((error) => {
      teamDatasetPromise = null;
      throw error;
    });
  }

  return teamDatasetPromise;
}

async function ensureAnalyticsColumnsReady() {
  await query(`
    ALTER TABLE ${PLAYER_TABLE}
    ADD COLUMN IF NOT EXISTS overall_rating integer,
    ADD COLUMN IF NOT EXISTS role_tag text,
    ADD COLUMN IF NOT EXISTS position_group text
  `);

  await query(`
    ALTER TABLE ${TEAM_TABLE}
    ADD COLUMN IF NOT EXISTS detected_formation text
  `);

  cachedPlayerColumns = null;
}

async function ensureAnalyticsReady() {
  if (!analyticsReadyPromise) {
    analyticsReadyPromise = (async () => {
      await ensureTeamDatasetReady();
      await ensureAnalyticsColumnsReady();

      const playerRows = await query(
        `
          SELECT *
          FROM ${PLAYER_TABLE}
          ORDER BY player ASC, squad ASC, season DESC NULLS LAST
        `
      );

      const enrichedPlayers = buildPlayerAnalytics(playerRows.rows);

      for (const player of enrichedPlayers) {
        await query(
          `
            UPDATE ${PLAYER_TABLE}
            SET
              overall_rating = $1,
              role_tag = $2,
              position_group = $3
            WHERE LOWER(player) = LOWER($4)
              AND LOWER(COALESCE(squad, '')) = LOWER($5)
              AND LOWER(COALESCE(league, comp, '')) = LOWER($6)
              AND COALESCE(season, '') = $7
          `,
          [
            player.overall_rating,
            player.role_tag,
            player.position_group,
            player.player,
            player.squad,
            player.league || player.comp || '',
            player.season || ''
          ]
        );
      }

      const teamRows = await query(
        `
          SELECT
            team_id,
            name,
            preferred_formation
          FROM ${TEAM_TABLE}
        `
      );

      for (const team of teamRows.rows) {
        const teamPlayers = enrichedPlayers.filter((player) => String(player.squad || '').toLowerCase() === String(team.name || '').toLowerCase());
        const detectedFormation = detectFormation(teamPlayers, team.preferred_formation || 'N/A');

        await query(
          `
            UPDATE ${TEAM_TABLE}
            SET detected_formation = $2
            WHERE team_id = $1
          `,
          [team.team_id, detectedFormation]
        );
      }
    })().catch((error) => {
      analyticsReadyPromise = null;
      throw error;
    });
  }

  return analyticsReadyPromise;
}

app.get('/', (req, res) => {
  res.json({
    ok: true,
    message: 'GoalLine API is running',
    endpoints: ['/api/health', '/api/players', '/api/players/:playerName', '/api/teams', '/api/teams/:teamName']
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
    await ensureAnalyticsReady();
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
    await ensureAnalyticsReady();
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

app.get('/api/teams', async (req, res, next) => {
  console.log('[api] GET /api/teams');

  try {
    await ensureAnalyticsReady();

    const result = await query(
      `
        SELECT
          team_id,
          name,
          display_name,
          league,
          country,
          manager,
          preferred_formation,
          play_style,
          form_last_5,
          avg_age,
          squad_size,
          logo,
          goals_scored,
          goals_conceded,
          clean_sheets,
          detected_formation
        FROM ${TEAM_TABLE}
        ORDER BY league ASC, COALESCE(display_name, name) ASC
      `
    );

    res.json({
      ok: true,
      count: result.rowCount,
      teams: result.rows
    });
  } catch (error) {
    next(error);
  }
});

app.get('/api/teams/:teamName', async (req, res, next) => {
  const { teamName } = req.params;

  console.log(`[api] GET /api/teams/${teamName}`);

  try {
    await ensureAnalyticsReady();

    const result = await query(
      `
        SELECT
          team_id,
          name,
          display_name,
          league,
          country,
          manager,
          preferred_formation,
          play_style,
          form_last_5,
          avg_age,
          squad_size,
          logo,
          goals_scored,
          goals_conceded,
          clean_sheets,
          detected_formation
        FROM ${TEAM_TABLE}
        WHERE LOWER(team_id) = LOWER($1)
          OR LOWER(name) = LOWER($1)
          OR LOWER(COALESCE(display_name, '')) = LOWER($1)
        LIMIT 1
      `,
      [teamName]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        ok: false,
        message: `Team not found: ${teamName}`
      });
    }

    return res.json({
      ok: true,
      team: result.rows[0]
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

async function runStartupChecks(activePort) {
  console.log(`[api] Server listening on http://localhost:${activePort}`);
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
    await ensureAnalyticsReady();
    console.log('[api] Team analytics ready', {
      teamsOverridden: TEAM_PROFILE_OVERRIDES.length
    });

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
}

function startServer(portToUse) {
  const nextServer = app.listen(portToUse, async () => {
    server = nextServer;
    await runStartupChecks(portToUse);
  });

  nextServer.once('error', (error) => {
    if (error.code === 'EADDRINUSE' && !hasExplicitPort) {
      const fallbackPort = portToUse + 1;
      console.warn(
        `[api] Port ${portToUse} is already in use. Retrying on http://localhost:${fallbackPort}`
      );
      startServer(fallbackPort);
      return;
    }

    console.error(`[api] Failed to start server on port ${portToUse}:`, error.message);
    process.exit(1);
  });
}

startServer(requestedPort);

async function shutdown(signal) {
  console.log(`[api] Received ${signal}. Shutting down...`);

  if (!server || !server.listening) {
    try {
      await pool.end();
      console.log('[db] PostgreSQL pool closed');
    } catch (error) {
      console.error('[db] Error while closing pool:', error);
    } finally {
      process.exit(0);
    }
  }

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
