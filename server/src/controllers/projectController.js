import * as projectService from '../services/projectService.js';
import { successResponse } from '../utils/apiResponse.js';

export const getProjects = async (req, res, next) => {
  try {
    const isAdmin = Boolean(req.admin && req.admin.role === 'admin');
    const queryParams = {
      ...req.query,
      adminView: isAdmin && (req.query.adminView === 'true' || req.query.adminView === true),
    };
    const result = await projectService.getAllProjects(queryParams);
    return successResponse(res, 'Projects retrieved successfully.', result.projects, 200, result.pagination);
  } catch (error) {
    next(error);
  }
};

export const getProjectBySlug = async (req, res, next) => {
  try {
    const project = await projectService.getProjectBySlug(req.params.slug);
    return successResponse(res, 'Project details retrieved.', { project });
  } catch (error) {
    next(error);
  }
};

export const getProjectById = async (req, res, next) => {
  try {
    const project = await projectService.getProjectById(req.params.id);
    return successResponse(res, 'Project details retrieved.', { project });
  } catch (error) {
    next(error);
  }
};

export const createProject = async (req, res, next) => {
  try {
    const project = await projectService.createProject(req.body);
    return successResponse(res, 'Project created successfully.', { project }, 201);
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const project = await projectService.updateProject(req.params.id, req.body);
    return successResponse(res, 'Project updated successfully.', { project });
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    await projectService.deleteProject(req.params.id);
    return successResponse(res, 'Project deleted successfully.');
  } catch (error) {
    next(error);
  }
};
