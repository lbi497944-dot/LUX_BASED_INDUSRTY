import Project from '../models/Project.js';
import { slugify } from '../utils/slugify.js';

export const getAllProjects = async (queryParams) => {
  const { category, featured, page = 1, limit = 50, sort = 'order -year -createdAt', adminView = false } = queryParams;

  const filter = {};
  if (!adminView) {
    filter.isActive = true;
  }

  if (category && category !== 'ALL') {
    filter.category = new RegExp(`^${category}$`, 'i');
  }

  if (featured !== undefined) {
    filter.featured = featured === 'true' || featured === true;
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 50;
  const skip = (pageNum - 1) * limitNum;

  const total = await Project.countDocuments(filter);
  const projects = await Project.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limitNum);

  return {
    projects,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum) || 1,
    },
  };
};

export const getProjectBySlug = async (slug) => {
  const project = await Project.findOne({ slug });
  if (!project) {
    const error = new Error(`Project not found with slug: ${slug}`);
    error.statusCode = 404;
    throw error;
  }
  return project;
};

export const getProjectById = async (id) => {
  const project = await Project.findById(id);
  if (!project) {
    const error = new Error(`Project not found with id: ${id}`);
    error.statusCode = 404;
    throw error;
  }
  return project;
};

export const createProject = async (projectData) => {
  if (!projectData.slug && projectData.title) {
    projectData.slug = slugify(projectData.title);
  }

  let slug = projectData.slug;
  let count = 1;
  while (await Project.findOne({ slug })) {
    slug = `${projectData.slug}-${count}`;
    count++;
  }
  projectData.slug = slug;

  const project = await Project.create(projectData);
  return project;
};

export const updateProject = async (id, updateData) => {
  if (updateData.title && !updateData.slug) {
    updateData.slug = slugify(updateData.title);
  }

  const project = await Project.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!project) {
    const error = new Error(`Project not found with id: ${id}`);
    error.statusCode = 404;
    throw error;
  }
  return project;
};

export const deleteProject = async (id) => {
  const project = await Project.findByIdAndDelete(id);
  if (!project) {
    const error = new Error(`Project not found with id: ${id}`);
    error.statusCode = 404;
    throw error;
  }
  return project;
};
