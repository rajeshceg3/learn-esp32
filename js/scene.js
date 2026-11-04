// Learn ESP32 — 3D scene: ESP32 DevKit board, camera rig, lights, tag overlay.
// Original code. three.js (MIT).
import * as THREE from 'three';

export const BOARD = { W: 51.5, D: 25.5, T: 1.6 };

// pin map: name -> [x(mm from centre), z] on top surface
const TOP_ROW = ['VIN','GND','D13','D12','D14','D27','D26','D25','D33','D32','D35','D34','VN','VP','EN'];
const BOT_ROW = ['3V3','GND2','D15','D2','D4','D16','D17','D5','D18','D19','D21','RX0','TX0','D22','D23'];
export const PINS = {};
TOP_ROW.forEach((n, i) => PINS[n] = [-17.78 + i * 2.54, -BOARD.D / 2 + 2.0]);
BOT_ROW.forEach((n, i) => PINS[n] = [-17.78 + i * 2.54, BOARD.D / 2 - 2.0]);

export const MAT = {
  pcb:    new THREE.MeshStandardMaterial({ color: 0x232a44, roughness: .55 }),
  pcbEdge:new THREE.MeshStandardMaterial({ color: 0x1a2138, roughness: .6 }),
  header: new THREE.MeshStandardMaterial({ color: 0x2c3041, roughness: .5 }),
  pinMetal:new THREE.MeshStandardMaterial({ color: 0xe8e2d6, roughness: .32, metalness: .55 }),
  metal:  new THREE.MeshStandardMaterial({ color: 0xd9d2c4, roughness: .4, metalness: .45 }),
  metalDark:new THREE.MeshStandardMaterial({ color: 0x8f949c, roughness: .45, metalness: .4 }),
  chip:   new THREE.MeshStandardMaterial({ color: 0x2a2d38, roughness: .45 }),
  plastic:new THREE.MeshStandardMaterial({ color: 0x2c3041, roughness: .5 }),
  cream:  new THREE.MeshStandardMaterial({ color: 0xf1e4c8, roughness: .55 }),
  bread:  new THREE.MeshStandardMaterial({ color: 0xf4ead6, roughness: .7 }),
  red:    new THREE.MeshStandardMaterial({ color: 0xec5a4b, roughness: .4 }),
  amber:  new THREE.MeshStandardMaterial({ color: 0xf5b444, roughness: .35, emissive: 0x7a4300, emissiveIntensity: .35 }),
  greenLed:new THREE.MeshStandardMaterial({ color: 0x8bd67c, roughness: .35, emissive: 0x1d5a12, emissiveIntensity: .35 }),
  blueLed:new THREE.MeshStandardMaterial({ color: 0x5aa0ec, roughness: .35, emissive: 0x123a6a, emissiveIntensity: .35 }),
  white:  new THREE.MeshStandardMaterial({ color: 0xf2efe6, roughness: .5 }),
  rubber: new THREE.MeshStandardMaterial({ color: 0x23252d, roughness: .8 }),
};

export function box(w, h, d, mat, x = 0, y = 0, z = 0, ry = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z); if (ry) m.rotation.y = ry;
  m.castShadow = m.receiveShadow = true; return m;
}
// ink outline: crisp technical edge lines on a mesh, follows its transform
export function ink(mesh, color = 0x141a2e, thresh = 24) {
  const e = new THREE.LineSegments(
    new THREE.EdgesGeometry(mesh.geometry, thresh),
    new THREE.LineBasicMaterial({ color, transparent: true, opacity: .82 }));
  mesh.add(e); return mesh;
}

export function cyl(r1, r2, h, mat, x = 0, y = 0, z = 0, seg = 20) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, seg), mat);
  m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; return m;
}

