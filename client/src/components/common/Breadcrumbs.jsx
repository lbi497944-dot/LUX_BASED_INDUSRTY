import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Breadcrumbs Component
 * Accessible, semantic navigation breadcrumb trail for luxury public pages.
 *
 * @param {Array<{label: string, path?: string}>} items - Array of breadcrumb crumbs
 * @param {string} [className] - Optional extra CSS class
 */
export default function Breadcrumbs({ items = [], className = '' }) {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumbs" className={`breadcrumbs-nav ${className}`}>
      <ol
        className="breadcrumbs-list"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '8px',
          listStyle: 'none',
          padding: 0,
          margin: 0,
          fontSize: '0.85rem',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}
      >
        {items.map((crumb, index) => {
          const isLast = index === items.length - 1;

          return (
            <li
              key={crumb.path || crumb.label || index}
              className="breadcrumbs-item"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {index > 0 && (
                <span
                  className="breadcrumbs-separator"
                  aria-hidden="true"
                  style={{
                    color: 'rgba(230, 199, 122, 0.4)',
                    fontSize: '0.75rem',
                    userSelect: 'none',
                  }}
                >
                  /
                </span>
              )}
              {isLast || !crumb.path ? (
                <span
                  className="breadcrumbs-current"
                  aria-current="page"
                  style={{
                    color: '#e6c77a',
                    fontWeight: 500,
                    maxWidth: '280px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {crumb.label}
                </span>
              ) : (
                <Link
                  to={crumb.path}
                  className="breadcrumbs-link"
                  style={{
                    color: 'rgba(243, 243, 235, 0.65)',
                    textDecoration: 'none',
                    transition: 'color 0.2s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#fbf8ee')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(243, 243, 235, 0.65)')}
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
