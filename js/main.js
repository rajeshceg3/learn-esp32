import {validateOriginal,downloadRecovery,installRestoreUI} from './persistence.js';
import {PARKING_SAMPLES,parkingFrame,parkingCopy} from './parking-learning.js';
// Learn ESP32 - app shell. Original code.
// Build: grid-nav-pointer-20261104
import * as THREE from 'three';
import { buildBoard, BOARD, MAT, box, cyl } from './scene.js';
import * as C from './components.js';
import { SCENES, BOARD_POS, BB_POS, setLessonLayout } from './scenes.js';
import { LESSONS, BOARD_SPECS } from './lessons.js';
import { BUTTON_SIM_HELP, LANGS, T, applyLang, currentLang, setLocaleData, trLesson, trTag, trTagDesc, trCompName, trCompDesc } from './i18n.js';
import { translateRuntime } from './runtime-i18n.js';
import { createSchematicPanel } from './schematic.js';
import { LearningSteps } from './learning-steps.js';
import {plantFrame,PLANT_SAMPLES} from './plant-learning.js';
import {FORCE_COPY,forceStage} from './force-learning.js';

const $ = s => document.querySelector(s);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const state = {
  lesson: 0, tab: 'overview', running: false, sim: null, scene: null,
  settings: { labels: true, flow: true, grid: true, turntable: false, sound: true, reduceMotion: false, schematic: false, lang: 'en' },
  consoleHeight:null,done: new Set(), sheet: null, startedAt: 0, timing: [500, 500], logs: [], activeLine: 0,
};
let recoveryBlocked=false;
try {const prior=validateOriginal(localStorage);Object.assign(state.settings,prior.settings);prior.done.forEach(i=>state.done.add(i))}catch {recoveryBlocked=true}
const saveSettings=()=>{if(recoveryBlocked)return;try{localStorage.setItem('esp32:settings',JSON.stringify(state.settings));localStorage.setItem('esp32:done',JSON.stringify([...state.done]))}catch{}};
if (matchMedia('(prefers-reduced-motion: reduce)').matches && localStorage.getItem('esp32:settings') === null) state.settings.reduceMotion = true;

// ---------- renderer ----------
const canvas = $('#stage');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();
scene.background = null; // let the independent drafting grid show behind the transparent scene
const camera = new THREE.PerspectiveCamera(30, 1, 1, 2000);

const hemi = new THREE.HemisphereLight(0xfff4e0, 0xcbb894, 1.05); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff0dd, 2.1);
sun.position.set(60, 120, 80); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -120; sun.shadow.camera.right = 120; sun.shadow.camera.top = 120; sun.shadow.camera.bottom = -120;
sun.shadow.radius = 5; scene.add(sun);
const fill = new THREE.DirectionalLight(0xdfe8ff, .55); fill.position.set(-80, 60, -60); scene.add(fill);

// ground: soft shadow catcher + optional grid
const ground = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), new THREE.ShadowMaterial({ opacity: .14 }));
ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
const grid = new THREE.GridHelper(600, 60, 0xd8c5a8, 0xe3d3ba);
grid.visible = false; // screen-space grid stays legible through camera changes

// ---------- teaching camera table (one entry per lesson, shared by first load and Reset) ----------
// az/pol: viewing angle (radians; pol is measured from straight down). fill: distance multiplier after the
// silhouette fit (below 1 is closer). focus: 0..1 pull of the target toward the lesson's own parts.
// d = desktop (>=1024px), p = phone. Each angle is chosen so the part being taught is not hidden behind another.
const TEACH_CAM=[
  {d:{az:1.0,pol:1.07,fill:.9,focus:0},p:{az:1.0,pol:1.07,fill:.95,focus:0}},      // 1 board hero
  {d:{az:.55,pol:.85,fill:.66,focus:.35},p:{az:.6,pol:.6,fill:.9,focus:.3}},       // 2 LED and resistor on the rail
  {d:{az:.45,pol:.8,fill:.66,focus:.35},p:{az:.5,pol:.6,fill:.9,focus:.3}},        // 3 button
  {d:{az:.7,pol:.85,fill:.66,focus:.35},p:{az:1.0,pol:.6,fill:.9,focus:.3}},       // 4 knob
  {d:{az:.55,pol:.85,fill:.66,focus:.35},p:{az:.6,pol:.6,fill:.9,focus:.3}},       // 5 RGB
  {d:{az:.6,pol:.85,fill:.66,focus:.35},p:{az:.6,pol:.6,fill:.9,focus:.3}},        // 6 light sensor
  {d:{az:.5,pol:.85,fill:.66,focus:.4},p:{az:.55,pol:.62,fill:.92,focus:.3}},      // 7 distance sensor and car
  {d:{az:.6,pol:.85,fill:.66,focus:.35},p:{az:.6,pol:.6,fill:.9,focus:.3}},        // 8 buzzer
  {d:{az:.5,pol:.8,fill:.66,focus:.3},p:{az:.55,pol:.6,fill:.92,focus:.25}},       // 9 piano keys
  {d:{az:.7,pol:.85,fill:.66,focus:.4},p:{az:.7,pol:.62,fill:.9,focus:.3}},        // 10 motor
  {d:{az:.65,pol:.85,fill:.66,focus:.4},p:{az:.65,pol:.62,fill:.92,focus:.3}},     // 11 heat
  {d:{az:.65,pol:.85,fill:.66,focus:.4},p:{az:.65,pol:.62,fill:.92,focus:.3}},     // 12 servo
  {d:{az:.65,pol:.88,fill:.66,focus:.4},p:{az:.65,pol:.64,fill:.92,focus:.3}},     // 13 stepper wheel
  {d:{az:.65,pol:.88,fill:.66,focus:.4},p:{az:.65,pol:.64,fill:.92,focus:.3}},     // 14 plant
  {d:{az:.65,pol:.9,fill:.66,focus:.3},p:{az:.65,pol:.65,fill:.92,focus:.25}},     // 15 force
  {d:{az:.65,pol:.9,fill:.9,focus:.25},p:{az:.65,pol:.65,fill:.94,focus:.2}},      // 16 parking project
];
function teachCam(i){const t=TEACH_CAM[i]||TEACH_CAM[1];return innerWidth<1024?t.p:t.d}
function applyTeachCamAngles(i){const c=teachCam(i);rig.tAz=c.az;rig.tPol=c.pol}
// ---------- camera rig ----------
const rig = { target: new THREE.Vector3(6, 6, 6), az: 1.0, pol: 1.07, dist: 210, tAz: 1.0, tPol: 1.07, tDist: 210, tTarget: new THREE.Vector3(6, 6, 6) };
let boardFitBounds=null,boardFitKey=null,fitPts=null;
function keepBoardInView(){
  if(![0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].includes(state.lesson))return;
  const key=[rig.tAz,rig.tPol,rig.tDist,...rig.tTarget.toArray(),canvas.clientWidth,canvas.clientHeight].join(',');if(key===boardFitKey)return;
  if(!boardFitBounds){board.group.updateWorldMatrix(true,true);boardFitBounds=new THREE.Box3().setFromObject(board.group);if([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].includes(state.lesson)){boardFitBounds.union(new THREE.Box3().setFromObject(bboard));boardFitBounds.union(new THREE.Box3().setFromObject(lessonGroup));for(const p of cur.scene?.framingPoints||[])boardFitBounds.expandByPoint(p);}}
  const bounds=boardFitBounds,center=bounds.getCenter(new THREE.Vector3());
  rig.tTarget.x=THREE.MathUtils.clamp(rig.tTarget.x,center.x-14,center.x+14);
  rig.tTarget.z=THREE.MathUtils.clamp(rig.tTarget.z,center.z-14,center.z+14);
  const width=canvas.clientWidth||1,height=canvas.clientHeight||1;camera.aspect=width/height;camera.updateProjectionMatrix();
  const probe=camera.clone();
  let distance=rig.tDist;
  for(let i=0;i<5;i++){
    probe.position.set(rig.tTarget.x+distance*Math.sin(rig.tPol)*Math.sin(rig.tAz),rig.tTarget.y+distance*Math.cos(rig.tPol),rig.tTarget.z+distance*Math.sin(rig.tPol)*Math.cos(rig.tAz));probe.lookAt(rig.tTarget);probe.updateMatrixWorld(true);
    let need=1;if(fitPts&&fitPts.length){const v=new THREE.Vector3();for(const p of fitPts){v.copy(p).project(probe);need=Math.max(need,Math.abs(v.x)/.9,Math.abs(v.y)/.9);}}else for(const x of[bounds.min.x,bounds.max.x])for(const y of[bounds.min.y,bounds.max.y])for(const z of[bounds.min.z,bounds.max.z]){const v=new THREE.Vector3(x,y,z).project(probe);need=Math.max(need,Math.abs(v.x)/.9,Math.abs(v.y)/.9);}
    if(need<=1.005)break;distance*=need*1.015;
  }
  rig.tDist=distance;boardFitKey=[rig.tAz,rig.tPol,rig.tDist,...rig.tTarget.toArray(),canvas.clientWidth,canvas.clientHeight].join(',');
}
function applyCam(dt) {
  keepBoardInView();
  const k = state.settings.reduceMotion ? 1 : 1 - Math.exp(-dt * 9);
  rig.az += (rig.tAz - rig.az) * k; rig.pol += (rig.tPol - rig.pol) * k; rig.dist += (rig.tDist - rig.dist) * k;
  rig.target.lerp(rig.tTarget, k);
  camera.position.set(
    rig.target.x + rig.dist * Math.sin(rig.pol) * Math.sin(rig.az),
    rig.target.y + rig.dist * Math.cos(rig.pol),
    rig.target.z + rig.dist * Math.sin(rig.pol) * Math.cos(rig.az));
  camera.lookAt(rig.target);
}

