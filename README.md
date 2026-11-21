# skills

How I work with AI coding agents, written down so they work the same way every time.

I build with agents every day. Claude Opus does almost all of the building, and a model from another family (Codex on GPT Sol) reviews the work that is risky. These skills are that workflow: how a task goes from an issue to merged code, when a second model gets a say, what happens when I'm asleep, and how a mistake gets fixed so it stays fixed.

They work in Claude Code, Codex and OpenCode, in any project.

## The skills

| Say | Skill | What happens |
|---|---|---|
| `ship #12` | [ship](skills/ship/SKILL.md) | Takes the issue, builds exactly what it asks, proves it, and merges it, or opens a PR when its risk check says so. Saying it again resumes. |
| `ship to PR #12` | [ship](skills/ship/SKILL.md) | The same, but always stops at a PR for me to merge. |
| `council` | [council](skills/council/SKILL.md) | A reviewer from another model family reads the diff against the acceptance. Every finding gets an answer: fixed, rejected with evidence, or noted as out of scope. |
| `options for the header` | [design-options](skills/design-options/SKILL.md) | Three real options for a visual change (or as many as I ask for), side by side in the browser I name, in the app's default theme only. It ends with the agent's own pick in one line, and I choose by looking. |
| `night run #12 #14` | [night-run](skills/night-run/SKILL.md) | Unattended. It never stops to ask: it records each decision with its options (with screenshots for anything visual) and ends every task at a PR. |
| `lesson` | [lesson](skills/lesson/SKILL.md) | After a correction, it puts the fix where the mistake can't come back: the code, then a check, then a rule, then a skill. |

```
issue → take → build → prove → risk check ──── risky? ──→ council ──┐
                                   │                                │
                                   └──────────────→ merge or PR ←───┘ → report
```

## What they encode

- **Build what was asked.** The issue's acceptance is the whole deliverable. Anything else an agent notices reaches me as one line in its report, not as a diff.
- **Prove it.** Every acceptance line gets evidence: a test that fails without the change, real command output, or the running app. "Should work" doesn't count, and a check that didn't run is never reported as run.
- **A second opinion where it matters.** Risky changes get a reviewer from a different model family, which sees the diff and the acceptance but not the builder's reasoning. Reviews make a change correct, not bigger. The budget is two rounds.
- **Merge what's safe, PR what's risky.** A written rule decides, not the agent's mood: contracts, data, auth, an unresolved review finding or anything unproven always goes to a PR.
- **Choose by looking.** A visual change comes as real options side by side, with the agent's own pick in one line. I decide by seeing them, not by reading about them.
- **Never block overnight.** A question asked at 2 a.m. wastes the night. A recorded decision costs me one comment in the morning.
- **Fix mistakes at the highest layer.** Agents copy the code they see, so the strongest fix is in the code itself, then a check, then a rule, and only then a skill.

## Install

```sh
npx skills add OnurOzkanApp/skills        # into the current project
npx skills add OnurOzkanApp/skills -g     # for every project on this machine
npx skills update                         # later, to pick up changes
```

## Project settings

The skills read a `## Ship` section in the project's `AGENTS.md` (or `CLAUDE.md`). A project without one gets safe defaults and every change lands as a PR.

```markdown
## Ship

- Repo: owner/name. Board: follow `.agents/skills/my-board/SKILL.md` to take a task and set its status.
- Branch: `task/<issue>-<topic>` from the latest `origin/main`.
- Prove: `npm test -- <file>` for the files touched; the running app through the `verify-app` skill.
- Always PR: `src/api/schema.ts`, database migrations, anything that deletes user data.
- Design: options in the `Light` theme only; preview pages link `dist/app.css`.
- Merge: `--no-ff`, message `Merge <branch>: <subject> (#N)`.
```

## Credits

Two talks shaped these skills:

- Lauren ([poteto](https://github.com/poteto)), on shipping thousands of PRs with agents by building trust in layers: the codebase as memory, then static analysis, then rules, then skills, plus verification the agent can run itself.
- Theo's [tstack](https://github.com/t3dotgg/tstack), whose sol-loop, full-send and full-stop skills showed how far a few precise markdown files can go.

## License

[MIT](LICENSE)
