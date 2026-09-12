import NewsletterSubscriber from '../models/NewsletterSubscriber.js';

export const subscribeNewsletter = async (email, source = 'footer') => {
  const existing = await NewsletterSubscriber.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    if (existing.status === 'Unsubscribed') {
      existing.status = 'Subscribed';
      await existing.save();
      return { subscriber: existing, message: 'Welcome back! You have been re-subscribed.' };
    }
    return { subscriber: existing, message: 'You are already subscribed to LUX BASED INDUSTRY insights.' };
  }

  const subscriber = await NewsletterSubscriber.create({
    email: email.toLowerCase().trim(),
    source,
  });

  return { subscriber, message: 'Thank you for subscribing to LUX BASED INDUSTRY updates.' };
};

export const getAllSubscribers = async (queryParams) => {
  const { status, page = 1, limit = 50 } = queryParams;

  const filter = {};
  if (status && status !== 'ALL') {
    filter.status = status;
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 50;
  const skip = (pageNum - 1) * limitNum;

  const total = await NewsletterSubscriber.countDocuments(filter);
  const subscribers = await NewsletterSubscriber.find(filter)
    .sort('-createdAt')
    .skip(skip)
    .limit(limitNum);

  return {
    subscribers,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum) || 1,
    },
  };
};

export const deleteSubscriber = async (id) => {
  const subscriber = await NewsletterSubscriber.findByIdAndDelete(id);
  if (!subscriber) {
    const error = new Error(`Subscriber not found with id: ${id}`);
    error.statusCode = 404;
    throw error;
  }
  return subscriber;
};
