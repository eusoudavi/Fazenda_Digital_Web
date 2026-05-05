import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Polygon, Tooltip, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { SeletorRetangulo, ModalExportarMapa } from './MapaExportador'

const CAMADAS = {
  satelite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; <a href="https://www.esri.com">Esri</a> &mdash; Source: Esri, Maxar, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN',
    maxZoom: 19,
  },
  mapa: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  },
}

export function hexCor(raw) {
  if (!raw || raw.length < 6) return '#4caf50'
  return '#' + (raw.length === 8 ? raw.slice(2) : raw)
}

export function parseCoordenadas(json) {
  try {
    const arr = JSON.parse(json)
    return arr.map((p) => [p.lat, p.lng])
  } catch {
    return []
  }
}

function FitBounds({ pastos }) {
  const map = useMap()
  const fitted = useRef(false)

  useEffect(() => {
    if (fitted.current || pastos.length === 0) return
    const allPoints = pastos.flatMap((p) => parseCoordenadas(p.coordenadas))
    if (allPoints.length === 0) return
    const lats = allPoints.map((c) => c[0])
    const lngs = allPoints.map((c) => c[1])
    map.fitBounds(
      [[Math.min(...lats), Math.min(...lngs)], [Math.max(...lats), Math.max(...lngs)]],
      { padding: [40, 40] }
    )
    fitted.current = true
  }, [pastos, map])

  return null
}

function DeselecionarAoClicarMapa({ onDeselect, modoSelecaoRef }) {
  useMapEvents({
    click() {
      if (modoSelecaoRef.current) return
      onDeselect()
    },
  })
  return null
}

export default function PastosMapa({ pastos, onSelect }) {
  const [modo, setModo] = useState('satelite')
  const [selecionadoId, setSelecionadoId] = useState(null)
  const [modoSelecao, setModoSelecao] = useState(false)
  const [selecaoBounds, setSelecaoBounds] = useState(null)
  const clicouPasto = useRef(false)
  const modoSelecaoRef = useRef(false)
  const camada = CAMADAS[modo]

  useEffect(() => {
    modoSelecaoRef.current = modoSelecao
  }, [modoSelecao])

  const pastosValidos = [...pastos]
    .filter((p) => parseCoordenadas(p.coordenadas).length >= 3)
    .sort((a, b) => (b.area_ha ?? 0) - (a.area_ha ?? 0))

  const selecionar = (pasto) => {
    if (modoSelecaoRef.current) return
    clicouPasto.current = true
    setSelecionadoId(pasto.id)
    onSelect?.(pasto)
  }

  const deselecionar = () => {
    if (clicouPasto.current) { clicouPasto.current = false; return }
    setSelecionadoId(null)
    onSelect?.(null)
  }

  const aoSelecionar = (bounds) => {
    setModoSelecao(false)
    setSelecaoBounds(bounds)
  }

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      <MapContainer
        center={[-15.788, -47.879]}
        zoom={5}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom
      >
        <TileLayer
          key={modo}
          url={camada.url}
          attribution={camada.attribution}
          maxZoom={camada.maxZoom}
        />

        {pastosValidos.map((pasto) => {
          const posicoes = parseCoordenadas(pasto.coordenadas)
          const cor = hexCor(pasto.cor)
          const selecionado = pasto.id === selecionadoId
          return (
            <Polygon
              key={pasto.id}
              positions={posicoes}
              pathOptions={{
                color: selecionado ? '#e53935' : cor,
                fillColor: cor,
                fillOpacity: selecionado ? 0.45 : 0.35,
                weight: selecionado ? 4 : 2,
              }}
              eventHandlers={{ click: () => selecionar(pasto) }}
            >
              <Tooltip permanent direction="center" className="pasto-label">
                {pasto.nome}
              </Tooltip>
            </Polygon>
          )
        })}

        <FitBounds pastos={pastosValidos} />
        <DeselecionarAoClicarMapa onDeselect={deselecionar} modoSelecaoRef={modoSelecaoRef} />
        <SeletorRetangulo ativo={modoSelecao} onSelecionar={aoSelecionar} />
      </MapContainer>

      {/* Overlay buttons */}
      <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <button
          onClick={() => setModo((m) => (m === 'satelite' ? 'mapa' : 'satelite'))}
          style={overlayBtnStyle}
        >
          {modo === 'satelite' ? 'Mapa' : 'Satélite'}
        </button>
        <button
          onClick={() => setModoSelecao((v) => !v)}
          style={{ ...overlayBtnStyle, background: modoSelecao ? '#1976d2' : 'white', color: modoSelecao ? 'white' : '#333', borderColor: modoSelecao ? '#1976d2' : 'rgba(0,0,0,0.2)' }}
        >
          {modoSelecao ? 'Cancelar' : '⬚ Exportar'}
        </button>
      </div>

      {/* Selection hint */}
      {modoSelecao && (
        <div style={hintStyle}>
          Arraste para selecionar a área a exportar
        </div>
      )}

      {/* Export modal */}
      {selecaoBounds && (
        <ModalExportarMapa
          bounds={selecaoBounds}
          pastos={pastosValidos}
          modo={modo}
          onFechar={() => setSelecaoBounds(null)}
        />
      )}
    </div>
  )
}

const overlayBtnStyle = {
  background: 'white',
  border: '2px solid rgba(0,0,0,0.2)',
  borderRadius: 6,
  padding: '6px 12px',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
  boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
  color: '#333',
}

const hintStyle = {
  position: 'absolute',
  bottom: 10,
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 1000,
  background: 'rgba(25, 118, 210, 0.9)',
  color: 'white',
  padding: '7px 16px',
  borderRadius: 20,
  fontSize: 13,
  fontWeight: 600,
  pointerEvents: 'none',
  boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
}
