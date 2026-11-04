// Learn ESP32 — app shell. Original code.
import * as THREE from 'three';
import { buildBoard, BOARD, MAT, box, cyl } from './scene.js';
import * as C from './components.js';
import { SCENES, BOARD_POS, BB_POS } from './scenes.js';
import { LESSONS, BOARD_SPECS } from './lessons.js';
import { LANGS, T, applyLang, currentLang, setLocaleData, trLesson, trTag, trTagDesc } from './i18n.js';
import { createSchematicPanel } from './schematic.js';

const $ = s => document.querySelector(s);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const state = {
  lesson: 0, tab: 'overview', running: false, sim: null, scene: null,
  settings: { labels: true, flow: true, grid: true, turntable: false, sound: true, reduceMotion: false, schematic: false, lang: 'en' },
  done: new Set(), sheet: null, startedAt: 0,
};
try { Object.assign(state.settings, JSON.parse(localStorage.getItem('esp32:settings') || '{}'));
  (JSON.parse(localStorage.getItem('esp32:done') || '[]')).forEach(i => state.done.add(i)); } catch {}
const saveSettings = () => { try { localStorage.setItem('esp32:settings', JSON.stringify(state.settings)); localStorage.setItem('esp32:done', JSON.stringify([...state.done])); } catch {} };
if (matchMedia('(prefers-reduced-motion: reduce)').matches && localStorage.getItem('esp32:settings') === null) state.settings.reduceMotion = true;

// ---------- renderer ----------
const canvas = $('#stage');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf6eddd);
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
grid.material.transparent = true; grid.material.opacity = .5; grid.position.y = .05; scene.add(grid);

// ---------- camera rig ----------
const rig = { target: new THREE.Vector3(6, 6, 6), az: -.62, pol: 1.07, dist: 210, tAz: -.62, tPol: 1.07, tDist: 210, tTarget: new THREE.Vector3(6, 6, 6) };
function applyCam(dt) {
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
canvas.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY, tx: rig.tTarget.x, tz: rig.tTarget.z, moved: 0 }; canvas.setPointerCapture(e.pointerId); });
canvas.addEventListener('pointermove', e => {
  if (drag) {
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag.moved += Math.abs(dx) + Math.abs(dy);
    const s = rig.dist / 700;
    const ca = Math.cos(rig.az), sa = Math.sin(rig.az);
    rig.tTarget.x = drag.tx - (dx * ca - dy * sa) * s;
    rig.tTarget.z = drag.tz - (-dx * sa - dy * ca) * s;
    idle.t = 0;
  }
});
canvas.addEventListener('pointerup', e => { if (drag && drag.moved < 6) pickAt(e); drag = null; });
canvas.addEventListener('wheel', e => { e.preventDefault(); rig.tDist = Math.min(420, Math.max(90, rig.tDist * (1 + Math.sign(e.deltaY) * .09))); idle.t = 0; }, { passive: false });
addEventListener('keydown', e => {
  if (e.key === 'q' || e.key === 'Q') { rig.tAz += .3; idle.t = 0; }
  if (e.key === 'e' || e.key === 'E') { rig.tAz -= .3; idle.t = 0; }
});

