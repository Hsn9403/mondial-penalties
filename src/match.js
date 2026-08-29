import { $, clamp, lerp, rnd, pick, smoothT, REDUCED, lsGet, lsSet } from './utils.js';
import { Snd } from './audio.js';
import { G, diff, SPOT, GOAL, GK_HANDS0, GK_BASE } from './state.js';
import { cv, toLogical } from './canvas.js';
import { buildCrowd, confetti, sparkBurst, updateParts } from './effects.js';
import { showScreen, setPrompt, banner, scoreOf, updateHud } from './ui.js';
import { advanceTournament, showBracket, parcoursHtml } from './tournament.js';
import { unlock, champNations } from './trophies.js';
import { recordRun } from './leaderboard.js';
import { TEAMS, ROUNDS, PASS_MSGS, LOSS_MSGS, CHAMP_MSGS } from './data.js';

/* ============================= MATCH ================================ */
let timers=[];
function later(fn,ms){ timers.push(setTimeout(fn,ms)); }
function clearTimers(){ timers.forEach(clearTimeout); timers=[]; }

function startMatch(){
  clearTimers();
  G.screen='match'; G.kicksA=[]; G.kicksB=[]; G.parts=[]; G.sparks=[]; G.excite=.2; G.flashRate=.02;
  G.matchSaves=0;
  G.crowdCv=buildCrowd(G.myTeam,G.oppTeam);
  showScreen(null); $('#hud').style.display='flex';
  resetBall(); G.keeper={mode:'stand',target:null,t:0,eff:0}; G.phase='idle'; updateHud();
  Snd.ensure(); Snd.whistle(true);
  banner(ROUNDS[G.roundIdx].toUpperCase(),'gold');
  later(nextKick,1900);
}
function resetBall(){ G.ball={x:SPOT.x,y:SPOT.y,r:13,free:false,vx:0,vy:0,alpha:1,fade:0,floor:GOAL.ground+6,sh:null}; G.trail=[]; }
function kickLabel(arr){ const n=arr.length+1; return n<=5?`Tir ${n}/5`:`Mort subite · tir ${n}`; }

/* le tir à venir peut-il gagner OU perdre le match ? */
function kickIsDecisive(mine){
  const a=[...G.kicksA], b=[...G.kicksB], arr=mine?a:b;
  let dec=false;
  for(const v of [true,false]){ arr.push(v); if(checkEndFor(a,b)) dec=true; arr.pop(); }
  return dec;
}
function setDecisive(on){
  G.decisive=on;
  $('#decisive').className=on?'on':'';
  if(on) Snd.heartStart(); else Snd.heartStop();
}
function nextKick(){
  resetBall(); G.keeper={mode:'stand',target:null,t:0,eff:0}; G.shot=null; G.t=0;
  const myTurn=G.kicksA.length===G.kicksB.length;
  G.shooterIsMe=myTurn;
  setDecisive(kickIsDecisive(myTurn));
  const dec=G.decisive?'<em>Penalty décisif</em> · ':'';
  if(myTurn){
    G.phase='aim'; G.striker={t:0,team:G.myTeam};
    setPrompt(`${dec}${kickLabel(G.kicksA)} — <em>Cliquez</em> pour figer la direction`);
  }else{
    G.phase='pick'; G.striker={t:0,team:G.oppTeam}; G.pickT=0;
    G.dive={target:{x:640,y:352},dragging:false,sx:0,sy:0,moved:0};
    planOppShot();
    setPrompt(`${dec}${kickLabel(G.kicksB)} adverse — plongez <em>au moment de la frappe</em>&nbsp;: touchez l'endroit&nbsp;!`);
  }
  updateHud();
}

/* ------------------- portée de plongeon (joueur) ------------------- */
function playerEff(target,pw){
  const stretch=Math.hypot(target.x-GK_HANDS0.x,target.y-GK_HANDS0.y);
  return 104*(1.12-.45*pw)*(1-.18*Math.min(1,stretch/300));
}

