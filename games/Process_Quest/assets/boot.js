(()=>{
 'use strict';
 const base=new URL('../',document.currentScript.src),app=document.getElementById('app'),clone=v=>JSON.parse(JSON.stringify(v));
 async function read(path){const c=new AbortController(),t=setTimeout(()=>c.abort(),10000);try{const r=await fetch(new URL(path,base),{cache:'no-store',signal:c.signal});if(!r.ok)throw Error('missing file');return await r.json();}finally{clearTimeout(t);}}
 function script(path){return new Promise((resolve,reject)=>{const s=document.createElement('script');const url=new URL(path,base);url.searchParams.set('_metrics','2');s.src=url;s.async=false;s.onload=resolve;s.onerror=reject;document.body.append(s);});}
 function build(catalog,packs){
  const nodes=Object.create(null),nodeIds=Object.create(null),paths=Object.create(null),options=Object.create(null),problems=[];
  nodes.root={label:'教科',children:[]};const parents=Object.create(null),registry=new Set();
  function child(parent,item){
   if(!/^[A-Za-z][A-Za-z0-9_-]*$/.test(item.key)||item.key==='root'||typeof item.label!=='string'||!item.label.trim())throw Error('invalid node');
   if(nodes[item.key]){if(parents[item.key]!==parent||nodes[item.key].label!==item.label)throw Error('conflicting node');}
   else{nodes[item.key]={label:item.label};parents[item.key]=parent;(nodes[parent].children??=[]).push({key:item.key,label:item.label});}
   return item.key;
  }
  function skeleton(items,parent,depth){if(!Array.isArray(items)||depth>4)throw Error('invalid tree');for(const item of items){const key=child(parent,item);if(item.children)skeleton(item.children,key,depth+1);}}
  skeleton(catalog.tree,'root',1);
  for(const pack of packs){
   if(pack.schemaVersion!==2||!Array.isArray(pack.entries)||!Array.isArray(pack.placement)||pack.placement.length<3||pack.placement.length>4)throw Error('invalid pack');
   let parent='root';const path=[];for(const item of pack.placement){parent=child(parent,item);path.push(parent);}
   const leaf=nodes[parent];if(leaf.children?.length)throw Error('leaf contains children');leaf.problems??=[];
   for(const entry of pack.entries){
    const p=entry.problem;if(!Number.isSafeInteger(entry.id)||entry.id<0||entry.id>1000000||registry.has(entry.id)||!p||typeof p.title!=='string'||typeof p.level!=='string')throw Error('invalid or duplicate problem');
    registry.add(entry.id);problems[entry.id]=clone(p);paths[entry.id]=path.slice();options[entry.id]=clone(entry.options||{});leaf.problems.push(entry.id);
   }
  }
  for(const node of Object.values(nodes))if(node.children?.length&&node.problems)throw Error('mixed node');
  function collect(key){const node=nodes[key];const ids=node.problems?node.problems.slice():(node.children||[]).flatMap(c=>collect(c.key));nodeIds[key]=ids;for(const c of node.children||[])c.disabled=!nodeIds[c.key].length;return ids;}
  collect('root');
  if(!Array.isArray(catalog.columns)||catalog.columns.length!==5||!catalog.columns.every(x=>typeof x==='string'))throw Error('invalid columns');
  return {version:catalog.version,problems,nodes,nodeIds,paths,options,columns:catalog.columns,count:registry.size};
 }
 async function start(){
  const catalog=await read('catalog.json');if(catalog.schemaVersion!==2||!Array.isArray(catalog.packs)||!Array.isArray(catalog.scripts))throw Error('invalid catalog');
  const packs=await Promise.all(catalog.packs.map(p=>read(p.path)));window.TRLabData=build(catalog,packs);
  for(const path of catalog.scripts)await script(path);
  if(!window.PQTest||Object.keys(window.PQTest.problems).length!==window.TRLabData.count)throw Error('startup incomplete');
  document.documentElement.dataset.ready='true';
 }
 start().catch(()=>{app.replaceChildren();const p=document.createElement('p');p.setAttribute('role','alert');p.textContent='教材を読み込めませんでした。通信と教材ファイルを確認し、もう一度お試しください。';const b=document.createElement('button');b.textContent='再読み込み';b.onclick=()=>location.reload();app.append(p,b);document.documentElement.dataset.ready='error';});
})();
