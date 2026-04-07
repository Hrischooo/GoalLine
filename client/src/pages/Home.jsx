import { useMemo } from 'react';
import ClubBadge from '../components/ClubBadge';
import LeagueBadge from '../components/LeagueBadge';
import OvrInlineValue from '../components/OvrInlineValue';
import PlayerDiscoverySection from '../components/PlayerDiscoverySection';
import PlayerHoverPreview from '../components/PlayerHoverPreview';
import PlayerTextBlock from '../components/PlayerTextBlock';
import '../styles/home.css';
import { buildPlayerKey, getLeagueName, getSeasonDatasetLabel } from '../utils/dataset';
import { computeDisplayMetrics, formatStatValue, formatTextValue, toNumber } from '../utils/playerMetrics';
import { getDiscoveryPreviewMetrics } from '../utils/playerViews';

const LEADER_CARD_DEFINITIONS = [
  {
    id: 'top-goals-p90',
    title: 'Top Goals (P90)',
    metricLabel: 'G/90',
    symbol: '◎',
    tone: 'emerald',
    getValue: (player) => toNumber(player.goals_p90),
    formatValue: (value) => formatStatValue(value)
  },
  {
    id: 'key-pass-eff',
    title: 'Key Pass Eff.',
    metricLabel: '%',
    symbol: '∿',
    tone: 'cyan',
    getValue: (_, metrics) => toNumber(metrics.scoutingMetricMap?.key_pass_eff?.value),
    formatValue: (value) => formatStatValue(value)
  },
  {
    id: 'progression',
    title: 'Progression',
    metricLabel: '%',
    symbol: '↗',
    tone: 'violet',
    getValue: (_, metrics) => toNumber(metrics.scoutingMetricMap?.progressive_pass_rate?.value),
    formatValue: (value) => formatStatValue(value)
  },
  {
    id: 'highest-xg-diff',
    title: 'Highest xG Diff',
    metricLabel: 'Diff',
    symbol: '☆',
    tone: 'amber',
    getValue: (_, metrics) => toNumber(metrics.scoutingMetricMap?.xg_diff?.value),
    formatValue: (value) => formatSignedValue(value)
  }
];

function formatSignedValue(value) {
  const numericValue = toNumber(value);

  if (numericValue > 0) {
    return `+${formatStatValue(numericValue)}`;
  }

  if (numericValue < 0) {
    return `-${formatStatValue(Math.abs(numericValue))}`;
  }

  return '0';
}

function buildLeaderCard(definition, records) {
  const bestRecord = records.reduce((best, record) => {
    const value = definition.getValue(record.player, record.metrics);

    if (!Number.isFinite(value) || value <= 0) {
      return best;
    }

    if (!best || value > best.value) {
      return {
        ...record,
        value
      };
    }

    return best;
  }, null);

  if (!bestRecord) {
    return null;
  }

  return {
    id: definition.id,
    title: definition.title,
    metricLabel: definition.metricLabel,
    symbol: definition.symbol,
    tone: definition.tone,
    player: bestRecord.player.player,
    club: bestRecord.player.squad,
    value: definition.formatValue(bestRecord.value)
  };
}

function buildHistogram(values, bucketCount = 12) {
  if (!values.length) {
    return {
      buckets: Array.from({ length: bucketCount }, (_, index) => ({
        id: `empty-${index}`,
        count: 0,
        height: 10,
        label: 'No data'
      })),
      axisLabels: ['0', '0', '0+']
    };
  }

  const minValue = Math.floor(Math.min(...values) / 5) * 5;
  const maxValue = Math.ceil(Math.max(...values) / 5) * 5 || minValue + 5;
  const span = Math.max(maxValue - minValue, 1);
  const buckets = Array.from({ length: bucketCount }, (_, index) => ({
    id: `bucket-${index}`,
    count: 0,
    start: minValue + (span / bucketCount) * index,
    end: minValue + (span / bucketCount) * (index + 1)
  }));

  values.forEach((value) => {
    const normalizedIndex = Math.min(bucketCount - 1, Math.floor(((value - minValue) / span) * bucketCount));
    buckets[Math.max(0, normalizedIndex)].count += 1;
  });

  const peak = Math.max(...buckets.map((bucket) => bucket.count), 1);

  return {
    buckets: buckets.map((bucket) => ({
      id: bucket.id,
      count: bucket.count,
      height: Math.max(10, Math.round((bucket.count / peak) * 100)),
      label: `${Math.round(bucket.start)}-${Math.round(bucket.end)} OVR`
    })),
    axisLabels: [String(minValue), String(Math.round(minValue + span / 2)), `${maxValue}+`]
  };
}

