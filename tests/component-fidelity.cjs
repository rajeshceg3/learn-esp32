const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(process.env.BASE_URL||'http://127.0.0.1:8796',{waitUntil:'domcontentloaded'});
  const results=await page.evaluate(async()=>{
   const {resistor}=await import('/js/components.js');
   return [220,1000,10000].map(ohms=>{
    const r=resistor(ohms),body=r.userData.body;
    const bands=r.children.filter(o=>o.geometry?.type==='CylinderGeometry');
    const leads=r.children.filter(o=>o.geometry?.type==='TubeGeometry');
    return {ohms:r.userData.ohms,body:body.geometry.type,bands:bands.map(o=>o.material.color.getHex()),leadEnds:leads.map(o=>o.geometry.parameters.path.getPoint(1).toArray()),finite:r.children.every(o=>[...o.geometry.attributes.position.array].every(Number.isFinite))};
   });
  });
  const colors=[[0xc02020,0xc02020,0x704018,0xb2984c],[0x704018,0x202020,0xc02020,0xb2984c],[0x704018,0x202020,0xd07020,0xb2984c]];
  results.forEach((r,i)=>{assert.equal(r.body,'LatheGeometry');assert.equal(r.finite,true);assert.deepEqual(r.bands,colors[i]);r.leadEnds.forEach((p,j)=>p.forEach((v,k)=>assert(Math.abs(v-[[-7.62,-3.2,0],[7.62,-3.2,0]][j][k])<1e-9))); assert.equal(r.ohms,[220,1000,10000][i]);});
  assert.deepEqual(errors,[]);console.log('PASS three resistor values, four bands, axial package, bent lead endpoints, finite geometry');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
