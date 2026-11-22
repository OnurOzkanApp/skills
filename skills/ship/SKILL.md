---
name: ship
description: Take a task from issue to landed. File or pick up the issue, take it, build exactly what it asks, prove it works, get a second model's review when it is risky, then merge it or open a PR. Use when the user says "ship" (with or without an issue number), "ship to PR", "ship it" or "ship with council". Saying it again resumes a task already under way.
---

# Ship

The user says *ship* once and reads the result later. You own the task until it has landed or is blocked, and you say plainly which one.

## 0. Read the project's settings

Look for a `## Ship` section in the project's `AGENTS.md`, then its `CLAUDE.md`. It can set:

- **Repo** and a **board** skill to follow for taking a task, changing its status and closing it
- **Branch** name and base
- **Verify**: the project's verify kit, the skill that runs and drives its app
- **Always PR**: paths and kinds of change that never merge without the user
- **Council**: who reviews, at what thinking and in which rounds, and the subagents tool that starts them (see the `council` skill)
- **Merge** command and **issue comment** forms
- anything else to do on every change ("when a change adds a screen, update the map")

The project's settings win over the defaults below. A project with no `## Ship` section uses the defaults and always lands as a PR. A folder with no GitHub remote has no issue or board steps: branch, build, prove and land the same way.

**Defaults:** GitHub issues through `gh`. Branch `task/<issue>-<topic>` from the latest remote default branch. A `--no-ff` merge. The four issue comments in step 6.

## 1. Find where the task is

Saying ship twice is safe. Work out what is already done and continue from the first unfinished step.

- **Which issue:** `#N` if given. Otherwise the number in the current branch (`task/<N>-…`). Otherwise an open issue assigned to the user that matches the request. Otherwise file a new issue from the request with the `issue` skill. The request is the authorization to file it.
- **How far it got:** check each step's own conditions, in order, and do whatever is missing. Never skip a step because a later one looks done: a branch without the In Progress card is still not taken, and an open PR without its In Review card is still not landed. Reuse what exists (the branch, the PR) rather than creating it again. A task started with `take` is already taken and built: carry on from step 4, proving again whatever changed since take last showed it.

## 2. Take it

1. Run `git status --short`. Uncommitted work that is not this task's, or another task under way in this checkout: stop and say so. Changes `take` left on this task's branch are this task's. Never stash, discard, reset or overwrite anyone's work.
2. Stop if the issue is assigned to someone else, or its scope overlaps a task in progress (the board skill says how to check).
3. Assign the user's account if unassigned. Fetch. Switch to the issue's existing branch, or create one from the latest remote base. Never reset an existing branch.
4. Comment once: `Taking #N | Scope: <paths>`. Set the board card to In Progress.
5. Acceptance missing or unclear: in an attended chat, ask one question about scope and stop. In a night run, take the smallest reasonable reading and record it as a decision.

The task is taken when these hold: assigned to the user, on its branch, the `Taking` comment posted, and, if the project has a board, the card In Progress (or In Review once its PR is open; never move it back). Change no files until they do.

## 3. Build exactly what it asks

- The issue's outcome and acceptance are the whole deliverable. Unspecified details inside them are yours to decide (names, spacing, which helper to reuse). New features are not.
- Anything else you notice goes in the report's *Noticed* list, one line each. Do not build it, scaffold it, or leave a flag "so it's easy to add later".
- If the feature cannot work without an extra change, make it and say so in the report. The test is necessity, not improvement.
- Stay inside the scope paths. When a necessary change needs a file outside them, check the tasks in progress again: if one owns that file, it is a blocker. If none does, first edit the `Taking` comment to add the file, so the next task sees it, then make the change and list the file in the report. Edit that comment by its id: `gh api repos/<owner>/<repo>/issues/<N>/comments --jq '.[] | select(.body | startswith("Taking #<N>")) | .id'`, then `gh api -X PATCH repos/<owner>/<repo>/issues/comments/<id> -f body='…'`. Never use `gh issue comment --edit-last`: it edits your latest comment, which may be a later `Ready` or `Blocked` line.

## 4. Prove it

Follow the `verify` skill: every acceptance line gets evidence (a focused test that fails without the change, the real command's output, or the running app through the project's verify kit), and every claim you couldn't check is listed as *unproven*. Run only the checks the acceptance needs. Anything unproven forces a PR.

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
- the review ended with open findings, or something is unproven
- the project has no `## Ship` section

Otherwise merge. Say which in one line before landing:
`Landing: merge, 140 lines in one area, review skipped.` or `Landing: PR, touches the IPC contract; council 2 rounds, approved.`

## 6. Land

For both paths, commit only this task's files, in the repo's commit style. Fetch before landing. Never force-push, never bypass branch protection, never commit secrets. A conflict, a rejected push or a failing check is a blocker, not something to work around.

**Merge**
1. If the base moved, merge it into the task branch. Resolve conflicts only in this task's files; any other conflict is a blocker. If you resolved a conflict, or the incoming commits touch this task's files or code they call or are called by, rerun the acceptance checks that depend on them before going on.
2. Push the task branch, then merge with the project's command. Default, which works from any worktree:
   `git switch --detach origin/<base>`, `git merge --no-ff <branch> -m "Merge <branch>: <subject> (#N)"`, `git push origin HEAD:<base>`, `git switch <branch>`.
3. Close the issue as completed, set the card to Done, and comment `Done #N | Merged: <short sha>`.

**PR**
1. Push the branch. If the branch has no open PR (`gh pr view <branch>`), run `gh pr create` with this body; if it has one, update its body instead:
   ```
   Closes #N

   <a short plain paragraph: what was wrong or missing, and what this change does about it>

   ## What changed
   ## Proof
   ## Review          (the council footer, or "Council: skipped, <reason>")
   ## Decisions       (each choice made without asking the user; a night run adds its options, picks and screenshots)
   ## Noticed while working, not built

   <the model and harness that made it, e.g. "Made with Claude Opus 5.5 in Claude Code"; a harness's own attribution line counts>
   ```
   Open with the problem, not with a list of files: someone reading only the first paragraph should know why this PR exists. Leave out Decisions when there were none.
2. Set the card to In Review and comment `Ready #N | PR: <url>`.
3. If the repo runs checks or review bots on PRs, wait for them to finish. Fix real findings, and answer wrong ones in a reply. Never merge the PR yourself: the user lands it, with `land` or on GitHub.

**Blocked:** comment `Blocked #N: <reason> | Need: <decision or person>` and stop working on that issue. Do the same when the user says it is blocked.

Issue comments are only those four one-liners. No progress notes, check output or logs on the issue.

## 7. Report

Open with one or two plain sentences: what happened, and what is waiting on the user, if anything. Then, in this order:

- **Landed:** `merged <sha>`, `PR <url>`, or `blocked: <reason>`
- **Changed:** the files
- **Proof:** what ran and what it showed; anything unproven
- **Review:** the council footer, or why it was skipped
- **Decisions:** each choice you made for the user without asking, one line each, or "none"
- **Noticed while working, not built:** one line each
