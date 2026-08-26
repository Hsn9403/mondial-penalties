

/* =============================== DATA =============================== */
const TEAMS=[
 {n:'France',f:'🇫🇷',c1:'#1e3f8f',c2:'#f4f4f4',s:93},{n:'Brésil',f:'🇧🇷',c1:'#f0c937',c2:'#1c3fa0',s:94},
 {n:'Argentine',f:'🇦🇷',c1:'#7cb9e8',c2:'#16233f',s:94},{n:'Allemagne',f:'🇩🇪',c1:'#f2f2f2',c2:'#171717',s:90},
 {n:'Espagne',f:'🇪🇸',c1:'#c8102e',c2:'#1b2a6b',s:91},{n:'Angleterre',f:'🏴󠁧󠁢󠁥󠁮󠁧󠁿',c1:'#f4f4f4',c2:'#1b2a5e',s:90},
 {n:'Portugal',f:'🇵🇹',c1:'#a32638',c2:'#1c5e3c',s:89},{n:'Italie',f:'🇮🇹',c1:'#2255a4',c2:'#f4f4f4',s:88},
 {n:'Pays-Bas',f:'🇳🇱',c1:'#f36c21',c2:'#17181c',s:88},{n:'Belgique',f:'🇧🇪',c1:'#d8343c',c2:'#17181c',s:87},
 {n:'Croatie',f:'🇭🇷',c1:'#e8ebee',c2:'#c8353c',s:86},{n:'Maroc',f:'🇲🇦',c1:'#c1272d',c2:'#1c6b3a',s:85},
 {n:'Uruguay',f:'🇺🇾',c1:'#75aadb',c2:'#17181c',s:85},{n:'Colombie',f:'🇨🇴',c1:'#ffd23f',c2:'#1b2a6b',s:84},
 {n:'Mexique',f:'🇲🇽',c1:'#0b6b45',c2:'#f4f4f4',s:84},{n:'Suisse',f:'🇨🇭',c1:'#d52b1e',c2:'#f4f4f4',s:83},
 {n:'Danemark',f:'🇩🇰',c1:'#c8102e',c2:'#f4f4f4',s:83},{n:'Sénégal',f:'🇸🇳',c1:'#f4f4f4',c2:'#1c6b3a',s:83},
 {n:'Japon',f:'🇯🇵',c1:'#1b2e6e',c2:'#f4f4f4',s:82},{n:'États-Unis',f:'🇺🇸',c1:'#f4f4f4',c2:'#1b2a5e',s:82},
 {n:'Corée du Sud',f:'🇰🇷',c1:'#d0313c',c2:'#17181c',s:81},{n:'Nigeria',f:'🇳🇬',c1:'#3da35d',c2:'#f4f4f4',s:80},
 {n:'Pologne',f:'🇵🇱',c1:'#f4f4f4',c2:'#c8102e',s:80},{n:'Turquie',f:'🇹🇷',c1:'#e30a17',c2:'#f4f4f4',s:80},
 {n:'Ghana',f:'🇬🇭',c1:'#f4f4f4',c2:'#17181c',s:79},{n:'Cameroun',f:'🇨🇲',c1:'#1d7a38',c2:'#c8102e',s:79},
 {n:'Serbie',f:'🇷🇸',c1:'#c6363c',c2:'#f4f4f4',s:79},{n:'Autriche',f:'🇦🇹',c1:'#ed2939',c2:'#f4f4f4',s:79},
 {n:'Équateur',f:'🇪🇨',c1:'#ffdd00',c2:'#1b2a6b',s:79},{n:'Australie',f:'🇦🇺',c1:'#ffb81c',c2:'#1c5e3c',s:78},
 {n:'Canada',f:'🇨🇦',c1:'#d80621',c2:'#f4f4f4',s:78},{n:'Norvège',f:'🇳🇴',c1:'#d0313c',c2:'#1b2a5e',s:78},
 {n:'Suède',f:'🇸🇪',c1:'#ffd23f',c2:'#1b2a6b',s:81},{n:'Ukraine',f:'🇺🇦',c1:'#ffd500',c2:'#1e5bc6',s:80},
 {n:'Égypte',f:'🇪🇬',c1:'#c8102e',c2:'#17181c',s:80},{n:'Algérie',f:'🇩🇿',c1:'#f4f4f4',c2:'#1c6b3a',s:80},
 {n:'Côte d\'Ivoire',f:'🇨🇮',c1:'#f36c21',c2:'#f4f4f4',s:80},{n:'Chili',f:'🇨🇱',c1:'#d0313c',c2:'#1b2a6b',s:79},
 {n:'Écosse',f:'🏴󠁧󠁢󠁳󠁣󠁴󠁿',c1:'#1b2a5e',c2:'#f4f4f4',s:78},{n:'Iran',f:'🇮🇷',c1:'#f4f4f4',c2:'#c8102e',s:78},
 {n:'Tunisie',f:'🇹🇳',c1:'#c8102e',c2:'#f4f4f4',s:78},{n:'Paraguay',f:'🇵🇾',c1:'#e8ebee',c2:'#c8353c',s:78},
 {n:'Pérou',f:'🇵🇪',c1:'#e8ebee',c2:'#c8353c',s:78},{n:'Arabie saoudite',f:'🇸🇦',c1:'#f4f4f4',c2:'#1c6b3a',s:77},
 {n:'Costa Rica',f:'🇨🇷',c1:'#d0313c',c2:'#1b2a6b',s:77},{n:'Panama',f:'🇵🇦',c1:'#d0313c',c2:'#f4f4f4',s:76},
 {n:'Ouzbékistan',f:'🇺🇿',c1:'#f4f4f4',c2:'#1e5bc6',s:75},{n:'Nouvelle-Zélande',f:'🇳🇿',c1:'#f4f4f4',c2:'#17181c',s:74},
];
const ROUNDS=['Seizièmes de finale','Huitièmes de finale','Quarts de finale','Demi-finales','Finale'];
const KEEPER_KIT='#2fb3a4';

