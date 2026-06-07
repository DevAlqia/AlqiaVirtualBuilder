import { Bell, Search, Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '@/contexts/ThemeContext'

export function Topbar() {
  const navigate = useNavigate()
  const { theme, toggle } = useTheme()

  return (
    <header className="h-14 flex items-center px-4 gap-3 border-b border-white/[0.06] bg-bg-ultra flex-shrink-0">
      <div className="flex items-center gap-2 flex-1 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-content-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar proyectos..."
            className="w-full pl-9 pr-3 py-1.5 bg-white/[0.06] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-content-muted focus:outline-none focus:ring-1 focus:ring-alqia-orange/40 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <button
          onClick={toggle}
          className="p-2 text-content-secondary hover:text-white hover:bg-white/[0.06] rounded-lg transition-all"
          title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <button className="relative p-2 text-content-secondary hover:text-white hover:bg-white/[0.06] rounded-lg transition-all">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-alqia-orange" />
        </button>

        <Button variant="primary" size="sm" onClick={() => navigate('/builder')}>
          Nuevo proyecto
        </Button>

        <div className="w-8 h-8 rounded-full bg-alqia-blue flex items-center justify-center text-white text-xs font-medium ml-1">
          JG
        </div>
      </div>
    </header>
  )
}
