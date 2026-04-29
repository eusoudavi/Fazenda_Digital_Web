# Fazenda Digital — Interface Web

Interface web para visualização e cadastro de dados do sistema Fazenda Digital, consumindo a API REST do projeto `Fazenda_Digital_API`.

## Stack

- **React 18** com Vite
- **React Router v6** — navegação entre páginas com rotas protegidas
- **Axios** — requisições HTTP com interceptor JWT automático
- **jsPDF** + **jspdf-autotable** — exportação de relatórios em PDF
- **SheetJS (xlsx)** — exportação de relatórios em XLSX

## Pré-requisitos

- Node.js 18+
- API `Fazenda_Digital_API` rodando em `http://localhost:8080`

## Instalação e execução

```bash
npm install
npm run dev
```

Acesse em `http://localhost:5173`.

O Vite redireciona automaticamente chamadas `/api/*` para `http://localhost:8080` via proxy — sem configuração adicional de CORS no frontend.

## Autenticação

O acesso a todas as páginas exige login. Usuários não autenticados são redirecionados automaticamente para `/login`.

**Fluxo:**
1. Usuário acessa qualquer rota → redirecionado para `/login` se não autenticado
2. Preenche e-mail e senha → `POST /api/auth/login`
3. Token JWT salvo em `localStorage`
4. Todas as requisições Axios enviam `Authorization: Bearer <token>` automaticamente
5. Em caso de resposta `401`, o token é removido e o usuário é redirecionado para `/login`

**Logout:** botão "Sair" no rodapé da sidebar — exibe nome do usuário logado.

## Estrutura do Projeto

```
src/
├── contexts/
│   └── AuthContext.jsx      # Token e dados do usuário em localStorage; login() e logout()
├── services/
│   ├── api.js               # Axios com interceptores de request (JWT) e response (401 → /login)
│   └── exportar.js          # exportarPDF() e exportarXLSX()
├── components/
│   ├── Navbar.jsx            # Sidebar com links, nome do usuário e botão Sair
│   ├── Modal.jsx             # Modal reutilizável para formulários
│   └── Paginacao.jsx         # Paginação com ellipsis e info "X–Y de Z"
└── pages/
    ├── Login.jsx             # Tela de login (e-mail + senha)
    ├── Dashboard.jsx         # Cards com totais de cada entidade
    ├── Usuarios.jsx          # CRUD de usuários (filtro por nome e perfil)
    ├── Fazendas.jsx          # CRUD de fazendas (filtro por nome, toggle ativa/inativa)
    ├── Animais.jsx           # CRUD de animais (filtro por brinco e sexo)
    ├── Rebanhos.jsx          # CRUD de rebanhos
    ├── Pesagens.jsx          # CRUD de pesagens + seleção de vacinas disponíveis
    ├── Eventos.jsx           # CRUD de partos (filtro por brinco da matriz e sexo do bezerro)
    ├── Vacinas.jsx           # CRUD de vacinas com alerta visual de próxima dose
    ├── Vacinacoes.jsx        # CRUD de vacinações
    └── Relatorios.jsx        # Exportação de relatórios em PDF e XLSX
```

## Funcionalidades

### Login
Tela pública (`/login`) com campos de e-mail e senha. Redireciona para o Dashboard após autenticação bem-sucedida.

### Dashboard
Cards com a contagem total de cada entidade cadastrada no sistema.

### Usuários
- Listagem paginada com filtro por **nome** e **perfil**
- Perfis disponíveis: Administrador, Proprietário, Administrador de Fazenda, Funcionário, Veterinário
- Campo senha oculto na edição (deixar em branco para manter a senha atual)
- Toggle ativo/inativo

### Fazendas
- Listagem paginada com filtro por **nome**
- Campos: nome, CNPJ, localização
- Status **Ativa** (verde) / **Inativa** (vermelho) com toggle no formulário

### Animais
- Listagem paginada com filtro por **brinco** e **sexo**
- Cadastro e edição: brinco, raça, sexo, data de nascimento, peso inicial, status e matriz

### Rebanhos
- Listagem paginada
- Cadastro e edição: nome, descrição, localização e cor

### Pesagens
- Listagem paginada com filtro por **brinco** e **sexo** do animal
- Ao registrar uma nova pesagem, é possível selecionar as **vacinas disponíveis** (`em_aplicacao = 1`) para aplicação simultânea

### Partos
- Listagem paginada com filtro por **brinco da matriz** e **sexo do bezerro**
- Colunas: Brinco da Matriz, Data, Sexo do Bezerro, Brinco do Bezerro (quando já cadastrado)
- Formulário lista apenas **fêmeas** no seletor de animal
- Sexo armazenado na descrição do evento como `Filhote: Macho` / `Filhote: Femea`

### Vacinas
- Tipos: Febre Aftosa, Brucelose, Clostridioses, Raiva, IBR/BVD, Leptospirose, Carbúnculo, Pasteureloses, Outra
- Flag **Em aplicação** — controla disponibilidade nas pesagens
- Alerta visual na coluna Próxima Dose: laranja (≤ 30 dias) e vermelho (vencida)

### Vacinações
- Registro do vínculo entre animal e vacina aplicada
- Pode ser criado manualmente ou via tela de Pesagens

### Relatórios
Exportação em **PDF** ou **XLSX**:

| Relatório | Colunas |
|-----------|---------|
| Animais | Brinco, Rebanho, Sexo, Peso Atual (kg) |
| Rebanhos | Nome, Localização, Cor, Descrição |
| Pesagens | Brinco, Peso (kg), Data, Observação |
| Partos | Brinco da Matriz, Data, Sexo do Bezerro, Brinco do Bezerro |
| Vacinas | Tipo, Nome Comercial, Fabricante, Lote, Data Aplicação, Próxima Dose, Em Aplicação |
| Vacinações | Brinco, Vacina, Data Aplicação |

## Endpoints consumidos

| Método | URL | Uso |
|--------|-----|-----|
| `POST` | `/api/auth/login` | Autenticação |
| `GET` | `/api/sync` | Snapshot completo (relatórios, partos) |
| `GET` | `/api/{recurso}/listAll` | Listagem |
| `GET` | `/api/{recurso}/{id}` | Busca por ID (formulário de edição) |
| `POST` | `/api/{recurso}/new` | Cadastro |
| `PUT` | `/api/{recurso}/{id}` | Atualização |
| `DELETE` | `/api/{recurso}/{id}` | Remoção |

Recursos disponíveis: `usuarios`, `fazendas`, `animais`, `rebanhos`, `pesagens`, `eventos`, `vacinas`, `vacinacoes`.
