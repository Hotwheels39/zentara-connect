# Sniper Phase 2 Technical Plan

## Goal

Replace the current UI-only LockSnap flow with a new minimal, functional app named Sniper that works end to end against the existing Supabase backend:

1. Sign in with Supabase Auth using email and password.
2. Read the authenticated user id from the active session.
3. Query `device_assignments` by `user_id`.
4. Read `device_id` from that single assignment row.
5. Query `devices` by `id = device_id`.
6. Show the signed-in email and assigned device name on the dashboard.
7. Invoke the existing `device-command` Edge Function from the controls screen with:
   - `device_id`
   - `command`

## Current Constraints

- The sandbox currently has no app environment variables configured.
- There is no existing Supabase client setup in the codebase.
- The existing generated UI should be replaced rather than reused.
- The user explicitly wants a minimal functional surface only:
  - Login
  - Dashboard
  - Controls
- No extra widgets, demo data, placeholder cards, or unrelated features.

## Assumptions

- The Supabase project already contains:
  - `devices`
  - `device_assignments`
  - the `device-command` Edge Function
- Each auth user has zero or one assignment row.
- The anon key is allowed to authenticate users and read the required rows under current RLS policies.
- The edge function authorizes the signed-in user via the Supabase session JWT.

## Open Questions / Blockers

1. Supabase project URL is not configured in this app yet.
2. Supabase anon key is not configured in this app yet.
3. If row-level security is enabled, the following must already be allowed for the signed-in user:
   - `select` on `device_assignments` where `user_id = auth.uid()`
   - `select` on `devices` for the assigned `device_id`
4. Edge Function authorization behavior is assumed to accept the user session token automatically from the Supabase client.

## Packages

### Required

- `@supabase/supabase-js`
  - official Supabase JavaScript client
- `@tanstack/react-query`
  - server-state management for auth-dependent fetches and refresh behavior
- `@react-native-async-storage/async-storage`
  - persistent auth storage on native
- `react-native-url-polyfill`
  - React Native compatibility used in Supabase React Native setup

### Not adding now

- No Zustand store unless session state becomes awkward to manage through Supabase auth subscription plus react-query invalidation.
- No form library.
- No validation package.

## Official Integration Notes

- Supabase documents `signInWithPassword` for email/password login. citeturn0search1
- Supabase’s React Native auth guide installs `@supabase/supabase-js`, `@react-native-async-storage/async-storage`, and `react-native-url-polyfill` for Expo/React Native projects. citeturn0search2
- Supabase documents Edge Function calls through `supabase.functions.invoke(...)`, which accepts a JSON body and returns parsed response data or an error. citeturn0search0

## App Architecture

### Routing

- `app/index.tsx`
  - route gate only
  - redirect based on auth session state:
    - signed out -> `/login`
    - signed in -> `/dashboard`
- `app/login.tsx`
  - email/password form
  - sign-in submit and inline error state
- `app/dashboard.tsx`
  - signed-in email
  - assigned device name
  - refresh button
  - navigation to controls
- `app/controls.tsx`
  - three command buttons only
- `app/_layout.tsx`
  - QueryClientProvider
  - auth bootstrap
  - explicit titles

### Data / Logic Layers

- `lib/supabase.ts`
  - exports configured Supabase client
  - uses env vars
  - configures storage for auth persistence on native
- `lib/supabase-auth-storage.ts`
  - storage adapter for native/web compatibility if needed
- `lib/errors.ts`
  - normalize Supabase and function errors to user-safe messages
- `features/session/useSession.ts`
  - subscribes to auth state
  - exposes current session and user
- `features/device/api.ts`
  - `fetchAssignedDevice(userId)`
  - `sendDeviceCommand(deviceId, command)`
- `features/device/hooks.ts`
  - `useAssignedDevice(userId)`
  - `useSendDeviceCommand()`

## Data Model Proposal

### Entities

- `SessionUser`
  - `id`
  - `email`
- `DeviceAssignment`
  - `id`
  - `user_id`
  - `device_id`
- `Device`
  - `id`
  - `name`
  - `status`

### Derived View Model

- `AssignedDeviceView`
  - `userEmail`
  - `deviceId`
  - `deviceName`
  - `deviceStatus`

## Query Plan

### Login

- Call `supabase.auth.signInWithPassword({ email, password })`
- On success:
  - session listener updates auth state
  - route gate redirects to dashboard
- On error:
  - show inline login error

### Session bootstrap

- On app load:
  - call `supabase.auth.getSession()`
  - subscribe to `supabase.auth.onAuthStateChange(...)`
