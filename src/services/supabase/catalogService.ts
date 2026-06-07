import { supabase } from '@/lib/supabase'
import type { Product, ProductCategory, ProductVariant, VerticalTemplateKey } from '@/types'

const TENANT_ID = '00000000-0000-0000-0000-000000000001'

export const catalogServiceSupabase = {
  async getCategories(verticalKey?: VerticalTemplateKey): Promise<ProductCategory[]> {
    let query = supabase
      .from('product_categories')
      .select('*')
      .eq('tenant_id', TENANT_ID)
      .eq('status', 'active')
      .order('order', { ascending: true })

    if (verticalKey) {
      query = query.eq('vertical_key', verticalKey)
    }

    const { data, error } = await query
    if (error) throw new Error(error.message)
    return (data ?? []) as unknown as ProductCategory[]
  },

  async getProducts(categoryId?: string, verticalKey?: VerticalTemplateKey): Promise<Product[]> {
    let query = supabase
      .from('products')
      .select('*')
      .eq('tenant_id', TENANT_ID)
      .eq('status', 'active')
      .order('name', { ascending: true })

    if (verticalKey && !categoryId) {
      // Join via category para filtrar por vertical
      const { data: cats } = await supabase
        .from('product_categories')
        .select('id')
        .eq('vertical_key', verticalKey)
        .eq('status', 'active')
      const catIds = (cats ?? []).map((c) => (c as { id: string }).id)
      if (catIds.length > 0) {
        query = query.in('category_id', catIds)
      } else {
        // Vertical no existe en Supabase — devolver vacio para que el caller
        // pueda hacer fallback a mock en lugar de devolver todos los productos
        return []
      }
    }

    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }

    const { data, error } = await query
    if (error) throw new Error(error.message)
    return (data ?? []) as unknown as Product[]
  },

  async getProduct(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    if (error) return null
    return data as unknown as Product
  },

  async getVariants(productId: string): Promise<ProductVariant[]> {
    const { data, error } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', productId)
      .eq('status', 'active')

    if (error) throw new Error(error.message)
    return (data ?? []) as unknown as ProductVariant[]
  },

  async createProduct(productData: Partial<Product>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert({
        ...productData,
        status: 'draft',
        is_public: false,
        is_scene_prop: productData.is_scene_prop ?? false,
        is_quotable: productData.is_quotable ?? true,
      } as never)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data as unknown as Product
  },
}
