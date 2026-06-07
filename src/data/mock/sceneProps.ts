import type { Product } from '@/types'

const T = 'tenant-alqia'
const C = 'company-demo'
const W = 'ws-demo'
const NOW = '2026-01-01T00:00:00Z'

function prop(
  id: string, name: string, sku: string,
  w: number, d: number, h: number,
  color: string, geometry: string, description: string,
): Product {
  return {
    id, tenant_id: T, company_id: C, workspace_id: W,
    category_id: 'cat-scene-props',
    name, sku, description_short: description,
    width: w, depth: d, height: h,
    unit: 'cm',
    default_color: color,
    geometry_type: geometry as Product['geometry_type'],
    price: 0,
    is_scene_prop: true,
    is_quotable: false,
    is_public: true,
    status: 'active',
    created_at: NOW, updated_at: NOW,
  }
}

export const mockSceneProps: Product[] = [
  // Puertas
  prop('sp-door-01', 'Puerta Interior Simple',   'SP-DR-001',  90,  12, 210, '#C8B090', 'door',          'Puerta de interior estándar'),
  prop('sp-door-02', 'Puerta Doble Francesa',    'SP-DR-002', 180,  12, 220, '#D4BC96', 'door',          'Puerta doble tipo francesa'),
  prop('sp-door-03', 'Puerta Corrediza',         'SP-DR-003', 120,   8, 210, '#B8A880', 'door',          'Puerta corrediza de madera'),

  // Ventanas
  prop('sp-win-01', 'Ventana Estándar',          'SP-WN-001', 120,  10, 100, '#88CCDD', 'window_frame',  'Ventana rectangular estándar'),
  prop('sp-win-02', 'Ventana Panorámica',        'SP-WN-002', 180,  10, 140, '#88CCDD', 'window_frame',  'Ventana panorámica grande'),
  prop('sp-win-03', 'Ventana Pequeña',           'SP-WN-003',  80,  10,  80, '#88CCDD', 'window_frame',  'Ventana pequeña'),

  // Lámparas
  prop('sp-lamp-01', 'Lámpara de Piso',          'SP-LP-001',  30,  30, 160, '#D4C8A0', 'lamp',          'Lámpara de pie decorativa'),
  prop('sp-lamp-02', 'Lámpara Colgante',         'SP-LP-002',  35,  35,  40, '#484E60', 'ceiling_lamp',  'Lámpara colgante moderna'),
  prop('sp-lamp-03', 'Lámpara Industrial',       'SP-LP-003',  40,  40,  50, '#303848', 'ceiling_lamp',  'Lámpara industrial colgante'),
  prop('sp-lamp-04', 'Lámpara de Mesa',          'SP-LP-004',  25,  25,  50, '#C8B890', 'lamp',          'Lámpara de mesa decorativa'),

  // Plantas
  prop('sp-plant-01', 'Planta Grande',           'SP-PL-001',  50,  50, 130, '#2A5C2A', 'plant_pot',     'Planta decorativa grande'),
  prop('sp-plant-02', 'Planta Mediana',          'SP-PL-002',  35,  35,  85, '#2A5C2A', 'plant_pot',     'Planta decorativa mediana'),
  prop('sp-plant-03', 'Planta Pequeña',          'SP-PL-003',  25,  25,  55, '#3A6A3A', 'plant_pot',     'Planta pequeña de mesa'),
  prop('sp-plant-04', 'Árbol Interior',          'SP-PL-004',  70,  70, 200, '#1E4A1E', 'plant_pot',     'Árbol decorativo de interior'),

  // Divisores / Paneles
  prop('sp-div-01', 'Divisor 1.8m',             'SP-DV-001',  90,   5, 180, '#D0D0D0', 'divider_panel', 'Panel divisor de espacio'),
  prop('sp-div-02', 'Divisor Vidrio 2.1m',      'SP-DV-002', 120,   5, 210, '#88CCDD', 'divider_panel', 'Divisor de vidrio templado'),
  prop('sp-div-03', 'Biombo Decorativo',         'SP-DV-003', 180,   5, 160, '#C8B090', 'divider_panel', 'Biombo decorativo 3 hojas'),

  // Alfombras / Tapetes
  prop('sp-rug-01', 'Tapete 2×3m',              'SP-RG-001', 200, 300,   2, '#8C7B6A', 'carpet_rug',    'Tapete rectangular sala'),
  prop('sp-rug-02', 'Tapete Cuadrado 2×2m',     'SP-RG-002', 200, 200,   2, '#7A8C9A', 'carpet_rug',    'Tapete cuadrado'),
  prop('sp-rug-03', 'Corredor 1×4m',            'SP-RG-003', 100, 400,   2, '#9A8878', 'carpet_rug',    'Tapete corredor'),

  // Letreros / Señalización
  prop('sp-sign-01', 'Letrero Totem Grande',    'SP-SG-001',  60,  20, 200, '#202D3D', 'sign_totem',    'Totem de señalización grande'),
  prop('sp-sign-02', 'Letrero Totem Chico',     'SP-SG-002',  40,  15, 150, '#202D3D', 'sign_totem',    'Totem de señalización pequeño'),
  prop('sp-sign-03', 'Panel Corporativo',       'SP-SG-003', 120,   5,  90, '#F98058', 'divider_panel', 'Panel decorativo corporativo'),

  // Accesorios showroom
  prop('sp-show-01', 'Pedestal Exhibidor',      'SP-SH-001',  40,  40, 100, '#E8E4DC', 'counter',       'Pedestal para exhibición'),
  prop('sp-show-02', 'Pedestal Alto',           'SP-SH-002',  35,  35, 130, '#E0E0DA', 'counter',       'Pedestal alto de exhibición'),

  // Muros / Construcción (architecture_concept + cualquier vertical)
  prop('sp-wall-01', 'Muro 3m × 2.7m',         'SP-WL-001', 300,  15, 270, '#D0C8C0', 'wall_straight', 'Muro recto interior/exterior'),
  prop('sp-wall-02', 'Muro 2m × 2.7m',         'SP-WL-002', 200,  15, 270, '#D0C8C0', 'wall_straight', 'Muro recto mediano'),
  prop('sp-wall-03', 'Muro 1m × 2.7m',         'SP-WL-003', 100,  15, 270, '#D0C8C0', 'wall_straight', 'Muro recto corto'),
  prop('sp-wall-04', 'Muro 4m × 2.7m',         'SP-WL-004', 400,  15, 270, '#D0C8C0', 'wall_straight', 'Muro recto largo'),
  prop('sp-wall-05', 'Muro 5m × 2.7m',         'SP-WL-005', 500,  15, 270, '#C8C0B8', 'wall_straight', 'Muro recto extra largo'),
  prop('sp-wall-06', 'Muro Bajo 3m',            'SP-WL-006', 300,  15, 100, '#C8C4BC', 'wall_low',      'Muro bajo de cerramiento'),
  prop('sp-wall-07', 'Muro Bajo 2m',            'SP-WL-007', 200,  15, 100, '#C8C4BC', 'wall_low',      'Muro bajo mediano'),
  prop('sp-wall-08', 'Muro Alto 3m × 3.5m',    'SP-WL-008', 300,  20, 350, '#BEB8B0', 'wall_straight', 'Muro alto exterior'),
  prop('sp-wall-09', 'Muro Nuevo (verde)',      'SP-WL-009', 300,  15, 270, '#4ADE80', 'wall_straight', 'Muro a construir — nuevo'),
  prop('sp-wall-10', 'Muro a Demoler (rojo)',   'SP-WL-010', 300,  15, 270, '#FB7185', 'wall_straight', 'Muro a demoler en remodelación'),

  // Columnas
  prop('sp-col-01', 'Columna 20×20 H2.7m',     'SP-CL-001',  20,  20, 270, '#D8D0C8', 'column',        'Columna cuadrada estructural'),
  prop('sp-col-02', 'Columna 30×30 H3m',       'SP-CL-002',  30,  30, 300, '#D0C8C0', 'column',        'Columna cuadrada mediana'),
  prop('sp-col-03', 'Columna Circular H3m',    'SP-CL-003',  25,  25, 300, '#D8D4D0', 'column',        'Columna circular decorativa'),

  // Techos
  prop('sp-roof-01', 'Losa Plana 4×4m',        'SP-RF-001', 400, 400,  20, '#C8C0B8', 'roof_flat',     'Losa plana de concreto'),
  prop('sp-roof-02', 'Losa Plana 6×5m',        'SP-RF-002', 600, 500,  20, '#C8C0B8', 'roof_flat',     'Losa plana grande'),
  prop('sp-roof-03', 'Techo Inclinado 4×4m',   'SP-RF-003', 400, 400, 120, '#B8A898', 'roof_slope',    'Techo inclinado a dos aguas'),
  prop('sp-roof-04', 'Techo Inclinado 5×4m',   'SP-RF-004', 500, 400, 140, '#B8A898', 'roof_slope',    'Techo inclinado grande'),

  // Escaleras / Accesos
  prop('sp-stair-01', 'Escalera 3 peldaños',   'SP-ST-001', 100,  90,  60, '#C8C4BC', 'staircase',     'Escalera exterior 3 peldaños'),
  prop('sp-stair-02', 'Escalera 5 peldaños',   'SP-ST-002', 100, 150, 100, '#C8C4BC', 'staircase',     'Escalera interior 5 peldaños'),

  // Terreno / Superficies
  prop('sp-terr-01', 'Terreno 8×6m',           'SP-TR-001', 800, 600,   8, '#8B7D6B', 'terrain_base',  'Base de terreno rectangular'),
  prop('sp-terr-02', 'Terreno 10×8m',          'SP-TR-002',1000, 800,   8, '#8B7D6B', 'terrain_base',  'Base de terreno grande'),
  prop('sp-terr-03', 'Piso Exterior 4×4m',     'SP-TR-003', 400, 400,   5, '#A09080', 'terrain_base',  'Piso exterior concreto'),
  prop('sp-terr-04', 'Jardín / Pasto 4×4m',    'SP-TR-004', 400, 400,   5, '#4A8A3A', 'terrain_base',  'Área verde / pasto'),
  prop('sp-terr-05', 'Alberca simple 3×6m',    'SP-TR-005', 300, 600,  30, '#4090C0', 'terrain_base',  'Alberca placeholder'),

  // Arcos / Aberturas
  prop('sp-arch-01', 'Arco 1.2m ancho',        'SP-AR-001', 120,  15, 240, '#D0C8C0', 'arch_opening',  'Abertura en arco'),
  prop('sp-arch-02', 'Cancel / Vano 2m ancho', 'SP-AR-002', 200,  15, 240, '#C8C0B8', 'arch_opening',  'Vano ancho para cancel'),
]

