import { rnd, pick, REDUCED } from './utils.js';
import { W, H, G } from './state.js';

/* ============================= CROWD ================================ */
function buildCrowd(a,b){
  const oc=document.createElement('canvas'); oc.width=W; oc.height=240; const c=oc.getContext('2d');
  c.fillStyle='#101c30'; c.fillRect(0,0,W,240);
  const pal=[a.c1,a.c1,a.c2,b.c1,b.c2,'#c8ccd4','#9aa2b0','#5b6472','#39414f','#d8b25a','#26436b','#7a4646'];
  function tier(y0,y1,sc){
    for(let y=y0;y<y1;y+=6.6){
      for(let x=rnd(6);x<W;x+=5+rnd(3.4)){
        c.fillStyle=pick(pal);
        c.globalAlpha=.55+rnd(.45);
        c.beginPath(); c.arc(x,y+rnd(-1.4,1.4),1.9*sc+rnd(.8),0,7); c.fill();
      }
    }
    c.globalAlpha=1;
  }
  tier(8,104,.92);
  c.fillStyle='#1a2a44'; c.fillRect(0,106,W,22);
  c.fillStyle='#e9b83e'; for(let x=20;x<W;x+=64){c.globalAlpha=.5;c.fillRect(x,115,26,3);} c.globalAlpha=1;
  tier(132,236,1.08);
  return oc;
}


/* ============================ PARTICLES ============================= */
function confetti(n,colors){
  if(REDUCED) n=Math.floor(n/3);
  for(let i=0;i<n;i++) G.parts.push({
    x:rnd(0,W), y:rnd(-160,-10), vx:rnd(-40,40), vy:rnd(70,220),
    rot:rnd(6.3), vr:rnd(-4,4), w:rnd(4,9), h:rnd(6,13),
    color:pick(colors), life:rnd(2.4,4.2),
  });
}
function sparkBurst(x,y){
  const n=REDUCED?6:16;
  for(let i=0;i<n;i++){
    const a=rnd(Math.PI*2), sp=rnd(120,380);
    G.sparks.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:rnd(.25,.5)});
  }
}
function updateParts(dt){
  for(const p of G.parts){ p.life-=dt; p.x+=p.vx*dt+Math.sin(p.rot*2)*22*dt; p.y+=p.vy*dt; p.vy+=60*dt; p.rot+=p.vr*dt; }
  G.parts=G.parts.filter(p=>p.life>0&&p.y<H+30);
  for(const s of G.sparks){ s.life-=dt; s.x+=s.vx*dt; s.y+=s.vy*dt; s.vy+=500*dt; }
  G.sparks=G.sparks.filter(s=>s.life>0);
}

export { buildCrowd, confetti, sparkBurst, updateParts };
