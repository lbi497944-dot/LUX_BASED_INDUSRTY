export const images = {
  hero: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2200&q=90',
  chandelier: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=1400&q=85',
  pendant: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1400&q=85',
  ambient: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=85',
  wall: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=1400&q=85',
  floor: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1400&q=85',
  custom: 'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1400&q=85',
  story: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1600&q=85',
  villa: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=85',
  hotel: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1400&q=85',
  restaurant: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=85',
  living: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85',
  commercial: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1400&q=85',
  detailHero: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1600&q=85'
};

export const collections = [
  {
    slug: 'grand-chandeliers',
    title: 'Grand Chandeliers',
    eyebrow: '01 / STATEMENT ELEGANCE',
    tagline: 'Timeless elegance in every crystal.',
    description: 'Sculptural centrepieces designed to command the room without overwhelming it. Crafted with optical-grade crystal and hand-finished brushed brass.',
    image: images.chandelier,
    features: ['Hand-blown Czech crystal elements', 'Custom drop lengths available', 'Precision 2700K warm LED illumination', 'Integrated DALI / 0-10V dimming'],
    materials: 'Solid Brushed Brass, Hand-Cut Lead-Free Crystal, Anodized Aluminum',
    applications: 'Grand foyers, double-height living rooms, formal dining halls, luxury hotel lobbies'
  },
  {
    slug: 'architectural-pendants',
    title: 'Architectural Pendants',
    eyebrow: '02 / MODERN GEOMETRY',
    tagline: 'Sculptural forms. Refined spaces.',
    description: 'Precise linear and geometric suspension lights engineered for contemporary architectural spaces, dining islands, and executive suites.',
    image: images.pendant,
    features: ['Direct/indirect glare-controlled optics', 'Ultra-slim micro canopy', 'High CRI 97+ color rendering', 'Bespoke length configurations up to 4 meters'],
    materials: 'Extruded Aluminum, Frosted Quartz Diffusers, Champagne Anodized Steel',
    applications: 'Dining tables, kitchen islands, conference suites, reception desks'
  },
  {
    slug: 'smart-ambient-systems',
    title: 'Smart Ambient Systems',
    eyebrow: '03 / INTELLIGENT LIVING',
    tagline: 'Intelligent lighting for modern living.',
    description: 'Concealed, layered architectural lighting systems that adapt dynamically to circadian rhythms, interior scenes, and architectural contours.',
    image: images.ambient,
    features: ['Seamless cove and plaster-in profiles', 'Tunable white spectrum (2200K - 5000K)', 'Native Lutron, Control4 & KNX integration', 'Zero flicker digital driver technology'],
    materials: 'Architectural Plaster-In Channels, High-Density LED Matrix, PMMA Diffusers',
    applications: 'Whole-home scene control, luxury corridors, wellness rooms, art galleries'
  },
  {
    slug: 'wall-lighting',
    title: 'Wall Lighting',
    eyebrow: '04 / QUIET DETAIL',
    tagline: 'Architectural sconces that accentuate texture and form.',
    description: 'Low-profile architectural sconces designed to wash vertical surfaces with warm, glare-free light, creating depth and subtle drama.',
    image: images.wall,
    features: ['Dual up/down indirect optics', 'Hand-finished metallic patinas', 'IP44 splash-rated options available', 'Magnetic mounting plates'],
    materials: 'Hammered Bronze, Honed Travertine, Frosted Glass, Satin Brass',
    applications: 'Hallways, feature stone walls, bedroom headboards, powder rooms'
  },
  {
    slug: 'floor-lighting',
    title: 'Floor Lighting',
    eyebrow: '05 / SCULPTURAL STANDARDS',
    tagline: 'Freestanding ambient light sculptures.',
    description: 'Freestanding architectural luminaires that double as modern art pieces during the day and cast ambient pools of light by night.',
    image: images.floor,
    features: ['Weighted solid marble or brass base', 'Touch capacitive stepping dimmer', '360-degree rotational light head', 'Custom textile cord wraps'],
    materials: 'Nero Marquina Marble, Solid Brass, Hand-Spun Copper, Opal Glass',
    applications: 'Reading nooks, salon corners, lounge suites, gallery rooms'
  },
  {
    slug: 'custom-solutions',
    title: 'Custom Solutions',
    eyebrow: '06 / MADE FOR YOU',
    tagline: 'Bespoke one-of-one lighting concepts.',
    description: 'Fully bespoke lighting fixtures engineered and crafted specifically around your architect’s vision, ceiling scale, and interior design concept.',
    image: images.custom,
    features: ['Full 3D CAD modeling & optical simulation', 'Physical mockups & finish samples', 'Dedicated lighting engineering team', 'Global white-glove installation support'],
    materials: 'Any custom metals, hand-blown glass, stone, or specialized alloys',
    applications: 'Bespoke super-yachts, private palaces, flagship luxury retail, penthouses'
  }
];

