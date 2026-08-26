import { $, rnd } from './utils.js';
import { TEAMS, ROUNDS } from './data.js';
import { G } from './state.js';
import { showScreen } from './ui.js';

/* ============================ TOURNAMENT ============================ */
function newTournament(myIdx){
  G.myTeam=TEAMS[myIdx]; G.roundIdx=0; G.history=[]; G.gcOk=true;
  G.tGoals=0; G.tSaves=0; G.tConceded=0;
  const rest=TEAMS.filter((_,i)=>i!==myIdx);
  for(let i=rest.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[rest[i],rest[j]]=[rest[j],rest[i]];}
  // 48 nations, 32 places : votre équipe est qualifiée d'office, 31 sortent du tirage
  const order=[G.myTeam,...rest.slice(0,31)];
  G.bracket=[]; for(let i=0;i<order.length;i+=2)G.bracket.push({a:order[i],b:order[i+1],res:null});
  showBracket();
}
function simScore(){ const w=3+Math.floor(rnd(3)); let l=Math.max(0,w-1-Math.floor(rnd(3))); return [w,l]; }
function showBracket(){
  const my=G.bracket.find(m=>m.a===G.myTeam||m.b===G.myTeam);
  G.oppTeam=(my.a===G.myTeam)?my.b:my.a;
  $('#br-round').textContent=ROUNDS[G.roundIdx];
  $('#br-kicker').textContent=`Tableau final · ${G.bracket.length} match${G.bracket.length>1?'s':''}${G.roundIdx===0?' · 32 qualifiés sur 48 nations':''}`;
  $('#mmA-f').textContent=G.myTeam.f; $('#mmA-n').textContent=G.myTeam.n;
  $('#mmB-f').textContent=G.oppTeam.f; $('#mmB-n').textContent=G.oppTeam.n;
  $('#gkinfo').innerHTML=`Gardien adverse&nbsp;: <b>${'★'.repeat(G.roundIdx+1)}${'☆'.repeat(4-G.roundIdx)}</b>`;
  const fx=$('#fixtures'); fx.innerHTML='';
  for(const m of G.bracket){
    const mine=m.a===G.myTeam||m.b===G.myTeam;
    const d=document.createElement('div'); d.className='fx'+(mine?' mine':'');
    const sc=m.res?`${m.res[0]} – ${m.res[1]}`:'t.a.b.';
    const wA=m.res&&m.res[0]>m.res[1], wB=m.res&&m.res[1]>m.res[0];
    d.innerHTML=`<span class="t"><span>${m.a.f}</span><span class="nm ${wA?'win':''}">${m.a.n}</span></span>
      <span class="sc">${sc}</span>
      <span class="t"><span class="nm ${wB?'win':''}" style="text-align:right">${m.b.n}</span><span>${m.b.f}</span></span>`;
    fx.appendChild(d);
  }
  showScreen('#scr-bracket');
}
function advanceTournament(myScore,oppScore){
  const winners=[];
  for(const m of G.bracket){
    if(m.a===G.myTeam||m.b===G.myTeam){
      m.res=(m.a===G.myTeam)?[myScore,oppScore]:[oppScore,myScore];
      winners.push(G.myTeam);
    }else{
      const pA=m.a.s/(m.a.s+m.b.s);
      const aw=Math.random()<pA; const [w,l]=simScore();
      m.res=aw?[w,l]:[l,w]; winners.push(aw?m.a:m.b);
    }
  }
  G.history.push({round:ROUNDS[G.roundIdx],opp:G.oppTeam,sc:[myScore,oppScore]});
  if(winners.length===1) return true;
  G.roundIdx++;
  const nb=[]; for(let i=0;i<winners.length;i+=2)nb.push({a:winners[i],b:winners[i+1],res:null});
  G.bracket=nb;
  return false;
}
function parcoursHtml(){
  return G.history.map(h=>`${h.round.replace(' de finale','')}&nbsp;: <b>${h.sc[0]} – ${h.sc[1]}</b> vs ${h.opp.f}&nbsp;${h.opp.n}`).join(' &nbsp;·&nbsp; ');
}

export { newTournament, showBracket, advanceTournament, parcoursHtml };
