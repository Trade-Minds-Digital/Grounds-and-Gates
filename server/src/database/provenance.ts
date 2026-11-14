import { Property } from '../models/Property.js';
import { Lead } from '../models/Lead.js';
import { Customer } from '../models/Customer.js';
import { Booking } from '../models/Booking.js';
import { SiteVisit } from '../models/SiteVisit.js';
import { Project } from '../models/Project.js';
import { Developer } from '../models/Developer.js';
import { Notification } from '../models/Notification.js';
import { Activity } from '../models/Activity.js';
import { INITIAL_PROPERTIES } from '../seeds/data/properties.js';

export interface ProvenanceReport {
  properties: { sample: number; live: number; ambiguous: number };
  leads: { sample: number; live: number; ambiguous: number };
  customers: { sample: number; live: number; ambiguous: number };
  bookings: { sample: number; live: number; ambiguous: number };
  siteVisits: { sample: number; live: number; ambiguous: number };
  projects: { sample: number; live: number; ambiguous: number };
  developers: { sample: number; live: number; ambiguous: number };
}

/**
 * Reversibly flags confirmed seeded records with `isSample: true`.
 * Does NOT delete records or modify real user records.
 */
export const markSampleProvenance = async (): Promise<ProvenanceReport> => {
  const seedPropertyIds = INITIAL_PROPERTIES.map((p) => p.id);
  const seedLeadIds = ['lead-1', 'lead-2', 'lead-3', 'lead-4', 'lead-5'];
  const seedCustIds = ['cust-mohan-01', 'cust-priya-02', 'cust-rajesh-03', 'cust-anand-04', 'cust-deepa-05'];
  const seedBookingIds = ['bkg-01', 'bkg-02'];
  const seedVisitIds = ['visit-1', 'visit-2', 'visit-3'];
  const seedProjectIds = [
    'proj-royal-gates-cbe',
    'proj-avinashi-villas-cbe',
    'proj-omr-silicon-chn',
    'proj-pollachi-canopy',
    'proj-nilgiris-tea-estates',
  ];
  const seedDevIds = ['dev-casagrand', 'dev-g-square', 'dev-sobha', 'dev-tvh'];

  // Flag known seed records as sample
  await Promise.all([
    Property.updateMany(
      { $or: [{ referenceId: { $in: seedPropertyIds } }, { referenceId: { $regex: /^(gg-cbe-|gg-chn-|gg-mdu-|gg-oty-|gg-pol-|gg-slm-|gg-tpr-|tp-)/ } }] },
      { $set: { isSample: true } }
    ),
    Lead.updateMany(
      { referenceId: { $in: seedLeadIds } },
      { $set: { isSample: true } }
    ),
    Customer.updateMany(
      { referenceId: { $in: seedCustIds } },
      { $set: { isSample: true } }
    ),
    Booking.updateMany(
      { referenceId: { $in: seedBookingIds } },
      { $set: { isSample: true } }
    ),
    SiteVisit.updateMany(
      { referenceId: { $in: seedVisitIds } },
      { $set: { isSample: true } }
    ),
    Project.updateMany(
      { referenceId: { $in: seedProjectIds } },
      { $set: { isSample: true } }
    ),
    Developer.updateMany(
      { referenceId: { $in: seedDevIds } },
      { $set: { isSample: true } }
    ),
    Notification.updateMany(
      { referenceId: { $in: ['notif-1', 'notif-2', 'notif-3'] } },
      { $set: { isSample: true } }
    ),
    Activity.updateMany(
      { referenceId: { $in: ['act-1', 'act-2', 'act-3', 'act-4'] } },
      { $set: { isSample: true } }
    ),
  ]);

  // Generate audit counts
  const [
    sampleProps, liveProps,
    sampleLeads, liveLeads,
    sampleCusts, liveCusts,
    sampleBkgs, liveBkgs,
    sampleVisits, liveVisits,
    sampleProjs, liveProjs,
    sampleDevs, liveDevs,
  ] = await Promise.all([
    Property.countDocuments({ isSample: true }),
    Property.countDocuments({ isSample: { $ne: true } }),
    Lead.countDocuments({ isSample: true }),
    Lead.countDocuments({ isSample: { $ne: true } }),
    Customer.countDocuments({ isSample: true }),
    Customer.countDocuments({ isSample: { $ne: true } }),
    Booking.countDocuments({ isSample: true }),
    Booking.countDocuments({ isSample: { $ne: true } }),
    SiteVisit.countDocuments({ isSample: true }),
    SiteVisit.countDocuments({ isSample: { $ne: true } }),
    Project.countDocuments({ isSample: true }),
    Project.countDocuments({ isSample: { $ne: true } }),
    Developer.countDocuments({ isSample: true }),
    Developer.countDocuments({ isSample: { $ne: true } }),
  ]);

  return {
    properties: { sample: sampleProps, live: liveProps, ambiguous: 0 },
    leads: { sample: sampleLeads, live: liveLeads, ambiguous: 0 },
    customers: { sample: sampleCusts, live: liveCusts, ambiguous: 0 },
    bookings: { sample: sampleBkgs, live: liveBkgs, ambiguous: 0 },
    siteVisits: { sample: sampleVisits, live: liveVisits, ambiguous: 0 },
    projects: { sample: sampleProjs, live: liveProjs, ambiguous: 0 },
    developers: { sample: sampleDevs, live: liveDevs, ambiguous: 0 },
  };
};

