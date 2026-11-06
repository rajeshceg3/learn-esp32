# Blink circuit annotations

Scope: lesson 2 (Blink an LED). The board introduction stays unchanged. The other 14 lessons retain their existing functional tags and need separate layout review.

Four component names/actions occupy a reserved dock outside the fitted circuit canvas. Selecting a component marks its physical location. LED color and resistor-value actions remain live. GPIO/GND descriptions remain available. The guided HIGH/LOW state is in a reserved readout strip, rather than over a wire. Duplicate wire badges are suppressed only for this lesson.

Portrait uses a model, dock, camera toolbar, readout, then a normal-flow teaching card. Short landscape uses model and dock side by side; scroll down for the teaching card. This is deliberately scrollable, not a claim that all content fits a 390px-high screen. Camera zoom is bounded to retain the circuit.

## Verification

- `node --test tests/*.test.mjs`: 11 tests pass.
- `PLAYWRIGHT_MODULE=... node tests/blink-dock-regression.cjs`: 320x700, 390x844, 1320x900, 844x390. Checks reserved label/readout bounds, 44px targets, resistor replacement, physical marker, guided stage holds, Previous/Replay, bounded zoom, knob lesson separation, board introduction retention.
- `tests/board-dock-settings.cjs`: keyboard/focus, label settings, language, schematic, reduced motion, restore/reload pass at390.
- Existing board regression's "dock must be absent after lesson0" expectation is updated to permit the intentionally docked blink lesson.

Screenshots are browser evidence, not a physical-device test. Global overlap adoption is unfinished.
