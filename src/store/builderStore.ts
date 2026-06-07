import { create } from 'zustand'
import { eventBus, BUILDER_EVENTS } from '@/utils/events'
import type { BuilderProject, ProjectObject, Scene } from '@/types'

const UNDO_LIMIT = 40

interface BuilderState {
  currentProject: BuilderProject | null
  projectObjects: ProjectObject[]
  selectedObjectId: string | null
  sceneConfig: Scene | null
  isDirty: boolean
  isSaving: boolean
  gridEnabled: boolean
  snapEnabled: boolean
  cameraMode: 'perspective' | 'top'
  activeTool: 'select' | 'move' | 'rotate' | null
  // Undo/redo
  history: ProjectObject[][]
  historyIndex: number
}

interface BuilderActions {
  setCurrentProject: (project: BuilderProject | null) => void
  setProjectObjects: (objects: ProjectObject[]) => void
  setSelectedObjectId: (id: string | null) => void
  setSceneConfig: (scene: Scene | null) => void
  updateSceneConfig: (updates: Partial<Scene>) => void
  setIsDirty: (dirty: boolean) => void
  setIsSaving: (saving: boolean) => void
  toggleGrid: () => void
  toggleSnap: () => void
  setCameraMode: (mode: 'perspective' | 'top') => void
  setActiveTool: (tool: 'select' | 'move' | 'rotate' | null) => void
  addObject: (object: ProjectObject) => void
  updateObject: (id: string, updates: Partial<ProjectObject>) => void
  removeObject: (id: string) => void
  duplicateObject: (id: string) => void
  rotateObjectBy: (id: string, deltaDeg: number) => void
  clearSelection: () => void
  undo: () => void
  redo: () => void
  reset: () => void
}

const initialState: BuilderState = {
  currentProject: null,
  projectObjects: [],
  selectedObjectId: null,
  sceneConfig: null,
  isDirty: false,
  isSaving: false,
  gridEnabled: true,
  snapEnabled: false,
  cameraMode: 'perspective',
  activeTool: 'select',
  history: [[]],
  historyIndex: 0,
}

/** Guarda el estado actual en el historial antes de mutarlo */
function pushHistory(state: BuilderState, nextObjects: ProjectObject[]): Partial<BuilderState> {
  const trimmed = state.history.slice(0, state.historyIndex + 1)
  const newHistory = [...trimmed, nextObjects].slice(-UNDO_LIMIT)
  return {
    projectObjects: nextObjects,
    history: newHistory,
    historyIndex: newHistory.length - 1,
    isDirty: true,
  }
}

export const useBuilderStore = create<BuilderState & BuilderActions>((set, get) => ({
  ...initialState,

  setCurrentProject: (project) => set({ currentProject: project }),

  setProjectObjects: (objects) =>
    set((s) => ({
      ...pushHistory(s, objects),
    })),

  setSelectedObjectId: (id) => {
    set({ selectedObjectId: id })
    if (id) eventBus.emit(BUILDER_EVENTS.OBJECT_SELECTED, { object_id: id })
  },

  setSceneConfig: (scene) => set({ sceneConfig: scene }),
  updateSceneConfig: (updates) => set((s) => ({
    sceneConfig: s.sceneConfig ? { ...s.sceneConfig, ...updates } : s.sceneConfig,
    isDirty: true,
  })),
  setIsDirty: (dirty) => set({ isDirty: dirty }),
  setIsSaving: (saving) => set({ isSaving: saving }),

  toggleGrid: () => {
    const next = !get().gridEnabled
    set({ gridEnabled: next })
    eventBus.emit(BUILDER_EVENTS.GRID_TOGGLED, { enabled: next })
  },

  toggleSnap: () => {
    const next = !get().snapEnabled
    set({ snapEnabled: next })
    eventBus.emit(BUILDER_EVENTS.SNAP_TOGGLED, { enabled: next })
  },

  setCameraMode: (mode) => {
    set({ cameraMode: mode })
    eventBus.emit(BUILDER_EVENTS.CAMERA_CHANGED, { mode })
  },

  setActiveTool: (tool) => set({ activeTool: tool }),

  addObject: (object) => {
    set((s) => pushHistory(s, [...s.projectObjects, object]))
    eventBus.emit(BUILDER_EVENTS.OBJECT_ADDED, { object_id: object.id, product_id: object.product_id })
  },

  updateObject: (id, updates) => {
    set((s) => {
      const next = s.projectObjects.map((o) =>
        o.id === id ? { ...o, ...updates, updated_at: new Date().toISOString() } : o
      )
      return pushHistory(s, next)
    })
  },

  removeObject: (id) => {
    const { selectedObjectId } = get()
    set((s) => ({
      ...pushHistory(s, s.projectObjects.filter((o) => o.id !== id)),
      selectedObjectId: selectedObjectId === id ? null : selectedObjectId,
    }))
    eventBus.emit(BUILDER_EVENTS.OBJECT_DELETED, { object_id: id })
  },

  duplicateObject: (id) => {
    const object = get().projectObjects.find((o) => o.id === id)
    if (!object) return
    const newObject: ProjectObject = {
      ...object,
      id: crypto.randomUUID(),
      position_x: object.position_x + 0.6,
      position_z: object.position_z + 0.6,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    set((s) => ({
      ...pushHistory(s, [...s.projectObjects, newObject]),
      selectedObjectId: newObject.id,
    }))
    eventBus.emit(BUILDER_EVENTS.OBJECT_DUPLICATED, { source_id: id, new_id: newObject.id })
  },

  rotateObjectBy: (id, deltaDeg) => {
    const object = get().projectObjects.find((o) => o.id === id)
    if (!object) return
    const newRad = object.rotation_y + (deltaDeg * Math.PI) / 180
    set((s) => {
      const next = s.projectObjects.map((o) =>
        o.id === id ? { ...o, rotation_y: newRad, updated_at: new Date().toISOString() } : o
      )
      return pushHistory(s, next)
    })
    eventBus.emit(BUILDER_EVENTS.OBJECT_ROTATED, { object_id: id, delta_deg: deltaDeg })
  },

  clearSelection: () => set({ selectedObjectId: null }),

  undo: () => {
    const { historyIndex, history } = get()
    if (historyIndex <= 0) return
    const prev = historyIndex - 1
    set({ projectObjects: history[prev], historyIndex: prev, isDirty: prev > 0 })
  },

  redo: () => {
    const { historyIndex, history } = get()
    if (historyIndex >= history.length - 1) return
    const next = historyIndex + 1
    set({ projectObjects: history[next], historyIndex: next, isDirty: true })
  },

  reset: () => set(initialState),
}))
