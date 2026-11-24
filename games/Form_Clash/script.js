/* Form_Clash v0.8.6 | 2026-10-23 | LAB navigation + anonymous event counts */
globalThis.LabPageConfig={"game": "Form_Clash", "version": "0.8.6"};globalThis.GAME_PUBLIC_URL="https://tsubasarock21.github.io/games/Form_Clash/";globalThis.PICTO_PUBLIC_URL="https://tsubasarock21.github.io/games/Form_Clash/";
/* Tsubasa_Rock_LAB shared navigation / anonymous counters v1.0.0 | 2026-10-23 */
if(globalThis.LabMetricsV2){globalThis.LabMetricsV2.install({game:"Form_Clash",version:globalThis.LabPageConfig?.version||'unknown'});}else{(()=>{'use strict';
const tag=document.currentScript,game=globalThis.LabPageConfig?.game||tag?.dataset.game||'lab',version=globalThis.LabPageConfig?.version||tag?.dataset.version||'1.0.0';
const production=false;
const enabled=production&&location.protocol==='https:'&&!new URLSearchParams(location.search).has('no_metrics');
let run=null,lastShare=-Infinity,lastTime=performance.now(),seconds=0,paused=false,lastVisible=!document.hidden;
const payload=(event,extra={})=>({game,version,event,...extra});
function send(event,extra){if(!enabled)return;try{const data=JSON.stringify(payload(event,extra));if(navigator.sendBeacon?.(endpoint,new Blob([data],{type:'application/json'})))return;void fetch(endpoint,{method:'POST',body:data,headers:{'Content-Type':'application/json'},credentials:'omit',keepalive:true}).catch(()=>{});}catch{}}
function account(){const now=performance.now();if(run&&!paused&&lastVisible)seconds+=Math.max(0,Math.min(3600,(now-lastTime)/1000));lastTime=now;lastVisible=!document.hidden;}
function end(outcome='abandon'){if(!run)return;account();const details=run;run=null;send('end',{...details,outcome,seconds:Math.min(3600,Math.round(seconds))});}
function start(details={}){end();const stage=Number.isInteger(details.stage)?Math.max(0,Math.min(22,details.stage)):0;const mode=['trial','normal','easy','hard','extra','vertical','horizontal','endless','photo','sample','spin','puzzle'].includes(details.mode)?details.mode:'normal';run={stage,mode};seconds=0;paused=false;lastTime=performance.now();send('start',run);}
function pause(){account();paused=true;}function resume(){account();paused=false;lastTime=performance.now();}
const api=Object.freeze({start,end,pause,resume,language:label,share(){if(performance.now()-lastShare<800)return;lastShare=performance.now();send('share');},get active(){return !!run;}});globalThis.LabMetrics=api;
document.addEventListener('visibilitychange',()=>{account();});
// Do not treat an app switch as a finished run. Cached pages keep their in-memory run.
window.addEventListener('pagehide',e=>{account();if(!e.persisted)end();});
window.addEventListener('pageshow',()=>{lastTime=performance.now();});
function label(){if(!globalThis.document?.documentElement)return;const english=document.documentElement.lang.startsWith('en');document.querySelectorAll('[data-lab-return]').forEach(a=>{a.textContent=english?'← Back to LAB':'← ラボへ戻る';a.setAttribute('aria-label',english?'Back to Tsubasa_Rock_LAB':'Tsubasa_Rock_LABへ戻る');});}
function init(){label();new MutationObserver(label).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});document.addEventListener('click',e=>{const a=e.target.closest?.('[data-lab-return]');if(a)end();const share=e.target.closest?.('[data-lab-share],#share,#shareGame,#shareGameButton,#shareResultButton');if(share&&!share.disabled)api.share();},true);send('view');}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();}

/* FORM CLASH / script.js / v0.8.6 */

const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
// Self-contained chiptune SFX. No downloaded assets, timers, or game RNG use.
const battleAudio=(()=>{
  const KEY="unitBattleSound",voices=new Set(),last={};
  let enabled=true,ctx=null,master=null;
  try{enabled=localStorage.getItem(KEY)!=="off"}catch{}
  function refresh(){const b=$("#soundToggleButton");b.textContent=enabled?"♪ SOUND ON":"♪ SOUND OFF";b.setAttribute("aria-pressed",String(enabled))}
  function stop(){for(const v of voices){try{v.osc.stop();v.osc.disconnect();v.gain.disconnect()}catch{}}voices.clear();for(const key of Object.keys(last))delete last[key]}
  async function unlock(){
    if(!enabled||document.hidden)return;
    try{
      const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;
      if(!ctx||ctx.state==="closed"){ctx=new Audio();master=ctx.createGain();master.gain.value=.22;master.connect(ctx.destination)}
      if(ctx.state!=="running")await ctx.resume();
    }catch{} // Audio failure must never interrupt the game.
  }
  function tone(freq,duration=.08,delay=0,type="square",volume=.16,end=freq){
    if(!enabled||document.hidden||!ctx||ctx.state!=="running"||voices.size>=10)return;
    let osc,gain,voice;
    try{
      const t=ctx.currentTime+delay;osc=ctx.createOscillator();gain=ctx.createGain();osc.type=type;
      osc.frequency.setValueAtTime(freq,t);osc.frequency.exponentialRampToValueAtTime(Math.max(20,end),t+duration);
      gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(volume,t+.005);gain.gain.exponentialRampToValueAtTime(.0001,t+duration);
      osc.connect(gain);gain.connect(master);voice={osc,gain};voices.add(voice);
      osc.onended=()=>{voices.delete(voice);osc.disconnect();gain.disconnect()};osc.start(t);osc.stop(t+duration+.01);
    }catch{if(voice)voices.delete(voice);try{osc?.disconnect();gain?.disconnect()}catch{}}
  }
  function play(kind,enemy=false){
    if(!enabled||document.hidden||!ctx||ctx.state!=="running")return;
    const now=ctx.currentTime,gap={shot:.11,critical:.12,deploy:.065,tap:.06}[kind]||0;
    if(gap&&now-(last[kind]??-Infinity)<gap)return;last[kind]=now;
    if(kind==="tap")tone(660,.045,0,"square",.09,880);
    if(kind==="start"){tone(392,.08);tone(523,.12,.1)}
    if(kind==="deploy")tone(260,.1,0,"square",.18,620);
    if(kind==="shot"&&voices.size<6)tone(enemy?490:740,.045,0,"square",enemy?.035:.055,enemy?180:300);
    if(kind==="critical"){tone(1250,.07,0,"square",.13,650);tone(1660,.08,.04,"triangle",.16,830)}
    if(["win","loss","draw"].includes(kind)){
      stop();
      if(kind!=="draw"){tone(145,.28,0,"sawtooth",.18,28);tone(85,.32,0,"triangle",.2,24)}
      const notes=kind==="win"?[523,659,784,1047]:kind==="loss"?[392,330,262,196]:[440,392,440];
      notes.forEach((f,i)=>tone(f,i===notes.length-1?.3:.12,.25+i*.14,"square",.13));
    }
  }
  refresh();
  $("#soundToggleButton").addEventListener("click",()=>{
    enabled=!enabled;try{localStorage.setItem(KEY,enabled?"on":"off")}catch{}
    refresh();if(!enabled)stop();else unlock().then(()=>play("tap"));
  });
  document.addEventListener("pointerdown",()=>{void unlock()},{capture:true,passive:true});
  document.addEventListener("click",e=>{const b=e.target.closest?.("button");if(b&&!b.disabled&&!['soundToggleButton','startButton'].includes(b.id))unlock().then(()=>play("tap"))},true);
  document.addEventListener("visibilitychange",()=>{if(document.hidden){stop();try{ctx?.suspend()?.catch(()=>{})}catch{}}});
  window.addEventListener("pagehide",stop);
  return{play,stop,unlock};
})();
const ALLOC_POINTS=100,MAX_ALLOC=100,MOAT_START_Y=142,MOAT_END_Y=150,MOAT_SPEED=.1,ENEMY_SPAWN_Y=152;
const STAR_CHANCE=.001,BATTLE_TIME=45,CRIT_DAMAGE=2,STUN_TIME=200,SEARCH_RATE=1.25,MEDAL_KEY="unitBattleMedals";
const BATTLE_DURATIONS=[30,45,60];
let battleDuration=BATTLE_TIME;
function timedSMedalId(mode,seconds){return mode+"S"+(seconds===45?"":seconds)}
const unitSymbols=["●","↑","→","↓","←"],unitColors=["#1976d2","#e53935","#fdd835","#43a047","#8e44ad"];
const difficulty={
  easy:{min:55,max:80,cap:5,spawnMin:5000,spawnMax:5000},
  normal:{min:85,max:110,cap:10,spawnMin:4000,spawnMax:4000},
  hard:{min:125,max:150,cap:10,spawnMin:3000,spawnMax:4000},
  extra:{min:125,max:150,cap:10,spawnMin:3000,spawnMax:4000,specialChance:.2}
};
const previousMedalPages=[
  [["easyWin","EASY CLEAR"],["easyS","EASY RANK S"],["normalWin","NORMAL CLEAR"],["normalS","NORMAL RANK S"],["hardWin","HARD CLEAR"],["hardS","HARD RANK S"],["extraWin","EXTRA CLEAR"],["extraS","EXTRA RANK S"]],
  [["peace","平和主義"],["allClear","オールクリア"],["elite","精鋭"],["desperate","絶体絶命"],["allColors","全色"],["singleColor","単色"],["rush","速攻"],["aged","熟成"]],
  [["warrior","WARRIOR"],["sniper","SNIPER"],["tank","TANK"],["ninja","NINJA"],["star","STAR"],["meteor","METEOR"],["meteorOnly","隕石攻め"],["heroes","英雄達"]],
  [["lucky","LUCKY?"],["initialDeckS","初期デッキ"],[0,"COMING SOON"],[0,"COMING SOON"],[0,"COMING SOON"],[0,"COMING SOON"],[0,"COMING SOON"],[0,"COMING SOON"]]
];
const timeMedals=Object.keys(difficulty).flatMap(mode=>BATTLE_DURATIONS.map(seconds=>[timedSMedalId(mode,seconds),mode.toUpperCase()+' '+seconds+'秒 S']));
const legacySIds=new Set(Object.keys(difficulty).map(mode=>mode+'S'));
const medalList=[...timeMedals,...previousMedalPages.flat().filter(([id])=>id&&!legacySIds.has(id))];
const medalPages=Array.from({length:Math.ceil(medalList.length/8)},(_,i)=>{const page=medalList.slice(i*8,i*8+8);while(page.length<8)page.push([0,'COMING SOON']);return page});
const medalTitles=Object.fromEntries(medalPages.flat().filter(m=>m[0]));
const blankUnit=()=>({points:{hp:0,move:0,speed:0,atk:0,range:0},boost:[]});
const initialUnits=()=>[
  {points:{hp:35,move:15,speed:15,atk:20,range:15},boost:["hp","atk"]},
  {points:{hp:15,move:15,speed:20,atk:40,range:10},boost:["atk","speed"]},
  {points:{hp:10,move:10,speed:15,atk:20,range:45},boost:["range","atk"]},
  {points:{hp:45,move:15,speed:15,atk:15,range:10},boost:["hp","move"]},
  {points:{hp:10,move:40,speed:25,atk:15,range:10},boost:["move","speed"]}
];
const sniperUnit=()=>({points:{hp:10,move:0,speed:20,atk:80,range:99},boost:[]});
const warriorUnit=()=>({points:{hp:20,move:20,speed:20,atk:80,range:10},boost:["hp","atk"]});

