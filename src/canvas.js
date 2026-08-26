import { $ } from './utils.js';
import { G, W, H } from './state.js';

/* ============================= CANVAS =============================== */
const cv=$('#game'), ctx=cv.getContext('2d');
let view={s:1,ox:0,oy:0,dpr:1};
function resize(){
  const w=innerWidth,h=innerHeight,dpr=Math.min(devicePixelRatio||1,2);
  cv.width=w*dpr; cv.height=h*dpr;
  view.s=Math.min(w/W,h/H); view.ox=(w-W*view.s)/2; view.oy=(h-H*view.s)/2; view.dpr=dpr;
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
