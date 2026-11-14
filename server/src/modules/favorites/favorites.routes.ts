import { Request, Response, Router } from 'express';
import { Favorite } from '../../models/Favorite.js';
import { Property } from '../../models/Property.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import { authenticate, AuthenticatedRequest } from '../../middleware/auth.middleware.js';

export const getFavorites = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const favorites = await Favorite.find({ user: userId }).populate('property');
    const properties = favorites.map((f) => f.property).filter(Boolean);
    const propertyIds = favorites.map((f) => f.propertyId);
    successResponse(res, { properties, propertyIds });
  } catch (err: any) {
    errorResponse(res, err.message, 500);
  }
};

export const toggleFavorite = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { propertyId } = req.body;

    if (!propertyId) {
      errorResponse(res, 'propertyId is required', 400);
      return;
    }

    const prop = await Property.findOne({
      $or: [
        { referenceId: propertyId },
        ...(propertyId.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: propertyId }] : []),
      ],
    });

    if (!prop) {
      errorResponse(res, 'Property not found', 404);
      return;
    }

    const existing = await Favorite.findOne({
      user: userId,
      property: prop._id,
    });

    if (existing) {
      await existing.deleteOne();
      successResponse(res, { isSaved: false, propertyId: prop.referenceId }, 'Removed from favorites');
    } else {
      await Favorite.create({
        user: userId,
        property: prop._id,
        propertyId: prop.referenceId,
      });
      successResponse(res, { isSaved: true, propertyId: prop.referenceId }, 'Saved to favorites');
    }
  } catch (err: any) {
    errorResponse(res, err.message, 500);
  }
};

const router = Router();
router.get('/', authenticate, getFavorites);
router.post('/toggle', authenticate, toggleFavorite);

export default router;