const TROPHIES=[
 {id:'sans-trembler',n:'Sans trembler',d:'Gagner un match sans rater un seul tir.',tier:'bronze'},
 {id:'mort-subite',n:'Cœur solide',d:'Gagner un match en mort subite.',tier:'bronze'},
 {id:'muraille',n:'La Muraille',d:'Réussir 3 arrêts dans un même match.',tier:'argent'},
 {id:'main-ferme',n:'Cage inviolée',d:'Gagner un match sans encaisser un seul but.',tier:'argent'},
 {id:'panenka',n:'Panenka',d:'Marquer un tir tout en douceur, plein centre.',tier:'argent'},
 {id:'champion',n:'Première étoile',d:'Remporter la Coupe du monde.',tier:'or'},
 {id:'outsider',n:'L\'Outsider',d:'Être champion avec une nation de force 80 ou moins.',tier:'or'},
 {id:'double',n:'Bis repetita',d:'Remporter deux Coupes du monde.',tier:'or'},
 {id:'grand-chelem',n:'Le Grand Chelem',d:'Être champion en gagnant tous les matchs 3–0 : tout marquer, ne rien encaisser.',tier:'legende'},
 {id:'integral',n:'L\'Intégrale',d:'Remporter la Coupe du monde avec chacune des 48 nations.',tier:'legende'},
];

/* --------------- Messages personnalisés par stade --------------- */
/* indexés par le tour qu'on vient de GAGNER (0 = seizièmes … 3 = demi) */
const PASS_MSGS={
 0:[n=>`${n} rejoint les huitièmes — le voyage ne fait que commencer.`,
    n=>`Premier frisson, première qualif : ${n} verra les huitièmes !`,
    n=>`Le stade exulte : ${n} franchit l'obstacle des seizièmes.`],
 1:[n=>`${n} en quarts de finale ! Le pays commence à y croire.`,
    n=>`Les huitièmes tombent : ${n} entre dans le top 8 mondial.`,
    n=>`Nuit de fête au pays : ${n} file en quarts !`],
 2:[n=>`DEMI-FINALE ! ${n} n'est plus qu'à deux marches du toit du monde.`,
    n=>`${n} dans le dernier carré — c'est ici que s'écrivent les légendes.`,
    n=>`Tout un peuple retient son souffle : ${n} jouera la demi-finale.`],
 3:[n=>`${n} EN FINALE ! Un match pour l'éternité.`,
    n=>`Des millions de cœurs battent à l'unisson : ${n} disputera la finale mondiale.`,
    n=>`Plus qu'une séance entre ${n} et l'histoire.`],
};
/* indexés par le tour où l'on vient de PERDRE (0 = seizièmes … 4 = finale) */
const LOSS_MSGS={
 0:[n=>`Sortie de route dès les seizièmes… ${n} repart la tête basse, mais reviendra plus fort.`,
    n=>`Le rêve de ${n} s'éteint d'entrée de tableau. Cruel, ce jeu des penalties.`],
 1:[n=>`${n} bute sur les huitièmes. Si près, si loin…`,
    n=>`Les huitièmes, cimetière des ambitions : ${n} tombe les armes à la main.`],
 2:[n=>`${n} échoue aux portes du dernier carré. Les quarts ne pardonnent pas.`,
    n=>`Un quart de finale perdu aux tirs au but… ${n} s'en souviendra longtemps.`],
 3:[n=>`Si cruel : ${n} tombe en demi-finale, à une séance de la gloire.`,
    n=>`Le dernier carré restera le plafond de ${n}. La finale se jouera sans vous.`],
 4:[n=>`Finaliste… ${n} a touché le trophée des yeux, jamais des mains. Quelle douleur.`,
    n=>`Battus en FINALE. ${n} rentre avec l'argent et un goût de cendre.`],
};
const CHAMP_MSGS=[
 n=>`${n} SUR LE TOIT DU MONDE ! Cinq séances parfaites, une étoile éternelle.`,
 n=>`Le trophée rentre à la maison : ${n}, champion du monde des penalties !`,
 n=>`Des larmes, des drapeaux, l'histoire : ${n} est champion du monde.`,
];

export { TEAMS, ROUNDS, KEEPER_KIT, TROPHIES, PASS_MSGS, LOSS_MSGS, CHAMP_MSGS };
