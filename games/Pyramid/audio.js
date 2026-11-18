/* 石を積む v0.7.0 — original score, crickets, boing and flying saucers. */
(() => {
  'use strict';
  const A = PyramidApp, M = A.M, $ = A.$, KEY = 'pyramid.sound.v1';
  let enabled = true, volume = .45, ctx, master, dayGain, nightGain, loadPromise;
  let ready = false, failed = false, away = document.hidden, mode = '', ufoVoice = null;
  let lastUfo = '', effectCount = 0, latest = A.state;
  const loops = [];
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (typeof saved?.enabled === 'boolean') enabled = saved.enabled;
    if (typeof saved?.volume === 'number' && Number.isFinite(saved.volume)) volume = Math.max(0, Math.min(1, saved.volume));
  } catch {}
  function save() {try {localStorage.setItem(KEY,JSON.stringify({enabled,volume}));}catch{}}
  function label() {
    $('soundToggle').textContent = enabled ? '音：オン' : '音：オフ';
    $('soundToggle').setAttribute('aria-pressed',String(enabled));
    $('soundVolume').value = Math.round(volume*100);
    $('soundValue').textContent = Math.round(volume*100)+'%';
    $('soundStatus').textContent = !enabled ? '消音中' : volume === 0 ? '音量0%（消音）' : failed ? '音を読み込めませんでした。音ボタンで再試行できます。' :
      !ctx || ctx.state !== 'running' ? '最初のボタン操作から音が出ます。' : !ready ? '音を準備しています…' :
      mode === 'night' ? '夜の虫の声' : mode === 'day' ? '昼のテーマ：石に刻む王の夢' : '工事が始まるとBGMが流れます。';
  }
  function ramp(param,value,time=.5) {
    if (!ctx) return;
    param.cancelScheduledValues(ctx.currentTime);
    param.setTargetAtTime(value,ctx.currentTime,time/4);
  }
  function stopUfo() {
    if (!ufoVoice) return;
    ramp(ufoVoice.gain.gain,0,.12);
    for (const node of ufoVoice.oscillators) {try{node.stop(ctx.currentTime+.16);}catch{}}
    ufoVoice = null;
  }
  function flyingSaucer() {
    if (!ctx || ufoVoice || !enabled || volume === 0 || away) return;
    const gain=ctx.createGain(), carrier=ctx.createOscillator(), lfo=ctx.createOscillator(), depth=ctx.createGain();
    carrier.type='sine';carrier.frequency.value=530;
    lfo.frequency.value=5.5;depth.gain.value=150;
    lfo.connect(depth);depth.connect(carrier.frequency);carrier.connect(gain);gain.connect(master);
    gain.gain.value=0;ramp(gain.gain,.045,.2);
    carrier.start();lfo.start();
    carrier.onended=()=>{carrier.disconnect();lfo.disconnect();depth.disconnect();gain.disconnect();};
    ufoVoice={gain,oscillators:[carrier,lfo]};
  }
  function sync(state) {
    latest=state || latest;
    const next=!latest.started || M.completed(latest) ? 'quiet' : M.night(latest) ? 'night' : 'day';
    if (ctx) {
      ramp(master.gain,enabled && !away ? volume : 0,.16);
      if (next!==mode || !ready) {
        ramp(dayGain.gain,next==='day' ? .55 : 0,1.2);
        ramp(nightGain.gain,next==='night' ? .62 : 0,1.2);
      }
      const ufo=M.ufoAt(latest), key=ufo.day+':'+ufo.pass;
      if (ufo.active && enabled && volume>0 && !away && ctx.state==='running') {
        if (key!==lastUfo) {stopUfo();lastUfo=key;}
        flyingSaucer();
      } else stopUfo();
    }
    mode=next;label();
  }
  async function loadLoops() {
    if (ready) return;
    if (loadPromise) return loadPromise;
    failed=false;
    loadPromise=(async()=>{
      const buffers=await Promise.all(['day-theme','night-insects'].map(async name=>{
        const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);
        try {
          const response=await fetch('audio/'+name+'.mp3?v=0.7.0',{signal:controller.signal});
          if(!response.ok)throw Error('audio unavailable');
          return await ctx.decodeAudioData(await response.arrayBuffer());
        } finally {clearTimeout(timer);} 
      }));
      for(let i=0;i<buffers.length;i++){
        const source=ctx.createBufferSource();source.buffer=buffers[i];source.loop=true;
        source.connect(i===0?dayGain:nightGain);source.start();loops.push(source);
      }
      ready=true;mode='';sync(latest);
    })().catch(()=>{failed=true;}).finally(()=>{loadPromise=null;label();});
    return loadPromise;
  }
  function activate() {
    if(!enabled || away)return;
    try {
      if(!ctx){
        const Audio=window.AudioContext||window.webkitAudioContext;
        if(!Audio){failed=true;label();return;}
        ctx=new Audio();master=ctx.createGain();dayGain=ctx.createGain();nightGain=ctx.createGain();
        master.gain.value=volume;dayGain.gain.value=0;nightGain.gain.value=0;
        dayGain.connect(master);nightGain.connect(master);master.connect(ctx.destination);
        // iOS may interrupt audio during calls or app switching. The next tap resumes it.
        ctx.onstatechange=()=>{if(ctx.state==='running')sync(latest);else label();};
      }
      if(ctx.state!=='running')ctx.resume().then(()=>sync(latest)).catch(()=>label());
      void loadLoops();sync(latest);
    }catch{failed=true;label();}
  }
  function effect(kind='boing') {
    if(!enabled || volume===0 || away)return;
    activate();if(!ctx || effectCount>=6)return;
    if(ctx.state!=='running') {ctx.resume().then(()=>{if(ctx.state==='running')effect(kind);}).catch(()=>{});return;}
    effectCount++;
    const osc=ctx.createOscillator(), gain=ctx.createGain(), now=ctx.currentTime;
    osc.type='sine';gain.gain.setValueAtTime(.0001,now);
    gain.gain.exponentialRampToValueAtTime(kind==='ufo'?.14:.22,now+.018);
    if(kind==='complete'){
      for(const [t,hz]of [[0,523.25],[.14,659.25],[.28,783.99],[.42,1046.5]])osc.frequency.setValueAtTime(hz,now+t);
    }else if(kind==='ufo'){
      osc.frequency.setValueAtTime(1000,now);osc.frequency.exponentialRampToValueAtTime(220,now+.12);
      osc.frequency.exponentialRampToValueAtTime(1600,now+.28);
    }else{
      osc.frequency.setValueAtTime(150,now);osc.frequency.exponentialRampToValueAtTime(520,now+.045);
      osc.frequency.exponentialRampToValueAtTime(95,now+.31);
    }
    gain.gain.exponentialRampToValueAtTime(.0001,now+.52);
    osc.connect(gain);gain.connect(master);osc.start();osc.stop(now+.56);
    osc.onended=()=>{osc.disconnect();gain.disconnect();effectCount--;};
  }
  function pause() {away=true;stopUfo();if(ctx)ctx.suspend().catch(()=>{});label();}
  function resume() {away=document.hidden;if(!away && ctx && enabled)activate();else sync(latest);}
  $('soundToggle').onclick=()=>{
    enabled=!enabled;save();
    if(enabled)activate();else{stopUfo();if(ctx){master.gain.cancelScheduledValues(ctx.currentTime);master.gain.value=0;void ctx.suspend().catch(()=>{});}}
    sync(latest);
  };
  $('soundVolume').oninput=()=>{
    volume=Math.max(0,Math.min(1,Number($('soundVolume').value)/100));save();if(enabled)activate();sync(latest);
  };
  document.addEventListener('pointerdown',event=>{if(event.target.closest('button,input'))activate();},{capture:true});
  document.addEventListener('keydown',event=>{if(['Enter',' '].includes(event.key))activate();},{capture:true});
  document.addEventListener('visibilitychange',()=>document.hidden?pause():resume());
  addEventListener('pagehide',pause);addEventListener('pageshow',resume);
  globalThis.PyramidAudio={sync,effect};
  sync(latest);
})();