// ---- silkscreen texture for the PCB top ----
function boardTexture() {
  const K = 16, W = BOARD.W * K, H = BOARD.D * K;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const c = cv.getContext('2d');
  c.fillStyle = '#232a44'; c.fillRect(0, 0, W, H);
  // subtle traces
  c.strokeStyle = 'rgba(140,160,210,.22)'; c.lineWidth = 1.4;
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 26; i++) {
    const x = rnd() * W, y = rnd() * H, l = 20 + rnd() * 90, v = rnd() > .5;
    c.beginPath(); c.moveTo(x, y); v ? c.lineTo(x + l, y) : c.lineTo(x, y + l);
    v ? c.lineTo(x + l, y + (rnd() * 30 - 15)) : c.lineTo(x + (rnd() * 30 - 15), y + l); c.stroke();
  }
  const px = mm => mm * K;
  const py = mm => (BOARD.D / 2 + mm) * K; // board-space z mm -> canvas y
  c.fillStyle = '#e9e4d8'; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.font = `700 ${3.1 * K / 2}px "Barlow Semi Condensed", sans-serif`;
  // pin labels
  TOP_ROW.forEach((n, i) => { const x = px(BOARD.W / 2 + PINS[n][0]); c.save(); c.translate(x, py(-BOARD.D / 2 + 5.4)); c.fillText(n.replace('GND2','GND'), 0, 0); c.restore(); });
  BOT_ROW.forEach((n, i) => { const x = px(BOARD.W / 2 + PINS[n][0]); c.save(); c.translate(x, py(BOARD.D / 2 - 5.4)); c.fillText(n.replace('GND2','GND'), 0, 0); c.restore(); });
  c.font = `700 ${2.6 * K}px "Barlow Semi Condensed", sans-serif`;
  c.fillText('ESP32', px(BOARD.W / 2 - 6), py(0));
  c.font = `600 ${1.35 * K}px "Barlow Semi Condensed", sans-serif`;
  c.fillText('DEVKIT V1', px(BOARD.W / 2 - 6), py(3.1));
  c.font = `600 ${1.05 * K}px "Barlow Semi Condensed", sans-serif`;
  c.fillText('EN', px(BOARD.W / 2 - 21.5), py(-4.2)); c.fillText('BOOT', px(BOARD.W / 2 - 21.5), py(4.6));
  c.fillText('38-56-7D-2A', px(BOARD.W / 2 + 14), py(0)); // module markings flavour
  // silkscreen component outlines
  c.strokeStyle = 'rgba(233,228,216,.75)'; c.lineWidth = 1.8;
  const srect = (xm, zm, wm, dm) => c.strokeRect(px(BOARD.W / 2 + xm - wm / 2), py(zm - dm / 2), wm * K, dm * K);
  srect(14, 0, 20.4, 20.4);   // module footprint
  srect(-12, 0, 6, 6);        // USB-UART
  srect(-6, 7.6, 7.6, 7.6);   // regulator
  srect(2, 6.2, 3.2, 2.4);    // built-in LED
  srect(2, -6.2, 3.2, 2.4);   // power LED
  // mounting holes
  [[-BOARD.W / 2 + 2.5, -BOARD.D / 2 + 2.5], [BOARD.W / 2 - 2.5, -BOARD.D / 2 + 2.5], [-BOARD.W / 2 + 2.5, BOARD.D / 2 - 2.5], [BOARD.W / 2 - 2.5, BOARD.D / 2 - 2.5]].forEach(([xm, zm]) => {
    const cx = px(BOARD.W / 2 + xm), cy = py(zm);
    c.beginPath(); c.fillStyle = '#10142a'; c.arc(cx, cy, 1.05 * K, 0, 7); c.fill();
    c.beginPath(); c.strokeStyle = 'rgba(233,228,216,.6)'; c.lineWidth = 2; c.arc(cx, cy, 1.7 * K, 0, 7); c.stroke();
  });
  // vias
  c.fillStyle = 'rgba(140,160,210,.35)';
  for (let i = 0; i < 42; i++) { c.beginPath(); c.arc(rnd() * W, rnd() * H, 1.1, 0, 7); c.fill(); }
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  return tex;
}

