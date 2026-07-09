# LockSnap Phase 1 Technical Plan

## Scope

Phase 1 covers UI-only implementation for the LockSnap mobile app. This phase must not connect to Supabase, create API clients, query real data, authenticate users, or invoke edge functions. The goal is to ship a production-quality interface and route structure that cleanly maps to the later backend flow.

## Product Intent

- App purpose: allow a signed-in user to access a single assigned security device and issue command actions against that device.
- Primary user: a customer or operator who needs a fast, clear mobile interface for a single hardware endpoint.
- UX goals:
  - feel operational, focused, and trustworthy rather than decorative
  - minimize navigation depth
  - keep the device state and actions legible at a glance
  - make command actions high-clarity and high-confidence

## Information Architecture

### Route plan

- `app/index.tsx`
  - redirect only
  - send users to `/login` during Phase 1
- `app/_layout.tsx`
  - global theme, font loading, root stack configuration
  - explicit titles for every route
- `app/login.tsx`
  - login screen
- `app/dashboard.tsx`
  - device overview screen
- `app/controls.tsx`
  - command screen
- `app/+not-found.tsx`
  - explicit human title

### Navigation behavior

- Root stack, not tabs
- Login is the entry screen
- Successful login behavior is not wired in Phase 1, but the UI should provide an obvious path to the dashboard for previewing the screen flow
- Dashboard links to controls
- Controls links back naturally through the stack header

## Screen Specifications

### Login

- Visual direction:
  - top-weighted brand moment
  - clear sign-in card/form
  - concise trust-oriented copy
- Required elements:
  - app title and short description
  - email field
  - password field
  - sign-in button
  - compact inline error region placeholder for future auth failures
  - secondary preview-only navigation affordance to open dashboard without implying real auth success
- Phase 1 interaction:
  - local component state for input values and password visibility only
  - sign-in button remains visibly primary but non-functional
  - helper copy clarifies backend activation is part of the next phase

### Dashboard

- Visual direction:
  - immediate status-oriented summary
  - one assigned device, no list UI
  - high contrast status presentation
- Required elements:
  - signed-in user email row
  - assigned device name row
  - device status row
  - refresh button
  - message state for no device assigned
  - primary link into controls
- Phase 1 interaction:
  - static empty display values only, no fake device data
  - refresh is disabled or non-functional with explanatory copy
  - two presentation states included:
    - device unavailable / not yet loaded state without mock data
    - no assignment message exactly matching requested wording

### Controls

- Visual direction:
  - command panel, not a settings page
  - deliberate visual separation between primary actions and cautionary messaging
- Required elements:
  - device context header
  - buttons for `Siren ON`, `Siren OFF`, `All OFF`
  - compact note that command delivery will be enabled in the backend phase
- Phase 1 interaction:
  - buttons rendered in final visual style
  - non-functional action handlers only
  - no mock command results or fake success toasts

## Shared UI / Component Plan

### New reusable layout pieces

- `components/layout/app-screen.tsx`
  - safe-area wrapper
  - consistent background
  - optional scroll behavior
  - shared horizontal padding and max-width handling for web

### New reusable product components

- `components/locksnap/section-card.tsx`
  - elevated card shell for summary blocks and command panels
- `components/locksnap/data-row.tsx`
  - label/value row used on dashboard
- `components/locksnap/status-pill.tsx`
  - presentational badge for device status or unavailable state
- `components/locksnap/command-button.tsx`
  - action button variant with icon slot and disabled presentation

Reuse existing `button`, `input`, `text`, `card`, and `separator` primitives where appropriate.

## Visual Design System Updates

### Theme changes

- Replace current default purple-heavy brand tone with a more operational security-oriented palette
- Light theme target:
  - warm-neutral surface
  - deep slate foreground
  - restrained amber or safety-orange for primary emphasis
  - green for healthy/armed-ready status states when needed
  - red reserved for destructive/offline/critical semantics
- Dark theme target:
  - charcoal base
  - strong contrast foreground
  - matching brand accent with slightly softened saturation

### Typography

- Keep existing Inter family to avoid adding package/config overhead in Phase 1
- Improve type hierarchy through theme scale usage and spacing rather than new font additions
- Emphasize:
  - bold, compact hero heading on login
  - medium-weight labels
  - muted operational metadata

### Spacing and surfaces

- Rounded cards with stronger internal padding
- Compact, deliberate gaps
- Subtle border plus layered background treatment for depth

## State Boundaries

- Allowed:
  - local input state
  - password visibility toggle
  - optional local UI state for screen-level banners
- Not allowed:
  - Supabase client
  - auth session
  - async requests
  - react-query
  - zustand stores
  - persistence

## Implementation Order

1. Update theme tokens to establish product visual direction.
2. Replace starter home screen with redirect-based routing structure.
3. Configure root stack titles for login, dashboard, controls, and not-found.
4. Add shared screen/layout components.
5. Build login screen UI.
6. Build dashboard UI with empty/no-device states and controls entry point.
7. Build controls screen UI with final button hierarchy.
8. Validate preview stability after each route/component milestone.
9. Run typecheck and lint, then resolve any issues.

## QA Checklist

- Preview boots without route or import errors.
- Every screen has an explicit human-readable header title.
- Login, dashboard, and controls are reachable.
- No raw route segment names appear in headers.
- No unsupported icon names are used.
- Light and dark themes both maintain readable contrast.
- No mock device records or fake backend responses appear in the UI.
- TypeScript passes.
- Lint passes or only pre-existing unrelated warnings remain documented.

## Out of Scope for Phase 1

- Supabase client initialization
- email/password auth logic
- session handling
- fetching `device_assignments`
- fetching `devices`
- refresh behavior
- edge function calls to `device-command`
- loading, success, and failure states driven by real network activity
- retry logic, auth guards, sign-out, and token persistence

## Phase 2 Handoff Notes

Phase 2 should wire:

- Supabase auth with email/password
- current user lookup from auth session
- single assignment query by `user_id`
- device lookup by assigned `device_id`
- dashboard loading/error/empty states from real data
- controls invoking `device-command` with `device_id` and command payload
- protected navigation and sign-out behavior
