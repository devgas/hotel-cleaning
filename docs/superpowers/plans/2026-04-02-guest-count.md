# Guest Count Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a per-day guest count (1–5) to each room in a daily cleaning plan, visible on the board and editable during setup and via the long-press editor.

**Architecture:** `guestCount` lives on `DailyPlanRoom` (per-day, not permanent on Room). It defaults to 1 so existing data needs no backfill. The existing PATCH `/api/daily-plan-rooms/[id]/type` endpoint is extended to also accept `guestCount`. The setup flow passes it through `createDailyPlan`. UI shows a badge on the board card when count > 1, and +/− steppers in the editor sheet and setup row.

**Tech Stack:** Next.js 15 App Router, Prisma (PostgreSQL), RTK Query, Zod, Tailwind CSS, next-intl

---

## Files Modified / Created

| File | Change |
|------|--------|
| `prisma/schema.prisma` | Add `guestCount Int @default(1)` to `DailyPlanRoom` |
| `src/types/index.ts` | Add `guestCount: number` to `RoomWithStatus` |
| `src/app/api/daily-plans/today/route.ts` | Include `guestCount` in GET response |
| `src/app/api/daily-plans/[date]/route.ts` | Include `guestCount` in GET response |
| `src/app/api/daily-plans/route.ts` | Accept + persist `guestCount` in POST |
| `src/app/api/daily-plan-rooms/[id]/type/route.ts` | Accept + persist `guestCount` in PATCH |
| `src/store/api/dailyPlanApi.ts` | Add `guestCount` to mutation inputs |
| `src/components/board/RoomCard.tsx` | Badge + stepper in editor sheet |
| `src/components/setup/RoomSelector.tsx` | Compact stepper per selected room |
| `src/app/[locale]/(app)/setup/page.tsx` | `guestCount` in `SelectedRoom`, handler, payload |

---

### Task 1: Schema — add guestCount to DailyPlanRoom

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add the field**

In `prisma/schema.prisma`, add `guestCount` to `DailyPlanRoom` after the `priority` line:

```prisma
model DailyPlanRoom {
  id              Int             @id @default(autoincrement())
  dailyPlanId     Int
  roomId          Int
  roomType        RoomType        @default(stayover)
  priority        Boolean         @default(false)
  priorityTime    String?
  guestCount      Int             @default(1)
  status          CleaningStatus  @default(not_cleaned_yet)
  updatedByUserId Int?
  updatedAt       DateTime        @updatedAt
  dailyPlan       DailyPlan       @relation(fields: [dailyPlanId], references: [id])
  room            Room            @relation(fields: [roomId], references: [id])
  updatedBy       User?           @relation(fields: [updatedByUserId], references: [id])
  history         StatusHistory[]

  @@unique([dailyPlanId, roomId])
}
```

- [ ] **Step 2: Push schema to database**

```bash
npx prisma db push
```

Expected output includes: `Your database is now in sync with your Prisma schema.`

- [ ] **Step 3: Regenerate Prisma client**

```bash
npx prisma generate
```

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma src/generated/
git commit -m "feat: add guestCount to DailyPlanRoom schema"
```

---

### Task 2: Types — add guestCount to RoomWithStatus

**Files:**
- Modify: `src/types/index.ts`

- [ ] **Step 1: Add the field to the interface**

In `src/types/index.ts`, add `guestCount` to `RoomWithStatus`:

```ts
export interface RoomWithStatus {
  id: number
  roomId: number
  roomNumber: string
  roomType: RoomType
  priority: boolean
  priorityTime?: string | null
  guestCount: number
  status: CleaningStatus
  updatedBy?: string | null
  updatedAt: string
  dailyPlanRoomId: number
}
```

- [ ] **Step 2: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: add guestCount to RoomWithStatus type"
```

---

### Task 3: API — include guestCount in GET responses

**Files:**
- Modify: `src/app/api/daily-plans/today/route.ts`
- Modify: `src/app/api/daily-plans/[date]/route.ts`

- [ ] **Step 1: Update today route**

