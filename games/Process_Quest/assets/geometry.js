// 独自に作成した図形教材。選択結果は最後にまとめて評価する。
let unit='geometry';
const G=(q,options,reason)=>({q,options,reason});
const O=(label,id,correct=false,aux=null)=>({label,id,correct,aux});

// Build follow-up questions from the learner's selected answer and diagram.
function geometryStep(p,n,s=state){
 const step=JSON.parse(JSON.stringify(p.steps[n]));
 if(studyMode==='guided'&&n===1&&((p.geo==='proof'&&s.aux!=='AP')||(p.geo==='area'&&s.aux!=='EH'))){
 step.q=p.geo==='proof'?'選んだ補助線で、△ABPと△ACPの共通辺を描けた？':'選んだ補助線は、底辺BCに垂直な高さを表している？';
 step.options=[{id:'rebuild',label:p.geo==='proof'?'共通辺APを補うため、補助線を選び直す':'底辺に垂直な高さを描くため、補助線を選び直す',correct:true},{id:'enough',label:'今の線だけで必要な条件がそろったとして進む',correct:false},{id:'looks',label:'長さを図から測って結論を出す',correct:false}];step.reason='選んだ線の役割を確かめ、必要な線を描いてから次の根拠を考えます。';
 }

 if(studyMode==='guided'&&n===2&&(p.geo==='iso'||p.geo==='para')){
 const selected=p.steps[1].options.find(o=>o.id===s.g1);const v=p.geo==='iso'?({half:68,rest:136,apexhalf:22}[s.g1]):({same:6,double:12,half:3}[s.g1]);
 step.q='選んだ「'+selected.label+'」から計算すると？';step.options=step.options.map(o=>({...o,correct:parseFloat(o.label)===v}));step.reason='選んだ関係から計算すると '+v+(p.geo==='iso'?'°':'cm')+' です。この関係を使えるかは、前の手順と元の条件で別に確かめます。';
 }
 if(studyMode==='guided'&&n===3&&((p.geo==='proof'&&(s.aux!=='AP'||s.g1!=='sas'||s.g2!=='sas'))||(p.geo==='counter'&&s.aux!=='different'))){
 step.q=p.geo==='proof'?(s.g1==='circular'?'PB＝PCは今から示す結論。これを根拠にして証明を進めてよい？':'使える根拠と合同条件を確認できないまま、PB＝PCを結論できる？'):'選んだ例は反例にならなかった。次に何をする？';
 step.options=[{id:'revisit',label:p.geo==='proof'?'根拠を選び直して、合同条件を確かめる':'角が等しく大きさの違う例を探し直す',correct:true},{id:'finish',label:'このまま結論が示せたとして終える',correct:false},{id:'measure',label:'図の見た目だけで結論を決める',correct:false}];step.reason='必要な根拠や反例を確保してから結論へ進みます。';
 }

 if(n===3&&(p.geo==='iso'||p.geo==='para')){
  const answerId=studyMode==='direct'?s.directGeo:s.g2,answer=p.steps[2].options.find(o=>o.id===answerId),value=answer?parseFloat(answer.label):null;
  if(value!==null){
   if(p.geo==='iso'){
    const sum=44+2*value,rest=2*value,ok=same(sum,180);step.q='選んだ∠ABC＝'+num(value)+'°を、どの方法で確かめる？';
    step.options[0].label='底角が等しいことを使うと44°＋'+num(value)+'°＋'+num(value)+'°＝'+num(sum)+'°。'+(ok?'180°と一致する':'180°と一致しないので、答えを見直す');
    step.options[1].label='底角二つの合計は'+num(rest)+'°。180°−44°＝136°と'+(ok?'一致する':'一致しないので、答えを見直す');
    step.options[2].label='選んだ底角を2倍して、頂角44°と比べる';
   }else{
    const sum=6+value,ok=same(value,6);step.q='選んだOC＝'+num(value)+'cmを、どの方法で確かめる？';
    step.options[0].label='OがACの中点なので、AO＝6cmとOC＝'+num(value)+'cmが'+(ok?'等しいことを確かめる':'等しくないため、答えを見直す');
    step.options[1].label='AO＋OC＝'+num(sum)+'cmを、AOの2倍の12cmと比べる';
   }
   step.reason=step.options[0].label+'。';
  }
 }
 if(p.geo==='proof'&&n===2){
  const selected=s.g1,expected=selected==='circular'?'sss':selected==='one'?'insufficient':'sas';
  step.q='選んだ三組だけを見ると、どの合同条件に当てはまる？';
  step.options=[{id:'sas',label:'二組の辺と、その間の角がそれぞれ等しい'},{id:'sss',label:'三組の辺がそれぞれ等しい'},{id:'insufficient',label:'この組み合わせだけでは、合同条件を満たさない'}].map(o=>({...o,correct:o.id===expected}));
  step.reason=selected==='circular'?'選んだ三組は三辺の一致です。ただし、PB＝PCは今から示す結論なので、前の手順で根拠に使うことはできません。':selected==='one'?'選んだ角の組は、二組の辺の間の角の一致ではありません。合同条件を満たす組み合わせを選び直します。':p.steps[n].reason;
 }
 if(p.geo==='counter'&&n===2){
  const selected=s.aux||'different';step.q='選んだ二つの三角形は、この命題の反例になる？';
  const reasons={different:'三つの角は同じだが辺の長さが違うので、反例になる',same:'角も辺の長さも同じで合同なので、反例にはならない',angles:'角の組が違い、命題の条件を満たさないので、反例にはならない'};
  step.options=[{id:'reason',label:reasons[selected],correct:true},{id:'length',label:selected==='different'?'角が同じなら辺の長さも同じになるので、反例にはならない':'角が同じなら大きさにかかわらず合同でないので、反例になる',correct:false},{id:'angle',label:selected==='angles'?'二つの三角形が合同でなければ、角の組が違っても反例になる':'角が同じであれば、辺の長さが同じでも反例になる',correct:false}];
  step.reason=reasons[selected]+'。反例は、命題の条件を満たしながら結論を満たさない例です。';
 }
 return step;
}

