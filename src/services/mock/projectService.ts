import type { BuilderProject, ProjectObject } from '@/types'
import { mockProjects } from '@/data/mock'

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

let localProjects = [...mockProjects]

export const projectService = {
  async getProjects(): Promise<BuilderProject[]> {
    await delay(180)
    return [...localProjects]
  },

  async getProject(id: string): Promise<BuilderProject | null> {
    await delay(120)
    return localProjects.find((p) => p.id === id) ?? null
  },

  async createProject(data: Partial<BuilderProject>): Promise<BuilderProject> {
    await delay(200)
    const project: BuilderProject = {
      id: crypto.randomUUID(),
      tenant_id: 'tenant-alqia',
      company_id: 'company-sia',
      workspace_id: 'ws-sia',
      scene_id: data.scene_id ?? 'scene-warehouse',
      project_number: `VB-2026-${String(localProjects.length + 1).padStart(3, '0')}`,
      name: data.name ?? 'Nuevo proyecto',
      status: 'draft',
      source: 'internal',
      created_by: 'user-current',
      metadata: { object_count: 0, template: 'industrial_storage' },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...data,
    }
    localProjects = [project, ...localProjects]
    return project
  },

  async updateProject(id: string, updates: Partial<BuilderProject>): Promise<BuilderProject> {
    await delay(150)
    localProjects = localProjects.map((p) =>
      p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p
    )
    return localProjects.find((p) => p.id === id)!
  },

  async saveBuilderState(
    projectId: string,
    objects: ProjectObject[]
  ): Promise<void> {
    await delay(300)
    const key = `vb_project_${projectId}`
    localStorage.setItem(key, JSON.stringify(objects))
    await projectService.updateProject(projectId, {
      status: 'saved',
      metadata: { object_count: objects.length, template: 'industrial_storage' },
    })
  },

  async loadBuilderState(projectId: string): Promise<ProjectObject[]> {
    await delay(100)
    const key = `vb_project_${projectId}`
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as ProjectObject[]) : []
  },
}
