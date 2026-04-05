import { useEffect, useState } from 'react'
import { eventosApi, animaisApi } from '../services/api'
import Modal from '../components/Modal'
import Paginacao from '../components/Paginacao'

const ITENS_POR_PAGINA = 10

const TIPOS_EVENTO = ['PARTO', 'COBERTURA', 'DOENÇA', 'VACINAÇÃO', 'OUTRO']
const FORM_INICIAL = { animal_id: '', tipo: 'PARTO', data: '', descricao: '', matriz_id: '', touri_id: '' }

export default function Eventos() {
  const [lista, setLista] = useState([])
  const [animais, setAnimais] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)
  const [editandoId, setEditandoId] = useState(null)
  const [form, setForm] = useState(FORM_INICIAL)
  const [pagina, setPagina] = useState(1)
  const [filtroBrinco, setFiltroBrinco] = useState('')
  const [filtroSexo, setFiltroSexo] = useState('')

  const vacas = animais.filter((a) => a.sexo?.toLowerCase() === 'femea')

  const brincoDoAnimal = (animal_id) => {
    const animal = animais.find((a) => a.id === animal_id)
    return animal ? animal.brinco : animal_id
  }

  const sexoDoAnimal = (animal_id) => {
    const animal = animais.find((a) => a.id === animal_id)
    return animal?.sexo?.toLowerCase() ?? ''
  }

  const listaFiltrada = lista.filter((e) => {
    const brincoOk = brincoDoAnimal(e.animal_id).toLowerCase().includes(filtroBrinco.toLowerCase())
    const sexoOk = filtroSexo === '' || sexoDoAnimal(e.animal_id) === filtroSexo.toLowerCase()
    return brincoOk && sexoOk
  })

  const itensPagina = listaFiltrada.slice((pagina - 1) * ITENS_POR_PAGINA, pagina * ITENS_POR_PAGINA)

  const carregar = () => {
    Promise.all([eventosApi.listarTodos(), animaisApi.listarTodos()])
      .then(([resEventos, resAnimais]) => {
        setLista(resEventos.data)
        setAnimais(resAnimais.data)
        setPagina(1)
      })
      .catch(() => alert('Erro ao carregar eventos'))
      .finally(() => setCarregando(false))
  }

  useEffect(() => { carregar() }, [])

  const abrirNovo = () => {
    setEditandoId(null)
    setForm(FORM_INICIAL)
    setModalAberto(true)
  }

  const abrirEditar = (id) => {
    eventosApi.buscarPorId(id).then((r) => {
      setEditandoId(id)
      setForm({
        animal_id: r.data.animal_id ?? '',
        tipo: r.data.tipo ?? 'PARTO',
        data: r.data.data ?? '',
        descricao: r.data.descricao ?? '',
        matriz_id: r.data.matriz_id ?? '',
        touri_id: r.data.touri_id ?? '',
      })
      setModalAberto(true)
    }).catch(() => alert('Erro ao buscar evento'))
  }

  const deletar = (id) => {
    if (!confirm('Deletar este evento?')) return
    eventosApi.deletar(id)
      .then(() => carregar())
      .catch(() => alert('Erro ao deletar'))
  }

  const salvar = (e) => {
    e.preventDefault()
    const chamada = editandoId
      ? eventosApi.atualizar(editandoId, form)
      : eventosApi.criar(form)

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
        <h1>Eventos</h1>
        <button className="btn btn-primary" onClick={abrirNovo}>+ Novo Evento</button>
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
          <option value="femea">Fêmea</option>
          <option value="macho">Macho</option>
        </select>
      </div>

      <div className="tabela-wrapper">
        {listaFiltrada.length === 0 ? (
          <p className="vazio">{lista.length === 0 ? 'Nenhum evento cadastrado.' : 'Nenhum evento encontrado para o filtro.'}</p>
        ) : (
          <>
          <table>
            <thead>
              <tr>
                <th>Brinco</th>
                <th>Tipo</th>
                <th>Data</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {itensPagina.map((e) => (
                <tr key={e.id}>
                  <td>{brincoDoAnimal(e.animal_id)}</td>
                  <td>{e.tipo}</td>
                  <td>{e.data}</td>
                  <td>
                    <div className="acoes">
                      <button className="btn btn-secondary" onClick={() => abrirEditar(e.id)}>Editar</button>
                      <button className="btn btn-danger" onClick={() => deletar(e.id)}>Deletar</button>
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
        <Modal titulo={editandoId ? 'Editar Evento' : 'Novo Evento'} onFechar={() => setModalAberto(false)}>
          <form className="form" onSubmit={salvar}>
            <div className="campo">
              <label>Vaca (Brinco)</label>
              <select name="animal_id" value={form.animal_id} onChange={onChange} required>
                <option value="">Selecione uma vaca</option>
                {vacas.map((a) => (
                  <option key={a.id} value={a.id}>{a.brinco}</option>
                ))}
              </select>
            </div>
            <div className="campo">
              <label>Tipo</label>
              <select name="tipo" value={form.tipo} onChange={onChange}>
                {TIPOS_EVENTO.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="campo">
              <label>Data</label>
              <input type="date" name="data" value={form.data} onChange={onChange} required />
            </div>
            <div className="campo">
              <label>Descrição</label>
              <textarea name="descricao" value={form.descricao} onChange={onChange} rows={3} />
            </div>
            <div className="campo">
              <label>ID da Matriz (opcional)</label>
              <input name="matriz_id" value={form.matriz_id} onChange={onChange} />
            </div>
            <div className="campo">
              <label>ID do Touro (opcional)</label>
              <input name="touri_id" value={form.touri_id} onChange={onChange} />
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
