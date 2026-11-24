/* Inkstrike v0.5.1 | 2026-10-28 | LAB navigation + anonymous event counts */
globalThis.LabPageConfig={"game": "Inkstrike", "version": "0.5.1"};globalThis.GAME_PUBLIC_URL="https://tsubasarock21.github.io/games/Inkstrike/";globalThis.PICTO_PUBLIC_URL="https://tsubasarock21.github.io/games/Inkstrike/";
/* Tsubasa_Rock_LAB shared navigation / anonymous counters v1.0.0 | 2026-10-28 */
if(globalThis.LabMetricsV2){globalThis.LabMetricsV2.install({game:"Inkstrike",version:globalThis.LabPageConfig?.version||'unknown'});}else{(()=>{'use strict';
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

/* INKSTRIKE / script.js / v0.5.1 BETA | 2026-10-28 */
(() => {
'use strict';
const $=id=>document.getElementById(id),dc=$('drawing'),fc=$('flight'),dctx=dc.getContext('2d'),ctx=fc.getContext('2d');
const N=162,CELL=2/N,PEN=.040,CORE=.080,INK_LENGTH=12,SCALE=43,ENERGY_SPEED=2.4,BOSS_INTERVAL=45,MAX_ENEMIES=200,KEY='inkstrike.v1',GAME_PUBLIC_URL='https://tsubasarock21.github.io/games/Inkstrike/';
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),hypot=(x,y)=>Math.hypot(x,y),len=p=>hypot(p.x,p.y),distance=(a,b)=>hypot(a.x-b.x,a.y-b.y),copyGrid=g=>new Uint8Array(g);
const S={runBest:false,runThumbnail:'',shipName:'',runId:'',round:1,roundStart:0,nextBossAt:45,bossKills:0,padDelta:{x:0,y:0},weapon:0,shield:0,invulnerable:0,items:[],dropIndex:0,boss:null,bossWarned:false,coreDestroyed:false,originalGrid:null,originalColors:null,originalNozzle:null,phase:'home',paths:[],grid:new Uint8Array(N*N),ink:0,designPointer:null,currentPath:null,designDirty:true,stats:null,nozzle:{x:0,y:-.14},energy:0,ship:{x:0,y:0},previousShip:{x:0,y:0},mode:'vertical',control:'stick',score:0,kills:0,elapsed:0,enemies:[],bullets:[],shots:[],particles:[],scorePops:[],spawnClock:0,enemyId:0,initialArmor:0,shake:0,stick:null,keys:new Set(),sensor:null,neutral:null,gyroStart:0,sound:true,best:0,launching:false,shareBusy:false,lastStamp:0,stars:[]};
function fitLayout(){
 const viewport=window.visualViewport,height=viewport?.height||window.innerHeight||780;
 document.documentElement.style.setProperty('--app-height',height+'px');
 document.documentElement.style.setProperty('--app-top',(viewport?.offsetTop||0)+'px');
 if(S.phase==='edit'){const wrap=dc.parentElement.getBoundingClientRect(),side=Math.max(80,(wrap.width||366)-2);dc.style.width=side+'px';dc.style.height=side+'px';S.designDirty=true;}
 if(S.phase==='running'||S.phase==='paused'){S.flightSize=null;const size=resizeFlight(true);const oldW=W,oldH=H;W=size.width;H=size.height;if(oldW&&oldH){S.ship.x=clamp(S.ship.x/oldW*W,48,W-48);S.ship.y=clamp(S.ship.y/oldH*H,48,H-48);}resetPad();}
}
function installLayout(){
 document.body.classList.add('viewport-locked');
 const oldHelp=document.querySelector('#editor > details');if(oldHelp){const dialog=document.createElement('dialog');dialog.id='helpDialog';const content=document.createElement('div');for(const child of [...oldHelp.children])if(child.tagName!=='SUMMARY')content.append(child);const close=document.createElement('button');close.textContent='閉じる';close.onclick=()=>dialog.close();dialog.append(content,close);document.body.append(dialog);const button=document.createElement('button');button.className='help-button';button.textContent='遊び方・機体のしくみ';button.onclick=()=>dialog.showModal();oldHelp.replaceWith(button);}
 document.addEventListener('touchmove',e=>{if(S.phase==='edit'||S.phase==='home')return;if(e.cancelable&&!e.target.closest?.('dialog[open],#editor,#results'))e.preventDefault();},{passive:false});
 if(window.ResizeObserver){const adObserver=new ResizeObserver(()=>fitLayout());adObserver.observe($('topAd'));}window.addEventListener('resize',fitLayout);window.visualViewport?.addEventListener('resize',fitLayout);window.visualViewport?.addEventListener('scroll',fitLayout);window.addEventListener('orientationchange',pause);fitLayout();
}
function cellIndex(x,y){const a=Math.floor((x+1)/CELL),b=Math.floor((y+1)/CELL);return a<0||a>=N||b<0||b>=N?-1:b*N+a;}
function occupied(g,x,y){const k=cellIndex(x,y);return k>=0&&g[k]===1;}
function cellPoint(k){return{x:(k%N+.5)*CELL-1,y:(Math.floor(k/N)+.5)*CELL-1};}
function stamp(g,p,r=PEN){const minX=clamp(Math.floor((p.x-r+1)/CELL),0,N-1),maxX=clamp(Math.ceil((p.x+r+1)/CELL),0,N-1),minY=clamp(Math.floor((p.y-r+1)/CELL),0,N-1),maxY=clamp(Math.ceil((p.y+r+1)/CELL),0,N-1);for(let y=minY;y<=maxY;y++)for(let x=minX;x<=maxX;x++){const q=cellPoint(y*N+x);if(distance(q,p)<=r&&len(q)>CORE+.018)g[y*N+x]=1;}}
function paintSegment(g,a,b){const length=distance(a,b),count=Math.max(1,Math.ceil(length/(CELL*.5)));for(let i=0;i<=count;i++)stamp(g,{x:a.x+(b.x-a.x)*i/count,y:a.y+(b.y-a.y)*i/count});}
function countArmor(g){let n=0;for(const v of g)n+=v;return n;}
function hull(points){const sorted=points.slice().sort((a,b)=>a.x-b.x||a.y-b.y);if(sorted.length<3)return sorted;const cross=(a,b,c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);const lower=[],upper=[];for(const p of sorted){while(lower.length>1&&cross(lower.at(-2),lower.at(-1),p)<=0)lower.pop();lower.push(p);}for(let i=sorted.length-1;i>=0;i--){const p=sorted[i];while(upper.length>1&&cross(upper.at(-2),upper.at(-1),p)<=0)upper.pop();upper.push(p);}lower.pop();upper.pop();return lower.concat(upper);}
function findNozzle(g){const points=[];for(let k=0;k<g.length;k++)if(g[k]){const x=k%N,y=Math.floor(k/N);if(x===0||x===N-1||y===0||y===N-1||!g[k-1]||!g[k+1]||!g[k-N]||!g[k+N])points.push(cellPoint(k));}if(!points.length)return{x:0,y:-.14};const outline=hull(points),front=Math.min(...outline.map(p=>p.y));let best=null;for(let i=0;i<outline.length;i++){const p=outline[i];if(p.y>front+.24)continue;const a=outline[(i+outline.length-1)%outline.length],b=outline[(i+1)%outline.length],u={x:a.x-p.x,y:a.y-p.y},v={x:b.x-p.x,y:b.y-p.y},angle=Math.acos(clamp((u.x*v.x+u.y*v.y)/(len(u)*len(v)||1),-1,1)),sharp=1-angle/Math.PI,score=-(p.y-front)*2+sharp*.5;if(!best||score>best.score)best={...p,score};}const p=best||points[0];return len(p)<.11?{x:0,y:-.14}:{x:p.x,y:p.y};}
function energyPeriod(g,nozzle){const length=len(nozzle);if(!length)return 0;const steps=Math.max(1,Math.ceil(length/.008));let duration=0;for(let i=0;i<steps;i++){const u=(i+.5)/steps;duration+=(length/steps)/ENERGY_SPEED*(occupied(g,nozzle.x*u,nozzle.y*u)?2:1);}return duration;}
const MIN_POWER=20;
function powerForInk(used){return Math.max(MIN_POWER,100-clamp(used,0,100));}
function analyze(g,used){const points=[];for(let k=0;k<g.length;k++)if(g[k])points.push(cellPoint(k));const xs=points.map(p=>p.x),ys=points.map(p=>p.y),width=points.length?Math.max(...xs)-Math.min(...xs)+CELL:.12,height=points.length?Math.max(...ys)-Math.min(...ys)+CELL:.12,mass=clamp(used/100,0,1),ratio=clamp(Math.sqrt(width/height),.65,1.55),footprint=clamp(width*height/4,0,1);return{ink:used,power:powerForInk(used),moveSpeed:340-155*mass,bulletSpeed:650-330*mass,sideFactor:ratio,forwardFactor:clamp(1/ratio,.65,1.55),enemyRate:1.4+4.3*(1-clamp(footprint/.65,0,1)),width,height,footprint,minX:Math.min(-CORE,...xs),maxX:Math.max(CORE,...xs),minY:Math.min(-CORE,...ys),maxY:Math.max(CORE,...ys),nozzle:findNozzle(g)};}
const E={tool:'pen',color:'#8eeedb',radius:2*CELL,zoom:1,x:0,y:0,pointers:new Map(),gesture:null,preview:null,dirty:false};
const history=[],future=[];let colors=new Uint32Array(N*N),raster=false,designMaster=null;let slots=[null,null,null],selectedSlot=0;
const colorNumber=h=>parseInt(h.slice(1),16),colorHex=n=>'#'+n.toString(16).padStart(6,'0');
function cleanName(v){return Array.from(String(v||'').replace(/[\u0000-\u001f\u007f]/g,'').trim()).slice(0,24).join('');}
function shipDisplayName(){return cleanName(S.shipName)||'名無し';}
function snapshot(){return {name:S.shipName,grid:Array.from(S.grid),colors:Array.from(colors)};}
function remember(){history.push(snapshot());if(history.length>50)history.shift();future.length=0;}
function restore(v){if(Object.prototype.hasOwnProperty.call(v,'name'))S.shipName=cleanName(v.name);$('shipName').value=S.shipName;S.grid=Uint8Array.from(v.grid);colors=Uint32Array.from(v.colors);raster=true;refreshInk();}
function refreshInk(){S.ink=Math.min(100,countArmor(S.grid)/72);updateDesign();}
function rebuild(){if(!raster){S.grid=new Uint8Array(N*N);for(const path of S.paths){if(!path.length)continue;stamp(S.grid,path[0]);for(let i=1;i<path.length;i++)paintSegment(S.grid,path[i-1],path[i]);}colors=Uint32Array.from(S.grid,v=>v?0x8eeedb:0);raster=true;}refreshInk();}
function updateDesign(){S.designDirty=true;const a=analyze(S.grid,S.ink);S.nozzle=a.nozzle;const speed=a.ink<30?'高速':a.ink<70?'標準':'重装・低速';$('used').textContent=Math.round(S.ink);$('power').textContent=Math.max(1,Math.round(a.power));$('inkFill').style.width=S.ink+'%';$('inkFill').style.background=S.ink>85?'#ff9e86':'#6ee5c5';$('speedSpec').textContent=speed;$('axisSpec').textContent=`${a.sideFactor.toFixed(2)} / ${a.forwardFactor.toFixed(2)}`;$('fireSpec').textContent=`約 ${(1/Math.max(.001,energyPeriod(S.grid,a.nozzle))).toFixed(1)} 発 / 秒`;$('enemySpec').textContent='少 → 徐々に増加';$('launch').disabled=S.ink<1||S.launching;$('undo').disabled=history.length===0;$('redo').disabled=future.length===0;}

function viewPoint(e){const r=dc.getBoundingClientRect();return{x:(e.clientX-r.left)/r.width*2-1,y:(e.clientY-r.top)/r.height*2-1};}
function designPoint(e){const p=viewPoint(e);return{x:(p.x-E.x)/E.zoom,y:(p.y-E.y)/E.zoom};}
function dab(p,erase=false){if(Math.abs(p.x)>1||Math.abs(p.y)>1)return;if(E.radius<=CELL*.51){const k=cellIndex(p.x,p.y);if(k<0)return;const q=cellPoint(k);if(len(q)<=CORE+.018)return;if(erase){S.grid[k]=0;colors[k]=0;}else if(S.grid[k]||countArmor(S.grid)<7200){S.grid[k]=1;colors[k]=colorNumber(E.color);}return;}const r=E.radius;let count=countArmor(S.grid);for(let y=Math.max(0,Math.floor((p.y-r+1)/CELL));y<Math.min(N,Math.ceil((p.y+r+1)/CELL));y++)for(let x=Math.max(0,Math.floor((p.x-r+1)/CELL));x<Math.min(N,Math.ceil((p.x+r+1)/CELL));x++){const k=y*N+x,q=cellPoint(k);if(distance(p,q)>r||len(q)<=CORE+.018)continue;if(erase){count-=S.grid[k];S.grid[k]=0;colors[k]=0;}else if(S.grid[k]||count<7200){if(!S.grid[k])count++;S.grid[k]=1;colors[k]=colorNumber(E.color);}}}
function stroke(a,b,erase=false){const steps=Math.max(1,Math.ceil(distance(a,b)/(CELL*.45)));for(let i=0;i<=steps;i++)dab({x:a.x+(b.x-a.x)*i/steps,y:a.y+(b.y-a.y)*i/steps},erase);refreshInk();}
function shapePoints(a,b){const rx=Math.max(CELL,Math.abs(b.x-a.x)),ry=Math.max(CELL,Math.abs(b.y-a.y));let pts=[];if(E.tool==='circle'){for(let i=0;i<=64;i++){const t=i/64*Math.PI*2;pts.push({x:a.x+Math.cos(t)*rx,y:a.y+Math.sin(t)*ry});}}else {const points=E.tool==='square'?[[-1,-1],[1,-1],[1,1],[-1,1]]:E.tool==='triangle'?[[0,-1],[1,1],[-1,1]]:E.tool==='diamond'?[[0,-1],[1,0],[0,1],[-1,0]]:Array.from({length:10},(_,i)=>{const t=-Math.PI/2+i*Math.PI/5,r=i%2?.45:1;return[Math.cos(t)*r,Math.sin(t)*r];});pts=points.map(([x,y])=>({x:a.x+x*rx,y:a.y+y*ry}));pts.push(pts[0]);}return pts;}
function commitShape(a,b){const before=snapshot(),pts=shapePoints(a,b);for(let i=1;i<pts.length;i++)stroke(pts[i-1],pts[i]);if(countArmor(S.grid)>=7200){restore(before);$('editorStatus').textContent='スタンプがインク上限に達します。ドットサイズを小さくするか、装甲を消してください。';}else refreshInk();}
function endDrawing(){if(S.designPointer!==null){const id=S.designPointer;S.designPointer=null;try{dc.releasePointerCapture(id);}catch(_){}}S.currentPath=null;E.preview=null;S.designDirty=true;if(E.dirty){saveDesign();E.dirty=false;}}
function appendDrawing(p){if(!S.currentPath)return;const a=S.currentPath.at(-1);stroke(a,p,E.tool==='eraser');S.currentPath=[p];}
function setZoom(z){E.zoom=clamp(z,1,4);const limit=E.zoom-1;E.x=clamp(E.x,-limit,limit);E.y=clamp(E.y,-limit,limit);$('zoomValue').textContent=Math.round(E.zoom*100)+'%';S.designDirty=true;}

dc.addEventListener('pointerdown',e=>{if(S.phase!=='edit')return;e.preventDefault();dc.setPointerCapture(e.pointerId);E.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(E.pointers.size===2){if(E.dirty&&history.length){restore(history.pop());E.dirty=false;}S.designPointer=null;S.currentPath=null;E.preview=null;const [a,b]=[...E.pointers.values()];E.gesture={distance:distance(a,b),zoom:E.zoom,anchor:designPoint({clientX:(a.x+b.x)/2,clientY:(a.y+b.y)/2})};return;}if(E.pointers.size!==1)return;S.designPointer=e.pointerId;const p=designPoint(e);remember();E.dirty=true;if(['pen','eraser'].includes(E.tool)){S.currentPath=[p];dab(p,E.tool==='eraser');refreshInk();}else E.preview={a:p,b:p};});
dc.addEventListener('pointermove',e=>{if(!E.pointers.has(e.pointerId))return;e.preventDefault();E.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(E.gesture&&E.pointers.size===2){const [a,b]=[...E.pointers.values()],v=viewPoint({clientX:(a.x+b.x)/2,clientY:(a.y+b.y)/2});setZoom(E.gesture.zoom*distance(a,b)/Math.max(1,E.gesture.distance));E.x=v.x-E.gesture.anchor.x*E.zoom;E.y=v.y-E.gesture.anchor.y*E.zoom;setZoom(E.zoom);return;}if(e.pointerId!==S.designPointer)return;if(E.preview){E.preview={a:designPoint(e),b:designPoint(e)};S.designDirty=true;}else appendDrawing(designPoint(e));});
function fixedStamp(p){const r=Math.max(CELL*3,E.radius*6);return {a:p,b:{x:p.x+r,y:p.y+r}};}
function pointerEnd(e,cancel=false){E.pointers.delete(e.pointerId);if(E.gesture){if(E.pointers.size<2)E.gesture=null;endDrawing();return;}if(e.pointerId!==S.designPointer)return;if(!cancel&&S.currentPath)appendDrawing(designPoint(e));if(E.preview&&!cancel){const shape=fixedStamp(designPoint(e));commitShape(shape.a,shape.b);}endDrawing();}
dc.addEventListener('pointerup',e=>pointerEnd(e));dc.addEventListener('pointercancel',e=>pointerEnd(e,true));dc.addEventListener('lostpointercapture',e=>{E.pointers.delete(e.pointerId);if(e.pointerId===S.designPointer)endDrawing();});
$('undo').onclick=()=>{endDrawing();if(history.length){future.push(snapshot());restore(history.pop());saveDesign();}};
$('redo').onclick=()=>{endDrawing();if(future.length){history.push(snapshot());restore(future.pop());saveDesign();}};
$('clear').onclick=()=>{endDrawing();if(!countArmor(S.grid))return;remember();S.grid.fill(0);colors.fill(0);refreshInk();saveDesign();};
function sample(){endDrawing();remember();restore({...makeStarter(selectedSlot),name:S.shipName});saveDesign();}
$('sample').onclick=sample;

function saveDesign(){designMaster=snapshot();slots[selectedSlot]=countArmor(S.grid)?designMaster:null;renderHome();try{localStorage.setItem(KEY+'.hangar.v3',JSON.stringify({version:3,starters:1,side:N,selected:selectedSlot,slots}));$('editorStatus').textContent=`機体 ${selectedSlot+1} を自動保存しました。`;}catch(_){$('editorStatus').textContent='保存できませんでした。画面を閉じると機体が失われる場合があります。';$('homeStatus').textContent='端末への保存ができません。ブラウザーの空き容量・保存設定をご確認ください。';}}
function normalizeDesign(v){if(!v||!Array.isArray(v.grid)||!Array.isArray(v.colors)||v.grid.length!==v.colors.length)return null;const oldSide=Math.sqrt(v.grid.length);if(oldSide!==81&&oldSide!==N)return null;const g=new Array(N*N).fill(0),c=new Array(N*N).fill(0);for(let y=0;y<N;y++)for(let x=0;x<N;x++){const old=Math.floor(y*oldSide/N)*oldSide+Math.floor(x*oldSide/N),k=y*N+x;if(v.grid[old]===1){g[k]=1;const color=v.colors[old];c[k]=Number.isInteger(color)&&color>=0&&color<=0xffffff?color:0x8eeedb;}}return {name:cleanName(v.name),grid:g,colors:c};}

const STARTER_NAMES=['バランス型','速度型','攻撃型'];
const STARTER_HELP=['装甲・速度・火力をほどよく両立。','軽量で移動・弾速が速い機体。','短い砲口までの経路で連射を重視。'];
function makeStarter(type){const grid=new Array(N*N).fill(0),colors=new Array(N*N).fill(0);
const polygon=(p,points)=>{let inside=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const [x,y]=points[i],[xx,yy]=points[j];if((y>p.y)!==(yy>p.y)&&p.x<(xx-x)*(p.y-y)/(yy-y)+x)inside=!inside;}return inside;};
const outline=(p,points,r)=>{for(let i=0;i<points.length-1;i++){const a=points[i],b=points[i+1],dx=b[0]-a[0],dy=b[1]-a[1],u=clamp(((p.x-a[0])*dx+(p.y-a[1])*dy)/(dx*dx+dy*dy||1),0,1);if(Math.hypot(p.x-a[0]-dx*u,p.y-a[1]-dy*u)<=r)return true;}return false;};
for(let k=0;k<grid.length;k++){const q=cellPoint(k);if(len(q)<=CORE+.018)continue;let color=0;
if(type===0){const hull=[[0,-.80],[-.18,-.23],[-.70,.37],[-.28,.24],[-.22,.64],[0,.43],[.22,.64],[.28,.24],[.70,.37],[.18,-.23],[0,-.80]];if(outline(q,hull,.029))color=0x79e8c2;if(polygon(q,[[-.11,-.30],[.11,-.30],[.14,.34],[-.14,.34]]))color=0x2d8a85;if(outline(q,[[-.50,.28],[-.20,.05],[0,.19],[.20,.05],[.50,.28]],.022))color=0xd2fff0;}
else if(type===1){if(outline(q,[[0,-.72],[-.035,-.12],[-.70,.28],[-.035,.20],[-.035,.66],[0,.50],[.035,.66],[.035,.20],[.70,.28],[.035,-.12],[0,-.72]],.009))color=0x66b9ff;if(Math.abs(q.x)<.018&&q.y<-.13&&q.y>-.72)color=0xe6f6ff;if(q.y>.34&&q.y<.45&&Math.abs(q.x)<.045)color=0xffc373;}
else {if(polygon(q,[[-.24,-.24],[.24,-.24],[.31,.02],[.27,.25],[.12,.35],[0,.25],[-.12,.35],[-.27,.25],[-.31,.02]]))color=0xe87953;if(Math.abs(q.x)<.052&&q.y<-.12&&q.y>-.255)color=0xffdf87;if(Math.abs(q.x)>.14&&Math.abs(q.x)<.27&&q.y>-.08&&q.y<.12)color=0x663f4b;if(q.y>.18&&q.y<.25&&Math.abs(q.x)<.20)color=0xffc27b;}
if(color){grid[k]=1;colors[k]=color;}}
return {name:STARTER_NAMES[type],grid,colors};}
const starterDesigns=[0,1,2].map(makeStarter);
function starterType(v,i){if(!v)return false;const d=starterDesigns[i];return v.grid.every((value,k)=>value===d.grid[k]&&v.colors[k]===d.colors[k]);}
function load(){let seedStarters=true;try{S.best=Math.max(0,Number(localStorage.getItem(KEY+'.best'))||0);const hangar=JSON.parse(localStorage.getItem(KEY+'.hangar.v3'));if(hangar?.version===3&&Array.isArray(hangar.slots)&&hangar.slots.length===3){seedStarters=hangar.starters!==1;slots=hangar.slots.map(normalizeDesign);selectedSlot=Number.isInteger(hangar.selected)?clamp(hangar.selected,0,2):0;}else{const saved=JSON.parse(localStorage.getItem(KEY+'.design.v2'));const migrated=normalizeDesign(saved);if(migrated)slots[0]=migrated;else{const paths=JSON.parse(localStorage.getItem(KEY+'.design'));if(Array.isArray(paths)&&paths.length<=200){S.paths=paths.filter(p=>Array.isArray(p)&&p.length<=3000).map(p=>p.filter(q=>Number.isFinite(q.x)&&Number.isFinite(q.y)).map(q=>({x:clamp(q.x,-.94,.94),y:clamp(q.y,-.94,.94)})));rebuild();if(countArmor(S.grid))slots[0]=snapshot();}}}}catch(_){}if(seedStarters)for(let i=0;i<3;i++)if(!slots[i]||!slots[i].grid.some(Boolean))slots[i]=makeStarter(i);chooseSlot(selectedSlot);}
function chooseSlot(i){selectedSlot=i;S.shipName=cleanName(slots[i]?.name);if(slots[i])slots[i].name=S.shipName;history.length=future.length=0;restore(slots[i]||{grid:new Array(N*N).fill(0),colors:new Array(N*N).fill(0)});designMaster=snapshot();renderHome();try{localStorage.setItem(KEY+'.hangar.v3',JSON.stringify({version:3,starters:1,side:N,selected:selectedSlot,slots}));}catch(_){}}
function renderHome(){for(let i=0;i<3;i++){const b=$('slot'+i);b.setAttribute('aria-pressed',String(selectedSlot===i));$('slotLabel'+i).textContent=slots[i]?(slots[i].name||'名無し'):'未作成';const c=$('slotPreview'+i).getContext('2d');c.clearRect(0,0,180,180);c.fillStyle='#0b1929';c.fillRect(0,0,180,180);const v=slots[i];if(v){for(let k=0;k<v.grid.length;k++)if(v.grid[k]){const q=cellPoint(k);c.fillStyle=colorHex(v.colors[k]);c.fillRect(90+q.x*78,90+q.y*78,CELL*78+.1,CELL*78+.1);}disc(c,{x:90,y:90},CORE*78,'#f2fffc');}else{c.fillStyle='#618496';c.font='32px sans-serif';c.textAlign='center';c.fillText('+',90,102);}}$('homeSelection').textContent=shipDisplayName()+(starterType(slots[selectedSlot],selectedSlot)&&shipDisplayName()!==STARTER_NAMES[selectedSlot]?' / '+STARTER_NAMES[selectedSlot]:'');$('homeStatus').textContent=starterType(slots[selectedSlot],selectedSlot)?STARTER_HELP[selectedSlot]:'機体を選んで編集・出撃。';$('launch').disabled=!slots[selectedSlot]||S.ink<1;$('homeDesign').textContent='デザイン';drawHangar();}
function drawHangar(){const c=$('hangarHero').getContext('2d'),v=slots[selectedSlot];c.clearRect(0,0,660,360);c.fillStyle='#050505';c.fillRect(0,0,660,360);c.strokeStyle='#1b1b1b';c.lineWidth=1;for(let x=0;x<660;x+=30){c.beginPath();c.moveTo(x,0);c.lineTo(x,360);c.stroke();}for(let y=0;y<360;y+=30){c.beginPath();c.moveTo(0,y);c.lineTo(660,y);c.stroke();}c.strokeStyle='#ffffff22';c.setLineDash([5,9]);c.beginPath();c.moveTo(330,20);c.lineTo(330,340);c.moveTo(100,180);c.lineTo(560,180);c.stroke();c.setLineDash([]);c.strokeStyle='#ffffff22';c.strokeRect(175,25,310,310);if(v){for(let k=0;k<v.grid.length;k++)if(v.grid[k]){const q=cellPoint(k);c.fillStyle=colorHex(v.colors[k]);c.fillRect(330+q.x*145,180+q.y*145,CELL*145+.2,CELL*145+.2);}disc(c,{x:330,y:180},CORE*145,'#f2fffc');const used=Math.min(100,v.grid.reduce((a,b)=>a+b,0)/72);$('homeInk').textContent=Math.round(used)+'%';$('homePower').textContent=Math.round(powerForInk(used));$('homeSpeed').textContent=used<30?'軽量':used<70?'標準':'重装';}else{c.fillStyle='#888888';c.textAlign='center';c.font='14px sans-serif';c.fillText('NO FIGHTER',330,188);$('homeInk').textContent='—';$('homePower').textContent='—';$('homeSpeed').textContent='未作成';}$('hangarNumber').textContent=String(selectedSlot+1).padStart(2,'0');}
function importRaster(v){endDrawing();remember();restore(v);saveDesign();E.x=E.y=0;setZoom(1);$('editorStatus').textContent='画像を機体に反映しました。ペンや消しゴムで仕上げられます。';}
$('shipName').addEventListener('change',()=>{S.shipName=cleanName($('shipName').value);$('shipName').value=S.shipName;saveDesign();});
function openDesigner(){endDrawing();E.pointers.clear();E.gesture=null;E.x=E.y=0;setZoom(1);showPhase('edit');$('editorStatus').textContent=`機体 ${selectedSlot+1} を編集中。操作ごとに自動保存します。`;fitLayout();}
function goHome(){endDrawing();globalThis.LabMetrics?.end();resetPad();S.keys.clear();if(designMaster)restore(designMaster);showPhase('home');syncMusic();renderHome();document.querySelector('.app').scrollTop=0;}
$('editorHome').onclick=()=>{endDrawing();saveDesign();goHome();};$('homeDesign').onclick=openDesigner;$('saveHome').onclick=()=>{endDrawing();saveDesign();goHome();};$('resultHome').onclick=goHome;for(let i=0;i<3;i++)$('slot'+i).onclick=()=>chooseSlot(i);
for(const button of document.querySelectorAll('[data-tool]'))button.onclick=()=>{endDrawing();E.tool=button.dataset.tool;for(const b of document.querySelectorAll('[data-tool]'))b.setAttribute('aria-pressed',String(b===button));$('editorStatus').textContent=['pen','eraser'].includes(E.tool)?'指でなぞって編集。2本指で拡大・移動できます。':'タップでスタンプを配置。大きさはドットサイズに連動します。';};
$('paintColor').oninput=e=>{E.color=e.target.value;};for(const b of document.querySelectorAll('[data-color]'))b.onclick=()=>{E.color=b.dataset.color;$('paintColor').value=E.color;};
$('dotSize').onchange=e=>{E.radius=Number(e.target.value)*CELL/2;};
$('zoomIn').onclick=()=>setZoom(E.zoom+.5);$('zoomOut').onclick=()=>setZoom(E.zoom-.5);$('zoomReset').onclick=()=>{E.x=E.y=0;setZoom(1);};
let audioContext=null,music=null,musicSource=null,musicGain=null,musicKind='',musicRequest=0;
const audioPrefs={bgm:.35,se:.6};
try{const saved=JSON.parse(localStorage.getItem(KEY+'.audio'));for(const k of ['bgm','se'])if(Number.isFinite(saved?.[k]))audioPrefs[k]=clamp(saved[k],0,1);}catch(_){}
function unlockAudio(){try{audioContext||=new(window.AudioContext||window.webkitAudioContext)();audioContext.resume()?.catch(()=>{});}catch(_){} }
function syncMusic(){
 const active=S.sound&&S.phase==='running',kind=S.boss?'boss':'stage';
 if(!music){music=new Audio();music.loop=true;music.preload='auto';try{musicSource=audioContext?.createMediaElementSource(music);musicGain=audioContext?.createGain();if(musicSource){musicSource.connect(musicGain);musicGain.connect(audioContext.destination);}}catch(_){}}
 if(kind!==musicKind){musicKind=kind;music.src='audio/'+kind+'.mp3';}
 if(musicGain)musicGain.gain.value=audioPrefs.bgm;else music.volume=audioPrefs.bgm;
 const request=++musicRequest;if(active&&audioPrefs.bgm>0)music.play().catch(error=>{if(error.name!=='AbortError'&&request===musicRequest&&S.phase==='running'&&S.sound)$('battleStatus').textContent='BGMを再生できません。音をOFF→ONにすると再試行します。';});else music.pause();
}
function tone(freq,end,duration,gain,type='sine',delay=0){if(!S.sound||!audioContext||audioPrefs.se===0)return;const t=audioContext.currentTime+delay,o=audioContext.createOscillator(),g=audioContext.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,end),t+duration);g.gain.setValueAtTime(gain*audioPrefs.se,t);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g);g.connect(audioContext.destination);o.onended=()=>{o.disconnect();g.disconnect();};o.start(t);o.stop(t+duration+.01);}
let lastShotSound=0;
function sound(type){if(!S.sound||!audioContext)return;try{
 if(type==='shot'){if(audioContext.currentTime-lastShotSound<.055)return;lastShotSound=audioContext.currentTime;tone(1150,380,.065,.045,'triangle');}
 else if(type==='hit'){tone(150,35,.19,.22,'sawtooth');tone(80,45,.12,.12,'square');}
 else if(type==='kill'){tone(280,40,.19,.13,'sawtooth');tone(550,80,.12,.06,'triangle');}
 else if(type==='item'){[523,659,784].forEach((f,i)=>tone(f,f,.14,.12,'sine',i*.06));}
 else if(type==='warning'){[0,.22,.44].forEach(d=>tone(330,260,.14,.11,'square',d));}
 else if(type==='clear'){[523,659,784,1047].forEach((f,i)=>tone(f,f,.25,.13,'triangle',i*.1));}
 else{tone(180,24,.65,.20,'sawtooth');}
 }catch(_){} }
