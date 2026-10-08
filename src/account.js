import { $ } from './utils.js';
import { sb } from './db.js';
import { G } from './state.js';
import { showScreen } from './ui.js';
import { useProgress } from './trophies.js';

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
function canPlay(){ return !sb||!!user||guestLocal; }

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
  if(!user){ profile=null; useProgress(null); return; }
  const {data,error}=await sb.from('profiles').select('display_name,progress').eq('id',user.id).maybeSingle();
  if(error){
    // colonne progress pas encore créée en base : on retombe sur le pseudo seul
    const r=await sb.from('profiles').select('display_name').eq('id',user.id).maybeSingle();
    profile=r.data; useProgress(null); return;
  }
  profile=data;
  const uid=user.id;
  useProgress(data&&data.progress,p=>{
    sb.from('profiles').update({progress:p}).eq('id',uid)
      .then(({error})=>{ if(error) console.warn('[compte] trophées non sauvegardés :',error.message); });
  });
}
async function loadStats(){
  const {data,error}=await sb.from('games').select('points,champion');
  if(error) return;
  $('#acc-games').textContent=data.length;
  $('#acc-best').textContent=data.length?Math.max(...data.map(g=>g.points)):'–';
  $('#acc-titles').textContent=data.filter(g=>g.champion).length;
}

function setAuthState(st){
  document.body.classList.remove('auth-wait','auth-out','auth-in');
  document.body.classList.add('auth-'+st);
}
function refreshUi(){
  const on=!!user;
  if(on){
    $('#acc-name').textContent=profileName()||'…';
    $('#acc-mail').textContent=user.email||'';
    $('#acc-chipname').textContent=profileName()||'';
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

/* Connexion Google « sur place » (Google Identity Services) : la fenêtre de
   Google est ouverte depuis notre domaine et affiche donc mondial-penalties…
   et non l'adresse technique de Supabase. Le jeton reçu est ensuite échangé
   contre une session Supabase. Repli : la redirection OAuth classique. */
const GOOGLE_CLIENT_ID=import.meta.env.VITE_GOOGLE_CLIENT_ID;

async function sha256Hex(txt){
  const buf=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(txt));
  return [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,'0')).join('');
}
function loadGsi(){
  return new Promise((ok,ko)=>{
    if(window.google&&window.google.accounts) return ok();
    const sc=document.createElement('script');
    sc.src='https://accounts.google.com/gsi/client'; sc.async=true;
    sc.onload=()=>ok(); sc.onerror=()=>ko(new Error('gsi'));
    document.head.appendChild(sc);
  });
}
let rawNonce='';
async function armGoogleButton(){
  // nonce : Google reçoit son empreinte, Supabase la valeur brute et vérifie la correspondance
  rawNonce=crypto.randomUUID()+crypto.randomUUID();
  const hashed=await sha256Hex(rawNonce);
  window.google.accounts.id.initialize({
    client_id:GOOGLE_CLIENT_ID, nonce:hashed, ux_mode:'popup',
    use_fedcm_for_button:true, itp_support:true,
    callback:async resp=>{
      say('Connexion…');
      const {error}=await sb.auth.signInWithIdToken({provider:'google',token:resp.credential,nonce:rawNonce});
      if(error){ say(frError(error),'err'); armGoogleButton(); }
    },
  });
  const host=$('#gsi-btn');
  window.google.accounts.id.renderButton(host,{
    type:'standard', theme:'outline', size:'large', shape:'rectangular',
    text:'continue_with', logo_alignment:'center', locale:'fr',
    width:Math.min(400,Math.round(host.getBoundingClientRect().width)||320),
  });
}
/* Les navigateurs intégrés aux applis (LinkedIn, Instagram…) sont refusés par
   Google (« disallowed_useragent ») : on y joue directement, avec un compte
   invité Supabase (connexion anonyme) qui compte quand même joueurs et parties. */
const IN_APP=/LinkedInApp|Instagram|FBAN|FBAV|FB_IAB|Twitter|TikTok|musical_ly|BytedanceWebview|Snapchat|\bLine\/|GSA\/|; wv\)/i;
let guestLocal=false;
function setupInApp(){
  document.body.classList.add('in-app');
  $('#inapp').hidden=false;
  $('#btn-guest').addEventListener('click',async()=>{
    const name=$('#guest-name').value.trim().slice(0,24)||'Invité';
    say('Ouverture du stade…');
    const {error}=await sb.auth.signInAnonymously({options:{data:{full_name:name}}});
    if(!error) return;                         // la suite se fait dans onAuthStateChange
    // connexion invité refusée par le serveur : on joue quand même, hors compte
    console.warn('[compte] invité refusé, partie hors ligne :',error.message);
    guestLocal=true; say('');
    document.body.classList.remove('auth-wait','auth-out','auth-in');
    for(const el of document.querySelectorAll('.needs-db')) el.hidden=true;
    $('#pseudo').value=name;
  });
}
/* Sur téléphone, la fenêtre surgissante de Google est capricieuse (onglet qui
   ne se referme pas, cookies bloqués…) : on passe par une redirection pleine page. */
const IS_MOBILE=matchMedia('(pointer:coarse)').matches||/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

async function setupGoogle(){
  $('#btn-google').addEventListener('click',signInGoogleRedirect);
  if(IN_APP.test(navigator.userAgent||'')){ setupInApp(); return; }
  if(!GOOGLE_CLIENT_ID||IS_MOBILE) return;    // redirection seule
  try{
    await loadGsi();
    await armGoogleButton();
    document.body.classList.add('gsi-ready');   // le bouton officiel remplace le nôtre
  }catch(e){ console.warn('[compte] bouton Google indisponible, repli sur la redirection',e); }
}
async function signInGoogleRedirect(){
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
  setupGoogle();
  $('#btn-account').addEventListener('click',()=>openAccount('#scr-menu'));
  $('#btn-chip-account').addEventListener('click',()=>openAccount('#scr-menu'));
  $('#btn-acc-back').addEventListener('click',()=>showScreen(G.accBack||'#scr-menu'));
  const logout=async()=>{
    await sb.auth.signOut();
    if(window.google&&window.google.accounts) window.google.accounts.id.disableAutoSelect();
    showScreen('#scr-menu');
  };
  $('#btn-logout').addEventListener('click',logout);
  $('#btn-chip-logout').addEventListener('click',logout);

  sb.auth.onAuthStateChange((_ev,session)=>{
    // pas d'appel Supabase attendu dans ce callback (risque de blocage) : on diffère
    setTimeout(async()=>{
      if(guestLocal) return;
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
