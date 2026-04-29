import { useState } from 'react'
import { animaisApi, rebanhoApi, pesagensApi, eventosApi, vacinasApi, vacinacoesApi, syncApi, pastosApi } from '../services/api'
import { exportarPDF, exportarXLSX } from '../services/exportar'

const TIPOS_VACINA = {
  aftosa: 'Febre Aftosa', brucelose: 'Brucelose', clostridioses: 'Clostridioses',
  raiva: 'Raiva', ibrBvd: 'IBR / BVD', leptospirose: 'Leptospirose',
  carbunculo: 'Carbúnculo', pasteureloses: 'Pasteureloses', outra: 'Outra',
}
const labelTipo = (v) => TIPOS_VACINA[v] ?? v

// Cada relatório define como buscar e montar os dados
function fmtArea(ha) {
  if (ha == null) return '—'
  return `${Number(ha).toFixed(2)} ha`
}

function fmtPerim(m) {
  if (m == null) return '—'
  return m >= 1000 ? `${(m / 1000).toFixed(2)} km` : `${Math.round(m)} m`
}

const RELATORIOS = [
  {
    id: 'pastos',
    titulo: 'Pastos',
    descricao: 'Listagem de pastos com área e perímetro.',
    colunas: ['Nome', 'Área', 'Perímetro', 'Criado em'],
    buscar: async () => {
      const { data } = await pastosApi.listarTodos()
      return data.map((p) => [
        p.nome ?? '—',
        fmtArea(p.area_ha),
        fmtPerim(p.perimetro_m),
        p.created_at ? p.created_at.slice(0, 10) : '—',
      ])
    },
  },
  {
    id: 'animais',
    titulo: 'Animais',
    descricao: 'Lista de animais com brinco, rebanho, sexo e peso atual.',
    colunas: ['Brinco', 'Rebanho', 'Sexo', 'Peso Atual (kg)'],
    buscar: async () => {
      const { data: sync } = await syncApi.baixar()

      // mapa animalId → nome do rebanho
      const mapaRebanhos = Object.fromEntries(sync.rebanhos.map((r) => [r.id, r.nome]))
      const mapaAnimalRebanho = {}
      for (const ra of (sync.rebanho_animais ?? [])) {
        mapaAnimalRebanho[ra.animal_id] = mapaRebanhos[ra.rebanho_id] ?? '—'
      }

      // peso mais recente por animal (pesagens ordenadas por data desc)
      const pesagensOrdenadas = [...(sync.pesagens ?? [])].sort((a, b) =>
        (b.data ?? '').localeCompare(a.data ?? '')
      )
      const mapaUltimoPeso = {}
      for (const p of pesagensOrdenadas) {
        if (!mapaUltimoPeso[p.animal_id]) mapaUltimoPeso[p.animal_id] = p.peso_kg
      }

      return sync.animais.map((a) => [
        a.brinco,
        mapaAnimalRebanho[a.id] ?? '—',
        a.sexo,
        mapaUltimoPeso[a.id] ?? '—',
      ])
    },
  },
  {
    id: 'rebanhos',
    titulo: 'Rebanhos',
    descricao: 'Lista de rebanhos com nome, localização e cor.',
    colunas: ['Nome', 'Localização', 'Cor', 'Descrição'],
    buscar: async () => {
      const { data } = await rebanhoApi.listarTodos()
      return data.map((r) => [r.nome, r.localizacao, r.cor, r.descricao ?? ''])
    },
  },
  {
    id: 'pesagens',
    titulo: 'Pesagens',
    descricao: 'Histórico de pesagens por animal com brinco, peso e data.',
    colunas: ['Brinco', 'Peso (kg)', 'Data', 'Observação'],
    buscar: async () => {
      const [resPesagens, resAnimais] = await Promise.all([
        pesagensApi.listarTodos(),
        animaisApi.listarTodos(),
      ])
      const mapa = Object.fromEntries(resAnimais.data.map((a) => [a.id, a.brinco]))
      return resPesagens.data.map((p) => [
        mapa[p.animal_id] ?? p.animal_id,
        p.peso_kg,
        p.data,
        p.observacao ?? '',
      ])
    },
  },
  {
    id: 'eventos',
    titulo: 'Partos',
    descricao: 'Registro de partos com brinco da matriz, data e sexo do bezerro nascido.',
    colunas: ['Brinco da Matriz', 'Data', 'Sexo do Bezerro', 'Brinco do Bezerro'],
    buscar: async () => {
      const { data: sync } = await syncApi.baixar()

      const mapaAnimais = Object.fromEntries(sync.animais.map((a) => [a.id, a]))

      // Bezerro registrado: animal com matrizId + dataNascimento coincidindo com o parto
      const mapaBezerros = {}
      for (const animal of sync.animais) {
        if (animal.matriz_id) {
          const chave = `${animal.matriz_id}_${(animal.data_nascimento ?? '').substring(0, 10)}`
          mapaBezerros[chave] = animal
        }
      }

      // O sexo do bezerro vem na descricao no formato "Filhote: Macho" / "Filhote: Femea"
      const sexoDaDescricao = (descricao) => {
        if (!descricao) return '—'
        const partes = descricao.split(':')
        return partes.length > 1 ? partes[1].trim() : descricao
      }

      return sync.eventos
        .filter((e) => e.tipo?.toLowerCase() === 'parto')
        .map((e) => {
          const matriz = mapaAnimais[e.animal_id]
          const dataEvento = (e.data ?? '').substring(0, 10)
          const bezerro = mapaBezerros[`${e.animal_id}_${dataEvento}`]
          const brincoBezerro = bezerro
            ? (bezerro.brinco ? bezerro.brinco : 'Sem brinco')
            : '—'
          return [
            matriz?.brinco ?? '—',
            e.data,
            sexoDaDescricao(e.descricao),
            brincoBezerro,
          ]
        })
    },
  },
  {
    id: 'vacinas',
    titulo: 'Vacinas',
    descricao: 'Cadastro de vacinas com tipo, lote, datas e status.',
    colunas: ['Tipo', 'Nome Comercial', 'Fabricante', 'Lote', 'Data Aplicação', 'Próxima Dose', 'Em Aplicação'],
    buscar: async () => {
      const { data } = await vacinasApi.listarTodos()
      return data.map((v) => [
        labelTipo(v.tipo),
        v.nome_comercial ?? '',
        v.fabricante ?? '',
        v.lote ?? '',
        v.data_aplicacao ?? '',
        v.proxima_dose ?? '',
        v.em_aplicacao === 1 ? 'Sim' : 'Não',
      ])
    },
  },
  {
    id: 'vacinacoes',
    titulo: 'Vacinações',
    descricao: 'Histórico de vacinas aplicadas por animal.',
    colunas: ['Brinco', 'Vacina', 'Data Aplicação'],
    buscar: async () => {
      const [resVacinacoes, resAnimais, resVacinas] = await Promise.all([
        vacinacoesApi.listarTodos(),
        animaisApi.listarTodos(),
        vacinasApi.listarTodos(),
      ])
      const mapaAnimais = Object.fromEntries(resAnimais.data.map((a) => [a.id, a.brinco]))
      const mapaVacinas = Object.fromEntries(resVacinas.data.map((v) => [v.id, v.tipo]))
      return resVacinacoes.data.map((v) => [
        mapaAnimais[v.animal_id] ?? v.animal_id,
        labelTipo(mapaVacinas[v.vacina_id] ?? v.vacina_id),
        v.data_aplicacao,
      ])
    },
  },
]