let savedUnits=initialUnits(),draft=clone(savedUnits[0]),selectedUnit=0,dirtyFlag=false,currentDifficulty="normal";
let battleRunning=false,battleFinished=false,soldiers=[],projectiles=[],playerHP=100,enemyHP=100,playerDeployedPoints=0,enemyDeployedPoints=0;
let timeLeft=BATTLE_TIME,lastFrame=0,battleStartTime=0,enemyNextSpawn=0,starCheckTime=0,rafId=0;
let rareStarSpawned=false,enemyDestroyed=false,sniperUsed=false,sniperUsedIndex=-1,charge=null,designSwipe=null;
let medalPage=0,medalQueue=[],medalShowing=false,unlockedMedals=loadMedals();
let playerDeaths=0,deployedColors=new Set(),chargeTypes=new Set(),playerDeployCount=0,ordinaryDeployed=false,enemyTowerHit=false,enemyTowerNonMeteorHit=false;
const game=$("#game");
let fortressBricks=[],towerGeneration=0,towerRevealTimer=0;
let brickSeed=Date.now()>>>0;
function brickRandom(){brickSeed=(Math.imul(brickSeed,1664525)+1013904223)>>>0;return brickSeed/4294967296}
function brickRange(a,b){return a+(b-a)*brickRandom()}

function clone(v){return JSON.parse(JSON.stringify(v))}
function clamp(v,min,max){return Math.max(min,Math.min(max,v))}
function rand(min,max){return min+Math.random()*(max-min)}
function randInt(min,max){return Math.floor(rand(min,max+1))}
function sumPoints(u){return Object.values(u.points).reduce((a,b)=>a+b,0)}
function isInitialDeck(){return JSON.stringify(savedUnits)===JSON.stringify(initialUnits())}
function sameBoost(u,k){return!!u&&Array.isArray(u.boost)&&u.boost.length===k.length&&k.every(x=>u.boost.includes(x))}
function showScreen(id){$$(".screen").forEach(s=>s.classList.add("hidden-screen"));$(id).classList.remove("hidden-screen")}
function goHome(){stopBattle();$("#resultScreen").classList.add("hidden-screen");showScreen("#homeScreen")}

function loadMedals(){
  try{return new Set(JSON.parse(localStorage.getItem(MEDAL_KEY)||"[]"))}catch{return new Set()}
}
const medalConditions={
  easyWin:"EASYで勝利する。",easyS:"EASYで勝利し、RANK S（100.1点以上）を獲得する。",
  normalWin:"NORMALで勝利する。",normalS:"NORMALで勝利し、RANK S（100.1点以上）を獲得する。",
  hardWin:"HARDで勝利する。",hardS:"HARDで勝利し、RANK S（100.1点以上）を獲得する。",
  extraWin:"EXTRAで勝利する。",extraS:"EXTRAで勝利し、RANK S（100.1点以上）を獲得する。",
  peace:"両軍のタワーHPが100のまま引き分ける。",
  allClear:"勝利時に、生存している敵ユニットが1体もいない。",
  elite:"自軍ユニットが1体も倒されずに勝利する。",
  desperate:"自軍ユニットが20体以上倒された戦闘で引き分ける。",
  allColors:"勝利時に、5色すべての自軍ユニットがそれぞれ1体以上生存している。",
  singleColor:"1色のユニットだけを1体以上出撃させて勝利する。",
  rush:"すべての出撃を0.8倍チャージ（0.5秒以上1秒未満）だけで行い、勝利する。1体以上の出撃が必要。",
  aged:"すべての出撃を最大チャージ（3秒以上）だけで行い、勝利する。1体以上の出撃が必要。",
  warrior:"HP 1・MOVE 0・SPD 0・ATK 0・RANGE 4、BOOSTをHP＋ATKに設定して保存する。",
  sniper:"ATK 25・RANGE 13、BOOSTをATK＋RANGEに設定して保存する。他の配分は自由。",
  tank:"HP 99、MOVE・SPD・ATK・RANGEのうち1項目だけに1、残りは0。BOOSTをHP＋その1項目に設定して保存する。",
  ninja:"HP 0・MOVE 29・SPD 29・ATK 29・RANGE 0、BOOSTなしで保存する。",
  star:"HP 0・MOVE 100・SPD 0・ATK 0・RANGE 0、BOOSTをMOVEだけに設定して保存する。",
  meteor:"STARを3秒以上チャージして、METEORとして出撃させる。",
  meteorOnly:"敵タワーに1回以上ダメージを与え、敵タワーへのダメージをすべてMETEORで与えて勝利する。他のユニットを出撃させてもよい。",
  heroes:"特殊ユニットだけを1体以上出撃させ、勝利してRANK Sを獲得する。",
  lucky:"戦闘中に超低確率のレアSTARが出現する。EXTRAの20％抽選で出るSTARは対象外。",
  initialDeckS:"5体の配分とBOOSTをすべて初期デッキのままにして、RANK Sを獲得する（引き分けでも可）。"
};
for(const mode of Object.keys(difficulty))for(const seconds of BATTLE_DURATIONS)medalConditions[timedSMedalId(mode,seconds)]=mode.toUpperCase()+'の'+seconds+'秒設定で勝利し、RANK S（100.1点以上）を獲得する。';
function showMedalCondition(id){
  if(!medalConditions[id])return;
  $("#medalConditionTitle").textContent=medalTitles[id];
  $("#medalConditionText").textContent=medalConditions[id];
  $("#medalConditionDialog").showModal();
}
$("#closeMedalCondition").addEventListener("click",()=>$("#medalConditionDialog").close());
function renderMedals(){
  const dots=$('.medal-page-dots');if(dots&&dots.children.length!==medalPages.length){dots.replaceChildren();for(let i=0;i<medalPages.length;i++){const dot=document.createElement('span');dot.className='medal-page-dot';dots.append(dot)}}
  const grid=$("#medalGrid");
  if(!grid)return;
  grid.innerHTML="";
  medalPages[medalPage].forEach(([id,title])=>{
    const acquired=!!id&&unlockedMedals.has(id),el=document.createElement(id?"button":"div");
    if(id){el.type="button";el.setAttribute("aria-label",title+"："+(acquired?"獲得済み":"未獲得")+"。獲得条件を見る");el.addEventListener("click",()=>showMedalCondition(id))}
    el.className=`medal-item${!id?" coming":unlockedMedals.has(id)?" unlocked":""}`;
    const icon=document.createElement("div");icon.className="medal-item-icon";icon.textContent=id?"🏆":"—";icon.setAttribute("aria-hidden","true");
    const body=document.createElement("div");body.className="trophy-item-body";
    const name=document.createElement("div");name.className="medal-item-title";name.textContent=title;body.append(name);
    if(id){
      const status=document.createElement("div");status.className="trophy-item-status";status.textContent=acquired?"獲得済み":"未獲得";body.append(status);
      const condition=document.createElement("p");condition.className="trophy-item-condition";condition.textContent=medalConditions[id]||"";body.append(condition);
    }
    el.append(icon,body);
    grid.append(el);
  });
  $("#medalPageLabel").textContent=`PAGE ${medalPage+1} / ${medalPages.length}`;
  $$(".medal-page-dot").forEach((d,i)=>d.classList.toggle("selected",i===medalPage));
  $("#medalPrevButton").disabled=medalPage===0;
  $("#medalNextButton").disabled=medalPage===medalPages.length-1;
}
function unlockMedal(id){
  if(!medalTitles[id]||unlockedMedals.has(id))return;
  unlockedMedals.add(id);
  try{localStorage.setItem(MEDAL_KEY,JSON.stringify([...unlockedMedals]))}catch{}
  renderMedals();
  medalQueue.push(id);
  showMedal();
}
function showMedal(){
  if(medalShowing||!medalQueue.length)return;
  medalShowing=true;
  const id=medalQueue.shift(),popup=$("#medalPopup");
  $("#medalPopupTitle").textContent=medalTitles[id];
  popup.classList.remove("hidden-screen");
  const card=popup.querySelector(".medal-popup-card");
  card.style.animation="none";void card.offsetWidth;card.style.animation="medalPopup 2s ease forwards";
  setTimeout(()=>{popup.classList.add("hidden-screen");medalShowing=false;showMedal()},2000);
}
function setMedalPage(n){medalPage=clamp(n,0,medalPages.length-1);renderMedals()}
$("#medalPrevButton").addEventListener("click",()=>setMedalPage(medalPage-1));
$("#medalNextButton").addEventListener("click",()=>setMedalPage(medalPage+1));

function isStarUnit(u){const p=u?.points;return!!p&&p.hp===0&&p.move===100&&p.speed===0&&p.atk===0&&p.range===0&&sameBoost(u,["move"])}
function isSniperRecipe(u){return!!u?.points&&u.points.atk===25&&u.points.range===13&&sameBoost(u,["atk","range"])}
function tankExtraStat(u){
  if(!u?.points||u.points.hp!==99)return"";
  const p=u.points,k=["move","speed","atk","range"],one=k.filter(x=>p[x]===1);
  return one.length===1&&!k.some(x=>x!==one[0]&&p[x]!==0)&&sameBoost(u,["hp",one[0]])?one[0]:"";
}
function isTankRecipe(u){return!!tankExtraStat(u)}
function isNinjaRecipe(u){const p=u?.points;return!!p&&p.hp===0&&p.move===29&&p.speed===29&&p.atk===29&&p.range===0&&sumPoints(u)===87&&sameBoost(u,[])}
function isWarriorRecipe(u){const p=u?.points;return!!p&&p.hp===1&&p.move===0&&p.speed===0&&p.atk===0&&p.range===4&&sameBoost(u,["hp","atk"])}
function specialId(u){
  if(isSniperRecipe(u))return"sniper";
  if(isTankRecipe(u))return"tank";
  if(isNinjaRecipe(u))return"ninja";
  if(isWarriorRecipe(u))return"warrior";
  if(isStarUnit(u))return"star";
  return"";
}
function designSpecial(){return dirtyFlag?"":specialId(savedUnits[selectedUnit])}

function calculatedStats(u,playerBonus=false){
  const p=u.points;
  return{
    hp:playerBonus&&p.hp===100?150:15+p.hp,
    move:playerBonus&&p.move===100?1.2:.25+p.move*.0075,
    speed:playerBonus&&p.speed===100?2:.8+p.speed*.008,
    atk:playerBonus&&p.atk===100?15:2+p.atk*.1,
    range:playerBonus&&p.range===100?100:25+p.range*(100/1.05-25)/100
  };
}
function realStats(u){return calculatedStats(u,true)}
function tankStats(){return{hp:215,move:.15,speed:.8,atk:0,range:25}}
function ninjaStats(){return{hp:15,move:1.2,speed:4,atk:1,range:25}}
function warriorStats(){return realStats(warriorUnit())}
function displayedDesignStats(){
  const s=designSpecial();
  return s==="sniper"?realStats(sniperUnit()):s==="tank"?tankStats():s==="ninja"?ninjaStats():s==="warrior"?warriorStats():realStats(draft);
}
function formattedStats(){
  const s=displayedDesignStats();
  return{hp:s.hp.toFixed(1),move:s.move.toFixed(3),speed:`${s.speed.toFixed(3)}/s`,atk:s.atk.toFixed(1),range:s.range.toFixed(1)};
}

