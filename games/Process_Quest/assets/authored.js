/* Data-driven multiple-choice lessons. Existing lesson engines are unchanged. */
const Authored=(()=>{
 const current=()=>problems[index].authored;
 const savedStart=start,savedChoose=choose,savedContent=content,savedPaper=candidatePaper;
 function node(){const p=current();if(stage===-10||stage===p.steps.length)return p.direct;if(stage<p.steps.length)return p.steps[stage];if(stage===p.steps.length+2&&typeof p.verification==='object')return p.verification;return null;}
 function options(n){return shuffle(n.choices.map(c=>({label:c.text,patch:{authoredChoice:c.id}})));}
 function expected(n){return n.choices.find(c=>c.id===n.correctChoice).text;}
 start=function(i){if(!problems[i].authored)return savedStart(i);studyMetrics.start(i);index=i;folderPath=(window.TRLabData.paths[i]||[]).slice();stage=studyMode==='direct'?-10:0;state={};history=[];pendingChoice=null;optionCache=null;marks=[];markMode=false;render();window.scrollTo?.(0,0);};
 choose=function(label,patch){if(!problems[index].authored)return savedChoose(label,patch);pendingChoice=null;optionCache=null;
  if(patch.authoredRetry){state.authoredError=null;render();return;}
  const p=current(),n=node();
  if(n){const pos=n.choices.findIndex(c=>c.id===patch.authoredChoice);if(pos<0)throw Error('invalid authored choice');
   if(stage!==-10&&stage!==p.steps.length&&patch.authoredChoice!==n.correctChoice){state.authoredError={label,feedback:n.choiceFeedback?.[pos]||n.explanation};render();return;}
   history.push({stage,state:JSON.parse(JSON.stringify(state)),label});state.authoredError=null;
   if(stage===-10||stage===p.steps.length){
    state.authoredCandidate=label;
    state.authoredCandidateOK=patch.authoredChoice===n.correctChoice;
    stage=(typeof p.verification==='object')?p.steps.length+2:p.steps.length+3;
   }else{
    const last=stage===p.steps.length-1;
    const sameAsDirect=last&&p.direct&&expected(n).replace(/\s/g,'')===expected(p.direct).replace(/\s/g,'');
    if(sameAsDirect){
     state.authoredCandidate=label;
     state.authoredCandidateOK=true;
     stage=(typeof p.verification==='object')?p.steps.length+2:p.steps.length+3;
    }else stage++;
   }
  }else{history.push({stage,state:JSON.parse(JSON.stringify(state)),label});if(stage===p.steps.length+1){if(patch.authoredJudgement!==(state.authoredCandidateOK?'match':'different')){state.authoredError={label,feedback:'候補と正答例・根拠をもう一度照らし合わせましょう。'};history.pop();render();return;}stage=state.authoredCandidateOK?stage+1:p.steps.length+3;}else stage++;}
  render();
 };
 content=function(){if(!problems[index].authored)return savedContent();const p=current(),n=node();
  if(state.authoredError)return {q:'選んだ内容を確認しよう',detail:'<p class="authored-error">選んだ内容：'+esc(state.authoredError.label)+'</p><p>'+esc(state.authoredError.feedback)+'</p>',opts:[{label:'この手順を選び直す',patch:{authoredRetry:true}}]};
  if(n)return {q:n.question,detail:stage===p.steps.length+2?'<p>ここからは理解の確認です。</p>':'',opts:options(n)};
  if(stage===p.steps.length+1)return {q:'選んだ候補を元の条件で確かめよう',detail:'<p>選んだ答え：'+esc(state.authoredCandidate||'')+'</p>',opts:[{label:'検算へ進む',patch:{authoredContinue:true}}]};
  if(stage===p.steps.length+2)return {q:'元の条件でも確かめよう',detail:'<p>選んだ答え：'+esc(state.authoredCandidate)+'</p><p>'+esc(p.verification)+'</p>',opts:[{label:'内容を確認して答え合わせへ',patch:{authoredContinue:true}}]};
  return {review:true};
 };
 candidatePaper=function(p){if(!p.authored)return savedPaper(p);const a=p.authored;return '<p class="problem-text">'+esc(a.question)+'</p>'+(a.visual?'<img class="authored-figure" src="'+esc(a.visual.path)+'" alt="'+esc(a.title)+'の図">':'')+(pendingChoice?'<div class="preview-note">選んでいる内容：'+esc(pendingChoice.label)+'</div>':'')+(state.authoredCandidate?'<p>選んだ答え：'+esc(state.authoredCandidate)+'</p>':'');};
 function review(){const p=current(),ok=stage===p.steps.length+3&&state.authoredCandidateOK&&!state.authoredError;studyMetrics.end(ok?'clear':'fail');if(ok){complete[index]=true;save();}
  return '<div class="result-heading">'+(ok?'○ 確認できました':'内容を見直そう')+'</div><p>選んだ答え：'+esc(state.authoredCandidate||'未選択')+'</p>'+(!ok?'<p>照合で不一致を確認できました。答えを選び直しましょう。</p><button data-rewind="'+history.findIndex(h=>h.stage===-10||h.stage===p.steps.length)+'">答えを選び直す</button>':'')+'<details><summary>各手順と根拠</summary>'+p.steps.map(s=>'<p><strong>'+esc(s.question)+'</strong><br>'+esc(expected(s))+'<br>'+esc(s.explanation)+'</p>').join('')+'</details><div class="row"><button id="retry">最初から試す</button><button class="primary" id="next">'+(nextIndex(index)!==null?'次の問題へ':'問題一覧へ')+'</button></div>';
 }
 return {node,review};
})();

const authoredTextChoices=choices;
choices=function(opts){
 const p=problems[index]?.authored,n=p?Authored.node():null;
 if(!p?.choiceFigures||!n||state.authoredError)return authoredTextChoices(opts);
 const isGraph=n===p.direct||(/グラフ/.test(n.question)&&n.choices.every(c=>p.choiceFigures.some(f=>f.choiceId===c.id)));
 if(!isGraph)return authoredTextChoices(opts);
 return '<div class="choices">'+opts.map((o,i)=>{const f=p.choiceFigures.find(f=>f.choiceId===o.patch.authoredChoice);return '<button class="choice graph-choice" data-option="'+i+'"><span class="letter">'+String.fromCharCode(65+i)+'</span><span>'+esc(o.label)+(f?'<img src="'+esc(f.path)+'" alt="'+esc(o.label)+'のグラフ">':'')+'</span></button>';}).join('')+'</div>';
};
