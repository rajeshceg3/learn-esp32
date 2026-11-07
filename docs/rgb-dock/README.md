# RGB lesson spatial controls

Lesson5's explanatory labels and RGB palette action now occupy the reserved circuit dock. Separate R/G/B pin buttons identify GPIO25/26/33 individually instead of pointing a combined label at only one pin. Selecting an output opens its channel description and marks its actual anchor. RGB LED retains palette cycling by click/Enter; Run enables output and Stop turns it off. This is a scripted palette, not execution of the code editor.

No connector lines or text cross the circuit. Model rotation/zoom stays inside the fitted canvas. Short landscape places controls beside the circuit and isolates descriptions. Other lessons retain their current interaction contracts. Eleven lesson layouts remain pending; this is not whole-app adoption.

Checks:12unit tests; local RGB320/390/1320/844 label bounds/44px targets, actual palette state/color, keyboard, Stop black output,8rotation actions, bounded zoom, all3pin descriptions and switch to undocked light lesson. Updated board390 regression covers6infos/24turns/all16RunStop smoke. One early landscape assertion read stale panel text before its transition; updated to wait for expected description before inspection. Tests support, not replace, actual pixels; final phone/landscape/desktop screenshots inspected. Browser emulation, not physical-device proof.