function updateAudioButtons(){for(const [id,k,label] of [['bgmToggle','bgm','BGM'],['seToggle','se','効果音'],['battleBgm','bgm','BGM'],['battleSe','se','効果音']]){const on=audioPrefs[k]>0;$(id).textContent=label+' '+(on?'ON':'OFF');$(id).setAttribute('aria-pressed',String(on));}}
function toggleAudio(k){audioPrefs[k]=audioPrefs[k]>0?0:k==='bgm'?.35:.6;try{localStorage.setItem(KEY+'.audio',JSON.stringify(audioPrefs));}catch(_){}unlockAudio();updateAudioButtons();syncMusic();if(k==='se'&&audioPrefs.se>0)sound('item');}
$('bgmToggle').onclick=$('battleBgm').onclick=()=>toggleAudio('bgm');$('seToggle').onclick=$('battleSe').onclick=()=>toggleAudio('se');updateAudioButtons();
function resizeFlight(force=false){if(!force&&S.flightSize)return S.flightSize;const r=fc.getBoundingClientRect(),width=r.width||360,height=r.height||540,dpr=Math.min(devicePixelRatio||1,3);if(fc.width!==Math.round(width*dpr)||fc.height!==Math.round(height*dpr)){fc.width=Math.round(width*dpr);fc.height=Math.round(height*dpr);}S.flightSize={width,height,dpr};return S.flightSize;}
let W=360,H=540;
function localToWorld(p){return S.mode==='vertical'?{x:S.ship.x+p.x*SCALE,y:S.ship.y+p.y*SCALE}:{x:S.ship.x-p.y*SCALE,y:S.ship.y+p.x*SCALE};}
function worldToLocal(p,ship=S.ship){return S.mode==='vertical'?{x:(p.x-ship.x)/SCALE,y:(p.y-ship.y)/SCALE}:{x:(p.y-ship.y)/SCALE,y:-(p.x-ship.x)/SCALE};}
async function requestControls(){S.control=$('controlMode').value;if(S.control!=='gyro')return '四角い操作エリアで指をずらすと移動。射撃は自動です。';try{const event=window.DeviceOrientationEvent;if(!event)throw Error('unsupported');if(typeof event.requestPermission==='function'&&await event.requestPermission()!=='granted')throw Error('denied');S.neutral=S.sensor?{...S.sensor}:null;return 'ジャイロ操作。今の持ち方を基準にします。';}catch(_){S.control='stick';$('controlMode').value='stick';return 'ジャイロを利用できないため、タッチパッドに切り替えました。';}}
function orientation(e){if(!Number.isFinite(e.beta)||!Number.isFinite(e.gamma))return;S.sensor={beta:e.beta,gamma:e.gamma};if(!S.neutral&&S.control==='gyro')S.neutral={...S.sensor};}
window.addEventListener('deviceorientation',orientation);
function calibrate(){S.neutral=S.sensor?{...S.sensor}:null;$('battleStatus').textContent='現在の持ち方を移動の基準にしました。';}
$('calibrate').onclick=calibrate;
function showPhase(phase){S.phase=phase;$('home').hidden=phase!=='home';$('editor').hidden=phase!=='edit';$('battle').hidden=!['running','paused'].includes(phase);$('results').hidden=phase!=='result';document.body.dataset.phase=phase;document.querySelector('.app').scrollTop=0;fitLayout();}
async function launch(){if(S.launching||S.phase==='running'||S.ink<1)return;S.launching=true;endDrawing();$('launch').disabled=true;$('editorStatus').textContent='出撃準備中…';unlockAudio();const message=await requestControls();S.launching=false;startRun(message);}
function newRunId(){const a=new Uint8Array(16);if(globalThis.crypto?.getRandomValues)crypto.getRandomValues(a);else for(let i=0;i<a.length;i++)a[i]=Math.random()*256;return Array.from(a,x=>x.toString(16).padStart(2,'0')).join('');}
function captureRankingThumbnail(){try{const canvas=document.createElement('canvas');canvas.width=canvas.height=64;const c=canvas.getContext('2d');c.fillStyle='#0b1929';c.fillRect(0,0,64,64);drawShip(c,S.grid,{x:32,y:32},29,S.mode==='horizontal'?Math.PI/2:0);const data=canvas.toDataURL('image/png');return data.length<=24022?data:'';}catch(_){return '';}}
function rankingRecord(){if(S.phase!=='result')return null;const k=killStats();return {run:S.runId,slot:selectedSlot,name:shipDisplayName(),thumbnail:S.runThumbnail,score:Math.floor(S.score),seconds:Number(S.elapsed.toFixed(3)),round:S.round,bosses:S.bossKills,killed:k.destroyed,spawned:k.spawned,mode:S.mode,version:'0.5.1'};}
function startRun(message='エンドレス：コアを守り、ボスを倒して次の周回へ。'){
 if($('sonMessage').open)$('sonMessage').close();S.runId=newRunId();S.coreDestroyed=false;globalThis.InkResultImage?.clear();if(designMaster)restore(designMaster);rebuild();S.stats=Object.freeze(analyze(S.grid,S.ink));S.mode=$('scrollMode').value;S.nozzle={...S.stats.nozzle};S.runThumbnail=captureRankingThumbnail();S.initialArmor=countArmor(S.grid);S.armorCount=S.initialArmor;S.energy=0;$('bossHud').hidden=true;$('bossFill').style.width='100%';resetPad();S.score=0;S.kills=0;S.elapsed=0;S.round=1;S.roundStart=0;S.nextBossAt=BOSS_INTERVAL;S.bossKills=0;S.enemies=[];S.bullets=[];S.shots=[];S.particles=[];S.scorePops=[];S.spawnClock=2.0;S.weapon=0;S.shield=0;S.invulnerable=0;S.items=[];S.dropIndex=0;S.boss=null;S.bossWarned=false;S.originalGrid=copyGrid(S.grid);S.originalColors=new Uint32Array(colors);S.originalNozzle={...S.stats.nozzle};S.enemyId=0;S.shake=0;S.stick=null;S.keys.clear();S.gyroStart=performance.now();showPhase('running');globalThis.LabMetrics?.start({mode:S.mode});const size=resizeFlight();W=size.width;H=size.height;S.ship=S.mode==='vertical'?{x:W*.5,y:H*.77}:{x:W*.23,y:H*.5};S.previousShip={...S.ship};S.lastStamp=performance.now();S.stars=Array.from({length:65},()=>({x:Math.random()*W,y:Math.random()*H,z:.25+Math.random()*.75}));$('flightOverlay').hidden=true;$('calibrate').hidden=S.control!=='gyro';$('battleHint').textContent=S.control==='gyro'?'傾けて移動 / 基準合わせで再調整':'四角いエリアで指をずらして移動 / 自動射撃';$('battleStatus').textContent=message;$('controlPad').hidden=S.control==='gyro';saveDesign();updateHUD();fitLayout();syncMusic();window.scrollTo?.(0,0);
}
$('launch').onclick=launch;$('retry').onclick=launch;
function edit(){globalThis.LabMetrics?.end();resetPad();S.keys.clear();showPhase('edit');syncMusic();if(designMaster)restore(designMaster);rebuild();$('editorStatus').textContent='装甲を修復しました。形を変えて、もう一度出撃しよう。';window.scrollTo?.(0,0);}
$('edit').onclick=edit;$('backEditor').onclick=edit;
function pause(){if(S.phase!=='running')return;globalThis.LabMetrics?.pause();S.phase='paused';S.stick=null;S.keys.clear();$('flightOverlay').hidden=false;resetPad();syncMusic();}
function resume(){if(S.phase!=='paused'||$('sonMessage').open)return;globalThis.LabMetrics?.resume();S.phase='running';S.lastStamp=performance.now();if(S.control==='gyro')S.neutral=S.sensor?{...S.sensor}:null;$('flightOverlay').hidden=true;syncMusic();}
$('pause').onclick=pause;$('resume').onclick=resume;document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});window.addEventListener('pagehide',pause);
// Focus can leave the game for an ad iframe or browser UI while the page stays visible.
window.addEventListener('blur',()=>{S.keys.clear();});
const pad=$('controlPad'),knob=$('padKnob'),padOrigin=$('padOrigin');
function pointerPosition(e){const r=pad.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top};}
function resetPad(clearMovement=true){S.stick=null;pad.dataset.active='false';if(clearMovement)S.padDelta={x:0,y:0};}
function movePad(e){if(S.stick?.id!==e.pointerId)return;e.preventDefault();const next=pointerPosition(e);S.padDelta.x+=next.x-S.stick.current.x;S.padDelta.y+=next.y-S.stick.current.y;S.stick.current=next;const r=pad.getBoundingClientRect();knob.style.left=clamp(S.stick.current.x,12,r.width-12)+'px';knob.style.top=clamp(S.stick.current.y,12,r.height-12)+'px';}
pad.addEventListener('pointerdown',e=>{if(S.phase!=='running'||S.control!=='stick'||S.stick)return;e.preventDefault();const origin=pointerPosition(e);S.stick={id:e.pointerId,origin,current:{...origin}};padOrigin.style.left=origin.x+'px';padOrigin.style.top=origin.y+'px';pad.dataset.active='true';pad.setPointerCapture(e.pointerId);movePad(e);});
pad.addEventListener('pointermove',movePad);
function releaseStick(e){if(S.stick?.id!==e.pointerId)return;resetPad(false);try{pad.releasePointerCapture(e.pointerId);}catch(_){}}
for(const event of ['pointerup','pointercancel','lostpointercapture'])pad.addEventListener(event,releaseStick);
window.addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d'].includes(e.key)&&S.phase==='running'){e.preventDefault();S.keys.add(e.key);}});window.addEventListener('keyup',e=>S.keys.delete(e.key));
function inputVector(){let x=0,y=0;if(S.control==='gyro'&&S.sensor&&S.neutral){x=clamp((S.sensor.gamma-S.neutral.gamma)/12,-1,1);y=clamp((S.sensor.beta-S.neutral.beta)/12,-1,1);if(Math.abs(x)<.035)x=0;if(Math.abs(y)<.035)y=0;}x+=(S.keys.has('ArrowRight')||S.keys.has('d')?1:0)-(S.keys.has('ArrowLeft')||S.keys.has('a')?1:0);y+=(S.keys.has('ArrowDown')||S.keys.has('s')?1:0)-(S.keys.has('ArrowUp')||S.keys.has('w')?1:0);const n=Math.max(1,hypot(x,y));return{x:x/n,y:y/n};}
function burst(p,color,n=12){for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,s=20+Math.random()*110;S.particles.push({x:p.x,y:p.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:.20+Math.random()*.35,max:.55,color});}if(S.particles.length>260)S.particles.splice(0,S.particles.length-260);}
function eraseArmor(p,r){let removed=0;for(let k=0;k<S.grid.length;k++)if(S.grid[k]&&distance(cellPoint(k),p)<r){S.grid[k]=0;removed++;}if(removed){S.armorCount=countArmor(S.grid);S.nozzle=findNozzle(S.grid);S.shake=.10;sound('hit');burst(localToWorld(p),'#7cffe0',8);}return removed;}
function armorAt(g,p,r){const ix=Math.floor((p.x+1)/CELL),iy=Math.floor((p.y+1)/CELL),reach=Math.ceil(r/CELL)+1;for(let y=Math.max(0,iy-reach);y<=Math.min(N-1,iy+reach);y++)for(let x=Math.max(0,ix-reach);x<=Math.min(N-1,ix+reach);x++){const k=y*N+x;if(g[k]&&distance(p,cellPoint(k))<=r+CELL*.72)return cellPoint(k);}return null;}
function hullContact(a,b,r,previousShip=S.ship){const displacement=Math.max(distance(a,b),distance(previousShip,S.ship)),steps=Math.max(1,Math.ceil(displacement/1.4));for(let i=0;i<=steps;i++){const k=i/steps,ship={x:previousShip.x+(S.ship.x-previousShip.x)*k,y:previousShip.y+(S.ship.y-previousShip.y)*k},p=worldToLocal({x:a.x+(b.x-a.x)*k,y:a.y+(b.y-a.y)*k},ship),radius=r/SCALE;if(len(p)<CORE+radius)return{kind:'core',p};const armor=armorAt(S.grid,p,radius);if(armor)return{kind:'armor',p:armor};}return null;}
function fire(){const p=localToWorld(S.nozzle),base=S.mode==='horizontal'?0:-Math.PI/2,spread=S.weapon===2?[-.18,0,.18]:[0];
 if(S.weapon===1){for(const offset of [-4,4]){const q={x:p.x-Math.sin(base)*offset,y:p.y+Math.cos(base)*offset};S.shots.push({...q,previous:{...q},vx:Math.cos(base)*S.stats.bulletSpeed,vy:Math.sin(base)*S.stats.bulletSpeed,r:2.3,power:S.stats.power});}}
 else for(const d of spread)S.shots.push({...p,previous:{...p},vx:Math.cos(base+d)*S.stats.bulletSpeed,vy:Math.sin(base+d)*S.stats.bulletSpeed,r:2.3,power:S.stats.power});
 burst(p,'#ffe7a0',3);sound('shot');}
