---
name: plan-features
description: Propose what to build next from what already exists, what is planned and what was turned down, then file the picks as issues and close the rejects so they are never proposed again. GitHub is the memory. Use when the user asks what to build next, what is missing, or to plan features.
disable-model-invocation: true
---

# Plan features

GitHub is the memory. Open issues are what's planned, issues closed as completed are what shipped, and issues closed as "not planned" are what the user turned down. Never propose something from the last group again unless the user reopens it.

## 1. Read what exists, cheapest first

- Open issues: `gh issue list --state open --limit 300 --json number,title,labels`
- Turned down: `gh issue list --state closed --search "reason:not-planned" --limit 300 --json number,title`
- Recently shipped: `gh issue list --state closed --search "reason:completed" --limit 60 --json number,title`
- The product doc that `## Ship` names under Product, and only the sections it names: what the product is not, and where it is going. Without one, read the README.
- If the user named a focus (a screen, a kind of user, a problem), read only the code for that.

## 2. Propose

- At most five candidates. Each is one line: what it is, and who it helps.
- Ground each one in the product doc or in a gap you can point to in the code, and cite which.
- Skip anything already open, shipped, turned down, or outside what the product doc says the product is.
- If the request is broad, first ask one or two focused questions, such as which screen or which kind of user. Don't ask about details you can decide yourself.

## 3. File what the user decides

- **Picked:** ask only for what the issue needs (outcome, scope, acceptance), then file it with the `issue` skill as a feature, with Backlog status unless the user says Ready.
- **Rejected:** file a one-line `Idea: <title>` issue and close it as not planned (`gh issue close <N> --reason "not planned"`), so it is never proposed again.
- **Skipped**, with no decision: file nothing.

Report the filed issues in a line each.
