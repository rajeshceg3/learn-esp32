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
