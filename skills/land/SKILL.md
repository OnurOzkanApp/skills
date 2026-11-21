---
name: land
description: Take an open PR to merged, or hold it with the reasons. A reviewer from another model family reviews what nobody has reviewed yet, you fix what it finds, it checks the fixes, and the PR merges only when nothing serious is left. Use when the user says "land" with a PR or issue number, or asks to review and merge a PR. Saying land is the user's yes to merge what the review clears.
---

# Land

A PR is where `ship` stops when a change needs the user, and `land` is how the user comes back to it. A reviewer from the other model family reviews the PR. You fix what it finds, it checks your fixes, and then the PR merges or waits with the reasons. Saying `land` is the user's yes to merge whatever the review clears, so they don't have to switch models and pass findings back and forth by hand.

## 1. Find the PR and get on its branch

- **Which PR:** `#N` if it is a PR. If it is an issue, the open PR from its branch (`git branch -a --list "*task/<N>-*"`, then `gh pr view <branch>`). Otherwise the current branch's PR.
- Read the project's settings (ship's step 0), the PR once (`gh pr view <N> --json body,headRefName,headRefOid,baseRefName,mergeable,isDraft,statusCheckRollup`) and its issue's acceptance.
- Stop when the PR is closed or a draft, or when `git status --short` shows other work in this checkout (as in ship's step 2). Otherwise fetch and switch to its branch. Never reset it.

## 2. Bring it up to date

If the base moved, merge it into the branch as in ship's step 6 (Merge, step 1). Resolve conflicts only in the PR's own files, and rerun the checks the incoming commits touch. Any other conflict holds the PR.

## 3. Prove what is unproven

Try each line of the PR's Unproven list with the `verify` skill. What you prove moves to Proof. What can't be checked here stays, with the reason. If the repo runs checks on PRs, they must pass.

## 4. Review, fix, check the fixes

Follow the `council` skill. Its reviewer is the other family from yours, so run `land` in the family that built the PR: you fix, and the other family reviews. If the PR's council footer shows your own family as the reviewer, the code came from the reviewer's family and the review would not be independent: say so and ask who reviews.

What round 1 covers:
- **The PR had a council review:** only what nobody has reviewed. That is `git diff <reviewed to>..<head>` from its footer, plus the findings still open and the answers given to them. A footer without "reviewed to" means the commits its table calls "not re-reviewed" and everything after them; if that isn't clear, the whole PR.
- **No council review yet:** the whole PR, `git diff <merge base>..<head>`.

Then council's rounds as written: answer every finding (fixed, rejected with evidence, or noted), push, and round 2 checks only the fixes. Budget: 2 rounds, or 3 when the PR touches data, auth, permissions or security.

After you fix a blocker or major finding, the next round always runs. A fix nobody has checked is where the next bug hides: a first fix that misses one path is common, and checking just the fix costs little. When the budget ends with one still open, stop and hold. Another loop of the same two models arguing is the user's call, not yours.

## 5. Decide

**Merge** when all of these hold:
- council ended approved, or approved with notes: no open blocker or major finding
- every acceptance line has proof
- the PR is up to date with its base, conflict-free, and its checks pass

**Ask the user** in one question when the review is clear but something left is theirs to accept: an unproven line that can't be checked here, or a decision the PR records (a night run's picks) that they haven't answered. Merge when they say so.

**Hold** when anything else is left: an open blocker or major finding, a failing check, a conflict outside the PR's files, or an acceptance line it doesn't meet.

Say which in one line before acting:
`Landing: merge, round 1 approved the 14 new lines.` or `Landing: hold, F2 (major) still open after 2 rounds.` or `Landing: your call, check-icons can't run here.`

## 6. Merge or hold

Update the PR body first, whichever it is: Proof with what you proved, Review with the new council footer and table, each open finding in one line with both sides. The PR then records what was checked.

**Merge** exactly what you checked, so nothing pushed meanwhile slips in:
`gh pr merge <N> --merge --match-head-commit <head> --subject "<the project's merge message>"`, by default `Merge <branch>: <subject> (#<issue>)`. If the project's Merge line says another way, use it. Then make sure the issue is closed, set the card to Done, and comment `Done #<issue> | Merged: <short sha>`.

**Hold:** leave the PR open and the card in In Review, and post no issue comment; the PR body says why. Saying `land` again starts from what is new since the last review.

## 7. Report

- **Result:** `merged <sha>`, `held: <reason>`, or `your call: <question>`
- **Review:** the council footer
- **Fixed:** the commits
- **Proof:** what ran; what is still unproven
- **Open:** each open finding, both sides, one line each
