# ALQIA VIRTUAL BUILDER
## Plan de Desarrollo por Fases
**Versión 1.4 — 6 de junio de 2026**
*Revisado y aprobado por dirección con correcciones estratégicas*

---

## DIRECTRIZ ESTRATEGICA DE PRODUCTO

> **Frase interna:** Alqia Virtual Builder convierte productos difíciles de imaginar en oportunidades comerciales fáciles de seguir.
>
> **Frase técnica de enfoque:** Do not build a 3D viewer. Build a visual sales engine.

### Definicion de producto

Alqia Virtual Builder NO es un configurador 3D genérico.
Es un **Visual Sales Builder multindustria**.

El valor principal no es mover objetos en una escena.
El valor principal es convertir una configuración visual en una intención comercial accionable.

### Flujo que el sistema debe resolver completo

1. El cliente visualiza una solución.
2. El cliente configura productos o espacios.
3. El sistema guarda el proyecto.
4. El sistema captura datos del cliente.
5. El sistema genera una solicitud de cotización.
6. El sistema resume la necesidad comercial.
7. El sistema prepara información útil para el asesor.
8. El sistema deja lista la conexión futura con Portalia o CRM.
9. El sistema mide qué productos, escenas y verticales generan más interés.

Cada pantalla, componente y evento debe responder a esta pregunta:
**¿Cómo ayuda esto a convertir una visualización en una oportunidad comercial?**

### Lo que NO es este sistema

- Visor 3D ornamental
- Catálogo 3D sin captura de intención
- Ecommerce visual
- Demo exclusiva de SIA
- Showroom sin datos de negocio
- Herramienta técnica tipo CAD

### Lo que SI es este sistema

- Plataforma visual comercial
- Motor multivertical de preventa
- Generador de leads calificados
- Configurador de soluciones por industria
- Asistente visual de preventa
- Base para cotización y seguimiento
- Producto licenciable de Alqia para distribución en LATAM

### Diferenciador clave

Alqia Virtual Builder debe ser más rápido de implementar, más claro para empresas medianas de LATAM y más orientado a ventas que las plataformas enterprise tradicionales.

### El 3D es el medio. La venta es el objetivo.

El usuario final no debe sentir que está usando software técnico.
Debe sentir que está **armando una propuesta visual para pedir información, cotización o asesoría**.

### Requerimientos por vertical (cada una debe tener)

- Catálogo propio mock (listo)
- Escenas propias mock (en progreso)
- Categorías propias (listo)
- Placeholders visuales diferenciados (listo — geometria procedimental por tipo)
- Formulario comercial compatible (listo — QuoteRequestModal)
- Resumen de proyecto (listo — ProjectDetailView)
- Solicitud de cotización (listo — flujo completo con PDF)
- Analytics básico (listo — AnalyticsView con métricas por vertical)

### Claridad sobre la geometria 3D en Fase 0

La maqueta usa geometria procedimental de referencia comercial — NO modelos CAD detallados.
Esto es correcto por diseño: el objetivo es demostrar el flujo de preventa, no el detalle técnico del producto.

| Tipo geometrico | Representa | Detalle real (Fase 1+) |
|---|---|---|
| box_tall | Gabinetes, armarios, columnas | Cargar .glb con puertas y manijas |
| box_flat | Mesas, camas, islas, camillas | Cargar .glb con estructura real |
| shelf_rack | Racks, anaqueles, cocinas | Cargar .glb con niveles y soportes |
| panel_v | Pantallas, espejos, muros | Cargar .glb con marco y detalles |
| seating | Sillas, sofas, sillones | Cargar .glb con tapiz y brazos |
| vehicle | Autos, motos, maquinaria | Cargar .glb con detalle de carroceria |

En Fase 1, `Product.default_model_asset_id` apunta al .glb real. La arquitectura ya soporta esto.

### Arquitectura que debe conservarse siempre

- Core reutilizable por vertical (no hay logica hardcodeada por industria)
- Templates por industria en mock separado
- Datos mock separados por vertical con `vertical_key`
- Eventos analíticos completos con eventBus
- Stubs de IA comercial (resumen de proyecto, sugerencia de productos)
- Stub futuro de Portalia (CRM connector en SettingsView)
- Estructura lista para Supabase (IDs, tenant_id, workspace_id en todos los schemas)
- Nada hardcodeado para SIA — SIA es la primera vertical, no el producto

---

## ESTADO DE DESARROLLO — 6 de junio de 2026

### Fase 0 — Maqueta funcional

| Iteración | Descripción | Estado | Fecha |
|---|---|---|---|
| Iteración 1 | Base del proyecto, shell visual, todos los módulos navegables | COMPLETADA | 6 jun 2026 |
| Iteración 2 | Motor 3D real (R3F), canvas, objetos, propiedades, guardar | COMPLETADA | 6 jun 2026 |
| Iteración 3 | Flujo completo de cotización, modal validado, PDF disclaimer | COMPLETADA | 6 jun 2026 |
| Iteración 4 | Undo/redo, nombre editable, variantes, rotación rápida, confirmación eliminar, eventos | COMPLETADA | 6 jun 2026 |
| Iteración 5 | ProjectDetailView, ruta /projects/:id, QuoteRequestsList con filtros y detalle expandible | COMPLETADA | 6 jun 2026 |
| Iteración 6 | CatalogList+ProductForm completo, AssetsView con filtros, AnalyticsView con gráficas CSS, SettingsView con 8 secciones | COMPLETADA | 6 jun 2026 |