function attackText(a){return a.toFixed(1)}
function attackFontSize(size,atk,shape,preview=false){
  let scale=attackText(atk).length>=4?.21:.27;
  if(shape==="triangle")scale*=.84;
  if(shape==="star")scale*=.8;
  if(shape==="wall")scale*=1.08;
  return clamp(size*scale,preview?10:8,preview?18:15);
}
function fitAttackText(core,size,atk,shape,preview=false){
  core.textContent=attackText(atk);
  Object.assign(core.style,{fontSize:`${attackFontSize(size,atk,shape,preview)}px`,lineHeight:"1",whiteSpace:"nowrap",textAlign:"center"});
}
function addTankCross(core){
  core.textContent="";
  const m=document.createElement("span");m.textContent="✚";
  Object.assign(m.style,{color:"#fff",fontWeight:"900",fontSize:"1.55em",lineHeight:"1",textShadow:"0 1px 2px rgba(0,0,0,.45)"});
  core.append(m);
}
function addNinjaMark(core){
  core.textContent="";
  const m=document.createElement("span");m.textContent="忍";
  Object.assign(m.style,{color:"#fff",fontWeight:"900",fontSize:"1.05em",lineHeight:"1",textShadow:"0 1px 3px #000"});
  core.append(m);
}
function addWarriorSlit(core,atk,preview=false){
  core.textContent="";
  const s=document.createElement("span");s.className="warrior-atk";s.textContent=attackText(atk);
  Object.assign(s.style,{position:"absolute",left:"16%",top:"39%",width:"68%",height:"25%",display:"flex",alignItems:"center",justifyContent:"center",boxSizing:"border-box",background:"#090909",border:"1px solid rgba(255,255,255,.55)",borderRadius:"2px",color:"#fff",fontWeight:"900",fontSize:preview?"13px":"11px",lineHeight:"1",letterSpacing:"-.4px",textShadow:"0 0 3px #000"});
  core.append(s);
}

function baseCritRate(u,team){return u.points.speed*calculatedStats(u,team==="player").move}
function critRate(u,team){
  const r=baseCritRate(u,team);
  return team==="player"?r:currentDifficulty==="easy"?0:currentDifficulty==="normal"?r/2:r;
}
function dominantStat(u){
  const e=Object.entries(u.points),m=Math.max(...e.map(v=>v[1])),top=e.filter(v=>v[1]===m);
  return top.length===1?top[0][0]:null;
}
function unitShape(u){
  if(isStarUnit(u))return"star";
  if(isTankRecipe(u))return"tank";
  if(isNinjaRecipe(u))return"ninja";
  if(isWarriorRecipe(u))return"warrior";
  const d=dominantStat(u);
  return d==="hp"?"wall":d==="range"?"triangle":"circle";
}

