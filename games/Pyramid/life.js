/* Little workers can be carried away, hurry home, sulk, and come to chat. */
(()=>{'use strict';
const A=PyramidApp,M=A.M,$=A.$,canvas=$('scene'),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
let held=null,visitor=null,visible=0,nextVisit=45+Math.random()*30,lastMoved=-Infinity,dimensions=canvas.getBoundingClientRect(),awayById=new Map();
let recentTexts=[];
let history=[];try{history=JSON.parse(localStorage.getItem('pyramid.sayings.v1'))||[]}catch{}
const sayings=PyramidSayings.create(Math.random,history);
function keepHistory(){try{localStorage.setItem('pyramid.sayings.v1',JSON.stringify(sayings.history))}catch{}}
function hideSpeech(){ $('workerSpeech').hidden=true; }
function reset(){if(held)try{canvas.releasePointerCapture(held.pointer)}catch{}held=null;canvas.classList.remove('carrying-worker');visitor=null;hideSpeech();nextVisit=visible+45+Math.random()*30;}
function local(event){const b=canvas.getBoundingClientRect();return {x:(event.clientX-b.left)/b.width,y:(event.clientY-b.top)/b.height,W:b.width,H:b.height};}
function pose(person,s,time){
 if(visitor?.id===person.id)return null;
 const w=awayById.get(person.id);
 if(held?.active&&held.id===person.id)return {...person,x:held.x*held.W,y:held.y*held.H,scale:person.scale*1.65,walk:0,load:false,sleep:false,happy:true};
 if(!w)return person;
 const {width:W,height:H}=dimensions;
 if(w.kind==='sulk')return {...person,x:w.x*W,y:w.y*H,walk:0,load:false,sleep:M.night(s),sulk:!M.night(s)};
 const p=clamp((s.elapsed-w.from)/(w.until-w.from),0,1),ease=p*p*(3-2*p);
 return {...person,x:w.x*W+(person.x-w.x*W)*ease,y:w.y*H+(person.y-w.y*H)*ease,
  walk:time*19+person.id,load:false,sleep:false,returning:true};
}
function release(cancelled=false){
 if(!held)return;
 const h=held;held=null;canvas.classList.remove('carrying-worker');
 try{canvas.releasePointerCapture(h.pointer)}catch{}
 if(!h.active)return;
 A.now();const night=M.night(A.state),distance=Math.hypot((h.x-h.homeX)*h.W,(h.y-h.homeY)*h.H),seconds=clamp(distance/45,1.5,14);
 const upset=h.wasNight&&A.state.elapsed<(h.pickedDay+2)*M.DAY;
 const moved=M.moveWorker(A.state,h.id,h.x,h.y,seconds,upset);
 if(moved&&upset&&h.wasNight&&!night)moved.until=(h.pickedDay+2)*M.DAY;
 if(moved&&!upset&&h.original?.kind==='sulk'&&h.original.until>A.state.elapsed){moved.kind='sulk';moved.until=h.original.until;}
 lastMoved=visible;
 A.notice((upset||moved?.kind==='sulk')?'寝ていたおっさん、移動先でぷんすか。翌日は休業、次の日に復帰します。':'おっさん、汗をかいて現場へ急行中。戻るまでは担当分の作業が止まります。');
 if(!cancelled)PyramidAudio?.effect('boing');A.save();A.update();
}
canvas.addEventListener('pointerdown',event=>{
 if(event.button!==0||held||!A.state.started||M.completed(A.state))return;
 const p=local(event),people=A.renderer.getPeople();
 const candidates=people.filter(w=>Math.abs(p.x*p.W-w.x)<Math.max(18,w.scale*10)&&Math.abs(p.y*p.H-(w.y-w.scale*12))<Math.max(22,w.scale*19));
 const who=candidates.sort((a,b)=>Math.hypot(p.x*p.W-a.x,p.y*p.H-a.y)-Math.hypot(p.x*p.W-b.x,p.y*p.H-b.y))[0];if(!who)return;
 event.preventDefault();canvas.setPointerCapture(event.pointerId);
 held={id:who.id,pointer:event.pointerId,startX:p.x,startY:p.y,x:who.x/p.W,y:who.y/p.H,homeX:who.x/p.W,homeY:who.y/p.H,W:p.W,H:p.H,active:false,wasNight:M.night(A.state),pickedDay:M.day(A.state),original:(A.state.distractions||[]).find(w=>w.id===who.id)};
});
canvas.addEventListener('pointermove',event=>{
 if(!held||event.pointerId!==held.pointer)return;
 const p=local(event);
 if(!held.active&&Math.hypot((p.x-held.startX)*p.W,(p.y-held.startY)*p.H)<8)return;
 if(!held.active){held.wasNight=M.night(A.state);held.pickedDay=M.day(A.state);}
 held.active=true;held.W=p.W;held.H=p.H;held.x=clamp(p.x,.035,.965);held.y=clamp(p.y,.46,.95);
 canvas.classList.add('carrying-worker');event.preventDefault();
});
canvas.addEventListener('touchstart',event=>{if(held)event.preventDefault()},{passive:false});
canvas.addEventListener('touchmove',event=>{if(held)event.preventDefault()},{passive:false});
canvas.addEventListener('pointerup',()=>release());canvas.addEventListener('pointercancel',()=>release(true));canvas.addEventListener('lostpointercapture',()=>release(true));
function startVisit(){
 const people=A.renderer.getPeople();if(!people.length)return;
 const sulker=(A.state.distractions||[]).find(w=>w.kind==='sulk'),actor=sulker?people.find(w=>w.id===sulker.id)||people[0]:people[Math.floor(Math.random()*people.length)];
 let saying;
 if(sulker&&Math.random()<.6)saying={text:'寝てるとこ運ばれたん、覚えてるで。今日は拗ね休みや。'};
 else if(visible-lastMoved<70&&Math.random()<.6)saying={text:'責任者、わしを運ぶ元気があるなら石を頼む。'};
 else if(Math.random()<.25)saying=PyramidRumors.next();
 if(!saying||recentTexts.includes(saying.text))saying=sayings.next();
 recentTexts.push(saying.text);recentTexts=recentTexts.slice(-8);keepHistory();
 visitor={id:actor.id,x:actor.x,y:actor.y,scale:actor.scale,age:0,saying};
 $('workerLine').textContent=saying.text;$('speechKind').textContent=saying.promo?'ラボの噂':'おっさんのひとこと';
 $('speechGame').hidden=!saying.url;
 if(saying.url)$('speechGame').href=saying.url;
}
function tick(dt){
 dimensions=canvas.getBoundingClientRect();
 awayById=new Map((A.state.distractions||[]).filter(w=>w.until>A.state.elapsed).map(w=>[w.id,w]));
 if(!A.state.started||M.completed(A.state)){if(visitor||held)reset();return;}
 if(held?.active)M.moveWorker(A.state,held.id,held.x,held.y,30,false);
 if(document.querySelector('dialog[open]'))return;
 visible+=dt;
 if(M.night(A.state)){if(visitor){visitor=null;hideSpeech();nextVisit=visible+45;}return;}
 if(visitor){visitor.age+=dt;$('workerSpeech').hidden=visitor.age<1.8||visitor.age>=8.4;if(visitor.age>=10){visitor=null;hideSpeech();nextVisit=visible+120+Math.random()*120;}}
 else if(!held&&visible>=nextVisit)startVisit();
}
function foreground(art,state,time){
 if(!visitor)return;
 const {ctx,W,H,person}=art,age=visitor.age,
   approach=clamp(age/2,0,1),leave=clamp((age-8.4)/1.6,0,1),t=approach*(1-leave),ease=t*t*(3-2*t),
   size=clamp(W/90,3.8,6.3),x=visitor.x+(W*.5-visitor.x)*ease,y=visitor.y+(H*.97-visitor.y)*ease;
 ctx.save();person(x,y,visitor.scale+(size-visitor.scale)*ease,age<2||age>8.4?time*10:0,visitor.id,false,false,false);ctx.restore();
}
$('speechClose').onclick=()=>{if(visitor){visitor.age=Math.max(visitor.age,8.4);hideSpeech()}};
document.addEventListener('visibilitychange',()=>{if(document.hidden){release(true);if(visitor){visitor=null;hideSpeech();nextVisit=visible+45;}}else void PyramidRumors.load();});
addEventListener('pagehide',()=>release(true));
globalThis.PyramidLife={pose,foreground,tick,reset};
void PyramidRumors.load();
})();