### Pivot Multivertical (post Fase 0)

| Entregable | Estado | Fecha |
|---|---|---|
| types/index.ts — VerticalTemplateKey (7 verticales) + GeometryType (6 tipos 3D) | COMPLETADA | 6 jun 2026 |
| src/data/mock/products.ts — 7 verticales, 26 categorias, 47 productos | COMPLETADA | 6 jun 2026 |
| src/data/mock/templates.ts — 12 plantillas para 7 verticales | COMPLETADA | 6 jun 2026 |
| catalogService.ts — filtrado por verticalKey | COMPLETADA | 6 jun 2026 |
| CatalogPanel.tsx — indicador de vertical activa + geometry_type en metadata | COMPLETADA | 6 jun 2026 |
| ProductObject.tsx — geometrias 3D diferenciadas (box_tall, box_flat, shelf_rack, panel_v, vehicle, seating) | COMPLETADA | 6 jun 2026 |
| DashboardWorkspace.tsx — seccion 7 verticales, sin hardcode SIA | COMPLETADA | 6 jun 2026 |

**Arquitectura multivertical:**

- `vertical_key` se almacena en `BuilderProject.metadata.vertical_key` (tipo `VerticalTemplateKey`)
- `ProductCategory.vertical_key` vincula categorias a verticales — el catalogo filtra por la vertical del proyecto activo
- `Product.geometry_type` indica al renderer 3D que forma usar para cada producto
- `ProductObject.tsx` renderiza formas diferenciadas segun `geometry_type` (sin usar modelos .glb externos en Fase 0)
- Al agregar un producto al canvas, `geometry_type` se propaga al `ProjectObject.metadata` para que el renderer lo lea
- El Dashboard expone las 7 verticales como punto de entrada; cada una navega al builder con `?vertical=KEY` en la URL
- El nombre del producto madre es **Alqia Virtual Builder Core** — SIA es la primera vertical de lanzamiento comercial
- Ningun texto en UI esta hardcodeado a SIA, gabinetes, ni almacenamiento industrial

**Verticales implementadas en mock:**

| Key | Nombre | Categorias | Productos |
|---|---|---|---|
| industrial_storage | Almacenamiento Industrial (SIA) | 4 | 9 |
| furniture_kitchen | Muebles, Cocinas y Closets | 4 | 10 |
| real_estate | Inmobiliario | 4 | 6 |
| retail_layout | Retail y Tiendas | 4 | 5 |
| event_stand | Eventos y Stands | 4 | 6 |
| medical_space | Espacios Medicos | 3 | 5 |
| vehicle_configurator | Configurador de Vehiculos | 3 | 5 |

### Fases posteriores

| Fase | Estado |
|---|---|
| Fase 1 — MVP con Supabase | PENDIENTE — requiere Fase 0 completa |
| Fase 2 — SIA 3D Planner en producción | PENDIENTE |
| Fase 3 — Portalia Connector | PENDIENTE — stub listo desde ahora |
| Fase 4 — IA avanzada | PENDIENTE — stub listo desde ahora |
| Fase 5 — AR/VR | CONGELADA — requiere validación comercial |

---

## Detalle de lo entregado

### Iteración 1 — COMPLETADA

**Archivos creados:**
- `package.json`, `vite.config.ts`, `tsconfig*.json`, `tailwind.config.js`, `postcss.config.js`, `eslint.config.js`, `.prettierrc`, `.gitignore`
- `index.html` (Questrial + Inter via Google Fonts)
- `src/vite-env.d.ts`, `src/styles/tokens.css`, `src/styles/globals.css`
- `src/types/index.ts` — 20 entidades TypeScript completas con `tenant_id`, `company_id`, `metadata`
- `src/utils/cn.ts`, `src/utils/events.ts`, `src/utils/format.ts`
- `src/data/mock/products.ts` — 10 productos SIA, 4 categorías, 3 variantes
- `src/data/mock/projects.ts` — 3 proyectos con estados reales
- `src/data/mock/scenes.ts` — 3 escenas (almacén, taller, showroom)
- `src/data/mock/assets.ts` — 5 assets con estados variados
- `src/data/mock/quotes.ts` — 5 solicitudes de cotización
- `src/data/mock/templates.ts` — 4 plantillas de inicio rápido
- `src/data/mock/index.ts`
- `src/services/mock/projectService.ts`, `catalogService.ts`, `assetService.ts`, `quoteRequestService.ts`, `analyticsService.ts`, `aiBuilderService.ts`
- `src/services/mock/index.ts`
- `src/services/integrations/portaliaConnector.ts` — stub completo con `PortaliaPayload` tipado
- `src/store/builderStore.ts` — Zustand con estado completo + 10 acciones
- `src/components/ui/` — Button, Badge, StatusBadge, Input, Select, Modal, Toast+useToast, Tooltip, index.ts
- `src/components/glass/GlassPanel.tsx`
- `src/components/analytics/MetricCard.tsx`
- `src/components/layout/Sidebar.tsx`, `Topbar.tsx`, `AppShell.tsx`
- `src/app/providers.tsx`, `src/app/router.tsx`
- `src/App.tsx`, `src/main.tsx`
- `src/modules/dashboard/DashboardWorkspace.tsx`
- `src/modules/builder/BuilderView.tsx` (placeholder en esta iteración)
- `src/modules/projects/ProjectsList.tsx`
- `src/modules/catalog-admin/CatalogList.tsx`
- `src/modules/assets-3d/AssetsView.tsx`
- `src/modules/quote-requests/QuoteRequestsList.tsx`
- `src/modules/analytics/AnalyticsView.tsx`
- `src/modules/settings/SettingsView.tsx`
- `PLAN-DESARROLLO.md` v1.1

