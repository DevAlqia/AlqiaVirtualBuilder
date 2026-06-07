import { supabase } from '@/lib/supabase'
import type { BuilderProject, ProjectObject } from '@/types'

/** Prefijo de session para tenant actual — se reemplaza con auth real */
const TENANT_ID = '00000000-0000-0000-0000-000000000001'
const COMPANY_ID = '00000000-0000-0000-0000-000000000002'
const WORKSPACE_ID = '00000000-0000-0000-0000-000000000003'
const CREATED_BY = '00000000-0000-0000-0000-000000000099'

export const projectServiceSupabase = {
  async getProjects(): Promise<BuilderProject[]> {
    const { data, error } = await supabase
      .from('builder_projects')
      .select('*')
      .eq('tenant_id', TENANT_ID)
      .neq('status', 'archived')
      .order('updated_at', { ascending: false })

    if (error) throw new Error(error.message)
    return (data ?? []) as unknown as BuilderProject[]
  },

  async getProject(id: string): Promise<BuilderProject | null> {
    const { data, error } = await supabase
      .from('builder_projects')
      .select('*')
      .eq('id', id)
      .single()

    if (error) return null
    return data as unknown as BuilderProject
  },

  async createProject(projectData: Partial<BuilderProject>): Promise<BuilderProject> {
    // Generar número de proyecto único
    const { count } = await supabase
      .from('builder_projects')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', TENANT_ID)
    const num = String((count ?? 0) + 1).padStart(3, '0')

    const insert = {
      tenant_id: TENANT_ID,
      company_id: COMPANY_ID,
      workspace_id: WORKSPACE_ID,
      scene_id: projectData.scene_id ?? 'scene-warehouse',
      project_number: `VB-2026-${num}`,
      name: projectData.name ?? 'Nuevo proyecto',
      status: 'draft' as const,
      source: 'internal',
      created_by: CREATED_BY,
      metadata: (projectData.metadata ?? { object_count: 0 }) as never,
      ...Object.fromEntries(
        Object.entries(projectData).filter(([k]) =>
          ['description', 'client_name', 'client_email', 'client_phone', 'client_company', 'client_city'].includes(k)
        )
      ),
    }

    const { data, error } = await supabase
      .from('builder_projects')
      .insert(insert as never)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data as unknown as BuilderProject
  },

  async updateProject(id: string, updates: Partial<BuilderProject>): Promise<BuilderProject> {
    const { data, error } = await supabase
      .from('builder_projects')
      .update({ ...updates, updated_at: new Date().toISOString() } as never)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data as unknown as BuilderProject
  },

  async saveBuilderState(projectId: string, objects: ProjectObject[]): Promise<void> {
    // Borrar objetos anteriores e insertar los nuevos (upsert de estado completo)
    const { error: delErr } = await supabase
      .from('project_objects')
      .delete()
      .eq('project_id', projectId)

    if (delErr) throw new Error(delErr.message)

    if (objects.length > 0) {
      const rows = objects.map((obj) => ({
        ...obj,
        tenant_id: TENANT_ID,
        project_id: projectId,
        configuration: (obj.configuration ?? {}) as never,
        metadata: (obj.metadata ?? {}) as never,
      }))

      const { error: insErr } = await supabase
        .from('project_objects')
        .insert(rows as never)

      if (insErr) throw new Error(insErr.message)
    }

    await projectServiceSupabase.updateProject(projectId, {
      status: 'saved',
      metadata: { object_count: objects.length } as Record<string, unknown>,
    })
  },

  async loadBuilderState(projectId: string): Promise<ProjectObject[]> {
    const { data, error } = await supabase
      .from('project_objects')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true })

    if (error) throw new Error(error.message)
    return (data ?? []) as unknown as ProjectObject[]
  },
}
