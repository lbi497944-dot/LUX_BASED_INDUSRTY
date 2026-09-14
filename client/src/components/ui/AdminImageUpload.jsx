import { useState, useRef } from 'react';
import { Upload, Link2, X, Loader2, AlertCircle } from 'lucide-react';
import { uploadService } from '../../services/uploadService';

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
const DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export default function AdminImageUpload({
  label,
  value = '',
  publicId = '',
  onChange,
  required = false,
  allowUrlMode = true,
  helpText = 'JPG, PNG, WEBP · Max 10MB',
  maxSizeBytes = DEFAULT_MAX_SIZE,
  disabled = false,
  className = '',
}) {
  const [mode, setMode] = useState('upload'); // 'upload' | 'url'
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    if (!file) return 'No file selected.';
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return 'Unsupported file format. Only JPG, PNG, and WEBP images are allowed.';
    }
    if (file.size > maxSizeBytes) {
      const mbLimit = Math.round(maxSizeBytes / (1024 * 1024));
      return `File size exceeds the ${mbLimit}MB limit.`;
    }
    return null;
  };

  const uploadFile = async (file) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const res = await uploadService.uploadFile(file);
      if (res?.data?.url) {
        onChange?.({
          url: res.data.url,
          publicId: res.data.publicId || '',
        });
      } else {
        throw new Error('Upload succeeded but no image URL was returned.');
      }
    } catch (err) {
      setError(err?.message || 'Failed to upload image. Please check connection and try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !uploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled || uploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  const handleChooseFileClick = () => {
    if (disabled || uploading) return;
    fileInputRef.current?.click();
  };

  const handleClear = () => {
    setError(null);
    onChange?.({ url: '', publicId: '' });
  };

  const handleUrlChange = (e) => {
    setError(null);
    onChange?.({ url: e.target.value, publicId: '' });
  };

  return (
    <div className={`admin-image-upload admin-image-upload-wrapper ${className}`}>
      {/* Header bar: Label + Mode Switcher */}
      <div className="admin-upload-header">
        {label && (
          <span className="admin-upload-label-text">
            {label}
            {required && <span className="admin-required-asterisk"> *</span>}
          </span>
        )}

        {allowUrlMode && (
          <div className="admin-upload-tabs" role="tablist" aria-label="Upload mode">
            <button
              type="button"
              className={`admin-upload-tab ${mode === 'upload' ? 'active' : ''}`}
              onClick={() => {
                setMode('upload');
                setError(null);
              }}
              disabled={disabled || uploading}
              role="tab"
              aria-selected={mode === 'upload'}
            >
              <Upload size={13} />
              <span>File Upload</span>
            </button>
            <button
              type="button"
              className={`admin-upload-tab ${mode === 'url' ? 'active' : ''}`}
              onClick={() => {
                setMode('url');
                setError(null);
              }}
              disabled={disabled || uploading}
              role="tab"
              aria-selected={mode === 'url'}
            >
              <Link2 size={13} />
              <span>Image URL</span>
            </button>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_EXTENSIONS.join(',')}
        onChange={handleFileChange}
        disabled={disabled || uploading}
        className="admin-file-hidden-input"
        tabIndex={-1}
        aria-hidden="true"
      />

      {/* Hidden input for HTML5 required form validation */}
      {required && (
        <input
          type="text"
          required
          value={value || ''}
          onChange={() => {}}
          className="admin-required-validator"
          tabIndex={-1}
          aria-hidden="true"
        />
      )}

      {/* Main Upload / Input Area */}
      {mode === 'upload' ? (
        <div
          className={`admin-upload-dropzone admin-file-dropzone ${isDragging ? 'is-dragging' : ''} ${uploading ? 'is-uploading' : ''} ${disabled ? 'is-disabled' : ''}`}
          onDragOver={handleDragOver}
          onDragEnter={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleChooseFileClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleChooseFileClick();
            }
          }}
          aria-label={label ? `Upload image for ${label}` : 'Upload image file'}
        >
          {uploading ? (
            <div className="admin-dropzone-loading">
              <Loader2 size={24} className="spin-icon" />
              <span>Uploading image to Cloudinary...</span>
            </div>
          ) : (
            <div className="admin-dropzone-prompt">
              <div className="admin-dropzone-icon-wrap">
                <Upload size={22} />
              </div>
              <div className="admin-dropzone-text">
                <strong>Click to choose image or drag &amp; drop here</strong>
                <small>{helpText}</small>
              </div>
              <button
                type="button"
                className="btn btn-gold btn-xs admin-dropzone-browse-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleChooseFileClick();
                }}
                disabled={disabled}
              >
                Browse File
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="admin-url-input-wrap">
          <input
            type="url"
            value={value || ''}
            onChange={handleUrlChange}
            placeholder="https://images.unsplash.com/... or secure image URL"
            disabled={disabled}
            className="admin-text-input"
          />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="admin-upload-error" role="alert">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}

      {/* Preview Card */}
      {value && (
        <div className="admin-upload-preview-card">
          <div className="admin-preview-thumb-wrap">
            <img
              src={value}
              alt="Uploaded Preview"
              className="admin-preview-img"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <div className="admin-preview-info">
            <p className="admin-preview-url" title={value}>
              {value}
            </p>
            <span className={`admin-preview-badge ${publicId ? 'is-cloudinary' : 'is-external'}`}>
              {publicId ? '✓ Cloudinary Hosted' : 'External Web Image'}
            </span>
          </div>
          <div className="admin-preview-actions">
            <button
              type="button"
              className="btn btn-outline btn-xs"
              onClick={handleChooseFileClick}
              disabled={disabled || uploading}
              title="Replace with a new file"
            >
              <Upload size={12} /> Replace
            </button>
            <button
              type="button"
              className="btn btn-outline btn-xs btn-danger-subtle"
              onClick={handleClear}
              disabled={disabled || uploading}
              title="Remove image"
            >
              <X size={12} /> Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
