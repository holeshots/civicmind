# CivicMind HUD Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans for inline implementation.

**Goal:** Deliver the Phase 1 HUD and QA handoff over the existing game scene.

**Architecture:** Read-only domain state plus bounded local observations and session
events. Mountable DOM components and pure presentation helpers; minimal App wiring.

**Tech Stack:** Existing React 19, strict TypeScript, CSS, SVG and Vitest.

**Spec:** docs/superpowers/specs/2026-09-07-ui-foundation-design.md

## Global constraints

- One Canvas/Physics; no physics, city, NPC or shared-type edits.
- No dependencies, AI calls, persistence, or fake runtime events.
- Existing snapshots: player at most 10 Hz, NPCs at most 5 Hz.
- Keep useGameState read-only; cap local events at 100.

## Task 1: Pure HUD contracts and command behavior

Files: src/ui/hudModel.ts, src/ui/hudModel.test.ts.
Consumes shared GameTime, Goal/GoalTask, ActivityEvent, CharacterStats and Position.
Produces formatGameTime(time), formatCurrency(money), getGoalTasks(goal),
createCommandEvent(text, time, actorId, id), appendActivity(events, event),
presentNearbyNPCs(npcs, position, radius), and mapPoint(position, bounds).

- [x] Write table tests for midnight/noon/end-of-day and whole pesos, goal guidance
  fallback versus real tasks, blank/501-character command rejection, day-2 timestamp,
  trimming, immutable 100-event retention, XZ nearby ordering and map corners.
  Representative assertions:
  ```ts
  expect(formatCurrency(4200)).toBe('₱4,200')
  expect(createCommandEvent(' Find a job. ', {day:2, minuteOfDay:15, speed:1, paused:true}, 'jed', 'event-1'))
    .toMatchObject({atGameMinute:1455, message:'Goal command submitted: Find a job.'})
  ```
- [x] Run `npm test -- src/ui/hudModel.test.ts` and observe missing-feature failure.
- [x] Implement pure helpers using existing contracts; rerun targeted tests.

## Task 2: Components and scene observation wiring

Files: src/ui/GameHUD.tsx, HudPanels.tsx, HudNavigation.tsx, MiniMap.tsx,
DebugPanel.tsx, useHUDSession.ts, hud.css, index.ts; src/App.tsx.
Consumes Task 1 helpers and GameProvider; observation props reuse PlayerSnapshot
and read-only NPCSeed. Produces GameHUD and useHUDSession with stable snapshot and
appendActivity callbacks; exports reusable panel components.

- [x] Add server-render tests for fed hunger semantics, state-driven money/stats,
  real goal task priority, empty activity and nearby role/distance presentation.
- [x] Run targeted tests to observe missing components before implementing them.
- [x] Build panels and CSS from the approved design; map actual city data in SVG.
- [x] Use native dialog for focus containment, Escape and focus restoration.
  Wire App's FoundationScene callbacks to useHUDSession and GameHUD.
- [x] Run typecheck and tests; start Vite and check commands, every navigation panel,
  debug toggle, editable focus, map/proximity updates and narrow/short viewports.

## Task 3: Verification and integration handoff

Files: PROJECT_STATUS.md, docs/UI_FOUNDATION_HANDOFF.md.

- [x] Run `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build`,
  `git diff --check`. Fix actual failures and rerun affected checks.
- [x] Review ownership, snapshot rates, event retention and input handling.
- [x] Record exports, data contracts, exact checks/browser evidence, risks,
  asset provenance (procedural SVG only) and follow-up work.
- [x] Commit the verified work on codex/ui-foundation for Lead review.
