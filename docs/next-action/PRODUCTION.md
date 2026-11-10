# Guided continuation production verification

Live: https://learn-esp32-xi.vercel.app/

Released 10 November 2026 through PR45: https://github.com/rajeshceg3/learn-esp32/pull/45

Runtime commit: 35e4fa2d3b12031341708bc2e96458200b33e8f5

Feature commit: 4d28de11fa9bd0e59dfd7c64260271d5def52d8e

Vercel deployment: https://vercel.com/rajeshceg3s-projects/learn-esp32/AFUHhutpfExekY11MGu7nyjyuQB5

Main CI: https://github.com/rajeshceg3/learn-esp32/actions/runs/42816527732/job/129830893345

PR CI: https://github.com/rajeshceg3/learn-esp32/actions/runs/42816145705/job/129829629493

## Verified

- All eight guided lessons on production at 320×740, 390×844, 844×390 and 1320×900 with reduced motion: final stage waits; Next lesson/Choose a lesson is live; Previous/Next and Enter focus work; the next guide starts at zero and held Enter does not skip it; Lessons navigation exposes/focuses a visible card; no horizontal overflow or uncaught page errors.
- Hosted interaction edges at 390 and 1320: held Enter, rapid double click, Replay, tab switching, optional continuous/Stop, Space continuation, Tamil shell with explicit English guide, unchanged restored completion.
- The reviewed candidate also completed all eight guides in normal motion at phone and desktop widths, retained in local-motion-phone-a/b and local-desktop-a/b. Served production runtime files match the reviewed source exactly (production-runtime.json).
- Separate cloud-browser production phone and desktop completion views inspected. Local production small-phone final guide, landscape lesson selection, desktop guide and post-transition phone circuit inspected as actual pixels, not only bounds.
- Source CI and main CI passed all 12 existing unit tests plus the new guide and edge tests.

## Still open

Phone circuit and guide can occupy different scroll positions. This is a bounded continuation/navigation repair, not a complete phone teaching-layout redesign or Arduino-reference parity claim. No physical ESP32 or physical Safari testing was done. The existing guide remains explicitly English in translated shells. No persistence/provider/account/spend change.
