import mongoose from 'mongoose';

const collectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Collection name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    eyebrow: {
      type: String,
      default: '',
    },
    tagline: {
      type: String,
      required: [true, 'Tagline is required'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    shortDescription: {
      type: String,
      default: '',
    },
    heroImage: {
      type: String,
      required: [true, 'Hero image URL is required'],
    },
    heroImagePublicId: {
      type: String,
      default: '',
    },
    gallery: [
      {
        type: String,
      },
    ],
    galleryPublicIds: [
      {
        type: String,
      },
    ],
    category: {
      type: String,
      default: 'Architectural',
    },
    features: [
      {
        type: String,
      },
    ],
    materials: {
      type: String,
      default: '',
    },
    applications: {
      type: String,
      default: '',
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    seo: {
      title: { type: String, default: '' },
      description: { type: String, default: '' },
      keywords: [{ type: String }],
      ogImage: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for products in this collection
collectionSchema.virtual('products', {
  ref: 'Product',
  localField: 'slug',
  foreignField: 'collectionSlug',
});

const Collection = mongoose.model('Collection', collectionSchema);
export default Collection;
