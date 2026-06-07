// ─── Event name constants — always use full strings, never abbreviations ───────

export const BUILDER_EVENTS = {
  PROJECT_CREATED: 'builder.project.created',
  PROJECT_OPENED: 'builder.project.opened',
  PROJECT_SAVED: 'builder.project.saved',
  PROJECT_DUPLICATED: 'builder.project.duplicated',
  PROJECT_DELETED: 'builder.project.deleted',
  PROJECT_EXPORT_REQUESTED: 'builder.project.export_requested',
  PROJECT_EXPORTED: 'builder.project.exported',
  PROJECT_RENAMED: 'builder.project.renamed',
  PROJECT_SAVE_REQUESTED: 'builder.project.save_requested',
  PROJECT_SAVE_FAILED: 'builder.project.save_failed',
  OBJECT_ADDED: 'builder.object.added',
  OBJECT_SELECTED: 'builder.object.selected',
  OBJECT_MOVED: 'builder.object.moved',
  OBJECT_ROTATED: 'builder.object.rotated',
  OBJECT_DUPLICATED: 'builder.object.duplicated',
  OBJECT_DELETED: 'builder.object.deleted',
  OBJECT_COLOR_CHANGED: 'builder.object.color_changed',
  OBJECT_VARIANT_CHANGED: 'builder.object.variant_changed',
  OBJECT_LOCKED: 'builder.object.locked',
  OBJECT_UNLOCKED: 'builder.object.unlocked',
  SCENE_LOADED: 'builder.scene.loaded',
  SCENE_CHANGED: 'builder.scene.changed',
  GRID_TOGGLED: 'builder.grid.toggled',
  SNAP_TOGGLED: 'builder.snap.toggled',
  CAMERA_CHANGED: 'builder.camera.changed',
  UNIT_CHANGED: 'builder.unit.changed',
  HELP_OPENED: 'builder.help.opened',
  RULE_PLACEMENT_BLOCKED: 'builder.rule.placement_blocked',
} as const

export const CATALOG_EVENTS = {
  PRODUCT_CREATED: 'catalog.product.created',
  PRODUCT_UPDATED: 'catalog.product.updated',
  PRODUCT_DISABLED: 'catalog.product.disabled',
  PRODUCT_VARIANT_CREATED: 'catalog.product.variant_created',
  CATEGORY_CREATED: 'catalog.category.created',
  PRODUCT_DETAILS_OPENED: 'catalog.product.details_opened',
} as const

export const ASSET_EVENTS = {
  MODEL_UPLOADED: 'asset.model.uploaded',
  MODEL_PREVIEWED: 'asset.model.previewed',
  MODEL_LINKED_TO_PRODUCT: 'asset.model.linked_to_product',
  MODEL_LOAD_FAILED: 'asset.model.load_failed',
  MODEL_OPTIMIZATION_REQUESTED: 'asset.model.optimization_requested',
} as const

export const QUOTE_EVENTS = {
  REQUEST_OPENED: 'quote.request.opened',
  REQUEST_SUBMITTED: 'quote.request.submitted',
  REQUEST_CREATED: 'quote.request.created',
  REQUEST_SENT_TO_PORTALIA: 'quote.request.sent_to_portalia',
} as const

export const AI_EVENTS = {
  PROJECT_SUMMARY_GENERATED: 'ai.project.summary_generated',
  PRODUCT_SUGGESTION_CREATED: 'ai.product.suggestion_created',
  CONFIGURATION_ISSUE_DETECTED: 'ai.configuration.issue_detected',
  PROPOSAL_TEXT_GENERATED: 'ai.proposal_text_generated',
} as const

export const EMBED_EVENTS = {
  CODE_COPIED: 'embed.code_copied',
  SUBDOMAIN_SETUP_OPENED: 'embed.subdomain_setup_opened',
} as const

// ─── EventBus ──────────────────────────────────────────────────────────────────
type EventCallback = (payload?: Record<string, unknown>) => void

class EventBus {
  private listeners: Map<string, EventCallback[]> = new Map()

  emit(event: string, payload?: Record<string, unknown>): void {
    const callbacks = this.listeners.get(event) ?? []
    callbacks.forEach((cb) => cb(payload))
    if (import.meta.env.DEV) {
      console.debug(`[Event] ${event}`, payload ?? '')
    }
  }

  on(event: string, callback: EventCallback): () => void {
    const existing = this.listeners.get(event) ?? []
    this.listeners.set(event, [...existing, callback])
    return () => {
      const updated = this.listeners.get(event)?.filter((cb) => cb !== callback) ?? []
      this.listeners.set(event, updated)
    }
  }
}

export const eventBus = new EventBus()
