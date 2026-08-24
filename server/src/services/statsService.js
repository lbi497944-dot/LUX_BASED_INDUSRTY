import Product from '../models/Product.js';
import Collection from '../models/Collection.js';
import Project from '../models/Project.js';
import Consultation from '../models/Consultation.js';
import ContactEnquiry from '../models/ContactEnquiry.js';
import NewsletterSubscriber from '../models/NewsletterSubscriber.js';

export const getDashboardStats = async () => {
  const [
    totalProducts,
    totalCollections,
    totalProjects,
    totalConsultations,
    newConsultations,
    totalEnquiries,
    newEnquiries,
    totalSubscribers,
    recentConsultations,
    recentEnquiries,
  ] = await Promise.all([
    Product.countDocuments(),
    Collection.countDocuments(),
    Project.countDocuments(),
    Consultation.countDocuments(),
    Consultation.countDocuments({ status: 'New' }),
    ContactEnquiry.countDocuments(),
    ContactEnquiry.countDocuments({ status: 'New' }),
    NewsletterSubscriber.countDocuments({ status: 'Subscribed' }),
    Consultation.find().sort('-createdAt').limit(5),
    ContactEnquiry.find().sort('-createdAt').limit(5),
  ]);

  return {
    counts: {
      totalProducts,
      totalCollections,
      totalProjects,
      totalConsultations,
      newConsultations,
      totalEnquiries,
      newEnquiries,
      totalSubscribers,
    },
    recentConsultations,
    recentEnquiries,
  };
};
