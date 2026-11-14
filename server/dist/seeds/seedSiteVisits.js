import { SiteVisit } from '../models/SiteVisit.js';
import { Customer } from '../models/Customer.js';
import { Property } from '../models/Property.js';
import { Employee } from '../models/Employee.js';
import { Lead } from '../models/Lead.js';
import { INITIAL_DEMO_SITE_VISITS } from './data/siteVisits.js';
export const seedSiteVisits = async () => {
    console.log('🌱 Seeding Site Visits...');
    for (const v of INITIAL_DEMO_SITE_VISITS) {
        const cust = await Customer.findOne({ referenceId: v.customerId });
        const prop = await Property.findOne({ referenceId: v.propertyId });
        const emp = await Employee.findOne({ referenceId: v.assignedEmployeeId });
        const lead = await Lead.findOne({ referenceId: v.leadId });
        await SiteVisit.findOneAndUpdate({ referenceId: v.id }, {
            referenceId: v.id,
            lead: lead ? lead._id : undefined,
            leadId: v.leadId,
            property: prop ? prop._id : undefined,
            propertyId: v.propertyId,
            propertyTitle: v.propertyTitle,
            customer: cust ? cust._id : undefined,
            customerId: v.customerId,
            customerName: v.customerName,
            customerPhone: v.customerPhone,
            assignedEmployee: emp ? emp._id : undefined,
            assignedEmployeeId: v.assignedEmployeeId,
            date: v.date,
            timeSlot: v.timeSlot,
            status: v.status,
            feedback: v.feedback,
            notes: v.notes,
            transportProvided: v.transportProvided ?? false,
        }, { upsert: true, new: true });
    }
    console.log(`✅ Seeded ${INITIAL_DEMO_SITE_VISITS.length} Site Visits.`);
};