// pointer controls: drag pans, wheel zooms, Q/E rotate
let drag = null;
let heldPianoPointer = null, objectDrag = null, heldScenePointer = null;
const objectDragPlane = new THREE.Plane(new THREE.Vector3(0,1,0),0);
function sceneGroundPoint(e){ const r=canvas.getBoundingClientRect();mouseV.set(((e.clientX-r.left)/r.width)*2-1,-((e.clientY-r.top)/r.height)*2+1);ray.setFromCamera(mouseV,camera);return ray.ray.intersectPlane(objectDragPlane,new THREE.Vector3()); }
function releaseScenePointer(){if(heldScenePointer!==null)cur.scene?.holdEnd?.(api);heldScenePointer=null;}
let pianoOwner=null;
function releasePianoPointer(owner) { if(owner!==undefined&&pianoOwner!==owner)return; if(pianoOwner!==null||heldPianoPointer!==null)cur.sim?.release?.();pianoOwner=null;heldPianoPointer=null;document.querySelectorAll('[data-piano-note]').forEach(b=>b.setAttribute('aria-pressed','false')); }
function beginPiano(owner,i){if(!state.running)return;releasePianoPointer();pianoOwner=owner;cur.sim?.note?.(i,true);document.querySelectorAll('[data-piano-note]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.pianoNote===i)));}
canvas.addEventListener('pointerdown', e => {
  if (e.button !== 0) return;
  if (state.running && cur.scene?.pickKey) {
    const i = pianoKeyAt(e);
    if (i >= 0) { beginPiano(`canvas:${e.pointerId}`,i); heldPianoPointer = e.pointerId; canvas.setPointerCapture(e.pointerId); e.preventDefault(); return; }
  }
  sceneGroundPoint(e);
  if(state.running&&cur.scene?.holdStart?.(ray,api,e)){heldScenePointer=e.pointerId;canvas.setPointerCapture(e.pointerId);e.preventDefault();return;}
  if (cur.scene?.beginDrag && cur.scene.beginDrag(ray, e, canvas, camera)) { const pt=sceneGroundPoint(e); objectDrag={id:e.pointerId,start:pt,x:e.clientX,y:e.clientY,moved:0};canvas.setPointerCapture(e.pointerId);e.preventDefault();return; }
  drag = { x: e.clientX, y: e.clientY, tx: rig.tTarget.x, tz: rig.tTarget.z, moved: 0 }; canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', e => {
  if(heldScenePointer===e.pointerId){cur.scene?.holdMove?.(e,api);return;}
  if(objectDrag?.id===e.pointerId){const pt=sceneGroundPoint(e);objectDrag.moved=Math.hypot(e.clientX-objectDrag.x,e.clientY-objectDrag.y);if(pt&&objectDrag.start)cur.scene.dragTo?.(pt.clone().sub(objectDrag.start),api);return;}
  if (drag) {
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag.moved += Math.abs(dx) + Math.abs(dy);
    const s = rig.dist / 700;
    const ca = Math.cos(rig.az), sa = Math.sin(rig.az);
    rig.tTarget.x = drag.tx - (dx * ca - dy * sa) * s;
    rig.tTarget.z = drag.tz - (-dx * sa - dy * ca) * s;
    idle.t = 0;
  }
});
canvas.addEventListener('pointerup', e => { if(heldScenePointer===e.pointerId){releaseScenePointer();return;} if(objectDrag?.id===e.pointerId){if(objectDrag.moved<6)pickAt(e);objectDrag=null;return;} if(heldPianoPointer===e.pointerId){releasePianoPointer();releaseScenePointer();objectDrag=null;drag=null;return;} if (drag && drag.moved < 6) pickAt(e); drag = null; });
canvas.addEventListener('wheel', e => { e.preventDefault(); rig.tDist = Math.min(420, Math.max(90, rig.tDist * (1 + Math.sign(e.deltaY) * .09))); keepBoardInView();idle.t = 0; }, { passive: false });
canvas.addEventListener('pointercancel',e=>{releasePianoPointer(`canvas:${e.pointerId}`);releaseScenePointer();objectDrag=null;drag=null;});
canvas.addEventListener('lostpointercapture',e=>{releasePianoPointer(`canvas:${e.pointerId}`);releaseScenePointer();objectDrag=null;});
addEventListener('blur',()=>{releasePianoPointer();releaseScenePointer();if([13,14].includes(state.lesson))cur.scene?.holdEnd?.(api);});
addEventListener('keydown', e => {
  if(e.target?.closest('input,textarea,select,[contenteditable=true]'))return;
  const key=e.key.toLowerCase();
  if(key==='c'&&!e.target?.closest('button,[role=button]')){state.settings.schematic=!state.settings.schematic;saveSettings();applySettings();return;}
  if(key===' '&&!e.target?.closest('button,[role=button]')){e.preventDefault();state.running?stopSim():startSim();return;}
  if(key==='q'){rig.tAz+=.3;idle.t=0;}
  if(key==='e'){rig.tAz-=.3;idle.t=0;}
  if(['w','a','s','d'].includes(key)){
    const dx=key==='a'?-12:key==='d'?12:0,dy=key==='w'?-12:key==='s'?12:0;
    const sc=rig.dist/700,ca=Math.cos(rig.az),sa=Math.sin(rig.az);
    rig.tTarget.x-=(dx*ca-dy*sa)*sc;rig.tTarget.z-=(-dx*sa-dy*ca)*sc;idle.t=0;e.preventDefault();
  }
});

// ---------- board + lesson scene ----------
const board = buildBoard(); board.group.position.copy(BOARD_POS); scene.add(board.group);
let bboard = C.breadboard(); bboard.position.copy(BB_POS); scene.add(bboard);
// Keep two owned meshes rather than rebuilding textures on every lesson switch.
const breadboardViews={24:bboard};
const lessonGroup = new THREE.Group(); scene.add(lessonGroup);

const ray = new THREE.Raycaster(); const mouseV = new THREE.Vector2();
let hoverPart = null;

// audio
let actx = null, osc = null, og = null;
function tone(f) {
  if (!state.settings.sound) f = 0;
  if (!f) { if (osc) { try { osc.stop(); } catch {} osc = null; } return; }
  if (!actx) { actx = new (window.AudioContext || window.webkitAudioContext)(); og = actx.createGain(); og.gain.value = .05; og.connect(actx.destination); }
  if (!osc) { osc = actx.createOscillator(); osc.type = 'square'; osc.connect(og); osc.start(); }
  osc.frequency.value = f;
}

// api shared with sims
const api = {
  serial: t => log(translateRuntime(t,currentLang())), tone,
  setBuiltin: on => { board.builtinLed.material = on ? new THREE.MeshStandardMaterial({ color: 0x5aa0ec, emissive: 0x2a6ae0, emissiveIntensity: 1.8 }) : MAT.blueLed; },
  line: n => {
    state.activeLine = n;
    document.querySelectorAll('#panelBody .code-line').forEach((el, i) => {
      const active = i + 1 === n; el.classList.toggle('active', active);
      if (active) { const pre = el.closest('.code-pre'); if (pre && (el.offsetTop < pre.scrollTop || el.offsetTop + el.offsetHeight > pre.scrollTop + pre.clientHeight)) pre.scrollTop = el.offsetTop - pre.clientHeight / 2; }
    });
  },
  tag: t => { const el = $('#runTag'); if (!el) return; if (t) { el.textContent = trTag(t); el.style.display = 'flex'; } else el.style.display = 'none'; },
  // schematic pin values ride on flow() calls below
  flow: (net, on) => { if (!state.settings.flow) on = false;
    cur.scene?.wires.forEach(w => { if (w.net === net) w.dot.visible = !!on; });
    if (schPanel.isOpen) schPanel.pin(netLabel(net), on ? 'HIGH' : ''); },
};
const apiBase = { ...api };
let cur = { scene: null, sim: null };

// ---------- schematic panel ----------
const netLabel = n => /^D\d+$/.test(n) ? 'GPIO' + n.slice(1) : n;
const schPanel = createSchematicPanel(document.getElementById('schematic'), {
  onClose: () => { state.settings.schematic = false; saveSettings(); applySettings(); },
  strings: { get title() { return T('schematic'); }, get none() { return T('schematic_none'); } },
});

// ---------- tags ----------
const tagsEl = $('#tags');
const leadersEl = $('#leaders');
let tagDivs = [], wireDivs = [];
const boardPartMarker=new THREE.Mesh(new THREE.SphereGeometry(.7,16,12),new THREE.MeshBasicMaterial({color:0x00aaa0}));boardPartMarker.visible=false;scene.add(boardPartMarker);
const boardDock=document.createElement('nav');boardDock.id='boardAnnotationDock';boardDock.setAttribute('aria-label','Board parts');boardDock.hidden=true;$('#stageWrap').append(boardDock);
function rebuildTags() {
  $('#stageWrap > #runTag')?.remove();tagsEl.innerHTML = ''; boardPartMarker.visible=false;boardDock.replaceChildren();$('#circuitReadouts')?.remove();tagDivs = []; wireDivs = [];
  $('#stageWrap').classList.toggle('board-intro',state.lesson===0);
  $('#stageWrap').classList.toggle('blink-docked',state.lesson===1);
  $('#stageWrap').classList.toggle('distance-docked',state.lesson===6);
  $('#stageWrap').classList.toggle('motor-docked',state.lesson===9);
  $('#stageWrap').classList.toggle('thermal-docked',state.lesson===10);
  $('#stageWrap').classList.toggle('servo-docked',state.lesson===11);
  $('#stageWrap').classList.toggle('wheel-docked',state.lesson===12);
  $('#stageWrap').classList.toggle('plant-docked',state.lesson===13);
  $('#stageWrap').classList.toggle('force-docked',state.lesson===14);
  $('#stageWrap').classList.toggle('parking-docked',state.lesson===15);
  $('#stageWrap').classList.toggle('piano-docked',state.lesson===8);$('#pianoNoteDock')?.remove();
  $('#stageWrap').classList.toggle('functional-docked',[2,3,4,5,6,7,8,9,10,11,12,13,14,15].includes(state.lesson));
  boardDock.hidden=![0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].includes(state.lesson)||!state.settings.labels;
  for(const el of[canvas,boardDock,tagsEl,$('#stageWrap .toolbar')])if(el)el.inert=state.lesson===15&&!!state.settings.schematic;
  leadersEl.innerHTML = '';
  if (typeof partTag !== 'undefined') tagsEl.appendChild(partTag); // hover label survives rebuilds
  const rt = document.createElement('div'); rt.className = 'tag mini live'; rt.id = 'runTag'; rt.style.display = 'none';
  (state.lesson===1?$('#stageWrap'):tagsEl).appendChild(rt);
  if(state.lesson===8){
    const keys=document.createElement('div');keys.id='pianoNoteDock';keys.setAttribute('aria-label','Piano notes - Run, then hold to play');keys.lang='en';
    ['C4','D4','E4','F4','G4','A4','B4','C5'].forEach((note,i)=>{const b=document.createElement('button');b.type='button';b.dataset.pianoNote=i;b.textContent=note;b.setAttribute('aria-label',`${note}, ${[262,294,330,349,392,440,494,523][i]} Hz - hold to play`);b.setAttribute('aria-pressed','false');
      b.addEventListener('pointerdown',e=>{if(e.button!==0||!state.running)return;e.preventDefault();b.setPointerCapture(e.pointerId);beginPiano(`dock:${e.pointerId}`,i);});
      for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,e=>releasePianoPointer(`dock:${e.pointerId}`));
      b.addEventListener('keydown',e=>{if([' ','Enter'].includes(e.key)){e.preventDefault();if(!e.repeat)beginPiano(`key:${i}:${e.key}`,i);}});
      b.addEventListener('keyup',e=>{if([' ','Enter'].includes(e.key)){e.preventDefault();releasePianoPointer(`key:${i}:${e.key}`);}});
      b.addEventListener('blur',()=>{if(pianoOwner?.startsWith(`key:${i}:`))releasePianoPointer();});keys.append(b);
    });$('#stageWrap').append(keys);
  }
  if (!state.settings.labels) return;
  const list = cur.scene?.tags || [];
  list.forEach(t => {
    const dot = document.createElement('span'); dot.className = 'tag-dot'; tagsEl.appendChild(dot);
    const d = document.createElement('button'); d.className = 'tag';
    d.innerHTML = `<span class="tag-ic">${ICON[t.i || 'pins']}</span><span class="tag-tx"><b>${trTag(t.label)}</b>${t.d ? `<i>${trTagDesc(t.label, t.d)}</i>` : ''}</span>`;
    if(t.drag){
      d.style.touchAction='none';let startX=null,moved=false;
      d.addEventListener('pointerdown',e=>{e.preventDefault();startX=e.clientX;moved=false;d.setPointerCapture(e.pointerId);cur.scene.tagDragStart?.(api);});
      d.addEventListener('pointermove',e=>{if(startX===null)return;const dx=e.clientX-startX;if(Math.abs(dx)>5)moved=true;if(moved)cur.scene.tagDrag?.(dx,api);});
      d.addEventListener('pointerup',()=>{if(startX!==null&&!moved)cur.scene.onClick?.(t.click,api);startX=null;});
      d.addEventListener('pointercancel',()=>{startX=null;});d.addEventListener('lostpointercapture',()=>{startX=null;});
      d.addEventListener('click',e=>{if(e.detail===0)cur.scene.onClick?.(t.click,api);});
    } else if (t.hold) {
      d.style.touchAction='none';
      d.addEventListener('pointerdown',e=>{if(!state.running)return;e.preventDefault();d.setPointerCapture(e.pointerId);cur.scene.tagHold?.(t.click,true,api,e);});
      d.addEventListener('pointermove',e=>{if(d.hasPointerCapture(e.pointerId))cur.scene.holdMove?.(e,api);});
      const end=()=>cur.scene.tagHold?.(t.click,false,api);
      d.addEventListener('pointerup',end);d.addEventListener('pointercancel',end);d.addEventListener('lostpointercapture',end);d.addEventListener('blur',end);
      d.addEventListener('keydown',e=>{if([' ','Enter'].includes(e.key)&&!e.repeat&&state.running){e.preventDefault();cur.scene.tagHold?.(t.click,true,api);}});
      d.addEventListener('keyup',e=>{if([' ','Enter'].includes(e.key)){e.preventDefault();end();}});
      if(state.lesson===14)d.addEventListener('keydown',e=>{if(api._pressing&&['ArrowDown','ArrowUp'].includes(e.key)){e.preventDefault();api._pressureTarget=Math.max(.05,Math.min(1,api._pressureTarget+(e.key==='ArrowDown'?.1:-.1)));}});
    } else if (t.click) d.addEventListener('click', () => {const inspector=cur.scene.inspect?.(t.click);if(inspector)openSheet(inspector,null,d);else cur.scene.onClick?.(t.click, api);});
    if(state.lesson===0){
      d.classList.add('board-part-button');
      d.setAttribute('aria-label',trTag(t.label));
      if(t.label==='MICROCONTROLLER'){
        const prefix={en:'MICRO',de:'MIKRO',es:'MICRO',pt:'MICRO',fr:'MICRO',it:'MICRO',tr:'MİKRO',id:'MIKRO',hi:'माइक्रो',ko:'마이크로'}[currentLang()];
        const label=trTag(t.label),text=d.querySelector('b');
        if(prefix&&label.startsWith(prefix)){text.replaceChildren(document.createTextNode(prefix),document.createElement('wbr'),document.createTextNode(label.slice(prefix.length)));text.classList.add('word-parts');}
      }
      boardDock.append(d);
      d.addEventListener('click',()=>{boardDock.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b===d)));const partId={'USB PORT':'usb','MICROCONTROLLER':'module','EN · BOOT':'en','BUILT-IN LED':'bled'}[t.label],part=board.parts[partId];if(part){const bounds=new THREE.Box3().setFromObject(part);bounds.getCenter(boardPartMarker.position);boardPartMarker.position.y=bounds.max.y+.7;}else boardPartMarker.position.copy(t.at);boardPartMarker.visible=true;openSheet('component',{title:trTag(t.label),desc:state.lesson===2?(BUTTON_SIM_HELP[currentLang()]||BUTTON_SIM_HELP.en):trTagDesc(t.label,t.d)},d);});
    }else if([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].includes(state.lesson)){
      d.classList.add('board-part-button');d.setAttribute('aria-label',trTag(t.label));d.setAttribute('aria-description',trTagDesc(t.label,t.d));d.title=trTagDesc(t.label,t.d);boardDock.append(d);
      d.addEventListener('click',()=>{boardDock.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b===d)));const part=cur.scene.refs[t.click||({'LED':'led'}[t.label])];if(part){const bounds=new THREE.Box3().setFromObject(part);bounds.getCenter(boardPartMarker.position);boardPartMarker.position.y=bounds.max.y+.7;}else boardPartMarker.position.copy(t.at);boardPartMarker.visible=true;if(!t.click)openSheet('component',{title:trTag(t.label),desc:state.lesson===2?(BUTTON_SIM_HELP[currentLang()]||BUTTON_SIM_HELP.en):trTagDesc(t.label,t.d)},d);});
    }else tagsEl.appendChild(d);
    const ln = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    leadersEl.appendChild(ln);
    tagDivs.push({ d, t, dot, ln });
  });
  const wireDock=document.createElement('div');wireDock.id='circuitReadouts';wireDock.setAttribute('aria-label','Circuit wire readings');if(state.lesson===3)$('#stageWrap').append(wireDock);
  (cur.scene?.wires||[]).filter(w=>w.badge).forEach(w=>{
    const d=document.createElement('span');d.className='wire-badge';d.dir='ltr';
    d.style.setProperty('--wire-color',w.badge.color);(state.lesson===3?wireDock:tagsEl).appendChild(d);
    const ln=document.createElementNS('http://www.w3.org/2000/svg','line');
    ln.classList.add('wire-leader');ln.style.stroke=w.badge.color;leadersEl.appendChild(ln);
    wireDivs.push({w,d,ln});
  });
}
function placeTags() {
  const r = canvas.getBoundingClientRect();
  const v = new THREE.Vector3();
  const wide = r.width >= 700; // desktop: cards offset to the side; mobile: pill above anchor
  tagDivs.forEach(({ d, t, dot, ln }) => {
    if([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].includes(state.lesson)){if(t.value){const value=t.value(),label=d.querySelector('b');label.dir='ltr';label.style.unicodeBidi='isolate';if(label.textContent!==value){label.textContent=value;d.setAttribute('aria-label',value);}}if(state.lesson===2&&t.click==='button')d.setAttribute('aria-pressed',String(!!api._pressed));if(state.lesson===13&&t.hold)d.setAttribute('aria-pressed',String(!!api._watering));if(state.lesson===14&&t.hold)d.setAttribute('aria-pressed',String(!!api._pressing));d.style.display='flex';dot.style.display='none';ln.style.display='none';return;}
    if(t.value){const value=t.value(),label=d.querySelector('b');if(label){label.dir='ltr';label.style.unicodeBidi='isolate';if(label.textContent!==value)label.textContent=value;}}
    if (t.dyn && cur.scene?.refs?.[t.dyn]) { cur.scene.refs[t.dyn].getWorldPosition(v); v.y += 8; }
    else v.copy(t.at);
    v.project(camera);
    const ax = (v.x * .5 + .5) * r.width, ay = (-v.y * .5 + .5) * r.height;
    const ok = v.z < 1 && ax > -40 && ax < r.width + 40 && ay > -20 && ay < r.height + 20;
    d.style.display = ok ? 'flex' : 'none';
    dot.style.display = ok ? 'block' : 'none';
    ln.style.display = ok ? '' : 'none';
    if (!ok) return;
    d._ax = ax; d._ay = ay;
    dot.style.left = ax + 'px'; dot.style.top = ay + 'px';
    const w = d.offsetWidth, h = d.offsetHeight;
    let cx, cy;
    if (wide) {
      cx = ax + (ax < r.width * .52 ? -(w / 2 + 32) : (w / 2 + 32));
      cy = ay - h / 2 - 80;
      if (t.label === 'RESISTOR') { cx=r.width*.86;cy=r.height*.83; }
      else if(t.label==='LED') { cx=r.width*.83;cy=r.height*.21; }
      else if(t.label==='GND') { cx=r.width*.15;cy=r.height*.20; }
      else if(t.label==='GPIO26') { cx=r.width*.48;cy=r.height*.17; }
      if(state.lesson===0){
        const p={'USB PORT':[.16,.20],'MICROCONTROLLER':[.50,.17],'GPIO PINS':[.82,.23],'EN · BOOT':[.16,.74],'BUILT-IN LED':[.50,.80],'ADC PINS':[.83,.76]}[t.label];
        if(p){cx=r.width*p[0];cy=r.height*p[1]}
      }
      if(state.lesson===8){
        const p={'8 KEYS - HOLD TO PLAY':[.83,.81],'BUZZER':[.83,.19],'KEY INPUTS':[.18,.81],'GND RAIL':[.49,.19]}[t.label];
        if(p){cx=r.width*p[0];cy=r.height*p[1]}
      }
      if(state.lesson===13){
        const p={'SOIL · GPIO34':[.17,.23],'I²C · 21/22':[.45,.17],'OLED':[.7,.22],'PLANT':[.51,.82],'WATER':[.84,.82]}[t.label];
        if(p){cx=r.width*p[0];cy=r.height*p[1]}
      }
      if (cy - h / 2 < 8) cy = ay + h / 2 + 40;
    } else {
      // Attach a large pin marker to the physical part, with its compact label beside it.
      const right = ax + w + 14 < r.width - 6;
      cx = ax + (right ? 1 : -1) * (w / 2 + 10); cy = ay - 1;
      if(state.lesson===1 && t.label==='RESISTOR'){cx=ax;cy=ay+42;}
      if(state.lesson===8){
        const p={'KEY INPUTS':[.23,.34],'BUZZER':[.77,.34],'GND RAIL':[.23,.65],'8 KEYS - HOLD TO PLAY':[.7,.76]}[t.label];
        if(p){cx=r.width*p[0];cy=r.height*p[1]}
      }
    }
    if(innerWidth>=1024&&LESSONS[state.lesson]?.id==='motor'){
      const p=(wide?{'GPIO27 · PWM':[.17,.20],'2N2222':[.50,.18],'MOTOR':[.83,.30]}:{'GPIO27 · PWM':[.22,.16],'2N2222':[.65,.30],'MOTOR':[.78,.49]})[t.label];
      if(p){cx=r.width*p[0];cy=r.height*p[1]}
    }
    if(innerWidth>=1024&&!wide&&LESSONS[state.lesson]?.id==='stepper'){
      const p={'COILS · 14·27·26·25':[.22,.16],'BUTTON':[.76,.20],'STEPPER':[.76,.76]}[t.label];
      if(p){cx=r.width*p[0];cy=r.height*p[1]}
    }
    if(innerWidth<1024&&LESSONS[state.lesson]?.id==='project'){
      const p={'HC-SR04':[.25,.20],'TRAFFIC LIGHT':[.75,.20],'CAR':[.78,.69]}[t.label];
      if(p){cx=r.width*p[0];cy=r.height*p[1]}
    }
    if(innerWidth>=1024&&LESSONS[state.lesson]?.id==='project'){
      const p={'HC-SR04':[.37,.17],'TRAFFIC LIGHT':[.78,.24],'CAR':[.30,.79]}[t.label];
      if(p){cx=r.width*p[0];cy=r.height*p[1]}
    }
    if(innerWidth>=1024&&LESSONS[state.lesson]?.id==='force'){
      const p=(wide?{'STRENGTH':[.24,.12],'GPIO35 · ADC':[.20,.75],'PRESS PAD':[.78,.30]}:{'STRENGTH':[.32,.13],'GPIO35 · ADC':[.20,.76],'PRESS PAD':[.81,.27]})[t.label];
      if(p){cx=r.width*p[0];cy=r.height*p[1]}
    }
    if(innerWidth>=1024&&!wide&&isPlantGuide()){
      const p={'SOIL · GPIO34':[.2,.18],'I²C · 21/22':[.2,.74],'OLED':[.65,.18],'PLANT':[.45,.76],'WATER':[.82,.36]}[t.label];
      if(p){cx=r.width*p[0];cy=r.height*p[1]}
    }
    if(innerWidth<1024&&!wide&&state.lesson===13){
      const p={'SOIL · GPIO34':[.2,.34],'I²C · 21/22':[.2,.65],'OLED':[.6,.34],'PLANT':[.55,.65],'WATER':[.85,.65]}[t.label];
      if(p){cx=r.width*p[0];cy=r.height*p[1]}
    }
    if(innerWidth<1024&&state.lesson===14){
      if(t.label==='GPIO35 · ADC'){cx=r.width*(wide?.2:.25);cy=r.height*(wide?.68:.65);}
      if(!wide&&t.label==='PRESS PAD'){cx=r.width*.82;cy=r.height*.52;}
    }
    d._x = cx; d._y = cy;
  });
  // de-overlap: nudge colliding cards apart
  const vis = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].includes(state.lesson)?[]:tagDivs.map(o => o.d).filter(d => d.style.display !== 'none');
  for (let pass = 0; pass < 6; pass++) {
    let moved = false;
    for (let i = 0; i < vis.length; i++) for (let j = i + 1; j < vis.length; j++) {
      const a = vis[i], b = vis[j];
      const hw = (a.offsetWidth + b.offsetWidth) / 2 + 10, hh = (a.offsetHeight + b.offsetHeight) / 2 + 8;
      const dx = b._x - a._x, dy = b._y - a._y;
      if (Math.abs(dx) < hw && Math.abs(dy) < hh) {
        const push = (hh - Math.abs(dy)) / 2 + 1;
        a._y -= push * (dy >= 0 ? 1 : -1); b._y += push * (dy >= 0 ? 1 : -1);
        if (Math.abs(dx) < hw * .6) { const px = (hw - Math.abs(dx)) / 4 + 1; a._x -= px * (dx >= 0 ? 1 : -1); b._x += px * (dx >= 0 ? 1 : -1); }
        moved = true;
      }
    }
    if (!moved) break;
  }
  tagDivs.forEach(({ d, ln }) => {
    if([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].includes(state.lesson))return;
    if (d.style.display === 'none') return;
    d._x = Math.min(r.width - d.offsetWidth / 2 - 6, Math.max(d.offsetWidth / 2 + 6, d._x));
    d._y = Math.min(r.height - d.offsetHeight / 2 - 6, Math.max(d.offsetHeight / 2 + 6, d._y));
    d.style.left = d._x + 'px'; d.style.top = d._y + 'px';
    // dotted leader from anchor dot to the nearest point on the card edge
    const hw = d.offsetWidth / 2, hh = d.offsetHeight / 2;
    const ex = Math.min(d._x + hw, Math.max(d._x - hw, d._ax));
    const ey = Math.min(d._y + hh, Math.max(d._y - hh, d._ay));
    ln.setAttribute('x1', d._ax.toFixed(1)); ln.setAttribute('y1', d._ay.toFixed(1));
    ln.setAttribute('x2', ex.toFixed(1)); ln.setAttribute('y2', ey.toFixed(1));
  });
  // Wire badges share the projection but never the animated-dot visibility state.
  // Greedy placement keeps small-screen badges clear of component callouts.
  const occupied=vis.map(d=>({x:d._x,y:d._y,w:d.offsetWidth+8,h:d.offsetHeight+8}));
  wireDivs.forEach(({w,d,ln})=>{
    const value=w.badge.value();if(d.textContent!==value)d.textContent=value;
    if(state.lesson===1){d.style.display='none';ln.style.display='none';return;}
    if(state.lesson===3){d.style.display='inline-flex';ln.style.display='none';return;}
    const p=w.curve.getPoint(w.badge.fraction??.5).project(camera);
    const ax=(p.x*.5+.5)*r.width,ay=(-p.y*.5+.5)*r.height;
    const ok=p.z<1&&ax>0&&ax<r.width&&ay>0&&ay<r.height;
    d.style.display=ok?'block':'none';ln.style.display=ok?'':'none';if(!ok)return;
    const bw=d.offsetWidth,bh=d.offsetHeight,offset=w.badge.offset||[0,-20];
    let best=null;
    for(const dy of[0,-28,28,-56,56,-84,84])for(const dx of[0,-42,42,-84,84]){
      const x=Math.min(r.width-bw/2-7,Math.max(bw/2+7,ax+offset[0]+dx));
      const y=Math.min(r.height-bh/2-48,Math.max(bh/2+36,ay+offset[1]+dy));
      const hits=occupied.filter(b=>Math.abs(x-b.x)<(bw+b.w)/2&&Math.abs(y-b.y)<(bh+b.h)/2).length;
      const cost=hits*10000+Math.hypot(x-ax,y-ay);if(!best||cost<best.cost)best={x,y,cost};
    }
    const {x,y}=best;d.style.left=x+'px';d.style.top=y+'px';
    occupied.push({x,y,w:bw+8,h:bh+8});
    ln.setAttribute('x1',ax);ln.setAttribute('y1',ay);
    ln.setAttribute('x2',Math.min(x+bw/2,Math.max(x-bw/2,ax)));
    ln.setAttribute('y2',Math.min(y+bh/2,Math.max(y-bh/2,ay)));
  });
  const rt2 = $('#runTag');
  if(rt2&&state.lesson===1){rt2.style.left='12px';rt2.style.top='12px';rt2.style.transform='none';}
  if (state.lesson!==1 && rt2 && rt2.style.display !== 'none' && cur.scene?.wires?.length) {
    // anchor the run tag above the first signal wire's midpoint
    const w = cur.scene.wires.find(w => w.dot.visible) || cur.scene.wires[0];
    const p = w.curve.getPoint(.5).project(camera);
    rt2.style.left = ((p.x * .5 + .5) * r.width + 30) + 'px'; rt2.style.top = ((-p.y * .5 + .5) * r.height - 34) + 'px';
  }
}

