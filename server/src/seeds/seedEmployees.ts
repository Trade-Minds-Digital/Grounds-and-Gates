import { Employee } from '../models/Employee.js';
import { INITIAL_DEMO_EMPLOYEES } from './data/employees.js';

export const seedEmployees = async () => {
  console.log('🌱 Seeding Employees...');
  for (const emp of INITIAL_DEMO_EMPLOYEES) {
    await Employee.findOneAndUpdate(
      { referenceId: emp.id },
      {
        referenceId: emp.id,
        name: emp.name,
        role: emp.role,
        phone: emp.phone,
        email: emp.email,
        avatarUrl: emp.avatarUrl,
        activeDealsCount: emp.activeDealsCount,
        performanceRating: emp.performanceRating,
        specializationLocalities: emp.specializationLocalities,
        district: emp.district,
        isActive: true,
      },
      { upsert: true, new: true }
    );
  }
  console.log(`✅ Seeded ${INITIAL_DEMO_EMPLOYEES.length} Employees.`);
};
