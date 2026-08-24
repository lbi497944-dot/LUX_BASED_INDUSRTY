import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const { title, message, type = 'success' } = toast;

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          className={`toast-container toast-${type}`}
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          role="alert"
        >
          <div className="toast-icon">
            {type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          </div>
          <div className="toast-content">
            {title && <h4 className="toast-title">{title}</h4>}
            <p className="toast-message">{message}</p>
          </div>
          <button className="toast-close" onClick={onClose} aria-label="Close notification">
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
