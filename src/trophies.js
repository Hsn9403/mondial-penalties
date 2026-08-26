import { lsGet, lsSet } from './utils.js';
import { TROPHIES, TEAMS } from './data.js';

/* ============================ TROPHIES ============================== */
let unlockedTrophies=new Set(lsGet('mp-trophies',[]));
let champNations=new Set(lsGet('mp-champs',[]));   // nations avec lesquelles on a été champion
let toastQ=[], toastBusy=false;
function unlock(id){
  if(unlockedTrophies.has(id)) return;
  unlockedTrophies.add(id); lsSet('mp-trophies',[...unlockedTrophies]);
  const t=TROPHIES.find(x=>x.id===id);
  if(t){ toastQ.push(t); if(!toastBusy) nextToast(); }
}
function nextToast(){
  const t=toastQ.shift();
  if(!t){ toastBusy=false; return; }
  toastBusy=true;
  const el=document.querySelector('#trophytoast');
  el.querySelector('.tt').textContent=t.n;
  el.className='show tier-'+t.tier;
  setTimeout(()=>{ el.className=''; setTimeout(nextToast,350); },2600);
}
const MEDAL_SVG='<svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true"><path d="M8 2 h3 l2 6 l-4 1 z" fill="currentColor" opacity=".55"/><path d="M16 2 h-3 l-2 6 l4 1 z" fill="currentColor" opacity=".75"/><circle cx="12" cy="15" r="6.4" fill="currentColor"/><path d="M12 11.4 l1.1 2.2 2.4 .35 -1.75 1.7 .4 2.4 -2.15 -1.15 -2.15 1.15 .4 -2.4 -1.75 -1.7 2.4 -.35 z" fill="#0e2033"/></svg>';
function renderTrophies(){
  const g=document.querySelector('#trophgrid'); g.innerHTML='';
  for(const t of TROPHIES){
    const has=unlockedTrophies.has(t.id);
    const d=document.createElement('div');
    d.className='tcard tier-'+t.tier+(has?'':' locked');
    const desc=t.id==='integral'?`${t.d} (${champNations.size}/${TEAMS.length})`:t.d;
    d.innerHTML=`<span class="medal">${MEDAL_SVG}</span>
      <span class="tn">${t.n}</span><span class="td">${desc}</span>
      <span class="tl">${has?'Débloqué':({bronze:'Bronze',argent:'Argent',or:'Or',legende:'Légende'})[t.tier]}</span>`;
    g.appendChild(d);
  }
  document.querySelector('#troph-count').textContent=`${unlockedTrophies.size} / ${TROPHIES.length} débloqués`;
}

export { unlockedTrophies, champNations, unlock, renderTrophies };