In `src/app/api/daily-plans/today/route.ts`, add `guestCount` to the rooms map inside `GET` (around line 33):

```ts
return NextResponse.json({
  id: plan.id,
  date: plan.date.toISOString(),
  rooms: plan.rooms.map((r) => ({
    dailyPlanRoomId: r.id,
    roomId: r.roomId,
    roomNumber: r.room.roomNumber,
    roomType: r.roomType,
    priority: r.priority,
    priorityTime: r.priorityTime,
    guestCount: r.guestCount,
    status: r.status,
    updatedBy: r.updatedBy?.name ?? null,
    updatedAt: r.updatedAt.toISOString(),
  })),
})
```

- [ ] **Step 2: Update [date] route**

In `src/app/api/daily-plans/[date]/route.ts`, add `guestCount` to the rooms map inside `GET` (around line 33):

```ts
return NextResponse.json({
  id: plan.id,
  date: plan.date.toISOString().split('T')[0],
  rooms: plan.rooms.map((r) => ({
    dailyPlanRoomId: r.id,
    roomId: r.roomId,
    roomNumber: r.room.roomNumber,
    roomType: r.roomType,
    priority: r.priority,
    priorityTime: r.priorityTime,
    guestCount: r.guestCount,
    status: r.status,
    updatedBy: r.updatedBy?.name ?? null,
    updatedAt: r.updatedAt.toISOString(),
  })),
})
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/daily-plans/today/route.ts src/app/api/daily-plans/[date]/route.ts
git commit -m "feat: include guestCount in daily-plans GET responses"
```

---

### Task 4: API — accept guestCount in PATCH /daily-plan-rooms/[id]/type

**Files:**
- Modify: `src/app/api/daily-plan-rooms/[id]/type/route.ts`

- [ ] **Step 1: Extend the Zod schema and update handler**

Replace the entire file content of `src/app/api/daily-plan-rooms/[id]/type/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/authOptions'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'
import { defaultPriorityTime, isValidPriorityTime } from '@/lib/dailyPlans/priorityTime'

const typeSchema = z.object({
  roomType: z.enum(['checkout', 'stayover']),
  priority: z.boolean().optional(),
  priorityTime: z.string().nullable().optional(),
  guestCount: z.number().int().min(1).max(5).optional(),
}).superRefine((value, ctx) => {
  if (!value.priority) return

  if (!isValidPriorityTime(value.priorityTime)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['priorityTime'],
      message: 'Priority time must be between 09:00 and 23:00',
    })
  }
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = typeSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const userId = parseInt(session.user!.id!)
  const { id } = await params
  const planRoomId = parseInt(id)

  const current = await prisma.dailyPlanRoom.findUnique({ where: { id: planRoomId } })
  if (!current) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const updated = await prisma.dailyPlanRoom.update({
    where: { id: planRoomId },
    data: {
      roomType: parsed.data.roomType,
      priority: parsed.data.priority ?? current.priority,
      priorityTime:
        parsed.data.roomType === 'stayover'
          ? null
          : parsed.data.priority ?? current.priority
            ? (parsed.data.priorityTime ?? current.priorityTime ?? defaultPriorityTime)
            : null,
      guestCount: parsed.data.guestCount ?? current.guestCount,
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

  return NextResponse.json({
    roomType: updated.roomType,
    priority: updated.priority,
    priorityTime: updated.priorityTime,
    guestCount: updated.guestCount,
  })
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/daily-plan-rooms/[id]/type/route.ts
git commit -m "feat: accept guestCount in PATCH daily-plan-rooms type endpoint"
```

---

### Task 5: API — accept guestCount in POST /api/daily-plans

**Files:**
- Modify: `src/app/api/daily-plans/route.ts`
- Modify: `src/lib/dailyPlans/validateDailyPlan.ts`

- [ ] **Step 1: Read validateDailyPlan to understand current schema**

Read `src/lib/dailyPlans/validateDailyPlan.ts` to see the Zod schema for plan creation.

- [ ] **Step 2: Add guestCount to the room schema in validateDailyPlan**

In `src/lib/dailyPlans/validateDailyPlan.ts`, add `guestCount` to the rooms item schema:

```ts
// Find the rooms item object shape and add:
guestCount: z.number().int().min(1).max(5).optional().default(1),
```

The exact change depends on what you find in that file, but the room item object should include this field.

- [ ] **Step 3: Persist guestCount in the POST route**

In `src/app/api/daily-plans/route.ts`, add `guestCount: r.guestCount` wherever `DailyPlanRoom` is created or updated. There are two places:

**In the `existing` branch — `tx.dailyPlanRoom.create`** (around line 70):
```ts
await tx.dailyPlanRoom.create({
  data: {
    dailyPlanId: existing.id,
    roomId: room.roomId,
    roomType: room.roomType,
    priority: room.priority,
    guestCount: room.guestCount ?? 1,
    status: 'not_cleaned_yet',
    updatedByUserId: userId,
  },
})
```

**In the `existing` branch — `tx.dailyPlanRoom.update`** (around line 58):
```ts
await tx.dailyPlanRoom.update({
  where: { id: existingPlanRoomId },
  data: {
    roomType: room.roomType,
    priority: room.priority,
    priorityTime: room.priority ? room.priorityTime ?? '09:00' : null,
    guestCount: room.guestCount ?? 1,
    updatedByUserId: userId,
  },
})
```

**In the new plan branch — `prisma.dailyPlan.create`** (around line 97):
```ts
rooms: {
  create: parsed.data.rooms.map((r) => ({
    roomId: r.roomId,
    roomType: r.roomType,
    priority: r.priority,
    priorityTime: r.priority ? r.priorityTime ?? '09:00' : null,
    guestCount: r.guestCount ?? 1,
    status: 'not_cleaned_yet' as const,
    updatedByUserId: userId,
  })),
},
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/dailyPlans/validateDailyPlan.ts src/app/api/daily-plans/route.ts
git commit -m "feat: accept guestCount in POST daily-plans create/update"
```

---

### Task 6: Store — add guestCount to RTK Query mutations

**Files:**
- Modify: `src/store/api/dailyPlanApi.ts`

- [ ] **Step 1: Add guestCount to CreatePlanInput and updateRoomType mutation**

Replace the relevant interfaces and mutation types in `src/store/api/dailyPlanApi.ts`:

```ts
interface CreatePlanInput {
  date?: string
  rooms: {
    roomId: number
    roomType: 'checkout' | 'stayover'
    priority: boolean
    priorityTime?: string | null
    guestCount?: number
  }[]
}
```

And update the `updateRoomType` mutation input type:

```ts
updateRoomType: build.mutation<
  { roomType: RoomType; priority: boolean; priorityTime: string | null; guestCount: number },
  { id: number; roomType: RoomType; priority?: boolean; priorityTime?: string | null; guestCount?: number }
>({
  query: ({ id, ...body }) => ({
    url: `/daily-plan-rooms/${id}/type`,
    method: 'PATCH',
    body,
  }),
  invalidatesTags: ['DailyPlanRooms'],
}),
```

- [ ] **Step 2: Commit**

```bash
git add src/store/api/dailyPlanApi.ts
git commit -m "feat: add guestCount to dailyPlanApi mutation types"
```

---

### Task 7: UI — RoomCard badge and editor stepper

**Files:**
- Modify: `src/components/board/RoomCard.tsx`

- [ ] **Step 1: Add draftGuestCount state and initialize it in openEditor**

In `RoomCard.tsx`, after the `draftPriorityTime` state (line 48), add:

```ts
const [draftGuestCount, setDraftGuestCount] = useState(room.guestCount)
```

In `openEditor` (around line 104), add initialization:

```ts
function openEditor() {
  setDraftRoomType(room.roomType)
  setDraftPriority(room.priority)
  setDraftPriorityTime(room.priorityTime ?? defaultPriorityTime)
  setDraftGuestCount(room.guestCount)
  setIsEditorOpen(true)
}
```

- [ ] **Step 2: Pass guestCount in handleSaveChanges**

Update `handleSaveChanges` (around line 145):

