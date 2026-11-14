import { Property } from '../../models/Property.js';
import { Lead } from '../../models/Lead.js';
import { Booking } from '../../models/Booking.js';
import { SiteVisit } from '../../models/SiteVisit.js';
import { Activity } from '../../models/Activity.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import { markSampleProvenance } from '../../database/provenance.js';
export const getDashboardAnalytics = async (req, res) => {
    try {
        const { includeSample, dateRange } = req.query;
        const sampleFilter = includeSample === 'true' ? {} : { isSample: { $ne: true } };
        let dateFilter = {};
        const now = new Date();
        if (dateRange === 'today') {
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            dateFilter = { createdAt: { $gte: todayStart } };
        }
        else if (dateRange === '7days') {
            const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            dateFilter = { createdAt: { $gte: sevenDaysAgo } };
        }
        else if (dateRange === '30days') {
            const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            dateFilter = { createdAt: { $gte: thirtyDaysAgo } };
        }
        else if (dateRange === 'year') {
            const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            dateFilter = { createdAt: { $gte: oneYearAgo } };
        }
        const propFilter = { ...sampleFilter };
        const leadFilter = { ...sampleFilter, ...dateFilter };
        const bkgFilter = { ...sampleFilter, ...dateFilter };
        const visitFilter = { ...sampleFilter, ...dateFilter };
        const [totalProperties, activeProperties, underNegotiationProperties, soldProperties, totalLeads, leadsByStage, bookingsStats, totalVisits, upcomingVisits, districtDistribution, categoryDistribution, recentActivities,] = await Promise.all([
            Property.countDocuments(propFilter),
            Property.countDocuments({ ...propFilter, status: 'active' }),
            Property.countDocuments({ ...propFilter, status: 'under-negotiation' }),
            Property.countDocuments({ ...propFilter, status: 'sold' }),
            Lead.countDocuments(leadFilter),
            Lead.aggregate([
                { $match: leadFilter },
                { $group: { _id: '$stage', count: { $sum: 1 }, totalOffer: { $sum: '$offerAmount' } } },
            ]),
            Booking.aggregate([
                { $match: bkgFilter },
                {
                    $group: {
                        _id: null,
                        count: { $sum: 1 },
                        totalToken: { $sum: '$tokenAmount' },
                        totalValue: { $sum: '$totalAmount' },
                    },
                },
            ]),
            SiteVisit.countDocuments(visitFilter),
            SiteVisit.countDocuments({ ...visitFilter, status: 'scheduled' }),
            Property.aggregate([
                { $match: propFilter },
                { $group: { _id: '$district', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 6 },
            ]),
            Property.aggregate([
                { $match: propFilter },
                { $group: { _id: '$category', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
            ]),
            Activity.find(sampleFilter).sort({ createdAt: -1 }).limit(10),
        ]);
        const stageMap = {
            new: 0,
            contacted: 0,
            scheduled: 0,
            negotiation: 0,
            won: 0,
            lost: 0,
        };
        leadsByStage.forEach((item) => {
            if (item._id)
                stageMap[item._id] = item.count;
        });
        const bStats = bookingsStats[0] || { count: 0, totalToken: 0, totalValue: 0 };
        successResponse(res, {
            properties: {
                total: totalProperties,
                active: activeProperties,
                underNegotiation: underNegotiationProperties,
                sold: soldProperties,
            },
            leads: {
                total: totalLeads,
                byStage: stageMap,
            },
            bookings: {
                total: bStats.count,
                totalToken: bStats.totalToken,
                totalValue: bStats.totalValue,
            },
            siteVisits: {
                total: totalVisits,
                upcoming: upcomingVisits,
            },
            districtDistribution: districtDistribution.map((d) => ({
                district: d._id,
                count: d.count,
            })),
            categoryDistribution: categoryDistribution.map((c) => ({
                category: c._id,
                count: c.count,
            })),
            recentActivities,
        });
    }
    catch (err) {
        errorResponse(res, err.message, 500);
    }
};
export const getProvenanceReportEndpoint = async (_req, res) => {
    try {
        const report = await markSampleProvenance();
        successResponse(res, report, 'Provenance audit completed successfully.');
    }
    catch (err) {
        errorResponse(res, err.message, 500);
    }
};