// hover board parts
canvas.addEventListener('pointermove', e => {
  if (drag||objectDrag||heldScenePointer!==null||heldPianoPointer!==null) {hoverPart=null;$('#partTag').style.display='none';return;}
  const r = canvas.getBoundingClientRect();
  mouseV.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(mouseV, camera);
  const hits = ray.intersectObjects(Object.values(board.parts), false);
  const part = hits[0]?.object.userData.part;
  hoverPart = part || null;
  const hp = $('#partTag');
  if (part && state.settings.labels && ![0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].includes(state.lesson)) {
    hp.textContent = localizedPart(part).title; hp.style.display = 'flex';
    hp.style.left = (e.clientX - r.left) + 'px'; hp.style.top = (e.clientY - r.top - 34) + 'px';
  } else hp.style.display = 'none';
});

// Raycast the actual key geometry, shared by pointer-down and click fallback.
function pianoKeyAt(e) {
  const r = canvas.getBoundingClientRect();
  mouseV.set(((e.clientX-r.left)/r.width)*2-1,-((e.clientY-r.top)/r.height)*2+1);
  ray.setFromCamera(mouseV,camera);
  const hits=ray.intersectObject(cur.scene.refs.keys,true);
  return hits.length ? cur.scene.pickKey(hits[0].point) : -1;
}
// click: board part info or scene interactive
function pickAt(e) {
  const r = canvas.getBoundingClientRect();
  mouseV.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(mouseV, camera);
  // interactive scene meshes (tags handle their own clicks; piano keys need world point)
  if (cur.scene?.pickKey) {
    const hits = ray.intersectObject(cur.scene.refs.keys, true);
    if (hits.length) { const i = cur.scene.pickKey(hits[0].point); if (i >= 0) cur.sim?.note?.(i); return; }
  }
  if (cur.scene?.refs) {
    const meshes = Object.values(cur.scene.refs);
    const hits = ray.intersectObjects(meshes, true);
    if (hits.length) {
      let o = hits[0].object;
      while (o && !o.userData._clickId && o.parent) o = o.parent === cur.scene.root ? null : o.parent;
      const id = o?.userData?._clickId;
      if (id) {const inspector=cur.scene.inspect?.(id);if(inspector)openSheet(inspector,null,canvas);else cur.scene.onClick?.(id, api); return; }
    }
  }
  const hits = ray.intersectObjects(Object.values(board.parts), false);
  const part = hits[0]?.object.userData.part;
  if (part) openPartInfo(part);
}

// ---------- part info popover ----------
const partTag = document.createElement('div'); partTag.className = 'tag mini live'; partTag.id = 'partTag'; partTag.style.display = 'none'; partTag.style.pointerEvents = 'none';
tagsEl.appendChild(partTag);
function localizedPart(part) {
  if(part.id==='board')return {title:trLesson(LESSONS[0]).heading,desc:trLesson(LESSONS[0]).lede};
  const byId={module:'ESP32-WROOM-32',usb:'Micro-USB port',en:'EN button',boot:'BOOT button',uart:'USB-UART bridge',reg:'3.3 V regulator',bled:'Built-in LED',pled:'Power LED',gpioT:'GPIO pins',gpioB:'GPIO pins'};
  const descById={module:'The 240 MHz dual-core module that runs your code, with Wi-Fi and Bluetooth.',usb:'Uploads sketches and powers the board from your computer.',en:'Restarts your sketch from the top.',boot:'Hold while pressing EN to enter upload mode.',uart:'Turns USB into serial so your computer can talk to the chip.',reg:'Steps the 5 V USB supply down to a steady 3.3 V.',bled:'Wired to GPIO2 — blinks with LED_BUILTIN.',pled:'Lit whenever the board has power.',gpioT:'30 pins: digital in/out, analog in, touch, PWM, I²C, SPI.',gpioB:'30 pins: digital in/out, analog in, touch, PWM, I²C, SPI.'};
  return {title:trCompName(byId[part.id]||part.label),desc:trCompDesc(descById[part.id]||part.desc)};
}
function openPartInfo(part) { openSheet('component', localizedPart(part)); }


