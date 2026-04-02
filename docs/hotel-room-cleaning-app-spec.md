# Hotel Room Cleaning PWA — Product & Technical Specification

## Purpose
Build a **mobile-first hotel housekeeping application** using **React / Next.js / Tailwind CSS / Redux** with **PWA support for Android**.

The app helps housekeeping staff track which rooms are:
- cleaned
- not cleaned yet
- not needed

It must support daily work for two main room types:
1. **Checkout rooms** — guests have checked out, room must be prepared for next guest
2. **Stayover rooms** — guest is still living in the room and room needs daily cleaning

Some checkout rooms can be marked as **priority**.

The app will be used by **multiple people at the same time**, so room statuses must be shared between users through a database and API.

The app should save the result for each day and start each new day with a setup screen where the user chooses the rooms for that day.

Main translation language should be **English**, but the **default UI language must be Ukrainian**. In a future version, two additional Ukrainian dialect/localization variants will be added.

---

## Main Goals
- Easy room status tracking on Android phones as a PWA
- Shared real-time or near-real-time updates between several workers
- Simple daily setup for the current day
- Save history for each day
- Optional WhatsApp message sending using predefined text from settings
- Very simple user registration/login flow

---

## Target Users
- Housekeeping staff
- Housekeeping supervisor / admin
- Small hotel teams that need fast room tracking on mobile devices

---

## Core Features

### 1. Authentication
Simple registration and login process.

#### Registration fields
- Name
- Password
- Admin password

#### Notes
- There is one shared **admin pass** used during registration
- For **v1**, all users inside the same hotel have the **same permissions**
- Passwords must be hashed
- Authentication can be session-based or JWT-based
- In future versions, role separation can be added if needed

#### Permission model for v1
- All registered users in the hotel can:
  - manage rooms
  - configure settings
  - create daily plans
  - update room statuses
  - view history

---

### 2. Room Settings Management
Settings page to manage all hotel room numbers.

#### Requirements
- Add room number
- Edit room number
- Delete room number
- View all room numbers
- Optional extra fields for future:
  - floor
  - building/section
  - notes

#### Expected behavior
- This is the master list of available rooms
- Daily setup will use this list

---

### 3. Daily Initialization Flow
When a new day begins, user should see a setup screen before entering the working board.

#### Daily setup screen must allow:
- Select which rooms are **stayover rooms** for today
- Select which rooms are **checkout rooms** for today
- For checkout rooms, optionally mark **priority**
- Save the daily plan

#### Rules
- The number of rooms changes every day
- A room should normally belong to only one type for the same day, but type switching should be allowed if operations require it
- Each day has its own dataset
- If no setup exists for today, app redirects to setup screen first

#### Nice-to-have
- Copy yesterday’s stayover rooms as a starting point
- Quick search/filter for room numbers

---

### 4. Daily Status Board
Main page showing current statuses of rooms.

#### Room groups
Display rooms in separate sections:
- Priority checkout rooms
- Regular checkout rooms
- Stayover rooms

#### Room statuses
Each room for the day should have one of these statuses:
- **Not cleaned yet**
- **Cleaned**
- **Not needed**

#### Actions
User can tap a room and change its status.

#### UI expectations
- Very fast mobile interaction
- Large tap targets
- Clear visual colors/styles for statuses
- Sort by room number inside each group
- Priority checkout rooms should always be shown first

#### Additional metadata
For each status change, save:
- user who changed it
- timestamp
- optional note (future)

#### Board visibility
- All users should be able to see **who cleaned or last updated** each room directly on the board

---

### 5. Shared Multi-User Synchronization
Because several workers may use the app at the same time, statuses must be visible to everyone.

#### Requirements
- Shared database storage
- API endpoints for read/write
- UI should update when another user changes a room

#### Implementation options
Preferred:
- polling every 10–30 seconds for v1

Optional better solution:
- WebSocket / realtime updates

#### Conflict handling
- Last write wins for v1
- Save audit trail of changes if possible

---

### 6. WhatsApp Message Feature
For a room status action, user may optionally send a short message to a WhatsApp chat.

#### Requirement
- In settings, admin can configure predefined short message text
- There should be a checkbox like **Send message**
- If checkbox is checked during status update, app should open/send message to WhatsApp chat with predefined text

#### Important note
For web/PWA, direct automatic WhatsApp sending is limited.
Most realistic v1 behavior:
- open WhatsApp deep link / WhatsApp Web with prefilled text
- message is sent **from the user**, not from a bot
- user confirms send manually in WhatsApp

#### Settings needed
- One WhatsApp target phone number or chat link for the hotel
- Default predefined message text
- Enable/disable WhatsApp integration

#### Example use case
When a priority checkout room is cleaned, worker checks **Send message**, and the app opens WhatsApp with prefilled text like:

> Room 205 is ready.

---

### 7. Daily History / Archive
The app should save results for each day.

#### Requirements
- Store daily room plan
- Store final statuses for each room
- Store timestamps and user actions
- Ability to open previous days and review them

