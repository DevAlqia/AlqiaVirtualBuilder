import { supabase } from '@/lib/supabase'
import type { QuoteRequest } from '@/types'

const TENANT_ID = '00000000-0000-0000-0000-000000000001'
const COMPANY_ID = '00000000-0000-0000-0000-000000000002'

export const quoteRequestServiceSupabase = {
  async getQuoteRequests(): Promise<QuoteRequest[]> {
    const { data, error } = await supabase
      .from('quote_requests')
      .select('*')
      .eq('tenant_id', TENANT_ID)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return (data ?? []) as unknown as QuoteRequest[]
  },

  async createQuoteRequest(quoteData: Partial<QuoteRequest>): Promise<QuoteRequest> {
    const insert = {
      tenant_id: TENANT_ID,
      company_id: COMPANY_ID,
      project_id: quoteData.project_id ?? '',
      client_name: quoteData.client_name ?? '',
      client_email: quoteData.client_email ?? null,
      client_phone: quoteData.client_phone ?? null,
      client_company: quoteData.client_company ?? null,
      message: quoteData.message ?? null,
      preferred_contact_channel: quoteData.preferred_contact_channel ?? null,
      consent_status: quoteData.consent_status ?? false,
      status: 'new' as const,
    }

    const { data, error } = await supabase
      .from('quote_requests')
      .insert(insert as never)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data as unknown as QuoteRequest
  },

  async updateQuoteRequest(id: string, updates: Partial<QuoteRequest>): Promise<QuoteRequest> {
    const { data, error } = await supabase
      .from('quote_requests')
      .update({ ...updates, updated_at: new Date().toISOString() } as never)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data as unknown as QuoteRequest
  },
}
