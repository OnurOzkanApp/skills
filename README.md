# skills

How I work with AI coding agents, written down so they work the same way every time.

I build with agents every day. Claude Opus does almost all of the building, and a model from another family (Codex on GPT Sol) reviews the work that is risky. These skills are that workflow:
- how an idea becomes an issue, and an issue becomes merged code
- how every change is proven
- when a second model gets a say
- how I choose between designs
- what happens while I'm asleep
- how a mistake gets fixed so it stays fixed

They work in Claude Code, Codex and OpenCode, in any project: desktop apps, websites and command-line tools.

## The skills

**From idea to merged code**

| Say | Skill | What happens |
|---|---|---|
| `issue: …` | [issue](skills/issue/SKILL.md) | Files the work as a proper issue, checked against what already exists and what was turned down. It is scoped to the files that own it, has acceptance anyone can check, and goes on the board. It doesn't start the work. |
| `ship #12` or `ship: …` | [ship](skills/ship/SKILL.md) | Files the issue if there isn't one, takes it, builds exactly what it asks and proves it. Then it merges, or opens a PR when its risk check says so. Saying it again resumes. |
| `ship to PR #12` | [ship](skills/ship/SKILL.md) | The same, but always stops at a PR for me to merge. |
| `night run #12 #14` | [night-run](skills/night-run/SKILL.md) | Unattended. It never stops to ask: it records each decision with its options (screenshots for anything visual) and ends every task at a PR. |

**Proof and review**

| Say | Skill | What happens |
|---|---|---|
| `verify` | [verify](skills/verify/SKILL.md) | Evidence for every claim: a test that fails without the change, the real command's output, or the running app driven and screenshotted. What wasn't checked is listed as unproven. |
| `set up a verify kit` | [verify-kit](skills/verify-kit/SKILL.md) | Builds a project's own verify kit: a small command-line tool that starts and drives the app the same way every time, plus a feature map of what the app does, where it lives and how a user reaches it. Ships a [CDP driver](skills/verify-kit/scripts/cdp.mjs) with no dependencies, for websites and Electron apps. |
| `council` | [council](skills/council/SKILL.md) | A reviewer from another model family reads the diff against the acceptance. Every finding gets an answer: fixed, rejected with evidence, or noted as out of scope. |
| `sweep <area>` | [sweep](skills/sweep/SKILL.md) | Hunts bugs in one area over what changed since its last sweep, proves each one, and files only the proven ones. Git tags remember what was swept. |

**Design, planning and learning**

| Say | Skill | What happens |
|---|---|---|
| `options for the header` | [design-options](skills/design-options/SKILL.md) | Three real options for a visual change (or as many as I ask for), side by side in the browser I name, in the app's default theme only. It ends with the agent's own pick in one line, and I choose by looking. |
| `what should we build next?` | [plan-features](skills/plan-features/SKILL.md) | Proposes up to five features grounded in the product doc and the code, never one already planned, shipped or turned down. It files the picks and closes the rejects so they're never proposed again. |
| `lesson` | [lesson](skills/lesson/SKILL.md) | After a correction, it puts the fix where the mistake can't come back: the code, then a check, then a rule, then a skill. |

```
issue → take → build → verify → risk check ── risky? ──→ council ──┐
                                    │                              │
                                    └─────────────→ merge or PR ←──┘ → report
```

## What they encode

- **Build what was asked.** The issue's acceptance is the whole deliverable. Anything else an agent notices reaches me as one line in its report, not as a diff.
- **Prove it.** Every acceptance line gets evidence. "Should work" doesn't count, and a check that didn't run is never reported as run.
- **Make verifying the easy path.** Each project gets its own way to run and drive its app, and a map of what's in it. Agents stop improvising scripts, and a vague bug report turns into a feature they can open and check.
- **A second opinion where it matters.** Risky changes get a reviewer from a different model family, which sees the diff and the acceptance but not the builder's reasoning. Reviews make a change correct, not bigger. The budget is two rounds.
- **Merge what's safe, PR what's risky.** A written rule decides, not the agent's mood: contracts, data, auth, an unresolved review finding or anything unproven always goes to a PR.
- **Choose by looking.** A visual change comes as real options side by side, with the agent's own pick in one line. I decide by seeing them, not by reading about them.
- **Never block overnight.** A question asked at 2 a.m. wastes the night. A recorded decision costs me one comment in the morning.
- **GitHub is the memory.** Issues hold what's planned, shipped and turned down; tags hold what was swept. Nothing lives in a side list.
- **Fix mistakes at the highest layer.** Agents copy the code they see, so the strongest fix is in the code itself, then a check, then a rule, and only then a skill.

## Install

```sh
npx skills add OnurOzkanApp/skills        # into the current project
npx skills add OnurOzkanApp/skills -g     # for every project on this machine
npx skills update                         # later, to pick up changes
```

## Project settings

The skills read a `## Ship` section in the project's `AGENTS.md` (or `CLAUDE.md`). A project without one gets safe defaults, and every change lands as a PR.

```markdown
## Ship

- Repo: owner/name. Board: follow `.agents/skills/my-board/SKILL.md` to take a task and set its status.
- Labels: one `type:` label (`type:bug`, `type:feature`) on every issue.
- Branch: `task/<issue>-<topic>` from the latest `origin/main`.
- Verify: `verify-myapp`. Run only the checks the acceptance needs.
- Product: `docs/product.md` (what it is not; where it is going).
- Always PR: `src/api/schema.ts`, database migrations, anything that deletes user data.
- Design: options in the `Light` theme only; preview pages link `dist/app.css`.
- Merge: `--no-ff`, message `Merge <branch>: <subject> (#N)`.
```

## Also in my toolbox

Skills by others that I use alongside these, mostly for design:

- [impeccable](https://github.com/pbakaus/impeccable): design, critique and polish for any interface
- [emilkowalski/skill](https://github.com/emilkowalski/skill): Emil Kowalski's UI polish and animation (`emil-design-eng`, `apple-design`, `review-animations`, `find-animation-opportunities`)
- [web-design-guidelines](https://github.com/vercel-labs/agent-skills): Vercel's interface guidelines review
- [taste-skill](https://github.com/Leonxlnx/taste-skill): redesigning existing projects

## Credits

Two talks shaped these skills:

- Lauren ([poteto](https://github.com/poteto)), on shipping thousands of PRs with agents by building trust in layers: the codebase as memory, then static analysis, then rules, then skills. Plus verification the agent runs itself, which `verify` and `verify-kit` follow.
- Theo's [tstack](https://github.com/t3dotgg/tstack), whose sol-loop, full-send and full-stop skills showed how far a few precise markdown files can go.

## License

[MIT](LICENSE)
