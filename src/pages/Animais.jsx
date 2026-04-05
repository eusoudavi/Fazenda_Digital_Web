import { useEffect, useState } from 'react'
import { animaisApi } from '../services/api'
import Modal from '../components/Modal'
import Paginacao from '../components/Paginacao'

const ITENS_POR_PAGINA = 10

const FORM_INICIAL = {
  brinco: '',
  raca: '',
  sexo: 'FEMEA',
  data_nascimento: '',
  peso_inicial: '',
  status: 'ATIVO',
  matriz_id: '',
}

export default function Animais() {
  const [lista, setLista] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)
  const [editandoId, setEditandoId] = useState(null)
  const [form, setForm] = useState(FORM_INICIAL)
  const [pagina, setPagina] = useState(1)
  const [filtroBrinco, setFiltroBrinco] = useState('')
  const [filtroSexo, setFiltroSexo] = useState('')

  const listaFiltrada = lista.filter((a) => {
    const brincoOk = a.brinco?.toLowerCase().includes(filtroBrinco.toLowerCase())
    const sexoOk = filtroSexo === '' || a.sexo?.toLowerCase() === filtroSexo.toLowerCase()
    return brincoOk && sexoOk
  })

  const itensPagina = listaFiltrada.slice((pagina - 1) * ITENS_POR_PAGINA, pagina * ITENS_POR_PAGINA)

  const carregar = () => {
    animaisApi.listarTodos()
      .then((r) => { setLista(r.data); setPagina(1) })
      .catch(() => alert('Erro ao carregar animais'))
      .finally(() => setCarregando(false))
  }

  useEffect(() => { carregar() }, [])

  const abrirNovo = () => {
    setEditandoId(null)
    setForm(FORM_INICIAL)
    setModalAberto(true)
  }

  const abrirEditar = (id) => {
    animaisApi.buscarPorId(id).then((r) => {
      setEditandoId(id)
      setForm({
        brinco: r.data.brinco ?? '',
        raca: r.data.raca ?? '',
        sexo: r.data.sexo ?? 'FEMEA',
        data_nascimento: r.data.data_nascimento ?? '',
        peso_inicial: r.data.peso_inicial ?? '',
        status: r.data.status ?? 'ATIVO',
        matriz_id: r.data.matriz_id ?? '',
      })
      setModalAberto(true)
    }).catch(() => alert('Erro ao buscar animal'))
  }

  const deletar = (id) => {
    if (!confirm('Deletar este animal?')) return
    animaisApi.deletar(id)
      .then(() => carregar())
      .catch(() => alert('Erro ao deletar'))
  }

  const salvar = (e) => {
    e.preventDefault()
    const payload = { ...form, peso_inicial: Number(form.peso_inicial) || null }
    const chamada = editandoId
      ? animaisApi.atualizar(editandoId, payload)
      : animaisApi.criar(payload)

    chamada.then(() => {
      setModalAberto(false)
      carregar()
    }).catch(() => alert('Erro ao salvar'))
  }

  const onChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const onFiltroChange = (setter) => (e) => { setter(e.target.value); setPagina(1) }

  if (carregando) return <p className="carregando">Carregando...</p>

  return (
    <div>
      <div className="page-header">
        <h1>Animais</h1>
        <button className="btn btn-primary" onClick={abrirNovo}>+ Novo Animal</button>
      </div>

      <div className="filtros">
        <input
          className="filtro-input"
          placeholder="Buscar por brinco..."
          value={filtroBrinco}
          onChange={onFiltroChange(setFiltroBrinco)}
        />
        <select
          className="filtro-select"
          value={filtroSexo}
          onChange={onFiltroChange(setFiltroSexo)}
        >
          <option value="">Todos os sexos</option>
          <option value="FEMEA">Fêmea</option>
          <option value="MACHO">Macho</option>
        </select>
      </div>

      <div className="tabela-wrapper">
        {listaFiltrada.length === 0 ? (
          <p className="vazio">{lista.length === 0 ? 'Nenhum animal cadastrado.' : 'Nenhum animal encontrado para o filtro.'}</p>
        ) : (
          <>
          <table>
            <thead>
              <tr>
                <th>Brinco</th>
                <th>Raça</th>
                <th>Sexo</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {itensPagina.map((a) => (
                <tr key={a.id}>
                  <td>{a.brinco}</td>
                  <td>{a.raca}</td>
                  <td>{a.sexo}</td>
                  <td>{a.status}</td>
                  <td>
                    <div className="acoes">
                      <button className="btn btn-secondary" onClick={() => abrirEditar(a.id)}>Editar</button>
                      <button className="btn btn-danger" onClick={() => deletar(a.id)}>Deletar</button>
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

      {modalAberto && (
        <Modal titulo={editandoId ? 'Editar Animal' : 'Novo Animal'} onFechar={() => setModalAberto(false)}>
          <form className="form" onSubmit={salvar}>
            <div className="campo">
              <label>Brinco</label>
              <input name="brinco" value={form.brinco} onChange={onChange} required />
            </div>
            <div className="campo">
              <label>Raça</label>
              <input name="raca" value={form.raca} onChange={onChange} />
            </div>
            <div className="campo">
              <label>Sexo</label>
              <select name="sexo" value={form.sexo} onChange={onChange}>
                <option value="FEMEA">Fêmea</option>
                <option value="MACHO">Macho</option>
              </select>
            </div>
            <div className="campo">
              <label>Data de Nascimento</label>
              <input type="date" name="data_nascimento" value={form.data_nascimento} onChange={onChange} />
            </div>
            <div className="campo">
              <label>Peso Inicial (kg)</label>
              <input type="number" step="0.1" name="peso_inicial" value={form.peso_inicial} onChange={onChange} />
            </div>
            <div className="campo">
              <label>Status</label>
              <select name="status" value={form.status} onChange={onChange}>
                <option value="ATIVO">Ativo</option>
                <option value="INATIVO">Inativo</option>
                <option value="VENDIDO">Vendido</option>
                <option value="MORTO">Morto</option>
              </select>
            </div>
            <div className="campo">
              <label>ID da Matriz (opcional)</label>
              <input name="matriz_id" value={form.matriz_id} onChange={onChange} />
            </div>
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
