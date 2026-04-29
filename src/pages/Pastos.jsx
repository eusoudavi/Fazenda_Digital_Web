import { useEffect, useState, useMemo, useRef } from 'react'
import { pastosApi } from '../services/api'
import Modal from '../components/Modal'
import Paginacao from '../components/Paginacao'

const ITENS_POR_PAGINA = 10

// Paleta idêntica ao app Flutter
const PALETA = [
  { css: '#2D6A4F', hex: 'FF2D6A4F' },
  { css: '#52B788', hex: 'FF52B788' },
  { css: '#B7950B', hex: 'FFB7950B' },
  { css: '#1A6B9A', hex: 'FF1A6B9A' },
  { css: '#8E44AD', hex: 'FF8E44AD' },
  { css: '#E67E22', hex: 'FFE67E22' },
  { css: '#16A085', hex: 'FF16A085' },
  { css: '#C0392B', hex: 'FFC0392B' },
]

const FORM_INICIAL = { nome: '', cor: PALETA[0].hex, coordenadasTexto: '' }

// ── Geometria esférica ────────────────────────────────────────────────────────

const R = 6371000

function haversine(p1, p2) {
  const toRad = (d) => (d * Math.PI) / 180
  const dLat = toRad(p2.lat - p1.lat)
  const dLng = toRad(p2.lng - p1.lng)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(p1.lat)) * Math.cos(toRad(p2.lat)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function computePerimetro(coords) {
  let total = 0
  for (let i = 0; i < coords.length; i++)
    total += haversine(coords[i], coords[(i + 1) % coords.length])
  return total
}

function computeArea(coords) {
  const toRad = (d) => (d * Math.PI) / 180
  let total = 0
  for (let i = 0; i < coords.length; i++) {
    const j = (i + 1) % coords.length
    const dLng = toRad(coords[j].lng - coords[i].lng)
    total += dLng * (2 + Math.sin(toRad(coords[i].lat)) + Math.sin(toRad(coords[j].lat)))
  }
  return Math.abs((total * R * R) / 2)
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function parsearCoordenadas(texto) {
  return texto
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const p = l.split(',')
      if (p.length < 2) return null
      const lat = parseFloat(p[0].trim())
      const lng = parseFloat(p[1].trim())
      return isNaN(lat) || isNaN(lng) ? null : { lat, lng }
    })
    .filter(Boolean)
}

function coordenadasParaTexto(jsonStr) {
  try {
    return JSON.parse(jsonStr).map((c) => `${c.lat}, ${c.lng}`).join('\n')
  } catch {
    return ''
  }
}

function corCss(hex) {
  if (!hex || hex.length < 6) return '#cccccc'
  return '#' + (hex.length === 8 ? hex.slice(2) : hex)
}

function formatarArea(ha) {
  if (ha == null) return '—'
  return `${ha.toFixed(2)} ha`
}

function formatarPerimetro(m) {
  if (m == null) return '—'
  return m >= 1000 ? `${(m / 1000).toFixed(2)} km` : `${m.toFixed(0)} m`
}

// ── Textarea com numeração de linhas ─────────────────────────────────────────

function TextareaLinhas({ value, onChange, placeholder, rows = 8, required }) {
  const taRef = useRef(null)
  const numRef = useRef(null)
  const [focado, setFocado] = useState(false)

  const totalLinhas = Math.max((value || '').split('\n').length, rows)

  const syncScroll = () => {
    if (numRef.current && taRef.current)
      numRef.current.scrollTop = taRef.current.scrollTop
  }

  return (
    <div className={'ta-linhas-wrapper' + (focado ? ' ta-linhas-focado' : '')}>
      <div ref={numRef} className="ta-linhas-numeros" aria-hidden="true">
        {Array.from({ length: totalLinhas }, (_, i) => i + 1).join('\n')}
      </div>
      <textarea
        ref={taRef}
        className="ta-linhas-input"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        required={required}
        onScroll={syncScroll}
        onFocus={() => setFocado(true)}
        onBlur={() => setFocado(false)}
      />
    </div>
  )
}

// ── Formulário compartilhado (criar / editar) ─────────────────────────────────

