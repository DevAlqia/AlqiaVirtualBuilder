import type { Asset3D } from '@/types'
import { mockAssets } from '@/data/mock'

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

export const assetService = {
  async getAssets(): Promise<Asset3D[]> {
    await delay(150)
    return [...mockAssets]
  },

  async getAsset(id: string): Promise<Asset3D | null> {
    await delay(100)
    return mockAssets.find((a) => a.id === id) ?? null
  },

  async uploadAsset(_file: File, name: string): Promise<Asset3D> {
    await delay(800)
    return {
      id: crypto.randomUUID(),
      tenant_id: 'tenant-alqia',
      company_id: 'company-sia',
      name,
      asset_type: 'model',
      file_url: `/assets/3d/${name.toLowerCase().replace(/\s+/g, '-')}.glb`,
      file_format: 'glb',
      file_size: 0,
      dimensions: { width: 0, depth: 0, height: 0 },
      status: 'uploaded',
      created_by: 'user-current',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  },
}