// ---------- board + lesson scene ----------
const board = buildBoard(); board.group.position.copy(BOARD_POS); scene.add(board.group);
const bboard = C.breadboard(); bboard.position.copy(BB_POS); scene.add(bboard);
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
  serial: t => log(t), tone,
  setBuiltin: on => { board.builtinLed.material = on ? new THREE.MeshStandardMaterial({ color: 0x5aa0ec, emissive: 0x2a6ae0, emissiveIntensity: 1.8 }) : MAT.blueLed; },
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
let tagDivs = [];
function rebuildTags() {
  tagsEl.innerHTML = ''; tagDivs = [];
  leadersEl.innerHTML = '';
  if (typeof partTag !== 'undefined') tagsEl.appendChild(partTag); // hover label survives rebuilds
  const rt = document.createElement('div'); rt.className = 'tag mini live'; rt.id = 'runTag'; rt.style.display = 'none';
  tagsEl.appendChild(rt);
  if (!state.settings.labels) return;
  const list = cur.scene?.tags || [];
  list.forEach(t => {
    const dot = document.createElement('span'); dot.className = 'tag-dot'; tagsEl.appendChild(dot);
    const d = document.createElement('button'); d.className = 'tag';
    d.innerHTML = `<span class="tag-ic">${ICON[t.i || 'pins']}</span><span class="tag-tx"><b>${trTag(t.label)}</b>${t.d ? `<i>${trTagDesc(t.label, t.d)}</i>` : ''}</span>`;
    if (t.click) d.addEventListener('click', () => cur.scene.onClick?.(t.click, api));
    tagsEl.appendChild(d);
    const ln = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    leadersEl.appendChild(ln);
    tagDivs.push({ d, t, dot, ln });
  });
}
function placeTags() {
  const r = canvas.getBoundingClientRect();
  const v = new THREE.Vector3();
  const wide = r.width >= 700; // desktop: cards offset to the side; mobile: pill above anchor
  tagDivs.forEach(({ d, t, dot, ln }) => {
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
      cy = ay - h / 2 - 40;
      if (cy - h / 2 < 8) cy = ay + h / 2 + 40;
    } else { cx = ax; cy = ay - 26; }
    d._x = cx; d._y = cy;
  });
  // de-overlap: nudge colliding cards apart
  const vis = tagDivs.map(o => o.d).filter(d => d.style.display !== 'none');
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
  const rt2 = $('#runTag');
  if (rt2 && rt2.style.display !== 'none' && cur.scene?.wires?.length) {
    // anchor the run tag above the first signal wire's midpoint
    const w = cur.scene.wires.find(w => w.dot.visible) || cur.scene.wires[0];
    const p = w.curve.getPoint(.5).project(camera);
    rt2.style.left = ((p.x * .5 + .5) * r.width + 30) + 'px'; rt2.style.top = ((-p.y * .5 + .5) * r.height - 34) + 'px';
  }
}

// hover board parts
canvas.addEventListener('pointermove', e => {
  if (drag) return;
  const r = canvas.getBoundingClientRect();
  mouseV.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(mouseV, camera);
  const hits = ray.intersectObjects(Object.values(board.parts), false);
  const part = hits[0]?.object.userData.part;
  hoverPart = part || null;
  const hp = $('#partTag');
  if (part && state.settings.labels) {
    hp.textContent = part.label; hp.style.display = 'flex';
    hp.style.left = (e.clientX - r.left) + 'px'; hp.style.top = (e.clientY - r.top - 34) + 'px';
  } else hp.style.display = 'none';
});

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
      if (id) { cur.scene.onClick?.(id, api); return; }
    }
  }
  const hits = ray.intersectObjects(Object.values(board.parts), false);
  const part = hits[0]?.object.userData.part;
  if (part) openPartInfo(part);
}

// ---------- part info popover ----------
const partTag = document.createElement('div'); partTag.className = 'tag mini live'; partTag.id = 'partTag'; partTag.style.display = 'none'; partTag.style.pointerEvents = 'none';
tagsEl.appendChild(partTag);
function openPartInfo(part) {
  openSheet('component', { title: part.label, desc: part.desc });
}

// ---------- scene container ----------
class LessonScene {
  constructor() { this.root = new THREE.Group(); this.refs = {}; this.wires = []; this.tags = []; this.api = {}; this.tagParts = false; }
  add(mesh, id) { mesh.userData._clickId = id; this.refs[id] = mesh; this.root.add(mesh); }
}

