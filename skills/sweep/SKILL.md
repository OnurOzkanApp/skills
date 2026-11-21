---
name: sweep
description: Bug-hunt one area of a codebase over what changed since its last sweep, prove every finding, and file only the proven ones. Git tags remember what was already swept, so each sweep reads only what is new. Use when the user says "sweep <area>" or asks to look for bugs in an area.
disable-model-invocation: true
---

# Sweep an area

Git remembers what was scanned: each finished sweep leaves a `swept/<area>/<short-sha>` tag on the commit it covered. Tests remember what is confirmed broken, so every filed bug arrives with a test that proves it.

## 1. Base

Run `git fetch origin --tags`, then `git tag -l "swept/<area>/*" --sort=-creatordate` and take the first. Without a tag, this is the area's first sweep: review its current source instead of a diff.

## 2. Files

Work out the area's files yourself, including the other side of every boundary it crosses: the server for a client, the main process for a renderer, the worker for its queue. If there are more than about 3,000 lines to review, propose the riskiest part first and sweep the rest later.

## 3. Review

Read the diff since the base (`git diff <base>..origin/<default branch> -- <files>`), opening only the surrounding code needed to judge each change. Look for correctness bugs: wrong results, lost data, races, leaks, broken error paths, regressions against older behaviour. Skip style and refactors.

## 4. Prove

A finding counts only with evidence, one of:
- a test that fails on the default branch, written the way the project's own tests are written (the project's verify skill says how), kept outside the repo and never committed
- a reproduction in the running app, with the `verify` skill

Report the proven findings with their evidence. List the rest as *unconfirmed*, in a line each, and file nothing for them.

## 5. File and tag

- File each finding the user approves with the `issue` skill, as a bug, with Ready status. Its acceptance includes the failing test, which must pass once it is fixed.
- If the whole area was reviewed, tag the commit it covered: `git tag swept/<area>/<short-sha> <sha>`, then `git push origin <tag>`. Never move or delete an existing tag. A partial sweep gets no tag.