/* --------------------------- player shot --------------------------- */
function lockAim(){
  G.lockP=G.aimP; G.phase='power'; G.t=0;
  setPrompt(`<em>Cliquez</em> pour régler la puissance — trop fort&nbsp;: au-dessus&nbsp;!`);
}
function fireShot(){
  const d=diff(), pw=G.pw, p=G.lockP;
  const jx=(Math.random()-.5)*2*(4+12*pw), jy=(Math.random()-.5)*2*(3+10*pw);
  const tx=640+p*265+jx;
  const ty=420-pw*212+jy;
  // le gardien estime le point d'impact (lecture correcte ou côté inversé)
  const readOk=Math.random()<d.gkGuess;
  let hx = readOk ? tx+rnd(-1,1)*d.gkErr : 640-(tx-640)+rnd(-1,1)*90;
  let hy = ty+rnd(-1,1)*(d.gkErr*.7);
  hx=clamp(hx,458,822); hy=clamp(hy,272,412);
  let eff=d.gkReach*(1.15-.5*pw);
  if(pw<.28) eff*=1.7;
  // verdict géométrique — identique à ce qui sera dessiné
  let verdict;
  const inX=tx>441&&tx<839;
  if(tx<421||tx>859) verdict='wide';
  else if(!inX&&ty>264) verdict='post';
  else if(ty<240) verdict='over';
  else if(ty<264&&inX) verdict='bar';
  else verdict = Math.hypot(tx-hx,(ty-hy)*1.15)<eff ? 'save' : 'goal';
  launch({tx,ty,pw,verdict,hx,hy,eff,mine:true,panenka:pw<.28&&Math.abs(p)<.25});
}

/* -------------------------- opponent shot -------------------------- */
let oppPlan=null;
function planOppShot(){
  const d=diff();
  const corners=[[490,300],[790,300],[500,388],[780,388],[640,296],[640,392]];
  const wts=[2,2,3,3,1,1];
  let z=corners[0],acc=0,rw=rnd(wts.reduce((a,b)=>a+b,0));
  for(let i=0;i<corners.length;i++){acc+=wts[i]; if(rw<acc){z=corners[i];break;}}
  const pw=.55+rnd(.3);
  let tx=z[0]+rnd(-d.oppSpread,d.oppSpread), ty=z[1]+rnd(-d.oppSpread*.7,d.oppSpread*.7);
  if(Math.random()<d.oppMiss){
    if(Math.random()<.5){ tx=z[0]<640?rnd(392,416):rnd(864,888); ty=rnd(300,410); }
    else ty=rnd(190,232);
  }
  tx=clamp(tx,380,900); ty=clamp(ty,185,424);
  oppPlan={tx,ty,pw};
}
/* le plongeon se décide EN DIRECT, pendant la frappe */
function diveInputActive(){
  return G.keeper.mode==='stand'&&
    (G.phase==='pick'||(G.phase==='flight'&&G.shot&&!G.shot.mine));
}
function commitDive(){
  if(!diveInputActive()) return;
  const target={x:clamp(G.dive.target.x,450,830),y:clamp(G.dive.target.y,268,416)};
  G.keeper={mode:'dive',target,t:0,eff:playerEff(target,oppPlan.pw)};
}
function startOppFlight(){
  const {tx,ty,pw}=oppPlan;
  G.shot={tx,ty,pw,verdict:null,hx:0,hy:0,eff:0,mine:false,
    dur:(1.15-.55*pw)*(1-.03*G.roundIdx), arc:18+(1-pw)*50, flightT:0};
  beginFlight();
}

