# RecruiterGuard

Uma plataforma de recrutamento ética que anonimiza currículos e classifica candidatos com base em habilidades e experiência, não em atributos pessoais.

## Tech Stack

- **Backend**: Node.js + Express + TypeScript
- **Frontend**: Next.js 16 (App Router) + TypeScript + TailwindCSS v4.1
- **Database**: MySQL
- **ORM**: Prisma

## Pré-requisitos

- Node.js 20.9.0+
- Docker e Docker Compose (para MySQL)

## Instruções de Setup

### 1. Inicie o banco de dados MySQL

```bash
docker-compose up -d
```

Isso iniciará um contêiner MySQL na porta 3306.

### 2. Configuração do back-end

```bash
cd backend
npm install
```

Executar migrações do Prisma:

**Opção 1: Usando o comando db push (recomendado para desenvolvimento, sem necessidade de banco de dados sombra)**
```bash
npm run db:push
```

**Opção 2: Utilizando migrações (para produção, requer banco de dados sombra)**
```bash
npm run migrate
```

**Nota:** Para desenvolvimento, `db:push` é mais simples e não requer um banco de dados sombra. Para produção, use migrações com um banco de dados sombra devidamente configurado.

Isso criará o esquema do banco de dados.

### 3. Configuração do front-end

```bash
cd frontend
npm install
```

## Rodando a aplicação

### Inicie o Backend

```bash
cd backend
npm run dev
```

A API de backend estará disponível em `http://localhost:3001`.

### Inicie o Frontend

```bash
cd frontend
npm run dev
```

A interface estará disponível em `http://localhost:3000`.

## Uso

1. **Cadastre-se**: Crie uma nova conta de recrutador em `http://localhost:3000/register`
2. **Entre**: Faça login em `http://localhost:3000/login`
3. **Crie uma vaga**: Crie um anúncio de vaga com título, descrição e habilidades necessárias
4. **Envie candidatos**: Envie currículos de candidatos (PDF, DOCX ou texto) para uma vaga
5. **Veja a classificação**: Veja os candidatos classificados por pontuação de compatibilidade com base nas habilidades
6. **Veja currículos anonimizados**: Visualize o texto anonimizado do currículo, sem informações pessoais identificáveis

## Features

- **Higienização de Currículo**: Remove automaticamente informações de identificação pessoal (PII), incluindo:

- Nomes
- Endereços de e-mail
- Números de telefone
- Endereços residenciais
- Datas de nascimento
- Links para redes sociais

- **Extração de Habilidades**: Extrai habilidades do texto do currículo usando correspondência de palavras-chave

- **Pontuação de Correspondência**: Calcula uma pontuação de correspondência com base na sobreposição entre as habilidades exigidas pela vaga e as habilidades do candidato

- **Listagens Classificadas**: Exibe os candidatos classificados por pontuação de correspondência

## Estrutura do Projeto

```
.
├── backend/
│   ├── src/
│   │   ├── routes/        # Rotas da API
│   │   ├── services/      # Lógica de negócios (sanitização, pontuação, etc.)
│   │   ├── middleware/    # Middleware de autenticação
│   │   └── lib/           # Utilities (Prisma client)
│   ├── prisma/            # Prisma schema e migrations
│   └── package.json
├── frontend/
│   ├── app/               # Páginas da aplicação Next.js
│   ├── components/        # Componentes
│   ├── lib/               # Comunicação com a API
│   └── package.json
└── docker-compose.yml     # Setup do MySQL
```

## Endpoints da API

### Auth
- `POST /api/auth/register` - Registra novo usuário
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Usuário atual

### Jobs
- `POST /api/jobs` - Cria uma posição de trabalho
- `GET /api/jobs` - Lista as posições para os usuários logados
- `GET /api/jobs/:id` - Retorna os detalhes do trabalho
- `POST /api/jobs/:id/applications` - Upload de currículo
- `GET /api/jobs/:id/applications` - Lista aplicações por trabalho

### Applications
- `GET /api/applications/:id` - Retorna detalhes da aplicação
