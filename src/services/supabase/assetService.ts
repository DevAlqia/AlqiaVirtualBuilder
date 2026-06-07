import { supabase } from '@/lib/supabase'
import type { Asset3D } from '@/types'

const TENANT_ID = '00000000-0000-0000-0000-000000000001'
const COMPANY_ID = '00000000-0000-0000-0000-000000000002'
const CREATED_BY = '00000000-0000-0000-0000-000000000099'

export const assetServiceSupabase = {
  async getAssets(): Promise<Asset3D[]> {
    const { data, error } = await supabase
      .from('assets_3d')
      .select('*')
      .eq('tenant_id', TENANT_ID)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return (data ?? []) as unknown as Asset3D[]
  },

  async getAsset(id: string): Promise<Asset3D | null> {
    const { data, error } = await supabase
      .from('assets_3d')
      .select('*')
      .eq('id', id)
      .single()

    if (error) return null
    return data as unknown as Asset3D
  },

  async uploadAsset(file: File, meta: { name: string; asset_type: Asset3D['asset_type'] }): Promise<Asset3D> {
    const path = `${TENANT_ID}/models/${Date.now()}_${file.name}`

    const { error: uploadError } = await supabase.storage
      .from('assets-3d')
      .upload(path, file, { cacheControl: '3600', upsert: false })

    if (uploadError) throw new Error(uploadError.message)

    const { data: urlData } = supabase.storage.from('assets-3d').getPublicUrl(path)

    const insert = {
      tenant_id: TENANT_ID,
      company_id: COMPANY_ID,
      name: meta.name,
      asset_type: meta.asset_type,
      file_url: urlData.publicUrl,
      file_format: file.name.split('.').pop() as Asset3D['file_format'] ?? 'glb',
      file_size: file.size,
      dimensions: { width: 0, depth: 0, height: 0 } as never,
      status: 'uploaded' as const,
      created_by: CREATED_BY,
    }

    const { data, error } = await supabase
      .from('assets_3d')
      .insert(insert as never)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data as unknown as Asset3D
  },
}
