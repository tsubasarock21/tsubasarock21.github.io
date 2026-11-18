/* Visual-only construction milestones and worker comedy. Never changes production. */
(()=>{'use strict';const M=PyramidModel;
function phase(s){if(!s.started||M.completed(s)||M.night(s))return null;const p=s.elapsed%36;if(p<7||p>14)return null;return {kind:Math.floor(s.elapsed/36)%3,t:p-7}}
function poses(people,s,art){const e=phase(s);if(!e||people.length<2)return people;const ids=people.filter(p=>!p.returning&&!p.sulk&&p.scale<1.5&&!p.sleep).slice(0,2).map(p=>p.id);if(ids.length<2)return people;return people.map(p=>{const n=ids.indexOf(p.id);if(n<0)return p;const q={...p,x:art.W*.36+n*20,y:art.H*.84,walk:0,load:false,sleep:false};if(e.kind===0){q.load=e.t<3?n===0:n===1;q.happy=e.t>3}else if(e.kind===1){q.load=e.t<2&&n===0;q.happy=e.t>4}else{q.sleep=n===1&&e.t<5;q.load=n===0;q.happy=e.t>5}return q})}
function milestones(a,s,p){if(M.completed(s)||M.constructionStage(s)<3)return;const {W,line,ctx,roundRect}=a,x=W*.58,y=p.workerRoute.workY;
 line(x,y+4,x,y-40,'#7a5b36',3);line(x-22,y-40,x+18,y-40,'#7a5b36',3);line(x-15,y-40,x-15,y-14,'#a78958',1.5);roundRect(x-21,y-14,13,8,1,'#dec18b');ctx.fillStyle='#916634';ctx.font='9px sans-serif';ctx.textAlign='center';ctx.fillText('頂上作業',x,y-49);
}
function foreground(a,s,time){if(!s.started)return;const {ctx,W,H,line,ellipse,roundRect,person}=a,e=phase(s),leader=M.leader(s.leaderId),active=leader&&!M.completed(s)&&!M.night(s)&&s.elapsed%49>=16&&s.elapsed%49<23;
 if(e&&M.workerVisuals(s.workers)>=2){const text=['石を渡したら、相手はよそ見。','落とした石、何事もなかった顔で。','起こすつもりが、つられてひと休み。'][e.kind];ctx.save();ctx.font='10px sans-serif';ctx.textAlign='center';roundRect(W*.15,H*.705,W*.53,23,6,M.night(s)?'#e8dabd':'#fff4d9e8');ctx.fillStyle='#806a47';ctx.fillText(text,W*.415,H*.705+15,W*.51);ctx.restore();}

}
globalThis.PyramidVignettes={poses,milestones,foreground};})();
