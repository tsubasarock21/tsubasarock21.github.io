// Chapter 1: small symbolic polynomial engine. No eval and no learner text input.
const C1=(()=>{
 const clean=p=>Object.fromEntries(Object.entries(p).filter(([,v])=>Math.abs(v)>1e-9));
 const add=(a,b,s=1)=>{const o={...a};for(const [k,v]of Object.entries(b))o[k]=(o[k]||0)+s*v;return clean(o)};
 const mul=(a,b)=>{let o={};for(const [k,v]of Object.entries(a))for(const [l,w]of Object.entries(b)){const key=(k+l).split('').sort().join('');o[key]=(o[key]||0)+v*w}return clean(o)};
 const divide=(a,b)=>{const entries=Object.entries(b);if(entries.length!==1)throw Error('単項式による除法だけに対応');const [k,v]=entries[0];if(!v)throw Error('zero');let o={};for(const [l,w]of Object.entries(a)){let rest=l;for(const c of k){const at=rest.indexOf(c);if(at<0)throw Error('文字が約分できません');rest=rest.slice(0,at)+rest.slice(at+1)}o[rest]=(o[rest]||0)+w/v}return clean(o)};
 function parse(s){const ts=s.match(/\d+(?:\.\d+)?|[a-z]|[+\-*/^()]/g)||[];if(ts.join('')!==s.replace(/\s/g,''))throw Error('式の文字');let i=0;
 function atom(){const t=ts[i++];let a;if(t==='-')return mul({'':-1},atom());if(t==='+')return atom();if(t==='('){a=sum();if(ts[i++]!==')')throw Error('括弧')}else if(/^[a-z]$/.test(t||''))a={[t]:1};else if(/^\d/.test(t||''))a=clean({'':Number(t)});else throw Error('項');if(ts[i]==='^'){i++;let n=Number(ts[i++]);if(!Number.isInteger(n)||n<0||n>4)throw Error('指数');let p={'':1};while(n--)p=mul(p,a);a=p}return a}
 function product(){let a=atom();while(ts[i]==='*'||ts[i]==='/'){const op=ts[i++],b=atom();a=op==='*'?mul(a,b):divide(a,b)}return a}
 function sum(){let a=product();while(ts[i]==='+'||ts[i]==='-'){const op=ts[i++];a=add(a,product(),op==='+'?1:-1)}return a}
 const p=sum();if(i!==ts.length)throw Error('末尾');return p}
 const equal=(a,b)=>Object.keys(add(a,b,-1)).length===0;
 const entries=p=>Object.entries(p).sort((a,b)=>b[0].length-a[0].length||a[0].localeCompare(b[0]));
 function fraction(v){for(let d=1;d<=120;d++){const n=Math.round(v*d);if(Math.abs(n/d-v)<1e-8)return [n,d]}return [Math.round(v*1e6)/1e6,1]}
 function serial(p){return entries(p).map(([k,v])=>{const [n,d]=fraction(v);const vars=k.split('').join('*');return k&&n===d?vars:k&&n===-d?'-'+vars:(d===1?String(n):'('+n+'/'+d+')')+(k?'*'+vars:'')}).join('+')||'0'}
 function fmt(p){return entries(p).map(([k,v],i)=>{const [n,d]=fraction(Math.abs(v)),vars=[...new Set(k)].map(c=>c+(k.split(c).length>2?'<sup>'+(k.split(c).length-1)+'</sup>':'')).join('');return(v<0?'−':i?'＋':'')+(Math.abs(v)===1&&k?'':d===1?n:'<span class="c1-fraction"><span>'+n+'</span><span>'+d+'</span></span>')+vars}).join(' ')||'0'}
 const degree=p=>Math.max(0,...Object.keys(p).map(k=>k.length));
 const value=(p,env)=>Object.entries(p).reduce((s,[k,v])=>s+v*[...k].reduce((a,c)=>a*env[c],1),0);
 const sample=[{a:2,b:4,x:3,y:2,n:5,h:6,m:4,c:8,z:6},{a:3,b:5,x:2,y:4,n:2,h:4,m:3,c:6,z:3}];
 const final=(p,work,route)=>{let ans=parse(p.routes[route].template.replace('$','('+serial(work)+')'));return p.values?{'':value(ans,p.values)}:ans};
 const work=p=>parse(p.routes[state.route??0].work);
 const expected=p=>p.values?{'':value(parse(p.original),p.values)}:p.kind==='terms'?{'':degree(parse(p.original))}:parse(p.original);
 function variants(v,source=''){return AnswerChoices.polynomials(v,source)}
 function calculationVariants(p,v,phase){
  const candidates=[v],push=q=>{if(!candidates.some(a=>equal(a,q)))candidates.push(q)};
  if(phase==='work')for(const t of p.calculationChoices?.work?.[state.route??0]||[])push(parse(t));
  else if((state.route??0)===0&&equal(state.work,parse(p.routes[0].work)))for(const t of p.calculationChoices?.answer||[])push(parse(t));
  if(p.kind==='terms'&&phase==='answer'){
   const poly=state.work||parse(p.original),degrees=Object.keys(poly).map(k=>k.length);
   for(const n of [Math.max(0,...Object.keys(poly).flatMap(k=>[...new Set(k)].map(c=>k.split(c).length-1))),Object.keys(poly).length,degrees.reduce((a,b)=>a+b,0),0])push({'':n});
  }
  for(const q of variants(v,phase==='work'?p.routes[state.route??0].work:serial(state.work||v)))push(q);
  if(candidates.length<3)throw Error('Not enough distinct calculation choices');
  return candidates.slice(0,3);
 }
 const option=(label,patch)=>({label,patch});
 function verdict(p,s=state){if(p.kind==='terms')return equal(s.work||{},parse(p.original))&&equal(s.answer||{},expected(p));return equal(s.answer||{},expected(p))}
 function content(){const p=problems[index].expr,detail='';
 if(stage===-2)return {q:'この問題で答えることは？',detail,opts:shuffle(p.goals.map((label,i)=>option(label,{goal:i})))};
 if(stage===-1)return {q:'そのために、まず何をする？',detail,opts:shuffle(p.routes.map((r,i)=>option(r.label,{route:i})))};
 if(stage===0){const w=p.kind==='terms'?parse(p.original):work(p);return {q:(state.route??0)===0||p.kind==='terms'?(p.workQuestion||'表示された部分を計算すると？'):'選んだ方針で、表示された部分を計算すると？',detail:'',opts:shuffle(calculationVariants(p,w,'work').map(v=>option(p.kind==='terms'?'項：'+plainTerms(v):plain(v),{work:v})))}}
 if(stage===1){const v=p.kind==='terms'?{'':degree(state.work)}:final(p,state.work,state.route??0);return {q:p.kind==='terms'?'この式は何次式？':p.values?'指定された値を入れると、式の値はいくつ？':'続けて整理すると、答えはどれ？',detail:'',opts:shuffle(calculationVariants(p,v,'answer').map(x=>option(p.kind==='terms'?plain(x)+'次式':(p.equation?p.equation.target+'＝':'')+answerText(p,x),{answer:x})))}}
 if(p.conclusion&&stage===2&&!verdict(p))return {q:'選んだ式で、問題の結論まで説明できる？',detail:'<p>選んだ式：'+esc(plain(state.answer))+'</p>',opts:shuffle([option('式の立て方や計算を見直してから、理由を説明する',{proof:'reconsider'}),option('文字に数を一つ入れて成り立てば、説明は完成する',{proof:'example'}),option('問題の条件と照合せず、この式のまま結論を述べる',{proof:'none'})])};
 if(p.conclusion&&stage===2)return {q:p.conclusionQuestion||'求めた式から、どのように説明できる？',detail:'<p>文字が表す範囲や、図形の条件も使って判断します。</p>',opts:shuffle([option(p.conclusionChoices?.[0]||p.conclusion,{proof:'reason'}),option(p.conclusionChoices?.[1]||'係数が倍数になっていれば、定数項にかかわらず結論が成り立つ',{proof:'example'}),option(p.conclusionChoices?.[2]||'定数項だけが倍数になっていれば、文字の項にかかわらず結論が成り立つ',{proof:'none'})])};
 if(stage===2&&p.kind==='terms'){
 const terms=parse(p.original),degreeAnswer=expected(p),wrongDegree=calculationVariants(p,degreeAnswer,'answer').find(v=>!equal(v,degreeAnswer));
 const candidates=[{terms,degree:degreeAnswer},...p.routes.slice(1).map(r=>({terms:parse(r.work),degree:degreeAnswer})),{terms,degree:wrongDegree}];
 return {q:'元の式から項と次数を確かめ直すと、どの組になる？',detail:'<p>各項の符号・文字・定数項と、最大の次数を両方確認します。</p>',opts:shuffle(candidates.map(v=>option('項：'+plainTerms(v.terms)+' ／ '+plain(v.degree)+'次式',{check:'rules',verifyTerms:v.terms,verifyResult:v.degree})))};
 }
 if(stage===2+Number(!!p.conclusion)&&!p.equation&&p.visual!=='trapezoid'){
 const want=expected(p),candidates=p.kind==='terms'?calculationVariants(p,want,'answer'):variants(want,p.original);return {q:p.kind==='terms'?'元の式の各項を見直すと、最大の次数はいくつ？':p.values?'指定値を元の式に直接代入して計算すると？':'元の式を、最初から計算し直すと？',detail:'<p>選んだ答えとは別に、元の問題から確かめます。</p>',opts:shuffle(candidates.map(v=>option((p.kind==='terms'?plain(v):answerText(p,v))+(p.kind==='terms'?'次式':''),{check:'rules',verifyResult:v})))};
 }
 if(stage===2+Number(!!p.conclusion))return {q:'答えが合っているか、確かめよう',detail:'<p>検算のやり方を選んで</p>',opts:shuffle(verificationLabels(p).map((label,i)=>option(label,{check:['rules','looks','one'][i]})))};
 if(stage===3+Number(!!p.conclusion))return {q:'確かめた結果から、どう判断する？',detail:'',opts:shuffle([option('式や計算結果が一致しているので、答えは合っている',{judge:'yes'}),option('一致しないところがあり、答えを見直す必要がある',{judge:'no'}),option('まだ確認していない部分があり、答え全体は判断できない',{judge:'more'})])};
 return {review:true};
 }
 function plain(p){return fmt(p).replace(/<span class="c1-fraction"><span>(.*?)<\/span><span>(.*?)<\/span><\/span>/g,'($1/$2)').replace(/<sup>(.*?)<\/sup>/g,(_,n)=>({'2':'²','3':'³','4':'⁴'}[n]||'^'+n))}
 function answerSource(p,v){
 const gcd=(a,b)=>b?gcd(b,a%b):a,den=Object.values(v).map(n=>fraction(n)[1]).reduce((a,b)=>a*b/gcd(a,b),1);
 if(p.visual==='trapezoid'&&Object.keys(v).length&&Object.keys(v).every(k=>k.includes('h'))){const base={};for(const [k,n]of Object.entries(v))base[k.replace('h','')]=den*n;return '('+serial(base)+')*h'+(den===1?'':'/'+den);}
 if(p.displayDenominator&&den>1)return '('+serial(mul(v,{'':den}))+')/'+den;
 return null;
 }
 function answerText(p,v){const source=answerSource(p,v);return source?source.replace(/\+\-/g,'-').replace(/\*/g,'').replace(/-/g,'−').replace(/\+/g,'＋'):plain(v);}
 function answerHTML(p,v){const source=answerSource(p,v);return source?math(source):fmt(v);}
 function plainTerms(p){return entries(p).map(([k,v])=>plain({[k]:v})).join('、')||'0'}
 function math(s){return renderPrintedMath(s)}
 function verificationLabels(p){return p.verificationChoices||[p.verify,'最初の項の係数だけを、元の式と比べる','最後の項の係数だけを、元の式と比べる']}
 function equationResidual(p,s=state){const r=p.equation;function sub(text){return text.replace(new RegExp(r.target,'g'),'('+serial(s.answer)+')')}return add(parse(sub(r.lhs)),parse(sub(r.rhs)),-1)}
 function verificationJudgement(p,s=state){if(s.verifyResult)return equal(s.verifyResult,s.answer)&&(p.kind!=='terms'||!!s.verifyTerms&&equal(s.verifyTerms,s.work||{}))?'yes':'no';if(p.visual==='trapezoid')return s.check==='rules'?(equal(mul(s.answer,{'':2}),parse('(a+b)*h'))?'yes':'no'):'more';if(p.equation){const residual=equationResidual(p,s);if(s.check==='rules')return equal(residual,{})?'yes':'no';const key=s.check==='looks'?'x':'';return same(residual[key]||0,0)?'more':'no';}if(s.check==='rules')return verdict(p,s)?'yes':'no';if(p.values)return 'more';if(p.kind==='terms'){if(s.check==='looks')return s.work&&entries(parse(p.original)).length!==entries(s.work).length?'no':'more';return equal(s.answer,expected(p))?'more':'no'}const part=s.check==='looks'?0:1,want=parse(p.original),key=p.verificationParts?.[part]??Object.keys(want)[part?Object.keys(want).length-1:0],chosen=s.answer;if(key==='degree')return Object.keys(want).sort().join()===Object.keys(chosen).sort().join()?'more':'no';if(key==='coefficient')return entries(want).map(([,v])=>v).join()===entries(chosen).map(([,v])=>v).join()?'more':'no';return same(want[key]||0,chosen[key]||0)?'more':'no'}
 function partialEvidence(p){
 const part=state.check==='looks'?0:1,label=verificationLabels(p)[part+1];let observed='';if(p.equation){const residual=equationResidual(p),key=part===0?'x':'';return '<div class="check">求めたyの式を5x−2y＋6へ代入して整理：'+fmt(residual)+'<br>'+esc(key?'xの項の係数':'定数項')+'は '+num(residual[key]||0)+'（0になるか確認）</div><p>ほかの項も0になるか確認してから、等式全体を判断します。</p>';}
 if(p.kind==='terms')observed=part===0?'元の式の項の個数：'+entries(parse(p.original)).length+' ／ 選んだ項の個数：'+(state.work?entries(state.work).length:'未選択'):'元の式の次数：'+degree(parse(p.original))+' ／ 選んだ次数：'+plain(state.answer);
 else if(p.values){const variable=Object.keys(p.values)[part],substituted=p.original.replace(new RegExp(variable,'g'),'('+p.values[variable]+')');observed='<div class="c1-math">'+math(substituted)+'</div>';}
 else {const key=p.verificationParts?.[part]??(p.original.includes('a')?['a','b']:['x','y'])[part],want=parse(p.original),chosen=state.answer;
  if(key==='coefficient')observed='係数：元の式 '+entries(want).map(([,n])=>fForCheck(n)).join('、')+' ／ 答え '+entries(chosen).map(([,n])=>fForCheck(n)).join('、');
  else if(key==='degree')observed='文字の部分（指数を比べる）：元の式 '+entries(want).map(([k])=>k?plain({[k]:1}):'定数').join('、')+' ／ 答え '+entries(chosen).map(([k])=>k?plain({[k]:1}):'定数').join('、');
  else observed=(key?plain({[key]:1})+'の係数':'定数項')+'：元の式 '+fForCheck(want[key]||0)+' ／ 答え '+fForCheck(chosen[key]||0);
 }
 return '<div class="check"><strong>'+esc(label)+'</strong><div>'+observed+'</div></div><p class="small">'+(verificationJudgement(p)==='no'?'確認した部分に不一致があるので、答えを見直す必要があります。':'ここでは一部分だけを確認しています。ほかの項や条件も確かめてから、答え全体を判断します。')+'</p>';
 }
 const fForCheck=n=>plain({'':n});
 function evidence(p,compact=false){if(!state.answer)return '';if(state.verifyTerms)return '<div class="check">元の式から確かめ直した項（選択）：'+esc(plainTerms(state.verifyTerms))+'<br>先に選んだ項：'+esc(plainTerms(state.work||{}))+'<br>確かめ直した次数：'+plain(state.verifyResult)+'次式 ／ 先に選んだ次数：'+plain(state.answer)+'次式<br>項と次数が両方一致するか比べます。</div>';if(state.verifyResult)return '<div class="check">元の問題から計算し直した結果（選択）：'+answerHTML(p,state.verifyResult)+(p.kind==='terms'?'次式':'')+'<br>先に選んだ答え：'+answerHTML(p,state.answer)+(p.kind==='terms'?'次式':'')+'<br>二つが一致するか比べます。</div>';let out='';if(p.visual==='trapezoid'&&state.check!=='rules')return '<div class="check">図で'+(state.check==='looks'?'高さh':'上底a')+'だけを確認しました。底辺全体・高さ・何枚分の面積かも確認する必要があります。</div>';if(p.visual==='trapezoid')return '<div class="check">同じ台形2枚で、底辺a＋b、高さhの平行四辺形になる。<br>2枚分の面積：(a＋b)h<br>選んだ1枚分を2倍：'+fmt(mul(state.answer,{'':2}))+'<br>この式が(a＋b)hになるか、底辺と高さの関係で確かめます。</div>';if(state.check!=='rules')return partialEvidence(p);if(p.equation)return '<div class="check">5x−2y＋6に、y＝'+fmt(state.answer)+'を代入して整理：'+fmt(equationResidual(p))+'<br>すべての項が消えて0になるか確かめます。</div>';if(p.verificationScale&&state.check==='rules'){const scale=p.verificationScale;return '<div class="check">元の式を'+scale+'倍：'+fmt(mul(parse(p.original),{'':scale}))+'<br>答えを'+scale+'倍：'+fmt(mul(state.answer,{'':scale}))+'<br>それぞれの文字の係数を比べます。</div>';}

 if(p.kind==='terms')return '<div class="check">元の式の項：'+esc(plainTerms(parse(p.original)))+'<br>選んだ項：'+(state.work?esc(plainTerms(state.work)):'途中の項分けは省略')+'<br>最大の次数：'+degree(parse(p.original))+' ／ 選んだ次数：'+plain(state.answer)+'</div>';
 if(p.values)return '<div class="check">指定の値を元の式へ代入：'+num(value(parse(p.original),p.values))+'<br>選んだ答え：'+plain(state.answer)+'</div>';
 out='<div class="check">元の式を計算し直した結果：'+fmt(parse(p.original))+'<br>選んだ答え：'+fmt(state.answer)+'<br>同じ文字・指数の項の係数を照合します。</div>';
 if(p.equation)out+=sample.map(base=>{const env={...base},r=p.equation;env[r.target]=value(state.answer,base);return '<div class="check">元の等式に '+esc(r.target)+'＝'+num(env[r.target])+' を代入：<br>左辺 '+num(value(parse(r.lhs),env))+' ／ 右辺 '+num(value(parse(r.rhs),env))+'</div>'}).join('');
 out+=(compact?sample.slice(0,1):sample).map(env=>{const variables=[...new Set(Object.keys(parse(p.original)).join('')+Object.keys(state.answer).join(''))];return '<div class="small">'+esc(variables.map(c=>c+'＝'+env[c]).join('、'))+'：元の式 '+num(value(parse(p.original),env))+' ／ 答え '+num(value(state.answer,env))+'</div>'}).join('');
 if(p.conclusion&&!compact)out+='<p class="small">'+esc(p.conclusion)+'</p>';
 return out+(compact?'':'<p class="small">数値の一致だけで証明せず、式の変形と係数も確認します。</p>');
 }
 function feedback(){const p=problems[index].expr;return history.map((h,i)=>{const after=history[i+1]?.state||state;let ok=false,reason='',title='';switch(h.stage){
 case -10:title='答えの選択';ok=verdict(p,after);reason='元の式・条件と一致するか、下の検算で確かめます。';break;
 case -2:title='問題の目標';ok=after.goal===0;reason=p.goalReason;break;
 case -1:title='最初の方針';ok=after.route===0;reason=p.routeReason+' 正しい操作：'+p.routes[0].label;break;
 case 0:title=p.kind==='terms'?'項の分け方':'途中の計算';{const want=parse(p.kind==='terms'?p.original:p.routes[h.state.route??0].work);ok=equal(after.work,want);reason='選んだ操作では '+plain(want)+' になります。選んだ内容は '+plain(after.work)+'。'+p.workReason;}break;
 case 1:title=p.kind==='terms'?'次数':'答えまでの操作';{const want=p.kind==='terms'?{'':degree(h.state.work)}:final(p,h.state.work,h.state.route??0);ok=equal(after.answer,want);reason='直前の内容から続けると '+plain(want)+(p.kind==='terms'?'次式':'')+' です。元の問題への正しさは検算で別に確かめます。';}break;
 case 2:if(p.conclusion){title='結論の説明';ok=after.proof===(verdict(p,h.state)?'reason':'reconsider');reason=verdict(p,h.state)?p.conclusion:'選んだ式は元の条件から求めた式と一致しません。前の立式や計算を見直してから理由を説明します。';break;}
 case 3:if(h.stage===3&&!p.conclusion){title='検算結果の判断';ok=after.judge===verificationJudgement(p,h.state);reason=h.state.verifyResult?(verificationJudgement(p,h.state)==='yes'?'確かめ直した結果と先の答えが一致しています。':'確かめ直した結果と先の答えに不一致があります。項と次数など、確認した内容を比べます。'):h.state.check!=='rules'?(verificationJudgement(p,h.state)==='no'?'確認した部分に不一致があるので、この答えは正しくないと判断できます。':p.verificationChoices?'選んだ方法では一部分だけを確認しています。未確認の部分も確認してから、答え全体を判断します。':'見た目や一例だけでは判断できません。検算方法を選び直します。'):verdict(p,h.state)?'元の条件と答えが一致しています。':'元の条件と答えが一致しません。下の比較を見てください。';break;}title=after.verifyResult?'検算の計算':'検算の方法';ok=after.verifyResult?equal(after.verifyResult,expected(p))&&(p.kind!=='terms'||!!after.verifyTerms&&equal(after.verifyTerms,parse(p.original))):after.check==='rules';reason=after.verifyTerms?'元の式の項は '+plainTerms(parse(p.original))+'、次数は '+plain(expected(p))+'次式です。符号・定数項・次数を両方確認します。':after.verifyResult?'元の問題から計算し直すと '+plain(expected(p))+(p.kind==='terms'?'次式':'')+' になります。選んだ検算結果と比べます。':p.verificationChoices?p.verificationChoices[0]+'。一部分だけの確認では、答え全体の確認は終わりません。':p.verify+'。見た目や一例の一致だけでは不十分です。';break;
 case 4:title='検算結果の判断';ok=after.judge===verificationJudgement(p,h.state);reason=h.state.verifyResult?(verificationJudgement(p,h.state)==='yes'?'確かめ直した結果と先の答えが一致しています。':'確かめ直した結果と先の答えに不一致があります。項と次数など、確認した内容を比べます。'):h.state.check!=='rules'?(verificationJudgement(p,h.state)==='no'?'確認した部分に不一致があります。答えを見直す判断ができます。':'選んだ検算では一部分の一致までです。ほかの部分も確認します。'):verdict(p,h.state)?'元の条件と答えが一致しています。':'元の条件と答えに不一致があります。下の比較で係数や値の違いを確認します。';break;
 }return {i,title,ok,reason,label:h.label};})}
 function review(){const p=problems[index].expr,items=feedback(),answerOK=verdict(p),all=answerOK&&items.every(x=>x.ok),first=items.find(x=>!x.ok);studyMetrics.end(all?'clear':'fail');if(all){complete[index]=true;save()}
 const actual=expected(p);return '<div class="result-heading">答え合わせ</div><div class="verdicts"><span class="verdict '+(answerOK?'ok':'wrong')+'">'+(answerOK?'○ 答えは正解':'× 答えを見直そう')+'</span><span class="verdict '+(all?'ok':'wrong')+'">'+(all?(studyMode==='direct'?'○ 答えと検算も正解':'○ 道筋と確認も正解'):'道筋・確認を見直そう')+'</span></div>'+(first?'<div class="feedback-focus"><strong>最初に見直すところ：手順'+(first.i+1)+'「'+first.title+'」</strong><p>'+esc(first.reason)+'</p><button class="primary" data-rewind="'+first.i+'">ここから選び直す</button></div>':(studyMode==='direct'?'<p class="note">答えと検算が合っています。</p>':'<p class="note">目標・操作・答え・確認までつながっています。</p>'))+'<div class="check"><strong>正しい答え</strong><div class="c1-math">'+(p.kind==='terms'?'項：'+esc(plainTerms(parse(p.original)))+'<br>'+degree(parse(p.original))+'次式':(p.equation?p.equation.target+'＝':'')+answerHTML(p,actual))+'</div>'+(p.conclusion?'<p>'+esc(p.conclusion)+'</p>':'')+'</div><h3>ここを見れば確かめられます</h3>'+(()=>{const held=state;try{state={...state,check:'rules'};return evidence(p)}finally{state=held}})()+'<details class="route-details"><summary>各手順の○×と理由を見る</summary>'+items.map(x=>'<div class="log"><strong>'+(x.ok?'○':'×')+' 手順'+(x.i+1)+' '+x.title+'</strong><div>'+esc(x.label)+'</div><p>'+esc(x.reason)+'</p><button data-rewind="'+x.i+'">ここから選び直す</button></div>').join('')+'</details><div class="row"><button id="retry">最初から試す</button><button class="primary" id="next">'+(nextIndex(index)!==null?'次の問題へ':'問題一覧へ')+'</button></div>';
 }
 function diagram(p){if(p.visual!=='trapezoid')return '';const doubled=state.route===0;return '<svg class="c1-diagram" viewBox="0 0 360 155" aria-label="上底a、下底b、高さhの台形'+(doubled?'と、合同な台形を合わせた平行四辺形':'')+'"><polygon points="25,125 75,30 155,30 195,125" fill="#e6f1fa" stroke="#527b9b" stroke-width="2"/>'+(doubled?'<polygon points="155,30 325,30 275,125 195,125" fill="#f0f6ee" stroke="#7e9a83" stroke-width="2"/><path d="M155 30L195 125" stroke="#527b9b" stroke-dasharray="5 4"/>':'')+'<path d="M75 30V125" stroke="#849bb0" stroke-dasharray="4 4"/><path d="M75 116h9v9" fill="none" stroke="#849bb0"/><text x="110" y="21">a</text><text x="106" y="147">b</text><text x="56" y="83">h</text></svg>'}
 function paper(){const p=problems[index].expr;if(stage===3+Number(!!p.conclusion))return '<div class="c1-evidence"><strong>元の式と選んだ答えを比べる</strong>'+evidence(p,true)+'</div>';const question='<p class="problem-text">'+esc(p.question)+'</p>';let out=p.visual?'<div class="c1-problem-figure">'+question+diagram(p)+'</div>':question;if(p.display)out+='<div class="c1-math">'+math(p.display)+'</div>';
 if(stage===-2&&pendingChoice)out+='<div class="preview-note">確認する対象：'+esc(p.goals[state.goal])+'</div>';
 if(stage===-1&&state.route!==undefined){const r=p.routes[state.route];out+='<div class="c1-work">試している式：'+math(r.template.replace('$','('+r.work+')'))+'</div>'}
 if(stage===0&&!state.work&&state.route!==undefined)out+='<div class="c1-work">計算する部分：'+(p.workDisplay&&(state.route??0)===0?esc(p.workDisplay):math(p.routes[state.route].work))+'</div>';if(stage===0&&state.work)out+='<div class="c1-work">途中の内容：'+fmt(state.work)+'</div>';
 if(stage>=1&&state.answer)out+='<div class="c1-work">答えの候補：'+(p.equation?p.equation.target+'＝':'')+answerHTML(p,state.answer)+(p.kind==='terms'?'次式':'')+'</div>';
 else if(stage===1&&state.work)out+='<div class="c1-work">続きの式：'+(p.kind==='terms'?fmt(state.work):math(p.routes[state.route??0].template.replace('$','('+serial(state.work)+')')))+'</div>';
 return out}

 return {answerText,answerHTML,verificationJudgement,parse,add,mul,equal,fmt,plain,degree,serial,value,sample,final,expected,variants,content,review,paper,feedback,verdict};
})();