export const products = [
  {
    id: 'aurelia',
    name: 'The Aurelia',
    category: 'Grand Chandelier',
    collectionSlug: 'grand-chandeliers',
    image: images.chandelier,
    description: 'A cascading crystal composition with a contemporary silhouette, engineered to create mesmerizing ambient light play across grand interiors.',
    specs: 'Diameter: 1400mm | Drop: 2200mm | Weight: 48kg | 2700K Warm White | 120W LED'
  },
  {
    id: 'orion',
    name: 'The Orion',
    category: 'Pendant Light',
    collectionSlug: 'architectural-pendants',
    image: images.pendant,
    description: 'Geometric floating pendants featuring champagne-anodized aluminum and micro-prismatic optics for glare-free dining illumination.',
    specs: 'Length: 1800mm | Height: 320mm | Suspension: Up to 3000mm | 2700K CRI 97'
  },
  {
    id: 'halo',
    name: 'The Halo',
    category: 'Wall Light',
    collectionSlug: 'wall-lighting',
    image: images.ambient,
    description: 'A minimalist circular wall sconce emitting a warm back-lit halo effect against textured marble or plaster walls.',
    specs: 'Diameter: 450mm | Depth: 55mm | 18W LED | Phase/DALI Dimmable | IP20'
  },
  {
    id: 'elan',
    name: 'The Élan',
    category: 'Table Light',
    collectionSlug: 'floor-lighting',
    image: images.floor,
    description: 'A sculptural table luminaire balancing a solid brass sphere on a honed black travertine pillar with integrated touch control.',
    specs: 'Height: 520mm | Base: 140x140mm | Touch Dimmer | 2700K Soft Glow'
  }
];

export const projects = [
  {
    id: 'private-residence-dubai',
    title: 'PRIVATE RESIDENCE',
    location: 'Dubai, UAE',
    category: 'Residential',
    year: '2025',
    image: images.villa,
    description: 'Layered architectural lighting for a 2,500 sq. m contemporary villa in Emirates Hills. Features custom ceiling coves, smart circadian scenes, and a bespoke 4-meter entry chandelier.',
    scope: 'Interior Lighting Design, Custom Chandelier Fabrication, Smart Controls Commissioning'
  },
  {
    id: 'the-grand-hotel-doha',
    title: 'THE GRAND HOTEL',
    location: 'Doha, Qatar',
    category: 'Hospitality',
    year: '2025',
    image: images.hotel,
    description: 'A warm, cinematic lighting scheme for an elevated 5-star hotel lobby, spa, and presidential suites, balancing rich architectural shadows with warm champagne accents.',
    scope: 'Architectural Lighting Specification, Lobby Statement Fixtures, Facade Illumination'
  },
  {
    id: 'luxury-villa-abu-dhabi',
    title: 'LUXURY VILLA',
    location: 'Abu Dhabi, UAE',
    category: 'Residential',
    year: '2024',
    image: images.living,
    description: 'Integrated ambient lighting that follows the sweeping curved ceiling contours of a beachfront residence on Saadiyat Island.',
    scope: 'Plaster-in Linear Cove Lighting, Decorative Pendants, Landscape & Poolside Ambient'
  },
  {
    id: 'fine-dining-restaurant-dubai',
    title: 'FINE DINING RESTAURANT',
    location: 'Dubai, UAE',
    category: 'Restaurant',
    year: '2024',
    image: images.restaurant,
    description: 'Intimate, low-glare atmospheric lighting designed to focus warmth onto table settings while maintaining soft, mystery-filled peripheral ambient light.',
    scope: 'Table-Focused Micro Spotlights, Acoustic Pendant Systems, Wine Cellar Lighting'
  },
  {
    id: 'flagship-boutique-riyadh',
    title: 'ROYAL COMMERCIAL TOWER',
    location: 'Riyadh, Saudi Arabia',
    category: 'Commercial',
    year: '2025',
    image: images.commercial,
    description: 'Precision architectural lighting for a corporate headquarters atrium, featuring automated dynamic daylight integration.',
    scope: 'Atrium Suspended Light Matrix, Energy Efficient Daylight Harvesting, DALI-2 Control'
  }
];

