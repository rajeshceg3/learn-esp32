# Contextual next-action audit, November9

Source inspected: main b8bf40aaf7d11c1cd3bde6f9567b4cf45fd59571.
Hosted page exercised: https://learn-esp32-xi.vercel.app/ .

Initial diagnosis only. Not full UX or production adoption acceptance.

Eight guided lessons (blink, motor, thermal, servo, wheel, plant, force,
parking) were entered at390x844,844x390 and1320x844 in isolated Chrome.
One meaningful stage was run and awaited in each. All24Next controls were
hit-testable, no page error or horizontal overflow. Existing theme-fit teal
emphasis and44pxcontrols are already present; controls sit at the bottom of
this teaching card, separate from physical scene controls and global nav.

Short-landscape concern: after switching between lessons and scrolling to
the action, current explanation/title may sit above the viewport. Results
record this; actual844parking pixels show the title clipped while Next
is near the top. The page can be scrolled, so this is not evidence of
unreachable content. Need full-stage/keyboard/scroll review before choosing
an intentional fix. Do not equate action hit-testability with readable
progression. Desktop and phone initial pixels retained for comparison.

An experimental sticky action rule was tried locally and rejected: in the
side-panel layout it could cover the current explanation. It was fully
reverted, no runtime change was committed or deployed. Do not force a
universal fixed bottom dock onto a model/explanation/editor layout.

Next gate: walk complete short-landscape and keyboard flows, preserve
current3Dinteraction and guide timing. Any scoped progression/focus fix
needs all guided stages, examples, Replay/Previous, final state, reduced
motion, resized desktop/phone, content-clearance and served-build proof.
No owner data read, no manual backup or persistence change.

## Follow-up resolved diagnosis without runtime changes

Full progression was then exercised on all8guides at390/844/1320. Every
stage used keyboard Enter, awaited busy=false and scrolled its actual
explanation into view. The text's upper/lower edge cleared global nav
(with1pxsubpixel tolerance), and its last line was hit-testable. Every
Next was44pxand hit-testable before activation. Final Loop complete,
Replay and Previous states were checked, with no overflow/page errors.
This is59stages per viewport,177stage transitions total, not all possible
sample values or full app certification. Reduced-motion environment used;
original guide wait durations were preserved. Desktop runs were split to
fit execution limits; perlesson results/log distinguish completed scopes.

Initial short-landscape concern is therefore qualified: scrolling to the
action alone can put the explanation above the viewport, but scrolling to
read it exposes the complete result and leaves the action below it within
the teaching surface. Actual final parking844/390/1320 and desktop blink
pixels inspected. Existing model/guide separation and theme-fit primary
hierarchy should be preserved rather than replacing them with an overlay.
No runtime fix or deployment is justified by this audit alone.

Audited index/styles/main/learning controller all matched exact served
bytes at this checkpoint. This is a bounded contextual audit, not a claim
that the whole fleet adopted the rule or every sample/device is tested.
