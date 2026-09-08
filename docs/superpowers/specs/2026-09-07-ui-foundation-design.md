# CivicMind HUD design

Approved in the task conversation on 2026-09-07. Implement a charcoal translucent
game HUD with warm accents, preserving the open scene in the center. Player identity
and stats sit upper-left, objectives below, day/time and a schematic map upper-right,
nearby people below the map, and command entry/navigation at the bottom.

Use the existing read-only GameProvider for identity, stats, goals, activity,
inventory, relationships and time. Format whole credits as Philippine pesos in the UI.
Hunger grows toward starvation. Empty goal tasks get clearly identified Phase 1
guidance using GoalTask; never infer completed tasks from local commands.

Export mountable components from src/ui. A small observation hook holds the existing
10 Hz player / 5 Hz NPC snapshots; App only connects callbacks to the existing scene
and HUD. No provider mutation, new store, second Canvas, physics/world/NPC edits or
dependencies. Import pure world/NPC modules without pulling renderers into the HUD.

Session-local command events use ActivityEvent and absolute game minutes. Reject
blank/overlong commands, trim text, preserve IME entry, cap the session log at 100,
and explicitly say commands are recorded only. Expose an append callback for future
systems. Shared activity remains independently read-only; future persistence needs
an agreed domain action. No demo events.

Map uses actual WORLD_BOUNDS, CITY_BUILDINGS and WORLD_LANDMARKS, XZ coordinates,
north/-Z upward, with player/NPC observations. No route finding or extra renderer.
All seven navigation buttons open keyboard-operable modal panels; Escape closes and
restores focus. Settings controls affect HUD density/objectives/minimap only.
Debug uses Backquote outside editable controls and reports sampled browser frame
rate, available snapshots and unavailable interaction signals honestly.

Use scoped CSS, readable contrast, visible focus, scrollable modal content, and
compact layouts for narrow/short windows. Keep the canvas clickable through gaps.
Test pure formatting, initial stats, goal fallback, event/command validation,
immutable append retention, nearby projection and map orientation. Verify real UI
submission, navigation, focus isolation, debug and desktop/narrow layout in browser.
Run typecheck, lint, tests, build and diff check; document integration risks/status.
