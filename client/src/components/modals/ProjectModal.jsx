import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Calendar, Layers, ArrowUpRight, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { projects } from '../../data/site';
import { getWhatsAppLink, getProjectWhatsAppMessage } from '../../seo/seoConfig';
import { useSettings } from '../../context/SettingsContext';

export default function ProjectModal({ project, onClose, onSelectProject, projectList }) {
  const { settings } = useSettings();
  const brand = settings?.brandName || 'LUX BASED INDUSTRY';
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (project) {
      document.body.style.overflow = 'hidden';
      setSelectedImage(null);
    } else {
      document.body.style.overflow = '';
      setSelectedImage(null);
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

  const activeList = Array.isArray(projectList) && projectList.length > 0 ? projectList : projects;
  const currentIndex = activeList.findIndex(
    (p) => (p._id && project._id && p._id === project._id) || p.title === project.title
  );
  const safeIndex = currentIndex >= 0 ? currentIndex : 0;

  const handlePrev = () => {
    if (!onSelectProject || activeList.length === 0) return;
    const prevIdx = (safeIndex - 1 + activeList.length) % activeList.length;
    onSelectProject(activeList[prevIdx]);
  };
  const handleNext = () => {
    if (!onSelectProject || activeList.length === 0) return;
    const nextIdx = (safeIndex + 1) % activeList.length;
    onSelectProject(activeList[nextIdx]);
  };

  // Safe image resolution: coverImage -> primary source, image -> backwards-compatible fallback, gallery -> fallback if neither exists
  const primaryCover =
    project.coverImage ||
    project.image ||
    (Array.isArray(project.gallery) && project.gallery.length > 0 ? project.gallery[0] : '');
  const activeImage = selectedImage || primaryCover;
  const hasGallery = Array.isArray(project.gallery) && project.gallery.length > 0;

  const whatsappMsg = getProjectWhatsAppMessage(project.title, brand);
  const whatsappUrl = getWhatsAppLink(whatsappMsg, settings?.whatsappNumberClean || settings?.phone);

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
            <img src={activeImage} alt={project.title} loading="lazy" decoding="async" />
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

            {hasGallery && (
              <div className="modal-gallery-strip" style={{ display: 'flex', gap: '8px', marginBottom: '18px', overflowX: 'auto', paddingBottom: '4px' }}>
                {[primaryCover, ...project.gallery.filter((g) => g && g !== primaryCover)].map((imgUrl, gIdx) => (
                  <button
                    key={`gallery-thumb-${gIdx}`}
                    type="button"
                    onClick={() => setSelectedImage(imgUrl)}
                    style={{
                      border: activeImage === imgUrl ? '2px solid var(--gold, #e6c77a)' : '1px solid rgba(0,0,0,0.1)',
                      padding: 0,
                      background: 'none',
                      cursor: 'pointer',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      width: '64px',
                      height: '44px',
                      flexShrink: 0,
                      opacity: activeImage === imgUrl ? 1 : 0.65,
                      transition: 'all 0.2s ease',
                    }}
                    aria-label={`View photo ${gIdx + 1}`}
                  >
                    <img src={imgUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </button>
                ))}
              </div>
            )}

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
