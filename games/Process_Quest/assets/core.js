
'use strict';
const problems=window.TRLabData.problems;
// Anonymous usage counters; no answers, names, or learning history are sent.
const studyMetrics=globalThis.LabMetricsV2?(()=>{const api=globalThis.LabMetricsV2.install({game:'Process_Quest',version:window.TRLabData.version});return {start(i){const p=problems[i];api.start({mode:p.system?'algebra':p.expr?'normal':p.geo?'geometry':'algebra',stage:i+1})},end:api.end,share:api.share,get active(){return api.active}}})():(()=>{
 const enabled=false;
 let active=null,elapsed=0,last=performance.now();
 function send() {}
 let visible=!document.hidden;
 function account(){const now=performance.now();if(active&&visible)elapsed+=Math.max(0,(now-last)/1000);last=now;visible=!document.hidden;}
 function end(outcome='abandon'){if(!active)return;account();const details=active;active=null;send('end',{...details,outcome,seconds:Math.min(3600,Math.round(elapsed))});}
 function start(i){end();active={mode:problems[i].system?'algebra':problems[i].expr?'normal':problems[i].geo?'geometry':'algebra',stage:i+1};elapsed=0;last=performance.now();visible=!document.hidden;send('start',active);}
 document.addEventListener('visibilitychange',account);window.addEventListener('pagehide',e=>{account();if(!e.persisted)end()});window.addEventListener('pageshow',()=>{last=performance.now();visible=!document.hidden});
 send('view');return {start,end,share(){send('share')},get active(){return !!active}};
})();
const app=document.getElementById('app');let index=0,stage=0,history=[],state={},marks=[],markMode=false,drawing=null;let complete={};try{complete=JSON.parse(localStorage.getItem('pq-v020-progress')||'{}')}catch{};
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function num(n){return Number.isFinite(n)?C1.plain({'':n}):'未確定'}
function term(c,v,first){if(!c)return '';return (c<0?'−':first?'':'+')+(Math.abs(c)===1?'':num(Math.abs(c)))+v}
function expr(e){return (term(e[0],'x',true)+term(e[1],'y',!e[0])||'0')+' = '+num(e[2])}
function eqhtml(eq){return eq.map((e,i)=>'<div>'+expr(e)+'<small>'+['①','②'][i]+'</small></div>').join('')}
function same(a,b){return Math.abs(a-b)<1e-8}
function solve(eq){let [a,b,c]=eq[0],[d,e,f]=eq[1],det=a*e-b*d;return [(c*e-b*f)/det,(a*f-c*d)/det]}
function validPair(pair){return problems[index].eq.every(e=>same(e[0]*pair[0]+e[1]*pair[1],e[2]))}
function progressKey(){return studyMode==='direct'?'pq-direct-progress':'pq-v020-progress'}
function save(){try{localStorage.setItem(progressKey(),JSON.stringify(complete))}catch{}}
function home(){studyMetrics.end();unitHome()}
function start(i){studyMetrics.start(i);folderPath=(window.TRLabData.paths[i]||[]).slice();pendingChoice=null;optionCache=null;index=i;stage=problems[i].system?.word?-5:-2;history=[];state={};marks=[];markMode=false;if(studyMode==='direct')stage=-10;else if(problems[i].skipIntro){state.goal=0;if(problems[i].expr)stage=-1;else if(problems[i].system){const p=problems[i].system;stage=p.raw?-1:0;if(stage===0)state.model=p.eq.map(r=>r.slice());}else stage=0;}render();window.scrollTo?.(0,0)}
function choose(label,patch){if(patch.revisit!==undefined){const at=history.findIndex(h=>h.stage===patch.revisit);if(at>=0)back(at);return;}pendingChoice=null;optionCache=null;history.push({stage,state:JSON.parse(JSON.stringify(state)),label});Object.assign(state,patch);const oldStage=stage;stage=stage===-10?directCheckStage():stage+1;if(problems[index].system?.extra&&studyMode==='guided'){if(oldStage===3)stage=7;else if(oldStage===7)stage=8;}const system=problems[index].system;if(stage===-1&&system&&(system.word||system.group==='substitution'||!system.word&&!system.raw&&!system.extra)){state.model=system.word?C2.formRows(state.rawForm):system.eq.map(row=>row.slice());stage=0;}if(system&&stage===2&&state.reduced&&same(state.reduced.line[0],1)){state.value=state.reduced.line[1];stage=3;}const expression=problems[index].expr;if(expression&&stage===0&&expression.kind!=='terms'&&/^[+-]?\d+(?:\.\d+)?(?:\*[a-z](?:\^\d+)?)*$/.test(expression.routes[state.route??0].work)){state.work=C1.parse(expression.routes[state.route??0].work);stage=1;}if(expression&&stage===1&&expression.kind!=='terms'&&!expression.values&&expression.routes[state.route??0].template==='$'){state.answer=JSON.parse(JSON.stringify(state.work));stage=2;}if(studyMode==='direct'&&problems[index].system&&stage===7)stage=problems[index].system.extra?8:10;render()}
function back(n=history.length-1){if(n<0)return;if(!studyMetrics.active)studyMetrics.start(index);pendingChoice=null;optionCache=null;let h=history[n];stage=h.stage;state=JSON.parse(JSON.stringify(h.state));history=history.slice(0,n);render()}
function planLabel(p){let [a,b,s]=p;return '①'+(a===1?'':' × '+a)+' '+(s===1?'＋':'−')+' ②'+(b===1?'':' × '+b)}
function combine(p){return problems[index].eq[0].map((v,i)=>v*p[0]+problems[index].eq[1][i]*p[1]*p[2])}
function planOptions(){let base=problems[index].plan;let all=[base,[1,1,1],[1,1,-1],[base[0],base[1],-base[2]]];all.push(...(window.TRLabData.options[index]?.extraPlans||[]));let seen=new Set;return all.filter(p=>{let k=p.join();if(seen.has(k))return false;seen.add(k);return true}).slice(0,3)}
function choices(opts){return '<div class="choices">'+opts.map((o,i)=>'<button class="choice" data-option="'+i+'"><span class="letter">'+String.fromCharCode(65+i)+'</span><span>'+esc(o.label)+'</span></button>').join('')+'</div>'}
function shuffle(a){return a.map(v=>({v,k:Math.random()})).sort((a,b)=>a.k-b.k).map(x=>x.v)}
function content(){if(stage===-10)return directContent();if(problems[index].system)return C2.content();if(problems[index].expr)return C1.content();let p=problems[index],opts=[],q='',detail='';if(stage<0)return entryContent();if(p.geo)return geoContent();if(p.trap){
if(stage===0){q='答えの候補を一つ選んで、確かめよう。';opts=[[5,3],[6,1],[4,5]].map(pair=>({label:'x = '+pair[0]+'、y = '+pair[1],patch:{pair}}))}
else if(stage===1){q='答えが合っているか、確かめよう';detail='<p>検算のやり方を選んで</p>';opts=checkOptions()}
else if(stage===2){q='この結果から、選んだ組は解と言える？';detail=checks();opts=judgements()}
else return review();
}else{
if(stage===0){q='xかyを消すには、どう計算する？';detail='<p class="small">式を足す・引く前に、必要なら式全体を何倍かします。使える方法は一つとは限りません。</p>';opts=shuffle(planOptions().map(plan=>({label:planLabel(plan),patch:{plan}})))}
else if(stage===1){q='選んだ操作をすると、どの式になる？';let e=combine(state.plan);const [u,v,sign]=state.plan,a=p.eq[0].map(n=>n*u),b=p.eq[1].map(n=>n*v),candidates=[e,a.map((n,i)=>n-b[i]*sign),[e[0],e[1],a[2]],a.map((n,i)=>n+p.eq[1][i]*sign),[e[0],e[1],-e[2]]];let wrong=e.map(n=>-n);candidates.push(wrong);opts=shuffle(AnswerChoices.unique(candidates).slice(0,3).map(chosen=>({label:expr(chosen),patch:{combined:chosen}})));detail='<div class="work">'+planLabel(state.plan)+'</div><p class="small">計算は電卓を使っても構いません。</p>'}
else if(stage===2){let e=state.combined;if(e[0]&&e[1]||!e[0]&&!e[1]){q='ここまでの式から、次に何が必要？';detail='<div class="work">'+expr(e)+'</div>';opts=[{label:'もう一つの式と組み合わせて、文字を一つ消す',patch:{unfinished:true,reason:'another'}},{label:'この式だけでは今は値を決められないので、道筋を見直す',patch:{unfinished:true,reason:'review'}},{label:'残っている文字を0と決めて、答えの候補を出す',patch:{pair:e[0]?[e[2]/e[0],0]:[0,e[2]/e[1]],assumed:true}}];}
else{let axis=e[0]?0:1,value=e[2]/e[axis];q='残った文字の値はどれ？';detail='<div class="work">'+expr(e)+'</div>';opts=shuffle(AnswerChoices.numbers(value,e[axis],e[2]).filter((x,i,a)=>a.indexOf(x)===i).map(v=>({label:(axis===0?'x':'y')+' = '+num(v),patch:{axis,value:v}})))}}
else if(stage===3){if(state.unfinished)return review();if(state.assumed){q='答えが合っているか、確かめよう';detail='<p>検算のやり方を選んで</p>';opts=checkOptions()}else{q='求めた値を①に代入すると、もう一方の値は？';let e=p.eq[0],other=1-state.axis,val=(e[2]-e[state.axis]*state.value)/e[other];detail='<p>'+esc((state.axis===0?'x':'y')+' = '+num(state.value))+' を①に代入します。</p>';opts=shuffle(AnswerChoices.unique([val,(e[2]+e[state.axis]*state.value)/e[other],e[2]/e[other],-val,...AnswerChoices.numbers(val,e[other],e[2]-e[state.axis]*state.value)]).slice(0,3).filter((v,i,a)=>a.indexOf(v)===i).map(v=>{let pair=[];pair[state.axis]=state.value;pair[other]=v;return {label:(other===0?'x':'y')+' = '+num(v),patch:{pair}}}))}}
else if(stage===4){if(state.assumed){q='この結果から、答えの候補は解と言える？';detail=checks();opts=judgements()}else{q='答えが合っているか、確かめよう';detail='<p>検算のやり方を選んで</p>';opts=checkOptions()}}
else if(stage===5&&!state.assumed){q='この結果から、答えの候補は解と言える？';detail=checks();opts=judgements()}
else return review();
}return {q,detail,opts}}
function checkOptions(){return shuffle([{label:'①と②の両方に代入する',patch:{check:'both'}},{label:'①だけに代入する',patch:{check:'first'}},{label:'②だけに代入する',patch:{check:'second'}}])}
function checks(){let p=problems[index],pair=state.pair;return '<p>候補：x = '+num(pair[0])+'、y = '+num(pair[1])+'</p>'+p.eq.map((e,i)=>{if(state.check==='first'&&i===1||state.check==='second'&&i===0)return '';let lhs=e[0]*pair[0]+e[1]*pair[1];return '<div class="check">'+['①','②'][i]+'　'+e[0]+' × ('+num(pair[0])+') '+(e[1]<0?'−':'+')+' '+Math.abs(e[1])+' × ('+num(pair[1])+')<br>左辺 '+num(lhs)+' ／ 右辺 '+num(e[2])+'</div>'}).join('')}
function judgements(){return [{label:'二つの式を両方満たすので、解と言える',patch:{judge:'yes'}},{label:'成り立たない式があるので、この組は解ではない',patch:{judge:'no'}},{label:'片方しか確認していないので、もう一方も確かめる',patch:{judge:'more'}}]}
function review(){return {review:true}}
function workingHTML(){let out='';if(state.plan){const [a,b,sign]=state.plan,p=problems[index],one=p.eq[0].map(v=>v*a),two=p.eq[1].map(v=>v*b);out+='<div class="small">'+(pendingChoice?'試している操作：':'選んだ操作：')+planLabel(state.plan)+'</div><div class="operation-preview"><div class="operation-line"><span></span><span>'+expr(one)+'</span><small>①'+(a===1?'':'×'+a)+'</small></div><div class="operation-line"><span>'+(sign===1?'＋':'−')+'</span><span>'+expr(two)+'</span><small>②'+(b===1?'':'×'+b)+'</small></div></div>'}if(state.combined)out+='<div class="work">'+(pendingChoice&&pendingChoice.patch.combined?'試している計算結果':'選んだ結果')+'：'+expr(state.combined)+'</div>';if(state.pair)out+='<p>答えの候補：x = '+num(state.pair[0])+'、y = '+num(state.pair[1])+'</p>';return out}
function printedFraction(numerator,denominator,label,source=''){
 const attrs=source?' data-math-source="'+esc(source)+'"':'';
 return '<span class="math-fraction" role="math" aria-label="'+esc(label)+'"'+attrs+'><span class="fraction-num" aria-hidden="true">'+numerator+'</span><span class="fraction-den" aria-hidden="true">'+denominator+'</span></span>';
}
function renderPrintedMath(source){
 try{
  const tokens=source.match(/\d+(?:\.\d+)?|[a-z]|[+\-*/^()=]/g)||[];
  if(tokens.join('')!==source.replace(/\s/g,''))throw Error('display syntax');let at=0;
  const leaf=text=>({kind:'leaf',text});
  function atom(){const token=tokens[at++];let node;if(token==='('){node={kind:'group',child:sum()};if(tokens[at++]!==')')throw Error('parenthesis')}else if(token==='-'||token==='+')node={kind:'unary',op:token,child:atom()};else if(/^(?:[a-z]|\d+(?:\.\d+)?)$/.test(token||''))node=leaf(token);else throw Error('atom');if(tokens[at]==='^'){at++;node={kind:'power',left:node,right:atom()}}return node}
  function product(){let node=atom();while(tokens[at]==='*'||tokens[at]==='/'){const op=tokens[at++];node={kind:op==='/'?'fraction':'multiply',left:node,right:atom()}}return node}
  function sum(){let node=product();while(tokens[at]==='+'||tokens[at]==='-'){const op=tokens[at++];node={kind:'sum',op,left:node,right:product()}}return node}
  function plain(node){if(node.kind==='leaf')return node.text;if(node.kind==='group')return '('+plain(node.child)+')';if(node.kind==='unary')return node.op+plain(node.child);return plain(node.left)+({power:'^',fraction:'/',multiply:'*'}[node.kind]||node.op)+plain(node.right)}
  function show(node,unwrap=false){if(node.kind==='leaf')return esc(node.text);if(node.kind==='group')return unwrap?show(node.child):'('+show(node.child)+')';if(node.kind==='unary')return (node.op==='-'?'−':'＋')+show(node.child);if(node.kind==='power')return show(node.left)+'<sup>'+show(node.right)+'</sup>';if(node.kind==='fraction')return printedFraction(show(node.left,true),show(node.right,true),'分母 '+plain(node.right)+'、分子 '+plain(node.left),plain(node));if(node.kind==='multiply')return show(node.left)+(node.right.kind==='group'||node.right.kind==='leaf'&&/^[a-z]$/.test(node.right.text)||node.right.kind==='power'&&node.right.left.kind==='leaf'&&/^[a-z]$/.test(node.right.left.text)?'':' × ')+show(node.right);return show(node.left)+(node.op==='+'?' ＋ ':' − ')+show(node.right)}
  let tree=sum(),out=show(tree);while(tokens[at]==='='){at++;out+=' ＝ '+show(sum())}if(at!==tokens.length)throw Error('trailing');return out;
 }catch{return esc(source).replace(/\^([234])/g,'<sup>$1</sup>').replace(/\*/g,' × ').replace(/-/g,' − ').replace(/\+/g,' ＋ ')}
}
function decorateNumericFractions(root){
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),nodes=[];let node;
 while(node=walker.nextNode())if(node.parentElement&&!node.parentElement.closest('.math-fraction,.c1-fraction,script,style,textarea,code,pre')&&/\d\/\d/.test(node.nodeValue))nodes.push(node);
 for(const node of nodes){const text=node.nodeValue,frag=document.createDocumentFragment();let last=0,changed=false;
  for(const match of text.matchAll(/\((-?\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)\)|(?<![\w./])(\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)(?![\w./])/g)){
   const n=match[1]??match[3],d=match[2]??match[4];if(Number(d)===0)continue;
   frag.append(document.createTextNode(text.slice(last,match.index)));
   const temp=document.createElement('span');temp.innerHTML=printedFraction(esc(n),esc(d),d+'分の'+n,match[0]);frag.append(temp.firstChild);last=match.index+match[0].length;changed=true;
  }
  if(changed){frag.append(document.createTextNode(text.slice(last)));node.replaceWith(frag)}
 }
}

