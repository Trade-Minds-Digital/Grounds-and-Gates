import { Role, RoleSlug } from '../models/Role.js';
import { Permission } from '../models/Permission.js';

export const seedRolesAndPermissions = async () => {
  console.log('🌱 Seeding Roles & Permissions...');

  const modules = ['properties', 'projects', 'developers', 'leads', 'customers', 'employees', 'bookings', 'site-visits', 'analytics', 'settings'];
  const actions: Array<'view' | 'create' | 'edit' | 'delete' | 'approve' | 'reject' | 'publish' | 'assign' | 'export'> = [
    'view', 'create', 'edit', 'delete', 'approve', 'reject', 'publish', 'assign', 'export',
  ];

  const permissions = [];
  for (const mod of modules) {
    for (const act of actions) {
      permissions.push({
        module: mod,
        action: act,
        description: `Can ${act} ${mod}`,
      });
    }
  }

  const createdPermissions = await Promise.all(
    permissions.map(async (p) => {
      return Permission.findOneAndUpdate(
        { module: p.module, action: p.action },
        p,
        { upsert: true, new: true }
      );
    })
  );

  const allPermIds = createdPermissions.map((p) => p._id);

  const roles: Array<{ name: string; slug: RoleSlug; description: string; permissions: any[] }> = [
    {
      name: 'Super Administrator',
      slug: 'super-admin',
      description: 'Full unconstrained platform control',
      permissions: allPermIds,
    },
    {
      name: 'Administrator',
      slug: 'admin',
      description: 'Platform operations and management',
      permissions: allPermIds,
    },
    {
      name: 'Sales Manager',
      slug: 'sales-manager',
      description: 'Oversees leads, assignments, and bookings',
      permissions: allPermIds,
    },
    {
      name: 'Sales Executive',
      slug: 'sales-executive',
      description: 'Handles client leads, visits, and negotiations',
      permissions: allPermIds,
    },
    {
      name: 'Developer Partner',
      slug: 'developer',
      description: 'Manages developer projects and associated inventory',
      permissions: allPermIds,
    },
    {
      name: 'Real Estate Agent',
      slug: 'agent',
      description: 'Registered property agent with verified listings',
      permissions: allPermIds,
    },
    {
      name: 'Property Owner / Seller',
      slug: 'seller',
      description: 'Lists owned properties and reviews enquiries',
      permissions: allPermIds,
    },
    {
      name: 'Property Buyer',
      slug: 'buyer',
      description: 'Searches properties, saves favorites, books site visits',
      permissions: allPermIds,
    },
  ];

  for (const r of roles) {
    await Role.findOneAndUpdate({ slug: r.slug }, r, { upsert: true });
  }

  console.log('✅ Roles & Permissions seeded.');
};
