// Deterministic browser examples, not measurements or a hardware interpreter.
export const PARKING_SAMPLES=[40,20,8,30,10];
export function parkingFrame(input=20){
  const cm=PARKING_SAMPLES.includes(Number(input))?Number(input):20;
  const pulse=cm/.017; // Example echo width consistent with duration * .034 / 2.
  return {cm,pulse,green:cm>=30,amber:cm<30&&cm>=10,red:cm<10,zone:cm>=30?'green':cm>=10?'amber':'red'};
}
export function parkingStage(stage,input=20){
  const f=parkingFrame(input);return {...f,trigger:stage===1,echoKnown:stage>=3,cmKnown:stage>=4,
    outputs:{green:stage>=5&&f.green,amber:stage>=6&&f.amber,red:stage>=7&&f.red}};
}
export function parkingCopy(stage,input=20){
  const f=parkingFrame(input),v=parkingStage(stage,input),hl=x=>x?'HIGH':'LOW';
  const state=` Written outputs: green ${hl(v.outputs.green)}, amber ${hl(v.outputs.amber)}, red ${hl(v.outputs.red)}.`;
  const copy=[
    ['Prepare a fresh example','Configure trigger GPIO5, echo GPIO18 and outputs 33/26/25. This walkthrough starts all lights LOW. Changing examples resets them; it does not model a transition from the last loop.'],
    ['Send the trigger','Write trigger HIGH for 10 microseconds. The browser marks this action, not its real-time electrical waveform. No echo has been read.'],
    ['End the trigger','Write trigger LOW. The sensor may now return an echo pulse; the program has not read its width yet.'],
    ['Read the round trip',`This chosen example supplies an echo width of about ${f.pulse.toFixed(2)} microseconds. It is a round trip to the obstacle and back, not a distance yet.`],
    ['Convert, then predict',`${f.pulse.toFixed(2)} × 0.034 / 2 ≈ ${f.cm} cm. Divide by two because sound travels out and back. Before continuing, predict which light will be HIGH. No output write has run.`],
    ['Write green',`${f.cm} >= 30 is ${f.green}. Write GPIO33 ${hl(f.green)}. Amber and red have not been written in this example yet.`],
    ['Write amber',`${f.cm} < 30 AND ${f.cm} >= 10 is ${f.amber}. Write GPIO26 ${hl(f.amber)}. Red has not been written yet.`],
    ['Write red',`${f.cm} < 10 is ${f.red}. Write GPIO25 ${hl(f.red)}. The three writes are separate actions, not one atomic zone switch.`],
    ['Hold, then explain','delay(100) holds these outputs for 100 ms, then waits for you. Explain why echo time is halved. Try exactly 10 and 30 cm: which comparisons include equality? There is no hysteresis in this code.'],
  ][stage];return copy?[copy[0],copy[1]+state]:['How does an echo choose a light?','A sensor returns time, not centimetres. Predict how a round-trip time becomes one distance and three output decisions. Choose an example, then follow each cause. Browser examples are scripted, not hardware readings.'];
}
