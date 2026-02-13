import React from 'react';

interface IProps {
  label: string;
  used: number;
  total: number;
  formatValue?: (n: number) => string;
}

/**
 * Reusable progress bar with color thresholds.
 * Green <70%, amber 70-90%, red >90%.
 */
export const ResourceBar: React.FC<IProps> = ({ label, used, total, formatValue }) => {
  const pct = total > 0 ? (used / total) * 100 : 0;
  const color = pct > 90 ? 'red' : pct > 70 ? 'amber' : 'green';
  const fmt = formatValue ?? String;

  return (
    <div className="spark-monitor-resource-bar">
      <div className="spark-monitor-resource-bar-header">
        <span className="spark-monitor-resource-bar-label">{label}</span>
        <span className="spark-monitor-resource-bar-value">
          {fmt(used)} / {fmt(total)}
        </span>
      </div>
      <div className="spark-monitor-resource-bar-track">
        <div
          className={`spark-monitor-resource-bar-fill spark-monitor-resource-bar-fill--${color}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  );
};