export default function Relatorios() {
  const [carregando, setCarregando] = useState({})

  const exportar = async (relatorio, formato) => {
    const chave = `${relatorio.id}-${formato}`
    setCarregando((prev) => ({ ...prev, [chave]: true }))
    try {
      if (formato === 'pdf' && relatorio.gerarPdf) {
        await relatorio.gerarPdf()
        return
      }
      const linhas = await relatorio.buscar()
      if (linhas.length === 0) {
        alert(`Nenhum dado encontrado para o relatório de ${relatorio.titulo}.`)
        return
      }
      if (formato === 'pdf') {
        exportarPDF(relatorio.titulo, relatorio.colunas, linhas)
      } else {
        exportarXLSX(relatorio.titulo, relatorio.colunas, linhas)
      }
    } catch {
      alert(`Erro ao gerar relatório de ${relatorio.titulo}.`)
    } finally {
      setCarregando((prev) => ({ ...prev, [chave]: false }))
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Relatórios</h1>
      </div>

      <div className="relatorios-grid">
        {RELATORIOS.map((rel) => (
          <div key={rel.id} className="relatorio-card">
            <div className="relatorio-info">
              <h3>{rel.titulo}</h3>
              <p>{rel.descricao}</p>
            </div>
            <div className="relatorio-acoes">
              <button
                className="btn btn-export-pdf"
                onClick={() => exportar(rel, 'pdf')}
                disabled={carregando[`${rel.id}-pdf`]}
              >
                {carregando[`${rel.id}-pdf`] ? 'Gerando...' : 'PDF'}
              </button>
              <button
                className="btn btn-export-xlsx"
                onClick={() => exportar(rel, 'xlsx')}
                disabled={carregando[`${rel.id}-xlsx`]}
              >
                {carregando[`${rel.id}-xlsx`] ? 'Gerando...' : 'XLSX'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