#### Archive screen
- list of dates
- tap a date to see summary
- summary counts:
  - total rooms
  - cleaned
  - not cleaned yet
  - not needed
  - checkout count
  - stayover count
  - priority checkout count

---

### 8. Localization / Internationalization
#### Requirements
- Main translation source language: **English**
- Default display language: **Ukrainian**
- Future support:
  - English
  - Ukrainian
  - Ukrainian dialect 1
  - Ukrainian dialect 2

#### Recommendation
Use translation keys and locale files from the beginning.

Example structure:
- `en.json`
- `uk.json`
- `uk-dialect-1.json`
- `uk-dialect-2.json`

#### Important
Do not hardcode UI text directly inside components.

---

## Suggested Screens

### 1. Login Page
- Name
- Password
- Login button
- Link to registration

### 2. Registration Page
- Name
- Password
- Admin password
- Register button

### 3. Daily Setup Page
- Today’s date
- Search rooms
- Select stayover rooms
- Select checkout rooms
- Checkbox or icon for priority on checkout rooms
- Save day setup button

### 4. Main Status Board
- Header with date
- Summary counters
- Filters/tabs:
  - All
  - Priority checkout
  - Checkout
  - Stayover
- Room cards/list items
- Status buttons:
  - Cleaned
  - Not needed
  - Not cleaned yet
- Optional checkbox: Send message
- Show who last updated the room

### 5. Settings Page
- Manage rooms
- WhatsApp message template
- WhatsApp destination number/link
- Language selection
- Polling interval or sync setting (optional)

### 6. History Page
- List of previous days
- Daily summary
- Open specific day details

### 7. User Management
Not required for v1 because all users have the same permissions per hotel.

---

## Functional Requirements

### Authentication
- Users can register with name, password, and admin password
- Users can log in and stay logged in on device
- Users can log out

### Room Master Data
- Any registered user in the hotel can create, edit, delete room numbers in v1
- Rooms are reusable every day

### Daily Planning
- Each calendar day has one daily plan
- Daily plan includes selected checkout and stayover rooms
- Checkout rooms can have priority flag
- Room type can be changed during the day if needed, while preserving history

### Status Management
- Every room in a daily plan has current status
- Users can change status multiple times during the day
- Last status is current visible value
- Status changes are visible to all users

### Messaging
- App can generate/open WhatsApp message if enabled
- Message text comes from settings template
- Message is sent manually by the user through WhatsApp

### History
- Past days remain stored
- Users can review previous daily plans and statuses

### Localization
- UI supports multiple languages
- Ukrainian is default

### PWA
- Installable on Android
- Responsive mobile-first layout
- Basic offline shell support
- If offline, show cached UI and clear sync warning

---

## Non-Functional Requirements
- Mobile-first UI
- Good performance on mid-range Android devices
- Installable PWA
- Secure password handling
- Simple deployment
- Clean architecture for future scaling

---

## Recommended Tech Stack

### Frontend
- **Next.js**
- **React**
- **TypeScript**
- **Tailwind CSS**
- **Redux Toolkit** for client state
- **next-pwa** or modern PWA setup for installability and service worker support
- **i18n library** such as `next-intl` or `react-i18next`

### Backend
Choose one of these approaches:

#### Option A — Next.js full-stack
- Next.js API routes / route handlers
- PostgreSQL
- Prisma ORM
- NextAuth or custom JWT auth

#### Option B — Separate backend
- Next.js frontend
- Node.js / Express or NestJS backend
- PostgreSQL
- Prisma or TypeORM

### Database
- **PostgreSQL** preferred

### Deployment
- Vercel for frontend/full-stack Next.js
- Neon / Supabase / Railway / managed PostgreSQL for database

---

## Suggested Data Model

### Hotel
- id
- name
- createdAt
- updatedAt

> Even though v1 supports one hotel, include hotel-level separation in schema design for easier future expansion.

### User
- id
- hotelId
- name
- passwordHash
- createdAt
- updatedAt

### Room
- id
- hotelId
- roomNumber
- isActive
- createdAt
- updatedAt

### DailyPlan
- id
- hotelId
- date
- createdByUserId
- createdAt
- updatedAt

### DailyPlanRoom
Represents a room for a specific day.
- id
- dailyPlanId
- roomId
- roomType (`checkout` | `stayover`)
- priority (boolean)
- status (`not_cleaned_yet` | `cleaned` | `not_needed`)
- updatedByUserId
- updatedAt

### StatusHistory
- id
- dailyPlanRoomId
- oldStatus
- newStatus
- oldRoomType
- newRoomType
- changedByUserId
- changedAt
- sendMessageUsed (boolean)

### AppSetting
- id
- hotelId
- key
- value

Possible settings keys:
- `default_language`
- `whatsapp_enabled`
- `whatsapp_phone`
- `whatsapp_message_template`

---

## Suggested API Endpoints

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Rooms
- `GET /api/rooms`
- `POST /api/rooms`
- `PUT /api/rooms/:id`
- `DELETE /api/rooms/:id`

### Daily Plans
- `GET /api/daily-plans/today`
- `POST /api/daily-plans`
- `GET /api/daily-plans/:date`
- `GET /api/daily-plans/history`