function getSpotlightMetricPercent(metrics, metricKey) {
  return Math.max(12, Math.min(100, Math.round(toNumber(metrics.scoutingMetricMap?.[metricKey]?.percentile) || 0)));
}

function SpotlightPlayerCard({ onNavigate, record }) {
  const { metrics, player } = record;
  const previewMetrics = getDiscoveryPreviewMetrics(player, metrics).slice(0, 2);

  return (
    <button className="home-spotlight-card" onClick={() => onNavigate(`/player/${encodeURIComponent(record.key)}`)} type="button">
      <div className="home-spotlight-card__header">
        <PlayerHoverPreview metrics={metrics} player={player}>
          <div className="home-spotlight-card__identity">
            <ClubBadge name={player.squad} size="large" />
            <div className="home-spotlight-card__copy">
              <div className="home-spotlight-card__title-row">
                <PlayerTextBlock club={player.squad} league="" name={player.player} position={metrics.exactPosition} role={metrics.primaryTacticalRoleLabel} />
                <LeagueBadge name={getLeagueName(player)} size="small" />
              </div>
            </div>
          </div>
        </PlayerHoverPreview>

        <div className="home-spotlight-card__ovr">
          <OvrInlineValue metrics={metrics} value={metrics.finalOVR} />
        </div>
      </div>

      <div className="home-spotlight-card__meta">
        <span>{formatTextValue(player.nation, 'Unknown')}</span>
        <span>Age {formatTextValue(player.age, '-')}</span>
      </div>

      <div className="home-spotlight-card__metrics">
        {previewMetrics.map((metric) => (
          <div className={`home-spotlight-card__metric home-spotlight-card__metric--${metric.tone.replace('accent-', '')}`} key={metric.key}>
            <div className="home-spotlight-card__metric-row">
              <span>{metric.label}</span>
              <strong>{metric.formattedValue}</strong>
            </div>
            <div className="home-spotlight-card__track">
              <div className="home-spotlight-card__fill" style={{ width: `${getSpotlightMetricPercent(metrics, metric.key)}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="home-spotlight-card__footer">
        <span>{metrics.positionFamilyLabel}</span>
        <strong>{formatTextValue(player.season, 'N/A')}</strong>
      </div>
    </button>
  );
}

function TeamStrengthBar({ label, tone, value }) {
  return (
    <div className="home-power-rankings__bar">
      <div className="home-power-rankings__bar-header">
        <span>{label}</span>
        <strong>{formatStatValue(value, '0')}</strong>
      </div>
      <div className="home-power-rankings__track">
        <div className={`home-power-rankings__fill home-power-rankings__fill--${tone}`} style={{ width: `${Math.max(10, Math.min(100, toNumber(value)))}%` }} />
      </div>
    </div>
  );
}

function HomeLeagueCard({ league, onNavigate }) {
  return (
    <button className="home-league-card" onClick={() => onNavigate(`/league/${encodeURIComponent(league.id)}`)} type="button">
      <div className="home-league-card__header">
        <div className="home-league-card__identity">
          <LeagueBadge name={league.name} size="large" />
          <div>
            <p className="home-kicker">League Overview</p>
            <h3>{league.name}</h3>
            <p className="home-league-card__subtitle">
              {league.country} / {league.season} / {league.division}
            </p>
          </div>
        </div>

        <div className="home-league-card__rating">
          <span>Avg OVR</span>
          <strong>{formatStatValue(league.averageOVR, '0')}</strong>
        </div>
      </div>

      <div className="home-league-card__stats">
        <div className="home-league-card__stat">
          <span>Players</span>
          <strong>{league.playersCount}</strong>
        </div>
        <div className="home-league-card__stat">
          <span>Clubs</span>
          <strong>{league.clubs}</strong>
        </div>
      </div>

      <div className="home-league-card__leaders">
        <div className="home-league-card__leader-row">
          <span>Top Scorer</span>
          <strong>
            {league.topScorer} ({league.topScorerGoals})
          </strong>
        </div>
        <div className="home-league-card__leader-row">
          <span>Top Assister</span>
          <strong>
            {league.topAssister} ({league.topAssisterValue})
          </strong>
        </div>
      </div>

      <div className="home-league-card__footer">
        <span>
          Top Rated <strong>{league.topRatedPlayer}</strong>
        </span>
        <em>Open league</em>
      </div>
    </button>
  );
}

export default function Home({ header, leagues, status, players, ratingIndex, teams = [], onNavigate }) {
  const loadedPlayers = players.data || [];
  const seasonLabel = getSeasonDatasetLabel(loadedPlayers);
  const scoutingRecords = useMemo(
    () =>
      loadedPlayers.map((player) => ({
        key: buildPlayerKey(player),
        player,
        metrics: computeDisplayMetrics(player, ratingIndex)
      })),
    [loadedPlayers, ratingIndex]
  );
  const leaderCards = useMemo(() => LEADER_CARD_DEFINITIONS.map((definition) => buildLeaderCard(definition, scoutingRecords)).filter(Boolean), [scoutingRecords]);
  const spotlightPlayers = useMemo(() => {
    const midfielders = scoutingRecords
      .filter((record) => record.metrics.positionFamily === 'midfielder')
      .sort((left, right) => toNumber(right.metrics.finalOVR) - toNumber(left.metrics.finalOVR));
    const outfieldPlayers = scoutingRecords
      .filter((record) => record.metrics.positionFamily !== 'goalkeeper')
      .sort((left, right) => toNumber(right.metrics.finalOVR) - toNumber(left.metrics.finalOVR));

    return (midfielders.length >= 2 ? midfielders : outfieldPlayers).slice(0, 2);
  }, [scoutingRecords]);
  const topTeams = useMemo(
    () =>
      [...teams]
        .sort((left, right) => toNumber(right.teamRating || right.avgRating) - toNumber(left.teamRating || left.avgRating))
        .slice(0, 4),
    [teams]
  );
  const distribution = useMemo(() => buildHistogram(scoutingRecords.map((record) => toNumber(record.metrics.finalOVR)).filter((value) => value > 0)), [scoutingRecords]);
  const featuredLeagues = useMemo(() => [...leagues].slice(0, 2), [leagues]);

  function scrollToPlayers() {
    const section = document.getElementById('players');

    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  return (
    <main className="home-page">
      <div className="home-shell">
        {header}

        <section className="home-hero">
          <div className="home-hero__copy">
            <p className="home-kicker">Full Database Scouting Workspace</p>
            <h1>GoalLine turns raw football data into player decisions.</h1>
            <p className="home-subtitle">
              Browse the full player database, open detailed scouting screens with complete stat objects, and compare any two
              players in the dataset.
            </p>

            <div className="hero-actions">
              <button className="primary-button" type="button" onClick={() => onNavigate('/compare')}>
                Open compare
              </button>
              <button className="secondary-button" type="button" onClick={() => onNavigate('/leagues')}>
                Explore leagues
              </button>
              <button className="secondary-button" type="button" onClick={scrollToPlayers}>
                Browse players
              </button>
            </div>
          </div>

          <div className="hero-highlight">
            <div className="hero-highlight__live-row">
              <span className={`hero-highlight__live-dot${status.error ? ' hero-highlight__live-dot--error' : ''}`} />
              <strong>{status.error ? 'Connection issue' : 'Live dataset'}</strong>
            </div>

            <div className="hero-highlight__metrics">
              <div>
                <span>Profiles loaded</span>
                <strong>{players.loading ? '...' : players.uniquePlayers}</strong>
              </div>
              <div>
                <span>Rows loaded</span>
                <strong>{players.loading ? '...' : players.totalRows}</strong>
              </div>
              <div>
                <span>Season dataset</span>
                <strong>{seasonLabel}</strong>
              </div>
            </div>

            <p className="hero-highlight__status">
              {status.error
                ? `API status: ${status.error}`
                : 'Player, team, league, and comparison views all stay connected to the same scouting dataset.'}
            </p>
          </div>
        </section>

        <section className="home-dashboard">
          <div className="home-dashboard__main">
            <section className="home-panel">
              <div className="home-panel__header">
                <div>
                  <p className="home-kicker">Scout Signals</p>
                  <h2>Stat Leaders</h2>
                </div>
              </div>

              <div className="home-leader-grid">
                {leaderCards.map((card) => (
                  <article className={`home-leader-card home-leader-card--${card.tone}`} key={card.id}>
                    <div className="home-leader-card__header">
                      <div className="home-leader-card__icon" aria-hidden="true">
                        {card.symbol}
                      </div>
                      <div className="home-leader-card__value">
                        <span>{card.title}</span>
                        <div>
                          <strong>{card.value}</strong>
                          <small>{card.metricLabel}</small>
                        </div>
                      </div>
                    </div>

                    <div className="home-leader-card__footer">
                      <strong>{card.player}</strong>
                      <span>{card.club}</span>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="home-panel home-spotlight">
              <div className="home-panel__header home-panel__header--spread">
                <div>
                  <p className="home-kicker">Scout&apos;s Notebook</p>
                  <h2>Trending Performers</h2>
                </div>

                <button className="home-inline-action" onClick={scrollToPlayers} type="button">
                  View database
                </button>
              </div>

              <div className="home-spotlight-grid">
                {spotlightPlayers.map((record) => (
                  <SpotlightPlayerCard key={record.key} onNavigate={onNavigate} record={record} />
                ))}
              </div>
            </section>
          </div>

          <aside className="home-dashboard__side">
            <section className="home-panel home-power-rankings">
              <div className="home-panel__header">
                <div>
                  <p className="home-kicker">Power Rankings</p>
                  <h2>Top Teams</h2>
                </div>
              </div>

              <div className="home-power-rankings__list">
                {topTeams.map((team, index) => (
                  <button className="home-power-rankings__row" key={team.id} onClick={() => onNavigate(`/teams/${encodeURIComponent(team.id)}`)} type="button">
                    <div className="home-power-rankings__row-top">
                      <div className="home-power-rankings__team">
                        <span className="home-power-rankings__rank">{index + 1}</span>
                        <h3>{team.displayName}</h3>
                      </div>
                      <div className="home-power-rankings__rating">{formatStatValue(team.teamRating || team.avgRating, '0')}</div>
                    </div>

                    <div className="home-power-rankings__bars">
                      <TeamStrengthBar label="Atk" tone="cyan" value={toNumber(team.lineRatings?.attack)} />
                      <TeamStrengthBar label="Def" tone="violet" value={toNumber(team.lineRatings?.defense)} />
                    </div>

                    <div className="home-power-rankings__form">
                      {(team.formTokens || ['N/A']).slice(0, 5).map((token, tokenIndex) => (
                        <span
                          className={`home-power-rankings__form-token home-power-rankings__form-token--${String(token)
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, '-')}`}
                          key={`${team.id}-${token}-${tokenIndex}`}
                        >
                          {token}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>

              <button className="home-block-action" onClick={() => onNavigate('/leagues')} type="button">
                View full rankings
              </button>
            </section>

            <section className="home-panel home-health-panel">
              <div className="home-panel__header">
                <div>
                  <p className="home-kicker">Dataset Health</p>
                  <h2>OVR Distribution</h2>
                </div>
              </div>

              <div className="home-health-panel__chart" role="img" aria-label="Player OVR distribution histogram">
                {distribution.buckets.map((bucket) => (
                  <div className="home-health-panel__bar" key={bucket.id} title={`${bucket.label}: ${bucket.count} players`}>
                    <span style={{ height: `${bucket.height}%` }} />
                  </div>
                ))}
              </div>

              <div className="home-health-panel__axis">
                {distribution.axisLabels.map((label) => (
                  <span key={label}>{label}</span>
                ))}
              </div>
            </section>
          </aside>
        </section>

        <section className="browser-section home-league-discovery">
          <div className="home-league-discovery__header">
            <div>
              <p className="home-kicker">League Discovery</p>
              <h2>Start From The Competition Layer</h2>
              <p className="home-subtitle">Open a league workspace to scout role types, leaders, and filtered player pools.</p>
            </div>

            <button className="secondary-button" onClick={() => onNavigate('/leagues')} type="button">
              View all leagues
            </button>
          </div>

          <div className="home-league-grid">
            {featuredLeagues.map((league) => (
              <HomeLeagueCard key={league.id} league={league} onNavigate={onNavigate} />
            ))}
          </div>
        </section>

        {players.error ? <p className="message error-message">Unable to load players: {players.error}</p> : null}
        {players.loading ? <p className="message">Loading full database...</p> : null}

        {!players.loading && !players.error ? <PlayerDiscoverySection onNavigate={onNavigate} players={loadedPlayers} ratingIndex={ratingIndex} /> : null}
      </div>
    </main>
  );
}
