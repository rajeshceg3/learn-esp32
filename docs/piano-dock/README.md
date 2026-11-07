# Mini-piano spatial controls

Lesson9 four descriptions/readouts live in reserved space. Eight44px note controls provide accessible alternatives to tiny modeled keys; actual modeled keys still work. Phone has two rows of notes; short landscape circuit and toolbar left, descriptions and note controls right. Fitted bounds protect board/breadboard/wires/keys under rotation and zoom. Opaque descriptions isolate reading from circuit.

Run then hold a button/model key; release silences. Buttons support held Space/Enter. Single voice: latest press owns the note, release of older pointer cannot cut it, release/cancel/lost-capture of owner silences without restoring older notes. Keyboard blur, window blur, Stop and lesson change silence. Simulation/editor/audio-setting limits explicit in marked English note across all4teaching tabs. No localized translation certification or physical speaker audibility claim.

Tests: PLAYWRIGHT_MODULE=/path/to/playwright node tests/piano-dock-regression.cjs . VIEWPORTS pairs scope run. Local320/390/844/1320 exact browser oscillator262/294/330/349/392/440/494/523 and0 after release, real modeled-key raycast and mouse capture, keyboard/cancel/blur/Stop/switch, synthetic multipointer ownership, layout44px descriptions/notes outside circuit, rotation/zoom bounds and4teaching-tab note pass. HOSTED_URL uses public UI and live readouts, no injected oscillator probe.12unit tests pass. Hosted evidence and source hashes follow separately.

Runtime32a56b4ea3e333c58ef52373134e510900d4d24e at https://learn-esp32-xi.vercel.app/ qualified hosted390/844 UI,8notes and held/released readouts/keyboard/last-owner/cancel/lostcapture/blur/Stop/switch/layout/4tabs. Actual final hosted held-phone/landscape/opaque-description/explicit-note pixels inspected and retained. Hosted has no injected oscillator probe and does not verify physical speaker audibility; local exact oscillator and model-key raycast evidence remains distinct.12units and390board6infos24rotations16lessonRunStop smoke passed.

js/main.js served byte-identical SHA256 b3252c777c6d7ff98e1e6c1c3eebfc74f46cd481eecfcfb23bd86e5104785bc8

styles.css served byte-identical SHA256 a3304d7ba2d2ed9a0a8b7f807a28dac068368e100c915eb9319cf65b149bdc98
