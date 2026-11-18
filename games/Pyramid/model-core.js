/* 石を積む v0.7.0 — deterministic simulation, all rules use game time. */
(function (root) {
  "use strict";
  const DAY = 120,
    LIGHT = 90,
    WEEK = 7 * DAY,
    MONTH = 30 * DAY,
    TARGET = 100000,
    SCHEMA = 4;
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  function create(
    now = Date.now(),
    seed = Math.floor(Math.random() * 0xffffffff),
  ) {
    return {
      schema: SCHEMA,
      mode: "normal", timerDuration: 1500, timerRunning: false,
      seed: seed >>> 0,
      createdAt: now,
      lastWall: now,
      elapsed: 0,
      lastSeen: 0,
      workers: 12,
      stones: 0,
      hireDay: -1,
      paidDay: -1,
      fedDay: -1,
      lastPaid: 0,
      lastFed: 0,
      lastQuit: 0,
      distractions: [],
      ufoClaimedSlots: [],
      ufoClaimedDay: -1,
      ufoClaimedPass: -1,
      doneAt: null,
      totalHired: 0,
      totalQuit: 0,
      ufoHits: 0,
      started: false,
      playerName: "",
      siteNumber: 1,
      monuments: [],
      campPeak: 12,
      hireBonus: null,
      celebrationDone: false,
      leaderCards: {}, leaderId: null, leaderDrawn: false, leaderEvent: null,
    };
  }
  function day(s) {
    return Math.floor(s.elapsed / DAY);
  }
  function night(s) {
    return s.elapsed % DAY >= LIGHT && !completed(s);
  }
  function completed(s) {
    return s.doneAt !== null;
  }
  function foodEfficiency(s, at = s.elapsed) {
    if(s.mode==='timer')return 1;
    const missed=Math.min(30,Math.max(0,Math.floor((at-s.lastFed+1e-9)/DAY)));
    return (100-missed)/100;
  }
  // Retain the old API name for saved-game/UI compatibility. Efficiency now depends on food only.
  function attendance(s,at=s.elapsed){return foodEfficiency(s,at);}
  function daytime(t) {
    const cycles=Math.floor(t/DAY);
    return cycles*LIGHT+Math.min(LIGHT,t-cycles*DAY);
  }
  function weightedWork(a,b,lastFed) {
    if(b<=a)return 0;
    let t=a,total=0,missed=Math.min(30,Math.max(0,Math.floor((a-lastFed+1e-9)/DAY)));
    // At most thirty daily changes, then a constant 70% for any length of absence.
    while(t<b&&missed<30){const stop=Math.min(b,lastFed+(missed+1)*DAY);if(stop>t)total+=(daytime(stop)-daytime(t))*(100-missed)/100;t=Math.max(t,stop);missed++;}
    if(t<b)total+=(daytime(b)-daytime(t))*.7;
    return total;
  }
  function nextQuit(s) {
    return Math.max(s.lastPaid, s.lastQuit) + MONTH;
  }
  function effectiveWorkers(s, at=s.elapsed) {
    const missing=(s.distractions||[]).reduce((n,w)=>n+(w.until>at?w.people:0),0);
    return Math.max(0,s.workers-missing);
  }
  function advance(s, now, present = false) {
    const report = {
      stones: 0,
      quit: 0,
      seconds: 0,
      attendance: attendance(s),
    };
    if (!Number.isFinite(now) || now <= s.lastWall) return report;
    const seconds = (now - s.lastWall) / 1000;
    s.lastWall = now;
    if (!s.started || completed(s)) return report;
    if (s.mode === "timer") {
      if (!s.timerRunning) return report;
      const before=s.stones,start=s.elapsed;
      s.elapsed=Math.min(s.timerDuration,s.elapsed+seconds);
      s.stones=TARGET*s.elapsed/s.timerDuration;
      if(s.elapsed>=s.timerDuration){s.stones=TARGET;s.doneAt=s.timerDuration;s.timerRunning=false;}
      s.distractions=(s.distractions||[]).filter(w=>w.until>s.elapsed);
      s.lastSeen=s.elapsed;report.stones=s.stones-before;report.seconds=s.elapsed-start;report.attendance=1;
      return report;
    }
    const before = s.stones,
      start = s.elapsed,
      end = start + seconds;
    let t = start;
    const buildUntil = (stop) => {
      const work =
        (weightedWork(t, stop, s.lastFed) * effectiveWorkers(s,t)) / LIGHT;
      if (work > 0 && s.stones + work >= TARGET) {
        const needed = TARGET - s.stones;
        let lo = t,
          hi = stop;
        for (let i = 0; i < 42; i++) {
          const mid = (lo + hi) / 2;
          if (
            (weightedWork(t, mid, s.lastFed) * effectiveWorkers(s,t)) / LIGHT >=
            needed
          )
            hi = mid;
          else lo = mid;
        }
        s.doneAt = hi;
        s.elapsed = hi;
        s.stones = TARGET;
        return true;
      }
      s.stones = Math.min(TARGET, s.stones + work);
      s.elapsed = stop;
      t = stop;
      return false;
    };
    while (t < end) {
      s.distractions=(s.distractions||[]).filter(w=>w.until>t);
      const returnAt=Math.min(Infinity,...s.distractions.map(w=>w.until));
      let due = nextQuit(s);
      if (s.workers < 3 && returnAt===Infinity) {
        if (buildUntil(end)) break;
        if (due <= end)
          s.lastQuit = due + Math.floor((end - due) / MONTH) * MONTH;
        break;
      }
      const stop = Math.min(end, returnAt, Math.max(t, due));
      if (buildUntil(stop)) break;
      if (stop >= due) {
        const leaving = Math.floor(s.workers / 3);
        s.workers -= leaving;
        s.totalQuit += leaving;
        report.quit += leaving;
        s.lastQuit = Math.max(t, due);
      }
      if (stop === end) break;
    }
    s.distractions=(s.distractions||[]).filter(w=>w.until>s.elapsed);
    if (present) s.lastSeen = s.elapsed;
    report.stones = s.stones - before;
    report.seconds = s.elapsed - start;
    report.attendance = attendance(s);
    return report;
  }
  const api = {
    DAY,
    LIGHT,
    WEEK,
    MONTH,
    TARGET,
    SCHEMA,
    create,
    day,
    night,
    completed,
    attendance,
    foodEfficiency,
    daytime,
    weightedWork,
    nextQuit,
    effectiveWorkers,
    advance,
  };
  root.PyramidModel = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(globalThis);
