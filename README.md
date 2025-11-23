# RecruiterGuard

Plataforma de recrutamento ético que anonimiza currículos, extrai habilidades e ranqueia candidatos por aderência às vagas.

*Na RecruiterGuard a avaliação é baseada em competência, não em aparência.*

## Dependências
- Node.js 20.9.0+
- Docker e Docker Compose (MySQL em 3306)
- npm (workspace com `backend` e `frontend`)

## Como rodar
1) Banco: `docker-compose up -d`.
2) Backend: `cd backend && npm install && npm run db:push` (ou `npm run migrate`).
   - Seeds: `npm run db:seed` (usa `prisma/seed.ts`).
   - Dev: `npm run dev` (porta 3001).
3) Frontend: `cd frontend && npm install && npm run dev` (porta 3000).

## Roles e permissões
- ADMIN: cria/edita/exclui vagas, vê todas, aplica, gerencia e deleta qualquer candidatura.
- RECRUITER: cria/edita/exclui vagas próprias, vê e gerencia aplicações das vagas que criou, pode aplicar em vagas de outros.
- CANDIDATE: aplica em vagas de terceiros, vê apenas as próprias candidaturas.

## Features
- Anonimização de currículo (remove PII).
- Extração e listagem de habilidades.
- Score de match entre candidato e vaga.
- Cadastro/login com sessão via cookie.
- Criação e gestão de vagas.
- Upload e gestão de candidaturas (status, notas).
- Dashboard com ranking de candidatos por vaga.
- Editor rich text para descrição de vagas (Markdown/Tiptap).
- Tema claro/escuro com toggle.

## Endpoints
- POST `/api/auth/register` — cria usuário (roles: ADMIN | RECRUITER | CANDIDATE).
- POST `/api/auth/login` — autentica.
- POST `/api/auth/logout` — encerra sessão.
- GET `/api/auth/me` — usuário atual.
- PATCH `/api/auth/avatar` — atualiza avatar do usuário logado.
- POST `/api/jobs` — cria vaga (ADMIN, RECRUITER).
- GET `/api/jobs` — lista vagas (logados).
- GET `/api/jobs/:id` — detalhe da vaga.
- DELETE `/api/jobs/:id` — remove vaga (ADMIN ou recrutador dono).
- POST `/api/jobs/:id/applications` — envia candidatura para vaga.
- GET `/api/jobs/:id/applications` — lista candidaturas da vaga (ADMIN ou recrutador dono).
- GET `/api/applications/me` — candidaturas enviadas pelo usuário logado.
- GET `/api/applications/:id` — detalhe da candidatura (ADMIN, recrutador dono, ou quem enviou).
- PATCH `/api/applications/:id` — atualiza status/notas (ADMIN ou recrutador dono).
- DELETE `/api/applications/:id` — remove candidatura (ADMIN ou quem enviou).

## Estrutura de pastas
```
.
├── backend
│   ├── src/               # Rotas, serviços, middleware, lib
│   ├── prisma/            # schema.prisma, migrations, seed
│   └── package.json
├── frontend
│   ├── app/               # Next App Router
│   ├── components/        # UI e Navbar/ThemeToggle
│   ├── lib/               # API client utils
│   └── package.json
├── docker-compose.yml     # MySQL
└── package.json           # workspaces
```
