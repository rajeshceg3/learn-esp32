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
  g.add(ink(cyl(2.9,2.9,.65,body.material,0,2.65,0),0x4a2530,40));
  g.add(cyl(.35, .35, 8, MAT.pinMetal, -1.25, 0, 0, 6), cyl(.35, .35, 6.5, MAT.pinMetal, 1.25, -.6, 0, 6));
  g.userData.setLit = on => { body.material.emissiveIntensity = on ? 1.6 : 0; };
  g.userData.setColor = c => { body.material.color.set(c); body.material.emissive.set(c); };
  g.userData.body = body;
  return g;
}
export function rgbLed() {
  const g = led5mm(0xb84de3);
  // A through-hole RGB LED has four legs: one common and three colour channels.
  g.children.filter(o=>o.geometry?.type==='CylinderGeometry'&&o.geometry.parameters.radiusTop===.35).forEach(o=>o.removeFromParent());
  [-1.9,-.63,.63,1.9].forEach((x,i)=>g.add(cyl(.28,.28,i===1?8.5:7, MAT.pinMetal,x,i===1?-.25:-1,0,6)));
  g.userData.setRGB = (r, gg, b) => { const c = new THREE.Color(r / 255, gg / 255, b / 255); g.userData.body.material.color.set(c); g.userData.body.material.emissive.set(c); g.userData.body.material.emissiveIntensity = (r + gg + b) > 12 ? 1.4 : 0; };
  return g;
}
export function resistor(ohms = 220) {
  const g = new THREE.Group();
  const body = box(6.5, 2.3, 2.3, new THREE.MeshStandardMaterial({ color: 0xd9b380, roughness: .6 }), 0, 1.6, 0);
  g.add(ink(body));
  const bands = { 220: [0xc02020, 0xc02020, 0x704018], 1000: [0x704018, 0x202020, 0xc02020], 10000: [0x704018, 0x202020, 0xd07020] }[ohms] || [0xc02020, 0xc02020, 0x704018];
  bands.forEach((c, i) => g.add(box(.9, 2.4, 2.4, new THREE.MeshStandardMaterial({ color: c }), -1.8 + i * 1.2, 1.6, 0)));
  const l1 = cyl(.32, .32, 9, MAT.pinMetal, 0, 0, 0, 6); l1.rotation.z = Math.PI / 2; l1.position.set(-5.4, 1.6, 0);
  const l2 = l1.clone(); l2.position.x = 5.4; g.add(l1, l2);
  g.userData.body = body;
  return g;
}
export function pushButton() {
  const g = new THREE.Group();
  g.add(ink(box(6, 3, 6, MAT.plastic, 0, 1.5, 0)));
  g.add(ink(box(5.6,.28,5.6,MAT.metal,0,3.08,0)));
  for(const x of[-2.2,2.2])for(const z of[-2.2,2.2])g.add(cyl(.3,.3,.16,MAT.metalDark,x,3.3,z,8));
  const cap = ink(cyl(1.9, 1.9, 1.6, MAT.red, 0, 3.6, 0),0x4a2530,35); g.add(cap);
  [[-2.4, -2.4], [2.4, -2.4], [-2.4, 2.4], [2.4, 2.4]].forEach(([x, z]) => g.add(cyl(.32, .32, 5, MAT.pinMetal, x, -2, z, 6)));
  g.userData.cap = cap;
  g.userData.setPressed = p => { cap.position.y = p ? 2.9 : 3.6; };
  return g;
}
export function potentiometer() {
  const g = new THREE.Group();
  g.add(box(10, 4.5, 10, new THREE.MeshStandardMaterial({ color: 0x35507a, roughness: .5 }), 0, 2.2, 0));
  const knob = cyl(3.4, 3.4, 3.2, MAT.plastic, 0, 6, 0); g.add(knob);
  const line = box(.7, .4, 3, MAT.white, 0, 7.7, -1); knob.add(line); line.position.set(0,1.8,-1);
  ink(knob,0x141a2e,35);
  for(let i=0;i<14;i++){const a=i*Math.PI*2/14;const rib=box(.3,2.5,.5,MAT.chip,Math.sin(a)*3.4,0,Math.cos(a)*3.4,a);knob.add(rib);}
  [-2.54, 0, 2.54].forEach(x => g.add(cyl(.32, .32, 5, MAT.pinMetal, x, -2, 4, 6)));
  g.userData.setAngle = a => { knob.rotation.y = a; };
  return g;
}
export function deskLamp() {
  const g=new THREE.Group();
  g.add(ink(cyl(6,6.3,1.8,MAT.metalDark,0,.9,0)),ink(cyl(5.4,5.8,.6,MAT.metalDark,0,2,0)));
  const rod=(a,b)=>{const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b);const r=ink(cyl(.6,.6,av.distanceTo(bv),MAT.metal));r.position.copy(av.clone().add(bv).multiplyScalar(.5));r.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),bv.sub(av).normalize());g.add(r);};
  rod([0,2.2,0],[2,12,0]);rod([2,12,0],[-3.2,18,0]);
  for(const [x,y]of[[2,12],[-3.2,18]]){const pivot=ink(cyl(1,1,1.5,MAT.red,x,y,0));pivot.rotation.x=Math.PI/2;g.add(pivot);}
  const shade=new THREE.Group();shade.position.set(-3.2,18,0);shade.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(-1,-.45,0).normalize());
  const shell=new THREE.Mesh(new THREE.CylinderGeometry(4.5,1.4,6,28,1,true),new THREE.MeshStandardMaterial({color:0xe85848,roughness:.4,side:THREE.DoubleSide}));shell.position.y=3;shade.add(ink(shell));
  shade.add(cyl(3.8,3.8,.12,MAT.cream,0,5.9,0,28));g.add(shade);return g;
}
export function ldr() {
  const g = new THREE.Group();
  const face = cyl(2.6, 2.6, 1.2, new THREE.MeshStandardMaterial({ color: 0xd8a25a, roughness: .5 }), 0, 3.4, 0); g.add(face);
  ink(face,0x49382a,35);
  const trackMat=new THREE.MeshBasicMaterial({color:0x7a4020});
  const track=[[-1.7,-1.5],[1.1,-1.5],[1.1,-.8],[-1.1,-.8],[-1.1,0],[1.1,0],[1.1,.8],[-1.1,.8],[-1.1,1.5],[1.7,1.5]];
  for(let i=1;i<track.length;i++){const [x1,z1]=track[i-1],[x2,z2]=track[i];const seg=box(Math.abs(x2-x1)+.23,.1,Math.abs(z2-z1)+.23,trackMat,(x1+x2)/2,4.06,(z1+z2)/2);g.add(seg);}
  g.add(cyl(.32, .32, 5, MAT.pinMetal, -1.8, 0, 0, 6), cyl(.32, .32, 5, MAT.pinMetal, 1.8, 0, 0, 6));
  return g;
}
export function ultrasonic() {
  const g = new THREE.Group();
  const blue=new THREE.MeshStandardMaterial({color:0x2a56a3,roughness:.55});
  g.add(ink(box(23,11,1.3,blue,0,7.5,0)));
  const emitters=[];
  const meshCanvas=document.createElement('canvas');meshCanvas.width=128;meshCanvas.height=128;const mc=meshCanvas.getContext('2d');
  mc.fillStyle='#454b55';mc.fillRect(0,0,128,128);mc.strokeStyle='#7c8187';mc.lineWidth=1;
  for(let i=0;i<128;i+=6){mc.beginPath();mc.moveTo(i,0);mc.lineTo(i,128);mc.moveTo(0,i);mc.lineTo(128,i);mc.stroke();}
  const meshTex=new THREE.CanvasTexture(meshCanvas);meshTex.colorSpace=THREE.SRGBColorSpace;
  for(const x of[-6.3,6.3]){
    const can=ink(cyl(4.4,4.4,7,MAT.metalDark,x,8.1,4.2),0x303847,35);can.rotation.x=Math.PI/2;g.add(can);emitters.push(can);
    const rim=ink(cyl(4.45,4.45,.45,MAT.metal,x,8.1,7.85),0x303847,35);rim.rotation.x=Math.PI/2;g.add(rim);
    const disk=new THREE.Mesh(new THREE.CircleGeometry(3.8,40),new THREE.MeshBasicMaterial({map:meshTex}));disk.position.set(x,8.1,8.1);g.add(disk);
  }
  g.add(ink(box(3.5,1.5,1.6,MAT.metal,0,10.7,1.2)));
  for(const x of[-3.81,-1.27,1.27,3.81]){g.add(box(.6,3,.6,MAT.pinMetal,x,1.5,0));g.add(box(1.7,1.2,1.7,MAT.plastic,x,3.2,0));}
  g.userData.emitters = emitters;
  return g;
}
export function buzzer() {
  const g = new THREE.Group();
  g.add(ink(cyl(6, 6, 5.5, MAT.plastic, 0, 2.8, 0),0x141a2e,35));
  g.add(cyl(2, 2, .6, MAT.chip, 0, 5.7, 0));
  g.add(cyl(.32, .32, 5, MAT.pinMetal, -3.8, -1.5, 0, 6), cyl(.32, .32, 5, MAT.pinMetal, 3.8, -1.5, 0, 6));
  return g;
}
export function dcMotor() {
  const g = new THREE.Group();
  const metal=new THREE.MeshStandardMaterial({color:0xa7a69e,roughness:.4,metalness:.5});
  const can=ink(cyl(7.3,7.3,19,metal,0,9,0),0x303747,40);can.rotation.x=Math.PI/2;g.add(can);
  for(const z of[-9.5,9.5]){const cap=ink(cyl(7.4,7.4,.9,metal,0,9,z),0x303747,40);cap.rotation.x=Math.PI/2;g.add(cap);}
  const back=ink(cyl(6.8,6.8,2,MAT.cream,0,9,-10.5));back.rotation.x=Math.PI/2;g.add(back);
  const shaft=cyl(1,1,7,MAT.pinMetal,0,9,13);shaft.rotation.x=Math.PI/2;g.add(shaft);
  g.add(ink(box(16,1.3,15,MAT.metalDark,0,1.8,0)));
  for(const x of[-4,4]){g.add(ink(box(2,3,1,MAT.pinMetal,x,15,-10)));g.add(box(1.4,.8,3,MAT.pinMetal,x,16,-11));}
  // Three independently modelled propeller blades sit in the shaft's XY plane.
  const fan = new THREE.Group();fan.position.set(0,9,16.5);g.add(fan);
  const orange=new THREE.MeshStandardMaterial({color:0xe39442,roughness:.45});
  for(let i=0;i<3;i++){
    const blade=new THREE.Shape();blade.moveTo(1,-1.2);blade.quadraticCurveTo(10,-3.5,13,-.8);blade.quadraticCurveTo(13,1.8,3,1.2);blade.closePath();
    const mesh=new THREE.Mesh(new THREE.ExtrudeGeometry(blade,{depth:.7,bevelEnabled:false}),orange);mesh.rotation.z=i*Math.PI*2/3;fan.add(ink(mesh));
  }
  const hub=cyl(2.2,2.2,1.4,orange,0,0,0,20);hub.rotation.x=Math.PI/2;fan.add(ink(hub));
  g.userData.fan = fan; g.userData.spin = v => { g.userData._v = v; };
  g.userData.tick = dt => { if (g.userData._v) fan.rotation.z += dt * g.userData._v; };
  return g;
}
export function npn() {
  const g = new THREE.Group();
  g.add(box(5, 4.4, 4.6, MAT.chip, 0, 2.2, 0));
  g.add(box(5, 4.4, 1, MAT.metalDark, 0, 2.2, -2.3));
  [-1.9, 0, 1.9].forEach(x => g.add(cyl(.3, .3, 6, MAT.pinMetal, x, -1.5, 1, 6)));
  return g;
}
// Original handheld dryer: broad barrel, vented rear, tapered nozzle and angled grip.
export function coolingFan() {
  const g=new THREE.Group();const dark=MAT.plastic;
  g.add(ink(box(18,2.5,12,dark,0,1.25,0)));g.add(ink(box(3,9,4,dark,0,6,0)));
  const rotor=new THREE.Group();rotor.position.set(0,17,0);g.add(rotor);
  for(let i=0;i<7;i++){const a=i*Math.PI*2/7;const blade=ink(box(3.2,9,.6,new THREE.MeshStandardMaterial({color:0x4b9b9b}),0,5,0));blade.rotation.z=a;blade.position.set(-Math.sin(a)*4,Math.cos(a)*4,0);rotor.add(blade);}
  const hub=cyl(2,2,1.5,MAT.red,0,0,0,18);hub.rotation.x=Math.PI/2;rotor.add(hub);
  for(const z of[-1.4,1.6]){const ring=new THREE.Mesh(new THREE.TorusGeometry(11,.65,8,40),MAT.metalDark);ring.position.set(0,17,z);g.add(ink(ring));}
  for(let i=0;i<8;i++){const a=i*Math.PI/4;const spoke=cyl(.2,.2,21,MAT.metal,0,17,1.8,6);spoke.rotation.z=a;g.add(spoke);}
  g.userData.tick=(dt,on)=>{if(on)rotor.rotation.z+=dt*22;};return g;
}
export function heatGun() {
  const g=new THREE.Group();
  const teal=new THREE.MeshStandardMaterial({color:0x66b6ad,roughness:.45});
  const dark=new THREE.MeshStandardMaterial({color:0x293445,roughness:.6});
  g.add(ink(box(20,11,11,teal,0,17,0)));
  g.add(ink(box(3.2,11.5,11.5,dark,11.2,17,0)));
  g.add(ink(box(7,7,8,dark,-13,17,0)));
  // A recessed outlet and raised protective rim.
  g.add(box(.3,5,6,MAT.chip,-16.6,17,0));
  for(const z of[-3.7,3.7])g.add(box(1,6.8,.6,MAT.metalDark,-16.8,17,z));
  for(const y of[13.8,20.2])g.add(box(1,.6,8,MAT.metalDark,-16.8,y,0));
  for(let y=13;y<=21;y+=2)g.add(box(.35,.65,8,MAT.chip,12.9,y,0));
  const grip=ink(box(5.8,10,6,teal,3.2,7.2,0));grip.rotation.z=-.18;g.add(grip);
  g.add(ink(cyl(4.5,4.9,1.5,dark,4,1.4,0,20)));
  g.add(box(1.1,3,3,MAT.red,-.1,9,0));
  const cord=new THREE.CatmullRomCurve3([new THREE.Vector3(5,1.5,0),new THREE.Vector3(11,.8,1),new THREE.Vector3(15,.7,4)]);
  g.add(new THREE.Mesh(new THREE.TubeGeometry(cord,12,.45,6,false),dark));
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
  const blue=new THREE.MeshStandardMaterial({color:0x2a56a3,roughness:.45});
  g.add(ink(box(23,17,12,blue,0,8.5,0)));
  g.add(ink(box(23.3,2.2,12.3,blue,0,17.8,0)));
  // Mounting ears and circular holes are actual open geometry, not painted dots.
  for(const x of[-14.2,14.2]) {
    const tab=new THREE.Shape();tab.moveTo(-3.5,-5);tab.lineTo(3.5,-5);tab.lineTo(3.5,5);tab.lineTo(-3.5,5);tab.closePath();
    const hole=new THREE.Path();hole.absarc(0,0,1.2,0,Math.PI*2,true);tab.holes.push(hole);
    const ear=new THREE.Mesh(new THREE.ExtrudeGeometry(tab,{depth:1.6,bevelEnabled:false}),blue);ear.rotation.x=-Math.PI/2;ear.position.set(x,13,0);g.add(ink(ear));
  }
  g.add(ink(cyl(4.5,4.5,2.5,blue,-6,20,0)));
  const armG=new THREE.Group();armG.position.set(-6,22,0);g.add(armG);
  const horn=new THREE.Shape();horn.moveTo(-3,-2.4);horn.lineTo(13,-1.8);horn.quadraticCurveTo(15,0,13,1.8);horn.lineTo(-3,2.4);horn.quadraticCurveTo(-5,0,-3,-2.4);
  for(const x of[4,7.5,11]){const hole=new THREE.Path();hole.absarc(x,0,.65,0,Math.PI*2,true);horn.holes.push(hole);}
  const arm=new THREE.Mesh(new THREE.ExtrudeGeometry(horn,{depth:1.2,bevelEnabled:false}),MAT.white);arm.rotation.x=-Math.PI/2;armG.add(ink(arm));
  armG.add(cyl(1.1,1.1,.6,MAT.metal,-1,1.5,0,12));
  const cv=document.createElement('canvas');cv.width=128;cv.height=72;const c=cv.getContext('2d');c.fillStyle='#204887';c.fillRect(0,0,128,72);c.fillStyle='#f2efe6';c.textAlign='center';c.font='bold 25px sans-serif';c.fillText('SG90',64,30);c.font='13px sans-serif';c.fillText('MICRO SERVO',64,53);
  const tex=new THREE.CanvasTexture(cv);tex.colorSpace=THREE.SRGBColorSpace;
  const label=new THREE.Mesh(new THREE.PlaneGeometry(15,8.5),new THREE.MeshBasicMaterial({map:tex}));label.position.set(0,8.5,6.03);g.add(label);
  g.userData.setAngle = a => { armG.rotation.y = a; };
  return g;
}
export function stepperDriver() {
  const g=new THREE.Group();
  g.add(ink(box(20,1.6,16,new THREE.MeshStandardMaterial({color:0x2e8156}),0,0,0)));
  g.add(ink(box(5,1.8,10,MAT.chip,-1,1.7,0)));
  for(let i=0;i<8;i++)for(const x of[-4,2])g.add(box(1.5,.4,.45,MAT.pinMetal,x,1.3,-4.1+i*1.15));
  for(let i=0;i<4;i++){g.add(ink(box(1.6,2.8,1.6,MAT.plastic,-7,2.2,-5+i*2.54)));g.add(box(.55,2.5,.55,MAT.pinMetal,-7,4,-5+i*2.54));g.add(box(1.2,.5,1.2,new THREE.MeshStandardMaterial({color:0xd64a3a}),-4,1.2,-5+i*2.54));}
  g.add(ink(box(4,3.4,6,MAT.cream,6,2.5,3)));
  for(const z of[1.3,2.5,3.7,4.9])g.add(box(2,.6,.4,MAT.pinMetal,6,4.3,z));
  return g;
}
export function stepper() {
  const g = new THREE.Group();
  g.add(ink(box(30,1.4,30,MAT.cream,0,.7,0)),ink(cyl(8,8,10,MAT.metalDark,0,6.4,0)));
  g.add(ink(box(5,8,7,new THREE.MeshStandardMaterial({color:0x2d5d9d}),-7,5.4,0)));
  for(const x of[-10,10]){g.add(ink(box(3,1.1,7,MAT.metal,x,1.9,0)));g.add(cyl(.8,.8,.6,MAT.metalDark,x,2.7,0,12));}
  const wheel=new THREE.Group();wheel.position.y=15;g.add(wheel);
  wheel.add(ink(cyl(15,15,1.2,MAT.metal,0,0,0,64)));
  const cv=document.createElement('canvas');cv.width=512;cv.height=512;const c=cv.getContext('2d');
  const colors=['#f3c94c','#2f9d9c','#ed7d54','#d55442','#eea53a','#8965b5','#49aa73','#303a57'];
  const labels=['200','100','50','JACKPOT','1000','2×','500','AGAIN'];
  for(let i=0;i<8;i++){const a=i*Math.PI/4,b=a+Math.PI/4;c.beginPath();c.moveTo(256,256);c.arc(256,256,250,a,b);c.closePath();c.fillStyle=colors[i];c.fill();c.strokeStyle='#f4dfb9';c.lineWidth=2;c.stroke();c.save();c.translate(256,256);c.rotate(a+Math.PI/8);c.fillStyle=i===0?'#25334b':'#fff9e9';c.font='bold '+(labels[i].length>5?19:25)+'px sans-serif';c.textAlign='center';c.fillText(labels[i],170,9);c.restore();}
  const tex=new THREE.CanvasTexture(cv);tex.colorSpace=THREE.SRGBColorSpace;
  const face=new THREE.Mesh(new THREE.CircleGeometry(14.85,64),new THREE.MeshBasicMaterial({map:tex}));face.rotation.x=-Math.PI/2;face.position.y=.64;wheel.add(face);
  for(let i=0;i<8;i++){const a=i*Math.PI/4;wheel.add(ink(cyl(.38,.38,1.8,MAT.pinMetal,13.7*Math.cos(a),1.5,13.7*Math.sin(a),8)));}
  wheel.add(ink(cyl(2.3,2.3,.8,MAT.red,0,1.2,0,24)));
  g.add(ink(cyl(.65,.65,16,MAT.metalDark,0,8,17)));
  const pointer=new THREE.Mesh(new THREE.ConeGeometry(1.6,4,3),MAT.red);pointer.position.set(0,17,15.6);pointer.rotation.x=-Math.PI/2;g.add(ink(pointer));
  g.userData.setAngle = a => { wheel.rotation.y = a; };
  g.userData.wheel=wheel;
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
  const red=new THREE.MeshStandardMaterial({color:0xe14e43,roughness:.38});
  const profile=new THREE.Shape();profile.moveTo(-9,2.8);profile.lineTo(9,2.8);profile.lineTo(9,5.3);profile.quadraticCurveTo(9,6,7.5,6);profile.lineTo(4.8,6.3);profile.lineTo(2.7,10);profile.quadraticCurveTo(2.3,10.7,1.3,10.7);profile.lineTo(-3.1,10.7);profile.quadraticCurveTo(-3.8,10.7,-4.1,10);profile.lineTo(-6,6.4);profile.lineTo(-8.4,6);profile.quadraticCurveTo(-9,5.8,-9,5);profile.closePath();
  const body=new THREE.Mesh(new THREE.ExtrudeGeometry(profile,{depth:9,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.35,bevelThickness:.35}),red);body.position.z=-4.5;g.add(ink(body));
  for(const z of[-4.88,4.88]){
    const side=new THREE.Shape();side.moveTo(-5.1,6.7);side.lineTo(3.8,6.7);side.lineTo(2.15,9.8);side.lineTo(-3.5,9.8);side.closePath();
    const pane=new THREE.Mesh(new THREE.ShapeGeometry(side),new THREE.MeshStandardMaterial({color:0x9badae,roughness:.3,side:THREE.DoubleSide}));pane.position.z=z;g.add(pane);
    g.add(box(.45,3, .18,red,-.1,8.2,z));g.add(box(1.25,.22,.18,MAT.metalDark,-2.5,6,z));
  }
  for(const [xt,yt,xb,yb] of[[2.95,9.8,4.45,7.1],[-4.25,9.8,-5.65,7.1]]){
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute([xt,yt,-3.7,xb,yb,-3.7,xb,yb,3.7,xt,yt,-3.7,xb,yb,3.7,xt,yt,3.7],3));geo.computeVertexNormals();
    const window=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:0x9badae,roughness:.27,side:THREE.DoubleSide}));g.add(window);
  }
  for(const x of[-9.35,9.35])g.add(ink(box(.6,.8,8.2,MAT.metalDark,x,3.2,0)));
  for(const z of[-3,3]){g.add(box(.16,1,1.6,MAT.white,9.4,4.8,z));g.add(box(.16,.8,1.4,MAT.red,-9.4,4.8,z));}
  for(const [x,z] of[[-6,-5.1],[6,-5.1],[-6,5.1],[6,5.1]]){
    const w=ink(cyl(2.6,2.6,1.5,MAT.rubber,x,2.6,z));w.rotation.x=Math.PI/2;g.add(w);
    const hub=cyl(1.25,1.25,.15,MAT.metalDark,x,2.6,z+Math.sign(z)*.83,16);hub.rotation.x=Math.PI/2;g.add(hub);
    const cap=cyl(.5,.5,.18,MAT.metal,x,2.6,z+Math.sign(z)*.94,12);cap.rotation.x=Math.PI/2;g.add(cap);
  }
  return g;
}
export function pianoKeys(n = 8) {
  const g=new THREE.Group(),keys=[];
  const colors=[0xe65344,0xe99543,0xf0c54b,0x67a65a,0x48a3a1,0x518bc0,0x7772b8,0xb95b9e];
  for(let i=0;i<n;i++){
    const x=i*7-(n-1)*3.5;
    g.add(ink(box(6,2.6,6,MAT.plastic,x,1.3,0)));
    g.add(ink(box(5.6,.3,5.6,MAT.metal,x,2.75,0)));
    const k=ink(cyl(2.15,2.15,2,new THREE.MeshStandardMaterial({color:colors[i%8],roughness:.4}),x,3.8,0,24));g.add(k);keys.push(k);
    for(const z of[-3.3,3.3])g.add(box(.65,2,1.5,MAT.pinMetal,x,0,z));
  }
  const rail=cyl(.4,.4,n*7,MAT.plastic,0,-.6,4.4,6);rail.rotation.z=Math.PI/2;g.add(rail);
  g.userData.keys=keys;
  g.userData.press=(i,on)=>keys.forEach((k,j)=>k.position.y=j===i&&on?3:3.8);
  return g;
}
