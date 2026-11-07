# Distance lesson spatial controls

Lesson7 reserves separate circuit, control and electrical-warning space. Model labels no longer sit on board or sensor. The obstacle control shows the selected scripted cm. Both endpoints of its movement are reserved in camera fit through zoom/rotation. Initial30cm car pose is now consistent with subsequent value-to-position mapping; unchanged click cycle is30,42,54,8,20,32,44,8… Enter also steps. This is not dragging or a live ultrasonic measurement. Run logs selected distance, Stop pauses. Overview no longer says drag. English simulation note on all teaching tabs distinguishes editor from hardware; localized overview override uses marked English rather than retaining a wrong drag instruction. No translation-quality claim.

Retained wiring-warning button opens complete schematic, including required echo divider. Warning has its own reserved row on phones and right-side space in short landscape, never over circuit or dock.

Test: PLAYWRIGHT_MODULE=/path/to/playwright node tests/distance-dock-regression.cjs. VIEWPORTS supplies pairs. HOSTED_URL uses public UI, not internal state. Local320/390/844/1320 tests assert full cycle, actual pose and fitted bounds, keyboard, Stop,3descriptions,44px controls, warning bounds and schematic path.12unit tests pass. Local safe pixels retained; hosted follow-through must be verified separately. Browser emulation, not physical-device proof.

RuntimePR22 merged163b8ef38a73339c250def60cf422d3f76c562d1. Hosted390/844 full UI cycle/keyboard/Stop/rotation/zoom/descriptions/warning/schematic tests pass. Hosted4teaching-tab note check passes. Actual initial30cm phone, nearest8cm phone, far54cm landscape, opaque description, schematic-divider destination and explicit desktop simulation note inspected. All changed served sources (main,scenes,i18n,lessons,styles) byte-match runtime; source hashes retained below.390board6infos24rotation16lessonRunStop smoke passes, not full audits of remaining lessons. Physical device and localized semantic certification remain out of scope.

js/main.js SHA256 9f0bbd893f818226aab7e5fadf2be590683aa51659a89b7ff1c97da9e736b687

js/scenes.js SHA256 86cab1a7bf0c3e7081fb5df21bdd2f727d1196c1fea934e409c15985ba831158

js/i18n.js SHA256 f31c85a1dfbbc4fd49df72c2443ac2da28c5eee14eb71d41924bedd370d63ca5

js/lessons.js SHA256 67e4a06505b0d6f0384181fd1d7f1f49b713d7ac892cdbdc26dadd15650066d3

styles.css SHA256 5c72af52095d458afa91cfd4312a1c1a55c41ca5ba6ee5b8426682ef1ad919ca

Final schematic pixel review caught faint model showing through soft-card background. Distance schematic now has opaque background; model, tags, dock and toolbar are suppressed while it is open. Close restores interaction. This correction is runtime, not evidence-only.

Final opaque-schematic correctionPR23 merged6040f8baf33d5ec7d8dd1601e185c3be36db236d. Hosted390 hidden model/dock and restoration pass; landscape exposed header/body overlap blocking Close, fixed with nonshrinking sticky44px header and nonshrinking diagram body. Final hosted rerun required, and final schematic pixels supersede earlier translucent capture. CSS served byte-identical after correction.
