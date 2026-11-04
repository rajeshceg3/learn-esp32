// Learn ESP32 — original lesson content (ESP32 topic). All copy written for this app.
export const BOARD_SPECS = [
  ['Microcontroller', 'ESP32-WROOM-32 (Xtensa dual-core LX6)'],
  ['Clock speed', 'Up to 240 MHz'],
  ['Wireless', 'Wi-Fi 802.11 b/g/n + Bluetooth Classic & LE'],
  ['Operating voltage', '3.3 V (5 V in over USB or VIN)'],
  ['GPIO pins', '30 broken out (input-only: 34, 35, 36, 39)'],
  ['Analog inputs', '12-bit ADC on 15 pins (0–4095)'],
  ['Flash / RAM', '4 MB / 520 KB'],
  ['Touch, I²C, SPI', '10 touch pads · 2× I²C · 3× SPI'],
  ['Size', '≈ 51.5 × 25.5 mm'],
];

export const LESSONS = [
{
  id: 'board', num: 1, title: 'Meet the board', heading: 'ESP32 DevKit',
  lede: 'The ESP32 DevKit is a small board built around the ESP32-WROOM-32 module — a 240 MHz dual-core chip with Wi-Fi and Bluetooth built in. It is friendly to beginners and strong enough for real connected products.',
  features: [['chip', 'Dual-core 240 MHz with Wi-Fi &amp; Bluetooth'], ['bulb', 'Huge community, works with the Arduino IDE'], ['gear', 'Used in learning, hobby builds and<br />shipped products']],
  pinout: [
    ['GPIO 25–27, 12–14', 'Digital I/O', 'Read buttons, drive LEDs. All support PWM via ledc.', '#2a56a3'],
    ['GPIO 32–39', 'Analog in', '12-bit readings, 0–4095 for 0–3.3 V. Input only.', '#1aa3a1'],
    ['3V3 · VIN', 'Power out', '3.3 V logic supply; VIN carries the 5 V USB line.', '#d64a3a'],
    ['GND', 'Ground', 'Every circuit returns here.', '#2f3547'],
    ['GPIO 21 / 22', 'I²C bus', 'SDA / SCL for displays and sensors.', '#6a4fa3'],
    ['EN', 'Reset', 'Pull LOW to restart your code.', '#8e9094'],
  ],
  example: [
    '<code>setup()</code> runs once when the board powers up or resets.',
    '<code>pinMode(LED_BUILTIN, OUTPUT)</code> makes GPIO2 — wired to the on-board blue LED — an output.',
    '<code>loop()</code> then repeats forever. <code>digitalWrite(…, HIGH)</code> puts 3.3 V on the pin and lights the LED.',
    'Press <b>Run</b> to upload: watch the blue LED come on. Click any part of the board to learn what it does.',
  ],
  specs: BOARD_SPECS, code:
`void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
}

void loop() {
  digitalWrite(LED_BUILTIN, HIGH);
  delay(1000);
}`,
  sim: 'builtin',
},
{
  id: 'blink', num: 2, title: 'Blink an LED', heading: 'Blink an LED',
  lede: 'Your first circuit: an LED and a resistor on a breadboard, driven by GPIO26. Switching the pin on and off with a pause in between makes it blink.',
  features: [['pins', 'Digital output with <code>digitalWrite()</code>'], ['res', 'Click the resistor to try other values'], ['clock', 'Click the LED to change its colour and timing']],
  pinout: [['GPIO26', 'LED anode', 'Through the resistor to the LED’s long leg.', '#2a56a3'], ['GND', 'LED cathode', 'The short leg returns to ground.', '#2f3547']],
  example: [
    'A GPIO pin sources up to about 12 mA safely — plenty for an LED through a resistor.',
    '<code>digitalWrite(LED_PIN, HIGH)</code> drives 3.3 V; the resistor drops the rest and sets the current.',
    'The <code>delay()</code> values set the rhythm. Try 900 ms on, 200 ms off.',
  ],
  specs: [['Forward voltage', 'Red ≈ 1.9 V · blue ≈ 3.0 V'], ['Resistor', '220 Ω – 1 kΩ'], ['Pin current', 'Keep under ~12 mA per pin'], ['Absolute max', '3.6 V on any GPIO']],
  code:
`const int LED_PIN = 26;

void setup() {
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  digitalWrite(LED_PIN, HIGH);
  delay(500);
  digitalWrite(LED_PIN, LOW);
  delay(500);
}`,
  sim: 'blink',
},
{
  id: 'button', num: 3, title: 'Push a button', heading: 'Push a button',
  lede: 'Inputs let the board sense the world. A push button connects GPIO27 to ground, and the ESP32’s internal pull-up keeps the pin HIGH until you press.',
  features: [['pins', 'Digital input with <code>digitalRead()</code>'], ['res', '<code>INPUT_PULLUP</code> — no extra resistor needed'], ['hand', 'Click the button on the breadboard to press it']],
  pinout: [['GPIO27', 'Button input', 'Uses the internal pull-up: press reads LOW.', '#2a56a3'], ['GPIO26', 'LED output', 'Lights while the button is held.', '#1aa3a1'], ['GND', 'Button return', 'The other leg of the button.', '#2f3547']],
  example: [
    '<code>pinMode(BUTTON, INPUT_PULLUP)</code> turns on a resistor inside the chip.',
    'Released, the pin reads HIGH. Pressed, it connects to GND and reads LOW.',
    'The sketch lights the LED while <code>digitalRead()</code> says LOW — pressed.',
  ],
  specs: [['Internal pull-up', '≈ 45 kΩ to 3.3 V'], ['Press reading', 'LOW'], ['Released reading', 'HIGH'], ['Debounce', '10–30 ms in software']],
  code:
`const int BUTTON = 27;
const int LED = 26;

void setup() {
  pinMode(BUTTON, INPUT_PULLUP);
  pinMode(LED, OUTPUT);
}

void loop() {
  bool pressed = digitalRead(BUTTON) == LOW;
  digitalWrite(LED, pressed);
}`,
  sim: 'button',
},
{
  id: 'pot', num: 4, title: 'Turn a knob', heading: 'Turn a knob',
  lede: 'A potentiometer is a resistor with a slider. The ESP32 reads its voltage on GPIO34 and dims the LED to match — your first analog signal.',
  features: [['wave', 'Analog input with <code>analogRead()</code>'], ['bulb', '<code>ledcWrite()</code> fades with PWM'], ['hand', 'Drag the knob on the breadboard']],
  pinout: [['GPIO34', 'Analog in', 'Input-only pin, 12-bit: 0–4095.', '#1aa3a1'], ['GPIO25', 'LED (PWM)', 'Fades from 0 to 255.', '#2a56a3'], ['3V3 · GND', 'Pot ends', 'The slider outputs between them.', '#d64a3a']],
  example: [
    '<code>analogRead(POT)</code> returns 0–4095 as the knob turns.',
    'The ESP32 has no true analog output, so it pulses the LED with PWM — fast blinking your eye averages into brightness.',
    '<code>map(raw, 0, 4095, 0, 255)</code> scales the reading to a PWM duty cycle.',
  ],
  specs: [['ADC resolution', '12-bit (0–4095)'], ['Input range', '0 – 3.3 V'], ['PWM frequency', '5 kHz default via ledc'], ['PWM resolution', '8-bit (0–255)']],
  code:
`const int POT = 34;
const int LED = 25;

void setup() {
  Serial.begin(115200);
  ledcAttach(LED, 5000, 8);
}

void loop() {
  int raw = analogRead(POT);
  int level = map(raw, 0, 4095, 0, 255);
  ledcWrite(LED, level);
  Serial.println(raw);
  delay(50);
}`,
  sim: 'pot',
},
{
  id: 'rgb', num: 5, title: 'Mix colours', heading: 'Mix colours',
  lede: 'An RGB LED is three LEDs — red, green and blue — under one milky lens. Three PWM pins mix any colour you can name.',
  features: [['bulb', 'Three channels, one lens'], ['wave', 'PWM per channel with <code>ledcWrite()</code>'], ['hand', 'Click the LED to cycle the palette']],
  pinout: [['GPIO25 · 26 · 33', 'R · G · B', 'One PWM channel per colour leg.', '#2a56a3'], ['GND', 'Common cathode', 'The longest leg goes to ground.', '#2f3547']],
  example: [
    'Each colour leg gets its own resistor — 220 Ω is a good default.',
    '<code>ledcWrite(RED, 255)</code> is full red; 0 is off. Values between mix shades.',
    'Purple is red + blue; teal is green + blue; white is all three.',
  ],
  specs: [['Channels', '3 × PWM, 8-bit each'], ['Resistors', '3 × 220 Ω'], ['Colours', '16.7 M mixes'], ['Cathode leg', 'The longest of the four']],
  code:
`const int RED = 25, GREEN = 26, BLUE = 33;

void setup() {
  ledcAttach(RED, 5000, 8);
  ledcAttach(GREEN, 5000, 8);
  ledcAttach(BLUE, 5000, 8);
}

void loop() {
  ledcWrite(RED, 255); ledcWrite(GREEN, 60);
  ledcWrite(BLUE, 120);   // a warm pink
  delay(1000);
}`,
  sim: 'rgb',
},
{
  id: 'light', num: 6, title: 'Sense light', heading: 'Sense light',
  lede: 'A light-dependent resistor conducts better the more light falls on it. Paired with a fixed resistor, it turns brightness into a voltage the ESP32 can read.',
  features: [['wave', 'Voltage divider into GPIO35'], ['bulb', 'A night light that switches itself'], ['hand', 'Drag the torch closer and further']],
  pinout: [['GPIO35', 'Divider midpoint', 'Reads 0–4095 as light changes.', '#1aa3a1'], ['GPIO26', 'Night-light LED', 'Comes on when it gets dark.', '#2a56a3'], ['3V3 · GND', 'Divider ends', 'LDR on top, 10 kΩ below.', '#d64a3a']],
  example: [
    'Bright light: LDR resistance falls, the midpoint voltage rises.',
    'In the dark the LDR wins and the midpoint drops toward ground.',
    'The sketch compares the reading with a threshold and lights the LED after sunset.',
  ],
  specs: [['LDR resistance', '≈ 1 kΩ bright · ≈ 1 MΩ dark'], ['Fixed resistor', '10 kΩ'], ['Threshold', 'Tune it for your room'], ['Response', '≈ 20 ms']],
  code:
`const int SENSOR = 35;
const int LED = 26;

void setup() {
  pinMode(LED, OUTPUT);
  Serial.begin(115200);
}

void loop() {
  int light = analogRead(SENSOR);
  Serial.println(light);
  digitalWrite(LED, light < 1200);  // dark: night light on
  delay(200);
}`,
  sim: 'light',
},
{
  id: 'distance', num: 7, title: 'Read a sensor', heading: 'Read a sensor',
  lede: 'The HC-SR04 sends a burst of ultrasound and listens for the echo. The ESP32 times the echo pulse on GPIO18 and turns it into centimetres.',
  features: [['wave', '<code>pulseIn()</code> times the echo'], ['pins', 'TRIG out on GPIO5, ECHO in on GPIO18'], ['hand', 'Drag the obstacle closer and further']],
  pinout: [['GPIO5', 'TRIG output', 'A 10 µs pulse starts a measurement.', '#2a56a3'], ['GPIO18', 'ECHO input', 'Reads HIGH for the echo’s flight time.', '#1aa3a1'], ['5V · GND', 'Sensor supply', 'The HC-SR04 runs on 5 V from VIN.', '#d64a3a']],
  example: [
    'Sound travels ≈ 343 m/s: every 29 µs of echo time is one centimetre out and back.',
    '<code>distance = duration * 0.034 / 2</code> converts the pulse to centimetres.',
    'The ECHO pin outputs 5 V — a divider of two resistors keeps the ESP32’s 3.3 V input safe.',
  ],
  specs: [['Range', '2 – 400 cm'], ['Resolution', '≈ 3 mm'], ['Rate', 'Up to ~20 reads / s'], ['Echo level', '5 V — use a divider']],
  code:
`const int TRIG = 5;
const int ECHO = 18;

void setup() {
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  Serial.begin(115200);
}

void loop() {
  digitalWrite(TRIG, HIGH); delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  long us = pulseIn(ECHO, HIGH);
  Serial.print(us * 0.034 / 2);
  Serial.println(" cm");
  delay(200);
}`,
  sim: 'distance',
},
{
  id: 'sound', num: 8, title: 'Make a sound', heading: 'Make a sound',
  lede: 'A piezo buzzer clicks every time its pin flips. Flip it fast and the clicks blur into a note — the ESP32’s LEDC timer does the flipping for you.',
  features: [['bulb', '<code>ledcTone()</code> plays a frequency'], ['clock', 'Duration in milliseconds'], ['hand', 'Pick a melody below']],
  pinout: [['GPIO19', 'Buzzer +', 'Square wave from an LEDC channel.', '#2a56a3'], ['GND', 'Buzzer −', 'The other terminal.', '#2f3547']],
  example: [
    'Concert A is 440 Hz: the pin flips 440 times a second.',
    '<code>ledcTone(BUZZER, 262)</code> plays middle C until you stop it.',
    'Short notes with gaps between them make a tune.',
  ],
  specs: [['Range', '31 Hz – 65 kHz'], ['Middle C', '262 Hz'], ['Current', '≈ 15 mA at 3.3 V'], ['Type', 'Passive piezo']],
  code:
`const int BUZZER = 19;

void setup() {
  ledcAttach(BUZZER, 2000, 8);
}

void loop() {
  ledcTone(BUZZER, 262); delay(400);  // C
  ledcTone(BUZZER, 330); delay(400);  // E
  ledcTone(BUZZER, 392); delay(400);  // G
  ledcTone(BUZZER, 0);   delay(600);  // rest
}`,
  sim: 'sound',
},
{
  id: 'piano', num: 9, title: 'Mini piano', heading: 'Mini piano',
  lede: 'Eight keys and a buzzer make a piano you can play. The ESP32 watches the keys and plays each note — and its touch pins can replace the buttons entirely.',
  features: [['hand', 'Click the keys to play'], ['bulb', 'Each key is one note of the scale'], ['chip', 'Bonus: <code>touchRead()</code> turns bare pads into keys']],
  pinout: [['GPIO 32·33·25·26 ·27·14·13·4', 'Key inputs', 'These eight have internal pull-ups; a press reads LOW.', '#2a56a3'], ['GPIO19', 'Buzzer', 'Plays the note of the pressed key.', '#1aa3a1'], ['T0–T9', 'Touch pads', 'Capacitive pins that sense a finger.', '#6a4fa3']],
  example: [
    'The notes C D E F G A B C are 262, 294, 330, 349, 392, 440, 494 and 523 Hz.',
    'The loop scans the keys and plays the first one it finds pressed.',
    'On real hardware, <code>touchRead(T3)</code> reads a bare copper pad — no moving parts.',
    'GPIO 34–39 have no internal pull-ups, so keys on them need an external resistor — this sketch avoids them.',
  ],
  specs: [['Notes', 'C4 – C5, one octave'], ['Scan rate', 'Every 10 ms'], ['Touch threshold', 'Tune per pad, ≈ 40'], ['Keys', '8 × 6 mm tact']],
  code:
`const int KEYS[] = {32,33,25,26,27,14,13,4};
const int NOTES[] = {262,294,330,349,392,440,494,523};
const int BUZZER = 19;

void setup() {
  for (int k : KEYS) pinMode(k, INPUT_PULLUP);
  ledcAttach(BUZZER, 2000, 8);
}

void loop() {
  for (int i = 0; i < 8; i++)
    if (digitalRead(KEYS[i]) == LOW) {
      ledcTone(BUZZER, NOTES[i]);
      delay(200);
      ledcTone(BUZZER, 0);
    }
}`,
  sim: 'piano',
},
{
  id: 'motor', num: 10, title: 'Control a motor', heading: 'Control a motor',
  lede: 'A GPIO pin can’t power a motor on its own, so a transistor does the heavy lifting — the pin just tells it when, and how fast with PWM.',
  features: [['gear', 'A transistor switches real current'], ['wave', 'PWM sets the speed'], ['hand', 'Click the motor to change speed']],
  pinout: [['GPIO27', 'Base via 1 kΩ', 'A small signal switches a bigger current. GPIO12 is avoided — it is a boot-strapping pin.', '#2a56a3'], ['VIN', 'Motor supply', 'The motor draws from the 5 V rail.', '#d64a3a'], ['GND', 'Shared ground', 'Transistor emitter to ground.', '#2f3547']],
  example: [
    'The 2N2222 passes the motor current when its base is driven through a resistor.',
    'A flyback diode across the motor absorbs the switch-off spike — always fit one.',
    '<code>ledcWrite(MOTOR, 160)</code> spins it at about 60% speed.',
  ],
  specs: [['Transistor', '2N2222 / PN2222'], ['Base resistor', '1 kΩ'], ['Motor', '3–6 V DC, ≈ 150 mA'], ['Flyback diode', '1N4007']],
  code:
`const int MOTOR = 27;

void setup() {
  ledcAttach(MOTOR, 5000, 8);
}

void loop() {
  ledcWrite(MOTOR, 200);  // spin fast
  delay(2000);
  ledcWrite(MOTOR, 90);   // slow
  delay(2000);
  ledcWrite(MOTOR, 0);    // stop
  delay(1000);
}`,
  sim: 'motor',
},
{
  id: 'temp', num: 11, title: 'Sense heat', heading: 'Sense heat',
  lede: 'The TMP36 turns temperature into a voltage: 0.5 V at 0 °C and 10 mV more for every degree. The ADC reads it, and a little maths gives degrees.',
  features: [['wave', 'Analog voltage into GPIO32'], ['clock', 'Calibrate against your room'], ['hand', 'Warm the sensor with the torch']],
  pinout: [['GPIO32', 'TMP36 out', '10 mV per °C plus a 500 mV offset.', '#1aa3a1'], ['3V3', 'Sensor supply', 'Low noise analog supply.', '#d64a3a'], ['GND', 'Ground', 'Third leg to ground.', '#2f3547']],
  example: [
    'Read the pin, scale to volts: <code>v = raw * 3.3 / 4095</code>.',
    'Then <code>tempC = (v − 0.5) * 100</code> — the offset and slope from the datasheet.',
    'The ESP32 also has a built-in temperature readout for the chip itself.',
  ],
  specs: [['Range', '−40 to +125 °C'], ['Accuracy', '±2 °C typical'], ['Slope', '10 mV / °C'], ['Offset', '500 mV at 0 °C']],
  code:
`const int SENSOR = 32;

void setup() {
  Serial.begin(115200);
}

void loop() {
  int raw = analogRead(SENSOR);
  float volts = raw * 3.3 / 4095.0;
  float tempC = (volts - 0.5) * 100.0;
  Serial.print(tempC);
  Serial.println(" C");
  delay(500);
}`,
  sim: 'temp',
},
{
  id: 'servo', num: 12, title: 'Sweep a servo', heading: 'Sweep a servo',
  lede: 'A servo is a motor that knows where it is. Send a 50 Hz pulse whose width says the angle, and it holds that position against your finger.',
  features: [['gear', 'Pulse width = angle'], ['clock', '1–2 ms pulses, 50 times a second'], ['hand', 'Click the servo to nudge it']],
  pinout: [['GPIO13', 'Signal', 'LEDC channel at 50 Hz, 12-bit.', '#2a56a3'], ['VIN', 'Power', 'Servos want 5 V, not 3.3 V.', '#d64a3a'], ['GND', 'Ground', 'Brown or black wire.', '#2f3547']],
  example: [
    'A 1 ms pulse means 0°, 2 ms means 180°; the servo repeats it 50 times a second.',
    '<code>ledcAttach(SERVO, 50, 12)</code> sets the timer to servo frequency.',
    'Write 205 for 0° and 410 for 180° at 12-bit resolution — 4096 counts per 20 ms.',
  ],
  specs: [['Pulse', '1–2 ms at 50 Hz'], ['Torque (SG90)', '1.8 kg·cm'], ['Travel', '0 – 180°'], ['Supply', '4.8 – 6 V']],
  code:
`const int SERVO = 13;

void setup() {
  ledcAttach(SERVO, 50, 12);
}

void loop() {
  for (int a = 0; a <= 180; a += 5) {
    ledcWrite(SERVO, 205 + a * 1.14);
    delay(15);
  }
  for (int a = 180; a >= 0; a -= 5) {
    ledcWrite(SERVO, 205 + a * 1.14);
    delay(15);
  }
}`,
  sim: 'servo',
},
{
  id: 'stepper', num: 13, title: 'Spin the wheel', heading: 'Spin the wheel',
  lede: 'A stepper motor turns in exact steps — 2048 make one full turn of this one. Four coils, driven in sequence through a ULN2003 board, walk it around.',
  features: [['gear', '2048 steps per revolution'], ['pins', 'Four GPIOs drive four coils'], ['hand', 'Click to reverse direction']],
  pinout: [['GPIO 14·27·26·25', 'Coils 1–4', 'Energised in sequence.', '#2a56a3'], ['VIN', 'ULN2003 supply', 'The driver board takes 5 V.', '#d64a3a'], ['GND', 'Ground', 'Shared with the board.', '#2f3547']],
  example: [
    'The sequence 1000 → 1100 → 0100 → 0110 … steps the rotor one eighth-step at a time.',
    'Slower steps mean more torque; too fast and it stalls and buzzes.',
    'Count 2048 steps and the flag is back where it started — open-loop precision.',
  ],
  specs: [['Motor', '28BYJ-48, 5 V'], ['Steps / rev', '2048 (half-step)'], ['Driver', 'ULN2003 board'], ['Max rate', '≈ 500 steps / s']],
  code:
`const int COILS[] = {14, 27, 26, 25};
const int SEQ[][4] = {{1,0,0,0},{1,1,0,0},{0,1,0,0},
  {0,1,1,0},{0,0,1,0},{0,0,1,1},{0,0,0,1},{1,0,0,1}};
int step = 0;

void setup() {
  for (int c : COILS) pinMode(c, OUTPUT);
}

void loop() {
  for (int i = 0; i < 4; i++)
    digitalWrite(COILS[i], SEQ[step][i]);
  step = (step + 1) % 8;
  delay(3);
}`,
  sim: 'stepper',
},
{
  id: 'plant', num: 14, title: 'Smart plant', heading: 'Smart plant',
  lede: 'A capacitive sensor in the soil says how wet it is, and a little OLED screen turns that into a percentage and a mood. Water the plant, watch it smile.',
  features: [['wave', 'Capacitive probe on GPIO34'], ['chip', 'OLED over I²C on GPIO 21/22'], ['hand', 'Move the slider to water the plant']],
  pinout: [['GPIO34', 'Moisture in', 'Dry soil reads high, wet reads low.', '#1aa3a1'], ['GPIO21 · 22', 'SDA · SCL', 'The OLED’s I²C bus.', '#6a4fa3'], ['3V3 · GND', 'Module supply', 'Both modules run at 3.3 V.', '#d64a3a']],
  example: [
    'Capacitive probes don’t corrode like resistive ones — safe to leave in the pot.',
    '<code>Wire.begin(21, 22)</code> starts I²C on the ESP32’s default pins.',
    'Map the raw reading from dry..wet to 0..100% and pick a face for the screen.',
  ],
  specs: [['Probe output', '≈ 1.2 V wet – 2.5 V dry'], ['OLED', 'SSD1306, 128×64'], ['I²C address', '0x3C'], ['Bus speed', '400 kHz']],
  code:
`#include <Wire.h>
const int SOIL = 34;

void setup() {
  Wire.begin(21, 22);   // SDA, SCL
  Serial.begin(115200);
}

void loop() {
  int raw = analogRead(SOIL);
  int moisture = map(raw, 2500, 1200, 0, 100);
  Serial.println(moisture);
  delay(500);
}`,
  sim: 'plant',
},
{
  id: 'force', num: 15, title: 'Feel the force', heading: 'Feel the force',
  lede: 'A force-sensing resistor is a thin pad whose resistance falls from millions of ohms to a few hundred as you press it. Squeeze, and the ESP32 knows.',
  features: [['wave', 'Divider reading on GPIO35'], ['bulb', 'LED bar shows the squeeze'], ['hand', 'Click and hold the pad to press']],
  pinout: [['GPIO35', 'FSR divider', 'Press harder, read higher.', '#1aa3a1'], ['GPIO25 · 26 · 33', 'LED bar', 'Three LEDs show the level.', '#2a56a3'], ['3V3 · GND', 'Divider ends', 'FSR on top, 10 kΩ below.', '#d64a3a']],
  example: [
    'Like the light sensor, the FSR forms a divider with a fixed 10 kΩ resistor.',
    'The reading isn’t linear, but for “is someone pressing” it’s more than enough.',
    'Thresholds split the range into bands — one per LED.',
  ],
  specs: [['Force range', '0.2 – 20 N'], ['Resistance', '> 1 MΩ open · ≈ 300 Ω pressed'], ['Fixed resistor', '10 kΩ'], ['Response', '< 10 ms']],
  code:
`const int FSR = 35;
const int BAR[] = {25, 26, 33};

void setup() {
  for (int b : BAR) pinMode(b, OUTPUT);
}

void loop() {
  int force = analogRead(FSR);
  digitalWrite(BAR[0], force > 600);
  digitalWrite(BAR[1], force > 1600);
  digitalWrite(BAR[2], force > 2600);
  delay(50);
}`,
  sim: 'force',
},
{
  id: 'project', num: 16, title: 'Build a project', heading: 'Parking sensor',
  lede: 'Put it all together: the distance sensor watches the obstacle and a traffic light tells the driver when to stop. Green, amber, red — just like the real thing.',
  features: [['gear', 'Everything from lessons 2–12 combined'], ['wave', 'Distance decides the light'], ['hand', 'Drag the car toward the sensor']],
  pinout: [['GPIO5 · 18', 'TRIG · ECHO', 'The HC-SR04 measures the gap.', '#1aa3a1'], ['GPIO 25·26·33', 'Red · amber · green', 'One light per zone.', '#2a56a3'], ['VIN · GND', 'Supplies', 'Sensor on 5 V, LEDs on 3.3 V logic.', '#d64a3a']],
  example: [
    'Over 30 cm: green. Under 20 cm: amber. Under 10 cm: red.',
    'The loop measures every 100 ms and picks the light for the zone.',
    'Add the buzzer from lesson 8 for beeping that speeds up as you park.',
  ],
  specs: [['Zones', '30 / 20 / 10 cm'], ['Rate', '10 reads / s'], ['Hysteresis', '±2 cm to avoid flicker'], ['Extras', 'Buzzer optional']],
  code:
`const int TRIG = 5, ECHO = 18;
const int RED = 25, AMBER = 26, GREEN = 33;

void setup() {
  pinMode(TRIG, OUTPUT); pinMode(ECHO, INPUT);
  pinMode(RED, OUTPUT); pinMode(AMBER, OUTPUT);
  pinMode(GREEN, OUTPUT);
}

void loop() {
  digitalWrite(TRIG, HIGH); delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  float cm = pulseIn(ECHO, HIGH) * 0.034 / 2;
  digitalWrite(GREEN, cm >= 30);
  digitalWrite(AMBER, cm < 30 && cm >= 10);
  digitalWrite(RED, cm < 10);
  delay(100);
}`,
  sim: 'project',
},
];
