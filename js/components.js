// Learn ESP32 — breadboard, circuit components, wires. Original code.
import * as THREE from 'three';
import { MAT, box, cyl, ink } from './scene.js';

const ledBody = c => new THREE.MeshStandardMaterial({ color: c, roughness: .25, transparent: true, opacity: .92, emissive: c, emissiveIntensity: 0 });
export const LED_COLORS = { red: 0xe8392e, yellow: 0xf2c23a, green: 0x3fbf6a, blue: 0x3d7be0, white: 0xf2efe6 };

// ---------- breadboard ----------
// Compact 24-column board uses logical columns 3..26 of the 30-column wiring grid.
// Keep every mounted part and wire endpoint in the same physical location.
export const BB = { cols: 24, rows: 10, pitch: 2.54, w: 24 * 2.54 + 9, d: 10 * 2.54 + 9 };
export function bbHole(col, row) { // col 0..29, row 0..9 (0..4 top half, 5..9 bottom)
  return new THREE.Vector3((col - 14.5) * BB.pitch, 8.6, (row - (BB.rows - 1) / 2) * BB.pitch);
}
export function breadboard() {
  const g = new THREE.Group();
  g.add(ink(box(BB.w, 8.5, BB.d, new THREE.MeshBasicMaterial({color:0xeee9de}), 0, 4.25, 0)));
  // Dark extruded edge strokes retain their weight at oblique camera angles.
  const em=new THREE.MeshBasicMaterial({color:0x333642});
  for(const yy of[0,8.5])for(const zz of[-BB.d/2,BB.d/2]){const e=cyl(.16,.16,BB.w,em,0,yy,zz,6);e.rotation.z=Math.PI/2;g.add(e)}
  for(const yy of[0,8.5])for(const xx of[-BB.w/2,BB.w/2]){const e=cyl(.16,.16,BB.d,em,xx,yy,0,6);e.rotation.x=Math.PI/2;g.add(e)}
  for(const xx of[-BB.w/2,BB.w/2])for(const zz of[-BB.d/2,BB.d/2])g.add(cyl(.16,.16,8.5,em,xx,4.25,zz,6));
  // groove down the middle
  g.add(box(BB.w - 6, .8, 2.2, new THREE.MeshStandardMaterial({ color: 0xe4d6bc, roughness: .8 }), 0, 8.5, 0));
  // holes texture
  const cv = document.createElement('canvas'); cv.width = 512; cv.height = 176;
  const c = cv.getContext('2d'); c.fillStyle = '#f4ead6'; c.fillRect(0, 0, 512, 176);
  // Use the physical 2.54mm grid for both canvas recesses and mounted parts.
  const hx=i=>((i-(BB.cols-1)/2)*BB.pitch/BB.w+.5)*512;
  const hy=j=>((j-(BB.rows-1)/2)*BB.pitch/BB.d+.5)*176;
  for(let i=0;i<BB.cols;i++)for(let j=0;j<BB.rows;j++){
    const x=hx(i),y=hy(j);c.fillStyle='#bdb5a7';c.fillRect(x-3.2,y-2.8,6.4,5.6);
    c.fillStyle='#343741';c.fillRect(x-2.2,y-2.2,4.4,3.8);
  }
  c.strokeStyle='#b8b0a0';c.lineWidth=1;c.strokeRect(5,4,502,168);
  c.fillStyle='#c45f50';c.fillRect(8,7,496,1.4);c.fillRect(8,168,496,1.4);
  c.fillStyle='#66829c';c.fillRect(8,10,496,1.4);c.fillRect(8,164.5,496,1.4);
  c.fillStyle='#ded7c9';c.fillRect(7,84,498,8);c.strokeStyle='#b9b2a6';c.strokeRect(7,84,498,8);
  c.fillStyle='#958c7d';c.font='7px monospace';c.textAlign='center';for(let i=0;i<BB.cols;i+=5)c.fillText(String(i+4),hx(i),161);
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const topM = new THREE.Mesh(new THREE.PlaneGeometry(BB.w, BB.d), new THREE.MeshBasicMaterial({ map: tex }));
  topM.rotation.x = -Math.PI / 2; topM.position.y = 8.62; topM.receiveShadow = true;
  g.add(topM);
  return g;
}

