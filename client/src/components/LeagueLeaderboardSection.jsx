import ClubBadge from './ClubBadge';
import { formatStatValue, formatTextValue } from '../utils/playerMetrics';

function LeaderboardCard({ board, onOpenPlayer }) {
  return (
    <article className="leaderboard-card">
      <div className="leaderboard-card__header">
        <h3>{board.title}</h3>
        <span>{board.statLabel}</span>
      </div>

      <div className="leaderboard-card__rows">
        {board.players.map((player, index) => (
          <button
            className="leaderboard-card__row"
            key={`${board.id}-${player.key}`}
            onClick={() => onOpenPlayer(player.key)}
            type="button"
          >
            <span className="leaderboard-card__rank">{index + 1}</span>
            <div className="leaderboard-card__identity">
              <ClubBadge name={player.squad} size="small" />
              <div>
                <strong>{formatTextValue(player.player, 'Unknown Player')}</strong>
                <span>
                  {formatTextValue(player.exactPosition)} / {formatTextValue(player.primaryRole)}
                </span>
              </div>
            </div>
            <strong className="leaderboard-card__value">{formatStatValue(player.value, 'N/A')}</strong>
          </button>
        ))}
      </div>
    </article>
  );
}

export default function LeagueLeaderboardSection({ boards, onOpenPlayer }) {
  return (
    <section className="league-block">
      <div className="league-block__header">
        <div>
          <p className="home-kicker">League Insights</p>
          <h2>Leaderboards</h2>
        </div>
      </div>

      <div className="leaderboard-grid">
        {boards.map((board) => (
          <LeaderboardCard board={board} key={board.id} onOpenPlayer={onOpenPlayer} />
        ))}
      </div>
    </section>
  );
}
