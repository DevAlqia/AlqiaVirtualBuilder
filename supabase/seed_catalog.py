#!/usr/bin/env python3
"""
Alqia Virtual Builder — Seed de catálogo completo en Supabase
Genera ~400 productos en 39 categorías para 7 verticales industriales.
Precios en MXN. Mercado: México + LATAM.
"""

import uuid
import subprocess
import sys

# ─── Configuración ────────────────────────────────────────────────────────────
DB_URL = "postgresql://postgres@db.dfnwwmamcrssmhnjrmxa.supabase.co:5432/postgres"
PGPASSWORD = "Devalqia2026@"

TENANT_ID   = "00000000-0000-0000-0000-000000000001"
COMPANY_ID  = "00000000-0000-0000-0000-000000000002"
WORKSPACE_ID = "00000000-0000-0000-0000-000000000003"
NS = uuid.UUID("6ba7b810-9dad-11d1-80b4-00c04fd430c8")

def uid(seed: str) -> str:
    return str(uuid.uuid5(NS, seed))

def esc(s: str) -> str:
    return s.replace("'", "''")

# ─── Definición de categorías ─────────────────────────────────────────────────
# (sku_prefix, name, slug, order, vertical_key, description)
CATEGORIES = [
    # ── INDUSTRIAL STORAGE ────────────────────────────────────────────────────
    ("cat-ind-gab",  "Gabinetes de Acero",            "gabinetes-acero",      1,  "industrial_storage", "Gabinetes metálicos para almacenamiento industrial"),
    ("cat-ind-ana",  "Anaqueles y Estantería",         "anaqueles-estanteria", 2,  "industrial_storage", "Estantería metálica para bodega y almacén"),
    ("cat-ind-rak",  "Racks de Almacenamiento",        "racks-almacenamiento", 3,  "industrial_storage", "Sistemas de racks selectivos, drive-in, cantilever"),
    ("cat-ind-mes",  "Mesas y Bancos de Trabajo",      "mesas-bancos-trabajo", 4,  "industrial_storage", "Mesas industriales y bancos de trabajo ergonómicos"),
    ("cat-ind-loc",  "Casilleros y Lockers",           "casilleros-lockers",   5,  "industrial_storage", "Lockers metálicos para industria y vestuarios"),
    ("cat-ind-car",  "Carros y Transporte",            "carros-transporte",    6,  "industrial_storage", "Carros de transporte, plataformas y apiladores"),
    ("cat-ind-mez",  "Entrepisos y Mezzanine",         "entrepisos-mezzanine", 7,  "industrial_storage", "Estructuras de entrepiso y mezzanine industrial"),
    ("cat-ind-con",  "Contenedores y Tinas",           "contenedores-tinas",   8,  "industrial_storage", "Contenedores metálicos, tinas y cajas industriales"),
    # ── FURNITURE / KITCHEN / CLOSET ──────────────────────────────────────────
    ("cat-fk-mod",   "Cocinas Modernas",               "cocinas-modernas",     1,  "furniture_kitchen",  "Cocinas integrales estilo moderno y minimalista"),
    ("cat-fk-cla",   "Cocinas Clásicas y Coloniales",  "cocinas-clasicas",     2,  "furniture_kitchen",  "Cocinas estilo clásico, colonial y provenzal"),
    ("cat-fk-clo",   "Closets y Vestidores",           "closets-vestidores",   3,  "furniture_kitchen",  "Sistemas de closet corredizo, abatible y walk-in"),
    ("cat-fk-sal",   "Sala y Comedor",                 "sala-comedor",         4,  "furniture_kitchen",  "Sofás, sillones, comedores y mobiliario de sala"),
    ("cat-fk-rec",   "Recámara",                       "recamara",             5,  "furniture_kitchen",  "Camas, cabeceras, burós y muebles de recámara"),
    ("cat-fk-ban",   "Muebles de Baño",                "muebles-bano",         6,  "furniture_kitchen",  "Muebles bajo lavabo, espejos y columnas de baño"),
    ("cat-fk-ofi",   "Oficina en Casa",                "oficina-casa",         7,  "furniture_kitchen",  "Escritorios, libreros y sillas para home office"),
    # ── RETAIL LAYOUT ─────────────────────────────────────────────────────────
    ("cat-rt-gon",   "Góndolas y Estantería Retail",   "gondolas-retail",      1,  "retail_layout",      "Góndolas doble cara, sencilla y puntas de góndola"),
    ("cat-rt-caj",   "Módulos de Caja y POS",          "modulos-caja",         2,  "retail_layout",      "Mostradores de caja, POS y módulos de cobro"),
    ("cat-rt-exh",   "Exhibidores Especializados",      "exhibidores",          3,  "retail_layout",      "Vitrinas, exhibidores de ropa, joyería y tecnología"),
    ("cat-rt-far",   "Muebles de Farmacia",             "muebles-farmacia",     4,  "retail_layout",      "Estantería y mostradores especializados para farmacia"),
    ("cat-rt-bou",   "Muebles de Boutique",             "muebles-boutique",     5,  "retail_layout",      "Percheros, mesas y exhibidores para tienda de ropa"),
    ("cat-rt-sen",   "Señalética y Display",            "senaletica-display",   6,  "retail_layout",      "Paneles backlight, totems y displays digitales"),
    # ── REAL ESTATE ───────────────────────────────────────────────────────────
    ("cat-re-lob",   "Lobby y Áreas Comunes",          "lobby-areas-comunes",  1,  "real_estate",        "Mobiliario para lobby, recepción y áreas comunes"),
    ("cat-re-ame",   "Amenidades y Fitness",           "amenidades-fitness",   2,  "real_estate",        "Equipamiento para gimnasio, áreas recreativas y spa"),
    ("cat-re-dep",   "Departamento Tipo",              "departamento-tipo",    3,  "real_estate",        "Mobiliario completo para departamento modelo"),
    ("cat-re-coc",   "Cocina y Equipamiento",          "cocina-equipamiento",  4,  "real_estate",        "Cocinas integrales y equipamiento de departamento"),
    ("cat-re-hab",   "Habitaciones y Baños",           "habitaciones-banos",   5,  "real_estate",        "Mobiliario de recámara y baño para desarrollo"),
    # ── MEDICAL SPACE ─────────────────────────────────────────────────────────
    ("cat-md-con",   "Consultorio General",            "consultorio-general",  1,  "medical_space",      "Equipamiento básico para consultorio médico general"),
    ("cat-md-den",   "Equipamiento Dental",            "equipamiento-dental",  2,  "medical_space",      "Sillones, unidades y mobiliario para clínica dental"),
    ("cat-md-esp",   "Área de Espera y Recepción",     "espera-recepcion",     3,  "medical_space",      "Mobiliario para sala de espera y recepción clínica"),
    ("cat-md-est",   "Clínica Estética",               "clinica-estetica",     4,  "medical_space",      "Equipamiento para spa médico y clínica de estética"),
    ("cat-md-lab",   "Laboratorio y Quirófano",        "laboratorio",          5,  "medical_space",      "Muebles para laboratorio clínico y quirófano"),
    # ── EVENT STAND ───────────────────────────────────────────────────────────
    ("cat-ev-std",   "Stands Modulares",               "stands-modulares",     1,  "event_stand",        "Stands para exposición: básico, premium, isla"),
    ("cat-ev-mob",   "Mobiliario de Stand",            "mobiliario-stand",     2,  "event_stand",        "Mesas, sillas y muebles para stand de exposición"),
    ("cat-ev-pan",   "Paneles y Paredes",              "paneles-paredes",      3,  "event_stand",        "Paredes modulares, paneles backlit y backwall"),
    ("cat-ev-mos",   "Mostradores y Counters",         "mostradores-counters", 4,  "event_stand",        "Counters de recepción y mostradores para stand"),
    # ── VEHICLE CONFIGURATOR ──────────────────────────────────────────────────
    ("cat-vc-aut",   "Automóviles",                    "automoviles",          1,  "vehicle_configurator","Sedanes, SUVs y vehículos de pasajeros"),
    ("cat-vc-mot",   "Motocicletas y Especiales",      "motocicletas",         2,  "vehicle_configurator","Motos sport, naked, touring y scooters"),
    ("cat-vc-com",   "Vehículos Comerciales",          "vehiculos-comerciales",3,  "vehicle_configurator","Pickups, furgonetas y vehículos de trabajo"),
    ("cat-vc-shw",   "Showroom y Exhibición",          "showroom-exhibicion",  4,  "vehicle_configurator","Pedestales giratorios, bancas y mobiliario de agencia"),
]