// ---------- wires ----------
export function wire(a, b, color = 0xec5a4b, arch = 14) {
  const g = new THREE.Group();
  const mid = a.clone().add(b).multiplyScalar(.5); mid.y += arch;
  const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
  const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 24, .55, 8), new THREE.MeshStandardMaterial({ color, roughness: .5 }));
  tube.castShadow = true; g.add(tube);
  // pin tips
  const tip = (p, dir) => { const t = cyl(.55, .55, 6, MAT.pinMetal, 0, 0, 0, 8); t.position.copy(p); t.position.y += dir * 2.4; g.add(t); };
  tip(a, 1); tip(b, 1);
  g.userData.curve = curve;
  return g;
}
// animated current-flow dot that rides a wire's curve
export function flowDot(wireGroup) {
  const d = new THREE.Mesh(new THREE.SphereGeometry(1.05, 10, 10), new THREE.MeshBasicMaterial({ color: 0xfff3d0 }));
  d.visible = false; wireGroup.add(d);
  return d;
}

// ---------- components (built at origin, y=0 = breadboard top) ----------
export function led5mm(color = 0xe8392e) {
  const g = new THREE.Group();
  const body = cyl(2.5, 2.5, 5.5, ledBody(color), 0, 5.2, 0);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(2.5, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2), body.material);
  dome.position.y = 8; ink(body); g.add(body, dome);
  g.add(cyl(.35, .35, 8, MAT.pinMetal, -1.25, 0, 0, 6), cyl(.35, .35, 6.5, MAT.pinMetal, 1.25, -.6, 0, 6));
  g.userData.setLit = on => { body.material.emissiveIntensity = on ? 1.6 : 0; };
  g.userData.setColor = c => { body.material.color.set(c); body.material.emissive.set(c); };
  g.userData.body = body;
  return g;
}
export function rgbLed() {
  const g = led5mm(0xffffff);
  g.userData.setRGB = (r, gg, b) => { const c = new THREE.Color(r / 255, gg / 255, b / 255); g.userData.body.material.color.set(c); g.userData.body.material.emissive.set(c); g.userData.body.material.emissiveIntensity = (r + gg + b) > 12 ? 1.4 : 0; };
  return g;
}
export function resistor(ohms = 220) {
  const g = new THREE.Group();
  const body = box(6.5, 2.3, 2.3, new THREE.MeshStandardMaterial({ color: 0xd9b380, roughness: .6 }), 0, 1.6, 0);
  g.add(body);
  const bands = { 220: [0xc02020, 0x704018, 0x704018], 1000: [0x704018, 0x202020, 0xc02020], 10000: [0x704018, 0x202020, 0xd07020] }[ohms] || [0xc02020, 0x704018, 0x704018];
  bands.forEach((c, i) => g.add(box(.9, 2.4, 2.4, new THREE.MeshStandardMaterial({ color: c }), -1.8 + i * 1.2, 1.6, 0)));
  const l1 = cyl(.32, .32, 9, MAT.pinMetal, 0, 0, 0, 6); l1.rotation.z = Math.PI / 2; l1.position.set(-5.4, 1.6, 0);
  const l2 = l1.clone(); l2.position.x = 5.4; g.add(l1, l2);
  g.userData.body = body;
  return g;
}
export function pushButton() {
  const g = new THREE.Group();
  g.add(box(6, 3, 6, MAT.plastic, 0, 1.5, 0));
  const cap = cyl(1.9, 1.9, 1.6, MAT.red, 0, 3.6, 0); g.add(cap);
  [[-2.4, -2.4], [2.4, -2.4], [-2.4, 2.4], [2.4, 2.4]].forEach(([x, z]) => g.add(cyl(.32, .32, 5, MAT.pinMetal, x, -2, z, 6)));
  g.userData.cap = cap;
  g.userData.setPressed = p => { cap.position.y = p ? 2.9 : 3.6; };
  return g;
}
export function potentiometer() {
  const g = new THREE.Group();
  g.add(box(10, 4.5, 10, new THREE.MeshStandardMaterial({ color: 0x35507a, roughness: .5 }), 0, 2.2, 0));
  const knob = cyl(3.4, 3.4, 3.2, MAT.plastic, 0, 6, 0); g.add(knob);
  const line = box(.7, .4, 3, MAT.white, 0, 7.7, -1); knob.add ? null : 0; g.add(line); line.position.set(0, 7.8, -1);
  [-2.54, 0, 2.54].forEach(x => g.add(cyl(.32, .32, 5, MAT.pinMetal, x, -2, 4, 6)));
  g.userData.setAngle = a => { knob.rotation.y = a; line.rotation.y = a; };
  return g;
}
export function ldr() {
  const g = new THREE.Group();
  const face = cyl(2.6, 2.6, 1.2, new THREE.MeshStandardMaterial({ color: 0xd8a25a, roughness: .5 }), 0, 3.4, 0); g.add(face);
  const line = box(.5, .3, 4.4, new THREE.MeshStandardMaterial({ color: 0x7a4020 }), 0, 4.05, 0); g.add(line);
  g.add(cyl(.32, .32, 5, MAT.pinMetal, -1.8, 0, 0, 6), cyl(.32, .32, 5, MAT.pinMetal, 1.8, 0, 0, 6));
  return g;
}
export function ultrasonic() {
  const g = new THREE.Group();
  g.add(box(22, 1.6, 11, new THREE.MeshStandardMaterial({ color: 0x2a56a3, roughness: .55 }), 0, 4.4, 0));
  const e1 = cyl(4, 4, 7, MAT.metalDark, -6.4, 8.6, 0); const e2 = e1.clone(); e2.position.x = 6.4;
  g.add(e1, e2);
  g.add(box(4, 2.4, 3, MAT.metal, 0, 6.4, -3.6));
  g.userData.emitters = [e1, e2];
  return g;
}
export function buzzer() {
  const g = new THREE.Group();
  g.add(cyl(6, 6, 5.5, MAT.plastic, 0, 2.8, 0));
  g.add(cyl(2, 2, .6, MAT.chip, 0, 5.7, 0));
  g.add(cyl(.32, .32, 5, MAT.pinMetal, -3.8, -1.5, 0, 6), cyl(.32, .32, 5, MAT.pinMetal, 3.8, -1.5, 0, 6));
  return g;
}
export function dcMotor() {
  const g = new THREE.Group();
  g.add(cyl(9, 9, 16, MAT.metalDark, 0, 9, 0));
  const shaft = cyl(1.2, 1.2, 6, MAT.pinMetal, 0, 19, 0); g.add(shaft);
  const fan = new THREE.Group();
  for (let i = 0; i < 3; i++) { const b = box(2.2, .5, 7, MAT.red, 0, 0, 4); b.rotation.y = i * Math.PI * 2 / 3; fan.add(b); }
  fan.position.y = 22; g.add(fan);
  g.userData.fan = fan; g.userData.spin = v => { g.userData._v = v; };
  g.userData.tick = dt => { if (g.userData._v) fan.rotation.y += dt * g.userData._v; };
  return g;
}
export function npn() {
  const g = new THREE.Group();
  g.add(box(5, 4.4, 4.6, MAT.chip, 0, 2.2, 0));
  g.add(box(5, 4.4, 1, MAT.metalDark, 0, 2.2, -2.3));
  [-1.9, 0, 1.9].forEach(x => g.add(cyl(.3, .3, 6, MAT.pinMetal, x, -1.5, 1, 6)));
  return g;
}
export function tmp36() {
  const g = new THREE.Group();
  g.add(box(5, 5, 4.2, new THREE.MeshStandardMaterial({ color: 0x3a3f52, roughness: .4 }), 0, 2.5, 0));
  [-1.9, 0, 1.9].forEach(x => g.add(cyl(.3, .3, 6, MAT.pinMetal, x, -1.5, 1, 6)));
  return g;
}
export function servo() {
  const g = new THREE.Group();
  g.add(box(23, 12, 12, new THREE.MeshStandardMaterial({ color: 0x2a56a3, roughness: .5 }), 0, 6, 0));
  g.add(cyl(4, 4, 3, MAT.plastic, -6, 13.5, 0));
  const arm = box(14, 1.4, 2.6, MAT.white, 0, 0, 0);
  const armG = new THREE.Group(); armG.add(arm); arm.position.x = 5;
  armG.position.set(-6, 15.6, 0); g.add(armG);
  g.userData.setAngle = a => { armG.rotation.y = a; };
  return g;
}
export function stepper() {
  const g = new THREE.Group();
  g.add(cyl(11, 11, 10, MAT.metalDark, 0, 5, 0));
  g.add(cyl(3, 3, 3, MAT.metal, 0, 11, 0));
  const shaft = cyl(1.4, 1.4, 5, MAT.pinMetal, 0, 13, 0); g.add(shaft);
  const flag = box(10, 1.2, 3, MAT.cream, 5, 14.5, 0);
  const fg = new THREE.Group(); fg.add(flag); fg.position.y = 14.5; flag.position.set(5, 0, 0); g.add(fg);
  g.userData.setAngle = a => { fg.rotation.y = a; };
  return g;
}
export function oled() {
  const g = new THREE.Group();
  g.add(box(27, 1.4, 27, new THREE.MeshStandardMaterial({ color: 0x2a56a3, roughness: .55 }), 0, 3.2, 0));
  const scr = box(24, 1, 14, MAT.chip, 0, 4.2, 2); g.add(scr);
  const cv = document.createElement('canvas'); cv.width = 128; cv.height = 64;
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
  const face = new THREE.Mesh(new THREE.PlaneGeometry(22, 12), new THREE.MeshBasicMaterial({ map: tex }));
  face.rotation.x = -Math.PI / 2; face.position.set(0, 4.75, 2); g.add(face);
  g.userData.draw = fn => { const c = cv.getContext('2d'); c.fillStyle = '#04070f'; c.fillRect(0, 0, 128, 64); fn(c); tex.needsUpdate = true; };
  g.userData.draw(c => { c.fillStyle = '#9fd8ff'; c.font = '10px monospace'; c.fillText('ESP32', 46, 34); });
  return g;
}
export function soilProbe() {
  const g = new THREE.Group();
  g.add(box(14, 1, 34, new THREE.MeshStandardMaterial({ color: 0xb33a2e, roughness: .5 }), 0, .5, 0));
  g.add(box(14, 1.6, 8, MAT.chip, 0, 1.2, -13));
  return g;
}
export function fsr() {
  const g = new THREE.Group();
  const pad = cyl(7, 7, .8, new THREE.MeshStandardMaterial({ color: 0x35323e, roughness: .6 }), 0, 1.2, 0); g.add(pad);
  g.add(box(4, .5, 14, new THREE.MeshStandardMaterial({ color: 0x9c8f7c }), 0, 1, -10));
  g.userData.setPress = p => { pad.scale.setScalar(1 - p * .06); };
  return g;
}
export function trafficLight() {
  const g = new THREE.Group();
  g.add(box(10, 26, 8, MAT.plastic, 0, 13, 0));
  const mk = (c, y) => { const l = cyl(3, 3, 1.4, ledBody(c), 0, y, 4.4); l.rotation.x = Math.PI / 2; g.add(l); return l; };
  const R = mk(0xe8392e, 20.5), Y = mk(0xf2c23a, 13), G = mk(0x3fbf6a, 5.5);
  const set = (r, y, gr) => { R.material.emissiveIntensity = r ? 1.6 : 0; Y.material.emissiveIntensity = y ? 1.6 : 0; G.material.emissiveIntensity = gr ? 1.6 : 0; };
  g.userData.set = set; set(0, 0, 0);
  return g;
}
export function toyCar() {
  const g = new THREE.Group();
  g.add(box(18, 5, 10, MAT.red, 0, 4.5, 0));
  g.add(box(10, 4, 9, new THREE.MeshStandardMaterial({ color: 0xd8443a, roughness: .35 }), -1, 8.8, 0));
  [[-6, -5.4], [6, -5.4], [-6, 5.4], [6, 5.4]].forEach(([x, z]) => { const w = cyl(2.6, 2.6, 2, MAT.rubber, x, 2.6, z); w.rotation.x = Math.PI / 2; g.add(w); });
  return g;
}
export function pianoKeys(n = 8) {
  const g = new THREE.Group();
  const keys = [];
  for (let i = 0; i < n; i++) {
    const k = box(6.4, 2.6, 12, MAT.white, i * 7 - (n - 1) * 3.5, 1.3, 0);
    g.add(k); keys.push(k);
  }
  g.add(box(n * 7 + 2, 1.6, 16, MAT.plastic, 0, -.4, 0));
  g.userData.keys = keys;
  g.userData.press = (i, on) => { keys.forEach((k, j) => k.position.y = (j === i && on) ? .7 : 1.3); };
  return g;
}
