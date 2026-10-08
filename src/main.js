import { $, lsGet, lsSet } from './utils.js';
import { Snd } from './audio.js';
import { TEAMS } from './data.js';
import { G } from './state.js';
import { champNations, renderTrophies } from './trophies.js';
import { openBoard } from './leaderboard.js';
import { newTournament, showBracket } from './tournament.js';
import { startMatch, clearTimers } from './match.js';
import { showScreen } from './ui.js';
import { buildCrowd } from './effects.js';
import { startLoop } from './render.js';
import './boss.js';
import { initAccount, setDisplayName, canPlay } from './account.js';

/* ============================== MENUS =============================== */
function buildTeamGrid(){
  const g=$('#teamsgrid'); g.innerHTML='';
  TEAMS.forEach((t,i)=>{
    const b=document.createElement('button'); b.className='teamcard'; b.type='button';
    const won=champNations.has(t.n);
    b.innerHTML=`<span class="f">${t.f}</span><span class="n">${t.n}</span><span class="s">FORCE ${t.s}</span>${won?'<span class="c">★ CHAMPION</span>':''}`;
    b.addEventListener('click',()=>{ Snd.ensure(); newTournament(i); });
    g.appendChild(b);
  });
}
buildTeamGrid();
const SVG_ON='<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"><path d="M3 8 h3 l4 -4 v12 l-4 -4 h-3 z" fill="currentColor"/><path d="M13 7 q2 3 0 6 M15.5 5 q3.4 5 0 10"/></svg>';
const SVG_OFF='<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"><path d="M3 8 h3 l4 -4 v12 l-4 -4 h-3 z" fill="currentColor"/><path d="M13 7 l5 6 M18 7 l-5 6"/></svg>';
$('#mutebtn').innerHTML=SVG_ON;
$('#btn-play').addEventListener('click',()=>{ if(!canPlay()) return; Snd.ensure(); Snd.swell(); buildTeamGrid(); showScreen('#scr-select'); });
$('#btn-troph').addEventListener('click',()=>{ renderTrophies(); showScreen('#scr-trophies'); });
$('#btn-troph-back').addEventListener('click',()=>showScreen('#scr-menu'));
$('#btn-lb').addEventListener('click',()=>openBoard('#scr-menu'));
$('#btn-lb2').addEventListener('click',()=>openBoard('#scr-out'));
$('#btn-lb3').addEventListener('click',()=>openBoard('#scr-champ'));
$('#btn-lb-back').addEventListener('click',()=>showScreen(G.lbBack||'#scr-menu'));
$('#btn-cine').addEventListener('click',()=>{ clearTimers(); showBracket(); });
// le conseil d'orientation est masquable : sur un téléphone dont la rotation
// est verrouillée, il serait sinon impossible à faire disparaître
const rotateEl=$('#rotate');
if(lsGet('mp-rotate-off',false)) rotateEl.classList.add('gone');
rotateEl.addEventListener('click',()=>{ rotateEl.classList.add('gone'); lsSet('mp-rotate-off',true); });

const pseudoEl=$('#pseudo');
pseudoEl.value=String(lsGet('mp-player','')||'');
pseudoEl.addEventListener('input',()=>{ lsSet('mp-player',pseudoEl.value); setDisplayName(pseudoEl.value); });
initAccount();
$('#btn-match').addEventListener('click',()=>startMatch());
$('#btn-retry').addEventListener('click',()=>{ newTournament(TEAMS.indexOf(G.myTeam)); });
$('#btn-again').addEventListener('click',()=>{ newTournament(TEAMS.indexOf(G.myTeam)); });
$('#btn-country').addEventListener('click',()=>{ buildTeamGrid(); showScreen('#scr-select'); });
$('#btn-country2').addEventListener('click',()=>{ buildTeamGrid(); showScreen('#scr-select'); });
$('#mutebtn').addEventListener('click',e=>{
  const m=Snd.toggle(); e.currentTarget.innerHTML=m?SVG_OFF:SVG_ON;
});
G.crowdCv=buildCrowd({c1:'#6b7686',c2:'#39414f'},{c1:'#26436b',c2:'#5b6472'});
G.myTeam=TEAMS[0]; G.oppTeam=TEAMS[1];

startLoop();