function loadUnit(i){selectedUnit=i;draft=clone(savedUnits[i]);dirtyFlag=false;renderDesign()}
function resetPreviewShape(el,core){
  el.removeAttribute("style");core.removeAttribute("style");
  Object.assign(el.style,{position:"absolute",left:"50%",top:"50%",transform:"translate(-50%,-44%)",display:"flex",alignItems:"center",justifyContent:"center",padding:"4px",margin:"0",border:"0",outline:"0",textDecoration:"none",backgroundColor:"#fff",overflow:"hidden"});
  Object.assign(core.style,{position:"relative",width:"100%",height:"100%",margin:"0",padding:"0",border:"0",outline:"0",textDecoration:"none",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff"});
}
function applyPreviewShape(el,core,u,forced=""){
  const shape=forced||unitShape(u),stats=shape==="sniper"?realStats(sniperUnit()):shape==="tank"?tankStats():shape==="ninja"?ninjaStats():shape==="warrior"?warriorStats():realStats(u);
  const size=clamp(48+stats.hp*.16,50,78);
  el.style.width=el.style.height=`${size}px`;el.style.borderRadius=core.style.borderRadius="50%";el.style.clipPath=core.style.clipPath="none";
  if(shape==="wall"){el.style.width=`${size*1.35}px`;el.style.height=`${size*.85}px`;el.style.borderRadius="8px";core.style.borderRadius="5px"}
  if(shape==="tank"){el.style.width=`${size*1.65}px`;el.style.height=`${size*.85}px`;el.style.borderRadius=core.style.borderRadius="0";el.style.clipPath="polygon(0 0,100% 0,92% 58%,50% 100%,8% 58%)";core.style.clipPath="polygon(4% 6%,96% 6%,88% 58%,50% 93%,12% 58%)"}
  if(shape==="triangle"){el.style.borderRadius=core.style.borderRadius="0";el.style.clipPath="polygon(50% 0,100% 100%,0 100%)";core.style.clipPath="polygon(50% 6%,94% 94%,6% 94%)"}
  if(shape==="star"){el.style.width=el.style.height=`${size*1.15}px`;el.style.borderRadius=core.style.borderRadius="0";el.style.clipPath="polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 92%,50% 70%,21% 92%,32% 57%,2% 35%,39% 35%)";core.style.clipPath="polygon(50% 6%,59% 38%,91% 38%,65% 57%,75% 87%,50% 68%,25% 87%,35% 57%,9% 38%,41% 38%)"}
  if(shape==="sniper"){el.style.borderRadius=core.style.borderRadius="0";el.style.clipPath="polygon(25% 0,75% 0,75% 28%,100% 28%,100% 100%,0 100%,0 28%,25% 28%)";core.style.clipPath="polygon(29% 7%,71% 7%,71% 34%,93% 34%,93% 93%,7% 93%,7% 34%,29% 34%)"}
  if(shape==="ninja"){el.style.width=el.style.height=`${size*1.05}px`;el.style.borderRadius=core.style.borderRadius="0";el.style.clipPath="polygon(50% 0,62% 36%,100% 50%,62% 64%,50% 100%,38% 64%,0 50%,38% 36%)";core.style.clipPath="polygon(50% 7%,60% 39%,93% 50%,60% 61%,50% 93%,40% 61%,7% 50%,40% 39%)"}
  if(shape==="warrior"){el.style.width=el.style.height=`${size*1.08}px`;el.style.borderRadius=core.style.borderRadius="0";el.style.clipPath="polygon(43% 0,57% 0,61% 14%,78% 21%,91% 38%,88% 82%,72% 100%,28% 100%,12% 82%,9% 38%,22% 21%,39% 14%)";core.style.clipPath="polygon(44% 7%,56% 7%,59% 19%,74% 26%,84% 41%,81% 77%,68% 92%,32% 92%,19% 77%,16% 41%,26% 26%,41% 19%)"}
  return size;
}
function addSniperGlasses(core){
  const l=document.createElement("span"),r=document.createElement("span");
  l.className="sniper-glass left";r.className="sniper-glass right";core.append(l,r);
}
function renderPreview(){
  const u=savedUnits[selectedUnit],special=designSpecial(),el=$("#designUnitGraphic"),core=$("#designUnitCore");
  resetPreviewShape(el,core);core.style.backgroundColor=special==="ninja"?"#080808":unitColors[selectedUnit];
  $("#previewUnitName").textContent=`UNIT ${String(selectedUnit+1).padStart(2,"0")}`;
  if(special==="sniper"){applyPreviewShape(el,core,u,"sniper");core.textContent="";addSniperGlasses(core);return}
  if(special==="tank"){applyPreviewShape(el,core,u,"tank");addTankCross(core);return}
  if(special==="ninja"){applyPreviewShape(el,core,u,"ninja");addNinjaMark(core);return}
  if(special==="warrior"){applyPreviewShape(el,core,u,"warrior");addWarriorSlit(core,warriorStats().atk,true);return}
  const shape=unitShape(u),size=applyPreviewShape(el,core,u,shape);
  fitAttackText(core,size,realStats(u).atk,shape,true);
}
function renderDesign(){
  const f=formattedStats();
  const used=sumPoints(draft);$("#usedPoint").textContent=$("#totalPoint").textContent=used;$("#remainingPoint").textContent=ALLOC_POINTS-used;
  $$(".unit-select-button").forEach((b,i)=>b.classList.toggle("selected",i===selectedUnit));
  $$(".parameter-row").forEach(row=>{
    const k=row.dataset.stat,a=draft.points[k],r=a/MAX_ALLOC,fill=row.querySelector(".parameter-fill");
    fill.style.left="8px";fill.style.width=`max(1px,calc(${r*100}% - ${r*16}px))`;
    row.querySelector(".parameter-number").textContent=a;row.querySelector(".parameter-real").textContent=f[k];
    row.querySelector(".parameter-real").classList.toggle("max-bonus",a===MAX_ALLOC&&!designSpecial());
  });
  $$(".boost-button").forEach(b=>b.classList.toggle("selected",draft.boost.includes(b.dataset.stat)));
  $("#boostCount").textContent=`${draft.boost.length} / 2`;$("#unitStatus").textContent=dirtyFlag?"UNSAVED":"SAVED";
  $("#saveUnitButton").classList.toggle("saved",!dirtyFlag);renderPreview();
}
function setAllocation(k,value){
  const cur=draft.points[k],available=Math.min(MAX_ALLOC,ALLOC_POINTS-(sumPoints(draft)-cur)),next=clamp(Math.round(value),0,available);
  if(next===cur)return;draft.points[k]=next;dirtyFlag=true;renderDesign();
}
function setFromBar(row,x){
  const bar=row.querySelector(".parameter-bar"),r=bar.getBoundingClientRect();
  setAllocation(row.dataset.stat,clamp((x-r.left-8)/Math.max(1,r.width-16),0,1)*MAX_ALLOC);
}
$$(".parameter-row").forEach(row=>{
  const k=row.dataset.stat,bar=row.querySelector(".parameter-bar");
  row.querySelector(".minus").addEventListener("click",()=>setAllocation(k,draft.points[k]-1));
  row.querySelector(".plus").addEventListener("click",()=>setAllocation(k,draft.points[k]+1));
  bar.addEventListener("pointerdown",e=>{e.preventDefault();bar.setPointerCapture?.(e.pointerId);setFromBar(row,e.clientX)});
  bar.addEventListener("pointermove",e=>{if(!bar.hasPointerCapture?.(e.pointerId))return;e.preventDefault();setFromBar(row,e.clientX)});
});
$$(".boost-button").forEach(b=>b.addEventListener("click",()=>{
  const k=b.dataset.stat,i=draft.boost.indexOf(k);
  if(i>=0)draft.boost.splice(i,1);else{if(draft.boost.length>=2)return;draft.boost.push(k)}
  dirtyFlag=true;renderDesign();
}));
$$(".unit-select-button").forEach((b,i)=>b.addEventListener("click",()=>{b.blur();loadUnit(i)}));
$("#resetUnitButton").addEventListener("click",()=>{
  draft=blankUnit();dirtyFlag=true;$("#saveMessage").textContent="";renderDesign();
});
$("#saveUnitButton").addEventListener("click",()=>{
  savedUnits[selectedUnit]=clone(draft);dirtyFlag=false;$("#saveMessage").textContent="UNIT SAVED";
  renderDesign();renderPlayerCounters();
  const id=specialId(savedUnits[selectedUnit]);if(id)unlockMedal(id);
  setTimeout(()=>$("#saveMessage").textContent="",1000);
});
$("#designPreview").addEventListener("pointerdown",e=>designSwipe={x:e.clientX,y:e.clientY});
$("#designPreview").addEventListener("pointerup",e=>{
  if(!designSwipe)return;
  const dx=e.clientX-designSwipe.x,dy=e.clientY-designSwipe.y;designSwipe=null;
  if(Math.abs(dx)<35||Math.abs(dx)<Math.abs(dy))return;
  loadUnit(dx<0?(selectedUnit+1)%5:(selectedUnit+4)%5);
});

$("#homeBattleButton").addEventListener("click",()=>showScreen("#difficultyScreen"));
$("#homeDesignButton").addEventListener("click",()=>{loadUnit(selectedUnit);showScreen("#designScreen")});
$("#homeMedalButton").addEventListener("click",()=>{renderMedals();showScreen("#medalScreen")});
$("#homeHowToButton").addEventListener("click",()=>showScreen("#howToScreen"));
["difficultyBackButton","designBackButton","medalBackButton","howToBackButton","battleHomeButton","resultHomeButton"].forEach(id=>$("#"+id).addEventListener("click",goHome));
// Rebuild legacy difficulty buttons as cards before binding the new controls.
function ensureBattleTimeControls(){
  for(const old of $$('.difficulty-list button.difficulty-button[data-difficulty]')){
    const card=document.createElement('article');card.className=old.className+' difficulty-card';card.dataset.difficulty=old.dataset.difficulty;
    const info=document.createElement('div');info.className='difficulty-info';info.innerHTML=old.innerHTML;
    const times=document.createElement('div');times.className='battle-time-buttons';times.setAttribute('role','group');times.setAttribute('aria-label',old.dataset.difficulty.toUpperCase()+'の制限時間');
    for(const seconds of BATTLE_DURATIONS){const b=document.createElement('button');b.type='button';b.className='battle-time-button';b.dataset.difficulty=old.dataset.difficulty;b.dataset.duration=seconds;b.textContent=seconds+'秒';b.setAttribute('aria-label',old.dataset.difficulty.toUpperCase()+'・'+seconds+'秒で対戦開始');times.append(b)}
    card.append(info,times);old.replaceWith(card);
  }
}
function selectBattle(mode,seconds){
  if(!Object.hasOwn(difficulty,mode)||!BATTLE_DURATIONS.includes(seconds))return false;
  currentDifficulty=mode;battleDuration=seconds;prepareBattle();startBattle();return true;
}
ensureBattleTimeControls();
$$('.battle-time-button[data-difficulty][data-duration]').forEach(b=>b.addEventListener('click',()=>selectBattle(b.dataset.difficulty,Number(b.dataset.duration))));


function unitStats(u,m=1,team="player",special=""){
  if(special==="sniper"){const b=realStats(sniperUnit());return{hp:b.hp,atk:b.atk,cooldown:1000/b.speed,move:b.move,range:b.range,crit:critRate(sniperUnit(),team)}}
  if(special==="tank"){const b=tankStats();return{hp:b.hp,atk:0,cooldown:Infinity,move:b.move,range:b.range,crit:0}}
  if(special==="ninja"){const b=ninjaStats(),q=m<1?m:1;return{hp:Math.max(1,b.hp*q),atk:Math.max(1,b.atk*q),cooldown:1000/(b.speed*q),move:b.move*q,range:b.range*q,crit:0}}
  if(special==="warrior"){const b=warriorStats(),all=m<1?m:1,boost=m>1?m:1;return{hp:Math.max(1,b.hp*all*boost),atk:Math.max(1,b.atk*all*boost),cooldown:1000/(b.speed*all),move:b.move*all,range:b.range*all,crit:critRate(warriorUnit(),team)}}
  if(special==="meteor"){const b=realStats(u);return{hp:1,atk:15,cooldown:1000/b.speed,move:b.move*2,range:.1,crit:critRate(u,team)}}
  const b=calculatedStats(u,team==="player"),boost=k=>isStarUnit(u)?k==="move"?m:1:m<1?m:m===1?1:u.boost.includes(k)?m:1;
  return{hp:Math.max(1,b.hp*boost("hp")),atk:Math.max(1,b.atk*boost("atk")),cooldown:1000/(b.speed*boost("speed")),move:b.move*boost("move"),range:b.range*boost("range"),crit:critRate(u,team)};
}
function warriorAttack(s){const lost=1-clamp(s.hp/s.maxHp,0,1);return s.baseAtk*(1+2*lost*lost)}
function updateWarriorAttack(s){
  if(!s.warrior)return;s.atk=warriorAttack(s);
  const l=s.core.querySelector(".warrior-atk");if(l)l.textContent=attackText(s.atk);
}
function randomEnemy(total){
  const u=blankUnit();let left=total,k=["hp","move","speed","atk","range"];
  while(left--){const a=k.filter(x=>u.points[x]<MAX_ALLOC);if(!a.length)break;u.points[a[Math.floor(Math.random()*a.length)]]++}
  return u;
}

function miniShape(mini,core,u){
  const shape=unitShape(u);
  Object.assign(mini.style,{width:"15px",height:"15px",borderRadius:"50%",clipPath:"none"});
  core.style.borderRadius="50%";core.style.clipPath="none";
  if(shape==="wall"){mini.style.width="18px";mini.style.height="12px";mini.style.borderRadius="3px";core.style.borderRadius="2px"}
  if(shape==="tank"){mini.style.width="21px";mini.style.height="12px";mini.style.borderRadius=core.style.borderRadius="0";mini.style.clipPath="polygon(0 0,100% 0,92% 58%,50% 100%,8% 58%)";core.style.clipPath="polygon(5% 7%,95% 7%,87% 58%,50% 92%,13% 58%)"}
  if(shape==="triangle"){mini.style.borderRadius=core.style.borderRadius="0";mini.style.clipPath="polygon(50% 0,100% 100%,0 100%)";core.style.clipPath="polygon(50% 7%,93% 93%,7% 93%)"}
  if(shape==="star"){mini.style.width=mini.style.height="16px";mini.style.borderRadius=core.style.borderRadius="0";mini.style.clipPath="polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 92%,50% 70%,21% 92%,32% 57%,2% 35%,39% 35%)";core.style.clipPath="polygon(50% 7%,59% 38%,90% 38%,65% 57%,74% 86%,50% 68%,26% 86%,35% 57%,10% 38%,41% 38%)"}
  if(shape==="ninja"){mini.style.width=mini.style.height="17px";mini.style.borderRadius=core.style.borderRadius="0";mini.style.clipPath="polygon(50% 0,62% 36%,100% 50%,62% 64%,50% 100%,38% 64%,0 50%,38% 36%)";core.style.clipPath="polygon(50% 7%,60% 39%,93% 50%,60% 61%,50% 93%,40% 61%,7% 50%,40% 39%)"}
  if(shape==="warrior"){mini.style.width=mini.style.height="17px";mini.style.borderRadius=core.style.borderRadius="0";mini.style.clipPath="polygon(43% 0,57% 0,61% 14%,78% 21%,91% 38%,88% 82%,72% 100%,28% 100%,12% 82%,9% 38%,22% 21%,39% 14%)";core.style.clipPath="polygon(44% 7%,56% 7%,59% 19%,74% 26%,84% 41%,81% 77%,68% 92%,32% 92%,19% 77%,16% 41%,26% 26%,41% 19%)"}
}
function playerCount(i){return soldiers.filter(s=>s.team==="player"&&s.unitIndex===i&&s.hp>0).length}
function renderPlayerCounters(){
  $$(".unit-count").forEach((el,i)=>{
    const n=playerCount(i),u=savedUnits[i],sniper=isSniperRecipe(u),tank=isTankRecipe(u),ninja=isNinjaRecipe(u),warrior=isWarriorRecipe(u);
    el.innerHTML="";
    const symbol=document.createElement("span"),mini=document.createElement("span"),core=document.createElement("span"),value=document.createElement("span");
    symbol.className="unit-count-symbol";symbol.textContent=unitSymbols[i];mini.className="unit-count-mini";core.className="unit-count-mini-core";
    core.style.backgroundColor=ninja?"#080808":unitColors[i];mini.append(core);
    if(sniper){mini.style.width="18px";mini.style.height="15px";mini.style.borderRadius="0";mini.style.clipPath="polygon(25% 0,75% 0,75% 28%,100% 28%,100% 100%,0 100%,0 28%,25% 28%)";core.style.clipPath="polygon(29% 7%,71% 7%,71% 34%,93% 34%,93% 93%,7% 93%,7% 34%,29% 34%)"}else miniShape(mini,core,u);
    if(tank)addTankCross(core);
    if(ninja){core.textContent="忍";Object.assign(core.style,{color:"#fff",fontSize:"7px",fontWeight:"900",display:"flex",alignItems:"center",justifyContent:"center"})}
    if(warrior){const slit=document.createElement("span");Object.assign(slit.style,{width:"55%",height:"3px",background:"#080808",display:"block",margin:"6px auto 0"});core.append(slit)}
    const used=sniperUsed&&sniperUsedIndex===i;value.className="unit-count-value";value.textContent=used?"USED":sniper?"1":`${n}/3`;
    el.append(symbol,mini,value);el.classList.toggle("full",(!sniper&&n>=3)||used);el.classList.toggle("used",used);
  });
}

function resetBattleTracking(){
  playerDeaths=playerDeployCount=0;deployedColors=new Set();chargeTypes=new Set();
  ordinaryDeployed=enemyTowerHit=enemyTowerNonMeteorHit=false;
}
function prepareBattle(){
  stopBattle();showScreen("#battleScreen");$("#resultScreen").classList.add("hidden-screen");
  soldiers=[];projectiles=[];$$(".soldier,.projectile,.spawn-effect,.charge-label,.sponsor-burst,.critical-hit").forEach(e=>e.remove());
  playerHP=enemyHP=100;playerDeployedPoints=enemyDeployedPoints=0;timeLeft=battleDuration;rareStarSpawned=enemyDestroyed=false;sniperUsed=false;sniperUsedIndex=-1;resetBattleTracking();
  $("#playerHP").textContent="100";$("#timerLabel").textContent=battleDuration.toFixed(1);$("#battleState").textContent="READY";
  $("#playerTower").classList.remove("destroyed");$("#playerSponsor").classList.remove("revealed");$("#enemySponsor").classList.remove("revealed");
  resetBrickTower();
  updateEnemyTower();updateCounters();$("#startScreen").classList.remove("hidden-screen");
}
$("#startButton").addEventListener("click",startBattle);
function startBattle(){
  if(battleRunning)return;$("#startScreen").classList.add("hidden-screen");battleRunning=true;battleFinished=false;globalThis.LabMetrics?.start({mode:currentDifficulty});
  battleAudio.unlock().then(()=>{if(battleRunning)battleAudio.play("start")});
  lastFrame=performance.now();battleStartTime=starCheckTime=lastFrame;enemyNextSpawn=lastFrame+1000;
  $("#battleState").textContent=currentDifficulty.toUpperCase()+" / "+battleDuration+"秒";rafId=requestAnimationFrame(loop);
}
function stopBattle(){globalThis.LabMetrics?.end();
  battleAudio.stop();
  battleRunning=false;if(rafId)cancelAnimationFrame(rafId);rafId=0;
  if(charge){charge.effect?.remove();charge.label?.remove()}charge=null;
}
function scheduleEnemy(now){const d=difficulty[currentDifficulty];enemyNextSpawn=now+rand(d.spawnMin,d.spawnMax)}
function enemyLiving(){return soldiers.filter(s=>s.team==="enemy"&&!s.rare&&s.hp>0).length}
const EXTRA_SPECIAL_TYPES=["star","sniper","tank","ninja","warrior","meteor"];
function extraSpecialEnemy(){
  const special=EXTRA_SPECIAL_TYPES[randInt(0,EXTRA_SPECIAL_TYPES.length-1)];
  const u=blankUnit();
  if(special==="star"||special==="meteor"){u.points.move=100;u.boost=["move"]}
  else if(special==="tank"){u.points.hp=99;u.points.move=1;u.boost=["hp","move"]}
  else if(special==="ninja"){u.points.move=u.points.speed=u.points.atk=29}
  else if(special==="warrior"){u.points.hp=1;u.points.range=4;u.boost=["hp","atk"]}
  // Existing battle forms, with the same score cost as player deployment.
  return{special,unit:special==="sniper"?sniperUnit():u,cost:{star:25,sniper:209,tank:200,ninja:200,warrior:150,meteor:25}[special]};
}
function spawnEnemy(){
  const d=difficulty[currentDifficulty];if(enemyLiving()>=d.cap)return;
  if(d.specialChance&&Math.random()<d.specialChance){
    const e=extraSpecialEnemy();enemyDeployedPoints+=e.cost;
    spawnSoldier("enemy",e.unit,1,rand(35,game.clientWidth-35),ENEMY_SPAWN_Y,-1,false,e.special);updateCounters();return;
  }
  const total=randInt(d.min,d.max),u=randomEnemy(total);enemyDeployedPoints+=total;
  spawnSoldier("enemy",u,1,rand(35,game.clientWidth-35),ENEMY_SPAWN_Y,-1,false);updateCounters();
}

function swipeUnit(dx,dy){return Math.abs(dx)<30&&Math.abs(dy)<30?0:Math.abs(dx)>Math.abs(dy)?dx>0?2:4:dy<0?1:3}
function chargeMultiplier(s){return s<.5?0:s<1?.8:s<2?1:s<3?1.2:1.5}
function chargeFill(s){return s<.5?0:s<1?(s-.5)/.5:s<2?s-1:s<3?s-2:1}
function chargeSize(s){return s<.5?32:s<1?36:s<2?44:s<3?53:66}
function chargeType(s){return s>=3?"1.5":s>=2?"1.2":s>=1?"1.0":s>=.5?"0.8":""}
function playerSpawnY(){return game.clientHeight-150}
function chargeUnit(){return charge?swipeUnit(charge.lastX-charge.touchX,charge.lastY-charge.touchY):0}
function updateChargeVisual(){
  if(!charge)return;
  const sec=(performance.now()-charge.start)/1000,m=chargeMultiplier(sec),i=chargeUnit(),color=unitColors[i],size=chargeSize(sec),u=savedUnits[i];
  const sniper=isSniperRecipe(u),tank=isTankRecipe(u),ninja=isNinjaRecipe(u),warrior=isWarriorRecipe(u);
  charge.label.textContent=sniper?(sec>=3?"SNIPER":"LOCK"):tank?(sec>=3?"TANK":"LOCK"):ninja?(sec<.5?"HOLD":"NINJA"):warrior?(sec<.5?"HOLD":`WARRIOR ×${m.toFixed(1)}`):sec<.5?"HOLD":`×${m.toFixed(1)}`;
  charge.effect.style.width=charge.effect.style.height=`${size}px`;charge.effect.style.setProperty("--charge-color",color);charge.effect.style.setProperty("--charge-fill",`${chargeFill(sec)*100}%`);charge.effect.style.borderColor=color;
  charge.effect.style.boxShadow=sec>=3?`0 0 12px #fff,0 0 26px ${color},0 0 44px ${color}`:`0 0 8px #fff,0 0 18px ${color},0 0 30px ${color}`;
  charge.label.style.color=charge.label.style.borderColor=color;charge.label.style.textShadow=`0 0 8px ${color}`;
}
["touchmove","gesturestart","gesturechange"].forEach(t=>game.addEventListener(t,e=>e.preventDefault(),{passive:false}));
game.addEventListener("pointerdown",e=>{
  if(!battleRunning||battleFinished||e.target.closest("button"))return;e.preventDefault();
  const r=game.getBoundingClientRect(),touchX=e.clientX-r.left,touchY=e.clientY-r.top,spawnX=clamp(touchX,35,game.clientWidth-35),spawnY=playerSpawnY();
  const effect=document.createElement("div"),label=document.createElement("div");effect.className="spawn-effect";effect.style.left=`${spawnX}px`;effect.style.top=`${spawnY}px`;
  label.className="charge-label";label.style.left=`${clamp(touchX,40,game.clientWidth-40)}px`;label.style.top=`${clamp(touchY-70,35,game.clientHeight-35)}px`;game.append(effect,label);
  charge={id:e.pointerId,start:performance.now(),touchX,touchY,lastX:touchX,lastY:touchY,spawnX,spawnY,effect,label};game.setPointerCapture?.(e.pointerId);updateChargeVisual();
});
game.addEventListener("pointermove",e=>{
  if(!charge||charge.id!==e.pointerId)return;e.preventDefault();const r=game.getBoundingClientRect();
  charge.lastX=e.clientX-r.left;charge.lastY=e.clientY-r.top;updateChargeVisual();
});
function recordDeployment(index,type,special){
  playerDeployCount++;deployedColors.add(index);chargeTypes.add(type);if(!special)ordinaryDeployed=true;
}
function endCharge(e){
  if(!charge||charge.id!==e.pointerId)return;
  const c=charge,index=chargeUnit();charge=null;c.effect.remove();c.label.remove();
  if(!battleRunning||battleFinished||sniperUsed&&sniperUsedIndex===index)return;
  const sec=(performance.now()-c.start)/1000,m=chargeMultiplier(sec);if(!m)return;
  const u=savedUnits[index],type=chargeType(sec);
  if(isSniperRecipe(u)){
    if(sec<3||sniperUsed)return;if(playerCount(index)>=3){showUnitLimit();return}
    sniperUsed=true;sniperUsedIndex=index;playerDeployedPoints+=209;recordDeployment(index,"1.5","sniper");
    spawnSoldier("player",sniperUnit(),1,c.spawnX,c.spawnY,index,false,"sniper");updateCounters();return;
  }
  if(isTankRecipe(u)){
    if(sec<3)return;if(playerCount(index)>=3){showUnitLimit();return}
    playerDeployedPoints+=200;recordDeployment(index,"1.5","tank");spawnSoldier("player",u,1,c.spawnX,c.spawnY,index,false,"tank");updateCounters();return;
  }
  if(playerCount(index)>=3){showUnitLimit();return}
  if(isNinjaRecipe(u)){playerDeployedPoints+=200;recordDeployment(index,type,"ninja");spawnSoldier("player",u,m,c.spawnX,c.spawnY,index,false,"ninja");updateCounters();return}
  if(isWarriorRecipe(u)){playerDeployedPoints+=150;recordDeployment(index,type,"warrior");spawnSoldier("player",u,m,c.spawnX,c.spawnY,index,false,"warrior");updateCounters();return}
  if(isStarUnit(u)){
    const meteor=sec>=3;playerDeployedPoints+=25;recordDeployment(index,type,meteor?"meteor":"star");if(meteor)unlockMedal("meteor");
    spawnSoldier("player",u,m,c.spawnX,c.spawnY,index,false,meteor?"meteor":"");updateCounters();return;
  }
  playerDeployedPoints+=sumPoints(u);recordDeployment(index,type,"");spawnSoldier("player",u,m,c.spawnX,c.spawnY,index,false);updateCounters();
}
game.addEventListener("pointerup",endCharge);game.addEventListener("pointercancel",endCharge);
function showUnitLimit(){
  const el=$("#unitLimitMessage");el.classList.remove("hidden-screen");clearTimeout(showUnitLimit.t);
  showUnitLimit.t=setTimeout(()=>el.classList.add("hidden-screen"),700);
}

function spawnSoldier(team,unit,multiplier,x,y,unitIndex=-1,rare=false,special=""){
  if(team==="player")battleAudio.play("deploy");
  const st=unitStats(unit,multiplier,team,special),el=document.createElement("div"),core=document.createElement("div");
  el.className=`soldier${special?` ${special}`:""}`;core.className="soldier-core";el.append(core);game.append(el);
  const size=clamp(38+st.hp*.14,40,68);el.style.width=el.style.height=`${size}px`;
  core.style.backgroundColor=special==="ninja"?"#080808":team==="player"?unitColors[unitIndex]:"#303238";
  const shape=special==="sniper"?"sniper":special==="tank"?"tank":special==="ninja"?"ninja":special==="warrior"?"warrior":unitShape(unit);
  applyBattleShape(el,core,shape);
  if(special==="sniper")core.textContent="";else if(special==="tank")addTankCross(core);else if(special==="ninja")addNinjaMark(core);else if(special==="warrior")addWarriorSlit(core,st.atk);else fitAttackText(core,size,st.atk,shape);
  const s={team,unit,unitIndex,rare,special,meteor:special==="meteor",sniper:special==="sniper",tank:special==="tank",ninja:special==="ninja",warrior:special==="warrior",shape,x,y,hp:st.hp,maxHp:st.hp,atk:st.atk,baseAtk:st.atk,move:st.move,range:st.range,crit:st.crit,cooldown:st.cooldown,lastAttack:0,stunnedUntil:0,deathCounted:false,width:parseFloat(el.style.width),height:parseFloat(el.style.height),el,core};
  soldiers.push(s);renderSoldier(s);
}
function applyBattleShape(el,core,shape){
  el.style.borderRadius=core.style.borderRadius="50%";el.style.clipPath=core.style.clipPath="none";
  if(shape==="wall"){const w=parseFloat(el.style.width);el.style.width=`${w*1.35}px`;el.style.height=`${w*.85}px`;el.style.borderRadius="7px";core.style.borderRadius="4px"}
  if(shape==="tank"){const w=parseFloat(el.style.width);el.style.width=`${w*1.65}px`;el.style.height=`${w*.85}px`;el.style.borderRadius=core.style.borderRadius="0";el.style.clipPath="polygon(0 0,100% 0,92% 58%,50% 100%,8% 58%)";core.style.clipPath="polygon(4% 6%,96% 6%,88% 58%,50% 93%,12% 58%)"}
  if(shape==="triangle"){el.style.borderRadius=core.style.borderRadius="0";el.style.clipPath="polygon(50% 0,100% 100%,0 100%)";core.style.clipPath="polygon(50% 6%,94% 94%,6% 94%)"}
  if(shape==="star"){el.style.borderRadius=core.style.borderRadius="0";el.style.clipPath="polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 92%,50% 70%,21% 92%,32% 57%,2% 35%,39% 35%)";core.style.clipPath="polygon(50% 6%,59% 38%,91% 38%,65% 57%,75% 87%,50% 68%,25% 87%,35% 57%,9% 38%,41% 38%)"}
  if(shape==="sniper"){el.style.borderRadius=core.style.borderRadius="0";el.style.clipPath="polygon(25% 0,75% 0,75% 28%,100% 28%,100% 100%,0 100%,0 28%,25% 28%)";core.style.clipPath="polygon(29% 7%,71% 7%,71% 34%,93% 34%,93% 93%,7% 93%,7% 34%,29% 34%)"}
  if(shape==="ninja"){el.style.borderRadius=core.style.borderRadius="0";el.style.clipPath="polygon(50% 0,62% 36%,100% 50%,62% 64%,50% 100%,38% 64%,0 50%,38% 36%)";core.style.clipPath="polygon(50% 7%,60% 39%,93% 50%,60% 61%,50% 93%,40% 61%,7% 50%,40% 39%)"}
  if(shape==="warrior"){el.style.borderRadius=core.style.borderRadius="0";el.style.clipPath="polygon(43% 0,57% 0,61% 14%,78% 21%,91% 38%,88% 82%,72% 100%,28% 100%,12% 82%,9% 38%,22% 21%,39% 14%)";core.style.clipPath="polygon(44% 7%,56% 7%,59% 19%,74% 26%,84% 41%,81% 77%,68% 92%,32% 92%,19% 77%,16% 41%,26% 26%,41% 19%)"}
}
function renderSoldier(s){
  if(s.warrior)updateWarriorAttack(s);s.el.style.left=`${s.x}px`;s.el.style.top=`${s.y}px`;
  s.el.style.setProperty("--hp",`${clamp(s.hp/s.maxHp*100,0,100)}%`);
}

const SHAPE_POLYGONS={
  triangle:[[.5,0],[1,1],[0,1]],
  star:[[.5,0],[.61,.35],[.98,.35],[.68,.57],[.79,.92],[.5,.7],[.21,.92],[.32,.57],[.02,.35],[.39,.35]],
  sniper:[[.25,0],[.75,0],[.75,.28],[1,.28],[1,1],[0,1],[0,.28],[.25,.28]],
  tank:[[0,0],[1,0],[.92,.58],[.5,1],[.08,.58]],
  ninja:[[.5,0],[.62,.36],[1,.5],[.62,.64],[.5,1],[.38,.64],[0,.5],[.38,.36]],
  warrior:[[.43,0],[.57,0],[.61,.14],[.78,.21],[.91,.38],[.88,.82],[.72,1],[.28,1],[.12,.82],[.09,.38],[.22,.21],[.39,.14]]
};
function pointSegmentDistance(px,py,ax,ay,bx,by){
  const vx=bx-ax,vy=by-ay,len=vx*vx+vy*vy,t=len?clamp(((px-ax)*vx+(py-ay)*vy)/len,0,1):0;
  return Math.hypot(px-(ax+vx*t),py-(ay+vy*t));
}
function polygonDistance(px,py,t,poly){
  const left=t.x-t.width/2,top=t.y-t.height/2;let inside=false,best=Infinity;
  for(let i=0,j=poly.length-1;i<poly.length;j=i++){
    const a=poly[i],b=poly[j],ax=left+a[0]*t.width,ay=top+a[1]*t.height,bx=left+b[0]*t.width,by=top+b[1]*t.height;
    if((ay>py)!==(by>py)&&px<(bx-ax)*(py-ay)/(by-ay)+ax)inside=!inside;
    best=Math.min(best,pointSegmentDistance(px,py,ax,ay,bx,by));
  }
  return inside?0:best;
}
function targetDistance(a,t){
  const dx=a.x-t.x,dy=a.y-t.y;
  if(t.shape==="wall")return Math.hypot(Math.max(Math.abs(dx)-t.width/2,0),Math.max(Math.abs(dy)-t.height/2,0));
  const poly=SHAPE_POLYGONS[t.shape];return poly?polygonDistance(a.x,a.y,t,poly):Math.max(0,Math.hypot(dx,dy)-t.width/2);
}
function towerDistance(s,t){return Math.hypot(Math.max(Math.abs(s.x-t.x)-t.width/2,0),Math.max(Math.abs(s.y-t.y)-t.height/2,0))}
function nearestEnemy(s){
  let best=null,bestD=Infinity;
  for(const t of soldiers){
    if(t.team===s.team||t.hp<=0)continue;
    const d=targetDistance(s,t);if((s.ninja||d<=s.range*SEARCH_RATE)&&d<bestD){bestD=d;best=t}
  }
  return{target:best,distance:bestD};
}
function towerTarget(s){
  return s.team==="player"
    ?{type:"tower",team:"enemy",x:game.clientWidth/2,y:92,width:Math.min(game.clientWidth*.82,320),height:72}
    :{type:"tower",team:"player",x:game.clientWidth/2,y:game.clientHeight-73,width:132,height:62};
}
function terrainSpeed(s){
  if(!(s.y+2>MOAT_START_Y&&s.y-2<MOAT_END_Y))return 1;
  const c=game.clientWidth/2;return s.x>=c-50&&s.x<=c+50?1:MOAT_SPEED;
}

function attack(s,target,now){
  if(s.atk<=0||now-s.lastAttack<s.cooldown)return;if(s.warrior)updateWarriorAttack(s);
  s.lastAttack=now;spawnProjectile(s,target,Math.random()*100<s.crit);if(s.meteor)s.hp=0;
}
function spawnProjectile(from,target,critical){
  battleAudio.play("shot",from.team==="enemy");
  const el=document.createElement("div");el.className=critical?"projectile critical":"projectile";
  if(!critical)el.style.background=from.team==="player"?"#8bc7ff":"#ff7070";game.append(el);
  projectiles.push({team:from.team,sourceSpecial:from.special||"",x:from.x,y:from.y,target,damage:critical?from.atk*CRIT_DAMAGE:from.atk,critical,el});
}
function updateSoldiers(dt,now){
  for(const s of soldiers){
    if(s.hp<=0)continue;
    if(now<s.stunnedUntil){s.el.classList.add("stunned");continue}s.el.classList.remove("stunned");
    let target,distance;
    if(s.meteor){target=towerTarget(s);distance=towerDistance(s,target)}
    else{
      const e=nearestEnemy(s);
      if(e.target){target=e.target;distance=e.distance}else if(s.ninja)continue;else{target=towerTarget(s);distance=towerDistance(s,target)}
    }
    if(distance<=s.range){attack(s,target,now);continue}
    const dx=target.x-s.x,dy=target.y-s.y,len=Math.hypot(dx,dy)||1,speed=s.move*terrainSpeed(s)*dt*60;
    s.x+=dx/len*speed;s.y+=dy/len*speed;renderSoldier(s);
  }
  soldiers.forEach(s=>{
    if(s.hp>0)return;
    if(s.team==="player"&&!s.deathCounted){s.deathCounted=true;playerDeaths++}
    s.el.remove();
  });
  soldiers=soldiers.filter(s=>s.hp>0);
}
function updateProjectiles(dt){
  const speed=300;
  for(const p of projectiles){
    let tx,ty;
    if(p.target.type==="tower"){tx=p.target.x;ty=p.target.y}else{if(p.target.hp<=0){p.dead=true;continue}tx=p.target.x;ty=p.target.y}
    const dx=tx-p.x,dy=ty-p.y,d=Math.hypot(dx,dy)||1,step=speed*dt;
    if(d<=step+5){hitProjectile(p,tx,ty);p.dead=true;continue}
    p.x+=dx/d*step;p.y+=dy/d*step;p.el.style.left=`${p.x}px`;p.el.style.top=`${p.y}px`;
  }
  projectiles.forEach(p=>{if(p.dead)p.el.remove()});projectiles=projectiles.filter(p=>!p.dead);
}
function hitProjectile(p,x,y){
  if(p.target.type!=="tower"&&p.target.ninja&&Math.random()>=.15)return;
  if(p.critical)showCriticalHit(x,y);
  if(p.target.type==="tower"){
    if(p.target.team==="enemy"){enemyTowerHit=true;if(p.sourceSpecial!=="meteor")enemyTowerNonMeteorHit=true;damageEnemyTower(p.damage)}
    else damagePlayerTower(p.damage);
    return;
  }
  p.target.hp=Math.max(0,p.target.hp-p.damage);
  if(p.critical&&p.target.hp>0){const now=performance.now();p.target.stunnedUntil=now+STUN_TIME;p.target.lastAttack=p.target.stunnedUntil;p.target.el.classList.add("stunned")}
  renderSoldier(p.target);
}
function showCriticalHit(x,y){
  battleAudio.play("critical");
  const el=document.createElement("div");el.className="critical-hit";el.style.left=`${x}px`;el.style.top=`${y}px`;game.append(el);setTimeout(()=>el.remove(),300);
}

function damageEnemyTower(dmg){
  if(battleFinished)return;enemyHP=Math.max(0,enemyHP-dmg);updateEnemyTower();if(enemyHP<=0)finishBattle("win");
}
function damagePlayerTower(dmg){
  if(battleFinished)return;playerHP=Math.max(0,playerHP-dmg);$("#playerHP").textContent=Math.ceil(playerHP);
  if(playerHP<=0){$("#playerTower").classList.add("destroyed");$("#playerSponsor").classList.add("revealed");finishBattle("loss")}
}
function updateEnemyTower(){
  const hp=clamp(enemyHP,0,100);$("#enemyHpFrame").style.background=`conic-gradient(#fff ${hp}%,rgba(255,255,255,.12) ${hp}%)`;
  const broken=hp>0?Math.min(fortressBricks.length-1,Math.floor((100-hp)/100*fortressBricks.length)):fortressBricks.length;
  let budget=broken-fortressBricks.filter(b=>b.broken).length;
  while(budget>0){const cluster=chooseBrickCluster(Math.min(budget,2+Math.floor(brickRandom()*4)));if(!cluster.length)break;cluster.forEach((b,i)=>dropTowerBrick(b,hp<=0?brickRange(0,.16):i*.018));budget-=cluster.length}
  if(hp<=0&&!enemyDestroyed){
    enemyDestroyed=true;$("#enemyTower").classList.add("tower-cleared");
    const generation=towerGeneration;
    towerRevealTimer=setTimeout(()=>{if(generation!==towerGeneration)return;$("#enemySponsor").classList.add("revealed");const burst=document.createElement("div");burst.className="sponsor-burst";$("#enemyTower").append(burst);setTimeout(()=>burst.remove(),1000)},420);
  }
}
function resetBrickTower(){
  towerGeneration++;clearTimeout(towerRevealTimer);$("#enemyTower").classList.remove("tower-cleared");
  const wall=$("#enemyBrickWall"),debris=$("#towerDebris");wall.replaceChildren();debris.replaceChildren();fortressBricks=[];
  const cols=14,rows=7;
  for(let row=0;row<rows;row++)for(let col=0;col<cols+(row%2);col++){
    const left=Math.max(0,(col-(row%2)*.5)/cols),right=Math.min(1,(col+1-(row%2)*.5)/cols);
    const el=document.createElement("div");el.className="tower-brick";el.style.left=left*100+"%";el.style.top=row/rows*100+"%";el.style.width=(right-left)*100+"%";el.style.height=100/rows+"%";
    el.style.setProperty("--brick-tone",String(.86+brickRandom()*.26));wall.append(el);
    fortressBricks.push({el,left,right,row,broken:false,neighbors:[]});
  }
  fortressBricks.forEach(b=>b.neighbors=fortressBricks.filter(n=>n!==b&&(n.row===b.row?(Math.abs(n.left-b.right)<.00001||Math.abs(n.right-b.left)<.00001):Math.abs(n.row-b.row)===1&&Math.min(n.right,b.right)-Math.max(n.left,b.left)>.00001)));
}
function chooseBrickCluster(size){
  const intact=fortressBricks.filter(b=>!b.broken);if(!intact.length)return[];
  const selected=[intact[Math.floor(brickRandom()*intact.length)]];
  while(selected.length<size){const edge=[...new Set(selected.flatMap(b=>b.neighbors).filter(b=>!b.broken&&!selected.includes(b)))];if(!edge.length)break;selected.push(edge[Math.floor(brickRandom()*edge.length)])}
  return selected;
}
function dropTowerBrick(b,delay=0){
  if(b.broken)return;b.broken=true;b.el.classList.add("brick-missing");
  if(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches)return;
  const layer=$("#towerDebris");if(layer.childElementCount>=110)return;
  const chip=b.el.cloneNode(false);chip.className="tower-brick brick-debris";
  chip.style.setProperty("--chip-x",brickRange(-55,55)+"px");chip.style.setProperty("--chip-lift",brickRange(-18,-4)+"px");chip.style.setProperty("--chip-fall",brickRange(95,160)+"px");chip.style.setProperty("--chip-spin",brickRange(-240,240)+"deg");chip.style.animationDelay=delay+"s";
  layer.append(chip);chip.addEventListener("animationend",()=>chip.remove(),{once:true});setTimeout(()=>chip.remove(),1300);
}
function updateCounters(){
  $("#enemyCountDisplay").textContent=`ENEMY ${soldiers.filter(s=>s.team==="enemy"&&s.hp>0).length}`;renderPlayerCounters();
}

function rareStarCheck(now){
  if(rareStarSpawned||now-starCheckTime<1000)return;starCheckTime=now;if(Math.random()>=STAR_CHANCE)return;
  const u=blankUnit();u.points.move=100;u.boost=["move"];rareStarSpawned=true;enemyDeployedPoints+=25;
  spawnSoldier("enemy",u,1,rand(35,game.clientWidth-35),ENEMY_SPAWN_Y,-1,true);unlockMedal("lucky");updateCounters();
}

function scoreData(){
  const playerTowerHP=clamp(playerHP,0,100),enemyTowerHP=clamp(enemyHP,0,100),seconds=Math.max(0,timeLeft);
  const ratio=playerDeployedPoints>0?enemyDeployedPoints/playerDeployedPoints:0,powerScore=playerDeployedPoints>0?Math.min(ratio/1.2,1)*40:0;
  const playerHPScore=playerTowerHP/100*30,enemyTowerScore=(100-enemyTowerHP)/100*30,timeScore=seconds;
  return{powerScore,playerHPScore,enemyTowerScore,timeScore,score:powerScore+playerHPScore+enemyTowerScore+timeScore,playerTowerHP,enemyTowerHP};
}
function displayedScore(s){return Math.round(s*10)/10}
function rankFromScore(score){const s=displayedScore(score);return s>100?"S":s>=90?"A":s>=80?"B":s>=60?"C":"D"}
function rankRule(r){return r==="S"?"100.1点以上 → RANK S":r==="A"?"90.0〜100.0点 → RANK A":r==="B"?"80.0〜89.9点 → RANK B":r==="C"?"60.0〜79.9点 → RANK C":"60.0点未満 → RANK D"}

function evaluateBattleMedals(result,r,rank){
  if(rank==="S"&&isInitialDeck())unlockMedal("initialDeckS");
  if(result==="win"){
    unlockMedal(currentDifficulty+"Win");if(rank==="S")unlockMedal(timedSMedalId(currentDifficulty,battleDuration));
    if(!soldiers.some(s=>s.team==="enemy"&&s.hp>0))unlockMedal("allClear");
    if(playerDeaths===0)unlockMedal("elite");
    const living=new Set(soldiers.filter(s=>s.team==="player"&&s.hp>0&&s.unitIndex>=0).map(s=>s.unitIndex));
    if([0,1,2,3,4].every(i=>living.has(i)))unlockMedal("allColors");
    if(playerDeployCount&&deployedColors.size===1)unlockMedal("singleColor");
    if(playerDeployCount&&chargeTypes.size===1&&chargeTypes.has("0.8"))unlockMedal("rush");
    if(playerDeployCount&&chargeTypes.size===1&&chargeTypes.has("1.5"))unlockMedal("aged");
    if(enemyTowerHit&&!enemyTowerNonMeteorHit)unlockMedal("meteorOnly");
    if(rank==="S"&&playerDeployCount&&!ordinaryDeployed)unlockMedal("heroes");
  }
  if(result==="draw"&&r.playerTowerHP===100&&r.enemyTowerHP===100)unlockMedal("peace");
  if(result==="draw"&&playerDeaths>=20)unlockMedal("desperate");
}

function rankedResult(result,r){
  const rank=rankFromScore(r.score),total=displayedScore(r.score);$("#resultTitle").textContent=result==="draw"?"DRAW":"VICTORY";
  $("#resultScore").innerHTML=`
    <div class="result-rank">RANK <strong>${rank}</strong></div>
    <div class="result-summary">
      <div class="result-summary-item"><span>自軍戦力</span><strong>${playerDeployedPoints}</strong></div>
      <div class="result-summary-item"><span>敵戦力</span><strong>${enemyDeployedPoints}</strong></div>
      <div class="result-summary-item"><span>残HP</span><strong>${r.playerTowerHP.toFixed(1)}</strong></div>
      <div class="result-summary-item"><span>残時間</span><strong>${r.timeScore.toFixed(1)}秒</strong></div>
    </div>
    <div class="result-evaluation">
      <div class="result-evaluation-row"><span>戦力比評価</span><strong>${r.powerScore.toFixed(1)} / 40.0</strong></div>
      <div class="result-evaluation-row"><span>自軍HP評価</span><strong>${r.playerHPScore.toFixed(1)} / 30.0</strong></div>
      <div class="result-evaluation-row"><span>敵城評価</span><strong>${r.enemyTowerScore.toFixed(1)} / 30.0</strong></div>
      <div class="result-evaluation-row"><span>残時間</span><strong>+ ${r.timeScore.toFixed(1)}</strong></div>
    </div>
    <div class="result-calculation"><div class="result-total">TOTAL ${total.toFixed(1)}</div><div class="result-rank-rule">${rankRule(rank)}</div></div>`;
  return rank;
}
function finishBattle(result){
  if(battleFinished)return;globalThis.LabMetrics?.end(result==='win'?'clear':'fail');battleFinished=true;battleRunning=false;if(rafId)cancelAnimationFrame(rafId);rafId=0;
  battleAudio.play(result);
  let mode=$('#resultMode');if(!mode){mode=document.createElement('div');mode.id='resultMode';$('#resultTitle').before(mode)}mode.textContent=currentDifficulty.toUpperCase()+' / '+battleDuration+'秒';
  const r=scoreData();let rank="E";
  if(result==="loss"){
    $("#resultTitle").textContent="DEFEAT";
    $("#resultScore").innerHTML=`
      <div class="result-rank">RANK <strong>E</strong></div>
      <div class="result-summary">
        <div class="result-summary-item"><span>自軍戦力</span><strong>${playerDeployedPoints}</strong></div>
        <div class="result-summary-item"><span>敵戦力</span><strong>${enemyDeployedPoints}</strong></div>
        <div class="result-summary-item"><span>残HP</span><strong>${r.playerTowerHP.toFixed(1)}</strong></div>
        <div class="result-summary-item"><span>敵城HP</span><strong>${r.enemyTowerHP.toFixed(1)}</strong></div>
      </div>
      <div class="result-calculation"><div class="result-total">RANK E</div><div class="result-rank-rule">PLAYER TOWER DESTROYED</div></div>`;
  }else rank=rankedResult(result,r);
  evaluateBattleMedals(result,r,rank);
  prepareResultShare(result,r,rank);
  setTimeout(()=>$("#resultScreen").classList.remove("hidden-screen"),result==="win"?1300:result==="loss"?1900:500);
}
$("#retryButton").addEventListener("click",()=>{$("#resultScreen").classList.add("hidden-screen");prepareBattle();startBattle()});

// Pre-render before the tap so iOS user activation survives when opening Share.

// Sharing: configure the final public URL after publishing.
const GAME_SHARE_URL = 'https://tsubasarock21.github.io/games/Form_Clash/';
const GameShare=(()=>{
 let busy=false;
 function url(){for(const raw of [GAME_SHARE_URL,globalThis.GAME_PUBLIC_URL,document.querySelector('link[rel="canonical"]')?.href,location.href]){if(!raw)continue;try{const u=new URL(raw,location.href);if(!/^https?:$/.test(u.protocol)||/^(localhost|127\.0\.0\.1)$/.test(u.hostname)||/(^|\.)(cdpn\.io|codepen\.io|codepenassets\.com)$/.test(u.hostname))continue;u.search='';u.hash='';return u.href}catch{}}return ''}
 function build(body,tags){return [body,url(),tags.map(t=>'#'+t).join(' ')].filter(Boolean).join('\n')}
 function note(){return '共有先を選べます。対応していない場合は文章をコピーします。'}
 function manualCopy(text,status){
  const oldFocus=document.activeElement,panel=document.createElement('dialog');panel.setAttribute('aria-label','シェアする文章');panel.style.cssText='position:fixed;inset:0;margin:auto;width:min(90vw,420px);max-height:85dvh;overflow:auto;z-index:9999;background:#fffaf0;color:#18382f;border:2px solid #54796b;border-radius:14px;padding:20px;font:14px sans-serif;touch-action:auto;';
  const label=document.createElement('p');label.textContent='文章をコピーして、好きなアプリに貼り付けてください。';
  const field=document.createElement('textarea');field.readOnly=true;field.value=text;field.setAttribute('aria-label','シェア用文章');field.style.cssText='display:block;width:100%;min-height:180px;font:14px sans-serif;color:#18382f;background:#fff;border:1px solid #a4b5aa;padding:10px;box-sizing:border-box;user-select:text;-webkit-user-select:text;touch-action:auto;';
  const copy=document.createElement('button');copy.textContent='文章をコピー';copy.style.cssText='min-height:44px;margin:12px 10px 0 0;padding:8px 14px;border-radius:8px;';
  const close=document.createElement('button');close.textContent='閉じる';close.style.cssText='min-height:44px;padding:8px 14px;border-radius:8px;';
  function remove(){panel.remove();oldFocus?.focus?.()}
  copy.onclick=async()=>{try{if(!navigator.clipboard?.writeText)throw Error('unavailable');await navigator.clipboard.writeText(text);copy.textContent='コピーしました';if(status)status.textContent='文章をコピーしました。好きなアプリに貼り付けられます。'}catch{field.focus();field.select();field.setSelectionRange(0,text.length);copy.textContent='文章を長押ししてコピー'}};
  close.onclick=remove;panel.addEventListener('cancel',e=>{e.preventDefault();remove()});panel.append(label,field,copy,close);document.body.append(panel);if(typeof panel.showModal==='function')panel.showModal();else panel.setAttribute('open','');field.focus();field.select();
 }
 async function share(text,{title=document.title,status=null}={}){
  if(!text||busy)return 'busy';busy=true;
  try{
   if(navigator.share){try{await navigator.share({title,text});if(status)status.textContent='共有操作が完了しました。';return 'shared'}catch(error){if(error?.name==='AbortError'){if(status)status.textContent='シェアをキャンセルしました。';return 'cancelled'}}}
   try{if(!navigator.clipboard?.writeText)throw Error('unavailable');await navigator.clipboard.writeText(text);if(status)status.textContent='文章をコピーしました。好きなアプリに貼り付けられます。';return 'copied'}catch{manualCopy(text,status);if(status)status.textContent='文章を長押ししてコピーできます。';return 'manual'}
  }finally{busy=false}
 }
 return {url,build,note,share};
})();globalThis.GameShare=GameShare;


// Upgrade older result markup before any sharing handlers are registered.
// v0.7.4 called the text button shareXButton; v0.7.3 had only the image button.
function ensureShareControls(){
  const root=$("#resultScreen");if(!root)return;
  let image=$("#shareResultButton"),button=$("#shareGameButton")||$("#shareXButton"),actions=root.querySelector(".result-share-actions");
  if(!actions){actions=document.createElement("div");actions.className="result-share-actions";root.insertBefore(actions,image||root.querySelector(".result-buttons"))}
  if(!button){button=document.createElement("button");button.disabled=true}
  button.id="shareGameButton";button.textContent="シェア";actions.prepend(button);
  if(!image){image=document.createElement("button");image.id="shareResultButton";image.disabled=true}
  image.textContent="編成画像を共有";actions.append(image);
  let status=$("#shareStatus");if(!status){status=document.createElement("div");status.id="shareStatus";actions.after(status)}status.setAttribute("role","status");status.setAttribute("aria-live","polite");
  if(!$("#shareFallback")){
    const dialog=document.createElement("dialog");dialog.id="shareFallback";dialog.setAttribute("aria-labelledby","shareFallbackTitle");
    dialog.innerHTML='<h2 id="shareFallbackTitle">バトル結果をシェア</h2><p>画像を保存するか、文章をコピーして共有できます。</p><img id="sharePreview" alt="バトル結果の編成画像" hidden><textarea id="shareText" readonly aria-label="共有する結果"></textarea><div><button id="copyShareText">結果テキストをコピー</button><a id="saveShareImage" download="form-clash-result.png" hidden>画像を保存</a><button id="closeShareFallback">閉じる</button></div>';document.body.append(dialog);
  }
  if(!$("#shareCompatibilityStyle")){const style=document.createElement("style");style.id="shareCompatibilityStyle";style.textContent='.result-share-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:14px}.result-share-actions>button{flex:1 1 140px;width:auto!important;margin:0!important;min-height:44px}#shareStatus{margin:10px 0;line-height:1.6}#shareFallback{max-width:min(90vw,620px)}#sharePreview{max-width:100%;height:auto}#shareText{box-sizing:border-box;width:100%;min-height:160px;user-select:text;-webkit-user-select:text}';document.head.append(style)}
}
ensureShareControls();
let resultShare=null,shareGeneration=0,shareObjectURL="",shareBusy=false;
function shareUnitStats(u){
  const id=specialId(u);
  return id==="sniper"?realStats(sniperUnit()):id==="tank"?tankStats():id==="ninja"?ninjaStats():id==="warrior"?warriorStats():realStats(u);
}
function drawShareUnit(ctx,u,i,x,y){
  const shape=unitShape(u),size=25;
  ctx.fillStyle=unitColors[i];ctx.strokeStyle="#e9f2ff";ctx.lineWidth=2;
  ctx.beginPath();
  if(shape==="star"){
    for(let k=0;k<10;k++){const a=-Math.PI/2+k*Math.PI/5,r=k%2?size*.45:size;const px=x+Math.cos(a)*r,py=y+Math.sin(a)*r;k?ctx.lineTo(px,py):ctx.moveTo(px,py)}ctx.closePath();
  }else if(shape==="triangle"){ctx.moveTo(x,y-size);ctx.lineTo(x+size,y+size);ctx.lineTo(x-size,y+size);ctx.closePath()}
  else if(["tank","wall","warrior"].includes(shape))ctx.rect(x-size,y-size*.75,size*2,size*1.5);
  else ctx.arc(x,y,size,0,Math.PI*2);
  ctx.fill();ctx.stroke();
  const mark=shape==="tank"?"✚":shape==="ninja"?"忍":shareUnitStats(u).atk.toFixed(1);
  ctx.fillStyle="#fff";ctx.font="bold 16px sans-serif";ctx.textAlign="center";ctx.fillText(mark,x,y+6);ctx.textAlign="left";
}
function createShareCanvas(data){
  const canvas=document.createElement("canvas");canvas.width=900;canvas.height=1160;
  const c=canvas.getContext("2d");if(!c)throw new Error("Canvas unavailable");
  const bg=c.createLinearGradient(0,0,900,1160);bg.addColorStop(0,"#152941");bg.addColorStop(1,"#080e18");c.fillStyle=bg;c.fillRect(0,0,900,1160);
  const text=(t,x,y,size=22,color="#edf4ff",weight="normal")=>{c.fillStyle=color;c.font=`${weight} ${size}px sans-serif`;c.fillText(t,x,y)};
  text("FORM CLASH",48,76,42,"#fff","bold");text(`プチキャラバトル  /  ${data.difficulty.toUpperCase()}  /  ${data.duration}秒  /  v0.8.6`,48,116,19,"#9bb0c9");
  text(data.title,48,198,58,data.result==="loss"?"#ff9c9c":"#80ceff","bold");
  text(`RANK ${data.rank}`,610,198,46,"#f4d883","bold");
  text(data.result==="loss"?"PLAYER TOWER DESTROYED":`TOTAL  ${data.total.toFixed(1)}`,48,251,30,"#fff","bold");
  text(`自軍戦力 ${data.playerPower}   /   敵戦力 ${data.enemyPower}`,48,300,24);
  text(`自軍HP ${data.hp.toFixed(1)}   /   敵城HP ${data.enemyHP.toFixed(1)}`,48,338,24);
  text("MY LINEUP",48,404,24,"#9bb0c9","bold");
  text("能力値：チャージ倍率適用前",480,404,19,"#9bb0c9");
  data.units.forEach((u,i)=>{
    const top=428+i*126,s=shareUnitStats(u),special=specialId(u);
    c.fillStyle="#172538";c.fillRect(36,top,828,114);c.fillStyle=unitColors[i];c.fillRect(36,top,5,114);
    drawShareUnit(c,u,i,81,top+43);
    text(`UNIT 0${i+1}${special?" / "+special.toUpperCase():""}`,125,top+29,21,"#fff","bold");
    text(`HP ${s.hp.toFixed(1)}   MOVE ${s.move.toFixed(3)}   SPD ${s.speed.toFixed(3)}/s`,125,top+59,19);
    text(`ATK ${s.atk.toFixed(1)}   RANGE ${s.range.toFixed(1)}`,125,top+85,19);
    text(`BOOST  ${u.boost.map(k=>({hp:"HP",move:"MOVE",speed:"SPD",atk:"ATK",range:"RANGE"})[k]).join(" + ")||"NONE"}`,125,top+107,16,"#a9bfd8");
  });
  text("自分で設計した5体で、戦場へ。",48,1103,23,"#d2e3f5");
  text("FORM CLASH  ·  TSUBASA-ROCK",48,1138,17,"#8da3bc");
  return canvas;
}
function prepareResultShare(result,r,rank){
  const generation=++shareGeneration,button=$("#shareResultButton");
  resultShare=null;button.disabled=true;$("#shareGameButton").disabled=true;$("#shareStatus").textContent="シェア画像を準備中…";
  if(shareObjectURL){URL.revokeObjectURL(shareObjectURL);shareObjectURL=""}
  const data={result,title:result==="loss"?"DEFEAT":result==="draw"?"DRAW":"VICTORY",rank,total:displayedScore(r.score),difficulty:currentDifficulty,duration:battleDuration,playerPower:playerDeployedPoints,enemyPower:enemyDeployedPoints,hp:r.playerTowerHP,enemyHP:r.enemyTowerHP,units:clone(savedUnits)};
  const summary=`バランス調整が自由にできるバトルゲーム\nFORM CLASH｜プチキャラバトル｜${data.title}\n${data.difficulty.toUpperCase()} / ${data.duration}秒 / RANK ${rank}${result==="loss"?"":` / TOTAL ${data.total.toFixed(1)}`}\n自軍戦力 ${data.playerPower} / 敵戦力 ${data.enemyPower}`;
  const lineup=data.units.map((u,i)=>{const s=shareUnitStats(u);return `UNIT 0${i+1}${specialId(u)?" "+specialId(u).toUpperCase():""}: HP ${s.hp.toFixed(1)} / MOVE ${s.move.toFixed(3)} / SPD ${s.speed.toFixed(3)} / ATK ${s.atk.toFixed(1)} / RANGE ${s.range.toFixed(1)} / BOOST ${u.boost.join("+")||"NONE"}`}).join("\n");
  const tags=["FORMCLASH", "戦略ゲーム", "自作ゲーム", "個人開発", "ブラウザゲーム"];resultShare={text:GameShare.build(summary+"\n"+lineup,tags),summary:GameShare.build(summary+"\n編成は画像に！",tags),xtext:GameShare.build(summary,tags),file:null};
  const ready=()=>{if(generation!==shareGeneration)return;button.disabled=false;$("#shareGameButton").disabled=false;$("#shareStatus").textContent=""};
  try{createShareCanvas(data).toBlob(blob=>{
    if(generation!==shareGeneration)return;
    if(blob){resultShare.file=new File([blob],"form-clash-result.png",{type:"image/png"});shareObjectURL=URL.createObjectURL(blob)}
    ready();
  },"image/png")}catch{ready()}
}
function showShareFallback(){
  if(!resultShare)return;
  $("#shareText").value=resultShare.text;
  $("#sharePreview").hidden=!shareObjectURL;$("#saveShareImage").hidden=!shareObjectURL;
  if(shareObjectURL){$("#sharePreview").src=shareObjectURL;$("#saveShareImage").href=shareObjectURL}
  $("#shareFallback").showModal();
}
$("#shareGameButton").addEventListener("click",()=>{if(!resultShare)return;$("#shareStatus").textContent=GameShare.note();void GameShare.share(resultShare.xtext,{status:$('#shareStatus')})});
$("#shareResultButton").addEventListener("click",async()=>{
  if(!resultShare||shareBusy)return;
  shareBusy=true;$("#shareResultButton").disabled=true;
  try{
    if(!navigator.share){showShareFallback();return}
    const file=resultShare.file;
    if(file&&navigator.canShare?.({files:[file]}))await navigator.share({title:"FORM CLASH",text:resultShare.summary,files:[file]});
    else{showShareFallback();return}
    $("#shareStatus").textContent="共有操作が完了しました";
  }catch(error){
    if(error.name!=="AbortError"){ $("#shareStatus").textContent="画像保存・コピーから共有できます";showShareFallback() }
  }finally{shareBusy=false;$("#shareResultButton").disabled=false}
});
$("#copyShareText").addEventListener("click",async()=>{
  try{await navigator.clipboard.writeText($("#shareText").value);$("#copyShareText").textContent="コピーしました"}
  catch{$("#shareText").focus();$("#shareText").select();$("#copyShareText").textContent="下の文章を長押ししてコピー"}
});
$("#closeShareFallback").addEventListener("click",()=>{$("#shareFallback").close();$("#copyShareText").textContent="結果テキストをコピー"});

function loop(now){
  if(!battleRunning)return;
  const dt=Math.min(.05,(now-lastFrame)/1000);lastFrame=now;
  timeLeft=Math.max(0,battleDuration-(now-battleStartTime)/1000);$("#timerLabel").textContent=timeLeft.toFixed(1);
  if(charge)updateChargeVisual();
  if(now>=enemyNextSpawn){spawnEnemy();scheduleEnemy(now)}
  rareStarCheck(now);updateSoldiers(dt,now);updateProjectiles(dt);updateCounters();
  if(timeLeft<=0){finishBattle("draw");return}
  rafId=requestAnimationFrame(loop);
}

resetBrickTower();
renderDesign();
renderPlayerCounters();
renderMedals();
showScreen("#homeScreen");
