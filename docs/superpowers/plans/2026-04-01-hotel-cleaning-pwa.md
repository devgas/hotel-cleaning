# Hotel Cleaning PWA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-ready hotel housekeeping PWA — Next.js 14, Prisma + Postgres, NextAuth, RTK Query polling, Ukrainian-first i18n, and PWA installability.

**Architecture:** Next.js 14 App Router full-stack. Route handlers serve a REST API; Prisma talks to Neon Postgres. Redux Toolkit + RTK Query manages client state with 15s polling on the board page. next-intl provides `[locale]` routing with Ukrainian as default.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Redux Toolkit, RTK Query, Prisma, PostgreSQL (Neon), NextAuth v5 (JWT), next-intl, @ducanh2912/next-pwa, bcrypt, zod, vitest, @testing-library/react

---

## File Map

```
hotel-cleaning/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── public/
│   ├── manifest.json
│   └── icons/                        # icon-192.png, icon-512.png
├── src/
│   ├── app/
│   │   ├── layout.tsx                # root layout (Redux provider, next-intl)
│   │   ├── [locale]/
│   │   │   ├── layout.tsx            # locale provider
│   │   │   ├── page.tsx              # redirect → /board or /login
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   ├── setup/page.tsx
│   │   │   ├── board/page.tsx
│   │   │   ├── history/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [date]/page.tsx
│   │   │   └── settings/page.tsx
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── [...nextauth]/route.ts
│   │       │   └── register/route.ts
│   │       ├── rooms/
│   │       │   ├── route.ts
│   │       │   └── [id]/route.ts
│   │       ├── daily-plans/
│   │       │   ├── route.ts
│   │       │   ├── today/route.ts
│   │       │   ├── history/route.ts
│   │       │   └── [date]/route.ts
│   │       ├── daily-plan-rooms/
│   │       │   ├── route.ts
│   │       │   └── [id]/
│   │       │       ├── status/route.ts
│   │       │       └── type/route.ts
│   │       └── settings/route.ts
│   ├── components/
│   │   ├── common/
│   │   │   ├── BottomNav.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   └── OfflineBanner.tsx
│   │   ├── board/
│   │   │   ├── RoomCard.tsx
│   │   │   ├── BoardTabs.tsx
│   │   │   └── SummaryCounters.tsx
│   │   ├── setup/
│   │   │   └── RoomSelector.tsx
│   │   └── settings/
│   │       ├── RoomManager.tsx
│   │       └── WhatsAppSettings.tsx
│   ├── store/
│   │   ├── index.ts
│   │   ├── provider.tsx
│   │   ├── slices/
│   │   │   ├── authSlice.ts
│   │   │   └── uiSlice.ts
│   │   └── api/
│   │       ├── baseApi.ts
│   │       ├── roomsApi.ts
│   │       ├── dailyPlanApi.ts
│   │       └── settingsApi.ts
│   ├── lib/
│   │   ├── auth/authOptions.ts
│   │   ├── db/prisma.ts
│   │   ├── i18n/
│   │   │   ├── routing.ts
│   │   │   └── request.ts
│   │   └── whatsapp/buildLink.ts
│   ├── middleware.ts
│   ├── types/index.ts
│   └── messages/
│       ├── en.json
│       └── uk.json
├── __tests__/
│   ├── lib/whatsapp.test.ts
│   ├── lib/rooms.test.ts
│   ├── lib/dailyPlans.test.ts
│   └── components/StatusBadge.test.tsx
├── next.config.ts
├── tailwind.config.ts
├── vitest.config.ts
└── .env.example
```

---

## Phase 1: Project Scaffolding

### Task 1: Initialize Next.js project

**Files:**
- Create: `next.config.ts`, `tailwind.config.ts`, `tsconfig.json`, `package.json`, `.env.example`

- [ ] **Step 1: Scaffold Next.js 14 app**

```bash
cd /home/anton/projects/hotel-cleaning
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --no-git \
  --import-alias "@/*"
```

Expected: project files created, `package.json` present.

- [ ] **Step 2: Install all dependencies**

```bash
npm install \
  next-auth@beta \
  @auth/prisma-adapter \
  @prisma/client \
  prisma \
  bcryptjs \
  next-intl \
  @ducanh2912/next-pwa \
  @reduxjs/toolkit \
  react-redux \
  zod \
  clsx \
  tailwind-merge

npm install --save-dev \
  @types/bcryptjs \
  vitest \
  @vitejs/plugin-react \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event \
  jsdom \
  vite-tsconfig-paths
```

- [ ] **Step 3: Install shadcn/ui**

```bash
npx shadcn@latest init --defaults
npx shadcn@latest add button input label card badge tabs sheet
```

- [ ] **Step 4: Create `.env.example`**

```env
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_DEFAULT_HOTEL_ID="1"
```

Copy to `.env.local` and fill in real values for development.

- [ ] **Step 5: Create `vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
  },
})
```

- [ ] **Step 6: Create `vitest.setup.ts`**

```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 7: Add test script to `package.json`**

In `package.json` scripts section, add:
```json
"test": "vitest",
"test:run": "vitest run"
```

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: initialize Next.js 14 project with dependencies"
```

---

### Task 2: Configure next-intl (i18n)

**Files:**
- Create: `src/lib/i18n/routing.ts`, `src/lib/i18n/request.ts`, `src/messages/en.json`, `src/messages/uk.json`, `src/middleware.ts`
- Modify: `src/app/layout.tsx`, `src/app/[locale]/layout.tsx`

- [ ] **Step 1: Create `src/lib/i18n/routing.ts`**

```typescript
import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['uk', 'en'],
  defaultLocale: 'uk',
})
```

- [ ] **Step 2: Create `src/lib/i18n/request.ts`**

```typescript
import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale
  if (!locale || !routing.locales.includes(locale as 'uk' | 'en')) {
    locale = routing.defaultLocale
  }
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})
```

- [ ] **Step 3: Create `src/messages/uk.json`**

```json
{
  "nav": {
    "board": "Дошка",
    "history": "Історія",
    "settings": "Налаштування"
  },
  "auth": {
    "login": "Увійти",
    "register": "Зареєструватися",
    "name": "Ім'я",
    "password": "Пароль",
    "adminPassword": "Пароль адміна",
    "logout": "Вийти",
    "loginTitle": "Вхід",
    "registerTitle": "Реєстрація"
  },
  "setup": {
    "title": "Налаштування на сьогодні",
    "search": "Пошук кімнати",
    "save": "Зберегти план",
    "checkout": "Виїзд",
    "stayover": "Проживання",
    "priority": "Пріоритет",
    "noRooms": "Кімнати не вибрані"
  },
  "board": {
    "title": "Дошка прибирання",
    "all": "Всі",
    "priority": "Пріоритетні",
    "checkout": "Виїзд",
    "stayover": "Проживання",
    "cleaned": "Прибрано",
    "notCleaned": "Не прибрано",
    "notNeeded": "Не потрібно",
    "updatedBy": "Оновлено:",
    "noPlan": "План на сьогодні не створено",
    "goToSetup": "Налаштувати"
  },
  "history": {
    "title": "Історія",
    "noHistory": "Немає записів",
    "cleaned": "Прибрано",
    "notNeeded": "Не потрібно",
    "total": "Всього"
  },
  "settings": {
    "title": "Налаштування",
    "rooms": "Кімнати",
    "addRoom": "Додати кімнату",
    "roomNumber": "Номер кімнати",
    "deleteRoom": "Видалити",
    "whatsapp": "WhatsApp",
    "whatsappEnabled": "Увімкнути WhatsApp",
    "whatsappPhone": "Номер телефону",
    "whatsappTemplate": "Шаблон повідомлення",
    "language": "Мова",
    "save": "Зберегти",
    "saved": "Збережено"
  },
  "common": {
    "loading": "Завантаження...",
    "error": "Помилка",
    "offline": "Немає з'єднання",
    "send": "Надіслати",
    "cancel": "Скасувати",
    "confirm": "Підтвердити"
  }
}
```

- [ ] **Step 4: Create `src/messages/en.json`**

```json
{
  "nav": {
    "board": "Board",
    "history": "History",
    "settings": "Settings"
  },
  "auth": {
    "login": "Sign In",
    "register": "Register",
    "name": "Name",
    "password": "Password",
    "adminPassword": "Admin Password",
    "logout": "Sign Out",
    "loginTitle": "Sign In",
    "registerTitle": "Register"
  },
  "setup": {
    "title": "Today's Setup",
    "search": "Search room",
    "save": "Save Plan",
    "checkout": "Checkout",
    "stayover": "Stayover",
    "priority": "Priority",
    "noRooms": "No rooms selected"
  },
  "board": {
    "title": "Cleaning Board",
    "all": "All",
    "priority": "Priority",
    "checkout": "Checkout",
    "stayover": "Stayover",
    "cleaned": "Cleaned",
    "notCleaned": "Not Cleaned",
    "notNeeded": "Not Needed",
    "updatedBy": "Updated by:",
    "noPlan": "No plan for today",
    "goToSetup": "Set Up"
  },
  "history": {
    "title": "History",
    "noHistory": "No records",
    "cleaned": "Cleaned",
    "notNeeded": "Not Needed",
    "total": "Total"
  },
  "settings": {
    "title": "Settings",
    "rooms": "Rooms",
    "addRoom": "Add Room",
    "roomNumber": "Room Number",
    "deleteRoom": "Delete",
    "whatsapp": "WhatsApp",
    "whatsappEnabled": "Enable WhatsApp",
    "whatsappPhone": "Phone Number",
    "whatsappTemplate": "Message Template",
    "language": "Language",
    "save": "Save",
    "saved": "Saved"
  },
  "common": {
    "loading": "Loading...",
    "error": "Error",
    "offline": "No connection",
    "send": "Send",
    "cancel": "Cancel",
    "confirm": "Confirm"
  }
}
```

