---
name: lesson
description: Turn a correction into something that stops the mistake for good, placed as high as it can go - make it impossible in the code, catch it with a check, state it as a rule, teach it in a skill, in that order. Use when the user says "lesson", "don't do that again", "remember this", or corrects the same kind of mistake a second time.
---

# Lesson

Agents copy what they see. A correction given in chat is gone next session; the same correction encoded in the code is never needed again. Put each lesson at the highest layer that can hold it.

## 1. Name the mistake

One line for what went wrong, and one for the general class it belongs to. "Used `px` for the gap" is an instance; "spacing that skips the token scale" is the class. Encode the class.

## 2. Find what taught it

Search the codebase for the pattern the agent copied: an older workaround, a comment that excuses a special case, a second way of doing what already has a blessed way. That copy is the source. Note every place it occurs.

## 3. Pick the layer, highest first

1. **Code:** make the wrong thing impossible or awkward. A type that rejects it, one helper that replaces three ways of doing it, a module boundary it can't cross. Delete the bad example it copied.
2. **Check:** a test or check script that fails on it, run by the project's existing check command. Never add CI jobs or workflows; extend what runs today.
3. **Rule:** one line in `AGENTS.md` or `CLAUDE.md`, next to the rules for that area, saying what to do rather than what not to.
4. **Skill:** a step in the skill for that workflow, when the lesson is about *how to work*, not a fact about the code.
5. **Memory:** only when the lesson is about the user (a preference, how they decide), not about the code.

Go down a layer only when the one above can't hold it, and say why in one line ("a type can't express this, because …").

## 4. Land it

- Rules, skills and memory: make the edit now. If the task under way owns the file, put it on that branch; otherwise ship it as its own small task.
- Code and checks are real work. Ship them as a task whose acceptance includes the check failing on the old pattern.
- The other copies found in step 2: remove them if they are inside the same scope. Otherwise list them in the report so they can be cleaned up. The check stops new copies in the meantime.

## 5. Report

```
Lesson: <the class of mistake>
Layer:  <code | check | rule | skill | memory>, because <one line>
Change: <file, or the issue it was filed as>
Copies: <places still using the old pattern, or "none">
```
