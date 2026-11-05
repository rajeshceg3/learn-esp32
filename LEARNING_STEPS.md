# Learner-paced blink lesson

Blink an LED has five learner-controlled stages: configure GPIO26, write HIGH, wait HIGH, write LOW, wait LOW. Each Next press performs only one stage and then waits indefinitely for the learner. Replay and Previous allow review; Watch the full loop and the existing Run control keep continuous simulation available.

The wait stages use the editable code timing. Reset, lesson/language changes and mode changes invalidate stale callbacks. Blur/hidden settle the current stage without advancing. Repeated taps and held keys cannot skip a busy stage. This browser simulation does not upload firmware or prove physical hardware behavior.

The guide is currently English, marked as English when another interface language is selected. It is not a new translation-coverage claim. Other sequential lessons still need their own learner-paced contracts and implementation.

## Verification

Run `node tests/learning-steps.test.mjs` for controller boundaries, 100 rapid activation rejections, no autonomous advance, stale reset protection and previous/completion bounds.

Browser candidate checks: five stages at 390px and 1320px; Enter/Space; rapid clicks, repeated held Enter; Replay/Previous; blur/hidden; continuous to guided; tab/resize reparenting at 320px, 390px and desktop; reduced-motion browser setting; touch emulation; timing edits; lesson/language reset; 12-second reading pause. All 16 existing lessons were run/stopped at 320px, 390px and 1320px with no page errors or failed requests. Actual phone/desktop pixels inspected, including LED and Next visible together and controls clear of fixed navigation. Physical-device and OS-interruption testing remain unverified. Source, local proof and hosted release are separate gates.

## Learner-paced servo sweep

The servo lesson also has four stages: configure the example's signal, set its starting endpoint, sweep outward once, return once. Each press runs only that stage; after reaching its endpoint the simulation waits. Reduced motion shows the endpoint without traveling through the sweep. Blur/hidden settles the current stage rather than advancing. Replay, Previous and optional continuous run remain available. This is the example's browser model, not proof of real servo calibration or hardware operation. The existing page's pulse/servo specifications are not newly verified by this change.

`node tests/servo-learning.test.mjs` exercises the actual scene simulation factory for bounded sweeps, no autonomous advance across 500 idle ticks, interruption settlement, reduced motion and optional continuous run. Current local browser checks cover 320/390/1320, reduced motion, rapid/held keys, reset during sweep, blur/hidden, Previous, mode/tab changes, resize reparenting, touch emulation, lesson/language reset and a 12-second reading pause. All 16 prior run/stop flows at three widths remain separate regression coverage. Local proof is not a hosted-release claim.
