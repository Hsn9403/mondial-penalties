import { $ } from './utils.js';
import { sb } from './db.js';
import { G } from './state.js';
import { showScreen } from './ui.js';

/* ============================== COMPTE ============================== */
let user=null, profile=null;

function currentUser(){ return user; }
function profileName(){ return profile?profile.display_name:null; }

const ERRORS=[
  [/invalid login credentials/i,'E-mail ou mot de passe incorrect.'],
  [/already registered|already been registered/i,'Un compte existe déjà avec cet e-mail : connectez-vous.'],
  [/email not confirmed/i,'Confirmez d\'abord votre e-mail (lien reçu par mail).'],
  [/password should be at least/i,'Mot de passe trop court (6 caractères minimum).'],
  [/rate limit|too many/i,'Trop de tentatives, réessayez dans une minute.'],
  [/failed to fetch|network/i,'Serveur injoignable : vérifiez votre connexion.'],
  [/provider is not enabled/i,'La connexion Google n\'est pas encore activée sur le serveur.'],
];
function frError(e){
  const m=String(e&&e.message||e);
  for(const [re,fr] of ERRORS) if(re.test(m)) return fr;
  return 'Oups : '+m;
}
function say(text,kind=''){ const el=$('#acc-msg'); el.textContent=text; el.className=kind; }

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

function refreshUi(){
  const on=!!user;
  $('#acc-out').hidden=on; $('#acc-in').hidden=!on;
  $('#acc-title').textContent=on?'Votre vestiaire':'Entrez dans la légende';
  if(on){
    $('#acc-name').textContent=profileName()||'…';
    $('#acc-mail').textContent=user.email?` · ${user.email}`:'';
    loadStats();
  }
  const chip=$('#accchip');
  chip.innerHTML=on?`Connecté · <b>${escHtml(profileName()||'')}</b>`:'Mode invité · <u>créer un compte</u> pour sauvegarder vos parties';
  for(const b of document.querySelectorAll('.acc-cta')) b.hidden=on;
  // le pseudo du menu devient celui du compte
  if(on&&profileName()) $('#pseudo').value=profileName();
}
function escHtml(s){ return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

function openAccount(back){
  G.accBack=back||'#scr-menu';
  say('');
  refreshUi();
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

/* une partie terminée → une ligne en base (si connecté) */
async function saveGame(g){
  if(!user) return;
  const {error}=await sb.from('games').insert(g);
  if(error) console.warn('[compte] partie non enregistrée :',error.message);
}

function initAccount(){
  if(!sb){
    // pas de base configurée : on masque tout ce qui parle de compte
    for(const el of document.querySelectorAll('.needs-db')) el.hidden=true;
    return;
  }
  $('#btn-account').addEventListener('click',()=>openAccount('#scr-menu'));
  $('#accchip').addEventListener('click',()=>openAccount('#scr-menu'));
  $('#btn-acc-back').addEventListener('click',()=>showScreen(G.accBack||'#scr-menu'));
  for(const b of document.querySelectorAll('.acc-cta')){
    b.addEventListener('click',()=>openAccount('#'+b.closest('.screen').id));
  }
  $('#btn-google').addEventListener('click',async()=>{
    say('Redirection vers Google…');
    const {error}=await sb.auth.signInWithOAuth({provider:'google',options:{redirectTo:location.origin+location.pathname}});
    if(error) say(frError(error),'err');
  });
  $('#acc-form').addEventListener('submit',async e=>{
    e.preventDefault();
    const mode=e.submitter&&e.submitter.dataset.mode||'in';
    const form=e.currentTarget, btns=form.querySelectorAll('button');
    const email=$('#acc-email').value.trim(), password=$('#acc-pw').value;
    for(const b of btns) b.disabled=true;
    say(mode==='up'?'Création du compte…':'Connexion…');
    try{
      if(mode==='up'){
        const {data,error}=await sb.auth.signUp({email,password,options:{emailRedirectTo:location.origin+location.pathname}});
        if(error) throw error;
        if(!data.session) say('Compte créé ! Cliquez sur le lien reçu par e-mail pour l\'activer.','ok');
        else say('Bienvenue dans la légende !','ok');
      }else{
        const {error}=await sb.auth.signInWithPassword({email,password});
        if(error) throw error;
        say('Connecté. Bon match !','ok');
      }
    }catch(err){ say(frError(err),'err'); }
    finally{ for(const b of btns) b.disabled=false; }
  });
  $('#btn-logout').addEventListener('click',async()=>{ await sb.auth.signOut(); say('Déconnecté.'); });

  sb.auth.onAuthStateChange((_ev,session)=>{
    // pas d'appel Supabase attendu dans ce callback (risque de blocage) : on diffère
    setTimeout(async()=>{
      user=session?session.user:null;
      await loadProfile();
      refreshUi();
    },0);
  });
  refreshUi();
}

export { initAccount, currentUser, profileName, setDisplayName, saveGame, openAccount };
