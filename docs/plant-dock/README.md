# Smart-plant functional dock

Circuit/dock/toolbar/guide are separate regions. Five44px controls get three full rows; no compressed callout overlay. Mobile7stage sample guide follows in document flow. SOIL mV and OLED sent-frame readouts agree with actual guide state: hidden draw buffer is never shown before Send. Watering-can raised and resting bounds reserved. Existing5example voltages/integer-map/clamps/moods/buffer/send/wait/PreviousReplay preserved, independent of continuous scripted moisture model.

Run/Explore then hold PLANT/WATER/model to water; release to dry; held Space/Enter supported. Window blur now releases dock watering as well as canvas holds. Stop releases water and returns actual OLED/readout to ESP32. English4tab note distinguishes sample guide/hiddenbuffer from sentdisplay and continuous model, non-live readings/editor/calibration. No hardware or translation certification.

Local320/1320active-motion and390/844reduced:5samples ×7stages exact readouts/code lines/hidden-buffer/sent-screen snapshots/holds/PreviousReplay, real WATER mousehold/SpaceEnter/windowblur/modelplanthold/Stop/44px/8rotations18zoom/bounds/opaque description/4tabs/progress/switch pass. Added local raised-canY24 assertion and dry-afterrelease check.12units include5sample500idle hiddenbuffer/send, plus continuous watering/drying clamps/Stoprelease.390board6infos24rotations16lessonRunStop smoke pass. Browser QA is not physical proof; broad smoke not full all-lesson spatial qualification.

Reproduce: PLAYWRIGHT_MODULE=/home/sandbox/qa/node_modules/playwright node tests/plant-dock-regression.cjs ; VIEWPORTS and REDUCED=no-preference for other widths. HOSTED_URL selects publicUI-only path, skipping injected buffer/screen/geometry/modelraycast checks. node --test tests/*.test.mjs . Final hosted evidence/hashes follow rollout.

Final runtime6fe0237c993de175a6a81cca1c86eb91c192c44b PR39 qualified hosted390/844 publicUI5samples7stages/SOILmV/OLEDsentframe/PreviousReplay/realWATERhold/SpaceEnter/windowblurrelease/StopESP32/layout/44px/progress/4tabs. Final5actual hosted pixels inspected and retained. Local injected buffer/screen/raised-canY24/dry-change/geometry/model-raycast checks remain separate from hosted UI. No live-probe/hardware/translation certification. main/scenes/styles served byte-identical15:56Nov7.

js/main.js SHA256 a03ca15dc30fbd0543517f2763c2fcf243f9895bcccc3651e21c8410509ed6fa

js/scenes.js SHA256 7bd7cb1f26d7850dfa38da4cf2fd44009e81b59b7495b9d8e300316dfb800cc9

styles.css SHA256 8381e30003767aa4a9e9b76caa37f3bef5f95582f62ed7aa6aa927b53bba9c22
