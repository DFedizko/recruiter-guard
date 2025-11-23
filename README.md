# RecruiterGuard

Plataforma de recrutamento ético que anonimiza currículos, extrai habilidades e ranqueia candidatos por aderência às vagas.

## Como rodar
- `docker-compose up -d` para subir MySQL (porta 3306).
- Backend: `cd backend && npm install && npm run db:push` (ou `npm run migrate`) e `npm run dev` (porta 3001).
- Frontend: `cd frontend && npm install && npm run dev` (porta 3000).

## Roles e permissões
- ADMIN: cria/edita/exclui vagas, vê todas, aplica, gerencia aplicações, deleta qualquer aplicação.
- RECRUITER: cria/edita/exclui vagas próprias, vê aplicações das próprias vagas, aplica em vagas alheias, atualiza status de aplicações das vagas que criou.
- CANDIDATE: aplica para vagas de terceiros, vê apenas as próprias aplicações.

## Features
- Anonimização de currículo (remove PII).
- Extração e listagem de habilidades.
- Score de match entre candidato e vaga.
- Cadastro/login com sessão via cookie.
- Criação e gestão de vagas.
- Upload e gestão de candidaturas (status, notas).
- Dashboard com ranking de candidatos por vaga.

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

