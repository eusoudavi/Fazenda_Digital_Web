import { useEffect, useState } from 'react'
import { animaisApi, rebanhoApi, pesagensApi, eventosApi, vacinasApi, vacinacoesApi } from '../services/api'

const CARDS = [
  { label: 'Animais', api: animaisApi },
  { label: 'Rebanhos', api: rebanhoApi },
  { label: 'Pesagens', api: pesagensApi },
  { label: 'Eventos', api: eventosApi },
  { label: 'Vacinas', api: vacinasApi },
  { label: 'Vacinações', api: vacinacoesApi },
]

export default function Dashboard() {
  const [contagens, setContagens] = useState({})
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    Promise.all(CARDS.map((c) => c.api.listarTodos()))
      .then((resultados) => {
        const novas = {}
        CARDS.forEach((c, i) => {
          novas[c.label] = resultados[i].data.length
        })
        setContagens(novas)
      })
      .catch(() => {})
      .finally(() => setCarregando(false))
  }, [])

  if (carregando) return <p className="carregando">Carregando...</p>

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
      </div>
      <div className="cards-grid">
        {CARDS.map((c) => (
          <div key={c.label} className="card">
            <div className="card-numero">{contagens[c.label] ?? 0}</div>
            <div className="card-label">{c.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
