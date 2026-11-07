# Button and potentiometer control layout

Lesson3's BUTTON is a toggle: click, Enter or Space changes pressed state. It is not a momentary pointer hold. Stop clears pressed state and LED output. Lesson4's POT supports pointer/touch horizontal drag, click and keyboard increment. Moving these buttons into a reserved dock keeps those existing contracts. ADC/PWM labels still update, and the four colored wire readings occupy a separate strip independent of animation dots. No component labels or wire readings sit on the circuit canvas.

Phone layout stacks circuit, controls, readings and camera tools. Short landscape places controls/readings beside the circuit. On short phones the rest is scrollable above fixed navigation. Selected controls mark physical parts. Zoom/pan is bounded to keep the circuit visible. Board introduction and Blink retain their accepted layouts.

## Checks

- 11 unit tests pass.
- `tests/input-dock-regression.cjs`:320x700,390x844,1320x900,844x390. Reserved bounds,44px targets, button toggle/keyboard/stop, POT keyboard/pointer/touch drag, ADC4095/PWM output and stopPWM0, zoom bounds.
- Blink390 regression, board390 settings/focus/language/restore and board16lesson actualRunStop smoke pass. Prior combined rerun timed out and is not counted as a pass.
- Actual phone/short-landscape/desktop pixels inspected. Browser emulation is not physical-device proof.

12 other lessons remain uncorrected. Whole-app/fleet overlap adoption is unfinished.
