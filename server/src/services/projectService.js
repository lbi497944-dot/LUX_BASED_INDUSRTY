import Project from '../models/Project.js';
import { slugify } from '../utils/slugify.js';
import { deleteCloudinaryAsset } from '../middleware/uploadMiddleware.js';

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

  try {
    const project = await Project.create(projectData);
    return project;
  } catch (createErr) {
    // Rollback newly uploaded cover asset if creation failed
    if (projectData.coverImagePublicId && typeof projectData.coverImagePublicId === 'string' && projectData.coverImagePublicId.trim()) {
      try {
        await deleteCloudinaryAsset(projectData.coverImagePublicId.trim());
      } catch (cleanupErr) {
        console.error(`[Project Creation Cleanup Error] Failed to rollback cover ${projectData.coverImagePublicId}:`, cleanupErr.message);
      }
    }

    // Rollback newly uploaded gallery assets if creation failed
    if (Array.isArray(projectData.galleryPublicIds) && projectData.galleryPublicIds.length > 0) {
      for (const gid of projectData.galleryPublicIds) {
        if (gid && typeof gid === 'string' && gid.trim()) {
          try {
            await deleteCloudinaryAsset(gid.trim());
          } catch (cleanupErr) {
            console.error(`[Project Creation Cleanup Error] Failed to rollback gallery asset ${gid}:`, cleanupErr.message);
          }
        }
      }
    }

    throw createErr;
  }
};

export const updateProject = async (id, updateData) => {
  if (updateData.title && !updateData.slug) {
    updateData.slug = slugify(updateData.title);
  }

  const existingProject = await Project.findById(id);
  if (!existingProject) {
    const error = new Error(`Project not found with id: ${id}`);
    error.statusCode = 404;
    throw error;
  }

  // Determine if cover image is being replaced or removed, and identify old Cloudinary asset to clean up
  let oldCoverPublicIdToDelete = null;
  const isCoverChanging = updateData.coverImage !== undefined && updateData.coverImage !== existingProject.coverImage;
  const isCoverPublicIdChanging = updateData.coverImagePublicId !== undefined && updateData.coverImagePublicId !== existingProject.coverImagePublicId;

  if ((isCoverChanging || isCoverPublicIdChanging) && existingProject.coverImagePublicId && existingProject.coverImagePublicId.trim()) {
    // Only mark for deletion if the new publicId differs from the old one
    if (updateData.coverImagePublicId !== existingProject.coverImagePublicId) {
      oldCoverPublicIdToDelete = existingProject.coverImagePublicId.trim();
    }
  }

  // Determine if any gallery assets are being removed or need rollback on failure
  const galleryAssetsToDelete = [];
  const newGalleryPublicIdsToRollback = [];

  if (Array.isArray(updateData.galleryPublicIds)) {
    const existingGalleryIds = Array.isArray(existingProject.galleryPublicIds) ? existingProject.galleryPublicIds : [];
    const newGallerySet = new Set(updateData.galleryPublicIds.map((g) => (typeof g === 'string' ? g.trim() : g)));
    const existingGallerySet = new Set(existingGalleryIds.map((g) => (typeof g === 'string' ? g.trim() : g)));

    // Assets to delete on success: old assets not in new set
    for (const gid of existingGalleryIds) {
      if (gid && typeof gid === 'string' && gid.trim() && !newGallerySet.has(gid.trim())) {
        galleryAssetsToDelete.push(gid.trim());
      }
    }

    // Assets to rollback on DB failure: new assets not in old set
    for (const gid of updateData.galleryPublicIds) {
      if (gid && typeof gid === 'string' && gid.trim() && !existingGallerySet.has(gid.trim())) {
        newGalleryPublicIdsToRollback.push(gid.trim());
      }
    }
  }

  // Perform database update
  let project;
  try {
    project = await Project.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  } catch (updateErr) {
    // Rollback new cover asset if update failed
    if (isCoverPublicIdChanging && updateData.coverImagePublicId && typeof updateData.coverImagePublicId === 'string' && updateData.coverImagePublicId.trim()) {
      try {
        await deleteCloudinaryAsset(updateData.coverImagePublicId.trim());
      } catch (rollbackErr) {
        console.error(`[Project Update Cleanup Error] Failed to rollback new cover asset:`, rollbackErr.message);
      }
    }

    // Rollback newly added gallery assets if update failed
    for (const gid of newGalleryPublicIdsToRollback) {
      try {
        await deleteCloudinaryAsset(gid);
      } catch (rollbackErr) {
        console.error(`[Project Update Cleanup Error] Failed to rollback new gallery asset ${gid}:`, rollbackErr.message);
      }
    }

    throw updateErr;
  }

  // After successful update, clean up old assets
  if (oldCoverPublicIdToDelete) {
    try {
      await deleteCloudinaryAsset(oldCoverPublicIdToDelete);
    } catch (cleanupErr) {
      console.error(`[Project Media Cleanup Error] Failed to delete old cover asset ${oldCoverPublicIdToDelete}:`, cleanupErr.message);
    }
  }

  for (const gid of galleryAssetsToDelete) {
    try {
      await deleteCloudinaryAsset(gid);
    } catch (cleanupErr) {
      console.error(`[Project Gallery Cleanup Error] Failed to delete old gallery asset ${gid}:`, cleanupErr.message);
    }
  }

  return project;
};

export const deleteProject = async (id) => {
  const project = await Project.findById(id);
  if (!project) {
    const error = new Error(`Project not found with id: ${id}`);
    error.statusCode = 404;
    throw error;
  }

  // Clean up cover image if stored in Cloudinary
  if (project.coverImagePublicId && typeof project.coverImagePublicId === 'string' && project.coverImagePublicId.trim()) {
    try {
      await deleteCloudinaryAsset(project.coverImagePublicId.trim());
    } catch (cleanupErr) {
      console.error(`[Project Media Cleanup Error] Failed to delete cover asset ${project.coverImagePublicId}:`, cleanupErr.message);
    }
  }

  // Clean up gallery images if stored in Cloudinary
  if (Array.isArray(project.galleryPublicIds) && project.galleryPublicIds.length > 0) {
    for (const gid of project.galleryPublicIds) {
      if (gid && typeof gid === 'string' && gid.trim()) {
        try {
          await deleteCloudinaryAsset(gid.trim());
        } catch (cleanupErr) {
          console.error(`[Project Gallery Cleanup Error] Failed to delete gallery asset ${gid}:`, cleanupErr.message);
        }
      }
    }
  }

  await Project.findByIdAndDelete(id);
  return project;
};
