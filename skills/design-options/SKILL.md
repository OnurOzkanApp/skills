---
name: design-options
description: Show the user real options for a visual change, side by side, so they pick by looking. Three options by default (or as many as asked), on one page in the browser the user names, in the project's default theme only, ending with your own pick in one line. Use when the user asks to design, redesign, restyle or change how something looks without fixing the exact result, or asks for options or variants.
---

# Design options

The user decides how something looks by seeing it, not by reading about it. Build real options, put them side by side, give your pick, and let them choose.

## 1. Read the brief

- **How many:** 3, unless the user names a number.
- **Where:** the browser the user names. When they don't name one: Zeralyx's Browser if the session has its browser tools (the page opens beside the chat, where the user is looking), otherwise Chrome.
- **Theme:** the project's default theme only, one render per option. The project's `## Ship` section names the theme; without one, use whatever the app opens in. Show other themes only when the user asks, or when the change is about colour, contrast or theming itself, so that the themes are the point. Extra themes cost time and tokens and rarely change the pick.
- Load the design skills the project's `CLAUDE.md` or `AGENTS.md` names before designing.

## 2. Make options worth choosing between

- Each option is a different answer to the question: a different layout, hierarchy, density or behaviour. Changing the spacing from 8 to 10px is a detail inside one option, not a second option.
- Every option is one you would ship: on the project's design system, readable, and with the states the question touches (hover, empty, long text, narrow window).
- Options vary *how* the requested thing looks. None of them adds a feature the user didn't ask for.
- Label them A, B, C… with a name of two to four words each ("A, compact rows").

## 3. Put them on one page

- Build one preview page with every option at its real size, labelled, side by side, or stacked when they are wide. Use the app's real styles (its built or dev CSS, and the project's notes on preview pages), not lookalike styles invented for the page.
- Save it in a folder git ignores (check with `git check-ignore <path>`), inside the project so the browser can load its styles from beside it. Never commit it.
- Don't change the real code yet: the page is for choosing.
- Open it in the chosen browser and look at it yourself before showing it: every option visible, nothing clipped, the page scrolls.

## 4. Present

In the chat, write one line per option: its letter, its name, and what it trades off. Then end with your pick on its own line, with no reason:

```
I prefer: B
```

The user sees which one you like without being argued into it. Then wait for their pick. In a night run, take your own pick and record the decision as the `night-run` skill says, with a screenshot of each option from this page.

## 5. After the pick

- Build the picked option in the real code. A mix ("B, with A's header") is a normal answer: build the mix.
- Delete the preview page.
- Verify the result in the running app, as the project's verify skill says.