function geoContent(){const p=problems[index];if(stage>=p.steps.length)return {review:true};const s=geometryStep(p,stage);return {q:s.q,detail:history.length?'<p class="small">直前の選択：'+esc(history[history.length-1].label)+'</p>':'',opts:shuffle(s.options.map(o=>({label:o.label,patch:{...(o.id==='revisit'?{revisit:1}:o.id==='rebuild'?{revisit:0}:{}),['g'+stage]:o.id,...(o.aux?{aux:o.aux}:{})}})))}}
function geoReview(){const p=problems[index],items=studyMode==='direct'?directGeoFeedback(p):[...entrySteps(p).map((s,i)=>({s,i,o:s.options.find(o=>o.id===state['entry'+i])})),...p.steps.map((_,i)=>{const s=geometryStep(p,i);return {s,i:i+2,o:s.options.find(o=>o.id===state['g'+i])}})],wrong=items.find(x=>!x.o?.correct),all=!wrong;studyMetrics.end(all?'clear':'fail');if(all){complete[index]=true;save()}return '<div class="result-heading">答え合わせ</div><div class="verdicts"><span class="verdict '+(all?'ok':'wrong')+'">'+(all?'○ 解き方と確認が合っています':'× 道筋を見直そう')+'</span></div><p><strong>結論：'+esc(p.answer)+'</strong></p>'+(wrong?'<div class="feedback-focus"><strong>最初に見直すところ：手順'+(wrong.i+1)+'</strong><p>選んだ内容：'+esc(wrong.o?.label||'未選択')+'</p><p>'+esc(wrong.s.reason)+'</p><button class="primary" data-rewind="'+wrong.i+'">ここから選び直す</button></div>':'<p class="note">図の条件から根拠を選び、結論までつなげられています。</p>')+'<details class="route-details"><summary>各手順の○×と、見るところ</summary>'+items.map(x=>'<div class="log"><strong>'+ (x.o?.correct?'○':'×')+' 手順'+(x.i+1)+'</strong><div>'+esc(x.o?.label||'')+'</div><p>'+esc(x.s.reason)+'</p><button data-rewind="'+x.i+'">ここから選び直す</button></div>').join('')+'</details><div class="row"><button id="retry">最初から試す</button><button class="primary" id="next">'+(nextIndex(index)!==null?'次の問題へ':'問題一覧へ')+'</button></div>'}
function geoSVG(p){if(p.geo==='counter'&&!state.aux&&stage<=1&&studyMode==='guided')return '<p class="diagram-caption">三組の角が等しい二つの三角形について、形と大きさの条件を考えよう。例を選ぶと図に表示します。</p>';
 const line=(a,b,aux=false)=>'<line x1="'+a[0]+'" y1="'+a[1]+'" x2="'+b[0]+'" y2="'+b[1]+'" '+(aux?'class="aux-line"':'')+'/>';
 const text=(pt,label,dx=0,dy=0)=>{const x=pt[0]+dx,y=pt[1]+dy,w=label.length*8.5+8;return '<g class="diagram-annotation"><rect x="'+(x-w/2)+'" y="'+(y-15)+'" width="'+w+'" height="20" rx="2" fill="white" fill-opacity=".94" stroke="none"/><text class="diagram-label" x="'+x+'" y="'+y+'" text-anchor="middle" font-family="Georgia,serif" font-size="16" fill="#263747" stroke="none">'+label+'</text></g>'};
 const dot=a=>'<circle cx="'+a[0]+'" cy="'+a[1]+'" r="2.5" fill="#334d60" stroke="none"/>';
 const poly=pts=>'<polygon points="'+pts.map(a=>a.join(',')).join(' ')+'" fill="#f6f9fc"/>';
 const tick=(a,b)=>{const x=(a[0]+b[0])/2,y=(a[1]+b[1])/2,dx=b[0]-a[0],dy=b[1]-a[1],n=Math.hypot(dx,dy);return line([x-dy/n*5,y+dx/n*5],[x+dy/n*5,y-dx/n*5])};
 // 角の弧と数値を、頂点からの方向に基づいて配置する。
 const angle=(v,a,b,r,label)=>{let t1=Math.atan2(a[1]-v[1],a[0]-v[0]),t2=Math.atan2(b[1]-v[1],b[0]-v[0]);let delta=t2-t1;while(delta>Math.PI)delta-=2*Math.PI;while(delta<-Math.PI)delta+=2*Math.PI;const at=(t,d)=>[v[0]+Math.cos(t)*d,v[1]+Math.sin(t)*d],s=at(t1,r),e=at(t1+delta,r),mid=at(t1+delta/2,r+19);return '<path class="angle-mark" d="M'+s.join(' ')+' A'+r+' '+r+' 0 0 '+(delta>0?1:0)+' '+e.join(' ')+'"/>'+(label?text(mid,label,0,4):'')};
 let body='',labels='',A=[180,25],B=[65,185],C=[295,185];
 if(p.geo==='iso'||p.geo==='proof'){
  if(p.geo==='iso'){B=[115,185];C=[245,185]}
  body=poly([A,B,C])+tick(A,B)+tick(A,C);labels=text(A,'A',0,-13)+text(B,'B',-17,10)+text(C,'C',17,10);
  if(p.geo==='iso')body+=angle(A,B,C,30,'44°')+angle(B,A,C,26,'?');
  else{const P=[180,119];body+=line(B,P)+line(C,P)+dot(P);labels+=text(P,'P',0,21);
   if(state.aux==='AP')body+=line(A,P,true)+angle(A,B,P,31,'')+angle(A,P,C,31,'');
   if(state.aux==='PM'){const M=[180,185];body+=line(P,M,true)+dot(M);labels+=text(M,'M',0,23)}
   if(state.aux==='PN'){const N=[237.5,105];body+=line(P,N,true)+dot(N);labels+=text(N,'N',20,0)}
  }
 }else if(p.geo==='para'||p.geo==='area'){
  A=[85,28];B=[40,180];C=[270,180];const D=[315,28];body=poly([A,B,C,D]);labels=text(A,'A',-12,-10)+text(B,'B',-16,13)+text(C,'C',16,13)+text(D,'D',17,0);
  // ADの記号をE(190,28)から十分離す。記号は辺の上、頂点名は辺の外側。
  body+='<path class="parallel-mark" d="M257 23 l8 5 -8 5 M125 175 l8 5 -8 5"/>';
  if(p.geo==='para'){const P=[177.5,104];body+=line(A,C)+line(B,D)+dot(P);labels+=text(P,'O',0,23)+text([103,72],'6 cm')+text([245,143],'?')}
  else{const E=[190,28];body+=line(E,B)+line(E,C)+dot(E);labels+=text(E,'E',0,-13);
   if(state.aux==='EH'){const H=[190,180];body+=line(E,H,true)+'<path d="M190 168 h12 v12" class="aux-line right-angle"/>';labels+=text(H,'H',0,23)}
   if(state.aux==='AC')body+=line(A,C,true);if(state.aux==='BD')body+=line(B,D,true);
  }
 }else{
  const kind=state.aux||'different',a=[[60,98],[15,176],[105,176]],b=kind==='same'?[[240,98],[195,176],[285,176]]:kind==='angles'?[[240,35],[170,170],[330,170]]:[[240,20],[150,176],[330,176]];
  body=poly(a)+poly(b);labels=text(a[0],'A',0,-13)+text(a[1],'B',-14,13)+text(a[2],'C',10,13)+text(b[0],'D',0,-13)+text(b[1],'E',-14,13)+text(b[2],'F',14,13)+text([60,208],'2 cm')+text([240,208],kind==='same'?'2 cm':kind==='angles'?'角の組が違う例':'4 cm');
  body+=angle(a[0],a[1],a[2],18,'60°');if(kind!=='angles')body+=angle(b[0],b[1],b[2],kind==='same'?18:32,'60°');
 }
 // 文字は線の後にまとめて描く。細い白縁で交点付近の可読性も確保。
 return '<svg xmlns="http://www.w3.org/2000/svg" class="geometry-diagram" viewBox="-12 -14 384 248" role="img" aria-label="'+esc(p.question)+'">'+body+previewGeometryOverlay(p)+labels+'</svg>';
}

