import { clamp, lerp, rnd, easeOut, smoothT, REDUCED } from './utils.js';
import { W, H, GOAL, SPOT, GK_BASE, GK_HANDS0, G } from './state.js';
import { KEEPER_KIT, ROUNDS } from './data.js';
import { cv, ctx, view, ZOOM_C } from './canvas.js';
import { update, diveInputActive, playerEff, oppPlan } from './match.js';

/* =============================== DRAW =============================== */
function render(){
  const dpr=view.dpr;
  ctx.setTransform(1,0,0,1,0,0);
  ctx.fillStyle='#050b14'; ctx.fillRect(0,0,cv.width,cv.height);
  const shx=G.shake?rnd(-G.shake,G.shake):0, shy=G.shake?rnd(-G.shake,G.shake)*.6:0;
  ctx.setTransform(dpr*view.s,0,0,dpr*view.s,dpr*(view.ox+shx*view.s),dpr*(view.oy+shy*view.s));
  if(G.zoom>1.001){ ctx.translate(ZOOM_C.x,ZOOM_C.y); ctx.scale(G.zoom,G.zoom); ctx.translate(-ZOOM_C.x,-ZOOM_C.y); }
  drawSky(); drawStands(); drawAds(); drawPitch(); drawNet();
  drawKeeper(); drawReachRing(); drawPosts(); drawBarFlash();
  if(diveInputActive()) drawDiveAim();
  drawStriker(); drawTrail(); drawBall();
  if(G.shot&&G.shot.verdict==='goal'&&G.phase==='result') drawNet(); // ballon au fond des filets
  drawAimUI(); drawParticles(); drawVignette();
}
function drawSky(){
  const g=ctx.createLinearGradient(0,0,0,120);
  g.addColorStop(0,'#04070f'); g.addColorStop(1,'#0a1626');
  ctx.fillStyle=g; ctx.fillRect(-80,-80,W+160,180);
  ctx.fillStyle='#0e1a2c'; ctx.fillRect(-80,58,W+160,34);
  for(let x=60;x<W;x+=76){
    ctx.fillStyle='#fdf6d8'; ctx.beginPath(); ctx.arc(x,75,4.6,0,7); ctx.fill();
    const gl=ctx.createRadialGradient(x,75,2,x,75,26);
    gl.addColorStop(0,'rgba(253,246,216,.5)'); gl.addColorStop(1,'rgba(253,246,216,0)');
    ctx.fillStyle=gl; ctx.beginPath(); ctx.arc(x,75,26,0,7); ctx.fill();
  }
}
function drawStands(){
  if(G.crowdCv) ctx.drawImage(G.crowdCv,0,90);
  else { ctx.fillStyle='#101c30'; ctx.fillRect(0,90,W,240); }
  if(G.crowdCv&&G.excite>.2&&!REDUCED){
    ctx.globalAlpha=.35*G.excite;
    ctx.drawImage(G.crowdCv,0,90-3-Math.sin(G.t*9)*2);
    ctx.globalAlpha=1;
  }
  const n=G.flashRate*(REDUCED?4:14);
  for(let i=0;i<n;i++){ if(Math.random()<.5)continue;
    const x=rnd(0,W), y=rnd(95,325);
    ctx.fillStyle='rgba(255,255,255,'+rnd(.35,.9)+')';
    ctx.beginPath(); ctx.arc(x,y,rnd(1,2.6),0,7); ctx.fill();
  }
  const g=ctx.createLinearGradient(0,90,0,330);
  g.addColorStop(0,'rgba(255,244,200,.10)'); g.addColorStop(1,'rgba(255,244,200,0)');
  ctx.fillStyle=g; ctx.fillRect(0,90,W,240);
}
function drawAds(){
  const texts=['LE MONDIAL','TIRS AU BUT','ALLEZ !',ROUNDS[G.roundIdx].toUpperCase()];
  let x=0,i=0;
  ctx.save();
  while(x<W){
    const w=230;
    ctx.fillStyle=i%2?'#0d1a2e':'#12233c'; ctx.fillRect(x,330,w,34);
    ctx.fillStyle=i%3===0?'#e9b83e':'#c9d4e2';
    ctx.font='700 15px "Barlow Semi Condensed",sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(texts[i%texts.length],x+w/2,348,w-14);
    x+=w; i++;
  }
  ctx.restore();
  ctx.fillStyle='rgba(0,0,0,.35)'; ctx.fillRect(0,362,W,3);
}
function drawPitch(){
  const N=7;
  for(let k=0;k<N;k++){
    const t0=Math.pow(k/N,1.55), t1=Math.pow((k+1)/N,1.55);
    const y0=365+t0*(H+40-365), y1=365+t1*(H+40-365);
    ctx.fillStyle=k%2?'#1f7a3d':'#17662f';
    ctx.fillRect(-80,y0,W+160,y1-y0+1);
  }
  const g=ctx.createRadialGradient(640,520,60,640,520,620);
  g.addColorStop(0,'rgba(255,250,214,.10)'); g.addColorStop(1,'rgba(2,8,4,.18)');
  ctx.fillStyle=g; ctx.fillRect(-80,363,W+160,H-300);
  ctx.strokeStyle='rgba(242,239,228,.85)'; ctx.lineWidth=3; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(150,GOAL.ground+2); ctx.lineTo(1130,GOAL.ground+2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(497,GOAL.ground+2); ctx.lineTo(483,486); ctx.lineTo(797,486); ctx.lineTo(783,GOAL.ground+2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(345,GOAL.ground+2); ctx.lineTo(292,626); ctx.lineTo(988,626); ctx.lineTo(935,GOAL.ground+2); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(640,628,120,34,0,0.12*Math.PI,0.88*Math.PI); ctx.stroke();
  ctx.fillStyle='rgba(242,239,228,.9)';
  ctx.beginPath(); ctx.ellipse(SPOT.x,SPOT.y+8,7,3.4,0,0,7); ctx.fill();
}
function netOffset(){ return G.netShake>0&&!REDUCED?Math.sin(G.t*40)*G.netShake*6:0; }
function drawNet(){
  const off=netOffset();
  ctx.save();
  ctx.strokeStyle='rgba(238,242,240,.34)'; ctx.lineWidth=1;
  const bx0=474,bx1=806,by0=286+off*.4,by1=414;
  for(let x=bx0;x<=bx1;x+=13.8){ ctx.beginPath(); ctx.moveTo(x+off,by0); ctx.lineTo(x+off,by1); ctx.stroke(); }
  for(let y=by0;y<=by1;y+=12){ ctx.beginPath(); ctx.moveTo(bx0+off,y); ctx.lineTo(bx1+off,y); ctx.stroke(); }
  for(let i=0;i<=10;i++){
    const fx=lerp(GOAL.left,GOAL.right,i/10), bx=lerp(bx0,bx1,i/10);
    ctx.beginPath(); ctx.moveTo(fx,GOAL.bar+4); ctx.lineTo(bx+off,by0); ctx.stroke();
  }
  for(let i=0;i<=5;i++){
    const fy=lerp(GOAL.bar+4,GOAL.ground,i/5), by=lerp(by0,by1,i/5);
    ctx.beginPath(); ctx.moveTo(GOAL.left,fy); ctx.lineTo(bx0+off,by); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(GOAL.right,fy); ctx.lineTo(bx1+off,by); ctx.stroke();
  }
  ctx.restore();
  ctx.fillStyle='rgba(0,20,8,.25)';
  ctx.beginPath(); ctx.ellipse(640,GOAL.ground+10,230,14,0,0,7); ctx.fill();
}
function drawPosts(){
  ctx.save();
  ctx.fillStyle='#f5f3ea';
  const pw=GOAL.postW;
  roundRect(GOAL.left-pw,GOAL.bar-2,pw,GOAL.ground-GOAL.bar+4,4);
  roundRect(GOAL.right,GOAL.bar-2,pw,GOAL.ground-GOAL.bar+4,4);
  roundRect(GOAL.left-pw,GOAL.bar-10,GOAL.right-GOAL.left+2*pw,11,4);
  ctx.fillStyle='rgba(90,100,110,.35)';
  ctx.fillRect(GOAL.left-4,GOAL.bar+1,4,GOAL.ground-GOAL.bar);
  ctx.fillRect(GOAL.right+pw-4,GOAL.bar+1,4,GOAL.ground-GOAL.bar);
  ctx.restore();
}
function drawBarFlash(){
  if(G.barFlash<=0||!G.shot) return;
  ctx.save();
  ctx.globalAlpha=G.barFlash;
  ctx.fillStyle='#fff8dc';
  if(G.shot.verdict==='bar') ctx.fillRect(GOAL.left-GOAL.postW,GOAL.bar-10,GOAL.right-GOAL.left+2*GOAL.postW,11);
  else if(G.shot.verdict==='post'){
    if(G.shot.tx<640) ctx.fillRect(GOAL.left-GOAL.postW,GOAL.bar-2,GOAL.postW,GOAL.ground-GOAL.bar+4);
    else ctx.fillRect(GOAL.right,GOAL.bar-2,GOAL.postW,GOAL.ground-GOAL.bar+4);
  }
  ctx.restore();
}
function roundRect(x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); ctx.fill();
}

/* ----------------- visée du plongeon (swipe joueur) ----------------- */
function drawDiveAim(){
  const t=G.dive.target;
  const eff=playerEff(t,oppPlan?oppPlan.pw:.65);
  ctx.save();
  // léger voile sur l'intérieur du but pour signaler la zone jouable
  ctx.fillStyle='rgba(238,242,240,.05)';
  ctx.fillRect(GOAL.left,GOAL.top,GOAL.right-GOAL.left,GOAL.ground-GOAL.top);
  // ligne gants → cible
  ctx.strokeStyle='rgba(47,179,164,.9)'; ctx.lineWidth=3; ctx.setLineDash([9,7]);
  ctx.lineDashOffset=-G.t*40;
  ctx.beginPath(); ctx.moveTo(GK_HANDS0.x,GK_HANDS0.y); ctx.lineTo(t.x,t.y); ctx.stroke();
  ctx.setLineDash([]);
  // zone couverte (ellipse honnête : même pondération verticale que le calcul)
  ctx.strokeStyle='rgba(47,179,164,.95)'; ctx.lineWidth=2.5;
  ctx.fillStyle='rgba(47,179,164,.14)';
  ctx.beginPath(); ctx.ellipse(t.x,t.y,eff,eff/1.15,0,0,7); ctx.fill(); ctx.stroke();
  // croix centrale
  ctx.strokeStyle='rgba(238,242,240,.9)'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(t.x-8,t.y); ctx.lineTo(t.x+8,t.y); ctx.moveTo(t.x,t.y-8); ctx.lineTo(t.x,t.y+8); ctx.stroke();
  ctx.restore();
}
/* --------- anneau de couverture du gardien pendant le vol ---------- */
function drawReachRing(){
  if(G.keeper.mode!=='dive'||!G.keeper.target||!G.keeper.eff) return;
  if(G.phase!=='flight'&&G.phase!=='result'&&G.phase!=='pick') return;
  // l'anneau suit les gants : c'est LA zone couverte à cet instant
  const k=G.keeper, p=smoothT(k.t);
  const hx=lerp(GK_HANDS0.x,k.target.x,p), hy=lerp(GK_HANDS0.y,k.target.y,p);
  ctx.save();
  ctx.globalAlpha=.5*Math.min(1,.35+p)*(G.phase==='result'?.8:1);
  ctx.strokeStyle='rgba(47,179,164,.95)'; ctx.lineWidth=2.5; ctx.setLineDash([8,6]);
  ctx.fillStyle='rgba(47,179,164,.10)';
  ctx.beginPath(); ctx.ellipse(hx,hy,k.eff,k.eff/1.15,0,0,7);
  ctx.fill(); ctx.stroke();
  ctx.restore();
}

/* --------------------------- personnages ---------------------------- */
function drawKeeper(){
  const k=G.keeper;
  if(k.mode==='stand'){
    const sway=Math.sin(G.t*3.4)*4;
    drawFigure(640+sway,GK_BASE.y,1.7,'gk-stand',KEEPER_KIT,'#17181c',0);
    return;
  }
  // plongeon : les gants filent exactement vers la cible, ombre au sol
  const t=smoothT(k.t), tgt=k.target;
  const hands={x:lerp(GK_HANDS0.x,tgt.x,t), y:lerp(GK_HANDS0.y,tgt.y,t)};
  const dir=Math.sign(tgt.x-640);
  // vecteur du corps (des pieds vers les gants)
  let vx=hands.x-640, vy=hands.y-GK_BASE.y;
  const vlen=Math.hypot(vx,vy)||1; vx/=vlen; vy/=vlen;
  const shoulders={x:hands.x-vx*34, y:hands.y-vy*34};
  const hips={x:shoulders.x-vx*52, y:Math.min(shoulders.y-vy*52, GK_BASE.y-26)};
  const feet={x:hips.x-vx*46+dir*-6, y:Math.min(hips.y-vy*46+18, GK_BASE.y-4)};
  // ombre au sol qui suit le corps (repère de profondeur)
  ctx.save();
  ctx.fillStyle='rgba(0,18,6,'+(0.32-0.12*t)+')';
  ctx.beginPath(); ctx.ellipse((hips.x+feet.x)/2, GK_BASE.y+6, 34+20*t, 6, 0, 0, 7); ctx.fill();
  // jambes
  ctx.lineCap='round';
  ctx.strokeStyle='#17181c'; ctx.lineWidth=11;
  ctx.beginPath(); ctx.moveTo(feet.x,feet.y); ctx.lineTo(hips.x,hips.y); ctx.stroke();
  ctx.strokeStyle='#17181c'; ctx.lineWidth=10;
  ctx.beginPath(); ctx.moveTo(feet.x+10*dir||feet.x+8,feet.y+8); ctx.lineTo(hips.x,hips.y); ctx.stroke();
  // torse
  ctx.strokeStyle=KEEPER_KIT; ctx.lineWidth=20;
  ctx.beginPath(); ctx.moveTo(hips.x,hips.y); ctx.lineTo(shoulders.x,shoulders.y); ctx.stroke();
  // tête (légèrement décalée du corps)
  const hx=shoulders.x-vy*14, hy=shoulders.y+vx*14;
  ctx.fillStyle='#c9986f'; ctx.beginPath(); ctx.arc(hx,hy,11,0,7); ctx.fill();
  ctx.fillStyle='#241a12'; ctx.beginPath(); ctx.arc(hx,hy-3,10,Math.PI,0); ctx.fill();
  // bras tendus vers la cible + gants bien visibles
  ctx.strokeStyle=KEEPER_KIT; ctx.lineWidth=9;
  ctx.beginPath(); ctx.moveTo(shoulders.x,shoulders.y); ctx.lineTo(hands.x-6,hands.y+5); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(shoulders.x,shoulders.y); ctx.lineTo(hands.x+6,hands.y-5); ctx.stroke();
  ctx.fillStyle='#f2efe4';
  ctx.beginPath(); ctx.arc(hands.x-6,hands.y+5,6.5,0,7); ctx.fill();
  ctx.beginPath(); ctx.arc(hands.x+6,hands.y-5,6.5,0,7); ctx.fill();
  ctx.restore();
}
function drawStriker(){
  if(G.screen!=='match') return;
  const team=G.striker.team||G.myTeam;
  if(G.phase==='pick'){
    const t=G.striker.t;
    if(t<=0){ drawFigure(560,655,2.15,'stand',team.c1,team.c2,0); }
    else{
      // course d'élan : dans les derniers appuis, le corps s'incline du côté réel de la frappe
      const x=lerp(560,SPOT.x-30,easeOut(t)), y=lerp(655,SPOT.y+12,easeOut(t));
      const lean=t>.62?clamp((oppPlan.tx-640)/265,-1,1)*(0.38-G.roundIdx*0.05)*Math.min(1,(t-.62)/.3):0;
      drawFigure(x,y,2.15,t>.82?'kick':'run',team.c1,team.c2,Math.sin(t*22)*.5,lean);
    }
  } else if(G.phase==='aim'||G.phase==='power'){
    drawFigure(560,655,2.15,'stand',team.c1,team.c2,0);
  } else if(G.phase==='runup'){
    const t=G.striker.t;
    const x=lerp(560,SPOT.x-30,easeOut(t)), y=lerp(655,SPOT.y+12,easeOut(t));
    drawFigure(x,y,2.15,t>.82?'kick':'run',team.c1,team.c2,Math.sin(t*22)*.5);
  } else if(G.phase==='flight'||G.phase==='result'){
    drawFigure(SPOT.x-30,SPOT.y+12,2.15,'kick',team.c1,team.c2,0);
  }
}
/* figure stylisée debout / course / frappe */
function drawFigure(x,y,sc,pose,kit,shorts,ph,lean=0){
  ctx.save(); ctx.translate(x,y); ctx.scale(sc,sc);
  ctx.fillStyle='rgba(0,18,6,.3)'; ctx.beginPath(); ctx.ellipse(0,2,20,5,0,0,7); ctx.fill();
  if(lean) ctx.rotate(lean);
  const skin='#c9986f';
  ctx.lineCap='round';
  ctx.strokeStyle='#17181c'; ctx.lineWidth=7;
  if(pose==='run'){ ctx.beginPath(); ctx.moveTo(-3,-26); ctx.lineTo(-10+ph*10,-2); ctx.moveTo(3,-26); ctx.lineTo(10-ph*10,-2); ctx.stroke(); }
  else if(pose==='kick'){ ctx.beginPath(); ctx.moveTo(-4,-26); ctx.lineTo(-8,-2); ctx.moveTo(3,-26); ctx.lineTo(20,-16); ctx.stroke(); }
  else { ctx.beginPath(); ctx.moveTo(-4,-26); ctx.lineTo(-6,-2); ctx.moveTo(4,-26); ctx.lineTo(6,-2); ctx.stroke(); }
  ctx.fillStyle=shorts; roundRect(-9,-34,18,12,3);
  ctx.fillStyle=kit; roundRect(-10,-58,20,26,6);
  ctx.strokeStyle=kit; ctx.lineWidth=6;
  if(pose==='gk-stand'){ ctx.beginPath(); ctx.moveTo(-9,-52); ctx.lineTo(-22,-64); ctx.moveTo(9,-52); ctx.lineTo(22,-64); ctx.stroke();
    ctx.fillStyle='#f2efe4'; ctx.beginPath(); ctx.arc(-23,-66,4,0,7); ctx.fill(); ctx.beginPath(); ctx.arc(23,-66,4,0,7); ctx.fill(); }
  else if(pose==='kick'){ ctx.beginPath(); ctx.moveTo(-9,-52); ctx.lineTo(-20,-40); ctx.moveTo(9,-52); ctx.lineTo(18,-58); ctx.stroke(); }
  else { ctx.beginPath(); ctx.moveTo(-9,-52); ctx.lineTo(-14,-38); ctx.moveTo(9,-52); ctx.lineTo(14,-38); ctx.stroke(); }
  ctx.fillStyle=skin; ctx.beginPath(); ctx.arc(0,-66,7.4,0,7); ctx.fill();
  ctx.fillStyle='#241a12'; ctx.beginPath(); ctx.arc(0,-69,6.6,Math.PI,0); ctx.fill();
  ctx.restore();
}
function drawTrail(){
  for(const tr of G.trail){
    ctx.globalAlpha=Math.max(0,tr.a)*.5;
    ctx.fillStyle='#eef2f0';
    ctx.beginPath(); ctx.arc(tr.x,tr.y,tr.r*.55,0,7); ctx.fill();
  }
  ctx.globalAlpha=1;
}
function drawBall(){
  const b=G.ball;
  if(G.screen!=='match'||b.alpha<=0) return;
  ctx.save();
  ctx.globalAlpha=b.alpha;
  // ombre projetée au sol : l'écart vertical = la hauteur du ballon
  const sh=b.sh||{x:b.x,y:Math.min(b.y+b.r+4,GOAL.ground+12)};
  const height=Math.max(0,sh.y-b.y);
  const k=1/(1+height/150);
  ctx.fillStyle='rgba(0,18,6,'+(0.34*k+0.06)+')';
  ctx.beginPath(); ctx.ellipse(sh.x,sh.y,b.r*(0.6+0.5*k),b.r*.30*(0.6+0.5*k),0,0,7); ctx.fill();
  const g=ctx.createRadialGradient(b.x-b.r*.4,b.y-b.r*.4,b.r*.2,b.x,b.y,b.r);
  g.addColorStop(0,'#ffffff'); g.addColorStop(.75,'#e8e8e4'); g.addColorStop(1,'#b9bcba');
  ctx.fillStyle=g; ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,7); ctx.fill();
  ctx.strokeStyle='rgba(40,44,48,.5)'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.arc(b.x,b.y,b.r*.55,.6,3.6); ctx.stroke();
  ctx.fillStyle='rgba(40,44,48,.55)';
  ctx.beginPath(); ctx.arc(b.x-b.r*.25,b.y-b.r*.1,b.r*.22,0,7); ctx.fill();
  ctx.restore();
}
function drawAimUI(){
  if(G.phase==='aim'||G.phase==='power'){
    const p=G.phase==='aim'?G.aimP:G.lockP;
    const tx=640+p*265;
    ctx.save();
    ctx.strokeStyle='rgba(233,184,62,.95)'; ctx.lineWidth=5; ctx.lineCap='round';
    ctx.setLineDash([12,9]); ctx.lineDashOffset=-G.t*60;
    ctx.beginPath();
    ctx.moveTo(SPOT.x,SPOT.y-16);
    ctx.quadraticCurveTo((SPOT.x+tx)/2,SPOT.y-120,tx,GOAL.ground-60);
    ctx.stroke();
    ctx.setLineDash([]);
    const ang=Math.atan2((GOAL.ground-60)-(SPOT.y-120),tx-(SPOT.x+tx)/2);
    ctx.translate(tx,GOAL.ground-60); ctx.rotate(ang);
    ctx.fillStyle='rgba(233,184,62,.95)';
    ctx.beginPath(); ctx.moveTo(14,0); ctx.lineTo(-8,-9); ctx.lineTo(-8,9); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  if(G.phase==='power'){
    // la jauge se recale sur le bord droit réellement visible (cadrage portrait)
    const x=Math.min(1120,W/2+view.visW/2-120),y0=400,y1=660,h=y1-y0;
    ctx.save();
    ctx.fillStyle='rgba(9,22,37,.85)'; roundRect(x-6,y0-8,36,h+16,10);
    const g=ctx.createLinearGradient(0,y1,0,y0);
    g.addColorStop(0,'#3dbd6a'); g.addColorStop(.62,'#e9c53e'); g.addColorStop(.85,'#e9832e'); g.addColorStop(1,'#d8434a');
    ctx.fillStyle=g;
    const fh=h*G.pw;
    ctx.beginPath(); ctx.rect(x,y1-fh,24,fh); ctx.fill();
    ctx.fillStyle='rgba(255,255,255,.8)'; ctx.fillRect(x-2,y1-h*.85,28,2);
    ctx.font='700 13px "Barlow Semi Condensed",sans-serif'; ctx.fillStyle='#eef2f0';
    ctx.textAlign='center'; ctx.fillText('PUISSANCE',x+12,y0-18);
    ctx.restore();
  }
}
function drawParticles(){
  for(const p of G.parts){
    ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot);
    ctx.globalAlpha=clamp(p.life,0,1);
    ctx.fillStyle=p.color; ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h);
    ctx.restore();
  }
  for(const s of G.sparks){
    ctx.globalAlpha=clamp(s.life*2.4,0,1);
    ctx.strokeStyle='#ffe9a0'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(s.x,s.y); ctx.lineTo(s.x-s.vx*.03,s.y-s.vy*.03); ctx.stroke();
  }
  ctx.globalAlpha=1;
}
function drawVignette(){
  const g=ctx.createRadialGradient(640,380,300,640,380,780);
  g.addColorStop(0,'rgba(0,0,0,0)'); g.addColorStop(1,'rgba(0,0,0,.34)');
  ctx.fillStyle=g; ctx.fillRect(-80,-80,W+160,H+160);
  // halo rouge qui bat au rythme du cœur pendant un penalty décisif
  if(G.decisive&&G.screen==='match'&&G.phase!=='result'&&G.phase!=='idle'){
    const p=REDUCED?.5:(Math.sin(G.t*8.2)+1)/2;
    const rg=ctx.createRadialGradient(640,380,430,640,380,820);
    rg.addColorStop(0,'rgba(150,15,22,0)'); rg.addColorStop(1,`rgba(150,15,22,${.14+.15*p})`);
    ctx.fillStyle=rg; ctx.fillRect(-80,-80,W+160,H+160);
  }
}


/* ============================ MAIN LOOP ============================= */
let lastT=performance.now();
function loop(now){
  const dt=Math.min(.05,(now-lastT)/1000); lastT=now;
  update(dt); render();
  requestAnimationFrame(loop);
}
function startLoop(){ lastT=performance.now(); requestAnimationFrame(loop); }

export { startLoop };
