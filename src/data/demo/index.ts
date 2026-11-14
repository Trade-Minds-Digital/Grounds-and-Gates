import { INITIAL_PROPERTIES } from '../properties';
import { INITIAL_DEMO_DEVELOPERS } from './developers';
import { INITIAL_DEMO_PROJECTS } from './projects';
import { INITIAL_DEMO_EMPLOYEES } from './employees';
import { INITIAL_DEMO_CUSTOMERS } from './customers';
import { INITIAL_DEMO_LEADS } from './leads';
import { INITIAL_DEMO_SITE_VISITS } from './siteVisits';
import { INITIAL_DEMO_BOOKINGS } from './bookings';
import { INITIAL_DEMO_ACTIVITIES } from './activities';
import { INITIAL_DEMO_NOTIFICATIONS } from './notifications';
import { DemoStateData } from '../../types/demo';
import { Property } from '../../types/property';

export * from './developers';
export * from './projects';
export * from './employees';
export * from './customers';
export * from './leads';
export * from './siteVisits';
export * from './bookings';
export * from './activities';
export * from './notifications';

// Enrich properties with project links where applicable
export const INITIAL_SEEDED_PROPERTIES: Property[] = INITIAL_PROPERTIES.map(p => {
  if (p.id === 'gg-cbe-plot-01') return { ...p, projectId: 'proj-royal-gates-cbe' };
  if (p.id === 'gg-cbe-villa-01') return { ...p, projectId: 'proj-avinashi-villas-cbe' };
  if (p.id === 'gg-chn-apt-01') return { ...p, projectId: 'proj-omr-silicon-chn' };
  if (p.id === 'gg-pol-agri-01') return { ...p, projectId: 'proj-pollachi-canopy' };
  if (p.id === 'gg-oty-villa-03') return { ...p, projectId: 'proj-nilgiris-tea-estates' };
  return p;
});

export const INITIAL_DEMO_STATE: DemoStateData = {
  version: 1,
  lastUpdated: new Date().toISOString(),
  properties: INITIAL_SEEDED_PROPERTIES,
  developers: INITIAL_DEMO_DEVELOPERS,
  projects: INITIAL_DEMO_PROJECTS,
  employees: INITIAL_DEMO_EMPLOYEES,
  customers: INITIAL_DEMO_CUSTOMERS,
  leads: INITIAL_DEMO_LEADS,
  siteVisits: INITIAL_DEMO_SITE_VISITS,
  bookings: INITIAL_DEMO_BOOKINGS,
  activities: INITIAL_DEMO_ACTIVITIES,
  notifications: INITIAL_DEMO_NOTIFICATIONS,
  savedPropertyIds: ['gg-cbe-plot-01', 'gg-cbe-villa-01'],
  comparedPropertyIds: ['gg-cbe-plot-01', 'tp-cbe-plot-02']
};
