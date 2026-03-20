# Mini ERP - Solução Web para Lojistas

Um Mini ERP web, modular e responsivo, voltado para pequenos lojistas. Permite controle financeiro, gestão de estoque, registro de vendas, cadastro de clientes e fornecedores.

## 🚀 Características

- **User Registration & Login**: Cada usuário tem seu próprio ambiente isolado
- **Product Management**: Cadastro, edição e exclusão de produtos
- **Inventory Control**: Controle de estoque com alertas de baixo estoque
- **Dashboard**: Visualização rápida de métricas importantes
- **Responsive Design**: Funciona em mobile, tablet e desktop
- **Secure Authentication**: JWT com senhas criptografadas

## 📋 Pré-requisitos

- **Node.js** >= 18
- **Docker** e **Docker Compose** (para containerização)
- **PostgreSQL** 15+ (se executar localmente sem Docker)

## 🔧 Instalação

### Opção 1: Com Docker (Recomendado)

1. Clone ou copie o repositório
2. Crie um arquivo `.env` (copie de `.env.example` se necessário):
   ```bash
   cp backend/.env.example .env
   ```
3. Inicie os serviços:
   ```bash
   docker-compose up --build
   ```
4. Acesse:
   - **Frontend**: http://localhost:3000
   - **Backend**: http://localhost:3001
   - **PostgreSQL**: localhost:5432

### Opção 2: Instalação Local

#### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

#### Frontend (em outro terminal)

```bash
cd frontend
npm install
npm run dev
```

#### Banco de Dados

Configure PostgreSQL localmente e execute:
```bash
psql -U postgres -h localhost -d mini_erp -f backend/src/db/schema.sql
```

## 📚 Estrutura do Projeto

```
projeto/
├── backend/
│   ├── src/
│   │   ├── middleware/      # Auth middleware
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── db/              # Database config
│   │   └── server.ts        # Express app
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API calls
│   │   ├── store/           # Zustand state
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.ts
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
└── .env
```

## 🔐 Autenticação

A aplicação utiliza **JWT (JSON Web Tokens)** para autenticação:

1. **Signup**: Cria novo usuário com senha criptografada
2. **Login**: Retorna JWT token válido por 7 dias
3. **Requisições**: Token enviado no header `Authorization: Bearer <token>`

## 🗄️ Banco de Dados

### Tabelas Principais

- **users**: Usuários da plataforma
- **companies**: Empresa vinculada ao usuário (1:1)
- **products**: Produtos (isolados por user_id)
- **clients**: Clientes
- **suppliers**: Fornecedores
- **sales**: Vendas
- **entries**: Compras e despesas
- **returns**: Trocas e devoluções

Cada usuário vê apenas seus dados através da coluna `user_id`.

## 📱 Responsividade

- **Mobile** (<768px): Layout otimizado para celular
- **Tablet** (768-1023px): Layout ajustado
- **Desktop** (≥1024px): Layout completo

## 🔗 API Endpoints

### Autenticação
- `POST /api/auth/register` - Registrar novo usuário
- `POST /api/auth/login` - Fazer login

### Produtos
- `GET /api/products` - Listar todos os produtos do usuário
- `POST /api/products` - Criar novo produto
- `GET /api/products/:id` - Obter detalhes do produto
- `PUT /api/products/:id` - Atualizar produto
- `DELETE /api/products/:id` - Deletar produto
- `GET /api/products/low-stock` - Listar produtos com estoque baixo

## 🚢 Deploy

### Docker Compose
```bash
docker-compose up -d
```

### Variaveis de Ambiente Importantes
```env
DB_HOST=seu_host_postgres
DB_NAME=mini_erp
DB_USER=postgres
DB_PASSWORD=senha_segura
JWT_SECRET=chave_super_secreta_em_producao
FRONTEND_URL=https://seu-dominio.com
```

## 📝 Fluxo de Uso

### Novo Usuário
1. Acessa http://localhost:3000
2. Clica em "Sign up"
3. Preenche nome, email e senha
4. Sistema cria usuario e empresa automaticamente
5. Redireciona para dashboard

### Cadastrar Produto
1. Na página de Produtos, clica "Add New Product"
2. Preenche dados (nome, código, preço de venda obrigatório)
3. Submete o formulário
4. Produto aparece na listagem

### Visualizar Dashboard
1. Lista produtos cadastrados
2. Mostra valor total em estoque
3. Alertas de produtos com estoque baixo
4. Link para gerenciar inventário

## 🧪 Testes

Para testar a isolação de dados entre usuários:
1. Abra dois navegadores/abas
2. Crie/login com usuários diferentes
3. Cadastre produtos em cada um
4. Verifique que cada um vê apenas seus produtos

## 🐛 Troubleshooting

**Erro de conexão ao PostgreSQL**
- Verifique se PostgreSQL está rodando
- Confira credenciais em `.env`
- Para Docker: `docker-compose logs postgres`

**Token inválido no login**
- Limpe localStorage: `localStorage.clear()`
- Verifique JWT_SECRET em `.env`

**Produtos não aparecem**
- Verifique que está logado
- Confira console de erros (F12)
- Verifique logs do backend: `docker-compose logs backend`

## 📦 Dependências Principais

**Backend**
- Express.js - Framework web
- PostgreSQL - Banco de dados
- JWT - Autenticação
- bcrypt - Hash de senhas

**Frontend**
- React 18 - UI framework
- Vite - Build tool
- Zustand - State management
- Axios - HTTP client
- React Router - Navegação

## 📄 Licença

Este projeto é parte do curso de Análise e Desenvolvimento de Sistemas no Centro Universitário Uniftec.

## 👥 Autores

- Laís Peroni
- Nilton Cezar Oliveira dos Santos
- Vitor Giovane Laguna de Souza

Orientadora: Prof. Ms. Stéfani Mano Valmini

---

**Status**: MVP - User Registration + Product Management + Basic Dashboard
