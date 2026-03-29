import OvrBreakdownTooltip from './OvrBreakdownTooltip';

export default function OvrInlineValue({ className = '', label = 'OVR', metrics, value }) {
  return (
    <div className={className}>
      <div className="ovr-inline-value__label">
        <span>{label}</span>
        <OvrBreakdownTooltip metrics={metrics} />
      </div>
      <strong>{value ?? metrics?.finalOVR ?? '-'}</strong>
    </div>
  );
}