// Categorías derivadas de geometry_type para agrupar en UI
export const PROP_CATEGORIES: { key: string; label: string; geoTypes: string[] }[] = [
  { key: 'puertas',    label: 'Puertas',    geoTypes: ['door']                                    },
  { key: 'ventanas',   label: 'Ventanas',   geoTypes: ['window_frame']                            },
  { key: 'lamparas',   label: 'Lámparas',   geoTypes: ['lamp', 'ceiling_lamp']                    },
  { key: 'plantas',    label: 'Plantas',    geoTypes: ['plant_pot']                               },
  { key: 'divisores',  label: 'Divisores',  geoTypes: ['divider_panel']                           },
  { key: 'tapetes',    label: 'Tapetes',    geoTypes: ['carpet_rug']                              },
  { key: 'letreros',   label: 'Letreros',   geoTypes: ['sign_totem']                              },
  { key: 'accesorios', label: 'Accesorios', geoTypes: ['counter']                                 },
  { key: 'muros',      label: 'Muros',      geoTypes: ['wall_straight', 'wall_low']               },
  { key: 'columnas',   label: 'Columnas',   geoTypes: ['column']                                  },
  { key: 'techos',     label: 'Techos',     geoTypes: ['roof_flat', 'roof_slope']                 },
  { key: 'escaleras',  label: 'Escaleras',  geoTypes: ['staircase']                               },
  { key: 'terreno',    label: 'Terreno',    geoTypes: ['terrain_base']                            },
  { key: 'arcos',      label: 'Arcos',      geoTypes: ['arch_opening']                            },
]
