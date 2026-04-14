import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

const TOKEN_KEY = 'fazenda_token'
const USUARIO_KEY = 'fazenda_usuario'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [usuario, setUsuario] = useState(() => {
    const stored = localStorage.getItem(USUARIO_KEY)
    return stored ? JSON.parse(stored) : null
  })

  const login = (tokenRecebido, dadosUsuario) => {
    localStorage.setItem(TOKEN_KEY, tokenRecebido)
    localStorage.setItem(USUARIO_KEY, JSON.stringify(dadosUsuario))
    setToken(tokenRecebido)
    setUsuario(dadosUsuario)
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USUARIO_KEY)
    setToken(null)
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ token, usuario, login, logout, autenticado: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
