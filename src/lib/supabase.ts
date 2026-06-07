import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || supabaseUrl.includes('TU_PROJECT_ID')) {
  console.warn('[Alqia] VITE_SUPABASE_URL no configurado — usando datos mock')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      'x-app-name': import.meta.env.VITE_APP_NAME ?? 'alqia-virtual-builder',
      'x-app-version': import.meta.env.VITE_APP_VERSION ?? '0.1.0',
    },
  },
})

/**
 * true  → usa datos mock (VITE_USE_MOCK_DATA=true o URL no configurada)
 * false → usa Supabase real
 */
export const USE_MOCK =
  import.meta.env.VITE_USE_MOCK_DATA === 'true' ||
  !supabaseUrl ||
  supabaseUrl.includes('TU_PROJECT_ID')