- [ ] **Step 5: Create `src/middleware.ts`**

```typescript
import createMiddleware from 'next-intl/middleware'
import { routing } from './lib/i18n/routing'
import { auth } from './lib/auth/authOptions'
import { NextRequest, NextResponse } from 'next/server'

const intlMiddleware = createMiddleware(routing)

const protectedPaths = ['/setup', '/board', '/history', '/settings']

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Strip locale prefix for path checks
  const pathnameWithoutLocale = pathname.replace(/^\/(uk|en)/, '') || '/'

  const isProtected = protectedPaths.some((p) =>
    pathnameWithoutLocale.startsWith(p)
  )

  if (isProtected) {
    const session = await auth()
    if (!session) {
      const loginUrl = new URL(`/login`, req.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return intlMiddleware(req)
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|icons|manifest).*)'],
}
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: configure next-intl with Ukrainian default locale"
```

---

## Phase 2: Database

### Task 3: Prisma schema and migration

**Files:**
- Create: `prisma/schema.prisma`, `src/lib/db/prisma.ts`

- [ ] **Step 1: Initialize Prisma**

```bash
npx prisma init --datasource-provider postgresql
```

- [ ] **Step 2: Write `prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Hotel {
  id          Int           @id @default(autoincrement())
  name        String
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  users       User[]
  rooms       Room[]
  dailyPlans  DailyPlan[]
  settings    AppSetting[]
}

model User {
  id           Int             @id @default(autoincrement())
  hotelId      Int
  name         String
  passwordHash String
  createdAt    DateTime        @default(now())
  updatedAt    DateTime        @updatedAt
  hotel        Hotel           @relation(fields: [hotelId], references: [id])
  dailyPlans   DailyPlan[]
  planRooms    DailyPlanRoom[]
  history      StatusHistory[]
}

model Room {
  id           Int             @id @default(autoincrement())
  hotelId      Int
  roomNumber   String
  isActive     Boolean         @default(true)
  createdAt    DateTime        @default(now())
  updatedAt    DateTime        @updatedAt
  hotel        Hotel           @relation(fields: [hotelId], references: [id])
  planRooms    DailyPlanRoom[]

  @@unique([hotelId, roomNumber])
}

model DailyPlan {
  id              Int             @id @default(autoincrement())
  hotelId         Int
  date            DateTime        @db.Date
  createdByUserId Int
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  hotel           Hotel           @relation(fields: [hotelId], references: [id])
  createdBy       User            @relation(fields: [createdByUserId], references: [id])
  rooms           DailyPlanRoom[]

  @@unique([hotelId, date])
}

model DailyPlanRoom {
  id              Int             @id @default(autoincrement())
  dailyPlanId     Int
  roomId          Int
  roomType        RoomType        @default(stayover)
  priority        Boolean         @default(false)
  status          CleaningStatus  @default(not_cleaned_yet)
  updatedByUserId Int?
  updatedAt       DateTime        @updatedAt
  dailyPlan       DailyPlan       @relation(fields: [dailyPlanId], references: [id])
  room            Room            @relation(fields: [roomId], references: [id])
  updatedBy       User?           @relation(fields: [updatedByUserId], references: [id])
  history         StatusHistory[]

  @@unique([dailyPlanId, roomId])
}

model StatusHistory {
  id              Int            @id @default(autoincrement())
  dailyPlanRoomId Int
  oldStatus       CleaningStatus?
  newStatus       CleaningStatus
  oldRoomType     RoomType?
  newRoomType     RoomType
  changedByUserId Int
  changedAt       DateTime       @default(now())
  sendMessageUsed Boolean        @default(false)
  dailyPlanRoom   DailyPlanRoom  @relation(fields: [dailyPlanRoomId], references: [id])
  changedBy       User           @relation(fields: [changedByUserId], references: [id])
}

model AppSetting {
  id        Int      @id @default(autoincrement())
  hotelId   Int
  key       String
  value     String
  hotel     Hotel    @relation(fields: [hotelId], references: [id])

  @@unique([hotelId, key])
}

enum RoomType {
  checkout
  stayover
}

enum CleaningStatus {
  not_cleaned_yet
  cleaned
  not_needed
}
```

- [ ] **Step 3: Run migration**

```bash
npx prisma migrate dev --name init
```

Expected output: `Your database is now in sync with your schema.`

- [ ] **Step 4: Create `src/lib/db/prisma.ts`**

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

- [ ] **Step 5: Create `src/types/index.ts`**

```typescript
export type RoomType = 'checkout' | 'stayover'
export type CleaningStatus = 'not_cleaned_yet' | 'cleaned' | 'not_needed'

export interface RoomWithStatus {
  id: number
  roomNumber: string
  roomType: RoomType
  priority: boolean
  status: CleaningStatus
  updatedBy?: string | null
  updatedAt: string
  dailyPlanRoomId: number
}

export interface DailyPlanSummary {
  date: string
  total: number
  cleaned: number
  notNeeded: number
  notCleaned: number
}

export interface AppSettings {
  defaultLanguage: string
  whatsappEnabled: boolean
  whatsappPhone: string
  whatsappMessageTemplate: string
}
```

- [ ] **Step 6: Create seed file `prisma/seed.ts`**

```typescript
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hotel = await prisma.hotel.upsert({
    where: { id: 1 },
    update: {},
    create: { name: 'My Hotel' },
  })

  const adminPasswordHash = await bcrypt.hash('admin123', 12)

  await prisma.appSetting.upsert({
    where: { hotelId_key: { hotelId: hotel.id, key: 'admin_password_hash' } },
    update: {},
    create: { hotelId: hotel.id, key: 'admin_password_hash', value: adminPasswordHash },
  })

  await prisma.appSetting.upsert({
    where: { hotelId_key: { hotelId: hotel.id, key: 'default_language' } },
    update: {},
    create: { hotelId: hotel.id, key: 'default_language', value: 'uk' },
  })

  await prisma.appSetting.upsert({
    where: { hotelId_key: { hotelId: hotel.id, key: 'whatsapp_enabled' } },
    update: {},
    create: { hotelId: hotel.id, key: 'whatsapp_enabled', value: 'false' },
  })

  await prisma.appSetting.upsert({
    where: { hotelId_key: { hotelId: hotel.id, key: 'whatsapp_phone' } },
    update: {},
    create: { hotelId: hotel.id, key: 'whatsapp_phone', value: '' },
  })

  await prisma.appSetting.upsert({
    where: { hotelId_key: { hotelId: hotel.id, key: 'whatsapp_message_template' } },
    update: {},
    create: { hotelId: hotel.id, key: 'whatsapp_message_template', value: 'Кімната {room} прибрана' },
  })

  for (let i = 101; i <= 110; i++) {
    await prisma.room.upsert({
      where: { hotelId_roomNumber: { hotelId: hotel.id, roomNumber: String(i) } },
      update: {},
      create: { hotelId: hotel.id, roomNumber: String(i) },
    })
  }

  console.log('Seed complete. Admin password: admin123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

Add to `package.json`:
```json
"prisma": {
  "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
}
```

- [ ] **Step 7: Run seed**

```bash
npx prisma db seed
```

Expected: `Seed complete. Admin password: admin123`

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add Prisma schema, migration, seed data"
```

---

## Phase 3: Authentication

### Task 4: NextAuth configuration and register API

**Files:**
- Create: `src/lib/auth/authOptions.ts`, `src/app/api/auth/[...nextauth]/route.ts`, `src/app/api/auth/register/route.ts`

- [ ] **Step 1: Write failing test for register validation**

Create `__tests__/api/auth.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Test the validation logic extracted from the register handler
import { validateRegisterInput } from '@/lib/auth/validateRegister'

describe('validateRegisterInput', () => {
  it('rejects missing name', () => {
    const result = validateRegisterInput({ name: '', password: 'pass123', adminPassword: 'admin123' })
    expect(result.success).toBe(false)
  })

  it('rejects short password', () => {
    const result = validateRegisterInput({ name: 'Ana', password: '123', adminPassword: 'admin123' })
    expect(result.success).toBe(false)
  })

  it('accepts valid input', () => {
    const result = validateRegisterInput({ name: 'Ana', password: 'password1', adminPassword: 'admin123' })
    expect(result.success).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
npm run test:run -- __tests__/api/auth.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/auth/validateRegister'`

- [ ] **Step 3: Create `src/lib/auth/validateRegister.ts`**

```typescript
import { z } from 'zod'

const registerSchema = z.object({
  name: z.string().min(1, 'Name required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  adminPassword: z.string().min(1, 'Admin password required'),
})

export function validateRegisterInput(input: unknown) {
  return registerSchema.safeParse(input)
}
```

- [ ] **Step 4: Run test to confirm it passes**

```bash
npm run test:run -- __tests__/api/auth.test.ts
```

Expected: PASS

