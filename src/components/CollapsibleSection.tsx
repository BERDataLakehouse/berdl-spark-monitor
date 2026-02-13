import React, { useState } from 'react';

interface IProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export const CollapsibleSection: React.FC<IProps> = ({
  title,
  defaultOpen = true,
  children
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="spark-monitor-section">
      <button
        className="spark-monitor-section-header"
        onClick={() => setIsOpen(v => !v)}
        aria-expanded={isOpen}
      >
        <span className={`spark-monitor-chevron ${isOpen ? 'spark-monitor-chevron--open' : ''}`}>
          &#9654;
        </span>
        <span className="spark-monitor-section-title">{title}</span>
      </button>
      {isOpen && (
        <div className="spark-monitor-section-content">{children}</div>
      )}
    </div>
  );
};
