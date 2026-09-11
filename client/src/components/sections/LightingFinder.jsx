import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, ArrowRight, RotateCcw, MessageCircle } from 'lucide-react';
import { collections, products } from '../../data/site';
import { getWhatsAppLink } from '../../seo/seoConfig';
import { useSettings } from '../../context/SettingsContext';

const questions = [
  {
    id: 'space',
    title: '1. What are you lighting?',
    subtitle: 'Select the primary environment for your lighting project.',
    options: ['Villa', 'Apartment', 'Hotel', 'Restaurant', 'Office', 'Retail']
  },
  {
    id: 'style',
    title: '2. What style do you prefer?',
    subtitle: 'Choose the aesthetic direction of your interior architecture.',
    options: ['Modern', 'Contemporary', 'Classic', 'Minimal', 'Luxury']
  },
  {
    id: 'category',
    title: '3. What are you looking for?',
    subtitle: 'Identify the primary fixture or lighting scheme needed.',
    options: ['Chandelier', 'Pendant', 'Wall Lighting', 'Ambient Lighting', 'Complete Lighting Solution']
  },
  {
    id: 'stage',
    title: '4. Project stage:',
    subtitle: 'Where are you currently in the design & build process?',
    options: ['Planning', 'Under Construction', 'Renovation', 'Completed']
  }
];

export default function LightingFinder({ isOpen, onClose }) {
  const { settings } = useSettings();
  const brand = settings?.brandName || 'LUX BASED INDUSTRY';
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelectOption = (option) => {
    const q = questions[currentStep];
    const newAnswers = { ...answers, [q.id]: option };
    setAnswers(newAnswers);

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowResults(true);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setAnswers({});
    setShowResults(false);
  };

  // Reusable recommendation matcher
  const getRecommendations = () => {
    const categoryAnswer = (answers.category || '').toLowerCase();

    let matchedCollections = collections.filter((c) => {
      if (categoryAnswer.includes('chandelier') && c.slug.includes('chandelier')) return true;
      if (categoryAnswer.includes('pendant') && c.slug.includes('pendant')) return true;
      if (categoryAnswer.includes('ambient') && c.slug.includes('ambient')) return true;
      if (categoryAnswer.includes('wall') && c.slug.includes('wall')) return true;
      return false;
    });

    if (matchedCollections.length === 0) {
      matchedCollections = collections.slice(0, 3);
    }

    let matchedProducts = products.filter((p) => {
      return matchedCollections.some((mc) => mc.slug === p.collectionSlug);
    });

    if (matchedProducts.length === 0) {
      matchedProducts = products.slice(0, 2);
    }

    return { matchedCollections, matchedProducts };
  };

  const { matchedCollections, matchedProducts } = getRecommendations();

  const finderWhatsAppMessage = `Hello ${brand}, I completed your Lighting Finder wizard with these selections: Space: ${answers.space || 'Villa'}, Style: ${answers.style || 'Luxury'}, Looking for: ${answers.category || 'Chandelier'}, Stage: ${answers.stage || 'Planning'}. I would like to discuss recommendations.`;

  return (
    <AnimatePresence>
      <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
        <motion.div
          className="finder-modal-container"
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.96 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="modal-close" onClick={onClose} aria-label="Close Lighting Finder">
            <X size={20} />
          </button>

          {!showResults ? (
            <div className="finder-step-body">
              <div className="finder-header">
                <span className="eyebrow">
                  <Sparkles size={14} /> LIGHTING FINDER — STEP {currentStep + 1} OF 4
                </span>
                <h2>{questions[currentStep].title}</h2>
                <p>{questions[currentStep].subtitle}</p>
              </div>

              <div className="finder-options-grid">
                {questions[currentStep].options.map((opt) => (
                  <button
                    key={opt}
                    className={`finder-option-btn ${answers[questions[currentStep].id] === opt ? 'active' : ''}`}
                    onClick={() => handleSelectOption(opt)}
                  >
                    <span>{opt}</span>
                    <ArrowRight size={16} />
                  </button>
                ))}
              </div>

              <div className="finder-progress-bar">
                <div
                  className="finder-progress-fill"
                  style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="finder-results-body">
              <div className="finder-header">
                <span className="eyebrow">RECOMMENDED SOLUTIONS</span>
                <h2>Lighting Matched For Your Space</h2>
                <p>Based on your selections ({answers.space}, {answers.style}, {answers.category}), we recommend:</p>
              </div>

              <div className="finder-results-grid">
                {matchedCollections.map((col) => (
                  <div key={col.slug} className="finder-result-card">
                    <img src={col.image} alt={col.title} />
                    <div className="result-card-copy">
                      <small>{col.eyebrow}</small>
                      <h4>{col.title}</h4>
                      <p>{col.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="finder-results-actions">
                <a
                  href={getWhatsAppLink(finderWhatsAppMessage, settings?.whatsappNumberClean || settings?.phone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-whatsapp"
                >
                  <MessageCircle size={18} /> DISCUSS RECOMMENDATIONS ON WHATSAPP
                </a>

                <button className="btn btn-outline" onClick={handleReset}>
                  <RotateCcw size={16} /> START OVER
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
