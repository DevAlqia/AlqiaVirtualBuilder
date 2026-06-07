import { z } from 'zod'

export const quoteRequestSchema = z.object({
  client_name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre es demasiado largo'),
  client_email: z
    .string()
    .email('Ingresa un correo electrónico válido')
    .optional()
    .or(z.literal('')),
  client_phone: z
    .string()
    .min(8, 'El teléfono debe tener al menos 8 dígitos')
    .max(20, 'El teléfono es demasiado largo')
    .optional()
    .or(z.literal('')),
  client_company: z
    .string()
    .max(120, 'El nombre de empresa es demasiado largo')
    .optional()
    .or(z.literal('')),
  message: z
    .string()
    .max(500, 'El mensaje no puede superar 500 caracteres')
    .optional()
    .or(z.literal('')),
  preferred_contact_channel: z
    .enum(['email', 'phone', 'whatsapp', 'in_person'])
    .optional(),
  consent_status: z.boolean().refine((v) => v === true, {
    message: 'Debes aceptar el aviso de privacidad para continuar',
  }),
}).refine(
  (data) => (data.client_email && data.client_email.length > 0) || (data.client_phone && data.client_phone.length > 0),
  {
    message: 'Debes proporcionar al menos un correo electrónico o teléfono',
    path: ['client_email'],
  }
)

export type QuoteRequestFormData = z.infer<typeof quoteRequestSchema>
