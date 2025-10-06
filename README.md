# Ticket Dashboard

A mini project management dashboard (Trello-like) with email OTP auth, projects/tickets, super-user controls, realtime updates, and notifications.

## Tech Stack
- Frontend: Next.js (App Router) + TypeScript + Zustand
- Backend: NestJS + TypeScript + Prisma + WebSockets (socket.io)
- Database: PostgreSQL (via Prisma ORM)

## Monorepo Structure
```
backend/
  src/
    auth/           # OTP issue/verify, JWT strategy/guard
    users/          # user service
    prisma/         # Prisma service
    projects/       # projects CRUD
    tickets/        # tickets CRUD + emits realtime events
    activities/     # activity log API
    realtime/       # socket.io gateway
    admin/          # super-user verify (password gate)
    notifications/  # email notifications (offline users)
  server/prisma/    # Prisma schema
frontend/
  src/app/          # app router pages (login, projects, detail)
  src/store/        # zustand stores
  src/lib/          # axios client and socket client
```

## Feature Checklist (matches assignment)
- Authentication: Email-based OTP, JWT session. After verify → dashboard.
- Projects & Tickets: list/create projects, ticket create/update. Realtime updates for active viewers via WebSocket.
- Super-user toggle: requires password; ON shows created/updated by; OFF hides.
- Activity feed: recent ticket updates; UI notifications for active users.
- Email notifications: sent to offline members when updates occur (basic heuristic).

## Architecture Overview
- API is modularized by domain (auth, projects, tickets, activities) following NestJS modules with clear boundaries.
- Persistence via Prisma. Relations: users, projects, memberships, tickets, activities, otp tokens.
- Realtime via `AppGateway` using socket.io. Ticket changes emit room-scoped events `ticket:updated` to `project:{id}`.
- Frontend subscribes to project rooms and mutates local state on incoming events for instant UI updates.
- Super-user is a UI concern gated by `/admin/super-verify` endpoint. When ON, additional metadata is shown.

### Database Choice: Why PostgreSQL (SQL) over NoSQL
- Strong relational requirements: users ↔ memberships ↔ projects, tickets ↔ activities with clear joins and constraints.
- Prisma provides type-safe migrations and relations, improving developer velocity and integrity.
- Activities and OTPs benefit from indexed queries and transactional guarantees.
- NoSQL would fit schemaless activity streams, but we favor ACID relations for correctness and simpler querying.

### Design Patterns Used
- Strategy-like notification routing:
  - Active users receive WebSocket events immediately.
  - Offline users receive email notifications via `NotificationsService` (pluggable delivery, could extend to SMS/push).
- Gateway emitter as a simple event facade (`AppGateway.emitTicketUpdated`) to decouple services from socket internals.
- Modular architecture pattern: each domain in its own Nest module with narrow exports.

## Data Model (Prisma)
- User(id, email, isSuperUser, ...)
- Project(id, ownerId, ...)
- Membership(userId, projectId, role)
- Ticket(id, projectId, authorId, updatedById?, status, priority, ...)
- Activity(id, projectId, ticketId?, actorId, type, message, createdAt)
- OtpToken(id, email, code, expiresAt, consumedAt)

See `backend/server/prisma/schema.prisma` for full details.

## API Surface (selected)
- POST `/auth/issue-otp` { email }
- POST `/auth/verify-otp` { email, code } → { token }
- GET  `/projects` (auth)
- POST `/projects` { name, description? } (auth)
- GET  `/projects/:id` (auth)
- POST `/tickets` { projectId, title, description? } (auth)
- PATCH `/tickets/:id` { status?, priority?, title?, description? } (auth)
- GET  `/activities/:projectId` (auth)
- POST `/admin/super-verify` { password }
- WS namespace `/ws` events: `join` { projectId }, server emits `ticket:updated`

## Environment Variables

Backend (`backend/server/.env`):
```
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=replace-with-strong-secret
SUPER_PASSWORD=admin123
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
MAIL_FROM=no-reply@ticket-dashboard
```

Frontend (`frontend/.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Local Development
1) Prerequisites: Node 20+, npm; PostgreSQL (local or hosted). Create a database and set `DATABASE_URL`.
2) Install deps:
```
npm --prefix backend install
npm --prefix frontend install
```
3) Generate Prisma client and run migrations:
```
cd backend/server
npx prisma generate
npx prisma migrate dev --name init
```
4) Start backend:
```
cd ../../backend
npm run start:dev
```
5) Start frontend:
```
cd ../frontend
npm run dev
```
6) Flow:
 - Open frontend on http://localhost:3000
 - Enter email → receive OTP (configure SMTP) or inspect DB `OtpToken`
 - Verify → redirected to projects
 - Create project; open its page in two tabs to see realtime tickets
 - Use Super toggle; enter `SUPER_PASSWORD` to reveal authorship info

## Security & Notes
- JWT secret must be strong and stored in env.
- Emails currently reuse the mailer transport to send OTP and simple update messages; replace with production provider as needed.
- Presence/email heuristic is simplified; can be enhanced with an explicit presence table or TTL cache.

## Next Steps (nice-to-haves)
- Drag-and-drop Kanban columns with status transitions.
- Rich ticket editing (description/comments), assignees.
- Role-based access per project (owner/admin/member).
- Production-grade notification strategy (queue + provider adapters).


