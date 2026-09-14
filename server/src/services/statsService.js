import Product from '../models/Product.js';
import Collection from '../models/Collection.js';
import Project from '../models/Project.js';
import Consultation from '../models/Consultation.js';
import ContactEnquiry from '../models/ContactEnquiry.js';
import NewsletterSubscriber from '../models/NewsletterSubscriber.js';
import Review from '../models/Review.js';

const getStartOfToday = () => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
};

export const getNotificationSummary = async () => {
  const startOfDay = getStartOfToday();

  const [
    newConsultations,
    newEnquiries,
    todaySubscriptions,
    pendingReviews,
  ] = await Promise.all([
    Consultation.countDocuments({ status: 'New' }),
    ContactEnquiry.countDocuments({ status: 'New' }),
    NewsletterSubscriber.countDocuments({
      status: 'Subscribed',
      createdAt: { $gte: startOfDay },
    }),
    Review.countDocuments({ status: 'Pending' }),
  ]);

  const counts = {
    consultations: newConsultations,
    enquiries: newEnquiries,
    subscriptions: todaySubscriptions,
    reviews: pendingReviews,
    total: newConsultations + newEnquiries + todaySubscriptions + pendingReviews,
  };

  const tasks = [
    {
      id: 'consultations',
      title: 'New Consultations',
      count: newConsultations,
      description: 'Review private lighting consultation requests from VIP clients',
      path: '/admin/consultations',
      icon: 'CalendarCheck2',
      badgeKey: 'consultations',
    },
    {
      id: 'enquiries',
      title: 'New Enquiries',
      count: newEnquiries,
      description: 'Respond to new architectural messages and contact requests',
      path: '/admin/contact',
      icon: 'Mail',
      badgeKey: 'enquiries',
    },
    {
      id: 'subscriptions',
      title: "Today's Subscriptions",
      count: todaySubscriptions,
      description: 'Review new audience members subscribed to architectural insights',
      path: '/admin/newsletter',
      icon: 'Send',
      badgeKey: 'subscriptions',
    },
    {
      id: 'reviews',
      title: 'Reviews Requiring Attention',
      count: pendingReviews,
      description: 'Moderate customer testimonials and project installation feedback',
      path: '/admin/reviews',
      icon: 'Star',
      badgeKey: 'reviews',
    },
  ];

  return {
    counts,
    tasks,
    timestamp: new Date().toISOString(),
  };
};

export const getDashboardStats = async () => {
  const [
    totalProducts,
    totalCollections,
    totalProjects,
    totalConsultations,
    totalEnquiries,
    totalSubscribers,
    totalReviews,
    recentConsultations,
    recentEnquiries,
    notificationData,
  ] = await Promise.all([
    Product.countDocuments(),
    Collection.countDocuments(),
    Project.countDocuments(),
    Consultation.countDocuments(),
    ContactEnquiry.countDocuments(),
    NewsletterSubscriber.countDocuments({ status: 'Subscribed' }),
    Review.countDocuments(),
    Consultation.find().sort('-createdAt').limit(5),
    ContactEnquiry.find().sort('-createdAt').limit(5),
    getNotificationSummary(),
  ]);

  return {
    counts: {
      totalProducts,
      totalCollections,
      totalProjects,
      totalConsultations,
      newConsultations: notificationData.counts.consultations,
      totalEnquiries,
      newEnquiries: notificationData.counts.enquiries,
      totalSubscribers,
      todaySubscribers: notificationData.counts.subscriptions,
      totalReviews,
      pendingReviews: notificationData.counts.reviews,
    },
    notifications: notificationData.counts,
    tasks: notificationData.tasks,
    recentConsultations,
    recentEnquiries,
  };
};
