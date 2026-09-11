import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Filter } from 'lucide-react';
import { projects as fallbackProjects, images } from '../../data/site';
import { projectService } from '../../services/projectService';
import PageHero from '../../components/sections/PageHero';
import Reveal from '../../components/sections/Reveal';
import ProjectModal from '../../components/modals/ProjectModal';
import SEO from '../../components/common/SEO';
import { pageSeoData } from '../../seo/seoConfig';
import { useSettings } from '../../context/SettingsContext';

const categories = ['ALL', 'RESIDENTIAL', 'HOSPITALITY', 'RESTAURANT', 'COMMERCIAL'];

export default function Portfolio() {
  const { settings } = useSettings();
  const brand = settings?.brandName || 'LUX BASED INDUSTRY';
  const [projects, setProjects] = useState(fallbackProjects);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await projectService.getProjects({ category: activeFilter });
        if (res.data?.length) {
          setProjects(res.data);
        } else if (activeFilter === 'ALL') {
          setProjects(fallbackProjects);
        } else {
          setProjects(
            fallbackProjects.filter((p) => p.category.toUpperCase() === activeFilter.toUpperCase())
          );
        }
      } catch {
        const filtered =
          activeFilter === 'ALL'
            ? fallbackProjects
            : fallbackProjects.filter(
                (p) => p.category.toUpperCase() === activeFilter.toUpperCase()
              );
        setProjects(filtered);
      }
    };

    fetchProjects();
  }, [activeFilter]);

  const filteredProjects = projects;

  return (
    <main className="portfolio-page">
      <SEO
        title={pageSeoData.portfolio.title}
        description={pageSeoData.portfolio.description}
        canonical="/portfolio"
      />

      {/* Project Detail Modal Lightbox */}
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        onSelectProject={(proj) => setSelectedProject(proj)}
        projectList={filteredProjects}
      />

      <PageHero
        eyebrow="OUR PROJECTS"
        title="Lighting That Defines Spaces."
        description={`Explore a curated showcase of ${brand} architectural lighting installations across luxury villas, destination hotels, fine dining establishments, and corporate headquarters.`}
        image={images.hotel}
      />

      <section className="section">
        <div className="container">
          {/* Category Filter Bar */}
          <div className="portfolio-filter-bar">
            <span className="filter-label">
              <Filter size={14} /> FILTER BY CATEGORY:
            </span>
            <div className="filter-buttons">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`filter-btn ${activeFilter === cat ? 'active' : ''}`}
                  onClick={() => setActiveFilter(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Editorial Grid */}
          <div className="portfolio-editorial-grid">
            {filteredProjects.map((proj, idx) => {
              const projectImg = proj.coverImage || proj.image;
              const projectKey = proj._id || proj.id || proj.slug || proj.title || `proj-${idx}`;
              return (
                <Reveal key={projectKey} delay={idx * 0.1}>
                  <div
                    className={`portfolio-card-luxury ${idx % 3 === 1 ? 'tall-card' : ''}`}
                    onClick={() => setSelectedProject(proj)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setSelectedProject(proj);
                      }
                    }}
                    aria-label={`View project details for ${proj.title}`}
                  >
                    <img src={projectImg} alt={`${brand} ${proj.title} - ${proj.category} in ${proj.location}`} loading="lazy" decoding="async" />
                    <div className="portfolio-caption-overlay">
                      <div className="caption-top">
                        <small className="project-meta">
                          {proj.category} · {proj.location}
                        </small>
                        <h3 className="project-title">{proj.title}</h3>
                      </div>
                      <div className="project-expand-badge">
                        <span>VIEW PROJECT</span>
                        <ArrowUpRight size={16} />
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quote Banner Section */}
      <section
        className="image-quote-section"
        style={{
          backgroundImage: `linear-gradient(rgba(21, 57, 29, 0.88), rgba(21, 57, 29, 0.92)), url(${images.restaurant})`,
        }}
      >
        <div className="container quote-container">
          <span className="eyebrow gold-label">LIGHT AS AN EXPERIENCE</span>
          <h2>
            We don't simply illuminate a room.<br />
            <em>We shape how it feels.</em>
          </h2>
          <Link to="/consultation" className="btn btn-gold">
            START YOUR PROJECT
          </Link>
        </div>
      </section>
    </main>
  );
}