// Presentation only: the underlying expressions, labels and stored answers remain ASCII.
function decorateMathVariables(root){
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),nodes=[];let node;
 while(node=walker.nextNode()){
  const parent=node.parentElement;
  if(!parent||parent.closest('.math-variable,script,style,textarea,code,pre')||!/[a-z]/.test(node.nodeValue))continue;
  nodes.push(node);
 }
 const units=new Set(['cm','mm','km','mg','kg','ml','min','max','g','m']);
 for(const textNode of nodes){
  const text=textNode.nodeValue,fragment=document.createDocumentFragment();let last=0,changed=false;
  for(const hit of text.matchAll(/[A-Za-z]+/g)){
   const token=hit[0],start=hit.index;
   if(!/^[abchlmnrxyz]+$/.test(token))continue;
   const mathContainer=textNode.parentElement.closest('.equations,.work,.operation-preview,.c1-math,.c1-work,.c2-equations,.c2-work,.c2-raw,.c2-process');
   if(units.has(token)&&!(token==='m'&&(mathContainer||/^[＝=：]/.test(text.slice(start+1).trimStart()))))continue;
   fragment.append(document.createTextNode(text.slice(last,start)));
   for(const c of token){
    const svg=textNode.parentElement.namespaceURI==='http://www.w3.org/2000/svg';
    const span=svg?document.createElementNS('http://www.w3.org/2000/svg','tspan'):document.createElement('span');
    span.setAttribute('class','math-variable');span.textContent=c;fragment.append(span);
   }
   last=start+token.length;changed=true;
  }
  if(changed){fragment.append(document.createTextNode(text.slice(last)));textNode.replaceWith(fragment)}
 }
}

