// Learn ESP32 — schematic view: original SVG wiring diagrams generated per lesson.
// Independent implementation; symbols and layouts are our own artwork.

const T = (x, y, s, cls = '', anchor = 'middle') => `<text class="${cls}" x="${x}" y="${y}" text-anchor="${anchor}">${s}</text>`;
const W = (pts, cls = '') => `<path class="w ${cls}" d="M${pts.map(p => p.join(' ')).join(' L')}"/>`;

// Symbols are drawn centred on (0,0) inside a translate() group; pads noted per symbol.
const SYM = {
  // pads: (-30,0) (30,0)
  resistor: (label, sub) => `<path d="M-30 0 H-18"/><path d="M-18 0 l5 -8 l9 16 l9 -16 l9 16 l9 -16 l5 8"/><path d="M18 0 H30"/>${T(0, -14, label, 'sym-t')}${sub ? T(0, 22, sub, 'val') : ''}`,
  // pads: (-30,0) anode, (30,0) cathode
  led: (label, sub) => `<path d="M-30 0 H-10"/><path class="fillable" d="M-10 -8 V8 L8 0 Z"/><path d="M8 -8 V8"/><path d="M10 0 H30"/><path d="M-1 -12 l6 -6 M6 -12 l6 -6"/>${T(0, -20, label, 'sym-t')}${sub ? T(0, 22, sub, 'val') : ''}`,
  // pads: (-30,0) (30,0)
  button: (label) => `<path d="M-30 0 H-12"/><circle class="solid" cx="-12" cy="0" r="2.2"/><circle class="solid" cx="12" cy="0" r="2.2"/><path d="M-12 -1 L9 -10"/><path d="M3 -10 V-17"/><path d="M-2 -17 H8"/><path d="M12 0 H30"/>${T(0, -24, label, 'sym-t')}`,
  // pads: (-30,0) (30,0) ends, wiper (0,26)
  pot: (label) => `<path d="M-30 0 H-18"/><path d="M-18 0 l5 -8 l9 16 l9 -16 l9 16 l9 -16 l5 8"/><path d="M18 0 H30"/><path d="M0 26 V10"/><path d="M-4 15 L0 8 L4 15"/>${T(0, -14, label, 'sym-t')}`,
  // pads: (-30,0)+ (30,0)−
  buzzer: (label) => `<path d="M-30 0 H-15"/><circle cx="0" cy="0" r="15"/><path d="M-4 -6 V2 M-7 -2 H-1"/><path d="M15 0 H30"/><path d="M9 -19 a9 9 0 0 1 6 7 M13 -25 a15 15 0 0 1 10 11"/>${T(0, -30, label, 'sym-t')}`,
  // pads: (-30,0) (30,0)
  motor: (label) => `<path d="M-30 0 H-14"/><circle cx="0" cy="0" r="14"/><path d="M14 0 H30"/>${T(0, 4.5, 'M', 'sym-t')}${T(0, -22, label, 'val')}`,
  // pads left: sig(-34,-8) pwr(-34,0) gnd(-34,8)
  servo: () => `<rect x="-22" y="-15" width="44" height="30" rx="5"/><path d="M-34 -8 H-22 M-34 0 H-22 M-34 8 H-22"/>${T(0, 4, 'SERVO', 'sym-t')}${T(26, -5, 'SIG', 'pin-t', 'start')}${T(26, 3, '5V', 'pin-t', 'start')}${T(26, 11, 'GND', 'pin-t', 'start')}`,
  // pads: (-30,0) (30,0)
  ldr: (label) => `<path d="M-30 0 H-18"/><path d="M-18 0 l5 -8 l9 16 l9 -16 l9 16 l9 -16 l5 8"/><path d="M18 0 H30"/><path d="M-8 -22 l-6 6 M-14 -22 v6 M-14 -22 h6 M4 -22 l-6 6 M-2 -22 v6 M-2 -22 h6"/>${T(0, -32, label, 'sym-t')}`,
  // pads bottom: vcc(-24,26) trig(-8,26) echo(8,26) gnd(24,26)
  ultra: () => `<rect x="-34" y="-16" width="68" height="32" rx="4"/>${T(0, -3, 'HC-SR04', 'block-t')}${T(-24, 8, 'V', 'pin-t')}${T(-8, 8, 'T', 'pin-t')}${T(8, 8, 'E', 'pin-t')}${T(24, 8, 'G', 'pin-t')}<path d="M-24 16 V26 M-8 16 V26 M8 16 V26 M24 16 V26"/>`,
  // pads bottom: r(-21,24) g(-7,24) b(7,24) cathode(21,24)
  rgbled: () => `<circle cx="0" cy="0" r="14"/>${T(0, 4, 'RGB', 'sym-t')}${T(-21, -20, 'R', 'pin-t')}${T(-7, -20, 'G', 'pin-t')}${T(7, -20, 'B', 'pin-t')}${T(21, -20, 'C', 'pin-t')}<path d="M-21 14 V24 M-7 14 V24 M7 14 V24 M21 14 V24"/>`,
  // pads: (-32,0) (32,0)
  fsr: (label) => `<rect x="-20" y="-13" width="40" height="26" rx="9"/><path d="M-12 0 l4 -5 l7 10 l7 -10 l6 5"/><path d="M-32 0 H-20 M20 0 H32"/>${T(0, -20, label, 'sym-t')}`,
  // pads bottom: +(-12,24) out(0,24) -(12,24)
  tmp36: () => `<rect x="-18" y="-14" width="36" height="28" rx="4"/>${T(0, 4, 'TMP36', 'block-t')}${T(-12, 33, '3V3', 'pin-t')}${T(0, 33, 'OUT', 'pin-t')}${T(12, 33, 'G', 'pin-t')}<path d="M-12 14 V24 M0 14 V24 M12 14 V24"/>`,
  // pads left: vcc(-36,-12) gnd(-36,-4) sda(-36,4) scl(-36,12)
  oled: () => `<rect x="-26" y="-16" width="52" height="32" rx="3"/>${T(0, 4, 'OLED', 'block-t')}<path d="M-36 -12 H-26 M-36 -4 H-26 M-36 4 H-26 M-36 12 H-26"/>${T(-24, -9, 'V', 'pin-t', 'start')}${T(-24, -1, 'G', 'pin-t', 'start')}${T(-24, 7, 'SD', 'pin-t', 'start')}${T(-24, 15, 'SC', 'pin-t', 'start')}`,
  // pads left: in1..4 (-38,-15/-5/5/15); right out (38,0); bottom +(-10,32) -(10,32)
  uln: () => `<rect x="-26" y="-22" width="52" height="44" rx="4"/>${T(0, -9, 'ULN2003', 'block-t')}<path d="M-38 -15 H-26 M-38 -5 H-26 M-38 5 H-26 M-38 15 H-26"/>${T(-24, -12, '1', 'pin-t', 'start')}${T(-24, -2, '2', 'pin-t', 'start')}${T(-24, 8, '3', 'pin-t', 'start')}${T(-24, 18, '4', 'pin-t', 'start')}<path d="M26 0 H38 M-10 22 V32 M10 22 V32"/>${T(-10, 41, '+', 'pin-t')}${T(10, 41, '−', 'pin-t')}`,
  // pad: (-28,0)
  stepper: () => `<circle cx="0" cy="0" r="16"/>${T(0, 5, 'M', 'sym-t')}${T(0, -24, '28BYJ-48', 'val')}<path d="M-28 0 H-16"/>`,
  // pads: base(-26,0) collector(26,-14) emitter(26,14)
  npn: () => `<circle cx="2" cy="0" r="12"/><path d="M0 -8 V8"/><path d="M-26 0 H0"/><path d="M0 -5 L12 -14 H26"/><path d="M0 5 L12 14 H26"/><path d="M7 11 l5 3 -1 -6"/>`,
  // pads: (-26,-14) anode-ish / (26,-14) ... used as flyback: (-24,0) (24,0)
  diode: (label) => `<path d="M-24 0 H-8"/><path class="fillable" d="M-8 -7 V7 L8 0 Z"/><path d="M8 -7 V7"/><path d="M8 0 H24"/>${label ? T(0, -13, label, 'val') : ''}`,
  // pad: (0,0) ground
  gnd: () => `<path d="M0 0 V8"/><path d="M-9 8 H9"/><path d="M-5 13 H5"/><path d="M-1.5 18 H1.5"/>`,
  // keys column; pads: each row left (-24,y)
  keys: (notes) => notes.map((n, i) => { const y = i * 26; return `<g transform="translate(0 ${y})"><rect x="-24" y="-8" width="48" height="16" rx="4"/>${T(0, 4, n, 'pin-t')}</g>`; }).join(''),
  // capacitive soil probe; pads: vcc(-28,-9) aout(-28,9) gnd(18,26)
  probe: () => `<path d="M-16 -14 H16 V14 H-16 Z"/><path d="M10 -14 V14 M6 -14 V14 M2 -14 V14"/>${T(-1, -20, 'SOIL PROBE', 'val')}<path d="M-28 -9 H-16 M-28 9 H-16"/>${T(-14, -6, 'V', 'pin-t', 'start')}${T(-14, 12, 'A', 'pin-t', 'start')}`,
  // traffic light; pads left: r(-30,-11) y(-30,0) g(-30,11); bottom gnd(0,24)
  traffic: () => `<rect x="-18" y="-20" width="36" height="40" rx="5"/><circle class="ring" cx="0" cy="-11" r="4.5"/><circle class="ring" cx="0" cy="0" r="4.5"/><circle class="ring" cx="0" cy="11" r="4.5"/><path d="M-30 -11 H-18 M-30 0 H-18 M-30 11 H-18 M0 20 V24"/>`,
};