export function buildBoard() {
  const g = new THREE.Group();
  const parts = {};   // hover/click info parts
  const anchors = {}; // callout anchor Object3D points
  const A = (name, x, y, z) => { const o = new THREE.Object3D(); o.position.set(x, y, z); g.add(o); anchors[name] = o; return o; };
  const reg = (mesh, id, label, desc) => { mesh.userData.part = { id, label, desc }; parts[id] = mesh; };

  // PCB
  const shape = new THREE.Shape();
  const w = BOARD.W / 2, d = BOARD.D / 2, r = 2.4;
  shape.moveTo(-w + r, -d); shape.lineTo(w - r, -d); shape.absarc(w - r, -d + r, r, -Math.PI / 2, 0);
  shape.lineTo(w, d - r); shape.absarc(w - r, d - r, r, 0, Math.PI / 2);
  shape.lineTo(-w + r, d); shape.absarc(-w + r, d - r, r, Math.PI / 2, Math.PI);
  shape.lineTo(-w, -d + r); shape.absarc(-w + r, -d + r, r, Math.PI, Math.PI * 1.5);
  const geo = new THREE.ExtrudeGeometry(shape, { depth: BOARD.T, bevelEnabled: false, curveSegments: 20 });
  geo.rotateX(-Math.PI / 2);
  const pcb = ink(new THREE.Mesh(geo, MAT.pcbEdge), 0x141a2e, 12);
  pcb.position.y = BOARD.T; pcb.castShadow = pcb.receiveShadow = true;
  g.add(pcb);
  // textured top face: silkscreen + traces, UV-remapped rounded shape
  const tg = new THREE.ShapeGeometry(shape, 20);
  { const uv = tg.attributes.uv, pa = tg.attributes.position;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, (pa.getX(i) + BOARD.W / 2) / BOARD.W, (pa.getY(i) + BOARD.D / 2) / BOARD.D); }
  tg.rotateX(-Math.PI / 2);
  const topFace = new THREE.Mesh(tg, new THREE.MeshStandardMaterial({ map: boardTexture(), roughness: .55 }));
  topFace.position.y = BOARD.T * 2 + .06; topFace.receiveShadow = true; // pcb sits at y=T, extrude adds another T
  g.add(topFace);
  reg(pcb, 'board', 'ESP32 DevKit V1', 'A 30-pin development board built around the ESP32-WROOM-32 module.');
  A('board', 0, 3, 0);

  const top = BOARD.T * 2 + .08; // components sit above the actual extruded PCB top

  // WROOM module: pcb + metal can with antenna
  const mod = new THREE.Group();
  mod.add(ink(box(19, 1.2, 19, new THREE.MeshStandardMaterial({ color: 0x1c2136, roughness: .55 }), 0, .6, 0)));
  const can = ink(box(17, 2.4, 13, MAT.metal, 0, 2.4, 2.6), 0x2a3040); mod.add(can);
  // antenna meander lines
  for (let i = 0; i < 4; i++) mod.add(box(14, .3, .8, MAT.metal, 0, 1.35, -7.2 + i * 2.2));
  mod.position.set(14, top, 0);
  g.add(mod); reg(can, 'module', 'ESP32-WROOM-32', 'The brain: dual-core 240 MHz chip with Wi-Fi and Bluetooth radios under the can.');
  A('module', 14, top + 4, 0);

  // USB micro port (left edge)
  const usb = new THREE.Group();
  usb.add(ink(box(7.5, 3.2, 6, MAT.metal, 0, 1.6, 0), 0x2a3040));
  usb.add(box(6.2, 1.8, 4.6, MAT.chip, -0.4, 1.5, 0));
  usb.position.set(-BOARD.W / 2 + 1.4, top, 0);
  g.add(usb); reg(usb.children[0], 'usb', 'Micro-USB port', 'Uploads code and powers the board from your computer.');
  A('usb', -BOARD.W / 2 + 1.4, top + 3.4, 0);

  // EN + BOOT buttons
  const mkTact = (id, label, desc, x, z) => {
    const t = new THREE.Group();
    t.add(ink(box(4.6, 1.2, 4.6, MAT.plastic, 0, .6, 0)));
    t.add(ink(box(3, 1.6, 3, MAT.metalDark, 0, 1.6, 0), 0x0e1220));
    t.position.set(x, top, z); g.add(t);
    reg(t.children[1], id, label, desc);
  };
  mkTact('en', 'EN button', 'Resets the chip — restarts your code from the top.', -21.6, -6.4);
  mkTact('boot', 'BOOT button', 'Hold while resetting to enter upload mode.', -21.6, 6.4);
  A('en', -21.6, top + 3, -6.4); A('boot', -21.6, top + 3, 6.4);

  // CP2102 USB-UART bridge (QFN)
  const uart = ink(box(5, .9, 5, MAT.chip, -12, top + .45, 0), 0x3a4358); g.add(uart);
  reg(uart, 'uart', 'USB-UART bridge', 'Turns USB into serial so your computer can talk to the ESP32.');
  // regulator
  const regM = ink(box(6.5, 2.2, 6.5, MAT.chip, -6, top + 1.1, 7.6), 0x3a4358); g.add(regM);
  reg(regM, 'reg', '3.3 V regulator', 'Steps the 5 V USB supply down to the 3.3 V the ESP32 runs on.');
  // built-in LED (GPIO2) + power LED
  const ledB = ink(box(2, .9, 1.3, MAT.blueLed, 2, top + .45, 6.2), 0x14203c); g.add(ledB);
  reg(ledB, 'bled', 'Built-in LED', 'Wired to GPIO2 — blinks with LED_BUILTIN.');
  const ledP = ink(box(2, .9, 1.3, MAT.red, 2, top + .45, -6.2), 0x3c1414); g.add(ledP);
  reg(ledP, 'pled', 'Power LED', 'Lit whenever the board has power.');
  A('bled', 2, top + 2, 6.2);

  // passives sprinkle
  const pass = [[-3, -6, 0], [0.5, -7.6, 0], [-9, -7.4, 90], [-15, 6.8, 0], [-17.5, -7.8, 90], [5.4, -6.6, 0], [7, 7, 90], [-0.5, 6.4, 0]];
  pass.forEach(([x, z, rot]) => g.add(ink(box(1.6, .5, .8, MAT.chip, x, top + .25, z, rot * Math.PI / 180), 0x3a4358)));

  // headers: 2 x 15 pins
  const headerGroup = new THREE.Group();
  const mkHeader = (z, names) => {
    const h = new THREE.Group();
    h.add(ink(box(names.length * 2.54 + .6, 2.4, 2.54, MAT.header, 0, 1.2, 0)));
    for (let i = 0; i < names.length; i++) {
      h.add(box(.7, 6.4, .7, MAT.pinMetal, -((names.length - 1) / 2) * 2.54 + i * 2.54, 1.2, 0));
    }
    h.position.set(0, top, z); headerGroup.add(h);
    return h;
  };
  const hTop = mkHeader(-BOARD.D / 2 + 2.0, TOP_ROW);
  const hBot = mkHeader(BOARD.D / 2 - 2.0, BOT_ROW);
  g.add(headerGroup);
  reg(hTop.children[0], 'gpioT', 'GPIO pins (top)', 'VIN, GND and GPIO 32–39, 25–27, 12–14 plus EN.');
  reg(hBot.children[0], 'gpioB', 'GPIO pins (bottom)', '3V3, GND and GPIO 0–23 including ADC, touch, I²C and SPI pins.');
  A('gpioT', 0, top + 8, -BOARD.D / 2 + 2.0); A('gpioB', 0, top + 8, BOARD.D / 2 - 2.0);
  A('power', -17.78, top + 8, BOARD.D / 2 - 2.0);

  return { group: g, parts, anchors, builtinLed: ledB, powerLed: ledP };
}

// world position of a header pin (after board transform), board-local coords
export function pinLocal(name) {
  const p = PINS[name]; if (!p) throw new Error('unknown pin ' + name);
  return new THREE.Vector3(p[0], BOARD.T * 2 + 3.6, p[1]);
}
