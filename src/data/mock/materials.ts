export interface SceneMaterial {
  id: string
  name: string
  type: 'floor' | 'wall'
  color: string        // color representativo para el swatch UI
  roughness: number
  metalness: number
  procedural?: boolean // si true, SceneFloor/SceneWalls usará canvas texture
}

export const FLOOR_MATERIALS: SceneMaterial[] = [
  // ── Interiores / Comercio ──────────────────────────────────────────────────
  { id: 'concrete',          name: 'Concreto',          type: 'floor', color: '#C8CED8', roughness: 0.88, metalness: 0.02 },
  { id: 'wood',              name: 'Madera Natural',    type: 'floor', color: '#C8A878', roughness: 0.68, metalness: 0.00 },
  { id: 'polished',          name: 'Piso Pulido',       type: 'floor', color: '#D0D8E4', roughness: 0.18, metalness: 0.38 },
  { id: 'marble',            name: 'Marmol',            type: 'floor', color: '#E0E4EC', roughness: 0.12, metalness: 0.06 },
  { id: 'expo',              name: 'Piso Expo',         type: 'floor', color: '#C4C8D0', roughness: 0.52, metalness: 0.18 },
  { id: 'showroom',          name: 'Showroom Claro',    type: 'floor', color: '#D4D8E4', roughness: 0.08, metalness: 0.55 },
  { id: 'medical',           name: 'Clinico',           type: 'floor', color: '#D8E0E8', roughness: 0.25, metalness: 0.02 },
  { id: 'painted_concrete',  name: 'Concreto Pintado',  type: 'floor', color: '#C8D0D8', roughness: 0.80, metalness: 0.02 },
  { id: 'dark_showroom',     name: 'Showroom Oscuro',   type: 'floor', color: '#111520', roughness: 0.10, metalness: 0.60 },
  { id: 'dark_concrete',     name: 'Concreto Oscuro',   type: 'floor', color: '#18222E', roughness: 0.90, metalness: 0.02 },
  { id: 'dark_wood',         name: 'Madera Oscura',     type: 'floor', color: '#2E1C10', roughness: 0.72, metalness: 0.00 },
  // ── Exteriores / Construccion ──────────────────────────────────────────────
  { id: 'grass',             name: 'Pasto / Jardin',    type: 'floor', color: '#4A8A3A', roughness: 0.98, metalness: 0.00, procedural: true },
  { id: 'grass_dark',        name: 'Pasto Sombra',      type: 'floor', color: '#2E5A22', roughness: 0.98, metalness: 0.00, procedural: true },
  { id: 'adoquin',           name: 'Adoquin',           type: 'floor', color: '#A09888', roughness: 0.94, metalness: 0.00, procedural: true },
  { id: 'patio_stone',       name: 'Piedra de Patio',   type: 'floor', color: '#988878', roughness: 0.95, metalness: 0.00, procedural: true },
  { id: 'tierra',            name: 'Tierra / Suelo',    type: 'floor', color: '#7A5A3A', roughness: 0.98, metalness: 0.00, procedural: true },
  { id: 'terracota',         name: 'Terracota',         type: 'floor', color: '#C8784A', roughness: 0.82, metalness: 0.00, procedural: true },
  { id: 'deck_madera',       name: 'Deck Madera',       type: 'floor', color: '#9A6A30', roughness: 0.75, metalness: 0.00, procedural: true },
  { id: 'arena',             name: 'Arena',             type: 'floor', color: '#D8C89A', roughness: 0.98, metalness: 0.00, procedural: true },
  { id: 'concreto_ext',      name: 'Concreto Ext.',     type: 'floor', color: '#B8BEC8', roughness: 0.92, metalness: 0.02 },
]

export const WALL_COLORS: SceneMaterial[] = [
  // ── Pinturas / Acabados lisos ──────────────────────────────────────────────
  { id: 'wall-white',          name: 'Blanca',           type: 'wall', color: '#F2F0EB', roughness: 0.92, metalness: 0 },
  { id: 'wall-warm-white',     name: 'Blanco Calido',    type: 'wall', color: '#F4EEE0', roughness: 0.90, metalness: 0 },
  { id: 'wall-light-gray',     name: 'Gris Claro',       type: 'wall', color: '#D8DCE4', roughness: 0.90, metalness: 0 },
  { id: 'wall-gray',           name: 'Gris Medio',       type: 'wall', color: '#9AA0AC', roughness: 0.88, metalness: 0 },
  { id: 'wall-sand',           name: 'Arena',            type: 'wall', color: '#D8C8A8', roughness: 0.90, metalness: 0 },
  { id: 'wall-dark',           name: 'Oscura Premium',   type: 'wall', color: '#1A2030', roughness: 0.85, metalness: 0 },
  { id: 'wall-black',          name: 'Negra',            type: 'wall', color: '#0D0F14', roughness: 0.80, metalness: 0 },
  { id: 'wall-copper',         name: 'Acento Cobre',     type: 'wall', color: '#8B5A2B', roughness: 0.70, metalness: 0.2 },
  { id: 'wall-alqia',          name: 'Acento Alqia',     type: 'wall', color: '#F98058', roughness: 0.70, metalness: 0   },
  { id: 'wall-alqia-blue',     name: 'Azul Alqia',       type: 'wall', color: '#202D3D', roughness: 0.85, metalness: 0   },
  // ── Texturas / Construccion ────────────────────────────────────────────────
  { id: 'wall-ladrillo',       name: 'Ladrillo',         type: 'wall', color: '#B8604A', roughness: 0.94, metalness: 0,   procedural: true },
  { id: 'wall-ladrillo-claro', name: 'Ladrillo Claro',   type: 'wall', color: '#D4906A', roughness: 0.92, metalness: 0,   procedural: true },
  { id: 'wall-piedra',         name: 'Piedra Gris',      type: 'wall', color: '#888078', roughness: 0.96, metalness: 0,   procedural: true },
  { id: 'wall-piedra-cafe',    name: 'Piedra Cafe',      type: 'wall', color: '#9A8068', roughness: 0.96, metalness: 0,   procedural: true },
  { id: 'wall-block',          name: 'Block Gris',       type: 'wall', color: '#B0B4B8', roughness: 0.90, metalness: 0,   procedural: true },
  { id: 'wall-block-blanco',   name: 'Block Blanco',     type: 'wall', color: '#E0E4E8', roughness: 0.90, metalness: 0,   procedural: true },
  { id: 'wall-concreto-ap',    name: 'Concreto Aparente',type: 'wall', color: '#A0A8B0', roughness: 0.92, metalness: 0.02 },
  { id: 'wall-verde-jardin',   name: 'Jardin Vertical',  type: 'wall', color: '#3A6A2A', roughness: 0.96, metalness: 0,   procedural: true },
]

/** Lookup rapido de propiedades por ID (para SceneFloor y SceneWalls) */
export const MATERIAL_PROPS_BY_ID: Record<string, Pick<SceneMaterial, 'color' | 'roughness' | 'metalness' | 'procedural'>> = {}
for (const m of [...FLOOR_MATERIALS, ...WALL_COLORS]) {
  MATERIAL_PROPS_BY_ID[m.id] = { color: m.color, roughness: m.roughness, metalness: m.metalness, procedural: m.procedural }
}
