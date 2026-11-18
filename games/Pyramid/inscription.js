/* Recessed stone lettering, revealed by the chisel before the celebration ends. */
(()=>{'use strict';const M=PyramidModel,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function progress(age){return age===null||!Number.isFinite(age)?1:clamp((age-.8)/4.2,0,1);}
function layout(name,W,p,measure){const chars=Array.from(name),height=p.levels*p.blockH,apex=p.baseY-height,bottom=p.baseY-height*.52;let font=Math.min(27,Math.max(13,W*.049));
 const lineCount=chars.length>11?3:chars.length>5&&measure(name,font)>p.fullW*.36?2:1,chunk=Math.ceil(chars.length/lineCount),lines=[];for(let i=0;i<chars.length;i+=chunk)lines.push(chars.slice(i,i+chunk).join(''));
 let rows,maxWidth;
 do{rows=lines.map((text,i)=>({text,x:W*.52,y:bottom-(lines.length-1-i)*font*1.2,width:measure(text,font)}));maxWidth=Math.max(1,Math.min(...rows.map(r=>p.fullW*clamp((r.y-font-apex)/height,0,1)-8)));if(Math.max(...rows.map(r=>r.width))<=maxWidth||font<=7)break;font-=.5;}while(true);
 return {font,rows,maxWidth};}
function paint(a,s,p,age=null){const {ctx,W,line,ellipse}=a,name=M.royalName(s);ctx.save();const fontFor=size=>'700 '+size+'px "Hiragino Mincho ProN", "Yu Mincho", serif',measure=(text,size)=>{ctx.font=fontFor(size);return ctx.measureText(text).width;},design=layout(name,W,p,measure),ratio=progress(age),total=Array.from(name).length;ctx.font=fontFor(design.font);ctx.textAlign='center';ctx.textBaseline='alphabetic';let offset=0,tip=null;
 for(const row of design.rows){const count=Array.from(row.text).length,part=clamp((ratio*total-offset)/count,0,1);offset+=count;if(part<=0)continue;const left=row.x-row.width/2;ctx.save();ctx.beginPath();ctx.rect(left-2,row.y-design.font*1.2,row.width*part+3,design.font*1.5);ctx.clip();
 // Light catches the lower lip; the upper edge lies in the dark incision.
 ctx.fillStyle='#f3dfafc9';ctx.fillText(row.text,row.x+.85,row.y+1.05);ctx.fillStyle='#624e32';ctx.fillText(row.text,row.x-.35,row.y-.35);ctx.fillStyle='#8d754c';ctx.fillText(row.text,row.x,row.y);ctx.strokeStyle='#6e583b88';ctx.lineWidth=.35;ctx.strokeText(row.text,row.x,row.y);ctx.restore();if(part<1)tip={x:left+row.width*part,y:row.y};}
 if(age!==null&&Number.isFinite(age)&&ratio>0&&age<6.4){tip||={x:design.rows.at(-1).x+design.rows.at(-1).width/2,y:design.rows.at(-1).y};const fade=ratio<1?1:clamp((6.4-age)/1.4,0,1);ctx.globalAlpha=fade;for(let i=0;i<15;i++){const fall=(age*1.8+M.hash(i*91+3))%1,x=tip.x+Math.sin(i*3.1+age)*7*fall,y=tip.y+fall*23;ellipse(x,y,.6+M.hash(i*19)*.8,.6,'#ead4a3');}if(ratio<1){line(tip.x+5,tip.y-design.font*.6,tip.x-1,tip.y-1,'#b7b4a2',2);line(tip.x+6,tip.y-design.font*.6-2,tip.x+11,tip.y-design.font*.6-8,'#7d603c',3);}}
 ctx.restore();}
globalThis.PyramidInscription={paint,layout,progress};})();
