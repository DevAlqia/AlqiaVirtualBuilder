import { useEffect, useRef, useState } from 'react'
import type React from 'react'
import { motion, useInView } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ChevronRight, Box, Layers, TrendingUp, Globe, Shield, Clock } from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────
// ICONOS ALQUÍMICOS — SVG procedural, animados con framer-motion pathLength
// ─────────────────────────────────────────────────────────────────────────────

interface IconProps { size?: number; color?: string; animated?: boolean }

const STROKE = { fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, strokeWidth: 1.5 }
const DRAW = { initial: { pathLength: 0, opacity: 0 }, animate: { pathLength: 1, opacity: 1 }, transition: { duration: 1.8, ease: 'easeInOut' as const } }

// Hexágono con retícula interna — Almacén / Industrial
function IconIndustrial({ size = 80, color = '#F97316', animated = false }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <motion.polygon {...STROKE} stroke={color} points="50,4 93,27 93,73 50,96 7,73 7,27" {...(animated ? DRAW : {})} />
      <motion.polygon {...STROKE} stroke={color} strokeOpacity={0.4} points="50,24 73,37 73,63 50,76 27,63 27,37" {...(animated ? { ...DRAW, transition: { ...DRAW.transition, delay: 0.3 } } : {})} />
      <motion.line {...STROKE} stroke={color} strokeOpacity={0.3} x1="50" y1="4" x2="50" y2="96" {...(animated ? { ...DRAW, transition: { ...DRAW.transition, delay: 0.6 } } : {})} />
      <motion.line {...STROKE} stroke={color} strokeOpacity={0.3} x1="7" y1="27" x2="93" y2="73" {...(animated ? { ...DRAW, transition: { ...DRAW.transition, delay: 0.7 } } : {})} />
      <motion.line {...STROKE} stroke={color} strokeOpacity={0.3} x1="93" y1="27" x2="7" y2="73" {...(animated ? { ...DRAW, transition: { ...DRAW.transition, delay: 0.8 } } : {})} />
      <motion.circle {...STROKE} stroke={color} fill={color} fillOpacity={0.9} cx="50" cy="50" r="5" {...(animated ? { ...DRAW, transition: { ...DRAW.transition, delay: 1.2 } } : {})} />
    </svg>
  )
}

// Triángulo con alambique interior — Cocinas / Muebles
function IconFurniture({ size = 80, color = '#D97706', animated = false }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <motion.polygon {...STROKE} stroke={color} points="50,5 95,90 5,90" {...(animated ? DRAW : {})} />
      <motion.circle {...STROKE} stroke={color} cx="50" cy="65" r="16" {...(animated ? { ...DRAW, transition: { ...DRAW.transition, delay: 0.4 } } : {})} />
      <motion.line {...STROKE} stroke={color} x1="50" y1="49" x2="50" y2="30" {...(animated ? { ...DRAW, transition: { ...DRAW.transition, delay: 0.7 } } : {})} />
      <motion.line {...STROKE} stroke={color} x1="38" y1="30" x2="62" y2="30" {...(animated ? { ...DRAW, transition: { ...DRAW.transition, delay: 0.9 } } : {})} />
      <motion.line {...STROKE} stroke={color} x1="34" y1="90" x2="50" y2="81" {...(animated ? { ...DRAW, transition: { ...DRAW.transition, delay: 1.1 } } : {})} />
      <motion.line {...STROKE} stroke={color} x1="66" y1="90" x2="50" y2="81" {...(animated ? { ...DRAW, transition: { ...DRAW.transition, delay: 1.1 } } : {})} />
      <motion.circle {...STROKE} stroke={color} fill={color} cx="50" cy="65" r="4" {...(animated ? { ...DRAW, transition: { ...DRAW.transition, delay: 1.3 } } : {})} />
    </svg>
  )
}

