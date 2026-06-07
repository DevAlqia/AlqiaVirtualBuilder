import type { QuoteRequest } from '@/types'
import { mockQuoteRequests } from '@/data/mock'

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

let localQuotes = [...mockQuoteRequests]

export const quoteRequestService = {
  async getQuoteRequests(): Promise<QuoteRequest[]> {
    await delay(150)
    return [...localQuotes]
  },

  async createQuoteRequest(data: Partial<QuoteRequest>): Promise<QuoteRequest> {
    await delay(300)
    const quote: QuoteRequest = {
      id: crypto.randomUUID(),
      tenant_id: 'tenant-alqia',
      company_id: 'company-sia',
      project_id: '',
      client_name: '',
      consent_status: false,
      status: 'new',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...data,
    }
    localQuotes = [quote, ...localQuotes]
    return quote
  },

  async updateQuoteRequest(id: string, updates: Partial<QuoteRequest>): Promise<QuoteRequest> {
    await delay(150)
    localQuotes = localQuotes.map((q) =>
      q.id === id ? { ...q, ...updates, updated_at: new Date().toISOString() } : q
    )
    return localQuotes.find((q) => q.id === id)!
  },
}
