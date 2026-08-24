import { useState } from 'react';
import { Calendar, CheckCircle2, Upload, ArrowUpRight, Loader2, ShieldCheck, MessageCircle } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { consultationService } from '../../services/consultationService';
import { images } from '../../data/site';
import PageHero from '../../components/sections/PageHero';
import Toast from '../../components/common/Toast';
import SEO from '../../components/common/SEO';
import { pageSeoData, getWhatsAppLink } from '../../seo/seoConfig';

export default function Consultation() {
  const { settings } = useSettings();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    projectType: '',
    projectLocation: '',
    projectStage: '',
    estimatedBudget: '',
    lightingRequirements: '',
    message: ''
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setFileName(e.target.files[0].name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });
      if (selectedFile) {
        data.append('attachment', selectedFile);
      }

      const res = await consultationService.submitConsultation(data);
      setToast({
        type: 'success',
        title: 'Consultation Requested',
        message: res.message || 'Your private consultation request has been submitted. Our Senior Lighting Architect will contact you shortly.'
      });
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        projectType: '',
        projectLocation: '',
        projectStage: '',
        estimatedBudget: '',
        lightingRequirements: '',
        message: ''
      });
      setSelectedFile(null);
      setFileName('');
    } catch (err) {
      setToast({
        type: 'error',
        title: 'Submission Error',
        message: err?.message || 'Unable to submit appointment request. Please reach out via WhatsApp.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="consultation-page">
      <SEO
        title={pageSeoData.consultation.title}
        description={pageSeoData.consultation.description}
        canonical="/consultation"
      />

      <Toast toast={toast} onClose={() => setToast(null)} />

      <PageHero
        eyebrow="PRIVATE CONSULTATION"
        title="Bring Your Vision to Light"
        description="Share your architectural blueprints or interior aspirations with our design team. We will guide you through bespoke fixture design and scene planning."
        image={images.hero}
      />

      <section className="section">
        <div className="container consultation-grid-container">
          {/* Left Column: Expectations & Process */}
          <div className="consultation-intro-panel">
            <span className="eyebrow gold-label">WHAT HAPPENS NEXT</span>
            <h2>
              A more thoughtful<br />
              <em>way to begin.</em>
            </h2>
            <p className="consultation-body">
              Our first consultation is a focused dialogue to understand your architectural scale, natural light orientation, aesthetic intent, and timeline requirements.
            </p>

            <ul className="consultation-check-list">
              <li>
                <CheckCircle2 size={18} className="gold-icon" />
                <span>Deep architectural & lighting discovery session</span>
              </li>
              <li>
                <CheckCircle2 size={18} className="gold-icon" />
                <span>Custom fixture recommendations & drop length calculations</span>
              </li>
              <li>
                <CheckCircle2 size={18} className="gold-icon" />
                <span>Material samples, patinas & lens finish guidance</span>
              </li>
              <li>
                <CheckCircle2 size={18} className="gold-icon" />
                <span>Integration advice for Lutron, KNX, or DALI-2 automation</span>
              </li>
            </ul>

            <div className="consultation-guarantee-box">
              <ShieldCheck size={22} className="gold-icon" />
              <div>
                <h4>Confidential & NDA Protected</h4>
                <p>We respect client privacy for all private estates, royal residences, and commercial developments.</p>
              </div>
            </div>

            <div className="whatsapp-alt-box" style={{ marginTop: '24px' }}>
              <p className="whatsapp-alt-text">Need immediate guidance?</p>
              <a
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp btn-full"
              >
                <MessageCircle size={18} /> CONSULT VIA WHATSAPP
              </a>
            </div>
          </div>

          {/* Right Column: Multi-field Consultation Form */}
          <div className="consultation-form-panel">
            <form className="form-luxury consultation-form" onSubmit={handleSubmit}>
              <div className="form-header">
                <div className="form-title-row">
                  <Calendar size={22} className="gold-icon" />
                  <div>
                    <small>PRIVATE APPOINTMENT</small>
                    <h3>Request Consultation</h3>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <label>
                  FULL NAME *
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Full Name"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </label>
                <label>
                  EMAIL ADDRESS *
                  <input
                    type="email"
                    name="email"
                    placeholder="you@domain.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </label>
              </div>

              <div className="form-row">
                <label>
                  PHONE / WHATSAPP *
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+971 50 123 4567"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </label>
                <label>
                  PROJECT LOCATION *
                  <input
                    type="text"
                    name="projectLocation"
                    placeholder="City, Country"
                    value={formData.projectLocation}
                    onChange={handleChange}
                    required
                  />
                </label>
              </div>

              <div className="form-row">
                <label>
                  PROJECT TYPE *
                  <select
                    name="projectType"
                    value={formData.projectType}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select project type</option>
                    <option value="Residential Villa / Penthouse">Residential Villa / Penthouse</option>
                    <option value="Hospitality / Resort">Hospitality / Resort</option>
                    <option value="Restaurant / Lounge">Restaurant / Lounge</option>
                    <option value="Retail / Flagship Store">Retail / Flagship Store</option>
                    <option value="Commercial Tower / Office">Commercial Tower / Office</option>
                  </select>
                </label>
                <label>
                  PROJECT STAGE
                  <select
                    name="projectStage"
                    value={formData.projectStage}
                    onChange={handleChange}
                  >
                    <option value="">Select project stage</option>
                    <option value="Concept / Initial Sketch">Concept / Initial Sketch</option>
                    <option value="Schematic Design">Schematic Design</option>
                    <option value="Under Construction">Under Construction</option>
                    <option value="Renovation / Retrofit">Renovation / Retrofit</option>
                  </select>
                </label>
              </div>

              <div className="form-row">
                <label>
                  ESTIMATED BUDGET
                  <select
                    name="estimatedBudget"
                    value={formData.estimatedBudget}
                    onChange={handleChange}
                  >
                    <option value="">Select budget range</option>
                    <option value="$25,000 - $50,000">$25,000 – $50,000</option>
                    <option value="$50,000 - $100,000">$50,000 – $100,000</option>
                    <option value="$100,000 - $250,000">$100,000 – $250,000</option>
                    <option value="$250,000+">$250,000+</option>
                  </select>
                </label>
                <label>
                  LIGHTING REQUIREMENTS
                  <select
                    name="lightingRequirements"
                    value={formData.lightingRequirements}
                    onChange={handleChange}
                  >
                    <option value="">Select primary need</option>
                    <option value="Statement Chandeliers & Pendants">Statement Chandeliers & Pendants</option>
                    <option value="Whole-Home Architectural Ambient">Whole-Home Architectural Ambient</option>
                    <option value="Custom One-of-One Luminaires">Custom One-of-One Luminaires</option>
                    <option value="Full Lighting Scheme & Specification">Full Lighting Scheme & Specification</option>
                  </select>
                </label>
              </div>

              <label>
                PROJECT DETAILS & BRIEF
                <textarea
                  rows="4"
                  name="message"
                  placeholder="Share details regarding room ceiling heights, finishes, architectural style, or target timeline..."
                  value={formData.message}
                  onChange={handleChange}
                ></textarea>
              </label>

              {/* Upload Reference Images / Floor Plan */}
              <div className="file-upload-box">
                <label className="file-upload-label">
                  <Upload size={18} className="gold-icon" />
                  <span>
                    {fileName ? `Attached: ${fileName}` : 'Upload Reference Images / Floor Plan (PDF, JPG, PNG)'}
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="file-input-hidden"
                  />
                </label>
              </div>

              <button
                type="submit"
                className="btn btn-gold btn-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="spin-icon" /> SUBMITTING REQUEST...
                  </>
                ) : (
                  <>
                    REQUEST PRIVATE CONSULTATION <ArrowUpRight size={18} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
