import { z } from 'zod';

export const leadFormSchema = z.object({
  buyerName: z
    .string()
    .trim()
    .min(1, 'Buyer name is required / வாடிக்கையாளர் பெயர் தேவை')
    .min(2, 'Name must be at least 2 characters'),
  phone: z
    .string()
    .trim()
    .min(1, 'Phone number is required / தொலைபேசி எண் தேவை')
    .regex(/^[+]?[0-9\s-]{10,15}$/, 'Enter a valid phone number / சரியான தொலைபேசி எண் தேவை'),
  email: z
    .string()
    .trim()
    .email('Please enter a valid email address / சரியான மின்னஞ்சலை உள்ளிடவும்')
    .optional()
    .or(z.literal('')),
  propertyTitle: z.string().trim().optional(),
  propertyId: z.string().optional(),
  stage: z.enum(['new', 'contacted', 'site_visit_scheduled', 'site_visit_completed', 'negotiation', 'booked', 'lost']).default('new'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  source: z.string().default('website'),
  budget: z.coerce.number().positive().optional().or(z.literal(0)),
  notes: z.string().trim().optional(),
});

export type LeadFormData = z.infer<typeof leadFormSchema>;

export const bookingFormSchema = z.object({
  propertyId: z.string().min(1, 'Property is required / சொத்து தேவை'),
  buyerName: z.string().trim().min(1, 'Buyer name is required / வாங்குபவர் பெயர் தேவை'),
  buyerPhone: z.string().trim().min(1, 'Buyer phone is required / தொலைபேசி எண் தேவை'),
  buyerEmail: z.string().trim().email().optional().or(z.literal('')),
  agreedPrice: z.coerce.number().positive('Agreed price must be greater than zero'),
  advanceAmount: z.coerce.number().min(0, 'Advance amount cannot be negative'),
  paymentMethod: z.string().min(1, 'Please select payment method / கட்டண முறையைத் தேர்ந்தெடுக்கவும்'),
  paymentStatus: z.enum(['pending', 'partial', 'paid', 'refunded']).default('partial'),
  bookingDate: z.string().min(1, 'Booking date is required'),
  notes: z.string().trim().optional(),
});

export type BookingFormData = z.infer<typeof bookingFormSchema>;

export const siteVisitFormSchema = z.object({
  leadId: z.string().min(1, 'Lead is required / தொடர்பு தேவை'),
  propertyId: z.string().min(1, 'Property is required / சொத்து தேவை'),
  visitDate: z.string().min(1, 'Visit date is required / தேதி தேவை'),
  timeSlot: z.string().min(1, 'Time slot is required / நேர இடைவெளி தேவை'),
  executiveAssigned: z.string().optional(),
  status: z.enum(['scheduled', 'completed', 'cancelled', 'rescheduled', 'no_show']).default('scheduled'),
  feedback: z.string().trim().optional(),
});

export type SiteVisitFormData = z.infer<typeof siteVisitFormSchema>;

export const staffFormSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters'),
  email: z.string().trim().email('Valid email is required'),
  mobile: z.string().trim().regex(/^[+]?[0-9]{10,14}$/, 'Enter a valid 10-digit mobile number'),
  role: z.enum(['super-admin', 'admin', 'manager', 'sales-executive', 'listing-manager']).default('sales-executive'),
  department: z.string().optional(),
  designation: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type StaffFormData = z.infer<typeof staffFormSchema>;

