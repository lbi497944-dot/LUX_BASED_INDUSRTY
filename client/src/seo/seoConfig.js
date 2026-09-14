export const siteConfig = {
  siteName: 'LUX BASED INDUSTRY',
  siteUrl: 'https://lux-based-indusrty.vercel.app',
  defaultTitle: 'LUX BASED INDUSTRY | Luxury Architectural Lighting in Dubai',
  defaultDescription: 'LUX BASED INDUSTRY creates bespoke architectural lighting, luxury chandeliers, and premium illumination for luxury villas, destination hotels, restaurants, and commercial spaces in Dubai and the UAE.',
  defaultImage: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&h=630&q=90',
  twitterHandle: '',
  whatsAppNumber: '+971508924411', // Default fallback WhatsApp phone number
  whatsappFormatted: '+971 50 892 4411',
  contact: {
    address: 'Alserkal Avenue, Building 42, Al Quoz 1, Dubai, United Arab Emirates',
    email: 'luxbasedindustries@gmail.com',
    phone: '+971 4 340 8899',
    hours: 'Monday – Saturday: 09:00 AM – 07:00 PM GST',
    city: 'Dubai',
    country: 'United Arab Emirates',
    geo: {
      latitude: '25.1412',
      longitude: '55.2272'
    }
  },
  socialLinks: {
    instagram: '',
    linkedin: '',
    pinterest: '',
    facebook: ''
  },
  catalogueUrl: '' // Configurable catalogue path
};

export const getWhatsAppLink = (message = '', overrideNumber = null, companyName = 'LUX BASED INDUSTRY') => {
  const rawNumber = overrideNumber || siteConfig.whatsAppNumber;
  const cleanNumber = (rawNumber || '').replace(/[^0-9]/g, '');
  const defaultMsg = `Hello ${companyName}, I'm interested in your lighting solutions and would like to discuss my project.`;
  const encodedMsg = encodeURIComponent(message || defaultMsg);
  return cleanNumber ? `https://wa.me/${cleanNumber}?text=${encodedMsg}` : '#';
};

export const getProductWhatsAppMessage = (productName, companyName = 'LUX BASED INDUSTRY') => {
  return `Hello ${companyName}, I'm interested in ${productName}. Please share more details, pricing and availability for my project.`;
};

export const getCollectionWhatsAppMessage = (collectionTitle, companyName = 'LUX BASED INDUSTRY') => {
  return `Hello ${companyName}, I'm interested in your ${collectionTitle} collection and would like to discuss my project.`;
};

export const getProjectWhatsAppMessage = (projectTitle, companyName = 'LUX BASED INDUSTRY') => {
  return `Hello ${companyName}, I'm inspired by your ${projectTitle} project and would like to discuss a similar lighting concept for my space.`;
};

export const getCatalogueWhatsAppMessage = (companyName = 'LUX BASED INDUSTRY') => {
  return `Hello ${companyName}, I would like to receive your latest lighting catalogue PDF. Please send it to me.`;
};

/**
 * Generates an attachment delivery URL for Cloudinary or direct PDF assets.
 * Cloudinary supports fl_attachment flag to deliver Content-Disposition: attachment,
 * prompting genuine browser download across cross-origin requests.
 */
export const getCatalogueDownloadUrl = (rawUrl, targetFilename = 'LUX_BASED_INDUSTRY_Catalogue_2026.pdf') => {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  const trimmed = rawUrl.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) return trimmed;

  if (trimmed.includes('res.cloudinary.com') && trimmed.includes('/upload/')) {
    if (trimmed.includes('/fl_attachment')) return trimmed;
    const cleanName = (targetFilename || 'LBI_Catalogue_2026.pdf').replace(/[^a-zA-Z0-9._-]/g, '_');
    return trimmed.replace('/upload/', `/upload/fl_attachment:${cleanName}/`);
  }

  return trimmed;
};

