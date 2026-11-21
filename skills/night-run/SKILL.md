---
name: night-run
description: Work unattended until the user is back. Never stop to ask - write out the options, pick the one you recommend, keep going, and end every task at a PR that shows each decision, with a screenshot of every option for visual choices. Use when the user says "night run", "overnight", "while I sleep", or that they will not be watching.
---

# Night run

The user is asleep. A question you stop to ask wastes the night; a decision you record costs them one comment in the morning. So decide, record, and keep going.

## 1. What is in the run

- One issue, a list (`night run #12 #14 #15`), or a request with no issue (file the issue first, as ship does).
- Work them one at a time: one branch and one PR each, in the order given. Start the next one only from a clean checkout.
- Follow the `ship` skill for each task, with two changes: **landing is always a PR**, and **questions become decisions** (step 2). Ship's own rule decides whether `council` reviews the change.

## 2. Decide instead of asking

Wherever you would ask the user, write a decision and go on:

1. **The question**, in one line.
2. **2 to 4 options**, one line each.
3. **Your pick**, with a one-line reason. For scope questions, pick the smallest reading that meets the acceptance.
4. **How to switch:** what the user says or does to get another option.

Build only the picked option. If an alternative's code already exists because you tried it, push it as `<task branch>--<letter>` and link it, so switching is a merge and not a rebuild. Don't write alternatives just to have them.

**Never decide these, even at night:** anything the project says to stop and report on; deleting or migrating user data; credentials, auth or native logins; spending money; publishing outside the repo; force-pushing. Record a blocker (`Blocked #N: … | Need: …`) and move on to the next task. If the project says to stop and report on that thing, publish nothing for that task: leave its branch local and report it in the morning. Otherwise push what is safely done as a draft PR.

## 3. Show visual choices

For a decision about how something looks:

1. Build the options on one preview page, as the `design-options` skill does.
2. Screenshot every option at the same size, theme and state. Name the files after the decision and option (`1-a-compact.png`, `1-b-roomy.png`).
3. Upload them with this skill's script, run from the repo:
   `node <this skill's folder>/scripts/pr-media.mjs --folder <task branch> <png files>`
   It commits the images to a `pr-media` branch without touching your checkout, and prints a Markdown image for each, linked to that exact commit so a later upload can't change it. The images never enter the task branch. Give each image a different file name.
4. Put them side by side in the PR, with the pick marked.

## 4. The PR's Decisions section

```
## Decisions

### 1. How dense is the list?
Picked **B, roomy**: the rows hold two lines of text without clipping.

| A, compact | B, roomy (picked) |
|---|---|
| ![1-a](…) | ![1-b](…) |

To switch: comment "use A for 1".
```

Number decisions across the PR, so a comment can name one.

## 5. The morning report

The last message is what the user reads first. One block per task:

- **#N:** PR link, or blocked and why
- **Decisions:** how many, each in a few words
- **Unproven:** anything not verified
- **Council:** the footer line, or skipped

Then one line for anything that went wrong with the run itself (a crashed app, a check that would not start).
