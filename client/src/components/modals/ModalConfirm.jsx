import { createPortal } from 'react-dom';
import { AlertTriangle, X } from 'lucide-react';

export default function ModalConfirm({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  confirmLabel,
  cancelLabel,
  loading = false,
}) {
  if (!isOpen) return null;

  const displayConfirmText = confirmLabel || confirmText;
  const displayCancelText = cancelLabel || cancelText;

  return createPortal(
    <div
      className="modal-backdrop admin-modal-backdrop admin-confirm-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel?.();
      }}
      role="dialog"
      aria-modal="true"
      style={{ zIndex: 11000 }}
    >
      <div className="modal-container admin-confirm-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close admin-modal-close-btn" onClick={onCancel} aria-label="Close dialog">
          <X size={18} />
        </button>
        <div className="confirm-icon-box">
          <AlertTriangle size={28} className="warning-icon" />
        </div>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="confirm-actions">
          <button className="btn btn-outline btn-sm" onClick={onCancel} disabled={loading}>
            {displayCancelText}
          </button>
          <button className="btn btn-danger btn-sm" onClick={onConfirm} disabled={loading}>
            {loading ? 'Processing...' : displayConfirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
