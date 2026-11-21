---
name: take
description: Start a task with the user in the loop. File or pick up the issue, take it, build what it asks and prove it, then stop and show the change, with nothing committed, pushed, merged or opened as a PR. Use when the user says "take" with an issue number or a request, or wants to see and steer the work before it lands. Saying "ship" afterwards lands it from where take stopped.
---

# Take

`take` is the first half of `ship`, with the user watching. It files or picks up the issue, takes it, builds it and proves it, then stops with the change uncommitted on the task branch. The user reads the diff, asks for changes, and says `ship` when it's right.

## Steps

Follow the `ship` skill's steps 0 to 4 as written:

0. Read the project's settings.
1. Find the issue, or file it with the `issue` skill.
2. Take it: assigned, on its branch, the `Taking` comment posted, the card In Progress.
3. Build exactly what it asks.
4. Prove it with the `verify` skill, running only the checks the acceptance needs.

Then stop. Leave the changes uncommitted on the task branch. Don't commit, push, merge or open a PR, don't move the card past In Progress, and post no issue comment other than `Taking` (or `Blocked`, if it is).

The user is here, so when the acceptance is unclear, ask. Never decide it yourself the way a night run would.

## Stop and show

- **Taken:** #N on `<branch>`
- **Changed:** each file, with a line on what changed in it
- **Proof:** what ran and what it showed; what is unproven
- **Noticed while working, not built:** one line each
- Last line: `Say "ship" to land it, or tell me what to change.`

## While the user steers

- Their requests change the working tree on the same branch. Rerun the checks each change affects, and show the change again in the same shape.
- When they ask for something the issue doesn't cover, that is their call: build it, and add it to the issue's outcome and acceptance by editing the issue's body, so what lands matches the issue. A file outside the scope is handled as in ship's step 3.
- Until it ships, this checkout belongs to this task. A `take` or `ship` for another task here stops on the uncommitted work, as ship's step 2 says.

## Landing

`ship` lands it. It finds the task from the branch, sees it is taken and built, proves again whatever changed since take last showed it, then reviews and merges or opens a PR by its usual rules. `ship to PR` always ends at a PR.
