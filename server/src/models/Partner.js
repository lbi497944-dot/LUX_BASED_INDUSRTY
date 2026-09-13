import mongoose from 'mongoose';

const partnerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Partner company name is required'],
      trim: true,
      maxlength: [100, 'Company name cannot exceed 100 characters'],
    },
    logo: {
      type: String,
      required: [true, 'Partner logo image URL is required'],
      trim: true,
    },
    logoPublicId: {
      type: String,
      default: '',
      trim: true,
    },
    website: {
      type: String,
      trim: true,
      maxlength: [500, 'Website URL cannot exceed 500 characters'],
      default: '',
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

// Compound index for public ordering and active query optimization
partnerSchema.index({ isActive: 1, order: 1, createdAt: 1 });

const Partner = mongoose.model('Partner', partnerSchema);
export default Partner;
