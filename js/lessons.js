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
  lede: 'The ESP32 DevKit pairs a dual-core processor with Wi-Fi and Bluetooth. Start with simple circuits, then build connected projects.',
  features: [['chip', 'Dual-core 240 MHz processor'], ['bulb', 'Works with the Arduino IDE'], ['gear', 'Used in learning, hobby builds and<br />connected products']],
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
    'With a nominal 3.3 V output, a red LED at about 1.9 V and 220 Ω gives roughly 6.4 mA: I = (3.3 - 1.9) / 220. This is a circuit estimate, not a GPIO rating.',
    '<code>digitalWrite(LED_PIN, HIGH)</code> drives 3.3 V; the resistor drops the rest and sets the current.',
    'Timing exercise: click the highlighted <code>delay()</code> values to try 900 ms on and 200 ms off. The code shows the current values; the simulation and copied code use them.',
  ],
  specs: [['Forward voltage', 'Red ≈ 1.9 V · blue ≈ 3.0 V'], ['Resistor', '220 Ω – 1 kΩ'], ['Estimated red LED current', '(3.3 - 1.9) / 220 ≈ 6.4 mA'], ['GPIO logic', '3.3 V; never connect 5 V directly']],
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
  features: [['pins', 'Digital input with <code>digitalRead()</code>'], ['res', '<code>INPUT_PULLUP</code> — no extra resistor needed'], ['hand', 'Simulation: click BUTTON to press; click again to release']],
  pinout: [['GPIO27', 'Button input', 'Uses the internal pull-up: press reads LOW.', '#2a56a3'], ['GPIO26', 'LED output', 'Hardware: lights while pressed. Simulation: stays on until toggled off.', '#1aa3a1'], ['GND', 'Button return', 'The other leg of the button.', '#2f3547']],
  example: [
    '<code>pinMode(BUTTON, INPUT_PULLUP)</code> turns on a resistor inside the chip.',
    'Released, the pin reads HIGH. Pressed, it connects to GND and reads LOW.',
    'The sketch lights the LED while <code>digitalRead()</code> says LOW — pressed.',
    'In this scripted simulation, click BUTTON or press Enter/Space to toggle pressed/released. Stop clears it. Real hardware uses a momentary switch; the displayed sketch is not executed.',
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
  features: [['wave', 'Voltage divider into GPIO35'], ['bulb', 'A night light that switches itself'], ['hand', 'Click the lamp to move it closer or further']],
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
  features: [['wave', '<code>pulseIn()</code> times the echo'], ['pins', 'TRIG out on GPIO5, ECHO in on GPIO18'], ['hand', 'Click the obstacle to step simulated distance']],
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
  features: [['bulb', '<code>ledcWriteTone()</code> plays a frequency'], ['clock', 'Duration in milliseconds'], ['hand', 'Pick a melody below']],
  pinout: [['GPIO19', 'Buzzer +', 'Square wave from an LEDC channel.', '#2a56a3'], ['GND', 'Buzzer −', 'The other terminal.', '#2f3547']],
  example: [
    'Concert A is 440 Hz: the pin flips 440 times a second.',
    '<code>ledcWriteTone(BUZZER, 262)</code> plays middle C until you stop it.',
    'Short notes with gaps between them make a tune.',
  ],
  specs: [['Range', '31 Hz – 65 kHz'], ['Middle C', '262 Hz'], ['Current', '≈ 15 mA at 3.3 V'], ['Type', 'Passive piezo']],
  code:
`const int BUZZER = 19;

void setup() {
  ledcAttach(BUZZER, 2000, 8);
}

void loop() {
  ledcWriteTone(BUZZER, 262); delay(400);  // C
  ledcWriteTone(BUZZER, 330); delay(400);  // E
  ledcWriteTone(BUZZER, 392); delay(400);  // G
  ledcWriteTone(BUZZER, 0);   delay(600);  // rest
}`,
  sim: 'sound',
},
{
  id: 'piano', num: 9, title: 'Mini piano', heading: 'Mini piano',
  lede: 'Eight keys and a buzzer make a piano you can play. The ESP32 watches the keys and plays each note — and its touch pins can replace the buttons entirely.',
  features: [['hand', 'Hold a key to play; release to stop'], ['bulb', 'Each key is one note of the scale'], ['chip', 'Bonus: <code>touchRead()</code> turns bare pads into keys']],
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
  int frequency = 0;
  for (int i = 0; i < 8; i++) {
    if (digitalRead(KEYS[i]) == LOW) {
      frequency = NOTES[i];
      break;  // first pressed key wins
    }
  }
  ledcWriteTone(BUZZER, frequency);  // 0 silences the buzzer
  delay(10);
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
  lede: 'The TMP36 turns temperature into voltage. Switch on the dryer and use a cooling fan above 30 °C: a small thermostat.',
  features: [['wave', 'GPIO32 reads calibrated millivolts'], ['hand', 'Open HEAT for power and distance, or drag the dryer'], ['gear', 'GPIO27 switches the fan above 30 °C']],
  pinout: [['GPIO32','TMP36 out','10 mV per °C plus a 500 mV offset.','#1aa3a1'],['3V3','Sensor supply','Power the TMP36 from 3.3 V.','#d64a3a'],['GND','Common ground','Join sensor, transistor emitter and supply grounds.','#2f3547'],['GPIO27','Fan transistor base','Use a 1 kΩ base resistor. Never power a fan from a GPIO.','#e8913a'],['VIN','5 V fan supply','Use a suitable low-current fan and transistor. Flyback diode across fan, cathode to positive.','#d64a3a']],
  example: ['<code>analogReadMilliVolts(32)</code> reads calibrated millivolts on Arduino-ESP32.','<code>(millivolts - 500) / 10.0</code> converts TMP36 voltage to °C.','Above 30 °C, <code>analogWrite(27, 255)</code> switches the fan through the transistor. Otherwise it is off.','The scripted simulation heats and cools around the limit. The displayed editor is not executed.'],
  specs: [['Range','−40 to +125 °C'],['Accuracy','±2 °C typical'],['Slope','10 mV / °C'],['Fan threshold','30 °C']],
  code:
`const int SENSOR = 32;
const int FAN = 27;  // via resistor and transistor

void setup() {
  Serial.begin(115200);
  pinMode(FAN, OUTPUT);
}

void loop() {
  float millivolts = analogReadMilliVolts(SENSOR);
  float tempC = (millivolts - 500) / 10.0;
  Serial.println(tempC);

  if (tempC > 30) analogWrite(FAN, 255);
  else analogWrite(FAN, 0);
  delay(200);
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
  lede: 'A stepper motor turns in exact steps. Press the button to spin a prize wheel, then slow down onto a segment. Four coils are driven through a ULN2003 board.',
  features: [['gear', '2048 nominal steps per revolution'], ['pins', 'Four GPIOs drive four coils'], ['hand', 'Press the button to spin']],
  pinout: [['GPIO 14·27·26·25', 'Coils 1–4', 'ULN2003 inputs, energised in sequence.', '#2a56a3'], ['GPIO4', 'Button', 'Internal pull-up; press connects to ground.', '#f2efe6'], ['VIN · GND', 'Driver power', '5 V motor supply with shared ground.', '#d64a3a']],
  example: [
    'The button uses INPUT_PULLUP, so a press reads LOW.',
    'Choose a segment and count a whole turn plus the steps to reach it.',
    'The example uses AccelStepper to speed up and slow down. The app shows a scripted simulation, not an execution of this code.',
  ],
  specs: [['Motor', '28BYJ-48, 5 V'], ['Steps / rev', '2048 nominal steps'], ['Driver', 'ULN2003 board'], ['Button', 'GPIO4 to GND']],
  code:
`#include <AccelStepper.h>
const int BUTTON = 4;
const int STEPS = 2048, SEGMENTS = 8;
AccelStepper wheel(AccelStepper::FULL4WIRE, 14, 26, 27, 25);
int at = 0;
bool wasPressed = false;

void setup() {
  pinMode(BUTTON, INPUT_PULLUP);
  Serial.begin(115200);
  wheel.setMaxSpeed(500);
  wheel.setAcceleration(250);
}

void loop() {
  bool pressed = digitalRead(BUTTON) == LOW;
  if (pressed && !wasPressed && wheel.distanceToGo() == 0) {
    int prize = random(SEGMENTS);
    int ahead = (prize - at + SEGMENTS) % SEGMENTS;
    wheel.move(STEPS + ahead * (STEPS / SEGMENTS));
    at = prize;
  }
  wasPressed = pressed;
  wheel.run();
}`,
  sim: 'stepper',
},
{
  id: 'plant', num: 14, title: 'Smart plant', heading: 'Smart plant',
  lede: 'A capacitive sensor in the soil says how wet it is, and a little OLED screen turns that into a percentage and a mood. Water the plant, watch it smile.',
  features: [['wave', 'Capacitive probe on GPIO34'], ['chip', 'OLED over I²C on GPIO 21/22'], ['hand', 'Hold the plant or WATER to water; release to let it dry']],
  pinout: [['GPIO34', 'Moisture in', 'Dry soil reads high, wet reads low.', '#1aa3a1'], ['GPIO21 · 22', 'SDA · SCL', 'The OLED’s I²C bus.', '#6a4fa3'], ['3V3 · GND', 'Module supply', 'Both modules run at 3.3 V.', '#d64a3a']],
  example: [
    'Capacitive probes don’t corrode like resistive ones — safe to leave in the pot.',
    '<code>Wire.begin(21, 22, 400000)</code> starts I²C on the ESP32’s default pins.',
    'Measure dry/wet probe voltages and replace DRY_MV/WET_MV. Millivolts are not raw ADC counts; constrain the result to 0–100%.',
    'Install Adafruit SSD1306 and Adafruit GFX with dependencies. Check the OLED address (0x3C or 0x3D) and 3.3 V I²C pull-ups. clearDisplay() clears the buffer; display() sends it. The simulation is scripted.',
  ],
  specs: [['Probe output', '≈ 1.2 V wet – 2.5 V dry'], ['OLED', 'SSD1306, 128×64'], ['I²C address', '0x3C'], ['Bus speed', '400 kHz']],
  code:
`// Install Adafruit SSD1306 and Adafruit GFX with dependencies.
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
const int SOIL = 34;
const int DRY_MV = 2500, WET_MV = 1200; // Calibrate your probe.
const uint8_t OLED_ADDR = 0x3C; // Check your module: some use 0x3D.
Adafruit_SSD1306 oled(128, 64, &Wire, -1);

void setup() {
  Serial.begin(115200);
  analogSetPinAttenuation(SOIL, ADC_11db);
  Wire.begin(21, 22, 400000);
  if (!oled.begin(SSD1306_SWITCHCAPVCC, OLED_ADDR, true, false)) {
    Serial.println("OLED init failed");
    while (true) delay(100);
  }
  oled.setTextColor(SSD1306_WHITE);
}

void loop() {
  int mv = analogReadMilliVolts(SOIL);
  int moisture = constrain(map(mv, DRY_MV, WET_MV, 0, 100), 0L, 100L);
  const char* mood = moisture < 30 ? "WATER ME!" :
                     moisture > 85 ? "TOO WET!" : "HAPPY :)";
  oled.clearDisplay();
  oled.setTextSize(2);
  oled.setCursor(0, 0);
  oled.print(moisture); oled.println("%");
  oled.drawRect(4, 28, 120, 8, SSD1306_WHITE);
  oled.fillRect(5, 29, moisture * 118 / 100, 6, SSD1306_WHITE);
  oled.setTextSize(1);
  oled.setCursor(4, 48); oled.print(mood);
  oled.display(); // Send the completed frame to the screen.
  Serial.println(moisture);
  delay(500);
}`,
  sim: 'plant',
},
{
  id: 'force', num:15, title:'Feel the force', heading:'Test your strength',
  lede:'An FSR changes resistance under pressure. A voltage divider feeds GPIO35, a servo moves the meter needle, and a piezo sounds above the mark.',
  features:[['wave','GPIO35 reads the FSR divider'],['gear','GPIO13 moves the servo needle'],['hand','Hold PRESS PAD, then drag down to press harder']],
  pinout:[['GPIO35','FSR divider','FSR to 3V3, 10 kΩ resistor from signal to GND.','#1aa3a1'],['GPIO13','Servo signal','50 Hz pulses; servo power from a suitable 5 V supply.','#e8913a'],['GPIO19','Piezo buzzer','Rings once above 75%; rearms below 65%.','#6a4fa3'],['3V3 · VIN · GND','Supplies','FSR on 3.3 V; servo on 5 V. Join all grounds.','#d64a3a']],
  example:['The 10 kΩ resistor pulls the divider down. Pressing lowers FSR resistance, raising the voltage.','<code>analogRead(35)</code> gives 0–4095 on the classic ESP32. This is a relative reading, not calibrated grams.','At 50 Hz and 12-bit resolution, 205–410 counts give about 1–2 ms servo pulses.','The scripted simulation follows held pressure and remembers the best reading until the lesson resets. The editor code is not executed.'],
  specs:[['ADC','0–4095'],['Divider','10 kΩ'],['Servo signal','GPIO13 · 50 Hz'],['Bell threshold','> 3071 / 4095']],
  code:
`const int FSR = 35, SERVO = 13, BELL = 19;
bool rung = false;
unsigned long bellUntil = 0;

void setup() {
  analogReadResolution(12);
  ledcAttach(SERVO, 50, 12);
  ledcAttach(BELL, 2000, 8);
}

void loop() {
  int pressure = analogRead(FSR);
  int duty = map(pressure, 0, 4095, 205, 410);
  ledcWrite(SERVO, duty);
  if (pressure > 3071 && !rung) {
    ledcWriteTone(BELL, 1568); bellUntil = millis() + 400; rung = true;
  }
  if (pressure < 2662) rung = false;
  if (bellUntil && (long)(millis() - bellUntil) >= 0) {
    ledcWriteTone(BELL, 0); bellUntil = 0;
  }
  delay(20);
}`,
  sim: 'force',
},
{
  id: 'project', num: 16, title: 'Build a project', heading: 'Parking sensor',
  lede: 'Put it all together: the distance sensor watches the obstacle and a traffic light tells the driver when to stop. Green, amber, red — just like the real thing.',
  features: [['gear', 'Everything from lessons 2–12 combined'], ['wave', 'Distance decides the light'], ['hand', 'Click the car in continuous exploration']],
  pinout: [['GPIO5 · 18', 'TRIG · ECHO', 'The HC-SR04 measures the gap.', '#1aa3a1'], ['GPIO 25·26·33', 'Red · amber · green', 'One light per zone.', '#2a56a3'], ['VIN · GND', 'Supplies', 'Sensor on 5 V, LEDs on 3.3 V logic.', '#d64a3a']],
  example: [
    'At least 30 cm: green. From 10 up to 30 cm: amber. Below 10 cm: red.',
    'The loop reads an echo width, converts the round-trip time to distance, writes three pins in sequence, then delays 100 ms. Measurement adds time too.',
    'Add the buzzer from lesson 8 for beeping that speeds up as you park.',
  ],
  specs: [['Boundaries', '30 / 10 cm'], ['Loop wait', '100 ms plus measurement'], ['Hysteresis', 'None in this code'], ['Extras', 'Buzzer optional']],
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
