import { z } from 'zod'

function trimmedRequiredString(min: number, max: number) {
  return z.string().trim().min(min).max(max)
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export function normalizeTunisianPhone(phone?: string | null) {
  if (!phone) {
    return undefined
  }

  const cleaned = phone.replaceAll(/[^\d+]/g, '')

  if (!cleaned) {
    return undefined
  }

  if (cleaned.startsWith('+216')) {
    return `+216${cleaned.slice(4).replaceAll(/\D/g, '')}`
  }

  if (cleaned.startsWith('216') && cleaned.length === 11) {
    return `+${cleaned}`
  }

  return cleaned.replaceAll(/\D/g, '')
}

export function isValidReturnTo(returnTo?: string | null) {
  if (!returnTo) {
    return false
  }

  if (!returnTo.startsWith('/')) {
    return false
  }

  if (returnTo.startsWith('//') || returnTo.startsWith('/admin')) {
    return false
  }

  return true
}

export const passwordSchema = z
  .string()
  .min(8, 'Le mot de passe doit contenir au moins 8 caracteres.')
  .regex(/[A-Za-z]/, 'Le mot de passe doit contenir au moins une lettre.')
  .regex(/\d/, 'Le mot de passe doit contenir au moins un chiffre.')

export const loginSchema = z.object({
  email: z.string().trim().email("Adresse e-mail invalide."),
  password: z.string().min(1, 'Mot de passe requis.'),
  rememberMe: z.boolean().optional(),
  returnTo: z.string().optional()
})

export const registerSchema = z
  .object({
    acceptTerms: z.literal(true),
    email: z.string().trim().email("Adresse e-mail invalide."),
    firstName: trimmedRequiredString(2, 80),
    lastName: trimmedRequiredString(2, 80),
    password: passwordSchema,
    passwordConfirmation: z.string(),
    phone: z.string().optional(),
    returnTo: z.string().optional()
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: 'La confirmation du mot de passe ne correspond pas.',
    path: ['passwordConfirmation']
  })

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Adresse e-mail invalide.")
})

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    passwordConfirmation: z.string(),
    token: z.string().min(12)
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: 'La confirmation du mot de passe ne correspond pas.',
    path: ['passwordConfirmation']
  })

export const profileSchema = z.object({
  email: z.string().trim().email("Adresse e-mail invalide."),
  firstName: trimmedRequiredString(2, 80),
  lastName: trimmedRequiredString(2, 80),
  phone: z.string().optional()
})

export const changePasswordSchema = z
  .object({
    confirmNewPassword: z.string(),
    currentPassword: z.string().min(1, 'Mot de passe actuel requis.'),
    newPassword: passwordSchema
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'La confirmation du mot de passe ne correspond pas.',
    path: ['confirmNewPassword']
  })

export const addressSchema = z.object({
  addressLine1: trimmedRequiredString(4, 160),
  addressLine2: z.string().trim().max(160).optional(),
  city: trimmedRequiredString(2, 80),
  country: z.literal('Tunisia').default('Tunisia'),
  firstName: trimmedRequiredString(2, 80),
  governorate: trimmedRequiredString(2, 80),
  isDefault: z.boolean().default(false),
  label: z.string().trim().max(80).optional(),
  lastName: trimmedRequiredString(2, 80),
  phone: z.string().optional(),
  postalCode: z.string().trim().max(20).optional()
})
