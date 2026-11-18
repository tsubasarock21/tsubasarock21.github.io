/* Only public game metadata and qualitative, anonymous buzz labels. */
(function(root){'use strict';
const fallback=[["Process_Quest", "TR-LAB学習アプリ"], ["Street_Hunter", "街角ハンター"], ["Inkstrike", "INKSTRIKE"], ["Horopuzzle", "ホロパズル"], ["Form_Clash", "プチキャラバトル"], ["After_Line", "動的迷路"], ["Yuru_Maze", "ゆる迷路"]];
const games=new Map(fallback.map(([slug,name])=>[slug,{slug,name}]));
const valid=x=>x&&typeof x.slug==='string'&&/^[A-Za-z][A-Za-z0-9_-]{0,47}$/.test(x.slug)&&x.slug!=='Pyramid'&&typeof x.name==='string'&&x.name.trim()&&Array.from(x.name).length<=80;
function accept(data,buzz=false){if(!Array.isArray(data?.items))return;
 for(const x of data.items)if(valid(x)){
  const previous=games.get(x.slug)||{};
  games.set(x.slug,{...previous,slug:x.slug,name:x.name.trim(),updated:typeof x.updated==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x.updated)?x.updated:previous.updated,
    trend:buzz?(['popular','quiet'].includes(x.trend)?x.trend:null):previous.trend,trendAt:buzz?Date.now():previous.trendAt});
 }
}
let lastLoad=-Infinity;
async function load(){if(Date.now()-lastLoad<300000)return;lastLoad=Date.now();await Promise.all(['/lab-system/published-v1.json'].map(async(url,i)=>{
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),6000);
 try{const r=await fetch(url,{credentials:'omit',cache:'no-store',signal:controller.signal});if(r.ok){const text=await r.text();if(text.length<100000)accept(JSON.parse(text),i===1);}}catch{}finally{clearTimeout(timer)}
}));}
function next(random=Math.random,now=Date.now()){
 const choices=[];
 for(const game of games.values()){
  const name=game.name;
  choices.push({text:'「'+name+'」というげぇむがあるらしい。石以外の遊びもあるんやな。',game});
  if(game.trend==='popular'&&now-game.trendAt<1800000)choices.push({text:'「'+name+'」というげぇむ、最近人気らしい。なんのことやら。',game});
  if(game.trend==='quiet'&&now-game.trendAt<1800000)choices.push({text:'「'+name+'」というげぇむ、最近は見つかってへんらしい。かいどき？ 無料やけど。',game});
  const stamp=Date.parse(game.updated+'T00:00:00+09:00'),age=now-stamp;
  if(Number.isFinite(stamp)&&age>=0&&age<7*86400000)choices.push({text:'「'+name+'」というげぇむ、最近更新されたらしいなぁ。わしの腰も更新してほしい。',game});
 }
 if(!choices.length)return null;
 const choice=choices[Math.min(choices.length-1,Math.floor(Math.max(0,random())*choices.length))];
 return {text:choice.text,url:'/games/'+encodeURIComponent(choice.game.slug)+'/',promo:true};
}
root.PyramidRumors={load,next,accept};
if(typeof module!=='undefined'&&module.exports)module.exports=root.PyramidRumors;
})(globalThis);
