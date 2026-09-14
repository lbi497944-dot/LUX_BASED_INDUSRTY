import { useEffect } from 'react';
import { siteConfig } from '../../seo/seoConfig';
import { useSettings } from '../../context/SettingsContext';

export default function SEO({
  title,
  description,
  canonical,
  image,
  type = 'website',
  robots = 'index, follow',
  schemaData = null,
}) {
  let settings = null;
  try {
    const context = useSettings();
    settings = context?.settings;
  } catch {
    // Fallback if rendered outside SettingsProvider
  }

  const siteName = settings?.brandName || siteConfig.siteName;
  const metaTitle = title ? `${title}` : (settings?.defaultSeo?.title || siteConfig.defaultTitle);
  const metaDesc = description || (settings?.defaultSeo?.description || siteConfig.defaultDescription);

  // Canonical URL calculation with robust path normalization
  let canonicalUrl = siteConfig.siteUrl;
  if (canonical) {
    if (canonical.startsWith('http://') || canonical.startsWith('https://')) {
      canonicalUrl = canonical;
    } else {
      const normalizedPath = canonical.startsWith('/') ? canonical : `/${canonical}`;
      canonicalUrl = `${siteConfig.siteUrl}${normalizedPath}`;
    }
  } else if (typeof window !== 'undefined' && window.location) {
    canonicalUrl = `${siteConfig.siteUrl}${window.location.pathname}`;
  }

  // Ensure trailing slash only for root homepage
  if (canonicalUrl === `${siteConfig.siteUrl}/`) {
    canonicalUrl = `${siteConfig.siteUrl}/`;
  } else if (canonicalUrl.endsWith('/') && canonicalUrl !== `${siteConfig.siteUrl}/`) {
    canonicalUrl = canonicalUrl.slice(0, -1);
  }

  const ogImage = image || (settings?.defaultSeo?.ogImage || siteConfig.defaultImage);

  useEffect(() => {
    // 1. Update Title
    document.title = metaTitle;

    // Helper to update or create meta tags
    const setMetaTag = (nameAttr, nameVal, content) => {
      if (!content) return;
      let el = document.querySelector(`meta[${nameAttr}="${nameVal}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(nameAttr, nameVal);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // Helper to update canonical link
    const setCanonical = (href) => {
      let el = document.querySelector('link[rel="canonical"]');
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', 'canonical');
        document.head.appendChild(el);
      }
      el.setAttribute('href', href);
    };

    // 2. Standard Meta Tags & Indexing Control
    setMetaTag('name', 'description', metaDesc);
    setMetaTag('name', 'robots', robots);
    setCanonical(canonicalUrl);

    // 3. Open Graph Meta Tags
    setMetaTag('property', 'og:site_name', siteName);
    setMetaTag('property', 'og:type', type);
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:title', metaTitle);
    setMetaTag('property', 'og:description', metaDesc);
    setMetaTag('property', 'og:image', ogImage);
    setMetaTag('property', 'og:image:width', '1200');
    setMetaTag('property', 'og:image:height', '630');
    setMetaTag('property', 'og:image:alt', `${siteName} Luxury Architectural Lighting`);

    // 4. Twitter Card Meta Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', metaTitle);
    setMetaTag('name', 'twitter:description', metaDesc);
    setMetaTag('name', 'twitter:image', ogImage);

    // 5. JSON-LD Schema Data Injection
    let scriptEl = document.getElementById('jsonld-schema');
    if (schemaData) {
      if (!scriptEl) {
        scriptEl = document.createElement('script');
        scriptEl.id = 'jsonld-schema';
        scriptEl.type = 'application/ld+json';
        document.head.appendChild(scriptEl);
      }

      // If schemaData is an array, format as structured @graph
      if (Array.isArray(schemaData)) {
        const graphObj = {
          '@context': 'https://schema.org',
          '@graph': schemaData.map((item) => {
            if (item && typeof item === 'object') {
              const copy = { ...item };
              delete copy['@context'];
              return copy;
            }
            return item;
          }),
        };
        scriptEl.textContent = JSON.stringify(graphObj);
      } else {
        scriptEl.textContent = JSON.stringify(schemaData);
      }
    } else if (scriptEl) {
      scriptEl.remove();
    }
  }, [metaTitle, metaDesc, canonicalUrl, ogImage, type, robots, schemaData, siteName]);

  return null;
}
