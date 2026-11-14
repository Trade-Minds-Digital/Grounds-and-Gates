import { Enquiry } from '../../models/Enquiry.js';
import { Property } from '../../models/Property.js';
import { Lead } from '../../models/Lead.js';
import { Customer } from '../../models/Customer.js';
import { SiteVisit } from '../../models/SiteVisit.js';
import { Activity } from '../../models/Activity.js';
import { Notification } from '../../models/Notification.js';
import { Employee } from '../../models/Employee.js';
import { successResponse, errorResponse } from '../../utils/response.js';
export const createEnquiry = async (req, res) => {
    try {
        const { propertyId, fullName, phone, email, message = '', visitDate, preferredTimeSlot = 'morning', } = req.body;
        if (!fullName || !phone || !email || !propertyId) {
            errorResponse(res, 'Full name, phone, email, and propertyId are required.', 400);
            return;
        }
        // Find the property
        const property = await Property.findOne({
            $or: [
                { referenceId: propertyId },
                ...(propertyId.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: propertyId }] : []),
            ],
        });
        const propertyTitle = property ? property.title : 'Property Enquiry';
        const propertyPrice = property ? property.price : 0;
        const propertyLocation = property ? `${property.locality}, ${property.district}` : 'Tamil Nadu';
        // 1. Find or create Customer
        let customer = await Customer.findOne({
            $or: [{ email: email.toLowerCase() }, { phone }],
        });
        if (!customer) {
            customer = await Customer.create({
                referenceId: `cust-${Date.now()}`,
                fullName,
                phone,
                email: email.toLowerCase(),
                city: property ? property.district : 'Coimbatore',
                state: 'Tamil Nadu',
                preferredCategories: property ? [property.category] : [],
                budgetRange: { min: 0, max: propertyPrice || 50000000 },
                enquiryIds: [],
                bookingIds: [],
            });
        }
        // Find first available sales employee to assign
        const employee = await Employee.findOne({ role: 'sales-executive' });
        // 2. Create Lead
        const leadRefId = `lead-${Date.now()}`;
        const lead = await Lead.create({
            referenceId: leadRefId,
            customer: customer._id,
            customerId: customer.referenceId,
            buyerName: fullName,
            phone,
            email: email.toLowerCase(),
            property: property ? property._id : undefined,
            propertyId: property ? property.referenceId : propertyId,
            propertyTitle,
            stage: visitDate ? 'scheduled' : 'new',
            priority: 'high',
            assignedEmployee: employee ? employee._id : undefined,
            assignedEmployeeId: employee ? employee.referenceId : 'emp-senthil-01',
            source: 'property-enquiry',
            message: message || 'Inbound enquiry from Grounds & Gates portal',
            scheduledVisitDate: visitDate ? new Date(visitDate) : null,
            dateStr: 'Just now',
        });
        // 3. Create Site Visit if visitDate provided
        let siteVisit = null;
        if (visitDate) {
            siteVisit = await SiteVisit.create({
                referenceId: `visit-${Date.now()}`,
                lead: lead._id,
                leadId: lead.referenceId,
                property: property ? property._id : undefined,
                propertyId: property ? property.referenceId : propertyId,
                propertyTitle,
                customer: customer._id,
                customerId: customer.referenceId,
                customerName: fullName,
                customerPhone: phone,
                assignedEmployee: employee ? employee._id : undefined,
                assignedEmployeeId: employee ? employee.referenceId : 'emp-senthil-01',
                date: visitDate,
                timeSlot: preferredTimeSlot,
                status: 'scheduled',
                notes: message,
                transportProvided: true,
            });
        }
        // 4. Create Enquiry
        const enquiryRefId = `enq-${Date.now()}`;
        const enquiry = await Enquiry.create({
            referenceId: enquiryRefId,
            property: property ? property._id : undefined,
            propertyId: property ? property.referenceId : propertyId,
            propertyTitle,
            propertyPrice,
            propertyLocation,
            customer: customer._id,
            lead: lead._id,
            fullName,
            phone,
            email: email.toLowerCase(),
            message,
            visitDate,
            preferredTimeSlot,
            status: visitDate ? 'confirmed' : 'pending',
            source: 'website-enquiry',
        });
        // Update customer enquiry IDs
        customer.enquiryIds.push(enquiry.referenceId);
        await customer.save();
        // Increment property enquiriesCount
        if (property) {
            property.enquiriesCount += 1;
            await property.save();
        }
        // 5. Activity Audit Trail
        await Activity.create({
            referenceId: `act-${Date.now()}`,
            entityType: 'lead',
            entityId: lead.referenceId,
            type: visitDate ? 'site-visit' : 'email',
            title: visitDate ? 'Site Visit Booked via Website' : 'New Web Property Enquiry',
            description: `${fullName} requested a walkthrough for ${propertyTitle} on ${visitDate || 'as soon as possible'}.`,
            timestamp: new Date().toISOString(),
            performedBy: fullName,
        });
        // 6. Notification
        await Notification.create({
            referenceId: `notif-${Date.now()}`,
            title: visitDate ? 'New Walkthrough Booked' : 'New Property Lead',
            message: `${fullName} submitted an enquiry on ${propertyTitle}`,
            type: visitDate ? 'visit' : 'lead',
            read: false,
            timestamp: new Date().toISOString(),
            actionView: 'seller-dashboard',
        });
        successResponse(res, {
            enquiry,
            leadId: lead.referenceId,
            visitId: siteVisit ? siteVisit.referenceId : null,
        }, 'Enquiry submitted and site visit scheduled successfully', 201);
    }
    catch (err) {
        errorResponse(res, err.message, 500);
    }
};
export const getMyEnquiries = async (req, res) => {
    try {
        const userEmail = req.user?.email;
        const filter = {};
        if (userEmail) {
            filter.email = userEmail.toLowerCase();
        }
        const enquiries = await Enquiry.find(filter).sort({ createdAt: -1 });
        successResponse(res, enquiries);
    }
    catch (err) {
        errorResponse(res, err.message, 500);
    }
};
export const getAllEnquiries = async (_req, res) => {
    try {
        const enquiries = await Enquiry.find().sort({ createdAt: -1 }).populate('property');
        successResponse(res, enquiries);
    }
    catch (err) {
        errorResponse(res, err.message, 500);
    }
};
export const updateEnquiryStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const enquiry = await Enquiry.findOneAndUpdate({
            $or: [
                { referenceId: id },
                ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : []),
            ],
        }, { status }, { new: true });
        if (!enquiry) {
            errorResponse(res, 'Enquiry not found', 404);
            return;
        }
        successResponse(res, enquiry, 'Enquiry status updated');
    }
    catch (err) {
        errorResponse(res, err.message, 500);
    }
};