/* ---------------------------- ball flight -------------------------- */
function launch(shot){
  shot.dur=1.15-.55*shot.pw;
  shot.arc=18+(1-shot.pw)*50;
  shot.flightT=0;
  G.shot=shot; G.phase='runup'; G.t=0; G.striker.t=0;
  setPrompt(null); Snd.swell();
}
function beginFlight(){
  G.phase='flight'; G.shot.flightT=0; Snd.kick();
  if(!REDUCED) G.shake=Math.max(G.shake,2.5);
}
function resolveShot(){
  const s=G.shot;
  G.dive.dragging=false;
  if(!s.mine){
    // verdict décidé à l'arrivée du ballon, selon où en sont réellement les gants
    const inX=s.tx>441&&s.tx<839;
    if(s.tx<421||s.tx>859) s.verdict='wide';
    else if(!inX&&s.ty>264) s.verdict='post';
    else if(s.ty<240) s.verdict='over';
    else if(s.ty<264&&inX) s.verdict='bar';
    else{
      let hands,eff;
      if(G.keeper.mode==='dive'){
        const p=smoothT(G.keeper.t);
        hands={x:lerp(GK_HANDS0.x,G.keeper.target.x,p),y:lerp(GK_HANDS0.y,G.keeper.target.y,p)};
        eff=G.keeper.eff;
      }else{
        hands={x:GK_HANDS0.x,y:GK_HANDS0.y};
        eff=58*(1.15-.5*s.pw);        // resté planté : seuls les tirs mous et centraux
      }
      s.hx=hands.x; s.hy=hands.y; s.eff=eff;
      s.verdict=Math.hypot(s.tx-hands.x,(s.ty-hands.y)*1.15)<eff?'save':'goal';
    }
  }
  const scored=s.verdict==='goal';
  const arr=s.mine?G.kicksA:G.kicksB;
  arr.push(scored);
  setDecisive(false);   // le suspense est levé, le cœur peut repartir
  if(s.mine&&scored) G.tGoals++;
  if(!s.mine&&scored) G.tConceded++;
  if(!s.mine&&s.verdict==='save'){ G.matchSaves++; G.tSaves++; if(G.matchSaves>=3) unlock('muraille'); }
  if(s.mine&&scored&&s.panenka) unlock('panenka');
  G.phase='result'; G.freeze=.09; G.netShake=scored?.5:0;
  const b=G.ball;
  const exitVx=(s.tx-SPOT.x)/s.dur, exitVy=((s.ty-SPOT.y)+s.arc*Math.PI)/s.dur;
  if(scored){ b.free=true; b.vx=(clamp(s.tx,480,800)-s.tx)*1.6; b.vy=Math.max(60,exitVy*.25); b.floor=408; }
  else if(s.verdict==='save'){
    b.free=true;
    const dx=s.tx-s.hx||(Math.random()<.5?-1:1);
    b.vx=Math.sign(dx)*rnd(200,300); b.vy=-rnd(40,140); b.floor=GOAL.ground+6;
    sparkBurst(s.tx,s.ty);
  }
  else if(s.verdict==='post'){ b.free=true; b.vx=(s.tx<640?1:-1)*rnd(180,280); b.vy=rnd(40,140); b.floor=GOAL.ground+6; Snd.post(); sparkBurst(s.tx<640?430:850,s.ty); G.barFlash=.45; if(!REDUCED)G.shake=Math.max(G.shake,5); }
  else if(s.verdict==='bar'){ b.free=true; b.vx=exitVx*.2; b.vy=Math.abs(exitVy)*.55+120; b.floor=GOAL.ground+6; Snd.post(); sparkBurst(s.tx,GOAL.bar); G.barFlash=.45; if(!REDUCED)G.shake=Math.max(G.shake,5); }
  else if(s.verdict==='over'){ b.free=true; b.vx=exitVx*.85; b.vy=exitVy*.85; b.floor=1e9; b.fade=.75; }
  else { /* wide */ b.free=true; b.vx=exitVx*.8; b.vy=exitVy*.4; b.floor=GOAL.ground+8; b.fade=1.1; }
  const good = s.mine ? scored : !scored;
  if(good){ G.excite=1; G.flashRate=.45; if(!REDUCED)G.shake=Math.max(G.shake,scored?10:8); Snd.roar();
    if(s.mine) confetti(90,[G.myTeam.c1,G.myTeam.c2,'#e9b83e','#f4f4f4']);
  } else { G.excite=.5; Snd.groan(); }
  const msgs={
    goal: s.mine?['BUT !!!','green']:['But encaissé…','red'],
    save: s.mine?['Arrêt du gardien !','red']:['QUEL ARRÊT !!!','gold'],
    wide: s.mine?['À côté !','red']:['Il tire à côté !','gold'],
    over: s.mine?['Au-dessus !','red']:['Envolé au-dessus !','gold'],
    post: s.mine?['Le poteau !','red']:['Sur le poteau !','gold'],
    bar:  s.mine?['La barre !','red']:['Sur la barre !','gold'],
  };
  const m=msgs[s.verdict]; banner(m[0],m[1]);
  updateHud();
  later(()=>{
    const end=checkEnd();
    if(end) endMatch(end); else nextKick();
  },1900);
}
function checkEnd(){ return checkEndFor(G.kicksA,G.kicksB); }
function checkEndFor(kA,kB){
  const a=scoreOf(kA), b=scoreOf(kB), na=kA.length, nb=kB.length;
  if(na<=5&&nb<=5){
    if(a>b+(5-nb)) return 'win';
    if(b>a+(5-na)) return 'lose';
    if(na===5&&nb===5&&a!==b) return a>b?'win':'lose';
    if(na===5&&nb===5) return null;
  } else if(na===nb&&a!==b) return a>b?'win':'lose';
  return null;
}
function endMatch(result){
  G.phase='idle'; setPrompt(null); setDecisive(false);
  const a=scoreOf(G.kicksA), b=scoreOf(G.kicksB);
  Snd.whistle(true);
  if(result==='win'){
    if(G.kicksA.length&&G.kicksA.every(v=>v)) unlock('sans-trembler');
    if(b===0) unlock('main-ferme');
    if(G.kicksA.length>5) unlock('mort-subite');
    if(!(a===3&&b===0)) G.gcOk=false;   // le Grand Chelem exige un 3–0 à chaque tour
    G.excite=1; G.flashRate=.6;
    confetti(160,[G.myTeam.c1,G.myTeam.c2,'#e9b83e','#f4f4f4']);
    const isFinal=G.roundIdx===4;
    banner(isFinal?'CHAMPIONS !':'QUALIFIÉS !','gold'); Snd.roar();
    later(()=>{
      $('#hud').style.display='none';
      const prevBracket=G.bracket, wonIdx=G.roundIdx;
      const champion=advanceTournament(a,b);
      if(champion){
        unlock('champion');
        const titles=lsGet('mp-titles',0)+1; lsSet('mp-titles',titles);
        if(titles>=2) unlock('double');
        if(G.myTeam.s<=80) unlock('outsider');
        if(G.gcOk) unlock('grand-chelem');
        champNations.add(G.myTeam.n); lsSet('mp-champs',[...champNations]);
        if(champNations.size>=TEAMS.length) unlock('integral');
        recordRun(true);
        $('#champ-title').textContent=`${G.myTeam.n}, champion du monde`;
        $('#champ-text').innerHTML=`${G.myTeam.f} ${pick(CHAMP_MSGS)(G.myTeam.n)} Cinq séances de tirs au but remportées d'affilée.`;
        $('#parcours2').innerHTML='Parcours — '+parcoursHtml();
        showScreen('#scr-champ');
        confetti(220,[G.myTeam.c1,G.myTeam.c2,'#e9b83e','#f4f4f4']);
      } else showCinematic(prevBracket,wonIdx);
    },2600);
  }else{
    banner('ÉLIMINÉS…','red');
    later(()=>{
      $('#hud').style.display='none';
      G.history.push({round:ROUNDS[G.roundIdx],opp:G.oppTeam,sc:[a,b]});
      recordRun(false);
      $('#out-title').textContent=`${G.myTeam.n} s'arrête en ${ROUNDS[G.roundIdx].toLowerCase()}`;
      $('#out-text').innerHTML=`${pick(LOSS_MSGS[G.roundIdx])(G.myTeam.n)} Battus <b>${b} – ${a}</b> par ${G.oppTeam.f} ${G.oppTeam.n}.`;
      $('#parcours').innerHTML=G.history.length>1?('Parcours — '+parcoursHtml()):'';
      showScreen('#scr-out');
    },2300);
  }
}

