

/* ============================ GEOMETRY ============================== */
const W=1280,H=720;
const GOAL={cx:640,left:437,right:843,top:256,bar:252,ground:428,postW:14};
const SPOT={x:640,y:560};
const GK_BASE={x:640,y:GOAL.ground-2};   // pieds du gardien
const GK_HANDS0={x:640,y:352};           // gants en position d'attente


/* ============================ GAME STATE ============================ */
const G={
  screen:'menu',
  phase:'idle',             // aim | power | pick | runup | flight | result
  t:0, freeze:0,
  myTeam:null, oppTeam:null, roundIdx:0,
  bracket:[], history:[],
  kicksA:[], kicksB:[],
  shooterIsMe:true,
  aimP:0, pw:0, lockP:0,
  shot:null,                // {tx,ty,pw,verdict,hx,hy,eff,mine,dur,arc,flightT}
  keeper:{mode:'stand',target:null,t:0,eff:0},
  striker:{t:0,team:null},
  dive:{target:null,dragging:false,sx:0,sy:0,moved:0},
  ball:{x:SPOT.x,y:SPOT.y,r:13,vx:0,vy:0,free:false,alpha:1,fade:0,floor:0,sh:null},
  trail:[],
  excite:0, shake:0, netShake:0, barFlash:0, zoom:1,
  parts:[], sparks:[], flashRate:.02,
  crowdCv:null,
  decisive:false,                     // le tir en cours peut gagner ou perdre le match
  tGoals:0, tSaves:0, tConceded:0,    // stats cumulées du tournoi (classement)
  lbBack:'#scr-menu',
};

/* --------------------------- difficulty ---------------------------- */
function diff(){ const r=G.roundIdx; return {
  arrowF:.55+r*.13,
  powerF:.62+r*.14,
  gkGuess:.42+r*.09,        // proba de lire le bon côté
  gkErr:120-r*16,           // erreur d'estimation du gardien (px)
  gkReach:58+r*7,           // rayon d'arrêt de base
  oppMiss:.20-r*.035,
  oppSpread:46-r*7,
};}

export { W, H, GOAL, SPOT, GK_BASE, GK_HANDS0, G, diff };
