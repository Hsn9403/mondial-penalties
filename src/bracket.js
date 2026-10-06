import { G } from './state.js';

/* ======================= TABLEAU FINAL EN ARBRE ======================= */
/* Moitié gauche et moitié droite convergent vers la finale au centre.
   Grille de 16 lignes par moitié : au tour k, une case couvre 2^k lignes,
   si bien que chaque case tombe pile au milieu des deux qui l'alimentent.
   Colonnes : 1,3,5,7,9 = équipes du tour 0→4 à gauche, 2,4,6,8 = traits ;
   10 = coupe ; 11→19 = miroir à droite. */
const NB_ROUNDS=5;

function slotHtml(t,{k,i,side,cls,title}){
  const row=(i%(16>>k))*(1<<k)+1;   // position dans sa moitié
  const col=side==='L'?1+2*k:19-2*k;
  const inner=t?`<span class="fl">${t.f}</span><span class="cd">${t.c}</span>`:'<span class="cd">–</span>';
  return `<div class="s ${side}${cls}" data-k="${k}" data-i="${i}" style="grid-column:${col};grid-row:${row}/span ${1<<k}"${title?` title="${title}"`:''}>`
    +`<span class="in${t?'':' empty'}">${inner}</span></div>`;
}

/* opts.anim = k : les vainqueurs du tour k ne sont pas encore affichés
   (la cinématique les fait apparaître un à un) */
function renderBracket(el,opts={}){
  const T=G.tree||[]; let h='';
  for(let k=0;k<NB_ROUNDS;k++){
    const round=T[k], n=32>>k;
    for(let i=0;i<n;i++){
      const side=i<n/2?'L':'R';
      const m=round&&round[i>>1];
      const t=m?(i%2?m.b:m.a):null;
      let cls='', title='';
      if(t===G.myTeam&&t) cls+=' mine';
      if(m&&m.res){
        const won=(m.res[0]>m.res[1])===(i%2===0);
        if(!won) cls+=' ko';
        title=`${m.a.c} ${m.res[0]} – ${m.res[1]} ${m.b.c} (t.a.b.)`;
      }
      if(opts.anim!==undefined&&k===opts.anim+1) cls+=' pend';
      if(opts.anim!==undefined&&k===opts.anim&&cls.includes(' ko')) cls=cls.replace(' ko',' ko-later');
      h+=slotHtml(t,{k,i,side,cls,title});
    }
    // traits de liaison entre le tour k et le tour k+1
    if(k<NB_ROUNDS-1){
      const pairs=16>>(k+1);
      for(let j=0;j<pairs;j++){
        const row=j*(2<<k)+1;
        h+=`<div class="cn L" style="grid-column:${2+2*k};grid-row:${row}/span ${2<<k}"></div>`;
        h+=`<div class="cn R" style="grid-column:${18-2*k};grid-row:${row}/span ${2<<k}"></div>`;
      }
    }
  }
  const fin=T[NB_ROUNDS-1], champ=fin&&fin[0].res?(fin[0].res[0]>fin[0].res[1]?fin[0].a:fin[0].b):null;
  h+=`<div class="ctr"><span class="cup" aria-hidden="true"><svg viewBox="0 0 120 140"><g fill="currentColor"><path d="M30 14 h60 v26 c0 22 -13 36 -30 40 c-17 -4 -30 -18 -30 -40 z"/><path d="M30 20 c-14 0 -20 8 -18 18 c2 11 12 17 22 18 c-3 -5 -4 -10 -4 -16 z"/><path d="M90 20 c14 0 20 8 18 18 c-2 11 -12 17 -22 18 c3 -5 4 -10 4 -16 z"/><rect x="53" y="80" width="14" height="18" rx="3"/><path d="M40 100 h40 l6 14 h-52 z"/><rect x="30" y="114" width="60" height="12" rx="3"/></g></svg></span>`
    +`<span class="champ${champ?'':' empty'}${champ&&champ===G.myTeam?' mine':''}">${champ?`<span class="fl">${champ.f}</span><span class="cd">${champ.c}</span>`:'<span class="cd">Finale</span>'}</span></div>`;
  el.innerHTML=`<div class="bk">${h}</div>`;
  return el.firstChild;
}

export { renderBracket };
