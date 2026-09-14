import { useState } from 'react';
import { Monitor, Smartphone, Sparkles } from 'lucide-react';

export default function AdminLivePreviewFrame({
  title = 'LIVE CUSTOMER PREVIEW',
  isDirty = false,
  children,
  badgeText = '',
}) {
  const [deviceMode, setDeviceMode] = useState('desktop'); // 'desktop' | 'mobile'

  const handleContainerClick = (e) => {
    // Intercept clicks on links and buttons inside preview to prevent accidental navigation
    const target = e.target.closest('a, button[type="submit"]');
    if (target && !target.classList.contains('preview-interactive')) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <div className="admin-live-preview-panel">
      {/* Preview Header / Device Switcher */}
      <div className="admin-preview-header">
        <div className="admin-preview-title-wrap">
          <span className="admin-preview-pulse-dot" />
          <span className="admin-preview-title">{title}</span>
          {isDirty && <span className="admin-preview-dirty-badge">Unsaved Changes</span>}
          {badgeText && <span className="admin-preview-status-pill">{badgeText}</span>}
        </div>

        <div className="admin-device-switcher" role="radiogroup" aria-label="Preview Device Controls">
          <button
            type="button"
            className={`admin-device-btn ${deviceMode === 'desktop' ? 'active' : ''}`}
            onClick={() => setDeviceMode('desktop')}
            aria-label="Desktop Preview"
            title="Desktop Full-Width View"
          >
            <Monitor size={14} />
            <span>Desktop</span>
          </button>
          <button
            type="button"
            className={`admin-device-btn ${deviceMode === 'mobile' ? 'active' : ''}`}
            onClick={() => setDeviceMode('mobile')}
            aria-label="Mobile Preview"
            title="Mobile Screen View (390px)"
          >
            <Smartphone size={14} />
            <span>Mobile</span>
          </button>
        </div>
      </div>

      {/* Preview Viewport Canvas */}
      <div
        className={`admin-preview-canvas ${deviceMode === 'mobile' ? 'device-mobile' : 'device-desktop'}`}
        onClickCapture={handleContainerClick}
      >
        <div className="admin-preview-content-wrapper">{children}</div>
      </div>
    </div>
  );
}
