const assert=require('node:assert/strict');
const dsp=require('../web/dsp-core.js');
for(const n of [1600,16001,64000]){const x=Float32Array.from({length:n},(_,i)=>.2*Math.sin(i*.31)+.1*Math.cos(i*.61));const y=dsp.render(x,[]);assert.equal(y.length,n);for(let i=0;i<n;i++)assert.ok(Math.abs(x[i]-y[i])<1e-7)}
const x=Float32Array.from({length:32000},(_,i)=>.2*Math.sin(2*Math.PI*500*i/16000)+.2*Math.sin(2*Math.PI*3000*i/16000));
const e={operation:'attenuate',start_s:0,end_s:2,min_hz:400,max_hz:600,gain_db:-40};
function amp(a,f){let r=0,im=0;for(let i=4000;i<a.length-4000;i++){r+=a[i]*Math.cos(2*Math.PI*f*i/16000);im+=a[i]*Math.sin(2*Math.PI*f*i/16000)}return Math.hypot(r,im)}
const y=dsp.render(x,[e]);assert.ok(amp(y,500)/amp(x,500)<.02);assert.ok(amp(y,3000)/amp(x,3000)>.99);
assert.throws(()=>dsp.render(x,[{...e,end_s:30}]));assert.throws(()=>dsp.render(x,[{...e,gain_db:NaN}]));
const view=dsp.view(x,0,2);assert.equal(view.frequencies_hz[32],500);assert.ok(view.db[32][10]>-25);assert.equal(new DataView(dsp.wav(x)).getUint32(40,true),x.length*4);
console.log('Browser DSP: identity, band suppression, preserved frequencies, validation, FFT calibration and WAV length passed');
