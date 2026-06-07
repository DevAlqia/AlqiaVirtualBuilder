import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const { theme } = useTheme()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: err } = await login(email.trim(), password)
    setLoading(false)
    if (err) { setError(err); return }
    navigate('/app')
  }

  return (
    <div className="min-h-screen bg-[#111923] flex items-center justify-center p-4">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #F98058 0%, transparent 70%)' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img
            src={theme === 'dark' ? '/logo-alqia-oscuro.png' : '/logo-alqia-blanco.png'}
            alt="Alqia Virtual Builder"
            className="h-12 object-contain"
          />
        </div>

        {/* Card */}
        <div className="bg-[#18212D] border border-white/[0.08] rounded-2xl p-8 shadow-2xl">
          <h1 className="text-white text-xl font-semibold mb-1">Iniciar sesion</h1>
          <p className="text-[#A7B3C2] text-sm mb-6">Accede a tu espacio de construccion virtual</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-[#A7B3C2] text-xs mb-1.5 uppercase tracking-wider">
                Correo electronico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@empresa.com"
                autoComplete="email"
                autoFocus
                className="w-full px-3.5 py-2.5 bg-white/[0.05] border border-white/[0.10] rounded-lg text-white text-sm placeholder:text-[#718096] focus:outline-none focus:border-[#F98058]/50 focus:ring-1 focus:ring-[#F98058]/30 transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-[#A7B3C2] text-xs mb-1.5 uppercase tracking-wider">
                Contrasena
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full px-3.5 py-2.5 pr-10 bg-white/[0.05] border border-white/[0.10] rounded-lg text-white text-sm placeholder:text-[#718096] focus:outline-none focus:border-[#F98058]/50 focus:ring-1 focus:ring-[#F98058]/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#718096] hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[#FB7185] text-xs px-1"
              >
                {error}
              </motion.p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: loading ? 'rgba(249,128,88,0.6)' : '#F98058', color: '#111923' }}
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-[#111923]/40 border-t-[#111923] rounded-full animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          {/* Hint demo */}
          <p className="text-[#718096] text-[11px] text-center mt-4">
            Entorno de demo — cualquier email y contrasena validos dan acceso
          </p>
        </div>

        {/* Volver a landing */}
        <div className="text-center mt-6">
          <Link to="/" className="text-[#718096] text-sm hover:text-[#A7B3C2] transition-colors">
            Volver al inicio
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
