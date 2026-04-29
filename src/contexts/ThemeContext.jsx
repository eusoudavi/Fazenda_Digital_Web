import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [tema, setTema] = useState(() => localStorage.getItem('agro_tema') ?? 'claro')

  useEffect(() => {
    document.body.classList.toggle('dark', tema === 'escuro')
    localStorage.setItem('agro_tema', tema)
  }, [tema])

  return (
    <ThemeContext.Provider value={{ tema, setTema }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTema() {
  return useContext(ThemeContext)
}
