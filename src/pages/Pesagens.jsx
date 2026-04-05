import { useEffect, useState } from 'react'
import { pesagensApi, animaisApi, vacinasApi, vacinacoesApi } from '../services/api'
import Modal from '../components/Modal'
import Paginacao from '../components/Paginacao'

const ITENS_POR_PAGINA = 10

const FORM_INICIAL = { animal_id: '', peso_kg: '', data: '', observacao: '' }

const TIPOS_VACINA = {
  aftosa: 'Febre Aftosa', brucelose: 'Brucelose', clostridioses: 'Clostridioses',
  raiva: 'Raiva', ibrBvd: 'IBR / BVD', leptospirose: 'Leptospirose',
  carbunculo: 'Carbúnculo', pasteureloses: 'Pasteureloses', outra: 'Outra',
}
const labelTipo = (v) => TIPOS_VACINA[v] ?? v

export default function Pesagens() {
  const [lista, setLista] = useState([])
  const [animais, setAnimais] = useState([])
  const [vacinas, setVacinas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)
  const [editandoId, setEditandoId] = useState(null)
  const [form, setForm] = useState(FORM_INICIAL)
  const [vacinasSelecionadas, setVacinasSelecionadas] = useState(new Set())
  const [pagina, setPagina] = useState(1)
  const [filtroBrinco, setFiltroBrinco] = useState('')
  const [filtroSexo, setFiltroSexo] = useState('')

  const brincoDoAnimal = (animal_id) => {
    const animal = animais.find((a) => a.id === animal_id)
    return animal ? animal.brinco : animal_id
  }

  const sexoDoAnimal = (animal_id) => {
    const animal = animais.find((a) => a.id === animal_id)
    return animal?.sexo?.toLowerCase() ?? ''
  }

  const listaFiltrada = lista.filter((p) => {
    const brincoOk = brincoDoAnimal(p.animal_id).toLowerCase().includes(filtroBrinco.toLowerCase())
    const sexoOk = filtroSexo === '' || sexoDoAnimal(p.animal_id) === filtroSexo.toLowerCase()
    return brincoOk && sexoOk
  })

  const itensPagina = listaFiltrada.slice((pagina - 1) * ITENS_POR_PAGINA, pagina * ITENS_POR_PAGINA)

  const carregar = () => {
    Promise.all([pesagensApi.listarTodos(), animaisApi.listarTodos(), vacinasApi.listarTodos()])
      .then(([resPesagens, resAnimais, resVacinas]) => {
        setLista(resPesagens.data)
        setAnimais(resAnimais.data)
        setVacinas(resVacinas.data.filter((v) => v.em_aplicacao === 1))
        setPagina(1)
      })
      .catch(() => alert('Erro ao carregar pesagens'))
      .finally(() => setCarregando(false))
  }

  useEffect(() => { carregar() }, [])

  const abrirNovo = () => {
    setEditandoId(null)
    setForm(FORM_INICIAL)
    setVacinasSelecionadas(new Set())
    setModalAberto(true)
  }

  const toggleVacina = (id) => {
    setVacinasSelecionadas((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const abrirEditar = (id) => {
    pesagensApi.buscarPorId(id).then((r) => {
      setEditandoId(id)
      setForm({
        animal_id: r.data.animal_id ?? '',
        peso_kg: r.data.peso_kg ?? '',
        data: r.data.data ?? '',
        observacao: r.data.observacao ?? '',
      })
      setModalAberto(true)
    }).catch(() => alert('Erro ao buscar pesagem'))
  }

  const deletar = (id) => {
    if (!confirm('Deletar esta pesagem?')) return
    pesagensApi.deletar(id)
      .then(() => carregar())
      .catch(() => alert('Erro ao deletar'))
  }

  const salvar = async (e) => {
    e.preventDefault()
    const payload = { ...form, peso_kg: Number(form.peso_kg) }

    try {
      if (editandoId) {
        await pesagensApi.atualizar(editandoId, payload)
      } else {
        await pesagensApi.criar(payload)
        if (vacinasSelecionadas.size > 0) {
          await Promise.all(
            [...vacinasSelecionadas].map((vacinaId) =>
              vacinacoesApi.criar({
                animal_id: form.animal_id,
                vacina_id: vacinaId,
                data_aplicacao: form.data,
              })
            )
          )
        }
      }
      setModalAberto(false)
      carregar()
    } catch {
      alert('Erro ao salvar')
    }
  }

  const onChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const onFiltroChange = (setter) => (e) => { setter(e.target.value); setPagina(1) }

  if (carregando) return <p className="carregando">Carregando...</p>

  return (
    <div>
      <div className="page-header">
        <h1>Pesagens</h1>
        <button className="btn btn-primary" onClick={abrirNovo}>+ Nova Pesagem</button>
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
          <p className="vazio">{lista.length === 0 ? 'Nenhuma pesagem cadastrada.' : 'Nenhuma pesagem encontrada para o filtro.'}</p>
        ) : (
          <>
          <table>
            <thead>
              <tr>
                <th>Brinco</th>
                <th>Peso (kg)</th>
                <th>Data</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {itensPagina.map((p) => (
                <tr key={p.id}>
                  <td>{brincoDoAnimal(p.animal_id)}</td>
                  <td>{p.peso_kg}</td>
                  <td>{p.data}</td>
                  <td>
                    <div className="acoes">
                      <button className="btn btn-secondary" onClick={() => abrirEditar(p.id)}>Editar</button>
                      <button className="btn btn-danger" onClick={() => deletar(p.id)}>Deletar</button>
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
        <Modal titulo={editandoId ? 'Editar Pesagem' : 'Nova Pesagem'} onFechar={() => setModalAberto(false)}>
          <form className="form" onSubmit={salvar}>
            <div className="campo">
              <label>Animal (Brinco)</label>
              <select name="animal_id" value={form.animal_id} onChange={onChange} required>
                <option value="">Selecione um animal</option>
                {animais.map((a) => (
                  <option key={a.id} value={a.id}>{a.brinco}</option>
                ))}
              </select>
            </div>
            <div className="campo">
              <label>Peso (kg)</label>
              <input type="number" step="0.1" name="peso_kg" value={form.peso_kg} onChange={onChange} required />
            </div>
            <div className="campo">
              <label>Data</label>
              <input type="date" name="data" value={form.data} onChange={onChange} required />
            </div>
            <div className="campo">
              <label>Observação</label>
              <textarea name="observacao" value={form.observacao} onChange={onChange} rows={3} />
            </div>

            {!editandoId && (
              <>
                <div className="form-secao">Vacinas aplicadas</div>
                {vacinas.length === 0 ? (
                  <p style={{ fontSize: 13, color: '#999' }}>Nenhuma vacina disponível no momento.</p>
                ) : (
                  <div className="vacinas-checkboxes">
                    {vacinas.map((v) => (
                      <label key={v.id} className="vacina-check">
                        <input
                          type="checkbox"
                          checked={vacinasSelecionadas.has(v.id)}
                          onChange={() => toggleVacina(v.id)}
                        />
                        <span>
                          <strong>{labelTipo(v.tipo)}</strong>
                          {v.nome_comercial && <small>{v.nome_comercial}</small>}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </>
            )}

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
