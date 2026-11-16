import { z } from 'zod';

export const masterItemFormSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, 'Stable code is required / நிலையான குறியீடு தேவை')
    .regex(/^[a-z0-9_-]+$/, 'Code must contain only lowercase letters, numbers, hyphens, and underscores'),
  name: z
    .string()
    .trim()
    .min(1, 'English display name is required / ஆங்கிலப் பெயர் தேவை'),
  nameTa: z
    .string()
    .trim()
    .min(1, 'Tamil display name is required / தமிழ்ப் பெயர் தேவை'),
  description: z.string().trim().optional(),
  parentCode: z.string().trim().optional(),
  displayOrder: z.coerce.number().default(0),
  isActive: z.boolean().default(true),
});

export type MasterItemFormData = z.infer<typeof masterItemFormSchema>;

