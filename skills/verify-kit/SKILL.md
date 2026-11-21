---
name: verify-kit
description: Build or grow a project's verify kit - a small command-line tool that starts and drives the app the same way every time, plus a feature map of what the app does, how a user reaches each part and which files own it. Use when a project has no verify kit, when verifying keeps being improvised, when the user asks to set up verification or to map the app, or when the map is out of date.
---

# Verify kit

Agents can only verify what they can run. Give them a stable way to run the app and a map of what is in it, and they stop guessing. They run the same commands every session, so results compare across sessions. A vague report ("the thing in the corner is wrong", a cropped screenshot) becomes a feature they can open and check. The `verify` skill uses the kit; this skill builds it.

## 1. Where it lives

- The whole kit goes in `.agents/skills/verify-<project>/`: `SKILL.md`, `scripts/` and `map/`. Codex, OpenCode and most agents read skills there.
- Claude Code reads only `.claude/skills/`, so copy `SKILL.md` alone to `.claude/skills/verify-<project>/SKILL.md`. Write every path in it from the repo root so both copies read the same, and change them together. A project used only with Claude Code can keep the whole kit in `.claude/skills/`.
- Add `Verify: verify-<project>` to the project's `## Ship` section.

## 2. The tool

One entry point, `scripts/verify.mjs` or the project's own language. Each command prints one line or JSON and exits non-zero on failure:

| Command | What it does |
|---|---|
| `start` | Starts the app on a scratch profile and a free port, waits until it answers, and prints the port. Does nothing if it is already running. |
| `stop` | Closes it the way a user would, so nothing unsaved is lost. |
| `open <feature>` | Goes to a feature by its name in the map. |
| `shot <name>` | Saves a screenshot to a known folder outside the repo and prints the path. |
| `eval`, `click`, `type`, `key`, `scroll` | Drive it like a user, with real input events. |
| `check` | Runs the project's automated visual checks, if it has any (clipped text, overflow). |
| `logs` | Prints the errors since `start`. |

- **Chromium apps** (a website in Chrome or Edge, an Electron app): copy this skill's `scripts/cdp.mjs` into the kit and build on it. It drives any page with a DevTools port and needs no dependencies. For a website, start the dev server, then Chrome or Edge with `--headless=new --remote-debugging-port=<port> --user-data-dir=<temp folder>`. For an Electron app, start it with `--remote-debugging-port=<port>` and its own `--user-data-dir`.
- **Command-line tools, servers and libraries:** `start` runs the program against a temp folder or a test database, and the other commands are its real commands and requests.
- **Never the user's real data:** always a scratch profile, temp folder or test database, unless the user names theirs.
- **Never a fixed port:** pick a free one (`node cdp.mjs free-port`) and save it in the scratch folder, where `stop` and the other commands find it.
- **Grow it from use:** start with `start`, `stop`, `shot` and `eval`. The second time a verification needs a step the tool lacks, add it as a command, so the step is never improvised again.

## 3. The skill

The kit's `SKILL.md` is its memory of this app's traps. Keep it short and specific:
- how to start the app, and what a session's environment can break
- what makes tests fail after an edit
- what a passing check can hide (a stale build, a mock)
- what never to do (kill the process and lose unsaved state, use the real profile)
- how to reach the hard parts (drag regions, canvases, terminals, native menus)

Add a line whenever an agent loses time to something it could have been told.

## 4. The feature map

`map/README.md` is the index: one line per surface, and the commit it was mapped at.

```
Mapped at: <sha> (<date>)

- [Title bar](title-bar.md): window controls, tabs, search
- [Settings](settings.md): appearance, accounts, shortcuts

## Not here
- <What the app does not do, and where that was decided>
```

Each surface gets a page, with an entry per feature:

```
### <The feature, named as a user would>
- Reach: <the label, shortcut, menu path or route a user takes>; hook: <a stable selector or test id>
- Does: <what it does, in one sentence>
- Code: <the files that own it>
- Notes: <its states and limits, and what it does not do>
```

- **From the code's own words:** build the map from the app's labels and strings and its routes, never from guesses. Several agents can each map a surface in parallel; then check a sample of every page against the running app.
- **Not here:** list what the app doesn't do: the product doc's out-of-bounds list, issues closed as not planned, and gaps seen while mapping. Agents stop searching for things that don't exist.
- **Keep it current:** a change that adds, moves or removes something a user can reach updates its map page in the same change; the project's `## Ship` section says so. To refresh the map, read `git diff <mapped sha>..HEAD` over the UI code, update only the pages it touches, then the sha.

## 5. Prove the kit

Run every command once against the real app and show the output. A kit that has never run is not a kit.
