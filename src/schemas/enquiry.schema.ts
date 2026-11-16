import { z } from 'zod';

export const enquiryModalSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, 'Full name is required / உங்கள் பெயர் தேவை')
    .min(2, 'Name must be at least 2 characters'),
  phone: z
    .string()
    .trim()
    .min(1, 'Contact phone number is required / தொலைபேசி எண் தேவை')
    .regex(/^[+]?[0-9\s-]{10,15}$/, 'Enter a valid phone number / சரியான தொலைபேசி எண்ணை உள்ளிடவும்'),
  email: z
    .string()
    .trim()
    .min(1, 'Email address is required / மின்னஞ்சல் தேவை')
    .email('Please enter a valid email / சரியான மின்னஞ்சலை உள்ளிடவும்'),
  visitDate: z
    .string()
    .min(1, 'Preferred visit date is required / பார்வை தேதி தேவை'),
  preferredTimeSlot: z
    .string()
    .min(1, 'Please select a preferred slot / நேர இடைவெளியைத் தேர்ந்தெடுக்கவும்'),
  message: z
    .string()
    .trim()
    .optional(),
});

export type EnquiryModalFormData = z.infer<typeof enquiryModalSchema>;

export const contactPageFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Full name is required / பெயர் தேவை')
    .min(2, 'Name must be at least 2 characters'),
  phone: z
    .string()
    .trim()
    .min(1, 'Contact number is required / தொடர்பு எண் தேவை')
    .regex(/^[+]?[0-9\s-]{10,15}$/, 'Enter a valid phone number / சரியான தொலைபேசி எண்ணை உள்ளிடவும்'),
  email: z
    .string()
    .trim()
    .email('Please enter a valid email address / சரியான மின்னஞ்சலை உள்ளிடவும்')
    .optional()
    .or(z.literal('')),
  district: z
    .string()
    .min(1, 'Please select a district / மாவட்டத்தைத் தேர்ந்தெடுக்கவும்'),
  inquiryType: z
    .string()
    .min(1, 'Please select inquiry type / விசாரணை வகையைத் தேர்ந்தெடுக்கவும்'),
  message: z
    .string()
    .trim()
    .optional(),
});

export type ContactPageFormData = z.infer<typeof contactPageFormSchema>;