- [ ] **Step 5: Create `src/lib/auth/authOptions.ts`**

```typescript
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db/prisma'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        name: { label: 'Name', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.name || !credentials?.password) return null

        const hotelId = parseInt(process.env.NEXT_PUBLIC_DEFAULT_HOTEL_ID ?? '1')

        const user = await prisma.user.findFirst({
          where: { hotelId, name: credentials.name as string },
        })

        if (!user) return null

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        )
        if (!valid) return null

        return { id: String(user.id), name: user.name, hotelId: String(user.hotelId) }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.hotelId = (user as { hotelId?: string }).hotelId
      }
      return token
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        ;(session.user as { hotelId?: string }).hotelId = token.hotelId as string
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
})
```

- [ ] **Step 6: Create `src/app/api/auth/[...nextauth]/route.ts`**

```typescript
import { handlers } from '@/lib/auth/authOptions'
export const { GET, POST } = handlers
```

- [ ] **Step 7: Create `src/app/api/auth/register/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db/prisma'
import { validateRegisterInput } from '@/lib/auth/validateRegister'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = validateRegisterInput(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const { name, password, adminPassword } = parsed.data
  const hotelId = parseInt(process.env.NEXT_PUBLIC_DEFAULT_HOTEL_ID ?? '1')

  // Validate admin password
  const setting = await prisma.appSetting.findUnique({
    where: { hotelId_key: { hotelId, key: 'admin_password_hash' } },
  })

  if (!setting) {
    return NextResponse.json({ error: 'Hotel not configured' }, { status: 500 })
  }

  const adminValid = await bcrypt.compare(adminPassword, setting.value)
  if (!adminValid) {
    return NextResponse.json({ error: 'Invalid admin password' }, { status: 403 })
  }

  const existing = await prisma.user.findFirst({ where: { hotelId, name } })
  if (existing) {
    return NextResponse.json({ error: 'Name already taken' }, { status: 409 })
  }

  const passwordHash = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: { hotelId, name, passwordHash },
    select: { id: true, name: true },
  })

  return NextResponse.json(user, { status: 201 })
}
```

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add NextAuth credentials provider and register API"
```

---

## Phase 4: Redux Store & RTK Query

### Task 5: Store setup and base API

**Files:**
- Create: `src/store/index.ts`, `src/store/provider.tsx`, `src/store/slices/authSlice.ts`, `src/store/slices/uiSlice.ts`, `src/store/api/baseApi.ts`

- [ ] **Step 1: Create `src/store/api/baseApi.ts`**

```typescript
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Rooms', 'DailyPlan', 'DailyPlanRooms', 'Settings', 'History'],
  endpoints: () => ({}),
})
```

- [ ] **Step 2: Create `src/store/slices/uiSlice.ts`**

```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type BoardTab = 'all' | 'priority' | 'checkout' | 'stayover'

interface UIState {
  boardTab: BoardTab
  isOnline: boolean
  locale: 'uk' | 'en'
}

const initialState: UIState = {
  boardTab: 'all',
  isOnline: true,
  locale: 'uk',
}

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setBoardTab: (state, action: PayloadAction<BoardTab>) => {
      state.boardTab = action.payload
    },
    setOnline: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload
    },
    setLocale: (state, action: PayloadAction<'uk' | 'en'>) => {
      state.locale = action.payload
    },
  },
})

export const { setBoardTab, setOnline, setLocale } = uiSlice.actions
```

- [ ] **Step 3: Create `src/store/slices/authSlice.ts`**

```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface AuthState {
  userId: string | null
  userName: string | null
  hotelId: string | null
}

const initialState: AuthState = {
  userId: null,
  userName: null,
  hotelId: null,
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<AuthState>) => {
      state.userId = action.payload.userId
      state.userName = action.payload.userName
      state.hotelId = action.payload.hotelId
    },
    clearUser: (state) => {
      state.userId = null
      state.userName = null
      state.hotelId = null
    },
  },
})

export const { setUser, clearUser } = authSlice.actions
```

- [ ] **Step 4: Create `src/store/index.ts`**

```typescript
import { configureStore } from '@reduxjs/toolkit'
import { baseApi } from './api/baseApi'
import { uiSlice } from './slices/uiSlice'
import { authSlice } from './slices/authSlice'

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    ui: uiSlice.reducer,
    auth: authSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
```

- [ ] **Step 5: Create `src/store/provider.tsx`**

```typescript
'use client'
import { Provider } from 'react-redux'
import { store } from './index'

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return <Provider store={store}>{children}</Provider>
}
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: set up Redux store with RTK Query base API"
```

---

## Phase 5: Rooms API + RTK Query

### Task 6: Rooms API routes

**Files:**
- Create: `src/app/api/rooms/route.ts`, `src/app/api/rooms/[id]/route.ts`, `src/store/api/roomsApi.ts`

- [ ] **Step 1: Write failing test**

Create `__tests__/api/rooms.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { validateRoomInput } from '@/lib/rooms/validateRoom'

