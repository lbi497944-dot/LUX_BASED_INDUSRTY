import Product from '../models/Product.js';
import { slugify } from '../utils/slugify.js';

export const getAllProducts = async (queryParams) => {
  const { search, category, collection, featured, page = 1, limit = 50, sort = '-createdAt', adminView = false } = queryParams;

  const filter = {};
  if (!adminView) {
    filter.isActive = true;
  }

  if (category && category !== 'ALL') {
    filter.category = new RegExp(`^${category}$`, 'i');
  }

  if (collection) {
    filter.collectionSlug = collection;
  }

  if (featured !== undefined) {
    filter.featured = featured === 'true' || featured === true;
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { specifications: { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 50;
  const skip = (pageNum - 1) * limitNum;

  const total = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limitNum)
    .populate('collectionId', 'name slug');

  return {
    products,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum) || 1,
    },
  };
};

export const getProductBySlug = async (slug) => {
  const product = await Product.findOne({ slug }).populate('collectionId');
  if (!product) {
    const error = new Error(`Product not found with slug: ${slug}`);
    error.statusCode = 404;
    throw error;
  }
  return product;
};

export const getProductById = async (id) => {
  const product = await Product.findById(id);
  if (!product) {
    const error = new Error(`Product not found with id: ${id}`);
    error.statusCode = 404;
    throw error;
  }
  return product;
};

export const createProduct = async (productData) => {
  if (!productData.slug && productData.name) {
    productData.slug = slugify(productData.name);
  }

  // Ensure unique slug
  let slug = productData.slug;
  let count = 1;
  while (await Product.findOne({ slug })) {
    slug = `${productData.slug}-${count}`;
    count++;
  }
  productData.slug = slug;

  const product = await Product.create(productData);
  return product;
};

export const updateProduct = async (id, updateData) => {
  if (updateData.name && !updateData.slug) {
    updateData.slug = slugify(updateData.name);
  }

  const product = await Product.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    const error = new Error(`Product not found with id: ${id}`);
    error.statusCode = 404;
    throw error;
  }
  return product;
};

export const deleteProduct = async (id) => {
  const product = await Product.findByIdAndDelete(id);
  if (!product) {
    const error = new Error(`Product not found with id: ${id}`);
    error.statusCode = 404;
    throw error;
  }
  return product;
};
