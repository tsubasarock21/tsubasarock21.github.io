// Chapter 2: preserve chosen equations and calculations until the final review.
const C2=(()=>{
 const f=n=>Number.isFinite(n)?C1.plain({'':Math.abs(n)<1e-9?0:n}):'未確定';
 const gcd=(a,b)=>{a=Math.abs(Math.round(a));b=Math.abs(Math.round(b));while(b){const r=a%b;a=b;b=r}return a||1};
 function normalize(row){const ds=row.map(v=>{for(let d=1;d<=1000;d++)if(Math.abs(v*d-Math.round(v*d))<1e-7)return d;throw Error('係数を整数にできません')});let l=ds.reduce((a,b)=>a*b/gcd(a,b),1),out=row.map(v=>Math.round(v*l)),g=out.reduce((a,b)=>gcd(a,b));return out.map(v=>v/g)}
 const eqText=e=>C1.plain(C1.add({},{x:e[0],y:e[1]}))+' ＝ '+f(e[2]);
 const eqTag=i=>problems[index].system?.extra?.kind==='parameter'&&i===1?'比の式':['①','②'][i];
 const pairText=a=>'x＝'+f(a[0])+'、y＝'+f(a[1]);
 const eqLabel=a=>a.map((r,i)=>eqTag(i)+' '+eqText(r)).join(' ／ ');
 const equal=(a,b)=>a.length===b.length&&a.every((v,i)=>Array.isArray(v)?equal(v,b[i]):same(v,b[i]));
 const option=(label,patch)=>({label,patch});
 const goalChoices=p=>p.goalChoices||[p.goal,p.word?'二つの数量の合計だけ':'①だけを満たすxとyの組',p.word?'二つの数量の差だけ':'②だけを満たすxとyの組'];
 function swapLetters(t){return t.replace(/[xy]/g,c=>c==='x'?'y':'x')}
 function withVariables(p,s=state){
  if(!p.word||p.variableContext)return p;
  if(s.variableChoice==='reverse')return {...p,originalWord:p,variableContext:true,eq:p.eq.map(([a,b,c])=>[b,a,c]),vars:p.vars.slice().reverse(),answerMap:p.answerMap?.slice().reverse(),answerNames:p.answerNames?.slice().reverse(),modelReason:swapLetters(p.modelReason)};
  if(s.variableChoice==='current')return {...p,originalWord:p,variableContext:true,eq:[[1,1,75],[1/1.2,1/.9,70]],vars:p.answerNames.slice(),answerNames:p.answerNames.slice(),answerMap:null,modelReason:'今年の人数をx人・y人と置いたので、x＋y＝75。昨年に戻した人数の合計はx÷1.2＋y÷0.9＝70です。'};
  return {...p,originalWord:p,variableContext:true};
 }
 const definition=(p,s=state)=>{const names=s.variableChoice==='known'?p.badVars:withVariables(p,s).vars;return 'x：'+names[0]+' ／ y：'+names[1]};
 function variableOptions(p){return [option(definition(p,{variableChoice:'forward'}),{variableChoice:'forward'}),option(definition(p,{variableChoice:'reverse'}),{variableChoice:'reverse'}),p.currentYear?option(definition(p,{variableChoice:'current'}),{variableChoice:'current'}):option(definition(p,{variableChoice:'known'}),{variableChoice:'known'})]}
 function current(){return withVariables(problems[index].system)}
 function rawRows(p,which){const original=p.originalWord||problems[index].system;const names=state.variableChoice==='current'&&original.currentFirstRows?(which===0?'currentFirstRows':'currentSecondRows'):(which===0?'firstRows':'secondRows');return original[names].map(row=>row.map(t=>state.variableChoice==='reverse'?swapLetters(t):t))}
 const rawRowLabel=(row,i)=>eqTag(i)+' '+row.map(rawText).join('＝');
 function rawForms(p){const base=problems[index]?.system;const original=p.originalWord||base||p;let forms=state.variableChoice==='current'&&original.currentForms?original.currentForms:original.forms;
  if(!forms)throw Error('文章式が未設定');
  return forms.map((v,id)=>({...v,id,equations:v.equations.map(row=>row.map(text=>state.variableChoice==='reverse'?swapLetters(text):text))}));
 }
 function equationRow(row){const poly=C1.add(C1.parse(row[0]),C1.parse(row[1]),-1);if(Object.keys(poly).some(k=>!['','x','y'].includes(k)))throw Error('一次式でない条件');return [poly.x||0,poly.y||0,-(poly['']||0)]}
 const formRows=form=>form.equations.map(equationRow);
 function rawText(text){return text.replace(/\*/g,'×').replace(/\//g,'÷').replace(/\+/g,'＋').replace(/-/g,'−')}
 const rawLabel=form=>form.equations.map((row,i)=>eqTag(i)+' '+row.map(rawText).join('＝')).join(' ／ ');
 const rawHTML=form=>'<div class="c2-raw">'+form.equations.map((row,i)=>'<div>'+eqTag(i)+' '+esc(row.map(rawText).join('＝'))+'</div>').join('')+'</div>';
 function denominator(n){for(let d=1;d<=1000;d++)if(Math.abs(n*d-Math.round(n*d))<1e-7)return d;throw Error('係数の分母')}
 function numberText(n){const d=denominator(n),a=Math.round(n*d);let t=d;while(t%2===0)t/=2;while(t%5===0)t/=5;return t===1?String(Math.round(n*1e8)/1e8):'('+a+'÷'+d+')'}
 function polyText(poly){const vars=['x','y',''],parts=[];for(const key of vars){const n=poly[key]||0;if(Math.abs(n)<1e-9)continue;const magnitude=numberText(Math.abs(n));parts.push((n<0?'−':parts.length?'＋':'')+(key&&Math.abs(n)===1?'':magnitude)+key)}return parts.join('')||'0'}
 function decimalEquation(row){return polyText({x:row[0],y:row[1]})+'＝'+polyText({'':row[2]})}
 function processHTML(form,chosen){return '<div class="c2-process">'+form.equations.map((row,i)=>{
  const left=C1.parse(row[0]),right=C1.parse(row[1]),linear=equationRow(row),start=row.map(rawText).join('＝'),expanded=polyText(left)+'＝'+polyText(right),moved=decimalEquation(linear);
  const lines=[{label:'数字を使って立てた式',text:start}];if(expanded!==start)lines.push({label:'かけ算・割合・括弧を計算',text:expanded});if(moved!==expanded){if(Math.abs(left['']||0)>1e-9){const c=left[''],rhs=polyText({'':right['']||0})+(c<0?'＋':'−')+numberText(Math.abs(c));lines.push({label:'数の項を右辺へ移す',text:polyText({x:linear[0],y:linear[1]})+'＝'+rhs});lines.push({label:'右辺を計算',text:moved})}else lines.push({label:'文字の項を左、数の項を右にまとめる',text:moved})}
  if(chosen){
   const axis=linear.findIndex(v=>Math.abs(v)>1e-9),lcm=linear.map(denominator).reduce((a,b)=>a*b/gcd(a,b),1),cleared=linear.map(v=>Math.round(v*lcm));
   if(lcm>1)lines.push({label:'分数・小数をなくすため、両辺を'+lcm+'倍',text:decimalEquation(cleared)});
   const reference=lcm>1?cleared:linear,factor=chosen[i][axis]/reference[axis],equivalent=reference.every((v,j)=>same(v*factor,chosen[i][j]));let label='選んだ整理後の式';
   if(equivalent&&factor>1+1e-9)label='両辺を'+numberText(factor)+'倍';
   if(equivalent&&factor>0&&factor<1-1e-9)label='両辺を'+numberText(1/factor)+'で割る';
   if(!equivalent||!same(factor,1))lines.push({label,text:eqText(chosen[i])});
  }

  return '<section><strong>'+eqTag(i)+'</strong>'+lines.map((line,j)=>'<div>'+(j?'↓ ':'')+'<small>'+esc(line.label)+'</small><br>'+esc(line.text)+'</div>').join('')+'</section>'}).join('')+'</div>'}
 const twoSided=p=>p.word||p.group==='substitution'||!!p.raw&&!p.extra;
 const rawAscii=t=>t.replace(/−/g,'-').replace(/＋/g,'+').replace(/÷/g,'/').replace(/×/g,'*').replace(/(\d|\))([xy])/g,'$1*$2').replace(/(\d|\))\(/g,'$1*(');
 function rawEquations(p){if(!p.raw)return null;const parts=p.raw.length===1?p.raw[0].split('＝'):null;return parts&&parts.length===3?[[parts[0],parts[2]],[parts[1],parts[2]]]:p.raw.slice(0,2).map(t=>t.split('＝'));}
 function originalSides(p,pair){if(p.raw&&!p.extra&&p.group!=='substitution'){const env={x:pair[0],y:pair[1]};return rawEquations(p).map(row=>row.map(t=>C1.value(C1.parse(rawAscii(t)),env)));}if(p.group==='substitution')return p.eq.map((e,i)=>{if(i!==p.iso[0])return [e[0]*pair[0]+e[1]*pair[1],e[2]];const axis=p.iso[1],other=1-axis;return [pair[axis],(e[2]-e[other]*pair[other])/e[axis]]});if(!p.word)return p.eq.map(e=>[e[0]*pair[0]+e[1]*pair[1],e[2]]);const env={x:pair[0],y:pair[1]};return rawForms(p)[0].equations.map(([l,r])=>[C1.value(C1.parse(l),env),C1.value(C1.parse(r),env)])}
 function selectedForm(p,s=state){return s.rawForm||rawForms(p)[0]}
 function models(p,s=state){p=withVariables(p,s);const rows=p.word?formRows(selectedForm(p,s)):p.eq,a=rows.map(normalize);
  if(p.modelChoices&&!p.word)return [a,...p.modelChoices.map(m=>m.map(r=>r.slice()))];
  const candidates=[a];
  const push=m=>{if(Math.abs(m[0][0]*m[1][1]-m[0][1]*m[1][0])<1e-9)return;if(!candidates.some(v=>equal(v,m)))candidates.push(m)};
  for(let row=0;row<2;row++)for(const col of [1,2,0]){const m=a.map(r=>r.slice());m[row][col]*=-1;push(m)}
  return candidates.slice(0,3);
 }
 function subRoute(p,m,alternate=false){let row=p.iso?.[0]??(p.extra?.kind==='parameter'?1:0),axis=p.iso?.[1]??(p.extra?.kind==='parameter'?0:undefined)??(Math.abs(m[0][0])<=Math.abs(m[0][1])?0:1);if(alternate){row=1-row;axis=Math.abs(m[row][0])<=Math.abs(m[row][1])?0:1}if(!m[row][axis])axis=1-axis;return {type:'sub',row,axis}}
 function addRoute(m){const costs=[0,1].map(j=>{const g=gcd(m[0][j],m[1][j]);return (Math.abs(m[0][j])+Math.abs(m[1][j]))/g});let target=costs[1]<=costs[0]?1:0;if(!m[0][target]||!m[1][target])target=1-target;const g=gcd(m[0][target],m[1][target]);return {type:'add',target,u:Math.abs(m[1][target])/g,v:Math.abs(m[0][target])/g,sign:m[0][target]*m[1][target]<0?1:-1}}
 const isSub=r=>r.type==='sub'||r.kind?.startsWith('sub-');
 function givenSubstitution(r){const p=problems[index].system;return p.group==='substitution'&&!r.kind&&r.row===p.iso[0]&&r.axis===p.iso[1]?p.raw[r.row]:null}
 function isolation(m,r){const e=m[r.row],other=1-r.axis;return {alpha:r.kind==='sub-sign'?r.alpha:e[2]/e[r.axis],beta:(r.kind==='sub-coefficient'?1:-1)*e[other]/e[r.axis],variable:['x','y'][other]}}
 function isolateText(m,r){const given=givenSubstitution(r);if(given)return given;const q=isolation(m,r),poly={};if(q.alpha)poly['']=q.alpha;if(q.beta)poly[q.variable]=q.beta;return ['x','y'][r.axis]+'＝'+C1.plain(poly)}
 function substitutedText(m,r){const other=m[1-r.row],sub=isolateText(m,r).split(/[=＝]/)[1];return [0,1].filter(j=>Math.abs(other[j])>1e-9).map((j,i)=>{const c=other[j],sign=c<0?'−':i?'＋':'',mag=Math.abs(c)===1?'':f(Math.abs(c));return sign+mag+(j===r.axis?'('+sub+')':['x','y'][j])}).join('')+'＝'+f(other[2])}
 function routeLabel(m,r){if(problems[index].system.group==='substitution')return substitutedText(m,r);if(isSub(r))return '代入法：'+eqTag(r.row)+'を'+isolateText(m,r)+'と表して'+eqTag(1-r.row)+'へ代入';if(r.type==='bad')return '①と②を組み合わせて文字を消す';return '加減法：'+eqTag(0)+(r.u===1?'':'×'+r.u)+(r.sign===1?' ＋ ':' − ')+eqTag(1)+(r.v===1?'':'×'+r.v)+'で文字を消す'}
 function mistakenSubRoute(p,m){const r=subRoute(p,m);if(!m[r.row][2])r.row=1-r.row;if(!m[r.row][r.axis])r.axis=1-r.axis;return {...r,type:'bad',kind:'sub-sign',alpha:-m[r.row][2]/m[r.row][r.axis]}}
 function routes(p,m){return p.group==='substitution'?[subRoute(p,m),mistakenSubRoute(p,m),{...subRoute(p,m),type:'bad',kind:'sub-coefficient'}]:[addRoute(m),subRoute(p,m),mistakenSubRoute(p,m)]}
 function reduced(m,r){if(isSub(r)){const q=isolation(m,r),other=m[1-r.row];return {axis:1-r.axis,line:[other[1-r.axis]+other[r.axis]*q.beta,other[2]-other[r.axis]*q.alpha].map(v=>v*(problems[index].system.iso?.[0]===r.row&&index===34?2:1))}}const full=m[0].map((v,i)=>v*r.u+m[1][i]*r.v*r.sign),axis=1-r.target;return {axis,line:[full[axis],full[2]]}}
 const lineText=(line,axis)=>C1.plain({[['x','y'][axis]]:line[0]})+' ＝ '+f(line[1]);
 function operation(m,r){if(isSub(r))return '<div class="c2-equations">'+esc(isolateText(m,r))+'<br>'+esc(substitutedText(m,r))+'</div>';return '<div class="operation-preview"><div class="operation-line"><span></span><span>'+esc(eqText(m[0].map(v=>v*r.u)))+'</span><small>'+eqTag(0)+'×'+r.u+'</small></div><div class="operation-line"><span>'+(r.sign===1?'＋':'−')+'</span><span>'+esc(eqText(m[1].map(v=>v*r.v)))+'</span><small>'+eqTag(1)+'×'+r.v+'</small></div></div>'}
 function otherValue(m,axis,value){const other=1-axis,row=m.find(e=>Math.abs(e[other])>1e-9);let pair=[];pair[axis]=value;pair[other]=(row[2]-row[axis]*value)/row[other];return pair}
 const checksFor=(p,s)=>s.check==='both'?[0,1]:s.check==='first'?[0]:s.check==='second'?[1]:[];
 const lefts=(p,pair,ids)=>{p=withVariables(p);return ids.map(i=>originalSides(p,pair)[i][0])};
 function judgement(p,s){p=withVariables(p,s);const ids=checksFor(p,s);if(!ids.length||!Array.isArray(s.observed))return 'more';if(s.observed.some((v,j)=>twoSided(p)?(!Array.isArray(v)||!same(v[0],v[1])):!same(v,p.eq[ids[j]][2])))return 'no';return ids.length===2?'yes':'more'}
 const pairOK=(p,s)=>{p=withVariables(p,s);return !!s.pair&&p.eq.every(e=>same(e[0]*s.pair[0]+e[1]*s.pair[1],e[2]))};
 const domainOK=(p,pair)=>pair.every(v=>Number.isFinite(v)&&v>=0&&(!p.discrete||same(v,Math.round(v))));
 function interpreted(p,s){p=withVariables(p,s);if(!domainOK(p,s.pair))return null;return s.pair.map((v,i)=>v*(p.answerMap?.[i]??1))}
 function interpretationText(p,a){p=withVariables(p);if(!a)return '数量や整数の条件に合わないので、答えとして出せない';return (p.answerNames||p.vars).map((n,i)=>n+' '+f(a[i])+p.unit).join('、')}
 function extraValue(p,s){if(!p.extra)return null;if(p.extra.kind==='third')return p.extra.mult*s.pair[0];if(Math.abs(s.pair[0])<1e-9)return null;return (p.extra.rhs+p.extra.coef*s.pair[1])/s.pair[0]}
 function extraRows(p,s){if(p.extra.kind==='parameter')return p.eq.map((e,i)=>({label:i===0?'①':'解の比',left:e[0]*s.pair[0]+e[1]*s.pair[1],right:e[2]})).concat([{label:'②（aのある式）',left:s.extraValue===null?null:s.extraValue*s.pair[0]-p.extra.coef*s.pair[1],right:p.extra.rhs}]);return [{label:'合計本数',left:s.pair[0]+s.pair[1]+s.extraValue,right:14},{label:'合計得点',left:3*s.pair[0]+2*s.pair[1]+s.extraValue,right:26},{label:'z＝2x',left:s.extraValue,right:2*s.pair[0]}]}
 const extraOK=(p,s)=>s.extraValue!==null&&extraRows(p,s).every(r=>Number.isFinite(r.left)&&same(r.left,r.right));
 function evidence(p,s=state,actual=false){const ids=actual?[0,1]:checksFor(p,s);if(!ids.length)return '<p>まだ元の式と比較していません。</p>';const vals=actual?(twoSided(p)?ids.map(i=>originalSides(p,s.pair)[i]):lefts(p,s.pair,ids)):s.observed;return ids.map((i,j)=>'<div class="c2-check">'+(p.word?'<div class="small">'+esc(rawForms(p)[0].equations[i].map(t=>rawText(t.replace(/[xy]/g,c=>'('+f(s.pair[c==='x'?0:1])+')'))).join('＝'))+'</div>':'')+eqTag(i)+'：左辺 <b>'+f(twoSided(p)?vals?.[j]?.[0]:vals?.[j]??NaN)+'</b> ／ 右辺 <b>'+f(twoSided(p)?vals?.[j]?.[1]:p.eq[i][2])+'</b></div>').join('')}
 function reductionChoices(m,r){const want=reduced(m,r),list=[want.line];
  if(isSub(r)){
   const q=isolation(m,r),other=m[1-r.row],axis=want.axis;
   list.push([other[axis]-other[r.axis]*q.beta,want.line[1]],[want.line[0],other[2]+other[r.axis]*q.alpha],[want.line[0],other[2]]);
  }else{const sign=-r.sign,full=m[0].map((v,i)=>v*r.u+m[1][i]*r.v*sign);list.push([want.line[0],full[2]],[want.line[0],m[0][2]*r.u],[m[0][want.axis]+m[1][want.axis]*r.sign,want.line[1]])}
  list.push([want.line[0],-want.line[1]],[-want.line[0],want.line[1]],[want.line[0],0]);
  return AnswerChoices.unique(list).slice(0,3);
 }
 function otherChoices(m,axis,value){const other=1-axis,row=m.find(e=>Math.abs(e[other])>1e-9),right=row[2],term=row[axis]*value,pair=otherValue(m,axis,value);return AnswerChoices.unique([pair,...[(right+term)/row[other],right/row[other],...AnswerChoices.numbers(pair[other],row[other],right-term)].map(v=>{const a=pair.slice();a[other]=v;return a})]).slice(0,3)}
 function observedChoices(p,s,ids){
  const sides=originalSides(p,s.pair),want=ids.map(i=>twoSided(p)?sides[i].slice():sides[i][0]),candidates=[want];
  for(let j=0;j<ids.length;j++){
   const id=ids[j],row=p.eq[id],x=row[0]*s.pair[0],y=row[1]*s.pair[1],left=sides[id][0];
   if(p.group==='substitution'&&id===p.iso[0]){const axis=p.iso[1],other=1-axis,constant=row[2]/row[axis],term=-row[other]*s.pair[other]/row[axis];for(const value of [constant-term,-constant+term,constant,term]){const observed=JSON.parse(JSON.stringify(want));observed[j][1]=value;candidates.push(observed)}continue;}
   const errors=[left-2*y,left-2*x,left-y,left-x,-left];
   if(p.word){const [l]=rawForms(p)[0].equations[id];const terms=C1.parse(l);for(const [key,n] of Object.entries(terms)){const v=C1.value({[key]:n},{x:s.pair[0],y:s.pair[1]});errors.unshift(left-v,left-2*v)}}
   for(const value of errors){const observed=JSON.parse(JSON.stringify(want));if(twoSided(p))observed[j][0]=value;else observed[j]=value;candidates.push(observed)}
  }
  const unique=AnswerChoices.unique(candidates);if(ids.length===2){const second=JSON.parse(JSON.stringify(want));if(twoSided(p)){const row=p.eq[1],term=row[1]*s.pair[1];second[1][0]=want[1][0]+(Math.abs(term)>1e-9?-2*term:-want[1][0]||-row[2]);}else second[1]=-want[1]||p.eq[1][0]*s.pair[0];if(!equal(second,want))return AnswerChoices.unique([want,unique[1],second]);}return unique.slice(0,3);
 }
 function interpretationChoices(p,s){const a=interpreted(p,s),candidates=[a];if(a){candidates.push(a.slice().reverse());if(p.answerMap)candidates.push(s.pair.slice());candidates.push([a[0]+a[1],a[1]],[a[0],a[0]+a[1]])}else candidates.push(s.pair.slice(),s.pair.map(Math.abs));return AnswerChoices.unique(candidates).slice(0,3)}
 function content(){const p=current();if(state.unfinished)return {review:true};
 if(stage===(p.word?-5:-2))return {q:'この問題で答えることは？',detail:'',opts:shuffle(goalChoices(p).map((label,goal)=>option(label,{goal})))};
 if(p.word&&stage===-4)return {q:'何をx、何をyと置く？',detail:'',opts:shuffle(variableOptions(problems[index].system))};
 if(p.word&&state.variableChoice==='known'){
  if(stage===-3)return {q:'選んだxとyは、問題ですでに分かっている量？',detail:'',opts:shuffle([option('どちらもすでに分かっている量なので、求めたい量をx・yに置き直す',{variableJudge:'redefine'}),option('どちらも求めたい量なので、このまま使う',{variableJudge:'enough'}),option('片方だけが求めたい量なので、もう片方を置き直す',{variableJudge:'ignore'})])};
  return {review:true};
 }

 if(p.word&&stage===-3)return {q:'問題の数字で、一つ目の式を立てよう',detail:'',opts:shuffle(rawRows(p,0).map(rawFirst=>option(rawRowLabel(rawFirst,0),{rawFirst})))};
 if(p.word&&stage===-2)return {q:'問題の数字で、もう一つの式を立てよう',detail:'',opts:shuffle(rawRows(p,1).map((row,id)=>option(rawRowLabel(row,1),{rawForm:{equations:[state.rawFirst,row],second:id}})))};
 if(stage===-1)return {q:p.word?'立てた二つの式を整理すると？':p.extra?.kind==='parameter'?'①とx：y＝3：1から、x・yの式を作ると？':p.extra?'z＝2xを代入して、x・yだけの式にすると？':'式を整理すると、どの連立方程式になる？',detail:'',opts:shuffle(models(p).map(m=>option(eqLabel(m),{model:m})))};
 if(stage===0)return {q:p.group==='substitution'?eqTag(p.iso[0])+'の'+p.raw[p.iso[0]]+'を'+eqTag(1-p.iso[0])+'に代入すると、どの式になる？':'xかyを消すには、どの方法を使う？',detail:'',opts:shuffle(routes(p,state.model).map(r=>option(routeLabel(state.model,r),{route:r})))};
 if(stage===1){const r=reduced(state.model,state.route);return {q:index===34?'代入後の式の両辺を2倍し、括弧を外してまとめると？':'選んだ操作をすると、どの式になる？',detail:'',opts:shuffle(reductionChoices(state.model,state.route).map(line=>option(lineText(line,r.axis),{reduced:{axis:r.axis,line}})))}}
 if(stage===2){const r=state.reduced;if(Math.abs(r.line[0])<1e-9)return {q:'この式から、次にどう判断する？',detail:'<div class="work">'+esc(lineText(r.line,r.axis))+'</div>',opts:shuffle([option(Math.abs(r.line[1])<1e-9?'この式だけでは値が決まらないので、条件や式を見直す':'0と0以外の数が等しい式になったので、立式や計算を見直す',{unfinished:true,finishReason:'review'}),option('残った文字の値を0として進める',{unfinished:true,finishReason:'zero'}),option('右辺の数を、そのまま残った文字の値とする',{unfinished:true,finishReason:'rhs'})])};const n=r.line[1]/r.line[0];return {q:'残った文字の値はどれ？',detail:'',opts:shuffle(AnswerChoices.numbers(n,r.line[0],r.line[1]).map(v=>option(['x','y'][r.axis]+'＝'+f(v),{value:v})))} }
 if(stage===3){const r=state.reduced,pair=otherValue(state.model,r.axis,state.value),other=1-r.axis;return {q:['x','y'][r.axis]+'＝'+f(state.value)+'を'+eqTag(state.model.findIndex(e=>Math.abs(e[other])>1e-9))+'に代入すると、'+['x','y'][other]+'はいくつ？',detail:'',opts:shuffle(otherChoices(state.model,r.axis,state.value).map(a=>option(['x','y'][other]+'＝'+f(a[other]),{pair:a})))}}
 if(stage===4)return {q:p.extra?'ここまでで求めたx・yを確かめよう':'答えが合っているか、確かめよう',detail:'<p>検算のやり方を選んで</p>',opts:shuffle([option(p.word?'問題文から立てた①と②の両方に代入する':(p.extra?.kind==='parameter'?'①と比の式の両方に代入する':(p.group==='substitution'?'問題の①と②の両方に代入する':'元の問題の①と②の両方に代入する')),{check:'both'}),option(p.word?'問題文から立てた①だけに代入する':(p.group==='substitution'?'問題の①だけに代入する':'元の問題の①だけに代入する'),{check:'first'}),option(p.word?'問題文から立てた②だけに代入する':(p.extra?.kind==='parameter'?'比の式だけに代入する':(p.group==='substitution'?'問題の②だけに代入する':'元の問題の②だけに代入する')),{check:'second'})])};
 if(stage===5){const ids=checksFor(p,state),candidates=observedChoices(p,state,ids);return {q:twoSided(p)?'選んだ値を'+ids.map(eqTag).join('・')+'に代入すると、左辺と右辺はいくつ？':'選んだ値を整理した式に代入すると、左辺はいくつ？',detail:'',opts:shuffle(candidates.map(observed=>option(ids.map((id,j)=>eqTag(id)+' 左辺'+f(twoSided(p)?observed[j][0]:observed[j])+(twoSided(p)?'、右辺'+f(observed[j][1]):'')).join(' ／ '),{observed})))}};
 if(stage===6)return {q:'この結果から、解と言える？',detail:'',opts:shuffle([option('二つの式を両方満たしているので、解と言える',{judge:'yes'}),option('一致しない式があるので、この組は解ではない',{judge:'no'}),option('一致した式だけでは足りず、もう一方も確認する',{judge:'more'})])};
 if(stage===7&&p.word){return {q:'問題で聞かれた答えとして、どう表す？',detail:'',opts:shuffle(interpretationChoices(p,state).map(interpret=>option(interpretationText(p,interpret),{interpret})))}}
 if(stage===7&&p.extra){const v=extraValue(p,state),vs=v===null?[null,state.pair[1],p.extra.rhs]:p.extra.kind==='third'?AnswerChoices.unique([v,state.pair[0]/p.extra.mult,state.pair[0],-v]).slice(0,3):AnswerChoices.unique([v,(p.extra.rhs-p.extra.coef*state.pair[1])/state.pair[0],p.extra.rhs/state.pair[0],-v]).slice(0,3);return {q:p.extra.kind==='parameter'?'求めたx・yを使うと、aはいくつ？':'最後に、zはいくつ？',detail:'',opts:shuffle(vs.map(extraValue=>option(extraValue===null?'このxではaの値を決められない':p.extra.name+'＝'+f(extraValue),{extraValue})))}}
 if(stage===8&&p.extra)return {q:'最後の答えも、どう確かめる？',detail:'',opts:shuffle([option('求めた値を、元の条件すべてへ戻して確認する',{extraCheck:'all'}),option('途中で使った二文字の式だけで十分とする',{extraCheck:'two'}),option(p.extra.kind==='third'?'z＝2xの関係だけを確認する':'aを含む②だけに代入して確認する',{extraCheck:'integer'})])};
 if(stage===9&&p.extra)return {q:'最後の条件も含めて、合っている？',detail:'',opts:shuffle([option('元の条件をすべて満たしている',{extraJudge:'yes'}),option('一致しない条件があるので、見直す',{extraJudge:'no'}),option('まだ全条件を確認していない',{extraJudge:'more'})])};
 return {review:true};
 }
 function feedback(){const p=current();return history.map((h,i)=>{const a=history[i+1]?.state||state;let ok=false,title='',reason='';switch(h.stage){
 case -10:title='答えの選択';ok=pairOK(p,a)&&(!p.extra||extraOK(p,a));reason='選んだ答えを、元の条件へ代入して確かめます。';break;
 case -5:title='問題の目標';ok=a.goal===0;reason='求めるのは「'+p.goal+'」です。';break;
 case -4:title='x・yに置く数量';ok=a.variableChoice!=='known';reason=ok?'選んだ定義で二つの未知の数量を区別できます。xとyの順序は逆でも構いません。':p.variableReason;break;
 case -3:if(h.state.variableChoice==='known'){title='文字の置き方の確認';ok=a.variableJudge==='redefine';reason=p.variableReason;}else{title='一つ目の条件を立式';ok=equal(normalize(equationRow(a.rawFirst)),normalize(equationRow(rawForms(p)[0].equations[0])));reason=rawForms(p)[0].reason+' 一つ目の条件：'+rawRowLabel(rawForms(p)[0].equations[0],0);}break;
 case -2:if(p.word){title='もう一つの条件を立式';ok=equal(normalize(equationRow(a.rawForm.equations[1])),normalize(equationRow(rawForms(p)[0].equations[1])));reason=rawForms(p)[0].reason+' もう一つの条件：'+rawRowLabel(rawForms(p)[0].equations[1],1);}else{title='問題の目標';ok=a.goal===0;reason='求めるのは「'+p.goal+'」です。二つの式を両方満たす必要があります。';}break;
 case -1:title=p.word?'立てた式を整理':'式を整理する';ok=equal(a.model,models(p,h.state)[0]);reason=p.word?'選んだ文章式：'+rawLabel(h.state.rawForm)+'。計算と移項を行い、必要なら両辺を同じ数で掛けたり割ったりすると '+eqLabel(models(p,h.state)[0])+' です。':p.modelReason+' 正しい式：'+eqLabel(models(p)[0]);break;
 case 0:title='解法の選択';ok=a.route.type!=='bad';reason=a.route.kind?.startsWith('sub-')?eqTag(a.route.row)+'の '+eqText(h.state.model[a.route.row])+' を見直そう。正しく整理すると '+isolateText(h.state.model,{...a.route,type:'sub',kind:undefined})+(a.route.kind==='sub-coefficient'?'。選んだ式は文字の項の符号が逆になっています。':'。選んだ式は定数項の符号が逆になっています。'):a.route.type==='bad'?'等式を保つには、両辺を同じように扱います。文字だけ消して右辺を変えることはできません。':'加減法も代入法も、等式を保って文字を一つにできれば有効です。';break;
 case 1:{title='一文字の式へ変形';const want=reduced(h.state.model,h.state.route);ok=equal(a.reduced.line,want.line);reason='選んだ操作どおりなら '+lineText(want.line,want.axis)+' です。左辺の係数と右辺を別々に確認します。';break;}
 case 2:{title='残った文字の値';const r=h.state.reduced;if(a.unfinished){ok=a.finishReason==='review';reason='係数が0の式から、文字の値を割り算で決めることはできません。前の式や計算を見直します。';break;}const want=r.line[1]/r.line[0];ok=same(a.value,want);reason=lineText(r.line,r.axis)+' の両辺を '+f(r.line[0])+' で割ると '+['x','y'][r.axis]+'＝'+f(want)+' です。';break;}
 case 3:{title='代入してもう一方を求める';const want=otherValue(h.state.model,h.state.reduced.axis,h.state.value);ok=equal(a.pair,want);reason='直前の値を選んだ元の式へ代入すると '+pairText(want)+' です。前の手順が誤っていても、この代入操作自体は別に確認します。';break;}
 case 4:title='検算の方法';ok=a.check==='both';reason='元の二つの条件に両方代入します。立式を間違えた場合も、選んだ式ではなく元の条件へ戻ると気づけます。';break;
 case 5:{title='検算の計算';const ids=checksFor(p,h.state),want=twoSided(p)?ids.map(id=>originalSides(p,h.state.pair)[id]):lefts(p,h.state.pair,ids);ok=ids.length?Array.isArray(a.observed)&&equal(a.observed,want):a.observed===null;reason=ids.length?ids.map((id,j)=>eqTag(id)+'の左辺は '+f(twoSided(p)?want[j][0]:want[j])+'、右辺は '+f(twoSided(p)?want[j][1]:p.eq[id][2])).join('。'):'代入していないため、数値による検算はまだできていません。';break;}
 case 6:title='検算結果の判断';ok=a.judge===judgement(p,h.state);reason='一つでも不一致なら解ではありません。片方が一致しただけでは、解だとは決められません。二つとも一致して初めて解と言えます。';break;
 case 7:if(p.word){title='問題の答えに戻す';const want=interpreted(p,h.state);ok=want===null?a.interpret===null:Array.isArray(a.interpret)&&equal(a.interpret,want);reason=interpretationText(p,want)+'。'+(p.answerMap?'選んだx・yは昨年の人数なので、増減の割合を掛けて今年の人数へ直します。':'選んだx・yの意味と単位を確認します。');}else{title='残りの未知数';const want=extraValue(p,h.state);ok=want===null?a.extraValue===null:same(a.extraValue,want);reason=p.extra.kind==='third'?'z＝2xに、求めたxを入れます。':'ax−'+f(p.extra.coef)+'y＝'+f(p.extra.rhs)+' より a＝('+f(p.extra.rhs)+'＋'+f(p.extra.coef)+'y)÷x。x・yを代入して計算します。';}break;
 case 8:title='全条件の確認';ok=a.extraCheck==='all';reason='aやzまで求めた後、最初に与えられた条件すべてへ代入します。途中の二文字の式だけでは確認が完了しません。';break;
 case 9:title='最後の判断';ok=a.extraJudge===extraJudgement(p,h.state);reason='元の式、比や本数の条件のどれか一つでも不一致なら見直します。';break;
 }return {i,title,ok,reason,label:h.label}})}
 function correctState(p){p=withVariables(p);const pair=solve(p.eq),s={pair};if(p.extra)s.extraValue=extraValue(p,s);if(p.word)s.interpret=interpreted(p,s);return s}
 function finalText(p,s){if(p.word)return interpretationText(p,s.interpret);if(p.extra?.kind==='third'){const names=p.extra.answerNames||['x','y','z'];return [s.pair[0],s.pair[1],s.extraValue].map((v,i)=>names[i]+' '+f(v)+'本').join('、')}if(p.extra)return p.extra.name+'＝'+f(s.extraValue);return pairText(s.pair)}
 function extraJudgement(p,s){const rows=extraRows(p,s),ids=s.extraCheck==='all'?rows.map((_,i)=>i):s.extraCheck==='integer'?[rows.length-1]:[0,1];if(ids.some(i=>!Number.isFinite(rows[i].left)||!same(rows[i].left,rows[i].right)))return 'no';return ids.length===rows.length?'yes':'more';}
 function extraEvidence(p,s){if(!s.pair)return '<p>答えの候補がまだ決まっていません。条件や式を見直します。</p>';const rows=extraRows(p,s),selected=s.extraCheck==='all'?rows:s.extraCheck==='integer'?[rows.at(-1)]:rows.slice(0,2);return (s.extraCheck==='all'?'':'<p>選んだ条件だけを確認しています。</p>')+selected.map(r=>'<div class="c2-check">'+esc(r.label)+'：'+f(r.left)+' ／ '+f(r.right)+'</div>').join('')}
 function perimeterDiagram(){let diagram='<svg class="c2-diagram" viewBox="0 0 420 185" role="img" aria-label="合同な二等辺三角形4枚ずつ。大きい三角形の周は22cm、平行四辺形の周は20cm。元の等辺はx、底辺はy。"><g fill="#e6f1fa" stroke="#527b9b" stroke-width="2"><path d="M100 16L30 146H170Z"/><path d="M220 146L255 81H395L360 146Z"/></g><g stroke="#98acbd" fill="none"><path d="M65 81H135M65 81L100 146L135 81"/><path d="M255 81L290 146L325 81L360 146"/></g><g font-size="16" font-family="serif" fill="#263747"><text x="33" y="78">2x</text><text x="151" y="78">2x</text><text x="90" y="164">2y</text><text x="225" y="110">x</text><text x="375" y="130">x</text><text x="312" y="71">2y</text><text x="285" y="164">2y</text></g><g font-size="15" fill="#385a73"><text x="62" y="183">周22cm</text><text x="267" y="183">周20cm</text></g></svg>';if(state.variableChoice===undefined||state.variableChoice==='known')diagram=diagram.replace(/<text[^>]*>(?:2?[xy])<\/text>/g,'').replace('元の等辺はx、底辺はy。','');else if(state.variableChoice==='reverse')diagram=diagram.replace(/(<text[^>]*>)(2?)([xy])(<\/text>)/g,(_,a,b,c,d)=>a+b+(c==='x'?'y':'x')+d).replace('元の等辺はx、底辺はy。','元の等辺はy、底辺はx。');return diagram}
 function paper(){const p=current();if(stage===5)return '<p class="small">表示された式に、選んだ値を代入して計算しよう。</p><div class="c2-equations">'+(checksFor(p,state).map(i=>esc(eqTag(i)+' '+(p.word?rawForms(p)[0].equations[i].map(rawText).join('＝'):p.group==='substitution'?p.raw[i]:p.raw&&!p.extra?rawEquations(p)[i].join('＝'):eqText(p.eq[i])))).join('<br>')||'まだ代入する式を選んでいません。')+'</div><div class="c2-work">'+esc(pairText(state.pair))+'</div>';
 if(stage===6)return '<strong>選んだ検算結果を比べる</strong>'+evidence(p);
 if(stage===9&&p.extra)return '<strong>元のすべての条件へ戻す</strong>'+extraEvidence(p,state);
 let out='<p class="problem-text">'+esc(p.question)+'</p>'+(p.visual&&stage<=-1?perimeterDiagram():'');
 if(p.word){if(state.variableChoice!==undefined&&stage>=-4)out+='<div class="c2-definition">'+esc(definition(problems[index].system))+'</div>';if(stage<=-1&&p.table)out+='<table class="c2-table">'+p.table.map(r=>'<tr>'+r.map(c=>'<td>'+esc(c)+'</td>').join('')+'</tr>').join('')+'</table>'}
 else out+='<div class="c2-equations">'+(stage>=0&&stage<=3&&state.model&&p.group!=='substitution'?state.model.map((e,i)=>esc(eqTag(i)+' '+eqText(e))).join('<br>'):p.raw?p.raw.map((r,i)=>esc((i<2||p.extra?.kind==='third'?['①','②','③'][i]+' ':'')+r)).join('<br>'):p.eq.map((e,i)=>esc(eqTag(i)+' '+eqText(e))).join('<br>'))+'</div>';
 if(stage===(p.word?-5:-2)&&pendingChoice)out+='<div class="c2-work">確認する対象：'+esc(goalChoices(p)[state.goal])+'</div>';
 if(p.word&&state.variableChoice==='known')return out;
 if(p.word&&stage===-3&&state.rawFirst)out+='<div class="c2-raw">'+esc(rawRowLabel(state.rawFirst,0))+'</div>';
 if(p.word&&stage===-2&&!state.rawForm)out+='<div class="c2-raw">選んだ一つ目の式<br>'+esc(rawRowLabel(state.rawFirst,0))+'</div>';
 if(p.word&&stage===-2&&state.rawForm)out+=rawHTML(state.rawForm);
 if(p.word&&stage===-1){out='<div class="c2-definition">'+esc(definition(problems[index].system))+'</div><p class="small">自分が立てた式を整理しよう。</p>'+(state.model?processHTML(state.rawForm,state.model):rawHTML(state.rawForm));return out;}
 if(p.word&&stage===0&&!state.route)out+='<div class="c2-equations">'+state.model.map((e,i)=>esc(eqTag(i)+' '+eqText(e))).join('<br>')+'</div>';if(p.word&&stage===0&&state.rawForm)out+='<details class="c2-process-details"><summary>立てた式から整理まで</summary>'+processHTML(state.rawForm,state.model)+'</details>';
 if(stage===-1&&state.model)out+='<div class="c2-equations">選んだ式<br>'+state.model.map((e,i)=>esc(eqTag(i)+' '+eqText(e))).join('<br>')+'</div>';
 if((stage===0||stage===1)&&state.route){out=stage===1?'<p class="small">選んだ方法で一文字の式を作ろう。</p>':out;if(stage===0)out='<div class="c2-context"><div class="c2-equations">'+(p.group==='substitution'?p.raw.map((e,i)=>esc(eqTag(i)+' '+e)).join('<br>'):state.model.map((e,i)=>esc(eqTag(i)+' '+eqText(e))).join('<br>'))+'</div>'+operation(state.model,state.route)+(p.word?'<details class="c2-process-details"><summary>立てた式から整理まで</summary>'+processHTML(state.rawForm,state.model)+'</details>':'')+'</div>';else out+=operation(state.model,state.route)}
 if(stage===1&&state.reduced)out+='<div class="c2-work">'+esc(lineText(state.reduced.line,state.reduced.axis))+'</div>';
 if(stage===2)out='<div class="c2-equations">'+esc(lineText(state.reduced.line,state.reduced.axis))+'</div>'+(state.value!==undefined?'<div class="c2-work">'+esc(['x','y'][state.reduced.axis]+'＝'+f(state.value))+'</div>':'');
 if(stage===3)out='<p class="small">求めた値を、元の式に代入します。</p><div class="c2-equations">'+(p.group==='substitution'?p.raw.map((e,i)=>esc(eqTag(i)+' '+e)).join('<br>'):state.model.map((e,i)=>esc(eqTag(i)+' '+eqText(e))).join('<br>'))+'</div><div class="c2-work">'+esc(['x','y'][state.reduced.axis]+'＝'+f(state.value))+'</div>';
 if(stage>=3&&state.pair)out+='<div class="c2-work">候補：'+esc(pairText(state.pair))+'</div>';
 if(stage===7&&p.extra)out+='<div class="c2-work">'+esc(p.extra.kind==='third'?'z＝2x':'a＝('+f(p.extra.rhs)+'＋'+f(p.extra.coef)+'y)÷x')+'</div>'+(state.extraValue!==undefined?'<p>'+p.extra.name+'＝'+f(state.extraValue)+'</p>':'');
 if(stage===7&&p.word&&state.interpret!==undefined)out+='<div class="c2-work">'+esc(interpretationText(p,state.interpret))+'</div>';
 return out;
 }
 function review(){const p=current(),rows=feedback(),answer=pairOK(p,state)&&(!p.word||(Array.isArray(state.interpret)&&Array.isArray(interpreted(p,state))&&equal(state.interpret,interpreted(p,state))))&&(!p.extra||extraOK(p,state)),all=answer&&rows.every(r=>r.ok),wrong=rows.find(r=>!r.ok),correct=correctState(p);studyMetrics.end(all?'clear':'fail');if(all){complete[index]=true;save()}
 return '<div class="result-heading">答え合わせ</div><div class="verdicts"><span class="verdict '+(answer?'ok':'wrong')+'">'+(answer?'○ 答えは正解':'× 答えを見直そう')+'</span><span class="verdict '+(all?'ok':'wrong')+'">'+(all?(studyMode==='direct'?'○ 答え・検算も正解':'○ 解き方と検算も正解'):'道筋・検算を見直そう')+'</span></div>'+(wrong?'<div class="feedback-focus"><strong>最初に見直すところ：手順'+(wrong.i+1)+'「'+wrong.title+'」</strong><p>'+esc(wrong.reason)+'</p><button class="primary" data-rewind="'+wrong.i+'">ここから選び直す</button></div>':(studyMode==='direct'?'<p class="note">選んだ答えと検算が合っています。</p>':'<p class="note">式の整理・計算・検算が合っています。</p>'))+'<div class="check"><strong>正しい答え：'+esc(finalText(p,correct))+'</strong><p>'+esc(pairText(correct.pair))+'</p>'+(p.word?'<p class="small">'+esc(definition(problems[index].system,{variableChoice:state.variableChoice==='known'?'forward':state.variableChoice}))+'</p>':'')+'</div><h3>ここを見れば確かめられます</h3>'+(state.pair?evidence(p,state,true):'<p>'+esc(p.variableReason||'文字に置く数量を確認します。')+'</p>')+(p.extra?extraEvidence(p,{...state,extraCheck:'all'}):'')+'<p class="small">'+esc(p.modelReason)+'</p><details class="route-details"><summary>各手順の○×と理由を見る</summary>'+rows.map(r=>'<div class="log"><strong>'+(r.ok?'○':'×')+' 手順'+(r.i+1)+' '+r.title+'</strong><div>'+esc(r.label)+'</div><p>'+esc(r.reason)+'</p><button data-rewind="'+r.i+'">ここから選び直す</button></div>').join('')+'</details><div class="row"><button id="retry">最初から試す</button><button class="primary" id="next">'+(nextIndex(index)!==null?'次の問題へ':'問題一覧へ')+'</button></div>';
 }
 return {twoSided,interpretationText,current,subRoute,addRoute,interpretationChoices,observedChoices,otherChoices,reductionChoices,extraRows,domainOK,finalText,definition,routeLabel,operation,isolateText,rawRows,rawForms,formRows,originalSides,processHTML,withVariables,variableOptions,f,normalize,models,routes,reduced,otherValue,checksFor,lefts,judgement,pairOK,interpreted,extraValue,extraOK,correctState,content,paper,review,feedback,equal};
})();

