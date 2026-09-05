# Branching strategy

CivicMind uses GitHub Flow. `main` is the shared, buildable integration baseline.

## Task lifecycle

1. Fetch origin and start each task from current `origin/main` in an isolated
   worktree. One task, one branch, one owning agent. Never run concurrent agents
   against the same mutable checkout.
2. Name branches `codex/<area>-<short-task>`, for example
   `codex/gameplay-player-controller`, `codex/world-city-block`, or
   `codex/ui-player-hud`. Use `codex/fix-<issue>` for focused fixes.
3. Keep changes small and within the documented ownership area. Open a draft PR
   early if another workstream needs visibility. PRs target `main`.
4. Coordinate shared contracts, dependencies and composition with Lead. Merge
   prerequisite contract PRs first; dependent branches then incorporate main.
5. Before marking a PR ready, run typecheck, lint, tests and build. Include browser
   smoke results for rendering, physics, input or UI changes. State remaining limits.
6. Lead reviews integration and the final diff. Merge only with a passing
   `Foundation checks / verify` CI job on the latest PR revision and no conflicts.
   If main advances, update the branch and rerun relevant checks before merging.
7. Squash merge each task into main with a clear commit title. After merging,
   delete the remote task branch and retire its worktree once local work is saved.
   Other agents incorporate updated main before their own integration.

## Updating a task branch

Merge `origin/main` into an already shared task branch to avoid rewriting its
history. Rebase is appropriate only for a privately owned branch before others
base work on it. Never force-push main. Lead integrates PRs one at a time.

## Release and recovery

There is no permanent develop branch at this stage. Tag main for intentional
playable milestones using semantic versions such as `v0.1.0`. Hotfixes follow the
same short-branch and PR process. Revert a bad merge through a focused PR instead
of resetting shared history.

## Repository enforcement

These are team rules. Recommended main protection: require PRs, require the verify
status check, block force pushes and deletion, and require a review when a second
maintainer is available. Repository protection settings have not been configured
by this document; do not claim they are enforced merely because this file exists.
