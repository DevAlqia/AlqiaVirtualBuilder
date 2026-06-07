import type { ProductCategory, Product, ProductVariant } from '@/types'

const T = 'tenant-alqia'
const C = 'company-demo'
const W = 'ws-demo'
const NOW = '2026-01-01T00:00:00Z'

function cat(
  id: string,
  name: string,
  slug: string,
  order: number,
  vertical: string,
  companyId = C,
): ProductCategory {
  return {
    id,
    tenant_id: T,
    company_id: companyId,
    workspace_id: W,
    name,
    slug,
    order,
    vertical_key: vertical as ProductCategory['vertical_key'],
    status: 'active',
    created_at: NOW,
    updated_at: NOW,
  }
}

function prod(
  id: string,
  categoryId: string,
  name: string,
  sku: string,
  description: string,
  w: number,
  d: number,
  h: number,
  color: string,
  geometry: string,
  price: number,
  companyId = C,
): Product {
  return {
    id,
    tenant_id: T,
    company_id: companyId,
    workspace_id: W,
    category_id: categoryId,
    name,
    sku,
    description_short: description,
    width: w,
    depth: d,
    height: h,
    unit: 'cm',
    default_color: color,
    geometry_type: geometry as Product['geometry_type'],
    price,
    is_public: true,
    status: 'active',
    created_at: NOW,
    updated_at: NOW,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORIAS — 7 verticales / 26 categorias
// ─────────────────────────────────────────────────────────────────────────────

export const mockCategories: ProductCategory[] = [
  // Industrial Storage (SIA)
  cat('cat-ind-gabinetes',  'Gabinetes',              'gabinetes',    1, 'industrial_storage', 'company-sia'),
  cat('cat-ind-anaqueles',  'Anaqueles',              'anaqueles',    2, 'industrial_storage', 'company-sia'),
  cat('cat-ind-racks',      'Racks de paletizacion',  'racks',        3, 'industrial_storage', 'company-sia'),
  cat('cat-ind-mesas',      'Mesas de trabajo',       'mesas',        4, 'industrial_storage', 'company-sia'),
  // Furniture / Kitchen / Closet
  cat('cat-fk-sala',        'Sala y Comedor',         'sala',         1, 'furniture_kitchen'),
  cat('cat-fk-cocina',      'Cocinas',                'cocinas',      2, 'furniture_kitchen'),
  cat('cat-fk-closet',      'Closets y Vestidores',   'closet',       3, 'furniture_kitchen'),
  cat('cat-fk-recamara',    'Recamara',               'recamara',     4, 'furniture_kitchen'),
  // Real Estate
  cat('cat-re-sala',        'Sala',                   'sala-re',      1, 'real_estate'),
  cat('cat-re-habitacion',  'Habitaciones',           'hab',          2, 'real_estate'),
  cat('cat-re-cocina',      'Cocina y Equipamiento',  'coc-re',       3, 'real_estate'),
  cat('cat-re-amenidades',  'Amenidades',             'amen',         4, 'real_estate'),
  // Retail Layout
  cat('cat-rt-gondolas',    'Gondolas',               'gondolas',     1, 'retail_layout'),
  cat('cat-rt-exhibidores', 'Exhibidores',            'exhib',        2, 'retail_layout'),
  cat('cat-rt-cajas',       'Modulos de Caja',        'cajas',        3, 'retail_layout'),
  cat('cat-rt-islas',       'Islas de Producto',      'islas',        4, 'retail_layout'),
  // Event / Stand
  cat('cat-ev-stands',      'Stands',                 'stands',       1, 'event_stand'),
  cat('cat-ev-pantallas',   'Video Walls y Pantallas','pantallas',    2, 'event_stand'),
  cat('cat-ev-mobiliario',  'Mobiliario Expo',        'mob-ev',       3, 'event_stand'),
  cat('cat-ev-modulos',     'Modulos Expositores',    'mod-ev',       4, 'event_stand'),
  // Medical Space
  cat('cat-md-consultorios','Consultorios',           'consultorios', 1, 'medical_space'),
  cat('cat-md-recepcion',   'Recepcion y Espera',     'recepcion',    2, 'medical_space'),
  cat('cat-md-equipo',      'Equipo Medico',          'equipo-md',    3, 'medical_space'),
  // Exterior / Cerramientos
  cat('cat-ext-toldos',     'Toldos y Pergolas',      'toldos',       1, 'exterior_enclosures'),
  cat('cat-ext-portones',   'Portones y Rejas',       'portones',     2, 'exterior_enclosures'),
  cat('cat-ext-canceles',   'Canceles y Cercas',      'canceles',     3, 'exterior_enclosures'),
  cat('cat-ext-cortinas',   'Cortinas Exteriores',    'cortinas-ext', 4, 'exterior_enclosures'),
  // Interior Design
  cat('cat-id-mobiliario',  'Mobiliario',             'mobiliario',   1, 'interior_design'),
  cat('cat-id-iluminacion', 'Iluminacion',            'ilum',         2, 'interior_design'),
  cat('cat-id-textiles',    'Textiles y Tapetes',     'textiles',     3, 'interior_design'),
  cat('cat-id-arte',        'Arte y Decoracion',      'arte',         4, 'interior_design'),
  // Architecture Concept
  cat('cat-ac-muros',       'Muros y Estructura',     'muros',        1, 'architecture_concept'),
  cat('cat-ac-aberturas',   'Puertas y Ventanas',     'aberturas',    2, 'architecture_concept'),
  cat('cat-ac-techos',      'Techos y Losas',         'techos',       3, 'architecture_concept'),
  cat('cat-ac-terreno',     'Terreno y Exterior',     'terreno',      4, 'architecture_concept'),
  cat('cat-ac-estructura',  'Estructura y Acero',     'estructura',   5, 'architecture_concept'),
  cat('cat-ac-canceleria',  'Canceleria y Vidrio',    'canceleria',   6, 'architecture_concept'),
  cat('cat-ac-mobiliario',  'Mobiliario Conceptual',  'mob-ac',       7, 'architecture_concept'),
]

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCTOS — 47 items, 7 verticales
// ─────────────────────────────────────────────────────────────────────────────

export const mockProducts: Product[] = [
  // ── Industrial Storage (SIA) ────────────────────────────────────────────────
  prod('p-ind-001', 'cat-ind-gabinetes', 'Gabinete Industrial ST-36', 'SIA-GAB-036', 'Gabinete de acero con 3 entrepanos', 90, 45, 180, '#4A5568', 'cabinet', 8900, 'company-sia'),
  prod('p-ind-002', 'cat-ind-gabinetes', 'Gabinete Industrial ST-24', 'SIA-GAB-024', 'Gabinete de acero con 2 entrepanos', 60, 45, 120, '#718096', 'cabinet', 6500, 'company-sia'),
  prod('p-ind-003', 'cat-ind-gabinetes', 'Gabinete Taller 48',        'SIA-GAB-048', 'Gabinete amplio para taller',        120, 55, 200, '#2D3748', 'cabinet', 12400, 'company-sia'),
  prod('p-ind-004', 'cat-ind-anaqueles', 'Anaquel 5 Niveles',         'SIA-ANA-005', 'Anaquel de acero 5 niveles',          90, 40, 180, '#4A5568', 'shelf_rack', 4800, 'company-sia'),
  prod('p-ind-005', 'cat-ind-anaqueles', 'Anaquel 3 Niveles',         'SIA-ANA-003', 'Anaquel ligero 3 niveles',            60, 35, 150, '#718096', 'shelf_rack', 3200, 'company-sia'),
  prod('p-ind-006', 'cat-ind-racks',     'Rack Selectivo 2 Niveles',  'SIA-RCK-002', 'Rack para pallets 2 niveles',        270, 110, 360, '#2D3748', 'shelf_rack', 18500, 'company-sia'),
  prod('p-ind-007', 'cat-ind-racks',     'Rack Drive-In 4N',          'SIA-RCK-DI4', 'Rack drive-in 4 niveles',            270, 180, 500, '#1A202C', 'shelf_rack', 42000, 'company-sia'),
  prod('p-ind-008', 'cat-ind-mesas',     'Mesa de Trabajo Industrial', 'SIA-MSA-001', 'Mesa de acero con entrepano',        180, 75, 90,  '#4A5568', 'box_flat',  5600, 'company-sia'),
  prod('p-ind-009', 'cat-ind-mesas',     'Mesa de Corte Heavy-Duty',  'SIA-MSA-HD',  'Mesa reforzada de corte',            240, 90, 95,  '#2D3748', 'box_flat',  8200, 'company-sia'),
  // ── Furniture / Kitchen / Closet ────────────────────────────────────────────
  prod('p-fk-001', 'cat-fk-sala',    'Sofa 3 Plazas',        'FK-SOF-003', 'Sofa tapizado 3 plazas',         220, 90, 85,  '#6B7280', 'seating', 22000),
  prod('p-fk-002', 'cat-fk-sala',    'Sofa 2 Plazas',        'FK-SOF-002', 'Sofa compacto 2 plazas',         160, 85, 82,  '#9CA3AF', 'seating', 16000),
  prod('p-fk-003', 'cat-fk-sala',    'Mesa de Centro',       'FK-MSC-001', 'Mesa de centro moderno',          120, 65, 40,  '#D1D5DB', 'box_flat', 7500),
  prod('p-fk-004', 'cat-fk-cocina',  'Isla de Cocina',       'FK-ISL-001', 'Isla central de cocina',          180, 90, 90,  '#F3F4F6', 'kitchen_unit', 35000),
  prod('p-fk-005', 'cat-fk-cocina',  'Alacena Alta',         'FK-ALA-001', 'Alacena alta de cocina',           60, 35, 210, '#E5E7EB', 'cabinet', 12000),
  prod('p-fk-006', 'cat-fk-closet',  'Modulo Closet Torre',  'FK-CLO-001', 'Torre de closet con cajones',      60, 55, 220, '#9CA3AF', 'closet', 14500),
  prod('p-fk-007', 'cat-fk-closet',  'Panel Espejo Closet',  'FK-CLO-ESP', 'Panel espejo para vestidor',       60,  3, 220, '#D1D5DB', 'panel_v', 6000),
  prod('p-fk-008', 'cat-fk-recamara','Cama King',            'FK-CAM-KNG', 'Cama king size con cabecera',     200, 210, 50, '#6B7280', 'box_flat', 28000),
  prod('p-fk-009', 'cat-fk-recamara','Cama Queen',           'FK-CAM-QN',  'Cama queen con base',             160, 200, 45, '#9CA3AF', 'box_flat', 21000),
  prod('p-fk-010', 'cat-fk-recamara','Buro Contemporaneo',   'FK-BUR-001', 'Buro de 2 cajones',                55, 40, 60,  '#D1D5DB', 'box_flat', 4800),
  // ── Real Estate ─────────────────────────────────────────────────────────────
  prod('p-re-001', 'cat-re-sala',       'Sofa Modular RE',   'RE-SOF-001', 'Sofa modular 4 piezas',           300, 95, 82,  '#9CA3AF', 'seating', 38000),
  prod('p-re-002', 'cat-re-sala',       'Mesa Comedor 6P',   'RE-MSC-006', 'Mesa comedor 6 personas',         180, 90, 75,  '#F3F4F6', 'box_flat', 18000),
  prod('p-re-003', 'cat-re-habitacion', 'Cama Matrimonial',  'RE-CAM-MAT', 'Cama matrimonial con base',       160, 200, 45, '#6B7280', 'box_flat', 19000),
  prod('p-re-004', 'cat-re-habitacion', 'Closet Empotrado',  'RE-CLO-EMP', 'Closet empotrado 2 puertas',      200, 60, 240, '#E5E7EB', 'closet', 25000),
  prod('p-re-005', 'cat-re-cocina',     'Cocina Integral',   'RE-COC-INT', 'Cocina integral 3m lineales',     300, 60, 210, '#F3F4F6', 'kitchen_unit', 55000),
  prod('p-re-006', 'cat-re-amenidades', 'Lobby Sillon',      'RE-LOB-001', 'Sillon individual para lobby',     80, 80, 80,  '#4B5563', 'seating', 9500),
  // ── Retail Layout ───────────────────────────────────────────────────────────
  prod('p-rt-001', 'cat-rt-gondolas',   'Gondola Doble Cara', 'RT-GON-DC',  'Gondola 5 niveles doble cara',   90, 60, 180, '#374151', 'gondola', 6200),
  prod('p-rt-002', 'cat-rt-gondolas',   'Gondola Simple',     'RT-GON-S',   'Gondola 5 niveles pared',        45, 50, 180, '#4B5563', 'gondola', 3800),
  prod('p-rt-003', 'cat-rt-exhibidores','Exhibidor Isla',     'RT-EXH-ISL', 'Exhibidor isla 4 caras',         60, 60, 180, '#6B7280', 'shelf_rack', 8500),
  prod('p-rt-004', 'cat-rt-cajas',      'Modulo Caja',        'RT-CAJ-001', 'Modulo de caja con mostrador',  120, 60, 95,  '#9CA3AF', 'counter', 12000),
  prod('p-rt-005', 'cat-rt-islas',      'Mesa Isla Producto', 'RT-ISL-001', 'Mesa isla de producto bajo',    120, 80, 90,  '#D1D5DB', 'box_flat', 9000),
  // ── Event / Stand ───────────────────────────────────────────────────────────
  prod('p-ev-001', 'cat-ev-stands',    'Stand Modular 3x3',  'EV-STD-3X3', 'Stand modular 3x3 metros',       300, 300, 250, '#1F2937', 'stand_modular', 28000),
  prod('p-ev-002', 'cat-ev-stands',    'Stand Cabina 6x3',   'EV-STD-6X3', 'Stand cabina premium 6x3',       600, 300, 270, '#111827', 'stand_modular', 55000),
  prod('p-ev-003', 'cat-ev-pantallas', 'Video Wall 2x2',     'EV-VW-2X2',  'Video wall 4 paneles',           160,  15,  90, '#1E3A5F', 'panel_v', 35000),
  prod('p-ev-004', 'cat-ev-pantallas', 'Pantalla LED 65',    'EV-PAN-65',  'Pantalla LED 65 pulgadas',       155,  12,  90, '#1E3A5F', 'panel_v', 18000),
  prod('p-ev-005', 'cat-ev-mobiliario','Silla Evento',       'EV-SIL-001', 'Silla apilable para evento',      45,  50,  85, '#374151', 'seating', 1200),
  prod('p-ev-006', 'cat-ev-modulos',   'Mostrador Expo',     'EV-MOS-001', 'Mostrador exhibicion con LED',   120,  55,  95, '#1F2937', 'counter', 14000),
  // ── Medical Space ───────────────────────────────────────────────────────────
  prod('p-md-001', 'cat-md-consultorios','Escritorio Medico',      'MD-ESC-001', 'Escritorio medico con alacena',       160, 65, 75,  '#F9FAFB', 'box_flat', 22000),
  prod('p-md-002', 'cat-md-consultorios','Camilla de Exploracion', 'MD-CAM-001', 'Camilla de exploracion ajustable',    190, 70, 85,  '#FFFFFF', 'medical_bed', 18000),
  prod('p-md-003', 'cat-md-recepcion',   'Modulo Recepcion',       'MD-REC-001', 'Modulo recepcion medica',             180, 65, 110, '#F3F4F6', 'counter', 25000),
  prod('p-md-004', 'cat-md-recepcion',   'Sillon Sala Espera',     'MD-SIL-001', 'Sillon sala de espera',               65, 65, 80,  '#6B7280', 'seating', 5500),
  prod('p-md-005', 'cat-md-equipo',      'Mueble Instrumental',    'MD-MUI-001', 'Mueble para instrumental medico',      60, 40, 120, '#F9FAFB', 'shelf_rack', 14000),
  // ── Exterior / Cerramientos ────────────────────────────────────────────────
  prod('p-ext-001', 'cat-ext-toldos',   'Toldo Retractil 3x2.5m',  'EXT-TOL-001', 'Toldo retractil motor manual',           300, 250, 30,  '#D4C8A0', 'box_flat', 18500),
  prod('p-ext-002', 'cat-ext-toldos',   'Toldo Fijo Marquesina',   'EXT-TOL-002', 'Toldo fijo tipo marquesina 4m',          400, 120, 30,  '#C8B890', 'box_flat', 12000),
  prod('p-ext-003', 'cat-ext-toldos',   'Pergola Aluminio 4x3m',   'EXT-PER-001', 'Pergola de aluminio con cubierta',       400, 300, 250, '#E8E4DC', 'stand_modular', 45000),
  prod('p-ext-004', 'cat-ext-toldos',   'Pergola Bioclimatica',    'EXT-PER-002', 'Pergola laminas orientables',            350, 300, 240, '#D0D0D0', 'stand_modular', 68000),
  prod('p-ext-005', 'cat-ext-portones', 'Porton Corredizo 4m',     'EXT-POR-001', 'Porton corredizo acero calibre 14',      400,  12, 200, '#2D3748', 'panel_v', 22000),
  prod('p-ext-006', 'cat-ext-portones', 'Porton Abatible 3m',      'EXT-POR-002', 'Porton abatible 2 hojas herreria',       300,  10, 180, '#1A202C', 'panel_v', 16000),
  prod('p-ext-007', 'cat-ext-portones', 'Reja Residencial 2m',     'EXT-REJ-001', 'Reja herreria decorativa',               200,   6, 200, '#374151', 'panel_v', 9500),
  prod('p-ext-008', 'cat-ext-canceles', 'Malla Ciclonica 2x10m',   'EXT-MAL-001', 'Malla ciclonica galvanizada',           1000,   5, 200, '#9AA0AC', 'divider_panel', 4500),
  prod('p-ext-009', 'cat-ext-canceles', 'Barandal Metalico 3m',    'EXT-BAR-001', 'Barandal aluminio 3m lineal',            300,  10, 110, '#6B7280', 'divider_panel', 7800),
  prod('p-ext-010', 'cat-ext-cortinas', 'Cortina Enrollable Ext',  'EXT-COR-001', 'Cortina enrollable exterior PVC',        200,   8, 250, '#D4C8A0', 'panel_v', 11000),
  prod('p-ext-011', 'cat-ext-cortinas', 'Persiana Shutter Ext',    'EXT-SHU-001', 'Persiana exterior tipo shutter',         150,  10, 180, '#C8C0B0', 'panel_v', 8500),
  // ── Interior Design ────────────────────────────────────────────────────────
  prod('p-id-001', 'cat-id-mobiliario', 'Sofa 3 Plazas Premium',  'ID-SOF-001', 'Sofa tapizado 3 plazas premium',        220,  95,  85, '#8B7355', 'seating',    28000),
  prod('p-id-002', 'cat-id-mobiliario', 'Sillon Accent',          'ID-SIL-001', 'Sillon de acento diseno',                80,  80,  90, '#6B5A4E', 'seating',    14000),
  prod('p-id-003', 'cat-id-mobiliario', 'Mesa de Centro Marmol',  'ID-MES-001', 'Mesa de centro con cubierta de marmol', 110,  60,  40, '#E8E4DC', 'box_flat',   12500),
  prod('p-id-004', 'cat-id-mobiliario', 'Credenza 180cm',         'ID-CRE-001', 'Credenza madera nogal 2 puertas',        180,  45,  75, '#5C3A1E', 'cabinet',    32000),
  prod('p-id-005', 'cat-id-mobiliario', 'Cama King Premium',      'ID-CAM-001', 'Cama king con cabecera tapizada',        200, 200,  55, '#8B7355', 'medical_bed', 45000),
  prod('p-id-006', 'cat-id-mobiliario', 'Escritorio Ejecutivo',   'ID-ESC-001', 'Escritorio ejecutivo con cajonera',      180,  80,  75, '#5C3A1E', 'box_flat',   18000),
  prod('p-id-007', 'cat-id-mobiliario', 'Librero 200cm',          'ID-LIB-001', 'Librero madera con divisiones',           90,  35, 200, '#4A3728', 'shelf_rack', 14500),
  prod('p-id-008', 'cat-id-iluminacion', 'Lampara Colgante Premium', 'ID-LAM-001', 'Lampara colgante diseno nordico',    40,  40,  60, '#B8A890', 'ceiling_lamp', 8500),
  prod('p-id-009', 'cat-id-iluminacion', 'Lampara de Piso Premium',  'ID-LAM-002', 'Lampara de pie arco metalica',        35,  35, 180, '#C8B890', 'lamp',       11000),
  prod('p-id-010', 'cat-id-textiles',    'Tapete Premium 2x3m',      'ID-TAP-001', 'Tapete tejido premium 2x3m',         200, 300,   2, '#8C7B6A', 'carpet_rug', 9800),
  prod('p-id-011', 'cat-id-arte',        'Cuadro Decorativo Grande',  'ID-CUA-001', 'Cuadro decorativo 120x80cm',         120,   4,  80, '#D4C8A0', 'divider_panel', 4500),
  // ── Architecture Concept ─────────────────────────────────────────────────────
  // Muros y estructura
  prod('p-ac-001', 'cat-ac-muros',    'Muro Recto 3m',            'AC-MUR-001', 'Muro constructivo 3m x 2.7m',         300, 15, 270, '#D0C8C0', 'wall_straight', 4800),
  prod('p-ac-002', 'cat-ac-muros',    'Muro Recto 2m',            'AC-MUR-002', 'Muro constructivo 2m x 2.7m',         200, 15, 270, '#D0C8C0', 'wall_straight', 3200),
  prod('p-ac-003', 'cat-ac-muros',    'Muro Recto 4m',            'AC-MUR-003', 'Muro constructivo 4m x 2.7m',         400, 15, 270, '#C8C0B8', 'wall_straight', 6400),
  prod('p-ac-004', 'cat-ac-muros',    'Muro Recto 5m',            'AC-MUR-004', 'Muro constructivo 5m x 2.7m',         500, 15, 270, '#C8C0B8', 'wall_straight', 8000),
  prod('p-ac-005', 'cat-ac-muros',    'Muro Nuevo (a construir)', 'AC-MUR-NEW', 'Muro nuevo — se resalta en verde',    300, 15, 270, '#4ADE80', 'wall_straight', 4800),
  prod('p-ac-006', 'cat-ac-muros',    'Muro a Demoler',           'AC-MUR-DEM', 'Muro a demoler — se resalta en rojo', 300, 15, 270, '#FB7185', 'wall_straight', 0),
  prod('p-ac-007', 'cat-ac-muros',    'Muro Bajo 3m',             'AC-MUR-B01', 'Muro bajo de 1m altura',              300, 15, 100, '#C8C4BC', 'wall_low',      2400),
  prod('p-ac-008', 'cat-ac-muros',    'Columna 25x25cm',          'AC-COL-001', 'Columna estructural cuadrada',         25, 25, 300, '#D8D4CC', 'column',        1800),
  // Aberturas
  prod('p-ac-009', 'cat-ac-aberturas', 'Puerta Interior 90cm',   'AC-PTA-001', 'Puerta interior standard',              90, 12, 210, '#C8B090', 'door',          2800),
  prod('p-ac-010', 'cat-ac-aberturas', 'Puerta Principal',        'AC-PTA-002', 'Puerta principal de acceso',           120, 12, 220, '#A89070', 'door',          6500),
  prod('p-ac-011', 'cat-ac-aberturas', 'Ventana Simple',          'AC-VEN-001', 'Ventana rectangular estandar',         120, 10, 100, '#88CCDD', 'window_frame',  2200),
  prod('p-ac-012', 'cat-ac-aberturas', 'Ventanal Panoramico',     'AC-VEN-002', 'Ventanal grande tipo panoramico',      180, 10, 150, '#88CCDD', 'window_frame',  5800),
  prod('p-ac-013', 'cat-ac-aberturas', 'Arco Decorativo',         'AC-ARC-001', 'Arco de acceso decorativo',            120, 15, 240, '#D0C8C0', 'arch_opening',  3500),
  // Techos
  prod('p-ac-014', 'cat-ac-techos',   'Losa Plana 4x4m',         'AC-LSA-001', 'Losa plana de concreto 4x4m',         400,400,  20, '#C8C0B8', 'roof_flat',     12000),
  prod('p-ac-015', 'cat-ac-techos',   'Losa Plana 6x5m',         'AC-LSA-002', 'Losa plana grande 6x5m',              600,500,  20, '#C8C0B8', 'roof_flat',     18000),
  prod('p-ac-016', 'cat-ac-techos',   'Techo Inclinado 4x4m',    'AC-TCH-001', 'Techo inclinado a dos aguas 4x4',     400,400, 120, '#B8A898', 'roof_slope',    14000),
  prod('p-ac-017', 'cat-ac-techos',   'Escalera 5 Peldanos',     'AC-ESC-001', 'Escalera interior 5 peldanos',        100,150, 100, '#C8C4BC', 'staircase',     8500),
  // Terreno
  prod('p-ac-018', 'cat-ac-terreno',  'Terreno 10x8m',           'AC-TRR-001', 'Base de terreno rectangular',        1000,800,   8, '#8B7D6B', 'terrain_base',  0),
  prod('p-ac-019', 'cat-ac-terreno',  'Jardin / Pasto 4x4m',     'AC-TRR-002', 'Area verde pasto',                    400,400,   5, '#4A8A3A', 'terrain_base',  0),
  prod('p-ac-020', 'cat-ac-terreno',  'Piso Exterior Concreto',  'AC-TRR-003', 'Piso exterior 4x4m',                  400,400,   5, '#A09080', 'terrain_base',  0),
  // Mobiliario conceptual — geometrias reales
  prod('p-ac-021', 'cat-ac-mobiliario','Cama Individual',         'AC-MOB-001', 'Cama individual con cabecera',         90,200,  55, '#8B7355', 'bed',           0),
  prod('p-ac-021b','cat-ac-mobiliario','Cama Matrimonial',        'AC-MOB-001B','Cama matrimonial 160cm',               160,200,  55, '#7A6348', 'bed',           0),
  prod('p-ac-022', 'cat-ac-mobiliario','Sofa (conceptual)',       'AC-MOB-002', 'Sofa placeholder conceptual',          220, 90,  85, '#6B7280', 'seating',       0),
  prod('p-ac-023', 'cat-ac-mobiliario','Mesa Comedor (conc.)',    'AC-MOB-003', 'Mesa comedor placeholder',             160, 90,  75, '#9CA3AF', 'box_flat',      0),
  prod('p-ac-024', 'cat-ac-mobiliario','Cocina Basica (conc.)',   'AC-MOB-004', 'Modulo de cocina conceptual',          300, 60, 210, '#E5E7EB', 'kitchen_unit',  0),
  prod('p-ac-025', 'cat-ac-mobiliario','Bano Placeholder',        'AC-MOB-005', 'Sanitario y tina placeholder',         200,150,  80, '#F3F4F6', 'box_flat',      0),
  // Estructura y Acero
  prod('p-ac-026', 'cat-ac-estructura','Viga IPR 6m',             'AC-VIG-001', 'Viga de acero H/I 6 metros',           600, 30,  20, '#6B7A88', 'steel_beam',    0),
  prod('p-ac-027', 'cat-ac-estructura','Viga IPR 4m',             'AC-VIG-002', 'Viga de acero H/I 4 metros',           400, 25,  18, '#7A8A98', 'steel_beam',    0),
  prod('p-ac-028', 'cat-ac-estructura','Viga IPR 3m',             'AC-VIG-003', 'Viga de acero H/I 3 metros',           300, 20,  15, '#8A9AA8', 'steel_beam',    0),
  prod('p-ac-029', 'cat-ac-estructura','Varillas 12mm x 6m',      'AC-VAR-001', 'Paquete varillas corrugadas 12mm',      600, 20,  20, '#5A6068', 'rebar_bundle',  0),
  prod('p-ac-030', 'cat-ac-estructura','Varillas 3/8" x 6m',     'AC-VAR-002', 'Paquete varillas corrugadas 3/8"',     600, 16,  16, '#4E555C', 'rebar_bundle',  0),
  prod('p-ac-031', 'cat-ac-estructura','Columna Metalica IPR',    'AC-COL-M01', 'Columna metalica H 3m',                 20,300,  20, '#6B7A88', 'steel_beam',    0),
  // Canceleria y Vidrio
  prod('p-ac-032', 'cat-ac-canceleria','Cancel Vidrio 1.5m',      'AC-CAN-001', 'Panel de vidrio templado 1.5m',         150, 10, 240, '#B8D8E8', 'glass_panel',   0),
  prod('p-ac-033', 'cat-ac-canceleria','Cancel Vidrio 2m',        'AC-CAN-002', 'Panel de vidrio templado 2m',           200, 10, 240, '#B8D8E8', 'glass_panel',   0),
  prod('p-ac-034', 'cat-ac-canceleria','Cancel Vidrio 90cm',      'AC-CAN-003', 'Panel de vidrio 90cm — complemento',    90, 10, 240, '#C5E4F0', 'glass_panel',   0),
  prod('p-ac-035', 'cat-ac-canceleria','Tabique de Vidrio',       'AC-CAN-004', 'Tabique divisorio vidrio templado',     300,  8, 240, '#C0DCF0', 'glass_panel',   0),
  prod('p-ac-036', 'cat-ac-canceleria','Vano / Arco de Cancel',   'AC-CAN-005', 'Cancel arqueado de entrada',            120, 10, 260, '#B8BEC4', 'arch_opening',  0),
]

// ─────────────────────────────────────────────────────────────────────────────
// VARIANTES
// ─────────────────────────────────────────────────────────────────────────────

export const mockVariants: ProductVariant[] = [
  {
    id: 'v-gab-gray', product_id: 'p-ind-001', tenant_id: T,
    name: 'Gris Industrial', sku: 'SIA-GAB-036-GR', color: '#718096',
    width: 90, depth: 45, height: 180,
    price_delta: 0, status: 'active',
    created_at: NOW, updated_at: NOW,
  },
  {
    id: 'v-gab-dark', product_id: 'p-ind-001', tenant_id: T,
    name: 'Negro Mate', sku: 'SIA-GAB-036-BK', color: '#1A202C',
    width: 90, depth: 45, height: 180,
    price_delta: 0, status: 'active',
    created_at: NOW, updated_at: NOW,
  },
  {
    id: 'v-sof-gray', product_id: 'p-fk-001', tenant_id: T,
    name: 'Gris Carbon', sku: 'FK-SOF-003-GR', color: '#6B7280',
    width: 220, depth: 90, height: 85,
    price_delta: 0, status: 'active',
    created_at: NOW, updated_at: NOW,
  },
  {
    id: 'v-sof-blue', product_id: 'p-fk-001', tenant_id: T,
    name: 'Azul Medianoche', sku: 'FK-SOF-003-BL', color: '#1E3A5F',
    width: 220, depth: 90, height: 85,
    price_delta: 800, status: 'active',
    created_at: NOW, updated_at: NOW,
  },
  {
    id: 'v-sed-black', product_id: 'p-vc-001', tenant_id: T,
    name: 'Negro Obsidiana', sku: 'VC-SED-001-BK', color: '#111827',
    width: 450, depth: 175, height: 145,
    price_delta: 0, status: 'active',
    created_at: NOW, updated_at: NOW,
  },
  {
    id: 'v-sed-white', product_id: 'p-vc-001', tenant_id: T,
    name: 'Blanco Perla', sku: 'VC-SED-001-WH', color: '#F9FAFB',
    width: 450, depth: 175, height: 145,
    price_delta: 5000, status: 'active',
    created_at: NOW, updated_at: NOW,
  },
  {
    id: 'v-sed-red', product_id: 'p-vc-001', tenant_id: T,
    name: 'Rojo Escarlata', sku: 'VC-SED-001-RD', color: '#DC2626',
    width: 450, depth: 175, height: 145,
    price_delta: 5000, status: 'active',
    created_at: NOW, updated_at: NOW,
  },
]
