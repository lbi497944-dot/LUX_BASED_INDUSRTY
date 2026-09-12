import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, MapPin, Calendar, Layers, MessageCircle } from 'lucide-react';
import { projectService } from '../../services/projectService';
import { projects as fallbackProjects, images } from '../../data/site';
import PageHero from '../../components/sections/PageHero';
import SectionTitle from '../../components/sections/SectionTitle';
import Reveal from '../../components/sections/Reveal';
import SEO from '../../components/common/SEO';
import { getWhatsAppLink, getProjectWhatsAppMessage } from '../../seo/seoConfig';
import { useSettings } from '../../context/SettingsContext';

export default function ProjectDetail() {
  const { settings } = useSettings();
  const brand = settings?.brandName || 'LUX BASED INDUSTRY';
  const { slug } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const res = await projectService.getProjectBySlug(slug);
        setProject(res.data.project);
      } catch {
        // Fallback to static data
        const local = fallbackProjects.find((p) => (p.slug || p.id) === slug) || fallbackProjects[0];
        setProject(local);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [slug]);

  if (loading) {
    return (
      <main className="project-detail-page" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <SEO title={`Loading Project | ${brand}`} />
        <div style={{ textAlign: 'center' }}>
          <span className="eyebrow gold-label" style={{ letterSpacing: '0.25em' }}>{brand}</span>
          <h2 style={{ fontSize: '18px', letterSpacing: '0.15em', marginTop: '8px', color: 'var(--text-light, #f3f3eb)' }}>
            LOADING COMMISSION...
          </h2>
        </div>
        <div style={{ width: '40px', height: '2px', backgroundColor: 'var(--gold, #e6c77a)' }} />
      </main>
    );
  }

  if (!project) {
    return (
      <main className="project-detail-page" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <SEO title={`Project Not Found | ${brand}`} />
        <div style={{ textAlign: 'center' }}>
          <span className="eyebrow gold-label">PORTFOLIO</span>
          <h2>Project Not Found</h2>
          <p style={{ marginTop: '8px', color: 'rgba(243, 243, 235, 0.65)' }}>The requested architectural project could not be located.</p>
        </div>
        <Link to="/portfolio" className="btn btn-gold" style={{ marginTop: '16px' }}>
          <ArrowLeft size={16} /> RETURN TO PORTFOLIO
        </Link>
      </main>
    );
  }

  const projectTitle = project.title || 'Architectural Lighting Project';
  const projectImage = project.coverImage || project.image || images.hotel;
  const whatsappUrl = getWhatsAppLink(
    getProjectWhatsAppMessage(projectTitle, brand),
    settings?.whatsappNumberClean || settings?.phone
  );

  return (
    <main className="project-detail-page">
      <SEO
        title={`${projectTitle} | ${brand} Portfolio`}
        description={project.description}
        canonical={`/portfolio/${project.slug || project.id}`}
        image={projectImage}
      />

      <PageHero
        eyebrow={`${project.category} · ${project.location}`}
        title={projectTitle}
        description={project.description}
        image={projectImage}
      />

      <section className="section">
        <div className="container">
          <Link to="/portfolio" className="text-link-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '32px' }}>
            <ArrowLeft size={16} /> BACK TO PORTFOLIO
          </Link>

          <div className="detail-split-overview">
            <div className="detail-left-copy">
              <SectionTitle
                eyebrow="ARCHITECTURAL COMMISSION"
                title="Transforming Spaces Through Light"
                description={project.description}
              />

              {project.scope && (
                <div className="lead-section-box" style={{ marginTop: '24px' }}>
                  <h4>Scope & Deliverables</h4>
                  <p>{project.scope}</p>
                </div>
              )}

              <div className="collection-cta-group" style={{ marginTop: '30px' }}>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp">
                  <MessageCircle size={18} /> DISCUSS SIMILAR PROJECT ON WHATSAPP
                </a>
                <Link to="/consultation" className="btn btn-gold">
                  BOOK CONSULTATION <ArrowUpRight size={16} />
                </Link>
              </div>
            </div>

            <div className="detail-right-specs">
              <div className="spec-card">
                <div className="spec-header">
                  <MapPin size={20} className="gold-icon" />
                  <h4>Project Location</h4>
                </div>
                <p className="spec-text">{project.location}</p>
              </div>

              <div className="spec-card">
                <div className="spec-header">
                  <Calendar size={20} className="gold-icon" />
                  <h4>Year of Completion</h4>
                </div>
                <p className="spec-text">{project.year || '2025'}</p>
              </div>

              <div className="spec-card">
                <div className="spec-header">
                  <Layers size={20} className="gold-icon" />
                  <h4>Architectural Typology</h4>
                </div>
                <p className="spec-text">{project.category}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Large In Situ Image */}
      <section className="about-photo-banner">
        <div className="container">
          <div className="photo-frame-luxury">
            <img
              src={projectImage}
              alt={projectTitle}
              loading="lazy"
              decoding="async"
              onError={(e) => {
                if (e.target.src !== images.hotel) {
                  e.target.src = images.hotel;
                }
              }}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