function geoPaper(p){return '<p class="problem-text">'+esc(p.question)+'</p>'+geoSVG(p)+'<div class="small diagram-caption">同じ印は等しい辺。青い破線は選んだ補助線。図は模式図です。</div>'}
function entrySteps(p){
 const item=(q,title,labels,reason)=>({q,title,reason,options:labels.map((label,i)=>({label,id:String(i),correct:i===0}))});
 const goal=(labels,reason)=>item('この問題で答えることは？','問題の目標',labels,reason);
 const bridge=(labels,reason)=>item('そのために、何が分かると進めそう？','解くための見通し',labels,reason);
 switch(p.geo){
 case 'iso':return [goal(['頂点Bの角 ∠ABCの大きさ','頂点Aの角 ∠BACの大きさ','辺BCの長さ'],'∠ABCの真ん中の文字Bが角の頂点です。求めるのはBの角。44°はすでに分かっているAの角です。'),bridge(['残り二つの角の合計と、その二つの角の関係','ABとACの具体的な長さ','三角形の面積'],'Aの角が分かっているので、残りの角に注目します。二つの角の合計と、等しいかどうかが分かれば、一つ分を決められます。')];
 case 'para':return [goal(['交点Oから頂点Cまでの長さOC','対角線AC全体の長さ','二本の対角線の長さの合計'],'問題で求めているのはOCです。AC全体でも、別の対角線BDでもありません。図のOとCを確認してください。'),bridge(['分かっているAOと、求めるOCの関係','四つの内角がすべて何度か','ABとBCが同じ長さか'],'既知の6 cmはAOです。同じ対角線上のAOとOCがどう結びつくか分かれば、OCへつなげられます。')];
 case 'proof':return [goal(['PBとPCの長さが等しいこと','ABとACの長さが等しいこと','APがBCに垂直であること'],'示す結論はPB＝PCです。AB＝ACは、証明する前から使える条件です。条件と結論を区別します。'),bridge(['PBとPCを対応する辺として比べられる、合同な三角形','図からPBとPCを測った数値','結論のPB＝PCを、最初から仮定する'],'等しい長さを示す方法として、二つの辺が属する三角形の合同を考えます。測った見た目や、結論そのものを根拠にしません。')];
 case 'area':return [goal(['△EBCと△ABCの面積が等しいこと','△EBCと△ABCが合同であること','EBとABの長さが等しいこと'],'面積が等しいことが目標です。面積が等しくても、三角形の形や辺の長さまで同じとは限りません。'),bridge(['二つの三角形で、共通の底辺と高さの関係','二つの三角形の周の長さの合計','EがADの中点かどうかだけ'],'面積は底辺と高さで決まります。まず共有しているBCを底辺として、二つの高さを比べる見通しを立てます。')];
 case 'counter':return [goal(['角がそれぞれ等しければ、いつでも合同と言えるか','合同な三角形では、対応する角が等しいか','図の二つの三角形の面積の合計'],'今回は「角が等しい」から「合同」を言えるかが問いです。「合同なら角が等しい」とは、条件と結論の向きが逆です。'),bridge(['角が等しいという条件だけで、大きさまで決まるか','合同になる例が一つ存在するかだけ','二つの図が紙面上で同じ向きか'],'「いつでも合同」と言うには大きさの一致も必要です。角が同じでも、大きさが違う場合がないかを考えます。')];
 default:return [goal(['二つの式を両方成り立たせる、xとyの値の組','一つ目の式だけを成り立たせるxの値','二つの式を足して得られる一つの式'],'連立方程式の解は、二つの式を同時に満たすxとyの組です。片方だけ成立しても解とは限りません。'),(p.trap?bridge(['候補を元の二つの式へ入れたとき、それぞれ等式が成り立つか','候補を①へ代入して、等式が成り立つか','候補を②へ代入して、等式が成り立つか'],'答えの候補は、元の二つの式を両方満たす必要があります。'):item('加減法でxかyを消すには、どこをそろえる？','加減法の準備',['消したい文字の係数の大きさ','二つの式の右辺の数','xとyの値'],'消したい文字の係数の大きさをそろえて、式全体を足すか引きます。'))];
 }
}
function entryContent(){const steps=entrySteps(problems[index]),i=stage+2,s=steps[i];return {q:s.q,detail:i===1?'<p class="small">目標として選んだ内容：'+esc(history[0]?.label||'')+'</p>':'',opts:shuffle(s.options.map(o=>({label:o.label,patch:{['entry'+i]:o.id}})))}}

