# School Register MVP

Connected to the dedicated Supabase project:
`https://qfqrehdsdrvzxqrottdb.supabase.co`

## Setup

1. Upload this folder to a NEW GitHub repository.
2. Copy `.env.example` to `.env`.
3. Run `npm install`.
4. Run `npm run dev`.

The publishable Supabase key in `.env.example` is designed for frontend use. Never add a service-role/secret key to this project.

## Current status

- Dedicated Supabase project created in London.
- Secured schema created: schools, profiles, classes, pupils, class_members, register_sessions, attendance.
- Row Level Security enabled on every table.
- School-scoped policies added.
- Supabase security advisor: no current security lints.
- Frontend has teacher magic-link sign-in.
- Demo uses fake pupil names only.

Next step: create a demo teacher/profile and fake school dataset, then write attendance end-to-end.
