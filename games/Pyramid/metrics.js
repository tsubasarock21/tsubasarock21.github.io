/* Lab anonymous aggregate counters; no names or saved progress are sent. */
if(globalThis.LabMetricsV2){globalThis.LabMetricsV2.install({game:"Pyramid",version:globalThis.LabPageConfig?.version||'unknown'});}else{(()=>{'use strict';
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
function init(){label();new MutationObserver(label).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});document.addEventListener('click',e=>{const a=e.target.closest?.('[data-lab-return]');if(a)end();const share=e.target.closest?.('[data-lab-share],#share,#shareGame,#shareGameButton,#shareResultButton,#shareResult');if(share&&!share.disabled)api.share();},true);send('view');}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();}
