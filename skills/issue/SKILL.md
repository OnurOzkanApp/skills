---
name: issue
description: File work as a well-formed issue without starting it - checked against what already exists, scoped to the files that own it, with acceptance anyone can check, labelled and on the board. Use when the user says "issue", "file an issue", "create an issue", "add this to the board" or "queue this"; ship uses it when a task has no issue yet.
---

# Issue

An issue is the task's memory: the next agent, or the next person, starts from it with nothing else. Write it so they can.

## 1. Read the project's settings

Use the `## Ship` section in `AGENTS.md` or `CLAUDE.md` for the repo, the board skill and the labels. Without one, use the current repo's GitHub issues through `gh`, and no board.

## 2. Check it isn't already there

- Search open issues for the same outcome (`gh issue list --search "<key words>" --state open`). If one matches, report it instead of filing a second.
- Search closed issues as well. Something closed as "not planned" was turned down: don't file it again unless the user says so, and tell them it was. Something closed as completed may have regressed: if so, say so in the new issue and link the old one.

## 3. Find the scope

Read just enough code to name the files that own the change, and the files it must not touch when that matters. A path in Scope is a promise that the work stays there, so pick the real ones, not a guess at a folder.

## 4. Write it

Copy the shape of the repo's recent issues. If those are inconsistent, use the issue templates, or else this shape:

```
<What is wrong or missing today, and what changes, in plain sentences.>

**Scope:** <owned paths>; not <excluded paths, if any>.

**Acceptance**
- <A result anyone can check: what a user sees or a command shows.>
- <The check that proves it, when one is needed.>
```

- **Title:** `<Area>: <what changes>`, written as the outcome ("Home: a corner no longer shrinks Notes until its words can't be read"), not the work ("Fix home store").
- **Acceptance lines are results, not steps.** "Saving twice keeps one copy" can be checked. "Refactor the save path" can't.
- Only what the user asked for. Ideas you had while reading the code go in your reply, not in the issue.
- Several requests at once ("issue: A; B; C") become one issue each.

## 5. File it

- Add the labels the project uses: its type label and, if it has them, its platform or area label.
- Board status, through the project's board skill: **Ready** when the scope and acceptance are clear, **Backlog** when the user says "later", and **Needs Discussion** when it holds an open question or a decision.
- Don't assign it or start it. Taking it is `ship`'s job.

## 6. Report

One line per issue: `#N <title>, <status>, <link>`. Then any duplicate or turned-down match from step 2, in a line each.
