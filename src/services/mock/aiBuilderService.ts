// Stub — activar en Fase 4 con integración real de LLM
function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

export const aiBuilderService = {
  async generateProjectSummary(projectId: string): Promise<string> {
    await delay(600)
    const summaries: Record<string, string> = {
      'proj-001':
        'El cliente configuró un espacio tipo almacén con 6 gabinetes industriales y 2 anaqueles. La intención parece orientada a organizar refacciones y herramientas en una planta de manufactura. Se recomienda validar medidas del área y sugerir solución complementaria de estaciones de trabajo.',
      'proj-002':
        'Configuración de taller de mantenimiento con 3 estaciones de trabajo y 2 gabinetes. El cliente necesita optimizar el espacio de herramientas y refacciones. Se sugiere agregar anaqueles para materiales de mayor volumen.',
    }
    return summaries[projectId] ?? 'Proyecto en configuración inicial. Se recomienda agregar más productos para generar un resumen comercial completo.'
  },

  async getProductSuggestions(
    _projectId: string
  ): Promise<Array<{ product_id: string; reason: string }>> {
    await delay(400)
    return [
      {
        product_id: 'prod-est-001',
        reason: 'Complementa la configuración de almacenamiento con área de trabajo integrada',
      },
    ]
  },
}
