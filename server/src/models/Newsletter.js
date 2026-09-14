import mongoose from 'mongoose';

const newsletterSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Campaign title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    subject: {
      type: String,
      required: [true, 'Email subject is required'],
      trim: true,
      maxlength: [200, 'Subject cannot exceed 200 characters'],
    },
    previewText: {
      type: String,
      default: '',
      trim: true,
      maxlength: [200, 'Preview text cannot exceed 200 characters'],
    },
    heading: {
      type: String,
      default: '',
      trim: true,
      maxlength: [150, 'Heading cannot exceed 150 characters'],
    },
    content: {
      type: String,
      required: [true, 'Newsletter content is required'],
      trim: true,
      maxlength: [50000, 'Content exceeds maximum allowed size'],
    },
    imageUrl: {
      type: String,
      default: '',
    },
    imagePublicId: {
      type: String,
      default: '',
    },
    ctaText: {
      type: String,
      default: '',
      trim: true,
      maxlength: [60, 'CTA text cannot exceed 60 characters'],
    },
    ctaUrl: {
      type: String,
      default: '',
      trim: true,
    },
    attachments: [
      {
        url: { type: String, required: true },
        publicId: { type: String, default: '' },
        filename: { type: String, default: '' },
        mimeType: { type: String, default: '' },
        size: { type: Number, default: 0 },
      },
    ],
    targetAudience: {
      type: String,
      enum: ['all', 'custom'],
      default: 'all',
    },
    selectedRecipients: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ],
    status: {
      type: String,
      enum: ['Draft', 'Sending', 'Sent', 'Send_Failed'],
      default: 'Draft',
      index: true,
    },
    sentAt: {
      type: Date,
      default: null,
    },
    recipientCount: {
      type: Number,
      default: 0,
    },
    successfulSends: {
      type: Number,
      default: 0,
    },
    failedSends: {
      type: Number,
      default: 0,
    },
    lastError: {
      type: String,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

newsletterSchema.index({ createdAt: -1 });

const Newsletter = mongoose.model('Newsletter', newsletterSchema);
export default Newsletter;
