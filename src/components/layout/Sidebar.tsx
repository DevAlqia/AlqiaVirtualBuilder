import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import {
  LayoutDashboard,
  Box,
  FolderOpen,
  Package,
  Layers,
  FileText,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/utils/cn'

interface NavItem {
  path: string
  label: string
  icon: typeof LayoutDashboard
}

const navItems: NavItem[] = [
  { path: '/app', label: 'Workspace', icon: LayoutDashboard },
  { path: '/app/builder', label: 'Constructor', icon: Box },
  { path: '/app/projects', label: 'Proyectos', icon: FolderOpen },
  { path: '/app/catalog', label: 'Catálogo', icon: Package },
  { path: '/app/assets', label: 'Assets 3D', icon: Layers },
  { path: '/app/quotes', label: 'Cotizaciones', icon: FileText },
  { path: '/app/analytics', label: 'Analítica', icon: BarChart3 },
  { path: '/app/settings', label: 'Configuración', icon: Settings },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { theme } = useTheme()
  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ type: 'spring', stiffness: 400, damping: 38 }}
      className="relative h-full flex flex-col bg-bg-ultra border-r border-white/[0.06] overflow-hidden flex-shrink-0"
    >
      {/* Logo */}
      <div className="flex items-center justify-center h-24 px-3 border-b border-white/[0.06] flex-shrink-0">
        {collapsed ? (
          <img
            src="/Faviconalqia.png"
            alt="Alqia"
            className="w-9 h-9 object-contain flex-shrink-0"
          />
        ) : (
          <motion.img
            src={theme === 'dark' ? '/logo-alqia-oscuro.png' : '/logo-alqia-blanco.png'}
            alt="Alqia Virtual Builder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full h-auto object-contain"
            style={{ maxHeight: 64 }}
          />
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 flex flex-col gap-0.5 overflow-y-auto scrollbar-hide">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                cn(
                  'relative flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 group',
                  isActive
                    ? 'text-white bg-white/[0.08]'
                    : 'text-content-muted hover:text-white hover:bg-white/[0.04]'
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-alqia-orange rounded-full"
                      transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                    />
                  )}
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {!collapsed && (
                    <span className="whitespace-nowrap">{item.label}</span>
                  )}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="flex items-center justify-center h-10 border-t border-white/[0.06] text-content-muted hover:text-white hover:bg-white/[0.04] transition-all"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </motion.aside>
  )
}