function render(){document.body.classList.remove('tree-screen');document.body.classList.add('study-screen');app.classList.remove('home','folder-home','tree-home');app.classList.add('study');let p=problems[index],c=content();if(c.opts){if(!optionCache)optionCache=c.opts;c.opts=optionCache}app.classList.toggle('reviewing',!!c.review);app.classList.toggle('geometry-study',!!p.geo);app.innerHTML='<div class="row between topbar"><button id="home">問題一覧</button><span class="small">'+(folderPath.slice(2).map(key=>folderNodes[key]?.label).filter(Boolean).join(' / '))+' · '+p.level+' / '+(stage===-10?'ヒント無し · 答えを選ぶ':c.review?'振り返り':(stage===-5||stage===-2&&!p.system?.word)?'目標を確認':stage===-4&&p.system?.word?'文字を決める':stage===-3&&p.system?.word?'立式①':stage===-2&&p.system?.word?'立式②':stage===-1?(p.system?.word?'式を整理':'見通しを立てる'):'解き進める '+(stage+1))+'</span></div><h2>'+esc(p.title)+'</h2><div class="progress"><i style="width:'+(c.review?100:Math.min(90,(stage+(p.system?.word?5:2))*10+5))+'%"></i></div><div class="row toolbar"><button id="readMode" class="'+(!markMode?'active':'')+'">読む</button><button id="markMode" class="'+(markMode?'active':'')+'">マーカー</button><button id="undoInk">線を戻す</button><button id="clearInk">線を消す</button></div><section class="paper '+(markMode?'marking':'')+'" id="paper"><div class="paper-content">'+candidatePaper(p)+'</div><svg class="ink" id="ink" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-label="問題にマーカーを引く領域"></svg></section><section class="panel" id="task">'+(c.review?(p.system?C2.review():p.expr?C1.review():p.geo?geoReview():p.authored?Authored.review():reviewHTML()):'<div class="fit-content"><h3>'+c.q+'</h3>'+c.detail+choices(c.opts)+'</div>')+'</section><div class="row bottomrow"><button id="back" '+(!history.length?'disabled':'')+'>一つ戻る</button></div>'+(!c.review?'<div class="confirm-row"><span class="small" aria-live="polite">'+(pendingChoice?'図・式を確認して決定':'選択肢を押すと図・式に反映')+'</span><button class="primary" id="confirmChoice" '+(!pendingChoice?'disabled':'')+'>この内容で進む</button></div>':'');
document.getElementById('home').onclick=home;document.getElementById('back').onclick=()=>back();document.getElementById('readMode').onclick=()=>{markMode=false;render()};document.getElementById('markMode').onclick=()=>{markMode=true;render()};document.getElementById('undoInk').onclick=()=>{marks.pop();drawInk()};document.getElementById('clearInk').onclick=()=>{marks=[];drawInk()};if(c.opts)app.querySelectorAll('[data-option]').forEach(b=>{const o=c.opts[+b.dataset.option],selected=pendingChoice===o;b.classList.toggle('choice-previewed',selected);b.setAttribute('aria-pressed',String(selected));b.onclick=()=>previewChoice(o)});const confirm=document.getElementById('confirmChoice');if(confirm)confirm.onclick=confirmChoice;app.querySelectorAll('[data-rewind]').forEach(b=>b.onclick=()=>back(+b.dataset.rewind));let retry=document.getElementById('retry');if(retry)retry.onclick=()=>start(index);let next=document.getElementById('next');if(next)next.onclick=()=>nextIndex(index)!==null?start(nextIndex(index)):home();let all=document.getElementById('showBoth');if(all)all.onclick=()=>{state.check='both';render()};decorateNumericFractions(app);decorateMathVariables(app);bindInk();drawInk();fitStudy();requestAnimationFrame(fitStudy)}
function stepFeedback(){
 const p=problems[index],items=[];
 const add=(h,i,status,title,reason)=>items.push({i,status,title,reason,label:h.label});
 history.forEach((h,i)=>{
  const n=h.stage;if(n===-10){add(h,i,validPair(state.pair)?'ok':'wrong','答えの選択','元の二つの式を両方満たす値の組かを検算で確かめます。');return;}
  if(n<0){const s=entrySteps(p)[n+2],o=s.options.find(o=>o.id===state['entry'+(n+2)]);add(h,i,o?.correct?'ok':'wrong',s.title,s.reason);return;}

  if(p.trap&&n===0){const ok=validPair(state.pair);add(h,i,ok?'ok':'wrong','答えの候補',ok?'この組は①と②の両方を満たします。':'選んだ組が、二つの式を両方満たすか、下の代入結果を見てください。候補を試すこと自体は問題ありません。');return;}
  if(!p.trap&&n===0){const e=combine(state.plan),gone=e[0]===0||e[1]===0;add(h,i,gone?'ok':'pending','最初の操作',gone?'この操作で'+(e[0]===0?'x':'y')+'の係数が0になり、文字を一つ減らせます。':'操作はできますが、結果は '+expr(e)+'。xとyが両方残るので、さらに消去する必要があります。');return;}
  if(!p.trap&&n===1){const e=combine(state.plan),ok=e.every((v,k)=>same(v,state.combined[k]));const a=p.eq[0].map(v=>v*state.plan[0]),b=p.eq[1].map(v=>v*state.plan[1]);add(h,i,ok?'ok':'wrong','式どうしの計算',ok?'選んだ操作と計算結果が一致しています。':'選んだ結果：'+expr(state.combined)+'。正しく操作すると '+expr(e)+' です。xの係数、yの係数、右辺の数をそれぞれ'+(state.plan[2]===1?'足します。':'引きます。')+' 引く場合は、②の各項すべての符号に注意してください。'+' 操作前の式：'+expr(a)+' ／ '+expr(b));return;}
  if(!p.trap&&n===2){if(state.unfinished){add(h,i,'pending','次の方針','まだ答えは出ていません。さらに式を組み合わせる必要があると気づけています。この試作では最初の操作へ戻って選び直せます。');return;}if(state.assumed){add(h,i,'wrong','値の決め方','xやyを、条件なしに0と決めることはできません。二つの元の式を満たす値を求める必要があります。');return;}const e=state.combined,expected=e[2]/e[state.axis],ok=same(state.value,expected);add(h,i,ok?'ok':'wrong','残った文字の値',ok?'直前に選んだ式から値を求める操作は合っています。':'直前の式は '+expr(e)+'。両辺を '+num(e[state.axis])+' で割ると '+(state.axis===0?'x':'y')+' = '+num(expected)+' です。');return;}
  if(!p.trap&&n===3&&!state.assumed&&!state.unfinished){const e=p.eq[0],other=1-state.axis,expected=(e[2]-e[state.axis]*state.value)/e[other],ok=same(state.pair[other],expected);add(h,i,ok?'ok':'wrong','元の式への代入',ok?'直前に求めた値を①に代入する手順は合っています。':'①は '+expr(e)+'。'+(state.axis===0?'x':'y')+' = '+num(state.value)+' を入れると、'+(other===0?'x':'y')+' = ('+num(e[2])+' − '+num(e[state.axis])+' × ('+num(state.value)+')) ÷ '+num(e[other])+' = '+num(expected)+' です。');return;}
  const checkStage=p.trap?1:state.assumed?3:4;
  if(n===checkStage){add(h,i,state.check==='both'?'ok':'pending','検算する式',state.check==='both'?'①と②の両方を確認しています。':'片方だけの確認では不十分です。「連立方程式の解」は、①と②を両方成り立たせる値の組です。');return;}
  if(state.judge){const selected=state.check==='first'?[0]:state.check==='second'?[1]:[0,1],mismatch=selected.some(i=>{const e=p.eq[i];return !same(e[0]*state.pair[0]+e[1]*state.pair[1],e[2])}),expected=mismatch?'no':state.check==='both'?'yes':'more',ok=state.judge===expected;add(h,i,ok?'ok':'wrong','検算結果の判断',ok?(expected==='no'?'合わない式を見つけ、この候補は解ではないと正しく判断できています。':expected==='more'?'確認していない式があることに気づけています。':'両方の式が成立することから、解だと正しく判断できています。'):(expected==='more'?'まだ片方しか確認していません。解だと決める前に、もう一方も確認します。':expected==='no'?'下の代入結果で「左辺 ≠ 右辺」になっている式を見てください。一つでも不一致なら、この組は解ではありません。':'①も②も左辺と右辺が等しくなっています。この組は解です。'));}
 });return items;
}
function feedbackChecks(){if(!state.pair)return '';return '<h3>ここを見れば確かめられます</h3><p class="small">答え合わせとして、元の二つの式を両方表示します。</p>'+problems[index].eq.map((e,i)=>{const a=state.pair,lhs=e[0]*a[0]+e[1]*a[1],ok=same(lhs,e[2]);return '<div class="check '+(ok?'check-ok':'check-wrong')+'"><strong>'+['①','②'][i]+'　'+(ok?'○ 成立':'× 不一致')+'</strong><div>'+e[0]+' × ('+num(a[0])+') '+(e[1]<0?'−':'+')+' '+Math.abs(e[1])+' × ('+num(a[1])+')</div><div>左辺 <b>'+num(lhs)+'</b> '+(ok?'＝':'≠')+' 右辺 <b>'+num(e[2])+'</b></div></div>'}).join('')}
function reviewHTML(){
 const p=problems[index],actual=solve(p.eq),items=stepFeedback(),pairOK=!!state.pair&&validPair(state.pair),firstWrong=items.find(x=>x.status==='wrong'),firstPending=items.find(x=>x.status==='pending'),focus=firstWrong||firstPending;
 const checkItem=items.find(x=>x.title==='検算結果の判断');
 const allOK=pairOK&&items.every(x=>x.status==='ok');studyMetrics.end(allOK?'clear':'fail');if(allOK){complete[index]=true;save()}
 const badge=(status,label)=>'<span class="verdict '+status+'">'+(status==='ok'?'○':status==='wrong'?'×':'△')+' '+label+'</span>';
 let out='<div class="result-heading">答え合わせ</div><div class="verdicts">'+badge(state.pair?(pairOK?'ok':'wrong'):'pending',state.pair?(pairOK?'答えは正解':'答えは不正解'):'答えは未確定')+badge(checkItem?(checkItem.status):'pending',checkItem?(checkItem.status==='ok'?'検算の判断は正解':'検算の判断を見直そう'):'検算は未完了')+'</div>';
 if(allOK)out+='<p class="note">解き方・答え・検算がすべて合っています。</p>';
 if(focus)out+='<div class="feedback-focus"><strong>'+(firstWrong?'最初に間違えたところ':'次に確認するところ')+'：手順 '+(focus.i+1)+'「'+focus.title+'」</strong><p>'+esc(focus.reason)+'</p><button class="primary" data-rewind="'+focus.i+'">この手順から選び直す</button></div>';
 if(pairOK&&firstWrong)out+='<p class="small">答えが合っていても、途中の操作に誤りがある場合は、その手順も確認しましょう。</p>';
 if(checkItem&&checkItem.status==='ok'&&!pairOK)out+='<p class="note">答えの候補が間違っていても、検算で見抜けた点は正解です。</p>';
 out+=feedbackChecks();
 out+='<details class="route-details"><summary>各手順の○×と理由を見る</summary>'+items.map(h=>'<div class="log">'+badge(h.status,'手順 '+(h.i+1)+'：'+h.title)+'<div>'+esc(h.label)+'</div><p class="small">'+esc(h.reason)+'</p><button data-rewind="'+h.i+'">ここから選び直す</button></div>').join('')+'</details>';
 out+='<details><summary>正しい解き方の一例を見る</summary><p>二つの式を両方成り立たせる値の組を求めます。</p>'+(p.trap||studyMode==='direct'?'<p>候補を①と②へそれぞれ代入します。</p>':'<p>'+planLabel(p.plan)+' とすると '+expr(combine(p.plan))+'。残った文字を求め、元の式へ代入します。</p>')+'<p>正解：x = '+num(actual[0])+'、y = '+num(actual[1])+'</p></details>';
 out+='<div class="row" style="margin-top:12px"><button id="retry">最初から試す</button><button class="primary" id="next">'+(nextIndex(index)!==null?'次の問題へ':'問題一覧へ')+'</button></div>';return out;
}

