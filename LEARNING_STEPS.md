# Learner-paced blink lesson

Blink an LED has five learner-controlled stages: configure GPIO26, write HIGH, wait HIGH, write LOW, wait LOW. Each Next press performs only one stage and then waits indefinitely for the learner. Replay and Previous allow review; Watch the full loop and the existing Run control keep continuous simulation available.

The wait stages use the editable code timing. Reset, lesson/language changes and mode changes invalidate stale callbacks. Blur/hidden settle the current stage without advancing. Repeated taps and held keys cannot skip a busy stage. This browser simulation does not upload firmware or prove physical hardware behavior.

The guide is currently English, marked as English when another interface language is selected. It is not a new translation-coverage claim. Other sequential lessons still need their own learner-paced contracts and implementation.

## Verification

Run `node tests/learning-steps.test.mjs` for controller boundaries, 100 rapid activation rejections, no autonomous advance, stale reset protection and previous/completion bounds.

Browser candidate checks: five stages at 390px and 1320px; Enter/Space; rapid clicks, repeated held Enter; Replay/Previous; blur/hidden; continuous to guided; tab/resize reparenting at 320px, 390px and desktop; reduced-motion browser setting; touch emulation; timing edits; lesson/language reset; 12-second reading pause. All 16 existing lessons were run/stopped at 320px, 390px and 1320px with no page errors or failed requests. Actual phone/desktop pixels inspected, including LED and Next visible together and controls clear of fixed navigation. Physical-device and OS-interruption testing remain unverified. Source, local proof and hosted release are separate gates.
