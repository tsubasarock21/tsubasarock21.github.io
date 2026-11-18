/* Independent normal/timer saves; wall-clock timer with explicit pause. */
(()=>{'use strict';const A=PyramidApp,M=A.M,$=A.$,keys={normal:'pyramid.foreman.v1',timer:'pyramid.timer.v1'};
const timerText=n=>{const seconds=Math.max(0,Math.ceil(n)),h=Math.floor(seconds/3600),m=Math.floor(seconds%3600/60),s=seconds%60;return (h?h+':'+String(m).padStart(2,'0'):String(m).padStart(2,'0'))+':'+String(s).padStart(2,'0')};A.timerText=timerText;
function fresh(mode,owner){const s=M.create();s.mode=mode;s.playerName=owner||'';s.started=mode==='normal'&&!!s.playerName;if(mode==='timer'){s.workers=800;s.campPeak=800;}return s;}
function switchMode(mode){if(!keys[mode]||A.state.mode===mode)return;A.now();A.save();const owner=A.state.playerName;let incoming;try{incoming=M.decode(localStorage.getItem(keys[mode]))}catch{}incoming||=fresh(mode,owner);incoming.mode=mode;
 globalThis.LabMetrics?.end('switch');for(const d of document.querySelectorAll('dialog[open]'))d.close();A.renderer.reset();A.KEY=keys[mode];A.state=incoming;try{localStorage.setItem('pyramid.mode.v1',mode)}catch{A.saveOK=false;}
 A.celebrateStart=null;A.nextAt=null;A.winOpened=false;A.archiveKey=null;A.pausedAway=false;M.advance(incoming,Date.now(),false);incoming.lastSeen=incoming.elapsed;
 $('gameShareNotice').textContent='';$('shareNotice').textContent='';A.notice(mode==='timer'?'時間を決めてスタート。設定時間でピラミッドが完成します。':'通常モードの現場に戻りました。');A.save();A.update();if(!incoming.playerName)$('rename').click();if(incoming.started&&!M.completed(incoming))globalThis.LabMetrics?.start({mode:mode==='timer'?'timer':'endless'});
}
$('modeNormal').onclick=()=>switchMode('normal');$('modeTimer').onclick=()=>switchMode('timer');
function setMinutes(value){const n=Number(value);if(!Number.isInteger(n)||n<1||n>1440){$('timerError').hidden=false;return false;}if(A.state.mode!=='timer'||A.state.started)return false;A.state.timerDuration=n*60;$('timerError').hidden=true;A.save();A.update();return true;}
$('timerMinutes').addEventListener('change',e=>setMinutes(e.target.value));
for(const b of document.querySelectorAll('[data-minutes]'))b.onclick=()=>{if(setMinutes(b.dataset.minutes))$('timerMinutes').value=b.dataset.minutes;};
$('timerMain').onclick=()=>{if(A.state.mode!=='timer')return;A.now();const s=A.state;if(M.completed(s))return;if(!s.started){if(!setMinutes($('timerMinutes').value))return;if(!s.playerName){$('rename').click();return;}s.started=true;s.timerRunning=true;s.lastWall=Date.now();globalThis.LabMetrics?.start({mode:'timer'});A.notice('タイマー開始。'+s.timerDuration/60+'分でピラミッドが完成します。');}else{s.timerRunning=!s.timerRunning;A.notice(s.timerRunning?'タイマーを再開しました。':'タイマーを一時停止しました。');}globalThis.PyramidAudio?.effect('boing');A.save();A.update();};
$('timerReset').onclick=()=>$('restartGame').click();
const update=A.update;A.update=()=>{update();const s=A.state,timer=s.mode==='timer',done=M.completed(s),paused=timer&&s.started&&!s.timerRunning&&!done;
 document.body.classList.toggle('timer-mode',timer);document.body.classList.toggle('timer-paused',paused);$('modeNormal').setAttribute('aria-pressed',String(!timer));$('modeTimer').setAttribute('aria-pressed',String(timer));$('timerSettings').hidden=!timer;$('timerDisplay').hidden=!timer;$('timerActions').hidden=!timer;
 $('timerMain').disabled=done;$('timerMain').querySelector('strong').textContent=!s.started?'開始':s.timerRunning?'一時停止':'再開';$('timerMain').querySelector('.round-icon').textContent=s.timerRunning?'Ⅱ':'▶';$('timerMain').setAttribute('aria-label',!s.started?'タイマーを開始':s.timerRunning?'タイマーを一時停止':'タイマーを再開');
 $('timerReset').disabled=!s.started;$('timerMinutes').disabled=s.started;for(const b of document.querySelectorAll('[data-minutes]')){b.disabled=s.started;b.setAttribute('aria-pressed',String(Number(b.dataset.minutes)*60===s.timerDuration));}
 if(document.activeElement!==$('timerMinutes'))$('timerMinutes').value=s.timerDuration/60;
 $('timerClock').textContent=timerText(s.timerDuration-s.elapsed);$('timerState').textContent=done?'完成！':!s.started?'スタート待ち':paused?'一時停止中':'完成まで';$('timerDurationLabel').textContent='設定 '+s.timerDuration/60+'分';
 $('modeDescription').textContent=timer?'設定時間で完成するタイマー。お世話による時間の変化はありません。':'おっさんを雇い、お世話しながらピラミッドを建てます。';
 $('nextSite').textContent=timer?'次のタイマーを設定する':'次の現場へ →';$('restartDialog').querySelector('h2').textContent=timer?'タイマーをリセットしますか？':'この現場をやり直しますか？';$('restartDialog').querySelector('p').textContent=timer?'今のタイマーの進捗を戻し、時間を設定し直せる状態にします。通常モードのセーブ・王の名前・所持カード・完成履歴は残ります。':'今の現場の石・人数・宿営地・経過時間をリセットします。王の名前・完成履歴・所持カードは残ります。同じ現場の登用抽選はやり直しません。';
 if(!timer)document.querySelector('.leader-rules').textContent='王様はオーナー。2基目以降の序盤に一回、自動でカードを引きます。任命後は完成まで固定。魅力は募集人数にわずかに影響します。';
 if(timer){document.querySelector('.leader-rules').textContent='所持カードと完成履歴はモードごとに保存します。タイマーでは、リーダーの魅力で完成時間は変わりません。';$('phaseLabel').textContent=done?'タイマー完了':paused?'一時停止':!s.started?'時間を設定':'タイマー建設中';$('clockLabel').textContent='タイマー · 第'+s.siteNumber+'基';$('phaseCountdown').textContent=done?'設定時間になりました':!s.started?'下の開始ボタンから':paused?'再開するまで停止':'残り '+timerText(s.timerDuration-s.elapsed);$('sceneCaption').textContent=done?'王の名を、石に刻みました。':paused?'時計を止めて、ひと休み。':'少しずつ、完成に近づきます。';$('rateLabel').textContent='設定 '+s.timerDuration/60+'分で完成';$('careLabel').textContent='人数・魅力・夜・作業員の移動で、完成までの時間は変わりません。';$('hireBonus').hidden=true;$('nightNote').hidden=true;if(!s.started)$('notice').textContent='時間を決めたら、画面内の「開始」を押してください。';}
};
})();
