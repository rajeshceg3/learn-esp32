// Source-equivalent Arduino integer map: division truncates toward zero.
export const PLANT_SAMPLES=[2240,1850,1330,2800,900];
export function plantFrame(input=1850){
  const mv=PLANT_SAMPLES.includes(Number(input))?Number(input):1850;
  const mapped=Math.trunc((mv-2500)*100/(1200-2500));
  const moisture=Math.max(0,Math.min(100,mapped));
  return {mv,mapped,moisture,mood:moisture<30?'WATER ME!':moisture>85?'TOO WET!':'HAPPY :)',bar:Math.trunc(moisture*118/100)};
}
