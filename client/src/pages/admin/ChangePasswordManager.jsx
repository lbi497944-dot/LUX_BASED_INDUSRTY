import { useState } from 'react';
import { KeyRound, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';
import { authService } from '../../services/authService';
import Toast from '../../components/common/Toast';
import SEO from '../../components/common/SEO';

const EMPTY_FORM = {
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: '',
};

const PASSWORD_REGEX = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;

export default function ChangePasswordManager() {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const validate = () => {
    const { currentPassword, newPassword, confirmNewPassword } = formData;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return 'All three fields are required.';
    }
    if (newPassword.length < 8) {
      return 'New password must be at least 8 characters long.';
    }
    if (!PASSWORD_REGEX.test(newPassword)) {
      return 'New password must contain at least one uppercase letter, one lowercase letter, and one number.';
    }
    if (newPassword !== confirmNewPassword) {
      return 'New password and confirm password do not match.';
    }
    if (newPassword === currentPassword) {
      return 'New password must be different from your current password.';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      await authService.changePassword(formData.currentPassword, formData.newPassword);
      setFormData(EMPTY_FORM);
      setToast({
        type: 'success',
        title: 'Password Updated',
        message: 'Password updated successfully.',
      });
    } catch (err) {
      setError(err?.message || 'Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <SEO title="Account Security | LUX CMS" />
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="admin-page-header">
        <div>
          <span className="eyebrow gold-label">ADMINISTRATOR ACCOUNT</span>
          <h1>Account Security</h1>
        </div>
      </div>

      <div className="admin-card-panel">
        <div className="panel-head">
          <h3>Change Password</h3>
        </div>

        {error && (
          <div className="admin-login-alert" style={{ marginBottom: '20px' }}>
            <ShieldCheck size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="admin-form-grid">
            {/* Current Password */}
            <div className="admin-form-group">
              <label htmlFor="currentPassword" style={{ display: 'block', marginBottom: '8px' }}>
                CURRENT PASSWORD
              </label>
              <div className="admin-input-wrap">
                <KeyRound size={16} className="input-icon" />
                <input
                  id="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={formData.currentPassword}
                  onChange={handleChange('currentPassword')}
                  autoComplete="current-password"
                  placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowCurrentPassword((prev) => !prev);
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                  aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}
                  aria-pressed={showCurrentPassword}
                  title={showCurrentPassword ? 'Hide current password' : 'Show current password'}
                >
                  {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="admin-form-group">
              <label htmlFor="newPassword" style={{ display: 'block', marginBottom: '8px' }}>
                NEW PASSWORD
              </label>
              <div className="admin-input-wrap">
                <KeyRound size={16} className="input-icon" />
                <input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={handleChange('newPassword')}
                  autoComplete="new-password"
                  placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowNewPassword((prev) => !prev);
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                  aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                  aria-pressed={showNewPassword}
                  title={showNewPassword ? 'Hide new password' : 'Show new password'}
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <span style={{
                fontSize: '11px',
                color: 'rgba(243,243,235,0.5)',
                fontWeight: 400,
                letterSpacing: 0,
                marginTop: '4px',
                display: 'block',
              }}>
                Password must be at least 8 characters and include an uppercase letter, lowercase letter, and number.
              </span>
            </div>

            {/* Confirm New Password */}
            <div className="admin-form-group">
              <label htmlFor="confirmNewPassword" style={{ display: 'block', marginBottom: '8px' }}>
                CONFIRM NEW PASSWORD
              </label>
              <div className="admin-input-wrap">
                <KeyRound size={16} className="input-icon" />
                <input
                  id="confirmNewPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmNewPassword}
                  onChange={handleChange('confirmNewPassword')}
                  autoComplete="new-password"
                  placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowConfirmPassword((prev) => !prev);
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  aria-pressed={showConfirmPassword}
                  title={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '24px' }}>
            <button type="submit" className="btn btn-gold" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={16} className="spin-icon" /> UPDATING PASSWORD...
                </>
              ) : (
                <>
                  <ShieldCheck size={16} /> UPDATE PASSWORD
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <div style={{
        marginTop: '12px',
        fontSize: '12px',
        color: 'rgba(243,243,235,0.45)',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
      }}>
        <ShieldCheck size={13} style={{ flexShrink: 0 }} />
        <span>
          For maximum security, you will need to use your new password on your next sign-in.
          Your current session remains active.
        </span>
      </div>
    </div>
  );
}
