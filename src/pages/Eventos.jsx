import { useEffect, useState } from 'react'
import { eventosApi, syncApi } from '../services/api'
import Modal from '../components/Modal'
import Paginacao from '../components/Paginacao'

const ITENS_POR_PAGINA = 10

const FORM_INICIAL = { animal_id: '', data: '', sexo_bezerro: 'macho' }

export default function Eventos() {
  const [partos, setPartos] = useState([])       // eventos filtrados por tipo=parto (dados completos)
  const [animais, setAnimais] = useState([])     // todos os animais (dados completos do sync)
  const [carregando, setCarregando] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)
  const [editandoId, setEditandoId] = useState(null)
  const [form, setForm] = useState(FORM_INICIAL)
  const [pagina, setPagina] = useState(1)
  const [filtroBrinco, setFiltroBrinco] = useState('')
  const [filtroSexoBezerro, setFiltroSexoBezerro] = useState('')

  // Apenas fêmeas para o select do formulário
  const vacas = animais.filter((a) => a.sexo?.toLowerCase() === 'femea')

  // Helpers
  const brincoDoAnimal = (id) => animais.find((a) => a.id === id)?.brinco ?? '—'

  const sexoDaDescricao = (descricao) => {
    if (!descricao) return '—'
    const partes = descricao.split(':')
    return partes.length > 1 ? partes[1].trim() : descricao
  }

  const brincoBezerro = (evento) => {
    const dataEvento = (evento.data ?? '').substring(0, 10)
    const bezerro = animais.find(
      (a) => a.matriz_id === evento.animal_id &&
             (a.data_nascimento ?? '').startsWith(dataEvento)
    )
    if (!bezerro) return '—'
    return bezerro.brinco ? bezerro.brinco : 'Sem brinco'
  }

  // Filtros
  const listaFiltrada = partos.filter((e) => {
    const brincoOk = brincoDoAnimal(e.animal_id).toLowerCase().includes(filtroBrinco.toLowerCase())
    const sexoBezerroVal = sexoDaDescricao(e.descricao).toLowerCase()
    const sexoOk = filtroSexoBezerro === '' || sexoBezerroVal.includes(filtroSexoBezerro.toLowerCase())
    return brincoOk && sexoOk
  })

  const itensPagina = listaFiltrada.slice((pagina - 1) * ITENS_POR_PAGINA, pagina * ITENS_POR_PAGINA)

  const carregar = () => {
    syncApi.baixar()
      .then(({ data }) => {
        setPartos(data.eventos.filter((e) => e.tipo?.toLowerCase() === 'parto'))
        setAnimais(data.animais)
        setPagina(1)
      })
      .catch(() => alert('Erro ao carregar partos'))
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
        data: r.data.data ?? '',
        sexo_bezerro: sexoDaDescricao(r.data.descricao).toLowerCase() === 'femea' ? 'femea' : 'macho',
      })
      setModalAberto(true)
    }).catch(() => alert('Erro ao buscar parto'))
  }

  const deletar = (id) => {
    if (!confirm('Deletar este registro de parto?')) return
    eventosApi.deletar(id)
      .then(() => carregar())
      .catch(() => alert('Erro ao deletar'))
  }

  const salvar = (e) => {
    e.preventDefault()
    const sexoLabel = form.sexo_bezerro === 'femea' ? 'Femea' : 'Macho'
    const payload = {
      animal_id: form.animal_id,
      tipo: 'parto',
      data: form.data,
      descricao: `Filhote: ${sexoLabel}`,
      matriz_id: null,
      touri_id: null,
    }
    const chamada = editandoId
      ? eventosApi.atualizar(editandoId, payload)
      : eventosApi.criar(payload)

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
        <h1>Partos</h1>
        <button className="btn btn-primary" onClick={abrirNovo}>+ Novo Parto</button>
      </div>

      <div className="filtros">
        <input
          className="filtro-input"
          placeholder="Buscar por brinco da matriz..."
          value={filtroBrinco}
          onChange={onFiltroChange(setFiltroBrinco)}
        />
        <select
          className="filtro-select"
          value={filtroSexoBezerro}
          onChange={onFiltroChange(setFiltroSexoBezerro)}
        >
          <option value="">Todos os sexos</option>
          <option value="femea">Fêmea</option>
          <option value="macho">Macho</option>
        </select>
      </div>

      <div className="tabela-wrapper">
        {listaFiltrada.length === 0 ? (
          <p className="vazio">{partos.length === 0 ? 'Nenhum parto cadastrado.' : 'Nenhum parto encontrado para o filtro.'}</p>
        ) : (
          <>
          <table>
            <thead>
              <tr>
                <th>Brinco da Matriz</th>
                <th>Data</th>
                <th>Sexo do Bezerro</th>
                <th>Brinco do Bezerro</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {itensPagina.map((e) => (
                <tr key={e.id}>
                  <td>{brincoDoAnimal(e.animal_id)}</td>
                  <td>{e.data}</td>
                  <td>{sexoDaDescricao(e.descricao)}</td>
                  <td>{brincoBezerro(e)}</td>
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
        <Modal titulo={editandoId ? 'Editar Parto' : 'Novo Parto'} onFechar={() => setModalAberto(false)}>
          <form className="form" onSubmit={salvar}>
            <div className="campo">
              <label>Vaca (Brinco) *</label>
              <select name="animal_id" value={form.animal_id} onChange={onChange} required>
                <option value="">Selecione uma vaca</option>
                {vacas.map((a) => (
                  <option key={a.id} value={a.id}>{a.brinco}</option>
                ))}
              </select>
            </div>
            <div className="campo">
              <label>Data do Parto *</label>
              <input type="date" name="data" value={form.data} onChange={onChange} required />
            </div>
            <div className="campo">
              <label>Sexo do Bezerro *</label>
              <select name="sexo_bezerro" value={form.sexo_bezerro} onChange={onChange}>
                <option value="macho">Macho</option>
                <option value="femea">Fêmea</option>
              </select>
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
