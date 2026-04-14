import { useEffect, useState } from 'react'
import { fazendasApi } from '../services/api'
import Modal from '../components/Modal'
import Paginacao from '../components/Paginacao'

const ITENS_POR_PAGINA = 10

const FORM_INICIAL = { nome: '', cnpj: '', localizacao: '', enabled: 1 }

export default function Fazendas() {
  const [fazendas, setFazendas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)
  const [editandoId, setEditandoId] = useState(null)
  const [form, setForm] = useState(FORM_INICIAL)
  const [pagina, setPagina] = useState(1)
  const [filtroNome, setFiltroNome] = useState('')

  const listaFiltrada = fazendas.filter((f) =>
    f.nome?.toLowerCase().includes(filtroNome.toLowerCase())
  )

  const itensPagina = listaFiltrada.slice(
    (pagina - 1) * ITENS_POR_PAGINA,
    pagina * ITENS_POR_PAGINA
  )

  const carregar = () => {
    fazendasApi.listarTodos()
      .then(({ data }) => {
        setFazendas(data)
        setPagina(1)
      })
      .catch(() => alert('Erro ao carregar fazendas'))
      .finally(() => setCarregando(false))
  }

  useEffect(() => { carregar() }, [])

  const abrirNovo = () => {
    setEditandoId(null)
    setForm(FORM_INICIAL)
    setModalAberto(true)
  }

  const abrirEditar = (id) => {
    fazendasApi.buscarPorId(id).then((r) => {
      setEditandoId(id)
      setForm({
        nome: r.data.nome ?? '',
        cnpj: r.data.cnpj ?? '',
        localizacao: r.data.localizacao ?? '',
        enabled: r.data.enabled ?? 1,
      })
      setModalAberto(true)
    }).catch(() => alert('Erro ao buscar fazenda'))
  }

  const deletar = (id) => {
    if (!confirm('Deletar esta fazenda?')) return
    fazendasApi.deletar(id)
      .then(() => carregar())
      .catch(() => alert('Erro ao deletar'))
  }

  const salvar = (e) => {
    e.preventDefault()
    const payload = {
      nome: form.nome,
      cnpj: form.cnpj || null,
      localizacao: form.localizacao || null,
      enabled: form.enabled,
    }
    const chamada = editandoId
      ? fazendasApi.atualizar(editandoId, payload)
      : fazendasApi.criar(payload)

    chamada.then(() => {
      setModalAberto(false)
      carregar()
    }).catch(() => alert('Erro ao salvar'))
  }

  const onChange = (e) => {
    const { name, value, type } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target.checked ? 1 : 0) : value,
    }))
  }

  if (carregando) return <p className="carregando">Carregando...</p>

  return (
    <div>
      <div className="page-header">
        <h1>Fazendas</h1>
        <button className="btn btn-primary" onClick={abrirNovo}>+ Nova Fazenda</button>
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
          <p className="vazio">{fazendas.length === 0 ? 'Nenhuma fazenda cadastrada.' : 'Nenhuma fazenda encontrada para o filtro.'}</p>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>CNPJ</th>
                  <th>Localização</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {itensPagina.map((f) => (
                  <tr key={f.id}>
                    <td>{f.nome}</td>
                    <td>{f.cnpj ?? '—'}</td>
                    <td>{f.localizacao ?? '—'}</td>
                    <td>
                      <span style={{ color: f.enabled === 1 ? '#2e7d32' : '#c62828', fontWeight: 600 }}>
                        {f.enabled === 1 ? 'Ativa' : 'Inativa'}
                      </span>
                    </td>
                    <td>
                      <div className="acoes">
                        <button className="btn btn-secondary" onClick={() => abrirEditar(f.id)}>Editar</button>
                        <button className="btn btn-danger" onClick={() => deletar(f.id)}>Deletar</button>
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
        <Modal titulo={editandoId ? 'Editar Fazenda' : 'Nova Fazenda'} onFechar={() => setModalAberto(false)}>
          <form className="form" onSubmit={salvar}>
            <div className="campo">
              <label>Nome *</label>
              <input name="nome" value={form.nome} onChange={onChange} required />
            </div>
            <div className="campo">
              <label>CNPJ</label>
              <input name="cnpj" value={form.cnpj} onChange={onChange} placeholder="00.000.000/0000-00" />
            </div>
            <div className="campo">
              <label>Localização</label>
              <input name="localizacao" value={form.localizacao} onChange={onChange} placeholder="Cidade, Estado" />
            </div>
            <label className="toggle-campo">
              <input
                type="checkbox"
                name="enabled"
                checked={form.enabled === 1}
                onChange={onChange}
              />
              <span>
                Fazenda ativa
                <small>Quando inativa, não estará disponível para seleção</small>
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
