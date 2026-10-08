import { $ } from './utils.js';
import { sb } from './db.js';
import { G } from './state.js';
import { showScreen } from './ui.js';

/* ============================== COMPTE ============================== */
/* Connexion Google obligatoire pour jouer (dès que Supabase est configuré).
   L'état est porté par une classe sur <body> :
     auth-wait → session en cours de vérification
     auth-out  → déconnecté : seul le bouton Google est proposé
     auth-in   → connecté : le jeu est accessible
   Sans Supabase (mode local), aucune classe : tout reste ouvert. */
let user=null, profile=null;

function currentUser(){ return user; }
function profileName(){ return profile?profile.display_name:null; }
function canPlay(){ return !sb||!!user; }

const ERRORS=[
  [/failed to fetch|network/i,'Serveur injoignable : vérifiez votre connexion.'],
  [/provider is not enabled/i,'La connexion Google n\'est pas encore activée sur le serveur.'],
  [/rate limit|too many/i,'Trop de tentatives, réessayez dans une minute.'],
];
function frError(e){
  const m=String(e&&e.message||e);
  for(const [re,fr] of ERRORS) if(re.test(m)) return fr;
  return 'Oups : '+m;
}
function say(text,kind=''){ const el=$('#auth-msg'); el.textContent=text; el.className=kind; }

async function loadProfile(){
  if(!user){ profile=null; return; }
  const {data}=await sb.from('profiles').select('display_name').eq('id',user.id).maybeSingle();
  profile=data;
}
async function loadStats(){
  const {data,error}=await sb.from('games').select('points,champion');
  if(error) return;
  $('#acc-games').textContent=data.length;
  $('#acc-best').textContent=data.length?Math.max(...data.map(g=>g.points)):'–';
  $('#acc-titles').textContent=data.filter(g=>g.champion).length;
}
function escHtml(s){ return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

function setAuthState(st){
  document.body.classList.remove('auth-wait','auth-out','auth-in');
  document.body.classList.add('auth-'+st);
}
function refreshUi(){
  const on=!!user;
  if(on){
    $('#acc-name').textContent=profileName()||'…';
    $('#acc-mail').textContent=user.email||'';
    $('#accchip').innerHTML=`Connecté · <b>${escHtml(profileName()||'')}</b> · <u>mon compte</u>`;
    // le pseudo du menu est celui du compte
    if(profileName()) $('#pseudo').value=profileName();
  }
}

function openAccount(back){
  G.accBack=back||'#scr-menu';
  refreshUi(); loadStats();
  showScreen('#scr-account');
}

/* pseudo modifié depuis le menu : répercuté sur le profil (après une pause de frappe) */
let nameTimer=null;
function setDisplayName(name){
  if(!user) return;
  name=String(name).trim().slice(0,24);
  if(!name) return;
  clearTimeout(nameTimer);
  nameTimer=setTimeout(async()=>{
    const {error}=await sb.from('profiles').update({display_name:name}).eq('id',user.id);
    if(!error){ profile={...profile,display_name:name}; refreshUi(); }
  },700);
}

/* une partie terminée → une ligne en base */
async function saveGame(g){
  if(!user) return;
  const {error}=await sb.from('games').insert(g);
  if(error) console.warn('[compte] partie non enregistrée :',error.message);
}

async function signInGoogle(){
  say('Redirection vers Google…');
  const {error}=await sb.auth.signInWithOAuth({provider:'google',options:{redirectTo:location.origin+location.pathname}});
  if(error) say(frError(error),'err');
}

function initAccount(){
  if(!sb){
    // pas de base configurée : on masque tout ce qui parle de compte
    for(const el of document.querySelectorAll('.needs-db')) el.hidden=true;
    return;
  }
  setAuthState('wait');
  $('#btn-google').addEventListener('click',signInGoogle);
  $('#btn-account').addEventListener('click',()=>openAccount('#scr-menu'));
  $('#accchip').addEventListener('click',()=>openAccount('#scr-menu'));
  $('#btn-acc-back').addEventListener('click',()=>showScreen(G.accBack||'#scr-menu'));
  $('#btn-logout').addEventListener('click',async()=>{ await sb.auth.signOut(); showScreen('#scr-menu'); });

  sb.auth.onAuthStateChange((_ev,session)=>{
    // pas d'appel Supabase attendu dans ce callback (risque de blocage) : on diffère
    setTimeout(async()=>{
      user=session?session.user:null;
      await loadProfile();
      say('');
      setAuthState(user?'in':'out');
      refreshUi();
      // déconnecté (session expirée, autre onglet…) : retour au menu, seule porte d'entrée
      if(!user){ $('#hud').style.display='none'; showScreen('#scr-menu'); }
    },0);
  });
}

export { initAccount, currentUser, profileName, canPlay, setDisplayName, saveGame, openAccount };