/* ================= CINÉMATIQUE DE PASSAGE DE TOUR =================== */
/* le tour gagné se rejoue carte par carte, puis les éliminés s'effacent */
function showCinematic(prevBracket,wonIdx){
  $('#cine-kicker').textContent=`${ROUNDS[wonIdx]} · Résultats`;
  $('#cinecount').innerHTML=`<b>${prevBracket.length*2}</b> équipes &nbsp;→&nbsp; <b>${prevBracket.length}</b> qualifiées`;
  const msgEl=$('#cinemsg'); msgEl.classList.remove('show'); msgEl.textContent='';
  const btn=$('#btn-cine'); btn.classList.remove('show');
  const g=$('#cinegrid'); g.classList.remove('shrink'); g.innerHTML='';
  for(const m of prevBracket){
    const mine=m.a===G.myTeam||m.b===G.myTeam;
    const wA=m.res[0]>m.res[1];
    const d=document.createElement('div'); d.className='fx'+(mine?' mine':'');
    d.innerHTML=`<span class="t${wA?'':' ko'}"><span>${m.a.f}</span><span class="nm ${wA?'win':''}">${m.a.n}</span></span>
      <span class="sc">${m.res[0]} – ${m.res[1]}</span>
      <span class="t${wA?' ko':''}"><span class="nm ${wA?'':'win'}" style="text-align:right">${m.b.n}</span><span>${m.b.f}</span></span>`;
    g.appendChild(d);
  }
  showScreen('#scr-cine');
  const cards=[...g.children];
  const step=Math.min(260,2600/cards.length);   // rythme adapté au nombre de matchs
  cards.forEach((c,i)=>later(()=>{ c.classList.add('reveal'); Snd.kick(); },300+step*i));
  const tDone=300+step*cards.length+700;
  later(()=>{ g.classList.add('shrink'); Snd.groan(); },tDone);            // le tableau se réduit
  later(()=>{ msgEl.textContent=pick(PASS_MSGS[wonIdx])(G.myTeam.n); msgEl.classList.add('show'); Snd.roar(); },tDone+800);
  later(()=>btn.classList.add('show'),tDone+1500);
}