**Verificación:** `pnpm build` — 0 errores TypeScript, 0 warnings. `pnpm dev` en http://localhost:5174

---

### Iteración 2 — COMPLETADA

**Archivos creados o modificados:**
- `src/components/builder/BuilderCanvas.tsx` — Canvas R3F con sombras, 4 luces, OrbitControls, Grid Drei, bounds de escena
- `src/components/builder/SceneFloor.tsx` — piso con material concreto oscuro
- `src/components/builder/CameraController.tsx` — switch perspectiva/top-down desde store
- `src/components/builder/ProductObject.tsx` — BoxGeometry con dimensiones reales, selección, outline naranja, TransformControls (mover/rotar), snap configurable, sync bidireccional store↔Three.js
- `src/components/builder/sceneRefs.ts` — ref compartido para OrbitControls
- `src/modules/builder/panels/CatalogPanel.tsx` — búsqueda, categorías, agregar al espacio con offset automático
- `src/modules/builder/panels/PropertiesPanel.tsx` — edición X/Z, rotación Y (slider+input), color picker, bloqueo, duplicar, eliminar
- `src/modules/builder/BuilderView.tsx` — reescrito con canvas real, toolbar funcional, guardar con toast, indicador dirty

**Verificación:** `pnpm build` — 0 errores TypeScript. Motor 3D carga, objetos se agregan, seleccionan, mueven, rotan y se persisten en localStorage.

---

## Próximo paso inmediato: Iteración 3

**Objetivo:** flujo completo de solicitud de cotización desde el builder.

**Entregable verificable:** el usuario puede abrir el modal de cotización desde el builder, completar el formulario validado con los productos del proyecto visible en un resumen lateral, enviarlo, ver pantalla de éxito y que el `QuoteRequest` quede registrado. El PDF exportable incluye el aviso legal obligatorio.

**Componentes a construir:**
1. `QuoteRequestModal.tsx` — Modal con react-hook-form + zod, validación de campos requeridos, resumen del proyecto (productos + escena), canal de contacto preferido, checkbox de consentimiento
2. `QuoteSuccessScreen.tsx` — Pantalla post-envío con resumen, acciones (volver al builder, ver cotizaciones), aviso legal visible
3. `useQuoteRequest.ts` — Hook con lógica de submit: crea `QuoteRequest`, actualiza estado del proyecto a `quote_requested`, llama stub de Portalia, emite evento `quote.request.submitted`, muestra toast
4. `exportService.ts` — Captura PNG del canvas (html2canvas), genera PDF (jsPDF) con lista de productos, escena y disclaimer legal obligatorio
5. Botón "Solicitar cotización" activo en `BuilderView` toolbar

**Regla de disclaimer en PDF (no negociable):**
> "Configuración preliminar sujeta a validación técnica y cotización final."

---

---

## Contexto del producto

Alqia Virtual Builder es una plataforma SaaS de simulación visual comercial. No es CAD, no es metaverso, no es ecommerce. Es un configurador visual que convierte productos difíciles de imaginar en experiencias interactivas que generan leads y solicitudes de cotización. El core es multiempresa y multivertical. La primera vertical de lanzamiento es SIA (almacenamiento industrial).

**Frase rectora del producto:**
> Alqia Virtual Builder convierte productos difíciles de imaginar en experiencias fáciles de decidir.

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework principal | React 18 + Vite + TypeScript (strict) |
| Motor 3D | React Three Fiber + Three.js + Drei |
| Estilos | TailwindCSS 3 + tokens de diseño Alqia |
| Animaciones | Framer Motion |
| Estado global del builder | Zustand |
| Datos y caché | TanStack Query v5 |
| Formularios y validaciones | React Hook Form + Zod |
| Tipografía | Questrial (Google Fonts) + Inter (secundaria) |
| Exportación | html2canvas + jsPDF |
| Backend (desde Fase 1) | Supabase Auth + Postgres + Storage + Edge Functions |
| Deploy | Vercel (frontend) + Supabase (backend) |

---

## Paleta visual fija

| Token | Valor |
|---|---|
| Azul profundo (base) | `#202D3D` |
| Naranja cobre (acento) | `#F98058` |
| Blanco | `#FFFFFF` |
| Fondo oscuro | `#18212D` |
| Fondo ultra oscuro | `#111923` |
| Panel cristal | `rgba(255,255,255,0.08)` |
| Panel cristal activo | `rgba(255,255,255,0.14)` |
| Texto secundario | `#A7B3C2` |
| Texto apagado | `#718096` |
| Estado éxito | `#4ADE80` |
| Estado alerta | `#FACC15` |
| Estado riesgo | `#FB7185` |
| Estado info | `#38BDF8` |

