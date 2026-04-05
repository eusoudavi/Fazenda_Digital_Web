import { useEffect, useState } from 'react'
import { vacinasApi } from '../services/api'
import Modal from '../components/Modal'
import Paginacao from '../components/Paginacao'

const ITENS_POR_PAGINA = 10

// Espelha o enum TipoVacina do app Flutter
const TIPOS_VACINA = [
  { value: 'aftosa',         label: 'Febre Aftosa' },
  { value: 'brucelose',      label: 'Brucelose' },
  { value: 'clostridioses',  label: 'Clostridioses' },
  { value: 'raiva',          label: 'Raiva' },
  { value: 'ibrBvd',         label: 'IBR / BVD' },
  { value: 'leptospirose',   label: 'Leptospirose' },
  { value: 'carbunculo',     label: 'Carbúnculo' },
  { value: 'pasteureloses',  label: 'Pasteureloses' },
  { value: 'outra',          label: 'Outra' },
]

const labelTipo = (value) =>
  TIPOS_VACINA.find((t) => t.value === value)?.label ?? value

const hoje = () => new Date().toISOString().split('T')[0]

const FORM_INICIAL = {
  tipo: 'aftosa',
  nome_comercial: '',
  fabricante: '',
  lote: '',
  dose: '',
  data_aplicacao: '',
  proxima_dose: '',
  veterinario: '',
  observacao: '',
  em_aplicacao: 1,
}

// Retorna 'vencida' | 'proxima' | null para colorir a próxima dose na tabela
const statusProximaDose = (proximaDose) => {
  if (!proximaDose) return null
  const diff = (new Date(proximaDose) - new Date()) / (1000 * 60 * 60 * 24)
  if (diff < 0) return 'vencida'
  if (diff <= 30) return 'proxima'
  return null
}

