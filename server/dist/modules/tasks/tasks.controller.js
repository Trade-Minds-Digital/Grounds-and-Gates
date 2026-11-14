import { Task } from '../../models/Task.js';
import { AuditLog } from '../../models/AuditLog.js';
import { successResponse, errorResponse } from '../../utils/response.js';
export const getTasks = async (req, res) => {
    try {
        const { status, priority, assignedEmployeeId, overdue, entityType } = req.query;
        const filter = {};
        if (status && status !== 'all')
            filter.status = status;
        if (priority && priority !== 'all')
            filter.priority = priority;
        if (entityType && entityType !== 'all')
            filter.entityType = entityType;
        // Sales executives only see their own tasks unless manager/admin
        const userRole = req.user?.role;
        if (userRole === 'sales-executive') {
            filter.$or = [
                { assignedTo: req.user?.userId },
                { assignedEmployeeId: req.user?.userId },
            ];
        }
        else if (assignedEmployeeId && assignedEmployeeId !== 'all') {
            filter.assignedEmployeeId = assignedEmployeeId;
        }
        if (overdue === 'true') {
            filter.status = { $in: ['pending', 'in-progress'] };
            filter.dueDate = { $lt: new Date() };
        }
        const tasks = await Task.find(filter).sort({ dueDate: 1 });
        successResponse(res, tasks, 'Tasks retrieved successfully');
    }
    catch (err) {
        errorResponse(res, err.message, 500);
    }
};
export const createTask = async (req, res) => {
    try {
        const data = req.body;
        if (!data.title || !data.dueDate) {
            errorResponse(res, 'Title and due date are required.', 400);
            return;
        }
        const task = await Task.create({
            referenceId: `task-${Date.now()}`,
            title: data.title,
            description: data.description || '',
            entityType: data.entityType || 'general',
            entityId: data.entityId,
            entityTitle: data.entityTitle,
            assignedTo: data.assignedTo || (req.user?.userId ? req.user.userId : undefined),
            assignedEmployeeId: data.assignedEmployeeId || req.user?.userId || 'staff-01',
            assignedEmployeeName: data.assignedEmployeeName || req.user?.email?.split('@')[0] || 'Staff',
            priority: data.priority || 'medium',
            status: 'pending',
            dueDate: new Date(data.dueDate),
            notes: data.notes || '',
            createdBy: req.user?.userId ? req.user.userId : undefined,
        });
        await AuditLog.create({
            user: req.user?.userId ? req.user.userId : undefined,
            userEmail: req.user?.email,
            action: 'TASK_CREATED',
            module: 'TASKS',
            entityId: task.referenceId,
            changes: { title: task.title, assignedEmployeeName: task.assignedEmployeeName },
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
        });
        successResponse(res, task, 'Task created successfully', 201);
    }
    catch (err) {
        errorResponse(res, err.message, 500);
    }
};
export const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const task = await Task.findOne({
            $or: [
                { referenceId: id },
                ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : []),
            ],
        });
        if (!task) {
            errorResponse(res, 'Task not found', 404);
            return;
        }
        // Sales executives can only update tasks assigned to them
        if (req.user?.role === 'sales-executive' && task.assignedEmployeeId !== req.user.userId && task.assignedTo?.toString() !== req.user.userId) {
            errorResponse(res, 'You can only update your own assigned tasks.', 403);
            return;
        }
        if (updates.status === 'completed' && task.status !== 'completed') {
            updates.completedAt = new Date();
        }
        Object.assign(task, updates);
        await task.save();
        await AuditLog.create({
            user: req.user?.userId ? req.user.userId : undefined,
            userEmail: req.user?.email,
            action: 'TASK_UPDATED',
            module: 'TASKS',
            entityId: task.referenceId,
            changes: updates,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
        });
        successResponse(res, task, 'Task updated successfully');
    }
    catch (err) {
        errorResponse(res, err.message, 500);
    }
};
export const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await Task.findOneAndDelete({
            $or: [
                { referenceId: id },
                ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : []),
            ],
        });
        if (!task) {
            errorResponse(res, 'Task not found', 404);
            return;
        }
        await AuditLog.create({
            user: req.user?.userId ? req.user.userId : undefined,
            userEmail: req.user?.email,
            action: 'TASK_DELETED',
            module: 'TASKS',
            entityId: task.referenceId,
            changes: { title: task.title },
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
        });
        successResponse(res, null, 'Task deleted successfully');
    }
    catch (err) {
        errorResponse(res, err.message, 500);
    }
};