---

## Estructura de carpetas del proyecto

```
src/
  app/                  → Router, providers, AppShell raíz
  components/
    ui/                 → Button, Input, Badge, Tooltip, Select, Modal, Toast
    layout/             → AppShell, Sidebar colapsable, Topbar, MainContent
    glass/              → GlassPanel (variantes: default / floating / compact / active)
    builder/            → BuilderCanvas, TopToolbar, BottomToolbar,
                          CatalogSidebar, PropertiesPanel, ObjectControls
    catalog/            → ProductCard, CategoryChip, VariantSelector, ColorPicker
    projects/           → ProjectCard, ProjectDetail
    analytics/          → MetricCard, ChartCard
  modules/
    dashboard/          → DashboardWorkspace
    builder/            → BuilderView (pantalla completa)
    catalog-admin/      → CatalogList, ProductForm
    assets-3d/          → AssetsView, AssetCard
    projects/           → ProjectsList, ProjectDetailView
    quote-requests/     → QuoteRequestsList, QuoteRequestModal
    analytics/          → AnalyticsView
    settings/           → SettingsView (branding, embed, unidades, permisos)
  engine/
    three/
      scene/            → SceneRoot, SceneGrid, Floor, Lights
      objects/          → Object3DWrapper, placeholders geométricos
      placement/        → PlacementEngine, posiciones, snap al grid
      rules/            → RulesEngine (no flotar, límites, bloqueos)
      measurements/     → DimensionHelper, etiquetas de medidas visibles
      materials/        → MaterialEngine, cambio de color sobre objetos
      camera/           → CameraControls (orbital, vista superior)
  services/
    mock/               → projectService, catalogService, assetService,
                          builderEngineService, quoteRequestService,
                          aiBuilderService, analyticsService
    supabase/           → mismas interfaces que mock/ (adaptador swap)
    ai/                 → aiBuilderService stub preparado
    exports/            → exportService (capture canvas + PDF)
    integrations/       → portaliaConnector stub con payload completo definido
  types/                → 25 entidades TypeScript completas
  data/                 → datos mock estructurados (vertical SIA)
  styles/               → variables CSS, design tokens Alqia
  utils/                → helpers, formatters, event bus del sistema
```

---

## Entidades de datos (tipos TypeScript + modelo Supabase futuro)

Todas las entidades incluyen desde el inicio los campos `tenant_id`, `company_id`, `created_at`, `updated_at`, `status` y `metadata JSONB` para soportar multiempresa sin refactoring posterior.

| Entidad | Descripción |
|---|---|
| `Tenant` | Grupo o cliente principal |
| `Company` | Empresa o marca dentro del tenant |
| `Workspace` | Espacio de trabajo por empresa/vertical |
| `VerticalTemplate` | Plantilla de industria (industrial_storage, real_estate, etc.) |
| `Scene` | Escenario base (dimensiones, piso, luces, cámara) |
| `ProductCategory` | Categorías del catálogo |
| `Product` | Producto del catálogo |
| `ProductVariant` | Variantes de medidas, color o modelo |
| `Asset3D` | Modelos GLB/GLTF y recursos 3D |
| `BuilderProject` | Proyecto visual creado por usuario |
| `ProjectObject` | Objeto colocado en escena (posición, rotación, color, variante) |
| `ProjectSnapshot` | Versiones guardadas del proyecto |
| `ProjectExport` | Exportaciones generadas (PDF, PNG, JSON) |
| `QuoteRequest` | Solicitud de cotización con datos de cliente |
| `AiBuilderSuggestion` | Sugerencias IA contextuales al proyecto |
| `AnalyticsEvent` | Eventos de uso y conversión |
| `EmbedConfig` | Configuración de integración en web del cliente |
| `AuditLog` | Registro de auditoría de todas las acciones |
| `User` | Usuario del sistema |
| `Role` | Rol con permisos JSONB |

---

## Roles del sistema

| Rol | Descripción |
|---|---|
| Super Admin Alqia | Gestión global de tenants, planes, plantillas y modelos base |
| Owner Empresa | Ve todos los proyectos, leads, analítica y configuración de su empresa |
| Admin Empresa | Carga catálogo, modelos 3D, escenarios y formularios |
| Vendedor / Asesor | Crea proyectos para clientes, genera propuestas y leads |
| Diseñador / Configurador | Prepara layouts, plantillas y entregables visuales |
| Cliente visitante | Accede al builder público sin login, puede solicitar cotización |

---

## Navegación principal

- Dashboard
- Builder
- Proyectos
- Catálogo
- Assets 3D
- Solicitudes de cotización
- Analítica
- Configuración

---

## Pantallas del producto

| Pantalla | Descripción |
|---|---|
| Dashboard Workspace | KPIs, proyectos recientes, plantillas rápidas, accesos directos |
| Builder 3D | Pantalla completa: catálogo lateral, canvas 3D, propiedades de objeto |
| Proyectos | Galería con filtros: estado, cliente, fecha, asesor, cotización |
| Detalle de proyecto | Vista previa, productos usados, historial, notas, acciones comerciales |
| Catálogo Admin | Lista de productos con estados, filtros y acciones |
| Crear / Editar producto | Formulario completo con variantes y asignación de modelo 3D |
| Assets 3D | Gestión de modelos GLB: subida, preview, estado, vinculación a producto |
| Solicitudes de cotización | Lista y detalle de solicitudes con estado comercial |
| Analítica | KPIs de uso: proyectos, solicitudes, productos más usados, conversión |
| Configuración | Branding, embed, formulario de lead, unidades, plantillas, Portalia |

