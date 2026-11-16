import { z } from 'zod';

export const postPropertyStep1Schema = z.object({
  title: z
    .string()
    .trim()
    .min(5, 'Title must be at least 5 characters / தலைப்பு குறைந்தபட்சம் 5 எழுத்துகள் இருக்க வேண்டும்')
    .max(120, 'Title cannot exceed 120 characters'),
  titleTa: z.string().trim().optional(),
  category: z.string().min(1, 'Please select property category / சொத்து வகையைத் தேர்ந்தெடுக்கவும்'),
  listingType: z.enum(['buy', 'rent', 'lease']).default('buy'),
  ownershipType: z.enum(['company', 'third-party']).default('third-party'),
  district: z.string().min(1, 'Please select a district / மாவட்டத்தைத் தேர்ந்தெடுக்கவும்'),
  locality: z.string().min(1, 'Please select a locality / பகுதியைத் தேர்ந்தெடுக்கவும்'),
  pincode: z.string().regex(/^[0-9]{6}$/, 'Enter a valid 6-digit PIN code / 6 இலக்க அஞ்சல் குறியீட்டை உள்ளிடவும்'),
  price: z.coerce
    .number()
    .positive('Price must be greater than zero / விலை பூஜ்ஜியத்தை விட அதிகமாக இருக்க வேண்டும்'),
});

export const postPropertyStep2Schema = z.object({
  plotArea: z.coerce
    .number()
    .positive('Plot area must be greater than zero / பரப்பளவு பூஜ்ஜியத்தை விட அதிகமாக இருக்க வேண்டும்'),
  plotAreaUnit: z.string().min(1, 'Please select area unit / பரப்பளவு அலகைத் தேர்ந்தெடுக்கவும்'),
  roadWidth: z.coerce.number().min(0, 'Road width cannot be negative').optional(),
  frontage: z.coerce.number().min(0, 'Frontage cannot be negative').optional(),
  facing: z.string().min(1, 'Please select facing direction / திசையைத் தேர்ந்தெடுக்கவும்'),
  bedrooms: z.coerce.number().min(0).optional(),
  bathrooms: z.coerce.number().min(0).optional(),
});

export const postPropertyStep3Schema = z.object({
  approvalAuthority: z.string().min(1, 'Please select approval authority / ஒப்புதல் ஆணையத்தைத் தேர்ந்தெடுக்கவும்'),
  approvalOrderNumber: z.string().trim().optional(),
  reraNumber: z.string().trim().optional(),
  description: z
    .string()
    .trim()
    .min(10, 'Description must be at least 10 characters / விளக்கம் குறைந்தபட்சம் 10 எழுத்துகள் இருக்க வேண்டும்'),
  descriptionTa: z.string().trim().optional(),
});

export const postPropertyStep4Schema = z.object({
  images: z
    .array(z.string().url('Must be a valid image URL'))
    .min(1, 'At least 1 property photograph is required / குறைந்தபட்சம் ஒரு படம் தேவை'),
  amenities: z.array(z.string()).default([]),
});

export const postPropertyFullSchema = postPropertyStep1Schema
  .merge(postPropertyStep2Schema)
  .merge(postPropertyStep3Schema)
  .merge(postPropertyStep4Schema);

export type PostPropertyFormData = z.infer<typeof postPropertyFullSchema>;

