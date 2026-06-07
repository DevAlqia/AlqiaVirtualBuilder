import type { Product, ProductCategory, ProductVariant } from '@/types'
import type { VerticalTemplateKey } from '@/types'
import { mockCategories, mockProducts, mockVariants } from '@/data/mock'

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

export const catalogService = {
  async getCategories(verticalKey?: VerticalTemplateKey): Promise<ProductCategory[]> {
    await delay(100)
    if (verticalKey) {
      return mockCategories.filter((c) => c.vertical_key === verticalKey)
    }
    return [...mockCategories]
  },

  async getProducts(categoryId?: string, verticalKey?: VerticalTemplateKey): Promise<Product[]> {
    await delay(150)
    let active = mockProducts.filter((p) => p.status === 'active')
    if (verticalKey) {
      const catIds = mockCategories
        .filter((c) => c.vertical_key === verticalKey)
        .map((c) => c.id)
      active = active.filter((p) => catIds.includes(p.category_id))
    }
    if (categoryId) {
      active = active.filter((p) => p.category_id === categoryId)
    }
    return active
  },

  async getProduct(id: string): Promise<Product | null> {
    await delay(100)
    return mockProducts.find((p) => p.id === id) ?? null
  },

  async getVariants(productId: string): Promise<ProductVariant[]> {
    await delay(100)
    return mockVariants.filter((v) => v.product_id === productId && v.status === 'active')
  },

  async createProduct(data: Partial<Product>): Promise<Product> {
    await delay(200)
    return {
      id: crypto.randomUUID(),
      tenant_id: 'tenant-alqia',
      company_id: 'company-sia',
      workspace_id: 'ws-sia',
      category_id: '',
      name: '',
      sku: '',
      width: 0,
      depth: 0,
      height: 0,
      unit: 'cm',
      is_public: false,
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...data,
    }
  },
}