function FormPasto({ form, setForm, coordenadas, areaHa, perimetroM, salvando, onCancelar }) {
  return (
    <>
      <div className="campo">
        <label>Nome</label>
        <input
          value={form.nome}
          onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
          required
          placeholder="Ex: Pasto Norte"
        />
      </div>

      <div className="campo">
        <label>Cor</label>
        <div className="paleta-cores">
          {PALETA.map((c) => (
            <button
              key={c.hex}
              type="button"
              className={'paleta-cor' + (form.cor === c.hex ? ' paleta-cor-ativa' : '')}
              style={{ background: c.css }}
              onClick={() => setForm((f) => ({ ...f, cor: c.hex }))}
            />
          ))}
        </div>
      </div>

      <div className="campo">
        <label>Coordenadas</label>
        <TextareaLinhas
          value={form.coordenadasTexto}
          onChange={(e) => setForm((f) => ({ ...f, coordenadasTexto: e.target.value }))}
          placeholder={'-16.759865, -45.641719\n-16.755394, -45.643239\n...'}
          rows={8}
          required
        />
        <small className="campo-hint">
          Uma coordenada por linha no formato <strong>lat, lng</strong>
        </small>
      </div>

      {coordenadas.length >= 3 && (
        <div className="pasto-preview">
          <span>{coordenadas.length} pontos</span>
          <span>{formatarArea(areaHa)}</span>
          <span>{formatarPerimetro(perimetroM)}</span>
        </div>
      )}

      {form.coordenadasTexto.trim() && coordenadas.length < 3 && (
        <p className="pasto-preview-erro">Mínimo de 3 coordenadas válidas para formar uma área.</p>
      )}

      <div className="form-footer">
        <button type="button" className="btn" onClick={onCancelar}>Cancelar</button>
        <button type="submit" className="btn btn-primary" disabled={salvando}>
          {salvando ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function Pastos() {
  const [lista, setLista] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [pagina, setPagina] = useState(1)
  const [filtroNome, setFiltroNome] = useState('')

  const [modalCriar, setModalCriar] = useState(false)
  const [formCriar, setFormCriar] = useState(FORM_INICIAL)
  const [salvandoCriar, setSalvandoCriar] = useState(false)

  const [editandoId, setEditandoId] = useState(null)
  const [formEditar, setFormEditar] = useState(FORM_INICIAL)
  const [salvandoEditar, setSalvandoEditar] = useState(false)
  const [carregandoEditar, setCarregandoEditar] = useState(false)

  const coordCriar = useMemo(() => parsearCoordenadas(formCriar.coordenadasTexto), [formCriar.coordenadasTexto])
  const areaCriar = coordCriar.length >= 3 ? computeArea(coordCriar) / 10000 : null
  const perCriar = coordCriar.length >= 3 ? computePerimetro(coordCriar) : null

  const coordEditar = useMemo(() => parsearCoordenadas(formEditar.coordenadasTexto), [formEditar.coordenadasTexto])
  const areaEditar = coordEditar.length >= 3 ? computeArea(coordEditar) / 10000 : null
  const perEditar = coordEditar.length >= 3 ? computePerimetro(coordEditar) : null

  const carregar = () => {
    pastosApi.listarTodos()
      .then((r) => { setLista(r.data); setPagina(1) })
      .catch(() => alert('Erro ao carregar pastos'))
      .finally(() => setCarregando(false))
  }

  useEffect(() => { carregar() }, [])

  const abrirEditar = (id) => {
    setCarregandoEditar(true)
    setEditandoId(id)
    pastosApi.buscarPorId(id)
      .then((r) => {
        const d = r.data
        setFormEditar({
          nome: d.nome ?? '',
          cor: d.cor ?? PALETA[0].hex,
          coordenadasTexto: coordenadasParaTexto(d.coordenadas),
        })
      })
      .catch(() => { alert('Erro ao carregar pasto'); setEditandoId(null) })
      .finally(() => setCarregandoEditar(false))
  }

  const deletar = (id, nome) => {
    if (!confirm(`Excluir o pasto "${nome}"? Essa ação não pode ser desfeita.`)) return
    pastosApi.deletar(id)
      .then(() => carregar())
      .catch(() => alert('Erro ao excluir pasto'))
  }

  const salvarNovo = (e) => {
    e.preventDefault()
    if (coordCriar.length < 3) { alert('Informe pelo menos 3 coordenadas.'); return }
    setSalvandoCriar(true)
    pastosApi.criar({
      nome: formCriar.nome,
      cor: formCriar.cor,
      area_ha: areaCriar,
      perimetro_m: perCriar,
      coordenadas: JSON.stringify(coordCriar),
    })
      .then(() => { setModalCriar(false); setFormCriar(FORM_INICIAL); carregar() })
      .catch(() => alert('Erro ao salvar pasto'))
      .finally(() => setSalvandoCriar(false))
  }

  const salvarEdicao = (e) => {
    e.preventDefault()
    if (coordEditar.length < 3) { alert('Informe pelo menos 3 coordenadas.'); return }
    setSalvandoEditar(true)
    pastosApi.atualizar(editandoId, {
      nome: formEditar.nome,
      cor: formEditar.cor,
      area_ha: areaEditar,
      perimetro_m: perEditar,
      coordenadas: JSON.stringify(coordEditar),
    })
      .then(() => { setEditandoId(null); carregar() })
      .catch(() => alert('Erro ao salvar pasto'))
      .finally(() => setSalvandoEditar(false))
  }

  const listaFiltrada = lista.filter((p) =>
    p.nome?.toLowerCase().includes(filtroNome.toLowerCase())
  )
  const itensPagina = listaFiltrada.slice(
    (pagina - 1) * ITENS_POR_PAGINA,
    pagina * ITENS_POR_PAGINA
  )

  if (carregando) return <p className="carregando">Carregando...</p>

  return (
    <div>
      <div className="page-header">
        <h1>Pastos</h1>
        <button className="btn btn-primary" onClick={() => { setFormCriar(FORM_INICIAL); setModalCriar(true) }}>
          + Novo Pasto
        </button>
      </div>

      <div className="filtros">
        <input
          className="filtro-input"
          placeholder="Buscar por nome..."
          value={filtroNome}
          onChange={(e) => { setFiltroNome(e.target.value); setPagina(1) }}
        />
      </div>

      <div className="tabela-wrapper">
        {listaFiltrada.length === 0 ? (
          <p className="vazio">
            {lista.length === 0 ? 'Nenhum pasto cadastrado.' : 'Nenhum pasto encontrado para o filtro.'}
          </p>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>Cor</th>
                  <th>Nome</th>
                  <th>Área</th>
                  <th>Perímetro</th>
                  <th>Criado em</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {itensPagina.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <span style={{
                        display: 'inline-block', width: 18, height: 18, borderRadius: 4,
                        backgroundColor: corCss(p.cor), border: '1px solid rgba(0,0,0,.15)',
                        verticalAlign: 'middle',
                      }} />
                    </td>
                    <td>{p.nome}</td>
                    <td>{formatarArea(p.area_ha)}</td>
                    <td>{formatarPerimetro(p.perimetro_m)}</td>
                    <td>{p.created_at ? p.created_at.slice(0, 10) : '—'}</td>
                    <td>
                      <div className="acoes">
                        <button className="btn btn-secondary" onClick={() => abrirEditar(p.id)}>
                          Editar
                        </button>
                        <button className="btn btn-danger" onClick={() => deletar(p.id, p.nome)}>
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Paginacao
              total={listaFiltrada.length}
              itensPorPagina={ITENS_POR_PAGINA}
              paginaAtual={pagina}
              onMudarPagina={setPagina}
            />
          </>
        )}
      </div>

      {/* Modal — Novo Pasto */}
      {modalCriar && (
        <Modal titulo="Novo Pasto" onFechar={() => setModalCriar(false)}>
          <form className="form" onSubmit={salvarNovo}>
            <FormPasto
              form={formCriar}
              setForm={setFormCriar}
              coordenadas={coordCriar}
              areaHa={areaCriar}
              perimetroM={perCriar}
              salvando={salvandoCriar}
              onCancelar={() => setModalCriar(false)}
            />
          </form>
        </Modal>
      )}

      {/* Modal — Editar Pasto */}
      {editandoId && (
        <Modal titulo="Editar Pasto" onFechar={() => setEditandoId(null)}>
          {carregandoEditar ? (
            <p className="carregando" style={{ padding: '32px 24px' }}>Carregando...</p>
          ) : (
            <form className="form" onSubmit={salvarEdicao}>
              <FormPasto
                form={formEditar}
                setForm={setFormEditar}
                coordenadas={coordEditar}
                areaHa={areaEditar}
                perimetroM={perEditar}
                salvando={salvandoEditar}
                onCancelar={() => setEditandoId(null)}
              />
            </form>
          )}
        </Modal>
      )}
    </div>
  )
}