### Daily Plan Room Status
- `PATCH /api/daily-plan-rooms/:id/status`
- `PATCH /api/daily-plan-rooms/:id/type`
- `GET /api/daily-plan-rooms?date=YYYY-MM-DD`

### Settings
- `GET /api/settings`
- `PUT /api/settings`

---

## State Management Recommendation (Redux)

### Slices
- `authSlice`
- `roomsSlice`
- `dailyPlanSlice`
- `settingsSlice`
- `uiSlice`

### Example managed state
- current user
- today’s plan
- room filters
- sync/loading states
- language
- settings cache

Server state can also be handled with RTK Query for cleaner API integration.

---

## PWA Requirements
- Installable on Android home screen
- App manifest with name, icons, theme colors
- Service worker for static asset caching
- Offline fallback page
- Prompt user when app update is available

#### Important PWA note
Because this app has shared live statuses, true offline editing is more complex.

For v1:
- allow app shell offline
- block room status updates when offline or queue them carefully
- show clear online/offline indicator

---

## UX Notes
- Default to Ukrainian locale on first launch
- Keep workflow minimal: open app → see today → tap room → set status
- Status buttons should be clearly separated and readable on small screens
- Priority checkout rooms should be visually stronger
- Add search by room number
- Add summary counters at top:
  - total today
  - cleaned
  - not cleaned yet
  - not needed

---

## Security Notes
- Hash passwords with bcrypt/argon2
- Do not store plain text passwords
- Validate all API input
- Use HTTPS in production
- Store admin registration secret in environment config

---

## Version Plan

### V1
- Authentication
- Room settings management
- Daily setup screen
- Status board
- Shared DB/API sync
- Daily history
- WhatsApp prefilled message link
- English + Ukrainian localization
- PWA installability
- Same permissions for all users within one hotel

### V1.1
- Realtime updates with WebSocket
- Notes per room
- Better analytics/history filters
- Optional permission levels if needed

### V2
- Two Ukrainian dialect localizations
- Multi-hotel support
- Push notifications
- Offline queued sync
- Photo attachments for room proof
- Supervisor dashboard

---

## Suggested Folder Structure

```txt
src/
  app/
    [locale]/
      login/
      register/
      setup/
      board/
      history/
      settings/
  components/
    rooms/
    board/
    setup/
    common/
  store/
    slices/
    api/
  lib/
    auth/
    db/
    i18n/
    whatsapp/
  messages/
    en.json
    uk.json
  types/
  hooks/
  utils/
```

---

## Example User Flow

### Morning flow
1. User opens app
2. If today is not initialized, app shows **Daily Setup**
3. User selects today’s stayover and checkout rooms
4. User marks some checkout rooms as priority
5. User saves daily plan
6. App opens main board
7. Staff update statuses during the day
8. If needed, user checks **Send message** and app opens WhatsApp with predefined text
9. At end of day, data remains stored in history

---

## Claude Code Task Request
Use this specification to generate a production-ready starter application with:
- Next.js + TypeScript
- Tailwind CSS
- Redux Toolkit
- PWA support
- PostgreSQL + Prisma
- API routes / route handlers
- Authentication
- Internationalization
- Mobile-first UI

### Expected output from Claude Code
- project structure
- database schema
- API routes
- Redux store setup
- PWA configuration
- translation setup
- core pages and components
- example seed data
- README with local setup instructions

---

## Important Product Decisions
1. Default UI language = Ukrainian
2. Source translation language = English
3. WhatsApp integration for v1 should use **prefilled chat deep link**, not full automatic send
4. Multi-user sync can start with **polling**, realtime can be added later
5. Each day must have its own saved plan and status history
6. Room list is managed in settings as master data
7. All users have the same permissions per hotel in v1
8. Messages are sent from the user in WhatsApp, not from a bot
9. Future architecture should be prepared for multiple hotels

---

## Confirmed Decisions / Assumptions
Based on the latest clarification:

- A room **can switch** from stayover to checkout during the same day if needed
- All workers should **see who cleaned or updated each room directly on the board**
- There is **one shared admin password** for registration
- For **v1**, all users inside the same hotel have **the same permissions**
- Future architecture should allow **multiple hotels**, but **v1 supports one hotel**
- WhatsApp integration uses **one shared chat/destination**
- WhatsApp messages must be sent **from the user via WhatsApp**, not from a bot
- One current status per room per day
- Last update wins
- Each day has its own saved plan and status history

### Implementation Notes for These Decisions
- Because rooms may switch type during the same day, backend validation should allow controlled reassignment while preserving history
- Because all users have equal permissions in v1, role-based access can be minimized for the first release
- Because future multi-hotel support is planned, schema design should keep hotel-level separation in mind even if only one hotel is active in v1

---

## Summary
Build a **hotel housekeeping PWA** for Android that lets multiple users manage daily room cleaning statuses for stayover and checkout rooms, including priority checkout rooms, shared synced updates, history by day, simple registration, localization, and optional WhatsApp message sending via prefilled chat text.
