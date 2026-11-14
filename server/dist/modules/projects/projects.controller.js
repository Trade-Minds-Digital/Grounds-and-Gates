import { Project } from '../../models/Project.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import { slugify } from '../../utils/slug.js';
export const getProjects = async (_req, res) => {
    try {
        const projects = await Project.find({ isActive: true }).populate('developer');
        successResponse(res, projects);
    }
    catch (err) {
        errorResponse(res, err.message, 500);
    }
};
export const getProjectByIdOrSlug = async (req, res) => {
    try {
        const { idOrSlug } = req.params;
        const project = await Project.findOne({
            $or: [
                { slug: idOrSlug.toLowerCase() },
                { referenceId: idOrSlug },
                ...(idOrSlug.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: idOrSlug }] : []),
            ],
        }).populate('developer');
        if (!project) {
            errorResponse(res, 'Project not found', 404);
            return;
        }
        successResponse(res, project);
    }
    catch (err) {
        errorResponse(res, err.message, 500);
    }
};
export const createProject = async (req, res) => {
    try {
        const data = req.body;
        const referenceId = `proj-${Date.now().toString(36)}`;
        const slug = data.slug || `${slugify(data.name)}-${referenceId.slice(-6)}`;
        const project = await Project.create({
            ...data,
            referenceId,
            slug,
        });
        successResponse(res, project, 'Project created successfully', 201);
    }
    catch (err) {
        errorResponse(res, err.message, 500);
    }
};
