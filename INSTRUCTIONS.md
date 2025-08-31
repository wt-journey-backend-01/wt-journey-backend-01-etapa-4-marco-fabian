# Instruções de Execução

## 1) Banco de Dados (Docker)
- Crie `.env` na raiz com:
  - POSTGRES_USER=postgres
  - POSTGRES_PASSWORD=postgres
  - POSTGRES_DB=policia_db
  - NODE_ENV=development
  - JWT_SECRET=wt_journey_backend_secret_key_2024_marco_fabian
  - JWT_EXPIRES_IN=24h
- Suba: `docker compose up -d`

## 2) Dependências
- `npm install`

## 3) Migrations
- `npx knex migrate:latest`

## 4) Seeds
- `npx knex seed:run` (executa todos os seeds na ordem: usuários, agentes, casos)

**Usuários criados automaticamente:**
- **admin@policia.gov.br** / **Admin123!** (Administrador do Sistema)
- **user@policia.gov.br** / **User456@** (Usuário Padrão)  
- **teste@policia.gov.br** / **Test789#** (Teste de Sistema)

## 5) API
- `npm run start`
- Swagger: http://localhost:3000/docs

## 🔐 Sistema de Autenticação

### Endpoints Públicos (não precisam de token)
- `POST /auth/register` - Registrar novo usuário
- `POST /auth/login` - Fazer login
- `POST /auth/logout` - Fazer logout

### Endpoints Protegidos (precisam de token JWT)
- `GET /usuarios` - Listar todos os usuários
- `DELETE /usuarios/:id` - Deletar usuário
- `GET /usuarios/me` - Obter perfil do usuário logado
- **Todas as rotas de `/agentes` e `/casos`**

### Como usar a autenticação:

#### 1. Registrar usuário:
```bash
POST /auth/register
{
  "nome": "Marco Fabian",
  "email": "marcofabiaaufmg@hotmail.com",
  "senha": "Batatinha123!"
}
```

#### 2. Fazer login:
```bash
POST /auth/login
{
  "email": "marcofabiaaufmg@hotmail.com",
  "senha": "Batatinha123!"
}
```

**Resposta:**
```json
{
  "acess_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 3. Usar token nas requisições protegidas:
```bash
GET /agentes
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Requisitos da senha:
- Mínimo 8 caracteres
- Pelo menos uma letra minúscula
- Pelo menos uma letra maiúscula
- Pelo menos um número
- Pelo menos um caractere especial

**Exemplo de senha válida:** `Batatinha123!`

## 📝 Observações
- IDs são inteiros autogerados pelo PostgreSQL
- Não envie `id` no corpo em criação/atualização
- Todas as rotas de agentes e casos agora requerem autenticação
- O token JWT expira em 24 horas por padrão
