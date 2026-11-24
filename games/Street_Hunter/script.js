/* Street_Hunter v0.5.13 | 2026-10-23 | LAB navigation + anonymous event counts */
globalThis.LabPageConfig={"game": "Street_Hunter", "version": "0.5.13"};globalThis.GAME_PUBLIC_URL="https://tsubasarock21.github.io/games/Street_Hunter/";globalThis.PICTO_PUBLIC_URL="https://tsubasarock21.github.io/games/Street_Hunter/";
/* Tsubasa_Rock_LAB shared navigation / anonymous counters v1.0.0 | 2026-10-23 */
if(globalThis.LabMetricsV2){globalThis.LabMetricsV2.install({game:"Street_Hunter",version:globalThis.LabPageConfig?.version||'unknown'});}else{(()=>{'use strict';
const tag=document.currentScript,game=globalThis.LabPageConfig?.game||tag?.dataset.game||'lab',version=globalThis.LabPageConfig?.version||tag?.dataset.version||'1.0.0';
const production=false;
const enabled=production&&location.protocol==='https:'&&!new URLSearchParams(location.search).has('no_metrics');
let run=null,lastShare=-Infinity,lastTime=performance.now(),seconds=0,paused=false,lastVisible=!document.hidden;
const payload=(event,extra={})=>({game,version,event,...extra});
function send(event,extra){if(!enabled)return;try{const data=JSON.stringify(payload(event,extra));if(navigator.sendBeacon?.(endpoint,new Blob([data],{type:'application/json'})))return;void fetch(endpoint,{method:'POST',body:data,headers:{'Content-Type':'application/json'},credentials:'omit',keepalive:true}).catch(()=>{});}catch{}}
function account(){const now=performance.now();if(run&&!paused&&lastVisible)seconds+=Math.max(0,Math.min(3600,(now-lastTime)/1000));lastTime=now;lastVisible=!document.hidden;}
function end(outcome='abandon'){if(!run)return;account();const details=run;run=null;send('end',{...details,outcome,seconds:Math.min(3600,Math.round(seconds))});}
function start(details={}){end();const stage=Number.isInteger(details.stage)?Math.max(0,Math.min(22,details.stage)):0;const mode=['trial','normal','easy','hard','extra','vertical','horizontal','endless','photo','sample','spin','puzzle'].includes(details.mode)?details.mode:'normal';run={stage,mode};seconds=0;paused=false;lastTime=performance.now();send('start',run);}
function pause(){account();paused=true;}function resume(){account();paused=false;lastTime=performance.now();}
const api=Object.freeze({start,end,pause,resume,language:label,share(){if(performance.now()-lastShare<800)return;lastShare=performance.now();send('share');},get active(){return !!run;}});globalThis.LabMetrics=api;
document.addEventListener('visibilitychange',()=>{account();});
// Do not treat an app switch as a finished run. Cached pages keep their in-memory run.
window.addEventListener('pagehide',e=>{account();if(!e.persisted)end();});
window.addEventListener('pageshow',()=>{lastTime=performance.now();});
function label(){if(!globalThis.document?.documentElement)return;const english=document.documentElement.lang.startsWith('en');document.querySelectorAll('[data-lab-return]').forEach(a=>{a.textContent=english?'← Back to LAB':'← ラボへ戻る';a.setAttribute('aria-label',english?'Back to Tsubasa_Rock_LAB':'Tsubasa_Rock_LABへ戻る');});}
function init(){label();new MutationObserver(label).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});document.addEventListener('click',e=>{const a=e.target.closest?.('[data-lab-return]');if(a)end();const share=e.target.closest?.('[data-lab-share],#share,#shareGame,#shareGameButton,#shareResultButton');if(share&&!share.disabled)api.share();},true);send('view');}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();}

