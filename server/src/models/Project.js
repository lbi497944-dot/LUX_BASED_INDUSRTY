import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
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
    location: {
      type: String,
      required: [true, 'Project location is required'],
      trim: true,
    },
    country: {
      type: String,
      default: 'UAE',
    },
    category: {
      type: String,
      enum: ['Residential', 'Hospitality', 'Restaurant', 'Commercial', 'Dining'],
      required: [true, 'Project category is required'],
      index: true,
    },
    year: {
      type: String,
      default: '2025',
    },
    description: {
      type: String,
      required: [true, 'Project description is required'],
    },
    scope: {
      type: String,
      default: '',
    },
    coverImage: {
      type: String,
      required: [true, 'Project image is required'],
    },
    coverImagePublicId: {
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
    lightingSolution: {
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
  }
);

projectSchema.index({ title: 'text', description: 'text', location: 'text' });

const Project = mongoose.model('Project', projectSchema);
export default Project;