// Layout scrolls at its natural size. Ads must never shrink the learning content.
function fitStudy(){if(!app.classList.contains('study'))return;for(const el of app.querySelectorAll('.paper-content,.fit-content'))el.style.transform='none'}
window.addEventListener('resize',fitStudy);if(window.visualViewport)window.visualViewport.addEventListener('resize',fitStudy);if(document.fonts){document.fonts.ready.then(fitStudy);document.fonts.addEventListener?.('loadingdone',fitStudy);}if(window.ResizeObserver){const fitObserver=new ResizeObserver(fitStudy);fitObserver.observe(app)}
function bindInk(){let svg=document.getElementById('ink');function pos(e){let r=svg.getBoundingClientRect();return [(e.clientX-r.left)/r.width*1000,(e.clientY-r.top)/r.height*1000]}svg.onpointerdown=e=>{if(!markMode)return;e.preventDefault();svg.setPointerCapture(e.pointerId);drawing=[pos(e)];marks.push(drawing);drawInk()};svg.onpointermove=e=>{if(!drawing)return;e.preventDefault();drawing.push(pos(e));drawInk()};svg.onpointerup=svg.onpointercancel=()=>drawing=null}
function drawInk(){let svg=document.getElementById('ink');if(svg)svg.innerHTML=marks.map(points=>'<polyline points="'+points.map(p=>p.join(',')).join(' ')+'" fill="none" stroke="#f0d25a" stroke-opacity=".4" stroke-width="18" vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round"/>').join('')}
document.getElementById('labHome').onclick=()=>{location.href='https://tsubasarock21.github.io/'};let calcText='';const dialog=document.getElementById('calc');document.getElementById('calcOpen').onclick=()=>dialog.showModal();document.getElementById('calcClose').onclick=()=>dialog.close();function calculate(s){let toks=s.match(/\d*\.?\d+|[+\-*/()]/g)||[],i=0;function atom(){let t=toks[i++];if(t==='-')return -atom();if(t==='+')return atom();if(t==='('){let v=sum();if(toks[i++]!==')')throw Error();return v}if(t===undefined||!/^\d*\.?\d+$/.test(t))throw Error();return Number(t)}function mul(){let n=atom();while(toks[i]==='*'||toks[i]==='/'){let op=toks[i++],v=atom();n=op==='*'?n*v:n/v}return n}function sum(){let n=mul();while(toks[i]==='+'||toks[i]==='-'){let op=toks[i++],v=mul();n=op==='+'?n+v:n-v}return n}let v=sum();if(i!==toks.length||!Number.isFinite(v))throw Error();return Math.round(v*1e10)/1e10}
document.getElementById('keys').innerHTML=['C','(',')','⌫','7','8','9','÷','4','5','6','×','1','2','3','−','0','.','=','+'].map(k=>'<button>'+k+'</button>').join('');document.getElementById('keys').onclick=e=>{if(e.target.tagName!=='BUTTON')return;let k=e.target.textContent;if(k==='C')calcText='';else if(k==='⌫')calcText=calcText.slice(0,-1);else if(k==='='){try{calcText=String(calculate(calcText.replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-')))}catch{document.getElementById('display').textContent='式を確認してください';return}}else if(calcText.length<80)calcText+=k;document.getElementById('display').textContent=calcText||'0'};