- Keep auth state in a thin hook or provider

### Device lookup

Given authenticated `user.id`:

1. Query `device_assignments`
   - `.select('device_id')`
   - `.eq('user_id', user.id)`
   - `.single()`
2. Query `devices`
   - `.select('id, name, status')`
   - `.eq('id', assignment.device_id)`
   - `.single()`
3. Return one combined object for the dashboard and controls screen.

### Refresh

- Dashboard refresh button invalidates/refetches the assigned-device query.

### Commands

- Controls screen sends one of:
  - `siren_on`
  - `siren_off`
  - `all_off`
- Invoke:
  - `supabase.functions.invoke('device-command', { body: { device_id, command } })`
- Show loading state per command and a compact success/error response.

## State Management Strategy

### Server state

- Use `@tanstack/react-query` for:
  - current assigned device data
  - refresh state
  - edge function command mutations

### Client state

- Keep login form values and button states local to the screen.
- Keep session in a thin auth hook using Supabase session APIs.
- Avoid Zustand initially because the app scope is narrow and session can stay close to the root layout.
- If cross-screen session coordination becomes noisy during implementation, introduce a tiny `useSessionStore` without duplicating device server data.

## Auth / Session Plan

- Environment variables:
  - `EXPO_PUBLIC_SUPABASE_URL`
  - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- Configure Supabase client once.
- Persist session:
  - native via AsyncStorage adapter
  - web using default browser storage
- Disable URL session detection where appropriate for non-web OAuth flows if required by current Supabase React Native guidance.
- Add sign-out action only if needed to verify auth flow cleanly; otherwise defer.

## Screen-to-Logic Mapping

### Login

- Inputs:
  - email
  - password
- Actions:
  - sign in
- Data dependencies:
  - none before submit
- UI states:
  - idle
  - submitting
  - auth error

### Dashboard

- Data shown:
  - session user email
  - assigned device name
- Actions:
  - refresh assigned device
  - navigate to controls
- Data dependencies:
  - auth session
  - assignment lookup
  - device lookup
- UI states:
  - initial loading
  - refresh loading
  - no assignment
  - query error
  - success

### Controls

- Data shown:
  - assigned device name
- Actions:
  - Siren ON
  - Siren OFF
  - All OFF
- Data dependencies:
  - resolved assigned device id
- UI states:
  - unavailable without device
  - command submitting
  - command success
  - command error

## Validation / Error Handling

### Login errors

- Invalid credentials -> inline form error
- Missing env config -> developer-safe fallback message in app

### Dashboard errors

- No session -> redirect to login
- No assignment row -> show plain “No device assigned”
- Assignment query failure -> show retryable error
- Device query failure -> show retryable error

### Controls errors

- No assigned device id -> disable command buttons and explain why
- Function invoke failure -> inline command error
- Prevent duplicate submits while a command is in flight

## Implementation Checklist

1. Add the required packages.
2. Add Supabase env vars in the app configuration.
3. Create the Supabase client and auth storage adapter.
4. Replace current generated screens with a new minimal Sniper UI.
5. Add session bootstrap in the root layout.
6. Implement login with `signInWithPassword`.
7. Implement route gating from `/` based on auth session.
8. Implement assigned device fetch pipeline:
   - get auth user
   - get assignment by `user_id`
   - get device by `device_id`
9. Render signed-in email and device name on dashboard.
10. Implement dashboard refresh.
11. Implement controls screen command mutations to `device-command`.
12. Add loading and error states for all three screens.
13. Run preview validation, typecheck, and lint.
14. Smoke test:

- invalid login
- valid login
- no assignment
- assignment resolves device
- each command button path

## Test Plan

### Manual smoke tests

- Sign in with invalid credentials returns a visible auth error.
- Sign in with valid credentials routes to dashboard.
- Dashboard shows session email from the active user.
- Dashboard shows device name for assigned user.
- Dashboard refresh refetches current device data.
- Controls sends correct payload for each command.
- No assignment shows “No device assigned”.
- Logging out or expired session returns user to login.

### Code-level validation

- TypeScript passes.
- ESLint passes.
- Preview remains stable on web after package and auth setup changes.

## Risks

- Missing env vars block all implementation.
- RLS policies may reject assignment/device reads even when code is correct.
- The edge function may require additional payload fields or a different auth expectation than described.

## Minimal User-Facing Result

After implementation, the app should do exactly this and nothing extra:

- Login with Supabase email/password.
- Show signed-in email.
- Show the assigned device name from `device_assignments -> devices`.
- Refresh the assignment/device query.
- Send the three device commands through `device-command`.
