import { useEffect, useState, lazy, Suspense } from 'react'
import { animaisApi, rebanhoApi, pesagensApi, eventosApi, vacinasApi, vacinacoesApi, pastosApi } from '../services/api'
import { hexCor, parseCoordenadas } from '../components/PastosMapa'

const PastosMapa = lazy(() => import('../components/PastosMapa'))

const CARDS = [
  { label: 'Animais', api: animaisApi },
  { label: 'Rebanhos', api: rebanhoApi },
  { label: 'Pesagens', api: pesagensApi },
  { label: 'Eventos', api: eventosApi },
  { label: 'Vacinas', api: vacinasApi },
  { label: 'Vacinações', api: vacinacoesApi },
  { label: 'Pastos', api: pastosApi },
]

function formatarArea(ha) {
  if (ha == null) return '—'
  return `${ha.toFixed(2)} ha`
}

function formatarPerimetro(m) {
  if (m == null) return '—'
  return m >= 1000 ? `${(m / 1000).toFixed(2)} km` : `${m.toFixed(0)} m`
}

function PastoInfoPanel({ pasto }) {
  if (!pasto) {
    return (
      <div className="mapa-painel-vazio">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
          <polygon points="3,20 12,4 21,20" />
        </svg>
        <p>Clique em um pasto no mapa para ver seus detalhes</p>
      </div>
    )
  }

  const cor = hexCor(pasto.cor)
  const pontos = parseCoordenadas(pasto.coordenadas).length

  return (
    <div className="mapa-painel-info">
      <div className="mapa-painel-titulo">
        <span className="mapa-painel-cor" style={{ background: cor }} />
        <h3>{pasto.nome}</h3>
      </div>

      <dl className="mapa-painel-dl">
        <div className="mapa-painel-row">
          <dt>Área</dt>
          <dd>{formatarArea(pasto.area_ha)}</dd>
        </div>
        <div className="mapa-painel-row">
          <dt>Perímetro</dt>
          <dd>{formatarPerimetro(pasto.perimetro_m)}</dd>
        </div>
        <div className="mapa-painel-row">
          <dt>Pontos</dt>
          <dd>{pontos}</dd>
        </div>
        <div className="mapa-painel-row">
          <dt>Criado em</dt>
          <dd>{pasto.created_at ? pasto.created_at.slice(0, 10) : '—'}</dd>
        </div>
      </dl>
    </div>
  )
}

export default function Dashboard() {
  const [contagens, setContagens] = useState({})
  const [pastos, setPastos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [pastoSelecionado, setPastoSelecionado] = useState(null)

  useEffect(() => {
    Promise.all(CARDS.map((c) => c.api.listarTodos()))
      .then((resultados) => {
        const novas = {}
        CARDS.forEach((c, i) => { novas[c.label] = resultados[i].data.length })
        setContagens(novas)
        setPastos(resultados[CARDS.length - 1].data)
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

      <div className="mapa-section">
        <div className="mapa-header">
          <h2>Pastos</h2>
          {pastos.length === 0 && (
            <span className="mapa-vazio-hint">
              Nenhum pasto sincronizado. Crie pastos no aplicativo para visualizá-los aqui.
            </span>
          )}
        </div>
        <div className="mapa-corpo">
          <div className="mapa-mapa">
            <Suspense fallback={<div className="mapa-loading">Carregando mapa...</div>}>
              <PastosMapa pastos={pastos} onSelect={setPastoSelecionado} />
            </Suspense>
          </div>
          <div className="mapa-painel">
            <PastoInfoPanel pasto={pastoSelecionado} />
          </div>
        </div>
      </div>
    </div>
  )
}
