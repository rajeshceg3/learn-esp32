// One explicit four-sample history. No physical force calibration is implied.
export const forceDuty=raw=>205+Math.trunc(Math.max(0,Math.min(4095,raw))*205/4095);
export const forceDecision=(raw,rung)=>({ring:raw>3071&&!rung,rearm:raw<2662});
export function forceStage(stage){
  const raw=stage<1?null:stage<8?3072:stage<10?2661:3072;
  const duty=stage<2?null:forceDuty(raw);
  const output=stage<3?0:stage<9?3072:stage<11?2661:3072;
  const rung=stage>=4&&stage<9||stage>=11;
  const bell=stage===4||stage===11;
  return {raw,duty,output,rung,bell};
}
export const FORCE_COPY=[
 ['Prepare one example history','Start with no pressure output, rung=false and no bell deadline. Follow high, high again, low, then high. This browser model is not calibrated grams.'],
 ['Read the first high sample','GPIO35 reads 3072 out of 4095. No servo write or bell test has run.'],
 ['Map to servo duty',`205 + trunc(3072 × 205 / 4095) = ${forceDuty(3072)}. This is a 12-bit PWM duty, not a measured servo angle.`],
 ['Write the servo output',`Write duty ${forceDuty(3072)} to GPIO13. The illustrated needle now follows this sample. The bell has not been tested.`],
 ['Pass the bell guard','3072 > 3071 and rung=false. Start 1568 Hz for 400 ms, set a deadline and remember rung=true. This press plays one bounded tone.'],
 ['Review the deadline','The previous bounded tone ended at 400 ms. At that deadline the deadline stops the tone. rung stays true: stopping the bell does not rearm it. The browser waits for you.'],
 ['Read high again','Read 3072 again. The servo duty is unchanged. The remembered rung flag is still true.'],
 ['Block a repeated ring','3072 > 3071 is true, but !rung is false. No new tone or deadline is started. Holding pressure must not ring repeatedly.'],
 ['Read a lower sample',`Read 2661. Map to duty ${forceDuty(2661)}. The previous servo output is held until this lower sample is written.`],
 ['Write low and rearm',`Write duty ${forceDuty(2661)}. Because 2661 < 2662, set rung=false. Rearming makes the next high eligible; it does not play a tone.`],
 ['Read high after release',`Read 3072 again and map duty ${forceDuty(3072)}. The needle still holds the lower output until the next write.`],
 ['Write high and ring again','Write the high duty. The guard now passes because rung=false, so start one new 400 ms tone and set rung=true.'],
 ['Review the second deadline','The previous 400 ms tone has ended at its deadline. rung remains true until a later sample below 2662.'],
 ['Hold the loop boundary','delay(20) is the program loop pause, not the 400 ms bell timeout. This walkthrough illustrated separated reads and deadlines; replay to review the history.'],
];
