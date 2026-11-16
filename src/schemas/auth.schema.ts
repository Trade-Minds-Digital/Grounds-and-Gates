import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required / மின்னஞ்சல் தேவை')
    .email('Please enter a valid email address / சரியான மின்னஞ்சலை உள்ளிடவும்'),
  password: z
    .string()
    .min(1, 'Password is required / கடவுச்சொல் தேவை')
    .min(6, 'Password must be at least 6 characters / கடவுச்சொல் குறைந்தபட்சம் 6 எழுத்துகள் இருக்க வேண்டும்'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(1, 'Full name is required / முழுப்பெயர் தேவை')
      .min(2, 'Name must be at least 2 characters / பெயர் குறைந்தபட்சம் 2 எழுத்துகள் இருக்க வேண்டும்'),
    email: z
      .string()
      .trim()
      .min(1, 'Email is required / மின்னஞ்சல் தேவை')
      .email('Please enter a valid email address / சரியான மின்னஞ்சலை உள்ளிடவும்'),
    mobile: z
      .string()
      .trim()
      .min(1, 'Mobile phone number is required / மொபைல் எண் தேவை')
      .regex(/^[+]?[0-9]{10,14}$/, 'Enter a valid 10-14 digit mobile number / சரியான மொபைல் எண்ணை உள்ளிடவும்'),
    accountUsage: z.enum(['buyer', 'seller', 'both']),
    role: z.enum(['buyer', 'seller']),
    district: z.string().optional(),
    city: z.string().optional(),
    locality: z.string().optional(),
    // Conditional Seller Details
    sellerType: z.enum(['owner', 'agent', 'builder', 'developer']).optional(),
    companyName: z.string().optional(),
    reraNumber: z.string().optional(),
    licenseNumber: z.string().optional(),
    preferredContactMethod: z.enum(['email', 'phone', 'whatsapp']).optional(),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters / கடவுச்சொல் குறைந்தபட்சம் 6 எழுத்துகள் இருக்க வேண்டும்'),
    confirmPassword: z
      .string()
      .min(1, 'Please confirm your password / கடவுச்சொல்லை உறுதிப்படுத்தவும்'),
    termsAccepted: z.literal(true, {
      message:
        'You must accept the Terms and Conditions and Privacy Policy / விதிமுறைகள் மற்றும் தனியுரிமைக் கொள்கையை ஏற்க வேண்டும்',
    }),
    marketingConsent: z.boolean(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match / கடவுச்சொற்கள் பொருந்தவில்லை',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required / மின்னஞ்சல் தேவை')
    .email('Please enter a valid email address / சரியான மின்னஞ்சலை உள்ளிடவும்'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(6, 'New password must be at least 6 characters / புதிய கடவுச்சொல் குறைந்தபட்சம் 6 எழுத்துகள் இருக்க வேண்டும்'),
    confirmPassword: z
      .string()
      .min(1, 'Please confirm your new password / புதிய கடவுச்சொல்லை உறுதிப்படுத்தவும்'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match / கடவுச்சொற்கள் பொருந்தவில்லை',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export const profileUpdateSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').optional(),
  mobile: z.string().regex(/^[+]?[0-9]{10,14}$/, 'Valid 10-14 digit mobile number required').optional(),
  address: z
    .object({
      street: z.string().optional(),
      locality: z.string().optional(),
      city: z.string().optional(),
      district: z.string().optional(),
      state: z.string().optional(),
      pincode: z.string().optional(),
    })
    .optional(),
  sellerDetails: z
    .object({
      sellerType: z.enum(['owner', 'agent', 'builder', 'developer']).optional(),
      companyName: z.string().optional(),
      reraNumber: z.string().optional(),
      licenseNumber: z.string().optional(),
      taxId: z.string().optional(),
      operatingAreas: z.array(z.string()).optional(),
      preferredContactMethod: z.enum(['email', 'phone', 'whatsapp']).optional(),
    })
    .optional(),
  marketingConsent: z.boolean().optional(),
});

export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;