// Per-lesson circuit specs. pins: rows on the ESP32 block (order top→bottom).
// parts: [kind, x, y, ...args] centred on (x,y). wires: point lists.
// pads: named anchor points for wire endpoints.
const SCH = {
  blink: {
    pins: ['GPIO26', 'GND'],
    parts: [['resistor', 205, 70, 'R1', '220 Ω'], ['led', 300, 70, 'D1', 'LED']],
    pads: { p0: [98, 70], p1: [98, 190], rA: [175, 70], rB: [235, 70], lA: [270, 70], lB: [330, 70], g0: [330, 140] },
    wires: [['p0', 'rA'], ['rB', 'lA'], ['lB', [330, 120], 'g0'], ['g0', [330, 170], [98, 170], 'p1'], ['g0', [330, 158]]],
    gndAt: [330, 158],
    note: 'Series resistor limits LED current.',
  },
  button: {
    pins: ['GPIO27', 'GPIO26', 'GND'],
    parts: [['button', 230, 62, 'SW1'], ['led', 230, 150, 'D1', 'LED']],
    pads: { p0: [98, 62], p1: [98, 104], p2: [98, 200], bA: [200, 62], bB: [260, 62], lA: [200, 150], lB: [260, 150], g1: [290, 62], g2: [290, 150], g3: [290, 200] },
    wires: [['p0', 'bA'], ['bB', 'g1'], ['p1', [130, 104], [130, 150], 'lA'], ['lB', 'g2'], ['g1', [290, 200], 'g3'], ['g3', 'p2'], ['g3', [290, 214]]],
    gndAt: [290, 214],
    note: 'SW1 uses the internal pull-up; pressed reads LOW.',
  },
  pot: {
    pins: ['3V3', 'GND', 'GPIO34', 'GPIO25'],
    parts: [['pot', 220, 96, 'RV1'], ['led', 220, 208, 'D1', 'LED']],
    pads: { p0: [98, 52], p1: [98, 94], p2: [98, 136], p3: [98, 178], ptA: [190, 96], ptB: [250, 96], ptW: [220, 122], lA: [190, 208], lB: [250, 208], g1: [280, 96], g2: [250, 236] },
    wires: [['p0', [130, 52], [130, 96], 'ptA'], ['ptB', 'g1'], ['g1', [280, 94], 'p1'], ['g1', [280, 108]], ['p2', [160, 136], [160, 122], 'ptW'], ['p3', [130, 178], [130, 208], 'lA'], ['lB', 'g2'], ['g2', [250, 250]]],
    gndAt: [[280, 108], [250, 250]],
    note: 'Wiper voltage 0–3.3 V → ADC 0–4095.',
  },
  rgb: {
    pins: ['GPIO25', 'GPIO26', 'GPIO33', 'GND'],
    parts: [['rgbled', 240, 120]],
    pads: { p0: [98, 58], p1: [98, 100], p2: [98, 142], p3: [98, 196], rR: [219, 144], rG: [233, 144], rB: [247, 144], rC: [261, 144] },
    wires: [['p0', [150, 58], [150, 168], [219, 168], 'rR'], ['p1', [170, 100], [170, 156], [233, 156], 'rG'], ['p2', [190, 142], [190, 150], [247, 150], 'rB'], ['rC', [261, 190], [98, 190], 'p3'], ['rC', [261, 178]]],
    gndAt: [261, 178],
    note: 'One PWM channel per colour leg.',
  },
  light: {
    pins: ['3V3', 'GPIO35', 'GPIO26', 'GND'],
    parts: [['ldr', 220, 62, 'LDR'], ['resistor', 220, 130, 'R1', '10 kΩ'], ['led', 220, 212, 'D1', 'LED']],
    pads: { p0: [98, 48], p1: [98, 90], p2: [98, 132], p3: [98, 226], ldA: [190, 62], ldB: [250, 62], rA: [190, 130], rB: [250, 130], lA: [190, 212], lB: [250, 212], node: [276, 96] },
    wires: [['p0', [140, 48], [140, 62], 'ldA'], ['ldB', [276, 62], 'node'], ['node', [276, 130], 'rB'], ['rA', [150, 130], [150, 226], 'p3'], ['node', 'p1'], ['p2', [120, 132], [120, 212], 'lA'], ['lB', [250, 240]], ['rA', [160, 130], [160, 240], [250, 240]]],
    gndAt: [250, 240],
    note: 'Divider midpoint rises with light.',
  },
  distance: {
    pins: ['VIN', 'GPIO5', 'GPIO18', 'GND'],
    parts: [['ultra', 240, 110]],
    pads: { p0: [98, 52], p1: [98, 94], p2: [98, 136], p3: [98, 178], uV: [216, 136], uT: [232, 136], uE: [248, 136], uG: [264, 136] },
    wires: [['p0', [150, 52], [150, 160], [216, 160], 'uV'], ['p1', [175, 94], [175, 150], [232, 150], 'uT'], ['p2', [200, 136], 'uE'], ['uG', [264, 172], [98, 172], 'p3'], ['uG', [264, 158]]],
    gndAt: [264, 158],
    note: 'ECHO is 5 V — use a divider on real hardware.',
  },
  sound: {
    pins: ['GPIO19', 'GND'],
    parts: [['buzzer', 230, 90, 'BZ1']],
    pads: { p0: [98, 70], p1: [98, 150], bA: [200, 90], bB: [260, 90] },
    wires: [['p0', [140, 70], [140, 90], 'bA'], ['bB', [260, 130], [98, 130], 'p1'], ['bB', [260, 116]]],
    gndAt: [260, 116],
    note: 'Passive piezo — drive with a tone.',
  },
  piano: {
    pins: ['GPIO32', 'GPIO33', 'GPIO25', 'GPIO26', 'GPIO27', 'GPIO14', 'GPIO13', 'GPIO4', 'GPIO19', 'GND'],
    parts: [['keys', 210, 56, ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C']], ['buzzer', 210, 330, 'BZ1']],
    pads: { p0: [98, 56], p1: [98, 82], p2: [98, 108], p3: [98, 134], p4: [98, 160], p5: [98, 186], p6: [98, 212], p7: [98, 238], p8: [98, 300], p9: [98, 352], bA: [180, 330], bB: [240, 330] },
    keyRows: 8,
    wires: [['p0', [186, 56]], ['p1', [186, 82]], ['p2', [186, 108]], ['p3', [186, 134]], ['p4', [186, 160]], ['p5', [186, 186]], ['p6', [186, 212]], ['p7', [186, 238]],
      ['p8', [130, 300], [130, 330], 'bA'], ['bB', [240, 352], 'p9'], ['bB', [240, 342]]],
    gndAt: [240, 344],
    note: 'Keys use internal pull-ups; a press reads LOW.',
  },
  motor: {
    pins: ['GPIO27', 'VIN', 'GND'],
    parts: [['resistor', 190, 78, 'R1', '1 kΩ'], ['npn', 268, 96], ['motor', 300, 38, 'M1'], ['diode', 336, 78, 'D1']],
    pads: { p0: [98, 62], p1: [98, 110], p2: [98, 190], rA: [160, 78], rB: [220, 78], qB: [242, 96], qC: [294, 82], qE: [294, 110], mA: [270, 38], mB: [330, 38], dA: [312, 78], dB: [360, 78], g1: [294, 150] },
    wires: [['p0', [130, 62], [130, 78], 'rA'], ['rB', [230, 78], [230, 96], 'qB'], ['p1', [140, 110], [140, 38], 'mA'], ['mB', [330, 70], 'dB'], ['mA', [270, 70], [312, 70], 'dA'], ['mB', [344, 38], [344, 82], 'qC'], ['qE', [294, 130], 'g1'], ['g1', [294, 190], 'p2'], ['g1', [294, 164]]],
    gndAt: [294, 164],
    note: 'Flyback diode across the motor is essential.',
  },
  temp: {
    pins: ['3V3', 'GPIO32', 'GND'],
    parts: [['tmp36', 220, 100]],
    pads: { p0: [98, 62], p1: [98, 104], p2: [98, 146], tV: [208, 124], tO: [220, 124], tG: [232, 124] },
    wires: [['p0', [150, 62], [150, 150], [208, 150], 'tV'], ['p1', [185, 104], [185, 140], [220, 140], 'tO'], ['tG', [232, 162], [98, 162], 'p2'], ['tG', [232, 148]]],
    gndAt: [232, 148],
    note: '10 mV per °C with a 500 mV offset.',
  },
  servo: {
    pins: ['GPIO13', 'VIN', 'GND'],
    parts: [['servo', 236, 96]],
    pads: { p0: [98, 62], p1: [98, 104], p2: [98, 146], sS: [202, 88], sP: [202, 96], sG: [202, 104] },
    wires: [['p0', [150, 62], [150, 88], 'sS'], ['p1', [175, 104], [175, 96], 'sP'], ['sG', [160, 104], [160, 146], 'p2'], ['sG', [160, 124]]],
    gndAt: [160, 124],
    note: 'Servo power comes from 5 V, never 3V3.',
  },
  stepper: {
    pins: ['GPIO14', 'GPIO27', 'GPIO26', 'GPIO25', 'VIN', 'GND'],
    parts: [['uln', 216, 120], ['stepper', 336, 120]],
    pads: { p0: [98, 48], p1: [98, 82], p2: [98, 116], p3: [98, 150], p4: [98, 196], p5: [98, 230], u1: [178, 105], u2: [178, 115], u3: [178, 125], u4: [178, 135], uO: [254, 120], uP: [206, 152], uN: [226, 152], sA: [308, 120] },
    wires: [['p0', [140, 48], [140, 105], 'u1'], ['p1', [155, 82], [155, 115], 'u2'], ['p2', [168, 116], [168, 125], 'u3'], ['p3', 'u4'], ['uO', 'sA'], ['p4', [120, 196], [120, 180], [206, 180], 'uP'], ['uN', [226, 196], [98, 230], 'p5'], ['uN', [226, 180]]],
    gndAt: [226, 180],
    note: 'IN1–IN4 energise the coils in sequence.',
  },
  plant: {
    pins: ['3V3', 'GND', 'GPIO34', 'GPIO21', 'GPIO22'],
    parts: [['probe', 224, 68], ['oled', 232, 220]],
    pads: { p0: [98, 40], p1: [98, 82], p2: [98, 124], p3: [98, 166], p4: [98, 208], prV: [196, 59], prA: [196, 77], oV: [196, 208], oG: [196, 216], oSD: [196, 224], oSC: [196, 232], g0: [252, 68] },
    wires: [['p0', [140, 40], [140, 59], 'prV'], ['p0', [128, 40], [128, 208], 'oV'], ['prA', [170, 77], [170, 124], 'p2'], ['p3', [150, 166], [150, 224], 'oSD'], ['p4', [175, 208], [175, 232], 'oSC'], ['oG', [150, 216], [150, 258], [118, 258], [118, 82], 'p1'], ['oG', [150, 240]]],
    gndAt: [150, 240],
    note: 'Both modules share 3V3, GND and the I²C bus.',
  },
  force: {
    pins: ['3V3', 'GPIO35', 'GPIO25', 'GPIO26', 'GPIO33', 'GND'],
    parts: [['fsr', 214, 58, 'FSR'], ['resistor', 214, 122, 'R1', '10 kΩ'], ['led', 214, 200, 'D1', ''], ['led', 214, 250, 'D2', ''], ['led', 214, 300, 'D3', '']],
    pads: { p0: [98, 40], p1: [98, 82], p2: [98, 124], p3: [98, 166], p4: [98, 208], p5: [98, 316], fA: [182, 58], fB: [246, 58], rA: [184, 122], rB: [244, 122], l1A: [184, 200], l1B: [244, 200], l2A: [184, 250], l2B: [244, 250], l3A: [184, 300], l3B: [244, 300], node: [272, 90] },
    wires: [['p0', [140, 40], [140, 58], 'fA'], ['fB', 'node'], ['node', [272, 122], 'rB'], ['node', 'p1'], ['rA', [150, 122], [150, 316], 'p5'], ['rA', [150, 146]], ['p2', [125, 124], [125, 200], 'l1A'], ['l1B', [244, 316], [150, 316]], ['p3', [112, 166], [112, 250], 'l2A'], ['p4', 'l3A'], ['l2B', [244, 250]], ['l3B', [244, 300]]],
    gndAt: [150, 146],
    note: 'Harder press → lower resistance → higher reading.',
  },
  project: {
    pins: ['VIN', 'GND', 'GPIO5', 'GPIO18', 'GPIO25', 'GPIO26', 'GPIO33'],
    parts: [['ultra', 224, 80], ['traffic', 224, 250]],
    pads: { p0: [98, 34], p1: [98, 76], p2: [98, 118], p3: [98, 160], p4: [98, 202], p5: [98, 244], p6: [98, 286], uV: [200, 106], uT: [216, 106], uE: [232, 106], uG: [248, 106], tR: [194, 239], tY: [194, 250], tG: [194, 261], tC: [224, 274] },
    wires: [['p0', [140, 34], [140, 128], [200, 128], 'uV'], ['p2', [165, 118], [165, 116], [216, 116], 'uT'], ['p3', [185, 160], [185, 112], [232, 112], 'uE'], ['uG', [248, 140], [98, 140], 'p1'], ['uG', [248, 124]], ['p4', [150, 202], [150, 239], 'tR'], ['p5', [165, 244], [165, 250], 'tY'], ['p6', [180, 286], [180, 261], 'tG'], ['tC', [224, 292], [248, 292], [248, 140]]],
    gndAt: [[248, 124]],
    note: 'Distance picks the lamp: far green, near red.',
  },
};

// Build the SVG for a lesson id. Returns { svg } or null when the lesson has no circuit.
export function buildSchematic(id) {
  const spec = SCH[id];
  if (!spec) return null;
  if(id==='blink')return{svg:`<svg class="sch" viewBox="0 0 380 112" role="img" aria-label="ESP32 GPIO26 through a 220 ohm resistor and LED to ground"><g class="board"><rect class="box" x="16" y="25" width="82" height="56" rx="7"/>${T(57,43,'ESP32','block-t')}${T(90,66,'GPIO26','pin-t','end')}</g>${W([[98,62],[170,62]])}<g class="sym" transform="translate(200 62)">${SYM.resistor('R1','220 Ω')}</g>${W([[230,62],[264,62]])}<g class="sym" transform="translate(294 62)">${SYM.led('D1','LED')}</g>${W([[324,62],[350,62],[350,69]])}<g class="sym" transform="translate(350 69)">${SYM.gnd()}</g></svg>`};
  const P = spec.pads, g = [];
  const pinY = i => (P['p' + i] ? P['p' + i][1] : 62 + i * 42);
  const ys = spec.pins.map((_, i) => pinY(i));
  const top = Math.min(...ys) - 26, bot = Math.max(...ys) + 22;
  const rows = spec.pins.map((label, i) => {
    const y = pinY(i);
    return `${T(88, y + 3.5, label, 'pin-t', 'end')}<circle class="solid" cx="98" cy="${y}" r="2.4"/><text class="pinval" data-pin="${label}" x="98" y="${y - 9}" text-anchor="middle"></text>`;
  }).join('');
  g.push(`<g class="board"><rect class="box" x="16" y="${top}" width="82" height="${bot - top}" rx="7"/>${T(57, top + 16, 'ESP32', 'block-t')}${rows}</g>`);
  spec.parts.forEach(([kind, x, y, ...args]) => g.push(`<g class="sym" transform="translate(${x} ${y})">${SYM[kind](...args)}</g>`));
  spec.wires.forEach(wl => g.push(W(wl.map(e => typeof e === 'string' ? P[e] : e))));
  (Array.isArray(spec.gndAt?.[0]) ? spec.gndAt : [spec.gndAt]).filter(Boolean).forEach(([x, y]) => g.push(`<g transform="translate(${x} ${y})">${SYM.gnd()}</g>`));
  let h = bot + 20;
  if (spec.note) { g.push(T(20, h + 4, spec.note, 'note', 'start')); h += 24; }
  return { svg: `<svg class="sch" viewBox="0 0 380 ${h}" preserveAspectRatio="xMidYMin meet">${g.join('')}</svg>` };
}

// Slide-over panel; mirrors the app's sheet styling.
export function createSchematicPanel(root, { onClose, strings } = {}) {
  root.innerHTML = `<header class="sch-head"><h3></h3><span class="sch-lesson"></span><button class="sch-close" type="button" aria-label="Close"><svg viewBox="0 0 24 24"><path d="m7 7 10 10M17 7 7 17"/></svg></button></header><div class="sch-body"></div>`;
  const body = root.querySelector('.sch-body'), lessonEl = root.querySelector('.sch-lesson'), headEl = root.querySelector('h3');
  root.querySelector('.sch-close').onclick = () => onClose?.();
  let open = false, lid = null;
  const api = {
    get isOpen() { return open; },
    setOpen(v) { if (v === open) return; open = v; root.classList.toggle('is-on', v); root.style.display = v ? 'flex' : 'none'; if (v) api.render(); },
    setLesson(id, name) { lid = id; lessonEl.textContent = name || ''; if (open) api.render(); },
    render() {
      headEl.textContent = (strings?.title || 'Schematic').toUpperCase();
      const r = lid && buildSchematic(lid);
      body.innerHTML = r ? r.svg : `<p class="sch-none">${strings?.none || 'No circuit in this lesson.'}</p>`;
    },
    pin(label, val) {
      body.querySelectorAll('.pinval').forEach(el => {
        if (el.dataset.pin === label) { el.textContent = val || ''; el.classList.toggle('is-high', val === 'HIGH'); }
      });
    },
  };
  root.style.display = 'none';
  return api;
}
