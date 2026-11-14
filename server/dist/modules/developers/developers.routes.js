import { Router } from 'express';
import { Developer } from '../../models/Developer.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import { slugify } from '../../utils/slug.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/rbac.middleware.js';
export const getDevelopers = async (_req, res) => {
    try {
        const developers = await Developer.find({ isActive: true });
        successResponse(res, developers);
    }
    catch (err) {
        errorResponse(res, err.message, 500);
    }
};
export const getDeveloperByIdOrSlug = async (req, res) => {
    try {
        const { idOrSlug } = req.params;
        const developer = await Developer.findOne({
            $or: [
                { slug: idOrSlug.toLowerCase() },
                { referenceId: idOrSlug },
                ...(idOrSlug.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: idOrSlug }] : []),
            ],
        });
        if (!developer) {
            errorResponse(res, 'Developer not found', 404);
            return;
        }
        successResponse(res, developer);
    }
    catch (err) {
        errorResponse(res, err.message, 500);
    }
};
export const createDeveloper = async (req, res) => {
    try {
        const data = req.body;
        const referenceId = `dev-${Date.now().toString(36)}`;
        const slug = data.slug || `${slugify(data.name)}-${referenceId.slice(-6)}`;
        const dev = await Developer.create({ ...data, referenceId, slug });
        successResponse(res, dev, 'Developer created successfully', 201);
    }
    catch (err) {
        errorResponse(res, err.message, 500);
    }
};
const router = Router();
router.get('/', getDevelopers);
router.get('/:idOrSlug', getDeveloperByIdOrSlug);
router.post('/', authenticate, requireRole('super-admin', 'admin'), createDeveloper);
export default router;