// The rendered jumper layout omits level-shifting parts. Say so at the scene,
// not only in lesson prose, and provide a direct path to the complete circuit.
const WIRING_CUE = {
 en:'Simplified scene: never wire 5V ECHO directly to GPIO18. Open circuit for the required divider.',
 es:'Escena simplificada: no conectes ECHO de 5V directo a GPIO18. Abre el circuito con el divisor.',
 pt:'Cena simplificada: não ligue ECHO de 5V direto ao GPIO18. Abra o circuito com o divisor.',
 fr:'Scène simplifiée : jamais ECHO 5V directement sur GPIO18. Ouvrir le circuit avec le diviseur.',
 de:'Vereinfachte Szene: 5V ECHO nie direkt an GPIO18. Schaltung mit Spannungsteiler öffnen.',
 it:'Scena semplificata: mai ECHO 5V diretto a GPIO18. Apri il circuito con il partitore.',
 tr:'Basit sahne: 5V ECHO doğrudan GPIO18’e bağlanmaz. Bölücülü devreyi aç.',
 id:'Adegan sederhana: jangan hubungkan ECHO 5V langsung ke GPIO18. Buka rangkaian pembagi.',
 zh:'简化场景：切勿将5V ECHO直接连接GPIO18。打开电路图查看必需的分压器。',
 'zh-tw':'簡化場景：切勿將5V ECHO直接連接GPIO18。開啟電路圖查看必要的分壓器。',
 ja:'簡略図です。5V ECHOをGPIO18に直結しないでください。分圧回路図を開く。',
 ko:'단순화된 장면: 5V ECHO를 GPIO18에 직접 연결하지 마세요. 분압 회로도 열기.',
 hi:'सरल दृश्य: 5V ECHO को सीधे GPIO18 से न जोड़ें। ज़रूरी विभाजक वाला सर्किट खोलें।',
 he:'תצוגה מפושטת: אין לחבר ECHO של 5V ישירות ל-GPIO18. פתחו מעגל עם מחלק מתח.'
};
function updateWiringCue(id=LESSONS[state.lesson].id) {
 const cue=$('#wiringCue');cue.hidden=!['distance','project'].includes(id)||!!state.settings.schematic;
 cue.textContent=WIRING_CUE[currentLang()]||WIRING_CUE.en;
}
$('#wiringCue').addEventListener('click',()=>{state.settings.schematic=true;saveSettings();applySettings();if(state.lesson===15)$('#schematic .sch-close').focus();});

// ---------- scene container ----------
class LessonScene {
  constructor() { this.root = new THREE.Group(); this.refs = {}; this.wires = []; this.tags = []; this.api = {}; this.tagParts = false; }
  add(mesh, id) { mesh.userData._clickId = id; this.refs[id] = mesh; this.root.add(mesh); }
}

function loadLesson(i, keepTab) {
  schPanel.setLesson(LESSONS[i].id, trLesson(LESSONS[i]).heading);
  updateWiringCue(LESSONS[i].id);
  $('#panel').classList.remove('open');
  $('#sheet').classList.remove('open');state.sheet=null;
  stopSim();
  blinkGuide.reset();
  state.lesson = i; state.timing = [500, 500]; state.logs = [];
  applyTeachCamAngles(i);
  clearComponentFocus();lessonGroup.clear();
  const ls = new LessonScene();
  const def = SCENES[LESSONS[i].sim];
  setLessonLayout(LESSONS[i].id);
  board.group.position.copy(BOARD_POS);
  const cols = ['blink','button','rgb','sound','light'].includes(LESSONS[i].id) ? 18 : 24;
  bboard.visible = false;
  if (!breadboardViews[cols]) {
    breadboardViews[cols] = C.breadboard(cols);
    scene.add(breadboardViews[cols]);
  }
  bboard = breadboardViews[cols];
  bboard.position.copy(BB_POS);
  bboard.visible = LESSONS[i].sim !== 'builtin';
  def.build(ls);
  lessonGroup.add(ls.root);
  ls.wires.forEach(w => lessonGroup.add(w.mesh));
  // reset shared api to base, then merge scene-specific api; sims get the merged surface
  for (const k of Object.keys(api)) if (!(k in apiBase)) delete api[k];
  Object.assign(api, apiBase, ls.api);
  cur.scene = ls; cur.sim = def.sim(api);
  rebuildTags(); if (!keepTab) state.tab = 'overview';
  renderRail(); renderPanel();
  // camera: fit board + breadboard
  frameScene();
  document.querySelectorAll('.lesson-card').forEach((c, j) => c.classList.toggle('on', j === i));
}

function frameScene(snap) {
  boardFitBounds=null;boardFitKey=null;
  const box = new THREE.Box3().setFromObject(board.group)
    .union(new THREE.Box3().setFromObject(lessonGroup));
  if (bboard.visible) box.union(new THREE.Box3().setFromObject(bboard));
  for(const point of cur.scene?.framingPoints||[])box.expandByPoint(point);
  if (box.isEmpty()) return;
  const c = box.getCenter(new THREE.Vector3());
  const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1, aspect = w / h;
  rig.tTarget.set(c.x, aspect < 1 ? c.y * .9 : Math.max(2, c.y * .55), c.z);
  const tc=teachCam(state.lesson);
  if(tc.focus&&lessonGroup.children.length){const lb=new THREE.Box3().setFromObject(lessonGroup);if(!lb.isEmpty()){const lc=lb.getCenter(new THREE.Vector3());rig.tTarget.x+=(lc.x-c.x)*tc.focus;rig.tTarget.z+=(lc.z-c.z)*tc.focus;}}
  // Projective fit: place a probe camera, project every box corner to NDC,
  // grow distance until the full silhouette clears the viewport minus room
  // reserved for callout pills at the edges. Verified in pixels, not approximated.
  // true silhouette bounds: sample world-space vertices of every visible mesh
  const pts = (cur.scene?.framingPoints||[]).map(p=>p.clone());
  const tv = new THREE.Vector3();
  for (const root of (bboard.visible ? [board.group, bboard, lessonGroup] : [board.group, lessonGroup])) {
    root.updateWorldMatrix(true, true);
    root.traverse(o => {
      if (!o.isMesh || !o.visible || !o.geometry?.attributes?.position) return;
      const pos = o.geometry.attributes.position;
      const stride = Math.max(1, Math.floor(pos.count / 500));
      for (let i = 0; i < pos.count; i += stride) pts.push(tv.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld).clone());
    });
  }
  fitPts=pts;
  camera.aspect = aspect; camera.updateProjectionMatrix();
  const tgt = rig.tTarget, sp = Math.sin(rig.tPol), saz = Math.sin(rig.tAz), caz = Math.cos(rig.tAz);
  const allowX = 1 - Math.min(.1, 44 / w), allowY = 1 - Math.min(.09, 30 / h);
  let dist = 300;
  for (let it = 0; it < 6; it++) {
    camera.position.set(tgt.x + dist * sp * saz, tgt.y + dist * Math.cos(rig.tPol), tgt.z + dist * sp * caz);
    camera.lookAt(tgt); camera.updateMatrixWorld(true);
    let mx = 0, my = 0;
    const v = new THREE.Vector3();
    for (const p of pts) { v.copy(p).project(camera); mx = Math.max(mx, Math.abs(v.x)); my = Math.max(my, Math.abs(v.y)); }
    const need = Math.max(mx / allowX, my / allowY);
    dist *= need;
    if (Math.abs(need - 1) < .005) break;
  }
  dist *= 1.015;
  if(!bboard.visible && aspect>=1)dist*=1.12;
  if (!bboard.visible && aspect < 1) dist *= .98; // board-only lesson on portrait: fill the frame like the reference (near-plane perspective clips if tighter)
  dist*=tc.fill;
  rig.tDist = THREE.MathUtils.clamp(dist, 60, 900);
  if (snap) { rig.target.copy(rig.tTarget); rig.dist = rig.tDist; rig.az = rig.tAz; rig.pol = rig.tPol; }
}