function advanceEnergy(dt,emit=fire){let remaining=dt,loops=0;while(remaining>1e-7&&loops++<500){const length=len(S.nozzle);if(length<.001)return;if(S.energy>=length-1e-7){emit();S.energy=0;continue;}const step=Math.min(.008,length-S.energy),u=(S.energy+step*.5)/length,speed=ENERGY_SPEED*(occupied(S.grid,S.nozzle.x*u,S.nozzle.y*u)?.5:1),time=step/speed;if(time<=remaining){S.energy+=step;remaining-=time;}else{S.energy+=remaining*speed;remaining=0;}}if(S.energy>=len(S.nozzle)-1e-7){emit();S.energy=0;}}
function enemyRateAt(t){const age=Math.max(0,t-S.roundStart),base=age<10?.38:age<20?.65:age<30?.95:1.3;return base*clamp((S.stats?.enemyRate||3)/3,.85,1.15)*(1+Math.max(0,S.round-1)*.3);}
function enemyTypeForRound(round,roll=Math.random()){
 if(round<2)return roll<.6?'straight':'aim';
 if(round<3)return roll<.45?'straight':roll<.8?'aim':'cross';
 return roll<.35?'straight':roll<.7?'aim':roll<.85?'cross':'diagonal';
}
function enemyShotAngles(e){
 const type=e.type||'aim';
 if(type==='straight')return[S.mode==='vertical'?Math.PI/2:Math.PI];
 if(type==='cross')return[0,Math.PI/2,Math.PI,Math.PI*1.5];
 if(type==='diagonal')return[Math.PI/4,Math.PI*.75,Math.PI*1.25,Math.PI*1.75];
 const aim=Math.atan2(S.ship.y-e.y,S.ship.x-e.x);return e.elite?[aim-.2,aim,aim+.2]:[aim];
}
function enemyFirePeriod(e){if(e.type==='cross'||e.type==='diagonal')return 2.8+Math.random()*.8;return(e.elite?.9:e.type==='straight'?1.6:1.8)+Math.random()*.8;}
function spawnEnemy(){const elite=S.elapsed-S.roundStart>22&&Math.random()<.16,phase=Math.random()*Math.PI*2,type=enemyTypeForRound(S.round);let p=S.mode==='vertical'?{x:22+Math.random()*(W-44),y:-30}:{x:W+30,y:22+Math.random()*(H-44)};const hp=elite?125:30+Math.random()*25;S.enemies.push({...p,previous:{...p},r:elite?18:10+Math.random()*4,hp,maxHp:hp,speed:(elite?45:55)+Math.min(S.elapsed,90)*.55,phase,type,fireIn:.6+Math.random()*1.2,elite,id:S.enemyId++});}
function enemyFire(e){const speed=90+Math.min(S.elapsed,90)*.8;for(const a of enemyShotAngles(e))S.bullets.push({x:e.x,y:e.y,previous:{x:e.x,y:e.y},vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,r:e.elite?4:3.2});}
function dropItem(type,p){S.items.push({type,x:p.x,y:p.y,life:14,phase:Math.random()*6});}
function collectItem(item){item.dead=true;sound('item');burst(item,'#9af5cc',15);if(item.type==='power'){if(S.weapon<2){S.weapon++;notice(S.weapon===1?'武器強化：2連装！':'武器強化：3方向弾！');}else{S.score+=300;notice('武器は最大強化：ボーナス +300');}}
 else if(item.type==='repair'){let missing=[];for(let k=0;k<S.grid.length;k++)if(S.originalGrid[k]&&!S.grid[k])missing.push(k);const repair=Math.ceil(S.initialArmor*.35);for(const k of missing.sort(()=>Math.random()-.5).slice(0,repair))S.grid[k]=1;S.armorCount=countArmor(S.grid);S.nozzle=findNozzle(S.grid);if(missing.length)notice('元の装甲を最大35%修復！');else{S.score+=150;notice('装甲は無傷：ボーナス +150');}}
 else{if(S.shield){S.score+=200;notice('バリア装備済み：ボーナス +200');}else{S.shield=1;notice('コアを1回守るバリア！');}}}
