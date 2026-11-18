/* The tree, ordering, ownership and problem IDs come entirely from loaded data. */
let folderPath=[];
const folderNodes=window.TRLabData.nodes;
let treeScrolls=[0,0,0,0,0],treeHorizontal=0;
function subtreeProgress(key){
 const ids=window.TRLabData.nodeIds[key]||[],done=ids.filter(id=>complete[id]).length;
 return {done,total:ids.length,percent:ids.length?Math.round(done/ids.length*100):0};
}
function nextIndex(id){const path=window.TRLabData.paths[id]||[],ids=folderNodes[path.at(-1)]?.problems||[],at=ids.indexOf(id);return at>=0?(ids[at+1]??null):null;}
function unitHome(){document.body.classList.remove('study-screen');
 if(app.classList.contains('tree-home'))treeScrolls=[...app.querySelectorAll('.tree-items')].map(el=>el.scrollTop);
 app.classList.remove('study','reviewing','geometry-study','folder-home');app.classList.add('home','tree-home');document.body.classList.add('tree-screen');
 let parent='root';folderPath=folderPath.filter((key)=>{const valid=(folderNodes[parent]?.children||[]).some(c=>c.key===key);if(valid)parent=key;return valid;});
 const selected=folderNodes[folderPath.at(-1)],leaf=selected?.problems?selected:null;
 const button=(child,depth)=>{const stat=subtreeProgress(child.key),disabled=!stat.total;
  return '<button class="tree-node '+(folderPath[depth]===child.key?'tree-selected':'')+'" data-tree-key="'+esc(child.key)+'" data-tree-depth="'+depth+'" aria-pressed="'+(folderPath[depth]===child.key)+'" aria-label="'+esc(child.label)+'、完了率 '+stat.percent+'%'+(disabled?'、未収録':'')+'" '+(disabled?'disabled':'')+'><span class="tree-node-text"><span>'+esc(child.label)+'</span><small class="tree-progress" title="収録済み '+stat.total+'問のうち '+stat.done+'問完了">'+stat.percent+'%</small></span>'+(!disabled?'<span class="tree-chevron" aria-hidden="true">›</span>':'')+'</button>';
 };
 const col=(label,body,cls='')=>'<section class="tree-column '+cls+'" aria-label="'+esc(label)+'"><h2>'+esc(label)+'</h2><div class="tree-items" tabindex="0" aria-label="'+esc(label)+'の一覧">'+body+'</div></section>';
 const columns=window.TRLabData.columns;
 let html='',key='root';
 for(let depth=0;depth<4;depth++){
  let body='';if(key){const node=folderNodes[key];body=(node?.children||[]).map(child=>button(child,depth)).join('');if(node?.problems)body='<div class="tree-neutral">'+esc(node.contentLabel||'基本・応用')+'<small class="tree-progress">'+subtreeProgress(key).percent+'%</small></div>';}
  html+=col(columns[depth],body,depth===2?'tree-units':'');key=folderPath[depth]||null;
 }
 html+=col(columns[4],leaf?leaf.problems.map(id=>'<button class="tree-problem '+(complete[id]?'problem-completed':'')+'" data-start="'+id+'"><strong class="problem-short-label">'+esc(problems[id].level+' · '+problems[id].title)+'</strong>'+(complete[id]?'<span class="completed-badge" aria-label="完了">済</span>':'')+'</button>').join(''):'','tree-problems');
 app.dataset.portraitColumn=String(leaf?4:Math.min(folderPath.length,4));
 const crumbs='<nav class="portrait-path" aria-label="問題選択の階層"><button data-path-depth="0">'+esc(columns[0])+'</button>'+folderPath.map((k,i)=>'<span aria-hidden="true">›</span><button data-path-depth="'+(i+1)+'">'+esc(folderNodes[k].label)+'</button>').join('')+'</nav>';
 app.innerHTML=crumbs+'<div class="subject-tree" aria-label="教科から問題を選ぶ">'+html+'</div>';
 app.querySelectorAll('[data-path-depth]').forEach(b=>b.onclick=()=>{folderPath=folderPath.slice(0,+b.dataset.pathDepth);unitHome();});
 app.querySelectorAll('[data-tree-key]').forEach(b=>b.onclick=()=>{folderPath=folderPath.slice(0,+b.dataset.treeDepth);folderPath.push(b.dataset.treeKey);unitHome();});
 app.querySelectorAll('.tree-items').forEach((el,i)=>el.scrollTop=treeScrolls[i]||0);app.scrollLeft=0;
 app.querySelectorAll('[data-start]').forEach(b=>b.onclick=()=>start(+b.dataset.start));
}
