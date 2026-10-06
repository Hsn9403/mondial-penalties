

/* ============================== AUDIO =============================== */
const Snd=(()=>{
  let ac=null, master=null, crowdGain=null, muted=false, started=false;
  let heartTimer=null, heartOn=false;
  function ensure(){
    if(started||muted&&!ac) return;
    if(!ac){
      try{ac=new (window.AudioContext||window.webkitAudioContext)();}catch(e){return;}
      master=ac.createGain(); master.gain.value=muted?0:1; master.connect(ac.destination);
      const len=4*ac.sampleRate, buf=ac.createBuffer(1,len,ac.sampleRate), d=buf.getChannelData(0);
      let last=0;
      for(let i=0;i<len;i++){ const w=Math.random()*2-1; last=(last+0.03*w)/1.03; d[i]=last*4.2; }
      const src=ac.createBufferSource(); src.buffer=buf; src.loop=true;
      const lp=ac.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=760; lp.Q.value=.4;
      crowdGain=ac.createGain(); crowdGain.gain.value=.14;
      src.connect(lp).connect(crowdGain).connect(master); src.start();
    }
    if(ac.state==='suspended') ac.resume();
    started=true;
  }
  function env(node,at,peak,dur){ const g=node.gain;
    g.cancelScheduledValues(at); g.setValueAtTime(g.value,at);
    g.linearRampToValueAtTime(peak,at+dur*0.18); g.exponentialRampToValueAtTime(Math.max(.0001,.14),at+dur);
  }
  function noiseBurst(freq,q,peak,dur){
    if(!ac) return;
    const len=dur*ac.sampleRate|0, buf=ac.createBuffer(1,len,ac.sampleRate), d=buf.getChannelData(0);
    for(let i=0;i<len;i++) d[i]=(Math.random()*2-1)*(1-i/len);
    const s=ac.createBufferSource(); s.buffer=buf;
    const f=ac.createBiquadFilter(); f.type='bandpass'; f.frequency.value=freq; f.Q.value=q;
    const g=ac.createGain(); g.gain.value=peak;
    s.connect(f).connect(g).connect(master); s.start();
  }
  return {
    ensure,
    // mode discret : on gèle tout le son d'un coup, sans toucher au réglage muet
    hush(on){ if(!ac) return; if(on) ac.suspend(); else if(started) ac.resume(); },
    toggle(){ muted=!muted; ensure(); if(master) master.gain.value=muted?0:1; return muted; },
    swell(){ if(crowdGain&&ac) env(crowdGain,ac.currentTime,.34,1.4); },
    roar(){ if(!ac)return; env(crowdGain,ac.currentTime,.95,3.2); noiseBurst(900,.7,.5,1.6); },
    groan(){ if(!ac)return; env(crowdGain,ac.currentTime,.42,1.8); noiseBurst(240,1.2,.3,.9); },
    whistle(long){ if(!ac)return; const t=ac.currentTime;
      const o=ac.createOscillator(); o.type='square'; o.frequency.value=2350;
      const v=ac.createOscillator(); v.frequency.value=38; const vg=ac.createGain(); vg.gain.value=420;
      v.connect(vg).connect(o.frequency);
      const g=ac.createGain(); g.gain.value=0; o.connect(g).connect(master);
      g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(.10,t+.02);
      g.gain.setValueAtTime(.10,t+(long?.65:.14)); g.gain.linearRampToValueAtTime(0,t+(long?.72:.18));
      o.start(t); v.start(t); o.stop(t+.9); v.stop(t+.9); },
    kick(){ if(!ac)return; const t=ac.currentTime;
      const o=ac.createOscillator(); o.type='sine'; o.frequency.setValueAtTime(120,t); o.frequency.exponentialRampToValueAtTime(42,t+.11);
      const g=ac.createGain(); g.gain.setValueAtTime(.7,t); g.gain.exponentialRampToValueAtTime(.001,t+.14);
      o.connect(g).connect(master); o.start(t); o.stop(t+.16); noiseBurst(1600,1,.12,.08); },
    post(){ if(!ac)return; const t=ac.currentTime;
      const o=ac.createOscillator(); o.type='triangle'; o.frequency.value=620;
      const o2=ac.createOscillator(); o2.type='triangle'; o2.frequency.value=930;
      const g=ac.createGain(); g.gain.setValueAtTime(.5,t); g.gain.exponentialRampToValueAtTime(.001,t+.5);
      o.connect(g); o2.connect(g); g.connect(master); o.start(t); o2.start(t); o.stop(t+.52); o2.stop(t+.52); },
    /* battement de cœur « toutou… toutou… » du penalty décisif */
    heartStart(){
      ensure(); if(!ac||heartOn) return;
      heartOn=true;
      const thump=(t,v)=>{
        const o=ac.createOscillator(); o.type='sine';
        o.frequency.setValueAtTime(66,t); o.frequency.exponentialRampToValueAtTime(38,t+.12);
        const g=ac.createGain(); g.gain.setValueAtTime(0,t);
        g.gain.linearRampToValueAtTime(v,t+.015); g.gain.exponentialRampToValueAtTime(.001,t+.18);
        o.connect(g).connect(master); o.start(t); o.stop(t+.22);
      };
      const beat=()=>{
        if(!heartOn||!ac) return;
        const t=ac.currentTime+.04;
        thump(t,.9); thump(t+.26,.55);          // « tou-tou »
        heartTimer=setTimeout(beat,760);
      };
      if(crowdGain) crowdGain.gain.setTargetAtTime(.06,ac.currentTime,.4);  // la foule retient son souffle
      beat();
    },
    heartStop(){
      if(!heartOn) return;
      heartOn=false; clearTimeout(heartTimer);
      if(ac&&crowdGain) crowdGain.gain.setTargetAtTime(.14,ac.currentTime,.6);
    },
  };
})();

export { Snd };
