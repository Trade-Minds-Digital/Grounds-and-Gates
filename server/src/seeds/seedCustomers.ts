import { Customer } from '../models/Customer.js';
import { INITIAL_DEMO_CUSTOMERS } from './data/customers.js';

export const seedCustomers = async () => {
  console.log('🌱 Seeding Customers...');
  for (const cust of INITIAL_DEMO_CUSTOMERS) {
    await Customer.findOneAndUpdate(
      { referenceId: cust.id },
      {
        referenceId: cust.id,
        fullName: cust.fullName,
        phone: cust.phone,
        email: cust.email,
        city: cust.city,
        state: cust.state,
        preferredCategories: cust.preferredCategories,
        budgetRange: cust.budgetRange,
        enquiryIds: cust.enquiryIds,
        bookingIds: cust.bookingIds,
        isActive: true,
        isSample: true,
      },
      { upsert: true, new: true }
    );
  }
  console.log(`✅ Seeded ${INITIAL_DEMO_CUSTOMERS.length} Customers.`);
};
