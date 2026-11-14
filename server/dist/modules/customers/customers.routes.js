import { Router } from 'express';
import { Customer } from '../../models/Customer.js';
import { Enquiry } from '../../models/Enquiry.js';
import { SiteVisit } from '../../models/SiteVisit.js';
import { Booking } from '../../models/Booking.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/rbac.middleware.js';
export const getCustomers = async (req, res) => {
    try {
        const filter = { isActive: true };
        if (req.query.includeSample !== 'true') {
            filter.isSample = { $ne: true };
        }
        const customers = await Customer.find(filter);
        successResponse(res, customers);
    }
    catch (err) {
        errorResponse(res, err.message, 500);
    }
};
export const getCustomerById = async (req, res) => {
    try {
        const { id } = req.params;
        const customer = await Customer.findOne({
            $or: [
                { referenceId: id },
                ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : []),
            ],
        });
        if (!customer) {
            errorResponse(res, 'Customer not found', 404);
            return;
        }
        const [enquiries, visits, bookings] = await Promise.all([
            Enquiry.find({ customer: customer._id }),
            SiteVisit.find({ customer: customer._id }),
            Booking.find({ customer: customer._id }),
        ]);
        successResponse(res, { customer, enquiries, visits, bookings });
    }
    catch (err) {
        errorResponse(res, err.message, 500);
    }
};
const router = Router();
router.get('/', authenticate, requireRole('super-admin', 'admin', 'sales-manager', 'sales-executive'), getCustomers);
router.get('/:id', authenticate, getCustomerById);
export default router;
