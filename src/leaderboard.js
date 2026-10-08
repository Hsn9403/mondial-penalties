import { $, lsGet, lsSet } from './utils.js';
import { G } from './state.js';
import { showScreen } from './ui.js';
import { sb } from './db.js';
import { profileName, saveGame } from './account.js';

/* ============================ CLASSEMENT ============================ */
/* Avec Supabase : classement mondial des joueurs inscrits.
   Sans : classement local, sur cet appareil. */
const STAGE_LABEL=r=>r.champion?'Champion 🏆':('Élim. '+STAGE_SHORT[r.round_reached]);
const Leaderboard={
  async list(){
    if(sb){
      const {data,error}=await sb.rpc('leaderboard',{lim:50});
      if(!error) return data.map(r=>({name:r.name,nation:r.nation,flag:r.flag,stage:STAGE_LABEL(r),g:r.goals,s:r.saves,pts:r.points}));
      console.warn('[classement] lecture impossible, repli local :',error.message);
    }
    return lsGet('mp-board',[]);
  },
  async submit(entry){
    const all=lsGet('mp-board',[]);
    all.push(entry);
    all.sort((x,y)=>y.pts-x.pts);
    lsSet('mp-board',all.slice(0,50));
  },
};
const STAGE_PTS=[8,15,25,40,60];   // points selon le stade atteint (éliminé en seizièmes → finale perdue)
const STAGE_SHORT=['Seizièmes','Huitièmes','Quarts','Demi-finale','Finale'];
function playerName(){ return profileName()||String(lsGet('mp-player','')||'').trim()||'Anonyme'; }
function esc(s){ return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
function recordRun(champion){
  const pts=(champion?100:STAGE_PTS[G.roundIdx])+G.tGoals*2+G.tSaves*3;
  saveGame({
    nation:G.myTeam.n, flag:G.myTeam.f, round_reached:G.roundIdx, champion,
    goals:G.tGoals, saves:G.tSaves, conceded:G.tConceded, points:pts,
  });
  Leaderboard.submit({
    name:playerName(), nation:G.myTeam.n, flag:G.myTeam.f,
    stage:champion?'Champion 🏆':('Élim. '+STAGE_SHORT[G.roundIdx]),
    pts,
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
function openBoard(back){
  G.lbBack=back;
  $('#lb-note').textContent=sb
    ?'Classement mondial des joueurs inscrits.'
    :'Sauvegardé sur cet appareil pour l\'instant.';
  $('#lbwrap').innerHTML='<p id="lbempty">Chargement…</p>';
  renderBoard(); showScreen('#scr-lb');
}

export { Leaderboard, recordRun, renderBoard, openBoard, playerName };
