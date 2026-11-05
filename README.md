# TÔ PASSADA! Pré-ENEM

App web (PWA) de gestão do cursinho comunitário **TÔ PASSADA! Pré-ENEM**: grade de aulas, equipe de professores, cadastro de alunos e chamada.

## Funcionalidades

- **Grade de aulas**: montagem dos horários por matéria e professor
- **Equipe**: cadastro de professores e matérias
- **Alunos**: cadastro e listagem
- **Chamada**: registro de presença por aula e histórico
- Login com Firebase Auth, log de ações e instalação como PWA

## Stack

React 19 · TypeScript · Vite · Tailwind CSS · Radix UI · Firebase (Auth, Firestore, Storage, Hosting) · vite-plugin-pwa

## Rodando localmente

```bash
npm install
cp .env.example .env   # preencha com as credenciais do seu projeto Firebase
npm run dev
```

## Deploy

Push na `main` publica no Firebase Hosting via GitHub Actions (`.github/workflows/deploy.yml`), com as variáveis vindas dos secrets do repositório.