```ts
async function handleSaveChanges() {
  await updateRoomType({
    id: room.dailyPlanRoomId,
    roomType: draftRoomType,
    priority: draftPriority,
    priorityTime: draftPriority ? draftPriorityTime : null,
    guestCount: draftGuestCount,
  }).unwrap()
  setIsEditorOpen(false)
}
```

- [ ] **Step 3: Add guest count badge to the card display**

In the card's badge area (around line 170–178), add the guest badge after the priority badge:

```tsx
<div className="flex items-center gap-2">
  <span className="text-lg font-bold text-gray-900">{room.roomNumber}</span>
  {room.priority && (
    <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">
      ★ {room.priorityTime ?? defaultPriorityTime}
    </span>
  )}
  {room.guestCount > 1 && (
    <span className="text-xs bg-green-50 text-green-700 px-1.5 py-0.5 rounded">
      👤 {room.guestCount}
    </span>
  )}
  <span className="text-xs text-gray-400">{roomTypeLabel}</span>
</div>
```

- [ ] **Step 4: Add the guest count stepper to the editor sheet**

In the `Sheet` content's `<div className="space-y-4 px-4 pb-2">`, add the Guests row between the room type selector and the priority button (after the closing `</div>` of the roomType section, around line 219):

```tsx
<div className="space-y-2">
  <p className="text-sm font-medium text-gray-700">Guests</p>
  <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2">
    <button
      onClick={() => setDraftGuestCount((n) => Math.max(1, n - 1))}
      disabled={draftGuestCount <= 1}
      className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 font-bold text-lg disabled:opacity-30"
    >
      −
    </button>
    <span className="flex-1 text-center text-xl font-bold text-gray-900">
      {draftGuestCount}
    </span>
    <button
      onClick={() => setDraftGuestCount((n) => Math.min(5, n + 1))}
      disabled={draftGuestCount >= 5}
      className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-lg disabled:opacity-30"
    >
      +
    </button>
  </div>
</div>
```

- [ ] **Step 5: Commit**

```bash
git add src/components/board/RoomCard.tsx
git commit -m "feat: add guest count badge and stepper to RoomCard"
```

---

### Task 8: UI — RoomSelector stepper in setup

**Files:**
- Modify: `src/components/setup/RoomSelector.tsx`

- [ ] **Step 1: Add guestCount to SelectedRoom interface and new prop**

Update the `SelectedRoom` interface and `Props` in `RoomSelector.tsx`:

```ts
interface SelectedRoom {
  roomId: number
  roomType: RoomType
  priority: boolean
  priorityTime?: string | null
  guestCount: number
}

interface Props {
  rooms: Room[]
  selected: SelectedRoom[]
  onToggle: (roomId: number) => void
  onTypeChange: (roomId: number, type: RoomType) => void
  onPriorityChange: (roomId: number, priority: boolean) => void
  onPriorityTimeChange: (roomId: number, priorityTime: string) => void
  onGuestCountChange: (roomId: number, guestCount: number) => void
  searchClassName?: string
}
```

Add `onGuestCountChange` to the destructured props in the function signature.

- [ ] **Step 2: Add the compact stepper to the selected room row**

Inside the `{sel && (...)}` block, after the priority/priorityTime controls (around line 130), add:

```tsx
<div
  className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2 py-1"
  onClick={(e) => e.stopPropagation()}
>
  <button
    onClick={(e) => {
      e.stopPropagation()
      onGuestCountChange(room.id, Math.max(1, sel.guestCount - 1))
    }}
    disabled={sel.guestCount <= 1}
    className="w-5 h-5 rounded-full bg-gray-200 text-gray-600 font-bold text-xs disabled:opacity-30 flex items-center justify-center"
  >
    −
  </button>
  <span className="text-xs font-bold text-gray-700 min-w-[28px] text-center">
    👤 {sel.guestCount}
  </span>
  <button
    onClick={(e) => {
      e.stopPropagation()
      onGuestCountChange(room.id, Math.min(5, sel.guestCount + 1))
    }}
    disabled={sel.guestCount >= 5}
    className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-xs disabled:opacity-30 flex items-center justify-center"
  >
    +
  </button>
</div>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/setup/RoomSelector.tsx
git commit -m "feat: add guest count stepper to RoomSelector"
```

