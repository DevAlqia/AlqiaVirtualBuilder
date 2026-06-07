/**
 * Barrel de servicios — switch automático mock ↔ Supabase.
 *
 * VITE_USE_MOCK_DATA=true  → mock (datos locales, sin red)
 * VITE_USE_MOCK_DATA=false → Supabase (base de datos real)
 *
 * Los componentes siempre importan desde '@/services' y nunca
 * necesitan saber si están usando mock o producción.
 */

import { USE_MOCK } from '@/lib/supabase'
import type { VerticalTemplateKey } from '@/types'

// ── Mock services ─────────────────────────────────────────────────────────────
import { catalogService as catalogMock } from './mock/catalogService'
import { projectService as projectMock } from './mock/projectService'
import { quoteRequestService as quoteMock } from './mock/quoteRequestService'
import { analyticsService as analyticsMock } from './mock/analyticsService'
import { assetService as assetMock } from './mock/assetService'

// ── Supabase services ─────────────────────────────────────────────────────────
import { catalogServiceSupabase } from './supabase/catalogService'
import { projectServiceSupabase } from './supabase/projectService'
import { quoteRequestServiceSupabase } from './supabase/quoteRequestService'
import { analyticsServiceSupabase } from './supabase/analyticsService'
import { assetServiceSupabase } from './supabase/assetService'

// ── Catalog service hibrido ───────────────────────────────────────────────────
// Cuando Supabase esta activo pero una vertical no tiene datos en la BD,
// hace fallback transparente al catalogo mock para esa vertical.
// Esto permite agregar nuevas verticales en mock sin necesitar migracion.
const catalogServiceHybrid: typeof catalogMock = {
  ...catalogServiceSupabase,
  async getCategories(verticalKey?: VerticalTemplateKey) {
    try {
      const remote = await catalogServiceSupabase.getCategories(verticalKey)
      if (remote.length === 0 && verticalKey) {
        return catalogMock.getCategories(verticalKey)
      }
      return remote
    } catch {
      if (verticalKey) return catalogMock.getCategories(verticalKey)
      return catalogMock.getCategories()
    }
  },
  async getProducts(categoryId?: string, verticalKey?: VerticalTemplateKey) {
    try {
      // Si hay filtro de categoria, intentar Supabase primero
      if (categoryId) {
        const remote = await catalogServiceSupabase.getProducts(categoryId, verticalKey)
        if (remote.length > 0) return remote
        return catalogMock.getProducts(categoryId, verticalKey)
      }
      // Sin categoria: si Supabase no tiene la vertical, usar mock completo
      const remoteCats = await catalogServiceSupabase.getCategories(verticalKey)
      if (remoteCats.length === 0 && verticalKey) {
        return catalogMock.getProducts(undefined, verticalKey)
      }
      return catalogServiceSupabase.getProducts(undefined, verticalKey)
    } catch {
      return catalogMock.getProducts(categoryId, verticalKey)
    }
  },
  async getProduct(id: string) {
    return catalogServiceSupabase.getProduct(id)
  },
  async getVariants(productId: string) {
    return catalogServiceSupabase.getVariants(productId)
  },
  async createProduct(data) {
    return catalogServiceSupabase.createProduct(data)
  },
}

// ── Exports unificados ────────────────────────────────────────────────────────
export const catalogService = USE_MOCK ? catalogMock : catalogServiceHybrid
export const projectService = USE_MOCK ? projectMock : projectServiceSupabase
export const quoteRequestService = USE_MOCK ? quoteMock : quoteRequestServiceSupabase
export const analyticsService = USE_MOCK ? analyticsMock : analyticsServiceSupabase
export const assetService = USE_MOCK ? assetMock : assetServiceSupabase

// ── AI builder service (stub — Fase 4) ───────────────────────────────────────
export { aiBuilderService } from './mock/aiBuilderService'

// ── Share service (siempre mock en MVP — localStorage) ────────────────────────
export { shareProjectService } from './mock/shareProjectService'

export { USE_MOCK }
export type { WorkspaceKPIs } from './mock/analyticsService'
