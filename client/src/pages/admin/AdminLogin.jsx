import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, ArrowRight, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import SEO from '../../components/common/SEO';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/admin');
    } catch (err) {
      setError(err?.message || 'Invalid credentials or connection error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <SEO title="Admin Login | Veloura Lighting" canonical="/admin/login" />

      <div className="admin-login-card">
        <div className="admin-login-brand">
          <Link to="/" className="logo-main">VELOURA</Link>
          <small className="logo-sub">STUDIO CMS PORTAL</small>
        </div>

        <div className="admin-login-header">
          <h2>Authorized Access</h2>
          <p>Sign in to manage architectural lighting catalogues, leads, and studio configurations.</p>
        </div>

        {error && (
          <div className="admin-login-alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="admin-input-group">
            <label>ADMINISTRATOR EMAIL</label>
            <div className="admin-input-wrap">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                placeholder="admin@veloura-lighting.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="admin-input-group">
            <label>PASSWORD</label>
            <div className="admin-input-wrap">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          <button type="submit" className="btn btn-gold btn-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={18} className="spin-icon" /> AUTHENTICATING...
              </>
            ) : (
              <>
                SIGN IN TO DASHBOARD <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="admin-login-footer">
          <ShieldCheck size={16} className="gold-icon" />
          <span>Encrypted Studio Administrative Access</span>
        </div>
      </div>
    </div>
  );
}
