# Learner next action audit, 10 November 2026

Bounded findings:8guided lessons end with bright inert Loop complete despite a separate lesson rail being the real continuation. Mobile Lessons navigation is a literal no-op due a width guard. Fix: after a guide finishes and holds, the explicit primary action is Next lesson (final guide: Choose a lesson). No autonomous transition, no score/mastery change, Replay/Previous/continuous remain. Lessons navigation scrolls to/focuses the current lesson on phone and desktop.

Separate open observation: phone circuit and guide can occupy different scroll positions. This increment does not compress the model, add a floating button over circuits or claim a full learning-layout redesign/reference parity.

## Candidate verification

- All eight guides: 320×740, 390×844, 844×390 reduced motion; 1320×900 normal motion split into two bounded test runs. Every guide holds on its final stage, Previous returns to Next step, explicit Enter continues exactly one lesson, and the final guide returns focus to the current lesson in the rail. Lessons navigation focuses a fully visible card on all four sizes. No horizontal overflow or uncaught JavaScript errors.
- Interaction edges at 390 and 1320: held Enter, rapid double click, Replay, tab switching, continuous/Stop, Space continuation and focus, Tamil shell with the existing explicit English guide, preserved restored completion. Held Enter on the newly focused stage does not skip into the next guide.
- Existing 12 learning-controller, simulated-output, copy and persistence tests pass.
- Actual PNGs inspected: completed phone and desktop guides, final phone guide and landscape lesson selection. The layout still has the separate phone circuit/guide scroll limitation above. No hardware or physical Safari claim.

Reproduce: serve the repository on port 8796; set PLAYWRIGHT_MODULE to an installed Playwright module and run tests/next-action-guide.cjs and tests/next-action-edges.cjs. BASE_URL and OUT select hosted verification and retained output. VIEWPORTS, MOTION and GUIDES bound the matrix. CI retains its own evidence artifact.
