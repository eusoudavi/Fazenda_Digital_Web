import { useEffect, useState } from 'react'
import { vacinacoesApi } from '../services/api'
import Modal from '../components/Modal'
import Paginacao from '../components/Paginacao'

const ITENS_POR_PAGINA = 10

const FORM_INICIAL = { animal_id: '', vacina_id: '', data_aplicacao: '' }

export default function Vacinacoes() {
  const [lista, setLista] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)
  const [editandoId, setEditandoId] = useState(null)
  const [form, setForm] = useState(FORM_INICIAL)
  const [pagina, setPagina] = useState(1)

  const itensPagina = lista.slice((pagina - 1) * ITENS_POR_PAGINA, pagina * ITENS_POR_PAGINA)

  const carregar = () => {
    vacinacoesApi.listarTodos()
      .then((r) => { setLista(r.data); setPagina(1) })
      .catch(() => alert('Erro ao carregar vacinações'))
      .finally(() => setCarregando(false))
  }

  useEffect(() => { carregar() }, [])

  const abrirNovo = () => {
    setEditandoId(null)
    setForm(FORM_INICIAL)
    setModalAberto(true)
  }

  const abrirEditar = (id) => {
    vacinacoesApi.buscarPorId(id).then((r) => {
      setEditandoId(id)
      setForm({
        animal_id: r.data.animal_id ?? '',
        vacina_id: r.data.vacina_id ?? '',
        data_aplicacao: r.data.data_aplicacao ?? '',
      })
      setModalAberto(true)
    }).catch(() => alert('Erro ao buscar vacinação'))
  }

  const deletar = (id) => {
    if (!confirm('Deletar esta vacinação?')) return
    vacinacoesApi.deletar(id)
      .then(() => carregar())
      .catch(() => alert('Erro ao deletar'))
  }

  const salvar = (e) => {
    e.preventDefault()
    const chamada = editandoId
      ? vacinacoesApi.atualizar(editandoId, form)
      : vacinacoesApi.criar(form)

    chamada.then(() => {
      setModalAberto(false)
      carregar()
    }).catch(() => alert('Erro ao salvar'))
  }

  const onChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  if (carregando) return <p className="carregando">Carregando...</p>

  return (
    <div>
      <div className="page-header">
        <h1>Vacinações</h1>
        <button className="btn btn-primary" onClick={abrirNovo}>+ Nova Vacinação</button>
      </div>

      <div className="tabela-wrapper">
        {lista.length === 0 ? (
          <p className="vazio">Nenhuma vacinação cadastrada.</p>
        ) : (
          <>
          <table>
            <thead>
              <tr>
                <th>Animal ID</th>
                <th>Vacina ID</th>
                <th>Data de Aplicação</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {itensPagina.map((v) => (
                <tr key={v.id}>
                  <td>{v.animal_id}</td>
                  <td>{v.vacina_id}</td>
                  <td>{v.data_aplicacao}</td>
                  <td>
                    <div className="acoes">
                      <button className="btn btn-secondary" onClick={() => abrirEditar(v.id)}>Editar</button>
                      <button className="btn btn-danger" onClick={() => deletar(v.id)}>Deletar</button>
                    </div>
                  </td>
                </tr>
              ))}
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
        <Modal titulo={editandoId ? 'Editar Vacinação' : 'Nova Vacinação'} onFechar={() => setModalAberto(false)}>
          <form className="form" onSubmit={salvar}>
            <div className="campo">
              <label>ID do Animal</label>
              <input name="animal_id" value={form.animal_id} onChange={onChange} required />
            </div>
            <div className="campo">
              <label>ID da Vacina</label>
              <input name="vacina_id" value={form.vacina_id} onChange={onChange} required />
            </div>
            <div className="campo">
              <label>Data de Aplicação</label>
              <input type="date" name="data_aplicacao" value={form.data_aplicacao} onChange={onChange} required />
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