// Diamante con nodos — Retail / Comercio
function IconRetail({ size = 80, color = '#38BDF8', animated = false }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <motion.polygon {...STROKE} stroke={color} points="50,5 95,50 50,95 5,50" {...(animated ? DRAW : {})} />
      <motion.circle {...STROKE} stroke={color} cx="50" cy="50" r="14" {...(animated ? { ...DRAW, transition: { ...DRAW.transition, delay: 0.4 } } : {})} />
      <motion.line {...STROKE} stroke={color} x1="50" y1="5"  x2="50" y2="36" {...(animated ? { ...DRAW, transition: { ...DRAW.transition, delay: 0.6 } } : {})} />
      <motion.line {...STROKE} stroke={color} x1="95" y1="50" x2="64" y2="50" {...(animated ? { ...DRAW, transition: { ...DRAW.transition, delay: 0.7 } } : {})} />
      <motion.line {...STROKE} stroke={color} x1="50" y1="95" x2="50" y2="64" {...(animated ? { ...DRAW, transition: { ...DRAW.transition, delay: 0.8 } } : {})} />
      <motion.line {...STROKE} stroke={color} x1="5"  y1="50" x2="36" y2="50" {...(animated ? { ...DRAW, transition: { ...DRAW.transition, delay: 0.9 } } : {})} />
      {[5,95].flatMap(y => [5,95].map(x => (
        <motion.circle key={`${x}${y}`} {...STROKE} stroke={color} fill={color} fillOpacity={0.7} cx={x} cy={y} r="4"
          {...(animated ? { ...DRAW, transition: { ...DRAW.transition, delay: 1.2 } } : {})} />
      )))}
    </svg>
  )
}

// Pentágono con triángulo ascendente — Inmobiliario
function IconRealEstate({ size = 80, color = '#4ADE80', animated = false }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <motion.polygon {...STROKE} stroke={color} points="50,4 96,35 78,90 22,90 4,35" {...(animated ? DRAW : {})} />
      <motion.polygon {...STROKE} stroke={color} strokeOpacity={0.6} points="50,26 70,74 30,74" {...(animated ? { ...DRAW, transition: { ...DRAW.transition, delay: 0.4 } } : {})} />
      <motion.line {...STROKE} stroke={color} strokeOpacity={0.4} x1="50" y1="4" x2="50" y2="26" {...(animated ? { ...DRAW, transition: { ...DRAW.transition, delay: 0.7 } } : {})} />
      <motion.circle {...STROKE} stroke={color} fill={color} cx="50" cy="56" r="5" {...(animated ? { ...DRAW, transition: { ...DRAW.transition, delay: 1.1 } } : {})} />
    </svg>
  )
}

// Círculo con cruz y satélites — Médico
function IconMedical({ size = 80, color = '#CBD5E1', animated = false }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <motion.circle {...STROKE} stroke={color} cx="50" cy="50" r="42" {...(animated ? DRAW : {})} />
      <motion.line {...STROKE} stroke={color} x1="50" y1="8"  x2="50" y2="92" {...(animated ? { ...DRAW, transition: { ...DRAW.transition, delay: 0.5 } } : {})} />
      <motion.line {...STROKE} stroke={color} x1="8"  y1="50" x2="92" y2="50" {...(animated ? { ...DRAW, transition: { ...DRAW.transition, delay: 0.6 } } : {})} />
      {[[50,8],[92,50],[50,92],[8,50]].map(([cx,cy],i) => (
        <motion.circle key={i} {...STROKE} stroke={color} fill={color} cx={cx} cy={cy} r="5"
          {...(animated ? { ...DRAW, transition: { ...DRAW.transition, delay: 0.9 + i*0.1 } } : {})} />
      ))}
      <motion.circle {...STROKE} stroke={color} cx="50" cy="50" r="10" {...(animated ? { ...DRAW, transition: { ...DRAW.transition, delay: 1.3 } } : {})} />
    </svg>
  )
}

