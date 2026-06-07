import { createContext, useContext, useState, useCallback } from 'react'
import type { ReactNode } from 'react'

// ─── Credenciales demo ────────────────────────────────────────────────────────
// En producción esto se conecta a Supabase Auth.
// Por ahora cualquier email válido + cualquier password no vacío da acceso.
const STORAGE_KEY = 'alqia_auth_user'

interface AuthUser {
  email: string
  name: string
}

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ error?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function loadUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as AuthUser) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(loadUser)

  const login = useCallback(async (email: string, password: string) => {
    if (!email || !password) return { error: 'Completa todos los campos' }
    if (!email.includes('@')) return { error: 'Email inválido' }
    if (password.length < 4) return { error: 'Contraseña muy corta' }

    // MVP: cualquier credencial válida da acceso — conectar a Supabase Auth en producción
    const authUser: AuthUser = {
      email,
      name: email.split('@')[0].replace(/[._-]/g, ' '),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser))
    setUser(authUser)
    return {}
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