# ─── Definición de productos ──────────────────────────────────────────────────
# (cat_id_ref, name, sku, desc_short, w_cm, d_cm, h_cm, color_hex, geometry, precio_mxn)
PRODUCTS = [

    # ═══════════════════════════════════════════════════════════════════════════
    # INDUSTRIAL STORAGE — Gabinetes de Acero
    # ═══════════════════════════════════════════════════════════════════════════
    ("cat-ind-gab", "Gabinete Industrial 2 Puertas 36\"",       "IND-GAB-036-AC", "Acero calibre 20, 3 entrepaños ajustables, pintura electrostática",    91, 46, 183, "#4A5568", "cabinet",    11800),
    ("cat-ind-gab", "Gabinete Industrial 2 Puertas 24\"",       "IND-GAB-024-AC", "Acero calibre 20, 2 entrepaños, cerradura con llave doble bola",        61, 46, 122, "#718096", "cabinet",     7900),
    ("cat-ind-gab", "Gabinete Industrial Ancho 48\"",           "IND-GAB-048-AC", "Acero calibre 18 reforzado, 4 entrepaños, uso intensivo",             122, 55, 200, "#2D3748", "cabinet",    18500),
    ("cat-ind-gab", "Gabinete Herramientas 4 Cajones",          "IND-GAB-CAJ-004","Acero 18 gauge, 4 cajones con corredera telescópica, balín",           76, 46, 107, "#1A202C", "cabinet",    14200),
    ("cat-ind-gab", "Gabinete Herramientas 7 Cajones",          "IND-GAB-CAJ-007","Acero 18 gauge, 7 cajones + compartimento superior, ruedas",           76, 46, 122, "#1F2937", "cabinet",    22500),
    ("cat-ind-gab", "Gabinete Eléctrico con Perforación",       "IND-GAB-ELE-001","Acero inoxidable 304, preperforado para tableros, IP54",               50, 40, 120, "#6B7280", "cabinet",    16800),
    ("cat-ind-gab", "Gabinete Bajo Mostrador 36\"",             "IND-GAB-BAJ-036","Acero calibre 20, 1 entrepaño, sin puertas superiores, uso taller",    91, 46,  87, "#374151", "cabinet",     8900),
    ("cat-ind-gab", "Gabinete 1 Puerta con Llave",             "IND-GAB-001-CHL","Acero calibre 22, candado incluido, uso almacén",                      46, 46, 122, "#9CA3AF", "cabinet",     6200),
    ("cat-ind-gab", "Gabinete Horizontal Plano",                "IND-GAB-HOR-001","Acero calibre 20, 3 cajones horizontales, llave, uso taller",         107, 46,  61, "#4B5563", "cabinet",    12400),
    ("cat-ind-gab", "Gabinete Doble Puerta Extra Alto",         "IND-GAB-XAL-001","Acero calibre 18, 5 entrepaños, 2.2m altura, alta capacidad",          91, 46, 220, "#1F2937", "cabinet",    21000),
    ("cat-ind-gab", "Gabinete Inoxidable Industria Alimentos",  "IND-GAB-INX-001","Acero inoxidable 304, para zona húmeda / HACCP, certificado",          91, 46, 183, "#E5E7EB", "cabinet",    34500),
    ("cat-ind-gab", "Gabinete con Ventilación Lateral",         "IND-GAB-VEN-001","Acero calibre 20, perforaciones laterales, disipación calor",          91, 46, 183, "#4A5568", "cabinet",    13200),

    # ═══════════════════════════════════════════════════════════════════════════
    # INDUSTRIAL STORAGE — Anaqueles y Estantería
    # ═══════════════════════════════════════════════════════════════════════════
    ("cat-ind-ana", "Anaquel Tubular 5 Niveles Económico",      "IND-ANA-TUB-005","Tubo cuadrado 1\", 5 tableros MDF reforzado, 200kg total",            90, 40, 175, "#9CA3AF", "shelf_rack",  3200),
    ("cat-ind-ana", "Anaquel Tubular 6 Niveles Reforzado",      "IND-ANA-TUB-006","Tubo cuadrado 1.5\", tablero MDF 19mm, 350kg total",                  90, 45, 200, "#6B7280", "shelf_rack",  4800),
    ("cat-ind-ana", "Anaquel Ángulo Ranurado 5 Niveles",        "IND-ANA-ANG-005","Ángulo ranurado galvanizado, repisa lámina, ajustable",                92, 50, 192, "#718096", "shelf_rack",  4200),
    ("cat-ind-ana", "Anaquel Metálico Galvanizado Industrial",  "IND-ANA-GAL-001","Lámina galvanizada calibre 18, 4 niveles, 500kg total, uso rudo",      90, 60, 180, "#9CA3AF", "shelf_rack",  6800),
    ("cat-ind-ana", "Anaquel Malla Metálica 4 Niveles",         "IND-ANA-MAL-004","Repisa de malla de alambre, ideal bodega por ventilación",             92, 50, 185, "#6B7280", "shelf_rack",  5400),
    ("cat-ind-ana", "Anaquel con Ruedas 4 Niveles",             "IND-ANA-RUE-004","Tubular con 4 ruedas giratorias (2 con freno), portable",              90, 45, 160, "#4B5563", "shelf_rack",  5200),
    ("cat-ind-ana", "Estante Archivero Metálico 4 Div",         "IND-ANA-ARC-004","4 divisiones horizontales, lateral calado, carpetas A4",               45, 38, 180, "#374151", "shelf_rack",  6100),
    ("cat-ind-ana", "Anaquel Farmacéutico 5 Niveles",           "IND-ANA-FAR-005","Aluminio extruido, blanco, apto zonas limpias",                        90, 40, 195, "#F9FAFB", "shelf_rack",  8900),
    ("cat-ind-ana", "Anaquel Doble Profundidad 4 Niveles",      "IND-ANA-DPR-004","Ángulo doble, profundidad 80cm, alta capacidad lateral",               92, 80, 185, "#718096", "shelf_rack",  7200),
    ("cat-ind-ana", "Anaquel Carga Pesada 3 Niveles",           "IND-ANA-CPE-003","Lámina calibre 14, 3 niveles, capacidad 300kg/nivel",                  92, 60, 150, "#374151", "shelf_rack",  9500),

    # ═══════════════════════════════════════════════════════════════════════════
    # INDUSTRIAL STORAGE — Racks de Almacenamiento
    # ═══════════════════════════════════════════════════════════════════════════
    ("cat-ind-rak", "Rack Selectivo Simple Longitud 2.7m",      "IND-RAK-SEL-027","Bastidor 6m, largueros 2.7m, capacidad 1500kg/nivel, montaforjas",   270, 110, 600, "#374151", "shelf_rack", 28500),
    ("cat-ind-rak", "Rack Selectivo Doble Fondo 2.7m",         "IND-RAK-SDF-027","2 posiciones profundidad, largueros 2.7m, ideal carga homogénea",     270, 220, 600, "#4B5563", "shelf_rack", 42000),
    ("cat-ind-rak", "Rack Cantilever Brazo Simple 2m",          "IND-RAK-CAN-200","Columna 6m, brazos 1m, ideal perfiles, tubos, madera",               200, 120, 600, "#374151", "shelf_rack", 35000),
    ("cat-ind-rak", "Rack Cantilever Brazo Doble 2m",           "IND-RAK-CAD-200","Doble acceso lateral, brazos 1m, carga 500kg/brazo",                 200, 240, 600, "#2D3748", "shelf_rack", 52000),
    ("cat-ind-rak", "Rack Drive-In 4 Niveles",                  "IND-RAK-DRI-004","Entrada de montaforjas, 4 niveles LIFO, alta densidad",              360, 110, 600, "#1F2937", "shelf_rack", 68000),
    ("cat-ind-rak", "Rack Push-Back 3 Posiciones",              "IND-RAK-PSH-003","Sistema por gravedad, 3 posiciones profundidad LIFO",                270, 330, 600, "#374151", "shelf_rack", 85000),
    ("cat-ind-rak", "Rack Dinámico por Gravedad",               "IND-RAK-DIN-001","Rodillos de gravedad, carga FIFO, ideal rotación rápida",            270, 330, 600, "#2D3748", "shelf_rack", 95000),
    ("cat-ind-rak", "Rack Para Llantas y Neumáticos",           "IND-RAK-LLA-001","Brazos en V para llantas, 5 niveles, capacidad 60 llantas",          180, 100, 500, "#1A202C", "shelf_rack", 18500),
    ("cat-ind-rak", "Rack Para Tarimas Pallet Flow",            "IND-RAK-PAL-001","Canal con rodillos, FIFO, ideal distribución de alimentos",          270, 330, 600, "#374151", "shelf_rack", 78000),
    ("cat-ind-rak", "Rack Para Cilindros y Gas",                "IND-RAK-CIL-001","Cadena de seguridad, 6 posiciones, 2 niveles",                       180,  80, 200, "#6B7280", "shelf_rack", 12800),
    ("cat-ind-rak", "Rack Picking 5 Niveles",                   "IND-RAK-PIK-005","Cajón metálico, 5 niveles x 4 posiciones, picking manual",           270, 110, 200, "#4A5568", "shelf_rack", 22000),
    ("cat-ind-rak", "Rack Mezzanine Entrepiso 6x3",             "IND-RAK-MEZ-001","Entrepiso metálico sobre rack, escalera + barandal, 3m altura",      600, 300, 600, "#2D3748", "shelf_rack",185000),

    # ═══════════════════════════════════════════════════════════════════════════
    # INDUSTRIAL STORAGE — Mesas y Bancos de Trabajo
    # ═══════════════════════════════════════════════════════════════════════════
    ("cat-ind-mes", "Mesa de Trabajo Industrial 150x75",        "IND-MES-150-001","Tablero lámina 12 gauge, patas calibre 14, ajustable 76-91cm",        150, 75,  87, "#374151", "box_flat",   8200),
    ("cat-ind-mes", "Mesa de Trabajo con 2 Cajones",            "IND-MES-CAJ-002","Tablero lámina 12 gauge + 2 cajones laterales, herraje telescópico",  150, 75,  87, "#2D3748", "box_flat",  12500),
    ("cat-ind-mes", "Mesa de Trabajo con Estante Inferior",     "IND-MES-EST-001","Tablero + repisa inferior, capacidad 300kg tablero",                  120, 60,  87, "#4A5568", "box_flat",   7800),
    ("cat-ind-mes", "Mesa Ergonómica Altura Ajustable",         "IND-MES-ERG-001","Altura 73-117cm, manivela lateral, capacidad 200kg",                 150, 75, 100, "#374151", "box_flat",  18900),
    ("cat-ind-mes", "Mesa Inoxidable 304 Soldada",              "IND-MES-INX-001","Acero inoxidable 304, soldada, pies con niv, zona húmeda HACCP",      150, 70,  90, "#E5E7EB", "box_flat",  24500),
    ("cat-ind-mes", "Banco de Trabajo con Pegboard 180cm",      "IND-MES-PEG-001","Tablero 1.8m, pegboard posterior, 2 cajones, 3 repisas",             180, 75,  90, "#1F2937", "box_flat",  22000),
    ("cat-ind-mes", "Mesa Esquinera Industrial 90°",            "IND-MES-ESQ-001","Configuración L, tablero continuo, ideal estaciones de trabajo",      150, 150, 87, "#374151", "box_flat",  16500),
    ("cat-ind-mes", "Mesa con Prensa Tornillo",                 "IND-MES-PRE-001","Tablero reforzado 14 gauge, prensa de tornillo 4\" integrada",        120, 75,  87, "#2D3748", "box_flat",  14200),
    ("cat-ind-mes", "Mesa Luz UV Inspección",                   "IND-MES-UV-001", "Tablero translúcido con luz UV inferior, inspección de partes",       90,  60,  90, "#1A202C", "box_flat",  28000),
    ("cat-ind-mes", "Banco de Trabajo ESD Anti-Estático",       "IND-MES-ESD-001","Superficie laminado ESD, tira aterrizado, electrónica sensible",      150, 75,  87, "#374151", "box_flat",  32000),

    # ═══════════════════════════════════════════════════════════════════════════
    # INDUSTRIAL STORAGE — Casilleros y Lockers
    # ═══════════════════════════════════════════════════════════════════════════
    ("cat-ind-loc", "Locker 1 Puerta Individual",               "IND-LOC-001-001","Acero calibre 20, 1 cuerpo, ventilación, gancho ropa, piso alto",     30, 50, 180, "#6B7280", "cabinet",    2800),
    ("cat-ind-loc", "Locker 2 Puertas Apilado",                 "IND-LOC-002-001","2 compartimentos verticales, 2 cerraduras, 1 cuerpo 30cm",            30, 50, 180, "#6B7280", "cabinet",    3200),
    ("cat-ind-loc", "Locker 4 Puertas Apilado",                 "IND-LOC-004-001","4 compartimentos, medio locker por persona, 1 cuerpo 30cm",           30, 50, 180, "#6B7280", "cabinet",    3800),
    ("cat-ind-loc", "Locker 6 Puertas Apilado",                 "IND-LOC-006-001","6 pequeños compartimentos, porta candado, vestuario industrial",      30, 50, 180, "#6B7280", "cabinet",    4200),
    ("cat-ind-loc", "Locker Banco 3 Cuerpos 1 Puerta",          "IND-LOC-BAN-003","Módulo de 3 cuerpos alineados, 3 puertas, base con banco integrado",  90, 50, 180, "#4B5563", "cabinet",    9800),
    ("cat-ind-loc", "Locker Guarda Cascos y EPP",               "IND-LOC-EPP-001","Diseñado para casco, chaleco, guantes, uso zona de seguridad",        45, 50, 185, "#F59E0B", "cabinet",    5200),
    ("cat-ind-loc", "Locker Acero Inoxidable 1 Puerta",         "IND-LOC-INX-001","Inox 304, uso industria alimentaria o farmacéutica",                  30, 50, 180, "#E5E7EB", "cabinet",    6800),
    ("cat-ind-loc", "Locker con Cargador USB 4 Puertas",        "IND-LOC-USB-004","4 compartimentos con punto de carga USB integrado, 5A",               40, 50, 180, "#374151", "cabinet",    8500),

    # ═══════════════════════════════════════════════════════════════════════════
    # INDUSTRIAL STORAGE — Carros y Transporte
    # ═══════════════════════════════════════════════════════════════════════════
    ("cat-ind-car", "Carro Plataforma 500kg",                   "IND-CAR-PLA-500","Lámina 10 gauge, 4 ruedas poliuretano, manija plegable, 500kg",       120, 70,  20, "#374151", "box_flat",   4800),
    ("cat-ind-car", "Carro 3 Repisas Metálico",                 "IND-CAR-REP-003","3 tableros lámina 14 gauge, ruedas 5\", max 300kg",                   90,  55, 130, "#6B7280", "shelf_rack",  3900),
    ("cat-ind-car", "Carro Hidráulico Pallet Jack 2500kg",      "IND-CAR-HID-250","Acción hidráulica, horquillas 115cm, ruedas poliuretano, 2500kg",     190, 52,  21, "#F59E0B", "box_flat",  12500),
    ("cat-ind-car", "Diablito de Mano 250kg",                   "IND-CAR-DIA-250","Acero calibre 14, ruedas 10\", capacidad 250kg, plegable",            50,  45, 130, "#374151", "box_flat",   2200),
    ("cat-ind-car", "Carro Para Cilindros de Gas",              "IND-CAR-CIL-002","2 cilindros verticales, cadena seguridad, ruedas hule",               50,  50, 120, "#6B7280", "box_flat",   3500),
    ("cat-ind-car", "Carro Porta Bobinas y Rollos",             "IND-CAR-BOB-001","Eje horizontal, capacidad 500kg, ideal rollos film, papel",           60,  80,  80, "#4B5563", "box_flat",   5800),
    ("cat-ind-car", "Apilador Manual 500kg",                    "IND-CAR-API-500","Elevación 1.6m, ancho horquillas 68cm, sin motor, esfuerzo mínimo",  160,  80, 200, "#1F2937", "box_flat",  18500),
    ("cat-ind-car", "Jaula Metálica Plegable 1000kg",           "IND-CAR-JAU-001","Acero 4mm, plegable, 4 ruedas, apilable vacía, 1000kg",              120,  80, 100, "#374151", "box_flat",   8900),

    # ═══════════════════════════════════════════════════════════════════════════
    # INDUSTRIAL STORAGE — Entrepisos y Mezzanine
    # ═══════════════════════════════════════════════════════════════════════════
    ("cat-ind-mez", "Plataforma Mezzanine 6x4m Tipo A",         "IND-MEZ-6X4-A",  "Estructura primaria W, cubierta rejilla, 1000kg/m², escalera",       600, 400, 300, "#2D3748", "shelf_rack",125000),
    ("cat-ind-mez", "Plataforma Mezzanine 8x6m Tipo B",         "IND-MEZ-8X6-B",  "Columnas IPR, viga secundaria, cubierta losa metálica, barandal",    800, 600, 300, "#1F2937", "shelf_rack",198000),
    ("cat-ind-mez", "Escalera Industrial Recta 3m",             "IND-MEZ-ESC-300","Huella antiderrapante, barandal doble, 30cm ancho peldaño",           90,  70, 300, "#374151", "shelf_rack",  8500),
    ("cat-ind-mez", "Barandal Metálico ml",                     "IND-MEZ-BAR-001","Tubo 2\" + balaustres, poste cada 1.2m, 1.1m altura, galvanizado",   100, 10, 110, "#6B7280", "shelf_rack",  2800),
    ("cat-ind-mez", "Plataforma Modular 3x3 Sobre Rack",        "IND-MEZ-MOD-001","Sistema modular sobre rack selectivo existente, 600kg/m²",           300, 300, 600, "#374151", "shelf_rack", 68000),

    # ═══════════════════════════════════════════════════════════════════════════
    # INDUSTRIAL STORAGE — Contenedores y Tinas
    # ═══════════════════════════════════════════════════════════════════════════
    ("cat-ind-con", "Tina Metálica con Tapa 800L",              "IND-CON-TIN-800","Lámina 12 gauge, tapa articulada, uso SSGG o residuos sólidos",       120, 80,  90, "#374151", "box_flat",   6800),
    ("cat-ind-con", "Caja Metálica Apilable 600x400mm",         "IND-CON-CAJ-640","Lámina 1.5mm, apilable, manija lateral, ideal piezas pequeñas",       60,  40,  32, "#6B7280", "box_flat",    850),
    ("cat-ind-con", "Contenedor Metálico Plegable 800L",        "IND-CON-PLG-800","Plegable vacío, 4 ruedas, paleta base incluida, apilable",            120, 80, 100, "#2D3748", "box_flat",  12500),
    ("cat-ind-con", "Tarima Industrial Plástica 1200x1000",     "IND-CON-TAR-001","HDPE reforzado, 4 entradas, 1500kg estático, 500kg dinámico",         120, 100, 15, "#9CA3AF", "box_flat",   2200),
    ("cat-ind-con", "Caja Plegable Plástica Retornable",        "IND-CON-CRP-001","PP copolímero, plegable 40%, apilable, carga 50kg, lavable",          60,  40,  28, "#374151", "box_flat",    680),

    # ═══════════════════════════════════════════════════════════════════════════
    # FURNITURE / KITCHEN — Cocinas Modernas
    # ═══════════════════════════════════════════════════════════════════════════
    ("cat-fk-mod", "Cocina Moderna Lineal 2.4m MDF PVC",       "FK-COC-MOD-240", "Módulos bajos + altos, MDF 18mm + PVC liso, cubierta postformada",    240, 60, 210, "#F3F4F6", "kitchen_unit", 42000),
    ("cat-fk-mod", "Cocina Moderna Lineal 3.0m MDF PVC",       "FK-COC-MOD-300", "Módulos bajos + altos, MDF 18mm + PVC liso, cubierta mármol",         300, 60, 210, "#E5E7EB", "kitchen_unit", 58000),
    ("cat-fk-mod", "Cocina Moderna Lineal 4.0m MDF PVC",       "FK-COC-MOD-400", "Módulos bajos + altos full, MDF 18mm + PVC mate, cubierta cuarzo",    400, 60, 210, "#F3F4F6", "kitchen_unit", 78000),
    ("cat-fk-mod", "Cocina Moderna en L 2.4x1.8m",             "FK-COC-MOD-L24", "Configuración L, MDF + acrílico, cubierta granito, 2 esquineros",     240, 180,210, "#E5E7EB", "kitchen_unit", 72000),
    ("cat-fk-mod", "Cocina Moderna en L 3.0x2.0m",             "FK-COC-MOD-L30", "Configuración L, MDF + laca UV brillante, cubierta cuarzo Silestone", 300, 200,210, "#F9FAFB", "kitchen_unit", 98000),
    ("cat-fk-mod", "Cocina Moderna en U 3.0x2.4m",             "FK-COC-MOD-U30", "Configuración U completa, acrílico mate, isla incluida",              300, 240,210, "#F3F4F6", "kitchen_unit",135000),
    ("cat-fk-mod", "Isla de Cocina Central 180x90",            "FK-COC-ISL-180", "Isla independiente, MDF PVC, cubierta cuarzo, 4 cajones",             180, 90,  90, "#E5E7EB", "kitchen_unit", 28500),
    ("cat-fk-mod", "Isla de Cocina con Comedor 200x100",       "FK-COC-ISL-COM", "Isla con extensión barra desayunador, 4 bancos incluidos",            200, 100, 90, "#F3F4F6", "kitchen_unit", 45000),
    ("cat-fk-mod", "Alacena Alta Torre 60cm MDF",              "FK-COC-ALA-060", "Torre despensero, MDF 18mm + PVC, 6 entrepaños ajustables",           60,  38, 210, "#E5E7EB", "cabinet",      12800),
    ("cat-fk-mod", "Módulo Bajo Universal 60cm",               "FK-COC-MBJ-060", "Módulo base con 1 cajón + 1 puerta, MDF PVC, bisagra Blum",           60,  60,  87, "#F3F4F6", "cabinet",       6800),
    ("cat-fk-mod", "Módulo Alto Universal 60cm",               "FK-COC-MAL-060", "Módulo de pared, 2 puertas, MDF PVC, bisagra Blum amortiguada",       60,  35,  70, "#E5E7EB", "cabinet",       5200),
    ("cat-fk-mod", "Campana Extractora Decorativa 90cm",       "FK-COC-CAM-090", "Cristal templado + acero inoxidable, motor 600 m³/h",                 90,  50,  60, "#1F2937", "cabinet",      18500),
    ("cat-fk-mod", "Cocina Moderna Acr Laca UV 3.0m",          "FK-COC-ALC-300", "Acrílico de alto brillo + laca UV, bisagras Blum, jaladera oculta",   300, 60, 210, "#F9FAFB", "kitchen_unit", 88000),
    ("cat-fk-mod", "Cocina Moderna Madera Natural 3.0m",       "FK-COC-MAD-300", "Chapa de madera natural roble, cubierta mármol Carrara",              300, 60, 210, "#D97706", "kitchen_unit",115000),

    # ═══════════════════════════════════════════════════════════════════════════
    # FURNITURE / KITCHEN — Cocinas Clásicas y Coloniales
    # ═══════════════════════════════════════════════════════════════════════════
    ("cat-fk-cla", "Cocina Colonial 2.4m Madera Pino",         "FK-COC-COL-240", "Madera pino sólido, tallado manual, bisagra vista, barniz",           240, 60, 210, "#92400E", "kitchen_unit", 68000),
    ("cat-fk-cla", "Cocina Colonial 3.0m Madera Pino",         "FK-COC-COL-300", "Madera pino sólido, tallado manual, cubierta granito negro",          300, 60, 210, "#78350F", "kitchen_unit", 88000),
    ("cat-fk-cla", "Cocina Colonial en L 2.4x1.8m",            "FK-COC-COL-L24", "Configuración L, madera pino con envejecido, cubierta cantera",       240, 180,210, "#92400E", "kitchen_unit",115000),
    ("cat-fk-cla", "Cocina Rústica Madera Mezquite 2.4m",      "FK-COC-RUS-240", "Mezquite vetas naturales, cubierta quartzite, fragua de greda",       240, 60, 210, "#78350F", "kitchen_unit",145000),
    ("cat-fk-cla", "Cocina Provenzal MDF Lacado Blanco 3m",    "FK-COC-PRO-300", "MDF con moldura perfil provenzal, laca blanca mate, cubierta mármol", 300, 60, 210, "#F9FAFB", "kitchen_unit", 92000),
    ("cat-fk-cla", "Cocina Hamptons MDF Bicolor 3m",           "FK-COC-HAM-300", "Módulos blancos abajo, azul navy arriba, cubierta cuarzo gris",       300, 60, 210, "#1E3A5F", "kitchen_unit", 98000),
    ("cat-fk-cla", "Módulo Colonial Despensero 60cm",          "FK-COC-DES-COL", "Torre pino sólido, 5 entrepaños, tallado capitel, bisagra vista",     60,  38, 210, "#92400E", "cabinet",      22000),
    ("cat-fk-cla", "Módulo Bajo Colonial 60cm Madera",         "FK-COC-MBJ-COL", "Pino sólido, 1 puerta con perfil clásico, cubierta cerámica",         60,  60,  87, "#78350F", "cabinet",       9800),

    # ═══════════════════════════════════════════════════════════════════════════
    # FURNITURE / KITCHEN — Closets y Vestidores
    # ═══════════════════════════════════════════════════════════════════════════
    ("cat-fk-clo", "Closet Corredera 2 Puertas 150cm",         "FK-CLO-COR-150", "MDF + PVC liso, 2 puertas corredizas, sistema Raumplus, interior",    150, 65, 240, "#E5E7EB", "closet",       18500),
    ("cat-fk-clo", "Closet Corredera 3 Puertas 210cm",         "FK-CLO-COR-210", "MDF + PVC liso, 3 puertas, interior doble módulo zapatero + cajones", 210, 65, 240, "#F3F4F6", "closet",       28000),
    ("cat-fk-clo", "Closet Corredera Espejo 180cm",            "FK-CLO-ESP-180", "2 puertas espejo, interior completo, cuerpos a techo, 6 módulos",     180, 65, 240, "#D1D5DB", "closet",       32000),
    ("cat-fk-clo", "Closet Abatible 2 Puertas 120cm",         "FK-CLO-ABA-120", "MDF 18mm, bisagra Blum, interior básico cajones + barra",             120, 60, 240, "#F3F4F6", "closet",       14500),
    ("cat-fk-clo", "Walk-In Vestidor 2.4x1.8m Básico",        "FK-CLO-WIN-240", "Sistema modular isla + lateral, MDF + PVC, barra + cajones",          240, 180,240, "#E5E7EB", "closet",       42000),
    ("cat-fk-clo", "Walk-In Vestidor 3.0x2.4m Premium",       "FK-CLO-WIN-300", "Sistema completo con isla, iluminación LED, espejos y puerta corredera",300, 240,240, "#F3F4F6", "closet",       78000),
    ("cat-fk-clo", "Walk-In Vestidor 4.0x3.0m Lujo",          "FK-CLO-WIN-400", "Madera, isla + percheros dobles + cajones joyero, tapizado",          400, 300,240, "#D97706", "closet",      145000),
    ("cat-fk-clo", "Torre Closet 60cm con Cajones",            "FK-CLO-TOR-060", "MDF PVC, 1 cuerpo, 4 cajones + entrepaño + barra corta",              60,  60, 240, "#E5E7EB", "cabinet",       8800),
    ("cat-fk-clo", "Módulo Zapatero 10 Pares",                 "FK-CLO-ZAP-010", "MDF PVC, inclinado, 5 niveles, 10 pares de zapatos",                  90,  35,  90, "#F3F4F6", "shelf_rack",    4800),
    ("cat-fk-clo", "Módulo Accesorio con Espejo",              "FK-CLO-ACC-001", "Módulo 45cm, espejo interior, 3 cajones joyero, gancho",              45,  50, 180, "#D1D5DB", "cabinet",       6800),
    ("cat-fk-clo", "Closet Vestidor Esquinero L 180x180",      "FK-CLO-ESQ-180", "Configuración L, interior completo, acceso doble",                    180, 180,240, "#E5E7EB", "closet",       38000),
    ("cat-fk-clo", "Sistema Deslizante Minimalista 240cm",     "FK-CLO-MIN-240", "Perfil de aluminio, panel lacado blanco, mínimo espesor 7cm",         240, 12, 240, "#F9FAFB", "panel_v",      22000),

    # ═══════════════════════════════════════════════════════════════════════════
    # FURNITURE / KITCHEN — Sala y Comedor
    # ═══════════════════════════════════════════════════════════════════════════
    ("cat-fk-sal", "Sofá 2 Plazas Tapizado Tela",              "FK-SAL-SOF-002", "Estructura madera, tapizado tela antimanchas, cojines pluma",         165, 90,  87, "#6B7280", "seating",      18500),
    ("cat-fk-sal", "Sofá 3 Plazas Tapizado Tela",              "FK-SAL-SOF-003", "Estructura madera, tapizado tela antimanchas, cojines pluma",         225, 90,  87, "#4B5563", "seating",      26000),
    ("cat-fk-sal", "Sofá Seccional en L Izquierdo",            "FK-SAL-SEC-L",   "Seccional izquierdo, tela premium antimanchas, 5 cuerpos",            280, 180, 87, "#374151", "seating",      42000),
    ("cat-fk-sal", "Sillón Individual Tapizado",               "FK-SAL-SIL-001", "Sillón accent, tapizado tela, estructura madera, patas metal",        85,  80,  87, "#78350F", "seating",       9800),
    ("cat-fk-sal", "Mesa de Centro Madera-Metal",              "FK-SAL-CEN-001", "Tablero madera + base metálica, 120x60cm",                            120, 60,  42, "#92400E", "box_flat",      8500),
    ("cat-fk-sal", "Comedor 4 Personas Rectangular",           "FK-SAL-COM-004", "Mesa MDF + PVC, 4 sillas tapizadas, patas metal",                    140, 80,  75, "#374151", "box_flat",     18500),
    ("cat-fk-sal", "Comedor 6 Personas Rectangular",           "FK-SAL-COM-006", "Mesa madera + 6 sillas tapizadas, extensible +40cm",                  180, 90,  75, "#2D3748", "box_flat",     28000),
    ("cat-fk-sal", "Comedor 8 Personas Extensible",            "FK-SAL-COM-008", "Mesa madera natural, 8 sillas tapizadas, patas acero inox",           220, 100, 75, "#1F2937", "box_flat",     48000),
    ("cat-fk-sal", "Vitrina Sala 4 Puertas",                   "FK-SAL-VIT-004", "MDF + PVC, 2 puertas vidrio + 2 ciegas, interior iluminado",          120, 40, 190, "#F3F4F6", "cabinet",      18500),
    ("cat-fk-sal", "Bufete / Aparador Sala",                   "FK-SAL-BUF-001", "MDF + chapa madera, 3 cajones + 2 puertas, cubierta mármol",          160, 45,  85, "#92400E", "cabinet",      22000),
    ("cat-fk-sal", "Bar Modular con Vinoteca",                 "FK-SAL-BAR-001", "MDF lacado + vidrio, porta vinos 20 botellas + 2 cajones",            120, 50, 180, "#1F2937", "cabinet",      28500),
    ("cat-fk-sal", "Mesa Comedor Redonda 120cm",               "FK-SAL-RED-120", "Madera + pedestal metálico, extensible, 4-6 personas",                120, 120, 75, "#78350F", "box_flat",     22000),

    # ═══════════════════════════════════════════════════════════════════════════
    # FURNITURE / KITCHEN — Recámara
    # ═══════════════════════════════════════════════════════════════════════════
    ("cat-fk-rec", "Cama Matrimonial 1.35m con Cabecera",      "FK-REC-CAM-135", "Base MDF PVC, cabecera tapizada, base box incluida",                  150, 200, 50, "#374151", "box_flat",     14500),
    ("cat-fk-rec", "Cama Queen 1.50m con Cabecera",            "FK-REC-CAM-150", "Base MDF PVC, cabecera tapizada, base box incluida",                  165, 210, 50, "#2D3748", "box_flat",     18500),
    ("cat-fk-rec", "Cama King 1.80m con Cabecera",             "FK-REC-CAM-180", "Base MDF PVC, cabecera tapizada premium, base box incluida",          195, 215, 50, "#1F2937", "box_flat",     25000),
    ("cat-fk-rec", "Cabecera Tapizada Queen 160cm",            "FK-REC-CAB-160", "Tapizado tela o piel sintética, espaldar 120cm altura, acolchado",    160,  15, 120, "#6B7280", "panel_v",       6800),
    ("cat-fk-rec", "Buró 2 Cajones MDF PVC",                   "FK-REC-BUR-002", "MDF PVC, 2 cajones suaves, jaladeras metálicas, 50x40x55cm",          50,  40,  55, "#E5E7EB", "cabinet",       3800),
    ("cat-fk-rec", "Cómoda 5 Cajones MDF PVC",                 "FK-REC-COM-005", "MDF PVC, 5 cajones, corredera telescópica, jaladeras slim",           100, 45,  95, "#F3F4F6", "cabinet",      12500),
    ("cat-fk-rec", "Chest / Mueble Alto 4 Cajones",            "FK-REC-CHE-004", "MDF PVC, 4 cajones amplios, 100x45x120cm",                           100, 45, 120, "#E5E7EB", "cabinet",      14500),
    ("cat-fk-rec", "Tocador con Espejo y 3 Cajones",           "FK-REC-TOC-001", "MDF PVC, espejo 80x60cm, iluminación LED, 3 cajones",                120, 50, 160, "#F3F4F6", "cabinet",      18500),
    ("cat-fk-rec", "Cama Individual 90cm con Cajones",         "FK-REC-IND-090", "Base MDF PVC, 2 cajones integrados, cabecera tapizada",              105, 200, 50, "#4B5563", "box_flat",      9800),
    ("cat-fk-rec", "Litera Individual con Escalera",           "FK-REC-LIT-001", "MDF PVC, cama alta + baja, escalera integrada, barandal seguridad",  105, 200,160, "#374151", "box_flat",     12800),

    # ═══════════════════════════════════════════════════════════════════════════
    # FURNITURE / KITCHEN — Muebles de Baño
    # ═══════════════════════════════════════════════════════════════════════════
    ("cat-fk-ban", "Mueble Bajo Lavabo 60cm Suspendido",       "FK-BAN-LAV-060", "MDF hidroresistente, 1 cajón + 2 puertas, cubierta porcelana",        60,  45,  55, "#F9FAFB", "cabinet",       8800),
    ("cat-fk-ban", "Mueble Doble Lavabo 120cm",                "FK-BAN-LAV-120", "MDF + lacado, 4 cajones, doble lavabo porcelana integrado",           120, 50,  55, "#F3F4F6", "cabinet",      22000),
    ("cat-fk-ban", "Espejo LED con Estante 80cm",              "FK-BAN-ESP-080", "Espejo 80x70cm, iluminación LED perimetral, IP44, touch",             80,  10,  70, "#F9FAFB", "panel_v",       8500),
    ("cat-fk-ban", "Botiquín Empotrado 45cm",                  "FK-BAN-BOT-045", "Empotramiento mínimo 10cm, 3 entrepaños ajustables, bisagra",         45,  15,  60, "#F3F4F6", "cabinet",       3500),
    ("cat-fk-ban", "Columna Toallero Baño 30cm",               "FK-BAN-COL-030", "MDF hidroresistente, 1 puerta + 1 cajón, 30x30x180cm",               30,  30, 180, "#F9FAFB", "cabinet",       5200),
    ("cat-fk-ban", "Mueble Lavatrastos 2 Puertas",             "FK-BAN-LVT-001", "Polipropileno, tarja acero inox integrada, 2 puertas, 120x60x90cm",  120, 60,  90, "#F3F4F6", "cabinet",      12800),
    ("cat-fk-ban", "Mueble Tina Exenta 170cm",                 "FK-BAN-TIN-170", "Acrílico termoformado + base MDF, tina 170x75cm freestanding",       170, 80,  60, "#F9FAFB", "box_flat",     28500),
    ("cat-fk-ban", "Mueble Baño Flotante Minimalista 80cm",    "FK-BAN-MIN-080", "MDF lacado, sin patas, 2 cajones push-to-open, cubierta cuarzo",      80,  45,  55, "#1F2937", "cabinet",      14500),

    # ═══════════════════════════════════════════════════════════════════════════
    # FURNITURE / KITCHEN — Oficina en Casa
    # ═══════════════════════════════════════════════════════════════════════════
    ("cat-fk-ofi", "Escritorio Ejecutivo Recto 150cm",         "FK-OFI-ESC-150", "MDF PVC, 1 cajón + pedestal 3 cajones, 150x75cm",                    150, 75,  75, "#374151", "box_flat",      9800),
    ("cat-fk-ofi", "Escritorio en L 150x120cm",               "FK-OFI-ESC-L15", "Configuración L, MDF PVC, pedestal 3 cajones, panel posterior",       150, 120, 75, "#2D3748", "box_flat",     14500),
    ("cat-fk-ofi", "Librero Abierto 90cm 5 Repisas",           "FK-OFI-LIB-090", "MDF + PVC liso, 5 repisas ajustables, 90x30x200cm",                  90,  30, 200, "#F3F4F6", "shelf_rack",    6800),
    ("cat-fk-ofi", "Librero con Puertas Inferiores 90cm",      "FK-OFI-LIB-P90", "MDF PVC, 3 repisas abiertas + 2 puertas, 90x35x200cm",               90,  35, 200, "#E5E7EB", "cabinet",       8800),
    ("cat-fk-ofi", "Credenza Oficina 120cm 3 Cajones",         "FK-OFI-CRE-120", "MDF PVC, 3 cajones + 2 puertas, 120x45x75cm",                        120, 45,  75, "#374151", "cabinet",      12500),
    ("cat-fk-ofi", "Silla Ejecutiva Malla Ergonómica",         "FK-OFI-SIL-EJE", "Malla transpirable, lumbosacro ajustable, brazos 4D, ruedas",         65,  65, 110, "#1F2937", "seating",       8500),
    ("cat-fk-ofi", "Silla de Visita Tapizada",                 "FK-OFI-SIL-VIS", "Tapizado tela, estructura metálica, sin ruedas, apilable",            55,  55,  85, "#4B5563", "seating",       2800),
    ("cat-fk-ofi", "Mesa de Reuniones 180x90cm",               "FK-OFI-REU-180", "MDF PVC, 6-8 personas, patas metálicas, gestión cables",             180,  90,  75, "#2D3748", "box_flat",     15500),

    # ═══════════════════════════════════════════════════════════════════════════
    # RETAIL LAYOUT — Góndolas y Estantería Retail
    # ═══════════════════════════════════════════════════════════════════════════
    ("cat-rt-gon", "Góndola Doble Cara 4 Niveles 90cm",        "RT-GON-DC4-090", "Perfil metálico calibre 18, 4 niveles/cara, patas niveladoras",        90, 60, 155, "#374151", "gondola",       5800),
    ("cat-rt-gon", "Góndola Doble Cara 5 Niveles 90cm",        "RT-GON-DC5-090", "Perfil metálico calibre 18, 5 niveles/cara, ideal supermercado",       90, 60, 180, "#374151", "gondola",       6200),
    ("cat-rt-gon", "Góndola Doble Cara 6 Niveles 90cm",        "RT-GON-DC6-090", "Calibre 18, 6 niveles/cara, cabecero incluido",                        90, 60, 200, "#2D3748", "gondola",       6800),
    ("cat-rt-gon", "Góndola Sencilla 5 Niveles 90cm",          "RT-GON-SC5-090", "Perfil pared, 5 niveles, para muros laterales, instalación fácil",     45, 40, 180, "#4B5563", "gondola",       3800),
    ("cat-rt-gon", "Punta de Góndola con Cabecero",            "RT-GON-PUN-001", "Terminación de pasillo, 4 niveles, panel de fondo incluido",           90, 40, 180, "#374151", "gondola",       4500),
    ("cat-rt-gon", "Góndola Isla Redonda 4 Módulos",           "RT-GON-ISL-004", "4 módulos radiales, expositor central, para zona premium",            120, 120,160, "#2D3748", "gondola",      18500),
    ("cat-rt-gon", "Rack de Ropa Circular Giratorio",          "RT-GON-ROP-CIR", "Base giratoria, 2 niveles de barras, capacidad 80 prendas",            80,  80, 160, "#374151", "gondola",       5200),
    ("cat-rt-gon", "Exhibidor de Vinos 30 Botellas",           "RT-GON-VIN-030", "MDF + metal, angulado 15°, 30 botellas, iluminación LED",              90,  40, 160, "#78350F", "gondola",       8800),
    ("cat-rt-gon", "Frutera / Verdulera Escalonada",           "RT-GON-FRU-001", "Acero galvanizado + madera, 5 niveles inclinados, desagüe",            90,  60, 180, "#374151", "gondola",       9500),
    ("cat-rt-gon", "Nevera Display Vertical 2 Puertas",        "RT-GON-NEV-002", "Evaporador estático, 600L, 2°-8°C, iluminación LED, vidrio ant-empaño",60, 70, 200, "#1F2937", "cabinet",      38500),
    ("cat-rt-gon", "Estante Farmacia de Madera Blanca 90cm",   "RT-GON-FAR-090", "MDF lacado blanco, 6 repisas anguladas, divisores incluidos",          90,  30, 180, "#F9FAFB", "gondola",       4800),
    ("cat-rt-gon", "Góndola Metálica Galvanizada 90cm",        "RT-GON-GAL-090", "Galvanizado en caliente, uso exterior o zona húmeda",                  90,  60, 180, "#9CA3AF", "gondola",       7200),
    ("cat-rt-gon", "Mueble Display Colchones 4 Posiciones",    "RT-GON-COL-004", "Base metálica inclinada, 4 colchones en exposición, ruedas",          240,  80, 200, "#374151", "gondola",      12500),
    ("cat-rt-gon", "Rack para Llantas Retail 6 Posiciones",    "RT-GON-LLA-006", "Acero tubular, 6 llantas en exposición, base niveladoras",             90,  60, 160, "#1F2937", "gondola",       5500),

    # ═══════════════════════════════════════════════════════════════════════════
    # RETAIL LAYOUT — Módulos de Caja y POS
    # ═══════════════════════════════════════════════════════════════════════════
    ("cat-rt-caj", "Módulo Caja Recto 120cm",                  "RT-CAJ-REC-120", "MDF PVC, frente + lateral, cubierta postformada, canaleta POS",       120, 65,  95, "#374151", "counter",       9800),
    ("cat-rt-caj", "Módulo Caja Doble Frente 200cm",           "RT-CAJ-DOB-200", "2 cajas en línea, MDF PVC, cubierta mármol, 2 cajones caja",          200, 65,  95, "#2D3748", "counter",      18500),
    ("cat-rt-caj", "Mostrador en L con Regresa",               "RT-CAJ-ELE-L",   "Configuración L, MDF PVC, zona cobro + zona empaque",                 150, 150, 95, "#374151", "counter",      15500),
    ("cat-rt-caj", "Módulo Servicio Farmacia Reglamentario",   "RT-CAJ-FAR-001", "MDF blanco, estante colgante, canaleta farmacia, regulación COFEPRIS", 150, 65, 120, "#F9FAFB", "counter",      14500),
    ("cat-rt-caj", "Módulo Autoservicio POS 80cm",             "RT-CAJ-AUT-080", "Compacto, para cobro rápido, cajón caja + soporte terminal",           80,  60,  95, "#1F2937", "counter",       8800),
    ("cat-rt-caj", "Mostrador Informes Circular",              "RT-CAJ-INF-CIR", "Base circular 120cm, MDF PVC, cubierta cuarzo, bajo-mostrador",       120, 120, 95, "#374151", "counter",      22000),
    ("cat-rt-caj", "Mostrador Tienda Boutique 100cm",          "RT-CAJ-BOU-100", "MDF lacado, vidrio frontal 4mm, cubierta cristal, bajo joyería",       100, 50,  95, "#F3F4F6", "counter",      12500),
    ("cat-rt-caj", "Módulo Caja Supermercado con Banda",       "RT-CAJ-SUP-160", "MDF laminado, banda transportadora 1.0m incluida, cajón caja",        160, 75,  95, "#374151", "counter",      28500),

    # ═══════════════════════════════════════════════════════════════════════════
    # RETAIL LAYOUT — Exhibidores Especializados
    # ═══════════════════════════════════════════════════════════════════════════
    ("cat-rt-exh", "Vitrina Joyería Full Vidrio 120cm",        "RT-EXH-JOY-120", "Aluminio + vidrio 6mm, iluminación LED interior, cerradura",          120, 50,  95, "#F9FAFB", "cabinet",      14500),
    ("cat-rt-exh", "Vitrina Celulares y Accesorios 100cm",     "RT-EXH-CEL-100", "Aluminio + vidrio, frente + lateral vidrio, iluminación tiras LED",   100, 50,  95, "#1F2937", "cabinet",      12500),
    ("cat-rt-exh", "Exhibidor Zapatos Torre 4 Niveles",        "RT-EXH-ZAP-004", "MDF lacado, 4 niveles, 20 pares, inclinado 15°, luz LED",              45, 35, 180, "#374151", "shelf_rack",    6800),
    ("cat-rt-exh", "Rack Ropa Cromo 2 Bras Doble",             "RT-EXH-ROP-CRO", "Tubería cromo 50mm, barra doble, ruedas bloqueables",                  90,  55, 170, "#9CA3AF", "gondola",       4200),
    ("cat-rt-exh", "Exhibidor Óptica 20 Marcos",               "RT-EXH-OPT-020", "Aluminio, 20 posiciones, espejo lateral, iluminación LED",             40,  20, 120, "#374151", "shelf_rack",    8500),
    ("cat-rt-exh", "Display Cosméticos Giratorio 4 Pisos",     "RT-EXH-COS-004", "Acrílico, giratoria, 4 pisos x 8 posiciones = 32 piezas",              30,  30, 120, "#F9FAFB", "gondola",       3800),
    ("cat-rt-exh", "Exhibidor Libros Inclinado 6 Repisas",     "RT-EXH-LIB-006", "MDF PVC, 6 repisas inclinadas, porta precio",                          60,  30, 180, "#374151", "shelf_rack",    5200),
    ("cat-rt-exh", "Display Electrónica con Seguridad",        "RT-EXH-ELE-001", "MDF + vidrio, cerradura, soporte tablet/laptop, cable retractil",      120, 50,  95, "#1F2937", "cabinet",      16500),
    ("cat-rt-exh", "Exhibidor Deportes Bicicletas 6 pz",       "RT-EXH-DEP-001", "Estructura metálica, ganchos en "F", 6 bicicletas colgantes",           90, 100, 200, "#374151", "shelf_rack",   8800),
    ("cat-rt-exh", "Mueble Colchoneta Exhibición 4 pos",       "RT-EXH-COL-004", "Base inclinada, 4 colchonetas en display, MDF, ruedas",               160,  80, 160, "#2D3748", "gondola",       9800),
    ("cat-rt-exh", "Panel Perforado Exhibidor Mural 120x240",  "RT-EXH-PNL-001", "Lámina perforada, ganchos incluidos (50), marco aluminio",            120,   5, 240, "#374151", "panel_v",       4200),
    ("cat-rt-exh", "Exhibidor Dulces y Snacks Impulso",        "RT-EXH-DUL-001", "Acrílico + metal, 8 canales gravitacionales, frente de empuje",        60,  30,  95, "#F9FAFB", "gondola",       5500),

    # ═══════════════════════════════════════════════════════════════════════════
    # RETAIL LAYOUT — Muebles de Farmacia
    # ═══════════════════════════════════════════════════════════════════════════
    ("cat-rt-far", "Anaquel Farmacia 6 Repisas 90cm",          "RT-FAR-ANA-090", "MDF blanco, 6 repisas, divisores de plástico incluidos",               90,  30, 195, "#F9FAFB", "gondola",       5200),
    ("cat-rt-far", "Mostrador Farmacia Reglamentario 150cm",   "RT-FAR-MOS-150", "MDF blanco, 2 cajones caja + vitrina frontal, escuadra lateral",       150, 60, 120, "#F9FAFB", "counter",      16500),
    ("cat-rt-far", "Refrigerador Medicamentos 200L",           "RT-FAR-REF-200", "2°-8°C certificado, alarma temperatura, puerta vidrio, 200L",           60,  60, 140, "#F9FAFB", "cabinet",      22000),
    ("cat-rt-far", "Vitrina Productos Controlados 80cm",       "RT-FAR-VIT-080", "MDF + vidrio, cerradura, para vitaminas o cosméticos",                  80,  40, 180, "#F9FAFB", "cabinet",       8800),
    ("cat-rt-far", "Mueble OTC de Pared 120cm",                "RT-FAR-OTC-120", "MDF blanco, 5 repisas anguladas, topes, señalética incluida",          120, 30, 200, "#F9FAFB", "gondola",       6800),
    ("cat-rt-far", "Módulo Vitaminas y Suplementos",           "RT-FAR-VIT-001", "MDF blanco, 4 repisas ancho 90cm, display vertical integrado",         90,  30, 180, "#F9FAFB", "gondola",       5500),
    ("cat-rt-far", "Módulo Recepción Clínica 120cm",           "RT-FAR-REC-120", "MDF blanco, cubierta postformada, 2 cajones + cómputo",                120, 65,  95, "#F9FAFB", "counter",      12500),
    ("cat-rt-far", "Fichero Metálico 4 Cajones A4",            "RT-FAR-FIC-004", "Acero calibre 18, 4 cajones con guías telescópicas, cerradura",        46,  62, 132, "#9CA3AF", "cabinet",       8500),

    # ═══════════════════════════════════════════════════════════════════════════
    # RETAIL LAYOUT — Muebles de Boutique
    # ═══════════════════════════════════════════════════════════════════════════
    ("cat-rt-bou", "Perchero Isla Doble Barra",                "RT-BOU-PER-ISL", "Metal negro mate, 2 barras paralelas, ruedas bloqueables",             120, 60, 170, "#1F2937", "gondola",       5200),
    ("cat-rt-bou", "Mesa de Doblado y Exhibición",             "RT-BOU-MES-DOB", "MDF + metal, 120x80cm, superficie amplia, 1 entrepaño inferior",       120, 80,  90, "#374151", "box_flat",      6800),
    ("cat-rt-bou", "Vitrina Ropa 3 Cuerpos",                   "RT-BOU-VIT-003", "MDF lacado, 3 cuerpos, barras internas + espejo fondo",               135, 60, 210, "#1F2937", "closet",       22000),
    ("cat-rt-bou", "Módulo Liquidación / Canasta",             "RT-BOU-CAN-001", "Canasta acrílico sobre base metálica, señalética incluida",             60,  60,  90, "#374151", "gondola",       3500),
    ("cat-rt-bou", "Silla Espera Boutique Tapizada",           "RT-BOU-SIL-001", "Tapizado piel sintética, patas metálicas doradas",                     55,  55,  80, "#1F2937", "seating",       3200),
    ("cat-rt-bou", "Espejo Cuerpo Completo Marco Metálico",    "RT-BOU-ESP-001", "50x170cm, marco metálico negro, base con ruedas",                       50,  10, 170, "#1F2937", "panel_v",       4500),
    ("cat-rt-bou", "Mostrador Boutique con Vitrina 100cm",     "RT-BOU-MOS-100", "MDF lacado + vidrio templado, cubierta cuarzo, iluminación",           100, 50,  95, "#1F2937", "counter",      14500),
    ("cat-rt-bou", "Mueble Accesorios y Joyería 90cm",        "RT-BOU-ACC-090", "MDF + acero, ganchos, repisas, 4 niveles para accesorios",              90,  35, 180, "#374151", "shelf_rack",    8800),

    # ═══════════════════════════════════════════════════════════════════════════
    # RETAIL LAYOUT — Señalética y Display
    # ═══════════════════════════════════════════════════════════════════════════
    ("cat-rt-sen", "Panel Backlight LED 120x240cm",            "RT-SEN-BKL-001", "Caja de luz delgada, tela tensada, iluminación LED perimetral",        120, 15, 240, "#1F2937", "panel_v",      12500),
    ("cat-rt-sen", "Totem Señalización Doble Cara 80cm",       "RT-SEN-TOT-080", "Aluminio + PVC, doble cara retroiluminado, base lastre",               80,  30, 180, "#374151", "panel_v",      15500),
    ("cat-rt-sen", "Display Digital 55\" Full HD",             "RT-SEN-DIG-055", "Pantalla 55\", soporte pedestal, reproductor integrado, 24/7",         55, 130, 140, "#1F2937", "panel_v",      28500),
    ("cat-rt-sen", "Marco Señalética A3 Aluminio Snap",        "RT-SEN-MAR-A3",  "Marco abatible clip, aluminio, para cartel A3, pared o barra",         30,   2,  43, "#9CA3AF", "panel_v",        380),
    ("cat-rt-sen", "Letrero LED Neón Flex Personalizado",      "RT-SEN-LED-NEO", "Neón LED RGB, forma custom, transformador incluido, 220V",             60,  10,  40, "#F97316", "panel_v",       4800),
    ("cat-rt-sen", "Panel Poster Retroiluminado A1",           "RT-SEN-POS-A1",  "Caja de luz LED, cartel A1, aluminio, IP20",                           60,   8,  85, "#1F2937", "panel_v",       3200),
    ("cat-rt-sen", "Display Precio Digital Electrónico",       "RT-SEN-PRE-001", "E-Ink 7.5\", conectividad WiFi, batería 1 año, color",                 13,   1,  10, "#F3F4F6", "panel_v",        980),
    ("cat-rt-sen", "Panel Branding Fachada 200x300cm",         "RT-SEN-FAC-001", "Acrílico 8mm, iluminación perimetral, adhesivo rebranding incluido",   200, 15, 300, "#1F2937", "panel_v",      32000),

    # ═══════════════════════════════════════════════════════════════════════════
    # REAL ESTATE — Lobby y Áreas Comunes
    # ═══════════════════════════════════════════════════════════════════════════
    ("cat-re-lob", "Mueble Recepción Lobby 200cm",             "RE-LOB-REC-200", "MDF lacado + cuarzo, curvatura suave, backlit LED, logo integrado",    200, 80,  95, "#1F2937", "counter",      48000),
    ("cat-re-lob", "Sillón Lobby Tapizado Premium",            "RE-LOB-SIL-001", "Tapizado piel natural, patas acero inox, asiento firme",               90,  85,  80, "#374151", "seating",      12500),
    ("cat-re-lob", "Sofá Espera Lobby 2 Plazas",              "RE-LOB-SOF-002", "Tela técnica, estructura metálica, patas aluminio",                    165,  80,  80, "#1F2937", "seating",      18500),
    ("cat-re-lob", "Mesa de Centro Mármol Lobby",              "RE-LOB-CEN-001", "Tablero mármol Carrara 80x80cm, base acero inox",                      80,  80,  42, "#F9FAFB", "box_flat",     22000),
    ("cat-re-lob", "Panel Divisorio Lounge 120x200cm",         "RE-LOB-PAN-001", "Estructura aluminio + vidrio esmerilado o MDF, funcional",            120,  15, 200, "#1F2937", "panel_v",      28000),
    ("cat-re-lob", "Módulo Seguridad / Vigilancia",            "RE-LOB-SEG-001", "MDF lacado, cubierta vidrio, para guardia o concierge",               120,  65,  95, "#374151", "counter",      15500),
    ("cat-re-lob", "Jardinera Decorativa Lobby 80cm",          "RE-LOB-JAR-001", "Fibra de vidrio, planta artificial premium incluida",                  80,  80,  80, "#374151", "box_flat",      8800),
    ("cat-re-lob", "Banca Espera Lobby 3 Personas",            "RE-LOB-BAN-003", "Asientos tapizados individuales, estructura metálica + madera",        180, 60,  80, "#4B5563", "seating",      14500),

    # ═══════════════════════════════════════════════════════════════════════════
    # REAL ESTATE — Amenidades y Fitness
    # ═══════════════════════════════════════════════════════════════════════════
    ("cat-re-ame", "Caminadora Residencial",                   "RE-AME-CAM-001", "Motor 2.5HP, superficie 50x130cm, pantalla LCD, plegable",             75, 140, 130, "#1F2937", "box_flat",     18500),
    ("cat-re-ame", "Bicicleta Estática Spinning",              "RE-AME-BIC-001", "Volante inercia 18kg, resistencia magnética, display LCD",             50,  90, 115, "#1F2937", "box_flat",      8800),
    ("cat-re-ame", "Máquina Elíptica Residencial",             "RE-AME-ELI-001", "Zancada 55cm, 20 niveles resistencia, pantalla touch",                 70, 165, 175, "#1F2937", "box_flat",     14500),
    ("cat-re-ame", "Banco de Pesas con Respaldo",              "RE-AME-BAN-001", "Ajustable 0°-85°, SIG 300kg, tapizado vinilo, ruedas transporte",      130, 55,  50, "#1F2937", "box_flat",      4800),
    ("cat-re-ame", "Rack de Mancuernas 10 Pares",              "RE-AME-RAK-010", "Acero + MDF, 3 niveles, capacidad 10 pares hasta 30kg",               130, 50,  90, "#374151", "shelf_rack",    6800),
    ("cat-re-ame", "Camastro de Alberca Teca",                 "RE-AME-CAM-ALB", "Teca natural grado A, reclínable 3 posiciones, almohadón incluido",   195, 70,  35, "#92400E", "box_flat",     12500),
    ("cat-re-ame", "Silla Canapé Terraza 2 Pzs",              "RE-AME-CAN-002", "Aluminio + cuerda náutica, 4 posiciones, apilable, incluye cojín",      70,  80,  80, "#374151", "seating",       8800),
    ("cat-re-ame", "Mesa Pool Terraza 90cm Aluminio",          "RE-AME-MES-TER", "Tablero HPL antirayaduras, base aluminio, uso exterior",               90,  90,  73, "#9CA3AF", "box_flat",      8800),
    ("cat-re-ame", "Locker Vestidor Gym 6 Puertas",            "RE-AME-LOC-006", "Acero inox o laminado HPL, 6 puertas candado electrónico",             30,  50, 180, "#F3F4F6", "cabinet",       4500),

    # ═══════════════════════════════════════════════════════════════════════════
    # REAL ESTATE — Departamento Tipo
    # ═══════════════════════════════════════════════════════════════════════════
    ("cat-re-dep", "Sala Departamento Estudio 40m²",           "RE-DEP-SAL-040", "Sofá 2p + mesa centro + TV-stand para depto tipo estudio",            165,  90,  87, "#374151", "seating",      28000),
    ("cat-re-dep", "Sala-Comedor Departamento 60m²",           "RE-DEP-SAC-060", "Sofá 3p + comedor 4 personas + mesa centro",                          225,  90,  87, "#2D3748", "seating",      48000),
    ("cat-re-dep", "Mobiliario Estudio / Home Office Depto",   "RE-DEP-OFI-001", "Escritorio + silla + librero, sistema compacto para depto",           120,  75,  75, "#374151", "box_flat",     18500),
    ("cat-re-dep", "TV Stand Flotante 180cm",                  "RE-DEP-TVS-180", "MDF lacado, 180x30x50cm, LED inferior, 2 puertas + cajón",            180, 30,  50, "#1F2937", "cabinet",      12500),
    ("cat-re-dep", "Sala Modelo Lujo Premium",                 "RE-DEP-SAL-LUX", "Sofá seccional + 2 sillones + mesa mármol + alfombra",               280, 180, 87, "#1F2937", "seating",      95000),

    # ═══════════════════════════════════════════════════════════════════════════
    # REAL ESTATE — Cocina y Equipamiento
    # ═══════════════════════════════════════════════════════════════════════════
    ("cat-re-coc", "Cocina Integral 2.4m Departamento",        "RE-COC-INT-240", "MDF PVC, básica para depto, cubierta postformada, fregadero incl",     240, 60, 210, "#F3F4F6", "kitchen_unit", 45000),
    ("cat-re-coc", "Cocina Integral 3.0m Premium",             "RE-COC-INT-300", "MDF + acrílico, cubierta cuarzo, campana incl, isla opcional",         300, 60, 210, "#E5E7EB", "kitchen_unit", 72000),
    ("cat-re-coc", "Cocina en L 2.4x1.8 Departamento",        "RE-COC-L24-DEP", "MDF PVC, módulos completos, cubierta postformada, instalación incluida",240, 180,210, "#F3F4F6", "kitchen_unit", 62000),
    ("cat-re-coc", "Mueble Lavatrastos con Cubierta",          "RE-COC-LAV-001", "PP + acero inox, tarja 2 pocetas, cubierta postformada, 2 puertas",    120, 60,  90, "#F3F4F6", "cabinet",      12500),

    # ═══════════════════════════════════════════════════════════════════════════
    # REAL ESTATE — Habitaciones y Baños
    # ═══════════════════════════════════════════════════════════════════════════
    ("cat-re-hab", "Recámara Principal Queen + Closet",        "RE-HAB-REC-QUE", "Cama queen + 2 burós + cómoda + closet corredera 180cm",             165, 210, 50, "#374151", "box_flat",     55000),
    ("cat-re-hab", "Recámara Secundaria Individual",           "RE-HAB-REC-IND", "Cama individual + buró + librero + closet 120cm",                     105, 200, 50, "#4B5563", "box_flat",     28500),
    ("cat-re-hab", "Baño Principal con Mueble 80cm",           "RE-HAB-BAN-PRN", "Mueble bajo lavabo 80cm + espejo LED + botiquín + accesorios",         80,  50,  55, "#F3F4F6", "cabinet",      22000),
    ("cat-re-hab", "Baño Secundario con Mueble 60cm",          "RE-HAB-BAN-SEC", "Mueble bajo lavabo 60cm + espejo simple + accesorios inox",            60,  45,  55, "#F9FAFB", "cabinet",      12500),

    # ═══════════════════════════════════════════════════════════════════════════
    # MEDICAL SPACE — Consultorio General
    # ═══════════════════════════════════════════════════════════════════════════
    ("cat-md-con", "Camilla de Exploración Fija 3 Secciones",  "MD-CON-CAM-001", "3 secciones articuladas, vinilo antimicrobial, patas cromo",           185, 65,  85, "#F9FAFB", "medical_bed",  18500),
    ("cat-md-con", "Camilla Eléctrica 4 Secciones",            "MD-CON-CAM-ELE", "Motor eléctrico 2 secciones, respaldo + rodilla, memoria posición",    190, 70,  85, "#F9FAFB", "medical_bed",  48000),
    ("cat-md-con", "Escritorio Médico con Retorno 150cm",      "MD-CON-ESC-150", "MDF blanco + aluminio, retorno 90cm, cajonera 3 gav, porta PC",        150, 90,  75, "#F9FAFB", "box_flat",     12500),
    ("cat-md-con", "Silla de Médico con Respaldo",             "MD-CON-SIL-MED", "Asiento vinilo antimicrobial, altura ajust, ruedas suaves",             55,  55, 100, "#F9FAFB", "seating",       3800),
    ("cat-md-con", "Silla Paciente Tapizada",                  "MD-CON-SIL-PAC", "Tapizado vinilo, patas fijas, cómoda para paciente",                   55,  55,  85, "#F3F4F6", "seating",       2800),
    ("cat-md-con", "Mueble Lavamanos Médico con Cubierta",     "MD-CON-LAV-001", "Acero inox 304, lavabo acción codo/pedal, cubierta + 2 cajones",        90,  50,  90, "#F9FAFB", "cabinet",      18500),
    ("cat-md-con", "Vitrina Medicamentos 80cm Vidrio",         "MD-CON-VIT-080", "Acero inox + vidrio, cerradura, interior ajustable, 80x40x180cm",       80,  40, 180, "#F9FAFB", "cabinet",      12800),
    ("cat-md-con", "Mesa de Curaciones Acero Inox",            "MD-CON-MES-CUR", "Inox 304, 2 niveles + cajón estéril, ruedas bloqueables",               60,  45,  90, "#E5E7EB", "box_flat",     14500),
    ("cat-md-con", "Portasuero de Pedestal Regulable",         "MD-CON-PSU-001", "Inox 304, altura 120-220cm, 4 ganchos, base 5 radios",                 60,  60, 180, "#E5E7EB", "box_flat",      2500),
    ("cat-md-con", "Biombo de 3 Hojas Tapizado",               "MD-CON-BIO-003", "3 hojas, tapizado vinilo doble cara, ruedas, altura 190cm",            150, 10, 190, "#F9FAFB", "panel_v",       4800),

    # ═══════════════════════════════════════════════════════════════════════════
    # MEDICAL SPACE — Equipamiento Dental
    # ═══════════════════════════════════════════════════════════════════════════
    ("cat-md-den", "Sillón Dental Hidráulico Básico",          "MD-DEN-SIL-HID", "Hidráulico, tapizado vinilo, lámpara techo incl, 3 programas",          65,  55, 120, "#F9FAFB", "medical_bed",  55000),
    ("cat-md-den", "Sillón Dental Eléctrico Premium",          "MD-DEN-SIL-ELE", "5 motores, memory foam, 6 posiciones, backlit, garantía 3 años",        65,  60, 120, "#F9FAFB", "medical_bed",  95000),
    ("cat-md-den", "Unidad Dental Completa con Carrito",       "MD-DEN-UNI-001", "Compresor + unidad + escupidera + lámpara + carro, paquete llave",      200, 150,130, "#F9FAFB", "medical_bed", 165000),
    ("cat-md-den", "Carro Dental Asistente con Bandeja",       "MD-DEN-CAR-001", "Inox 304, 4 ruedas, bandeja basculante, 3 cajones, porta aspiración",   45,  50,  90, "#F3F4F6", "box_flat",     12500),
    ("cat-md-den", "Mueble Dental 5 Cajones con Cubierta",     "MD-DEN-MUE-005", "MDF blanco, 5 cajones, cubierta laminada antimicrobial",                90,  50,  90, "#F9FAFB", "cabinet",      15500),
    ("cat-md-den", "Autoclave / Esterilizador 17L",            "MD-DEN-AUT-017", "17 litros, digital, ciclo rápido 30min, clase B, CE",                   50,  40,  35, "#F9FAFB", "box_flat",     28500),
    ("cat-md-den", "Negatoscopio LED 1 Panel",                 "MD-DEN-NEG-001", "LED, 1 panel 20x24cm, ultrafino, luz homogénea, IP40",                  24,   5,  32, "#F9FAFB", "panel_v",       1800),
    ("cat-md-den", "Silla Dentista con Respaldo Lumbar",       "MD-DEN-SIL-DEN", "Altura ajustable, ruedas suaves, vinilo antimicrobial",                 55,  55, 110, "#F9FAFB", "seating",       3200),

    # ═══════════════════════════════════════════════════════════════════════════
    # MEDICAL SPACE — Área de Espera y Recepción
    # ═══════════════════════════════════════════════════════════════════════════
    ("cat-md-esp", "Banca Espera Clínica 3 Plazas",            "MD-ESP-BAN-003", "Estructura acero + asientos vinilo, respaldo, 3 plazas separadas",     165, 55,  80, "#F3F4F6", "seating",       8800),
    ("cat-md-esp", "Módulo Recepción Clínica 150cm",           "MD-ESP-REC-150", "MDF blanco + vidrio, 2 cajones + bajo mostrador, cubierta cuarzo",     150, 65,  95, "#F9FAFB", "counter",      22000),
    ("cat-md-esp", "Silla Paciente Espera Vinilo",             "MD-ESP-SIL-PAC", "Patas metálicas cromadas, vinilo antifluidos, apilable",                55,  55,  85, "#F3F4F6", "seating",       2200),
    ("cat-md-esp", "Mesa Revistero Sala Espera",               "MD-ESP-MES-REV", "Madera + metal, 50x50x55cm, 1 entrepaño inferior",                     50,  50,  55, "#F3F4F6", "box_flat",      3200),
    ("cat-md-esp", "Panel TV Soporte Sala Espera 55\"",        "MD-ESP-PNL-TV",  "Soporte pared + consola MDF blanco, cajón para reproductor",            55,  30,  50, "#F9FAFB", "panel_v",       4500),
    ("cat-md-esp", "Dispensador Gel Antibacterial Pedestal",   "MD-ESP-DIS-001", "Pedestal inox, dispensador automático, 1000ml, sensor IR",              30,  30, 110, "#E5E7EB", "box_flat",      2800),

    # ═══════════════════════════════════════════════════════════════════════════
    # MEDICAL SPACE — Clínica Estética
    # ═══════════════════════════════════════════════════════════════════════════
    ("cat-md-est", "Camilla Estética Eléctrica 3 Secciones",   "MD-EST-CAM-ELE", "3 secciones eléctricas, tapizado premium, light madera + blanco",      185, 70,  85, "#F9FAFB", "medical_bed",  38500),
    ("cat-md-est", "Sillón Masajes Tapizado de Lujo",          "MD-EST-SIL-MAS", "Tapizado piel PU, reclinable, apoyabrazos anchos, base cromo",          75,  90, 110, "#374151", "seating",      18500),
    ("cat-md-est", "Carrito Estética 3 Niveles con Cajón",     "MD-EST-CAR-001", "Ruedas bloqueables, 3 bandejas + 1 cajón, estructura metal blanco",     40,  40,  85, "#F9FAFB", "box_flat",      4500),
    ("cat-md-est", "Mueble Spa Wet con Lavacabezas",           "MD-EST-WET-001", "MDF + cubierta vinilo, tarja lavacabezas semi-reclinable incl",         120, 65,  90, "#1F2937", "cabinet",      22000),
    ("cat-md-est", "Sillón Pedicura con Tina SPA",             "MD-EST-PED-001", "Motor masaje + tina hidromasaje, tapizado piel PU, reposapiés",         85, 110, 120, "#374151", "seating",      28500),
    ("cat-md-est", "Mueble Recepción Spa 120cm",               "MD-EST-REC-120", "MDF lacado blanco, curvado, backlit LED warm, logo opcional",           120, 60,  95, "#F9FAFB", "counter",      28000),

    # ═══════════════════════════════════════════════════════════════════════════
    # MEDICAL SPACE — Laboratorio y Quirófano
    # ═══════════════════════════════════════════════════════════════════════════
    ("cat-md-lab", "Mesa Laboratorio con Cubierta Fenólica",   "MD-LAB-MES-FEN", "MDF + cubierta laminado fenólico, resistente químicos, 150x75cm",      150, 75,  90, "#F9FAFB", "box_flat",     18500),
    ("cat-md-lab", "Mesa Quirófano Acero Inox 4 Cajones",      "MD-LAB-MES-QUI", "304 Inox, 4 cajones, cubierta integral sin juntas, ISO 14971",         150, 75,  90, "#E5E7EB", "box_flat",     42000),
    ("cat-md-lab", "Campana de Extracción Laboratorio 90cm",   "MD-LAB-CAM-090", "Acero inox, motor EC 400 m³/h, vidrio deslizante, enchufe int",         90,  60, 150, "#E5E7EB", "box_flat",     55000),
    ("cat-md-lab", "Mueble Alto Laboratorio 4 Puertas",        "MD-LAB-MUE-004", "MDF + cubierta fenólica, 4 puertas vidrio, interior ajustable",         90,  40, 200, "#F9FAFB", "cabinet",      22000),
    ("cat-md-lab", "Carro Quirófano Acero Inox 5 Cajones",     "MD-LAB-CAR-QUI", "304 Inox, 5 cajones ISO + tapa bisagrada superior, ruedas bloqueables", 60,  50, 100, "#E5E7EB", "box_flat",     28500),

    # ═══════════════════════════════════════════════════════════════════════════
    # EVENT STAND — Stands Modulares
    # ═══════════════════════════════════════════════════════════════════════════
    ("cat-ev-std", "Stand Básico 3x3 Octanorm",                "EV-STD-3X3-BAA", "Perfilería Octanorm, 3 paredes + piso + techo opcional, listo armar",  300, 300,250, "#1F2937", "stand_modular", 35000),
    ("cat-ev-std", "Stand Básico 6x3 Octanorm",                "EV-STD-6X3-BAA", "Perfilería Octanorm, esquina abierta, 1 mostrador incluido",           600, 300,250, "#1F2937", "stand_modular", 58000),
    ("cat-ev-std", "Stand Premium 6x6 con Techo",              "EV-STD-6X6-PRE", "Octanorm + techo, 3 paredes, iluminación track, recepción",            600, 600,300, "#1F2937", "stand_modular",118000),
    ("cat-ev-std", "Stand Isla 9x9 2 Pisos",                   "EV-STD-9X9-ISL", "Isla completa, 2 niveles, sala reuniones privada, lounge",             900, 900,500, "#1F2937", "stand_modular",285000),
    ("cat-ev-std", "Stand Económico Armable 3x2",              "EV-STD-3X2-ECO", "Tubo + lona tensada, 3x2m, kit completo + bolsa transporte",           300, 200,250, "#374151", "stand_modular", 12500),
    ("cat-ev-std", "Stand Pop-Up 3m con Arco",                 "EV-STD-POP-300", "Marco de fibra + impresión dye-sub, arco curvo, maleta ruedas",        300, 30,  230, "#374151", "stand_modular", 9800),
    ("cat-ev-std", "Stand Tensoflex Curvo 4m",                 "EV-STD-TEN-400", "Perfil aluminio + tela tensada impresión digital, curvo, sin piezas",  400, 50,  240, "#1F2937", "stand_modular", 15500),
    ("cat-ev-std", "Stand Roll-Up 85cm Premium",               "EV-STD-ROL-085", "Casette aluminio anodizado, impresión foto, 2m altura, bolsa",          85, 15,  200, "#374151", "panel_v",        1800),

    # ═══════════════════════════════════════════════════════════════════════════
    # EVENT STAND — Mobiliario de Stand
    # ═══════════════════════════════════════════════════════════════════════════
    ("cat-ev-mob", "Mesa Coctel Redonda Alta 60cm",            "EV-MOB-MES-COC", "Tapa 60cm, pata central cromada, altura 105cm, apilable",               60,  60, 105, "#374151", "box_flat",       2200),
    ("cat-ev-mob", "Silla Tiffany Transparente",               "EV-MOB-SIL-TIF", "Policarbonato cristal, 100% apilable, max 6 pisos, 150kg",              45,  50,  87, "#F9FAFB", "seating",        1200),
    ("cat-ev-mob", "Silla Bar Alta con Respaldo",              "EV-MOB-SIL-BAR", "Estructura metálica, asiento tapizado, altura 75cm, apoyapiés",         40,  40,  75, "#1F2937", "seating",        1800),
    ("cat-ev-mob", "Vitrina Exhibición Acrílico 4 Repisas",    "EV-MOB-VIT-004", "Acrílico 5mm, 4 repisas LED, 50x40x120cm, cerradura",                   50,  40, 120, "#F9FAFB", "cabinet",        6800),
    ("cat-ev-mob", "Monitor 32\" con Pedestal Expositor",      "EV-MOB-MON-032", "LED Full HD, pedestal giratorio 360°, gestión cableado",               110, 50,  170, "#1F2937", "panel_v",       12500),
    ("cat-ev-mob", "Lounge Modular Stand 2 Plazas",            "EV-MOB-LOU-002", "Tapizado PU, estructura aluminio, reconfigurablee",                    165, 85,   80, "#374151", "seating",        8800),
    ("cat-ev-mob", "Mesa Reunión Plegable 120cm",              "EV-MOB-REU-120", "MDF + patas plegables metálicas, 120x60cm, transporte fácil",           120, 60,   75, "#374151", "box_flat",       2800),

    # ═══════════════════════════════════════════════════════════════════════════
    # EVENT STAND — Paneles y Paredes
    # ═══════════════════════════════════════════════════════════════════════════
    ("cat-ev-pan", "Pared Modular Octanorm 100x250cm",         "EV-PAN-OCT-001", "Panel Octanorm blanco, inserción gráfica, listo reutilizar",            100, 10,  250, "#F9FAFB", "panel_v",        4500),
    ("cat-ev-pan", "Backwall Impreso 300x250cm",               "EV-PAN-BWL-300", "Marco aluminio + tela dye-sublimada fotocalidad, 1 semana entrega",     300, 30,  250, "#374151", "panel_v",       12500),
    ("cat-ev-pan", "Panel Backlit LED 200x250cm",              "EV-PAN-BKL-200", "Caja de luz LED, tela tensada, iluminación uniform, potente",           200, 20,  250, "#1F2937", "panel_v",       22000),
    ("cat-ev-pan", "Pared Divisoria Stand 120x250cm",          "EV-PAN-DIV-120", "Octanorm + panel opaco, privacidad sala reuniones",                     120, 10,  250, "#F9FAFB", "panel_v",        3800),
    ("cat-ev-pan", "Fachada de Acceso Totem 50cm",             "EV-PAN-FAC-001", "Aluminio + acrílico, nombre empresa retroiluminado, 50x50x250cm",        50, 50,  250, "#1F2937", "panel_v",        8800),

    # ═══════════════════════════════════════════════════════════════════════════
    # EVENT STAND — Mostradores y Counters
    # ═══════════════════════════════════════════════════════════════════════════
    ("cat-ev-mos", "Counter Recepción Stand 100cm",            "EV-MOS-COU-100", "Aluminio + MDF, desmontable, gráfica impresa envolvente",              100, 50,   95, "#1F2937", "counter",        6800),
    ("cat-ev-mos", "Counter Doble Acceso 150cm",               "EV-MOS-COU-150", "2 laterales acceso, bajo mostrador cerrado, gráfica lateral",          150, 50,   95, "#374151", "counter",        9800),
    ("cat-ev-mos", "Mostrador Curvo LED Stand",                "EV-MOS-CUR-120", "Curva frontal, iluminación LED inferior, gráfica wrap",                120, 55,   95, "#1F2937", "counter",       12500),
    ("cat-ev-mos", "Podio Expositor Acrílico",                 "EV-MOS-POD-001", "Acrílico 8mm cristal, tapa superior, luz interior, 40x40x110cm",        40, 40,  110, "#F9FAFB", "box_flat",       4800),
    ("cat-ev-mos", "Mostrador Modular 80cm Plegable",          "EV-MOS-PLG-080", "Aluminio plegable, tela impresa, arma en 5min, maleta incluida",         80, 50,   95, "#374151", "counter",        5200),

    # ═══════════════════════════════════════════════════════════════════════════
    # VEHICLE CONFIGURATOR — Automóviles
    # ═══════════════════════════════════════════════════════════════════════════
    ("cat-vc-aut", "Sedán Compacto B1",                        "VC-AUT-SED-B1",  "4 puertas, 5 pasajeros, motor 1.6L, segmento B, base configuración",   430, 175, 145, "#1F2937", "vehicle",     285000),
    ("cat-vc-aut", "Sedán Ejecutivo C1",                       "VC-AUT-SED-C1",  "4 puertas, 5 pasajeros, motor 2.0T, segmento C premium",              475, 185, 148, "#1F2937", "vehicle",     485000),
    ("cat-vc-aut", "SUV Compacta B-SUV",                       "VC-AUT-SUV-B",   "5 puertas, 5 pasajeros, tracción 4x2, motor 1.5T",                    430, 180, 162, "#374151", "vehicle",     395000),
    ("cat-vc-aut", "SUV Mediana C-SUV",                        "VC-AUT-SUV-C",   "5 puertas, 7 pasajeros, tracción 4x4, motor 2.0T",                    465, 192, 168, "#2D3748", "vehicle",     558000),
    ("cat-vc-aut", "SUV Premium D-SUV",                        "VC-AUT-SUV-D",   "5 puertas, 7 pasajeros, full equip, piel, techo solar",               490, 200, 175, "#1A202C", "vehicle",     785000),
    ("cat-vc-aut", "Hatchback A1",                             "VC-AUT-HBK-A1",  "5 puertas, 5 pasajeros, motor 1.0T, segmento A urbano",               395, 168, 148, "#374151", "vehicle",     248000),
    ("cat-vc-aut", "Coupé Deportivo 2P",                       "VC-AUT-COU-2P",  "2 puertas, 4 pasajeros, motor 2.5T, turbo, segmento deportivo",       453, 188, 138, "#1F2937", "vehicle",     645000),
    ("cat-vc-aut", "Sedan Eléctrico BEV",                      "VC-AUT-ELE-BEV", "4 puertas, autonomía 450km, carga rápida 150kW, pantalla central",    470, 190, 149, "#1A202C", "vehicle",     680000),

    # ═══════════════════════════════════════════════════════════════════════════
    # VEHICLE CONFIGURATOR — Motocicletas y Especiales
    # ═══════════════════════════════════════════════════════════════════════════
    ("cat-vc-mot", "Motocicleta Naked 650cc",                  "VC-MOT-NAK-650", "Naked 650cc, 2 cilindros, 75hp, frenos ABS, pantalla TFT",            215, 80,  125, "#1F2937", "vehicle",      89000),
    ("cat-vc-mot", "Motocicleta Sport 1000cc",                 "VC-MOT-SPR-001", "Sport 1000cc, 4 cilindros, 190hp, Superbike, electrónica avanzada",   210, 75,  115, "#374151", "vehicle",     195000),
    ("cat-vc-mot", "Motocicleta Adventure 800cc",              "VC-MOT-ADV-800", "Adventure 800cc, doble propósito, parabrisas, maletas opcionales",    235, 90,  140, "#374151", "vehicle",     128000),
    ("cat-vc-mot", "Scooter Urbano 150cc",                     "VC-MOT-SCO-150", "Scooter 150cc, automático, bajo con pie, 2 personas, uso diario",     185, 70,  115, "#374151", "vehicle",      38500),
    ("cat-vc-mot", "Cruiser Classic 1200cc",                   "VC-MOT-CRU-120", "Cruiser V-twin 1200cc, estilo clásico americano, custom",             250, 90,  115, "#1A202C", "vehicle",     145000),
    ("cat-vc-mot", "Quad Deportivo 450cc",                     "VC-MOT-QUA-450", "ATV 450cc, 4x4, suspensión independiente, uso off-road",              200, 120, 120, "#374151", "vehicle",      98000),

    # ═══════════════════════════════════════════════════════════════════════════
    # VEHICLE CONFIGURATOR — Vehículos Comerciales
    # ═══════════════════════════════════════════════════════════════════════════
    ("cat-vc-com", "Pickup Mediana 4x4 Diésel",                "VC-COM-PKP-4X4", "Doble cabina, 4x4, diésel 2.5L, payload 1200kg, caja 1.5m",          530, 195, 175, "#374151", "vehicle",     485000),
    ("cat-vc-com", "Furgoneta Carga Media 1.5T",               "VC-COM-FUR-1T5", "Carga 1500kg, vol 6m³, puerta lateral, piso reforzado",               540, 210, 220, "#1F2937", "vehicle",     345000),
    ("cat-vc-com", "Camión Ligero 3.5T",                       "VC-COM-CAM-3T5", "GVW 3.5T, cabina simple, caja seca 3.5m, turbodiesel",               645, 230, 280, "#2D3748", "vehicle",     425000),
    ("cat-vc-com", "Minibus 15 Pasajeros",                     "VC-COM-MBS-015", "15 pasajeros, A/C, vidrios polarizados, piso bajo",                   650, 220, 280, "#1F2937", "vehicle",     485000),
    ("cat-vc-com", "Van Pasajeros 8 Plazas",                   "VC-COM-VAN-008", "8 pasajeros, turbodiesel, full equipo, uso traslados",                520, 200, 200, "#374151", "vehicle",     385000),

    # ═══════════════════════════════════════════════════════════════════════════
    # VEHICLE CONFIGURATOR — Showroom y Exhibición
    # ═══════════════════════════════════════════════════════════════════════════
    ("cat-vc-shw", "Pedestal Giratorio Vehículo 5x5m",         "VC-SHW-PED-5X5", "Plataforma 5x5m, motor giratorio, max 3500kg, velocidad ajustable",   500, 500,  25, "#1F2937", "box_flat",    185000),
    ("cat-vc-shw", "Pedestal Expositivo Moto 1.5x1m",          "VC-SHW-PED-MOT", "Plataforma inclinada 5°, alfombra premium, iluminación perimetral",   150, 100,  20, "#1F2937", "box_flat",     28500),
    ("cat-vc-shw", "Banca Showroom Tapizada 3 Asientos",       "VC-SHW-BAN-003", "Piel natural, estructura acero + madera, para sala de ventas",        180, 60,   80, "#1F2937", "seating",      18500),
    ("cat-vc-shw", "Módulo Recepción Agencia 180cm",           "VC-SHW-REC-180", "MDF lacado + cubierta cuarzo, backlit, para recepción de agencia",     180, 75,   95, "#1F2937", "counter",      42000),
    ("cat-vc-shw", "Panel Video Wall 3x3 Paneles 55\"",        "VC-SHW-VID-3X3", "9 pantallas 55\" 0.88mm bisel, controlador daisy chain, 8K",          165, 30,  165, "#1F2937", "panel_v",     185000),
    ("cat-vc-shw", "Columna de Luz LED Showroom",              "VC-SHW-LUZ-001", "Columna acrílico+metal, LED RGBW, programable, impacto visual",        30,  30,  250, "#1F2937", "lamp",          8800),
    ("cat-vc-shw", "Vitrina Accesorios y Merchandising",       "VC-SHW-VIT-001", "Aluminio + vidrio, retroiluminada, 5 repisas ajustables",              120, 45,  200, "#1F2937", "cabinet",      22000),
]

