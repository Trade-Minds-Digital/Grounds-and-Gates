import { Property } from '../../models/Property.js';
import { Lead } from '../../models/Lead.js';
import { Booking } from '../../models/Booking.js';
import { SiteVisit } from '../../models/SiteVisit.js';
import { Activity } from '../../models/Activity.js';
import { successResponse, errorResponse } from '../../utils/response.js';
export const getDashboardAnalytics = async (_req, res) => {
    try {
        const [totalProperties, activeProperties, underNegotiationProperties, soldProperties, totalLeads, leadsByStage, bookingsStats, totalVisits, upcomingVisits, districtDistribution, categoryDistribution, recentActivities,] = await Promise.all([
            Property.countDocuments(),
            Property.countDocuments({ status: 'active' }),
            Property.countDocuments({ status: 'under-negotiation' }),
            Property.countDocuments({ status: 'sold' }),
            Lead.countDocuments(),
            Lead.aggregate([
                { $group: { _id: '$stage', count: { $sum: 1 }, totalOffer: { $sum: '$offerAmount' } } },
            ]),
            Booking.aggregate([
                {
                    $group: {
                        _id: null,
                        count: { $sum: 1 },
                        totalToken: { $sum: '$tokenAmount' },
                        totalValue: { $sum: '$totalAmount' },
                    },
                },
            ]),
            SiteVisit.countDocuments(),
            SiteVisit.countDocuments({ status: 'scheduled' }),
            Property.aggregate([
                { $group: { _id: '$district', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 6 },
            ]),
            Property.aggregate([
                { $group: { _id: '$category', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
            ]),
            Activity.find().sort({ createdAt: -1 }).limit(10),
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
