import { useEffect, useState } from 'react'
import { usuariosApi } from '../services/api'
import Modal from '../components/Modal'
import Paginacao from '../components/Paginacao'

const ITENS_POR_PAGINA = 10

const PERFIS = [
  { value: 'ADMINISTRADOR',       label: 'Administrador' },
  { value: 'PROPRIETARIO',        label: 'Proprietário' },
  { value: 'ADMINISTRADOR_FAZENDA', label: 'Administrador de Fazenda' },
  { value: 'FUNCIONARIO',         label: 'Funcionário' },
  { value: 'VETERINARIO',         label: 'Veterinário' },
]

const labelPerfil = (v) => PERFIS.find((p) => p.value === v)?.label ?? v

const FORM_INICIAL = { nome: '', email: '', senha: '', perfil: 'FUNCIONARIO', enabled: 1 }

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)
  const [editandoId, setEditandoId] = useState(null)
  const [form, setForm] = useState(FORM_INICIAL)
  const [pagina, setPagina] = useState(1)
  const [filtroNome, setFiltroNome] = useState('')
  const [filtroPerfil, setFiltroPerfil] = useState('')

  const listaFiltrada = usuarios.filter((u) => {
    const nomeOk = u.nome?.toLowerCase().includes(filtroNome.toLowerCase())
    const perfilOk = filtroPerfil === '' || u.perfil === filtroPerfil
    return nomeOk && perfilOk
  })

  const itensPagina = listaFiltrada.slice(
    (pagina - 1) * ITENS_POR_PAGINA,
    pagina * ITENS_POR_PAGINA
  )

  const carregar = () => {
    usuariosApi.listarTodos()
      .then(({ data }) => {
        setUsuarios(data)
        setPagina(1)
      })
      .catch(() => alert('Erro ao carregar usuários'))
      .finally(() => setCarregando(false))
  }

  useEffect(() => { carregar() }, [])

  const abrirNovo = () => {
    setEditandoId(null)
    setForm(FORM_INICIAL)
    setModalAberto(true)
  }

  const abrirEditar = (id) => {
    usuariosApi.buscarPorId(id).then((r) => {
      setEditandoId(id)
      setForm({
        nome: r.data.nome ?? '',
        email: r.data.email ?? '',
        senha: '',
        perfil: r.data.perfil ?? 'FUNCIONARIO',
        enabled: r.data.enabled ?? 1,
      })
      setModalAberto(true)
    }).catch(() => alert('Erro ao buscar usuário'))
  }

  const deletar = (id) => {
    if (!confirm('Deletar este usuário?')) return
    usuariosApi.deletar(id)
      .then(() => carregar())
      .catch(() => alert('Erro ao deletar'))
  }

  const salvar = (e) => {
    e.preventDefault()
    const payload = {
      nome: form.nome,
      email: form.email,
      senha: form.senha || undefined,
      perfil: form.perfil,
      enabled: form.enabled,
    }
    const chamada = editandoId
      ? usuariosApi.atualizar(editandoId, payload)
      : usuariosApi.criar(payload)

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
        <h1>Usuários</h1>
        <button className="btn btn-primary" onClick={abrirNovo}>+ Novo Usuário</button>
      </div>

      <div className="filtros">
        <input
          className="filtro-input"
          placeholder="Buscar por nome..."
          value={filtroNome}
          onChange={(e) => { setFiltroNome(e.target.value); setPagina(1) }}
        />
        <select
          className="filtro-select"
          value={filtroPerfil}
          onChange={(e) => { setFiltroPerfil(e.target.value); setPagina(1) }}
        >
          <option value="">Todos os perfis</option>
          {PERFIS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>

      <div className="tabela-wrapper">
        {listaFiltrada.length === 0 ? (
          <p className="vazio">{usuarios.length === 0 ? 'Nenhum usuário cadastrado.' : 'Nenhum usuário encontrado para o filtro.'}</p>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Perfil</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {itensPagina.map((u) => (
                  <tr key={u.id}>
                    <td>{u.nome}</td>
                    <td>{u.email}</td>
                    <td>{labelPerfil(u.perfil)}</td>
                    <td>
                      <span style={{ color: u.enabled === 1 ? '#2e7d32' : '#c62828', fontWeight: 600 }}>
                        {u.enabled === 1 ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td>
                      <div className="acoes">
                        <button className="btn btn-secondary" onClick={() => abrirEditar(u.id)}>Editar</button>
                        <button className="btn btn-danger" onClick={() => deletar(u.id)}>Deletar</button>
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
        <Modal titulo={editandoId ? 'Editar Usuário' : 'Novo Usuário'} onFechar={() => setModalAberto(false)}>
          <form className="form" onSubmit={salvar}>
            <div className="campo">
              <label>Nome *</label>
              <input name="nome" value={form.nome} onChange={onChange} required />
            </div>
            <div className="campo">
              <label>E-mail *</label>
              <input type="email" name="email" value={form.email} onChange={onChange} required />
            </div>
            <div className="campo">
              <label>{editandoId ? 'Nova senha (deixe em branco para manter)' : 'Senha *'}</label>
              <input
                type="password"
                name="senha"
                value={form.senha}
                onChange={onChange}
                required={!editandoId}
                autoComplete="new-password"
              />
            </div>
            <div className="campo">
              <label>Perfil *</label>
              <select name="perfil" value={form.perfil} onChange={onChange} required>
                {PERFIS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <label className="toggle-campo">
              <input
                type="checkbox"
                name="enabled"
                checked={form.enabled === 1}
                onChange={onChange}
              />
              <span>
                Usuário ativo
                <small>Quando inativo, não poderá acessar o sistema</small>
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
