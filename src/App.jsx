import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Animais from './pages/Animais'
import Rebanhos from './pages/Rebanhos'
import Pesagens from './pages/Pesagens'
import Eventos from './pages/Eventos'
import Vacinas from './pages/Vacinas'
import Vacinacoes from './pages/Vacinacoes'
import Relatorios from './pages/Relatorios'

export default function App() {
  return (
    <BrowserRouter>
      <div className="layout">
        <Navbar />
        <main className="conteudo">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/animais" element={<Animais />} />
            <Route path="/rebanhos" element={<Rebanhos />} />
            <Route path="/pesagens" element={<Pesagens />} />
            <Route path="/eventos" element={<Eventos />} />
            <Route path="/vacinas" element={<Vacinas />} />
            <Route path="/vacinacoes" element={<Vacinacoes />} />
            <Route path="/relatorios" element={<Relatorios />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