// Page SEO Metadata Dictionary for Canonical Routes
export const pageSeoData = {
  home: {
    title: 'LUX BASED INDUSTRY | Luxury Architectural Lighting in Dubai',
    description: 'LUX BASED INDUSTRY creates bespoke architectural lighting, luxury chandeliers and premium lighting solutions for villas, hotels, restaurants and commercial spaces in Dubai and the UAE.',
    path: '/'
  },
  collections: {
    title: 'Luxury Lighting Collections | LUX BASED INDUSTRY Dubai',
    description: 'Explore LUX BASED INDUSTRY\'s curated collection of luxury chandeliers, architectural pendants, ambient lighting and bespoke lighting solutions for exceptional spaces.',
    path: '/collections'
  },
  portfolio: {
    title: 'Luxury Lighting Projects in Dubai & UAE | LUX BASED INDUSTRY',
    description: 'Explore LUX BASED INDUSTRY projects across Dubai and the UAE, from luxury residences and hotels to restaurants and commercial interiors.',
    path: '/portfolio'
  },
  about: {
    title: 'About LUX BASED INDUSTRY | Architectural Lighting Studio Dubai',
    description: 'Discover LUX BASED INDUSTRY, a Dubai-based architectural lighting studio creating bespoke lighting experiences through design, craftsmanship and innovation.',
    path: '/about'
  },
  contact: {
    title: 'Contact LUX BASED INDUSTRY | Dubai, UAE',
    description: 'Contact LUX BASED INDUSTRY in Dubai for bespoke architectural lighting, luxury lighting design, project enquiries and professional consultation.',
    path: '/contact'
  },
  consultation: {
    title: 'Book a Lighting Consultation | LUX BASED INDUSTRY Dubai',
    description: 'Book a private lighting consultation with LUX BASED INDUSTRY for villas, hotels, restaurants and commercial architectural lighting projects.',
    path: '/consultation'
  },
  review: {
    title: 'Client Reviews & Testimonials | LUX BASED INDUSTRY Dubai',
    description: 'Read verified client reviews and share your architectural lighting project experience with LUX BASED INDUSTRY Dubai.',
    path: '/review'
  },
  // Canonical Collections
  'grand-chandeliers': {
    title: 'Grand Chandeliers | LUX BASED INDUSTRY Dubai',
    description: 'Bespoke grand chandeliers and monumental statement lighting handcrafted for high-ceiling luxury villas, ballrooms, and luxury hotel lobbies.',
    path: '/collections/grand-chandeliers'
  },
  'architectural-pendants': {
    title: 'Architectural Pendants | LUX BASED INDUSTRY Dubai',
    description: 'Sculptural pendant lighting engineered with precision architectural finishes for luxury dining rooms, kitchen islands, and commercial lounges.',
    path: '/collections/architectural-pendants'
  },
  'smart-ambient-systems': {
    title: 'Smart Ambient Lighting Systems | LUX BASED INDUSTRY Dubai',
    description: 'Architectural recessed, linear, and smart ambient lighting systems engineered for seamless integration into modern luxury interiors.',
    path: '/collections/smart-ambient-systems'
  },
  'wall-lighting': {
    title: 'Luxury Wall Sconces & Lighting | LUX BASED INDUSTRY Dubai',
    description: 'Refined architectural wall sconces, brass luminaires, and indirect accent lighting for hallways, suites, and premium living spaces.',
    path: '/collections/wall-lighting'
  },
  'floor-lighting': {
    title: 'Architectural Floor Lamps | LUX BASED INDUSTRY Dubai',
    description: 'Contemporary sculptural floor lamps and freestanding luminaires designed to create intimate luxury lighting zones.',
    path: '/collections/floor-lighting'
  },
  'custom-solutions': {
    title: 'Custom Lighting Solutions & Fabrication | LUX BASED INDUSTRY Dubai',
    description: 'Full-spectrum bespoke lighting design, custom engineering, and bespoke fabrication for architects, interior designers, and visionary clients.',
    path: '/collections/custom-solutions'
  },
  // Canonical Projects
  'private-residence-dubai': {
    title: 'Private Residence Dubai | Lighting Project | LUX BASED INDUSTRY',
    description: 'Complete architectural lighting design and bespoke chandelier installations for a contemporary luxury residence in Emirates Hills, Dubai.',
    path: '/portfolio/private-residence-dubai'
  },
  'the-grand-hotel-doha': {
    title: 'The Grand Hotel Doha | Lighting Project | LUX BASED INDUSTRY',
    description: 'Monumental lobby illumination, atrium crystal chandelier, and suite ambient lighting for a 5-star destination hotel.',
    path: '/portfolio/the-grand-hotel-doha'
  },
  'luxury-villa-abu-dhabi': {
    title: 'Luxury Villa Abu Dhabi | Lighting Project | LUX BASED INDUSTRY',
    description: 'Integrated indoor and outdoor architectural lighting scheme, accent sconces, and statement dining lighting for an exclusive waterfront villa.',
    path: '/portfolio/luxury-villa-abu-dhabi'
  },
  'fine-dining-restaurant-dubai': {
    title: 'Fine Dining Restaurant Dubai | Lighting Project | LUX BASED INDUSTRY',
    description: 'Intimate dining ambiance, warm brass accent pendants, and bespoke architectural cove illumination in Downtown Dubai.',
    path: '/portfolio/fine-dining-restaurant-dubai'
  },
  'royal-commercial-tower': {
    title: 'Royal Commercial Tower | Lighting Project | LUX BASED INDUSTRY',
    description: 'Modern corporate atrium illumination, suspended geometric luminaires, and energy-efficient architectural lighting systems.',
    path: '/portfolio/royal-commercial-tower'
  }
};

