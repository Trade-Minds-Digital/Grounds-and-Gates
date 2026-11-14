import { Lead } from '../models/Lead.js';
import { Customer } from '../models/Customer.js';
import { Property } from '../models/Property.js';
import { Employee } from '../models/Employee.js';
import { INITIAL_DEMO_LEADS } from './data/leads.js';
export const seedLeads = async () => {
    console.log('🌱 Seeding CRM Leads...');
    for (const l of INITIAL_DEMO_LEADS) {
        const cust = await Customer.findOne({ referenceId: l.customerId });
        const prop = await Property.findOne({ referenceId: l.propertyId });
        const emp = await Employee.findOne({ referenceId: l.assignedEmployeeId });
        await Lead.findOneAndUpdate({ referenceId: l.id }, {
            referenceId: l.id,
            customer: cust ? cust._id : undefined,
            customerId: l.customerId,
            buyerName: l.buyerName,
            phone: l.phone,
            email: l.email,
            property: prop ? prop._id : undefined,
            propertyId: l.propertyId,
            propertyTitle: l.propertyTitle,
            stage: l.stage,
            priority: l.priority,
            assignedEmployee: emp ? emp._id : undefined,
            assignedEmployeeId: l.assignedEmployeeId,
            offerAmount: l.offerAmount,
            message: l.message,
            scheduledVisitDate: l.scheduledVisitDate ? new Date(l.scheduledVisitDate) : null,
            dateStr: l.date,
            source: 'property-enquiry',
            isSample: true,
        }, { upsert: true, new: true });
    }
    console.log(`✅ Seeded ${INITIAL_DEMO_LEADS.length} Leads.`);
};
