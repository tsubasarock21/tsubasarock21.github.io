/* One geometry for visible decks and worker feet. Endpoints stay fixed within a stone row. */
(()=>{'use strict';const M=PyramidModel;
function geometry(a,s,p){const {W,H}=a,k=M.constructionStage(s),ground=p.baseY+H*.08,work=p.baseY-p.level*p.blockH;
 const start={x:W*.13,y:H*.82},entry={x:W*.23,y:ground},end={x:W*.52,y:work};let points;
 if(k===0)points=[start,entry,{x:W*.34,y:work},end];
 else if(k===1){points=[start,entry];const levels=Math.max(2,Math.ceil((ground-work)/8));for(let i=1;i<=levels;i++)points.push({x:W*(.23+.18*i/levels),y:ground+(work-ground)*i/levels});points.push(end);}
 else points=[start,entry,{x:W*.39,y:ground+(work-ground)*.32},{x:W*.25,y:ground+(work-ground)*.62},{x:W*.43,y:work},end];
 return {points,stage:k,workY:work,groundY:ground,wood:k>0};}
function point(route,u){const ps=route.points,segments=ps.slice(1).map((p,i)=>Math.hypot(p.x-ps[i].x,p.y-ps[i].y)),total=segments.reduce((a,b)=>a+b,0);let distance=Math.max(0,Math.min(1,u))*total;for(let i=0;i<segments.length;i++){if(distance<=segments[i]||i===segments.length-1){const t=segments[i]?distance/segments[i]:0;return {x:ps[i].x+(ps[i+1].x-ps[i].x)*t,y:ps[i].y+(ps[i+1].y-ps[i].y)*t};}distance-=segments[i];}return ps[0];}
function paint(a,s,p,route){const {ctx,W,line}=a,ps=route.points,night=M.night(s);ctx.save();ctx.lineJoin='round';ctx.lineCap='round';
 // Posts visibly support the decks; no platform follows the next individual stone.
 if(route.wood){for(const q of ps.slice(2)){line(q.x,q.y+4,q.x,route.groundY+5,night?'#806c4e':'#82613a',2.5);line(q.x-5,route.groundY+5,q.x+7,route.groundY+5,'#a38251',2);}for(let i=2;i<ps.length;i++){const a0=ps[i-1],b=ps[i];if(a0.y<route.groundY-3)line(a0.x,a0.y+6,b.x,route.groundY,'#a0804c',1.3);}}
 const draw=(color,width,offset)=>{ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ps.forEach((q,i)=>i?ctx.lineTo(q.x,q.y+offset):ctx.moveTo(q.x,q.y+offset));ctx.stroke();};
 draw(night?'#524c37':'#947044',14,5);draw(night?'#afa075':'#e3c58c',10,2);
 // Cross-planks and a continuous dark edge make the walkable surface easy to read.
 for(let i=1;i<ps.length;i++){const from=ps[i-1],to=ps[i],len=Math.hypot(to.x-from.x,to.y-from.y),nx=-(to.y-from.y)/len,ny=(to.x-from.x)/len;for(let d=5;d<len;d+=9){const x=from.x+(to.x-from.x)*d/len,y=from.y+(to.y-from.y)*d/len+2;line(x-nx*4,y-ny*4,x+nx*4,y+ny*4,night?'#75694c':'#ac8854',.8);}}
 if(route.wood){const q=ps[ps.length-1];line(ps[ps.length-2].x,route.workY-12,q.x+8,route.workY-12,night?'#9a8965':'#ac8250',1);for(const x of [ps[ps.length-2].x,q.x+8])line(x,route.workY-12,x,route.workY+5,'#977144',1.5);}
 ctx.restore();}
globalThis.PyramidRoutes={geometry,point,paint};})();