function notice(text){$('battleStatus').textContent=text;}
function updateItems(dt){const schedule=[[20,'power'],[50,'repair'],[80,'shield'],[110,'power'],[140,'repair'],[170,'shield']];while(S.dropIndex<schedule.length&&S.elapsed>=schedule[S.dropIndex][0]){const type=schedule[S.dropIndex++][1];dropItem(type,S.mode==='vertical'?{x:W*.5,y:20}:{x:W-20,y:H*.5});}
 for(const i of S.items){i.life-=dt;const d=distance(i,S.ship);if(d<105){i.x+=(S.ship.x-i.x)/Math.max(d,1)*185*dt;i.y+=(S.ship.y-i.y)/Math.max(d,1)*185*dt;}else if(S.mode==='vertical')i.y+=40*dt;else i.x-=40*dt;if(segmentHit(S.previousShip,S.ship,i,20))collectItem(i);}
 S.items=S.items.filter(i=>!i.dead&&i.life>0&&i.x>-25&&i.y<H+25);}
function coreHit(){if(S.invulnerable>0)return false;if(S.shield){S.shield=0;S.invulnerable=1.5;S.bullets=[];sound('hit');burst(S.ship,'#85cfff',25);notice('バリアがコアを守った！');return false;}finishRun(false);return true;}
function bossMoveRate(round){return round>=3?.90:.65;}
function bossActionFor(round,pattern){return round>=4&&pattern%4===3?'charge':round>=2&&pattern%2===1?'double':'spread';}
function bossVolley(b,wide,aim){for(const d of (wide?[-.65,-.43,-.215,0,.215,.43,.65]:[-.42,-.21,0,.21,.42])){const a=aim+d;S.bullets.push({x:b.x,y:b.y,previous:{x:b.x,y:b.y},vx:Math.cos(a)*125,vy:Math.sin(a)*125,r:4});}}
const SON_BOSS_MUZZLES=[{x:-35,y:-7},{x:-22,y:-17},{x:22,y:-17},{x:35,y:-7}];
function sonBossMuzzle(b,index){const p=SON_BOSS_MUZZLES[index],a=S.mode==='vertical'?Math.PI:-Math.PI/2,cs=Math.cos(a),sn=Math.sin(a);return{x:b.x+p.x*cs-p.y*sn,y:b.y+p.x*sn+p.y*cs};}
function updateSonBossGuns(b,dt){
 if(!b.sonDesign||b.entering)return;
 for(let i=0;i<4;i++){
  b.muzzleFlash[i]=Math.max(0,b.muzzleFlash[i]-dt);b.muzzleTimers[i]-=dt;
  if(b.muzzleTimers[i]>0)continue;
  const p=sonBossMuzzle(b,i),angle=Math.random()*Math.PI*2,speed=125;
  S.bullets.push({x:p.x,y:p.y,previous:{...p},vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,r:3.4,sonMuzzle:i});
  b.muzzleTimers[i]+=.14+Math.random()*.18;b.muzzleFlash[i]=.065;
 }
}
function startBoss(){const hp=1000*Math.min(3,1+(S.round-1)*.25),x=S.mode==='vertical'?W/2:W+60,y=S.mode==='vertical'?-60:H/2;S.boss={x,y,previous:{x,y},hp,maxHp:hp,r:38,age:0,movePhase:0,attackClock:2.8,pattern:0,vulnerable:0,entering:true,motion:'patrol',followUp:null,sonDesign:S.round===10,muzzleTimers:S.round===10?Array.from({length:4},()=>.1+Math.random()*.3):null,muzzleFlash:S.round===10?[0,0,0,0]:null};S.enemies=[];S.bullets=[];S.spawnClock=1.6;S.items.forEach(i=>i.life=Math.max(i.life,16));$('bossHud').hidden=false;notice(S.boss.sonDesign?'ホームの絵の機体！？ 息子が描いた機体が現れた！':'ボス出現！攻撃をかわして反撃しよう。');syncMusic();}
function defeatBoss(){const boss=S.boss;if(!boss)return;const creatorClear=S.round===10;S.kills++;S.bossKills++;awardDestruction(3500,boss);burst(boss,'#ffdf96',60);sound('clear');S.boss=null;S.enemies=[];S.bullets=[];S.shots=[];S.round++;S.roundStart=S.elapsed;S.nextBossAt=S.elapsed+BOSS_INTERVAL;S.bossWarned=false;S.spawnClock=3;S.invulnerable=Math.max(S.invulnerable,2);$('bossHud').hidden=true;notice('ボス撃破！ ROUND '+S.round+'へ'+(S.round===2?' / 十字砲台が出現':S.round===3?' / 斜め砲台が出現':' / 装甲・武器を引き継いで続行'));updateHUD();syncMusic();if(creatorClear)showSonMessage();}
function showSonMessage(){
 pause();$('flightOverlay').hidden=true;$('sonMessage').classList.remove('show-full');$('sonMessage').showModal();
}
$('sonMessage').addEventListener('cancel',e=>e.preventDefault());
$('revealSonMessage').addEventListener('click',()=>{$('sonMessage').classList.add('show-full');$('continueEndless').focus();});
$('continueEndless').addEventListener('click',()=>{if(!$('sonMessage').open)return;$('sonMessage').close();resume();notice('ROUND 11 / ここからも、エンドレス。');});
const sonBossSprite=new Image();sonBossSprite.src='assets/sons-fighter.png';
function drawSonBoss(c,b){
 c.save();c.rotate(S.mode==='vertical'?Math.PI:0);
 if(sonBossSprite.complete&&sonBossSprite.naturalWidth){c.imageSmoothingEnabled=true;c.drawImage(sonBossSprite,-56,-56,112,112);}
 else{
  c.fillStyle='#e2f4a2';c.strokeStyle='#294c69';c.lineWidth=3;c.beginPath();c.moveTo(0,-43);c.lineTo(14,-8);c.lineTo(44,19);c.lineTo(43,31);c.lineTo(11,20);c.lineTo(-11,20);c.lineTo(-43,31);c.lineTo(-44,19);c.lineTo(-14,-8);c.closePath();c.fill();c.stroke();c.fillStyle='#3ed4d2';c.fillRect(-9,-13,18,29);c.strokeRect(-9,-13,18,29);
 }
 for(let i=0;i<SON_BOSS_MUZZLES.length;i++){const p=SON_BOSS_MUZZLES[i];disc(c,p,2.1,'#254659');if(b.muzzleFlash?.[i]>0){disc(c,p,4,'#ffe7a5');disc(c,p,1.8,'#fff');}}
 c.restore();
 if(b.vulnerable>0){c.strokeStyle='#fff0ab';c.lineWidth=2;c.beginPath();c.arc(0,0,40,0,Math.PI*2);c.stroke();}
}
function moveBossToward(b,target,speed,dt){const d=distance(b,target);if(d<=speed*dt){b.x=target.x;b.y=target.y;return true;}const step=speed*dt/d;b.x+=(target.x-b.x)*step;b.y+=(target.y-b.y)*step;return false;}
function updateBoss(dt){const b=S.boss;if(!b)return;b.previous={x:b.x,y:b.y};b.age+=dt;b.vulnerable=Math.max(0,b.vulnerable-dt);
 const target=S.mode==='vertical'?{x:W/2,y:65}:{x:W-65,y:H/2};
 if(b.entering){setLabel('bossLabel','大型機 接近中');b.x+=(target.x-b.x)*Math.min(1,dt*2.5);b.y+=(target.y-b.y)*Math.min(1,dt*2.5);if(distance(b,target)<2){b.x=target.x;b.y=target.y;b.entering=false;b.movePhase=0;}$('bossFill').style.width=b.hp/b.maxHp*100+'%';return;}
 if(b.motion==='charge'){if(moveBossToward(b,b.chargeTarget,430,dt)){b.motion='return';b.vulnerable=1.6;}}
 else if(b.motion==='return'){if(moveBossToward(b,b.returnTarget,250,dt)){b.motion='patrol';b.attackClock=b.hp<b.maxHp*.45?2.1:2.8;}}
 else{
  b.movePhase+=dt*bossMoveRate(S.round);if(S.mode==='vertical'){b.x=W/2+Math.sin(b.movePhase)*Math.max(0,W/2-55);b.y=65;}else{b.y=H/2+Math.sin(b.movePhase)*Math.max(0,H/2-55);b.x=W-65;}
  if(b.followUp){b.followUp.after-=dt;if(b.followUp.after<=0){bossVolley(b,b.followUp.wide,b.followUp.aim);b.followUp=null;b.vulnerable=1.6;}}
  b.attackClock-=dt;
  if(b.attackClock<=0){const action=bossActionFor(S.round,b.pattern),wide=b.pattern%2===1;b.pattern++;b.attackClock=b.hp<b.maxHp*.45?2.1:2.8;
   if(action==='charge'){b.followUp=null;b.vulnerable=0;b.motion='charge';b.returnTarget={x:b.x,y:b.y};b.chargeTarget={x:b.x,y:b.y<H/2?H-50:50};}
   else{if(!b.sonDesign){const aim=Math.atan2(S.ship.y-b.y,S.ship.x-b.x);bossVolley(b,wide,aim);if(action==='double')b.followUp={after:.32,wide,aim};}b.vulnerable=1.6;}
  }
 }
 if(b.sonDesign)updateSonBossGuns(b,dt);
 setLabel('bossLabel',b.motion==='charge'?'突撃中':b.vulnerable>0?'弱点開放：攻撃チャンス！':b.motion==='return'?'復帰中':'防御中');$('bossFill').style.width=Math.max(0,b.hp/b.maxHp*100)+'%';}
