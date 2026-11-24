/* After_Line v0.3.7 | 2026-10-23 | LAB navigation + anonymous event counts */
globalThis.LabPageConfig={"game": "After_Line", "version": "0.3.7"};globalThis.GAME_PUBLIC_URL="https://tsubasarock21.github.io/games/After_Line/";globalThis.PICTO_PUBLIC_URL="https://tsubasarock21.github.io/games/After_Line/";
/* Tsubasa_Rock_LAB shared navigation / anonymous counters v1.0.0 | 2026-10-23 */
if(globalThis.LabMetricsV2){globalThis.LabMetricsV2.install({game:"After_Line",version:globalThis.LabPageConfig?.version||'unknown'});}else{(()=>{'use strict';
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

/* 動的迷路 v0.3.7 | 2026-10-22 */
(() => {
'use strict';

// Japanese copy is the reference. English copy is authored for the same intent.
const TRANSLATIONS={
 " · ✓ クリア済み": {
  "ja": " · ✓ クリア済み",
  "en": " · ✓ Cleared"
 },
 "✓ クリア済み": {
  "ja": "✓ クリア済み",
  "en": "✓ Cleared"
 },
 "未クリア": {
  "ja": "未クリア",
  "en": "Not cleared"
 },
 "クリア状況はこのブラウザに保存されます。": {
  "ja": "クリア状況はこのブラウザに保存されます。",
  "en": "Your cleared stages are saved in this browser."
 },
 "この環境では保存できないため、クリア状況はページを閉じるまで表示します。": {
  "ja": "この環境では保存できないため、クリア状況はページを閉じるまで表示します。",
  "en": "Saving is unavailable here. Clear records will last until you close this page."
 },
 "基本エリア": {
  "ja": "基本エリア",
  "en": "Basic sector"
 },
 "高速・低速ゲート": {
  "ja": "高速・低速ゲート",
  "en": "Fast & slow gates"
 },
 "回転する溝": {
  "ja": "回転する溝",
  "en": "Rotating passage"
 },
 "流星群": {
  "ja": "流星群",
  "en": "Meteor shower"
 },
 "膨張・破裂": {
  "ja": "膨張・破裂",
  "en": "Grow & burst"
 },
 "回転する螺旋": {
  "ja": "回転する螺旋",
  "en": "Rotating spiral"
 },
 "追尾弾": {
  "ja": "追尾弾",
  "en": "Homing shots"
 },
 "同じルート・同じ時刻の罠を再生中。ミス回数は増えません。": {
  "ja": "同じルート・同じ時刻の罠を再生中。ミス回数は増えません。",
  "en": "Replaying your route with the same trap timing. This will not add a miss."
 },
 "ルートを描こう": {
  "ja": "ルートを描こう",
  "en": "Draw your route"
 },
 "EASY：罠の動きが薄く見えます。描き始めると罠の時計も0秒に戻ります。": {
  "ja": "EASY：罠の動きが薄く見えます。描き始めると罠の時計も0秒に戻ります。",
  "en": "EASY: Traps are faintly visible in motion. Their clock resets when you start drawing."
 },
 "罠は前回と同じ。通り道や、途中で待つ時間を変えてみよう。": {
  "ja": "罠は前回と同じ。通り道や、途中で待つ時間を変えてみよう。",
  "en": "Same traps, same timing. Try a different path, or pause along the way."
 },
 "STARTの光を押したまま、GOALの円に触れるまでなぞろう。": {
  "ja": "STARTの光を押したまま、GOALの円に触れるまでなぞろう。",
  "en": "Touch and hold START, then draw a route into the GOAL circle."
 },
 "全22ステージから自由に選べます。配置とタイミングを読んで突破しよう。": {
  "ja": "全22ステージから自由に選べます。配置とタイミングを読んで突破しよう。",
  "en": "Choose any of the 22 stages. Find the path and time your run."
 },
 "まずは、必ずギリギリ回避するトライアルから。": {
  "ja": "まずは、必ずギリギリ回避するトライアルから。",
  "en": "Try a guaranteed close escape before taking on the challenge."
 },
 "このステージを始める": {
  "ja": "このステージを始める",
  "en": "Start this stage"
 },
 "トライアルを始める": {
  "ja": "トライアルを始める",
  "en": "Start trial"
 },
 "必ずギリギリ回避": {
  "ja": "必ずギリギリ回避",
  "en": "A guaranteed close escape"
 },
 "EASY・なぞって記録中": {
  "ja": "EASY・なぞって記録中",
  "en": "EASY · Recording"
 },
 "なぞって記録中": {
  "ja": "なぞって記録中",
  "en": "Recording your route"
 },
 "速さも、止まった時間も記録しています。GOALの円に触れると自動で再生します。": {
  "ja": "速さも、止まった時間も記録しています。GOALの円に触れると自動で再生します。",
  "en": "Recording your speed and pauses. Reach the GOAL circle to start the replay."
 },
 "20秒を超えました。もう一度STARTから描こう。": {
  "ja": "20秒を超えました。もう一度STARTから描こう。",
  "en": "That took over 20 seconds. Draw again from START."
 },
 "GOALの円に触れるまで、指を離さずになぞってください。": {
  "ja": "GOALの円に触れるまで、指を離さずになぞってください。",
  "en": "Keep your finger down until your route touches the GOAL circle."
 },
 "未来を再生中": {
  "ja": "未来を再生中",
  "en": "Running your route"
 },
 "あなたのルートに合わせて、ギリギリの回避を演出中！": {
  "ja": "あなたのルートに合わせて、ギリギリの回避を演出中！",
  "en": "Your route is set. Watch those close escapes!"
 },
 "罠が出現！ 描いた速さのまま走ります。": {
  "ja": "罠が出現！ 描いた速さのまま走ります。",
  "en": "Traps revealed! Your route plays back at the speed you drew it."
 },
 "ゴール到達！": {
  "ja": "ゴール到達！",
  "en": "GOAL reached!"
 },
 "もう一度挑戦": {
  "ja": "もう一度挑戦",
  "en": "Try again"
 },
 "チャレンジへ →": {
  "ja": "チャレンジへ →",
  "en": "Try the challenge →"
 },
 "次のステージ →": {
  "ja": "次のステージ →",
  "en": "Next stage →"
 },
 "10回以上ミスしたのでEASYが有効です。描画中も全ギミックの動きを薄く表示します。": {
  "ja": "10回以上ミスしたのでEASYが有効です。描画中も全ギミックの動きを薄く表示します。",
  "en": "EASY unlocked after 10 misses. All traps now move faintly while you draw."
 },
 "全22レベルクリア！ おめでとう！ レベル23以降はCOMING SOON。": {
  "ja": "全22レベルクリア！ おめでとう！ レベル23以降はCOMING SOON。",
  "en": "You made it through the final stage! More stages are COMING SOON."
 },
 "ギリギリ、大成功！ 次は本物の罠に挑戦しよう。": {
  "ja": "ギリギリ、大成功！ 次は本物の罠に挑戦しよう。",
  "en": "That was close! Ready to take on the real traps?"
 },
 "{count}回目で突破！ 次は新しい配置に挑戦。": {
  "ja": "{count}回目で突破！ 次は新しい配置に挑戦。",
  "en": "Cleared on attempt {count}! A new layout awaits."
 },
 "レーザーに接触。光が消えるタイミングに通ろう。": {
  "ja": "レーザーに接触。光が消えるタイミングに通ろう。",
  "en": "Hit a laser. Wait for the light to switch off before crossing."
 },
 "追尾弾に接触。誘導したあと、切り返すルートを試してみよう。": {
  "ja": "追尾弾に接触。誘導したあと、切り返すルートを試してみよう。",
  "en": "Hit by a homing shot. Try drawing it one way, then changing direction."
 },
 "弾に接触。発射時刻は同じなので、通るタイミングを変えてみよう。": {
  "ja": "弾に接触。発射時刻は同じなので、通るタイミングを変えてみよう。",
  "en": "Hit by a shot. It fires at the same time each try, so change your timing."
 },
 "回転する円に接触。溝の回転に合わせて進んだり待ったりしよう。": {
  "ja": "回転する円に接触。溝の回転に合わせて進んだり待ったりしよう。",
  "en": "Hit the rotating obstacle. Move or pause to stay inside its passage."
 },
 "膨らむ円に接触。破裂する前後のタイミングにも気を付けよう。": {
  "ja": "膨らむ円に接触。破裂する前後のタイミングにも気を付けよう。",
  "en": "Hit a growing orb. Watch your timing before and after it bursts."
 },
 "壁に接触。見えた隙間を通るルートで再挑戦しよう。": {
  "ja": "壁に接触。見えた隙間を通るルートで再挑戦しよう。",
  "en": "Hit a wall. Redraw your route through the gaps you can now see."
 },
 "記録は20秒まで。短いルートでも、立ち止まるルートでもOK。": {
  "ja": "記録は20秒まで。短いルートでも、立ち止まるルートでもOK。",
  "en": "You have 20 seconds to draw. Short routes and pauses are both allowed."
 },
 "操作を中断しました。同じステージで描き直せます。": {
  "ja": "操作を中断しました。同じステージで描き直せます。",
  "en": "Run interrupted. You can redraw the same stage."
 },
 "動的迷路 / ": {
  "ja": "動的迷路 / ",
  "en": "ROUTE REPORT / "
 },
 "{time} s  /  {count}回目": {
  "ja": "{time} s  /  {count}回目",
  "en": "{time} s  /  attempt {count}"
 },
 "描いた未来を、走り抜けろ。": {
  "ja": "描いた未来を、走り抜けろ。",
  "en": "Draw your future. Run it."
 },
 "#AFTERLINE #迷路ゲーム #自作ゲーム #個人開発 #ブラウザゲーム": {
  "ja": "#AFTERLINE #迷路ゲーム #自作ゲーム #個人開発 #ブラウザゲーム",
  "en": "#AFTERLINE #迷路ゲーム #自作ゲーム #個人開発 #ブラウザゲーム"
 },
 "ルート画像を準備しています…": {
  "ja": "ルート画像を準備しています…",
  "en": "Preparing your route image…"
 },
 "画像を生成できなかったため、文章でシェアできます。": {
  "ja": "画像を生成できなかったため、文章でシェアできます。",
  "en": "The image could not be created. You can still share your result as text."
 },
 "対応する共有先には画像も添付します。画像の長押し保存もできます。": {
  "ja": "対応する共有先には画像も添付します。画像の長押し保存もできます。",
  "en": "An image is included where supported. You can also touch and hold it to save."
 },
 "全22レベルクリア！": {
  "ja": "全22レベルクリア！",
  "en": "Final stage cleared!"
 },
 "クリア！": {
  "ja": "クリア！",
  "en": "Cleared!"
 },
 "ルートを変えて再挑戦！": {
  "ja": "ルートを変えて再挑戦！",
  "en": "Time to redraw and try again!"
 },
 "トライアル": {
  "ja": "トライアル",
  "en": "Trial"
 },
 "ゲームのURLを自動取得できませんでした。CodePenまたは公開先のURLを入力してください。": {
  "ja": "ゲームのURLを自動取得できませんでした。CodePenまたは公開先のURLを入力してください。",
  "en": "The game link could not be detected. Enter its CodePen or public URL."
 },
 "共有にはゲームのURLが必要です。もう一度シェアを押してURLを入力してください。": {
  "ja": "共有にはゲームのURLが必要です。もう一度シェアを押してURLを入力してください。",
  "en": "A game link is needed to share. Tap Share again and enter the URL."
 },
 "動的迷路 AFTERLINE": {
  "ja": "動的迷路 AFTERLINE",
  "en": "AFTERLINE"
 },
 "共有する文章をコピーしました。画像は「画像を保存」から使えます。": {
  "ja": "共有する文章をコピーしました。画像は「画像を保存」から使えます。",
  "en": "Share text copied. Use Save image if you want to include the picture."
 },
 "share.body": {
  "ja": "動的迷路 AFTERLINE\n描いた速さで未来を走るパズル。\n{stage} {outcome} {time}秒\n#AFTERLINE #迷路ゲーム #自作ゲーム #個人開発 #ブラウザゲーム",
  "en": "AFTERLINE\nDraw your route. Run it at the speed you drew it.\n{stage} {outcome} {time} s\n#AFTERLINE #迷路ゲーム #自作ゲーム #個人開発 #ブラウザゲーム"
 },
 "share.stage": {
  "ja": "ステージ{count}",
  "en": "Stage {count}"
 },
 "static.63": {
  "ja": "動的迷路<span>AFTERLINE</span>",
  "en": "AFTERLINE<span>DYNAMIC MAZE</span>"
 },
 "static.64": {
  "ja": "描いた未来を、走り抜けろ。",
  "en": "Draw your future. Run it."
 },
 "static.65": {
  "ja": "指で描いたルートを、描いた速さで走り抜ける。",
  "en": "Draw a route, then watch it play back at your own pace."
 },
 "static.66": {
  "ja": "トライアル<span>必ずギリギリ回避</span>",
  "en": "Trial<span>A guaranteed close escape</span>"
 },
 "static.67": {
  "ja": "チャレンジ<span>全22レベルに挑戦</span>",
  "en": "Challenge<span>Take on all 22 stages</span>"
 },
 "static.68": {
  "ja": "ステージを選ぶ",
  "en": "Choose a stage"
 },
 "static.69": {
  "ja": "STARTからGOALへ。指を止めた時間も記録します。",
  "en": "From START to GOAL. Every pause is part of your route."
 },
 "static.70": {
  "ja": "遊び方とモードの違い",
  "en": "How to play & modes"
 },
 "static.71": {
  "ja": "開始画面の「ステージを選ぶ」から、未クリアでも全22ステージへ直接移動できます。別のステージへ移動すると、挑戦回数・EASY・リプレイはリセットします。同じ問題への再挑戦には「描き直す」を使います。",
  "en": "Choose any stage from the home screen, even if you have not cleared it. Starting a different stage resets your attempts, EASY mode, and replay. Use Redraw to retry the same layout."
 },
 "static.72": {
  "ja": "① STARTを押したまま、GOALまで指を動かします。<br>② GOALの円に触れると、自動で記録が終わり、隠れていた罠が出現。<br>③ 描いた速さ・立ち止まった時間のまま、自動で走ります。",
  "en": "① Touch and hold START, then draw toward GOAL.<br/>② Reach the GOAL circle to end recording automatically and reveal the traps.<br/>③ Your route plays back with the exact speed and pauses you drew."
 },
 "static.73": {
  "ja": "<b>トライアル：</b>どんなルートでも気持ちよく回避する演出モードです。<br><b>チャレンジ：</b>壁・周期的なレーザー・ときどき横切る弾に触れると失敗。同じステージでは配置も、レーザーと弾の攻撃時刻も変わりません。失敗後は壁とレーザーの場所が見えるので、ルートや通るタイミングを変えて攻略しましょう。",
  "en": "<b>Trial:</b> A feel-good demo that makes every route a close escape.<br/><b>Challenge:</b> Touch a wall, active laser, or passing shot and the run ends. Layouts and attack timings stay the same on retries. After a miss, wall and gate positions remain visible. Change your route or timing to get through."
 },
 "static.74": {
  "ja": "レーザーは赤い光が出ている間だけ危険。レベル8から縦レーザーも登場。レベル11から新しいギミックが登場し、21〜22で追尾弾が登場し、22で全クリアです。描く時間は最長20秒。指を止めて待つこともできます。アプリを切り替えた場合は、その試行を中断します。",
  "en": "Lasers are dangerous only while the red light is on. Vertical lasers appear from stage 8, new traps from stage 11, and homing shots in stages 21–22. Stage 22 is the final stage. You have up to 20 seconds to draw, and you can pause along the way. Switching apps interrupts the current run."
 },
 "static.75": {
  "ja": "<b>リプレイ：</b>成功・失敗した走りを同じ条件で再生します。ミスは増えません。<br><b>EASY：</b>同じレベルで10回失敗すると、描いている間も全ギミックを薄く動かして表示します。描画開始からの時刻を、そのまま再生に使います。追尾弾は描いている位置に反応します。クリアすると解除されます。スタートとゴールも、同じレベルの再挑戦では変わりません。",
  "en": "<b>Replay:</b> Watch a successful or failed run again under the same conditions. It does not add a miss.<br/><b>EASY:</b> After 10 misses on the same stage, all traps are shown faintly in motion while you draw. The trap clock resets when drawing starts. Homing shots respond to your recorded position. EASY resets after a clear. START and GOAL stay fixed on retries."
 },
 "static.76": {
  "ja": "回転円の明るい溝は通行可能です。レベル19〜20では、円の外周から続く空白の溝に入り、螺旋をたどって中央のGOALへ進みます。",
  "en": "The empty passages through rotating obstacles are safe. In stages 19–20, enter the opening in the outer edge and follow the spiral to GOAL at the center."
 },
 "static.77": {
  "ja": "追尾弾は一定時間だけあなたを追い、その後は直進します。再挑戦では出現位置・時刻・追尾時間は同じですが、描いたルートに応じて軌道が変わります。",
  "en": "Homing shots follow you for a limited time, then fly straight. Their spawn positions, launch times, and homing duration stay fixed on retries. Their paths change with the route you draw."
 },
 "static.78": {
  "ja": "← 戻る",
  "en": "← Home"
 },
 "static.79": {
  "ja": "AFTERLINE<span>動的迷路</span>",
  "en": "AFTERLINE<span>DYNAMIC MAZE</span>"
 },
 "static.80": {
  "ja": "描き直す",
  "en": "Redraw"
 },
 "static.81": {
  "ja": "次のステージ →",
  "en": "Next stage →"
 },
 "static.82": {
  "ja": "▶ リプレイ",
  "en": "▶ Replay"
 },
 "static.83": {
  "ja": "結果をシェア",
  "en": "Share result"
 },
 "static.84": {
  "ja": "あなたのルート",
  "en": "Your route"
 },
 "static.85": {
  "ja": "画像を保存",
  "en": "Save image"
 },
 "static.86": {
  "ja": "結果をコピー",
  "en": "Copy result"
 },
 "static.87": {
  "ja": "文章を長押ししてコピーできます。",
  "en": "Touch and hold the text to copy it."
 },
 "static.88": {
  "ja": "閉じる",
  "en": "Close"
 },
 "static.89": {
  "ja": "開始画面",
  "en": "Home screen"
 },
 "static.90": {
  "ja": "ゲーム画面",
  "en": "Game screen"
 },
 "static.91": {
  "ja": "モード",
  "en": "Mode"
 },
 "static.92": {
  "ja": "チャレンジのステージを選ぶ",
  "en": "Choose a challenge stage"
 },
 "static.93": {
  "ja": "開始画面に戻る",
  "en": "Back to home"
 },
 "static.94": {
  "ja": "スタートのキャラクターを指で押し、ゴールまでなぞって離してください",
  "en": "Touch and hold START, then draw into the GOAL circle."
 },
 "static.95": {
  "ja": "スタート・ゴール・描いたルートと到達位置の結果画像",
  "en": "Route image showing START, GOAL, your path, and the point you reached"
 },
 "static.96": {
  "ja": "スタート・ゴール・描いたルートと到達位置の結果画像",
  "en": "Route image showing START, GOAL, your path, and the point you reached"
 },
 "static.97": {
  "ja": "共有する文章",
  "en": "Text to share"
 },
 "homeArt.alt": {
  "ja": "丸いキャラクターがレーザーや弾をかわし、奥に光るゴールへ向かうイラスト",
  "en": "A glowing sphere dodges lasers and projectiles as it races toward a distant golden goal."
 }
};
const LANGUAGE_KEY='afterline.language.v1',translationMemo=new Map();let messageDescriptor=null;
let language=/^ja(?:-|$)/i.test(navigator.languages?.[0]||navigator.language||'en')?'ja':'en';
try{const saved=localStorage.getItem(LANGUAGE_KEY);if(saved==='ja'||saved==='en')language=saved;}catch(_){}
function tr(key,values={}){const text=(TRANSLATIONS[key]?.[language]??key).replace(/\{(\w+)\}/g,(match,name)=>String(values[name]??match));translationMemo.set(text,{key,values:{...values}});if(translationMemo.size>256)translationMemo.delete(translationMemo.keys().next().value);return text;}
function applyLanguage(){document.documentElement.lang=language;globalThis.LabMetrics?.language();document.title=language==='ja'?'動的迷路 | AFTERLINE':'AFTERLINE | Dynamic Maze';document.querySelectorAll('[data-i18n-html]').forEach(el=>{el.innerHTML=tr(el.dataset.i18nHtml);});for(const [data,attr]of [['i18nAria','aria-label'],['i18nAlt','alt']])document.querySelectorAll(data==='i18nAria'?'[data-i18n-aria]':'[data-i18n-alt]').forEach(el=>el.setAttribute(attr,tr(el.dataset[data])));$('langJa').setAttribute('aria-pressed',String(language==='ja'));$('langEn').setAttribute('aria-pressed',String(language==='en'));chooseMode(menuMode);$('levelName').textContent=S.mode==='trial'?tr('必ずギリギリ回避'):stageTitle(S.stage);$('phase').textContent=S.phase==='drawing'?tr(S.easy?'EASY・なぞって記録中':'なぞって記録中'):S.phase==='running'?(S.replaying?'REPLAY':tr('未来を再生中')):S.phase==='clear'?tr('ゴール到達！'):S.phase==='failed'?tr('もう一度挑戦'):tr('ルートを描こう');$('next').textContent=tr(S.mode==='trial'?'チャレンジへ →':'次のステージ →');if(messageDescriptor)$('message').textContent=tr(messageDescriptor.key,messageDescriptor.values);if(S.savedReplay&&(S.phase==='clear'||S.phase==='failed')&&!$('routeResult').hidden)prepareRouteResult();}
function setLanguage(value){if(value!=='ja'&&value!=='en')return;language=value;try{localStorage.setItem(LANGUAGE_KEY,value);}catch(_){}applyLanguage();}

const $=id=>document.getElementById(id),canvas=$('board'),ctx=canvas.getContext('2d');
const START={x:.10,y:.90},GOAL={x:.90,y:.10},R=.015,LIMIT=20;
const S={mode:'trial',phase:'ready',stage:1,level:null,revealed:false,route:[],lastRoute:[],elapsed:0,position:START,pointer:null,drawStart:0,runStart:0,seed:0,tries:0,failures:0,easy:false,replaying:false,savedReplay:null,previewStart:0};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const MAX_STAGE=22;
const PROGRESS_KEY='afterline.progress.v1',clearedStages=new Set();let progressWritable=true;
try{const raw=localStorage.getItem(PROGRESS_KEY);try{const saved=JSON.parse(raw||'[]');if(Array.isArray(saved))for(const n of saved)if(Number.isInteger(n)&&n>=1&&n<=MAX_STAGE)clearedStages.add(n);}catch(_){}}catch(_){progressWritable=false;}
function updateProgress(){for(const option of $('stageSelect').options){const n=Number(option.value);option.textContent=String(n).padStart(2,'0')+' · '+stageTitle(n)+(clearedStages.has(n)?tr(' · ✓ クリア済み'):'');}const n=Number($('stageSelect').value);$('stageStatus').textContent='STAGE '+String(n).padStart(2,'0')+' / '+(clearedStages.has(n)?tr('✓ クリア済み'):tr('未クリア'));$('stageStatus').classList.toggle('is-clear',clearedStages.has(n));$('clearCount').textContent=clearedStages.size+' / '+MAX_STAGE+' CLEAR';$('progressNote').textContent=progressWritable?tr('クリア状況はこのブラウザに保存されます。'):tr('この環境では保存できないため、クリア状況はページを閉じるまで表示します。');}
function markStageClear(n){if(!Number.isInteger(n)||n<1||n>MAX_STAGE)return;clearedStages.add(n);try{localStorage.setItem(PROGRESS_KEY,JSON.stringify([...clearedStages].sort((a,b)=>a-b)));progressWritable=true;}catch(_){progressWritable=false;}updateProgress();}

function currentStart(){return S.level?.start||S.level?.reference?.[0]||START;}
function currentGoal(){return S.level?.goal||GOAL;}
function stageTitle(n){return n<=10?tr('基本エリア'):n<=12?tr('高速・低速ゲート'):n<=14?tr('回転する溝'):n<=16?tr('流星群'):n<=18?tr('膨張・破裂'):n<=20?tr('回転する螺旋'):tr('追尾弾');}
function endpoints(random){let start,goal;for(let i=0;i<50;i++){start={x:.08+random()*.22,y:.70+random()*.22};goal={x:.70+random()*.22,y:.08+random()*.22};if(dist(start,goal)>=.78)break;}if(dist(start,goal)<.78){start={x:.1,y:.9};goal={x:.9,y:.1};}const flipX=random()<.5,flipY=random()<.5,flip=p=>({x:flipX?1-p.x:p.x,y:flipY?1-p.y:p.y});return{start:flip(start),goal:flip(goal)};}
function arrangeDiskLevel(level,seed,stage){const random=rng(seed^0x41ab71),spiral=stage>=19,d=level.disks[0],angle=spiral?random()*Math.PI*2:Math.floor(random()*4)*Math.PI/2,center={x:.45+random()*.10,y:.45+random()*.10},c=Math.cos(angle),s=Math.sin(angle),transform=p=>({x:center.x+c*(p.x-.5)-s*(p.y-.5),y:center.y+s*(p.x-.5)+c*(p.y-.5)});
 if(!spiral){level.reference[0]={x:.09+random()*.12,y:.79+random()*.12,t:0};level.reference[level.reference.length-1]={x:.79+random()*.12,y:.09+random()*.12,t:9};}
 level.reference=level.reference.map(p=>({...p,...transform(p)}));level.walls=level.walls.map(w=>{const corners=[transform(w),transform({x:w.x+w.w,y:w.y+w.h})];return{x:Math.min(...corners.map(p=>p.x)),y:Math.min(...corners.map(p=>p.y)),w:Math.abs(corners[0].x-corners[1].x),h:Math.abs(corners[0].y-corners[1].y)};});
 level.shots=level.shots.map(b=>({...b,...transform(b),vx:c*b.vx-s*b.vy,vy:s*b.vx+c*b.vy}));d.x=center.x;d.y=center.y;d.angle+=angle;
 if(spiral){const a=d.angle+d.omega*2,ux=Math.cos(a),uy=Math.sin(a),limitX=Math.abs(ux)<1e-8?Infinity:((ux>0?.95:.05)-center.x)/ux,limitY=Math.abs(uy)<1e-8?Infinity:((uy>0?.95:.05)-center.y)/uy,r=Math.min(limitX,limitY);level.reference[0]={x:center.x+ux*r,y:center.y+uy*r,t:0};level.goal={...center};}else level.goal={x:level.reference.at(-1).x,y:level.reference.at(-1).y};
 level.start={x:level.reference[0].x,y:level.reference[0].y};level.shots=level.shots.filter(b=>shotSafe(b,level.reference));return level;
}
function trackerFlight(config,route){let x=config.x,y=config.y,angle=config.angle;const points=[{x,y,t:config.spawn}],end=Math.min(LIMIT,config.spawn+config.life);for(let t=config.spawn;t<end-1e-8;){const dt=Math.min(.01,end-t);if(t<config.spawn+config.chase){const target=pointAt(route,Math.min(route.at(-1).t,t)),wanted=Math.atan2(target.y-y,target.x-x),difference=Math.atan2(Math.sin(wanted-angle),Math.cos(wanted-angle));angle+=clamp(difference,-config.turn*dt,config.turn*dt);}x+=Math.cos(angle)*config.speed*dt;y+=Math.sin(angle)*config.speed*dt;t+=dt;points.push({x,y,t});}return{...config,points,end};}
function trackerAt(f,t){return pointAt(f.points,t);}
function trackingSafe(f,route){for(const p of f.points){if(p.t>route.at(-1).t)break;if(dist(p,pointAt(route,p.t))<R+f.radius+.025)return false;}return true;}
function trackerLevel(seed,stage){const level=levelFor(seed,10),random=rng(seed^0xc3a822),a=level.start,b=level.goal,dx=b.x-a.x,dy=b.y-a.y,length=Math.hypot(dx,dy),side={x:-dy/length,y:dx/length},mix=(u,offset,t)=>({x:clamp(a.x+dx*u+side.x*offset,.08,.92),y:clamp(a.y+dy*u+side.y*offset,.08,.92),t});level.reference=[{...a,t:0},mix(.12,0,1.1),mix(.24,.19,2.0),mix(.48,0,3.4),mix(.52,0,4),mix(.62,-.16,4.9),{...b,t:8}];level.walls=[];level.gates=[];level.trackers=[];level.shots=[];
 if(stage===22){const p=pointAt(level.reference,6.3),half=.13;level.walls=[{x:0,y:p.y-.012,w:p.x-half,h:.024},{x:p.x+half,y:p.y-.012,w:1-p.x-half,h:.024}];level.gates=[{axis:'h',x:p.x-half,y:p.y,w:half*2,arrival:6.3,period:2.8,safe:.9}];if(collisionBetween(level.reference,0,8,level)){level.walls=[];level.gates=[];}}
 for(let i=0;i<(stage===21?1:2);i++){for(let attempt=0;attempt<240;attempt++){const edge=Math.floor(random()*4),position=random()*.8+.1,spawn=.25+i*2.0,at=pointAt(level.reference,spawn),p=edge===0?{x:.025,y:position}:edge===1?{x:.975,y:position}:edge===2?{x:position,y:.025}:{x:position,y:.975},config={...p,spawn,chase:attempt<120?(stage===21?1.15:1.45):.7,life:attempt<120?4.2:2.3,speed:attempt<120?(stage===21?.34:.42):.22,turn:1.7,radius:.013,angle:Math.atan2(at.y-p.y,at.x-p.x)+(random()-.5)*1.2};if(trackingSafe(trackerFlight(config,level.reference),level.reference)){level.trackers.push(config);break;}}}return level;}
function resolveRunLevel(level,route){return{...level,trackerFlights:(level.trackers||[]).map(config=>trackerFlight(config,route))};}
function segmentDistance(p,a,b){const dx=b.x-a.x,dy=b.y-a.y,k=clamp(((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1),0,1);return dist(p,{x:a.x+dx*k,y:a.y+dy*k});}
function diskPath(d,t){const points=[],angle=d.angle+d.omega*t;if(d.kind==='straight'){for(const sign of [-1,1])points.push({x:d.x+Math.cos(angle)*(d.radius+.035)*sign,y:d.y+Math.sin(angle)*(d.radius+.035)*sign});}else{for(let i=0;i<=180;i++){const r=(d.radius+.035)*(1-i/180),a=angle+d.turns*Math.PI*2*(1-r/(d.radius+.035));points.push({x:d.x+Math.cos(a)*r,y:d.y+Math.sin(a)*r});}}return points;}
const diskMasks=new Map();
function diskMask(d){const key=[d.kind,d.radius,d.width,d.turns||0].join('|');if(diskMasks.has(key))return diskMasks.get(key);const n=384,step=d.radius*2/n,bits=new Uint8Array(n*n),half=d.width/2,path=diskPath({...d,x:0,y:0,angle:0,omega:0},0);
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){const px=(x+.5)*step-d.radius,py=(y+.5)*step-d.radius;if(px*px+py*py<d.radius*d.radius)bits[y*n+x]=1;}
 // Remove the corridor from the actual obstacle bitmap, including every rim pixel it crosses.
 for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i],dx=b.x-a.x,dy=b.y-a.y,length=dx*dx+dy*dy||1,minX=clamp(Math.floor((Math.min(a.x,b.x)-half+d.radius)/step),0,n-1),maxX=clamp(Math.ceil((Math.max(a.x,b.x)+half+d.radius)/step),0,n-1),minY=clamp(Math.floor((Math.min(a.y,b.y)-half+d.radius)/step),0,n-1),maxY=clamp(Math.ceil((Math.max(a.y,b.y)+half+d.radius)/step),0,n-1);for(let y=minY;y<=maxY;y++)for(let x=minX;x<=maxX;x++){if(!bits[y*n+x])continue;const px=(x+.5)*step-d.radius,py=(y+.5)*step-d.radius,k=clamp(((px-a.x)*dx+(py-a.y)*dy)/length,0,1),ex=px-a.x-dx*k,ey=py-a.y-dy*k;if(ex*ex+ey*ey<=half*half)bits[y*n+x]=0;}}
 const texture=document.createElement('canvas');texture.width=texture.height=n;const paint=texture.getContext('2d');paint.clearRect(0,0,n,n);paint.fillStyle='#43647f';for(let y=0;y<n;y++){let x=0;while(x<n){while(x<n&&!bits[y*n+x])x++;const start=x;while(x<n&&bits[y*n+x])x++;if(x>start)paint.fillRect(start,y,x-start,1);}}
 const mask={n,step,bits,texture,radius:d.radius};diskMasks.set(key,mask);return mask;
}
function diskLocal(p,t,d){const a=d.angle+d.omega*t,c=Math.cos(a),s=Math.sin(a),x=p.x-d.x,y=p.y-d.y;return{x:c*x+s*y,y:-s*x+c*y};}
function diskSolid(p,d,unused,t=0){const mask=diskMask(d),q=diskLocal(p,t,d),x=Math.floor((q.x+d.radius)/mask.step),y=Math.floor((q.y+d.radius)/mask.step);return x>=0&&y>=0&&x<mask.n&&y<mask.n&&mask.bits[y*mask.n+x]===1;}
function diskHit(p,t,d){if(dist(p,d)>d.radius+R+.003)return false;const mask=diskMask(d),q=diskLocal(p,t,d),minX=Math.max(0,Math.floor((q.x-R+d.radius)/mask.step)),maxX=Math.min(mask.n-1,Math.floor((q.x+R+d.radius)/mask.step)),minY=Math.max(0,Math.floor((q.y-R+d.radius)/mask.step)),maxY=Math.min(mask.n-1,Math.floor((q.y+R+d.radius)/mask.step));
 for(let y=minY;y<=maxY;y++)for(let x=minX;x<=maxX;x++){if(!mask.bits[y*mask.n+x])continue;const left=x*mask.step-d.radius,top=y*mask.step-d.radius,nx=clamp(q.x,left,left+mask.step),ny=clamp(q.y,top,top+mask.step);if((q.x-nx)**2+(q.y-ny)**2<R*R-1e-12)return true;}return false;
}
function drawDisk(d,t){const mask=diskMask(d);ctx.save();ctx.translate(d.x,d.y);ctx.rotate(d.angle+d.omega*t);ctx.imageSmoothingEnabled=false;ctx.drawImage(mask.texture,-d.radius,-d.radius,d.radius*2,d.radius*2);ctx.restore();}
function bloomRadius(b,t){return t<b.start||t>=b.pop?0:.018+(b.radius-.018)*(t-b.start)/(b.pop-b.start);}
function advancedLevel(seed,stage){
 const random=rng(seed),base=levelFor(seed,10);base.shots=[];base.disks=[];base.blooms=[];
 if(stage<=12){base.gates.forEach((g,i)=>{g.period=i===0?1.25:5.6;g.safe=i===0?.42:1.4;});if(stage===12)base.shots=makeTrialShots(base.reference,seed).filter((_,i)=>i%6===1);return base;}
 if(stage===13||stage===14||stage>=19){
  const spiral=stage>=19,d={kind:spiral?'spiral':'straight',x:.5,y:.5,radius:spiral?.34:.30,width:spiral?(stage===19?.085:.078):.105,omega:spiral?(stage===19?.32:-.45):(stage===13?.14:-.22),angle:0,turns:stage===19?.75:1.1};
  const entry=spiral?2:3,exit=spiral?12:7;d.angle=Math.PI*.75-d.omega*entry;
  const route=[{...START,t:0}];for(let t=entry;t<=exit+.0001;t+=.025){const f=clamp((t-entry)/(exit-entry),0,1),r=spiral?(d.radius+.035)*(1-f):(d.radius+.035)*(1-2*f),a=d.angle+d.omega*t+(spiral?d.turns*Math.PI*2*f:0);route.push({x:d.x+Math.cos(a)*r,y:d.y+Math.sin(a)*r,t});}
  if(spiral){base.goal={x:.5,y:.5};route.push({...base.goal,t:12.1});base.walls=[];}else{route.push({...GOAL,t:9});base.walls=[{x:0,y:.488,w:.20,h:.024},{x:.80,y:.488,w:.20,h:.024}];}
  base.reference=route;base.gates=[];base.disks=[d];if(stage===14||stage===20)base.shots=makeTrialShots(route,seed).filter((_,i)=>i%9===3);return base;
 }
 base.gates=stage%2===0?base.gates.slice(0,1):[];base.walls=stage%2===0?base.walls.slice(0,2):[];
 if(stage<=16){
  // The opening wave is already inside the arena at t=0 and travels toward the route.
  const openingSpeed=stage===15?1.0+random()*.25:1.25+random()*.30;
  for(let row=0;row<9;row++)for(let col=0;col<4;col++){const b={x:.68+col*.09,y:.46+row*.06,vx:-openingSpeed,vy:0,near:0,start:0,end:(.76+col*.09)/openingSpeed,radius:.024+random()*.007};if(shotSafe(b,base.reference))base.shots.push(b);}
  for(let wave=0;wave<(stage===15?5:7);wave++){const launch=.20+wave*(stage===15?1.35:1.05),top=wave%2===0,speed=stage===15?1.0+random()*.35:1.35+random()*.35;for(let row=0;row<7;row++)for(let col=0;col<6;col++){const b={x:-.05-col*.085,y:(top?.025:.525)+row*.075,vx:speed,vy:0,near:launch,start:launch,end:Math.min(19,launch+(1.15+col*.085)/speed),radius:.022+random()*.010};if(shotSafe(b,base.reference))base.shots.push(b);}}

 }else{
  for(let i=0;i<(stage===17?2:3);i++){let picked=null;for(let attempt=0;attempt<100;attempt++){const b={x:.22+random()*.56,y:.22+random()*.56,start:.05+i*1.85,pop:.05+i*1.85+(stage===17?.95:.70),radius:.19+random()*.04};let safe=true;for(let t=b.start;t<b.pop;t+=.01)if(dist(pointAt(base.reference,t),b)<bloomRadius(b,t)+R+.015){safe=false;break;}if(safe){picked=b;break;}}if(!picked)continue;base.blooms.push(picked);for(let j=0;j<16;j++){const a=j*Math.PI/8+random()*.10,b={x:picked.x,y:picked.y,vx:Math.cos(a)*.62,vy:Math.sin(a)*.62,near:picked.pop,start:picked.pop,end:picked.pop+1.9,radius:.010};if(shotSafe(b,base.reference))base.shots.push(b);}}
 }
 return base;
}
function loadLevel(seed,stage){const level=stage<=10?levelFor(seed,stage):stage<=20?advancedLevel(seed,stage):trackerLevel(seed,stage);return stage===13||stage===14||stage===19||stage===20?arrangeDiskLevel(level,seed,stage):level;}
function replay(){if(!S.savedReplay||S.phase==='running'||S.phase==='drawing')return;release();S.route=S.savedReplay.route.map(p=>({...p}));S.runLevel=S.savedReplay.runLevel;S.replaying=true;S.runStart=performance.now();S.elapsed=0;S.position=S.route[0];S.phase='running';$('banner').hidden=true;$('share').hidden=true;$('next').hidden=true;$('replay').hidden=true;$('routeResult').hidden=true;$('phase').textContent='REPLAY';text(tr('同じルート・同じ時刻の罠を再生中。ミス回数は増えません。'));}
const GOAL_RADIUS=.045,GOAL_CONTACT=GOAL_RADIUS+R;
function goalContact(a,b){const dx=b.x-a.x,dy=b.y-a.y,ox=a.x-currentGoal().x,oy=a.y-currentGoal().y,A=dx*dx+dy*dy,C=ox*ox+oy*oy-GOAL_CONTACT**2;if(C<=0)return 0;if(A===0)return null;const B=2*(ox*dx+oy*dy),D=B*B-4*A*C;if(D<0)return null;const k=(-B-Math.sqrt(D))/(2*A);return k>=0&&k<=1?k:null;}
function moveTo(p,now){if(S.phase!=='drawing')return;const previous=S.route.at(-1),t=(now-S.drawStart)/1000,k=goalContact(previous,p);if(k!==null){const contact={x:previous.x+(p.x-previous.x)*k,y:previous.y+(p.y-previous.y)*k};finish(contact,now,previous.t+(t-previous.t)*k);return;}addPoint(p,t);S.position=p;}
// Optional: set the final public game URL here after publishing.
const GAME_PUBLIC_URL='https://tsubasarock21.github.io/games/After_Line/';
let enteredShareUrl='';
let trialShots=[];
function shotAt(b,t){return{x:b.x+b.vx*(t-b.near),y:b.y+b.vy*(t-b.near)};}
function shotSafe(b,route){for(let i=1;i<route.length;i++){const a=route[i-1],c=route[i],lo=Math.max(a.t,b.start),hi=Math.min(c.t,b.end);if(hi<lo)continue;const p=pointAt([a,c],lo),q=pointAt([a,c],hi),u=shotAt(b,lo),v=shotAt(b,hi),dx=p.x-u.x,dy=p.y-u.y,ex=q.x-v.x-dx,ey=q.y-v.y-dy,k=clamp(-(dx*ex+dy*ey)/(ex*ex+ey*ey||1),0,1);if(Math.hypot(dx+ex*k,dy+ey*k)<R+(b.radius||.009)+.024)return false;}return true;}
function makeTrialShots(route,seed=0){const shots=[],duration=route.at(-1).t,random=rng((Math.round(duration*10000)^seed)>>>0);for(let near=.10+random()*.12;near<duration;near+=.14+random()*.18){const p=pointAt(route,near),base=random()*Math.PI*2;for(let attempt=0;attempt<48;attempt++){const angle=base+attempt*2.399963,speed=.8+random()*2.1,radius=.006+random()*.013,side=attempt%2?1:-1,offset=R+radius+.03+random()*.014,x=p.x-Math.sin(angle)*offset*side,y=p.y+Math.cos(angle)*offset*side,vx=Math.cos(angle)*speed,vy=Math.sin(angle)*speed;let enter=-Infinity,exit=Infinity;for(const [z,v]of[[x,vx],[y,vy]]){if(Math.abs(v)<1e-9){if(z<-.04||z>1.04){enter=1;exit=0;}continue;}const a=(-.04-z)/v,c=(1.04-z)/v;enter=Math.max(enter,Math.min(a,c));exit=Math.min(exit,Math.max(a,c));}const b={x,y,vx,vy,radius,near,start:Math.max(0,near+enter),end:Math.min(duration,near+exit)};if(b.start<=near&&b.end>=near&&shotSafe(b,route)){shots.push(b);break;}}}return shots;}
function shareUrl(){const candidates=[GAME_PUBLIC_URL,enteredShareUrl];try{candidates.push(window.top.location.href);}catch(_){}candidates.push(document.referrer,window.location.href);for(const raw of candidates){if(!raw)continue;try{const u=new URL(raw);if(!/^https?:$/.test(u.protocol)||/^(localhost|127\.0\.0\.1)$/.test(u.hostname))continue;if(/(^|\.)codepen\.io$/.test(u.hostname)&&/\/(pen|full|debug)\//.test(u.pathname))return u.origin+u.pathname;if(!/(^|\.)(cdpn\.io|codepen\.io|codepenassets\.com)$/.test(u.hostname))return u.origin+u.pathname;}catch(_){}}return '';}
function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t^=t+Math.imul(t^t>>>7,61|t);return((t^t>>>14)>>>0)/4294967296;};}
function pointAt(route,t){if(t<=0)return route[0];let lo=0,hi=route.length-1;while(lo+1<hi){const m=(lo+hi)>>1;if(route[m].t<=t)lo=m;else hi=m;}const a=route[lo],b=route[hi];const k=clamp((t-a.t)/Math.max(.000001,b.t-a.t),0,1);return{x:a.x+(b.x-a.x)*k,y:a.y+(b.y-a.y)*k};}
function levelFor(seed,stage){const random=rng(seed),pair=endpoints(random),count=stage<=2?1:2,route=[{...pair.start,t:0},{x:.38+random()*.24,y:.38+random()*.24,t:4},{...pair.goal,t:8}],walls=[],gates=[];for(let i=0;i<count;i++){const axis=stage<=7?'h':stage<=9?(i===0?'h':'v'):(random()<.5?'h':'v'),t=count===1?3.4+random():2.4+i*3,center=pointAt(route,t),half=Math.max(.085,.13-stage*.003),y=center.y,x=center.x;gates.push({axis,x:axis==='h'?x-half:x,y:axis==='h'?y:y-half,w:half*2,arrival:t,period:2.9+random()*.9,safe:Math.max(.65,1.05-stage*.025)});if(axis==='h')walls.push({x:0,y:y-.012,w:x-half,h:.024},{x:x+half,y:y-.012,w:1-x-half,h:.024});else walls.push({x:x-.012,y:0,w:.024,h:y-half},{x:x-.012,y:y+half,w:.024,h:1-y-half});}const checkpoints=[{...pair.start,t:0}];for(const g of gates.slice().sort((a,b)=>a.arrival-b.arrival)){const center={x:g.axis==='h'?g.x+g.w/2:g.x,y:g.axis==='h'?g.y:g.y+g.w/2},dx=g.axis==='v'?Math.sign(pair.goal.x-pair.start.x)*.055:0,dy=g.axis==='h'?Math.sign(pair.goal.y-pair.start.y)*.055:0;checkpoints.push({x:center.x-dx,y:center.y-dy,t:g.arrival-.35},{...center,t:g.arrival},{x:center.x+dx,y:center.y+dy,t:g.arrival+.35});}checkpoints.push({...pair.goal,t:8});route.splice(0,route.length,...checkpoints);const shots=(stage===6||stage===7||stage===10)?makeTrialShots(route,seed).filter((_,i)=>i%6===2):[];return{seed,walls,gates,reference:route,shots,start:pair.start,goal:pair.goal};}
function gateOn(g,t){const p=g.period,d=((t-g.arrival+p/2)%p+p)%p-p/2;return Math.abs(d)>g.safe;}
function collides(p,t,level){if((level.trackerFlights||[]).some(f=>t>=f.spawn&&t<=f.end&&dist(p,trackerAt(f,t))<R+f.radius))return'tracker';if((level.disks||[]).some(d=>diskHit(p,t,d)))return'disk';if((level.blooms||[]).some(b=>bloomRadius(b,t)>0&&dist(p,b)<bloomRadius(b,t)+R))return'bloom';if(level.walls.some(w=>p.x+R>w.x&&p.x-R<w.x+w.w&&p.y+R>w.y&&p.y-R<w.y+w.h))return'wall';if(level.gates.some(g=>gateOn(g,t)&&(g.axis==='v'?Math.abs(p.x-g.x)<R+.008&&p.y+R>g.y&&p.y-R<g.y+g.w:Math.abs(p.y-g.y)<R+.008&&p.x+R>g.x&&p.x-R<g.x+g.w)))return'laser';if((level.shots||[]).some(b=>t>=b.start&&t<=b.end&&dist(p,shotAt(b,t))<R+(b.radius||.009)+.018))return'bullet';return null;}
// Subdivide each recorded line in both space and time, including stationary periods.
function collisionBetween(route,from,to,level){let bulletHit=null;for(const b of level.shots||[]){for(let i=1;i<route.length;i++){const lo=Math.max(from,route[i-1].t,b.start),hi=Math.min(to,route[i].t,b.end);if(hi<lo)continue;const p=pointAt(route,lo),q=pointAt(route,hi),a=shotAt(b,lo),z=shotAt(b,hi),dx=p.x-a.x,dy=p.y-a.y,vx=q.x-z.x-dx,vy=q.y-z.y-dy,A=vx*vx+vy*vy,B=2*(dx*vx+dy*vy),C=dx*dx+dy*dy-(R+(b.radius||.009)+.018)**2,D=B*B-4*A*C;let k=null;if(C<=0)k=0;else if(A>0&&D>=0){const root=(-B-Math.sqrt(D))/(2*A);if(root>=0&&root<=1)k=root;}if(k!==null){const t=lo+(hi-lo)*k;if(!bulletHit||t<bulletHit.t)bulletHit={p:pointAt(route,t),t,type:'bullet'};}}}const cuts=[from,...route.filter(p=>p.t>from&&p.t<to).map(p=>p.t),to];for(let c=1;c<cuts.length;c++){const a=pointAt(route,cuts[c-1]),b=pointAt(route,cuts[c]);const n=Math.max(1,Math.ceil(dist(a,b)/.002),Math.ceil((cuts[c]-cuts[c-1])/.004));for(let i=0;i<=n;i++){const k=i/n,t=cuts[c-1]+(cuts[c]-cuts[c-1])*k,p={x:a.x+(b.x-a.x)*k,y:a.y+(b.y-a.y)*k};const type=collides(p,t,level);if(type)return bulletHit&&bulletHit.t<t?bulletHit:{p,t,type};}}return bulletHit;}
function text(message){messageDescriptor=translationMemo.get(message)||{key:message,values:{}};$('message').textContent=tr(messageDescriptor.key,messageDescriptor.values);}
function ready(){globalThis.LabMetrics?.end();release();S.runLevel=null;hideRouteResult();S.replaying=false;S.previewStart=performance.now();$('replay').hidden=!S.savedReplay;S.phase='ready';S.elapsed=0;S.position=currentStart();S.route=[];$('banner').hidden=true;$('next').hidden=true;$('share').hidden=true;$('phase').textContent=tr('ルートを描こう');text(S.easy?tr('EASY：罠の動きが薄く見えます。描き始めると罠の時計も0秒に戻ります。'):S.mode==='normal'&&S.revealed?tr('罠は前回と同じ。通り道や、途中で待つ時間を変えてみよう。'):tr('STARTの光を押したまま、GOALの円に触れるまでなぞろう。'));}
let menuMode='trial';
function chooseMode(mode){menuMode=mode==='normal'?'normal':'trial';const normal=menuMode==='normal';$('trial').classList.toggle('selected',!normal);$('normal').classList.toggle('selected',normal);$('trial').setAttribute('aria-pressed',String(!normal));$('normal').setAttribute('aria-pressed',String(normal));$('stageGroup').hidden=!normal;$('stageStatus').hidden=!normal;updateProgress();$('modeHint').textContent=normal?tr('全22ステージから自由に選べます。配置とタイミングを読んで突破しよう。'):tr('まずは、必ずギリギリ回避するトライアルから。');$('startGame').innerHTML=(normal?tr('このステージを始める'):tr('トライアルを始める'))+' <span>→</span>';}
function showScreen(game){$('homeScreen').hidden=game;$('gameScreen').hidden=!game;document.body.dataset.screen=game?'game':'home';if(document.scrollingElement){document.scrollingElement.scrollTop=0;document.scrollingElement.scrollLeft=0;}(game?$('gameTitle'):$('homeTitle')).focus({preventScroll:true});}
function startGame(){select(menuMode,Number($('stageSelect').value));showScreen(true);}
function home(){if(S.phase==='drawing'||S.phase==='running')ready();release();showScreen(false);chooseMode(S.mode);}
function select(mode,stage=Number($('stageSelect').value)){chooseMode(mode);S.mode=mode;S.stage=mode==='normal'?clamp(Math.trunc(Number(stage))||1,1,MAX_STAGE):1;S.tries=0;S.failures=0;S.easy=false;S.savedReplay=null;S.revealed=false;S.lastRoute=[];S.seed=(Date.now()^Math.floor(Math.random()*0x7fffffff))>>>0;S.level=loadLevel(S.seed,S.stage);$('trial').classList.toggle('selected',mode==='trial');$('normal').classList.toggle('selected',mode==='normal');if(mode==='normal')$('stageSelect').value=String(S.stage);updateProgress();$('stage').textContent=mode==='trial'?'TRIAL':'STAGE '+String(S.stage).padStart(2,'0');$('levelName').textContent=mode==='trial'?tr('必ずギリギリ回避'):stageTitle(S.stage);ready();}
$('stageSelect').onchange=()=>chooseMode('normal');
function release(){if(S.pointer!==null){try{canvas.releasePointerCapture(S.pointer);}catch(_){}S.pointer=null;}}
function addPoint(p,t){const last=S.route.at(-1);if(!last||t>last.t)S.route.push({x:p.x,y:p.y,t});else if(t===last.t){last.x=p.x;last.y=p.y;}}
function begin(p,now,id){if(S.phase!=='ready'||dist(p,currentStart())>.085)return false;S.phase='drawing';S.pointer=id;S.drawStart=now;S.route=[{...currentStart(),t:0}];S.position=currentStart();S.elapsed=0;$('replay').hidden=true;$('phase').textContent=S.easy?tr('EASY・なぞって記録中'):tr('なぞって記録中');text(tr('速さも、止まった時間も記録しています。GOALの円に触れると自動で再生します。'));return true;}
function finish(p,now,endTime=(now-S.drawStart)/1000){if(S.phase!=='drawing')return;const t=Math.max(.000001,endTime);addPoint(p,t);release();if(t>LIMIT||dist(p,currentGoal())>GOAL_CONTACT+1e-9){ready();text(t>LIMIT?tr('20秒を超えました。もう一度STARTから描こう。'):tr('GOALの円に触れるまで、指を離さずになぞってください。'));return;}trialShots=S.mode==='trial'?makeTrialShots(S.route):[];S.runLevel=resolveRunLevel(S.level,S.route);S.runStart=now;S.elapsed=0;S.phase='running';S.position=currentStart();S.tries++;globalThis.LabMetrics?.start({mode:S.mode,stage:S.mode==='trial'?0:S.stage});$('phase').textContent=tr('未来を再生中');text(S.mode==='trial'?tr('あなたのルートに合わせて、ギリギリの回避を演出中！'):tr('罠が出現！ 描いた速さのまま走ります。'));}
function result(clear,reason){const complete=clear&&S.mode==='normal'&&S.stage===MAX_STAGE;const wasReplay=S.replaying,wasEasy=S.easy;if(!wasReplay)globalThis.LabMetrics?.end(clear?'clear':'fail');if(!wasReplay){if(clear&&S.mode==='normal')markStageClear(S.stage);if(clear)S.failures=0;else if(S.mode==='normal')S.failures++;S.easy=S.failures>=10;S.savedReplay={route:S.route.map(p=>({...p})),clear,reason,end:S.elapsed,runLevel:S.runLevel,usedEasy:wasEasy};}S.replaying=false;$('replay').hidden=false;S.phase=clear?'clear':'failed';S.revealed=S.mode==='normal';S.lastRoute=S.route.map(p=>({...p}));$('phase').textContent=clear?tr('ゴール到達！'):tr('もう一度挑戦');$('banner').textContent=complete?'ALL CLEAR!':clear?'FUTURE CLEARED':'TRY ANOTHER LINE';$('banner').style.color=clear?'#8affd4':'#ff8d9f';$('banner').hidden=false;$('share').hidden=false;$('next').hidden=!clear||complete;$('next').textContent=S.mode==='trial'?tr('チャレンジへ →'):tr('次のステージ →');text(!clear&&S.easy?tr('10回以上ミスしたのでEASYが有効です。描画中も全ギミックの動きを薄く表示します。'):complete?tr('全22レベルクリア！ おめでとう！ レベル23以降はCOMING SOON。'):clear?(S.mode==='trial'?tr('ギリギリ、大成功！ 次は本物の罠に挑戦しよう。'):tr("{count}回目で突破！ 次は新しい配置に挑戦。",{count:S.tries})):(reason==='laser'?tr('レーザーに接触。光が消えるタイミングに通ろう。'):reason==='tracker'?tr('追尾弾に接触。誘導したあと、切り返すルートを試してみよう。'):reason==='bullet'?tr('弾に接触。発射時刻は同じなので、通るタイミングを変えてみよう。'):reason==='disk'?tr('回転する円に接触。溝の回転に合わせて進んだり待ったりしよう。'):reason==='bloom'?tr('膨らむ円に接触。破裂する前後のタイミングにも気を付けよう。'):tr('壁に接触。見えた隙間を通るルートで再挑戦しよう。')));prepareRouteResult();}
function advance(now){if(S.phase==='drawing'){S.elapsed=(now-S.drawStart)/1000;if(S.elapsed>LIMIT){ready();text(tr('記録は20秒まで。短いルートでも、立ち止まるルートでもOK。'));}else addPoint(S.position,S.elapsed);}else if(S.phase==='running'){const end=S.replaying?S.savedReplay.end:S.route.at(-1).t,t=Math.min(end,(now-S.runStart)/1000);const hit=S.mode==='normal'&&!S.replaying?collisionBetween(S.route,S.elapsed,t,S.runLevel||S.level):null;if(hit){S.elapsed=hit.t;S.position=hit.p;result(false,hit.type);}else{S.elapsed=t;S.position=pointAt(S.route,t);if(t>=end)result(S.replaying?S.savedReplay.clear:true,S.replaying?S.savedReplay.reason:undefined);}}$('clock').textContent=viewTime(now).toFixed(2)+' s';$('assist').hidden=!S.easy;}
function location(e){const r=canvas.getBoundingClientRect();return{x:clamp((e.clientX-r.left)/r.width,.025,.975),y:clamp((e.clientY-r.top)/r.height,.025,.975)};}
canvas.addEventListener('pointerdown',e=>{if(begin(location(e),performance.now(),e.pointerId)){e.preventDefault();canvas.setPointerCapture(e.pointerId);}});
canvas.addEventListener('pointermove',e=>{if(e.pointerId!==S.pointer||S.phase!=='drawing')return;e.preventDefault();moveTo(location(e),performance.now());});
canvas.addEventListener('pointerup',e=>{if(e.pointerId===S.pointer){const now=performance.now();moveTo(location(e),now);if(S.phase==='drawing')finish(location(e),now);}});
function interrupt(){if(S.phase==='drawing'||S.phase==='running'){ready();text(tr('操作を中断しました。同じステージで描き直せます。'));}}
canvas.addEventListener('pointercancel',e=>{if(e.pointerId===S.pointer)interrupt();});canvas.addEventListener('lostpointercapture',()=>{if(S.pointer!==null)interrupt();});document.addEventListener('visibilitychange',()=>{if(document.hidden)interrupt();});
$('replay').onclick=replay;$('trial').onclick=()=>chooseMode('trial');$('normal').onclick=()=>chooseMode('normal');$('startGame').onclick=startGame;$('homeButton').onclick=home;$('retry').onclick=ready;$('next').onclick=()=>{if(S.mode==='trial')return select('normal');if(S.stage>=MAX_STAGE)return;S.stage++;$('stageSelect').value=String(S.stage);updateProgress();S.seed=(S.seed+0x9e3779b9)>>>0;S.level=loadLevel(S.seed,S.stage);S.revealed=false;S.lastRoute=[];S.tries=0;S.failures=0;S.easy=false;S.savedReplay=null;$('stage').textContent='STAGE '+String(S.stage).padStart(2,'0');$('levelName').textContent=stageTitle(S.stage);ready();};
function line(points,color,width=1,dash=[]){if(points.length<2)return;ctx.beginPath();ctx.strokeStyle=color;ctx.lineWidth=width;ctx.setLineDash(dash);points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();ctx.setLineDash([]);}
function circle(p,r,color,fill=true){ctx.beginPath();ctx.arc(p.x,p.y,r,0,Math.PI*2);ctx[fill?'fillStyle':'strokeStyle']=color;fill?ctx.fill():ctx.stroke();}
function viewTime(now){if(S.easy&&S.phase==='ready')return((now-S.previewStart)/1000)%LIMIT;return S.elapsed;}
function draw(){const dpr=Math.min(window.devicePixelRatio||1,3),size=canvas.clientWidth||360,w=Math.round(size*dpr);if(canvas.width!==w||canvas.height!==w){canvas.width=w;canvas.height=w;}ctx.setTransform(w,0,0,w,0,0);ctx.clearRect(0,0,1,1);ctx.fillStyle='#0c1727';ctx.fillRect(0,0,1,1);ctx.lineWidth=.001;ctx.strokeStyle='#1b3043';for(let i=1;i<20;i++){ctx.beginPath();ctx.moveTo(i/20,0);ctx.lineTo(i/20,1);ctx.moveTo(0,i/20);ctx.lineTo(1,i/20);ctx.stroke();}
const preview=S.phase==='ready'||S.phase==='drawing',t=viewTime(performance.now()),showing=S.mode==='normal'&&(S.phase==='running'||S.revealed||S.easy),sceneTime=preview&&!S.easy?0:t;
if(showing){ctx.globalAlpha=preview?.40:1;for(const a of S.level.walls){ctx.fillStyle='#3d5068';ctx.fillRect(a.x,a.y,a.w,a.h);ctx.fillStyle='#7590a8';ctx.fillRect(a.x,a.y,a.w,.003);}for(const g of S.level.gates){const on=gateOn(g,sceneTime),end={x:g.x+(g.axis==='v'?0:g.w),y:g.y+(g.axis==='v'?g.w:0)};line([{x:g.x,y:g.y},end],on&&(!preview||S.easy)?'#ff627e':'#683f56',on&&(!preview||S.easy)?.012:.003,preview&&!S.easy?[.01,.012]:[]);circle({x:g.x,y:g.y},.012,'#ff91a5');circle(end,.012,'#ff91a5');}
for(const d of S.level.disks||[])drawDisk(d,sceneTime);
for(const b of S.level.blooms||[]){const r=bloomRadius(b,sceneTime);if(r>0){circle(b,r,'#d5516c');ctx.lineWidth=.003;circle(b,r,'#ffb8a6',false);circle(b,.012,'#ffe6ce');}else if(sceneTime>=b.pop&&sceneTime<b.pop+.3){ctx.lineWidth=.006;circle(b,b.radius+(sceneTime-b.pop)*.25,'#ffd297',false);}else if(preview&&!S.easy){ctx.lineWidth=.003;circle(b,b.radius,'#815365',false);}}
ctx.globalAlpha=1;}
if(S.lastRoute.length&&S.phase==='ready')line(S.lastRoute,'#597086',.003,[.009,.012]);if(S.route.length)line(S.route,'#70efca55',.007);
for(const [p,label,color]of[[currentStart(),'START','#67eec6'],[currentGoal(),'GOAL','#ffdc8a']]){ctx.lineWidth=.003;circle(p,.045,color,false);circle(p,.032,color+'25');ctx.font='600 .021px sans-serif';ctx.textAlign='center';ctx.fillStyle=color;ctx.fillText(label,p.x,clamp(p.y+(label==='START'?.075:-.065),.025,.975));}
if(S.phase==='running'||(S.easy&&preview)){ctx.globalAlpha=preview?.40:1;for(const b of (S.mode==='trial'?trialShots:S.level.shots)){if(t<b.start||t>b.end)continue;const p=shotAt(b,t),speed=Math.hypot(b.vx,b.vy);line([{x:p.x-b.vx/speed*.018,y:p.y-b.vy/speed*.018},p],'#ff7798',.006);circle(p,b.radius||.009,'#ffd7df');}ctx.globalAlpha=1;}
if(showing){const flights=preview?(S.easy?resolveRunLevel(S.level,S.phase==='drawing'&&S.route.length?S.route:S.level.reference).trackerFlights:[]):(S.runLevel?.trackerFlights||[]);ctx.globalAlpha=preview?.40:1;for(const f of flights){if(t<f.spawn||t>f.end)continue;const p=trackerAt(f,t),tail=f.points.filter(q=>q.t>=t-.20&&q.t<=t);line(tail,t<f.spawn+f.chase?'#ffc884':'#f98eab',.005);circle(p,f.radius,t<f.spawn+f.chase?'#ffcb7d':'#ff81a5');}ctx.globalAlpha=1;}
const p=S.position;circle(p,.034,'#67eec61b');circle(p,R,S.phase==='failed'?'#ff6c8a':'#b9ffe5');circle({x:p.x+.003,y:p.y-.004},.004,'#fff');}
let resultShareEpoch=0,resultImageUrl='';
function hideRouteResult(){resultShareEpoch++;if(resultImageUrl){URL.revokeObjectURL?.(resultImageUrl);resultImageUrl='';}S.shareFile=null;$('routeResult').hidden=true;}
function prepareRouteResult(){const token=++resultShareEpoch,card=$('routeCard'),paint=card.getContext('2d'),record=S.savedReplay;if(!record)return;card.width=1080;card.height=1350;paint.setTransform(1,0,0,1,0,0);paint.fillStyle='#081321';paint.fillRect(0,0,1080,1350);paint.fillStyle='#86edce';paint.font='800 54px sans-serif';paint.fillText('AFTERLINE',80,88);paint.fillStyle='#b2c8d8';paint.font='27px sans-serif';paint.fillText(tr('動的迷路 / ')+(S.mode==='trial'?'TRIAL':'STAGE '+String(S.stage).padStart(2,'0')),80,144);paint.fillStyle=record.clear?'#85f0c7':'#ff9aaf';paint.font='700 31px sans-serif';paint.fillText(record.clear?'CLEAR':'TRY AGAIN',80,196);paint.textAlign='right';paint.fillStyle='#b2c8d8';paint.font='25px sans-serif';paint.fillText(tr("{time} s  /  {count}回目",{time:record.end.toFixed(2),count:S.tries}),1000,193);paint.textAlign='left';
 paint.save();paint.translate(80,230);paint.scale(920,920);paint.fillStyle='#102033';paint.fillRect(0,0,1,1);paint.strokeStyle='#243c50';paint.lineWidth=.001;for(let i=1;i<20;i++){paint.beginPath();paint.moveTo(i/20,0);paint.lineTo(i/20,1);paint.moveTo(0,i/20);paint.lineTo(1,i/20);paint.stroke();}
 const plot=(points,color,width,dash=[])=>{paint.beginPath();paint.setLineDash(dash);paint.lineWidth=width;paint.lineJoin='round';paint.lineCap='round';paint.strokeStyle=color;points.forEach((p,i)=>i?paint.lineTo(p.x,p.y):paint.moveTo(p.x,p.y));paint.stroke();paint.setLineDash([]);};
 plot(record.route,'#668195',.004,[.008,.012]);const traveled=record.route.filter(p=>p.t<=record.end);const stop=pointAt(record.route,record.end);traveled.push(stop);plot(traveled,record.clear?'#7cf0cc':'#ffa1b6',.008);
 for(const [p,label,color]of[[currentStart(),'START','#7cf0cc'],[currentGoal(),'GOAL','#ffe5a1']]){paint.beginPath();paint.arc(p.x,p.y,.045,0,Math.PI*2);paint.strokeStyle=color;paint.lineWidth=.004;paint.stroke();paint.fillStyle=color;paint.font='600 .023px sans-serif';paint.textAlign='center';paint.fillText(label,p.x,clamp(p.y+.075,.025,.97));}
 if(!record.clear){paint.strokeStyle='#ff769c';paint.lineWidth=.009;paint.beginPath();paint.moveTo(stop.x-.018,stop.y-.018);paint.lineTo(stop.x+.018,stop.y+.018);paint.moveTo(stop.x+.018,stop.y-.018);paint.lineTo(stop.x-.018,stop.y+.018);paint.stroke();}else{paint.beginPath();paint.arc(stop.x,stop.y,.017,0,Math.PI*2);paint.fillStyle='#e7fff5';paint.fill();}paint.restore();paint.textAlign='left';paint.fillStyle='#d3e8f2';paint.font='26px sans-serif';paint.fillText(tr('描いた未来を、走り抜けろ。'),80,1216);paint.fillStyle='#7fa1b9';paint.font='21px sans-serif';paint.fillText((shareUrl()||tr('#AFTERLINE #迷路ゲーム #自作ゲーム #個人開発 #ブラウザゲーム')).slice(0,75),80,1278);
 $('routeResult').hidden=false;card.hidden=false;$('routePreview').hidden=true;$('saveRoute').hidden=true;$('share').disabled=true;$('routeNote').textContent=tr('ルート画像を準備しています…');
 const finish=blob=>{if(token!==resultShareEpoch)return;$('share').disabled=false;if(!blob){$('routeNote').textContent=tr('画像を生成できなかったため、文章でシェアできます。');return;}try{S.shareFile=new File([blob],'afterline-'+(S.mode==='trial'?'trial':S.stage)+'.png',{type:'image/png'});}catch(_){S.shareFile=null;}if(resultImageUrl)URL.revokeObjectURL?.(resultImageUrl);resultImageUrl=URL.createObjectURL?.(blob)||'';if(resultImageUrl){$('routePreview').src=resultImageUrl;$('routePreview').hidden=false;card.hidden=true;$('saveRoute').href=resultImageUrl;$('saveRoute').download=S.shareFile?.name||'afterline-route.png';$('saveRoute').hidden=false;}$('routeNote').textContent=tr('対応する共有先には画像も添付します。画像の長押し保存もできます。');};
 try{if(!card.toBlob)throw Error('unsupported');card.toBlob(finish,'image/png');}catch(_){finish(null);}
}
function shareBody(){const outcome=S.phase==='clear'?(S.mode==='normal'&&S.stage===MAX_STAGE?tr("全22レベルクリア！"):tr("クリア！")):tr("ルートを変えて再挑戦！");return tr("share.body",{stage:S.mode==='trial'?tr("トライアル"):tr("share.stage",{count:S.stage}),outcome,time:S.elapsed.toFixed(2)});}
let shareBusy=false;$('share').onclick=async()=>{if(shareBusy)return;shareBusy=true;let message=shareBody(),url=shareUrl();if(!url){const raw=window.prompt(tr('ゲームのURLを自動取得できませんでした。CodePenまたは公開先のURLを入力してください。'));if(raw){try{const u=new URL(raw);if(/^https?:$/.test(u.protocol))url=enteredShareUrl=u.origin+u.pathname;}catch(_){}}if(!url){shareBusy=false;text(tr('共有にはゲームのURLが必要です。もう一度シェアを押してURLを入力してください。'));return;}}message+='\n'+url;
 try{if(navigator.share){if(S.shareFile){try{if(navigator.canShare?.({files:[S.shareFile]})){await navigator.share({title:tr('動的迷路 AFTERLINE'),text:message,files:[S.shareFile]});return;}}catch(e){if(e.name==='AbortError')return;}}try{await navigator.share({title:tr('動的迷路 AFTERLINE'),text:message});return;}catch(e){if(e.name==='AbortError')return;}}if(navigator.clipboard){await navigator.clipboard.writeText(message);text(tr('共有する文章をコピーしました。画像は「画像を保存」から使えます。'));return;}throw Error('copy');}catch(e){if(e.name!=='AbortError'){$('copyText').value=message;$('copyDialog').showModal();}}finally{shareBusy=false;}};$('closeCopy').onclick=()=>$('copyDialog').close();$('langJa').onclick=()=>setLanguage('ja');$('langEn').onclick=()=>setLanguage('en');
window.DynamicMazeCore={state:S,pointAt,levelFor:loadLevel,basicLevelFor:levelFor,diskPath,diskHit,diskSolid,diskMask,diskLocal,bloomRadius,replay,currentGoal,currentStart,MAX_STAGE,trackerFlight,trackerAt,trackingSafe,resolveRunLevel,gateOn,collides,collisionBetween,begin,addPoint,finish,advance,select,ready,chooseMode,startGame,home,setLanguage,getLanguage:()=>language,tr,getClearedStages:()=>[...clearedStages].sort((a,b)=>a-b),START,GOAL,R,GOAL_CONTACT,goalContact,moveTo,makeTrialShots,shotSafe,shotAt,shareUrl,getTrialShots:()=>trialShots,draw,viewTime,prepareRouteResult,shareBody};
select('trial');applyLanguage();showScreen(false);function frame(now){if(!$('gameScreen').hidden){advance(now);draw();}requestAnimationFrame(frame);}requestAnimationFrame(frame);
})();
