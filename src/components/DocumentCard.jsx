import React from 'react';

/**
 * Metric summary card component used on the Dashboard.
 * Displays counts, active states, and categories with hover effects.
 */
export default function DocumentCard({
  title,
  value,
  icon,
  color = 'primary',
  subtext,
  onClick
}) {
  // Resolve icons and background styling based on color prop
  const colorMap = {
    primary: {
      bg: 'bg-primary-subtle',
      text: 'text-primary',
      border: 'border-primary'
    },
    success: {
      bg: 'bg-success-subtle',
      text: 'text-success',
      border: 'border-success'
    },
    warning: {
      bg: 'bg-warning-subtle',
      text: 'text-warning',
      border: 'border-warning'
    },
    danger: {
      bg: 'bg-danger-subtle',
      text: 'text-danger',
      border: 'border-danger'
    },
    purple: {
      bg: 'bg-purple-subtle',
      text: 'text-purple',
      border: 'border-purple'
    }
  };

  const currentStyles = colorMap[color] || colorMap.primary;

  return (
    <div 
      className={`card card-premium h-100 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="card-body p-4 d-flex flex-column justify-content-between">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <span className="text-secondary fw-semibold small text-uppercase" style={{ letterSpacing: '0.5px' }}>
            {title}
          </span>
          <div 
            className={`rounded-3 d-flex align-items-center justify-content-center ${currentStyles.bg} ${currentStyles.text}`}
            style={{ width: '48px', height: '48px', fontSize: '1.4rem' }}
          >
            <i className={`bi ${icon}`}></i>
          </div>
        </div>

        <div>
          <h2 className="fw-bold text-dark mb-1">{value}</h2>
          {subtext && (
            <div className="text-muted small d-flex align-items-center">
              <span>{subtext}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Styles for Purple color */}
      <style>{`
        .bg-purple-subtle {
          background-color: rgba(139, 92, 246, 0.1);
        }
        .text-purple {
          color: #7c3aed;
        }
      `}</style>
    </div>
  );
}
