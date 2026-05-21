<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:karpathy-guidelines -->
# Engineering Guidelines

Adapted from [multica-ai/andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills).

## 1. Think Before Coding

**Core principle:** Don't assume. Don't hide confusion. Surface tradeoffs.

- State assumptions explicitly; ask if uncertain.
- Present multiple interpretations rather than choosing silently.
- Mention simpler approaches and push back when appropriate.
- Stop and name confusions instead of proceeding.

## 2. Simplicity First

**Core principle:** Minimum code that solves the problem. Nothing speculative.

Avoid:
- Features beyond what was requested.
- Abstractions for single-use code.
- Unrequested "flexibility" or "configurability".
- Error handling for impossible scenarios.
- Over-engineering (if 200 lines could be 50, rewrite).

Test: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Core principle:** Touch only what you must. Clean up only your own mess.

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor unbroken code.
- Match existing style.
- Mention unrelated dead code but don't delete it.

Scope: Every changed line should trace directly to the user's request.

Remove only imports/variables/functions YOUR changes made unused.

## 4. Goal-Driven Execution

**Core principle:** Define success criteria. Loop until verified.

Transform tasks into verifiable goals with specific checks, not vague targets like "make it work."

For multi-step work, state a brief plan with verification steps for each stage.
<!-- END:karpathy-guidelines -->
