import { Router } from 'express';
import { Comparison } from '../../models/Comparison.js';
import { Property } from '../../models/Property.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import { authenticate } from '../../middleware/auth.middleware.js';
export const getComparison = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const comp = await Comparison.findOne({ user: userId }).populate('properties');
        const properties = comp?.properties || [];
        const propertyIds = comp?.propertyIds || [];
        successResponse(res, { properties, propertyIds });
    }
    catch (err) {
        errorResponse(res, err.message, 500);
    }
};
export const updateComparison = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { propertyIds } = req.body; // array of up to 4 string IDs
        if (!Array.isArray(propertyIds)) {
            errorResponse(res, 'propertyIds must be an array', 400);
            return;
        }
        const limitedIds = propertyIds.slice(0, 4);
        const properties = await Property.find({
            $or: [
                { referenceId: { $in: limitedIds } },
                { _id: { $in: limitedIds.filter((id) => id.match(/^[0-9a-fA-F]{24}$/)) } },
            ],
        });
        const comp = await Comparison.findOneAndUpdate({ user: userId }, {
            user: userId,
            properties: properties.map((p) => p._id),
            propertyIds: properties.map((p) => p.referenceId),
        }, { upsert: true, new: true }).populate('properties');
        successResponse(res, comp, 'Comparison updated');
    }
    catch (err) {
        errorResponse(res, err.message, 500);
    }
};
const router = Router();
router.get('/', authenticate, getComparison);
router.post('/', authenticate, updateComparison);
export default router;
