export const siteConfig = {
  siteName: 'Veloura Lighting',
  siteUrl: 'https://lux-based-indusrty.vercel.app',
  defaultTitle: 'Veloura Lighting | Luxury Architectural Lighting in Dubai',
  defaultDescription: 'Veloura Lighting creates bespoke architectural lighting, luxury chandeliers, and premium illumination for luxury villas, destination hotels, restaurants, and commercial spaces in Dubai and the UAE.',
  defaultImage: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&h=630&q=90',
  twitterHandle: '@velouralighting',
  whatsAppNumber: '+971508924411', // Configurable WhatsApp phone number (cleaned format for wa.me)
  whatsappFormatted: '+971 50 892 4411',
  contact: {
    address: 'Alserkal Avenue, Building 42, Al Quoz 1, Dubai, United Arab Emirates',
    email: 'concierge@veloura-lighting.com',
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
    instagram: 'https://instagram.com/veloura.lighting',
    linkedin: 'https://linkedin.com/company/veloura-lighting',
    pinterest: 'https://pinterest.com/velouralighting',
    facebook: 'https://facebook.com/velouralighting'
  },
  catalogueUrl: '' // Configurable catalogue path (empty by default; set when real PDF URL is configured)
};

export const getWhatsAppLink = (message = '') => {
  const cleanNumber = siteConfig.whatsAppNumber.replace(/[^0-9]/g, '');
  const encodedMsg = encodeURIComponent(message || "Hello Veloura Lighting, I'm interested in your lighting solutions and would like to discuss my project.");
  return `https://wa.me/${cleanNumber}?text=${encodedMsg}`;
};

export const getProductWhatsAppMessage = (productName) => {
  return `Hello Veloura Lighting, I'm interested in ${productName}. Please share more details, pricing and availability for my project.`;
};

export const getCollectionWhatsAppMessage = (collectionTitle) => {
  return `Hello Veloura Lighting, I'm interested in your ${collectionTitle} collection and would like to discuss my project.`;
};

export const getProjectWhatsAppMessage = (projectTitle) => {
  return `Hello Veloura Lighting, I'm inspired by your ${projectTitle} project and would like to discuss a similar lighting concept for my space.`;
};

export const pageSeoData = {
  home: {
    title: 'Veloura Lighting | Luxury Architectural Lighting in Dubai',
    description: 'Veloura Lighting creates bespoke architectural lighting, luxury chandeliers and premium lighting solutions for villas, hotels, restaurants and commercial spaces in Dubai and the UAE.',
    path: '/'
  },
  collections: {
    title: 'Luxury Lighting Collections | Veloura Lighting Dubai',
    description: 'Explore Veloura Lighting\'s curated collection of luxury chandeliers, architectural pendants, ambient lighting and bespoke lighting solutions for exceptional spaces.',
    path: '/collections'
  },
  portfolio: {
    title: 'Luxury Lighting Projects in Dubai & UAE | Veloura',
    description: 'Explore Veloura Lighting projects across Dubai and the UAE, from luxury residences and hotels to restaurants and commercial interiors.',
    path: '/portfolio'
  },
  about: {
    title: 'About Veloura | Luxury Architectural Lighting Studio Dubai',
    description: 'Discover Veloura Lighting, a Dubai-based architectural lighting studio creating bespoke lighting experiences through design, craftsmanship and innovation.',
    path: '/about'
  },
  contact: {
    title: 'Contact Veloura Lighting | Dubai, UAE',
    description: 'Contact Veloura Lighting in Dubai for bespoke architectural lighting, luxury lighting design, project enquiries and professional consultation.',
    path: '/contact'
  },
  consultation: {
    title: 'Book a Lighting Consultation | Veloura Lighting Dubai',
    description: 'Book a private lighting consultation with Veloura Lighting for villas, hotels, restaurants and commercial architectural lighting projects.',
    path: '/consultation'
  }
};
