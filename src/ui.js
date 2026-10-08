import { $ } from './utils.js';
import { G, gkStars } from './state.js';
import { ROUNDS } from './data.js';

/* ============================== HUD ================================= */
function showScreen(id){
  for(const s of document.querySelectorAll('.screen')) s.classList.add('hidden');
  if(id) $(id).classList.remove('hidden');
  // logo de retour à l'accueil : partout hors de l'accueil, jamais en plein match
  document.body.classList.toggle('has-home',!!id&&id!=='#scr-menu');
}
function setPrompt(html){ const p=$('#prompt'); if(!html){p.style.display='none';return;} p.innerHTML=html; p.style.display='block'; }
function banner(text,cls=''){
  const b=$('#banner'); b.className=''; void b.offsetWidth;
  b.textContent=text; b.className='show '+cls;
}
function scoreOf(a){ return a.reduce((s,v)=>s+(v?1:0),0); }
function renderDots(el,arr,active){
  const n=Math.max(5,arr.length+(active?1:0));
  let h='';
  for(let i=0;i<n;i++){
    let cls='dot';
    if(i<arr.length) cls+=arr[i]?' goal':' miss';
    else if(active&&i===arr.length) cls+=' now';
    h+=`<span class="${cls}"></span>`;
  }
  el.innerHTML=h;
}
function updateHud(){
  $('#hflagA').textContent=G.myTeam.f; $('#hnameA').textContent=G.myTeam.n;
  $('#hflagB').textContent=G.oppTeam.f; $('#hnameB').textContent=G.oppTeam.n;
  $('#hscA').textContent=scoreOf(G.kicksA); $('#hscB').textContent=scoreOf(G.kicksB);
  const myTurn=G.kicksA.length===G.kicksB.length;
  renderDots($('#hdotsA'),G.kicksA, myTurn&&G.phase!=='idle');
  renderDots($('#hdotsB'),G.kicksB, !myTurn&&G.phase!=='idle');
  const sd=G.kicksA.length>=5&&G.kicksB.length>=5;
  $('#roundlabel').innerHTML=`${ROUNDS[G.roundIdx]}${sd?' · <b>Mort subite</b>':''} · Gardien <b>${gkStars()}</b>`;
}

export { showScreen, setPrompt, banner, scoreOf, renderDots, updateHud };
