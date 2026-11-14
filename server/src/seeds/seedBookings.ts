import { Booking } from '../models/Booking.js';
import { Customer } from '../models/Customer.js';
import { Property } from '../models/Property.js';
import { Employee } from '../models/Employee.js';
import { Lead } from '../models/Lead.js';
import { INITIAL_DEMO_BOOKINGS } from './data/bookings.js';

export const seedBookings = async () => {
  console.log('🌱 Seeding Bookings...');
  for (const b of INITIAL_DEMO_BOOKINGS) {
    const cust = await Customer.findOne({ referenceId: b.customerId });
    const prop = await Property.findOne({ referenceId: b.propertyId });
    const emp = await Employee.findOne({ referenceId: b.assignedEmployeeId });
    const lead = await Lead.findOne({ referenceId: b.leadId });

    await Booking.findOneAndUpdate(
      { referenceId: b.id },
      {
        referenceId: b.id,
        bookingNumber: b.bookingNumber,
        property: prop ? prop._id : undefined,
        propertyId: b.propertyId,
        propertyTitle: b.propertyTitle,
        customer: cust ? cust._id : undefined,
        customerId: b.customerId,
        customerName: b.customerName,
        lead: lead ? lead._id : undefined,
        leadId: b.leadId,
        assignedEmployee: emp ? emp._id : undefined,
        assignedEmployeeId: b.assignedEmployeeId,
        tokenAmount: b.tokenAmount,
        totalAmount: b.totalAmount,
        bookingDate: b.bookingDate,
        registrationTargetDate: b.registrationTargetDate,
        status: b.status,
        paymentMethod: b.paymentMethod,
        paymentStatus: 'partially-paid',
        notes: b.notes,
        isSample: true,
      },
      { upsert: true, new: true }
    );
  }
  console.log(`✅ Seeded ${INITIAL_DEMO_BOOKINGS.length} Bookings.`);
};
