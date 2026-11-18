/* A new version activates after all old tabs close, never during a game. */
const CACHE='yuru-maze-0.4.2';
const FILES=['./','index.html','style.css?v=0.4.2','stages.js?v=0.4.2','core.js?v=0.4.2','art.js?v=0.4.2','journey.js?v=0.4.2','app.js?v=0.4.2','manifest.json','icon-192.png','icon-512.png','thumbnail.jpg'];
const allowed=new Set(FILES.map(p=>new URL(p,self.registration.scope).href));
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES))));
self.addEventListener('activate',e=>e.waitUntil((async()=>{for(const k of await caches.keys())if(k.startsWith('yuru-maze-')&&k!==CACHE)await caches.delete(k);await self.clients.claim();for(const client of await self.clients.matchAll())client.postMessage({type:'CACHE_READY'})})()));
self.addEventListener('message',e=>{if(e.data?.type==='CACHE_STATUS')e.waitUntil(caches.open(CACHE).then(async c=>{if(await c.match('index.html'))e.source?.postMessage({type:'CACHE_READY'})}))});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const url=new URL(e.request.url);if(url.origin!==location.origin)return;if(e.request.mode==='navigate'&&url.href.startsWith(self.registration.scope)&&!url.pathname.endsWith('ad.html')){e.respondWith(fetch(e.request).catch(()=>caches.open(CACHE).then(c=>c.match('index.html'))));return}if(allowed.has(url.href))e.respondWith(fetch(e.request).catch(()=>caches.open(CACHE).then(c=>c.match(e.request))))});