// ---------- syntax highlighting ----------
function hl(code) {
  const esc = code.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  return esc.split('\n').map((line, i) => {
    const comIdx = line.indexOf('//');
    let code = comIdx >= 0 ? line.slice(0, comIdx) : line;
    const com = comIdx >= 0 ? line.slice(comIdx) : '';
    code = code
      .replace(/("[^"]*")/g, '<span class="tok-str">$1</span>')
      .replace(/\b(void|const|int|float|long|bool|for|if|else|return|true|false|include)\b/g, '<span class="tok-kw">$1</span>')
      .replace(/\b(pinMode|digitalWrite|digitalRead|analogRead|analogWrite|ledcWrite|ledcAttach|ledcWriteTone|touchRead|pulseIn|Serial|println|print|begin|delay|delayMicroseconds|map|setup|loop|Wire)\b/g, '<span class="tok-fn">$1</span>')
      .replace(/(?<![\w#>])(\d+\.?\d*)/g, '<span class="tok-num">$1</span>')
      .replace(/\b([A-Z_][A-Z0-9_]{2,})\b/g, '<span class="tok-num">$1</span>');
    if (com) code += '<span class="tok-com">' + com + '</span>';
    return `<span class="code-line"><span class="code-ln">${i + 1}</span><span>${code || ' '}</span></span>`;
  }).join('');
}

// One controller owns guided progress; panel rerenders do not advance it.
const isGuidedLesson=()=>['blink','servo','motor','temp','stepper','plant','force','project'].includes(LESSONS[state.lesson]?.id);
let thermalSample=24, wheelTarget=3, plantSample=1850, parkingSample=20;
const isParkingGuide=()=>LESSONS[state.lesson]?.id==='project';
const isForceGuide=()=>LESSONS[state.lesson]?.id==='force';
const isPlantGuide=()=>LESSONS[state.lesson]?.id==='plant';
const guideSample=()=>isParkingGuide()?parkingSample:isPlantGuide()?plantSample:isWheelGuide()?wheelTarget:thermalSample;
const isWheelGuide=()=>LESSONS[state.lesson]?.id==='stepper';
const isThermalGuide=()=>LESSONS[state.lesson]?.id==='temp';
const isMotorGuide=()=>LESSONS[state.lesson]?.id==='motor';
const isServoGuide=()=>LESSONS[state.lesson]?.id==='servo';
const blinkGuide = new LearningSteps(5, stage => {
  if(isGuidedLesson()&&!state.running)cur.sim?.teach?.(stage,blinkGuide.busy,state.settings.reduceMotion,guideSample());
  updateBlinkGuide();
});
function blinkStageCopy(stage) {
  if(isParkingGuide())return parkingCopy(stage,parkingSample);
  if(isForceGuide()){
    const v=forceStage(stage),copy=FORCE_COPY[stage];
    return copy?[copy[0],copy[1]+` State: raw ${v.raw??'pending'}, mapped duty ${v.duty??'pending'}, rung=${v.rung}, written output ${v.output}, bell ${v.bell&&blinkGuide.busy?'playing':'off'}.`]:['Follow a pressure history','One press runs one action, then holds. Read high, keep high, release below the rearm threshold, then press high again. Continuous held-pressure exploration is separate.'];
  }
  if(isPlantGuide()){
    const f=plantFrame(plantSample);
    return [
      ['Prepare the monitor','Configure GPIO34 and the OLED bus on 21/22. This separate browser example starts with ESP32 on the screen, not a live probe reading.'],
      ['Read millivolts',`Read ${f.mv} mV in this example. The value has not been mapped yet; the OLED still shows ESP32.`],
      ['Map and constrain',`Integer map: (${f.mv} - 2500) × 100 / (1200 - 2500) = ${f.mapped}, truncated toward zero. Constrain to 0–100: ${f.moisture}%. OLED unchanged.`],
      ['Choose the mood',`${f.moisture}% is ${f.moisture<30?'below 30':f.moisture>85?'above 85':'between 30 and 85'}, so choose "${f.mood}". No new frame has been drawn or sent.`],
      ['Draw the hidden buffer',`Clear and draw ${f.moisture}%, a ${f.bar}-pixel bar and "${f.mood}" in memory. This is the hidden frame buffer. OLED still shows ESP32.`],
      ['Send the frame',`oled.display() sends the completed buffer. The OLED now shows ${f.moisture}% and "${f.mood}". Drawing and sending are separate operations.`],
      ['Wait at this frame','Print the percentage and delay(500): hold this screen for 500 ms, then wait for you. No new sample is read automatically.'],
    ][stage]||['Follow one soil sample','Choose example millivolts, then read, map, decide, draw in memory and send to the OLED. Your own probe needs dry/wet calibration.'];
  }
  if(isWheelGuide())return [
    ['Prepare the wheel', 'Start at segment 0. Configure the button pull-up and driver. This is a browser example, not hardware execution.'],
    ['Read a new press', 'The example reads GPIO4 LOW: the button is pressed. The wheel has not moved.'],
    ['Check the guard', 'This is a new press and the wheel is idle, so the movement branch may run. No movement is queued yet.'],
    ['Calculate the distance', `Target ${wheelTarget}, starting at 0: ahead = (${wheelTarget} - 0 + 8) % 8 = ${wheelTarget}. Move 2048 + ${wheelTarget} × 256 = ${2048+wheelTarget*256} nominal steps.`],
    ['Queue the move', `Queue ${2048+wheelTarget*256} nominal steps and remember target ${wheelTarget}. Queuing does not turn the wheel. Physical position is still segment 0.`],
    ['Run the queued move', `The browser illustrates one turn plus ${wheelTarget} segments, then holds at segment ${wheelTarget}. Its easing is illustrative, not measured motor acceleration.`],
    ['Release and hold', `GPIO4 returns HIGH. The wheel stays at segment ${wheelTarget}. Replay or choose another target to review.`],
  ][stage]||['Follow one prize-wheel move', 'Choose a target, then read, check, calculate, queue and move one action at a time. Random spins remain separate exploration.'];
  if(isThermalGuide())return [
    ['Prepare a sample', 'GPIO27 starts LOW. This chosen example is separate from the free heat exploration.'],
    ['Read the sample voltage', `The example sensor value is ${500+thermalSample*10} mV. No conversion or fan decision has run.`],
    ['Convert to Celsius', `(${500+thermalSample*10} - 500) / 10 = ${thermalSample} degrees C in this example mapping.`],
    ['Compare with 30 degrees', `${thermalSample} > 30 is ${thermalSample>30?'true':'false'}. The fan output has not been written yet.`],
    ['Write the fan output', `The example writes GPIO27 ${thermalSample>30?'HIGH: fan on':'LOW: fan off'}. The browser holds this state between steps.`],
    ['Wait at this output', 'delay(200) keeps the output for 200 ms, then waits for you. Choose another sample or replay.'],
  ][stage]||['Follow one thermostat sample','Choose an example sample, then read, convert, compare and write. This is a browser model, not a hardware reading.'];
  if(isMotorGuide())return [
    ['Configure motor PWM', 'This example configures GPIO27 for 5 kHz, 8-bit PWM. The simulated motor is stopped.'],
    ['Set the fast speed', 'The example writes duty 200 out of 255. The browser shows the faster motor state, then holds the frame.'],
    ['Wait at the fast speed', 'delay(2000) keeps duty 200 for 2 seconds. This step finishes and waits for you.'],
    ['Set the slower speed', 'The example writes duty 90 out of 255. The browser shows the slower state, then holds the frame.'],
    ['Wait at the slower speed', 'delay(2000) keeps duty 90 for 2 seconds, then waits for your next press.'],
    ['Stop the motor', 'The example writes duty 0. The simulated motor stops.'],
    ['Wait while stopped', 'delay(1000) keeps duty 0 for 1 second. This loop is complete; replay when ready.'],
  ][stage]||['Explore motor control one action at a time','One press runs one part of this browser model, then holds. The displayed program is not executed on hardware.'];
  if(isServoGuide())return [
    ['Configure the signal', 'This example configures GPIO13 for 50 Hz, 12-bit pulses. No sweep has run.'],
    ['Start at 0 degrees', 'The example sends its starting pulse value. The simulated horn stays at 0 degrees until you continue.'],
    ['Sweep outward once', 'The example increases its angle toward 180 degrees. This stage ends there and waits for you.'],
    ['Return once', 'The example decreases its angle to 0 degrees, then waits. Replay to review the sequence.'],
  ][stage]||['Explore one sweep at a time','One press runs one part of this browser simulation, then waits. Real servo endpoints need calibration.'];
  return [
    ['Configure the output', 'GPIO26 is ready to drive the LED. The loop has not started.'],
    ['HIGH: light the LED', 'The output goes HIGH. Current passes through the resistor and LED.'],
    ['Wait with the LED on', `delay(${state.timing[0]}) holds this output for ${state.timing[0]} ms. Then it waits for you, not the next line.`],
    ['LOW: turn the LED off', 'The output goes LOW. The LED is off; the next delay has not run.'],
    ['Wait with the LED off', `delay(${state.timing[1]}) holds LOW for ${state.timing[1]} ms. This loop is complete. Replay when you are ready.`],
  ][stage] || ['Explore one line at a time', 'One press runs one part of the blink loop, then waits.'];
}
function updateBlinkGuide() {
  document.documentElement.classList.toggle('thermal-learning',isThermalGuide()||isWheelGuide()||isPlantGuide()||isForceGuide()||isParkingGuide());
  document.documentElement.classList.toggle('blink-learning',isGuidedLesson());
  const box=$('#blinkGuide');if(!box)return;
  const {stage,busy}=blinkGuide, [title,copy]=blinkStageCopy(stage),last=blinkGuide.count-1;
  box.dataset.stage=stage;box.dataset.busy=String(busy);
  $('#guideProgress').textContent=`${Math.max(0,stage+1)} / ${blinkGuide.count}`;
  $('#guideTitle').textContent=title;$('#guideCopy').textContent=copy;
  $('#guideNext').setAttribute('aria-disabled',String(busy));
  $('#guideNext').textContent=busy?'Running this step…':stage===last?(state.lesson===LESSONS.length-1?'Choose a lesson':'Next lesson'):'Next step';
  $('#guidePrevious').disabled=busy||stage<0;
  box.classList.toggle('is-busy',busy);
}
function nextBlinkStage() {
  if(!isGuidedLesson()||blinkGuide.busy)return;
  if(blinkGuide.stage===blinkGuide.count-1){
    if(state.lesson<LESSONS.length-1){
      loadLesson(state.lesson+1);
      requestAnimationFrame(()=>{
        const stage=$('#stageWrap');
        stage.tabIndex=-1;stage.focus({preventScroll:true});
        stage.scrollIntoView({behavior:'auto',block:'start'});
      });
    }else showLessons();
    return;
  }
  if(state.running)stopSim();
  const next=blinkGuide.stage+1;
  blinkGuide.advance(isParkingGuide()?(next===8?100:state.settings.reduceMotion?0:300):isForceGuide()?([4,11].includes(next)?400:next===13?20:250):isPlantGuide()?(next===6?500:state.settings.reduceMotion?0:300):isWheelGuide()?(state.settings.reduceMotion?0:next===5?1600:300):isThermalGuide()?(next===5?200:300):isMotorGuide()?([2,4].includes(next)?2000:next===6?1000:300):isServoGuide()?(state.settings.reduceMotion?0:next>=2?555:250):(next===2?state.timing[0]:next===4?state.timing[1]:state.settings.reduceMotion?0:300));

}
addEventListener('blur',()=>blinkGuide.settle());
document.addEventListener('visibilitychange',()=>{if(document.hidden)blinkGuide.settle();});

// ---------- panel ----------
const TABS = ['overview', 'pinout', 'example', 'specifications'];
function renderPanel() {
  $('#stageWrap > #blinkGuide')?.remove();
  document.documentElement.classList.toggle('thermal-learning',isThermalGuide()||isWheelGuide()||isPlantGuide()||isForceGuide()||isParkingGuide());
  document.documentElement.classList.toggle('blink-learning',isGuidedLesson());
  const L = trLesson(LESSONS[state.lesson]);
  $('#tabbar').innerHTML = TABS.map(t => `<button class="tab ${state.tab === t ? 'on' : ''}" role="tab" aria-selected="${state.tab === t}" data-tab="${t}">${T('tab_' + t)}</button>`).join('');
  document.querySelectorAll('.tab').forEach(b => b.onclick = () => {
    state.tab = b.dataset.tab;
    renderPanel();
    document.querySelector(`[data-tab="${state.tab}"]`)?.focus({preventScroll:true});
  });
  const body = $('#panelBody');
  const cardHead = (name) => `<div class="lesson-head"><div class="lesson-title">${name}</div><button class="icon-btn fs-btn" id="btnFs" title="${T('fullscreen_lesson')}" aria-label="${T('fullscreen_lesson')}">${ICON.expand}</button></div>`;
  const code = () => { let i=0; return state.lesson === 1 ? L.code.replace(/delay\(500\)/g, () => `delay(${state.timing[i++]})`) : L.code; };
  let h = '';
  if (state.tab === 'overview') {
    h = `<div class="lesson-head"><div class="lesson-title">${L.heading.toUpperCase()}</div><button class="icon-btn fs-btn" id="btnFs" title="${T('fullscreen_lesson')}" aria-label="${T('fullscreen_lesson')}">${ICON.expand}</button></div>
      <p class="lesson-lede">${L.lede}</p>
      <ul class="feature-list">${L.features.map(([ic, tx]) => `<li><span class="fi">${ICON[ic]}</span><span>${tx}</span></li>`).join('')}</ul>`;
  } else if (state.tab === 'pinout') {
    h = cardHead(T('tab_pinout')) + `<div class="pinout">${L.pinout.map(([pin, name, desc, c]) => `<div class="pin-row"><span class="pin-chip" style="background:${c}">${pin}</span><span class="pin-name">${name}</span><span class="pin-desc">${desc}</span></div>`).join('')}</div>`;
  } else if (state.tab === 'example') {
    h = cardHead(T('example_heading')) + `<ol class="example">${L.example.map(p => `<li>${p}</li>`).join('')}</ol>`;
  } else {
    h = `<div class="lesson-head"><div class="lesson-title">${T('tab_specifications')}</div><button class="icon-btn fs-btn" id="btnFs" title="${T('fullscreen_lesson')}" aria-label="${T('fullscreen_lesson')}">${ICON.expand}</button></div>
      <div class="specs">${L.specs.map(([k, v]) => `<div class="spec-tile"><b>${k}</b><span>${v}</span></div>`).join('')}</div>`;
  }
  if(state.lesson===15)h+=`<p class="lesson-lede parking-sim-note" lang="en" dir="ltr">Simulation (English): Next step follows one selected distance example, then waits. Echo width is round-trip time, not distance. The green, amber and red writes are separate actions; exactly 30 cm is green and exactly 10 cm is amber. There is no hysteresis. Changing examples resets all lights. Explore continuously or Run uses a separate scripted distance: click CAR or press Enter on its control to approach in 12 cm steps, clamped at 8 cm, then reset to 46 cm. CAR shows the model distance; LIGHTS shows written outputs. Stop turns all lights off but keeps the car position. No live sensor is read, and the editor is not executed. The 3D wiring is simplified: never connect 5 V ECHO directly to GPIO18; open the schematic for its voltage divider.</p>`;
  if(state.lesson===14)h+=`<p class="lesson-lede force-sim-note" lang="en" dir="ltr">Simulation (English): Next step follows one high, repeated high, low, then high sample history, and waits after each action. WRITTEN is the last output sample; SERVO shows its 12-bit duty, not a measured angle. The bell rings once above 3071, rearms only below 2662, and stops after 400 ms. Explore continuously or Run uses a separate smoothed pressure model: hold PRESS PAD and drag down to press harder, or hold Space or Enter and use Down/Up arrows to raise/lower pressure. Release or blur releases pressure; Stop immediately resets pressure and silences the tone. These are not calibrated grams or live sensor readings. The editor is not executed.</p>`;
  if(state.lesson===13)h+=`<p class="lesson-lede plant-sim-note" lang="en" dir="ltr">Simulation (English): Next step follows one selected millivolt example, then waits. Drawing the hidden frame buffer does not update the OLED until Send the frame. Explore continuously or Run uses a separate scripted moisture percentage: hold PLANT or WATER, or the plant/can model, to water; release to dry. The controls support held Space or Enter. Stop ends watering and returns the OLED to ESP32. These are not live probe readings; real probes need dry/wet calibration. The editor is not executed.</p>`;
  if(state.lesson===12)h+=`<p class="lesson-lede wheel-sim-note" lang="en" dir="ltr">Simulation (English): Next step follows one chosen target from segment 0, then waits at each action. Queuing nominal steps does not turn the wheel; the move is a separate action. Explore continuously or Run enables random spins using BUTTON, Enter on its control, or the model button. Another press while moving is ignored. Stop freezes the current wheel position and releases the button. Motion is scripted easing, not measured motor acceleration or position. The editor is not executed.</p>`;
  if(state.lesson===11)h+=`<p class="lesson-lede servo-sim-note" lang="en" dir="ltr">Simulation (English): Next step follows the shown sweep example in four actions, then waits. Explore continuously or Run uses a separate smooth, scripted sweep. Click SERVO or press Enter on its control to cycle three illustrative sweep rates; this does not change the editor's delay(15). The angle readout is the browser model, not measured feedback. Stop returns the horn to 0°. The editor is not executed; real servo endpoints need calibration.</p>`;
  if(state.lesson===10)h+=`<p class="lesson-lede thermal-sim-note" lang="en" dir="ltr">Simulation (English): Next step follows one chosen 24 or 34 °C sample, then waits at each action. Explore continuously or Run uses a separate scripted temperature model. Open HEAT for power and 5–40 cm distance controls, or drag the dryer. The fan threshold is above 30 °C; Stop turns the fan off. This is not a live sensor or a measured heat-transfer model. The editor is not executed.</p>`;
  if(state.lesson===9)h+=`<p class="lesson-lede motor-sim-note" lang="en" dir="ltr">Simulation (English): Next step follows the shown PWM example one action at a time, then waits. Explore continuously or Run uses a separate speed model: click MOTOR or press Enter on its control to cycle 0/6/14/22 illustrative speed units. These are not measured RPM or PWM duty values. Stop stops the motion. The editor is not executed.</p>`;
  if(state.lesson===8)h+=`<p class="lesson-lede piano-sim-note" lang="en" dir="ltr">Simulation (English): press Run, then hold a note button or a coloured model key. Release to silence. Note buttons also work with held Space or Enter. One note plays at a time: the newest press takes over; releasing it silences, rather than restoring an older note. Stop and leaving this lesson silence it. The editor is not executed; the sound setting can mute browser audio.</p>`;
  if(state.lesson===7)h+=`<p class="lesson-lede sound-sim-note" lang="en" dir="ltr">Simulation (English): Run repeats a fixed C/E/G/rest pattern: 262/330/392 Hz for 400 ms each, then a 600 ms rest. Stop silences it. There is no melody picker, and the editor is not executed. The sound setting can mute browser audio.</p>`;
  if(state.lesson===6)h+=`<p class="lesson-lede distance-sim-note" lang="en" dir="ltr">Simulation (English): click the obstacle or press Enter on its control to step through scripted distances. This is not a drag or a live sound measurement. Run logs the selected centimetres; Stop pauses logging. The editor is not executed.</p>`;
  if(state.lesson===5)h+=`<p class="lesson-lede light-sim-note" lang="en" dir="ltr">Simulation (English): click the lamp or press Enter on its control to toggle two scripted readings: near 3300, far 320. While running, the night light is off near and on far. Stop turns it off. The editor is not executed; the sketch shows the hardware threshold rule.</p>`;
  if(state.lesson===2)h+=`<p class="lesson-lede button-sim-note">${BUTTON_SIM_HELP[currentLang()]||BUTTON_SIM_HELP.en}</p>`;
  h = `<div class="tab-card"><div class="info-content">${h}</div></div>`;
  if(isGuidedLesson())h+=`<section id="blinkGuide" class="blink-guide" lang="en" dir="ltr" aria-label="${isParkingGuide()?'Parking sensor':isForceGuide()?'Force meter':isPlantGuide()?'Smart plant':isWheelGuide()?'Prize wheel':isThermalGuide()?'Thermostat':isMotorGuide()?'Motor':isServoGuide()?'Servo':'Blink'} lesson, step by step">
    <div class="guide-top"><span>${currentLang()==='en'?'Step by step':'Step by step (English)'}</span><span id="guideProgress" aria-label="Lesson progress"></span></div>
    ${isThermalGuide()?`<label class="guide-sample" for="guideSample">Example sample <select id="guideSample"><option value="24" ${thermalSample===24?'selected':''}>24 C (below threshold)</option><option value="34" ${thermalSample===34?'selected':''}>34 C (above threshold)</option></select></label>`:''}
    ${isWheelGuide()?`<label class="guide-sample" for="guideSample">Target segment <select id="guideSample">${Array.from({length:8},(_,n)=>`<option value="${n}" ${wheelTarget===n?'selected':''}>${n}${n===0?' (one full turn)':''}</option>`).join('')}</select></label>`:''}
    ${isPlantGuide()?`<label class="guide-sample" for="guideSample">Example voltage <select id="guideSample">${PLANT_SAMPLES.map(m=>`<option value="${m}" ${plantSample===m?'selected':''}>${m} mV${m===2800?' (dry clamp)':m===900?' (wet clamp)':''}</option>`).join('')}</select></label>`:''}
    ${isParkingGuide()?`<label class="guide-sample" for="guideSample">Example distance <select id="guideSample">${PARKING_SAMPLES.map(cm=>`<option value="${cm}" ${parkingSample===cm?'selected':''}>${cm} cm${cm===10||cm===30?' (boundary)':''}</option>`).join('')}</select></label><details class="parking-think"><summary>Predict first: which light, and why?</summary><p>Choose green, amber or red in your own words before the writes. Use the 10 and 30 cm boundary examples to check whether equality changes your rule. Each new example starts all lights off.</p><button type="button" id="parkingReveal">Compare with the rule</button><p id="parkingAnswer" hidden></p></details>`:''}
    <div class="guide-explanation" role="status" aria-live="polite" aria-atomic="true"><h3 id="guideTitle"></h3><p id="guideCopy"></p></div>
    <div class="guide-controls"><button type="button" id="guidePrevious" aria-label="Previous step">←</button><button type="button" id="guideNext">Next step</button><button type="button" id="guideReset">Replay</button></div>
    <button type="button" id="guideContinuous" class="guide-continuous">${isMotorGuide()||isThermalGuide()||isWheelGuide()||isPlantGuide()||isForceGuide()||isParkingGuide()?'Explore continuously':'Watch the full loop'}</button>
  </section>`;
  h += `<div class="code-card">
    <div class="code-head"><span class="code-title">${T('try_it')}</span><span class="code-actions">
      <button class="icon-btn" id="btnCodeFs" title="${T('fullscreen_code')}" aria-label="${T('fullscreen_code')}">${ICON.expand}</button>
      <button class="icon-btn" id="btnCopy" title="${T('copy_code')}" aria-label="${T('copy_code')}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg></button>
      <button class="icon-btn primary ${state.running ? 'is-running' : ''}" id="btnRun" title="${T(state.running ? 'stop' : 'run')}" aria-label="${T(state.running ? 'stop' : 'run')}"><svg viewBox="0 0 24 24" fill="currentColor" id="runIcon"><path d="M8 5v14l11-7z"/></svg></button>
    </span></div>
    <div class="code-pre">${hl(code())}</div>
    <div class="console-grip" id="consoleGrip" role="separator" aria-orientation="horizontal" aria-label="${T('serial_monitor')}" tabindex="0" ${state.running ? '' : 'hidden'}></div>
    <div class="console-head" ${state.running ? '' : 'hidden'}><span class="serial-dot"></span><b>${T('serial_monitor')}</b><span id="serialStatus">${T('running')}</span><button id="consoleStop" class="icon-btn" title="${T('stop')}" aria-label="${T('stop')}">×</button></div>
    <div class="console" id="console" ${state.running ? '' : 'hidden'}></div>
  </div>`;
  body.innerHTML = h;
  if(isGuidedLesson()){
    if(innerWidth<1024)$('#stageWrap').append($('#blinkGuide'));
    blinkGuide.count=isParkingGuide()?9:isForceGuide()?FORCE_COPY.length:isPlantGuide()?7:isWheelGuide()?7:isThermalGuide()?6:isMotorGuide()?7:isServoGuide()?4:5;
    updateBlinkGuide();
    if(!state.running)cur.sim?.teach?.(blinkGuide.stage,blinkGuide.busy,state.settings.reduceMotion,guideSample());
    if(isParkingGuide()){ $('#guideSample').onchange=e=>{parkingSample=Number(e.target.value);stopSim();blinkGuide.reset();};$('#parkingReveal').onclick=()=>{const f=parkingFrame(parkingSample),p=$('#parkingAnswer');p.hidden=false;p.textContent=`${f.cm} cm selects ${f.zone}. Green includes 30; amber includes 10 but excludes 30; red is strictly below 10. No hysteresis means values crossing a boundary can flicker. This code does not show echo timeout handling or make a safety-rated parking controller.`;};}
    if(isPlantGuide())$('#guideSample').onchange=e=>{plantSample=Number(e.target.value);stopSim();blinkGuide.reset();};
    if(isWheelGuide())$('#guideSample').onchange=e=>{wheelTarget=Number(e.target.value);stopSim();blinkGuide.reset();};
    if(isThermalGuide())$('#guideSample').onchange=e=>{thermalSample=Number(e.target.value);stopSim();blinkGuide.reset();};
    $('#guideNext').onclick=nextBlinkStage;
    for(const b of document.querySelectorAll('#blinkGuide button')) b.addEventListener('keydown',e=>{if(e.repeat&&['Enter',' '].includes(e.key))e.preventDefault();});
    $('#guideReset').onclick=()=>{stopSim();blinkGuide.reset();};
    $('#guidePrevious').onclick=()=>{stopSim();blinkGuide.previous();};
    $('#guideContinuous').onclick=()=>{blinkGuide.reset();startSim();};
  }
  const grip=$('#consoleGrip'),serial=$('#console');
  const sizeSerial=v=>{const min=40,max=Math.max(min,Math.min(260,innerHeight*.3));state.consoleHeight=Math.round(Math.min(max,Math.max(min,v)));serial.style.height=state.consoleHeight+'px';grip.setAttribute('aria-valuemin',min);grip.setAttribute('aria-valuemax',Math.round(max));grip.setAttribute('aria-valuenow',state.consoleHeight);};
  if(state.consoleHeight!==null)sizeSerial(state.consoleHeight);
  let resizeDrag=null;
  grip.onpointerdown=e=>{resizeDrag={y:e.clientY,h:serial.offsetHeight};grip.setPointerCapture(e.pointerId);e.preventDefault();};
  grip.onpointermove=e=>{if(resizeDrag)sizeSerial(resizeDrag.h+resizeDrag.y-e.clientY);};
  grip.onpointerup=grip.onpointercancel=()=>{resizeDrag=null;};
  grip.onkeydown=e=>{if(['ArrowUp','ArrowDown','Home','End'].includes(e.key)){e.preventDefault();sizeSerial(e.key==='Home'?40:e.key==='End'?260:serial.offsetHeight+(e.key==='ArrowUp'?8:-8));}};

  $('#btnFs') && ($('#btnFs').onclick = () => {
    const p = $('#panel'), on = p.classList.toggle('full');
    $('#btnFs').innerHTML = on ? ICON.collapse : ICON.expand;
  });
  $('#btnCodeFs').onclick = () => {
    const c = $('#btnCodeFs').closest('.code-card');
    const on = !c.classList.contains('full');
    if(on){ c._returnScroll = scrollY; const ph=document.createElement('div');ph.className='code-placeholder';ph.style.height=c.offsetHeight+'px';c.before(ph);c._placeholder=ph; }
    c.classList.toggle('full',on);
    $('#btnCodeFs').innerHTML = on ? ICON.collapse : ICON.expand;
    if(!on){ c._placeholder?.remove();scrollTo({top:c._returnScroll||0,behavior:'instant'});$('#btnCodeFs').focus({preventScroll:true}); }
  };
  const mountParams = () => {
    if (state.lesson !== 1) return;
    const lines = [...document.querySelectorAll('.code-pre .code-line')].filter(e=>/delay\(/.test(e.textContent));
    lines.forEach((el, i) => {
      const num = el.querySelector('.tok-num'); if (!num) return;
      const bt = document.createElement('button'); bt.className='code-param'; bt.textContent=state.timing[i]; bt.title=T('change_delay'); bt.setAttribute('aria-label',T('change_delay')); num.replaceWith(bt);
      bt.onclick=()=>{ const choices=[100,200,500,900,1000,1500]; state.timing[i]=choices[(choices.indexOf(state.timing[i])+1)%choices.length]; bt.textContent=state.timing[i]; cur.sim?.setTiming?.(...state.timing); blinkGuide.settle(); updateBlinkGuide(); };
    });
  };
  mountParams();
  $('#consoleStop').onclick=()=>stopSim();
  for (const [t, cls] of state.logs) appendLog(t, cls);
  api.line(state.activeLine);
  if(state.running) $('#runIcon').innerHTML='<rect x="6" y="6" width="12" height="12" rx="2"/>';
  $('#btnCopy').onclick = () => { navigator.clipboard?.writeText(code()); log(T('copied'), 'sys'); };
  $('#btnRun').onclick = () => state.running ? stopSim() : startSim();
}
function log(t, cls = '') {
  state.logs.push([t,cls]); if(state.logs.length>40) state.logs.shift(); appendLog(t, cls);
}
function appendLog(t, cls = '') {
  const c = $('#console'); if (!c) return;
  const d = document.createElement('div'); d.className = 'c-line ' + (cls ? 'c-' + cls : ''); d.textContent = t;
  c.appendChild(d); c.scrollTop = c.scrollHeight;
  while (c.children.length > 40) c.firstChild.remove();
}

// ---------- run / stop ----------
let runGeneration=0;
function startSim() {
  if (state.running) return;
  const generation=++runGeneration,lesson=state.lesson;
  blinkGuide.reset();
  state.running = true; api.line?.(0); state.startedAt = performance.now();
  $('#consoleGrip').hidden=false;document.querySelector('.console-head').hidden=false; $('#console').hidden=false; $('#console').innerHTML=''; state.logs=[];
  $('#serialStatus').textContent=T('running');
  $('#btnRun').classList.add('is-running');document.querySelectorAll('.nav-btn[data-k=play]').forEach(e=>e.classList.add('on')); $('#btnRun').title=T('stop'); $('#btnRun').setAttribute('aria-label',T('stop'));
  cur.sim?.setTiming?.(...state.timing);
  $('#runIcon').innerHTML = '<rect x="6" y="6" width="12" height="12" rx="2"/>';
  log(T('uploading'), 'sys');
  cur.sim.start();
  setTimeout(() => { // mark lesson done after a real run
    if (state.running && generation===runGeneration && lesson===state.lesson) { state.done.add(lesson); saveSettings(); renderRail(); updateProgress(); }
  }, 3000);
}
function stopSim() {
  releasePianoPointer();
  if (!state.running) return;
  state.running = false; api.line?.(0);document.querySelectorAll('.nav-btn[data-k=play]').forEach(e=>e.classList.remove('on'));
  $('#btnRun')?.classList.remove('is-running'); if($('#btnRun')) { $('#btnRun').title=T('run'); $('#btnRun').setAttribute('aria-label',T('run')); }
  if ($('#serialStatus')) $('#serialStatus').textContent=T('stopped');
  const ic = $('#runIcon'); if (ic) ic.innerHTML = '<path d="M8 5v14l11-7z"/>';
  cur.sim?.stop(); tone(0);
  log(T('stopped'), 'sys');
}

// ---------- lessons rail + thumbnails ----------
let thumbRenderer = null;
const thumbCache = new Map();
function thumbFor(i) {
  if(thumbCache.has(i))return thumbCache.get(i);
  if (!thumbRenderer) {
    thumbRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    thumbRenderer.setSize(192, 192);
  }
  const ts = new THREE.Scene();
  ts.add(new THREE.HemisphereLight(0xfff4e0, 0xcbb894, 1.2));
  const d = new THREE.DirectionalLight(0xfff0dd, 2); d.position.set(30, 60, 40); ts.add(d);
  const hero = { board: null, blink: 'led', button: 'btn', pot: 'pot', rgb: 'rgb', light: 'lamp', distance: 'us', sound: 'bz', piano: 'keys', motor: 'motor', temp: 'heat', servo: 'servo', stepper: 'stepper', plant: 'plant', force: 'fsr', project: 'tl' }[LESSONS[i].id];
  let m;
  if (LESSONS[i].id === 'board') { const b = buildBoard(); m = b.group; m.scale.setScalar(.8); }
  else m = { led: C.led5mm(0xe8392e), btn: C.pushButton(), pot: C.potentiometer(), rgb: C.rgbLed(), ldr: C.ldr(), lamp: C.deskLamp(), us: C.ultrasonic(), bz: C.buzzer(), keys: C.pianoKeys(8), motor: C.dcMotor(), tmp: C.tmp36(), heat: C.heatGun(), servo: C.servo(), stepper: C.stepper(), plant: C.pottedPlant(), fsr: C.strengthMeter(), tl: C.trafficLight() }[hero];
  m.traverse(o => { if(o.isMesh && o.geometry) { const edge = new THREE.LineSegments(new THREE.EdgesGeometry(o.geometry,55),new THREE.LineBasicMaterial({color:0x19243c}));o.add(edge); } });
  ts.add(m);
  const bb6 = new THREE.Box3().setFromObject(m); const c6 = bb6.getCenter(new THREE.Vector3()); const sz = bb6.getSize(new THREE.Vector3()).length();
  const extent = sz * .46;
  const cam = new THREE.OrthographicCamera(-extent, extent, extent, -extent, .1, 2000);
  cam.position.set(c6.x + sz * .7, c6.y + sz * .75, c6.z + sz * .9); cam.lookAt(c6);
  thumbRenderer.render(ts, cam);
  const url = thumbRenderer.domElement.toDataURL();
  m.traverse(o => { o.geometry?.dispose?.(); });
  thumbCache.set(i,url);
  return url;
}
let thumbsDone = false;
function renderRail() {
  const rail = $('#lessonRail');
  rail.innerHTML = LESSONS.map((L, i) => `
    <button class="lesson-card ${i === state.lesson ? 'on' : ''}" data-i="${i}">
      <img class="thumb" data-thumb="${i}" alt="" />
      <span class="lt">${L.num}. ${trLesson(L).title.toUpperCase()}</span>
      ${state.done.has(i) ? '<span class="done-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M4 12l5 5L20 7"/></svg></span>' : ''}
      <svg class="chev" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg>
    </button>`).join('');
  rail.querySelectorAll('.lesson-card').forEach(c => c.onclick = () => loadLesson(+c.dataset.i));
  // explicit prev/next tap arrows like the reference rail
  $('#railPrev').onclick = () => rail.scrollBy({left: -rail.clientWidth * .8 * (document.dir === 'rtl' ? -1 : 1), behavior: 'smooth'});
  $('#railNext').onclick = () => rail.scrollBy({left: rail.clientWidth * .8 * (document.dir === 'rtl' ? -1 : 1), behavior: 'smooth'});
  requestAnimationFrame(() => {
    const active=rail.querySelector('.lesson-card.on');if(!active)return;
    if(innerWidth<1024 && document.dir!=='rtl')rail.scrollLeft=state.lesson===0 ? 0 : active.offsetLeft-rail.offsetLeft-rail.clientWidth*.38;
    else active.scrollIntoView({behavior:'auto',block:'nearest',inline:'center'});
  });
  const maskEdgeLabels=()=>{
    const r=rail.getBoundingClientRect(), max=rail.scrollWidth-rail.clientWidth;
    const offset=Math.abs(rail.scrollLeft), rtl=document.dir==='rtl';
    const canPrev=offset>2,canNext=offset<max-2;
    $('#railPrev').hidden=!canPrev;$('#railNext').hidden=!canNext;
    rail.parentElement.classList.toggle('can-left',rtl?canNext:canPrev);
    rail.parentElement.classList.toggle('can-right',rtl?canPrev:canNext);
    rail.querySelectorAll('.lesson-card').forEach(c=>{const q=c.getBoundingClientRect();c.classList.toggle('edge-cut',innerWidth<1024 && (q.left<r.left-2 || q.right>r.right+2))});
  };
  rail.onscroll=maskEdgeLabels;requestAnimationFrame(()=>requestAnimationFrame(maskEdgeLabels));
  // fill thumbs lazily
  rail.querySelectorAll('img[data-thumb]').forEach(img => {
    const i = +img.dataset.thumb;
    if(thumbCache.has(i))img.src=thumbCache.get(i);
    else setTimeout(() => { const url=thumbFor(i);if(img.isConnected)img.src=url; }, 30*i);
  });
}
function updateProgress() {
  $('#progressCount').textContent = `${state.done.size}/16`;
  $('#progressFill').style.width = (state.done.size / 16 * 100) + '%';
}

// ---------- icons ----------
const I = (p, fillIt) => `<svg viewBox="0 0 24 24" fill="${fillIt ? 'currentColor' : 'none'}" stroke="${fillIt ? 'none' : 'currentColor'}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
const ICON = {
  chip: I('<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/>'),
  bulb: I('<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10c.7.7 1 1.6 1 2.5V16h6v-.5c0-.9.3-1.8 1-2.5a6 6 0 0 0-4-10z"/>'),
  gear: I('<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1L7 17M17 7l2.1-2.1"/>'),
  pins: I('<path d="M4 21V10M9 21V10M14 21V10M19 21V10M4 10V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3"/>'),
  res: I('<path d="M2 12h3l2-5 3 10 3-10 3 10 2-5h4"/>'),
  clock: I('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>'),
  hand: I('<path d="M8 12V6a2 2 0 1 1 4 0v6M12 12V4a2 2 0 1 1 4 0v8M16 12V6a2 2 0 1 1 4 0v7c0 4-3 8-7 8s-6-2-8-6l-1.6-3.4A1.8 1.8 0 0 1 6.6 9L8 11"/>'),
  wave: I('<path d="M2 12c2-4 4-4 6 0s4 4 6 0 4-4 6 0"/>'),
  bolt: I('<path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z"/>'),
  plug: I('<path d="M9 7V3M15 7V3M7 7h10v4a5 5 0 0 1-10 0V7zM12 16v5"/>'),
  usb: I('<circle cx="12" cy="5" r="2.4"/><path d="M12 7.5V20M12 11l4-2.5M12 14l-4-2.5"/><circle cx="16.5" cy="6.5" r="1"/><path d="M7 6.5h2v2H7z"/>'),
  home: I('<path d="M2 11L12 2l10 9h-3v10h-5v-7h-4v7H5V11z"/>', true),
  lessons: I('<path d="M12 5C9 2 5 2 2 3v16c4-1 7 0 10 2 3-2 6-3 10-2V3c-3-1-7-1-10 2zM12 5v16M5 5v11M19 5v11"/>'),
  comp: I('<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/>'),
  play: I('<rect x="2" y="4" width="20" height="16" rx="1"/><path d="M10 8v8l6-4z"/>'),
  settings: I('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.9 2.9l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.9-2.9l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.9-2.9l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.9 2.9l-.1.1a1.7 1.7 0 0 0-.3 1.9V9c.3.8 1 1.4 1.9 1.4h.1a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'),
  globe: I('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/>'),
  reset: I('<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>'),
  rotL: I('<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>'),
  rotR: I('<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>'),
  minus: I('<path d="M5 12h14"/>'),
  plus: I('<path d="M12 5v14M5 12h14"/>'),
  info: I('<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>'),
  up3d: I('<path d="M12 3l7 4v10l-7 4-7-4V7l7-4z"/><path d="M12 11l7-4M12 11v10M12 11L5 7"/>'),
  compass: I('<circle cx="12" cy="12" r="9"/><path d="m10 14 2-9 2 5z" fill="#ce5c3c"/><path d="m14 10-2 9-2-5z" fill="currentColor"/>'),
  flow: I('<path d="M3 14h4l3-6 4 8 3-5h4"/><circle cx="10" cy="8" r="2" fill="currentColor"/><circle cx="17" cy="11" r="2" fill="currentColor"/>'),
  waveT: I('<path d="M2 12h3l2-6 3 12 3-12 2 6h7"/>'),
  check: I('<path d="M4 12l5 5L20 7"/>'),
  expand: I('<path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>'),
  collapse: I('<path d="M4 14h6v6M20 10h-6V4M10 14l-7 7M14 10l7-7"/>'),
  chevR: I('<path d="M9 6l6 6-6 6"/>'),
  chevL: I('<path d="M15 6l-6 6 6 6"/>'),
};

// ---------- toolbar ----------
const toolbar = $('#toolbar');
toolbar.innerHTML = [
  ['rotL', 'Turn left', 'rotL'], ['rotR', 'Turn right', 'rotR'], ['minus', 'Zoom out', 'minus'], ['plus', 'Zoom in', 'plus'],
  ['reset', 'Reset view', 'compass'], ['waveT', 'Current flow', 'flow'], ['schematic', 'Schematic', 'waveT'],
].map(([k, a, ic]) => `<button class="tool-btn ${k === 'waveT' && state.settings.flow ? 'on' : ''}" data-k="${k}" aria-label="${T('nav_' + k)}">${ICON[ic]}</button>`).join('');
toolbar.querySelectorAll('.tool-btn').forEach(b => b.onclick = () => {
  const k = b.dataset.k; idle.t = 0;
  if (k === 'reset') { clearComponentFocus();applyTeachCamAngles(state.lesson);frameScene(); }
  if (k === 'rotL') rig.tAz += .5;
  if (k === 'rotR') rig.tAz -= .5;
  if (k === 'minus') rig.tDist = Math.min(420, rig.tDist * 1.15);
  if (k === 'plus') rig.tDist = Math.max(90, rig.tDist * .87);
  keepBoardInView();
  if (k === 'up3d') { rig.tAz = -.62; rig.tPol = 1.07; }
  if (k === 'schematic') {state.settings.schematic=!state.settings.schematic;saveSettings();applySettings();}
  if (k === 'info') openPartInfo({ label: 'Learn ESP32', desc: 'Sixteen interactive lessons on the ESP32: wire it, run the code, watch it work. Design inspired by Learn Arduino by Dilum Sanjaya; this is an original ESP32 implementation.' });
  if (k === 'waveT') { state.settings.flow = !state.settings.flow; b.classList.toggle('on', state.settings.flow); saveSettings(); }
});

// ---------- navs ----------
function showLessons(){
  const rail=$('#lessonRail'),active=rail.querySelector('.lesson-card.on');
  $('#lessonsSec').scrollIntoView({behavior:state.settings.reduceMotion?'auto':'smooth',block:'center'});
  active?.focus({preventScroll:true});
}
function renderNavs() {
  $('#viewHint').textContent=T('view_hint');
  const toolKeys=['turn_left','turn_right','zoom_out','zoom_in','reset_view','flow','schematic']; document.querySelectorAll('.tool-btn').forEach((b,i)=>{ b.title=T(toolKeys[i]);b.setAttribute('aria-label',T(toolKeys[i])); });
  const items = [
    ['home', 'Home', 'home', () => loadLesson(0)],
    ['lessons', 'Lessons', 'lessons', showLessons],
    ['comp', 'Components', 'comp', el => openSheet('components', null, el)],
    ['play', 'Simulator', 'play', () => state.running ? stopSim() : startSim()],
    ['settings', 'Settings', 'settings', el => openSheet('settings', null, el)],
    ['lang', 'Language', 'globe', el => openSheet('language', null, el), 'EN'],
  ];
  $('#bottomnav').innerHTML = items.map(([k, a, ic, , badge]) =>
    `<button class="nav-btn" data-k="${k}" aria-label="${T('nav_' + k)}">${ICON[ic]}<span class="nl">${T('nav_' + k)}</span>${badge ? `<span class="nav-badge">${state.settings.lang.toUpperCase().slice(0,2)}</span>` : ''}</button>`).join('');
  $('#sidebar').innerHTML = `<button class="nav-btn side-toggle" data-k="toggle" aria-label="${T('expand_sidebar')}" title="${T('expand_sidebar')}">${ICON.chevR}</button>` + items.slice(0, 6).map(([k, a, ic, , badge]) =>
    `<button class="nav-btn" data-k="${k}" aria-label="${T('nav_' + k)}" title="${T('nav_' + k)}">${ICON[ic]}<span class="nl">${T('nav_' + k)}</span>${badge ? `<span class="nav-badge">${state.settings.lang.toUpperCase().slice(0,2)}</span>` : ''}</button>`).join('');
  document.querySelectorAll('.nav-btn[data-k]').forEach(b => { const fn = items.find(x => x[0] === b.dataset.k)?.[3]; b.onclick = () => { document.querySelectorAll('.nav-btn.on').forEach(n=>n.classList.remove('on')); b.classList.add('on'); fn?.(b); }; });
  const tog = $('#sidebar .side-toggle');
  tog.onclick = () => {
    const sb = $('#sidebar'), on = sb.classList.toggle('expanded');
    $('#app').classList.toggle('side-open', on);
    tog.innerHTML = on ? ICON.chevL : ICON.chevR;
    tog.setAttribute('aria-label', T(on ? 'collapse_sidebar' : 'expand_sidebar'));
    setTimeout(() => { resize(); frameScene(); }, 60);
    setTimeout(() => { resize(); frameScene(); }, 350);
  };
}

// Original segmented ground marker, shown only for the component focus action.
const focusMarker=new THREE.Group();focusMarker.visible=false;scene.add(focusMarker);
for(const [radius,start,length,opacity]of[[19,.1,Math.PI*1.65,.72],[16.5,2.3,Math.PI*1.6,.36]]){
  const ring=new THREE.Mesh(new THREE.RingGeometry(radius-.65,radius,80,1,start,length),new THREE.MeshBasicMaterial({color:0x20aaa5,transparent:true,opacity,side:THREE.DoubleSide,depthWrite:false}));
  ring.rotation.x=-Math.PI/2;ring.position.y=.5;focusMarker.add(ring);
}
let focusObject=null;
// Original top-down navigator. Uses measured world bounds, not copied artwork.
const focusMap=document.createElement('canvas');focusMap.id='focusMap';focusMap.width=300;focusMap.height=200;
focusMap.tabIndex=0;focusMap.setAttribute('role','application');focusMap.setAttribute('aria-label','Circuit map: click to pan. Arrow keys move. Home resets the view.');
canvas.parentElement.appendChild(focusMap);
let mapBounds=null,mapLastDraw=0;
function clearComponentFocus(){focusObject=null;focusMarker.visible=false;focusMap.hidden=true;}
focusMap.hidden=true;
function drawFocusMap(){
  focusMap.hidden=!focusObject||innerWidth<1024;if(focusMap.hidden)return;
  if(performance.now()-mapLastDraw<100)return;mapLastDraw=performance.now();
  const ctx=focusMap.getContext('2d'),bounds=new THREE.Box3().setFromObject(board.group).union(new THREE.Box3().setFromObject(bboard)).union(new THREE.Box3().setFromObject(lessonGroup));
  const size=bounds.getSize(new THREE.Vector3()),scale=Math.min(270/size.x,168/size.z),center=bounds.getCenter(new THREE.Vector3());
  mapBounds={scale,cx:center.x,cz:center.z};
  const px=x=>150+(x-center.x)*scale,pz=z=>100+(z-center.z)*scale;
  ctx.clearRect(0,0,300,200);ctx.fillStyle='#f8f0df';ctx.fillRect(0,0,300,200);
  ctx.strokeStyle='#dfcfb5';ctx.lineWidth=1;for(let x=0;x<300;x+=20){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,200);ctx.stroke()}for(let y=0;y<200;y+=20){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(300,y);ctx.stroke()}
  // View frustum intersection with the tabletop makes camera position legible.
  const groundPlane=new THREE.Plane(new THREE.Vector3(0,1,0),0),ray=new THREE.Raycaster(),corners=[];
  for(const [x,y]of[[-1,1],[1,1],[1,-1],[-1,-1]]){ray.setFromCamera(new THREE.Vector2(x,y),camera);const hit=ray.ray.intersectPlane(groundPlane,new THREE.Vector3());if(hit)corners.push(hit)}
  if(corners.length===4){ctx.beginPath();corners.forEach((p,i)=>ctx[i?'lineTo':'moveTo'](px(p.x),pz(p.z)));ctx.closePath();ctx.fillStyle='#20aaa522';ctx.fill();ctx.strokeStyle='#159e99';ctx.lineWidth=2;ctx.stroke()}
  const footprint=(o,color)=>{const b=new THREE.Box3().setFromObject(o);ctx.fillStyle=color;ctx.strokeStyle='#39415a';ctx.lineWidth=1.5;ctx.fillRect(px(b.min.x),pz(b.min.z),(b.max.x-b.min.x)*scale,(b.max.z-b.min.z)*scale);ctx.strokeRect(px(b.min.x),pz(b.min.z),(b.max.x-b.min.x)*scale,(b.max.z-b.min.z)*scale)};
  footprint(board.group,'#424f7a');footprint(bboard,'#e5ddca');
  Object.values(cur.scene.refs).forEach(o=>footprint(o,o===focusObject?'#21aaa4':'#9ca599'));
  ctx.strokeStyle='#b96343';ctx.lineWidth=2;const tx=px(rig.target.x),tz=pz(rig.target.z);ctx.beginPath();ctx.moveTo(tx-5,tz);ctx.lineTo(tx+5,tz);ctx.moveTo(tx,tz-5);ctx.lineTo(tx,tz+5);ctx.stroke();
}
focusMap.addEventListener('pointerdown',e=>{if(!mapBounds)return;e.preventDefault();const r=focusMap.getBoundingClientRect(),m=mapBounds;rig.tTarget.x=m.cx+((e.clientX-r.left)/r.width*300-150)/m.scale;rig.tTarget.z=m.cz+((e.clientY-r.top)/r.height*200-100)/m.scale;idle.t=0;});
focusMap.addEventListener('keydown',e=>{const d={ArrowLeft:[-8,0],ArrowRight:[8,0],ArrowUp:[0,-8],ArrowDown:[0,8]}[e.key];if(d){e.preventDefault();rig.tTarget.x+=d[0];rig.tTarget.z+=d[1];idle.t=0;}if(e.key==='Home'){e.preventDefault();document.querySelector('.tool-btn[data-k=reset]').click();}});

// Frame an inspected component inside the unobscured part of the stage.
function focusComponent(object){
  if(!object)return;
  object.updateWorldMatrix(true,true);
  const bounds=new THREE.Box3().setFromObject(object),center=bounds.getCenter(new THREE.Vector3());
  const rect=canvas.getBoundingClientRect(),sheet=$('#sheet').getBoundingClientRect();
  const usableBottom=innerWidth<1024?Math.min(rect.bottom,sheet.top-12):rect.bottom;
  const available=Math.max(100,usableBottom-rect.top-16),ny=1-2*((16+available/2)/rect.height);
  const probe=camera.clone(),up=new THREE.Vector3(-Math.cos(rig.tPol)*Math.sin(rig.tAz),Math.sin(rig.tPol),-Math.cos(rig.tPol)*Math.cos(rig.tAz));
  probe.aspect=rect.width/rect.height;probe.updateProjectionMatrix();
  let distance=90,target=new THREE.Vector3();
  const corners=[];for(const x of[bounds.min.x,bounds.max.x])for(const y of[bounds.min.y,bounds.max.y])for(const z of[bounds.min.z,bounds.max.z])corners.push(new THREE.Vector3(x,y,z));
  for(let n=0;n<10;n++){
    target.copy(center).addScaledVector(up,-ny*distance*Math.tan(probe.fov*Math.PI/360));
    probe.position.set(target.x+distance*Math.sin(rig.tPol)*Math.sin(rig.tAz),target.y+distance*Math.cos(rig.tPol),target.z+distance*Math.sin(rig.tPol)*Math.cos(rig.tAz));probe.lookAt(target);probe.updateMatrixWorld(true);
    let need=0;for(const corner of corners){const v=corner.clone().project(probe);need=Math.max(need,Math.abs(v.x)/.68,Math.abs(v.y-ny)/(available/rect.height*.7));}
    if(need<=1.01)break;distance*=need*1.03;
  }
  rig.tTarget.copy(target);rig.tDist=distance;idle.t=0;focusObject=object;focusMarker.visible=true;
}

// ---------- sheets ----------
let sheetOpener=null;
function closeSheet(restoreFocus=true){
  clearComponentFocus();boardPartMarker.visible=false;boardDock.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed','false'));
  $('#sheet').classList.remove('open');state.sheet=null;
  if(restoreFocus&&sheetOpener?.isConnected)sheetOpener.focus({preventScroll:true});
  sheetOpener=null;
}
$('#sheetClose').onclick=()=>closeSheet();
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&state.sheet){e.preventDefault();closeSheet();}});
function openSheet(kind, data, anchor) {
  const sh = $('#sheet'), title = $('#sheetTitle'), sub = $('#sheetSub'), body = $('#sheetBody');
  if (state.sheet === kind && !data) { closeSheet(); return; }
  if(!state.sheet){sheetOpener=anchor||document.activeElement;if(!sheetOpener||sheetOpener===document.body){sheetOpener=canvas;canvas.tabIndex=0;}}
  state.sheet = kind;
  $('#sheetClose').setAttribute('aria-label',T('close_panel'));$('#sheetClose').title=T('close_panel')+' (Esc)';
  if(innerWidth<1024){sh.style.top='auto';sh.style.maxHeight='calc(100dvh - 100px)';}
  if (kind === 'components') {
    title.textContent = T('components'); sub.textContent = `12 ${T('in_view')}`;
    const comps = [
      ['Breadboard', 'Holes in each short row of five are connected underneath.', 'comp'],
      ['220 Ω resistor', 'Limits the current flowing through the circuit.', 'res'],
      ['5 mm LED', 'Lights when current flows from the long leg (anode) to the short leg.', 'bulb'],
      ['ESP32-WROOM-32', 'The 240 MHz dual-core module that runs your code, with Wi-Fi and Bluetooth.', 'chip'],
      ['Micro-USB port', 'Uploads sketches and powers the board from your computer.', 'usb'],
      ['EN button', 'Restarts your sketch from the top.', 'reset'],
      ['BOOT button', 'Hold while pressing EN to enter upload mode.', 'hand'],
      ['3.3 V regulator', 'Steps the 5 V USB supply down to a steady 3.3 V.', 'bolt'],
      ['USB-UART bridge', 'Turns USB into serial so your computer can talk to the chip.', 'plug'],
      ['GPIO pins', '30 pins: digital in/out, analog in, touch, PWM, I²C, SPI.', 'pins'],
      ['Built-in LED', 'Wired to GPIO2 — blinks with LED_BUILTIN.', 'bulb'],
      ['Power LED', 'Lit whenever the board has power.', 'bolt'],
    ];
    body.innerHTML = comps.map(([n, d, ic]) => `<div class="comp-row"><span class="comp-ic">${ICON[ic]}</span><div><div class="comp-name">${trCompName(n).toUpperCase()}</div><div class="comp-desc">${trCompDesc(d)}</div></div></div>`).join('');
  } else if (kind === 'settings') {
    title.textContent = T('settings'); sub.textContent = '';
    const S = state.settings;
    const row = (key, name, desc) => `<div class="set-row"><div><div class="set-name">${name}</div><div class="set-desc">${desc}</div></div><span class="sp"></span><button class="switch ${S[key] ? 'on' : ''}" data-k="${key}" role="switch" aria-checked="${S[key]}"></button></div>`;
    body.innerHTML =
      `<div class="set-row"><div><div class="set-name">${T('set_language')}</div><div class="set-desc">${T('set_language_d')}</div></div><span class="sp"></span><select class="select" id="langSel">${LANGS.map(l => `<option value="${l.code}" ${l.code === S.lang ? 'selected' : ''}>${l.name}</option>`).join('')}</select></div>` +
      row('labels', T('set_labels'), T('set_labels_d')) +
      row('flow', T('set_flow'), T('set_flow_d')) +
      row('schematic', T('set_schematic'), T('set_schematic_d')) +
      row('grid', T('set_grid'), T('set_grid_d')) +
      row('turntable', T('set_turntable'), T('set_turntable_d')) +
      row('sound', T('set_sound'), T('set_sound_d')) +
      row('reduceMotion', T('set_motion'), T('set_motion_d')) +
      `<button class="danger-btn" id="resetProgress">${T('reset_progress')}</button><section style="padding:16px 0;font:15px/1.6 Arial,sans-serif"><h3>Keep your learning data</h3><p role="status">${recoveryBlocked?'Unreadable earlier browser data is preserved. Changes cannot be saved until it is recovered.':'Progress and settings save only in this browser, not in the cloud.'} Download a recovery file, then import it into your private saved-apps home. Nothing transfers automatically.</p><button id="downloadRecovery" class="danger-btn">Download learning recovery file</button><a style="display:block;padding:12px 0" href="https://saved-apps.vercel.app/" target="_blank" rel="noopener noreferrer">Open private saved-apps home</a></section>`;
    body.querySelector('#downloadRecovery').onclick=()=>downloadRecovery();
    installRestoreUI(body);
    body.querySelectorAll('.switch').forEach(sw => sw.onclick = () => {
      const k = sw.dataset.k; S[k] = !S[k]; sw.classList.toggle('on', S[k]); sw.setAttribute('aria-checked',String(S[k])); saveSettings(); applySettings();
    });
    body.querySelector('#langSel').onchange = e => { setLang(e.target.value); };
    body.querySelector('#resetProgress').onclick = () => { state.done.clear(); saveSettings(); updateProgress(); renderRail(); log(T('progress_reset'), 'sys'); };
  } else if (kind === 'language') {
    title.textContent = T('language'); sub.textContent = '';
    body.innerHTML = LANGS.map(l => `<button class="lang-row ${l.code === state.settings.lang ? 'on' : ''}" data-c="${l.code}">
      <span class="lang-code">${l.short || l.code.toUpperCase()}</span>
      <div><div class="lang-native">${l.name.toUpperCase()}</div><div class="lang-en">${l.en}</div></div>
      <svg class="lang-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M4 12l5 5L20 7"/></svg>
    </button>`).join('');
    body.querySelectorAll('.lang-row').forEach(r => r.onclick = () => setLang(r.dataset.c));
  } else if (kind === 'thermal') {
    title.textContent=T('heat_title');sub.textContent=T('heat_subtitle');
    body.innerHTML=`<div class="comp-desc">${T('heat_description')}</div><label class="set-row" for="heatDistance"><span>${T('heat_distance')}</span><output id="heatDistanceValue" dir="ltr">${Math.round(api._heatDistance)} cm</output></label><input id="heatDistance" type="range" min="5" max="40" step="1" value="${Math.round(api._heatDistance)}" style="width:100%;accent-color:var(--teal)"><label class="set-row" for="heatPower"><span>${T('heat_power')}</span><input id="heatPower" type="checkbox" role="switch" ${api._heat?'checked':''}></label><button type="button" class="inspector-focus" id="heatFocus">⊙ ${T('focus_component')}</button>`;
    body.querySelector('#heatDistance').oninput=e=>{api.setHeatDistance(e.target.value,api);body.querySelector('#heatDistanceValue').textContent=e.target.value+' cm';};
    body.querySelector('#heatPower').onchange=e=>{api._heat=e.target.checked;};
    body.querySelector('#heatFocus').onclick=()=>focusComponent(cur.scene.refs.heat);
  } else if (kind === 'component' && data) {
    title.textContent = data.title.toUpperCase(); sub.textContent = '';
    body.innerHTML = `<div class="comp-row"><span class="comp-ic">${ICON.chip}</span><div><div class="comp-desc">${data.desc}</div></div></div>`;
  }
  body.scrollTop = 0; sh.classList.add('open');
  $('#sheetClose').focus({preventScroll:true});
  if (innerWidth >= 1024) {
    // Keep popovers inside both the viewport and the clipped main container.
    const parentTop = sh.offsetParent ? sh.offsetParent.getBoundingClientRect().top : 0;
    const minTopVp = Math.max(12, parentTop + 8);
    const topVp = anchor ? anchor.getBoundingClientRect().top - 6 : minTopVp;
    sh.style.maxHeight = Math.min(456,innerHeight - minTopVp - 12) + 'px';
    sh.style.top = (Math.max(minTopVp, topVp) - parentTop) + 'px';
    requestAnimationFrame(() => {
      const hh = sh.offsetHeight;
      const finalTopVp = Math.max(minTopVp, Math.min(topVp, innerHeight - hh - 12));
      sh.style.top = (finalTopVp - parentTop) + 'px';
      sh.style.maxHeight = Math.min(456,innerHeight - finalTopVp - 12) + 'px';
    });
  }
}
document.addEventListener('pointerdown', e => {
  if(e.target.closest('#focusMap'))return;
  const sh = $('#sheet');
  if (state.sheet && sh.classList.contains('open') && !sh.contains(e.target) && !e.target.closest('.nav-btn') && !e.target.closest('.toolbar')) { closeSheet(false); }
});

function applySettings() {
  document.documentElement.classList.toggle('reduce-motion',state.settings.reduceMotion);
  grid.visible = false;
  canvas.parentElement.classList.toggle('no-grid', !state.settings.grid);
  schPanel.setOpen(!!state.settings.schematic);
  updateWiringCue();
  rebuildTags();
  if (!state.settings.sound) tone(0);
  document.querySelector('.tool-btn[data-k="waveT"]')?.classList.toggle('on', state.settings.flow);
  document.querySelector('.tool-btn[data-k="schematic"]')?.classList.toggle('on',state.settings.schematic);
}

// ---------- language ----------
const localeCache = { en: null };
async function setLang(code, opts = {}) {
  state.settings.lang = code; saveSettings();
  if (code !== 'en' && !(code in localeCache)) {
    try { localeCache[code] = (await import(`./locales/${code}.js`)).default; }
    catch { localeCache[code] = null; }
  }
  setLocaleData(localeCache[code] || null);
  applyLang(code);
  renderNavs();
  document.querySelectorAll('.nav-badge').forEach(b=>b.textContent=code.toUpperCase().slice(0,2));
  loadLesson(state.lesson, true);   // rebuilds panel, rail, callout tags with translated text
  if (!opts.silent) openSheet('language');
}

// ---------- clock ----------
function tickClock() {
  const d = new Date();
  $('#clockDate').textContent = d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase();
  $('#clockTime').textContent = d.toLocaleTimeString('en-GB');
}
setInterval(tickClock, 1000);

// ---------- loop ----------
const idle = { t: 0 };
let last = performance.now();
function loop(now) {
  const dt = Math.min(.05, (now - last) / 1000); last = now;
  idle.t += dt;
  if (state.settings.turntable && idle.t > 5) rig.tAz += dt * .25;
  applyCam(dt);
  cur.sim?.tick?.(dt);
  // flow dots ride their wires
  if (state.settings.flow && cur.scene) {
    cur.scene.wires.forEach(w => { if (w.dot.visible) { w._t = ((w._t ?? 0) + dt * .9) % 1; w.dot.position.copy(w.curve.getPoint(w._t)); } });
  }
  if(focusObject){const center=focusObject.getWorldPosition(new THREE.Vector3());focusMarker.position.set(center.x+4,0,center.z);}
  renderer.render(scene, camera);
  placeTags();
  drawFocusMap();
  requestAnimationFrame(loop);
}
function resize() {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h; camera.updateProjectionMatrix();
}
addEventListener('resize', resize);
const stageResizeObserver=new ResizeObserver(() => { resize(); if (state.lesson != null) frameScene(); });stageResizeObserver.observe($('#stageWrap'));stageResizeObserver.observe(canvas);
let rsT; addEventListener('resize', () => { const guide=$('#blinkGuide'); if(guide){if(innerWidth<1024)$('#stageWrap').append(guide);else $('#panelBody').insertBefore(guide,$('#panelBody .code-card'));} clearTimeout(rsT); rsT = setTimeout(() => { resize(); frameScene(); renderRail(); }, 250); });

// ---------- boot ----------
async function boot() {
  const fillEl = $('#loadFill'), stepEl = $('#loadStep');
  const steps = ['Warming up the renderer', 'Etching the PCB', 'Placing components', 'Routing wires', 'Writing lesson cards'];
  for (let i = 0; i < steps.length; i++) { stepEl.textContent = steps[i]; fillEl.style.width = ((i + 1) / (steps.length + 1) * 100) + '%'; await sleep(state.settings.reduceMotion ? 30 : 240); }
  try {
    if (state.settings.lang && state.settings.lang !== 'en') await setLang(state.settings.lang, { silent: true });
    resize(); renderNavs(); updateProgress(); applySettings(); tickClock(); loadLesson(0); frameScene(true);
    requestAnimationFrame(loop);
    fillEl.style.width = '100%';
    await sleep(220);
    document.documentElement.classList.remove('is-loading');
    $('#loader').classList.add('done');
    $('#app').setAttribute('aria-hidden', 'false');
  } catch (err) {
    stepEl.textContent = 'Something failed to load — ' + err.message;
    console.error(err);
  }
}
boot();
