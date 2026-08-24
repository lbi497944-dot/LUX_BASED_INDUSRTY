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

export default function ProjectDetail() {
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

  if (!project) return null;

  const projectTitle = project.title || 'Architectural Lighting Project';
  const projectImage = project.coverImage || project.image || images.hotel;
  const whatsappUrl = getWhatsAppLink(getProjectWhatsAppMessage(projectTitle));

  return (
    <main className="project-detail-page">
      <SEO
        title={`${projectTitle} | Veloura Lighting Portfolio`}
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
            <img src={projectImage} alt={projectTitle} loading="lazy" decoding="async" />
          </div>
        </div>
      </section>
    </main>
  );
}