/* ============================== INPUT =============================== */
function primaryAction(){
  Snd.ensure();
  if(G.screen!=='match') return;
  if(G.phase==='aim') lockAim();
  else if(G.phase==='power') fireShot();
  else if(diveInputActive()) commitDive();
}
cv.addEventListener('pointerdown',e=>{
  Snd.ensure();
  if(G.screen!=='match') return;
  if(diveInputActive()){
    // visée absolue : on plonge là où le doigt se pose. Un glissement relatif
    // était impraticable au toucher, et un simple tap renvoyait au centre —
    // soit l'inverse de ce qu'on vise en touchant un coin.
    G.dive.dragging=true;
    G.dive.target=diveAt(e);
    cv.setPointerCapture&&cv.setPointerCapture(e.pointerId);
    return;
  }
  primaryAction();
});
function diveAt(e){
  const p=toLogical(e);
  return {x:clamp(p.x,450,830),y:clamp(p.y,268,416)};
}
cv.addEventListener('pointermove',e=>{
  if(!G.dive.dragging) return;
  G.dive.target=diveAt(e);
});
addEventListener('pointerup',e=>{
  if(!G.dive.dragging) return;
  G.dive.dragging=false;
  commitDive();   // relâcher valide le plongeon, tap simple compris
});
addEventListener('keydown',e=>{
  if(e.repeat) return;
  if(e.code==='Space'||e.code==='Enter'){
    if(G.screen==='match'){ e.preventDefault(); primaryAction(); }
    return;
  }
  if(diveInputActive()){
    const t=G.dive.target; let handled=true;
    if(e.code==='ArrowLeft')t.x-=62;
    else if(e.code==='ArrowRight')t.x+=62;
    else if(e.code==='ArrowUp')t.y-=48;
    else if(e.code==='ArrowDown')t.y+=48;
    else handled=false;
    if(handled){ e.preventDefault(); t.x=clamp(t.x,450,830); t.y=clamp(t.y,268,416); }
  }
});