export default function Vacinas() {
  const [lista, setLista] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)
  const [editandoId, setEditandoId] = useState(null)
  const [form, setForm] = useState(FORM_INICIAL)
  const [pagina, setPagina] = useState(1)

  const itensPagina = lista.slice((pagina - 1) * ITENS_POR_PAGINA, pagina * ITENS_POR_PAGINA)

  const carregar = () => {
    vacinasApi.listarTodos()
      .then((r) => { setLista(r.data); setPagina(1) })
      .catch(() => alert('Erro ao carregar vacinas'))
      .finally(() => setCarregando(false))
  }

  useEffect(() => { carregar() }, [])

  const abrirNovo = () => {
    setEditandoId(null)
    setForm({ ...FORM_INICIAL, data_aplicacao: hoje() })
    setModalAberto(true)
  }

  const abrirEditar = (id) => {
    vacinasApi.buscarPorId(id).then((r) => {
      setEditandoId(id)
      setForm({
        tipo: r.data.tipo ?? 'aftosa',
        nome_comercial: r.data.nome_comercial ?? '',
        fabricante: r.data.fabricante ?? '',
        lote: r.data.lote ?? '',
        dose: r.data.dose ?? '',
        data_aplicacao: r.data.data_aplicacao ?? '',
        proxima_dose: r.data.proxima_dose ?? '',
        veterinario: r.data.veterinario ?? '',
        observacao: r.data.observacao ?? '',
        em_aplicacao: r.data.em_aplicacao ?? 1,
      })
      setModalAberto(true)
    }).catch(() => alert('Erro ao buscar vacina'))
  }

  const deletar = (id) => {
    if (!confirm('Deletar esta vacina?')) return
    vacinasApi.deletar(id)
      .then(() => carregar())
      .catch(() => alert('Erro ao deletar'))
  }

  const salvar = (e) => {
    e.preventDefault()
    const payload = {
      ...form,
      dose: form.dose !== '' ? Number(form.dose) : null,
      proxima_dose: form.proxima_dose || null,
      em_aplicacao: Number(form.em_aplicacao),
    }
    const chamada = editandoId
      ? vacinasApi.atualizar(editandoId, payload)
      : vacinasApi.criar(payload)

    chamada.then(() => {
      setModalAberto(false)
      carregar()
    }).catch(() => alert('Erro ao salvar'))
  }

  const onChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? (checked ? 1 : 0) : value }))
  }

  if (carregando) return <p className="carregando">Carregando...</p>

  return (
    <div>
      <div className="page-header">
        <h1>Vacinas</h1>
        <button className="btn btn-primary" onClick={abrirNovo}>+ Nova Vacina</button>
      </div>

      <div className="tabela-wrapper">
        {lista.length === 0 ? (
          <p className="vazio">Nenhuma vacina cadastrada.</p>
        ) : (
          <>
          <table>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Nome Comercial</th>
                <th>Data Aplicação</th>
                <th>Próxima Dose</th>
                <th>Em Aplicação</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {itensPagina.map((v) => {
                const status = statusProximaDose(v.proxima_dose)
                return (
                  <tr key={v.id}>
                    <td>{labelTipo(v.tipo)}</td>
                    <td>{v.nome_comercial || '—'}</td>
                    <td>{v.data_aplicacao}</td>
                    <td>
                      {v.proxima_dose ? (
                        <span className={`badge-dose ${status ?? ''}`}>{v.proxima_dose}</span>
                      ) : '—'}
                    </td>
                    <td>{v.em_aplicacao === 1 ? 'Sim' : 'Não'}</td>
                    <td>
                      <div className="acoes">
                        <button className="btn btn-secondary" onClick={() => abrirEditar(v.id)}>Editar</button>
                        <button className="btn btn-danger" onClick={() => deletar(v.id)}>Deletar</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <Paginacao
            total={lista.length}
            itensPorPagina={ITENS_POR_PAGINA}
            paginaAtual={pagina}
            onMudarPagina={setPagina}
          />
          </>
        )}
      </div>

      {modalAberto && (
        <Modal titulo={editandoId ? 'Editar Vacina' : 'Nova Vacina'} onFechar={() => setModalAberto(false)}>
          <form className="form" onSubmit={salvar}>

            <div className="form-secao">Vacina</div>

            <div className="campo">
              <label>Tipo *</label>
              <select name="tipo" value={form.tipo} onChange={onChange} required>
                {TIPOS_VACINA.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div className="campo">
              <label>Nome Comercial</label>
              <input name="nome_comercial" value={form.nome_comercial} onChange={onChange} placeholder="Ex: Bovicel 12" />
            </div>
            <div className="campos-row">
              <div className="campo">
                <label>Fabricante</label>
                <input name="fabricante" value={form.fabricante} onChange={onChange} />
              </div>
              <div className="campo">
                <label>Lote</label>
                <input name="lote" value={form.lote} onChange={onChange} />
              </div>
            </div>
            <div className="campo campo-pequeno">
              <label>Dose (ml)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                name="dose"
                value={form.dose}
                onChange={onChange}
                placeholder="0.0"
              />
            </div>

            <div className="form-secao">Datas</div>

            <div className="campo">
              <label>Data de Início *</label>
              <input type="date" name="data_aplicacao" value={form.data_aplicacao} onChange={onChange} required />
            </div>
            <div className="campo">
              <label>Data da Próxima Dose</label>
              <input type="date" name="proxima_dose" value={form.proxima_dose} onChange={onChange} />
            </div>

            <div className="form-secao">Responsável</div>

            <div className="campo">
              <label>Veterinário</label>
              <input name="veterinario" value={form.veterinario} onChange={onChange} />
            </div>
            <div className="campo">
              <label>Observações</label>
              <textarea name="observacao" value={form.observacao} onChange={onChange} rows={2} />
            </div>

            <div className="form-secao">Configuração</div>

            <label className="toggle-campo">
              <input
                type="checkbox"
                name="em_aplicacao"
                checked={form.em_aplicacao === 1}
                onChange={onChange}
              />
              <span>
                <strong>Em aplicação</strong>
                <small>Disponível para seleção nas vacinações dos animais</small>
              </span>
            </label>

            <div className="form-footer">
              <button type="button" className="btn" onClick={() => setModalAberto(false)}>Cancelar</button>
              <button type="submit" className="btn btn-primary">Salvar</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
