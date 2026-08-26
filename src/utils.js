

/* ============================ UTILITIES ============================= */
const $=s=>document.querySelector(s);
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const rnd=(a=1,b)=>b===undefined?Math.random()*a:a+Math.random()*(b-a);
const pick=a=>a[Math.floor(Math.random()*a.length)];
const easeOut=t=>1-Math.pow(1-t,3);
const smoothT=t=>{t=clamp(t,0,1);return t*t*(3-2*t);}; // progression du plongeon
const REDUCED=matchMedia('(prefers-reduced-motion: reduce)').matches;
function lsGet(k,d){ try{const v=localStorage.getItem(k); return v==null?d:JSON.parse(v);}catch(e){return d;} }
function lsSet(k,v){ try{localStorage.setItem(k,JSON.stringify(v));}catch(e){} }

export { $, clamp, lerp, rnd, pick, easeOut, smoothT, REDUCED, lsGet, lsSet };
