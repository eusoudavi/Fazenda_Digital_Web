# Fazenda Digital — Interface Web

Interface web para visualização e cadastro de dados do sistema Fazenda Digital, consumindo a API REST do projeto `Fazenda_Digital_API`.

## Tecnologias

- [React 18](https://react.dev/) com Vite
- [React Router v6](https://reactrouter.com/) — navegação entre páginas
- [Axios](https://axios-http.com/) — requisições HTTP
- [jsPDF](https://github.com/parallax/jsPDF) + [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable) — exportação de relatórios em PDF
- [SheetJS (xlsx)](https://sheetjs.com/) — exportação de relatórios em XLSX

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
│   ├── api.js           # Instância do axios e métodos CRUD por entidade
│   └── exportar.js      # Funções de exportação PDF e XLSX
├── components/
│   ├── Navbar.jsx        # Sidebar de navegação
│   ├── Modal.jsx         # Modal reutilizável para formulários
│   └── Paginacao.jsx     # Componente de paginação
└── pages/
    ├── Dashboard.jsx     # Resumo com contagem de cada entidade
    ├── Animais.jsx       # CRUD de animais (filtro por brinco e sexo)
    ├── Rebanhos.jsx      # CRUD de rebanhos
    ├── Pesagens.jsx      # CRUD de pesagens + aplicação de vacinas
    ├── Eventos.jsx       # CRUD de partos (filtro por brinco da matriz e sexo do bezerro)
    ├── Vacinas.jsx       # CRUD de vacinas
    ├── Vacinacoes.jsx    # CRUD de vacinações
    └── Relatorios.jsx    # Exportação de relatórios em PDF e XLSX
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

### Partos
- Listagem paginada com filtro por **brinco da matriz** e **sexo do bezerro**
- Colunas: Brinco da Matriz, Data, Sexo do Bezerro, Brinco do Bezerro (quando já cadastrado)
- O formulário lista apenas **fêmeas** no seletor de animal
- O sexo do bezerro é armazenado na descrição do evento no formato `Filhote: Macho` / `Filhote: Femea`

### Vacinas
- Tipos espelhados do app Flutter: Febre Aftosa, Brucelose, Clostridioses, Raiva, IBR/BVD, Leptospirose, Carbúnculo, Pasteureloses e Outra
- Flag **Em aplicação**: indica se a vacina está disponível para seleção nas pesagens
- Alerta visual na coluna Próxima Dose: laranja (vence em até 30 dias) e vermelho (vencida)

### Vacinações
- Registro do vínculo entre animal e vacina aplicada
- Pode ser criado manualmente ou automaticamente via tela de Pesagens

### Relatórios
Exportação de dados em **PDF** ou **XLSX** para os seguintes módulos:

| Relatório | Colunas |
|-----------|---------|
| Animais | Brinco, Rebanho, Sexo, Peso Atual (kg) |
| Rebanhos | Nome, Localização, Cor, Descrição |
| Pesagens | Brinco, Peso (kg), Data, Observação |
| Partos | Brinco da Matriz, Data, Sexo do Bezerro, Brinco do Bezerro |
| Vacinas | Tipo, Nome Comercial, Fabricante, Lote, Data Aplicação, Próxima Dose, Em Aplicação |
| Vacinações | Brinco, Vacina, Data Aplicação |

## Endpoints consumidos

Todos os endpoints seguem o padrão abaixo, onde `{recurso}` pode ser `animais`, `rebanhos`, `pesagens`, `eventos`, `vacinas` ou `vacinacoes`:

| Método | URL | Ação |
|--------|-----|------|
| GET | `/api/sync` | Snapshot completo de todas as entidades |
| GET | `/api/{recurso}/listAll` | Listagem |
| GET | `/api/{recurso}/{id}` | Busca por ID |
| POST | `/api/{recurso}/new` | Cadastro |
| PUT | `/api/{recurso}/{id}` | Atualização |
| DELETE | `/api/{recurso}/{id}` | Remoção |