export const processSteps = [
  {
    step: '01',
    title: 'DISCOVER',
    subtitle: 'Understanding Vision & Architecture',
    description: 'We meet with you, your architect, or interior designer to thoroughly study room blueprints, natural light orientation, material textures, and spatial intent.'
  },
  {
    step: '02',
    title: 'DESIGN',
    subtitle: 'Concept Development & Light Rendering',
    description: 'Our lighting architects develop 3D light simulations, luxury fixture specifications, color temperature strategies, and custom luminaire sketches.'
  },
  {
    step: '03',
    title: 'DEVELOP',
    subtitle: 'Technical Specification & Craftsmanship',
    description: 'We precision-engineer fixtures, source premium materials (solid brass, hand-blown crystal, optical lenses), and coordinate smart control integration.'
  },
  {
    step: '04',
    title: 'INSTALL',
    subtitle: 'Commissioning & Final Scene Aiming',
    description: 'Our technical specialists oversee white-glove installation, beam angle tuning, light-scene programming, and final visual perfection.'
  }
];

export const valuesData = [
  {
    title: 'BESPOKE DESIGN',
    description: 'Tailored lighting solutions crafted specifically around your architecture, scale, and interior design brief.',
    iconName: 'Sparkles'
  },
  {
    title: 'PREMIUM QUALITY',
    description: 'Exceptional materials including solid brass, optical-grade crystal, and high-CRI LED engines built to endure.',
    iconName: 'Ruler'
  },
  {
    title: 'INNOVATIVE TECHNOLOGY',
    description: 'Intelligent lighting integration featuring DALI, Lutron, and KNX smart scene controls for modern living.',
    iconName: 'Lightbulb'
  },
  {
    title: 'EXPERT CONSULTATION',
    description: 'End-to-end guidance from preliminary lighting concepts through white-glove installation and scene aiming.',
    iconName: 'ShieldCheck'
  }
];

export const companyContact = {
  address: 'Alserkal Avenue, Building 42, Al Quoz 1, Dubai, United Arab Emirates',
  email: 'concierge@veloura-lighting.com',
  phone: '+971 4 340 8899',
  whatsapp: '+971 50 892 4411',
  hours: 'Monday – Saturday: 09:00 AM – 07:00 PM GST'
};

export const testimonials = [
  {
    id: 'tariq-al-mansoor',
    name: 'Tariq Al-Mansoor',
    role: 'Principal Architect',
    company: 'Mansoor Design Studio, Dubai',
    content: 'LUX BASED INDUSTRY transformed our double-height private residence in Emirates Hills. The bespoke chandelier commands the atrium with magnificent optical clarity while preserving perfect ambient warmth.',
    rating: 5,
  },
  {
    id: 'elena-rostova',
    name: 'Elena Rostova',
    role: 'Design Director',
    company: 'Lumière Interiors, Abu Dhabi',
    content: 'The architectural precision of LUX BASED INDUSTRY’s concealed ambient systems is unmatched. Their Lutron and DALI integration allowed us to choreograph seamless circadian scenes across a 2,500 sq. m villa.',
    rating: 5,
  },
  {
    id: 'marcus-vance',
    name: 'Marcus Vance',
    role: 'Hospitality Lead',
    company: 'Vance & Co. Luxury Developments, Doha',
    content: 'Specifying LUX BASED INDUSTRY’s architectural pendants for our boutique hotel suites elevated the entire guest experience. The hand-finished champagne patinas and glare-controlled optics reflect true luxury craftsmanship.',
    rating: 5,
  },
];
