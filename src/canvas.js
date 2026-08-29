import { $, clamp } from './utils.js';
import { G, W, H } from './state.js';

/* ============================= CANVAS =============================== */
const cv=$('#game'), ctx=cv.getContext('2d');
let view={s:1,ox:0,oy:0,dpr:1,visW:W};
const MIN_VIS_W=660;   // en deçà, on rognerait les poteaux (le but fait 406 px de large)
function resize(){
  const w=innerWidth,h=innerHeight,dpr=Math.min(devicePixelRatio||1,2);
  cv.width=w*dpr; cv.height=h*dpr;
  // Sur un écran étroit, garder le cadrage 16:9 laisserait le terrain minuscule
  // entre deux bandes noires. On resserre donc la vue sur le but : la largeur
  // logique affichée suit le ratio de l'écran, sans jamais rogner les poteaux.
  const visW=clamp(H*w/h,MIN_VIS_W,W);
  const s=Math.min(w/visW,h/H);
  view.s=s; view.visW=visW; view.dpr=dpr;
  view.ox=(w-visW*s)/2-(W/2-visW/2)*s;
  view.oy=(h-H*s)/2;
  document.body.classList.toggle('portrait',h>w*1.15);
}
addEventListener('resize',resize); resize();
const ZOOM_C={x:640,y:420}; // centre du zoom caméra (phase gardien)
function toLogical(e){
  const r=cv.getBoundingClientRect();
  let x=(e.clientX-r.left-view.ox)/view.s, y=(e.clientY-r.top-view.oy)/view.s;
  x=(x-ZOOM_C.x)/G.zoom+ZOOM_C.x; y=(y-ZOOM_C.y)/G.zoom+ZOOM_C.y;
  return {x,y};
}

export { cv, ctx, view, ZOOM_C, toLogical, resize };
