import { formatStatValue } from '../utils/playerMetrics';

function renderCell(row, column) {
  if (column.kind === 'competition') {
    return (
      <div className="competition-table__competition">
        <strong>{row.competition}</strong>
        <span>{row.season}</span>
      </div>
    );
  }

  if (column.kind === 'pct') {
    return `${formatStatValue(row[column.key], '-')}%`;
  }

  return formatStatValue(row[column.key], '-');
}

export default function CompetitionTable({ columns = [], rows = [] }) {
  return (
    <div className="competition-table">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} scope="col">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key}>
              {columns.map((column) => (
                <td key={`${row.key}-${column.key}`}>{renderCell(row, column)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
