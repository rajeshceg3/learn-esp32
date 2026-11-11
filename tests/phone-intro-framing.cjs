// Phone-intro framing regression. Other lesson stage heights must stay unchanged.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('fs');
(async()=>{
 const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--enable-unsafe-swiftshader']});
 try{
  fs.mkdirSync('docs/next-action/local',{recursive:true});
  for(const [w,h] of [[320,700],[390,844],[500,900],[768,1024],[1365,844],[844,390]]){
   const p=await b.newPage({viewport:{width:w,height:h},reducedMotion:'reduce',hasTouch:true});
   const errors=[];p.on('pageerror',e=>errors.push(e.message));
   await p.goto(process.env.BASE_URL||'http://127.0.0.1:8796');
   await p.waitForSelector('#app[aria-hidden=false]');
   const geometry=()=>p.evaluate(()=>{
    const rect=s=>document.querySelector(s).getBoundingClientRect().toJSON();
    return {stage:rect('#stage'),wrap:rect('#stageWrap'),dock:rect('#boardAnnotationDock'),rail:rect('#lessonRail'),nav:rect('#bottomnav'),overflow:document.documentElement.scrollWidth>innerWidth,
     buttons:[...document.querySelectorAll('#boardAnnotationDock button')].map(e=>({rect:e.getBoundingClientRect().toJSON(),text:e.textContent,clipped:e.scrollWidth>e.clientWidth+1}))};
   });
   const g=await geometry();
   if(g.overflow||g.buttons.length!==6)throw Error('overflow or missing parts: '+w);
   if(w<=500){
    if(g.stage.bottom>g.dock.top)throw Error('model/dock overlap: '+w);
    if(w===390&&g.rail.bottom>g.nav.top)throw Error('intro lesson rail hidden by nav');
    for(const d of g.buttons)if(d.rect.height<44||d.clipped)throw Error('part target clipped/small: '+w);
   }
   if(w<=500)for(let i=0;i<6;i++){
    const part=p.locator('#boardAnnotationDock button').nth(i);await part.focus();await p.keyboard.press('Enter');
    await p.waitForSelector('#sheet.open');await p.keyboard.press('Escape');
    if(!await part.evaluate(e=>e===document.activeElement))throw Error('focus return '+w);
   }
   await p.evaluate(()=>scrollTo(0,0));
   await p.screenshot({path:`docs/next-action/local/phone-intro-${w}.png`});
   await p.locator('.lesson-card').nth(1).click();
   const blinkHeight=await p.locator('#stageWrap').evaluate(e=>e.getBoundingClientRect().height);
   if(w<=500){const canvasHeight=await p.locator('#stage').evaluate(e=>e.clientHeight);if(canvasHeight!==262)throw Error('intro rule leaked into Blink '+w+': '+canvasHeight);}
   await p.locator('.lesson-card').nth(0).click();
   if(!await p.locator('#boardAnnotationDock').isVisible())throw Error('return to intro');
   if(errors.length)throw Error(errors.join('\n'));
   console.log(JSON.stringify({w,h,stageHeight:g.wrap.height,railBottom:g.rail.bottom,navTop:g.nav.top,blinkHeight,errors}));
   await p.close();
  }
 }finally{await b.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