function segmentHit(a,b,c,r){const dx=b.x-a.x,dy=b.y-a.y,k=clamp(((c.x-a.x)*dx+(c.y-a.y)*dy)/(dx*dx+dy*dy||1),0,1);return distance({x:a.x+dx*k,y:a.y+dy*k},c)<=r;}
function setLabel(id,value){const node=$(id);if(node.textContent!==value)node.textContent=value;}
// Ratios are sampled after this kill is counted. Armor means a share of launch armor.
const ENEMY_BASE_POINTS=Object.freeze({straight:100,aim:150,cross:200,diagonal:250});
const TIME_POINTS_PER_SECOND=1;
function enemyBasePoints(e){return (ENEMY_BASE_POINTS[e.type]||ENEMY_BASE_POINTS.aim)*(e.elite?3:1);}
function armorRatio(){if(S.coreDestroyed)return 0;const ratio=S.initialArmor>0?(S.armorCount??countArmor(S.grid))/S.initialArmor:0;return clamp(ratio,.01,1);}
function inkScoreMultiplier(){return 1+clamp((S.stats?.ink||0)/100,0,1);}
function destructionPoints(base){const rate=clamp((killStats().rate??0)/100,0,1);return Math.round(base*armorRatio()*rate*inkScoreMultiplier());}
function awardDestruction(base,p){const points=destructionPoints(base);S.score+=points;S.scorePops.push({x:p.x,y:p.y-10,points,life:.85,max:.85,boss:base>=3500});if(S.scorePops.length>16)S.scorePops.shift();return points;}
function advanceScorePops(dt){for(const p of S.scorePops){p.life-=dt;p.y-=18*dt;}S.scorePops=S.scorePops.filter(p=>p.life>0);}
function drawScorePops(c,w,h){c.save();c.textAlign='center';c.textBaseline='middle';c.lineJoin='round';for(const p of S.scorePops){c.globalAlpha=clamp(p.life/.25,0,1);c.font='700 '+(p.boss?17:13)+'px system-ui,sans-serif';const text='+'+p.points.toLocaleString(),half=c.measureText(text).width/2+3,x=clamp(p.x,half,w-half),y=clamp(p.y,12,h-12);c.strokeStyle='#07101dee';c.lineWidth=3;c.strokeText(text,x,y);c.fillStyle=p.boss?'#ffe4a2':'#b9ffe4';c.fillText(text,x,y);}c.restore();}
function killStats(){const spawned=S.enemyId,destroyed=Math.max(0,S.kills-S.bossKills);return {spawned,destroyed,rate:spawned?Math.min(100,destroyed/spawned*100):null};}
function killRateText(){const rate=killStats().rate;return rate===null?'—':Number(rate.toFixed(1))+'%';}
function updateHUD(){setLabel('killRate',killRateText());setLabel('score',String(Math.floor(S.score)).padStart(6,'0'));setLabel('armor',Math.round(armorRatio()*100)+'%');setLabel('missionLabel',S.boss?'BOSS / R'+S.round:'BOSS IN / R'+S.round);setLabel('time',S.boss?'BOSS':Math.max(0,S.nextBossAt-S.elapsed).toFixed(1));setLabel('weaponState',['単発','2連装','3方向'][S.weapon]+' / バリア '+(S.shield?'あり':'なし'));}

