/* 石を積む v0.7.0 — simple actions and the next construction site. */
(() => {
  "use strict";
  const A = PyramidApp,
    { M, $, fmt } = A;
  let lastFrame = 0,
    lastPaint = 0,
    pauseStamp = 0;
  function next() {
    const n = M.nextSite(A.state, Date.now());
    if (!n) return;
    for(const id of ["leaderArrival","leaderCardDialog","leaderCollection"])$(id)?.close();
    A.state = n;
    globalThis.LabMetrics?.start({mode:A.state.mode==='timer'?'timer':'endless'});
    A.celebrateStart = null;
    A.nextAt = null;
    A.winOpened = false;
    A.renderer.reset();
    $("win").close();
    $("shareNotice").textContent = "";
    A.notice(
      n.mode==='timer'?'次のタイマーを準備しました。時間を設定してスタートしてください。':`第${n.siteNumber}現場へ。${M.royalName(n)}、今回も石から始めましょう。`,
    );
    A.save();
    A.update();
  }
  function showName() {
    const s = A.state;
    $("nameInput").value = s.playerName;
    $("startSite").textContent = s.playerName
      ? "この名前を刻む →"
      : "この名前で、工事を始める →";
    if (!$("nameDialog").open) $("nameDialog").showModal();
  }
  $("rename").onclick = showName;
  $("nameDialog").addEventListener("cancel", (e) => {
    if (!A.state.playerName) e.preventDefault();
  });
  $("nameForm").onsubmit = (e) => {
    e.preventDefault();
    A.now();
    if (!M.setName(A.state, $("nameInput").value)) {
      $("nameError").hidden = false;
      return;
    }
    globalThis.PyramidAudio?.effect("boing");
    $("nameError").hidden = true;
    $("nameDialog").close();
    A.notice(`${M.royalName(A.state)}、工事を始めましょう。`);
    A.save();
    A.update();
    if (!M.completed(A.state) && !globalThis.LabMetrics?.active) globalThis.LabMetrics?.start({mode:A.state.mode==='timer'?'timer':'endless'});
  };
  for (const type of ["hire", "pay", "feed"])
    $(type).addEventListener("click", () => {
      A.now();
      const r = M.act(A.state, type);
      if (!r.ok) {
        A.update();
        return;
      }
      if (type === "hire")
        A.notice(
          `${fmt(r.count)}人がやってきました！${r.bonus ? "UFOの約束、ちゃんと届きました。" : "「石を積む仕事と聞いています。」"}`,
        );
      if (type === "pay")
        A.notice(
          `お給料を${fmt(A.state.workers)}人に配りました。「責任者、忘れてなかった！」`,
        );
      if (type === "feed")
        A.notice(
          `パンと飲み物を${fmt(A.state.workers)}人に配りました。みんなのおなかが満たされました。`,
        );
      globalThis.PyramidAudio?.effect("boing");
      A.renderer.setEffect(type);
      A.save();
      A.update();
    });
  for(let slot=0;slot<3;slot++) $(slot===0?"ufo":"ufo"+slot).onclick = (e) => {
    e.stopPropagation();
    A.now();
    const r = M.claimUfo(A.state, Math.random, slot);
    if (!r.ok) return;
    A.notice(
      r.reward === "cheer" ? "UFOが完成を応援しています。タイマーの終了時刻は変わりません。" : r.reward === "double"
        ? "UFOの約束：明日の採用人数が2倍！最大2,000人です！"
        : r.reward === "fixed1000"
          ? (r.retained ? "1,000人のお誘いも来ました。明日の人数2倍の約束はそのまま！" : "UFOの約束：明日の採用は1,000人固定です！")
          : `UFOが石を${fmt(r.stones)}個、積んで帰りました。`,
    );
    globalThis.PyramidAudio?.effect("ufo");
    A.renderer.burst();
    A.save();
    A.update();
  };
  $("closeWelcome").onclick = () => {
    $("welcome").close();
    A.update();
  };
  $("nextSite").onclick = next;
  $("shareResult").onclick = async () => {
    A.nextAt=Infinity;
    try{await PyramidShare.share();}finally{A.nextAt=A.state.mode==='timer'?null:performance.now()+5000;if(A.state.mode==='timer')$('nextCountdown').textContent='次のタイマーは、準備ができたら始めてください。';}
  };
  $("shareGame").onclick = async () => {
    const s=A.state, text=`${s.mode==='timer'?'ピラミッドタイマー。':'石を積む。'}おっさん${fmt(s.workers)}人と、ピラミッド建設中。\n完成度 ${(s.stones/M.TARGET*100).toFixed(2)}%\n#石を積む #放置ゲーム`,
      url="https://tsubasarock21.github.io/games/Pyramid/";
    try {
      if(navigator.share) await navigator.share({title:"石を積む",text,url});
      else {await navigator.clipboard.writeText(text+"\n"+url);$("gameShareNotice").textContent="シェア用の文章とURLをコピーしました。";}
    } catch(e) {if(e.name!=="AbortError") $("gameShareNotice").textContent=text+"\n"+url;}
  };
  $("restartGame").onclick = () => $("restartDialog").showModal();
  $("cancelRestart").onclick = () => $("restartDialog").close();
  $("confirmRestart").onclick = () => {
    A.now();
    const old=A.state;
    // A completed monument may already be waiting for its celebration.
    M.recordCompletion(old);
    const n=M.create();
    n.mode=old.mode;n.timerDuration=old.timerDuration;n.timerRunning=false;if(n.mode==='timer'){n.workers=800;n.campPeak=800;}
    n.playerName=old.playerName;n.started=old.mode==='timer'?false:old.started;n.monuments=old.monuments.map(m=>({...m}));
    n.siteNumber=M.completed(old)?old.siteNumber+1:old.siteNumber;
    n.leaderCards={...old.leaderCards};n.pendingBonus=!!old.pendingBonus;
    if(n.siteNumber===old.siteNumber){n.seed=old.seed;n.leaderDrawn=old.leaderDrawn;n.leaderEvent=old.leaderEvent?{...old.leaderEvent}:null;}
    globalThis.LabMetrics?.end("abandon");
    A.state=n;A.celebrateStart=null;A.nextAt=null;A.winOpened=false;
    A.renderer.reset();globalThis.PyramidLife?.reset();
    $("win").close();$("welcome").close();$("restartDialog").close();
    $("shareNotice").textContent="";$("gameShareNotice").textContent="";
    A.notice("ふりだしから、また一つずつ積みましょう。");A.save();A.update();
    if(n.started) globalThis.LabMetrics?.start({mode:A.state.mode==='timer'?'timer':'endless'});
  };
  function leave() {
    if (A.pausedAway) return;
    M.advance(A.state, Date.now(), true);
    A.state.lastSeen = A.state.elapsed;
    A.pausedAway = true;
    pauseStamp = performance.now();
    A.save();
  }
  function arrive() {
    if (!A.pausedAway) return;
    const r = M.advance(A.state, Date.now(), false);
    A.state.lastSeen = A.state.elapsed;
    A.pausedAway = false;
    const gap = performance.now() - pauseStamp;
    if (A.celebrateStart !== null) A.celebrateStart += gap;
    if (A.nextAt !== null && Number.isFinite(A.nextAt)) A.nextAt += gap;
    if (r.seconds > 10)
      A.notice(
        `留守中に石を${fmt(r.stones)}個積みました。${r.quit ? `${fmt(r.quit)}人が退職しました。` : ""}`,
      );
    A.save();
    A.update();
  }
  document.addEventListener("visibilitychange", () =>
    document.hidden ? leave() : arrive(),
  );
  addEventListener("pagehide", leave);
  addEventListener("pageshow", () => {
    if (!document.hidden) arrive();
  });
  addEventListener("storage", (e) => {
    if (e.key !== A.KEY || !e.newValue) return;
    const incoming = M.decode(e.newValue);
    if (
      incoming &&
      (incoming.siteNumber > A.state.siteNumber ||
        incoming.lastWall > A.state.lastWall)
    ) {
      if (incoming.siteNumber !== A.state.siteNumber) {
        A.celebrateStart = null;
        A.nextAt = null;
        A.winOpened = false;
        A.renderer.reset();
        $("win").close();
      }
      A.state = incoming;
      A.state.lastSeen = A.state.elapsed;
      A.update();
    }
  });
  function frame(stamp) {
    const dt = Math.min(0.1, (stamp - lastFrame) / 1000 || 0);
    lastFrame = stamp;
    if (!document.hidden) {
      A.now();
      globalThis.PyramidLife?.tick(dt);
      if (
        A.celebrateStart !== null &&
        !A.state.celebrationDone &&
        stamp - A.celebrateStart >= 10000
      ) {
        A.state.celebrationDone = true;
        A.save();
        A.update();
      }
      if (A.nextAt !== null) {
        $("nextCountdown").textContent = Number.isFinite(A.nextAt)
          ? `${Math.max(0, Math.ceil((A.nextAt - stamp) / 1000))}秒後、次の現場へ進みます。`
          : "シェアが終わるまで待機中。";
        if (stamp >= A.nextAt) next();
      }
      if (stamp - A.lastUI > 250) {
        A.update();
        A.lastUI = stamp;
      }
      if (stamp - lastPaint > 33) {
        const age =
          A.celebrateStart !== null && !A.state.celebrationDone
            ? (stamp - A.celebrateStart) / 1000
            : null;
        A.renderer.paint(stamp / 1000, dt, age);
        lastPaint = stamp;
      }
      if (stamp - A.saveStamp > 5000) A.save();
    }
    requestAnimationFrame(frame);
  }
  if (!A.state.playerName) showName();
  else if (
    A.absence > 15 &&
    (A.away.stones >= 1 || A.away.quit || A.awayRatio < 0.95)
  ) {
    $("offlineReport").textContent = A.state.mode==='timer'?`タイマーの経過を反映しました。\n${M.completed(A.state)?'設定時間になり、ピラミッドが完成しました。':'完成まで、残り '+A.timerText(A.state.timerDuration-A.state.elapsed)}\n\n人数や夜で終了時刻は変わりません。`:
      `留守中：${A.gameTime(A.absence)}\n積んだ石：${fmt(A.away.stones)}個${A.away.quit ? "\n退職したおっさん：" + fmt(A.away.quit) + "人" : ""}\n\n`;
    $("welcome").showModal();
  }
  if(A.state.started && !M.completed(A.state)) globalThis.LabMetrics?.start({mode:A.state.mode==='timer'?'timer':'endless'});
  A.save();
  A.update();
  A.renderer.paint(performance.now() / 1000, 0);
  requestAnimationFrame(frame);
})();
