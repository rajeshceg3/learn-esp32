import fs from 'node:fs';
import assert from 'node:assert/strict';
// Exercise the actual servo simulation factory, without requiring a WebGL renderer.
const source=fs.readFileSync(new URL('../js/scenes.js',import.meta.url),'utf8');
const section=source.slice(source.indexOf('servo: {'),source.indexOf('stepper: {'));
const factory=new Function('return '+section.slice(section.indexOf('sim: api =>')+5).trim().replace(/,\s*}\s*,?$/,''))();
let angle=99,line; const sim=factory({servo:a=>angle=a,line:n=>line=n,serial:()=>{}});
sim.teach(0,false,false);assert.equal(angle,0);assert.equal(line,4);
sim.teach(1,true,false);sim.tick(1);assert.equal(angle,0);
sim.teach(2,true,false);sim.tick(.2);assert(angle<0&&angle>-Math.PI);sim.tick(.4);assert.equal(angle,-Math.PI);
for(let i=0;i<500;i++)sim.tick(.1);assert.equal(angle,-Math.PI);assert.equal(sim.running,false);
sim.teach(3,true,false);sim.tick(.6);assert.equal(angle,0);
sim.teach(2,true,false);sim.tick(.1);sim.teach(2,false,false);assert.equal(angle,-Math.PI);sim.tick(2);assert.equal(angle,-Math.PI);
sim.teach(3,true,true);assert.equal(angle,0);sim.tick(2);assert.equal(angle,0);
sim.start();assert.equal(sim.running,true);sim.tick(.2);assert.notEqual(angle,0);sim.stop();assert.equal(angle,0);
console.log('Actual servo sim: bounded outward/return, no autonomous advance, interruption settlement, reduced motion, optional continuous PASS');