function tick(dt){if(S.phase!=='running')return;S.previousShip={...S.ship};const input=inputVector(),a=S.stats,xFactor=S.mode==='vertical'?a.sideFactor:a.forwardFactor,yFactor=S.mode==='vertical'?a.forwardFactor:a.sideFactor;const touch=S.control==='stick'?S.padDelta:{x:0,y:0};S.padDelta={x:0,y:0};const touchGain=1.65*a.moveSpeed/260;const bx=S.mode==='vertical'?[a.minX,a.maxX]:[-a.maxY,-a.minY],by=S.mode==='vertical'?[a.minY,a.maxY]:[a.minX,a.maxX];S.ship.x=clamp(S.ship.x+input.x*a.moveSpeed*xFactor*dt+touch.x*touchGain*xFactor,6-bx[0]*SCALE,W-6-bx[1]*SCALE);S.ship.y=clamp(S.ship.y+input.y*a.moveSpeed*yFactor*dt+touch.y*touchGain*yFactor,6-by[0]*SCALE,H-6-by[1]*SCALE);S.elapsed+=dt;S.invulnerable=Math.max(0,S.invulnerable-dt);S.shake=Math.max(0,S.shake-dt);advanceEnergy(dt);
if(S.elapsed>=S.nextBossAt&&!S.boss)startBoss();if(S.elapsed>=S.nextBossAt-3&&S.elapsed<S.nextBossAt&&!S.bossWarned){S.bossWarned=true;notice('WARNING：大型機接近！');sound('warning');}const bossAdds=!!S.boss&&S.round>=5&&!S.boss.entering;if((!S.boss&&S.elapsed<S.nextBossAt-3)||bossAdds){S.spawnClock-=dt;if(S.spawnClock<=0&&S.enemies.length<MAX_ENEMIES){spawnEnemy();S.spawnClock=1/(enemyRateAt(S.elapsed)*(bossAdds?.55:1));}}updateBoss(dt);updateItems(dt);
for(const e of S.enemies){e.previous={x:e.x,y:e.y};const sway=Math.sin(S.elapsed*1.4+e.phase)*18*dt;if(S.mode==='vertical'){e.y+=e.speed*dt;e.x+=sway;}else{e.x-=e.speed*dt;e.y+=sway;}e.fireIn-=dt;if(e.fireIn<=0){if(e.x>-20&&e.x<W+20&&e.y>-20&&e.y<H+20)enemyFire(e);e.fireIn=enemyFirePeriod(e);}}
for(const b of S.shots){b.previous={x:b.x,y:b.y};b.x+=b.vx*dt;b.y+=b.vy*dt;for(const e of S.enemies){if(e.dead)continue;if(segmentHit(b.previous,b,e,e.r+b.r)){e.hp-=b.power;b.dead=true;if(e.hp<=0){e.dead=true;S.kills++;awardDestruction(enemyBasePoints(e),e);burst(e,e.elite?'#ffca84':'#ff7e9c',e.elite?20:10);sound('kill');}else burst(b,'#ffd797',3);break;}}}
for(const shot of S.shots){const boss=S.boss;if(!shot.dead&&boss&&!boss.entering&&segmentHit(shot.previous,shot,boss,boss.r+shot.r)){shot.dead=true;if(boss.vulnerable>0)boss.hp-=shot.power;burst(shot,boss.vulnerable>0?'#ffda8c':'#89b6dc',3);if(boss.hp<=0){defeatBoss();return;}}}
for(const b of S.bullets){b.previous={x:b.x,y:b.y};b.x+=b.vx*dt;b.y+=b.vy*dt;const hit=hullContact(b.previous,b,b.r,S.previousShip);if(hit){b.dead=true;if(hit.kind==='core'){if(coreHit())return;continue;}eraseArmor(hit.p,.155+b.r/SCALE);}}
for(const e of S.enemies){if(e.dead)continue;const hit=hullContact(e.previous,e,e.r,S.previousShip);if(hit){e.dead=true;if(hit.kind==='core'){if(coreHit())return;continue;}eraseArmor(hit.p,.18+e.r/SCALE*.55);burst(e,'#f1ae8e',12);}}
if(S.boss&&!S.boss.entering){const b=S.boss,previous=b.previous||b;if(segmentHit({x:previous.x-S.previousShip.x,y:previous.y-S.previousShip.y},{x:b.x-S.ship.x,y:b.y-S.ship.y},{x:0,y:0},b.r+CORE*SCALE)){if(coreHit())return;}}
const visible=b=>!b.dead&&b.x>-70&&b.x<W+70&&b.y>-70&&b.y<H+70;S.enemies=S.enemies.filter(visible);S.bullets=S.bullets.filter(visible);S.shots=S.shots.filter(visible).slice(-240);for(const p of S.particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;}S.particles=S.particles.filter(p=>p.life>0);for(const p of S.stars){if(S.mode==='vertical')p.y=(p.y+30*p.z*dt)%H;else p.x=(p.x-30*p.z*dt+W)%W;}advanceScorePops(dt);S.score+=dt*TIME_POINTS_PER_SECOND;updateHUD();
}
function finishRun(){if(S.phase!=='running')return;S.coreDestroyed=true;updateHUD();let bests=[];try{bests=JSON.parse(localStorage.getItem(KEY+'.slotBests.v1'))||[];}catch(_){}if(!Array.isArray(bests))bests=[];const old=bests[selectedSlot],score=Math.floor(S.score);S.runBest=!Number.isFinite(old)||score>old;if(S.runBest){bests[selectedSlot]=score;try{localStorage.setItem(KEY+'.slotBests.v1',JSON.stringify(bests));}catch(_){}}globalThis.LabMetrics?.end('fail');S.stick=null;S.keys.clear();S.best=Math.max(S.best,Math.floor(S.score));try{localStorage.setItem(KEY+'.best',String(S.best));}catch(_){}resetPad();showPhase('result');syncMusic();$('resultShipName').textContent=shipDisplayName();$('rankingStatus').textContent='';$('resultTitle').textContent='CORE LOST';$('resultLead').textContent='コアに被弾。次の一筆で、戦い方を変えよう。';$('resultScore').textContent=Math.floor(S.score).toLocaleString();$('resultKills').textContent=S.kills+' 機';$('resultKillRate').textContent=killRateText();$('resultBossKills').textContent=S.bossKills+' 体';const ratio=killStats();$('resultRateDetail').textContent=`雑魚 ${ratio.destroyed} / ${ratio.spawned}体を撃破。見逃し・撤退・残存も出現数に含み、ボスは別集計。`;$('resultTime').textContent=S.elapsed.toFixed(1)+' 秒';$('resultBest').textContent=S.best.toLocaleString();$('designReport').textContent=`INK ${Math.round(S.stats.ink)} / 100 ・ 火力 ${Math.round(S.stats.power)}\n${S.mode==='vertical'?'縦':'横'}スクロール ・ 装甲残り ${Math.round(armorRatio()*100)}%\nROUND ${S.round} ・ ボス撃破 ${S.bossKills}体`;$('shareStatus').textContent='';drawResult();sound('end');window.scrollTo?.(0,0);globalThis.InkstrikeRanking?.onResult();}
function disc(c,p,r,color){c.beginPath();c.arc(p.x,p.y,r,0,Math.PI*2);c.fillStyle=color;c.fill();}
function pathLine(c,a,b,color,width){c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.strokeStyle=color;c.lineWidth=width;c.stroke();}
function drawShip(c,grid,center,scale,rotation=0,packet=-1,shipColors=colors,nozzle=S.nozzle){c.save();c.translate(center.x,center.y);c.rotate(rotation);c.fillStyle='#8eeedb';for(let k=0;k<grid.length;k++)if(grid[k]){const p=cellPoint(k);c.fillStyle=colorHex(shipColors[k]??0x8eeedb);c.fillRect((p.x-CELL/2)*scale,(p.y-CELL/2)*scale,CELL*scale+.25,CELL*scale+.25);}const end={x:nozzle.x*scale,y:nozzle.y*scale};pathLine(c,{x:0,y:0},end,'#ffc97144',Math.max(1,scale*.009));if(packet>=0&&len(nozzle)>0){const u=clamp(packet/len(nozzle),0,1);disc(c,{x:end.x*u,y:end.y*u},Math.max(2.5,scale*.025),'#ffde8d');}disc(c,{x:0,y:0},(CORE+.045)*scale,'#5cf6dd22');disc(c,{x:0,y:0},CORE*scale,'#f2fffc');disc(c,{x:0,y:0},CORE*.5*scale,'#58dcc8');disc(c,end,Math.max(2.5,scale*.025),'#ffd183');c.restore();}
function drawEditor(){const r=dc.getBoundingClientRect(),size=r.width||360,dpr=Math.min(devicePixelRatio||1,3);if(dc.width!==Math.round(size*dpr)){dc.width=dc.height=Math.round(size*dpr);S.designDirty=true;}dctx.setTransform(dpr,0,0,dpr,0,0);dctx.clearRect(0,0,size,size);dctx.fillStyle='#0d1b2c';dctx.fillRect(0,0,size,size);dctx.strokeStyle='#1d3549';dctx.lineWidth=1;for(let i=1;i<16;i++){const x=size*i/16;pathLine(dctx,{x,y:0},{x,y:size},'#1d3549',.6);pathLine(dctx,{x:0,y:x},{x:size,y:x},'#1d3549',.6);}dctx.setLineDash([3,5]);dctx.beginPath();dctx.arc(size/2,size/2,size*.075,0,Math.PI*2);dctx.strokeStyle='#66e6cf44';dctx.stroke();dctx.setLineDash([]);dctx.save();dctx.translate(size/2+E.x*size/2,size/2+E.y*size/2);dctx.scale(E.zoom,E.zoom);drawShip(dctx,S.grid,{x:0,y:0},size/2);if(E.preview){const shape=fixedStamp(E.preview.a),pts=shapePoints(shape.a,shape.b);for(let i=1;i<pts.length;i++)pathLine(dctx,{x:pts[i-1].x*size/2,y:pts[i-1].y*size/2},{x:pts[i].x*size/2,y:pts[i].y*size/2},E.color,Math.max(1,E.radius*size));}dctx.restore();dctx.fillStyle='#7093a7';dctx.font='9px sans-serif';dctx.textAlign='center';dctx.fillText('CORE',size/2,size/2+size*.09);S.designDirty=false;}
function drawEnemy(c,e){
 const r=e.r,type=e.type||'aim',color=type==='straight'?'#ff8ca8':type==='cross'?'#ffc17f':type==='diagonal'?'#8fc6ff':'#df9bff';
 c.save();c.translate(e.x,e.y);c.rotate(S.mode==='vertical'?0:Math.PI/2);c.scale(r,r);c.lineJoin='round';c.lineWidth=e.elite?.105:.085;
 const poly=(points,fill,stroke=color)=>{c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.stroke();}};
 const line=(points,stroke=color,width=.09)=>{c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=stroke;c.lineWidth=width;c.stroke();};
 // Jointed limbs distinguish the silhouettes before the interior details do.
 for(const side of [-1,1]){
  if(type==='diagonal'){
   poly([[side*.15,-.38],[side*.85,-.82],[side*.98,-.12],[side*.54,.31],[side*.89,.72],[side*.27,.61],[side*.12,.14]],'#263e59');
   poly([[side*.3,-.27],[side*.77,-.54],[side*.74,-.12],[side*.39,.07]],'#5780a4',null);
  }else{
   for(const [y,end] of [[-.42,-.77],[-.06,-.02],[.3,.66]])line([[side*.28,y],[side*.7,y-.15],[side*.94,end]],type==='cross'?'#d79e6d':color,.1);
  }
  if(type==='cross')poly([[side*.37,.28],[side*.67,.12],[side*.95,.31],[side*.88,.69],[side*.64,.83],[side*.74,.49],[side*.49,.55]],'#795039');
  // Short antennae; no aircraft nose or swept wings.
  line([[side*.16,.58],[side*.31,.86],[side*.43,.8]],color,.075);
 }
 if(type==='straight'){
  poly([[0,-.84],[-.36,-.66],[-.49,-.15],[-.4,.44],[0,.7],[.4,.44],[.49,-.15],[.36,-.66]],'#4e293d');
  poly([[-.07,-.64],[-.31,-.47],[-.33,.18],[-.09,.36]],'#a64e6f',null);poly([[.07,-.64],[.31,-.47],[.33,.18],[.09,.36]],'#a64e6f',null);line([[0,-.67],[0,.3]],color,.06);
 }else if(type==='aim'){
  poly([[0,-.79],[-.3,-.59],[-.38,-.17],[-.18,.13],[0,.21],[.18,.13],[.38,-.17],[.3,-.59]],'#543461');
  poly([[0,-.55],[-.19,-.35],[0,-.14],[.19,-.35]],'#8b5b9c',null);
 }else if(type==='cross'){
  poly([[-.39,-.51],[-.58,-.19],[-.49,.39],[0,.61],[.49,.39],[.58,-.19],[.39,-.51]],'#4e3628');
  poly([[-.33,-.28],[-.4,.15],[0,.33],[.4,.15],[.33,-.28]],'#a16d44',null);
 }else{
  poly([[0,-.83],[-.18,-.41],[-.19,.37],[0,.66],[.19,.37],[.18,-.41]],'#354961');line([[0,-.58],[0,.28]],'#a4d9ef',.065);
 }
 poly([[-.25,.28],[-.31,.51],[-.16,.72],[.16,.72],[.31,.51],[.25,.28]],'#272739');
 const eyes=e.elite?'#fff0aa':'#edf5ff';poly([[-.21,.43],[-.06,.46],[-.09,.55],[-.2,.53]],eyes,null);poly([[.21,.43],[.06,.46],[.09,.55],[.2,.53]],eyes,null);
 if(e.elite){for(const side of [-1,1])poly([[side*.3,-.2],[side*.41,-.1],[side*.35,.09],[side*.24,-.03]],'#ffe1a1',null);}
 c.restore();
 // Preserve the aiming enemy's independently tracking turret.
 if(type==='aim'){
  c.save();c.translate(e.x,e.y);c.rotate(Math.atan2(S.ship.y-e.y,S.ship.x-e.x));c.fillStyle='#292036';c.strokeStyle=color;c.lineWidth=1.2;c.beginPath();c.moveTo(-r*.24,0);c.lineTo(0,-r*.25);c.lineTo(r*.26,0);c.lineTo(0,r*.25);c.closePath();c.fill();c.stroke();c.fillStyle='#bd96cf';c.fillRect(0,-r*.12,r*.86,r*.24);c.fillStyle='#f4e2ff';c.fillRect(r*.68,-r*.09,r*.2,r*.18);c.restore();
 }
}
function drawFlight(){const r=resizeFlight();W=r.width;H=r.height;ctx.setTransform(r.dpr,0,0,r.dpr,0,0);ctx.clearRect(0,0,W,H);globalThis.InkSpaceScene.draw(ctx,W,H,S);ctx.save();if(S.shake>0)ctx.translate((Math.random()-.5)*5,(Math.random()-.5)*5);for(const e of S.enemies)drawEnemy(ctx,e);for(const b of S.bullets){disc(ctx,b,b.r+3,'#ff6a9224');disc(ctx,b,b.r,'#ff91ac');disc(ctx,b,Math.max(1,b.r*.35),'#fff3ec');}for(const b of S.shots){const n=hypot(b.vx,b.vy)||1;pathLine(ctx,{x:b.x-b.vx/n*10,y:b.y-b.vy/n*10},b,'#6ef4e0',2.5);disc(ctx,b,2,'#f1ffdb');}drawShip(ctx,S.grid,S.ship,SCALE,S.mode==='vertical'?0:Math.PI/2,S.energy);for(const p of S.particles){ctx.globalAlpha=clamp(p.life/p.max,0,1);disc(ctx,p,1.6,p.color);}ctx.globalAlpha=1;ctx.restore();drawExtras();drawScorePops(ctx,W,H);}
function drawArmoredBoss(c,b){
 const charging=b.motion==='charge',open=b.vulnerable>0,edge=charging?'#ffad77':'#b8a9d6';
 c.save();c.lineJoin='round';c.lineWidth=2;
 const plate=(points,fill,stroke=edge)=>{c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.stroke();}};
 // Six jointed legs and forward horns make this a creature, not an aircraft.
 for(const side of [-1,1]){
  for(const [y,reach] of [[-19,-30],[-2,1],[15,31]]){
   plate([[side*19,y-4],[side*31,y-9],[side*39,reach],[side*34,reach+7],[side*27,y+2],[side*18,y+4]],'#51455f','#8b7c9d');
  }
  plate([[side*14,13],[side*29,24],[side*24,42],[side*16,30],[side*8,24]],charging?'#ffe0aa':'#d6c8ad','#efe1c7');
 }
 plate([[0,-39],[-18,-31],[-29,-10],[-25,19],[-12,30],[0,34],[12,30],[25,19],[29,-10],[18,-31]],'#252539');
 // Separate shell segments reveal an amber organ when the weak point opens.
 const gap=open?5:0;
 plate([[-2-gap,-31],[-17-gap,-25],[-23-gap,-6],[-18-gap,15],[-6-gap,24],[-2-gap,8]],charging?'#75504c':'#514461');
 plate([[2+gap,-31],[17+gap,-25],[23+gap,-6],[18+gap,15],[6+gap,24],[2+gap,8]],charging?'#75504c':'#514461');
 if(open){plate([[0,-20],[-9,-6],[-7,14],[0,24],[7,14],[9,-6]],'#ffca76','#fff0ba');plate([[0,-10],[-4,1],[0,13],[4,1]],'#fff6d9',null);}
 else{plate([[0,-30],[-5,-19],[0,-9],[5,-19]],'#8e7c9b');plate([[0,-6],[-5,4],[0,17],[5,4]],'#8e7c9b');}
 // Brow and eyes provide a clear face at the front of the charging shell.
 plate([[-17,15],[-7,18],[0,25],[7,18],[17,15],[13,29],[0,35],[-13,29]],'#343044','#bca8c5');
 const eye=charging?'#fff0ac':'#ff91aa';
 plate([[-14,21],[-5,24],[-7,28],[-13,26]],eye,null);plate([[14,21],[5,24],[7,28],[13,26]],eye,null);
 if(charging){c.strokeStyle='#ffca8966';c.lineWidth=2;for(const x of [-16,0,16]){c.beginPath();c.moveTo(x,-39);c.lineTo(x*.9,-48);c.stroke();}}
 if(!b.entering&&!open){c.strokeStyle='#92a5d16b';c.lineWidth=1.5;c.setLineDash([5,4]);c.beginPath();for(let i=0;i<6;i++){const angle=Math.PI/6+i*Math.PI/3,x=Math.cos(angle)*43,y=Math.sin(angle)*43;i?c.lineTo(x,y):c.moveTo(x,y);}c.closePath();c.stroke();c.setLineDash([]);}
 c.restore();
}
function drawExtras(){
 for(const i of S.items){const color=i.type==='power'?'#ffe083':i.type==='repair'?'#8affc6':'#8fcfff';ctx.save();ctx.translate(i.x,i.y);ctx.rotate(Math.PI/4);ctx.fillStyle='#122e43';ctx.strokeStyle=color;ctx.lineWidth=2;ctx.fillRect(-12,-12,24,24);ctx.strokeRect(-12,-12,24,24);ctx.restore();ctx.fillStyle=color;ctx.font='bold 13px sans-serif';ctx.textAlign='center';ctx.fillText(i.type==='power'?'P':i.type==='repair'?'+':'B',i.x,i.y+5);}
 if(S.shield){ctx.beginPath();ctx.arc(S.ship.x,S.ship.y,15,0,Math.PI*2);ctx.strokeStyle='#8fcfff';ctx.lineWidth=2;ctx.stroke();}
 if(S.invulnerable>0){ctx.beginPath();ctx.arc(S.ship.x,S.ship.y,22+Math.sin(S.elapsed*30)*3,0,Math.PI*2);ctx.strokeStyle='#ffffff';ctx.stroke();}
 const b=S.boss;if(!b)return;ctx.save();ctx.translate(b.x,b.y);ctx.rotate(S.mode==='vertical'?0:-Math.PI/2);if(b.sonDesign){drawSonBoss(ctx,b);if(!b.entering&&b.vulnerable<=0){ctx.beginPath();ctx.arc(0,0,40,0,Math.PI*2);ctx.strokeStyle='#8cb9df88';ctx.lineWidth=2;ctx.stroke();}ctx.restore();return;}drawArmoredBoss(ctx,b);ctx.restore();
}
function drawShareReport(canvas){canvas.width=1200;canvas.height=900;const c=canvas.getContext('2d');globalThis.InkSpaceScene.backdrop(c,1200,900,0,S.mode);c.fillStyle='#03091799';c.fillRect(0,0,1200,900);c.fillStyle='#76e7de';c.fillRect(55,55,5,58);c.fillStyle='#eaf8ff';c.font='700 38px system-ui,sans-serif';c.textAlign='left';c.fillText('INKSTRIKE',78,91);c.fillStyle='#8eafc7';c.font='18px system-ui,sans-serif';c.fillText('FLIGHT REPORT',80,120);
 const name=shipDisplayName();let size=46;c.font='700 '+size+'px system-ui,sans-serif';while(c.measureText(name).width>1060&&size>22){size--;c.font='700 '+size+'px system-ui,sans-serif';}c.fillStyle='#f4fbff';c.fillText(name,60,190,1060);
 c.strokeStyle='#83c6e42b';c.lineWidth=1;c.strokeRect(60,225,550,535);c.fillStyle='#90aebf';c.font='16px system-ui,sans-serif';c.fillText('出撃時の機体',82,257);drawShip(c,S.originalGrid||S.grid,{x:335,y:490},240,S.mode==='vertical'?0:Math.PI/2,-1,S.originalColors||colors,S.originalNozzle||S.stats?.nozzle||S.nozzle);
 c.fillStyle='#a6c3d9';c.font='20px system-ui,sans-serif';c.fillText('SCORE',675,285);c.fillStyle='#8ef2de';c.font='700 76px system-ui,sans-serif';c.fillText(Math.floor(S.score).toLocaleString(),670,367,460);
 const rows=[['生存時間',S.elapsed.toFixed(1)+' 秒'],['撃破数',S.kills+' 機'],['雑魚撃破率',killRateText()],['ボス撃破',S.bossKills+' 体'],['到達ラウンド','ROUND '+S.round]];rows.forEach(([label,value],i)=>{const y=438+i*59;c.fillStyle='#9eb8cd';c.font='20px system-ui,sans-serif';c.fillText(label,675,y);c.fillStyle='#eff8ff';c.font='700 26px system-ui,sans-serif';c.textAlign='right';c.fillText(value,1135,y);c.textAlign='left';c.strokeStyle='#8bb8d522';c.beginPath();c.moveTo(675,y+18);c.lineTo(1135,y+18);c.stroke();});
 c.fillStyle='#b8cbdc';c.font='20px system-ui,sans-serif';c.fillText((S.mode==='vertical'?'縦':'横')+'スクロール / INK '+Math.round(S.stats?.ink||0)+' / 火力 '+Math.round(S.stats?.power||0),62,803);c.fillStyle='#7393af';c.font='17px system-ui,sans-serif';c.fillText('DRAW YOUR FIGHTER. FLY YOUR OWN WAY.',62,845);c.textAlign='right';c.fillText('tsubasarock21.github.io',1135,845);c.textAlign='left';return canvas;}
