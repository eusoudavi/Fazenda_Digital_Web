# Fazenda Digital — Interface Web

Interface web para visualização e cadastro de dados do sistema Fazenda Digital, consumindo a API REST do projeto `Fazenda_Digital_API`.

## Tecnologias

- [React 18](https://react.dev/) com Vite
- [React Router v6](https://reactrouter.com/) — navegação entre páginas
- [Axios](https://axios-http.com/) — requisições HTTP

## Pré-requisitos

- Node.js 18+
- API `Fazenda_Digital_API`

## Instalação e execução

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev
```

Acesse em: `http://localhost:5173`

> O Vite redireciona automaticamente chamadas `/api/*` para `http://localhost:8080` via proxy — sem configuração adicional de CORS no frontend.

## Estrutura do projeto

```
src/
├── services/
│   └── api.js           # Instância do axios e métodos CRUD por entidade
├── components/
│   ├── Navbar.jsx        # Sidebar de navegação
│   ├── Modal.jsx         # Modal reutilizável para formulários
│   └── Paginacao.jsx     # Componente de paginação
└── pages/
    ├── Dashboard.jsx     # Resumo com contagem de cada entidade
    ├── Animais.jsx       # CRUD de animais (filtro por brinco e sexo)
    ├── Rebanhos.jsx      # CRUD de rebanhos
    ├── Pesagens.jsx      # CRUD de pesagens + aplicação de vacinas
    ├── Eventos.jsx       # CRUD de eventos reprodutivos
    ├── Vacinas.jsx       # CRUD de vacinas
    └── Vacinacoes.jsx    # CRUD de vacinações
```

## Funcionalidades

### Dashboard
Exibe cards com a contagem total de cada entidade cadastrada no sistema.

### Animais
- Listagem paginada com filtro por **brinco** e **sexo**
- Cadastro e edição: brinco, raça, sexo, data de nascimento, peso inicial, status e matriz

### Rebanhos
- Listagem paginada
- Cadastro e edição: nome, descrição, localização e cor

### Pesagens
- Listagem paginada com filtro por **brinco** e **sexo** do animal
- Ao registrar uma nova pesagem, é possível selecionar as **vacinas disponíveis** para aplicação simultânea — os registros de vacinação são criados automaticamente

### Eventos
- Listagem paginada com filtro por **brinco** e **sexo**
- Tipos disponíveis: Parto, Cobertura, Doença, Vacinação, Outro
- O formulário lista apenas **fêmeas** no seletor de animal

### Vacinas
- Tipos espelhados do app Flutter: Febre Aftosa, Brucelose, Clostridioses, Raiva, IBR/BVD, Leptospirose, Carbúnculo, Pasteureloses e Outra
- Flag **Em aplicação**: indica se a vacina está disponível para seleção nas pesagens
- Alerta visual na coluna Próxima Dose: laranja (vence em até 30 dias) e vermelho (vencida)

### Vacinações
- Registro do vínculo entre animal e vacina aplicada
- Pode ser criado manualmente ou automaticamente via tela de Pesagens

## Endpoints consumidos

Todos os endpoints seguem o padrão abaixo, onde `{recurso}` pode ser `animais`, `rebanhos`, `pesagens`, `eventos`, `vacinas` ou `vacinacoes`:

| Método | URL | Ação |
|--------|-----|------|
| GET | `/api/{recurso}/listAll` | Listagem |
| GET | `/api/{recurso}/{id}` | Busca por ID |
| POST | `/api/{recurso}/new` | Cadastro |
| PUT | `/api/{recurso}/{id}` | Atualização |
| DELETE | `/api/{recurso}/{id}` | Remoção |
