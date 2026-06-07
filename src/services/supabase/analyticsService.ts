import { supabase } from '@/lib/supabase'
import type { AnalyticsEvent } from '@/types'
import type { WorkspaceKPIs } from '@/services/mock/analyticsService'

const TENANT_ID = '00000000-0000-0000-0000-000000000001'
const COMPANY_ID = '00000000-0000-0000-0000-000000000002'
const WORKSPACE_ID = '00000000-0000-0000-0000-000000000003'

// Session ID estable por tab
const SESSION_ID = crypto.randomUUID()

export const analyticsServiceSupabase = {
  async trackEvent(
    event_type: string,
    event_payload: Record<string, unknown> = {},
    project_id?: string
  ): Promise<void> {
    const insert = {
      id: crypto.randomUUID(),
      tenant_id: TENANT_ID,
      company_id: COMPANY_ID,
      workspace_id: WORKSPACE_ID,
      project_id: project_id ?? undefined,
      event_type,
      event_payload,
      session_id: SESSION_ID,
      user_id: undefined,
      created_at: new Date().toISOString(),
    } satisfies Omit<AnalyticsEvent, 'project_id' | 'user_id'> & { project_id?: string; user_id?: string }

    // fire-and-forget — no bloquear UI por analytics
    supabase.from('analytics_events').insert(insert as never).then(({ error }) => {
      if (error) console.warn('[Analytics] trackEvent error:', error.message)
    })
  },

  async getWorkspaceKPIs(): Promise<WorkspaceKPIs> {
    const [projects, quotes, products] = await Promise.all([
      supabase
        .from('builder_projects')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', TENANT_ID)
        .neq('status', 'archived'),
      supabase
        .from('quote_requests')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', TENANT_ID),
      supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', TENANT_ID)
        .eq('status', 'active'),
    ])

    const projectsCreated = projects.count ?? 0
    const quoteRequests = quotes.count ?? 0
    const activeProducts = products.count ?? 0
    const conversionRate =
      projectsCreated > 0 ? Math.round((quoteRequests / projectsCreated) * 100) : 0

    return {
      projectsCreated,
      quoteRequests,
      activeProducts,
      conversionRate,
      avgBuilderTime: 0, // requiere event tracking real acumulado
    }
  },
}
