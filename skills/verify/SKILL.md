---
name: verify
description: Prove a change works with evidence instead of saying it should - a test that fails without it, the real command's output, or the running app driven and screenshotted through the project's verify kit. Use before calling any change done, when reproducing a reported bug, when a test fails after an edit, or when the user asks to check, test or verify something.
---

# Verify

"It should work" is a guess. Evidence is a test that failed and now passes, output from the real thing, or the running app doing what it should, seen and recorded. Collect evidence for every claim you make, and say plainly what you did not check.

## 1. Find the project's verify kit

A verify kit is the project's own way of running and driving its app: a skill named `verify-<project>` with a small command-line tool and a feature map (the `verify-kit` skill builds one). `## Ship` in `AGENTS.md` or `CLAUDE.md` names it under Verify.

- **Kit found:** read its skill first. It knows this app's traps, how to start it without touching the user's real data, and where every feature lives. Use its commands rather than improvising your own.
- **No kit:** use the ways below directly. When you have had to improvise the same steps twice, say in your report that the project would benefit from a kit.

## 2. Pick the strongest evidence for each claim

Go through the acceptance, or the claim you are about to make, line by line:

1. **A focused test** that fails without the change and passes with it. Run that test, not the whole suite, unless the acceptance asks for the suite.
2. **The real command:** the CLI, the build, the API call, the migration, run for real, with its output.
3. **The running app:** start it through the kit, drive it to the feature, and read the state (DOM, logs, files, responses). For anything visual, take a screenshot of each screen and state the change touches (hover, empty, long text, narrow window) and look at it.
4. **Measurements** when the claim is about speed or memory: a trace or timing from the running app, before and after.

A mock or a stub proves only the code around it, never the behaviour it fakes. A passing build proves the code compiles, not that it works.

## 3. Bugs: reproduce first

Before fixing a reported bug, reproduce it with the same steps, and keep the evidence (the failing test, or a screenshot or log). After the fix, run the same steps and show the difference. A bug you couldn't reproduce is reported as such, and its fix as unproven.

## 4. Don't fool yourself

- Make sure the running app is the new code: rebuild or restart as the kit says. A stale build passes everything.
- Run against a scratch profile or test data, never the user's real data, unless they name it.
- Interact like a user: real clicks, scrolls and keys. Setting `scrollTop` or calling a handler directly proves only that the code path exists.
- Clean up: close the app gracefully, stop servers, and delete harness and temp files.

## 5. Report

One line per claim: what was checked, how, and what it showed. Then a separate **Unproven** list for everything you could not check, with the reason. Never write that a check ran when it did not, and never blur "checked in a browser" with "checked in the app".