// Estrella hexagonal — Eventos / Expo
function IconEvent({ size = 80, color = '#F98058', animated = false }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <motion.polygon {...STROKE} stroke={color} points="50,5 91,67.5 9,67.5" {...(animated ? DRAW : {})} />
      <motion.polygon {...STROKE} stroke={color} points="50,95 9,32.5 91,32.5" {...(animated ? { ...DRAW, transition: { ...DRAW.transition, delay: 0.4 } } : {})} />
      <motion.circle {...STROKE} stroke={color} cx="50" cy="50" r="10" {...(animated ? { ...DRAW, transition: { ...DRAW.transition, delay: 0.9 } } : {})} />
      <motion.circle {...STROKE} stroke={color} fill={color} cx="50" cy="50" r="4" {...(animated ? { ...DRAW, transition: { ...DRAW.transition, delay: 1.2 } } : {})} />
    </svg>
  )
}

// Rueda con 8 rayos — Automotriz
function IconVehicle({ size = 80, color = '#FACC15', animated = false }: IconProps) {
  const spokes = [[50,8,50,34],[92,50,66,50],[50,92,50,66],[8,50,34,50],[78,22,60,40],[78,78,60,60],[22,78,40,60],[22,22,40,40]]
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <motion.circle {...STROKE} stroke={color} cx="50" cy="50" r="42" {...(animated ? DRAW : {})} />
      <motion.circle {...STROKE} stroke={color} cx="50" cy="50" r="14" {...(animated ? { ...DRAW, transition: { ...DRAW.transition, delay: 0.5 } } : {})} />
      {spokes.map(([x1,y1,x2,y2],i) => (
        <motion.line key={i} {...STROKE} stroke={color} x1={x1} y1={y1} x2={x2} y2={y2}
          {...(animated ? { ...DRAW, transition: { ...DRAW.transition, delay: 0.7 + i*0.08 } } : {})} />
      ))}
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────

const VERTICALS = [
  { key: 'industrial_storage',   name: 'Almacenamiento Industrial', products: 70, color: '#F97316', Icon: IconIndustrial, tagline: 'Racks, gabinetes y mezzanine para bodega y manufactura' },
  { key: 'furniture_kitchen',    name: 'Muebles y Cocinas',         products: 72, color: '#D97706', Icon: IconFurniture,  tagline: 'Cocinas integrales, closets y mobiliario residencial' },
  { key: 'retail_layout',        name: 'Retail y Comercio',         products: 58, color: '#38BDF8', Icon: IconRetail,     tagline: 'Gondolas, cajas POS, exhibidores y senaletica' },
  { key: 'real_estate',          name: 'Desarrollos Inmobiliarios', products: 30, color: '#4ADE80', Icon: IconRealEstate, tagline: 'Lobby, amenidades, departamentos modelo y gym' },
  { key: 'medical_space',        name: 'Espacios Medicos',          products: 35, color: '#CBD5E1', Icon: IconMedical,    tagline: 'Consultorios, dental, estetica y quirofano' },
  { key: 'event_stand',          name: 'Stands y Exposicion',       products: 25, color: '#F98058', Icon: IconEvent,      tagline: 'Stands Octanorm, paneles y mobiliario de feria' },
  { key: 'exterior_enclosures',  name: 'Exterior / Cerramientos',    products: 22, color: '#84CC16', Icon: IconEvent,     tagline: 'Toldos, pergolas, portones, rejas y canceleria exterior' },
  { key: 'interior_design',      name: 'Interiorismo Premium',        products: 18, color: '#A8A8A8', Icon: IconFurniture, tagline: 'Sala, recamara, oficina y espacios de diseno' },
  { key: 'architecture_concept', name: 'Arquitectura / Remodelacion', products: 25, color: '#D4C8B8', Icon: IconRealEstate, tagline: 'Muros, techos, columnas, escaleras y conceptos de planta' },
] as const

const STATS = [
  { value: 316, label: 'Productos en catalogo', suffix: '+' },
  { value: 7,   label: 'Industrias cubiertas',  suffix: ''  },
  { value: 39,  label: 'Categorias especializadas', suffix: '' },
  { value: 13,  label: 'Geometrias 3D unicas', suffix: ''   },
]

const STEPS = [
  { n: '01', title: 'Elige tu vertical', body: 'El sistema carga el ambiente 3D, el catalogo y las reglas de la industria del cliente. Sin configuracion manual.' },
  { n: '02', title: 'Configura en tiempo real', body: 'Arrastra productos reales al espacio 3D. Cambia variantes, colores y posiciones. La escena se vista sola.' },
  { n: '03', title: 'Cierra la venta', body: 'Un clic genera la propuesta visual con cotizacion y PDF profesional. El lead queda registrado en el CRM.' },
]

const FEATURES: { Icon: React.FC<React.SVGProps<SVGSVGElement>>; title: string; body: string }[] = [
  { Icon: Box,       title: 'Motor 3D Procedural',        body: '13 geometrias unicas renderizadas en tiempo real. Cada producto tiene forma, material y escala correcta sin archivos externos.' },
  { Icon: Layers,    title: 'Catalogo Real Multimarca',   body: '316 productos de 7 industrias en base de datos en vivo. Filtrado por vertical, categoria y variante.' },
  { Icon: TrendingUp,title: 'Propuesta Comercial PDF',    body: 'Genera propuestas visuales con cotizacion, disclaimer legal y resumen ejecutivo en un solo clic.' },
  { Icon: Globe,     title: 'Multimarca y Multivertical', body: 'Una plataforma para todas las industrias. El builder se adapta al catalogo y la identidad de cada cliente.' },
  { Icon: Shield,    title: 'Base de Datos en Vivo',      body: 'Supabase como backend. Catalogo, proyectos y cotizaciones persistidos en tiempo real con seguridad por fila.' },
  { Icon: Clock,     title: 'Historial de 40 Pasos',      body: 'Undo/redo completo. El vendedor configura sin miedo a cometer errores irreversibles.' },
]

// ─────────────────────────────────────────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────────────────────────────────────────

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!inView) return
    const duration = 1800
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setCount(Math.round(eased * target))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [inView, target])
  return <span ref={ref}>{count}{suffix}</span>
}

