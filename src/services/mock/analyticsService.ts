function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

export interface WorkspaceKPIs {
  projectsCreated: number
  quoteRequests: number
  activeProducts: number
  conversionRate: number
  avgBuilderTime: number
}

export const analyticsService = {
  async getWorkspaceKPIs(): Promise<WorkspaceKPIs> {
    await delay(200)
    return {
      projectsCreated: 3,
      quoteRequests: 2,
      activeProducts: 10,
      conversionRate: 66,
      avgBuilderTime: 8.4,
    }
  },
}