---

## Sistema de eventos del builder

Todas las acciones del builder generan eventos tipados. Los eventos se registran en `analytics_events` y `audit_logs` desde Fase 1 en adelante.

**Formato:** `module.entity.action`

**Eventos obligatorios MVP:**

| Módulo | Eventos (strings completos obligatorios) |
|---|---|
| Proyectos | `builder.project.created`, `builder.project.opened`, `builder.project.saved`, `builder.project.duplicated`, `builder.project.deleted`, `builder.project.export_requested`, `builder.project.exported`, `builder.project.renamed` |
| Objetos 3D | `builder.object.added`, `builder.object.selected`, `builder.object.moved`, `builder.object.rotated`, `builder.object.duplicated`, `builder.object.deleted`, `builder.object.color_changed`, `builder.object.variant_changed`, `builder.object.locked`, `builder.object.unlocked` |
| Escena | `builder.scene.loaded`, `builder.scene.changed`, `builder.grid.toggled`, `builder.snap.toggled`, `builder.camera.changed` |
| Catálogo | `catalog.product.created`, `catalog.product.updated`, `catalog.product.disabled`, `catalog.product.variant_created`, `catalog.category.created` |
| Assets | `asset.model.uploaded`, `asset.model.previewed`, `asset.model.linked_to_product`, `asset.model.load_failed` |
| Cotización | `quote.request.opened`, `quote.request.submitted`, `quote.request.created`, `quote.request.sent_to_portalia` |
| IA | `ai.project.summary_generated`, `ai.product.suggestion_created`, `ai.configuration.issue_detected`, `ai.proposal_text_generated` |

**Regla de implementación — sin abreviaturas:**
Los eventos deben registrarse siempre como strings completos en el código. Nunca usar abreviaciones como `.opened`, `.saved` o `.deleted` sin el prefijo completo. Esto garantiza que los registros en `analytics_events` y `audit_logs` sean legibles, consultables y consistentes entre verticales.

---

## Fase 0 — Maqueta funcional

**Objetivo:** demostrar la experiencia completa del producto con datos mock bien estructurados. Sin backend real.

**Todo el código de Fase 0 ya está preparado para conectar Supabase y producción sin refactoring estructural.** Los servicios mock implementan las mismas interfaces que implementarán los servicios reales. Los tipos TypeScript ya tienen todos los campos del modelo de datos de producción.

### Pantallas incluidas en Fase 0

- Dashboard Workspace con KPIs mock y proyectos recientes
- Builder 3D con objetos geométricos (cajas con dimensiones, colores y etiquetas como placeholder mientras no hay GLB reales)
- Proyectos (lista + detalle mock)
- Catálogo Admin (lista + formulario crear/editar producto)
- Assets 3D (UI completa con estados mock: uploaded / processing / optimized / failed)
- Solicitudes de cotización (lista + QuoteRequestModal funcional)
- Analítica (métricas mock)
- Configuración (branding, embed, unidades, Portalia connector visible pero inactivo)

### Funciones del Builder en Fase 0

| Función | Estado |
|---|---|
| Agregar objeto desde catálogo (clic) | Incluido |
| Seleccionar objeto — abre PropertiesPanel | Incluido |
| Mover objeto sobre plano X/Z con drag | Incluido |
| Rotar con botones (-45°, -15°, +15°, +45°) | Incluido |
| Duplicar objeto | Incluido |
| Eliminar objeto con confirmación | Incluido |
| Cambiar color desde ColorPicker | Incluido |
| Cambiar variante | Incluido |
| Bloquear / desbloquear objeto | Incluido |
| Guardar proyecto (localStorage en Fase 0) | Incluido |
| Deshacer / rehacer | Incluido |
| Vista superior / perspectiva | Incluido |
| Grid on/off | Incluido |
| Snap al grid on/off | Incluido |
| QuoteRequestModal con validación de campos | Incluido |
| Exportación simulada (capture PNG del canvas) | Incluido |
| Estado dirty / guardado visible en toolbar | Incluido |
| Nombre de proyecto editable en toolbar | Incluido |

### Iteración 1 — Base del proyecto y shell visual

**Entregable verificable:** la aplicación corre en local con navegación completa, sidebar funcional y paleta Alqia aplicada. Sin 3D todavía.

- Setup: Vite + React + TypeScript strict + TailwindCSS + ESLint + Prettier
- Design tokens Alqia: paleta completa, tipografía Questrial (Google Fonts), variables CSS
- Componentes UI base: Button, Input, Badge, Select, Tooltip, Modal, Toast, StatusBadge
- GlassPanel con variantes (default, floating, compact, active)
- AppShell: Sidebar colapsable, Topbar global, MainContent
- Navegación entre módulos (router con placeholder screens)
- 25 tipos TypeScript completos alineados con modelo de datos de producción
- Datos mock SIA (10 productos, 3 escenarios, 3 proyectos, 5 solicitudes de cotización)
- Servicios mock con interfaces idénticas a las que tendrán los servicios reales de Supabase
- EventBus mock con eventos como strings completos tipados

