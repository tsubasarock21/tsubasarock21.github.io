/* Moving, carryable owner and leader. All positions are visual-only. */
(()=>{'use strict';const M=PyramidModel,clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const routes=[[.25,.82],[.42,.73],[.65,.82],[.81,.75],[.57,.87],[.32,.89]];
function patrol(seconds,seed=0){const t=Math.max(0,seconds+seed),step=Math.floor(t/4.8),p=t%4.8,a=routes[step%routes.length],b=routes[(step+1)%routes.length],u=Math.min(1,p/3.9);return {x:a[0]+(b[0]-a[0])*u,y:a[1]+(b[1]-a[1])*u,moving:p<3.9,action:p>=3.9};}
function appearance(s,role){if(!s.started||M.completed(s))return null;if(role==='leader'){if(!M.leader(s.leaderId))return null;if(M.night(s))return {x:.77,y:.87,moving:false,sleep:true,action:false};return patrol(s.elapsed,M.LEADERS.findIndex(c=>c.id===s.leaderId)*3);}
 if(M.night(s))return null;const t=s.elapsed%80;if(t<6||t>=20)return null;const u=(t-6)/14;return {x:.88-Math.sin(u*Math.PI)*.2,y:.79+Math.sin(u*Math.PI)*.04,moving:u<.25||u>.7,action:false};}
function returnPose(start,target,age,duration=4){const t=clamp(age/duration,0,1),u=t*t*(3-2*t);return {...target,x:start.x+(target.x-start.x)*u,y:start.y+(target.y-start.y)*u,moving:t<1,sleep:false};}
globalThis.PyramidActorMotion={patrol,appearance,returnPose};
const A=globalThis.PyramidApp;if(!A)return;const canvas=A.$('scene'),wrap=canvas.parentElement,heldStyle='is-held';
let identity=null,last={},held=null,returns={},focused=null;
const handles={};
for(const role of ['king','leader']){const b=document.createElement('button');b.type='button';b.className='actor-handle';b.id=role+'Actor';b.hidden=true;b.setAttribute('aria-label',role==='king'?'王様を掴んで動かす':'現場リーダーを掴んで動かす');b.title=(role==='king'?'王様':'現場リーダー')+'：掴んで移動・矢印キーでも移動';wrap.append(b);handles[role]=b;
 b.addEventListener('focus',()=>{focused=role});b.addEventListener('blur',()=>{if(focused===role)focused=null});
 b.addEventListener('pointerdown',e=>{if(e.button!==0||held||!last[role])return;e.preventDefault();e.stopPropagation();held={role,pointer:e.pointerId,...last[role],moved:false};b.setPointerCapture(e.pointerId);b.classList.add(heldStyle)});
 b.addEventListener('pointermove',e=>{if(!held||held.role!==role||held.pointer!==e.pointerId)return;const r=canvas.getBoundingClientRect();held.x=clamp((e.clientX-r.left)/r.width,.07,.93);held.y=clamp((e.clientY-r.top)/r.height+.045,.3,.92);held.moved=true;e.preventDefault();e.stopPropagation()});
 for(const type of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(type,()=>release());
 b.addEventListener('keydown',e=>{const shifts={ArrowLeft:[-.06,0],ArrowRight:[.06,0],ArrowUp:[0,-.05],ArrowDown:[0,.05]},d=shifts[e.key];if(!d||!last[role])return;e.preventDefault();const p=returns[role]?.from??last[role],from={...p,x:clamp(p.x+d[0],.07,.93),y:clamp(p.y+d[1],.3,.92)};returns[role]={from,target:appearance(A.state,role)||last[role],since:A.state.elapsed};A.notice((role==='king'?'王様':'現場リーダー')+'を移動しました。持ち場へ戻ります。')});
}
function release(){if(!held)return;const h=held;held=null;handles[h.role].classList.remove(heldStyle);try{handles[h.role].releasePointerCapture(h.pointer)}catch{}handles[h.role].blur();if(h.moved){returns[h.role]={from:{x:h.x,y:h.y},target:appearance(A.state,h.role)||last[h.role],since:A.state.elapsed};A.notice(h.role==='king'?'王様、視察の途中で運ばれました。ゆっくり現場に戻ります。':'現場リーダー、持ち場を確かめながら戻ります。');globalThis.PyramidAudio?.effect('boing')}}
function reset(){release();identity=null;returns={};focused=null;last={};for(const b of Object.values(handles))b.hidden=true;}
function positions(s){const key=s.seed+':'+s.siteNumber+':'+s.leaderId;if(key!==identity){reset();identity=key;}const result={};for(const role of ['king','leader']){let p=appearance(s,role);if(held?.role===role)p={x:held.x,y:held.y,moving:false,held:true};else if(returns[role]){const r=returns[role],age=s.elapsed-r.since;if(age>=4){delete returns[role];if(focused===role)p={...last[role],moving:false};}else p=returnPose(r.from,p||r.target,age); }else if(focused===role&&last[role])p={...last[role],moving:false};
 if(!s.started||M.completed(s))p=null;if(p)result[role]=p;handles[role].hidden=!p;}last=result;return result;}
function paint(a,s,time){const actors=positions(s),c=M.leader(s.leaderId),{ctx,W,H,person,line,roundRect,ellipse}=a;
 for(const [role,p]of Object.entries(actors)){const king=role==='king',x=p.x*W,y=p.y*H,scale=p.held?2.1:king?1.5:1.65;const b=handles[role];b.style.left=(p.x*100)+'%';b.style.top=y+'px';b.setAttribute('aria-label',(king?'王様':c.name)+'を掴んで動かす');
 ctx.save();person(x,y,scale,p.moving?time*(king?7:15):0,king?2:3,!king&&!p.sleep&&p.action&&c.gesture==='lift',!!p.sleep,!king&&p.action&&c.gesture==='story',false,king?null:c.skin);
 if(king){ctx.fillStyle='#e3b735';ctx.beginPath();ctx.moveTo(x-10,y-36);ctx.lineTo(x-10,y-47);ctx.lineTo(x-4,y-42);ctx.lineTo(x,y-50);ctx.lineTo(x+4,y-42);ctx.lineTo(x+10,y-47);ctx.lineTo(x+10,y-36);ctx.closePath();ctx.fill();}
 else if(!p.sleep){roundRect(x-8,y-25,16,7,2,c.color);ellipse(x,y-36,7,3,c.color);if(c.beard){ctx.fillStyle='#d6d2bc';ctx.beginPath();ctx.moveTo(x-6,y-29);ctx.lineTo(x+6,y-29);ctx.lineTo(x,y-19);ctx.fill()}
 if(c.sunglasses){roundRect(x-8,y-32,16,5,1,'#203434');line(x-9,y-31,x+9,y-31,'#486d68',1);}
 if(p.action&&!p.held){if(c.gesture==='lift')roundRect(x-13,y-62,26,17,2,'#c9a575');if(c.gesture==='gather')roundRect(x+12,y-27,9,10,2,'#9b723d');if(c.gesture==='measure'){line(x-24,y+2,x+25,y+2,'#f5dfb1',1.5);line(x-24,y-3,x-24,y+7,'#8c6035',2)}if(c.gesture==='greet')line(x+9,y-17,x+23,y-21,'#a4794d',3);if(c.gesture==='story')line(x-10,y-22,x-24,y-40,'#a77b45',2);}}
 ctx.font='9px sans-serif';ctx.textAlign='center';const label=king?'王様':c.name.replace(/^.*の/,'');const width=Math.max(31,ctx.measureText(label).width+10);roundRect(x-width/2,y+5,width,16,4,M.night(s)?'#273c3ce8':'#fff1d6e8');ctx.fillStyle=M.night(s)?'#e3d7af':'#755a34';ctx.fillText(label,x,y+16);if(p.held){ctx.font='10px sans-serif';ctx.fillStyle='#806348';ctx.fillText(king?'視察中ですぞ':'今、そっちへ！',x,y-64);}ctx.restore();
 }}
document.addEventListener('visibilitychange',()=>{if(document.hidden)release()});addEventListener('pagehide',release);
globalThis.PyramidActors={paint,reset};
})();
