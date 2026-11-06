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

## Hosted verification (2026-11-07)

Runtime PR12 merged as bf0b0add0726d0b739b0af105e1dfe025c880731. Production https://learn-esp32-xi.vercel.app/ serves byte-identical main.js and styles.css. Hosted 320/390/1320/844 checks pass all five stages holding after each press, live HIGH readout bounds, Previous/Replay, resistor/LED actions, GPIO description, and knob separation. Final hosted phone, desktop, landscape and description pixels inspected. Await the panel transition before screenshotting its body; an immediate snapshot can show an unfinished animation.

Main.js SHA256: 875df1130ca29b30a9cacfb44ea47ba8355468b077bd4dc6834f6f07aacbd4ac

Styles.css SHA256: 06fb495b3dd2dcb096fcf521e1fdb537cf0e3607aec784febba82dcec200f953
