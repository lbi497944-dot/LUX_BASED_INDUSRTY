import mongoose from 'mongoose';

export const ALLOWED_SECTION_TYPES = [
  'hero',
  'philosophy',
  'collections_feed',
  'products_feed',
  'before_after',
  'split_story',
  'value_cards',
  'projects_feed',
  'catalogue_cta',
  'process_timeline',
  'testimonials_feed',
  'faq_accordion',
  'consultation_cta',
  'editorial_text',
  'photo_banner',
  'contact_directory',
];

export const ALLOWED_MEDIA_TYPES = ['image', 'video', 'slideshow', 'none'];

const mediaSlideSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: [true, 'Slide URL is required'],
      trim: true,
    },
    publicId: {
      type: String,
      default: '',
      trim: true,
    },
    title: {
      type: String,
      default: '',
      trim: true,
    },
    caption: {
      type: String,
      default: '',
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { _id: true }
);

const sectionMediaSchema = new mongoose.Schema(
  {
    mediaType: {
      type: String,
      enum: {
        values: ALLOWED_MEDIA_TYPES,
        message: '{VALUE} is not a supported media type',
      },
      default: 'image',
    },
    url: {
      type: String,
      default: '',
      trim: true,
    },
    publicId: {
      type: String,
      default: '',
      trim: true,
    },
    videoUrl: {
      type: String,
      default: '',
      trim: true,
    },
    videoPublicId: {
      type: String,
      default: '',
      trim: true,
    },
    overlay: {
      type: Boolean,
      default: true,
    },
    overlayOpacity: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.75,
    },
    slides: [mediaSlideSchema],
  },
  { _id: false }
);

const customItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: '',
      trim: true,
    },
    subtitle: {
      type: String,
      default: '',
      trim: true,
    },
    text: {
      type: String,
      default: '',
      trim: true,
    },
    iconName: {
      type: String,
      default: '',
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { _id: true }
);

const sectionContentSchema = new mongoose.Schema(
  {
    eyebrow: {
      type: String,
      default: '',
      trim: true,
    },
    heading: {
      type: String,
      default: '',
      trim: true,
    },
    italicHeading: {
      type: String,
      default: '',
      trim: true,
    },
    subheading: {
      type: String,
      default: '',
      trim: true,
    },
    body: {
      type: String,
      default: '',
      trim: true,
    },
    primaryBtnText: {
      type: String,
      default: '',
      trim: true,
    },
    primaryBtnUrl: {
      type: String,
      default: '',
      trim: true,
    },
    secondaryBtnText: {
      type: String,
      default: '',
      trim: true,
    },
    secondaryBtnUrl: {
      type: String,
      default: '',
      trim: true,
    },
    alignment: {
      type: String,
      enum: ['left', 'center', 'right'],
      default: 'left',
    },
    customItems: [customItemSchema],
  },
  { _id: false }
);

const sectionSchema = new mongoose.Schema(
  {
    sectionId: {
      type: String,
      required: [true, 'Section ID is required'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Section type is required'],
      enum: {
        values: ALLOWED_SECTION_TYPES,
        message: '{VALUE} is not an approved section type',
      },
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    content: {
      type: sectionContentSchema,
      default: () => ({}),
    },
    media: {
      type: sectionMediaSchema,
      default: () => ({}),
    },
  },
  { _id: true }
);

const pageSeoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: '',
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    ogImage: {
      type: String,
      default: '',
      trim: true,
    },
    ogImagePublicId: {
      type: String,
      default: '',
      trim: true,
    },
    canonical: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { _id: false }
);

const pageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Page name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Page slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'published',
      index: true,
    },
    seo: {
      type: pageSeoSchema,
      default: () => ({}),
    },
    draftSections: [sectionSchema],
    publishedSections: [sectionSchema],
    publishedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Page = mongoose.model('Page', pageSchema);
export default Page;
