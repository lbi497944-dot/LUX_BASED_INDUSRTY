import { useEffect } from 'react';
import { siteConfig } from '../../seo/seoConfig';
import { useSettings } from '../../context/SettingsContext';

export default function SEO({
  title,
  description,
  canonical,
  image,
  type = 'website',
  schemaData = null
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
  const canonicalUrl = canonical
    ? `${siteConfig.siteUrl}${canonical}`
    : `${siteConfig.siteUrl}${window.location.pathname}`;
  const ogImage = image || (settings?.defaultSeo?.ogImage || siteConfig.defaultImage);

  useEffect(() => {
    // 1. Update Title
    document.title = metaTitle;

    // Helper to update or create meta tags
    const setMetaTag = (nameAttr, nameVal, content) => {
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

    // 2. Standard Meta Tags
    setMetaTag('name', 'description', metaDesc);
    setCanonical(canonicalUrl);

    // 3. Open Graph Meta Tags
    setMetaTag('property', 'og:title', metaTitle);
    setMetaTag('property', 'og:description', metaDesc);
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:type', type);
    setMetaTag('property', 'og:image', ogImage);
    setMetaTag('property', 'og:site_name', siteName);

    // 4. Twitter Card Meta Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', metaTitle);
    setMetaTag('name', 'twitter:description', metaDesc);
    setMetaTag('name', 'twitter:image', ogImage);

    // 5. JSON-LD Schema Data
    let scriptEl = document.getElementById('jsonld-schema');
    if (schemaData) {
      if (!scriptEl) {
        scriptEl = document.createElement('script');
        scriptEl.id = 'jsonld-schema';
        scriptEl.type = 'application/ld+json';
        document.head.appendChild(scriptEl);
      }
      scriptEl.textContent = JSON.stringify(schemaData);
    } else if (scriptEl) {
      scriptEl.remove();
    }
  }, [metaTitle, metaDesc, canonicalUrl, ogImage, type, schemaData, siteName]);

  return null;
}
