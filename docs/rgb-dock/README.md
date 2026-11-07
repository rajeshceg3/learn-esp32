# RGB lesson spatial controls

Lesson5's explanatory labels and RGB palette action now occupy the reserved circuit dock. Separate R/G/B pin buttons identify GPIO25/26/33 individually instead of pointing a combined label at only one pin. Selecting an output opens its channel description and marks its actual anchor. RGB LED retains palette cycling by click/Enter; Run enables output and Stop turns it off. This is a scripted palette, not execution of the code editor.

No connector lines or text cross the circuit. Model rotation/zoom stays inside the fitted canvas. Short landscape places controls beside the circuit and isolates descriptions. Other lessons retain their current interaction contracts. Eleven lesson layouts remain pending; this is not whole-app adoption.

Checks:12unit tests; local RGB320/390/1320/844 label bounds/44px targets, actual palette state/color, keyboard, Stop black output,8rotation actions, bounded zoom, all3pin descriptions and switch to undocked light lesson. Updated board390 regression covers6infos/24turns/all16RunStop smoke. One early landscape assertion read stale panel text before its transition; updated to wait for expected description before inspection. Tests support, not replace, actual pixels; final phone/landscape/desktop screenshots inspected. Browser emulation, not physical-device proof.

## Production follow-through

PR18 merged45ac0c6c48be131122f7ece25f04b2fa43c38105. Production https://learn-esp32-xi.vercel.app/ serves byte-identical changed source: main.js SHA256 d69d0193336c97677128e2946dc237fded7bf61625da9e4a277aa26cc664c058; scenes.js6fa495562f45d6a75a3bb8f5ad715390a3418365a2445e99d111ec9054a6c694.

Hosted390/844 UI check exercises dock, keyboard/palette actions, Run/Stop, rotation/zoom, all3 descriptions and next-lesson separation. Local instrumented tests assert exact palette/color/Stop state; hosted mode does not introspect private simulation state. Separate hosted6palette screenshot strip and stopped output visually verify color changes. Actual lit phone, stopped landscape and isolated-description pixels inspected and retained. Browser emulation, not physical-device proof. Channel descriptions newly added in English; no new translation-quality claim.
