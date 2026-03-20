# Quick Start Guide

## 🚀 Começar Agora

### Usando Docker (Recomendado)

1. **Certifique-se de ter Docker e Docker Compose instalados**
   ```bash
   docker --version
   docker-compose --version
   ```

2. **Navegue até a pasta do projeto**
   ```bash
   cd c:\Users\PC\Desktop\projeto
   ```

3. **Inicie todos os serviços**
   ```bash
   docker-compose up --build
   ```

4. **Acesse a aplicação**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Banco de Dados: localhost:5432

### Sem Docker (Desenvolvimento Local)

#### 1. Instalar PostgreSQL

- Download: https://www.postgresql.org/download/windows/
- Durante instalação, anote a senha do usuario `postgres`
- Porta padrão: 5432

#### 2. Backend

```bash
cd backend
npm install
npm run dev
```

Saída esperada: `Server running on port 3001`

#### 3. Frontend (novo terminal)

```bash
cd frontend
npm install
npm run dev
```

Saída esperada: `Local: http://localhost:5173/`

#### 4. Banco de Dados

Execute schema em uma ferramenta como pgAdmin ou:
```bash
psql -U postgres -h localhost
\c mini_erp
\i '.../backend/src/db/schema.sql'
```

---

## 🧪 Testando a Aplicação

### 1. Criar conta
- Acesse http://localhost:3000
- Clique em "Sign Up"
- Preencha: Nome, Email, Senha (6+ caracteres)
- Clique em "Sign Up"

### 2. Dashboard
- Você será redirecionado para o dashboard
- Verá: Total de Produtos, Valor em Estoque, Alertas

### 3. Cadastrar Produto
- Clique em "Go to Products"
- Clique em "Add New Product"
- Preencha:
  - Product Name: ex. "T-Shirt"
  - Product Code: ex. "SKU-001"
  - Category: ex. "Clothing"
  - Sale Price: ex. "49.90" ⚠ Obrigatório
  - Quantity: ex. "50"
  - Min Stock: ex. "10"
- Clique "Register Product"

### 4. Testar Isolação de Dados
- Abra http://localhost:3000 em **outro navegador/aba privada**
- Faça login com **outro email**
- Cadastre produtos diferentes
- Volte ao primeiro navegador
- ✅ Seus produtos não aparecem na outra conta!

---

## 📋 Variáveis de Ambiente

Arquivo `.env` na raiz do projeto:

```env
# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mini_erp
DB_USER=postgres
DB_PASSWORD=postgres

# JWT
JWT_SECRET=sua_chave_secreta_aqui
JWT_EXPIRY=7d

# Node
NODE_ENV=development

# URLs
REACT_APP_API_URL=http://localhost:3001/api
FRONTEND_URL=http://localhost:3000
```

> ⚠️ Em produção, mude `JWT_SECRET` para uma chave aleatória forte!

---

## 🔍 Verificar Logs

### Com Docker
```bash
# Todos os serviços
docker-compose logs

# Apenas backend
docker-compose logs backend

# Apenas frontend
docker-compose logs frontend

# Apenas banco
docker-compose logs postgres
```

### Localmente
- Backend: Mensagens no terminal onde rodou `npm run dev`
- Frontend: http://localhost:5173 (abre automaticamente)

---

## 🛑 Parar a Aplicação

### Docker
```bash
docker-compose down
```

### Localmente
- Terminal 1 (Backend): Ctrl + C
- Terminal 2 (Frontend): Ctrl + C

---

## 📦 Estrutura de Arquivos Criada

```
projeto/
├── backend/
│   ├── src/
│   │   ├── middleware/auth.ts
│   │   ├── routes/auth.ts
│   │   ├── routes/products.ts
│   │   ├── services/authService.ts
│   │   ├── services/productService.ts
│   │   ├── db/index.ts
│   │   ├── db/schema.sql
│   │   └── server.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── SignupForm.tsx
│   │   │   └── ProductForm.tsx
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── ProductsPage.tsx
│   │   │   └── DashboardPage.tsx
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   └── productService.ts
│   │   ├── store/authStore.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   └── .env
├── docker-compose.yml
├── .env
├── .gitignore
├── .editorconfig
└── README.md
```

---

## 🆘 Problemas Comuns

### "Porta 3000 já em uso"
```bash
# Matar processo na porta 3000 (Windows PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force
```

### "Falha ao conectar PostgreSQL"
1. Verifique se PostgreSQL está rodando:
   - Windows: Services → postgresql
   - Ou: `psql -U postgres` no cmd

2. Verifique credenciais em `.env`

3. Com Docker, recrie o volume:
   ```bash
   docker-compose down -v
   docker-compose up --build
   ```

### "Erro ao fazer login"
1. Limpe localStorage:
   ```javascript
   // No console do navegador (F12)
   localStorage.clear()
   location.reload()
   ```
2. Tente se registrar novamente

### "Permissão negada ao executar script"
```bash
# No PowerShell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 🎯 Próximas Funcionalidades (Fase 2)

- [ ] PDV (Ponto de Venda) mobile
- [ ] Registro de Receitas e Despesas
- [ ] Relatórios financeiros
- [ ] Controle de Clientes
- [ ] Códigos de barras e QR codes

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs: `docker-compose logs`
2. Limpe cache e cookies do navegador
3. Reinicie Docker: `docker-compose restart`
4. Reconstrua: `docker-compose down -v && docker-compose up --build`

---

**Pronto para começar? Execute `docker-compose up --build` ou `npm install && npm run dev` em cada pasta!** 🚀