/**
 * Structured Data (Schema.org) Builders
 */

export const getOrganizationSchema = (settings = {}) => {
  const address = settings.address || siteConfig.contact.address;
  const email = settings.contact_email || siteConfig.contact.email;
  const phone = settings.contact_phone || siteConfig.contact.phone;

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${siteConfig.siteUrl}/#organization`,
    name: siteConfig.siteName,
    url: siteConfig.siteUrl,
    logo: siteConfig.defaultImage,
    description: siteConfig.defaultDescription,
    email: email,
    telephone: phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Alserkal Avenue, Building 42, Al Quoz 1',
      addressLocality: 'Dubai',
      addressCountry: 'AE'
    }
  };
};

export const getWebSiteSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteConfig.siteUrl}/#website`,
    url: siteConfig.siteUrl,
    name: siteConfig.siteName,
    description: siteConfig.defaultDescription,
    publisher: {
      '@id': `${siteConfig.siteUrl}/#organization`
    }
  };
};

export const getLocalBusinessSchema = (settings = {}) => {
  const address = settings.address || siteConfig.contact.address;
  const email = settings.contact_email || siteConfig.contact.email;
  const phone = settings.contact_phone || siteConfig.contact.phone;

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${siteConfig.siteUrl}/#localbusiness`,
    name: siteConfig.siteName,
    image: siteConfig.defaultImage,
    telephone: phone,
    email: email,
    url: siteConfig.siteUrl,
    priceRange: '$$$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Alserkal Avenue, Building 42, Al Quoz 1',
      addressLocality: 'Dubai',
      addressCountry: 'AE'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '25.1412',
      longitude: '55.2272'
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday'
        ],
        opens: '09:00',
        closes: '19:00'
      }
    ]
  };
};

export const getBreadcrumbSchema = (crumbs = []) => {
  if (!crumbs || crumbs.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.label,
      item: crumb.path
        ? (crumb.path.startsWith('http') ? crumb.path : `${siteConfig.siteUrl}${crumb.path}`)
        : undefined
    }))
  };
};

export const getCollectionPageSchema = (collection) => {
  if (!collection) return null;
  const name = collection.title || collection.name || 'Luxury Lighting Collection';
  const description = collection.description || `Explore ${name} by ${siteConfig.siteName}.`;
  const url = collection.slug ? `${siteConfig.siteUrl}/collections/${collection.slug}` : `${siteConfig.siteUrl}/collections`;
  const image = collection.heroImage || collection.image || siteConfig.defaultImage;

  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${name} | ${siteConfig.siteName}`,
    description: description,
    url: url,
    image: image,
    isPartOf: {
      '@id': `${siteConfig.siteUrl}/#website`
    },
    about: {
      '@type': 'Thing',
      name: name
    }
  };
};

export const getCreativeWorkSchema = (project) => {
  if (!project) return null;
  const name = project.title || project.name || 'Luxury Lighting Project';
  const description = project.description || project.summary || `Architectural lighting project by ${siteConfig.siteName}.`;
  const url = project.slug ? `${siteConfig.siteUrl}/portfolio/${project.slug}` : `${siteConfig.siteUrl}/portfolio`;
  const image = project.heroImage || project.cover_image || project.image || siteConfig.defaultImage;

  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: `${name} | ${siteConfig.siteName}`,
    description: description,
    url: url,
    image: image,
    creator: {
      '@id': `${siteConfig.siteUrl}/#organization`
    },
    locationCreated: {
      '@type': 'Place',
      name: project.location || 'Dubai, UAE'
    }
  };
};