# ─── Generación de SQL ────────────────────────────────────────────────────────

def generate_sql() -> str:
    lines = []
    lines.append("BEGIN;")
    lines.append("")

    # ── Categorías ────────────────────────────────────────────────────────────
    lines.append("-- ── Categorías ─────────────────────────────────────────────────────────")
    for (slug_id, name, slug, order, vertical, description) in CATEGORIES:
        cuid = uid(f"cat:{slug_id}")
        lines.append(
            f"INSERT INTO product_categories (id, tenant_id, company_id, workspace_id, name, slug, description, \"order\", vertical_key, status) VALUES ("
            f"'{cuid}', '{TENANT_ID}', '{COMPANY_ID}', '{WORKSPACE_ID}', "
            f"'{esc(name)}', '{slug}', '{esc(description)}', {order}, "
            f"'{vertical}', 'active') ON CONFLICT (tenant_id, slug) DO NOTHING;"
        )

    lines.append("")
    lines.append("-- ── Productos ───────────────────────────────────────────────────────────")

    for (cat_slug_id, name, sku, desc, w, d, h, color, geometry, price) in PRODUCTS:
        puid = uid(f"prod:{sku}")
        cat_uid = uid(f"cat:{cat_slug_id}")
        lines.append(
            f"INSERT INTO products (id, tenant_id, company_id, workspace_id, category_id, name, sku, description_short, width, depth, height, unit, default_color, geometry_type, is_scene_prop, is_quotable, price, is_public, status) VALUES ("
            f"'{puid}', '{TENANT_ID}', '{COMPANY_ID}', '{WORKSPACE_ID}', "
            f"'{cat_uid}', '{esc(name)}', '{sku}', '{esc(desc)}', "
            f"{w}, {d}, {h}, 'cm', '{color}', '{geometry}', "
            f"false, true, {price}, false, 'active') "
            f"ON CONFLICT (tenant_id, sku) DO NOTHING;"
        )

    lines.append("")
    lines.append("COMMIT;")
    return "\n".join(lines)

# ─── Main ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    sql = generate_sql()

    # Contar
    n_cats = len(CATEGORIES)
    n_prods = len(PRODUCTS)
    print(f"Generando: {n_cats} categorias, {n_prods} productos")

    # Escribir SQL a archivo temporal
    sql_path = "/tmp/alqia_catalog_seed.sql"
    with open(sql_path, "w") as f:
        f.write(sql)
    print(f"SQL escrito en {sql_path}")

    # Ejecutar contra Supabase
    import os
    env = os.environ.copy()
    env["PGPASSWORD"] = PGPASSWORD

    result = subprocess.run(
        ["psql", DB_URL, "-f", sql_path],
        capture_output=True, text=True, env=env
    )

    if result.returncode != 0:
        print("ERROR:", result.stderr[:2000])
        sys.exit(1)

    # Contar inserts exitosos
    output = result.stdout + result.stderr
    inserts = output.count("INSERT 0 1")
    skipped = output.count("INSERT 0 0")

    print(f"Resultado: {inserts} filas insertadas, {skipped} ya existian (ON CONFLICT)")
    print("Catalogo cargado en Supabase.")