function drawResult(){const resultRun=S.runId;const canvas=drawShareReport($('resultShip'));$('share').disabled=true;$('shareStatus').textContent='機体入りの共有画像を準備しています…';$('saveResultImage').hidden=true;void globalThis.InkResultImage.prepare(canvas).then(result=>{if(S.phase!=='result'||S.runId!==resultRun)return;$('share').disabled=false;if(result){$('saveResultImage').href=result.url;$('saveResultImage').hidden=false;$('shareStatus').textContent='機体入りの画像と戦績をシェアできます。';}else $('shareStatus').textContent='画像を作成できませんでした。もう一度出撃後にお試しください。';});}
function shareUrl(){const candidates=[GAME_PUBLIC_URL];try{candidates.push(window.top.location.href);}catch(_){}candidates.push(document.referrer,window.location.href);for(const raw of candidates){if(!raw)continue;try{const u=new URL(raw);if(!/^https?:$/.test(u.protocol)||/^(localhost|127\.0\.0\.1)$/.test(u.hostname))continue;if(/(^|\.)codepen\.io$/.test(u.hostname)&&/\/(pen|full|debug)\//.test(u.pathname))return u.origin+u.pathname;if(!/(^|\.)(cdpn\.io|codepen\.io|codepenassets\.com)$/.test(u.hostname))return u.origin+u.pathname;}catch(_){}}return '';}
function shareText(url=shareUrl()){return `${shipDisplayName()}で出撃！ INKSTRIKE\n${S.mode==='vertical'?'縦':'横'}スクロール / SCORE ${Math.floor(S.score)} / ${S.kills}機撃破\n雑魚撃破率 ${killRateText()}（${killStats().destroyed}/${killStats().spawned}体）\nINK ${Math.round(S.stats?.ink||0)}・火力${Math.round(S.stats?.power||0)} / ${S.elapsed.toFixed(1)}秒生存 / ボス${S.bossKills}体撃破\n${url?url+'\n':''}#インクストライク #シューティングゲーム #自作ゲーム #個人開発 #ブラウザゲーム`;}
$('share').onclick=async()=>{if(S.shareBusy)return;const text=shareText(),payload=globalThis.InkResultImage.payload(text);if(!payload){$('shareStatus').textContent='共有画像の準備ができていません。';return;}S.shareBusy=true;try{if(globalThis.InkResultImage.canShare(navigator,payload)){try{await navigator.share(payload);$('shareStatus').textContent='機体入りの画像を共有しました。';return;}catch(e){if(e.name==='AbortError')return;}}$('shareStatus').textContent='下の「共有画像を保存」から画像を保存し、共有先に添付してください。';try{if(!navigator.clipboard?.writeText)throw Error('copy');await navigator.clipboard.writeText(text);$('shareStatus').textContent+=' 戦績の文章はコピーしました。';}catch(_){$('copyText').value=text;$('copyDialog').showModal();}}finally{S.shareBusy=false;}};$('closeCopy').onclick=()=>$('copyDialog').close();
function frame(now){const dt=clamp((now-S.lastStamp)/1000,0,.05);S.lastStamp=now;if(S.phase==='running'){if(S.control==='gyro'&&!S.sensor&&now-S.gyroStart>1800){S.control='stick';$('controlMode').value='stick';$('calibrate').hidden=true;$('battleHint').textContent='四角いエリアで指をずらして移動 / 自動射撃';$('controlPad').hidden=false;fitLayout();$('battleStatus').textContent='傾きのデータが届かないため、タッチパッドに切り替えました。';}let remaining=dt;while(remaining>0&&S.phase==='running'){const step=Math.min(remaining,1/120);tick(step);remaining-=step;}if(S.phase==='running')drawFlight();}else if(S.phase==='paused')drawFlight();else if(S.phase==='edit'&&S.designDirty)drawEditor();requestAnimationFrame(frame);}
globalThis.InkstrikeCore={MIN_POWER,powerForInk,awardDestruction,advanceScorePops,drawScorePops,armorRatio,inkScoreMultiplier,enemyBasePoints,destructionPoints,TIME_POINTS_PER_SECOND,drawArmoredBoss,drawShareReport,captureRankingThumbnail,shipDisplayName,rankingRecord,cleanName,editor:E,killStats,killRateText,makeStarter,starterType,importRaster,chooseSlot,openDesigner,goHome,normalizeDesign,fixedStamp,renderHome,slots:()=>slots,MAX_ENEMIES,history,future,snapshot,restore,stroke,shapePoints,commitShape,setZoom,saveDesign,load,state:S,N,CELL,PEN,CORE,INK_LENGTH,SCALE,ENERGY_SPEED,analyze,findNozzle,energyPeriod,occupied,stamp,paintSegment,cellPoint,countArmor,eraseArmor,hullContact,localToWorld,worldToLocal,advanceEnergy,segmentHit,rebuild,sample,launch,startRun,tick,finishRun,pause,resume,edit,orientation,inputVector,requestControls,appendDrawing,shareText,shareUrl,drawEditor,drawFlight,fitLayout,enemyRateAt,dropItem,collectItem,updateItems,coreHit,startBoss,updateBoss,bossActionFor,bossMoveRate,fire,audioPrefs,toggleAudio,syncMusic,defeatBoss,enemyTypeForRound,enemyShotAngles,enemyFirePeriod,enemyFire,spawnEnemy,drawEnemy,audioStatus:()=>({context:audioContext?.state,paused:music?.paused,time:music?.currentTime,ready:music?.readyState,kind:musicKind,error:music?.error?.message,bgm:audioPrefs.bgm,se:audioPrefs.se})};
load();showPhase('home');document.body.dataset.phase=S.phase;installLayout();S.lastStamp=performance.now();requestAnimationFrame(frame);
})();