const fadeUp = {
  hidden:  { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}
const stagger = { visible: { transition: { staggerChildren: 0.1 } } }

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function LandingNav() {
  const [scrolled, setScrolled] = useState(false)
  const nav = useNavigate()
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(17,25,35,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(249,128,88,0.12)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <img
            src="/logo-alqia-oscuro.png"
            alt="Alqia Virtual Builder"
            className="h-12 w-auto object-contain"
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => nav('/login')}
            className="text-sm text-[#A7B3C2] hover:text-white transition-colors px-4 py-2"
          >
            Acceder al sistema
          </button>
          <button
            onClick={() => nav('/builder?vertical=industrial_storage')}
            className="text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200"
            style={{ background: '#F98058', color: '#111923' }}
          >
            Ver demo
          </button>
        </div>
      </div>
    </header>
  )
}

// ── Esfera alquímica decorativa para el hero ──────────────────────────────────
function AlchemicSphere() {
  const iconComponents = [IconIndustrial, IconFurniture, IconRetail, IconRealEstate, IconMedical, IconEvent, IconVehicle]
  const colors = VERTICALS.map(v => v.color)
  const angles = [0, 51.4, 102.8, 154.2, 205.7, 257.1, 308.5]
  const radius = 160
  return (
    <div className="relative" style={{ width: 420, height: 420 }}>
      {/* Glow de fondo */}
      <div className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(circle, rgba(249,128,88,0.08) 0%, transparent 70%)' }} />
      {/* Anillo exterior giratorio */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0 rounded-full"
        style={{ border: '1px dashed rgba(249,128,88,0.2)' }}
      />
      {/* Anillo medio giratorio inverso */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        className="absolute rounded-full"
        style={{ inset: 50, border: '1px solid rgba(249,128,88,0.15)' }}
      />
      {/* Anillo interno */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        className="absolute rounded-full"
        style={{ inset: 110, border: '1px dashed rgba(249,128,88,0.25)' }}
      />
      {/* Iconos orbitando */}
      {angles.map((angle, i) => {
        const rad = (angle * Math.PI) / 180
        const x = 210 + Math.cos(rad) * radius - 18
        const y = 210 + Math.sin(rad) * radius - 18
        const IconComp = iconComponents[i]
        return (
          <motion.div
            key={i}
            className="absolute"
            style={{ left: x, top: y }}
            animate={{ opacity: [0.4, 0.9, 0.4] }}
            transition={{ duration: 3 + i * 0.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
          >
            <IconComp size={36} color={colors[i]} />
          </motion.div>
        )
      })}
      {/* Núcleo central */}
      <div className="absolute" style={{ inset: 155 }}>
        <motion.div
          className="w-full h-full rounded-full flex items-center justify-center"
          style={{ background: 'rgba(249,128,88,0.08)', border: '1px solid rgba(249,128,88,0.3)' }}
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <img src="/logo-alqia-oscuro.png" alt="Alqia" className="w-20 h-auto object-contain" />
        </motion.div>
      </div>
    </div>
  )
}

function HeroSection() {
  const nav = useNavigate()
  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ background: '#111923' }}
    >
      {/* Grid animado de fondo */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(249,128,88,0.08) 1px, transparent 0)',
        backgroundSize: '52px 52px',
      }} />
      {/* Gradiente inferior */}
      <div className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, #111923)' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center py-32">
        {/* Texto */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="flex flex-col gap-6"
        >
          <motion.div variants={fadeUp}>
            <span
              className="inline-block text-xs font-semibold tracking-widest uppercase px-3 py-1.5 rounded-full mb-4"
              style={{ background: 'rgba(249,128,88,0.1)', border: '1px solid rgba(249,128,88,0.25)', color: '#F98058' }}
            >
              Visual Sales Builder — Multimarca e Multiindustria
            </span>
          </motion.div>

          <motion.h1 variants={fadeUp} className="text-5xl lg:text-7xl font-bold leading-[1.05] tracking-tight text-white">
            El 3D es el medio.
            <br />
            <span style={{ color: '#F98058' }}>La venta es</span>
            <br />
            el objetivo.
          </motion.h1>

          <motion.p variants={fadeUp} className="text-lg leading-relaxed max-w-xl" style={{ color: '#A7B3C2' }}>
            Alqia Virtual Builder transforma cualquier catalogo de productos en un configurador visual 3D
            que guia al cliente, genera la propuesta y cierra la venta. Para 7 industrias. En tiempo real.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => nav('/builder?vertical=industrial_storage')}
              className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 hover:scale-105"
              style={{ background: '#F98058', color: '#111923' }}
            >
              Explorar el builder <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => nav('/')}
              className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 hover:bg-white/5"
              style={{ border: '1px solid rgba(249,128,88,0.3)', color: '#F98058' }}
            >
              Ver verticales <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>

          <motion.div variants={fadeUp} className="flex items-center gap-6 pt-4">
            {[
              { n: '316+', l: 'Productos' },
              { n: '7',    l: 'Industrias' },
              { n: '13',   l: 'Geometrias 3D' },
            ].map(({ n, l }) => (
              <div key={l} className="flex flex-col">
                <span className="text-2xl font-bold" style={{ color: '#F98058' }}>{n}</span>
                <span className="text-xs" style={{ color: '#718096' }}>{l}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Visual alquímica */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
          className="hidden lg:flex justify-center items-center"
        >
          <AlchemicSphere />
        </motion.div>
      </div>
    </section>
  )
}

function VerticalsSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const nav = useNavigate()
  return (
    <section ref={ref} className="py-28" style={{ background: '#18212D' }}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={stagger}
          className="text-center mb-16"
        >
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: '#F98058' }}>
            Plataforma multisectorial
          </motion.p>
          <motion.h2 variants={fadeUp} className="text-4xl lg:text-5xl font-bold text-white mb-4">
            7 industrias. Una plataforma.
          </motion.h2>
          <motion.p variants={fadeUp} className="text-lg max-w-2xl mx-auto" style={{ color: '#A7B3C2' }}>
            Cada vertical tiene su propio ambiente 3D, catalogo especializado y flujo comercial.
            El vendedor cambia de industria en segundos.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={stagger}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {VERTICALS.map((v) => (
            <motion.div
              key={v.key}
              variants={fadeUp}
              whileHover={{ y: -8, scale: 1.02 }}
              onClick={() => nav(`/builder?vertical=${v.key}`)}
              className="cursor-pointer rounded-2xl p-6 flex flex-col gap-4 transition-shadow"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid rgba(255,255,255,0.07)`,
                backdropFilter: 'blur(8px)',
              }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                className="w-16 h-16"
                whileHover={{ rotate: 12 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <v.Icon size={64} color={v.color} animated={inView} />
              </motion.div>
              <div className="flex flex-col gap-1">
                <h3 className="font-semibold text-white text-sm leading-tight">{v.name}</h3>
                <p className="text-xs leading-relaxed" style={{ color: '#718096' }}>{v.tagline}</p>
              </div>
              <div className="flex items-center justify-between mt-auto pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="text-xs font-medium" style={{ color: v.color }}>{v.products} productos</span>
                <ChevronRight className="w-4 h-4" style={{ color: v.color }} />
              </div>
            </motion.div>
          ))}
          {/* Card extra — Proximamente */}
          <motion.div
            variants={fadeUp}
            className="rounded-2xl p-6 flex flex-col items-center justify-center gap-3 opacity-40"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', minHeight: 200 }}
          >
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ border: '1px dashed rgba(255,255,255,0.3)' }}>
              <span className="text-white text-xl font-light">+</span>
            </div>
            <span className="text-xs text-center" style={{ color: '#718096' }}>Mas verticales en desarrollo</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

function HowItWorksSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <section ref={ref} className="py-28" style={{ background: '#111923' }}>
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={stagger}
          className="text-center mb-16"
        >
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: '#F98058' }}>
            Flujo comercial
          </motion.p>
          <motion.h2 variants={fadeUp} className="text-4xl lg:text-5xl font-bold text-white">
            De catalogo a cotizacion<br />en minutos.
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={stagger}
          className="grid md:grid-cols-3 gap-8"
        >
          {STEPS.map((step, i) => (
            <motion.div
              key={step.n}
              variants={fadeUp}
              className="relative flex flex-col gap-5"
            >
              {i < STEPS.length - 1 && (
                <div
                  className="hidden md:block absolute top-8 left-[calc(100%+1rem)] w-16 h-px"
                  style={{ background: 'linear-gradient(to right, rgba(249,128,88,0.4), transparent)' }}
                />
              )}
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl"
                style={{ background: 'rgba(249,128,88,0.1)', border: '1px solid rgba(249,128,88,0.25)', color: '#F98058' }}
              >
                {step.n}
              </div>
              <div>
                <h3 className="font-semibold text-white text-lg mb-2">{step.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#A7B3C2' }}>{step.body}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

function FeaturesSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <section ref={ref} className="py-28" style={{ background: '#18212D' }}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={stagger}
          className="text-center mb-16"
        >
          <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: '#F98058' }}>
            Capacidades del sistema
          </motion.p>
          <motion.h2 variants={fadeUp} className="text-4xl lg:text-5xl font-bold text-white">
            Construido para competir<br />con los grandes.
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={stagger}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {FEATURES.map(({ Icon, title, body }) => (
            <motion.div
              key={title}
              variants={fadeUp}
              className="rounded-2xl p-6 flex flex-col gap-4 group hover:border-[rgba(249,128,88,0.3)] transition-colors"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors group-hover:bg-[rgba(249,128,88,0.15)]"
                style={{ background: 'rgba(249,128,88,0.08)' }}
              >
                <Icon className="w-5 h-5" style={{ color: '#F98058' }} />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm mb-2">{title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: '#A7B3C2' }}>{body}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

function StatsSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <section ref={ref} className="py-24" style={{ background: 'linear-gradient(135deg, #111923 0%, #1a2535 50%, #111923 100%)' }}>
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={stagger}
          className="grid grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {STATS.map(({ value, label, suffix }) => (
            <motion.div
              key={label}
              variants={fadeUp}
              className="flex flex-col items-center text-center gap-2"
            >
              <div className="text-5xl font-bold" style={{ color: '#F98058' }}>
                {inView ? <AnimatedCounter target={value} suffix={suffix} /> : '0'}
              </div>
              <div className="text-xs leading-tight" style={{ color: '#A7B3C2' }}>{label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

function CTASection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const nav = useNavigate()
  return (
    <section ref={ref} className="py-32 relative overflow-hidden" style={{ background: '#111923' }}>
      {/* Glow decorativo */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(249,128,88,0.07) 0%, transparent 70%)' }}
      />
      <motion.div
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        variants={stagger}
        className="relative z-10 max-w-3xl mx-auto px-6 text-center flex flex-col items-center gap-8"
      >
        <motion.div
          variants={fadeUp}
          className="w-20 h-20"
          animate={inView ? { rotate: [0, 360] } : {}}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        >
          <IconEvent size={80} color="#F98058" animated={inView} />
        </motion.div>
        <motion.h2 variants={fadeUp} className="text-5xl lg:text-6xl font-bold text-white leading-tight">
          Tu catalogo.<br />
          <span style={{ color: '#F98058' }}>En 3D. Vendiendo.</span>
        </motion.h2>
        <motion.p variants={fadeUp} className="text-lg max-w-xl leading-relaxed" style={{ color: '#A7B3C2' }}>
          Alqia Virtual Builder esta listo para tu industria. Accede al sistema, elige tu vertical y
          empieza a configurar en segundos.
        </motion.p>
        <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-3">
          <button
            onClick={() => nav('/builder?vertical=industrial_storage')}
            className="flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-base transition-all duration-200 hover:scale-105 hover:shadow-lg"
            style={{ background: '#F98058', color: '#111923', boxShadow: '0 0 40px rgba(249,128,88,0.2)' }}
          >
            Comenzar ahora <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => nav('/login')}
            className="flex items-center gap-2 px-8 py-4 rounded-xl font-medium text-base transition-all duration-200 hover:bg-white/5"
            style={{ border: '1px solid rgba(249,128,88,0.3)', color: '#F98058' }}
          >
            Ir al dashboard
          </button>
        </motion.div>
      </motion.div>
    </section>
  )
}

function LandingFooter() {
  return (
    <footer style={{ background: '#0D1117', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Marca */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center">
              <img
                src="/logo-alqia-oscuro.png"
                alt="Alqia Virtual Builder"
                className="h-10 w-auto object-contain"
              />
            </div>
            <p className="text-xs text-center md:text-left" style={{ color: '#4B5563' }}>
              Es un producto de{' '}
              <span className="font-medium" style={{ color: '#718096' }}>Alqia Tech</span>
            </p>
          </div>

          {/* Verticales */}
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {VERTICALS.map(v => (
              <span key={v.key} className="text-xs" style={{ color: '#4B5563' }}>
                {v.name}
              </span>
            ))}
          </nav>
        </div>

        {/* Linea legal */}
        <div
          className="mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)', color: '#374151' }}
        >
          <span>© 2026 Alqia Tech. Todos los derechos reservados.</span>
          <span style={{ color: '#4B5563' }}>Patente en tramite.</span>
        </div>
      </div>
    </footer>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

export function LandingPage() {
  // Asegurar scroll desde arriba al montar
  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <div style={{ background: '#111923', color: '#F3F4F6', fontFamily: 'inherit' }} className="antialiased">
      <LandingNav />
      <HeroSection />
      <VerticalsSection />
      <HowItWorksSection />
      <FeaturesSection />
      <StatsSection />
      <CTASection />
      <LandingFooter />
    </div>
  )
}
