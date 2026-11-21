---
name: ship
description: Take a task from issue to landed. File or pick up the issue, take it, build exactly what it asks, prove it works, get a second model's review when it is risky, then merge it or open a PR. Use when the user says "ship", "ship #N", "ship to PR", "ship it" or "ship with council". Saying it again resumes a task already under way.
---

# Ship

The user says *ship* once and reads the result later. You own the task until it has landed or is blocked, and you say plainly which one.

## 0. Read the project's settings

Look for a `## Ship` section in the project's `AGENTS.md`, then its `CLAUDE.md`. It can set:

- **Repo** and a **board** skill to follow for taking a task, changing its status and closing it
- **Branch** name and base
- **Prove**: the check commands and the skill that runs the app
- **Always PR**: paths and kinds of change that never merge without the user
- **Merge** command and **issue comment** forms
- anything else to do on every change ("when a change adds a screen, update the map")

The project's settings win over the defaults below. A project with no `## Ship` section uses the defaults and always lands as a PR. A folder with no GitHub remote has no issue or board steps: branch, build, prove and land the same way.

**Defaults:** GitHub issues through `gh`. Branch `task/<issue>-<topic>` from the latest remote default branch. A `--no-ff` merge. The four issue comments in step 6.

## 1. Find where the task is

Saying ship twice is safe. Work out what is already done and continue from the first unfinished step.

- **Which issue:** `#N` if given. Otherwise the number in the current branch (`task/<N>-…`). Otherwise an open issue assigned to the user that matches the request. Otherwise file a new issue from the request, in the repo's usual shape (outcome, scope, acceptance). The request is the authorization to file it.
- **How far it got:** assigned to the user with a branch → step 3. Commits that meet the acceptance → step 4. A PR already open → step 6.

## 2. Take it

1. Run `git status --short`. Uncommitted work that is not this task's, or another task under way in this checkout: stop and say so. Never stash, discard, reset or overwrite anyone's work.
2. Stop if the issue is assigned to someone else, or its scope overlaps a task in progress (the board skill says how to check).
3. Assign the user's account if unassigned. Fetch. Switch to the issue's existing branch, or create one from the latest remote base. Never reset an existing branch.
4. Comment once: `Taking #N | Scope: <paths>`. Set the board card to In Progress.
5. Acceptance missing or unclear: in an attended chat, ask one question about scope and stop. In a night run, take the smallest reasonable reading and record it as a decision.

## 3. Build exactly what it asks

- The issue's outcome and acceptance are the whole deliverable. Unspecified details inside them are yours to decide (names, spacing, which helper to reuse). New features are not.
- Anything else you notice goes in the report's *Noticed* list, one line each. Do not build it, scaffold it, or leave a flag "so it's easy to add later".
- If the feature cannot work without an extra change, make it and say so in the report. The test is necessity, not improvement.
- Stay inside the scope paths. Files that another task in progress owns are a blocker.

## 4. Prove it

Evidence, not "this should work". Each acceptance line gets one of:

- a focused test that fails without the change and passes with it
- the real command's output
- the running app, through the project's verify skill (screenshots for anything visual)

Run only the checks the acceptance needs, and never say a check ran when it did not. A mock alone does not prove runtime behaviour. Anything you could not prove is listed as *unproven*, and that forces a PR.

## 5. Decide: review, then merge or PR

Read the change (`git diff --stat <base>...HEAD`).

**Review with the `council` skill** when any of these hold:
- it touches an Always PR area, data that could be lost, auth, permissions or secrets
- it changes concurrency, lifecycle, persistence, or a boundary between processes
- it is over ~400 changed lines of hand-written code (not counting lock files, generated files or snapshots)
- the user asked ("ship with council")

Skip review for copy, docs, styling, and small fixes in one area. Review budget is scarce: spend it where a second pair of eyes changes the outcome.

**Land as a PR, never a merge**, when any of these hold:
- the user said "ship to PR", or this is a night run
- it touches an Always PR area, deletes or migrates user data, or changes how auth, permissions or secrets are handled
- you made a choice the user would want to see (between options, not a detail)
- the review ended in an open disagreement, or something is unproven
- the project has no `## Ship` section

Otherwise merge. Say which in one line before landing:
`Landing: merge, 140 lines in one area, review skipped.` or `Landing: PR, touches the IPC contract; council 2 rounds, approved.`

## 6. Land

For both paths, commit only this task's files, in the repo's commit style. Fetch before landing. Never force-push, never bypass branch protection, never commit secrets. A conflict, a rejected push or a failing check is a blocker, not something to work around.

**Merge**
1. If the base moved, merge it into the task branch. Resolve conflicts only in this task's files; any other conflict is a blocker.
2. Push the task branch, then merge with the project's command. Default, which works from any worktree:
   `git switch --detach origin/<base>`, `git merge --no-ff <branch> -m "Merge <branch>: <subject> (#N)"`, `git push origin HEAD:<base>`, `git switch <branch>`.
3. Close the issue as completed, set the card to Done, and comment `Done #N | Merged: <short sha>`.

**PR**
1. Push the branch and run `gh pr create`, with this body:
   ```
   Closes #N

   ## What changed
   ## Proof
   ## Review          (the council footer, or "Council: skipped, <reason>")
   ## Decisions       (night run only: options, pick, screenshots)
   ## Noticed while working, not built
   ```
2. Set the card to In Review and comment `Ready #N | PR: <url>`.
3. If the repo runs checks or review bots on PRs, wait for them to finish. Fix real findings, and answer wrong ones in a reply. Never merge the PR yourself.

**Blocked:** comment `Blocked #N: <reason> | Need: <decision or person>` and stop working on that issue. Do the same when the user says it is blocked.

Issue comments are only those four one-liners. No progress notes, check output or logs on the issue.

## 7. Report

Keep it short, in this order:

- **Landed:** `merged <sha>`, `PR <url>`, or `blocked: <reason>`
- **Changed:** the files
- **Proof:** what ran and what it showed; anything unproven
- **Review:** the council footer, or why it was skipped
- **Noticed while working, not built:** one line each
