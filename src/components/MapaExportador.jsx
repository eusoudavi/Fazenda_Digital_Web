import { useEffect, useRef, useState, useMemo } from 'react'
import { useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { parseCoordenadas, hexCor } from './PastosMapa'

const TAMANHOS = {
  A4: [210, 297],
  A3: [297, 420],
  A2: [420, 594],
  A1: [594, 841],
  A0: [841, 1189],
}

const EXPORT_DPI = 96

function mmToPx(mm) {
  return Math.round((mm / 25.4) * EXPORT_DPI)
}

function mercPx(lng, lat, zoom) {
  const n = Math.pow(2, zoom) * 256
  const x = ((lng + 180) / 360) * n
  const sinLat = Math.sin((lat * Math.PI) / 180)
  const y = (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * n
  return { x, y }
}

function buildTileUrl(modo, z, tx, ty) {
  if (modo === 'satelite') {
    return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${ty}/${tx}`
  }
  const s = ['a', 'b', 'c'][Math.abs(tx + ty) % 3]
  return `https://${s}.tile.openstreetmap.org/${z}/${tx}/${ty}.png`
}

async function loadImg(src) {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })
}

async function gerarImagem(bounds, pastos, canvasW, canvasH, modo) {
  const south = bounds.getSouth()
  const north = bounds.getNorth()
  const west = bounds.getWest()
  const east = bounds.getEast()

  let zoom = 18
  while (zoom > 2) {
    const sw = mercPx(west, south, zoom)
    const ne = mercPx(east, north, zoom)
    if (ne.x - sw.x <= canvasW * 1.5 && sw.y - ne.y <= canvasH * 1.5) break
    zoom--
  }

  const sw = mercPx(west, south, zoom)
  const ne = mercPx(east, north, zoom)
  const minX = sw.x
  const maxX = ne.x
  const minY = ne.y
  const maxY = sw.y
  const srcW = maxX - minX
  const srcH = maxY - minY
  const scaleX = canvasW / srcW
  const scaleY = canvasH / srcH

  const canvas = document.createElement('canvas')
  canvas.width = canvasW
  canvas.height = canvasH
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#aadaff'
  ctx.fillRect(0, 0, canvasW, canvasH)

  const tMinX = Math.floor(minX / 256)
  const tMaxX = Math.floor(maxX / 256)
  const tMinY = Math.floor(minY / 256)
  const tMaxY = Math.floor(maxY / 256)

  const loads = []
  for (let ty = tMinY; ty <= tMaxY; ty++) {
    for (let tx = tMinX; tx <= tMaxX; tx++) {
      const url = buildTileUrl(modo, zoom, tx, ty)
      loads.push(
        loadImg(url).then((img) => {
          if (!img) return
          ctx.drawImage(
            img,
            (tx * 256 - minX) * scaleX,
            (ty * 256 - minY) * scaleY,
            256 * scaleX,
            256 * scaleY,
          )
        }),
      )
    }
  }
  await Promise.all(loads)

  const toXY = ([lat, lng]) => {
    const p = mercPx(lng, lat, zoom)
    return [(p.x - minX) * scaleX, (p.y - minY) * scaleY]
  }

  pastos.forEach((pasto) => {
    const coords = parseCoordenadas(pasto.coordenadas)
    if (coords.length < 3) return
    const cor = hexCor(pasto.cor)

    ctx.beginPath()
    coords.forEach((c, i) => {
      const [x, y] = toXY(c)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.closePath()
    ctx.fillStyle = cor + '55'
    ctx.fill()
    ctx.strokeStyle = cor
    ctx.lineWidth = Math.max(1.5, 2 * scaleX)
    ctx.stroke()

    const centLat = coords.reduce((s, c) => s + c[0], 0) / coords.length
    const centLng = coords.reduce((s, c) => s + c[1], 0) / coords.length
    const [cx, cy] = toXY([centLat, centLng])

    const fs = Math.max(11, Math.min(18, 13 * Math.sqrt(scaleX)))
    ctx.font = `bold ${fs}px sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.lineWidth = 3
    ctx.strokeStyle = 'rgba(0,0,0,0.75)'
    ctx.strokeText(pasto.nome, cx, cy)
    ctx.fillStyle = 'white'
    ctx.fillText(pasto.nome, cx, cy)
  })

  return canvas.toDataURL('image/jpeg', 0.92)
}

export function SeletorRetangulo({ ativo, onSelecionar }) {
  const map = useMap()
  const startRef = useRef(null)
  const rectRef = useRef(null)

  useEffect(() => {
    map.getContainer().style.cursor = ativo ? 'crosshair' : ''
    if (!ativo) {
      map.dragging.enable()
      rectRef.current?.remove()
      rectRef.current = null
      startRef.current = null
    }
  }, [ativo, map])

  useMapEvents({
    mousedown(e) {
      if (!ativo) return
      e.originalEvent.preventDefault()
      map.dragging.disable()
      startRef.current = e.latlng
      rectRef.current?.remove()
      rectRef.current = null
    },
    mousemove(e) {
      if (!ativo || !startRef.current) return
      const b = L.latLngBounds(startRef.current, e.latlng)
      if (rectRef.current) {
        rectRef.current.setBounds(b)
      } else {
        rectRef.current = L.rectangle(b, {
          color: '#1976d2',
          weight: 2,
          dashArray: '6 4',
          fillOpacity: 0.08,
        }).addTo(map)
      }
    },
    mouseup() {
      if (!ativo || !startRef.current) return
      map.dragging.enable()
      const bounds = rectRef.current?.getBounds()
      rectRef.current?.remove()
      rectRef.current = null
      startRef.current = null
      if (bounds?.isValid()) onSelecionar(bounds)
    },
  })

  return null
}

export function ModalExportarMapa({ bounds, pastos, modo, onFechar }) {
  const [tamanho, setTamanho] = useState('A4')
  const [orientacao, setOrientacao] = useState('paisagem')
  const [preview, setPreview] = useState(null)
  const [gerando, setGerando] = useState(false)
  const [exportando, setExportando] = useState(false)

  const dims = useMemo(() => {
    const [mW, mH] = TAMANHOS[tamanho]
    const mmW = orientacao === 'paisagem' ? mH : mW
    const mmH = orientacao === 'paisagem' ? mW : mH
    const MAX_W = 460
    const previewW = MAX_W
    const previewH = Math.round(MAX_W * (mmH / mmW))
    return { mmW, mmH, previewW, previewH, pxW: mmToPx(mmW), pxH: mmToPx(mmH) }
  }, [tamanho, orientacao])

  useEffect(() => {
    let cancelled = false
    setPreview(null)
    setGerando(true)
    gerarImagem(bounds, pastos, dims.previewW, dims.previewH, modo).then((img) => {
      if (!cancelled) { setPreview(img); setGerando(false) }
    })
    return () => { cancelled = true }
  }, [bounds, pastos, dims.previewW, dims.previewH, modo])

  const exportar = async () => {
    setExportando(true)
    try {
      const imgData = await gerarImagem(bounds, pastos, dims.pxW, dims.pxH, modo)
      const { jsPDF } = await import('jspdf')
      const pdf = new jsPDF({
        orientation: orientacao === 'paisagem' ? 'landscape' : 'portrait',
        unit: 'mm',
        format: tamanho.toLowerCase(),
      })
      pdf.addImage(imgData, 'JPEG', 0, 0, dims.mmW, dims.mmH)
      pdf.save(`mapa-${tamanho}-${orientacao}.pdf`)
    } finally {
      setExportando(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onFechar}>
      <div className="exp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Exportar Mapa como PDF</h2>
          <button onClick={onFechar}>✕</button>
        </div>

        <div className="exp-corpo">
          <div className="exp-opts">
            <div className="exp-grupo">
              <span className="exp-label">Tamanho do papel</span>
              <div className="exp-btns">
                {Object.keys(TAMANHOS).map((t) => (
                  <button
                    key={t}
                    className={`exp-btn${tamanho === t ? ' ativo' : ''}`}
                    onClick={() => setTamanho(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="exp-grupo">
              <span className="exp-label">Orientação</span>
              <div className="exp-btns">
                {['retrato', 'paisagem'].map((o) => (
                  <button
                    key={o}
                    className={`exp-btn${orientacao === o ? ' ativo' : ''}`}
                    onClick={() => setOrientacao(o)}
                  >
                    {o.charAt(0).toUpperCase() + o.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="exp-preview-outer">
            <div
              className="exp-preview-box"
              style={{ width: dims.previewW, height: dims.previewH }}
            >
              {gerando && <div className="exp-preview-loading">Gerando prévia…</div>}
              {!gerando && preview && (
                <img src={preview} width={dims.previewW} height={dims.previewH} alt="Prévia" style={{ display: 'block' }} />
              )}
            </div>
            <p className="exp-dims-info">
              {dims.mmW} × {dims.mmH} mm &middot; {dims.pxW} × {dims.pxH} px
            </p>
          </div>

          <div className="exp-footer">
            <button className="btn" style={{ background: '#e0e0e0', color: '#333' }} onClick={onFechar}>
              Cancelar
            </button>
            <button
              className="btn btn-primary"
              onClick={exportar}
              disabled={gerando || exportando}
            >
              {exportando ? 'Exportando…' : 'Exportar PDF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