### Iteración 2 — Motor 3D y canvas base

**Entregable verificable:** el BuilderCanvas carga, se puede orbitar la cámara, se ve el grid y el piso. Sin objetos todavía.

- BuilderCanvas (React Three Fiber + Drei)
- SceneGrid con toggle
- Floor con material base
- Luces base (ambiente + direccional)
- CameraControls: modo orbital y modo vista superior
- Objetos placeholder geométricos con etiquetas visibles (nombre + medidas)
- Selección de objetos con raycasting
- TopToolbar con todos los botones estructurados
- BottomToolbar con controles de escena

### Iteración 3 — Catálogo lateral y agregar objetos

**Entregable verificable:** se pueden agregar objetos desde el catálogo, aparecen en escena con placeholder y se pueden seleccionar.

- CatalogSidebar con categorías, búsqueda y ProductCards mock
- Agregar objeto desde catálogo → posición automática en escena
- Seleccionar objeto → PropertiesPanel se abre
- Deseleccionar → PropertiesPanel se cierra
- CreateProjectModal funcional
- Estado inicial vacío con mensaje guía
- Eventos mock registrados: `builder.object.added`, `builder.object.selected`

### Iteración 4 — Interacciones completas del builder

**Entregable verificable:** el builder completo funciona con todas las interacciones sobre objetos y el estado se guarda en localStorage.

- Mover objeto con drag sobre plano X/Z
- Rotar con botones en PropertiesPanel (-45°, -15°, +15°, +45°)
- Duplicar objeto (desplazamiento automático, mantiene variante/color)
- Eliminar objeto con confirmación
- PropertiesPanel completo: medidas, posición, rotación, color, variante, acciones
- ColorPicker integrado con actualización visual en tiempo real
- Cambiar variante desde PropertiesPanel
- Bloquear / desbloquear objeto
- Snap al grid on/off
- Guardar en localStorage con estado dirty/saved
- Deshacer / rehacer
- Nombre de proyecto editable en toolbar
- Todos los eventos del builder registrados como strings completos

### Iteración 5 — Proyectos y solicitudes de cotización

**Entregable verificable:** se puede navegar a Proyectos, ver detalle, y abrir + completar el flujo de cotización.

- Lista de proyectos con filtros (estado, fecha, cliente)
- ProjectCard completo con acciones
- Detalle de proyecto: vista previa, productos usados, notas, historial
- QuoteRequestModal funcional con validación de campos
- Resumen lateral del proyecto en el modal
- Pantalla de éxito de cotización con mensaje y acciones
- Export simulado (capture PNG del canvas + PDF preliminar con aviso legal)

**El PDF debe incluir siempre:**
> "Configuración preliminar sujeta a validación técnica y cotización final."

Esto es un candado comercial y legal, no decoración. No es opcional en ninguna fase.

### Iteración 6 — Módulos admin, analítica y configuración

**Entregable verificable:** todas las pantallas del sistema son navegables y funcionales con datos mock.

- Catálogo Admin: lista + ProductForm completo con variantes y asignación de asset 3D
- Assets 3D: vista de gestión con estados (uploaded, processing, optimized, failed, active, archived)
- Analítica con métricas mock y cards de KPIs
- Configuración completa: branding, embed (iframe/subdominio), formulario de lead, unidades, plantillas
- Portalia Connector visible en configuración pero marcado como inactivo hasta Fase 3
- IA visible como sección pero marcada como stub hasta Fase 4

---

## Fase 1 — MVP funcional

**Objetivo:** producto funcional con backend real. Los servicios mock se reemplazan por adaptadores Supabase sin cambiar la lógica de la aplicación.

**Regla de ejecución:** Fase 1 no se implementa en una sola bola. Se divide en sub-fases secuenciales. Cada sub-fase debe estar completa y verificada antes de iniciar la siguiente.

### Sub-fase 1.1 — SQL, tipos y migraciones

- Crear todas las tablas en Supabase Postgres
- Migraciones versionadas desde el inicio
- Verificar que los tipos TypeScript del proyecto coincidan exactamente con el schema de base de datos
- Seed de datos iniciales para desarrollo

### Sub-fase 1.2 — Auth, roles y RLS

- Supabase Auth activado (login, sesión, logout, refresh)
- Tabla `users` y `roles` conectadas a `auth.users`
- RLS activado en todas las tablas sensibles
- Políticas por tenant verificadas
- Login funcional con redirección al dashboard

### Tablas con RLS obligatorio

`companies`, `workspaces`, `products`, `product_variants`, `assets_3d`, `scenes`, `builder_projects`, `project_objects`, `project_snapshots`, `project_exports`, `quote_requests`, `analytics_events`, `embed_configs`, `audit_logs`, `users`, `roles`, `vertical_templates` (si hay plantillas privadas por tenant)

**Nota:** las tablas `project_snapshots`, `project_exports`, `embed_configs`, `audit_logs`, `users` y `roles` también deben estar blindadas. Si no, existen rutas de acceso cruzado entre tenants.

### Política base de RLS

> Usuario autenticado pertenece al tenant → tiene acceso al workspace → su rol permite la acción.

