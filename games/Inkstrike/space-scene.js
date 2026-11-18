/* Cached nebula art + independent visual randomness; never affects combat rolls. */
(function(root){'use strict';
const texture=new Image();texture.src='assets/deep-space.jpg';let cache=null,cacheKey='',seed=4567;
const rnd=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
const far=Array.from({length:145},()=>({x:rnd(),y:rnd(),z:.15+rnd()*.6,a:.18+rnd()*.45}));
const reduced=root.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
function backdrop(c,w,h,time=0,mode='vertical'){
 c.fillStyle='#030915';c.fillRect(0,0,w,h);
 if(texture.complete&&texture.naturalWidth){const key=Math.round(w)+'x'+Math.round(h);if(key!==cacheKey){cache=document.createElement('canvas');cache.width=Math.ceil(w+44);cache.height=Math.ceil(h+64);const b=cache.getContext('2d'),scale=Math.max(cache.width/texture.naturalWidth,cache.height/texture.naturalHeight),iw=texture.naturalWidth*scale,ih=texture.naturalHeight*scale;b.drawImage(texture,(cache.width-iw)/2,(cache.height-ih)/2,iw,ih);b.fillStyle='#02061126';b.fillRect(0,0,cache.width,cache.height);cacheKey=key;}
 c.drawImage(cache,-22+(reduced?0:Math.sin(time*.035)*6),-32+(reduced?0:Math.cos(time*.026)*8));}
 for(const p of far){const travel=reduced?0:time*(2+7*p.z),x=mode==='horizontal'?((p.x*w-travel)%w+w)%w:p.x*w,y=mode==='vertical'?(p.y*h+travel)%h:p.y*h;c.fillStyle=`rgba(174,204,246,${p.a})`;c.fillRect(x,y,p.z>.55?1.2:.7,p.z>.55?1.2:.7);}
}
function draw(c,w,h,s){backdrop(c,w,h,s.elapsed,s.mode);for(const p of s.stars){const alpha=.25+p.z*.55;c.fillStyle=`rgba(198,225,255,${alpha})`;c.beginPath();c.arc(p.x,p.y,.5+p.z*.85,0,Math.PI*2);c.fill();if(p.z>.85){c.strokeStyle='#aacdf826';c.lineWidth=.7;c.beginPath();if(s.mode==='vertical'){c.moveTo(p.x,p.y-3.5);c.lineTo(p.x,p.y+1);}else{c.moveTo(p.x+3.5,p.y);c.lineTo(p.x-1,p.y);}c.stroke();}}
 const shade=c.createLinearGradient(0,0,0,h);shade.addColorStop(0,'#02061110');shade.addColorStop(.55,'#02061100');shade.addColorStop(1,'#02061142');c.fillStyle=shade;c.fillRect(0,0,w,h);}
root.InkSpaceScene=Object.freeze({draw,backdrop});
})(globalThis);
