// Learn ESP32 — schematic view: original SVG wiring diagrams generated per lesson.
// Independent implementation; symbols and layouts are our own artwork.

import { currentLang } from './i18n.js';

const DIAGRAM_UI = {en:['Close','divider'],es:['Cerrar','divisor'],pt:['Fechar','divisor'],fr:['Fermer','diviseur'],de:['Schließen','Spannungsteiler'],it:['Chiudi','partitore'],tr:['Kapat','gerilim bölücü'],id:['Tutup','pembagi tegangan'],zh:['关闭','分压器'],'zh-tw':['關閉','分壓器'],ja:['閉じる','分圧器'],ko:['닫기','분압기'],hi:['बंद करें','वोल्टेज विभाजक'],he:['סגירה','מחלק מתח']};
const diagramUI = () => DIAGRAM_UI[currentLang()] || DIAGRAM_UI.en;

const NOTE_TEXT = {
 en:['SW1 uses the internal pull-up; pressed reads LOW.','Wiper voltage 0–3.3 V → ADC 0–4095.','One PWM channel per colour leg.'],
 es:['SW1 usa la resistencia interna; pulsado lee LOW.','Cursor: 0–3,3 V → ADC 0–4095.','Un canal PWM por cada color.'],
 pt:['SW1 usa o pull-up interno; pressionado lê LOW.','Cursor: 0–3,3 V → ADC 0–4095.','Um canal PWM por cor.'],
 fr:['SW1 utilise le pull-up interne ; appuyé = LOW.','Curseur : 0–3,3 V → ADC 0–4095.','Un canal PWM par couleur.'],
 de:['SW1 nutzt den internen Pull-up; gedrückt = LOW.','Schleifer: 0–3,3 V → ADC 0–4095.','Ein PWM-Kanal pro Farbe.'],
 it:['SW1 usa il pull-up interno; premuto = LOW.','Cursore: 0–3,3 V → ADC 0–4095.','Un canale PWM per colore.'],
 tr:['SW1 dahili pull-up kullanır; basılınca LOW.','Sürgü: 0–3,3 V → ADC 0–4095.','Her renk için bir PWM kanalı.'],
 id:['SW1 memakai pull-up internal; ditekan = LOW.','Penggeser: 0–3,3 V → ADC 0–4095.','Satu kanal PWM untuk tiap warna.'],
 zh:['SW1 使用内部上拉；按下时为 LOW。','滑动端：0–3.3 V → ADC 0–4095。','每种颜色使用一个 PWM 通道。'],
 'zh-tw':['SW1 使用內部上拉；按下時為 LOW。','滑動端：0–3.3 V → ADC 0–4095。','每種顏色使用一個 PWM 通道。'],
 ja:['SW1 は内部プルアップを使用。押すと LOW。','可動端：0–3.3 V → ADC 0–4095。','各色に PWM チャンネルを1つ使用。'],
 ko:['SW1은 내부 풀업 사용. 누르면 LOW.','와이퍼: 0–3.3 V → ADC 0–4095.','색상마다 PWM 채널 하나 사용.'],
 hi:['SW1 आंतरिक पुल-अप का उपयोग करता है; दबाने पर LOW।','वाइपर: 0–3.3 V → ADC 0–4095।','हर रंग के लिए एक PWM चैनल।'],
 he:['SW1 משתמש בנגד משיכה פנימי; בלחיצה LOW.','זחלן: 0–3.3 V → ADC 0–4095.','ערוץ PWM אחד לכל צבע.'],
};
const EXTRA_NOTES = {
 "en": [
  "More light → higher divider voltage.",
  "Internal pull-ups: pressed = LOW.",
  "Fit a flyback diode across the motor.",
  "10 mV/°C; offset 500 mV.",
  "IN1–IN4 drive the coils in sequence.",
  "Both modules share 3V3 and GND.",
  "More pressure → less resistance.",
  "Far: green. Near: red."
 ],
 "es": [
  "Más luz → mayor tensión del divisor.",
  "Pull-ups internos: pulsado = LOW.",
  "Coloca un diodo de protección en el motor.",
  "10 mV/°C; offset de 500 mV.",
  "IN1–IN4 activan las bobinas en secuencia.",
  "Ambos módulos comparten 3V3 y GND.",
  "Más presión → menor resistencia.",
  "Lejos: verde. Cerca: rojo."
 ],
 "pt": [
  "Mais luz → maior tensão no divisor.",
  "Pull-ups internos: pressionado = LOW.",
  "Use um diodo de proteção no motor.",
  "10 mV/°C; offset de 500 mV.",
  "IN1–IN4 ativam as bobinas em sequência.",
  "Os dois módulos compartilham 3V3 e GND.",
  "Mais pressão → menor resistência.",
  "Longe: verde. Perto: vermelho."
 ],
 "fr": [
  "Plus de lumière → tension plus élevée.",
  "Pull-ups internes : appuyé = LOW.",
  "Placez une diode de roue libre sur le moteur.",
  "10 mV/°C ; décalage de 500 mV.",
  "IN1–IN4 activent les bobines en séquence.",
  "Les deux modules partagent 3V3 et GND.",
  "Plus de pression → moins de résistance.",
  "Loin : vert. Proche : rouge."
 ],
 "de": [
  "Mehr Licht → höhere Teilerspannung.",
  "Interne Pull-ups: gedrückt = LOW.",
  "Freilaufdiode parallel zum Motor einbauen.",
  "10 mV/°C; Offset 500 mV.",
  "IN1–IN4 schalten die Spulen nacheinander.",
  "Beide Module teilen sich 3V3 und GND.",
  "Mehr Druck → weniger Widerstand.",
  "Weit: grün. Nah: rot."
 ],
 "it": [
  "Più luce → tensione del partitore maggiore.",
  "Pull-up interni: premuto = LOW.",
  "Monta un diodo di ricircolo sul motore.",
  "10 mV/°C; offset di 500 mV.",
  "IN1–IN4 attivano le bobine in sequenza.",
  "I due moduli condividono 3V3 e GND.",
  "Più pressione → meno resistenza.",
  "Lontano: verde. Vicino: rosso."
 ],
 "tr": [
  "Daha çok ışık → daha yüksek gerilim.",
  "Dahili pull-up: basılınca LOW.",
  "Motora paralel koruma diyodu bağlayın.",
  "10 mV/°C; ofset 500 mV.",
  "IN1–IN4 bobinleri sırayla çalıştırır.",
  "İki modül de 3V3 ve GND kullanır.",
  "Daha çok basınç → daha az direnç.",
  "Uzak: yeşil. Yakın: kırmızı."
 ],
 "id": [
  "Lebih terang → tegangan pembagi naik.",
  "Pull-up internal: ditekan = LOW.",
  "Pasang dioda flyback paralel pada motor.",
  "10 mV/°C; offset 500 mV.",
  "IN1–IN4 mengaktifkan kumparan berurutan.",
  "Kedua modul berbagi 3V3 dan GND.",
  "Tekanan naik → resistansi turun.",
  "Jauh: hijau. Dekat: merah."
 ],
 "zh": [
  "光照越强 → 分压电压越高。",
  "内部上拉：按下时为 LOW。",
  "在电机两端并联续流二极管。",
  "10 mV/°C；偏移 500 mV。",
  "IN1–IN4 依次驱动线圈。",
  "两个模块共用 3V3 和 GND。",
  "压力越大 → 电阻越小。",
  "远：绿灯。近：红灯。"
 ],
 "zh-tw": [
  "光照越強 → 分壓電壓越高。",
  "內部上拉：按下時為 LOW。",
  "在馬達兩端並聯續流二極體。",
  "10 mV/°C；偏移 500 mV。",
  "IN1–IN4 依次驅動線圈。",
  "兩個模組共用 3V3 和 GND。",
  "壓力越大 → 電阻越小。",
  "遠：綠燈。近：紅燈。"
 ],
 "ja": [
  "光が強いほど分圧電圧が上昇。",
  "内部プルアップ：押すと LOW。",
  "モーターに並列で保護ダイオードを接続。",
  "10 mV/°C、オフセット 500 mV。",
  "IN1–IN4 が順番にコイルを駆動。",
  "両モジュールで 3V3 と GND を共有。",
  "圧力が高いほど抵抗が低下。",
  "遠い：緑。近い：赤。"
 ],
 "ko": [
  "빛이 강할수록 분압 전압 상승.",
  "내부 풀업: 누르면 LOW.",
  "모터에 플라이백 다이오드를 병렬 연결.",
  "10 mV/°C, 오프셋 500 mV.",
  "IN1–IN4가 코일을 순서대로 구동.",
  "두 모듈은 3V3와 GND를 공유.",
  "압력이 높을수록 저항 감소.",
  "멀리: 초록. 가까이: 빨강."
 ],
 "hi": [
  "अधिक प्रकाश → अधिक विभाजक वोल्टेज।",
  "आंतरिक पुल-अप: दबाने पर LOW।",
  "मोटर के समानांतर फ्लाइबैक डायोड लगाएँ।",
  "10 mV/°C; ऑफसेट 500 mV।",
  "IN1–IN4 कॉइल को क्रम से चलाते हैं।",
  "दोनों मॉड्यूल में साझा 3V3 और GND।",
  "अधिक दबाव → कम प्रतिरोध।",
  "दूर: हरा। पास: लाल।"
 ],
 "he": [
  "יותר אור → מתח מחלק גבוה יותר.",
  "נגדי משיכה פנימיים: בלחיצה LOW.",
  "חברו דיודת הגנה במקביל למנוע.",
  "10 mV/°C; היסט של 500 mV.",
  "IN1–IN4 מפעילים את הסלילים לפי הסדר.",
  "שני המודולים חולקים 3V3 ו־GND.",
  "יותר לחץ → פחות התנגדות.",
  "רחוק: ירוק. קרוב: אדום."
 ]
};
Object.keys(NOTE_TEXT).forEach(lang=>NOTE_TEXT[lang].push(...EXTRA_NOTES[lang]));
const noteFor = (id, fallback) => { const i=['button','pot','rgb','light','piano','motor','temp','stepper','plant','force','project'].indexOf(id);return i<0?fallback:(NOTE_TEXT[currentLang()]||NOTE_TEXT.en)[i]; };
// Separate text rows keep longer translated notes inside the diagram viewBox.
function noteRows(text, x, y) {
 const rows=[];let line='';for(const word of text.split(' ')){if((line+' '+word).length>43&&line){rows.push(line);line=word;}else line+=(line?' ':'')+word;}if(line)rows.push(line);
 const rtl=currentLang()==='he';
 return {svg:rows.map((row,i)=>`<text class="note" x="${rtl?360:x}" y="${y+i*15}" text-anchor="start" direction="${rtl?'rtl':'ltr'}" unicode-bidi="plaintext">${row}</text>`).join(''),height:rows.length*15+9};
}

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
    pins: ['GPIO14', 'GPIO27', 'GPIO26', 'GPIO25', 'VIN', 'GND', 'GPIO4'],
    parts: [['uln', 216, 120], ['stepper', 336, 120], ['button', 275, 260, 'SW1']],
    pads: { p0: [98, 48], p1: [98, 82], p2: [98, 116], p3: [98, 150], p4: [98, 196], p5: [98, 230], u1: [178, 105], u2: [178, 115], u3: [178, 125], u4: [178, 135], uO: [254, 120], uP: [206, 152], uN: [226, 152], sA: [308, 120], p6: [98, 275], btnA: [245, 260], btnB: [305, 260] },
    wires: [['p0', [140, 48], [140, 105], 'u1'], ['p1', [155, 82], [155, 115], 'u2'], ['p2', [168, 116], [168, 125], 'u3'], ['p3', 'u4'], ['uO', 'sA'], ['p4', [120, 196], [120, 180], [206, 180], 'uP'], ['uN', [226, 196], [98, 230], 'p5'], ['uN', [226, 180]], ['p6', [150, 275], [150, 260], 'btnA'], ['btnB', [320, 260], [320, 230], 'p5']],
    gndAt: [226, 180],
    note: 'IN1–IN4 energise the coils in sequence.',
  },
  plant: {
    pins: ['3V3', 'GND', 'GPIO34', 'GPIO21', 'GPIO22'],
    parts: [['probe', 224, 68], ['oled', 232, 220]],
    pads: { p0: [98, 40], p1: [98, 82], p2: [98, 124], p3: [98, 166], p4: [98, 208], prV: [196, 59], prA: [196, 77], oV: [196, 208], oG: [196, 216], oSD: [196, 224], oSC: [196, 232], g0: [252, 68] },
    wires: [['p0', [140, 40], [140, 59], 'prV'], ['p0', [128, 40], [128, 208], 'oV'], ['prA', [170, 77], [170, 124], 'p2'], ['p3', [150, 166], [150, 224], 'oSD'], ['p4', [175, 208], [175, 232], 'oSC'], ['oG', [150, 216], [150, 258], [118, 258], [118, 82], 'p1'], ['oG', [150, 240]]],
    gndAt: [150, 240],
    note: 'Both modules share 3V3 and GND.',
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

// Compact module diagrams use aligned pin rows so each connection reads left to right.
function moduleDiagram(title, pins, labels, note = '') {
  const top=22, first=58, step=35, bottom=first+(pins.length-1)*step+22;
  const rows=pins.map((pin,i)=>{
    const y=first+i*step;
    return `${T(101,y+4,pin,'pin-t','end')}${W([[108,y],[246,y]])}${T(254,y+4,labels[i],'pin-t','start')}<text class="pinval" data-pin="${pin}" x="172" y="${y-7}"></text>`;
  }).join('');
  const h=bottom+(note?43:18);
  return {svg:`<svg class="sch" viewBox="0 0 380 ${h}" role="img" aria-label="ESP32 · ${title}"><g class="board"><rect class="box" x="18" y="${top}" width="90" height="${bottom-top}" rx="6"/>${T(63,top+15,'ESP32','block-t')}</g><g class="board"><rect class="box" x="246" y="${top+4}" width="112" height="${bottom-top-8}" rx="5"/>${T(302,top+19,title,'block-t')}</g>${rows}${note?T(18,bottom+27,note,'note','start'):''}</svg>`};
}

// Build the SVG for a lesson id. Returns { svg } or null when the lesson has no circuit.
export function buildSchematic(id) {
  const spec = SCH[id];
  if (!spec) return null;
  if(id==='button') {
    const note=noteRows(noteFor(id,spec.note),18,262);
    return {svg:`<svg class="sch" viewBox="0 0 380 ${274+note.height}" role="img" aria-label="ESP32 GPIO27 · SW1 · GPIO26 · 220 Ω · LED"><g class="board"><rect class="box" x="18" y="74" width="96" height="164" rx="7"/>${T(66,93,'ESP32','block-t')}${T(106,127,'GPIO27','pin-t','end')}${T(106,214,'GPIO26','pin-t','end')}</g>${W([[114,123],[235,123],[235,104]])}<text class="pinval" data-pin="GPIO27" x="156" y="115"></text><g class="sym" transform="translate(235 74) rotate(90)">${SYM.button('')}</g>${T(271,74,'SW1','sym-t')}${W([[235,44],[235,33],[299,33],[299,113]])}<g class="sym" transform="translate(299 113)">${SYM.gnd()}</g>${W([[114,210],[176,210]])}<g class="sym" transform="translate(206 210)">${SYM.resistor('R1','220 Ω')}</g>${W([[236,210],[265,210]])}<g class="sym" transform="translate(295 210)">${SYM.led('D1','')}</g>${W([[325,210],[352,210],[352,217]])}<g class="sym" transform="translate(352 217)">${SYM.gnd()}</g>${note.svg}</svg>`};
  }
  if(id==='pot') {
    const note=noteRows(noteFor(id,spec.note),18,226);
    return {svg:`<svg class="sch" viewBox="0 0 380 ${238+note.height}" role="img" aria-label="ESP32 GPIO34 · RV1 · GPIO25 · LED"><g class="board"><rect class="box" x="18" y="56" width="96" height="155" rx="7"/>${T(66,74,'ESP32','block-t')}${T(106,108,'GPIO34','pin-t','end')}${T(106,188,'GPIO25','pin-t','end')}</g>${W([[114,104],[240,104]])}<path class="w" d="M234 100 L242 104 L234 108"/><text class="pinval" data-pin="GPIO34" x="157" y="96"></text><g class="sym" transform="translate(246 104) rotate(90)"><path d="M-36 0 H-18 M18 0 H36"/><path d="M-18 0 l5 -7 l8 14 l8 -14 l8 14 l7 -7"/></g>${W([[246,68],[246,50]])}${T(246,42,'3V3','pin-t')}<g class="sym" transform="translate(246 140)">${SYM.gnd()}</g>${T(280,109,'RV1','val')}${W([[114,184],[190,184]])}<g class="sym" transform="translate(220 184)">${SYM.resistor('R1','220 Ω')}</g>${W([[250,184],[274,184]])}<g class="sym" transform="translate(304 184)">${SYM.led('D1','')}</g>${W([[334,184],[354,184],[354,191]])}<g class="sym" transform="translate(354 191)">${SYM.gnd()}</g>${note.svg}</svg>`};
  }
  if(id==='servo')return moduleDiagram('SERVO',['GPIO13','VIN','GND'],['SIG','5V','GND']);
  if(id==='distance')return moduleDiagram('HC-SR04',['VIN','GPIO5','GPIO18','GND'],['VCC','TRIG','ECHO','GND'],`ECHO: 5 V → 3.3 V · ${diagramUI()[1]}`);
  if(id==='sound')return{svg:`<svg class="sch" viewBox="0 0 380 120" role="img" aria-label="ESP32 GPIO19 · BZ1 · GND"><g class="board"><rect class="box" x="18" y="24" width="100" height="68" rx="7"/>${T(68,43,'ESP32','block-t')}${T(110,70,'GPIO19','pin-t','end')}</g><text class="pinval" data-pin="GPIO19" x="170" y="58"></text>${W([[118,66],[246,66]])}<g class="sym" transform="translate(276 66)">${SYM.buzzer('BZ1')}</g>${W([[306,66],[340,66],[340,74]])}<g class="sym" transform="translate(340 74)">${SYM.gnd()}</g></svg>`};
  if(id==='blink')return{svg:`<svg class="sch" viewBox="0 0 380 112" role="img" aria-label="ESP32 GPIO26 · 220 Ω · LED · GND"><g class="board"><rect class="box" x="16" y="25" width="82" height="56" rx="7"/>${T(57,43,'ESP32','block-t')}${T(90,66,'GPIO26','pin-t','end')}</g><text class="pinval" data-pin="GPIO26" x="126" y="52"></text>${W([[98,62],[170,62]])}<g class="sym" transform="translate(200 62)">${SYM.resistor('R1','220 Ω')}</g>${W([[230,62],[264,62]])}<g class="sym" transform="translate(294 62)">${SYM.led('D1','LED')}</g>${W([[324,62],[350,62],[350,69]])}<g class="sym" transform="translate(350 69)">${SYM.gnd()}</g></svg>`};
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
  if (spec.note) { const note=noteRows(noteFor(id,spec.note),20,h+4);g.push(note.svg);h+=note.height; }
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
      root.querySelector('.sch-close').setAttribute('aria-label',diagramUI()[0]);
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
