// Learn ESP32 — lesson scene assembly + simulation behaviour. Original code.
import * as THREE from 'three';
import { MAT, box, cyl, pinLocal } from './scene.js';
import * as C from './components.js';

export const BOARD_POS = new THREE.Vector3(-38, 0, 25);
export const BB_POS = new THREE.Vector3(38, 0, 0);
export const WIRE = { red: 0xd64a3a, navy: 0x2f3547, orange: 0xe8913a, green: 0x3fbf6a, yellow: 0xe8c53a, purple: 0x6a4fa3, white: 0xf2efe6, teal: 0x1aa3a1 };
const bb = (col, row) => C.bbHole(col, row).add(BB_POS);
const pin = name => pinLocal(name).add(BOARD_POS);
const V = (x, y, z) => new THREE.Vector3(x, y, z);
function wireTo(from, to, color, arch = 16, net = null) {
  const w = C.wire(from, to, color, arch);
  return { mesh: w, dot: C.flowDot(w), curve: w.userData.curve, net };
}

export const SCENES = {
builtin: {
  build(s) {
    s.tags = [
      { at: V(BOARD_POS.x - 24, 6, BOARD_POS.z), label: 'USB PORT', i: 'usb', d: 'Uploads code and powers the board.' },
      { at: V(14 + BOARD_POS.x, 9, BOARD_POS.z), label: 'MICROCONTROLLER', i: 'chip', d: 'ESP32-WROOM-32: dual-core 240 MHz with Wi-Fi and Bluetooth.' },
      { at: pin('D14'), label: 'GPIO PINS', i: 'pins', d: 'Digital in/out, PWM, touch, I\u00b2C and SPI.' },
      { at: pin('D34'), label: 'ADC PINS', i: 'wave', d: 'Analog inputs read sensors from 0 to 4095.' },
      { at: V(BOARD_POS.x - 21.6, 6, BOARD_POS.z), label: 'EN \u00b7 BOOT', i: 'reset', d: 'EN restarts the sketch; BOOT enters upload mode.' },
      { at: V(2 + BOARD_POS.x, 5, 6.2 + BOARD_POS.z), label: 'BUILT-IN LED', i: 'bulb', d: 'Blue LED wired to GPIO2.' },
    ];
    s.tagParts = true;
  },
  sim: api => ({
    running: false,
    start() { this.running = true; api.setBuiltin(true); api.line?.(6); api.serial('Sketch running: LED on GPIO2 → HIGH'); },
    stop() { this.running = false; api.setBuiltin(false); },
    tick() {},
  }),
},
blink: {
  build(s) {
    const led = C.led5mm(C.LED_COLORS.red); led.position.copy(bb(14, 2)); s.add(led, 'led');
    const res = C.resistor(220); res.position.copy(bb(16, 2)); res.position.z += 1.27; s.add(res, 'resistor');
    s.wires.push(wireTo(pin('D26'), bb(11, 2), WIRE.orange, 15, 'D26'), wireTo(pin('GND'), bb(19, 4), WIRE.navy, 12, 'GND'));
    s.tags = [
      { at: pin('D26'), label: 'GPIO26', i: 'bolt', d: 'Your sketch switches it HIGH and LOW.' }, { at: pin('GND'), label: 'GND', i: 'plug', d: 'The return path: current flows back here.' },
      { at: bb(14, 2).add(V(0, 10, 0)), label: 'LED', click: 'led', i: 'bulb', d: 'Lights up whenever GPIO26 goes HIGH.' },
      { at: bb(16, 2).add(V(0, 6, 0)), label: 'RESISTOR', click: 'resistor', i: 'res', d: 'Stops the LED drawing too much current.' },
    ];
    s.api.setLed = on => s.refs.led.userData.setLit(on);
    s.api.ledColor = c => s.refs.led.userData.setColor(c);
    s.api.setResistor = o => { const r = s.refs.resistor, n = C.resistor(o); n.position.copy(r.position); r.removeFromParent();s.add(n, 'resistor'); };
    const cols = [0xe8392e, 0xf2c23a, 0x3fbf6a, 0x3d7be0, 0xf2efe6], ohms = [220, 1000, 10000];
    s.onClick = (what, api) => {
      if (what === 'led') { api._ci = ((api._ci ?? 0) + 1) % cols.length; api.ledColor(cols[api._ci]); }
      if (what === 'resistor') { api._ri = ((api._ri ?? 0) + 1) % ohms.length; api.setResistor(ohms[api._ri]); api.serial(`Resistor: ${ohms[api._ri]} Ω`); }
    };
  },
  sim: api => {
    let t = 0, on = false, dur = [500, 500];
    return {
      running: false,
      start() { this.running = true; t = 0; on = false; api.serial('Uploading… done. Blinking on GPIO26.'); },
      stop() { this.running = false; on = false; api.setLed(false); api.tag(null); api.flow('D26', false); },
      setTiming(a, b) { dur = [a, b]; },
      tick(dt) { if (!this.running) return; t += dt * 1000;
        if (t >= (on ? dur[0] : dur[1])) { t = 0; on = !on; api.setLed(on); api.tag(on ? 'HIGH' : 'LOW'); api.flow('D26', on); api.line?.(on ? 8 : 10); api.serial(`GPIO26 → ${on ? 'HIGH' : 'LOW'}`); } },
    };
  },
},
button: {
  build(s) {
    const btn = C.pushButton(); btn.position.copy(bb(14, 1)); s.add(btn, 'button');
    const led = C.led5mm(C.LED_COLORS.yellow); led.position.copy(bb(18, 7)); s.add(led, 'led');
    s.wires.push(wireTo(pin('D27'), bb(12, 1), WIRE.green, 14, 'D27'), wireTo(pin('D26'), bb(15, 7), WIRE.orange, 15, 'D26'), wireTo(pin('GND'), bb(21, 4), WIRE.navy, 12, 'GND'));
    s.tags = [
      { at: pin('D27'), label: 'GPIO27 · IN', i: 'bolt', d: 'Reads LOW while the button is held.' },
      { at: bb(14, 1).add(V(0, 9, 0)), label: 'BUTTON', click: 'button', i: 'hand', d: 'Click to press and hold.' },
      { at: bb(18, 7).add(V(0, 10, 0)), label: 'LED', i: 'bulb', d: 'Follows the button state.' },
    ];
    s.api.setLed = on => s.refs.led.userData.setLit(on);
    s.api.press = p => s.refs.button.userData.setPressed(p);
    s.onClick = (w, api) => { if (w === 'button') api._press(!api._pressed); };
  },
  sim: api => {
    api._pressed = false;
    const sim = {
      running: false,
      start() { this.running = true; api.line?.(10); api.serial('Sketch running. Press the button.'); },
      stop() { this.running = false; api.setLed(false); api.press(false); api._pressed = false; api.flow('D26', false); },
      tick() {},
    };
    api._press = p => { api._pressed = p; api.press(p);
      if (sim.running) { api.line?.(11); api.setLed(p); api.flow('D26', p); api.serial(p ? 'GPIO27 reads LOW → LED on' : 'Released → HIGH → LED off'); } };
    return sim;
  },
},
pot: {
  build(s) {
    const pot = C.potentiometer(); pot.position.copy(bb(13, 2)); s.add(pot, 'pot');
    const led = C.led5mm(0xf2efe6); led.position.copy(bb(19, 7)); s.add(led, 'led');
    s.wires.push(wireTo(pin('D34'), bb(13, 5), WIRE.green, 14, 'D34'), wireTo(pin('3V3'), bb(10, 1), WIRE.red, 16, '3V3'), wireTo(pin('GND'), bb(16, 1), WIRE.navy, 12, 'GND'), wireTo(pin('D25'), bb(16, 7), WIRE.orange, 14, 'D25'));
    s.tags = [
      { at: pin('D34'), label: 'GPIO34 · ADC', i: 'wave', d: 'Analog input: reads 0 to 4095.' },
      { at: bb(13, 2).add(V(0, 10, 0)), label: 'POT', click: 'pot', i: 'gear', d: 'Click to turn the knob.' },
      { at: bb(19, 7).add(V(0, 10, 0)), label: 'LED', i: 'bulb', d: 'Brightness follows the knob.' },
    ];
    s.api.level = v => { const l = s.refs.led.userData; l.setLit(v > .02); l.body.material.emissiveIntensity = v * 1.7; };
    s.api.knob = a => s.refs.pot.userData.setAngle(a);
    s.onClick = (w, api) => { if (w === 'pot') api._v = (api._v + .34) % 1.02; };
  },
  sim: api => {
    api._v = .5; let acc = 0;
    return {
      running: false,
      start() { this.running = true; api.serial('Sketch running. Click the knob to turn it.'); },
      stop() { this.running = false; api.level(0); api.flow('D25', false); },
      tick(dt) { if (!this.running) return; const v = Math.min(1, api._v);
        api.line?.(12); api.knob(-2.2 + v * 4.4); api.level(v); api.flow('D25', v > .02);
        acc += dt; if (acc > .8) { acc = 0; api.serial(`analogRead(GPIO34) = ${Math.round(v * 4095)}`); } },
    };
  },
},
rgb: {
  build(s) {
    const rgb = C.rgbLed(); rgb.position.copy(bb(15, 2)); s.add(rgb, 'rgb');
    [['D25', 11, WIRE.red], ['D26', 12, WIRE.green], ['D33', 13, 0x4d7de8]].forEach(([p, cr, c]) => s.wires.push(wireTo(pin(p), bb(cr, 2), c, 14, p)));
    s.wires.push(wireTo(pin('GND'), bb(18, 3), WIRE.navy, 12, 'GND'));
    s.tags = [
      { at: pin('D25'), label: 'R·G·B = 25·26·33', i: 'pins', d: 'Three outputs mix one colour.' },
      { at: bb(15, 2).add(V(0, 10, 0)), label: 'RGB LED', click: 'rgb', i: 'bulb', d: 'Click to try the next palette colour.' },
    ];
    s.api.rgb = (r, g, b) => s.refs.rgb.userData.setRGB(r, g, b);
    const pal = [[255, 30, 110], [255, 190, 0], [0, 200, 150], [60, 120, 255], [170, 0, 255], [244, 240, 232]];
    s.onClick = (w, api) => { if (w === 'rgb') { api._pi = ((api._pi ?? -1) + 1) % pal.length; api._c = pal[api._pi]; if (api._run) { api.line?.(10); api.rgb(...api._c); } } };
  },
  sim: api => ({
    running: false,
    start() { this.running = true; api._run = true; api.line?.(10); api.rgb(...(api._c || [255, 30, 110])); api.serial('Mixing colours. Click the LED to change the palette.'); },
    stop() { this.running = false; api._run = false; api.rgb(0, 0, 0); },
    tick() {},
  }),
},
light: {
  build(s) {
    const ldr = C.ldr(); ldr.position.copy(bb(13, 2)); s.add(ldr, 'ldr');
    const res = C.resistor(10000); res.position.copy(bb(15, 2)); res.position.z += 1.27; s.add(res, 'resistor');
    const led = C.led5mm(C.LED_COLORS.yellow); led.position.copy(bb(19, 7)); s.add(led, 'led');
    const torch = C.deskLamp();
    torch.position.set(bb(26,5).x+15,0,bb(26,5).z); s.add(torch,'torch');
    s.wires.push(wireTo(pin('D35'), bb(13, 4), WIRE.green, 14, 'D35'), wireTo(pin('D26'), bb(16, 7), WIRE.orange, 14, 'D26'), wireTo(pin('3V3'), bb(10, 1), WIRE.red, 16, '3V3'), wireTo(pin('GND'), bb(21, 4), WIRE.navy, 12, 'GND'));
    s.tags = [
      { at: pin('D35'), label: 'GPIO35 · ADC', i: 'wave', d: 'Reads the light level.' }, { at: bb(13, 2).add(V(0, 8, 0)), label: 'LDR', i: 'info', d: 'Resistance drops as light rises.' },
      { at: V(bb(26,5).x+15,21,bb(26,5).z), label: 'LAMP', click: 'torch', dyn: 'torch', i: 'bolt', d: 'Click to move it closer.' },
      { at: bb(19, 7).add(V(0, 10, 0)), label: 'NIGHT LIGHT', i: 'bulb', d: 'Turns on when it gets dark.' },
    ];
    s.api.setLed = on => s.refs.led.userData.setLit(on);
    s.onClick = (w, api) => { if (w === 'torch') { api._near = !api._near;
      s.refs.torch.position.x=bb(26,5).x+15-(api._near?10:0); } };
  },
  sim: api => {
    api._near = false; let acc = 0;
    return {
      running: false,
      start() { this.running = true; api.serial('Sketch running. Click the lamp to move it closer.'); },
      stop() { this.running = false; api.setLed(false); },
      tick(dt) { if (!this.running) return; const dark = !api._near; api.line?.(12); api.setLed(dark);
        acc += dt; if (acc > 1) { acc = 0; api.serial(`light = ${dark ? 320 : 3300}${dark ? '  (dark → night light on)' : ''}`); } },
    };
  },
},
distance: {
  build(s) {
    const us = C.ultrasonic(); us.position.copy(bb(15, 6)); s.add(us, 'us');
    const car = C.toyCar(); car.position.set(96, 0, 28); s.add(car, 'car');
    s.wires.push(wireTo(pin('D5'), bb(11, 6), WIRE.yellow, 14, 'D5'), wireTo(pin('D18'), bb(12, 7), WIRE.green, 14, 'D18'), wireTo(pin('VIN'), bb(19, 5), WIRE.red, 16, 'VIN'), wireTo(pin('GND'), bb(20, 8), WIRE.navy, 12, 'GND'));
    s.tags = [
      { at: pin('D5'), label: 'TRIG · GPIO5', i: 'bolt', d: 'Sends the ultrasonic pulse.' }, { at: pin('D18'), label: 'ECHO · GPIO18', i: 'wave', d: 'Listens for the echo.' },
      { at: bb(15, 6).add(V(0, 12, 0)), label: 'HC-SR04', i: 'info', d: 'Measures distance with sound.' },
      { at: V(96, 14, 28), label: 'OBSTACLE', click: 'car', dyn: 'car', i: 'hand', d: 'Click to move it.' },
    ];
    s.api._dist = 30;
    s.onClick = (w, api) => { if (w === 'car') { api._dist = api._dist >= 44 ? 8 : api._dist + 12;
      s.refs.car.position.x = 96 - (44 - api._dist) * 1.1; } };
  },
  sim: api => {
    let acc = 0;
    return {
      running: false,
      start() { this.running = true; api.serial('Measuring. Click the car to move it.'); },
      stop() { this.running = false; },
      tick(dt) { if (!this.running) return; acc += dt; if (acc > .5) { acc = 0; api.line?.(14); api.serial(`${api._dist.toFixed(1)} cm`); } },
    };
  },
},
sound: {
  build(s) {
    const bz = C.buzzer(); bz.position.copy(bb(15, 2)); s.add(bz, 'buzzer');
    s.wires.push(wireTo(pin('D19'), bb(11, 2), WIRE.purple, 14, 'D19'), wireTo(pin('GND'), bb(19, 3), WIRE.navy, 12, 'GND'));
    s.tags = [ { at: pin('D19'), label: 'GPIO19', i: 'bolt', d: 'Plays tones with ledcWriteTone.' }, { at: bb(15, 2).add(V(0, 9, 0)), label: 'BUZZER', i: 'wave', d: 'Turns pulses into sound.' } ];
  },
  sim: api => {
    const seq = [[262, 'C'], [330, 'E'], [392, 'G'], [0, 'rest']]; let i = -1, wait = 0;
    return {
      running: false,
      start() { this.running = true; i = -1; wait = 0; api.serial('Playing C · E · G …'); },
      stop() { this.running = false; api.tone(0); },
      tick(dt) { if (!this.running) return; wait -= dt * 1000;
        if (wait <= 0) { i = (i + 1) % seq.length; const [f, n] = seq[i];
          api.line?.(8+i); api.tone(f); api.serial(f ? `ledcWriteTone(GPIO19, ${f})  // ${n}` : 'ledcWriteTone(GPIO19, 0)  // rest');
          wait = f ? 400 : 600; } },
    };
  },
},
piano: {
  build(s) {
    const keys = C.pianoKeys(8); keys.position.set(46, 8.7, 5); s.add(keys, 'keys');
    const bz = C.buzzer(); bz.position.copy(bb(6, 2)); s.add(bz, 'buzzer');
    s.wires.push(wireTo(pin('D19'), bb(5, 2), WIRE.purple, 22, 'D19'), wireTo(pin('GND'), bb(7, 2), WIRE.navy, 24, 'GND'));
    const inputs=['D32','D33','D25','D26','D27','D14','D13','D4'];
    inputs.forEach((name,i)=>s.wires.push(wireTo(pin(name),V(46+i*7-24.5,9,1.7),[WIRE.red,WIRE.orange,WIRE.yellow,WIRE.green,WIRE.teal,WIRE.purple,WIRE.navy,WIRE.purple][i],16+i*.8,name)));
    s.wires.push(wireTo(pin('GND'),V(21.5,8.5,9.4),WIRE.navy,20,'GND'));
    s.tags = [ { at: V(46, 16, 5), label: '8 KEYS - TAP TO PLAY', click: 'keys', i: 'hand', d: 'Hold a key to play; release to stop.' }, { at: bb(6, 2).add(V(0, 9, 0)), label: 'BUZZER', i: 'wave', d: 'Turns pulses into sound.' } ];
    s.api.pressKey = (i, on) => s.refs.keys.userData.press(i, on);
    s.pickKey = pt => { const lp = s.refs.keys.worldToLocal(pt.clone());
      const i = Math.round((lp.x + 24.5) / 7);
      return (i >= 0 && i < 8 && Math.abs(lp.z) < 7 && lp.y > -2 && lp.y < 6) ? i : -1; };
  },
  sim: api => ({
    running: false,
    start() { this.running = true; api.serial('Press and hold a coloured button to play; release to stop.'); },
    stop() { this.running = false; clearTimeout(this._t); api.tone(0); api.pressKey(-1, false); },
    release() { clearTimeout(this._t); api.pressKey(-1, false); api.tone(0); },
    note(i, hold = false) { if (!this.running || i < 0) return; const N = [262, 294, 330, 349, 392, 440, 494, 523];
      api.line?.(13); api.pressKey(i, true); api.tone(N[i]); api.serial(`key ${i + 1} → ${N[i]} Hz`);
      clearTimeout(this._t); if (!hold) this._t = setTimeout(() => this.release(), 280); },
    tick() {},
  }),
},
motor: {
  build(s) {
    const m = C.dcMotor(); m.position.set(78, 0, -6); s.add(m, 'motor');
    const tr = C.npn(); tr.position.copy(bb(14, 2)); s.add(tr, 'npn');
    const res = C.resistor(1000); res.position.copy(bb(12, 2)); res.position.z += 1.27; s.add(res, 'resistor');
    s.wires.push(wireTo(pin('D27'), bb(10, 2), WIRE.orange, 14, 'D27'), wireTo(pin('VIN'), V(78, 2, -14), WIRE.red, 16, 'VIN'), wireTo(pin('GND'), bb(17, 4), WIRE.navy, 12, 'GND'), wireTo(bb(16, 2), V(78, 2, 2), WIRE.navy, 18));
    s.tags = [ { at: pin('D27'), label: 'GPIO27 · PWM', i: 'bolt', d: 'PWM sets the motor speed.' }, { at: bb(14, 2).add(V(0, 7, 0)), label: '2N2222', i: 'chip', d: 'Transistor switches the motor current.' }, { at: V(78, 26, -6), label: 'MOTOR', click: 'motor', i: 'gear', d: 'Click to change speed.' } ];
    s.api.spin = v => s.refs.motor.userData.spin(v);
    s.api.tickMotor = dt => s.refs.motor.userData.tick(dt);
    const speeds = [0, 6, 14, 22];
    s.onClick = (w, api) => { if (w === 'motor') { api._si = ((api._si ?? 0) + 1) % speeds.length; api._speed = speeds[api._si]; } };
  },
  sim: api => {
    api._speed = 14;
    return {
      running: false,
      start() { this.running = true; api.serial('Motor on GPIO27. Click it to change speed.'); },
      stop() { this.running = false; api.spin(0); api.flow('D27', false); },
      tick(dt) { if (!this.running) return; api.line?.(api._speed===0?12:api._speed<10?10:8); api.spin(api._speed); api.tickMotor(dt); api.flow('D27', api._speed > 0); },
    };
  },
},
temp: {
  build(s) {
    const t=C.tmp36();t.position.copy(bb(14,2));s.add(t,'tmp');
    const dryer=C.heatGun();dryer.position.set(91,0,7);s.add(dryer,'heat');
    const fan=C.coolingFan();fan.position.set(65,0,-23);s.add(fan,'fan');
    const tr=C.npn();tr.position.copy(bb(20,2));s.add(tr,'npn');
    const r=C.resistor(1000);r.position.copy(bb(18,2));s.add(r,'resistor');
    const diode=new THREE.Group();diode.add(cyl(.3,.3,14,MAT.pinMetal,0,0,0,6));const body=box(2,5,2,MAT.chip,0,0,0);diode.add(body,box(2.1,.7,2.1,MAT.metal,0,1.4,0));diode.rotation.z=Math.PI/2;diode.position.set(65,4,-23);s.add(diode,'diode');
    s.wires.push(wireTo(pin('D32'),bb(14,4),WIRE.green,13,'D32'),wireTo(pin('3V3'),bb(11,1),WIRE.red,15,'3V3'),wireTo(pin('GND'),bb(17,1),WIRE.navy,12,'GND'),wireTo(pin('D27'),bb(17,2),WIRE.orange,15,'D27'),wireTo(pin('VIN'),V(63,3,-23),WIRE.red,16,'VIN'),wireTo(bb(21,2),V(67,3,-23),WIRE.navy,13),wireTo(bb(22,3),bb(17,1),WIRE.navy,8));
    s.tags=[{at:pin('D32'),label:'GPIO32 · ADC',i:'wave',d:'Reads the sensor voltage.'},{at:bb(14,2).add(V(0,8,0)),label:'TMP36',i:'info',d:'Outputs 10 mV per °C.'},{at:V(65,29,-23),label:'FAN',i:'gear',d:'GPIO27 turns it on above 30 °C.'},{at:V(103,5,20),label:'HEAT',click:'heat',i:'bolt',d:'Click to switch the scripted dryer on or off.'}];
    s.api.thermalFan=(dt,on)=>{s.refs.fan.userData.tick(dt,on);};
    s.onClick=(w,api)=>{if(w==='heat')api._heat=!api._heat;};
    let dragStartX=91;
    s.beginDrag=(ray)=>{if(!ray.intersectObject(s.refs.heat,true).length)return false;dragStartX=s.refs.heat.position.x;return true;};
    s.dragTo=(delta,api)=>{const x=Math.max(66,Math.min(91,dragStartX+delta.x));s.refs.heat.position.x=x;api._heatDistance=5+(x-66)/25*55;};
  },
  sim: api=>{
    api._heat=false;api._heatDistance=60;let temp=24,acc=0,fan=false;
    return {running:false,
      start(){this.running=true;api.serial('Scripted thermostat. Drag the dryer closer or farther; click HEAT to switch it on/off.');},
      stop(){this.running=false;fan=false;api.flow('D27',false);},
      tick(dt){if(!this.running)return;temp+=((api._heat?24+28*(1-Math.min(60,Math.max(5,api._heatDistance??30))/75):24)-temp)*Math.min(dt*.45,1)-(fan?5*dt:0);fan=temp>30;api.thermalFan(dt,fan);api.flow('D27',fan);acc+=dt;if(acc>.2){acc=0;api.line?.(fan?14:15);api.serial(`${temp.toFixed(1)} °C · fan ${fan?'ON':'OFF'}`);}}
    };
  },
},
servo: {
  build(s) {
    const sv = C.servo(); sv.position.set(74, 0, 2); sv.rotation.y = .5; s.add(sv, 'servo');
    s.wires.push(wireTo(pin('D13'), V(64, 2, 8), WIRE.orange, 15, 'D13'), wireTo(pin('VIN'), V(68, 2, 12), WIRE.red, 16, 'VIN'), wireTo(pin('GND'), V(60, 2, 12), WIRE.navy, 13, 'GND'));
    s.tags = [ { at: pin('D13'), label: 'GPIO13 · 50 Hz', i: 'bolt', d: '50 Hz pulses set the angle.' }, { at: V(74, 20, 2), label: 'SERVO', click: 'servo', i: 'gear', d: 'Click to change sweep speed.' } ];
    s.api.servo = a => s.refs.servo.userData.setAngle(a);
    s.onClick = (w, api) => { if (w === 'servo') api._rate = ((api._rate ?? 0) + 1) % 3; };
  },
  sim: api => {
    let t = 0; api._rate = 0; const rates = [.7, 1.2, 2];
    return {
      running: false,
      start() { this.running = true; api.serial('Sweeping 0 → 180 → 0. Click the servo to change speed.'); },
      stop() { this.running = false; api.servo(0); },
      tick(dt) { if (!this.running) return; t += dt * rates[api._rate];
        api.line?.(Math.cos(t*1.4)>0?9:13); api.servo(-(Math.sin(t * 1.4) * .5 + .5) * Math.PI); },
    };
  },
},
stepper: {
  build(s) {
    const st=C.stepper();st.position.set(76,0,0);s.add(st,'stepper');
    const drv=C.stepperDriver();drv.position.set(46,9.2,-8);s.add(drv,'drv');
    const btn=C.pushButton();btn.position.copy(bb(9,2));s.add(btn,'btn');
    ['D14','D27','D26','D25'].forEach((p,i)=>s.wires.push(wireTo(pin(p),bb(10+i,5),[WIRE.orange,WIRE.yellow,WIRE.green,WIRE.purple][i],13,p)));
    s.wires.push(wireTo(pin('VIN'),bb(16,6),WIRE.red,15,'VIN'),wireTo(pin('GND'),bb(17,7),WIRE.navy,12,'GND'),wireTo(pin('D4'),bb(8,2),WIRE.white,14,'D4'),wireTo(pin('GND'),bb(10,3),WIRE.navy,10,'GND'));
    s.tags=[{at:pin('D14'),label:'COILS · 14·27·26·25',i:'pins',d:'Four coils energised in sequence.'},{at:V(76,18,0),label:'STEPPER',i:'gear',d:'2048 steps per turn.'},{at:bb(9,2).add(V(0,8,0)),label:'BUTTON',click:'btn',i:'hand',d:'Press to spin the wheel.'}];
    s.api.stepper=a=>s.refs.stepper.userData.setAngle(a);
    s.api.pressButton=on=>s.refs.btn.userData.setPressed(on);
    s.onClick=(w,api)=>{if(w==='btn')api.spinWheel?.();};
  },
  sim: api => {
    let a=0,from=0,target=0,t=0,busy=false,at=0;
    const prizes=['200','100','50','JACKPOT','1000','2×','500','AGAIN'];
    const sim={running:false,
      start(){this.running=true;api.serial('Press the button to spin the wheel!');},
      stop(){this.running=false;busy=false;api.pressButton(false);},
      tick(dt){if(!this.running||!busy)return;t=Math.min(4,t+dt);const u=t/4,e=u*u*(3-2*u);a=from+(target-from)*e;api.stepper(a);api.pressButton(t<.18);api.line?.(16);if(t>=4){busy=false;api.serial('Landed on '+prizes[at]);}},
    };
    api.spinWheel=()=>{if(!sim.running||busy)return;busy=true;t=0;from=a;const next=Math.floor(Math.random()*8);const desired=-(next*Math.PI/4+Math.PI/8)-Math.PI/2;const delta=((desired-a)%(Math.PI*2)+Math.PI*2)%(Math.PI*2);target=a+Math.PI*2+delta;at=next;api.pressButton(true);api.serial('Spinning…');};
    return sim;
  },
},
plant: {
  build(s) {
    const pot=C.pottedPlant();pot.position.set(76,0,4);s.add(pot,'plant');
    const can=C.wateringCan();can.position.set(103,0,11);s.add(can,'water');
    const probe = C.soilProbe(); probe.position.set(72, 6.4, 9); probe.rotation.y = .4; s.add(probe, 'probe');
    const ol = C.oled(); ol.rotation.x=Math.PI/2;ol.position.copy(bb(14,5));ol.position.y=21;s.add(ol,'oled');
    s.wires.push(wireTo(pin('D34'), bb(10, 5), WIRE.green, 14, 'D34'), wireTo(pin('D21'), bb(11, 6), WIRE.purple, 14, 'D21'), wireTo(pin('D22'), bb(12, 7), WIRE.yellow, 14, 'D22'), wireTo(pin('3V3'), bb(17, 4), WIRE.red, 15, '3V3'), wireTo(pin('GND'), bb(18, 8), WIRE.navy, 12, 'GND'));
    s.tags = [ { at: pin('D34'), label: 'SOIL · GPIO34', i: 'wave', d: 'Reads soil moisture.' }, { at: pin('D21'), label: 'I²C · 21/22', i: 'pins', d: 'Bus that drives the OLED display.' }, { at: bb(14, 5).add(V(0, 22, 0)), label: 'OLED', i: 'info', d: 'Shows the moisture level.' }, { at: V(76, 18, 4), label: 'PLANT', click: 'plant', i: 'hand', d: 'Click to water it.' } ];
    s.tags.push({at:V(103,15,11),label:'WATER',click:'water',i:'hand',d:'Click to water the plant.'});
    s.api.oledDraw = fn => s.refs.oled.userData.draw(fn);
    s.onClick = (w, api) => { if (w === 'plant'||w === 'water') api._wet = ((api._wet ?? 1) + 1) % 3; };
  },
  sim: api => {
    api._wet = 1; let acc = 0; const levels = [18, 52, 88];
    const face = m => m < 30 ? 'THIRSTY :(' : m < 65 ? 'OK :|' : 'HAPPY :)';
    return {
      running: false,
      start() { this.running = true; api.serial('Reading the soil. Click the plant to water it.'); },
      stop() { this.running = false; api.oledDraw(c => { c.fillStyle = '#9fd8ff'; c.font = '10px monospace'; c.fillText('ESP32', 46, 34); }); },
      tick(dt) { if (!this.running) return; acc += dt;
        if (acc > 1) { acc = 0; api.line?.(12); const m = levels[api._wet];
          api.oledDraw(c => { c.fillStyle = '#9fd8ff'; c.font = 'bold 13px monospace'; c.fillText('SOIL ' + m + '%', 26, 26); c.font = '10px monospace'; c.fillText(face(m), 34, 46); });
          api.serial(`soil moisture = ${m}%`); } },
    };
  },
},
force: {
  build(s){
    const f=C.fsr();f.position.set(48,0,29);s.add(f,'fsr');
    const meter=C.strengthMeter();meter.position.set(44,0,-25);s.add(meter,'meter');
    const weights=C.weights();weights.position.set(76,0,18);weights.rotation.y=-.7;s.add(weights,'weights');
    const r=C.resistor(10000);r.position.copy(bb(14,2));s.add(r,'resistor');
    const bz=C.buzzer();bz.position.copy(bb(9,2));s.add(bz,'buzzer');
    s.wires.push(wireTo(pin('D35'),V(46,1,19),WIRE.green,13,'D35'),wireTo(pin('3V3'),V(50,1,19),WIRE.red,15,'3V3'),wireTo(V(46,1,19),bb(13,2),WIRE.green,10),wireTo(bb(15,2),pin('GND'),WIRE.navy,12,'GND'),wireTo(pin('D13'),V(44,3,-24),WIRE.orange,16,'D13'),wireTo(pin('VIN'),V(47,3,-24),WIRE.red,17,'VIN'),wireTo(pin('GND'),V(41,3,-24),WIRE.navy,18,'GND'),wireTo(pin('D19'),bb(8,2),WIRE.purple,13,'D19'),wireTo(pin('GND'),bb(10,2),WIRE.navy,12,'GND'));
    s.tags=[{at:V(44,34,-25),label:'STRENGTH',i:'gear',d:'Needle tracks the scripted pressure.'},{at:V(39,1,39),label:'PRESS PAD',click:'fsr',i:'hand',d:'Click to cycle pressure levels.'}];
    s.api.forceMeter=(v)=>{s.refs.meter.userData.setLevel(v);s.refs.fsr.userData.setPress(v);};
    s.onClick=(w,api)=>{if(w==='fsr')api._f=((api._f??0)+1)%5;};
  },
  sim:api=>{api._f=0;let acc=0,last=-1;return{running:false,
    start(){this.running=true;api.serial('Scripted strength meter. Click PRESS PAD to cycle pressure.');},
    stop(){this.running=false;api.forceMeter(0);api.tone(0);},
    tick(dt){if(!this.running)return;const v=api._f/4;api.forceMeter(v);api.line?.(13);if(api._f!==last){last=api._f;api.tone(Math.round(v*4095)>3071?880:0);}acc+=dt;if(acc>.3){acc=0;api.serial(`force = ${Math.round(v*4095)} · bell ${Math.round(v*4095)>3071?'ON':'OFF'}`);}}
  };},
},
project: {
  build(s) {
    const us = C.ultrasonic(); us.position.copy(bb(10, 6)); s.add(us, 'us');
    const tl = C.trafficLight(); tl.position.copy(bb(22, 2)); s.add(tl, 'tl');
    const car = C.toyCar(); car.position.set(96, 0, 28); s.add(car, 'car');
    s.wires.push(wireTo(pin('D5'), bb(7, 6), WIRE.yellow, 13, 'D5'), wireTo(pin('D18'), bb(8, 7), WIRE.green, 13, 'D18'), wireTo(pin('D25'), bb(20, 4), WIRE.red, 14, 'D25'), wireTo(pin('D26'), bb(21, 5), WIRE.orange, 14, 'D26'), wireTo(pin('D33'), bb(22, 6), WIRE.green, 14, 'D33'), wireTo(pin('VIN'), bb(13, 5), WIRE.red, 15, 'VIN'), wireTo(pin('GND'), bb(14, 8), WIRE.navy, 12, 'GND'));
    s.tags = [ { at: bb(10, 6).add(V(0, 12, 0)), label: 'HC-SR04', i: 'info', d: 'Measures distance to the car.' }, { at: bb(22, 2).add(V(0, 28, 0)), label: 'TRAFFIC LIGHT', i: 'bulb', d: 'Green, amber or red by distance.' }, { at: V(96, 14, 28), label: 'CAR', click: 'car', dyn: 'car', i: 'hand', d: 'Click to move it closer.' } ];
    s.api.tl = (r, y, g) => s.refs.tl.userData.set(r, y, g);
    s.api._dist = 40;
    s.onClick = (w, api) => { if (w === 'car') { api._dist = api._dist <= 8 ? 46 : api._dist - 12;
      s.refs.car.position.x = 96 - (46 - api._dist) * 1.1; } };
  },
  sim: api => {
    let acc = 0;
    return {
      running: false,
      start() { this.running = true; api.serial('Parking sensor live. Click the car to move it.'); },
      stop() { this.running = false; api.tl(0, 0, 0); },
      tick(dt) { if (!this.running) return; const d = api._dist;
        api.line?.(d<10?16:d<30?15:14); api.tl(d < 10, d >= 10 && d < 30, d >= 30);
        acc += dt; if (acc > .6) { acc = 0; api.serial(`${d.toFixed(1)} cm → ${d < 10 ? 'STOP' : d < 30 ? 'careful' : 'clear'}`); } },
    };
  },
},
};
