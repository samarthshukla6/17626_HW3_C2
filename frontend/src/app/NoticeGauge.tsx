interface NoticeGaugeProps {
  label: string;
}

/**
 * Decorative half-ring showing the notice given against the plan's 48 hours
 * (REQ-04). The text label next to it is the requirement; this only makes it
 * easier to read at a glance, so it is hidden from screen readers.
 */
export function NoticeGauge({ label }: NoticeGaugeProps): React.ReactElement | null {
  const match = label.match(/(\d+) h/);
  if (!match) {
    return null;
  }
  const hours = Number(match[1]);
  const fraction = Math.min(hours / 96, 1);
  const short = hours < 48;
  const radius = 26;
  const circumference = Math.PI * radius;
  return (
    <svg className={`notice-gauge${short ? " notice-gauge--short" : ""}`} width="64" height="38" viewBox="0 0 64 38" aria-hidden="true">
      <path d="M6 34 A26 26 0 0 1 58 34" className="notice-gauge__track" />
      <path
        d="M6 34 A26 26 0 0 1 58 34"
        className="notice-gauge__value"
        strokeDasharray={`${circumference * fraction} ${circumference}`}
      />
      <line x1="32" y1="8" x2="32" y2="14" className="notice-gauge__mark" />
      <text x="32" y="33" textAnchor="middle" className="notice-gauge__text">{hours}h</text>
    </svg>
  );
}
