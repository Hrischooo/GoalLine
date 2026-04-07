import ClubBadge from './ClubBadge';
import PlayerHoverPreview from './PlayerHoverPreview';
import PlayerTextBlock from './PlayerTextBlock';
import SectionHeader from './SectionHeader';
import { formatStatValue, formatTextValue } from '../utils/playerMetrics';
import { getLeagueName } from '../utils/dataset';

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
            <PlayerHoverPreview metrics={player.metrics || { exactPosition: player.exactPosition, primaryTacticalRoleLabel: player.primaryRole }} player={player}>
              <div className="leaderboard-card__identity">
                <ClubBadge name={player.squad} size="small" />
                <PlayerTextBlock
                  club={player.squad}
                  league={getLeagueName(player)}
                  name={player.player}
                  position={player.exactPosition}
                  role={player.primaryRole}
                />
              </div>
            </PlayerHoverPreview>
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
      <SectionHeader className="league-block__header" kicker="League Insights" title="Leaderboards" />

      <div className="leaderboard-grid">
        {boards.map((board) => (
          <LeaderboardCard board={board} key={board.id} onOpenPlayer={onOpenPlayer} />
        ))}
      </div>
    </section>
  );
}
