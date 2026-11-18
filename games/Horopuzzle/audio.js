/* Horopuzzle v0.7.1 — original music-box melody and gentle synthesized effects. */
(()=>{'use strict';
 const KEY='starMemory.v1.sound';
 let enabled=true;try{enabled=localStorage.getItem(KEY)!=='false'}catch{}
 let ctx,master,music,fx,timer=null,wanted=false,unlocked=false,next=0,step=0;
 const voices=new Set();
 // Four original phrases, with rests, in C major. One step is an eighth note.
 const melody=[
  72,0,76,79,0,76,74,0, 71,0,74,79,0,74,72,0,
  69,0,72,76,0,74,72,0, 65,0,69,72,0,67,0,0,
  76,0,79,84,0,79,76,0, 74,0,79,83,0,81,79,0,
  76,0,72,69,0,72,74,0, 72,0,67,64,0,60,0,0
 ];
 const roots=[48,43,45,41,48,43,45,48],beat=60/84/2;
 function setup(){if(ctx)return true;try{
  const Audio=globalThis.AudioContext||globalThis.webkitAudioContext;if(!Audio)return false;
  ctx=new Audio();master=ctx.createGain();music=ctx.createGain();fx=ctx.createGain();
  const limiter=ctx.createDynamicsCompressor();limiter.threshold.value=-18;limiter.knee.value=18;limiter.ratio.value=5;
  master.gain.value=.6;music.gain.value=.55;fx.gain.value=.8;
  music.connect(master);fx.connect(master);master.connect(limiter);limiter.connect(ctx.destination);return true;
 }catch{return false}}
 function note(midi,time,length,level,bus){
  for(const [partial,weight] of [[1,1],[2,.13],[3,.035]]){
   const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type='sine';
   osc.frequency.value=440*Math.pow(2,(midi-69)/12)*partial;
   gain.gain.setValueAtTime(0,time);gain.gain.linearRampToValueAtTime(level*weight,time+.007);
   gain.gain.exponentialRampToValueAtTime(.0001,time+length);
   osc.connect(gain);gain.connect(bus);voices.add(osc);
   osc.onended=()=>{voices.delete(osc);osc.disconnect();gain.disconnect()};
   osc.start(time);osc.stop(time+length+.02);
  }
 }
 function schedule(){if(!enabled||!wanted||!unlocked||document.hidden||ctx?.state!=='running')return;
  if(next<ctx.currentTime)next=ctx.currentTime+.035;
  while(next<ctx.currentTime+.15){
   const index=step%melody.length,n=melody[index];
   if(n)note(n,next,1.35,.105,music);
   if(index%8===0)note(roots[Math.floor(index/8)]+12,next,2.3,.065,music);
   next+=beat;step++;
  }
 }
 function run(){if(timer!==null||!enabled||!wanted||!unlocked||document.hidden||ctx?.state!=='running')return;
  next=ctx.currentTime+.035;schedule();timer=setInterval(schedule,60);
 }
 function silence(){if(timer!==null){clearInterval(timer);timer=null}for(const osc of voices){try{osc.stop()}catch{}}voices.clear()}
 function unlock(){if(!enabled||document.hidden||!setup())return;
  unlocked=true;
  if(ctx.state==='running')run();else void ctx.resume().then(run).catch(()=>{});
 }
 function sync(){document.querySelectorAll('[data-sound-toggle]').forEach(b=>{
  b.textContent=enabled?'音：オン':'音：オフ';b.setAttribute('aria-pressed',String(enabled));b.setAttribute('aria-label',enabled?'音をオフにする':'音をオンにする');
 })}
 function toggle(){enabled=!enabled;try{localStorage.setItem(KEY,String(enabled))}catch{}
  if(enabled)unlock();else silence();sync();
 }
 function effect(kind){if(!enabled||!unlocked||document.hidden||ctx?.state!=='running')return;
  const t=ctx.currentTime+.008;
  if(kind==='card'){note(84,t,.16,.095,fx);return}
  music.gain.cancelScheduledValues(t);music.gain.setValueAtTime(.25,t);music.gain.linearRampToValueAtTime(.55,t+.95);
  const notes=kind==='clear'?[72,76,79,84,79,84]:[76,79,84];
  notes.forEach((n,i)=>note(n,t+i*.085,kind==='clear'?.9:.5,.12,fx));
 }
 document.addEventListener('pointerdown',unlock,{passive:true});
 document.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')unlock()});
 document.addEventListener('click',e=>{if(e.target.closest?.('[data-sound-toggle]'))toggle()});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){silence();if(ctx?.state==='running')void ctx.suspend().catch(()=>{})}else if(enabled&&unlocked)unlock()});
 window.addEventListener('pagehide',()=>{silence();if(ctx?.state==='running')void ctx.suspend().catch(()=>{})});
 window.addEventListener('pageshow',()=>{if(enabled&&unlocked)unlock()});
 window.HoroAudio={start(){wanted=true;unlock()},stop(){wanted=false;silence()},card(){effect('card')},correct(last=false){effect(last?'clear':'correct')},sync};
})();
