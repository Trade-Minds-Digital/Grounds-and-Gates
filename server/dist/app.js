import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'node:path';
import { config } from './config/index.js';
import { errorHandler } from './middleware/error.middleware.js';
import authRoutes from './modules/auth/auth.routes.js';
import propertyRoutes from './modules/properties/properties.routes.js';
import projectRoutes from './modules/projects/projects.routes.js';
import developerRoutes from './modules/developers/developers.routes.js';
import employeeRoutes from './modules/employees/employees.routes.js';
import customerRoutes from './modules/customers/customers.routes.js';
import leadRoutes from './modules/leads/leads.routes.js';
import enquiryRoutes from './modules/enquiries/enquiries.routes.js';
import siteVisitRoutes from './modules/site-visits/siteVisits.routes.js';
import bookingRoutes from './modules/bookings/bookings.routes.js';
import notificationRoutes from './modules/notifications/notifications.routes.js';
import favoriteRoutes from './modules/favorites/favorites.routes.js';
import comparisonRoutes from './modules/comparisons/comparisons.routes.js';
import analyticsRoutes from './modules/analytics/analytics.routes.js';
import uploadRoutes from './modules/upload/upload.routes.js';
import taskRoutes from './modules/tasks/tasks.routes.js';
import auditLogRoutes from './modules/audit-logs/auditLogs.routes.js';
import settingsRoutes from './modules/settings/settings.routes.js';
import reportsRoutes from './modules/reports/reports.routes.js';
export const createApp = () => {
    const app = express();
    // Security Middleware
    app.use(helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
    }));
    // CORS Configuration
    app.use(cors({
        origin: [config.clientUrl, 'http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000'],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    }));
    // Parsers & Logging
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    app.use(cookieParser(config.cookieSecret));
    if (config.env !== 'test') {
        app.use(morgan('dev'));
    }
    // Static uploads directory: Public images only (private documents are protected by staff authentication)
    app.use('/uploads/images', express.static(path.join(config.uploadDir, 'images')));
    // Health check endpoint
    app.get('/health', (_req, res) => {
        res.status(200).json({
            status: 'UP',
            timestamp: new Date().toISOString(),
            service: 'Grounds & Gates API',
            version: '1.0.0',
        });
    });
    // REST API v1 Routes
    const apiV1 = express.Router();
    apiV1.use('/auth', authRoutes);
    apiV1.use('/properties', propertyRoutes);
    apiV1.use('/projects', projectRoutes);
    apiV1.use('/developers', developerRoutes);
    apiV1.use('/employees', employeeRoutes);
    apiV1.use('/customers', customerRoutes);
    apiV1.use('/leads', leadRoutes);
    apiV1.use('/enquiries', enquiryRoutes);
    apiV1.use('/site-visits', siteVisitRoutes);
    apiV1.use('/bookings', bookingRoutes);
    apiV1.use('/notifications', notificationRoutes);
    apiV1.use('/favorites', favoriteRoutes);
    apiV1.use('/comparisons', comparisonRoutes);
    apiV1.use('/analytics', analyticsRoutes);
    apiV1.use('/upload', uploadRoutes);
    apiV1.use('/tasks', taskRoutes);
    apiV1.use('/audit-logs', auditLogRoutes);
    apiV1.use('/settings', settingsRoutes);
    apiV1.use('/reports', reportsRoutes);
    app.use('/api/v1', apiV1);
    // Legacy /api fallback prefix support
    app.use('/api', apiV1);
    // Centralized Error Handling
    app.use(errorHandler);
    return app;
};
export default createApp;
