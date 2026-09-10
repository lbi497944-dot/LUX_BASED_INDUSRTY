import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
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
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      index: true,
    },
    collectionSlug: {
      type: String,
      required: [true, 'Collection slug is required'],
      index: true,
    },
    collectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Collection',
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    shortDescription: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      required: [true, 'Primary image URL is required'],
    },
    imagePublicId: {
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
    materials: {
      type: String,
      default: '',
    },
    finish: {
      type: String,
      default: '',
    },
    dimensions: {
      type: String,
      default: '',
    },
    lightSource: {
      type: String,
      default: '',
    },
    wattage: {
      type: String,
      default: '',
    },
    colorTemperature: {
      type: String,
      default: '2700K',
    },
    ipRating: {
      type: String,
      default: 'IP20',
    },
    specifications: {
      type: String,
      default: '',
    },
    applications: {
      type: String,
      default: '',
    },
    customizable: {
      type: Boolean,
      default: true,
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
  }
);

// Compound index for category/collection queries
productSchema.index({ category: 1, collectionSlug: 1 });
productSchema.index({ name: 'text', description: 'text', category: 'text' });

const Product = mongoose.model('Product', productSchema);
export default Product;
