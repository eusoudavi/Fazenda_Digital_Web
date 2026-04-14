import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Usuarios from './pages/Usuarios'
import Fazendas from './pages/Fazendas'
import Animais from './pages/Animais'
import Rebanhos from './pages/Rebanhos'
import Pesagens from './pages/Pesagens'
import Eventos from './pages/Eventos'
import Vacinas from './pages/Vacinas'
import Vacinacoes from './pages/Vacinacoes'
import Relatorios from './pages/Relatorios'

function RotaProtegida({ children }) {
  const { autenticado } = useAuth()
  return autenticado ? children : <Navigate to="/login" replace />
}

function Layout({ children }) {
  return (
    <div className="layout">
      <Navbar />
      <main className="conteudo">{children}</main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={
            <RotaProtegida>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/usuarios" element={<Usuarios />} />
                  <Route path="/fazendas" element={<Fazendas />} />
                  <Route path="/animais" element={<Animais />} />
                  <Route path="/rebanhos" element={<Rebanhos />} />
                  <Route path="/pesagens" element={<Pesagens />} />
                  <Route path="/eventos" element={<Eventos />} />
                  <Route path="/vacinas" element={<Vacinas />} />
                  <Route path="/vacinacoes" element={<Vacinacoes />} />
                  <Route path="/relatorios" element={<Relatorios />} />
                </Routes>
              </Layout>
            </RotaProtegida>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
