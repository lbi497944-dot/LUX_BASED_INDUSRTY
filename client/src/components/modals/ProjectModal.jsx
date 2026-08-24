import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Calendar, Layers, ArrowUpRight, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { projects } from '../../data/site';
import { getWhatsAppLink, getProjectWhatsAppMessage } from '../../seo/seoConfig';

export default function ProjectModal({ project, onClose, onSelectProject }) {
  useEffect(() => {
    if (project) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    const handleKeyDown = (e) => {
      if (!project) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && onSelectProject) handleNext();
      if (e.key === 'ArrowLeft' && onSelectProject) handlePrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [project, onClose, onSelectProject]);

  if (!project) return null;

  const currentIndex = projects.findIndex((p) => p.title === project.title);
  const handlePrev = () => {
    if (!onSelectProject) return;
    const prevIdx = (currentIndex - 1 + projects.length) % projects.length;
    onSelectProject(projects[prevIdx]);
  };
  const handleNext = () => {
    if (!onSelectProject) return;
    const nextIdx = (currentIndex + 1) % projects.length;
    onSelectProject(projects[nextIdx]);
  };

  const whatsappMsg = getProjectWhatsAppMessage(project.title);
  const whatsappUrl = getWhatsAppLink(whatsappMsg);

  return (
    <AnimatePresence>
      <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <motion.div
          className="modal-container"
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.98 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="modal-close" onClick={onClose} aria-label="Close project modal">
            <X size={20} />
          </button>

          {/* Previous / Next Lightbox Controls */}
          {onSelectProject && (
            <>
              <button
                className="lightbox-nav-btn prev-btn"
                onClick={handlePrev}
                aria-label="Previous project"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                className="lightbox-nav-btn next-btn"
                onClick={handleNext}
                aria-label="Next project"
              >
                <ChevronRight size={22} />
              </button>
            </>
          )}

          <div className="modal-image-wrapper">
            <img src={project.image} alt={project.title} loading="lazy" decoding="async" />
            <div className="modal-image-overlay" />
          </div>

          <div className="modal-body">
            <span className="eyebrow">{project.category} · {project.location}</span>
            <h2 id="modal-title" className="modal-title">{project.title}</h2>

            <div className="modal-meta-grid">
              <div className="modal-meta-item">
                <MapPin size={16} />
                <span><strong>Location:</strong> {project.location}</span>
              </div>
              <div className="modal-meta-item">
                <Calendar size={16} />
                <span><strong>Completed:</strong> {project.year || '2025'}</span>
              </div>
              <div className="modal-meta-item">
                <Layers size={16} />
                <span><strong>Category:</strong> {project.category}</span>
              </div>
            </div>

            <p className="modal-description">{project.description}</p>

            {project.scope && (
              <div className="modal-scope">
                <h4>Project Scope & Deliverables</h4>
                <p>{project.scope}</p>
              </div>
            )}

            <div className="modal-actions-dual">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp"
              >
                <MessageCircle size={18} /> DISCUSS THIS PROJECT ON WHATSAPP
              </a>

              <Link to="/consultation" className="btn btn-gold" onClick={onClose}>
                BOOK CONSULTATION <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
