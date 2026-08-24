import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from '../models/Admin.js';
import Collection from '../models/Collection.js';
import Product from '../models/Product.js';
import Project from '../models/Project.js';
import FAQ from '../models/FAQ.js';
import SiteSetting from '../models/SiteSetting.js';
import Consultation from '../models/Consultation.js';
import ContactEnquiry from '../models/ContactEnquiry.js';
import NewsletterSubscriber from '../models/NewsletterSubscriber.js';
import Testimonial from '../models/Testimonial.js';
import { adminSeed, collectionsSeed, productsSeed, projectsSeed, faqsSeed } from './seedData.js';

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/veloura_lighting');
    console.log(`[Seeder] MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`[Seeder Error]: ${err.message}`);
    process.exit(1);
  }
};

const importData = async () => {
  try {
    await connectDB();

    console.log('[Seeder] Clearing existing data...');
    await Admin.deleteMany();
    await Collection.deleteMany();
    await Product.deleteMany();
    await Project.deleteMany();
    await FAQ.deleteMany();
    await SiteSetting.deleteMany();
    await Consultation.deleteMany();
    await ContactEnquiry.deleteMany();
    await NewsletterSubscriber.deleteMany();
    await Testimonial.deleteMany();

    console.log('[Seeder] Seeding Admin user...');
    await Admin.create(adminSeed);

    console.log('[Seeder] Seeding Collections...');
    const createdCollections = await Collection.insertMany(collectionsSeed);

    console.log('[Seeder] Seeding Products...');
    // Link collectionId to products
    const productsWithIds = productsSeed.map((prod) => {
      const matchCol = createdCollections.find((c) => c.slug === prod.collectionSlug);
      return {
        ...prod,
        collectionId: matchCol ? matchCol._id : null,
      };
    });
    await Product.insertMany(productsWithIds);

    console.log('[Seeder] Seeding Portfolio Projects...');
    await Project.insertMany(projectsSeed);

    console.log('[Seeder] Seeding FAQs...');
    await FAQ.insertMany(faqsSeed);

    console.log('[Seeder] Seeding Site Settings...');
    await SiteSetting.create({});

    console.log('\n========================================================');
    console.log('  SUCCESS: Database seeded with Veloura demonstration data!');
    console.log('  Admin Login: admin@veloura-lighting.com / VelouraAdmin2026!');
    console.log('========================================================\n');
    process.exit(0);
  } catch (err) {
    console.error(`[Seeder Error]: ${err.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connectDB();

    console.log('[Seeder] Destroying all database records...');
    await Admin.deleteMany();
    await Collection.deleteMany();
    await Product.deleteMany();
    await Project.deleteMany();
    await FAQ.deleteMany();
    await SiteSetting.deleteMany();
    await Consultation.deleteMany();
    await ContactEnquiry.deleteMany();
    await NewsletterSubscriber.deleteMany();
    await Testimonial.deleteMany();

    console.log('[Seeder] All database records successfully wiped.');
    process.exit(0);
  } catch (err) {
    console.error(`[Seeder Error]: ${err.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
