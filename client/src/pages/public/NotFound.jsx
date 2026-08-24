import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import SEO from '../../components/common/SEO';

export default function NotFound() {
  return (
    <main className="not-found-page">
      <SEO
        title="Page Not Found | Veloura Lighting"
        description="The requested page could not be found on Veloura Lighting."
        canonical="/404"
      />

      <div className="container not-found-container">
        <span className="eyebrow gold-label">404 ERROR</span>
        <h1>Page Not Found</h1>
        <p>The architectural page or collection you requested could not be located.</p>
        <div className="not-found-links">
          <Link className="btn btn-gold" to="/">
            <ArrowLeft size={16} /> RETURN HOME
          </Link>
          <Link className="btn btn-outline" to="/collections">
            EXPLORE COLLECTIONS
          </Link>
        </div>
      </div>
    </main>
  );
}
