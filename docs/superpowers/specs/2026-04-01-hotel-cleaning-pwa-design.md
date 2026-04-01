# Hotel Room Cleaning PWA — Design Document

**Date:** 2026-04-01  
**Status:** Approved

---

## Overview

A mobile-first hotel housekeeping PWA for Android. Multiple staff members track room cleaning statuses (checkout / stayover / priority checkout) in real time. Daily plans are created each morning, history is preserved, and an optional WhatsApp deep-link feature lets workers notify supervisors when priority rooms are ready.

---

## Architecture

**Approach:** Next.js 14 full-stack (App Router) — single repo, single Vercel deploy, Neon serverless Postgres.

### Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| State | Redux Toolkit + RTK Query |
| Auth | NextAuth (JWT strategy) + bcrypt |
| ORM | Prisma |
| Database | PostgreSQL (Neon serverless) |
| i18n | next-intl |
| PWA | @ducanh2912/next-pwa |
| Deploy | Vercel + Neon |

### Folder Structure

```
src/
  app/
    [locale]/
      login/
      register/
      setup/
      board/
      history/
      settings/
    api/
      auth/
      rooms/
      daily-plans/
      daily-plan-rooms/
      settings/
  components/
    rooms/
    board/
    setup/
    history/
    settings/
    common/
  store/
    slices/        # authSlice, roomsSlice, dailyPlanSlice, settingsSlice, uiSlice
    api/           # RTK Query endpoints
  lib/
    auth/
    db/            # Prisma client singleton
    i18n/
    whatsapp/
  messages/
    en.json
    uk.json
  types/
  hooks/
  utils/
prisma/
  schema.prisma
  seed.ts
```

---

## Data Model

```
Hotel ──< User
Hotel ──< Room
Hotel ──< DailyPlan ──< DailyPlanRoom ──< StatusHistory
Hotel ──< AppSetting
```

### Hotel
- id, name, createdAt, updatedAt

### User
- id, hotelId, name, passwordHash, createdAt, updatedAt

### Room
- id, hotelId, roomNumber, isActive (soft-delete), createdAt, updatedAt

### DailyPlan
- id, hotelId, date (unique per hotel+date), createdByUserId, createdAt, updatedAt

### DailyPlanRoom
- id, dailyPlanId, roomId
- roomType: `checkout` | `stayover`
- priority: boolean
- status: `not_cleaned_yet` | `cleaned` | `not_needed`
- updatedByUserId, updatedAt

### StatusHistory
- id, dailyPlanRoomId
- oldStatus, newStatus
- oldRoomType, newRoomType
- changedByUserId, changedAt
- sendMessageUsed: boolean

### AppSetting
- id, hotelId, key, value
- Keys: `default_language`, `whatsapp_enabled`, `whatsapp_phone`, `whatsapp_message_template`, `admin_password_hash`, `polling_interval_ms`

---

## API Routes

### Auth
- `POST /api/auth/register` — name + password + adminPassword
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Rooms
- `GET /api/rooms`
- `POST /api/rooms`
- `PUT /api/rooms/:id`
- `DELETE /api/rooms/:id` — soft-delete via isActive

### Daily Plans
- `GET /api/daily-plans/today`
- `POST /api/daily-plans`
- `GET /api/daily-plans/:date`
- `GET /api/daily-plans/history`

### Daily Plan Rooms
- `GET /api/daily-plan-rooms?date=YYYY-MM-DD`
- `PATCH /api/daily-plan-rooms/:id/status`
- `PATCH /api/daily-plan-rooms/:id/type`

### Settings
- `GET /api/settings`
- `PUT /api/settings`

---

## UI Design

### Patterns
- **Bottom navigation bar** — Board / History / Settings (mobile-first)
- **Card-based room list** — large tap targets, color-coded status chips
- **Floating action button** — save daily plan on Setup screen
- **Sticky header** — date + summary counters on Board screen

### Screens

| Screen | Key elements |
|---|---|
| Login / Register | Full-screen centered card, minimal fields |
| Daily Setup | Search bar, room multi-select chips, priority toggle per checkout room, FAB to save |
| Status Board | Sticky header counters, tabs (All / Priority / Checkout / Stayover), room cards with 3-state status buttons, "last updated by" badge |
| History | Date list → tap → summary card with counts |
| Settings | Sections: Rooms CRUD, WhatsApp config, Language picker |

### Status Colors
- Not cleaned yet → amber (`bg-amber-100 text-amber-800`)
- Cleaned → green (`bg-green-100 text-green-800`)
- Not needed → gray (`bg-gray-100 text-gray-500`)

---

## Synchronization

- RTK Query polling every 15 seconds on the Board page
- Last-write-wins conflict resolution
- Full status history preserved in `StatusHistory` table
- Offline: app shell loads, status updates blocked, clear banner shown

---

## Authentication

- NextAuth JWT strategy
- Admin password stored as bcrypt hash in `AppSetting`
- Registration validates admin password against stored hash
- All registered users within the hotel have equal permissions (v1)
- Sessions persist on device

---

## Internationalization

- `next-intl` with `[locale]` routing segment
- Default locale: `uk` (Ukrainian)
- Supported: `en`, `uk`
- Future: `uk-dialect-1`, `uk-dialect-2`
- No hardcoded UI strings in components — all via translation keys

---

## PWA

- `@ducanh2912/next-pwa` for service worker generation
- App manifest: name, icons, theme color, display: standalone
- Static asset caching via service worker
- Offline fallback page
- Update available prompt when new version deployed
- Online/offline indicator in header

---

## WhatsApp Integration

- Deep link: `https://wa.me/{phone}?text={encodedMessage}`
- Message template from settings, room number injected at send time
- Opens WhatsApp (app or web) — user confirms send manually
- `sendMessageUsed` flag saved in StatusHistory

---

## Redux State Slices

| Slice | Manages |
|---|---|
| `authSlice` | Current user, session |
| `roomsSlice` | Master room list |
| `dailyPlanSlice` | Today's plan + room statuses |
| `settingsSlice` | App settings cache |
| `uiSlice` | Active tab, filters, online/offline, language |

RTK Query handles API calls with automatic caching and polling.

---

## Skills / Tools for Implementation

| Skill | When to use |
|---|---|
| `frontend-design:frontend-design` | Building Status Board, Setup screen, components |
| `superpowers:test-driven-development` | Before each API route and core component |
| `superpowers:systematic-debugging` | PWA, auth, Prisma issues |
| `superpowers:dispatching-parallel-agents` | Building independent feature slices in parallel |
| `superpowers:verification-before-completion` | Before marking each phase complete |

---

## Security

- Passwords hashed with bcrypt (cost factor 12)
- Admin password hash stored in AppSetting, never returned by API
- All API routes validate authenticated session via NextAuth
- Input validation on all API routes (zod)
- HTTPS enforced in production (Vercel default)

---

## Seed Data

- One default hotel
- Admin password hash for registration
- Sample rooms: 101–110
- Sample daily plan with mixed statuses for dev/testing

---

## Version Scope (V1)

Included: auth, room management, daily setup, status board, polling sync, history, WhatsApp deep link, en+uk i18n, PWA installability, equal permissions.

Excluded (future): WebSocket real-time, room notes, push notifications, offline queued sync, photo attachments, multi-hotel, role separation.
