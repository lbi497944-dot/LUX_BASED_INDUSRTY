import mongoose from 'mongoose';

const consultationSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
      index: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    whatsapp: {
      type: String,
      default: '',
    },
    projectLocation: {
      type: String,
      required: [true, 'Project location is required'],
      trim: true,
    },
    projectType: {
      type: String,
      required: [true, 'Project type is required'],
      trim: true,
    },
    projectStage: {
      type: String,
      default: 'Concept / Initial Sketch',
    },
    estimatedBudget: {
      type: String,
      default: '$50,000 - $100,000',
    },
    lightingRequirements: {
      type: String,
      default: 'Full Lighting Scheme & Specification',
    },
    message: {
      type: String,
      default: '',
    },
    attachments: [
      {
        url: { type: String, required: true },
        publicId: { type: String, default: '' },
        filename: { type: String, default: '' },
        mimeType: { type: String, default: '' },
      },
    ],
    status: {
      type: String,
      enum: ['New', 'Contacted', 'In Discussion', 'Quoted', 'Completed', 'Cancelled'],
      default: 'New',
      index: true,
    },
    adminNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Consultation = mongoose.model('Consultation', consultationSchema);
export default Consultation;