---

### Task 9: UI — Setup page wires guestCount through

**Files:**
- Modify: `src/app/[locale]/(app)/setup/page.tsx`

- [ ] **Step 1: Add guestCount to SelectedRoom interface**

In `setup/page.tsx`, update the `SelectedRoom` interface (around line 13):

```ts
interface SelectedRoom {
  roomId: number
  roomType: RoomType
  priority: boolean
  priorityTime?: string | null
  guestCount: number
}
```

- [ ] **Step 2: Default guestCount to 1 when toggling a room on**

In the `toggle` function (around line 137), add `guestCount: 1` to the new room object:

```ts
function toggle(roomId: number) {
  updateSelected((prev) =>
    prev.some((r) => r.roomId === roomId)
      ? prev.filter((r) => r.roomId !== roomId)
      : [...prev, { roomId, roomType: 'stayover', priority: false, priorityTime: null, guestCount: 1 }]
  )
}
```

- [ ] **Step 3: Add getInitialSelected guestCount**

In `getInitialSelected` (around line 126):

```ts
function getInitialSelected(plan: typeof todayPlan) {
  return (
    plan?.rooms.map((room) => ({
      roomId: room.roomId,
      roomType: room.roomType,
      priority: room.priority,
      priorityTime: room.priorityTime ?? null,
      guestCount: room.guestCount,
    })) ?? []
  )
}
```

Also update the two `selectedByTab` mappings (around line 88–103):

```ts
const selectedByTab = useMemo(
  () => ({
    today:
      todayPlan?.rooms.map((room) => ({
        roomId: room.roomId,
        roomType: room.roomType,
        priority: room.priority,
        priorityTime: room.priorityTime ?? null,
        guestCount: room.guestCount,
      })) ?? [],
    tomorrow:
      tomorrowPlan?.rooms.map((room) => ({
        roomId: room.roomId,
        roomType: room.roomType,
        priority: room.priority,
        priorityTime: room.priorityTime ?? null,
        guestCount: room.guestCount,
      })) ?? [],
  }),
  [todayPlan, tomorrowPlan]
)
```

- [ ] **Step 4: Add changeGuestCount handler**

After `changePriorityTime` (around line 179), add:

```ts
function changeGuestCount(roomId: number, guestCount: number) {
  updateSelected((prev) =>
    prev.map((r) => (r.roomId === roomId ? { ...r, guestCount } : r))
  )
}
```

- [ ] **Step 5: Pass onGuestCountChange to both RoomSelector instances**

Both `<RoomSelector>` usages (for today and tomorrow tabs) need the new prop:

```tsx
<RoomSelector
  rooms={rooms}
  selected={selectedOverrides.today ?? getInitialSelected(todayPlan)}
  onToggle={toggle}
  onTypeChange={changeType}
  onPriorityChange={changePriority}
  onPriorityTimeChange={changePriorityTime}
  onGuestCountChange={changeGuestCount}
  searchClassName="sticky top-[117px] z-20 -mt-1 pb-3 pt-1"
/>
```

(Apply the same to the tomorrow tab's `<RoomSelector>`.)

- [ ] **Step 6: Commit**

```bash
git add src/app/[locale]/\(app\)/setup/page.tsx
git commit -m "feat: wire guestCount through setup page"
```

---

## Self-Review

- **Spec coverage:** Schema ✓, GET responses ✓, PATCH type endpoint ✓, POST create/update ✓, types ✓, RoomCard badge ✓, RoomCard editor stepper ✓, RoomSelector stepper ✓, setup page wiring ✓
- **Placeholders:** None — all steps contain full code
- **Type consistency:** `guestCount: number` used throughout; `SelectedRoom.guestCount` defined before use in Tasks 8 & 9; `draftGuestCount` state only referenced after being declared in Task 7
- **Out of scope respected:** No StatusHistory changes, no sorting/filtering changes, no WhatsApp template changes
