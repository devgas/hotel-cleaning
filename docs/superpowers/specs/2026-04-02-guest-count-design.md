# Guest Count per Room — Design Spec

**Date:** 2026-04-02  
**Status:** Approved

## Summary

Add the ability to record how many guests are in a room (1–5) for each day's cleaning plan. The count is per-day (stored on `DailyPlanRoom`), defaults to 1, and is editable both during setup and from the board's long-press editor.

---

## Data Model

Add one column to `DailyPlanRoom` in `prisma/schema.prisma`:

```prisma
guestCount Int @default(1)
```

- Range enforced in application logic: min 1, max 5.
- Default 1 means no migration side-effects on existing rows.
- No changes to `Room` (guest count is not a permanent property of the room).

---

## API Changes

### GET `/api/daily-plans/today` and `/api/daily-plans/[date]`

Add `guestCount` to the room mapping in both route handlers:

```ts
guestCount: r.guestCount,
```

### PATCH `/api/daily-plan-rooms/[id]/type`

Extend the existing endpoint to accept and persist `guestCount`:

```ts
// body may now include: { roomType, priority, priorityTime, guestCount }
// clamp to 1–5 before saving
guestCount: Math.min(5, Math.max(1, body.guestCount ?? existing.guestCount))
```

### POST `/api/daily-plans` (create/update plan)

Accept `guestCount` per room in the request body (default 1 if omitted). Persist it on `DailyPlanRoom` create and update.

---

## TypeScript Types

In `src/types/index.ts`, add to `RoomWithStatus`:

```ts
guestCount: number
```

In `src/store/api/dailyPlanApi.ts`, add to `CreatePlanInput.rooms`:

```ts
guestCount?: number
```

Add to `updateRoomType` mutation input:

```ts
guestCount?: number
```

---

## UI: RoomCard (board view)

**Badge:** Show `👤 N` badge alongside roomType/priority badges when `guestCount > 1`. Hidden for default single-guest rooms to avoid clutter.

**Editor sheet (long-press):** Add a "Guests" row with a +/− stepper between the Type and Priority rows:

- Minus button: decrements, disabled at 1
- Plus button: increments, disabled at 5
- Count displayed in centre
- Calls `updateRoomType` mutation with new `guestCount` on each tap

---

## UI: RoomSelector (setup screen)

For each selected room row, add a compact +/− stepper aligned to the right of the type buttons. Only visible when the room is selected. Calls `onGuestCountChange(roomId, count)` callback (new prop).

---

## UI: Setup Page

- Add `guestCount` to the `SelectedRoom` interface.
- Default to `1` when a room is first toggled on.
- Pass `guestCount` through to `createDailyPlan` payload.
- Add `onGuestCountChange` handler mirroring the existing `onPriorityChange` pattern.

---

## Out of Scope

- No guest count in `StatusHistory` (not an audited field).
- No guest count filtering or sorting on the board.
- No guest count in WhatsApp message templates.
