import axios from 'axios'

// Todas as chamadas vão para /api/... e o Vite proxy redireciona para localhost:8080
const http = axios.create({ baseURL: '/api' })

// Injeta o token JWT em todas as requisições
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('fazenda_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Redireciona para /login em caso de 401
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('fazenda_token')
      localStorage.removeItem('fazenda_usuario')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Fábrica que cria os métodos CRUD para um recurso
const crud = (recurso) => ({
  listarTodos: () => http.get(`/${recurso}/listAll`),
  buscarPorId: (id) => http.get(`/${recurso}/${id}`),
  criar: (dados) => http.post(`/${recurso}/new`, dados),
  atualizar: (id, dados) => http.put(`/${recurso}/${id}`, dados),
  deletar: (id) => http.delete(`/${recurso}/${id}`),
})

export const authApi = {
  login: (dados) => http.post('/auth/login', dados),
}

export const syncApi = { baixar: () => http.get('/sync') }

export const usuariosApi = crud('usuarios')
export const fazendasApi = crud('fazendas')
export const animaisApi = crud('animais')
export const rebanhoApi = crud('rebanhos')
export const pesagensApi = crud('pesagens')
export const eventosApi = crud('eventos')
export const vacinasApi = crud('vacinas')
export const vacinacoesApi = crud('vacinacoes')
export const pastosApi = crud('pastos')
