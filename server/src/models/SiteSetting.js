import mongoose from 'mongoose';

const siteSettingSchema = new mongoose.Schema(
  {
    brandName: {
      type: String,
      default: 'LUX BASED INDUSTRY',
    },
    tagline: {
      type: String,
      default: 'Illuminating Luxury Spaces',
    },
    logo: {
      type: String,
      default: '',
      trim: true,
    },
    logoPublicId: {
      type: String,
      default: '',
      trim: true,
    },
    email: {
      type: String,
      default: 'concierge@veloura-lighting.com',
    },
    phone: {
      type: String,
      default: '+971 4 340 8899',
    },
    whatsapp: {
      type: String,
      default: '+971 50 892 4411',
    },
    whatsappNumberClean: {
      type: String,
      default: '971508924411',
    },
    address: {
      type: String,
      default: 'Alserkal Avenue, Building 42, Al Quoz 1, Dubai, United Arab Emirates',
    },
    city: {
      type: String,
      default: 'Dubai',
    },
    country: {
      type: String,
      default: 'United Arab Emirates',
    },
    locations: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        address: {
          type: String,
          required: true,
          trim: true,
        },
        city: {
          type: String,
          default: '',
          trim: true,
        },
        country: {
          type: String,
          default: '',
          trim: true,
        },
        phone: {
          type: String,
          default: '',
          trim: true,
        },
        email: {
          type: String,
          default: '',
          trim: true,
        },
        mapUrl: {
          type: String,
          default: '',
          trim: true,
        },
        isPrimary: {
          type: Boolean,
          default: false,
        },
        isActive: {
          type: Boolean,
          default: true,
        },
        order: {
          type: Number,
          default: 0,
        },
      },
    ],
    businessHours: {
      type: String,
      default: 'Monday – Saturday: 09:00 AM – 07:00 PM GST',
    },
    catalogueUrl: {
      type: String,
      default: '/downloads/Veloura_Lighting_2026_Catalogue.pdf',
    },
    socialLinks: {
      instagram: {
        type: String,
        default: 'https://instagram.com/veloura.lighting',
      },
      linkedin: {
        type: String,
        default: 'https://linkedin.com/company/veloura-lighting',
      },
      pinterest: {
        type: String,
        default: 'https://pinterest.com/velouralighting',
      },
      facebook: {
        type: String,
        default: 'https://facebook.com/velouralighting',
      },
    },
    defaultSeo: {
      title: {
        type: String,
        default: 'LUX BASED INDUSTRY | Luxury Architectural Lighting in Dubai',
      },
      description: {
        type: String,
        default: 'LUX BASED INDUSTRY creates bespoke architectural lighting, luxury chandeliers, and premium illumination for luxury villas, destination hotels, restaurants, and commercial spaces in Dubai and the UAE.',
      },
      keywords: [
        {
          type: String,
        },
      ],
      ogImage: {
        type: String,
        default: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&h=630&q=90',
      },
    },
    coordinates: {
      latitude: {
        type: String,
        default: '25.1412',
      },
      longitude: {
        type: String,
        default: '55.2272',
      },
    },
  },
  {
    timestamps: true,
  }
);

const SiteSetting = mongoose.model('SiteSetting', siteSettingSchema);
export default SiteSetting;