/* ============================== UPDATE ============================== */
function update(dt){
  if(G.freeze>0){ G.freeze-=dt; return; }
  G.t+=dt;
  G.excite=Math.max(.12,G.excite-dt*.25);
  G.flashRate=Math.max(.02,G.flashRate-dt*.3);
  G.shake=Math.max(0,G.shake-dt*26);
  G.netShake=Math.max(0,G.netShake-dt*1.4);
  G.barFlash=Math.max(0,G.barFlash-dt*1.8);
  // zoom caméra sur la cage pendant toute la phase de gardien
  const gkPhase=G.phase==='pick'||(G.shot&&!G.shot.mine&&(G.phase==='runup'||G.phase==='flight'||G.phase==='result'));
  const zTarget=gkPhase?1.24:1;
  G.zoom+=(zTarget-G.zoom)*Math.min(1,dt*4);
  updateParts(dt);
  const d=diff();
  if(G.phase==='aim'){ G.aimP=Math.sin(G.t*2*Math.PI*d.arrowF); }
  else if(G.phase==='power'){ G.pw=(1-Math.cos(G.t*2*Math.PI*d.powerF))/2; }
  else if(G.phase==='runup'){
    G.striker.t=Math.min(1,G.striker.t+dt/.55);
    if(G.striker.t>=1) beginFlight();
  }
  else if(G.phase==='pick'){
    // le tireur adverse s'élance tout seul : au joueur de réagir
    G.pickT+=dt;
    if(G.pickT>.9){
      G.striker.t=Math.min(1,G.striker.t+dt/.6);
      if(G.striker.t>=1) startOppFlight();
    }
    if(G.keeper.mode==='dive') G.keeper.t=Math.min(1,G.keeper.t+dt/.55);
  }
  else if(G.phase==='flight'){
    const s=G.shot; s.flightT=Math.min(1,s.flightT+dt/s.dur);
    const t=s.flightT, b=G.ball;
    b.x=lerp(SPOT.x,s.tx,t);
    const planeY=lerp(SPOT.y,s.ty,t);
    b.y=planeY-s.arc*Math.sin(Math.PI*t);
    b.r=lerp(13,9,t);
    b.sh={x:b.x,y:lerp(SPOT.y,GOAL.ground+3,t)};   // ombre projetée au sol
    G.trail.push({x:b.x,y:b.y,r:b.r,a:.5});
    if(G.trail.length>9)G.trail.shift();
    if(s.mine&&t>.08&&G.keeper.mode==='stand'){
      G.keeper.mode='dive'; G.keeper.target={x:s.hx,y:s.hy}; G.keeper.t=0; G.keeper.eff=s.eff;
    }
    if(G.keeper.mode==='dive') G.keeper.t=Math.min(1,G.keeper.t+dt/.55);
    if(t>=1) resolveShot();
  }
  else if(G.phase==='result'){
    if(G.keeper.mode==='dive') G.keeper.t=Math.min(1,G.keeper.t+dt/.55);
    const b=G.ball;
    if(b.fade>0){ b.fade-=dt; if(b.fade<=.5) b.alpha=Math.max(0,b.fade/.5); }
    if(b.free&&b.alpha>0){
      b.x+=b.vx*dt; b.y+=b.vy*dt;
      b.vy+=(G.shot&&G.shot.verdict==='goal')?300*dt:520*dt;
      b.vx*=(1-1.6*dt);
      b.sh={x:b.x,y:Math.min(b.floor===1e9?GOAL.ground+3:b.floor+6, GOAL.ground+14)};
      if(b.y>b.floor){ b.y=b.floor; b.vy*=-.35; b.vx*=.6; if(Math.abs(b.vy)<20)b.free=false; }
    }
    for(const tr of G.trail){ tr.a-=dt*1.8; }
    G.trail=G.trail.filter(tr=>tr.a>0);
  }
}

export { startMatch, clearTimers, update, diveInputActive, playerEff, oppPlan };
