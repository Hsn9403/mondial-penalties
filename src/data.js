

/* =============================== DATA =============================== */
/* classées dans l'ordre du classement FIFA (juillet 2026, après le Mondial) :
   r = rang FIFA, s = force en jeu (dérivée du rang), c = code FIFA */
const TEAMS=[
 {n:'Espagne',c:'ESP',f:'🇪🇸',c1:'#c8102e',c2:'#1b2a6b',s:95,r:1},
 {n:'Argentine',c:'ARG',f:'🇦🇷',c1:'#7cb9e8',c2:'#16233f',s:94,r:2},
 {n:'France',c:'FRA',f:'🇫🇷',c1:'#1e3f8f',c2:'#f4f4f4',s:94,r:3},
 {n:'Angleterre',c:'ENG',f:'🏴󠁧󠁢󠁥󠁮󠁧󠁿',c1:'#f4f4f4',c2:'#1b2a5e',s:93,r:4},
 {n:'Brésil',c:'BRA',f:'🇧🇷',c1:'#f0c937',c2:'#1c3fa0',s:92,r:5},
 {n:'Maroc',c:'MAR',f:'🇲🇦',c1:'#c1272d',c2:'#1c6b3a',s:91,r:6},
 {n:'Portugal',c:'POR',f:'🇵🇹',c1:'#a32638',c2:'#1c5e3c',s:91,r:7},
 {n:'Belgique',c:'BEL',f:'🇧🇪',c1:'#d8343c',c2:'#17181c',s:90,r:8},
 {n:'Pays-Bas',c:'NED',f:'🇳🇱',c1:'#f36c21',c2:'#17181c',s:90,r:9},
 {n:'Mexique',c:'MEX',f:'🇲🇽',c1:'#0b6b45',c2:'#f4f4f4',s:89,r:10},
 {n:'Colombie',c:'COL',f:'🇨🇴',c1:'#ffd23f',c2:'#1b2a6b',s:89,r:11},
 {n:'Allemagne',c:'GER',f:'🇩🇪',c1:'#f2f2f2',c2:'#171717',s:88,r:12},
 {n:'Croatie',c:'CRO',f:'🇭🇷',c1:'#e8ebee',c2:'#c8353c',s:88,r:13},
 {n:'Suisse',c:'SUI',f:'🇨🇭',c1:'#d52b1e',c2:'#f4f4f4',s:87,r:14},
 {n:'Italie',c:'ITA',f:'🇮🇹',c1:'#2255a4',c2:'#f4f4f4',s:87,r:15},
 {n:'États-Unis',c:'USA',f:'🇺🇸',c1:'#f4f4f4',c2:'#1b2a5e',s:86,r:16},
 {n:'Japon',c:'JPN',f:'🇯🇵',c1:'#1b2e6e',c2:'#f4f4f4',s:86,r:17},
 {n:'Sénégal',c:'SEN',f:'🇸🇳',c1:'#f4f4f4',c2:'#1c6b3a',s:85,r:18},
 {n:'Norvège',c:'NOR',f:'🇳🇴',c1:'#d0313c',c2:'#1b2a5e',s:85,r:19},
 {n:'Uruguay',c:'URU',f:'🇺🇾',c1:'#75aadb',c2:'#17181c',s:84,r:20},
 {n:'Danemark',c:'DEN',f:'🇩🇰',c1:'#c8102e',c2:'#f4f4f4',s:84,r:21},
 {n:'Iran',c:'IRN',f:'🇮🇷',c1:'#f4f4f4',c2:'#c8102e',s:83,r:22},
 {n:'Corée du Sud',c:'KOR',f:'🇰🇷',c1:'#d0313c',c2:'#17181c',s:83,r:23},
 {n:'Équateur',c:'ECU',f:'🇪🇨',c1:'#ffdd00',c2:'#1b2a6b',s:83,r:24},
 {n:'Autriche',c:'AUT',f:'🇦🇹',c1:'#ed2939',c2:'#f4f4f4',s:82,r:25},
 {n:'Australie',c:'AUS',f:'🇦🇺',c1:'#ffb81c',c2:'#1c5e3c',s:82,r:26},
 {n:'Turquie',c:'TUR',f:'🇹🇷',c1:'#e30a17',c2:'#f4f4f4',s:82,r:27},
 {n:'Canada',c:'CAN',f:'🇨🇦',c1:'#d80621',c2:'#f4f4f4',s:81,r:28},
 {n:'Ukraine',c:'UKR',f:'🇺🇦',c1:'#ffd500',c2:'#1e5bc6',s:81,r:29},
 {n:'Égypte',c:'EGY',f:'🇪🇬',c1:'#c8102e',c2:'#17181c',s:80,r:30},
 {n:'Panama',c:'PAN',f:'🇵🇦',c1:'#d0313c',c2:'#f4f4f4',s:80,r:31},
 {n:'Algérie',c:'ALG',f:'🇩🇿',c1:'#f4f4f4',c2:'#1c6b3a',s:80,r:32},
 {n:'Pologne',c:'POL',f:'🇵🇱',c1:'#f4f4f4',c2:'#c8102e',s:79,r:33},
 {n:'Écosse',c:'SCO',f:'🏴󠁧󠁢󠁳󠁣󠁴󠁿',c1:'#1b2a5e',c2:'#f4f4f4',s:79,r:34},
 {n:'Serbie',c:'SRB',f:'🇷🇸',c1:'#c6363c',c2:'#f4f4f4',s:79,r:35},
 {n:'Paraguay',c:'PAR',f:'🇵🇾',c1:'#e8ebee',c2:'#c8353c',s:78,r:36},
 {n:'Côte d\'Ivoire',c:'CIV',f:'🇨🇮',c1:'#f36c21',c2:'#f4f4f4',s:78,r:37},
 {n:'Nigeria',c:'NGA',f:'🇳🇬',c1:'#3da35d',c2:'#f4f4f4',s:78,r:38},
 {n:'Tunisie',c:'TUN',f:'🇹🇳',c1:'#c8102e',c2:'#f4f4f4',s:77,r:39},
 {n:'Suède',c:'SWE',f:'🇸🇪',c1:'#ffd23f',c2:'#1b2a6b',s:77,r:40},
 {n:'Pérou',c:'PER',f:'🇵🇪',c1:'#e8ebee',c2:'#c8353c',s:76,r:41},
 {n:'Costa Rica',c:'CRC',f:'🇨🇷',c1:'#d0313c',c2:'#1b2a6b',s:76,r:42},
 {n:'Cameroun',c:'CMR',f:'🇨🇲',c1:'#1d7a38',c2:'#c8102e',s:75,r:43},
 {n:'Chili',c:'CHI',f:'🇨🇱',c1:'#d0313c',c2:'#1b2a6b',s:75,r:44},
 {n:'Ouzbékistan',c:'UZB',f:'🇺🇿',c1:'#f4f4f4',c2:'#1e5bc6',s:75,r:45},
 {n:'Arabie saoudite',c:'KSA',f:'🇸🇦',c1:'#f4f4f4',c2:'#1c6b3a',s:74,r:46},
 {n:'Ghana',c:'GHA',f:'🇬🇭',c1:'#f4f4f4',c2:'#17181c',s:73,r:47},
 {n:'Nouvelle-Zélande',c:'NZL',f:'🇳🇿',c1:'#f4f4f4',c2:'#17181c',s:71,r:48},
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
