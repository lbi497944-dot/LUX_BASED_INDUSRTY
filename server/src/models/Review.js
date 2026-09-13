import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required for verification'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
      index: true,
      select: false, // Protected by default: Never returned in public queries
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required for verification'],
      trim: true,
      maxlength: [25, 'Phone cannot exceed 25 characters'],
      select: false, // Protected by default: Never returned in public queries
    },
    rating: {
      type: Number,
      required: [true, 'Star rating is required'],
      min: [1, 'Rating must be at least 1 star'],
      max: [5, 'Rating cannot exceed 5 stars'],
      default: 5,
      index: true,
    },
    title: {
      type: String,
      trim: true,
      maxlength: [120, 'Headline cannot exceed 120 characters'],
      default: '',
    },
    content: {
      type: String,
      required: [true, 'Review text is required'],
      trim: true,
      minlength: [10, 'Review text must be at least 10 characters'],
      maxlength: [2000, 'Review text cannot exceed 2000 characters'],
    },
    projectLocation: {
      type: String,
      trim: true,
      maxlength: [100, 'Location cannot exceed 100 characters'],
      default: '', // Optional field with empty default (no fabricated locations)
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, default: '' },
        filename: { type: String, default: '' },
        mimeType: { type: String, default: '' },
      },
    ],
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
      index: true,
    },
    adminNotes: {
      type: String,
      default: '',
      select: false, // Internal CMS only
    },
    moderatedAt: {
      type: Date,
      default: null,
    },
    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
    },
    ipAddress: {
      type: String,
      default: '',
      select: false, // Spam logging only
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for public listing and filtering performance
reviewSchema.index({ status: 1, rating: -1, createdAt: -1 });

const Review = mongoose.model('Review', reviewSchema);
export default Review;
