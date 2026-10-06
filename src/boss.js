import { $ } from './utils.js';
import { Snd } from './audio.js';
import { G } from './state.js';
import { pauseTimers, resumeTimers } from './match.js';

/* ============================ MODE DISCRET ============================ */
/* Échap : le jeu se fige, le son se coupe et un tableur très sérieux prend
   tout l'écran (titre d'onglet et icône compris). Échap à nouveau : on reprend. */
const SHEET_TITLE='Suivi budgétaire T4 — Tableur';
const SHEET_ICON='data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect x="1" y="1" width="14" height="14" rx="2" fill="#1e7a46"/><path d="M4 5h8M4 8h8M4 11h8M7 4v9" stroke="#fff" stroke-width="1.2"/></svg>');

const LINES=['Licences logicielles','Prestataires externes','Déplacements','Formation','Hébergement cloud','Matériel informatique',
  'Événements','Abonnements presse','Fournitures','Frais de recrutement','Conseil juridique','Communication','Assurances',
  'Télécom','Maintenance','Locaux','Divers'];
const MONTHS=['Oct.','Nov.','Déc.'];

let built=false, realTitle='', realIcon='';
function fmt(n){ return n.toLocaleString('fr-FR',{maximumFractionDigits:0})+' €'; }
function build(){
  // chiffres fixés une fois pour toutes : un tableur qui change à chaque Échap, ça se remarque
  let seed=7; const r=()=>(seed=(seed*16807)%2147483647)/2147483647;
  const cols=['A','B','C','D','E','F','G','H','I'];
  let h='<thead><tr><th class="rn"></th>'+cols.map(c=>`<th>${c}</th>`).join('')+'</tr></thead><tbody>';
  h+=`<tr><td class="rn">1</td><td class="hd">Poste</td>${MONTHS.map(m=>`<td class="hd num">${m} prévu</td>`).join('')}${MONTHS.map(m=>`<td class="hd num">${m} réel</td>`).join('')}<td class="hd num">Écart</td><td class="hd">Statut</td></tr>`;
  let tp=0, tr=0;
  LINES.forEach((l,i)=>{
    const base=800+Math.round(r()*14000);
    const prev=MONTHS.map(()=>Math.round(base*(.9+r()*.2)/10)*10);
    const real=prev.map(v=>Math.round(v*(.82+r()*.32)/10)*10);
    const sp=prev.reduce((a,b)=>a+b), sr=real.reduce((a,b)=>a+b), ec=sr-sp;
    tp+=sp; tr+=sr;
    const st=ec>sp*.05?'<span class="bad">À revoir</span>':ec<-sp*.05?'<span class="ok">Sous budget</span>':'Conforme';
    h+=`<tr><td class="rn">${i+2}</td><td>${l}</td>${prev.map(v=>`<td class="num">${fmt(v)}</td>`).join('')}${real.map(v=>`<td class="num">${fmt(v)}</td>`).join('')}<td class="num ${ec>0?'neg':''}">${ec>0?'+':''}${fmt(ec)}</td><td>${st}</td></tr>`;
  });
  const n=LINES.length+2;
  h+=`<tr class="tot"><td class="rn">${n}</td><td>Total</td><td colspan="3" class="num">${fmt(tp)}</td><td colspan="3" class="num">${fmt(tr)}</td><td class="num">${fmt(tr-tp)}</td><td></td></tr>`;
  for(let i=n+1;i<=n+12;i++) h+=`<tr><td class="rn">${i}</td>${'<td></td>'.repeat(9)}</tr>`;
  $('#boss-grid').innerHTML=h+'</tbody>';
  built=true;
}
function iconLink(){ return document.querySelector('link[rel="icon"]'); }

function setBoss(on){
  if(on===G.paused) return;
  G.paused=on;
  const el=$('#boss');
  if(on){
    if(!built) build();
    realTitle=document.title; realIcon=iconLink().href;
    document.title=SHEET_TITLE; iconLink().href=SHEET_ICON;
    pauseTimers(); Snd.hush(true);
    el.hidden=false;
  }else{
    el.hidden=true;
    document.title=realTitle; iconLink().href=realIcon;
    resumeTimers(); Snd.hush(false);
  }
}
addEventListener('keydown',e=>{
  if(e.code!=='Escape'&&e.key!=='Escape') return;
  e.preventDefault(); e.stopImmediatePropagation();
  setBoss(!G.paused);
},true);

export { setBoss };
