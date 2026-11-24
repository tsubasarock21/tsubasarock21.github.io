/* Prefer the deployed game version. The catalog is a fallback, never a lock. */
(()=>{'use strict';
const grid=document.getElementById('grid');if(!grid)return;
const versions=new Map(),resolved=new Set(),attempts=new Map();
const valid=v=>typeof v==='string'&&/^[0-9A-Za-z][0-9A-Za-z._+-]{0,63}$/.test(v);
let running=false,scheduled=false,lastCatalog=-Infinity;
function slugOf(card){try{return new URL(card.querySelector('a[href]').href,location.href).pathname.match(/^\/games\/([A-Za-z][A-Za-z0-9_-]{0,47})\/(?:index\.html)?$/)?.[1]||''}catch{return ''}}
function broadcast(){window.dispatchEvent(new CustomEvent('lab:public-versions',{detail:[...versions].map(([slug,version])=>({slug,version}))}))}
function render(){for(const card of grid.querySelectorAll('.game')){
 const slug=slugOf(card),dates=card.querySelector('.dates');if(!slug||!dates)continue;
 for(const old of [...dates.children])if(!old.classList.contains('game-version')&&/^v\d[0-9A-Za-z._+-]*$/.test(old.textContent.trim()))old.remove();
 let badge=dates.querySelector('.game-version');if(!badge){badge=document.createElement('span');badge.className='game-version';dates.appendChild(badge)}
 const v=versions.get(slug),text=v?'v'+v.replace(/^v(?=\d)/,''):(document.documentElement.lang==='en'?'Version unavailable':'バージョン未取得');
 if(badge.textContent!==text)badge.textContent=text;
}}
function accept(items){let changed=false;if(!Array.isArray(items))return;
 for(const item of items)if(item&&typeof item.slug==='string'&&/^[A-Za-z][A-Za-z0-9_-]{0,47}$/.test(item.slug)&&valid(item.version)&&!resolved.has(item.slug)){
  if(versions.get(item.slug)!==item.version){versions.set(item.slug,item.version);changed=true}
 }
 if(changed){render();broadcast()}
}
function configVersion(text,slug){
 for(const m of text.matchAll(/LabPageConfig\s*=\s*\{([^}]{1,4096})\}/g)){
  const game=m[1].match(/(?:^|,)\s*["']?game["']?\s*:\s*(["'])([^"']+)\1/),
   version=m[1].match(/(?:^|,)\s*["']?version["']?\s*:\s*(["'])([^"']+)\1/);
  if(game?.[2]===slug&&valid(version?.[2]))return version[2];
 }return '';
}
async function textAt(url){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),8000);
 try{const request=new URL(url,location.href);request.searchParams.set('_lab_version',String(Date.now()));const r=await fetch(request.href,{cache:'no-store',credentials:'omit',signal:controller.signal});if(!r.ok)return '';
  const text=await r.text();return text.length<=2097152?text:'';
 }catch{return ''}finally{clearTimeout(timer)}
}
async function readPublic(slug){
 const base=new URL('/games/'+encodeURIComponent(slug)+'/',location.origin);
 // The study app's data catalog owns its version; its old static footer does not.
 if(slug==='Process_Quest'){try{const data=JSON.parse(await textAt(new URL('catalog.json',base)));if(valid(data.version))return data.version;}catch{}}
 const html=await textAt(new URL('index.html',base));let version=configVersion(html,slug);if(version)return version;
 const doc=new DOMParser().parseFromString(html,'text/html'),sources=[];
 for(const script of doc.querySelectorAll('script[src]')){
  try{const url=new URL(script.getAttribute('src'),base);
   if(url.origin!==base.origin||!url.pathname.startsWith(base.pathname)||!url.pathname.endsWith('.js'))continue;
   if(!sources.some(s=>s.href===url.href))sources.push(url);
  }catch{}
 }
 sources.sort((a,b)=>Number(!/\/(script|game)\.js$/.test(a.pathname))-Number(!/\/(script|game)\.js$/.test(b.pathname)));
 for(const url of sources.slice(0,4)){version=configVersion(await textAt(url),slug);if(version)return version}
 // Self-contained prototypes display their build in their brand or footer.
 for(const el of doc.querySelectorAll('.game-brand,.foot,footer')){
  const match=el.textContent.match(/\bv(\d+(?:\.\d+){1,3}(?:[-+][0-9A-Za-z.-]+)?)/);if(valid(match?.[1]))return match[1];
 }
 return '';
}
async function resolvePublic(){if(running||document.visibilityState==='hidden')return;running=true;
 try{const now=Date.now(),slugs=[...new Set([...grid.querySelectorAll('.game')].map(slugOf))].filter(slug=>slug&&now-(attempts.get(slug)??-Infinity)>=60000);
  for(const slug of slugs)attempts.set(slug,now);
  let cursor=0;
  async function worker(){while(cursor<slugs.length){const slug=slugs[cursor++],version=await readPublic(slug);
   if(version){resolved.add(slug);versions.set(slug,version);render();broadcast()}
  }}
  await Promise.all(Array.from({length:Math.min(3,slugs.length)},worker));
 }finally{running=false}
}
function schedule(){render();if(scheduled)return;scheduled=true;queueMicrotask(()=>{scheduled=false;void resolvePublic()})}
async function refresh(){schedule();if(document.visibilityState==='hidden'||Date.now()-lastCatalog<15000)return;lastCatalog=Date.now();
 try{const text=await textAt('/lab-system/published-v1.json');accept(JSON.parse(text).items)}catch{}
}
window.addEventListener('lab:catalog',e=>{accept(e.detail);schedule()});
new MutationObserver(schedule).observe(grid,{childList:true,subtree:true});
new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
window.addEventListener('pageshow',refresh);window.addEventListener('online',refresh);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')void refresh()});
void refresh();
})();
