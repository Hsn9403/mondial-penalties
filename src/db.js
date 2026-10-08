import { createClient } from '@supabase/supabase-js';

/* ============================ SUPABASE ============================== */
/* Configuré par .env.local (ou les variables d'environnement Vercel) :
     VITE_SUPABASE_URL=https://xxxx.supabase.co
     VITE_SUPABASE_KEY=<clé publishable / anon — publique par nature>
   Sans configuration, le jeu tourne en mode local : pas de comptes,
   classement enregistré sur l'appareil. */
const url=import.meta.env.VITE_SUPABASE_URL;
const key=import.meta.env.VITE_SUPABASE_KEY;

const sb=url&&key?createClient(url,key,{auth:{flowType:'pkce'}}):null;

export { sb };
