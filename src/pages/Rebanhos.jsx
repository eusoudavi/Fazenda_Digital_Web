import { useEffect, useState } from 'react'
import { rebanhoApi } from '../services/api'
import Modal from '../components/Modal'
import Paginacao from '../components/Paginacao'

const ITENS_POR_PAGINA = 10

const FORM_INICIAL = { nome: '', descricao: '', localizacao: '', cor: '' }

export default function Rebanhos() {
  const [lista, setLista] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)
  const [editandoId, setEditandoId] = useState(null)
  const [form, setForm] = useState(FORM_INICIAL)
  const [pagina, setPagina] = useState(1)

  const itensPagina = lista.slice((pagina - 1) * ITENS_POR_PAGINA, pagina * ITENS_POR_PAGINA)

  const carregar = () => {
    rebanhoApi.listarTodos()
      .then((r) => { setLista(r.data); setPagina(1) })
      .catch(() => alert('Erro ao carregar rebanhos'))
      .finally(() => setCarregando(false))
  }

  useEffect(() => { carregar() }, [])

  const abrirNovo = () => {
    setEditandoId(null)
    setForm(FORM_INICIAL)
    setModalAberto(true)
  }

  const abrirEditar = (id) => {
    rebanhoApi.buscarPorId(id).then((r) => {
      setEditandoId(id)
      setForm({
        nome: r.data.nome ?? '',
        descricao: r.data.descricao ?? '',
        localizacao: r.data.localizacao ?? '',
        cor: r.data.cor ?? '',
      })
      setModalAberto(true)
    }).catch(() => alert('Erro ao buscar rebanho'))
  }

  const deletar = (id) => {
    if (!confirm('Deletar este rebanho?')) return
    rebanhoApi.deletar(id)
      .then(() => carregar())
      .catch(() => alert('Erro ao deletar'))
  }

  const salvar = (e) => {
    e.preventDefault()
    const chamada = editandoId
      ? rebanhoApi.atualizar(editandoId, form)
      : rebanhoApi.criar(form)

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
        <h1>Rebanhos</h1>
        <button className="btn btn-primary" onClick={abrirNovo}>+ Novo Rebanho</button>
      </div>

      <div className="tabela-wrapper">
        {lista.length === 0 ? (
          <p className="vazio">Nenhum rebanho cadastrado.</p>
        ) : (
          <>
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Localização</th>
                <th>Cor</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {itensPagina.map((r) => (
                <tr key={r.id}>
                  <td>{r.nome}</td>
                  <td>{r.localizacao}</td>
                  <td>{r.cor}</td>
                  <td>
                    <div className="acoes">
                      <button className="btn btn-secondary" onClick={() => abrirEditar(r.id)}>Editar</button>
                      <button className="btn btn-danger" onClick={() => deletar(r.id)}>Deletar</button>
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
        <Modal titulo={editandoId ? 'Editar Rebanho' : 'Novo Rebanho'} onFechar={() => setModalAberto(false)}>
          <form className="form" onSubmit={salvar}>
            <div className="campo">
              <label>Nome</label>
              <input name="nome" value={form.nome} onChange={onChange} required />
            </div>
            <div className="campo">
              <label>Descrição</label>
              <textarea name="descricao" value={form.descricao} onChange={onChange} rows={3} />
            </div>
            <div className="campo">
              <label>Localização</label>
              <input name="localizacao" value={form.localizacao} onChange={onChange} />
            </div>
            <div className="campo">
              <label>Cor</label>
              <input name="cor" value={form.cor} onChange={onChange} />
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
