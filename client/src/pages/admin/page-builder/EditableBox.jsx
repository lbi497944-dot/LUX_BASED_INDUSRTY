import { useMemo } from 'react';

/**
 * EditableBox wraps an editable element in the visual canvas.
 * In 'editor' mode: provides hover/selected outline, badge label, click and keyboard selection.
 * In 'preview' mode: renders transparently without any editor chrome or outlines.
 */
export default function EditableBox({
  children,
  sectionId,
  path = '',
  field = '',
  label = '',
  type = 'text',
  value = '',
  mode = 'editor',
  isSelected = false,
  onSelect,
  className = '',
  style = {},
}) {
  const displayLabel = useMemo(() => {
    if (label) return label.toUpperCase();
    if (field) {
      return field
        .replace(/([A-Z])/g, ' $1')
        .replace(/_/g, ' ')
        .toUpperCase();
    }
    return 'EDITABLE';
  }, [label, field]);

  if (mode !== 'editor') {
    return <>{children}</>;
  }

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onSelect) {
      onSelect({
        sectionId,
        path: path || field,
        field,
        type,
        value,
        label: displayLabel,
      });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      if (onSelect) {
        onSelect({
          sectionId,
          path: path || field,
          field,
          type,
          value,
          label: displayLabel,
        });
      }
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Edit ${displayLabel}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`page-builder-editable-box ${isSelected ? 'is-selected' : ''} ${className}`}
      style={{
        position: 'relative',
        cursor: 'pointer',
        ...style,
      }}
    >
      <span className="page-builder-editable-badge" aria-hidden="true">
        {isSelected ? `✏ ${displayLabel}` : displayLabel}
      </span>
      {children}
    </div>
  );
}
