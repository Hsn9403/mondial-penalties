import { $, lsGet, lsSet } from './utils.js';
import { G } from './state.js';
import { showScreen } from './ui.js';

/* ============================ CLASSEMENT ============================ */
/* Couche de stockage isolée : quand la base de données sera configurée,
   seuls list() et submit() sont à remplacer (le reste du jeu n'y touche pas). */
const Leaderboard={
  async list(){ return lsGet('mp-board',[]); },
  async submit(entry){
    const all=lsGet('mp-board',[]);
    all.push(entry);
    all.sort((x,y)=>y.pts-x.pts);
    lsSet('mp-board',all.slice(0,50));
  },
};
const STAGE_PTS=[8,15,25,40,60];   // points selon le stade atteint (éliminé en seizièmes → finale perdue)
const STAGE_SHORT=['Seizièmes','Huitièmes','Quarts','Demi-finale','Finale'];
function playerName(){ return String(lsGet('mp-player','')||'').trim()||'Anonyme'; }
function esc(s){ return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
function recordRun(champion){
  Leaderboard.submit({
    name:playerName(), nation:G.myTeam.n, flag:G.myTeam.f,
    stage:champion?'Champion 🏆':('Élim. '+STAGE_SHORT[G.roundIdx]),
    pts:(champion?100:STAGE_PTS[G.roundIdx])+G.tGoals*2+G.tSaves*3,
    g:G.tGoals, s:G.tSaves,
    d:new Date().toISOString().slice(0,10),
  });
}
async function renderBoard(){
  const rows=await Leaderboard.list();
  const w=$('#lbwrap');
  if(!rows.length){
    w.innerHTML='<p id="lbempty">Aucun parcours enregistré. Terminez un mondial pour entrer dans la légende.</p>';
    return;
  }
  const me=playerName();
  w.innerHTML='<table id="lbtable"><thead><tr><th>#</th><th>Joueur</th><th>Nation</th><th>Parcours</th><th>Buts</th><th>Arrêts</th><th>Pts</th></tr></thead><tbody>'
    +rows.map((r,i)=>`<tr${r.name===me?' class="me"':''}><td class="rank">${i+1}</td><td>${esc(r.name)}</td><td>${r.flag} ${esc(r.nation)}</td><td>${esc(r.stage)}</td><td>${r.g}</td><td>${r.s}</td><td class="pts">${r.pts}</td></tr>`).join('')
    +'</tbody></table>';
}
function openBoard(back){ G.lbBack=back; renderBoard(); showScreen('#scr-lb'); }

export { Leaderboard, recordRun, renderBoard, openBoard, playerName };
