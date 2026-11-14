import { Router } from 'express';
import { Notification } from '../../models/Notification.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import { authenticate } from '../../middleware/auth.middleware.js';
export const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find().sort({ createdAt: -1 }).limit(30);
        const unreadCount = await Notification.countDocuments({ read: false });
        successResponse(res, { notifications, unreadCount });
    }
    catch (err) {
        errorResponse(res, err.message, 500);
    }
};
export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notification.findOneAndUpdate({
            $or: [
                { referenceId: id },
                ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : []),
            ],
        }, { read: true }, { new: true });
        successResponse(res, notification, 'Notification marked as read');
    }
    catch (err) {
        errorResponse(res, err.message, 500);
    }
};
export const markAllAsRead = async (_req, res) => {
    try {
        await Notification.updateMany({ read: false }, { read: true });
        successResponse(res, null, 'All notifications marked as read');
    }
    catch (err) {
        errorResponse(res, err.message, 500);
    }
};
const router = Router();
router.get('/', authenticate, getNotifications);
router.patch('/:id/read', authenticate, markAsRead);
router.patch('/read-all', authenticate, markAllAsRead);
export default router;
