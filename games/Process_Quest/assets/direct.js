// Direct answers share the existing verification and review engines.
// Every page load starts with hints on. Switching in a lesson restarts that problem.
let studyMode='guided';
function loadModeProgress(){try{const value=JSON.parse(localStorage.getItem(progressKey())||'{}');complete=value&&typeof value==='object'&&!Array.isArray(value)?value:{}}catch{complete={}}}
loadModeProgress();
const modeButton=document.getElementById('studyMode');
function updateHintButton(){const on=studyMode==='guided';modeButton.textContent=on?'ヒント：オン':'ヒント：オフ';modeButton.setAttribute('aria-pressed',String(on));modeButton.setAttribute('aria-label',on?'ヒントをオフにする':'ヒントをオンにする');}
updateHintButton();
modeButton.onclick=()=>{const inLesson=app.classList.contains('study');studyMetrics.end();studyMode=studyMode==='guided'?'direct':'guided';loadModeProgress();updateHintButton();if(inLesson)start(index);else home();};
function directCheckStage(){const p=problems[index];return p.expr?2:p.system?4:p.geo?p.steps.length-1:p.trap?1:4}
function directContent(){
 const p=problems[index];let opts,q;
 if(p.expr){
  const e=p.expr,w=C1.expected(e);q=e.kind==='terms'?'この式の項と次数はどれですか？':e.values?'式の値はいくつですか？':e.equation?e.equation.target+'を表す式はどれですか？':'答えの式はどれですか？';
  if(e.kind==='terms'){
   const correct=C1.parse(e.original),split=C1.parse(e.routes[1].work),sign=C1.parse(e.routes[2].work);
   opts=[{work:correct,answer:w},{work:split,answer:{'':C1.degree(split)}},{work:sign,answer:w},{work:correct,answer:{'':Math.max(...Object.keys(correct).flatMap(k=>[...new Set(k)].map(c=>k.split(c).length-1)))}}].map(patch=>({label:'項：'+Object.entries(patch.work).map(([k,n])=>C1.plain({[k]:n})).join('、')+' ／ '+C1.plain(patch.answer)+'次式',patch}));
  }else{
   const candidates=[w,...(e.calculationChoices?.answer||[]).map(C1.parse),...C1.variants(w,e.original)];
   opts=candidates.filter((v,i)=>!candidates.slice(0,i).some(a=>C1.equal(a,v))).slice(0,3).map(answer=>({label:(e.equation?e.equation.target+'＝':'')+C1.answerText(e,answer),patch:{answer}}));
  }
 }else if(p.system){
  const s=p.system; q=s.word?'問題で聞かれている答えはどれですか？':s.extra?.kind==='third'?'3種類のシュートの本数の組はどれですか？':s.extra?s.extra.name+'の値はどれですか？':'xとyの値はどれですか？';
  const generated=AnswerChoices.pairCandidates(s.eq),pairList=[generated[0]];
  if(s.modelChoices&&s.raw)for(const model of s.modelChoices)pairList.push(solve(model));
  if(s.word){for(const form of s.forms||[])pairList.push(solve(C2.formRows(form)));const correct=solve(s.eq);pairList.push([correct[0],s.eq[0][2]],[s.eq[0][2],correct[1]],correct.slice().reverse());}
  pairList.push(...generated.slice(1));
  opts=pairList.filter(pair=>pair.every(Number.isFinite)&&(!s.word||C2.domainOK(s,pair))).map(pair=>{
   const patch={pair,variableChoice:'forward'};if(s.word)patch.interpret=C2.interpreted(s,patch);if(s.extra)patch.extraValue=C2.extraValue(s,patch);
   return {label:C2.finalText(s,patch)+(s.extra?.kind==='parameter'?'（x＝'+C2.f(pair[0])+'、y＝'+C2.f(pair[1])+'）':''),patch};
  });
 }else if(p.geo){
  q=p.directChoices?'結論と理由の組み合わせはどれですか？':p.steps[2].q;
  opts=p.directChoices?p.directChoices.map((o,i)=>({label:o.label,patch:{directGeo:i}})):p.steps[2].options.map(o=>({label:o.label,patch:{directGeo:o.id}}));
 }else{
  q='xとyの値はどれですか？';opts=AnswerChoices.pairCandidates(p.eq).slice(0,4).map(pair=>({label:'x＝'+C2.f(pair[0])+'、y＝'+C2.f(pair[1]),patch:{pair}}));
 }
 // Counts remain nonnegative integers; side lengths form actual triangles.
 if(index===55){opts=[[2,8,4],[4,8,2],[2,4,8],[4,2,8]].map(([x,y,z])=>({label:C2.finalText(p.system,{pair:[x,y],extraValue:z}),patch:{pair:[x,y],extraValue:z}}));}
 if(index===52){opts=[[4,3],[3,4],[4,6],[5,3]].map(pair=>({label:C2.finalText(p.system,{pair,interpret:pair}),patch:{pair,interpret:pair,variableChoice:'forward'}}));}
 // Keep choices stable while previewing; content() is cached by render().
 const seen=new Set();opts=opts.filter(o=>!seen.has(o.label)&&seen.add(o.label)).slice(0,4);
 return {q,detail:'',opts:shuffle(opts)};
}
function directPaper(p){
 const held=state;try{if(pendingChoice)state={...state,...pendingChoice.patch};let out;
 if(p.expr){const e=p.expr;out='<p class="problem-text">'+esc(e.question)+'</p>'+(e.display?'<div class="c1-math">'+renderPrintedMath(e.display)+'</div>':'');if(e.visual)out=C1.paper();}
 else if(p.system)out=C2.paper();
 else if(p.geo)out=geoPaper(p);
 else out='<p class="problem-text">次の連立方程式の解を求めましょう。</p><div class="equations">'+eqhtml(p.eq)+'</div>';
 if(pendingChoice)out+='<div class="preview-note">答えの候補：'+esc(pendingChoice.label)+'</div>';
 return out;
 }finally{state=held}
}
function directGeoFeedback(p){return history.map((h,i)=>{const after=history[i+1]?.state||state;if(h.stage===-10){const o=p.directChoices?p.directChoices[after.directGeo]:p.steps[2].options.find(o=>o.id===after.directGeo);return {i,s:{reason:p.directChoices?'元の条件と結論のつながりを確かめます。':p.steps[2].reason},o:{label:h.label,correct:!!o?.correct}}}const s=geometryStep(p,h.stage),o=s.options.find(o=>o.id===after['g'+h.stage]);return {s,i,o}})}