function loadLesson(i, keepTab) {
  schPanel.setLesson(LESSONS[i].id, trLesson(LESSONS[i]).heading);
  $('#panel').classList.remove('open');
  stopSim();
  state.lesson = i;
  lessonGroup.clear();
  const ls = new LessonScene();
  const def = SCENES[LESSONS[i].sim];
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
  const box = new THREE.Box3().setFromObject(board.group)
    .union(new THREE.Box3().setFromObject(lessonGroup));
  if (bboard.visible) box.union(new THREE.Box3().setFromObject(bboard));
  if (box.isEmpty()) return;
  const c = box.getCenter(new THREE.Vector3());
  const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1, aspect = w / h;
  rig.tTarget.set(c.x, aspect < 1 ? c.y * .9 : Math.max(2, c.y * .55), c.z);
  // Projective fit: place a probe camera, project every box corner to NDC,
  // grow distance until the full silhouette clears the viewport minus room
  // reserved for callout pills at the edges. Verified in pixels, not approximated.
  // true silhouette bounds: sample world-space vertices of every visible mesh
  const pts = [];
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
  if (!bboard.visible && aspect < 1) dist *= .88; // board-only lesson on portrait: fill the frame like the reference (near-plane perspective clips if tighter)
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
      .replace(/\b(pinMode|digitalWrite|digitalRead|analogRead|analogWrite|ledcWrite|ledcAttach|ledcTone|touchRead|pulseIn|Serial|println|print|begin|delay|delayMicroseconds|map|setup|loop|Wire)\b/g, '<span class="tok-fn">$1</span>')
      .replace(/(?<![\w#>])(\d+\.?\d*)/g, '<span class="tok-num">$1</span>')
      .replace(/\b([A-Z_][A-Z0-9_]{2,})\b/g, '<span class="tok-num">$1</span>');
    if (com) code += '<span class="tok-com">' + com + '</span>';
    return `<span class="code-line"><span class="code-ln">${i + 1}</span><span>${code || ' '}</span></span>`;
  }).join('');
}

// ---------- panel ----------
const TABS = ['overview', 'pinout', 'example', 'specifications'];
function renderPanel() {
  const L = trLesson(LESSONS[state.lesson]);
  $('#tabbar').innerHTML = TABS.map(t => `<button class="tab ${state.tab === t ? 'on' : ''}" role="tab" data-tab="${t}">${T('tab_' + t)}</button>`).join('');
  document.querySelectorAll('.tab').forEach(b => b.onclick = () => {
    const wasOpen = $('#panel').classList.contains('open') && state.tab === b.dataset.tab;
    state.tab = b.dataset.tab;
    if (innerWidth < 1024) $('#panel').classList.toggle('open', !wasOpen);
    renderPanel();
  });
  const body = $('#panelBody');
  let h = '';
  if (state.tab === 'overview') {
    h = `<div class="lesson-head"><div class="lesson-title">${L.heading.toUpperCase()}</div><button class="icon-btn fs-btn" id="btnFs" title="Fullscreen lesson">${ICON.expand}</button></div>
      <p class="lesson-lede">${L.lede}</p>
      <ul class="feature-list">${L.features.map(([ic, tx]) => `<li><span class="fi">${ICON[ic]}</span><span>${tx}</span></li>`).join('')}</ul>`;
  } else if (state.tab === 'pinout') {
    h = `<div class="pinout">${L.pinout.map(([pin, name, desc, c]) => `<div class="pin-row"><span class="pin-chip" style="background:${c}">${pin}</span><span class="pin-name">${name}</span><span class="pin-desc">${desc}</span></div>`).join('')}</div>`;
  } else if (state.tab === 'example') {
    h = `<div class="example">${L.example.map(p => `<p>${p}</p>`).join('')}</div>`;
  } else {
    h = `<div class="specs">${L.specs.map(([k, v]) => `<div class="spec-row"><b>${k}</b><span>${v}</span></div>`).join('')}</div>`;
  }
  h = `<div class="tab-card">${h}</div>`;
  h += `<div class="code-card">
    <div class="code-head"><span class="code-title">${T('try_it')}</span><span class="code-actions">
      <button class="icon-btn" id="btnCopy" title="Copy code"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg></button>
      <button class="icon-btn primary" id="btnRun" title="Run sketch"><svg viewBox="0 0 24 24" fill="currentColor" id="runIcon"><path d="M8 5v14l11-7z"/></svg></button>
    </span></div>
    <div class="code-pre">${hl(L.code)}</div>
    <div class="console" id="console"><div class="c-line c-sys">${T('console_idle')}</div></div>
  </div>`;
  body.innerHTML = h;
  $('#btnFs') && ($('#btnFs').onclick = () => {
    const p = $('#panel'), on = p.classList.toggle('full');
    $('#btnFs').innerHTML = on ? ICON.collapse : ICON.expand;
  });
  $('#btnCopy').onclick = () => { navigator.clipboard?.writeText(L.code); log(T('copied'), 'sys'); };
  $('#btnRun').onclick = () => state.running ? stopSim() : startSim();
}
function log(t, cls = '') {
  const c = $('#console'); if (!c) return;
  const d = document.createElement('div'); d.className = 'c-line ' + (cls ? 'c-' + cls : ''); d.textContent = t;
  c.appendChild(d); c.scrollTop = c.scrollHeight;
  while (c.children.length > 40) c.firstChild.remove();
}

// ---------- run / stop ----------
function startSim() {
  if (state.running) return;
  state.running = true; state.startedAt = performance.now();
  $('#runIcon').innerHTML = '<rect x="6" y="6" width="12" height="12" rx="2"/>';
  log(T('uploading'), 'sys');
  cur.sim.start();
  setTimeout(() => { // mark lesson done after a real run
    if (state.running) { state.done.add(state.lesson); saveSettings(); renderRail(); updateProgress(); }
  }, 3000);
}
function stopSim() {
  if (!state.running) return;
  state.running = false;
  const ic = $('#runIcon'); if (ic) ic.innerHTML = '<path d="M8 5v14l11-7z"/>';
  cur.sim?.stop(); tone(0);
  log(T('stopped'), 'sys');
}

// ---------- lessons rail + thumbnails ----------
let thumbRenderer = null;
function thumbFor(i) {
  if (!thumbRenderer) {
    thumbRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    thumbRenderer.setSize(300, 128);
  }
  const ts = new THREE.Scene();
  ts.add(new THREE.HemisphereLight(0xfff4e0, 0xcbb894, 1.2));
  const d = new THREE.DirectionalLight(0xfff0dd, 2); d.position.set(30, 60, 40); ts.add(d);
  const hero = { board: null, blink: 'led', button: 'btn', pot: 'pot', rgb: 'rgb', light: 'ldr', distance: 'us', sound: 'bz', piano: 'keys', motor: 'motor', temp: 'tmp', servo: 'servo', stepper: 'stepper', plant: 'plant', force: 'fsr', project: 'tl' }[LESSONS[i].id];
  let m;
  if (LESSONS[i].id === 'board') { const b = buildBoard(); m = b.group; m.scale.setScalar(.8); }
  else m = { led: C.led5mm(0xe8392e), btn: C.pushButton(), pot: C.potentiometer(), rgb: C.rgbLed(), ldr: C.ldr(), us: C.ultrasonic(), bz: C.buzzer(), keys: C.pianoKeys(8), motor: C.dcMotor(), tmp: C.tmp36(), servo: C.servo(), stepper: C.stepper(), plant: (() => { const p = new THREE.Group(); p.add(cyl(8, 6.4, 9, new THREE.MeshStandardMaterial({ color: 0xb96b45 }), 0, 4.5, 0)); const l = new THREE.Mesh(new THREE.SphereGeometry(3.4, 10, 8), new THREE.MeshStandardMaterial({ color: 0x4d9a51 })); l.scale.set(1, 2.2, .5); l.position.y = 13; p.add(l); return p; })(), fsr: C.fsr(), tl: C.trafficLight() }[hero];
  ts.add(m);
  const bb6 = new THREE.Box3().setFromObject(m); const c6 = bb6.getCenter(new THREE.Vector3()); const sz = bb6.getSize(new THREE.Vector3()).length();
  const cam = new THREE.PerspectiveCamera(30, 300 / 128, 1, 2000);
  cam.position.set(c6.x + sz * .7, c6.y + sz * .75, c6.z + sz * .9); cam.lookAt(c6);
  thumbRenderer.render(ts, cam);
  const url = thumbRenderer.domElement.toDataURL();
  m.traverse(o => { o.geometry?.dispose?.(); });
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
    </button>`).join('') + `<span class="rail-arrow"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg></span>`;
  rail.querySelectorAll('.lesson-card').forEach(c => c.onclick = () => loadLesson(+c.dataset.i));
  requestAnimationFrame(() => rail.querySelector('.lesson-card.on')?.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'center' }));
  // fill thumbs lazily
  rail.querySelectorAll('img[data-thumb]').forEach(img => {
    const i = +img.dataset.thumb;
    if (!img.src) setTimeout(() => { img.src = thumbFor(i); }, 30 * i);
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
  home: I('<path d="M3 11l9-8 9 8M5 10v10h14V10"/>'),
  lessons: I('<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5zM4 20.5V5.5"/><path d="M8 7h8M8 10h6"/>'),
  comp: I('<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/>'),
  play: I('<path d="M8 5v14l11-7z"/>', true),
  settings: I('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.9 2.9l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.9-2.9l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.9-2.9l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.9 2.9l-.1.1a1.7 1.7 0 0 0-.3 1.9V9c.3.8 1 1.4 1.9 1.4h.1a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'),
  globe: I('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/>'),
  reset: I('<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>'),
  rotL: I('<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>'),
  rotR: I('<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>'),
  minus: I('<path d="M5 12h14"/>'),
  plus: I('<path d="M12 5v14M5 12h14"/>'),
  info: I('<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>'),
  up3d: I('<path d="M12 3l7 4v10l-7 4-7-4V7l7-4z"/><path d="M12 11l7-4M12 11v10M12 11L5 7"/>'),
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
  ['reset', 'Reset view', 'reset'], ['rotL', 'Turn left', 'rotL'], ['minus', 'Zoom out', 'minus'], ['plus', 'Zoom in', 'plus'],
  ['info', 'About this view', 'info'], ['up3d', 'Reset angle', 'up3d'], ['waveT', 'Current flow', 'waveT'],
].map(([k, a, ic]) => `<button class="tool-btn ${k === 'waveT' && state.settings.flow ? 'on' : ''}" data-k="${k}" aria-label="${a}">${ICON[ic]}</button>`).join('');
toolbar.querySelectorAll('.tool-btn').forEach(b => b.onclick = () => {
  const k = b.dataset.k; idle.t = 0;
  if (k === 'reset') { rig.tAz = -.62; rig.tPol = 1.07; frameScene(); }
  if (k === 'rotL') rig.tAz += .5;
  if (k === 'rotR') rig.tAz -= .5;
  if (k === 'minus') rig.tDist = Math.min(420, rig.tDist * 1.15);
  if (k === 'plus') rig.tDist = Math.max(90, rig.tDist * .87);
  if (k === 'up3d') { rig.tAz = -.62; rig.tPol = 1.07; }
  if (k === 'info') openPartInfo({ label: 'Learn ESP32', desc: 'Sixteen interactive lessons on the ESP32: wire it, run the code, watch it work. Design inspired by Learn Arduino by Dilum Sanjaya; this is an original ESP32 implementation.' });
  if (k === 'waveT') { state.settings.flow = !state.settings.flow; b.classList.toggle('on', state.settings.flow); saveSettings(); }
});

// ---------- navs ----------
function renderNavs() {
  const items = [
    ['home', 'Home', 'home', () => loadLesson(0)],
    ['lessons', 'Lessons', 'lessons', () => $('#lessonRail').scrollIntoView({ behavior: state.settings.reduceMotion ? 'auto' : 'smooth' })],
    ['comp', 'Components', 'comp', el => openSheet('components', null, el)],
    ['play', 'Simulator', 'play', () => state.running ? stopSim() : startSim()],
    ['settings', 'Settings', 'settings', el => openSheet('settings', null, el)],
    ['lang', 'Language', 'globe', el => openSheet('language', null, el), 'EN'],
  ];
  $('#bottomnav').innerHTML = items.map(([k, a, ic, , badge]) =>
    `<button class="nav-btn" data-k="${k}" aria-label="${a}">${ICON[ic]}<span class="nl">${T('nav_' + k)}</span>${badge ? `<span class="nav-badge" id="langBadge">${badge}</span>` : ''}</button>`).join('');
  $('#sidebar').innerHTML = `<button class="nav-btn side-toggle" data-k="toggle" aria-label="Expand sidebar" title="Expand">${ICON.chevR}</button>` + items.slice(0, 6).map(([k, a, ic]) =>
    `<button class="nav-btn" data-k="${k}" aria-label="${a}" title="${a}">${ICON[ic]}<span class="nl">${T('nav_' + k)}</span></button>`).join('');
  document.querySelectorAll('.nav-btn[data-k]').forEach(b => { const fn = items.find(x => x[0] === b.dataset.k)?.[3]; b.onclick = () => fn?.(b); });
  const tog = $('#sidebar .side-toggle');
  tog.onclick = () => {
    const sb = $('#sidebar'), on = sb.classList.toggle('expanded');
    $('#app').classList.toggle('side-open', on);
    tog.innerHTML = on ? ICON.chevL : ICON.chevR;
    tog.setAttribute('aria-label', on ? 'Collapse sidebar' : 'Expand sidebar');
    setTimeout(() => { resize(); frameScene(); }, 60);
    setTimeout(() => { resize(); frameScene(); }, 350);
  };
}

// ---------- sheets ----------
function openSheet(kind, data, anchor) {
  const sh = $('#sheet'), title = $('#sheetTitle'), sub = $('#sheetSub'), body = $('#sheetBody');
  if (state.sheet === kind && !data) { sh.classList.remove('open'); state.sheet = null; return; }
  state.sheet = kind;
  if (kind === 'components') {
    title.textContent = T('components'); sub.textContent = `${12 + state.lesson} ${T('in_view')}`;
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
    body.innerHTML = comps.map(([n, d, ic]) => `<div class="comp-row"><span class="comp-ic">${ICON[ic]}</span><div><div class="comp-name">${n.toUpperCase()}</div><div class="comp-desc">${d}</div></div></div>`).join('');
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
      `<button class="danger-btn" id="resetProgress">${T('reset_progress')}</button>`;
    body.querySelectorAll('.switch').forEach(sw => sw.onclick = () => {
      const k = sw.dataset.k; S[k] = !S[k]; sw.classList.toggle('on', S[k]); saveSettings(); applySettings();
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
  } else if (kind === 'component' && data) {
    title.textContent = data.title.toUpperCase(); sub.textContent = '';
    body.innerHTML = `<div class="comp-row"><span class="comp-ic">${ICON.chip}</span><div><div class="comp-desc">${data.desc}</div></div></div>`;
  }
  sh.classList.add('open');
  if (innerWidth >= 1024) {
    const top = anchor ? anchor.getBoundingClientRect().top - 6 : 100;
    sh.style.top = Math.max(12, top) + 'px';
    sh.style.maxHeight = 'none';
    requestAnimationFrame(() => { // clamp so the whole popover stays in view
      const hh = sh.offsetHeight;
      const maxTop = Math.max(12, innerHeight - hh - 12);
      sh.style.top = Math.min(Math.max(12, top), maxTop) + 'px';
      sh.style.maxHeight = (innerHeight - 24) + 'px';
    });
  }
}
document.addEventListener('pointerdown', e => {
  const sh = $('#sheet');
  if (state.sheet && sh.classList.contains('open') && !sh.contains(e.target) && !e.target.closest('.nav-btn') && !e.target.closest('.toolbar')) { sh.classList.remove('open'); state.sheet = null; }
});

function applySettings() {
  grid.visible = state.settings.grid;
  schPanel.setOpen(!!state.settings.schematic);
  rebuildTags();
  if (!state.settings.sound) tone(0);
  document.querySelector('.tool-btn[data-k="waveT"]')?.classList.toggle('on', state.settings.flow);
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
  const b = $('#langBadge'); if (b) b.textContent = code.toUpperCase().slice(0, 2);
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
  renderer.render(scene, camera);
  placeTags();
  requestAnimationFrame(loop);
}
function resize() {
  const w = canvas.parentElement.clientWidth, h = canvas.parentElement.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h; camera.updateProjectionMatrix();
}
addEventListener('resize', resize);
new ResizeObserver(() => { resize(); if (state.lesson != null) frameScene(); }).observe($('#stageWrap'));
let rsT; addEventListener('resize', () => { clearTimeout(rsT); rsT = setTimeout(() => frameScene(), 250); });

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
