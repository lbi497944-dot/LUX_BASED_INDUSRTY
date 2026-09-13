import mongoose from 'mongoose';

const transformationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Transformation title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    shortDescription: {
      type: String,
      trim: true,
      maxlength: [300, 'Short description cannot exceed 300 characters'],
      default: '',
    },
    detailedDescription: {
      type: String,
      trim: true,
      maxlength: [2000, 'Detailed description cannot exceed 2000 characters'],
      default: '',
    },
    beforeImage: {
      type: String,
      required: [true, 'Before image URL is required'],
      trim: true,
    },
    beforePublicId: {
      type: String,
      default: '',
      trim: true,
    },
    afterImage: {
      type: String,
      required: [true, 'After image URL is required'],
      trim: true,
    },
    afterPublicId: {
      type: String,
      default: '',
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for active listing & ordering performance
transformationSchema.index({ isActive: 1, order: 1, createdAt: 1 });

const Transformation = mongoose.model('Transformation', transformationSchema);
export default Transformation;