/* 街角ハンター / TRANQUILIZER GUN / script.js / v0.5.13 */
(()=>{'use strict';
const $=s=>document.querySelector(s),canvas=$('#scene'),ctx=canvas.getContext('2d'),source=document.createElement('canvas'),art=document.createElement('canvas');
const sc=source.getContext('2d',{willReadFrequently:true}),ac=art.getContext('2d',{willReadFrequently:true});
const animals=new Set(['bird','cat','dog','horse','sheep','cow','elephant','bear','zebra','giraffe']);
const names={truck:'トラック',bus:'バス',person:'人',cat:'猫',dog:'犬',bird:'鳥',horse:'馬',chair:'椅子',bottle:'ボトル',car:'車',cup:'カップ',bench:'ベンチ',bicycle:'自転車'};
const S={loaded:false,busy:false,paused:false,mode:'pad',cx:0,cy:0,w:320,h:400,scale:1,targets:[],faces:[],holes:[],fx:[],keys:new Set(),last:0,time:0,lastShot:-10,loadId:0,manual:false,drag:null,base:null,gyro:null,demo:false};
let facePromise=null,segmentPromise=null,raf=0,modelWarning='',progressTimer=0,progressStart=0;

// Sharing: configure the final public URL after publishing.
const GAME_SHARE_URL = 'https://tsubasarock21.github.io/games/Street_Hunter/';
const GameShare=(()=>{
 let busy=false;
 function url(){for(const raw of [GAME_SHARE_URL,globalThis.GAME_PUBLIC_URL,document.querySelector('link[rel="canonical"]')?.href,location.href]){if(!raw)continue;try{const u=new URL(raw,location.href);if(!/^https?:$/.test(u.protocol)||/^(localhost|127\.0\.0\.1)$/.test(u.hostname)||/(^|\.)(cdpn\.io|codepen\.io|codepenassets\.com)$/.test(u.hostname))continue;u.search='';u.hash='';return u.href}catch{}}return ''}
 function build(body,tags){return [body,url(),tags.map(t=>'#'+t).join(' ')].filter(Boolean).join('\n')}
 function note(){return '共有先を選べます。対応していない場合は文章をコピーします。'}
 function manualCopy(text,status){
  const oldFocus=document.activeElement,panel=document.createElement('dialog');panel.setAttribute('aria-label','シェアする文章');panel.style.cssText='position:fixed;inset:0;margin:auto;width:min(90vw,420px);max-height:85dvh;overflow:auto;z-index:9999;background:#fffaf0;color:#18382f;border:2px solid #54796b;border-radius:14px;padding:20px;font:14px sans-serif;touch-action:auto;';
  const label=document.createElement('p');label.textContent='文章をコピーして、好きなアプリに貼り付けてください。';
  const field=document.createElement('textarea');field.readOnly=true;field.value=text;field.setAttribute('aria-label','シェア用文章');field.style.cssText='display:block;width:100%;min-height:180px;font:14px sans-serif;color:#18382f;background:#fff;border:1px solid #a4b5aa;padding:10px;box-sizing:border-box;user-select:text;-webkit-user-select:text;touch-action:auto;';
  const copy=document.createElement('button');copy.textContent='文章をコピー';copy.style.cssText='min-height:44px;margin:12px 10px 0 0;padding:8px 14px;border-radius:8px;';
  const close=document.createElement('button');close.textContent='閉じる';close.style.cssText='min-height:44px;padding:8px 14px;border-radius:8px;';
  function remove(){panel.remove();oldFocus?.focus?.()}
  copy.onclick=async()=>{try{if(!navigator.clipboard?.writeText)throw Error('unavailable');await navigator.clipboard.writeText(text);copy.textContent='コピーしました';if(status)status.textContent='文章をコピーしました。好きなアプリに貼り付けられます。'}catch{field.focus();field.select();field.setSelectionRange(0,text.length);copy.textContent='文章を長押ししてコピー'}};
  close.onclick=remove;panel.addEventListener('cancel',e=>{e.preventDefault();remove()});panel.append(label,field,copy,close);document.body.append(panel);if(typeof panel.showModal==='function')panel.showModal();else panel.setAttribute('open','');field.focus();field.select();
 }
 async function share(text,{title=document.title,status=null}={}){
  if(!text||busy)return 'busy';busy=true;
  try{
   if(navigator.share){try{await navigator.share({title,text});if(status)status.textContent='共有操作が完了しました。';return 'shared'}catch(error){if(error?.name==='AbortError'){if(status)status.textContent='シェアをキャンセルしました。';return 'cancelled'}}}
   try{if(!navigator.clipboard?.writeText)throw Error('unavailable');await navigator.clipboard.writeText(text);if(status)status.textContent='文章をコピーしました。好きなアプリに貼り付けられます。';return 'copied'}catch{manualCopy(text,status);if(status)status.textContent='文章を長押ししてコピーできます。';return 'manual'}
  }finally{busy=false}
 }
 return {url,build,note,share};
})();globalThis.GameShare=GameShare;


S.shareStats={shots:0,hits:0,targets:0};let sharedTargets=new WeakSet();
function resetShareStats(){S.shareStats={shots:0,hits:0,targets:0};sharedTargets=new WeakSet();$('#shareNote').textContent=''}
function updateShareButton(){const b=$('#shareGame');if(b)b.disabled=!S.loaded||S.busy}
function shareText(){return GameShare.build('いつもの写真が、ゆるい射的ゲームに。\n街角ハンター｜ぽすっと撃って、Zzz。\n命中した対象：'+S.shareStats.targets+'体／合計命中：'+S.shareStats.hits+'回',["街角ハンター", "写真ゲーム", "自作ゲーム", "個人開発", "ブラウザゲーム"])}
$('#shareGame').onclick=()=>{if(!S.loaded||S.busy)return;$('#shareNote').textContent=GameShare.note();void GameShare.share(shareText(),{status:$('#shareNote')})};
S.zoom=1;S.photoBusy=false;
S.visitors=[];S.nextCat=5;S.nextSpider=2;
function activeTargets(){return [...S.targets,...S.visitors]}
function resetVisitors(){S.visitors=[];S.nextCat=S.time+5;S.nextSpider=S.time+2;renderTargetList()}
const visitorSprites=new Map();
function sprite(kind,frame){
 const key=kind+frame;if(visitorSprites.has(key))return visitorSprites.get(key);
 const c=document.createElement('canvas');c.width=128;c.height=88;const p=c.getContext('2d');
 p.lineCap='round';p.lineJoin='round';p.strokeStyle='#48483e';p.lineWidth=5;
 const ellipse=(x,y,rx,ry,col)=>{p.fillStyle=col;p.beginPath();p.ellipse(x,y,rx,ry,0,0,Math.PI*2);p.fill()};
 if(kind==='cat'){
  p.strokeStyle='#8c826c';p.lineWidth=9;p.beginPath();p.moveTo(30,48);p.bezierCurveTo(2,54,9,22,18,20);p.stroke();
  p.strokeStyle='#605b4d';p.lineWidth=8;const stride=Math.sin(frame*Math.PI/2)*11;
  for(let i=0;i<4;i++){const x=40+i*12,offset=i%2?stride:-stride;p.beginPath();p.moveTo(x,52);p.lineTo(x+offset,72-(i%2)*4);p.stroke()}
  ellipse(57,44,34,19,'#91866e');ellipse(90,35,20,19,'#9e9279');
  p.fillStyle='#9e9279';p.beginPath();p.moveTo(75,22);p.lineTo(77,5);p.lineTo(90,20);p.lineTo(98,18);p.lineTo(110,8);p.lineTo(108,32);p.fill();
  p.strokeStyle='#6d6656';p.lineWidth=4;p.beginPath();p.moveTo(42,31);p.lineTo(47,42);p.moveTo(55,27);p.lineTo(59,39);p.moveTo(68,29);p.lineTo(70,39);p.stroke();
  ellipse(99,34,2,2,'#42483e');ellipse(109,41,2.5,2,'#66594c');
 }else{
  const step=frame%2?5:-5;p.strokeStyle='#4f5147';p.lineWidth=3;
  for(let side of [-1,1])for(let i=0;i<4;i++){p.beginPath();p.moveTo(64+side*7,42+i*3);p.lineTo(64+side*(23+i*2),24+i*12+step*(i%2?1:-1));p.lineTo(64+side*(42-i*2),19+i*17);p.stroke()}
  ellipse(64,47,12,18,'#57584a');ellipse(64,29,8,9,'#646351');ellipse(62,26,1.2,1.2,'#b7b79a');ellipse(67,26,1.2,1.2,'#b7b79a');
 }
 visitorSprites.set(key,c);return c;
}
function spawnVisitor(type){
 if(S.visitors.some(t=>t.visitor===type))return;
 const size=clamp(Math.min(source.width,source.height)*.12,14,76),left=Math.random()<.5;
 const t={visitor:type,kind:'animal',label:type==='cat'?'ネコ':'クモ',hits:0,hitTime:-20,asleepUntil:0,born:S.time,phase:type==='cat'?'run':'down',w:size,h:size*.69,dir:left?1:-1};
 if(type==='cat'){t.x=left?-size:source.width;t.y=clamp(S.cy+(Math.random()-.5)*S.h/S.scale*.6,0,Math.max(0,source.height-t.h));t.vx=t.dir*source.width*.22;t.vy=(Math.random()-.5)*source.height*.11;t.turn=S.time+1.2+Math.random()*1.5;t.leave=S.time+8+Math.random()*5}
 else{t.w=size*.8;t.x=clamp(S.cx+(Math.random()-.5)*S.w/S.scale*.7,0,source.width-t.w);t.y=-t.h;t.destination=clamp(S.cy+(Math.random()-.5)*S.h/S.scale*.35,source.height*.18,source.height*.8);t.anchorX=t.x+t.w/2;t.wait=1.5+Math.random()*2.5}
 S.visitors.push(t);renderTargetList();return t;
}
function updateVisitors(dt){
 if(S.time>=S.nextCat&&!S.visitors.some(t=>t.visitor==='cat')){spawnVisitor('cat');S.nextCat=Infinity}
 if(S.time>=S.nextSpider&&!S.visitors.some(t=>t.visitor==='spider')){spawnVisitor('spider');S.nextSpider=Infinity}
 let changed=false;
 for(const t of S.visitors){
  if(t.phase==='sleep'){if(S.time<t.asleepUntil)continue;t.phase='leave'}
  if(t.visitor==='spider'){
   if(t.phase==='down'){t.y+=source.height*.19*dt;if(t.y>=t.destination){t.y=t.destination;t.phase='wait';t.until=S.time+t.wait}}
   else if(t.phase==='wait'){if(S.time>=t.until)t.phase='leave'}
   else if(t.phase==='leave'){t.y-=source.height*.8*dt;if(t.y < -t.h-2)t.remove=true}
  }else{
   if(t.phase==='run'&&S.time>=t.leave)t.phase='leave';
   if(t.phase==='run'&&S.time>=t.turn){const toCentre=t.x<source.width*.15?1:t.x>source.width*.85?-1:Math.random()<.5?-1:1;t.vx=toCentre*source.width*(.13+Math.random()*.19);t.vy=(Math.random()-.5)*source.height*.22;t.turn=S.time+.7+Math.random()*1.7;t.stopUntil=S.time+(Math.random()<.3?.35:0)}
   if(t.phase==='leave'){t.vx=(t.x<source.width/2?-1:1)*source.width*.35;t.vy=0}
   if(S.time>=(t.stopUntil||0)){t.x+=t.vx*dt;t.y=clamp(t.y+t.vy*dt,0,Math.max(0,source.height-t.h));t.dir=t.vx>0?1:-1}
   if(t.phase==='run'){t.x=clamp(t.x,-t.w,source.width)}
   if(t.phase==='leave'&&(t.x<-t.w-2||t.x>source.width+2))t.remove=true;
  }
  if(t.remove){changed=true;if(t.visitor==='cat')S.nextCat=S.time+7+Math.random()*8;else S.nextSpider=S.time+6+Math.random()*9}
 }
 if(changed){S.visitors=S.visitors.filter(t=>!t.remove);renderTargetList()}
}
function drawVisitors(){
 ctx.save();ctx.beginPath();ctx.rect(0,0,source.width,source.height);ctx.clip();
 for(const t of S.visitors){
  const age=S.time-t.hitTime,shake=age>=0&&age<.65?Math.sin(age*48)*5*(1-age/.65)/S.scale:0;
  const sway=t.visitor==='spider'?Math.sin((S.time-t.born)*2)*t.w*.07:0;
  if(t.visitor==='spider'){ctx.strokeStyle='#66694e99';ctx.lineWidth=.85/S.scale;ctx.beginPath();ctx.moveTo(t.anchorX,0);ctx.lineTo(t.x+t.w/2+sway+shake,t.y+t.h*.3);ctx.stroke()}
  ctx.save();ctx.globalAlpha=.9;ctx.filter=`blur(${Math.min(.7/S.scale,1.4)}px)`;
  ctx.translate(t.x+t.w/2+sway+shake,t.y+t.h/2);if(t.visitor==='cat')ctx.scale(t.dir,1);
  const frame=t.phase==='sleep'?0:Math.floor(S.time*(t.visitor==='cat'?11:5))%4;
  ctx.drawImage(sprite(t.visitor,frame),-t.w/2,-t.h/2,t.w,t.h);ctx.restore();
 }ctx.restore();
}
// Photo preparation starts immediately; page banners never gate gameplay.
function syncBusy(){S.busy=S.photoBusy;updateShareButton();$('#processing').hidden=!S.photoBusy}
function preparePhoto(file){if(file)void readPhoto(file)}

function progress(title,detail){if(!S.busy)progressStart=Date.now();S.photoBusy=true;S.busy=true;$('#processing').hidden=false;$('#processingTitle').textContent=title;$('#processingDetail').textContent=detail;$('#skipProcessing').disabled=!S.loaded;clearInterval(progressTimer);const tick=()=>$('#processingElapsed').textContent=`${Math.floor((Date.now()-progressStart)/1000)}秒経過 · 初回のAI準備は時間がかかります`;tick();progressTimer=setInterval(tick,1000)}
function endProgress(){S.photoBusy=false;clearInterval(progressTimer);syncBusy()}
const breathe=()=>new Promise(r=>setTimeout(r,35));
function say(t){$('#status').textContent=t;renderTargetList()}
function renderTargetList(){updateShareButton();
 const list=$('#targetList');if(!list)return;list.replaceChildren();
 const targets=activeTargets();$('#targetCount').textContent=`対象 ${targets.length} · 命中 ${targets.filter(t=>t.hits>0).length}`;
 if(!targets.length){const empty=document.createElement('li');empty.className='target-empty';empty.textContent=S.busy?'認識中…':'対象はまだありません';list.append(empty);return}
 targets.forEach((t,i)=>{const li=document.createElement('li');li.className=t.hits?'target-hit':'';const name=document.createElement('span'),badge=document.createElement('b');name.textContent=t.visitor?t.label:`${i+1}. ${t.label}`;name.title=t.label;badge.textContent=t.hits?`命中 ${t.hits}回`:'未命中';li.append(name,badge);list.append(li)});
}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function fit(){const r=$('#viewport').getBoundingClientRect();S.w=Math.max(1,r.width);S.h=Math.max(1,r.height);const dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.round(S.w*dpr);canvas.height=Math.round(S.h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);if(S.loaded)S.scale=Math.max(S.w/art.width,S.h/art.height)*1.22*S.zoom;render()}
function toWorld(x,y){return {x:S.cx+(x-S.w/2)/S.scale,y:S.cy+(y-S.h/2)/S.scale}}
function point(e){const r=canvas.getBoundingClientRect();return toWorld(e.clientX-r.left,e.clientY-r.top)}
function setPaused(v){if(v)globalThis.LabMetrics?.pause();else globalThis.LabMetrics?.resume();S.paused=v;S.keys.clear();$('#reticle').hidden=!S.loaded||S.manual}
function updateZoom(value){S.zoom=clamp(value,.6,4);S.scale=Math.max(S.w/art.width,S.h/art.height)*1.22*S.zoom;$('#zoomIndicator').textContent=S.zoom.toFixed(1)+'×';S.base=null;S.gyro=null}
function home(){globalThis.LabMetrics?.end();resetShareStats();S.loadId++;stopCutoutWorker();gyroToken++;endProgress();S.loaded=false;$('#retryRecognition').hidden=true;S.visitors=[];S.manual=false;S.drag=null;S.targets=[];S.faces=[];S.fx=[];S.holes=[];S.mode='pad';S.base=S.gyro=null;S.zoom=1;S.keys.clear();gestures.clear();pinch=null;pan=null;clearFirePointers();$('#intro').hidden=false;$('#reticle').hidden=true;$('#settings').open=false;$('#zoomIndicator').textContent='1.0×';$('#modeLabel').textContent='PAD';say('写真を選ぶと漫画風のステージになります')}
let shotContext=null;
async function shotSound(){try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;if(!shotContext||shotContext.state==='closed')shotContext=new Audio();const a=shotContext;if(a.state!=='running')await a.resume();const buffer=a.createBuffer(1,Math.floor(a.sampleRate*.13),a.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1);const noise=a.createBufferSource(),filter=a.createBiquadFilter(),gain=a.createGain();noise.buffer=buffer;filter.type='bandpass';filter.frequency.setValueAtTime(2500,a.currentTime);filter.frequency.exponentialRampToValueAtTime(700,a.currentTime+.12);filter.Q.value=.8;gain.gain.setValueAtTime(.0001,a.currentTime);gain.gain.linearRampToValueAtTime(.12,a.currentTime+.012);gain.gain.exponentialRampToValueAtTime(.0001,a.currentTime+.13);noise.connect(filter);filter.connect(gain);gain.connect(a.destination);noise.onended=()=>{noise.disconnect();filter.disconnect();gain.disconnect()};noise.start();noise.stop(a.currentTime+.14)}catch{}}
function loadScript(url){return new Promise((resolve,reject)=>{const tag=document.createElement('script');tag.src=url;tag.crossOrigin='anonymous';const timer=setTimeout(()=>{tag.remove();reject(Error('AI読み込みタイムアウト'))},25000);tag.onload=()=>{clearTimeout(timer);resolve()};tag.onerror=()=>{clearTimeout(timer);reject(Error('AIを読み込めませんでした'))};document.head.append(tag)})}
function timeout(p,ms=45000){return new Promise((resolve,reject)=>{const t=setTimeout(()=>reject(Error('AI解析が時間内に完了しませんでした')),ms);p.then(v=>{clearTimeout(t);resolve(v)},e=>{clearTimeout(t);reject(e)})})}
let tensorflowPromise=null;
async function ensureTensorflow(){
 if(!tensorflowPromise)tensorflowPromise=(async()=>{
  if(!window.tf)await loadScript('vendor/tf.min.js?v=0.5.13');
  try{if(/iPad|iPhone|iPod/.test(navigator.userAgent||'')||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1))await window.tf.setBackend('cpu');await window.tf.ready()}catch{await window.tf.setBackend('cpu');await window.tf.ready()}
  return window.tf;
 })().catch(e=>{tensorflowPromise=null;throw e});
 return tensorflowPromise;
}
// Real JSON-encoded weight chunks: compatible with the Lab static-file uploader.
// An explicit IOHandler decodes them for TensorFlow; no extension-only renaming.
function jsonWeightModel(manifestPath){return {load:async()=>{
 const url=new URL(manifestPath,document.baseURI);
 async function readJson(path){const response=await fetch(path);if(!response.ok)throw Error('認識データを読み込めません（HTTP '+response.status+'）');return response.json()}
 const model=await readJson(url.href);if(model.storageEncoding!=='base64-json')throw Error('モデルデータの形式が一致しません');
 const parts=[],specs=[];let total=0;
 for(const group of model.weightsManifest){
  specs.push(...group.weights);
  for(const name of group.paths){
   const value=await readJson(new URL(name,url).href);
   if(value.encoding!=='base64'||typeof value.data!=='string'||!Number.isSafeInteger(value.byteLength)||value.byteLength<0||value.byteLength>4*1024*1024)throw Error('認識データの形式が正しくありません');
   const text=atob(value.data);if(text.length!==value.byteLength)throw Error('認識データのサイズが一致しません');
   const bytes=new Uint8Array(text.length);for(let i=0;i<text.length;i++)bytes[i]=text.charCodeAt(i);
   total+=bytes.length;if(total>48*1024*1024)throw Error('モデルデータが大きすぎます');parts.push(bytes);
   await new Promise(resolve=>setTimeout(resolve,0));
  }
 }
 const data=new Uint8Array(total);let offset=0;for(const part of parts){data.set(part,offset);offset+=part.length}
 return {...model,modelTopology:model.modelTopology,weightSpecs:specs,weightData:data.buffer};
}}}
const detectorLoads=new Map();
function getDetector(base='mobilenet_v2'){
 if(!detectorLoads.has(base))detectorLoads.set(base,(async()=>{
  await ensureTensorflow();
  if(!window.cocoSsd)await loadScript('vendor/coco-ssd.min.js?v=0.5.13');
  return window.cocoSsd.load(base==='mobilenet_v2'?{base,modelUrl:jsonWeightModel('models/detector/model.json')}:{base});
 })().catch(e=>{detectorLoads.delete(base);throw e}));
 return detectorLoads.get(base);
}
async function detectWithRecovery(id,input,issues){
 let model;
 try{model=await timeout(getDetector(),90000)}
 catch(e){if(id!==S.loadId)throw e;issues.push('標準モデルの準備：'+aiError(e));
  progress('軽量モデルで再試行中','標準モデルを準備できなかったため、別のモデルで探しています');
  const tf=await ensureTensorflow();if(id!==S.loadId)return [];await tf.setBackend('cpu');await tf.ready();if(id!==S.loadId)return [];
  model=await timeout(getDetector('lite_mobilenet_v2'),45000);
 }
 if(id!==S.loadId)return [];
 try{return await detectScene(id,model,input)}
 catch(e){if(id!==S.loadId)throw e;
  const tf=await ensureTensorflow();if(tf.getBackend()==='cpu')throw e;
  issues.push('GPU解析：'+aiError(e));progress('別の方法で認識を再試行中','端末の画像処理機能を使わずに解析しています');await breathe();if(id!==S.loadId)return [];
  await tf.setBackend('cpu');await tf.ready();return await detectScene(id,model,input);
 }
}
function aiError(e){return String(e?.message||e||'原因不明').replace(/https?:\/\/[^\s]+/g,'[配信先]').slice(0,180)}
function getFaceDetector(){
 if(!facePromise)facePromise=(async()=>{await ensureTensorflow();
  if(!window.faceDetection)await loadScript('vendor/face-detection.min.js?v=0.5.13');
  return window.faceDetection.createDetector(window.faceDetection.SupportedModels.MediaPipeFaceDetector,{runtime:'tfjs',maxFaces:10,modelType:'short'});
 })().catch(e=>{facePromise=null;throw e});return facePromise;
}
function getSegmenter(){if(!segmentPromise)segmentPromise=(async()=>{await ensureTensorflow();if(!window.bodyPix&&!window['body-pix'])await loadScript('vendor/body-pix.min.umd.js?v=0.5.13');const body=window.bodyPix||window['body-pix'];if(!body?.load)throw Error('人物用ライブラリを初期化できません');return body.load({architecture:'MobileNetV1',outputStride:16,multiplier:.75,quantBytes:1,modelUrl:jsonWeightModel('models/people/model.json')})})().catch(e=>{segmentPromise=null;throw e});return segmentPromise}
function buildCutout(t,mask,box=t){
 const width=Math.ceil(box.w),height=Math.ceil(box.h);if(mask.width!==width||mask.height!==height){t.cutoutReason='輪郭サイズが一致しません';return false}
 const count=mask.data.reduce((n,v)=>n+(v===1),0);if(count<width*height*.025||count>width*height*.995){t.cutoutReason='輪郭を十分に判別できません';return false}
 const matte=document.createElement('canvas');matte.width=width;matte.height=height;const mc=matte.getContext('2d'),pixels=mc.createImageData(width,height);
 for(let i=0;i<mask.data.length;i++){pixels.data[i*4]=pixels.data[i*4+1]=pixels.data[i*4+2]=255;pixels.data[i*4+3]=mask.data[i]===1?255:0}mc.putImageData(pixels,0,0);
 t.mask=matte;t.maskData=mask.data;t.cutBox={x:box.x,y:box.y,w:box.w,h:box.h};t.cutoutReason='切り抜き成功';refreshCutout(t);return true;
}
function refreshCutout(t){if(!t.mask)return;const cut=document.createElement('canvas');cut.width=t.mask.width;cut.height=t.mask.height;const b=t.cutBox||t,c=cut.getContext('2d');c.drawImage(art,b.x,b.y,b.w,b.h,0,0,cut.width,cut.height);c.globalCompositeOperation='destination-in';c.drawImage(t.mask,0,0);t.cutout=cut;t.hitAlpha=t.mask.getContext('2d').getImageData(0,0,t.mask.width,t.mask.height).data;makeBackfill(t)}
// ---- 人物の切り抜き（v0.5.13）----
// 1) 写真全体で人物を個別に分離 2) 各人物を拡大して再推論 3) 他の人を除外し、連結成分の選別・穴埋め・ソフトエッジ
function regionsOf(m,w,h,want){
 const lab=new Int32Array(w*h).fill(-1),areas=[],stack=new Int32Array(w*h);let n=0;
 for(let s=0;s<m.length;s++){if(m[s]!==want||lab[s]>=0)continue;
  let sp=0,area=0;stack[sp++]=s;lab[s]=n;
  while(sp){const p=stack[--sp];area++;const x=p%w,y=(p/w)|0;
   if(x>0&&m[p-1]===want&&lab[p-1]<0){lab[p-1]=n;stack[sp++]=p-1}
   if(x<w-1&&m[p+1]===want&&lab[p+1]<0){lab[p+1]=n;stack[sp++]=p+1}
   if(y>0&&m[p-w]===want&&lab[p-w]<0){lab[p-w]=n;stack[sp++]=p-w}
   if(y<h-1&&m[p+w]===want&&lab[p+w]<0){lab[p+w]=n;stack[sp++]=p+w}}
  areas.push(area);n++}
 return {lab,areas};
}
function cleanMask(m,w,h,tb){
 const fg=regionsOf(m,w,h,1),n=fg.areas.length;if(!n)return null;
 const ins=new Float64Array(n),x0=clamp(Math.floor(tb.x0),0,w),x1=clamp(Math.ceil(tb.x1),0,w),y0=clamp(Math.floor(tb.y0),0,h),y1=clamp(Math.ceil(tb.y1),0,h);
 for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const l=fg.lab[y*w+x];if(l>=0)ins[l]++}
 let best=0;for(let i=1;i<n;i++)if(ins[i]>ins[best])best=i;if(ins[best]<=0)return null;
 const keep=new Uint8Array(n);for(let i=0;i<n;i++)keep[i]=i===best||(ins[i]>=fg.areas[i]*.5&&ins[i]>=ins[best]*.06)?1:0;
 const out=new Uint8Array(m.length);for(let p=0;p<m.length;p++)if(fg.lab[p]>=0&&keep[fg.lab[p]])out[p]=1;
 const bg=regionsOf(out,w,h,0),edge=new Uint8Array(bg.areas.length),limit=w*h*.004;
 for(let x=0;x<w;x++){edge[bg.lab[x]]=1;edge[bg.lab[(h-1)*w+x]]=1}
 for(let y=0;y<h;y++){edge[bg.lab[y*w]]=1;edge[bg.lab[y*w+w-1]]=1}
 for(let p=0;p<out.length;p++){const l=bg.lab[p];if(l>=0&&!edge[l]&&bg.areas[l]<limit)out[p]=1}
 return out;
}
function boxIou(a,b){const w=Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x),h=Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y);if(w<=0||h<=0)return 0;const i=w*h;return i/(a.w*a.h+b.w*b.h-i)}
// 写真全体の人物インスタンスを、COCOの人物の四角に1対1で対応づける
function matchInstances(people,inst){
 for(const o of inst){let x0=o.w,y0=o.h,x1=0,y1=0,a=0;for(let i=0;i<o.data.length;i++)if(o.data[i]){const x=i%o.w,y=(i/o.w)|0;if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;a++}
  o.area=a;o.box=a?{x:x0*o.k,y:y0*o.k,w:(x1-x0+1)*o.k,h:(y1-y0+1)*o.k}:null}
 const pairs=[];people.forEach((t,ti)=>inst.forEach((o,oi)=>{if(o.box){const v=boxIou(t,o.box);if(v>.3)pairs.push([v,ti,oi])}}));
 pairs.sort((a,b)=>b[0]-a[0]);const usedT=new Set(),usedO=new Set();
 for(const [,ti,oi] of pairs){if(usedT.has(ti)||usedO.has(oi))continue;usedT.add(ti);usedO.add(oi);people[ti].inst=oi}
 return usedO;
}
async function cutoutPerson(id,net,input,t,inst,deadline){
 const mg=.22,bx=Math.max(0,Math.floor(t.x-t.w*mg)),by=Math.max(0,Math.floor(t.y-t.h*mg));
 const bw=Math.min(input.width,Math.ceil(t.x+t.w*(1+mg)))-bx,bh=Math.min(input.height,Math.ceil(t.y+t.h*(1+mg)))-by;
 if(bw<8||bh<8){t.cutoutReason='範囲が小さすぎます';return false}
 // 小さい人は拡大して推論（遠くの人を切り抜けるように）
 const long=Math.max(bw,bh),s=long<448?Math.min(4,448/long):Math.min(1,896/long),cw=Math.max(8,Math.round(bw*s)),ch=Math.max(8,Math.round(bh*s));
 const crop=document.createElement('canvas');crop.width=cw;crop.height=ch;const cc=crop.getContext('2d');cc.imageSmoothingQuality='high';cc.drawImage(input,bx,by,bw,bh,0,0,cw,ch);
 // 他の人に属する画素を記録（自分の分は mine）
 const other=new Uint8Array(cw*ch),mine=new Uint8Array(cw*ch);
 for(let y=0;y<ch;y++)for(let x=0;x<cw;x++){const p=y*cw+x;
  for(let j=0;j<inst.length;j++){const o=inst[j],ix=Math.min(o.w-1,Math.floor((bx+x/s)/o.k)),iy=Math.min(o.h-1,Math.floor((by+y/s)/o.k));
   if(o.data[iy*o.w+ix]){if(j===t.inst)mine[p]=1;else other[p]=1}}}
 const tb={x0:(t.x-bx)*s,y0:(t.y-by)*s,x1:(t.x+t.w-bx)*s,y1:(t.y+t.h-by)*s},total=cw*ch;
 const ok=c=>{if(!c)return false;let n=0;for(let p=0;p<c.length;p++)n+=c[p];return n>=total*.025&&n<=total*.995};
 let clean=t.inst!=null?cleanMask(mine,cw,ch,tb):null;
 if(!ok(clean))clean=null;
 for(const th of [.6,.45,.3]){
  if(clean||Date.now()>deadline)break;
  const seg=await timeout(net.segmentPerson(crop,{internalResolution:'high',segmentationThreshold:th,maxDetections:1}),20000);if(id!==S.loadId)return;
  const m=new Uint8Array(total);for(let p=0;p<total;p++)m[p]=seg.data[p]===1&&(t.inst==null||!other[p]||mine[p])?1:0;
  const c=cleanMask(m,cw,ch,tb);if(ok(c)){clean=c;break}
 }
 if(!clean&&t.inst!=null){const c=cleanMask(mine,cw,ch,tb);if(ok(c))clean=c}
 if(!clean){t.cutoutReason='輪郭を十分に判別できません';return false}
 const al=document.createElement('canvas');al.width=cw;al.height=ch;const ac2=al.getContext('2d'),im=ac2.createImageData(cw,ch);
 for(let p=0;p<total;p++){const q=p*4;im.data[q]=im.data[q+1]=im.data[q+2]=255;im.data[q+3]=clean[p]?255:0}ac2.putImageData(im,0,0);
 const matte=document.createElement('canvas');matte.width=bw;matte.height=bh;const mc=matte.getContext('2d');mc.imageSmoothingQuality='high';mc.filter='blur(0.6px)';mc.drawImage(al,0,0,bw,bh);
 t.mask=matte;t.maskData=null;t.cutBox={x:bx,y:by,w:bw,h:bh};t.cutoutReason='切り抜き成功';refreshCutout(t);return true;
}
async function segmentPeople(id,input,issues=[]){
 progress('人物の輪郭を切り抜き中','人物用AIを準備しています。この後、人・動物・物の輪郭も確認します。');await breathe();
 try{const net=await timeout(getSegmenter(),30000);if(id!==S.loadId)return;
  // 写真全体で人物を個別に分離（隣の人の除外と、検出漏れの人物の追加に使う）
  let inst=[];
  try{progress('人物の輪郭を切り抜き中','写真全体の人物を分けています。');await breathe();if(id!==S.loadId)return;
   const sc=Math.min(1,1024/Math.max(input.width,input.height));let src=input;
   if(sc<1){src=document.createElement('canvas');src.width=Math.round(input.width*sc);src.height=Math.round(input.height*sc);src.getContext('2d').drawImage(input,0,0,src.width,src.height)}
   const res=await timeout(net.segmentMultiPerson(src,{internalResolution:'medium',segmentationThreshold:.6,maxDetections:12,scoreThreshold:.25,nmsRadius:24}),30000);if(id!==S.loadId)return;
   inst=res.map(r=>({data:r.data,w:r.width,h:r.height,k:input.width/r.width,score:(r.pose&&r.pose.score)||0}));
  }catch(e){inst=[];issues.push('人物の位置検出：'+aiError(e))}
  const people=S.targets.filter(t=>t.kind==='person');const used=matchInstances(people,inst);
  inst.forEach((o,oi)=>{if(used.has(oi)||!o.box||o.score<.3||o.area*o.k*o.k<input.width*input.height*.001||people.length>=16)return;
   const b=o.box,t=makeTarget([b.x,b.y,b.w,b.h],'person',names.person);t.inst=oi;S.targets.push(t);people.push(t)});
  people.sort((a,b)=>b.w*b.h-a.w*a.h);
  if(!people.length)return;
  const list=people.slice(0,16),deadline=Date.now()+60000;
  for(let i=0;i<list.length;i++){if(id!==S.loadId)return;const t=list[i];
   progress('人物の輪郭を切り抜き中',`${i+1} / ${list.length}人 · 髪や服の境界を確認しています`);await breathe();if(id!==S.loadId)return;
   if(Date.now()>deadline){t.cutoutReason='時間切れ';continue}
   try{await cutoutPerson(id,net,input,t,inst,deadline)}catch{t.cutoutReason='輪郭処理に失敗しました'}
  }
 }catch(e){if(id===S.loadId)issues.push('人物の輪郭処理：'+aiError(e))}
}
function comicPixels(data,w,h){
 // Two edge-aware smoothing passes remove photographic grain without smearing silhouettes.
 let smooth=new Uint8ClampedArray(data);const weights=new Float32Array(766);
 for(let i=0;i<weights.length;i++)weights[i]=Math.exp(-i*i/(2*62*62));
 for(let pass=0;pass<2;pass++){
  const next=new Uint8ClampedArray(data.length);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
   const at=(y*w+x)*4,r=smooth[at],g=smooth[at+1],b=smooth[at+2];let sr=0,sg=0,sb=0,total=0;
   for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
    const j=(clamp(y+dy,0,h-1)*w+clamp(x+dx,0,w-1))*4;
    const difference=Math.abs(r-smooth[j])+Math.abs(g-smooth[j+1])+Math.abs(b-smooth[j+2]);
    const weight=weights[difference]*(dx===0&&dy===0?2:dx===0||dy===0?1:.65);
    sr+=smooth[j]*weight;sg+=smooth[j+1]*weight;sb+=smooth[j+2]*weight;total+=weight;
   }
   next[at]=sr/total;next[at+1]=sg/total;next[at+2]=sb/total;next[at+3]=255;
  }smooth=next;
 }
 const lum=new Float32Array(w*h),out=new Uint8ClampedArray(data.length);
 for(let i=0;i<lum.length;i++)lum[i]=smooth[i*4]*.299+smooth[i*4+1]*.587+smooth[i*4+2]*.114;
 const L=(x,y)=>lum[clamp(y,0,h-1)*w+clamp(x,0,w-1)];
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const i=(y*w+x)*4,l=lum[y*w+x];
  // Broad shadow/midtone/highlight bands, retaining the original hue.
  const level=l<54?38:l<108?83:l<163?139:l<214?192:235;
  const light=l*.18+level*.82,ratio=light/Math.max(15,l);
  const gx=-L(x-1,y-1)+L(x+1,y-1)-2*L(x-1,y)+2*L(x+1,y)-L(x-1,y+1)+L(x+1,y+1);
  const gy=-L(x-1,y-1)-2*L(x,y-1)-L(x+1,y-1)+L(x-1,y+1)+2*L(x,y+1)+L(x+1,y+1);
  const edge=Math.sqrt(gx*gx+gy*gy)/4,ink=clamp((edge-30)/70,0,.83);
  for(let k=0;k<3;k++){const colour=(l+(smooth[i+k]-l)*1.12)*ratio;out[i+k]=clamp((colour* .98+5)*(1-ink)+[30,37,43][k]*ink,0,255)}
  out[i+3]=255;
 }return out;
}
function paintComic(){
 if(!source.width)return;art.width=source.width;art.height=source.height;
 const img=sc.getImageData(0,0,source.width,source.height);img.data.set(comicPixels(img.data,source.width,source.height));ac.putImageData(img,0,0);
 if($('#simplify').checked)for(const face of S.faces)simplifyFace(face);
 for(const t of S.targets)refreshCutout(t);
}
// Small skin-colour patches leave most accessory outlines intact, but are NOT semantic accessory segmentation.
function simplifyFace(face){
 const pts=Object.fromEntries(face.keypoints.map(p=>[p.name,p]));const a=pts.rightEye,b=pts.leftEye,n=pts.noseTip;if(!a||!b||!n)return;
 const dist=Math.hypot(a.x-b.x,a.y-b.y);if(dist<8)return;
 const mid={x:(a.x+b.x)/2,y:(a.y+b.y)/2};
 const sample=(x,y)=>{const d=sc.getImageData(clamp(Math.round(x),0,source.width-1),clamp(Math.round(y),0,source.height-1),1,1).data;return [...d].slice(0,3)};
 const skin=sample(mid.x,mid.y-dist*.32);const col=Array.from(comicPixels(new Uint8ClampedArray([...skin,255]),1,1)).slice(0,3);
 ac.fillStyle=`rgb(${col.join(',')})`;
 for(const p of [a,b]){ac.beginPath();ac.ellipse(p.x,p.y,dist*.13,dist*.09,0,0,Math.PI*2);ac.fill()}
 const nose=sample(n.x,n.y),delta=nose.reduce((t,v,i)=>t+Math.abs(v-skin[i]),0);
 if(delta<110){ac.beginPath();ac.ellipse(n.x,n.y,dist*.13,dist*.16,0,0,Math.PI*2);ac.fill()}
}
function makeTarget(box,kind,label){const [x,y,w,h]=box;return {x:clamp(x,0,source.width),y:clamp(y,0,source.height),w:Math.min(w,source.width-x),h:Math.min(h,source.height-y),kind,label,asleepUntil:0,hitTime:-20,hits:0}}
// A single reusable worker; cancellation releases GPU/WASM and prevents late image writes.
let cutoutWorker=null,cutoutRequest=0,cutoutPending=null;
function stopCutoutWorker(){if(cutoutWorker)cutoutWorker.terminate();cutoutWorker=null;if(cutoutPending){clearTimeout(cutoutPending.timer);cutoutPending.reject(Error('輪郭処理を中止しました'));cutoutPending=null}}
function requestCutout(bitmap,x,y){return new Promise((resolve,reject)=>{
 if(cutoutPending){bitmap.close();reject(Error('輪郭処理中です'));return}
 try{
  if(!cutoutWorker){cutoutWorker=new Worker('cutout-worker.js?v=0.5.13');
   cutoutWorker.onmessage=({data})=>{const p=cutoutPending;if(!p||p.request!==data.request)return;cutoutPending=null;clearTimeout(p.timer);data.error?p.reject(Error(data.error)):p.resolve({width:data.width,height:data.height,data:new Uint8Array(data.buffer)})};
   cutoutWorker.onerror=()=>stopCutoutWorker();
  }
  const request=++cutoutRequest,timer=setTimeout(()=>stopCutoutWorker(),45000);
  cutoutPending={request,timer,resolve,reject};cutoutWorker.postMessage({request,bitmap,x,y},[bitmap]);
 }catch(e){bitmap.close();if(cutoutPending){clearTimeout(cutoutPending.timer);cutoutPending=null}reject(e)}
})}
function seedComponent(mask,w,h,x,y){
 const regions=regionsOf(mask,w,h,1),seed=regions.lab[clamp(Math.floor(y),0,h-1)*w+clamp(Math.floor(x),0,w-1)];
 if(seed<0)return null;
 const out=new Uint8Array(mask.length);for(let p=0;p<out.length;p++)out[p]=regions.lab[p]===seed?1:0;return out;
}
async function cutoutAt(id,input,t,seed){
 const pad=.18,bx=Math.max(0,Math.floor(t.x-t.w*pad)),by=Math.max(0,Math.floor(t.y-t.h*pad));
 const bw=Math.min(input.width,Math.ceil(t.x+t.w*(1+pad)))-bx,bh=Math.min(input.height,Math.ceil(t.y+t.h*(1+pad)))-by;
 if(bw<8||bh<8)return false;
 const k=Math.min(1,640/Math.max(bw,bh)),crop=document.createElement('canvas');crop.width=Math.max(1,Math.round(bw*k));crop.height=Math.max(1,Math.round(bh*k));crop.getContext('2d').drawImage(input,bx,by,bw,bh,0,0,crop.width,crop.height);
 const sx=clamp((seed.x-bx)/bw,.001,.999),sy=clamp((seed.y-by)/bh,.001,.999);
 const mask=await requestCutout(await createImageBitmap(crop),sx,sy);if(id!==S.loadId)return false;
 const binary=seedComponent(mask.data,mask.width,mask.height,sx*mask.width,sy*mask.height);if(!binary)return false;
 const area=binary.reduce((a,b)=>a+b,0)/binary.length;if(area<.015||area>.94){t.cutoutReason='輪郭を十分に判別できません';return false}
 const low=document.createElement('canvas');low.width=mask.width;low.height=mask.height;const lc=low.getContext('2d'),im=lc.createImageData(low.width,low.height);
 for(let p=0;p<binary.length;p++){im.data[p*4]=im.data[p*4+1]=im.data[p*4+2]=255;im.data[p*4+3]=binary[p]*255}lc.putImageData(im,0,0);
 const matte=document.createElement('canvas');matte.width=bw;matte.height=bh;matte.getContext('2d').drawImage(low,0,0,bw,bh);
 t.mask=matte;t.maskData=null;t.cutBox={x:bx,y:by,w:bw,h:bh};t.cutoutReason='切り抜き成功';refreshCutout(t);return true;
}
async function segmentRemaining(id,input,issues=[]){
 const list=S.targets.filter(t=>!t.cutout).sort((a,b)=>b.w*b.h-a.w*a.h).slice(0,12);
 const deadline=Date.now()+60000;
 for(let i=0;i<list.length;i++){
  if(id!==S.loadId||Date.now()>deadline)return;const t=list[i];
  progress('人・動物・物の輪郭を確認中',`${i+1} / ${list.length}個 · 初回は切り抜き用データを読み込みます`);await breathe();
  if(id!==S.loadId)return;
  try{await cutoutAt(id,input,t,{x:t.x+t.w*.5,y:t.y+t.h*(t.kind==='person'?.4:.5)})}
  catch(e){if(id===S.loadId){t.cutoutReason='輪郭処理を利用できません';issues.push('追加の輪郭処理：'+aiError(e))}return}
 }
}
// Fill only the original silhouette. Hidden background is approximated from the boundary,
// not reconstructed by AI. The small shake can reveal a blurred edge in busy backgrounds.
function makeBackfill(t){
 const w=t.mask.width,h=t.mask.height,n=w*h,b=t.cutBox||t;
 const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const c=canvas.getContext('2d');c.drawImage(art,b.x,b.y,b.w,b.h,0,0,w,h);
 const original=c.getImageData(0,0,w,h),alpha=t.mask.getContext('2d').getImageData(0,0,w,h).data;
 const owner=new Int32Array(n).fill(-1),queue=new Int32Array(n);let head=0,tail=0;
 for(let p=0;p<n;p++)if(alpha[p*4+3]<16){owner[p]=p;queue[tail++]=p}
 if(!tail){t.backfill=null;return}
 while(head<tail){const p=queue[head++],x=p%w,y=(p/w)|0;
  for(const q of [x>0?p-1:-1,x+1<w?p+1:-1,y>0?p-w:-1,y+1<h?p+w:-1])if(q>=0&&owner[q]<0){owner[q]=owner[p];queue[tail++]=q}
 }
 const im=c.createImageData(w,h);for(let p=0;p<n;p++){const q=owner[p]*4;im.data[p*4]=original.data[q];im.data[p*4+1]=original.data[q+1];im.data[p*4+2]=original.data[q+2];im.data[p*4+3]=alpha[p*4+3]}
 c.putImageData(im,0,0);t.backfill=canvas;
}
async function refineAim(){
 if(!S.loaded||S.busy||S.manual)return;
 // Pick by box: a previously wrong mask must not prevent repairing that target.
 const t=activeTargets().filter(t=>!t.visitor&&S.cx>=t.x&&S.cx<=t.x+t.w&&S.cy>=t.y&&S.cy<=t.y+t.h).sort((a,b)=>a.w*a.h-b.w*b.h)[0];
 if(!t){say('切り抜きたい対象の内側に照準を合わせてください。対象がない場合は範囲を手動追加できます。');return}
 const id=S.loadId,seed={x:S.cx,y:S.cy},input=document.createElement('canvas');input.width=source.width;input.height=source.height;input.getContext('2d').drawImage(source,0,0);
 progress('狙った対象を切り抜き中','対象の輪郭を確認しています');await breathe();
 try{if(id!==S.loadId)return;const ok=await cutoutAt(id,input,t,seed);if(id!==S.loadId)return;say(ok?`${t.label}の輪郭を更新しました。`:'輪郭を判別できませんでした。対象の中央付近に照準を合わせて、もう一度試してください。')}
 catch{if(id===S.loadId)say('切り抜き用データを読み込めませんでした。通信を確認して再度お試しください。')}
 finally{if(id===S.loadId)endProgress();input.width=input.height=1}
}
function mergeDetections(predictions){
 const kept=[];
 for(const p of predictions.slice().sort((a,b)=>b.score-a.score)){
  const [x,y,w,h]=p.bbox;if(![x,y,w,h,p.score].every(Number.isFinite)||w<4||h<4)continue;
  if(kept.some(q=>q.class===p.class&&boxIou({x,y,w,h},{x:q.bbox[0],y:q.bbox[1],w:q.bbox[2],h:q.bbox[3]})>.45))continue;
  kept.push(p);if(kept.length>=60)break;
 }return kept;
}
async function detectScene(id,model,input){
 const all=await timeout(model.detect(input,60,.28));if(id!==S.loadId)return [];
 if(Math.max(input.width,input.height)<480)return mergeDetections(all);
 const tw=Math.ceil(input.width*.65),th=Math.ceil(input.height*.65),deadline=Date.now()+30000;
 const positions=[[0,0],[input.width-tw,0],[0,input.height-th],[input.width-tw,input.height-th]];
 const tile=document.createElement('canvas');tile.width=tw;tile.height=th;
 for(let i=0;i<positions.length;i++){
  if(id!==S.loadId||Date.now()>deadline)break;
  progress('小さい対象も探しています',`写真の全体と部分を確認中 · ${i+1} / ${positions.length}`);await breathe();if(id!==S.loadId)break;
  const [ox,oy]=positions[i];tile.getContext('2d').drawImage(input,ox,oy,tw,th,0,0,tw,th);
  let part;try{part=await timeout(model.detect(tile,30,.32),12000)}catch{break}
  if(id!==S.loadId)break;
  for(const p of part){const [x,y,w,h]=p.bbox;
   // A crop that cuts a person in half is not a second person.
   if((ox>0&&x<3)||(oy>0&&y<3)||(ox+tw<input.width&&x+w>tw-3)||(oy+th<input.height&&y+h>th-3))continue;
   all.push({...p,bbox:[x+ox,y+oy,w,h]});
  }
 }
 return mergeDetections(all);
}
async function analyze(id){
 progress('AIを読み込み中','初回は認識用データを読み込みます。準備の状況は画面に表示します。');await breathe();if(id!==S.loadId)return;
 $('#retryRecognition').hidden=true;$('#aiStatus').textContent='AIを準備中…';
 const input=document.createElement('canvas');input.width=source.width;input.height=source.height;input.getContext('2d').drawImage(source,0,0);
 const issues=[];let detectionOK=false;
 try{
  try{
   const predictions=await detectWithRecovery(id,input,issues);if(id!==S.loadId)return;detectionOK=true;
   S.targets.push(...predictions.map(p=>makeTarget(p.bbox,p.class==='person'?'person':animals.has(p.class)?'animal':'object',names[p.class]||p.class)));
  }catch(e){if(id!==S.loadId)return;issues.push('物体認識：'+aiError(e))}
  if(id!==S.loadId)return;
  // This stage runs even if COCO loading or inference failed. It can add missing people.
  await segmentPeople(id,input,issues);if(id!==S.loadId)return;
  if(S.targets.some(t=>t.kind==='person')){
   progress('顔を簡易加工中','顔の位置を確認しています');await breathe();if(id!==S.loadId)return;
   try{const fd=await timeout(getFaceDetector(),25000);const faces=await timeout(fd.estimateFaces(input,{flipHorizontal:false}),20000);if(id!==S.loadId)return;S.faces=faces;paintComic()}
   catch(e){if(id===S.loadId)issues.push('顔加工：'+aiError(e))}
  }
  if(id===S.loadId)await segmentRemaining(id,input,issues);
 }catch(e){if(id===S.loadId)issues.push('追加の輪郭処理：'+aiError(e))}
 finally{
  input.width=input.height=1;
  if(id===S.loadId){
   endProgress();const people=S.targets.filter(t=>t.kind==='person').length,cut=S.targets.filter(t=>t.cutout).length;
   const summary=`人物 ${people}人・その他 ${S.targets.length-people}個、輪郭取得 ${cut}個。`;
   $('#aiStatus').textContent=summary+(issues.length?' 一部の処理に失敗：'+issues.join(' ／ '):'解析完了。');
   const needsRetry=!people||issues.some(m=>!m.startsWith('顔加工：')&&!m.startsWith('追加の輪郭処理：'));
   $('#retryRecognition').hidden=!needsRetry;
   S.recognitionIssues=issues;S.recognitionBackend=window.tf?.getBackend?.()||'未起動';
   if(!S.targets.length){say(detectionOK&&!issues.length?'人物・物を検出できませんでした。「認識を再試行」で、もう一度探せます。':'認識処理に失敗しました。「認識を再試行」を押してください。写真・認識の設定に詳細を表示しています。')}
   else say(summary+(needsRetry?' 認識の一部に失敗しました。再試行できます。':'Aで狙ってみよう。'));
  }
 }
}
async function retryRecognition(){
 if(!S.loaded||S.busy||S.manual||S.demo)return;
 const id=++S.loadId;stopCutoutWorker();progress('認識を再試行中','別の実行方法で写真を調べ直します');
 try{const tf=await ensureTensorflow();if(id!==S.loadId)return;await tf.setBackend('cpu');await tf.ready();if(id!==S.loadId)return;
  S.targets=[];S.faces=[];S.fx=[];S.holes=[];paintComic();void analyze(id);
 }catch(e){if(id===S.loadId){endProgress();$('#retryRecognition').hidden=false;$('#aiStatus').textContent='再試行失敗：'+aiError(e);say('認識用データを読み込めませんでした。通信を確認して再試行してください。')}}
}
async function readPhoto(file){
 if(!file)return;if(file.size>35*1024*1024){say('35MB以下の写真を選んでください。');return}
 const id=++S.loadId;stopCutoutWorker();S.keys.clear();progress('写真を読み込み中','写真を端末内に準備しています。');say('写真を読み込み中…');let url;
 try{
  url=URL.createObjectURL(file);const image=new Image();image.src=url;await image.decode();if(id!==S.loadId)return;
  const ratio=Math.min(1,960/Math.max(image.naturalWidth,image.naturalHeight));source.width=Math.max(1,Math.round(image.naturalWidth*ratio));source.height=Math.max(1,Math.round(image.naturalHeight*ratio));
  sc.fillStyle='#fff';sc.fillRect(0,0,source.width,source.height);sc.drawImage(image,0,0,source.width,source.height);
  $('#retryRecognition').hidden=true;S.targets=[];S.faces=[];S.holes=[];S.fx=[];S.demo=false;S.manual=false;S.drag=null;modelWarning='';
  progress('写真を漫画風に加工中','輪郭線と色を整えています。');await breathe();if(id!==S.loadId)return;paintComic();enterGame();void analyze(id);
 }catch{if(id===S.loadId){endProgress();say('この画像は読み込めませんでした。JPEG・PNGなど別の画像で試してください。')}}
 finally{if(url)URL.revokeObjectURL(url)}
}
function enterGame(){globalThis.LabMetrics?.start({mode:S.demo?'sample':'photo'});resetShareStats();S.loaded=true;S.cx=source.width/2;S.cy=source.height/2;S.base=null;S.gyro=null;resetVisitors();$('#intro').hidden=true;$('#reticle').hidden=false;setPaused(false);fit();say('十字キーで狙って、Aで発射。SELECTでジャイロへ切替。')}
function demo(){
 S.loadId++;stopCutoutWorker();endProgress();$('#retryRecognition').hidden=true;source.width=840;source.height=840;S.faces=[];S.targets=[];S.holes=[];S.fx=[];S.demo=true;S.busy=false;
 sc.fillStyle='#dde7cf';sc.fillRect(0,0,840,840);sc.fillStyle='#bfc6ba';sc.fillRect(0,530,840,310);
 for(let i=0;i<5;i++){sc.fillStyle=['#b9c9b8','#d5c7aa'][i%2];sc.fillRect(i*180-30,90,155,440);sc.fillStyle='#748e80';for(let y=120;y<480;y+=80)sc.fillRect(i*180, y,48,52)}
 sc.fillStyle='#5d735a';sc.fillRect(0,510,840,25);sc.lineWidth=8;sc.strokeStyle='#303c36';
 sc.fillStyle='#dabc9b';sc.beginPath();sc.arc(345,345,42,0,Math.PI*2);sc.fill();sc.stroke();sc.fillStyle='#4b6b88';sc.fillRect(304,388,83,134);sc.strokeRect(304,388,83,134);sc.fillStyle='#3a4146';sc.fillRect(307,522,28,97);sc.fillRect(357,522,28,97);
 sc.fillStyle='#b99062';sc.beginPath();sc.ellipse(540,570,45,33,0,0,Math.PI*2);sc.fill();sc.stroke();sc.beginPath();sc.arc(560,534,25,0,Math.PI*2);sc.fill();sc.stroke();sc.beginPath();sc.moveTo(540,516);sc.lineTo(543,493);sc.lineTo(558,514);sc.moveTo(565,512);sc.lineTo(583,493);sc.lineTo(581,526);sc.fill();sc.stroke();
 sc.fillStyle='#947055';sc.fillRect(100,482,130,20);sc.fillRect(100,523,130,20);sc.fillRect(110,543,12,62);sc.fillRect(207,543,12,62);
 S.targets=[makeTarget([294,298,102,330],'person','サンプルの人'),makeTarget([490,492,110,120],'animal','サンプルの猫'),makeTarget([94,474,145,137],'object','ベンチ')];paintComic();enterGame();$('#aiStatus').textContent='サンプルは登録済みの対象を使用しています。写真を読み込むと自動認識を試せます。';
}
function containsTarget(t,x,y){const b=t.mask?(t.cutBox||t):t;if(x<b.x||x>=b.x+b.w||y<b.y||y>=b.y+b.h)return false;if(!t.hitAlpha||!t.mask)return true;const ix=Math.min(t.mask.width-1,Math.floor((x-b.x)/b.w*t.mask.width)),iy=Math.min(t.mask.height-1,Math.floor((y-b.y)/b.h*t.mask.height));return t.hitAlpha[(iy*t.mask.width+ix)*4+3]>=96}
function targetAt(x,y){return activeTargets().filter(t=>containsTarget(t,x,y)).sort((a,b)=>Number(!!b.visitor)-Number(!!a.visitor)||a.w*a.h-b.w*b.h)[0]}
function shoot(){
 if(!S.loaded||S.busy||S.manual){say(S.loaded?'写真処理・範囲指定が終わってから発射してね。':'まず写真を選んでね。');return}
 if(S.paused){say('写真の範囲指定を終えてから発射してね。');return}if(S.time-S.lastShot<.25)return;S.lastShot=S.time;
 void shotSound();
 const t=targetAt(S.cx,S.cy);S.shareStats.shots++;if(t){S.shareStats.hits++;if(!sharedTargets.has(t)){sharedTargets.add(t);S.shareStats.targets++}t.hits=(t.hits||0)+1;}S.fx.push({x:S.cx,y:S.cy,time:S.time,type:t?'hit':'miss'});S.fx=S.fx.slice(-20);
 if(t&&t.kind!=='object'){t.hitTime=S.time;t.asleepUntil=S.time+(t.visitor?3:6);if(t.visitor)t.phase='sleep';say(t.visitor?`${t.label}：ビクッ… Zzz（少し休んで退場）`:t.cutout&&$('#shakeEnabled').checked?`${t.label}：ビクッ！ Zzz（6秒で起きます）`:`${t.label}：Zzz（${!t.cutout?'輪郭未取得':'揺れ設定OFF'}）`)}
 else if(t){S.holes.push({x:S.cx,y:S.cy,r:6+Math.random()*3});S.holes=S.holes.slice(-160);say(`${t.label}に、ぽすっ。`)}else say('ぽすっ。そこには対象がいないみたい。');
 $('#reticle').classList.add('firing');setTimeout(()=>$('#reticle').classList.remove('firing'),120);
}
async function switchMode(){
 if(S.mode==='gyro'){S.mode='pad';S.base=null;$('#modeLabel').textContent='PAD';say('十字キー操作に切り替えました。');return}
 try{
  const api=window.DeviceOrientationEvent;if(!api)throw Error();
  if(typeof api.requestPermission==='function'&&await api.requestPermission()!=='granted')throw Error();
  S.mode='gyro';S.base=null;$('#modeLabel').textContent='GYRO';say('端末の傾きで照準を移動。SELECTで十字キーに戻せます。');
  const token=++gyroToken;setTimeout(()=>{if(token===gyroToken&&S.mode==='gyro'&&!S.base){S.mode='pad';$('#modeLabel').textContent='PAD';say('傾きを取得できないため十字キーへ戻しました。')}},2200);
 }catch{S.mode='pad';$('#modeLabel').textContent='PAD';say('ジャイロを利用できません。十字キーで遊べます。')}
}
let gyroToken=0;
window.addEventListener('deviceorientation',e=>{if(S.mode!=='gyro'||e.beta==null||e.gamma==null||S.paused||!S.loaded||S.manual)return;if(!S.base)S.base={beta:e.beta,gamma:e.gamma,x:S.cx,y:S.cy};S.gyro={x:clamp(S.base.x+(e.gamma-S.base.gamma)*source.width/65,0,source.width),y:clamp(S.base.y+(e.beta-S.base.beta)*source.height/65,0,source.height)}});
function render(){
 ctx.clearRect(0,0,S.w,S.h);ctx.fillStyle='#acb998';ctx.fillRect(0,0,S.w,S.h);if(!S.loaded)return;
 ctx.save();ctx.translate(S.w/2,S.h/2);ctx.scale(S.scale,S.scale);ctx.translate(-S.cx,-S.cy);ctx.drawImage(art,0,0);
 // Only masked foreground moves. Never shift a rectangular patch of background.
 if($('#shakeEnabled').checked){
  const moving=S.targets.filter(t=>t.cutout&&S.time-t.hitTime>=0&&S.time-t.hitTime<.65);
  for(const t of moving){const b=t.cutBox||t;if(t.backfill)ctx.drawImage(t.backfill,b.x,b.y,b.w,b.h)}
  for(const t of moving){const b=t.cutBox||t,age=S.time-t.hitTime,fade=Math.pow(1-age/.65,.6),dx=Math.sin(age*48)*8*fade/S.scale,dy=-Math.abs(Math.sin(age*24))*3*fade/S.scale;ctx.save();ctx.translate(b.x+b.w/2+dx,b.y+b.h/2+dy);ctx.rotate(Math.sin(age*40)*.022*fade);ctx.drawImage(t.cutout,-b.w/2,-b.h/2,b.w,b.h);ctx.restore()}
 }

 for(const h of S.holes){ctx.save();ctx.translate(h.x,h.y);ctx.strokeStyle='#29302e';ctx.lineWidth=1.4/S.scale;for(let i=0;i<5;i++){const a=i*Math.PI*2/5;ctx.beginPath();ctx.moveTo(Math.cos(a)*h.r,Math.sin(a)*h.r);ctx.lineTo(Math.cos(a)*h.r*2,Math.sin(a)*h.r*2);ctx.stroke()}ctx.fillStyle='#2b302b';ctx.beginPath();ctx.ellipse(0,0,h.r,h.r*.7,-.3,0,Math.PI*2);ctx.fill();ctx.restore()}
 drawVisitors();
 for(const t of activeTargets()){
  if($('#showBoxes').checked){ctx.strokeStyle=t.kind==='object'?'#e5b640':'#599fd6';ctx.lineWidth=1.5/S.scale;ctx.strokeRect(t.x,t.y,t.w,t.h)}
  if(t.asleepUntil>S.time){for(let i=0;i<3;i++){const age=(S.time-t.hitTime+i*.6)%1.8;ctx.globalAlpha=1-age/1.8;ctx.font=`bold ${18/S.scale}px sans-serif`;ctx.fillStyle='#263f61';ctx.strokeStyle='#fff';ctx.lineWidth=3/S.scale;const x=t.x+t.w*.65+Math.sin(age*3+i)*7/S.scale,y=t.y-(8+age*28)/S.scale;ctx.strokeText('Z',x,y);ctx.fillText('Z',x,y)}ctx.globalAlpha=1}
 }
 for(const f of S.fx){const age=S.time-f.time;if(age>.35)continue;ctx.globalAlpha=1-age/.35;ctx.strokeStyle=f.type==='hit'?'#ffefb6':'#eff5d8';ctx.lineWidth=2/S.scale;ctx.beginPath();ctx.arc(f.x,f.y,(6+age*50)/S.scale,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1}
 if(S.drag){ctx.strokeStyle='#fcf6ad';ctx.lineWidth=2/S.scale;ctx.setLineDash([5/S.scale,4/S.scale]);ctx.strokeRect(S.drag.start.x,S.drag.start.y,S.drag.end.x-S.drag.start.x,S.drag.end.y-S.drag.start.y)}
 ctx.restore();
}
function loop(now){const dt=Math.min(.05,(now-S.last)/1000||0);S.last=now;if(!document.hidden&&S.loaded&&!S.paused&&!S.busy&&!S.manual){S.time+=dt;updateVisitors(dt);if(!pinch&&!pan&&S.mode==='pad'){let x=Number(S.keys.has('right'))-Number(S.keys.has('left')),y=Number(S.keys.has('down'))-Number(S.keys.has('up'));const norm=Math.hypot(x,y)||1;S.cx=clamp(S.cx+x/norm*dt*220/S.scale,0,source.width);S.cy=clamp(S.cy+y/norm*dt*220/S.scale,0,source.height)}else if(!pinch&&!pan&&S.gyro){S.cx+=(S.gyro.x-S.cx)*Math.min(1,dt*9);S.cy+=(S.gyro.y-S.cy)*Math.min(1,dt*9)}}render();raf=requestAnimationFrame(loop)}
for(const b of document.querySelectorAll('[data-dir]')){
 b.addEventListener('pointerdown',e=>{e.preventDefault();if(S.mode!=='pad')return;S.keys.add(b.dataset.dir);b.setPointerCapture?.(e.pointerId)});
 for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,()=>S.keys.delete(b.dataset.dir));
}
window.addEventListener('keydown',e=>{const dir={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right'}[e.key];if(dir){e.preventDefault();S.keys.add(dir)}if(e.code==='Space'&&e.target===document.body){e.preventDefault();shoot()}});
window.addEventListener('keyup',e=>{const dir={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right'}[e.key];if(dir)S.keys.delete(dir)});
window.addEventListener('blur',()=>S.keys.clear());document.addEventListener('visibilitychange',()=>{S.keys.clear();if(S.loaded)setPaused(document.hidden)});
$('#takePhoto').onclick=()=>$('#cameraInput').click();$('#loadPhoto').onclick=()=>$('#fileInput').click();$('#replacePhoto').onclick=()=>$('#fileInput').click();
for(const id of ['cameraInput','fileInput'])$('#'+id).addEventListener('change',e=>{const file=e.target.files[0];e.target.value='';preparePhoto(file)});
$('#demo').onclick=demo;$('#select').onclick=switchMode;
// Non-primary pointers must fire too: the other hand may still be dragging the photo.
const firePointers=new Set(),fireButton=$('#fire');
function clearFirePointers(){firePointers.clear();fireButton.classList.remove('held')}
fireButton.addEventListener('pointerdown',e=>{
 if(e.pointerType==='mouse'&&e.button!==0)return;e.preventDefault();
 if(firePointers.has(e.pointerId))return;firePointers.add(e.pointerId);fireButton.classList.add('held');
 fireButton.setPointerCapture?.(e.pointerId);shoot();
});
for(const event of ['pointerup','pointercancel','lostpointercapture'])fireButton.addEventListener(event,e=>{firePointers.delete(e.pointerId);if(!firePointers.size)fireButton.classList.remove('held')});
fireButton.addEventListener('click',e=>{if(e.detail===0)shoot();else e.preventDefault()});
window.addEventListener('blur',clearFirePointers);document.addEventListener('visibilitychange',()=>{if(document.hidden)clearFirePointers()});
$('#start').onclick=home;
$('#skipProcessing').onclick=()=>{if(!S.loaded)return;S.loadId++;stopCutoutWorker();endProgress();$('#aiStatus').textContent='解析をスキップしました。認識済みの対象と手動追加で遊べます。';say('解析をスキップ。設定から対象を手動追加できます。')};
$('#reset').onclick=()=>{resetShareStats();S.holes=[];S.fx=[];resetVisitors();for(const t of S.targets){t.asleepUntil=0;t.hitTime=-20;t.hits=0}say('命中履歴・穴・眠りをリセットしました。')};$('#simplify').onchange=()=>{if(S.loaded)paintComic()};
$('#addTarget').onclick=()=>{if(!S.loaded||S.busy){say('写真の準備ができてから追加してね。');return}S.manual=!S.manual;S.drag=null;setPaused(S.manual);$('#reticle').hidden=S.manual;say(S.manual?'写真上をドラッグして対象の範囲を指定してください。':'範囲追加を終了しました。')};
const gestures=new Map();let pinch=null,pan=null;
function screenPoint(e){const r=canvas.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}}
function beginPinch(){const [a,b]=[...gestures.values()];if(!a||!b)return;const mid={x:(a.x+b.x)/2,y:(a.y+b.y)/2};pinch={distance:Math.max(1,Math.hypot(a.x-b.x,a.y-b.y)),zoom:S.zoom,anchor:toWorld(mid.x,mid.y)};pan=null;S.drag=null;S.keys.clear()}
canvas.addEventListener('pointerdown',e=>{if(!S.loaded||S.busy)return;e.preventDefault();gestures.set(e.pointerId,screenPoint(e));canvas.setPointerCapture?.(e.pointerId);if(gestures.size>=2)beginPinch();else if(!S.manual){const p=screenPoint(e);pan={x:p.x,y:p.y,cx:S.cx,cy:S.cy};S.base=S.gyro=null}});
canvas.addEventListener('pointermove',e=>{if(!gestures.has(e.pointerId)||!S.loaded||S.busy)return;e.preventDefault();const p=screenPoint(e);gestures.set(e.pointerId,p);
 if(pinch&&gestures.size>=2){const [a,b]=[...gestures.values()],mid={x:(a.x+b.x)/2,y:(a.y+b.y)/2};updateZoom(pinch.zoom*Math.hypot(a.x-b.x,a.y-b.y)/pinch.distance);S.cx=clamp(pinch.anchor.x-(mid.x-S.w/2)/S.scale,0,source.width);S.cy=clamp(pinch.anchor.y-(mid.y-S.h/2)/S.scale,0,source.height);render()}
 else if(pan&&!S.manual){S.cx=clamp(pan.cx-(p.x-pan.x)/S.scale,0,source.width);S.cy=clamp(pan.cy-(p.y-pan.y)/S.scale,0,source.height);render()}
});
function endGesture(e){gestures.delete(e.pointerId);if(gestures.size<2){pinch=null;const p=[...gestures.values()][0];pan=p&&!S.manual?{x:p.x,y:p.y,cx:S.cx,cy:S.cy}:null;S.base=S.gyro=null}}
for(const event of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,endGesture);
canvas.addEventListener('pointerdown',e=>{if(!S.manual||pinch)return;e.preventDefault();const p=point(e);S.drag={start:p,end:p};canvas.setPointerCapture?.(e.pointerId)});
canvas.addEventListener('pointermove',e=>{if(S.drag&&!pinch)S.drag.end=point(e)});
canvas.addEventListener('pointerup',()=>{if(!S.drag)return;const {start:a,end:b}=S.drag;const x=clamp(Math.min(a.x,b.x),0,source.width),y=clamp(Math.min(a.y,b.y),0,source.height),r=clamp(Math.max(a.x,b.x),0,source.width),bottom=clamp(Math.max(a.y,b.y),0,source.height);S.drag=null;if(r-x<10||bottom-y<10){say('もう少し大きく範囲を囲んでね。');return}if(S.targets.length>=60){say('対象は最大60個です。');return}const kind=$('#targetType').value;const t=makeTarget([x,y,r-x,bottom-y],kind,{person:'指定した人',animal:'指定した動物',object:'指定した物'}[kind]);S.targets.push(t);S.manual=false;setPaused(false);$('#reticle').hidden=false;say('対象を追加しました。輪郭が必要なら、内側に照準を合わせて切り抜き直せます。')});canvas.addEventListener('pointercancel',()=>S.drag=null);
$('#retryRecognition').onclick=retryRecognition;
$('#refineCutout').onclick=refineAim;
$('#shakeEnabled').checked=true;
window.addEventListener('resize',fit);fit();raf=requestAnimationFrame(loop);
// Suppress browser text selection and long-press menus only on the game UI.
for(const event of ['contextmenu','selectstart','dragstart'])document.querySelector('.console').addEventListener(event,e=>{if(!e.target.closest('input,select,textarea'))e.preventDefault()});
document.querySelector('.controls').addEventListener('dblclick',e=>e.preventDefault());
window.StreetHunterTest={state:S,comicPixels,targetAt,shoot,makeTarget,demo,readPhoto,switchMode,buildCutout,home,updateZoom,progress,endProgress,render,spawnVisitor,updateVisitors,preparePhoto,shareText};
})();
