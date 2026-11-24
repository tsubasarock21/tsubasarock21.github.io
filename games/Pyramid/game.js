/* 石を積む v0.7.2 — local save and interface. */
globalThis.LabPageConfig = { game: "Pyramid", version: "0.7.2" };
(() => {
  "use strict";
  const M = PyramidModel,
    $ = (id) => document.getElementById(id),
    KEY = (()=>{try{return localStorage.getItem('pyramid.mode.v1')==='timer'?'pyramid.timer.v1':'pyramid.foreman.v1'}catch{return 'pyramid.foreman.v1'}})();
  let state,
    saveOK = true;
  try {
    state = M.decode(localStorage.getItem(KEY));

  } catch (_) {
    saveOK = false;
  }
  state ||= M.create();
  if(KEY==='pyramid.timer.v1'){state.mode='timer';if(!state.started){state.workers=800;state.campPeak=800;}}
  const away = M.advance(state, Date.now(), false),
    absence = state.elapsed - state.lastSeen,
    awayRatio = M.attendance(state);
  state.lastSeen = state.elapsed;
  const A = {
    M,
    $,
    KEY,
    state,
    saveOK,
    away,
    absence,
    awayRatio,
    saveStamp: 0,
    lastUI: 0,
    pausedAway: false,
    celebrateStart: null,
    nextAt: null,
    winOpened: false,
    archiveKey: "",
    nameWasEmpty: !state.playerName,
  };
  const fmt = (n) => Math.floor(n).toLocaleString("ja-JP");
  A.fmt = fmt;
  A.gameTime = (t) =>
    `${Math.floor(t / M.DAY)}日 ${Math.floor(((t % M.DAY) / M.DAY) * 24)}時間`;
  A.notice = (text) => {
    $("notice").textContent = text;
  };
  A.save = () => {
    try {
      localStorage.setItem(A.KEY, JSON.stringify(A.state));
      A.saveOK = true;
    } catch (_) {
      A.saveOK = false;
    }
    $("storageWarning").hidden = A.saveOK;
    A.saveStamp = performance.now();
  };
  A.now = () => {
    const r = M.advance(A.state, Date.now(), !document.hidden && !A.pausedAway);
    if (r.quit)
      A.notice(
        `給料が届かず、${fmt(r.quit)}人が退職しました。給料を配って、これからの離職を防げます。`,
      );
    return r;
  };
  A.updateArchive = () => {
    const list = A.state.monuments,
      key = list.map((m) => m.site + ":" + m.name).join("|");
    if (A.archiveKey === key) return;
    A.archiveKey = key;
    $("monuments").hidden = !list.length;
    $("monumentList").replaceChildren();
    for (const m of list.slice(-12).reverse()) {
      const item = document.createElement("div");
      item.className = "monument";
      const icon = document.createElement("span");
      icon.className = "monument-icon";
      icon.textContent = "▲";
      const title = document.createElement("strong");
      title.textContent = m.name.endsWith("王") ? m.name : m.name + "王";
      const small = document.createElement("small");
      small.textContent = `第${m.site}現場 ／ ${A.gameTime(m.time)}`;
      item.append(icon, title, small);
      $("monumentList").append(item);
    }
  };
  A.prepareEnding = () => {
    const s = A.state;
    if (!M.completed(s) || !s.playerName) return;
    M.recordCompletion(s);
    globalThis.LabMetrics?.end("clear");
    if ($("welcome").open || $("nameDialog").open) return;
    if (!s.celebrationDone && A.celebrateStart === null) {
      A.celebrateStart = performance.now();
      if(s.mode==='timer')globalThis.PyramidAudio?.effect("complete");
      A.notice(
        `${M.royalName(s)}のピラミッド、完成！おっさんたちが大喜びしています。`,
      );
      A.save();
    }
    if (s.celebrationDone && !A.winOpened) {
      A.winOpened = true;
      $("winTitle").textContent = M.royalName(s) + "のピラミッド。";
      $("winTime").textContent = A.gameTime(s.doneAt);
      $("winCrew").textContent =
        `${fmt(s.workers)}人で完成 ／ UFOの協力 ${s.ufoHits}回`;
      $("completionNote").textContent =
        "このピラミッドも、王の名とともに記録に残りました。";
      A.nextAt = s.mode==='timer'?null:performance.now() + 5000;
      if(s.mode==='timer'){
        $("winTime").textContent=A.timerText(s.timerDuration);
        $("completionNote").textContent='設定した時間で、ピラミッドが完成しました。';
        $("nextCountdown").textContent='次のタイマーは、準備ができたら始めてください。';
      }
      $("nextSite").textContent=s.mode==='timer'?'次のタイマーを設定する':'次の現場へ →';
      $("win").showModal();
      A.save();
    }
  };
  A.update = () => {
    const s = A.state,
      d = M.day(s),
      night = M.night(s),
      done = M.completed(s),
      phase = s.elapsed % M.DAY,
      remaining = Math.max(1, Math.ceil(M.DAY - phase)),
      camp = M.campFor(s);
    document.body.classList.toggle("game-night", night);
    document.body.classList.toggle(
      "celebrating",
      done && A.celebrateStart !== null && !s.celebrationDone,
    );
    $("playerLabel").textContent = s.playerName
      ? M.royalName(s)
      : "名前を決める";
    $("rename").disabled = done;
    $("clockLabel").textContent =
      `第${s.siteNumber}現場・建設 ${fmt(d + 1)}日目`;
    $("phaseLabel").textContent = done
      ? "工事完了"
      : night
        ? (M.ufoAt(s).rush ? "UFOラッシュ！" : "夜のおやすみ")
        : "昼のお仕事";
    $("skyClock").hidden=done;
    $("skySeconds").textContent=night?remaining:Math.max(1,Math.ceil(M.LIGHT-phase));
    $("skyLabel").textContent=night?'朝まで':'夜まで';
    $("skyClock").setAttribute('aria-label',(night?'朝まで':'夜まで')+$("skySeconds").textContent+'秒');
    $("skyClock").style.top=($("scene").getBoundingClientRect().height*.17)+'px';
    $("nightNote").hidden = !night;
    $("completeBadge").hidden = !done;
    $("completedKing").textContent = s.playerName ? M.royalName(s) : "";
    $("phaseCountdown").textContent = done
      ? "おつかれさまでした"
      : night
        ? `朝まで ${remaining}秒`
        : `夜まで ${Math.ceil(M.LIGHT - phase)}秒`;
    $("sceneCaption").textContent = done
      ? "名前を、石に刻みました。"
      : night
        ? "石は明日もあります。おやすみなさい。"
        : M.effectiveWorkers(s)<s.workers
          ? `${fmt(s.workers-M.effectiveWorkers(s))}人分、${s.distractions.some(w=>w.kind==='sulk')?'今日は拗ね休みです。':'現場を離れています。'}`
          : s.workers > 1000
          ? "だいぶ大所帯になってきました。"
          : "今日も、地道にやっております。";
    $("progressPercent").innerHTML =
      (done ? 100 : Math.min(99.99, (s.stones / M.TARGET) * 100)).toFixed(2) +
      "<span>%</span>";
    $("progressFill").style.width = (s.stones / M.TARGET) * 100 + "%";
    $("stoneCount").textContent = fmt(s.stones);
    $("crewCount").innerHTML = fmt(s.workers) + "<small>人</small>";
    $("activeCount").innerHTML =
      fmt(done || night ? 0 : M.effectiveWorkers(s)) + "<small>人</small>";
    $("rateLabel").textContent = done
      ? "100,000個、積みました。"
      : night
        ? "夜は工事をお休み"
        : `画面のおっさん ${M.workerVisuals(s.workers)}人 ≒ ${fmt(s.workers)}人分`;
    $("campLabel").textContent = `${camp.label} ／ テント${camp.tents}張`;
    for (const [id, key] of [
      ["hire", "hireDay"],
      ["pay", "paidDay"],
      ["feed", "fedDay"],
    ]) {
      const used = s[key] === d;
      $(id).disabled = used || done || !s.started;
      $(id).querySelector(".action-arrow").textContent = used
        ? "✓"
        : id === "hire"
          ? "↗"
          : "→";
    }
    const bonus = M.bonusFor(s),
      next = s.hireBonus?.day === d + 1 ? s.hireBonus.kind : null;
    let text = "";
    if (bonus)
      text = `本日の採用：${bonus === "double" ? "人数2倍（最大2,000人）" : "1,000人固定"}！`;
    else if (next)
      text = `明日の採用：${next === "double" ? "人数2倍" : "1,000人固定"}！`;
    $("hireBonus").hidden = !text;
    $("hireBonus").textContent = text;
    $("hireHint").textContent = done
      ? "工事は完了しました。"
      : s.hireDay === d
        ? `本日の採用済み。次は ${remaining}秒後。`
        : bonus === "fixed1000"
          ? "UFOの約束：今日は1,000人。"
          : bonus === "double"
            ? "UFOの約束：今日はランダム人数の2倍。"
            : "1日1回。1〜1,000人やってきます。";
    $("payHint").textContent = s.paidDay === d ? "本日分、みんなに配りました。" : "本日分のお給料、忘れずに。";
    $("feedHint").textContent = s.fedDay === d ? "みんなのおなかが満たされました。" : "パンと飲み物で、ひと休み。";
    globalThis.PyramidAudio?.sync(s);
    A.prepareEnding();
    A.updateArchive();
  };
  globalThis.PyramidApp = A;
  A.renderer = PyramidRenderer.create($("scene"), () => A.state);
})();
