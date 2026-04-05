import axios from 'axios'

// Todas as chamadas vão para /api/... e o Vite proxy redireciona para localhost:8080
const http = axios.create({ baseURL: '/api' })

// Fábrica que cria os métodos CRUD para um recurso
const crud = (recurso) => ({
  listarTodos: () => http.get(`/${recurso}/listAll`),
  buscarPorId: (id) => http.get(`/${recurso}/${id}`),
  criar: (dados) => http.post(`/${recurso}/new`, dados),
  atualizar: (id, dados) => http.put(`/${recurso}/${id}`, dados),
  deletar: (id) => http.delete(`/${recurso}/${id}`),
})

export const syncApi = { baixar: () => http.get('/sync') }

export const animaisApi = crud('animais')
export const rebanhoApi = crud('rebanhos')
export const pesagensApi = crud('pesagens')
export const eventosApi = crud('eventos')
export const vacinasApi = crud('vacinas')
export const vacinacoesApi = crud('vacinacoes')
