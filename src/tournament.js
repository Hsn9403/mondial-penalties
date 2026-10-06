import { $, rnd } from './utils.js';
import { TEAMS, ROUNDS } from './data.js';
import { G, gkStars } from './state.js';
import { showScreen } from './ui.js';
import { renderBracket } from './bracket.js';

/* ============================ TOURNAMENT ============================ */
/* G.tree[k] = matchs du tour k (0 = seizièmes … 4 = finale) ;
   les vainqueurs des matchs 2j et 2j+1 se retrouvent au match j du tour suivant */

// têtes de série 1→16 placées comme dans un vrai tableau : 1 et 2 ne peuvent
// se croiser qu'en finale, 1 et 4 qu'en demie, etc.
const SEED_POS=[1,16,8,9,4,13,5,12,2,15,7,10,3,14,6,11];
function shuffle(a){ for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; }

function newTournament(myIdx){
  G.myTeam=TEAMS[myIdx]; G.roundIdx=0; G.history=[]; G.gcOk=true;
  G.tGoals=0; G.tSaves=0; G.tConceded=0; G.champion=null;
  // 48 nations, 32 places : votre équipe est qualifiée d'office ; les 31 autres
  // sortent d'un tirage pondéré par la force (les cadors manquent rarement l'appel)
  const pool=TEAMS.filter((_,i)=>i!==myIdx)
    .map(t=>({t,k:Math.pow(Math.random(),1/Math.exp((t.s-80)/5))}))
    .sort((x,y)=>y.k-x.k);
  const q=[G.myTeam,...pool.slice(0,31).map(x=>x.t)]
    .sort((a,b)=>b.s-a.s||Math.random()-.5);
  const pot1=q.slice(0,16), pot2=shuffle(q.slice(16));
  G.bracket=SEED_POS.map((s,i)=>({a:pot1[s-1],b:pot2[i],res:null}));
  G.tree=[G.bracket];
  showBracket();
}
function simScore(){ const w=3+Math.floor(rnd(3)); let l=Math.max(0,w-1-Math.floor(rnd(3))); return [w,l]; }
/* écart de force → probabilité de victoire : 5 points ≈ 70 %, 10 points ≈ 84 % */
function simMatch(m){
  const pA=1/(1+Math.exp(-(m.a.s-m.b.s)/6));
  const aw=Math.random()<pA, [w,l]=simScore();
  m.res=aw?[w,l]:[l,w];
  return aw?m.a:m.b;
}
const winnerOf=m=>m.res[0]>m.res[1]?m.a:m.b;

function showBracket(){
  const my=G.bracket.find(m=>m.a===G.myTeam||m.b===G.myTeam);
  G.oppTeam=(my.a===G.myTeam)?my.b:my.a;
  $('#br-round').textContent=ROUNDS[G.roundIdx];
  $('#br-kicker').textContent=`Tableau final · ${G.bracket.length} match${G.bracket.length>1?'s':''}${G.roundIdx===0?' · 32 qualifiés sur 48 nations':''}`;
  $('#mmA-f').textContent=G.myTeam.f; $('#mmA-n').textContent=G.myTeam.n; $('#mmA-r').textContent=`${G.myTeam.r}ᵉ FIFA`;
  $('#mmB-f').textContent=G.oppTeam.f; $('#mmB-n').textContent=G.oppTeam.n; $('#mmB-r').textContent=`${G.oppTeam.r}ᵉ FIFA`;
  $('#gkinfo').innerHTML=`Gardien adverse&nbsp;: <b>${gkStars()}</b>`;
  renderBracket($('#bk-next'));
  showScreen('#scr-bracket');
}
function nextRound(winners){
  const nb=[]; for(let i=0;i<winners.length;i+=2)nb.push({a:winners[i],b:winners[i+1],res:null});
  G.bracket=nb; G.tree.push(nb);
}
function advanceTournament(myScore,oppScore){
  const winners=[];
  for(const m of G.bracket){
    if(m.a===G.myTeam||m.b===G.myTeam){
      m.res=(m.a===G.myTeam)?[myScore,oppScore]:[oppScore,myScore];
      winners.push(G.myTeam);
    }else winners.push(simMatch(m));
  }
  G.history.push({round:ROUNDS[G.roundIdx],opp:G.oppTeam,sc:[myScore,oppScore]});
  if(winners.length===1){ G.champion=G.myTeam; return true; }
  G.roundIdx++;
  nextRound(winners);
  return false;
}
/* élimination : le reste du Mondial se joue sans vous, jusqu'au sacre */
function finishTournament(myScore,oppScore){
  let first=true;
  for(;;){
    const winners=G.bracket.map(m=>{
      if(first&&(m.a===G.myTeam||m.b===G.myTeam)){
        m.res=(m.a===G.myTeam)?[myScore,oppScore]:[oppScore,myScore];
        return winnerOf(m);
      }
      return simMatch(m);
    });
    first=false;
    if(winners.length===1){ G.champion=winners[0]; return; }
    nextRound(winners);
  }
}
function parcoursHtml(){
  return G.history.map(h=>`${h.round.replace(' de finale','')}&nbsp;: <b>${h.sc[0]} – ${h.sc[1]}</b> vs ${h.opp.f}&nbsp;${h.opp.n}`).join(' &nbsp;·&nbsp; ');
}

export { newTournament, showBracket, advanceTournament, finishTournament, parcoursHtml };