### Sub-fase 1.3 — Persistencia de proyectos y objetos

- Guardar `builder_projects` en Supabase
- Guardar `project_objects` en Supabase
- Guardar `project_snapshots` opcionales
- Cargar proyecto desde base de datos al abrir
- Sincronización del estado Zustand con persistencia real

### Sub-fase 1.4 — Catálogo real

- CRUD de productos en Supabase
- CRUD de variantes
- CRUD de categorías
- Catálogo cargado desde base de datos en lugar de mock

### Sub-fase 1.5 — Storage para assets

- Supabase Storage activado para modelos GLB/GLTF
- Upload de assets 3D desde la interfaz
- Generación de thumbnail
- URLs protegidas para admin, URLs públicas solo para assets publicados
- Validación de formato y tamaño máximo

### Sub-fase 1.6 — Quote requests y notificaciones

- `quote_requests` guardadas en Supabase
- Supabase Edge Function para notificación email al equipo
- Estado del proyecto actualizado a `quote_requested`
- Registro en `analytics_events` y `audit_logs`

### Sub-fase 1.7 — Analytics y audit logs

- `analytics_events` registrando todos los eventos del builder
- `audit_logs` registrando acciones de usuarios y del sistema
- Dashboard con datos reales desde Supabase

### Sub-fase 1.8 — QA multiempresa

- Prueba con dos tenants distintos
- Verificar aislamiento total: proyectos, catálogo, assets, leads
- Verificar que un usuario de tenant A no puede ver ni acceder a datos de tenant B
- Verificar que el builder público no expone catálogo interno

---

## Fase 2 — SIA 3D Planner

**Objetivo:** despliegue de la primera vertical comercial para SIA.

### Incluye

- Branding SIA aplicado al workspace (colores, logo, formulario personalizado)
- Catálogo SIA con 10–20 productos reales (gabinetes, anaqueles, racks, mesas, cajoneras)
- Modelos GLB optimizados por producto
- Subdominio de acceso público (ejemplo: `3d.siaorg.com`)
- Builder público para visitantes del sitio web de SIA
- PDF comercial completo con imagen, lista de productos y aviso de validación
- Proyectos de vendedores con asignación y seguimiento
- Formulario de cotización configurado con campos propios de SIA
- Notificaciones al equipo comercial de SIA

### Seguridad del builder público — obligatoria en Fase 2

El builder público de SIA es accesible sin login. Esto requiere controles explícitos:

- Acceso controlado mediante `public_workspace_token` en la URL
- Lista de dominios permitidos (`allowed_domains`) en `embed_configs`
- Solo productos marcados como `is_public = true` son visibles
- Solo escenas marcadas como públicas son accesibles
- El visitante no puede ver ni acceder al catálogo interno, otros proyectos ni ninguna pantalla de admin
- Rate limiting en sub-fase futura para proteger endpoints públicos
- Cero exposición de datos de otros proyectos o tenants

**El builder público puede hacer:** ver productos públicos, crear proyecto temporal, solicitar cotización.
**El builder público no puede hacer:** editar catálogo, ver proyectos de otros, ver analítica, acceder a admin, ver productos privados.

---

## Fase 3 — Portalia Connector

**Objetivo:** conectar el builder comercialmente con Portalia Revenue OS al momento de solicitar cotización.

### Flujo de conexión

Cuando se crea un `quote_request`:

1. Virtual Builder envía payload a Portalia
2. Portalia crea: contacto, oportunidad, interacción, tarea, posible cadencia

### Payload hacia Portalia

```json
{
  "tenant_id": "...",
  "company_id": "...",
  "source": "virtual_builder",
  "client_name": "...",
  "client_email": "...",
  "client_phone": "...",
  "client_company": "...",
  "project_id": "...",
  "project_url": "...",
  "project_summary": "...",
  "products_used": [...],
  "scene_type": "warehouse",
  "ai_summary": "...",
  "estimated_value": null
}
```

**Evento:** `quote.request.sent_to_portalia`

El conector ya estará estructurado como stub desde Fase 0 para que la activación en Fase 3 sea un cambio de configuración, no un nuevo desarrollo.

---

## Fase 4 — IA avanzada

**Objetivo:** activar las funciones de IA que ya estarán estructuradas como stubs desde Fase 0.

### Funciones

| Función IA | Descripción |
|---|---|
| Resumen comercial de proyecto | Convierte la configuración en un resumen para el vendedor |
| Clasificación de necesidad | Identifica tipo de proyecto (almacenamiento, mantenimiento, bodega, etc.) |
| Sugerencias de productos | Propone productos del catálogo real, sin inventar SKUs |
| Detección de configuración incompleta | Alerta si falta información de cliente, medidas o variantes |
| Generación de texto de propuesta | Genera descripción, beneficios, siguiente paso y correo para cliente |

### Regla crítica de IA

La IA solo puede sugerir productos existentes en el catálogo. Nunca puede agregar objetos a la escena sin aprobación del usuario. Sus acciones siempre quedan registradas en `audit_logs`.

---

## Fase 5 — AR / VR

**Condición:** solo se desarrolla si existe validación comercial confirmada de demanda.

### Posibles capacidades

- Vista móvil en realidad aumentada (WebXR)
- Modo showroom para ferias y exposiciones
- Multiusuario colaborativo (proyectos compartidos en tiempo real)