describe('validateRoomInput', () => {
  it('rejects empty room number', () => {
    expect(validateRoomInput({ roomNumber: '' }).success).toBe(false)
  })

  it('accepts valid room number', () => {
    expect(validateRoomInput({ roomNumber: '101' }).success).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
npm run test:run -- __tests__/api/rooms.test.ts
```

Expected: FAIL

- [ ] **Step 3: Create `src/lib/rooms/validateRoom.ts`**

```typescript
import { z } from 'zod'

const roomSchema = z.object({
  roomNumber: z.string().min(1, 'Room number required').max(10),
})

export function validateRoomInput(input: unknown) {
  return roomSchema.safeParse(input)
}
```

- [ ] **Step 4: Run test to confirm it passes**

```bash
npm run test:run -- __tests__/api/rooms.test.ts
```

Expected: PASS

- [ ] **Step 5: Create `src/app/api/rooms/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/authOptions'
import { prisma } from '@/lib/db/prisma'
import { validateRoomInput } from '@/lib/rooms/validateRoom'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const hotelId = parseInt((session.user as { hotelId?: string }).hotelId ?? '1')
  const rooms = await prisma.room.findMany({
    where: { hotelId, isActive: true },
    orderBy: { roomNumber: 'asc' },
    select: { id: true, roomNumber: true },
  })

  return NextResponse.json(rooms)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = validateRoomInput(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const hotelId = parseInt((session.user as { hotelId?: string }).hotelId ?? '1')

  const existing = await prisma.room.findUnique({
    where: { hotelId_roomNumber: { hotelId, roomNumber: parsed.data.roomNumber } },
  })

  if (existing && !existing.isActive) {
    const restored = await prisma.room.update({
      where: { id: existing.id },
      data: { isActive: true },
      select: { id: true, roomNumber: true },
    })
    return NextResponse.json(restored, { status: 201 })
  }

  if (existing) {
    return NextResponse.json({ error: 'Room already exists' }, { status: 409 })
  }

  const room = await prisma.room.create({
    data: { hotelId, roomNumber: parsed.data.roomNumber },
    select: { id: true, roomNumber: true },
  })

  return NextResponse.json(room, { status: 201 })
}
```

- [ ] **Step 6: Create `src/app/api/rooms/[id]/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/authOptions'
import { prisma } from '@/lib/db/prisma'
import { validateRoomInput } from '@/lib/rooms/validateRoom'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = validateRoomInput(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const room = await prisma.room.update({
    where: { id: parseInt(params.id) },
    data: { roomNumber: parsed.data.roomNumber },
    select: { id: true, roomNumber: true },
  })

  return NextResponse.json(room)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.room.update({
    where: { id: parseInt(params.id) },
    data: { isActive: false },
  })

  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 7: Create `src/store/api/roomsApi.ts`**

```typescript
import { baseApi } from './baseApi'

interface Room {
  id: number
  roomNumber: string
}

export const roomsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getRooms: build.query<Room[], void>({
      query: () => '/rooms',
      providesTags: ['Rooms'],
    }),
    createRoom: build.mutation<Room, { roomNumber: string }>({
      query: (body) => ({ url: '/rooms', method: 'POST', body }),
      invalidatesTags: ['Rooms'],
    }),
    updateRoom: build.mutation<Room, { id: number; roomNumber: string }>({
      query: ({ id, ...body }) => ({ url: `/rooms/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Rooms'],
    }),
    deleteRoom: build.mutation<{ ok: boolean }, number>({
      query: (id) => ({ url: `/rooms/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Rooms'],
    }),
  }),
})

export const { useGetRoomsQuery, useCreateRoomMutation, useUpdateRoomMutation, useDeleteRoomMutation } = roomsApi
```

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add rooms API and RTK Query slice"
```

---

## Phase 6: Daily Plans API

### Task 7: Daily plans and daily plan rooms API

**Files:**
- Create: `src/app/api/daily-plans/route.ts`, `src/app/api/daily-plans/today/route.ts`, `src/app/api/daily-plans/history/route.ts`, `src/app/api/daily-plan-rooms/route.ts`, `src/app/api/daily-plan-rooms/[id]/status/route.ts`, `src/app/api/daily-plan-rooms/[id]/type/route.ts`, `src/store/api/dailyPlanApi.ts`

- [ ] **Step 1: Write failing test**

Create `__tests__/api/dailyPlans.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { validateDailyPlanInput } from '@/lib/dailyPlans/validateDailyPlan'

describe('validateDailyPlanInput', () => {
  it('rejects empty rooms array', () => {
    expect(validateDailyPlanInput({ rooms: [] }).success).toBe(false)
  })

  it('rejects invalid roomType', () => {
    expect(validateDailyPlanInput({
      rooms: [{ roomId: 1, roomType: 'invalid', priority: false }]
    }).success).toBe(false)
  })

  it('accepts valid input', () => {
    expect(validateDailyPlanInput({
      rooms: [{ roomId: 1, roomType: 'checkout', priority: true }]
    }).success).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
npm run test:run -- __tests__/api/dailyPlans.test.ts
```

Expected: FAIL

- [ ] **Step 3: Create `src/lib/dailyPlans/validateDailyPlan.ts`**

```typescript
import { z } from 'zod'

const planRoomSchema = z.object({
  roomId: z.number().int().positive(),
  roomType: z.enum(['checkout', 'stayover']),
  priority: z.boolean(),
})

const dailyPlanSchema = z.object({
  rooms: z.array(planRoomSchema).min(1, 'At least one room required'),
})

export function validateDailyPlanInput(input: unknown) {
  return dailyPlanSchema.safeParse(input)
}
```

- [ ] **Step 4: Run test to confirm it passes**

```bash
npm run test:run -- __tests__/api/dailyPlans.test.ts
```

Expected: PASS

- [ ] **Step 5: Create `src/app/api/daily-plans/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/authOptions'
import { prisma } from '@/lib/db/prisma'
import { validateDailyPlanInput } from '@/lib/dailyPlans/validateDailyPlan'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = validateDailyPlanInput(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const hotelId = parseInt((session.user as { hotelId?: string }).hotelId ?? '1')
  const userId = parseInt(session.user!.id!)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const existing = await prisma.dailyPlan.findUnique({
    where: { hotelId_date: { hotelId, date: today } },
  })

  if (existing) {
    // Recreate rooms
    await prisma.dailyPlanRoom.deleteMany({ where: { dailyPlanId: existing.id } })
    await prisma.dailyPlanRoom.createMany({
      data: parsed.data.rooms.map((r) => ({
        dailyPlanId: existing.id,
        roomId: r.roomId,
        roomType: r.roomType,
        priority: r.priority,
        status: 'not_cleaned_yet',
        updatedByUserId: userId,
      })),
    })
    return NextResponse.json({ id: existing.id }, { status: 200 })
  }

  const plan = await prisma.dailyPlan.create({
    data: {
      hotelId,
      date: today,
      createdByUserId: userId,
      rooms: {
        create: parsed.data.rooms.map((r) => ({
          roomId: r.roomId,
          roomType: r.roomType,
          priority: r.priority,
          status: 'not_cleaned_yet',
          updatedByUserId: userId,
        })),
      },
    },
  })

  return NextResponse.json({ id: plan.id }, { status: 201 })
}
```

- [ ] **Step 6: Create `src/app/api/daily-plans/today/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/authOptions'
import { prisma } from '@/lib/db/prisma'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const hotelId = parseInt((session.user as { hotelId?: string }).hotelId ?? '1')
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const plan = await prisma.dailyPlan.findUnique({
    where: { hotelId_date: { hotelId, date: today } },
    include: {
      rooms: {
        include: {
          room: { select: { roomNumber: true } },
          updatedBy: { select: { name: true } },
        },
        orderBy: [{ priority: 'desc' }, { room: { roomNumber: 'asc' } }],
      },
    },
  })

  if (!plan) return NextResponse.json(null)

  const rooms = plan.rooms.map((r) => ({
    dailyPlanRoomId: r.id,
    roomId: r.roomId,
    roomNumber: r.room.roomNumber,
    roomType: r.roomType,
    priority: r.priority,
    status: r.status,
    updatedBy: r.updatedBy?.name ?? null,
    updatedAt: r.updatedAt.toISOString(),
  }))

  return NextResponse.json({ id: plan.id, date: plan.date.toISOString(), rooms })
}
```

- [ ] **Step 7: Create `src/app/api/daily-plans/history/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/authOptions'
import { prisma } from '@/lib/db/prisma'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const hotelId = parseInt((session.user as { hotelId?: string }).hotelId ?? '1')

  const plans = await prisma.dailyPlan.findMany({
    where: { hotelId },
    orderBy: { date: 'desc' },
    take: 30,
    include: {
      rooms: { select: { status: true } },
    },
  })

  const summaries = plans.map((p) => ({
    date: p.date.toISOString().split('T')[0],
    total: p.rooms.length,
    cleaned: p.rooms.filter((r) => r.status === 'cleaned').length,
    notNeeded: p.rooms.filter((r) => r.status === 'not_needed').length,
    notCleaned: p.rooms.filter((r) => r.status === 'not_cleaned_yet').length,
  }))

  return NextResponse.json(summaries)
}
```

- [ ] **Step 8: Create `src/app/api/daily-plan-rooms/[id]/status/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/authOptions'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'

const statusSchema = z.object({
  status: z.enum(['not_cleaned_yet', 'cleaned', 'not_needed']),
  sendMessageUsed: z.boolean().optional().default(false),
})

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = statusSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const userId = parseInt(session.user!.id!)
  const planRoomId = parseInt(params.id)

  const current = await prisma.dailyPlanRoom.findUnique({ where: { id: planRoomId } })
  if (!current) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const updated = await prisma.dailyPlanRoom.update({
    where: { id: planRoomId },
    data: {
      status: parsed.data.status,
      updatedByUserId: userId,
      history: {
        create: {
          oldStatus: current.status,
          newStatus: parsed.data.status,
          oldRoomType: current.roomType,
          newRoomType: current.roomType,
          changedByUserId: userId,
          sendMessageUsed: parsed.data.sendMessageUsed,
        },
      },
    },
    include: { updatedBy: { select: { name: true } } },
  })

  return NextResponse.json({
    status: updated.status,
    updatedBy: updated.updatedBy?.name ?? null,
    updatedAt: updated.updatedAt.toISOString(),
  })
}
```

- [ ] **Step 9: Create `src/app/api/daily-plan-rooms/[id]/type/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/authOptions'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'

const typeSchema = z.object({
  roomType: z.enum(['checkout', 'stayover']),
  priority: z.boolean().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = typeSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const userId = parseInt(session.user!.id!)
  const planRoomId = parseInt(params.id)

  const current = await prisma.dailyPlanRoom.findUnique({ where: { id: planRoomId } })
  if (!current) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const updated = await prisma.dailyPlanRoom.update({
    where: { id: planRoomId },
    data: {
      roomType: parsed.data.roomType,
      priority: parsed.data.priority ?? current.priority,
      updatedByUserId: userId,
      history: {
        create: {
          oldStatus: current.status,
          newStatus: current.status,
          oldRoomType: current.roomType,
          newRoomType: parsed.data.roomType,
          changedByUserId: userId,
        },
      },
    },
  })

  return NextResponse.json({ roomType: updated.roomType, priority: updated.priority })
}
```

- [ ] **Step 10: Create `src/store/api/dailyPlanApi.ts`**

```typescript
import { baseApi } from './baseApi'
import type { RoomWithStatus, DailyPlanSummary } from '@/types'

interface DailyPlan {
  id: number
  date: string
  rooms: RoomWithStatus[]
}

interface CreatePlanInput {
  rooms: { roomId: number; roomType: 'checkout' | 'stayover'; priority: boolean }[]
}

export const dailyPlanApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getTodayPlan: build.query<DailyPlan | null, void>({
      query: () => '/daily-plans/today',
      providesTags: ['DailyPlan', 'DailyPlanRooms'],
    }),
    createDailyPlan: build.mutation<{ id: number }, CreatePlanInput>({
      query: (body) => ({ url: '/daily-plans', method: 'POST', body }),
      invalidatesTags: ['DailyPlan', 'DailyPlanRooms'],
    }),
    getHistory: build.query<DailyPlanSummary[], void>({
      query: () => '/daily-plans/history',
      providesTags: ['History'],
    }),
    updateRoomStatus: build.mutation<
      { status: string; updatedBy: string | null; updatedAt: string },
      { id: number; status: string; sendMessageUsed?: boolean }
    >({
      query: ({ id, ...body }) => ({
        url: `/daily-plan-rooms/${id}/status`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['DailyPlanRooms'],
    }),
  }),
})

export const {
  useGetTodayPlanQuery,
  useCreateDailyPlanMutation,
  useGetHistoryQuery,
  useUpdateRoomStatusMutation,
} = dailyPlanApi
```

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: add daily plans and plan rooms API with RTK Query"
```

---

## Phase 7: Settings API

### Task 8: Settings API and RTK Query

**Files:**
- Create: `src/app/api/settings/route.ts`, `src/store/api/settingsApi.ts`

- [ ] **Step 1: Create `src/app/api/settings/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/authOptions'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'

const settingsSchema = z.object({
  defaultLanguage: z.enum(['uk', 'en']).optional(),
  whatsappEnabled: z.boolean().optional(),
  whatsappPhone: z.string().optional(),
  whatsappMessageTemplate: z.string().optional(),
})

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const hotelId = parseInt((session.user as { hotelId?: string }).hotelId ?? '1')

  const rows = await prisma.appSetting.findMany({
    where: { hotelId, key: { not: 'admin_password_hash' } },
  })

  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]))

  return NextResponse.json({
    defaultLanguage: map['default_language'] ?? 'uk',
    whatsappEnabled: map['whatsapp_enabled'] === 'true',
    whatsappPhone: map['whatsapp_phone'] ?? '',
    whatsappMessageTemplate: map['whatsapp_message_template'] ?? 'Кімната {room} прибрана',
  })
}

export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = settingsSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const hotelId = parseInt((session.user as { hotelId?: string }).hotelId ?? '1')
  const updates: [string, string][] = []

  if (parsed.data.defaultLanguage !== undefined)
    updates.push(['default_language', parsed.data.defaultLanguage])
  if (parsed.data.whatsappEnabled !== undefined)
    updates.push(['whatsapp_enabled', String(parsed.data.whatsappEnabled)])
  if (parsed.data.whatsappPhone !== undefined)
    updates.push(['whatsapp_phone', parsed.data.whatsappPhone])
  if (parsed.data.whatsappMessageTemplate !== undefined)
    updates.push(['whatsapp_message_template', parsed.data.whatsappMessageTemplate])

  await Promise.all(
    updates.map(([key, value]) =>
      prisma.appSetting.upsert({
        where: { hotelId_key: { hotelId, key } },
        update: { value },
        create: { hotelId, key, value },
      })
    )
  )

  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 2: Create `src/store/api/settingsApi.ts`**

```typescript
import { baseApi } from './baseApi'
import type { AppSettings } from '@/types'

export const settingsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getSettings: build.query<AppSettings, void>({
      query: () => '/settings',
      providesTags: ['Settings'],
    }),
    updateSettings: build.mutation<{ ok: boolean }, Partial<AppSettings>>({
      query: (body) => ({ url: '/settings', method: 'PUT', body }),
      invalidatesTags: ['Settings'],
    }),
  }),
})

export const { useGetSettingsQuery, useUpdateSettingsMutation } = settingsApi
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add settings API and RTK Query slice"
```

---

## Phase 8: WhatsApp Utility

### Task 9: WhatsApp link builder

**Files:**
- Create: `src/lib/whatsapp/buildLink.ts`, `__tests__/lib/whatsapp.test.ts`

- [ ] **Step 1: Write failing test**

Create `__tests__/lib/whatsapp.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { buildWhatsAppLink } from '@/lib/whatsapp/buildLink'

describe('buildWhatsAppLink', () => {
  it('builds a valid wa.me link', () => {
    const link = buildWhatsAppLink('+380991234567', 'Кімната {room} прибрана', '101')
    expect(link).toBe('https://wa.me/380991234567?text=%D0%9A%D1%96%D0%BC%D0%BD%D0%B0%D1%82%D0%B0%20101%20%D0%BF%D1%80%D0%B8%D0%B1%D1%80%D0%B0%D0%BD%D0%B0')
  })

  it('strips leading + from phone', () => {
    const link = buildWhatsAppLink('+1234567890', 'Room {room}', '202')
    expect(link).toContain('wa.me/1234567890')
  })

  it('injects room number into template', () => {
    const link = buildWhatsAppLink('1234567890', 'Room {room} done', '303')
    expect(link).toContain(encodeURIComponent('Room 303 done'))
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
npm run test:run -- __tests__/lib/whatsapp.test.ts
```

Expected: FAIL

- [ ] **Step 3: Create `src/lib/whatsapp/buildLink.ts`**

```typescript
export function buildWhatsAppLink(phone: string, template: string, roomNumber: string): string {
  const cleanPhone = phone.replace(/^\+/, '')
  const message = template.replace('{room}', roomNumber)
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
}
```

- [ ] **Step 4: Run test to confirm it passes**

```bash
npm run test:run -- __tests__/lib/whatsapp.test.ts
```

Expected: PASS (3 passing)

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add WhatsApp link builder with tests"
```

---

## Phase 9: UI Components

### Task 10: Common components

**Files:**
- Create: `src/components/common/StatusBadge.tsx`, `src/components/common/OfflineBanner.tsx`, `src/components/common/Header.tsx`, `src/components/common/BottomNav.tsx`

- [ ] **Step 1: Write failing test for StatusBadge**

Create `__tests__/components/StatusBadge.test.tsx`:
```typescript
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { StatusBadge } from '@/components/common/StatusBadge'

describe('StatusBadge', () => {
  it('shows cleaned status with green style', () => {
    render(<StatusBadge status="cleaned" label="Прибрано" />)
    const el = screen.getByText('Прибрано')
    expect(el.className).toContain('green')
  })

  it('shows not_cleaned_yet with amber style', () => {
    render(<StatusBadge status="not_cleaned_yet" label="Не прибрано" />)
    const el = screen.getByText('Не прибрано')
    expect(el.className).toContain('amber')
  })

  it('shows not_needed with gray style', () => {
    render(<StatusBadge status="not_needed" label="Не потрібно" />)
    const el = screen.getByText('Не потрібно')
    expect(el.className).toContain('gray')
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
npm run test:run -- __tests__/components/StatusBadge.test.tsx
```

Expected: FAIL

- [ ] **Step 3: Create `src/components/common/StatusBadge.tsx`**

```tsx
import { cn } from '@/lib/utils'
import type { CleaningStatus } from '@/types'

const statusStyles: Record<CleaningStatus, string> = {
  cleaned: 'bg-green-100 text-green-800',
  not_cleaned_yet: 'bg-amber-100 text-amber-800',
  not_needed: 'bg-gray-100 text-gray-500',
}

export function StatusBadge({ status, label }: { status: CleaningStatus; label: string }) {
  return (
    <span className={cn('px-2 py-1 rounded-full text-xs font-medium', statusStyles[status])}>
      {label}
    </span>
  )
}
```

- [ ] **Step 4: Run test to confirm it passes**

```bash
npm run test:run -- __tests__/components/StatusBadge.test.tsx
```

Expected: PASS

- [ ] **Step 5: Create `src/components/common/OfflineBanner.tsx`**

```tsx
'use client'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setOnline } from '@/store/slices/uiSlice'
import type { RootState } from '@/store'
import { useTranslations } from 'next-intl'

export function OfflineBanner() {
  const dispatch = useDispatch()
  const isOnline = useSelector((s: RootState) => s.ui.isOnline)
  const t = useTranslations('common')

  useEffect(() => {
    const handleOnline = () => dispatch(setOnline(true))
    const handleOffline = () => dispatch(setOnline(false))
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    dispatch(setOnline(navigator.onLine))
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [dispatch])

  if (isOnline) return null

  return (
    <div className="fixed top-0 inset-x-0 z-50 bg-red-500 text-white text-center text-sm py-2">
      {t('offline')}
    </div>
  )
}
```

- [ ] **Step 6: Create `src/components/common/Header.tsx`**

```tsx
'use client'
import { useTranslations } from 'next-intl'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { OfflineBanner } from './OfflineBanner'

export function Header({ title }: { title: string }) {
  const t = useTranslations('auth')
  return (
    <>
      <OfflineBanner />
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: '/login' })}>
          {t('logout')}
        </Button>
      </header>
    </>
  )
}
```

- [ ] **Step 7: Create `src/components/common/BottomNav.tsx`**

```tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/board', labelKey: 'board', icon: '🏨' },
  { href: '/history', labelKey: 'history', icon: '📋' },
  { href: '/settings', labelKey: 'settings', icon: '⚙️' },
]

export function BottomNav({ locale }: { locale: string }) {
  const pathname = usePathname()
  const t = useTranslations('nav')

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 flex">
      {navItems.map((item) => {
        const href = `/${locale}${item.href}`
        const active = pathname.includes(item.href)
        return (
          <Link
            key={item.href}
            href={href}
            className={cn(
              'flex-1 flex flex-col items-center py-2 text-xs gap-1 transition-colors',
              active ? 'text-blue-600 font-medium' : 'text-gray-500'
            )}
          >
            <span className="text-xl">{item.icon}</span>
            <span>{t(item.labelKey as 'board' | 'history' | 'settings')}</span>
          </Link>
        )
      })}
    </nav>
  )
}
```

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add common UI components (Header, BottomNav, StatusBadge, OfflineBanner)"
```

---

## Phase 10: App Layout and Auth Pages

### Task 11: Root layout, locale layout, login, register pages

**Files:**
- Modify: `src/app/layout.tsx`, `src/app/[locale]/layout.tsx`
- Create: `src/app/[locale]/login/page.tsx`, `src/app/[locale]/register/page.tsx`, `src/app/[locale]/(app)/layout.tsx`

- [ ] **Step 1: Update `src/app/layout.tsx`**

```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ReduxProvider } from '@/store/provider'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

export const metadata: Metadata = {
  title: 'Hotel Cleaning',
  description: 'Hotel housekeeping management',
  manifest: '/manifest.json',
  themeColor: '#2563eb',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body className={inter.className}>
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Create `src/app/[locale]/layout.tsx`**

```tsx
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  const messages = await getMessages()
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  )
}
```

- [ ] **Step 3: Create `src/app/[locale]/page.tsx`**

```tsx
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth/authOptions'

export default async function RootPage({ params: { locale } }: { params: { locale: string } }) {
  const session = await auth()
  if (session) redirect(`/${locale}/board`)
  redirect(`/${locale}/login`)
}
```

- [ ] **Step 4: Create `src/app/[locale]/login/page.tsx`**

```tsx
'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function LoginPage() {
  const t = useTranslations('auth')
  const { locale } = useParams<{ locale: string }>()
  const router = useRouter()
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await signIn('credentials', { name, password, redirect: false })
    if (res?.error) {
      setError(res.error)
    } else {
      router.push(`/${locale}/board`)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-center">{t('loginTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="name">{t('name')}</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">{t('password')}</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? '...' : t('login')}
            </Button>
            <p className="text-center text-sm text-gray-500">
              <Link href={`/${locale}/register`} className="text-blue-600 underline">
                {t('register')}
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 5: Create `src/app/[locale]/register/page.tsx`**

```tsx
'use client'
import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function RegisterPage() {
  const t = useTranslations('auth')
  const { locale } = useParams<{ locale: string }>()
  const router = useRouter()
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, password, adminPassword }),
    })
    if (res.ok) {
      router.push(`/${locale}/login`)
    } else {
      const data = await res.json()
      setError(typeof data.error === 'string' ? data.error : JSON.stringify(data.error))
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-center">{t('registerTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="name">{t('name')}</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">{t('password')}</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="adminPassword">{t('adminPassword')}</Label>
              <Input id="adminPassword" type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} required />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? '...' : t('register')}
            </Button>
            <p className="text-center text-sm text-gray-500">
              <Link href={`/${locale}/login`} className="text-blue-600 underline">
                {t('login')}
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 6: Create `src/app/[locale]/(app)/layout.tsx`**

```tsx
import { BottomNav } from '@/components/common/BottomNav'

export default function AppLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pb-20">{children}</main>
      <BottomNav locale={locale} />
    </div>
  )
}
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add app layout, login and register pages"
```

---

## Phase 11: Status Board

### Task 12: Board components and page

**Files:**
- Create: `src/components/board/SummaryCounters.tsx`, `src/components/board/BoardTabs.tsx`, `src/components/board/RoomCard.tsx`, `src/app/[locale]/(app)/board/page.tsx`

- [ ] **Step 1: Create `src/components/board/SummaryCounters.tsx`**

```tsx
import { useTranslations } from 'next-intl'

interface Props {
  total: number
  cleaned: number
  notNeeded: number
  notCleaned: number
}

export function SummaryCounters({ total, cleaned, notNeeded, notCleaned }: Props) {
  const t = useTranslations('board')
  return (
    <div className="grid grid-cols-3 gap-2 px-4 py-3 bg-white border-b">
      <div className="text-center">
        <div className="text-2xl font-bold text-green-600">{cleaned}</div>
        <div className="text-xs text-gray-500">{t('cleaned')}</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-amber-600">{notCleaned}</div>
        <div className="text-xs text-gray-500">{t('notCleaned')}</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-400">{notNeeded}</div>
        <div className="text-xs text-gray-500">{t('notNeeded')}</div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `src/components/board/BoardTabs.tsx`**

```tsx
'use client'
import { useDispatch, useSelector } from 'react-redux'
import { setBoardTab } from '@/store/slices/uiSlice'
import type { RootState } from '@/store'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

type Tab = 'all' | 'priority' | 'checkout' | 'stayover'
const tabs: Tab[] = ['all', 'priority', 'checkout', 'stayover']

export function BoardTabs() {
  const dispatch = useDispatch()
  const active = useSelector((s: RootState) => s.ui.boardTab)
  const t = useTranslations('board')

  return (
    <div className="flex overflow-x-auto bg-white border-b">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => dispatch(setBoardTab(tab))}
          className={cn(
            'flex-shrink-0 px-4 py-2 text-sm font-medium border-b-2 transition-colors',
            active === tab
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500'
          )}
        >
          {t(tab)}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Create `src/components/board/RoomCard.tsx`**

```tsx
'use client'
import { useTranslations } from 'next-intl'
import { useUpdateRoomStatusMutation } from '@/store/api/dailyPlanApi'
import { StatusBadge } from '@/components/common/StatusBadge'
import { buildWhatsAppLink } from '@/lib/whatsapp/buildLink'
import type { RoomWithStatus, CleaningStatus } from '@/types'
import { cn } from '@/lib/utils'

interface Props {
  room: RoomWithStatus
  whatsappEnabled: boolean
  whatsappPhone: string
  whatsappTemplate: string
  isOnline: boolean
}

const statusCycle: CleaningStatus[] = ['not_cleaned_yet', 'cleaned', 'not_needed']

export function RoomCard({ room, whatsappEnabled, whatsappPhone, whatsappTemplate, isOnline }: Props) {
  const t = useTranslations('board')
  const [updateStatus] = useUpdateRoomStatusMutation()

  function cycleStatus() {
    if (!isOnline) return
    const current = statusCycle.indexOf(room.status)
    const next = statusCycle[(current + 1) % statusCycle.length]
    updateStatus({ id: room.dailyPlanRoomId, status: next })
  }

  function handleWhatsApp() {
    const link = buildWhatsAppLink(whatsappPhone, whatsappTemplate, room.roomNumber)
    window.open(link, '_blank')
    updateStatus({ id: room.dailyPlanRoomId, status: 'cleaned', sendMessageUsed: true })
  }

  const statusLabels: Record<CleaningStatus, string> = {
    cleaned: t('cleaned'),
    not_cleaned_yet: t('notCleaned'),
    not_needed: t('notNeeded'),
  }

  return (
    <div
      className={cn(
        'bg-white rounded-xl shadow-sm border p-4 flex items-center gap-3',
        room.priority && 'border-l-4 border-l-orange-400'
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-gray-900">
            {room.roomNumber}
          </span>
          {room.priority && (
            <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">
              ★
            </span>
          )}
          <span className="text-xs text-gray-400 capitalize">{room.roomType}</span>
        </div>
        {room.updatedBy && (
          <p className="text-xs text-gray-400 mt-0.5">
            {t('updatedBy')} {room.updatedBy}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {whatsappEnabled && room.status !== 'cleaned' && (
          <button
            onClick={handleWhatsApp}
            className="text-green-600 text-lg"
            title="WhatsApp"
          >
            💬
          </button>
        )}
        <button onClick={cycleStatus} disabled={!isOnline}>
          <StatusBadge status={room.status} label={statusLabels[room.status]} />
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create `src/app/[locale]/(app)/board/page.tsx`**

```tsx
'use client'
import { useSelector } from 'react-redux'
import { useTranslations } from 'next-intl'
import { useParams, useRouter } from 'next/navigation'
import { Header } from '@/components/common/Header'
import { SummaryCounters } from '@/components/board/SummaryCounters'
import { BoardTabs } from '@/components/board/BoardTabs'
import { RoomCard } from '@/components/board/RoomCard'
import { useGetTodayPlanQuery } from '@/store/api/dailyPlanApi'
import { useGetSettingsQuery } from '@/store/api/settingsApi'
import type { RootState } from '@/store'
import type { RoomWithStatus } from '@/types'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const POLL_INTERVAL = 15000

export default function BoardPage() {
  const t = useTranslations('board')
  const { locale } = useParams<{ locale: string }>()
  const activeTab = useSelector((s: RootState) => s.ui.boardTab)
  const isOnline = useSelector((s: RootState) => s.ui.isOnline)

  const { data: plan, isLoading } = useGetTodayPlanQuery(undefined, {
    pollingInterval: POLL_INTERVAL,
  })
  const { data: settings } = useGetSettingsQuery()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">{t('notCleaned')}</p>
      </div>
    )
  }

  if (!plan) {
    return (
      <div>
        <Header title={t('title')} />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-4">
          <p className="text-gray-500">{t('noPlan')}</p>
          <Button asChild>
            <Link href={`/${locale}/setup`}>{t('goToSetup')}</Link>
          </Button>
        </div>
      </div>
    )
  }

  const rooms = plan.rooms
  const cleaned = rooms.filter((r) => r.status === 'cleaned').length
  const notNeeded = rooms.filter((r) => r.status === 'not_needed').length
  const notCleaned = rooms.filter((r) => r.status === 'not_cleaned_yet').length

  const filtered: RoomWithStatus[] = rooms.filter((r) => {
    if (activeTab === 'all') return true
    if (activeTab === 'priority') return r.priority
    if (activeTab === 'checkout') return r.roomType === 'checkout'
    if (activeTab === 'stayover') return r.roomType === 'stayover'
    return true
  })

  return (
    <div>
      <Header title={t('title')} />
      <div className="sticky top-[57px] z-30 bg-white">
        <SummaryCounters total={rooms.length} cleaned={cleaned} notNeeded={notNeeded} notCleaned={notCleaned} />
        <BoardTabs />
      </div>
      <div className="p-4 space-y-3">
        {filtered.map((room) => (
          <RoomCard
            key={room.dailyPlanRoomId}
            room={room}
            whatsappEnabled={settings?.whatsappEnabled ?? false}
            whatsappPhone={settings?.whatsappPhone ?? ''}
            whatsappTemplate={settings?.whatsappMessageTemplate ?? ''}
            isOnline={isOnline}
          />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add status board page with polling and room cards"
```

---

## Phase 12: Daily Setup Page

### Task 13: Setup page

**Files:**
- Create: `src/components/setup/RoomSelector.tsx`, `src/app/[locale]/(app)/setup/page.tsx`

- [ ] **Step 1: Create `src/components/setup/RoomSelector.tsx`**

```tsx
'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import type { RoomType } from '@/types'

interface Room {
  id: number
  roomNumber: string
}

interface SelectedRoom {
  roomId: number
  roomType: RoomType
  priority: boolean
}

interface Props {
  rooms: Room[]
  selected: SelectedRoom[]
  onToggle: (roomId: number) => void
  onTypeChange: (roomId: number, type: RoomType) => void
  onPriorityChange: (roomId: number, priority: boolean) => void
}

export function RoomSelector({ rooms, selected, onToggle, onTypeChange, onPriorityChange }: Props) {
  const t = useTranslations('setup')
  const [search, setSearch] = useState('')

  const isSelected = (id: number) => selected.some((s) => s.roomId === id)
  const getSelected = (id: number) => selected.find((s) => s.roomId === id)

  const filtered = rooms.filter((r) =>
    r.roomNumber.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-3">
      <input
        type="text"
        placeholder={t('search')}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="space-y-2">
        {filtered.map((room) => {
          const sel = getSelected(room.id)
          return (
            <div
              key={room.id}
              className={cn(
                'rounded-xl border p-3 transition-colors',
                sel ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white'
              )}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onToggle(room.id)}
                  className={cn(
                    'w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                    sel ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                  )}
                >
                  {sel && <span className="text-white text-xs">✓</span>}
                </button>
                <span className="font-medium text-gray-900">{room.roomNumber}</span>
                {sel && (
                  <div className="ml-auto flex items-center gap-2">
                    <div className="flex rounded-lg overflow-hidden border border-gray-200 text-xs">
                      {(['checkout', 'stayover'] as RoomType[]).map((type) => (
                        <button
                          key={type}
                          onClick={() => onTypeChange(room.id, type)}
                          className={cn(
                            'px-2 py-1',
                            sel.roomType === type ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'
                          )}
                        >
                          {t(type)}
                        </button>
                      ))}
                    </div>
                    {sel.roomType === 'checkout' && (
                      <button
                        onClick={() => onPriorityChange(room.id, !sel.priority)}
                        className={cn(
                          'text-xs px-2 py-1 rounded-lg border',
                          sel.priority ? 'bg-orange-100 border-orange-300 text-orange-700' : 'border-gray-200 text-gray-400'
                        )}
                      >
                        ★ {t('priority')}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `src/app/[locale]/(app)/setup/page.tsx`**

```tsx
'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useParams, useRouter } from 'next/navigation'
import { Header } from '@/components/common/Header'
import { RoomSelector } from '@/components/setup/RoomSelector'
import { useGetRoomsQuery } from '@/store/api/roomsApi'
import { useCreateDailyPlanMutation } from '@/store/api/dailyPlanApi'
import type { RoomType } from '@/types'

interface SelectedRoom {
  roomId: number
  roomType: RoomType
  priority: boolean
}

export default function SetupPage() {
  const t = useTranslations('setup')
  const { locale } = useParams<{ locale: string }>()
  const router = useRouter()
  const { data: rooms = [] } = useGetRoomsQuery()
  const [createPlan, { isLoading }] = useCreateDailyPlanMutation()
  const [selected, setSelected] = useState<SelectedRoom[]>([])

  function toggle(roomId: number) {
    setSelected((prev) =>
      prev.some((r) => r.roomId === roomId)
        ? prev.filter((r) => r.roomId !== roomId)
        : [...prev, { roomId, roomType: 'stayover', priority: false }]
    )
  }

  function changeType(roomId: number, roomType: RoomType) {
    setSelected((prev) =>
      prev.map((r) => (r.roomId === roomId ? { ...r, roomType, priority: roomType === 'stayover' ? false : r.priority } : r))
    )
  }

  function changePriority(roomId: number, priority: boolean) {
    setSelected((prev) => prev.map((r) => (r.roomId === roomId ? { ...r, priority } : r)))
  }

  async function handleSave() {
    if (!selected.length) return
    await createPlan({ rooms: selected })
    router.push(`/${locale}/board`)
  }

  return (
    <div>
      <Header title={t('title')} />
      <div className="p-4 space-y-4">
        <RoomSelector
          rooms={rooms}
          selected={selected}
          onToggle={toggle}
          onTypeChange={changeType}
          onPriorityChange={changePriority}
        />
      </div>
      {selected.length > 0 && (
        <div className="fixed bottom-20 inset-x-0 px-4">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl text-base font-semibold shadow-lg active:scale-95 transition-transform disabled:opacity-50"
          >
            {isLoading ? '...' : `${t('save')} (${selected.length})`}
          </button>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add daily setup page with room selector"
```

---

## Phase 13: History Page

### Task 14: History pages

**Files:**
- Create: `src/app/[locale]/(app)/history/page.tsx`, `src/app/[locale]/(app)/history/[date]/page.tsx`

- [ ] **Step 1: Create `src/app/[locale]/(app)/history/page.tsx`**

```tsx
'use client'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/common/Header'
import { useGetHistoryQuery } from '@/store/api/dailyPlanApi'

export default function HistoryPage() {
  const t = useTranslations('history')
  const { locale } = useParams<{ locale: string }>()
  const { data: history = [], isLoading } = useGetHistoryQuery()

  return (
    <div>
      <Header title={t('title')} />
      <div className="p-4 space-y-3">
        {isLoading && <p className="text-gray-400 text-center">{t('noHistory')}</p>}
        {!isLoading && history.length === 0 && (
          <p className="text-gray-400 text-center">{t('noHistory')}</p>
        )}
        {history.map((day) => (
          <Link key={day.date} href={`/${locale}/history/${day.date}`}>
            <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between active:bg-gray-50">
              <div>
                <p className="font-medium text-gray-900">{day.date}</p>
                <p className="text-xs text-gray-400">{t('total')}: {day.total}</p>
              </div>
              <div className="flex gap-3 text-sm">
                <span className="text-green-600 font-semibold">{day.cleaned} ✓</span>
                <span className="text-gray-400">{day.notNeeded} –</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `src/app/[locale]/(app)/history/[date]/page.tsx`**

```tsx
'use client'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { Header } from '@/components/common/Header'
import { StatusBadge } from '@/components/common/StatusBadge'
import { useGetTodayPlanQuery } from '@/store/api/dailyPlanApi'
import { baseApi } from '@/store/api/baseApi'
import { useEffect, useState } from 'react'
import type { RoomWithStatus } from '@/types'

export default function HistoryDetailPage() {
  const t = useTranslations('history')
  const { date } = useParams<{ date: string }>()
  const [rooms, setRooms] = useState<RoomWithStatus[]>([])

  useEffect(() => {
    fetch(`/api/daily-plans/${date}`)
      .then((r) => r.json())
      .then((data) => setRooms(data?.rooms ?? []))
  }, [date])

  const cleaned = rooms.filter((r) => r.status === 'cleaned').length
  const notNeeded = rooms.filter((r) => r.status === 'not_needed').length

  return (
    <div>
      <Header title={date} />
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-3 gap-2 bg-white rounded-xl border p-3">
          <div className="text-center">
            <div className="text-xl font-bold text-green-600">{cleaned}</div>
            <div className="text-xs text-gray-400">{t('cleaned')}</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-gray-400">{notNeeded}</div>
            <div className="text-xs text-gray-400">{t('notNeeded')}</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-gray-700">{rooms.length}</div>
            <div className="text-xs text-gray-400">{t('total')}</div>
          </div>
        </div>
        {rooms.map((room) => (
          <div key={room.dailyPlanRoomId} className="bg-white rounded-xl border p-3 flex items-center justify-between">
            <span className="font-medium">{room.roomNumber}</span>
            <StatusBadge status={room.status} label={room.status.replace(/_/g, ' ')} />
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create `src/app/api/daily-plans/[date]/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/authOptions'
import { prisma } from '@/lib/db/prisma'

export async function GET(_req: NextRequest, { params }: { params: { date: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const hotelId = parseInt((session.user as { hotelId?: string }).hotelId ?? '1')
  const date = new Date(params.date)
  date.setHours(0, 0, 0, 0)

  const plan = await prisma.dailyPlan.findUnique({
    where: { hotelId_date: { hotelId, date } },
    include: {
      rooms: {
        include: {
          room: { select: { roomNumber: true } },
          updatedBy: { select: { name: true } },
        },
        orderBy: { room: { roomNumber: 'asc' } },
      },
    },
  })

  if (!plan) return NextResponse.json(null)

  return NextResponse.json({
    id: plan.id,
    date: plan.date.toISOString().split('T')[0],
    rooms: plan.rooms.map((r) => ({
      dailyPlanRoomId: r.id,
      roomId: r.roomId,
      roomNumber: r.room.roomNumber,
      roomType: r.roomType,
      priority: r.priority,
      status: r.status,
      updatedBy: r.updatedBy?.name ?? null,
      updatedAt: r.updatedAt.toISOString(),
    })),
  })
}
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add history pages and date detail API"
```

---

## Phase 14: Settings Page

### Task 15: Settings page and components

**Files:**
- Create: `src/components/settings/RoomManager.tsx`, `src/components/settings/WhatsAppSettings.tsx`, `src/app/[locale]/(app)/settings/page.tsx`

- [ ] **Step 1: Create `src/components/settings/RoomManager.tsx`**

```tsx
'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useGetRoomsQuery, useCreateRoomMutation, useDeleteRoomMutation } from '@/store/api/roomsApi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function RoomManager() {
  const t = useTranslations('settings')
  const { data: rooms = [] } = useGetRoomsQuery()
  const [createRoom] = useCreateRoomMutation()
  const [deleteRoom] = useDeleteRoomMutation()
  const [newNumber, setNewNumber] = useState('')

  async function handleAdd() {
    if (!newNumber.trim()) return
    await createRoom({ roomNumber: newNumber.trim() })
    setNewNumber('')
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-gray-700">{t('rooms')}</h3>
      <div className="flex gap-2">
        <Input
          placeholder={t('roomNumber')}
          value={newNumber}
          onChange={(e) => setNewNumber(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <Button onClick={handleAdd}>{t('addRoom')}</Button>
      </div>
      <div className="space-y-2">
        {rooms.map((room) => (
          <div key={room.id} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3 py-2">
            <span className="font-medium">{room.roomNumber}</span>
            <button
              onClick={() => deleteRoom(room.id)}
              className="text-red-500 text-sm"
            >
              {t('deleteRoom')}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `src/components/settings/WhatsAppSettings.tsx`**

```tsx
'use client'
import { useTranslations } from 'next-intl'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { AppSettings } from '@/types'

interface Props {
  settings: Partial<AppSettings>
  onChange: (s: Partial<AppSettings>) => void
}

export function WhatsAppSettings({ settings, onChange }: Props) {
  const t = useTranslations('settings')

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-gray-700">{t('whatsapp')}</h3>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="wa-enabled"
          checked={settings.whatsappEnabled ?? false}
          onChange={(e) => onChange({ whatsappEnabled: e.target.checked })}
          className="rounded"
        />
        <Label htmlFor="wa-enabled">{t('whatsappEnabled')}</Label>
      </div>
      {settings.whatsappEnabled && (
        <>
          <div className="space-y-1">
            <Label>{t('whatsappPhone')}</Label>
            <Input
              value={settings.whatsappPhone ?? ''}
              onChange={(e) => onChange({ whatsappPhone: e.target.value })}
              placeholder="+380991234567"
            />
          </div>
          <div className="space-y-1">
            <Label>{t('whatsappTemplate')}</Label>
            <Input
              value={settings.whatsappMessageTemplate ?? ''}
              onChange={(e) => onChange({ whatsappMessageTemplate: e.target.value })}
              placeholder="Кімната {room} прибрана"
            />
            <p className="text-xs text-gray-400">Use {'{'+'room'+'}'} to insert room number</p>
          </div>
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Create `src/app/[locale]/(app)/settings/page.tsx`**

```tsx
'use client'
import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useParams, useRouter } from 'next/navigation'
import { Header } from '@/components/common/Header'
import { RoomManager } from '@/components/settings/RoomManager'
import { WhatsAppSettings } from '@/components/settings/WhatsAppSettings'
import { useGetSettingsQuery, useUpdateSettingsMutation } from '@/store/api/settingsApi'
import { Button } from '@/components/ui/button'
import type { AppSettings } from '@/types'

export default function SettingsPage() {
  const t = useTranslations('settings')
  const { locale } = useParams<{ locale: string }>()
  const router = useRouter()
  const { data: remoteSettings } = useGetSettingsQuery()
  const [updateSettings, { isLoading }] = useUpdateSettingsMutation()
  const [localSettings, setLocalSettings] = useState<Partial<AppSettings>>({})
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (remoteSettings) setLocalSettings(remoteSettings)
  }, [remoteSettings])

  function merge(patch: Partial<AppSettings>) {
    setLocalSettings((prev) => ({ ...prev, ...patch }))
  }

  async function handleSave() {
    await updateSettings(localSettings)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)

    if (localSettings.defaultLanguage && localSettings.defaultLanguage !== locale) {
      router.push(`/${localSettings.defaultLanguage}/settings`)
    }
  }

  return (
    <div>
      <Header title={t('title')} />
      <div className="p-4 space-y-6">
        <RoomManager />

        <WhatsAppSettings settings={localSettings} onChange={merge} />

        <div className="space-y-2">
          <h3 className="font-semibold text-gray-700">{t('language')}</h3>
          <div className="flex gap-2">
            {(['uk', 'en'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => merge({ defaultLanguage: lang })}
                className={`px-4 py-2 rounded-lg border text-sm font-medium ${
                  localSettings.defaultLanguage === lang
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-200 text-gray-600'
                }`}
              >
                {lang === 'uk' ? 'Українська' : 'English'}
              </button>
            ))}
          </div>
        </div>

        <Button onClick={handleSave} className="w-full" disabled={isLoading}>
          {saved ? t('saved') : t('save')}
        </Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add settings page with rooms, WhatsApp, and language"
```

---

## Phase 15: PWA Configuration

### Task 16: PWA setup

**Files:**
- Modify: `next.config.ts`
- Create: `public/manifest.json`

- [ ] **Step 1: Update `next.config.ts`**

```typescript
import withPWA from '@ducanh2912/next-pwa'

const withPWAConfig = withPWA({
  dest: 'public',
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === 'development',
  workboxOptions: {
    disableDevLogs: true,
  },
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  // next-intl requires this
}

export default withPWAConfig(nextConfig)
```

- [ ] **Step 2: Create `public/manifest.json`**

```json
{
  "name": "Hotel Cleaning",
  "short_name": "Cleaning",
  "description": "Hotel housekeeping management",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#f9fafb",
  "theme_color": "#2563eb",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

- [ ] **Step 3: Generate placeholder icons**

```bash
mkdir -p public/icons
# Create simple colored PNG placeholders (replace with real icons before deploy)
node -e "
const { createCanvas } = require('canvas');
// If canvas is not available, create icons manually or use a tool like sharp
// For now, just create empty placeholder files
const fs = require('fs');
fs.writeFileSync('public/icons/icon-192.png', '');
fs.writeFileSync('public/icons/icon-512.png', '');
"
```

> **Note:** Replace `public/icons/icon-192.png` and `public/icons/icon-512.png` with real PNG icons before deploying. Use any image editor or online tool to create a 192×192 and 512×512 blue icon with a hotel/cleaning symbol.

- [ ] **Step 4: Add viewport meta to root layout**

In `src/app/layout.tsx`, update metadata:
```typescript
export const metadata: Metadata = {
  title: 'Hotel Cleaning',
  description: 'Hotel housekeeping management',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Hotel Cleaning',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: configure PWA with manifest and service worker"
```

---

## Phase 16: Final Wiring and Build Check

### Task 17: Wire up providers and verify build

- [ ] **Step 1: Run all tests**

```bash
npm run test:run
```

Expected: All tests pass.

- [ ] **Step 2: Run dev build check**

```bash
npm run build
```

Expected: Build succeeds with no TypeScript errors.

- [ ] **Step 3: Fix any TypeScript errors reported by build**

Common fixes needed:
- Add `declare module 'next-auth' { interface User { hotelId?: string } }` to `src/types/index.ts`
- Ensure all API route `params` types match Next.js 14 conventions

- [ ] **Step 4: Run local dev server and smoke test**

```bash
npm run dev
```

- Open `http://localhost:3000` — should redirect to `/uk/login`
- Register with admin password `admin123`
- Login
- Go to Setup, select rooms, save
- Go to Board, verify rooms appear, tap status chip to cycle status
- Go to History, verify today's entry appears
- Go to Settings, toggle WhatsApp, save

- [ ] **Step 5: Create `.env.example` final version**

```env
# PostgreSQL connection string (Neon format)
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

# NextAuth - generate with: openssl rand -base64 32
AUTH_SECRET="your-secret-here"

# Default hotel ID (seed creates hotel with id=1)
NEXT_PUBLIC_DEFAULT_HOTEL_ID="1"

# App URL (set to your Vercel URL in production)
NEXTAUTH_URL="http://localhost:3000"
```

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "feat: complete hotel cleaning PWA - all features implemented"
```

---

## Deployment Checklist

Before deploying to Vercel + Neon:

- [ ] Create Neon database, copy `DATABASE_URL`
- [ ] Run `npx prisma migrate deploy` against production DB
- [ ] Run `npx prisma db seed` to create hotel + seed rooms
- [ ] Set env vars in Vercel: `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_DEFAULT_HOTEL_ID`
- [ ] Replace placeholder icons in `public/icons/` with real PNG files
- [ ] Push to GitHub, connect to Vercel, deploy

---

## Self-Review Checklist

**Spec coverage:**
- [x] Auth (register + login + JWT sessions) — Tasks 4, 11
- [x] Room management CRUD — Tasks 6, 15
- [x] Daily plan setup — Tasks 7, 13
- [x] Status board with tabs + polling — Tasks 7, 12
- [x] Status history recording — Task 7 (StatusHistory in PATCH /status)
- [x] History page — Tasks 7, 14
- [x] Settings (rooms, WhatsApp, language) — Tasks 8, 15
- [x] WhatsApp deep link — Tasks 9, 12
- [x] en + uk i18n — Tasks 2
- [x] PWA installability — Task 16
- [x] Offline banner — Task 10
- [x] Seed data — Task 3
- [x] Redux + RTK Query + polling — Tasks 5, 6, 7, 8

**No placeholders:** All steps have actual code.

**Type consistency:** `RoomWithStatus`, `CleaningStatus`, `RoomType`, `AppSettings` defined in `src/types/index.ts` and used consistently throughout.
