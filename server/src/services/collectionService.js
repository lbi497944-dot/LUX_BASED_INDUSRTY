import Collection from '../models/Collection.js';
import { slugify } from '../utils/slugify.js';

export const getAllCollections = async (queryParams) => {
  const { adminView = false, featured, sort = 'order' } = queryParams;

  const filter = {};
  if (!adminView) {
    filter.isActive = true;
  }

  if (featured !== undefined) {
    filter.featured = featured === 'true' || featured === true;
  }

  const collections = await Collection.find(filter).sort(sort);
  return collections;
};

export const getCollectionBySlug = async (slug) => {
  const collection = await Collection.findOne({ slug });
  if (!collection) {
    const error = new Error(`Collection not found with slug: ${slug}`);
    error.statusCode = 404;
    throw error;
  }
  return collection;
};

export const getCollectionById = async (id) => {
  const collection = await Collection.findById(id);
  if (!collection) {
    const error = new Error(`Collection not found with id: ${id}`);
    error.statusCode = 404;
    throw error;
  }
  return collection;
};

export const createCollection = async (collectionData) => {
  if (!collectionData.slug && collectionData.name) {
    collectionData.slug = slugify(collectionData.name);
  }

  let slug = collectionData.slug;
  let count = 1;
  while (await Collection.findOne({ slug })) {
    slug = `${collectionData.slug}-${count}`;
    count++;
  }
  collectionData.slug = slug;

  const collection = await Collection.create(collectionData);
  return collection;
};

export const updateCollection = async (id, updateData) => {
  if (updateData.name && !updateData.slug) {
    updateData.slug = slugify(updateData.name);
  }

  const collection = await Collection.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!collection) {
    const error = new Error(`Collection not found with id: ${id}`);
    error.statusCode = 404;
    throw error;
  }
  return collection;
};

export const deleteCollection = async (id) => {
  const collection = await Collection.findByIdAndDelete(id);
  if (!collection) {
    const error = new Error(`Collection not found with id: ${id}`);
    error.statusCode = 404;
    throw error;
  }
  return collection;
};