---

## Criterios de aceptación — Fase 0

La maqueta se considera completa y lista para revisión cuando cumpla todos los criterios siguientes:

- [ ] La experiencia visual se ve premium, no parece admin panel ni CRM genérico
- [ ] Usa colores Alqia exactos: `#202D3D`, `#F98058`, `#FFFFFF`
- [ ] Tipografía Questrial en toda la interfaz
- [ ] Glassmorphism sobrio en paneles
- [ ] Dashboard workspace funcional con KPIs mock
- [ ] Builder 3D carga con escena, piso y grid
- [ ] CatalogSidebar con productos mock visibles
- [ ] Se pueden agregar objetos a la escena desde el catálogo
- [ ] Los objetos se pueden seleccionar
- [ ] Los objetos se pueden mover con drag
- [ ] Los objetos se pueden rotar con botones
- [ ] Los objetos se pueden duplicar
- [ ] Los objetos se pueden eliminar
- [ ] Se puede cambiar el color del objeto seleccionado
- [ ] PropertiesPanel aparece al seleccionar y cierra al deseleccionar
- [ ] El proyecto se puede guardar (localStorage)
- [ ] El nombre del proyecto es editable en el toolbar
- [ ] Vista superior y perspectiva funcionan
- [ ] Grid y snap tienen toggle funcional
- [ ] QuoteRequestModal se abre y el formulario valida los campos mínimos
- [ ] Pantalla de éxito de cotización se muestra al enviar
- [ ] Lista de proyectos mock funcional con filtros
- [ ] Detalle de proyecto mock con productos usados
- [ ] Catálogo Admin muestra productos mock con estados
- [ ] ProductForm permite crear y editar producto
- [ ] Assets 3D muestra modelos mock con estados y acciones
- [ ] Analítica muestra KPIs mock
- [ ] Configuración muestra secciones con branding, embed y Portalia
- [ ] Ningún dato está hardcodeado para SIA en el core del sistema
- [ ] Los tipos TypeScript están completos y todos los servicios mock los respetan
- [ ] La estructura está lista para recibir Supabase sin refactoring estructural

---

## Principios que no cambian en ninguna fase

1. El 3D debe generar negocio, no solo verse bien
2. Claridad visual antes que hiperrealismo
3. El usuario final no es diseñador 3D: la experiencia debe ser clic, arrastrar, guardar, solicitar
4. Todo el core es reutilizable y parametrizable por vertical
5. Nada hardcodeado para SIA en el core
6. La configuración generada siempre es preliminar: incluir aviso en toda exportación y solicitud
7. Modelos GLB optimizados, sin texturas pesadas, sin postprocesado costoso en MVP
8. La IA es asistente contextual, nunca protagonista de la interfaz

---

## Notas para presentación a cliente

**Para SIA / Javi:**
> "Creamos una experiencia 3D integrada a la presencia digital de SIA para que los clientes puedan visualizar y configurar soluciones de almacenamiento antes de solicitar cotización. No sustituye la validación técnica ni al asesor, pero ayuda a que el cliente entienda, imagine y pida una solución más clara."

**Diferenciadores:**
- Diferencia a SIA de otros distribuidores
- Convierte la página web en herramienta comercial activa
- Genera leads más calificados con intención documentada
- Apoya a vendedores en reuniones presenciales
- Reduce dudas del cliente antes de la visita técnica
- Mejora percepción de innovación y confianza en la marca

**Mensaje clave:**
> "No vendemos un metaverso. Vendemos una herramienta visual para cerrar mejor."

---

---

## Veredicto ejecutivo de dirección

**Fecha de aprobación:** 6 de junio de 2026

**Estado:** Aprobado con correcciones estratégicas incorporadas en esta versión.

> Copilot puede seguir con este plan, pero debe ejecutar Fase 0 como maqueta premium modular, sin backend real, sin hardcodear SIA, con eventos mock tipados como strings completos y con arquitectura lista para Supabase. Para Fase 1, no debe implementar todo el backend de golpe: debe dividirlo en SQL/RLS/Auth, persistencia, Storage GLB, quote requests, analytics y auditoría. Además, debe agregar RLS a todas las tablas sensibles, incluyendo snapshots, exports, embed configs, audit logs, users y roles. Portalia queda como stub hasta Fase 3. IA avanzada queda como stub hasta Fase 4. AR/VR queda congelado hasta validación comercial.

**Resumen de correcciones aplicadas en v1.1:**
1. Fase 0 dividida en 6 iteraciones con entregables verificables por separado
2. Fase 1 dividida en 8 sub-fases secuenciales, no implementar como bloque único
3. RLS ampliado a todas las tablas sensibles (se agregaron: `project_snapshots`, `project_exports`, `embed_configs`, `audit_logs`, `users`, `roles`, `vertical_templates`)
4. Eventos del builder definidos como strings completos, sin abreviaturas en código
5. Seguridad del builder público de SIA especificada explícitamente en Fase 2
6. Aviso legal en PDF definido como obligatorio, no opcional, desde Fase 0

---

*Documento preparado por equipo Alqia — v1.2 — 6 de junio de 2026*
*Aprobado por dirección con correcciones estratégicas incorporadas*
*Última actualización de estado: 6 de junio de 2026 — Iteración 2 completada*