let pendingChoice=null,optionCache=null;
function previewChoice(o){pendingChoice=o;render()}
function confirmChoice(){if(!pendingChoice)return;const o=pendingChoice;choose(o.label,o.patch)}
function candidatePaper(p){if(stage===-10)return directPaper(p);const committed=state;try{if(pendingChoice)state={...state,...pendingChoice.patch};return p.system?C2.paper():p.expr?C1.paper():p.geo?geoPaper(p):'<span class="tag">問題</span><p class="problem-text">次の連立方程式の解を求めましょう。</p><div class="equations">'+eqhtml(p.eq)+'</div>'+workingHTML()+algebraFocus(p);}finally{state=committed}}
function algebraFocus(p){if(!pendingChoice)return '';if(stage===-2)return '<div class="preview-note">確認する対象：'+esc(pendingChoice.label)+'</div>';if(stage===-1)return '<div class="preview-note">試している見通し：'+esc(pendingChoice.label)+'</div>';if(state.check){const pair=state.pair;if(pair)return '<div class="preview-note">代入して確かめる式：'+(state.check==='both'?'①・②':state.check==='first'?'①':'②')+' ／ x＝'+num(pair[0])+'、y＝'+num(pair[1])+'</div>'}return ''}
function previewGeometryOverlay(p){
 if(!pendingChoice)return '';
 const seg=(a,b)=>'<line x1="'+a[0]+'" y1="'+a[1]+'" x2="'+b[0]+'" y2="'+b[1]+'"/>';
 const poly=pts=>'<polygon points="'+pts.map(a=>a.join(',')).join(' ')+'"/>';
 const point=(a)=>'<circle cx="'+a[0]+'" cy="'+a[1]+'" r="9"/>';
 const angle=(v,a,b)=>{const unit=p=>{let dx=p[0]-v[0],dy=p[1]-v[1],n=Math.hypot(dx,dy);return [v[0]+dx/n*32,v[1]+dy/n*32]};return poly([v,unit(a),unit(b)])};
 let A=[180,25],B=[65,185],C=[295,185],P=[180,119],out='',id=stage<0?pendingChoice.patch['entry'+(stage+2)]:pendingChoice.patch['g'+stage];
 if(p.geo==='iso'){B=[115,185];C=[245,185];if(stage===-2)out=id==='0'?angle(B,A,C):id==='1'?angle(A,B,C):seg(B,C);else if(stage===-1)out=id==='0'?angle(B,A,C)+angle(C,A,B):id==='1'?seg(A,B)+seg(A,C):poly([A,B,C]);else if(stage===0)out=id==='base'?angle(B,A,C)+angle(C,A,B):id==='apex'?angle(A,B,C)+angle(B,A,C):angle(A,B,C)+angle(B,A,C)+angle(C,A,B);else if(stage===1||stage===2)out=angle(B,A,C)}
 else if(p.geo==='para'||p.geo==='area'){
 A=[85,28];B=[40,180];C=[270,180];const D=[315,28],O=[177.5,104],E=[190,28];
 if(p.geo==='para'){if(stage===-2)out=id==='0'?seg(O,C):id==='1'?seg(A,C):seg(A,C)+seg(B,D);else if(stage===-1)out=id==='0'?seg(A,O)+seg(O,C):id==='1'?poly([A,B,C,D]):seg(A,B)+seg(B,C);else if(stage===0)out=id==='mid'?point(O)+seg(A,C)+seg(B,D):id==='diag'?seg(A,C)+seg(B,D):point(O);else out=seg(A,O)+seg(O,C)}
 else{if(stage===-2)out=id==='2'?seg(E,B)+seg(A,B):poly([E,B,C])+poly([A,B,C]);else if(stage===-1)out=id==='0'?seg(B,C):id==='1'?poly([E,B,C])+poly([A,B,C]):point(E);else if(stage===1)out=id==='parallel'?seg(A,D)+seg(B,C):id==='slant'?seg(A,B)+seg(E,B):point(E);else if(stage>=2)out=poly([E,B,C])+poly([A,B,C])}
 }else if(p.geo==='proof'){
 if(stage===-2)out=id==='0'?seg(P,B)+seg(P,C):id==='1'?seg(A,B)+seg(A,C):seg(A,P)+seg(B,C);else if(stage===-1)out=id==='0'?poly([A,B,P])+poly([A,C,P]):seg(P,B)+seg(P,C);else if(stage>0)out=poly([A,B,P])+poly([A,C,P]);
 }else if(p.geo==='counter'){if(stage===-2||stage===-1)out=poly([[60,98],[15,176],[105,176]])+poly([[240,20],[150,176],[330,176]])}
 return out?'<g class="preview-focus" aria-label="選択肢で注目している部分">'+out+'</g>':'';
}


