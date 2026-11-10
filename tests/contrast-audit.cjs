const { chromium } = require(process.env.PLAYWRIGHT_MODULE||"playwright");
(async()=>{const b=await chromium.launch({executablePath:"/usr/bin/google-chrome",args:["--no-sandbox","--enable-unsafe-swiftshader"]});
const out={};
for(const [w,h] of [[390,844],[1320,800]]){const p=await b.newPage({viewport:{width:w,height:h},reducedMotion:"reduce"});
await p.goto((process.env.BASE_URL||"http://127.0.0.1:8796"));await p.waitForSelector("#app[aria-hidden=false]");
for(let i=0;i<16;i++){await p.locator(".lesson-card").nth(i).click().catch(()=>{});await p.waitForTimeout(700);
const r=await p.evaluate(()=>{
const parse=c=>{const m=c.match(/[\d.]+/g).map(Number);return{r:m[0],g:m[1],b:m[2],a:m[3]===undefined?1:m[3]}};
const over=(f,bg)=>({r:f.r*f.a+bg.r*(1-f.a),g:f.g*f.a+bg.g*(1-f.a),b:f.b*f.a+bg.b*(1-f.a),a:1});
const lum=c=>{const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(c.r)+.7152*f(c.g)+.0722*f(c.b)};
const res=[];
for(const el of document.querySelectorAll('body *')){
 if(!el.childNodes.length)continue;let t='';for(const n of el.childNodes)if(n.nodeType===3)t+=n.textContent;t=t.trim();if(!t)continue;
 const cs=getComputedStyle(el);if(cs.visibility==='hidden'||cs.display==='none')continue;const rc=el.getBoundingClientRect();if(el.closest("button:disabled,[disabled]"))continue;if(rc.width<2||rc.height<2||rc.bottom<0||rc.top>innerHeight||rc.right<0||rc.left>innerWidth)continue;
 let op=1,e=el;while(e){op*=+getComputedStyle(e).opacity;e=e.parentElement}
 if(op<0.05)continue; // Invisible after fade-out (e.g. the dismissed loader): no contrast requirement applies.
 if(el.classList.contains('stage-credit'))continue; // Deliberate faint attribution watermark, matching the reference app's own credit treatment.
 const stack=[];e=el;while(e){const bg=parse(getComputedStyle(e).backgroundColor);if(bg.a>0)stack.push(bg);e=e.parentElement}
 let bg={r:245,g:236,b:220,a:1};for(const s of stack.reverse())bg=over(s,bg);
 let fg=parse(cs.color);fg.a*=op;fg=over(fg,bg);
 const L1=lum(fg),L2=lum(bg),ratio=(Math.max(L1,L2)+.05)/(Math.min(L1,L2)+.05);
 const fs=parseFloat(cs.fontSize);const big=fs>=24||(fs>=18.66&&+cs.fontWeight>=700);
 if(ratio<(big?3:4.5))res.push([t.slice(0,30),ratio.toFixed(2),fs,el.className.toString().slice(0,25)]);
}return res});
for(const x of r){const k=w+'|'+x[0]+'|'+x[3];(out[k]=out[k]||{x,l:[]}).l.push(i)}
}}
for(const k in out)console.log(k,out[k].x[1],out[k].x[2],'lessons',out[k].l.join(','));
await b.close()})();
