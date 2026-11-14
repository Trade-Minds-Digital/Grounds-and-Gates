import { Router } from 'express';
import { Employee } from '../../models/Employee.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import { authenticate } from '../../middleware/auth.middleware.js';
export const getEmployees = async (_req, res) => {
    try {
        const employees = await Employee.find({ isActive: true });
        successResponse(res, employees);
    }
    catch (err) {
        errorResponse(res, err.message, 500);
    }
};
export const getEmployeeById = async (req, res) => {
    try {
        const { id } = req.params;
        const employee = await Employee.findOne({
            $or: [
                { referenceId: id },
                ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : []),
            ],
        });
        if (!employee) {
            errorResponse(res, 'Employee not found', 404);
            return;
        }
        successResponse(res, employee);
    }
    catch (err) {
        errorResponse(res, err.message, 500);
    }
};
const router = Router();
router.get('/', authenticate, getEmployees);
router.get('/:id', authenticate, getEmployeeById);
export default router;
