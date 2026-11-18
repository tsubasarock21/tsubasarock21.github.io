/* 石を積む v0.7.0 — actions and campaign records. */
(function (root) {
  "use strict";
  const M = root.PyramidModel,
    { DAY, TARGET, day, completed } = M;
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  function cleanName(raw) {
    return Array.from(
      String(raw || "")
        .replace(/[\u0000-\u001f\u007f]/g, "")
        .trim(),
    )
      .slice(0, 16)
      .join("");
  }
  function setName(s, raw) {
    const value = cleanName(raw);
    if (
      !value ||
      (completed(s) && s.monuments.some((m) => m.site === s.siteNumber))
    )
      return false;
    s.playerName = value;
    if(s.mode!=="timer")s.started = true;
    return true;
  }
  function royalName(s) {
    return s.playerName.endsWith("王") ? s.playerName : s.playerName + "王";
  }
  function bonusFor(s) {
    return s.hireBonus?.day === day(s) ? s.hireBonus.kind : null;
  }
  function act(s, type, random = Math.random) {
    if (completed(s) || !s.started) return { ok: false, reason: "inactive" };
    const d = day(s);
    if (type === "hire") {
      if (s.hireDay === d) return { ok: false, reason: "used" };
      const roll=M.hireRoll(s,random),base=roll.base,
        bonus = bonusFor(s),
        count =
          bonus === "fixed1000" ? 1000 : bonus === "double" ? base * 2 : base;
      s.workers += count;
      s.totalHired += count;
      s.campPeak = Math.max(s.campPeak, s.workers);
      s.hireDay = d;
      if (bonus) s.hireBonus = null;
      return { ok: true, count, base, bonus, charm:roll.charm, boosted:roll.boosted };
    }
    if (type === "pay") {
      if (s.paidDay === d) return { ok: false, reason: "used" };
      s.paidDay = d;
      s.lastPaid = s.elapsed;
      return { ok: true };
    }
    if (type === "feed") {
      if (s.fedDay === d) return { ok: false, reason: "used" };
      s.fedDay = d;
      s.lastFed = s.elapsed;
      return { ok: true };
    }
    return { ok: false, reason: "unknown" };
  }
  function hash(x) {
    x = (x ^ (x >>> 16)) >>> 0;
    x = Math.imul(x, 0x7feb352d);
    x = (x ^ (x >>> 15)) >>> 0;
    x = Math.imul(x, 0x846ca68b);
    return ((x ^ (x >>> 16)) >>> 0) / 4294967296;
  }
  function ufoFleet(s) {
    const d=day(s), phase=s.elapsed%DAY,
      roll=hash(s.seed^Math.imul(d+1,2654435761)),rush=d>0&&roll<.15,
      count=rush?2+Math.floor(hash(s.seed^Math.imul(d+1,7717))*2):1,
      begin=rush?94:92+hash(s.seed^Math.imul(d+1,1013904223))*15,
      duration=rush?9:7,
      window=s.started&&!completed(s)&&roll<.5&&phase>=begin&&phase<begin+duration,
      claims=s.ufoClaimedDay===d?(s.ufoClaimedSlots||[0,1,2]):[];
    return Array.from({length:count},(_,pass)=>({active:window&&!claims.includes(pass),
      day:d,pass,rush:rush&&phase>=begin&&phase<begin+duration,
      travel:clamp((phase-begin)/duration,0,1)}));
  }
  function ufoAt(s) {const fleet=ufoFleet(s);return fleet.find(u=>u.active)||fleet[0];}
  function claimUfo(s, random=Math.random, slot=0) {
    const encounter=ufoFleet(s).find(u=>u.pass===slot);
    if(!encounter?.active)return {ok:false};
    if(s.ufoClaimedDay!==day(s))s.ufoClaimedSlots=[];
    s.ufoClaimedDay=day(s);s.ufoClaimedPass=slot;
    s.ufoClaimedSlots??=[];s.ufoClaimedSlots.push(slot);s.ufoHits++;
    if(s.mode==='timer')return {ok:true,reward:'cheer',stones:0};
    const reward=encounter.rush?'stones':['double','fixed1000','stones'][Math.floor(clamp(random(),0,.99999999999)*3)];
    if (reward !== "stones") {
      // Multiple rush rewards never overwrite an already-earned double with a weaker perk.
      const retained = s.hireBonus?.day === day(s) + 1 && s.hireBonus.kind === "double";
      s.hireBonus = { day: day(s) + 1, kind: retained ? "double" : reward };
      return { ok: true, reward, day: day(s) + 1, retained };
    }
    const amount = Math.min(
      TARGET - s.stones,
      Math.max(80, Math.round(s.workers * 0.65)),
    );
    // A UFO never changes the timer's fixed completion time.
    if(s.mode==='timer')return {ok:true,reward:'cheer',stones:0};
    s.stones += amount;
    if (s.stones >= TARGET) {
      s.stones = TARGET;
      s.doneAt = s.elapsed;
    }
    return { ok: true, reward, stones: amount };
  }
  function moveWorker(s,id,x,y,seconds=12,sulk=false) {
    if(!s.started||completed(s)||!Number.isInteger(id)||id<0||id>=workerVisuals(s.workers)||![x,y,seconds].every(Number.isFinite))return false;
    const count=workerVisuals(s.workers),people=s.workers<=20000?Math.min(100,s.workers-id*100):Math.floor((id+1)*s.workers/count)-Math.floor(id*s.workers/count);
    const w={id,people,kind:sulk?'sulk':'return',x:clamp(x,0,1),y:clamp(y,0,1),from:s.elapsed,until:sulk?(day(s)+2)*DAY:s.elapsed+clamp(seconds,.1,30)};
    s.distractions=(s.distractions||[]).filter(v=>v.id!==id&&v.until>s.elapsed);s.distractions.push(w);return w;
  }
  function workerVisuals(workers) {
    return Math.min(200, Math.ceil(Math.max(0, workers) / 100));
  }
  function campFor(s) {
    const people = s.campPeak || s.workers,
      level =
        people >= 10000
          ? 4
          : people >= 6000
            ? 3
            : people >= 3000
              ? 2
              : people >= 1000
                ? 1
                : 0;
    return {
      tents: Math.min(9, 1 + Math.floor(people / 1000)),
      level,
      label: [
        "布のテント",
        "日よけのある宿営地",
        "旗の立つ宿営地",
        "石造りの立派な宿営地",
        "王のお墨付き・豪華宿営地",
      ][level],
    };
  }
  function recordCompletion(s) {
    if (!completed(s) || !s.playerName) return false;
    if (s.monuments.some((m) => m.site === s.siteNumber)) return false;
    s.monuments.push({
      site: s.siteNumber,
      name: s.playerName,
      time: s.doneAt,
      workers: s.workers,
      ufoHits: s.ufoHits,
      leaderId:s.leaderId,mode:s.mode,
    });
    return true;
  }
  function nextSite(s, now = Date.now()) {
    if (!completed(s) || !s.celebrationDone) return null;
    recordCompletion(s);
    const n = M.create(now);
    n.mode=s.mode;n.timerDuration=s.timerDuration;n.timerRunning=false;if(n.mode==='timer'){n.workers=800;n.campPeak=800;}
    n.started = s.mode!=="timer";
    n.playerName = s.playerName;
    n.siteNumber = s.siteNumber + 1;
    n.monuments = s.monuments.map((m) => ({ ...m }));
    n.leaderCards={...s.leaderCards};n.pendingBonus=!!s.pendingBonus;if(s.leaderEvent?.bonus)n.leaderEvent={...s.leaderEvent,site:n.siteNumber};
    return n;
  }
  function decode(raw) {
    try {
      const x = JSON.parse(raw);
      if (!x || ![1, 2, 3, 4].includes(x.schema)) return null;
      const nums = [
        "seed",
        "createdAt",
        "lastWall",
        "elapsed",
        "lastSeen",
        "workers",
        "stones",
        "lastPaid",
        "lastFed",
        "lastQuit",
        "totalHired",
        "totalQuit",
        "ufoHits",
      ];
      if (nums.some((k) => !Number.isFinite(x[k]) || x[k] < 0)) return null;
      if (
        x.elapsed > 1e12 ||
        x.workers > 1e9 ||
        !Number.isInteger(x.workers) ||
        x.stones > TARGET ||
        x.lastWall < x.createdAt
      )
        return null;
      for (const k of ["lastSeen", "lastPaid", "lastFed", "lastQuit"])
        if (x[k] > x.elapsed) return null;
      for (const k of ["hireDay", "paidDay", "fedDay", "ufoClaimedDay"])
        if (!Number.isInteger(x[k]) || x[k] < -1 || x[k] > day(x)) return null;
      if(x.ufoClaimedSlots===undefined)x.ufoClaimedSlots=x.ufoClaimedDay<0?[]:[0,1,2];
      if(!Array.isArray(x.ufoClaimedSlots)||x.ufoClaimedSlots.length>3||new Set(x.ufoClaimedSlots).size!==x.ufoClaimedSlots.length||x.ufoClaimedSlots.some(n=>!Number.isInteger(n)||n<0||n>2))return null;
      if(x.distractions===undefined)x.distractions=[];
      if(!Array.isArray(x.distractions)||x.distractions.length>200||new Set(x.distractions.map(w=>w.id)).size!==x.distractions.length)return null;
      for(const w of x.distractions)if(!w||!Number.isInteger(w.id)||w.id<0||w.id>=200||!Number.isInteger(w.people)||w.people<1||w.people>1e9||!['return','sulk'].includes(w.kind)||!Number.isFinite(w.from)||w.from<0||w.from>x.elapsed||!Number.isFinite(w.until)||w.until<=w.from||w.until>x.elapsed+2*DAY||!Number.isFinite(w.x)||w.x<0||w.x>1||!Number.isFinite(w.y)||w.y<0||w.y>1)return null;
      if (x.ufoClaimedPass === undefined) x.ufoClaimedPass = x.ufoClaimedDay < 0 ? -1 : 3;
      if (!Number.isInteger(x.ufoClaimedPass) || x.ufoClaimedPass < -1 || x.ufoClaimedPass > 3) return null;
      if (
        x.doneAt !== null &&
        (!Number.isFinite(x.doneAt) ||
          x.doneAt < 0 ||
          x.doneAt > x.elapsed ||
          x.stones < TARGET)
      )
        return null;
      if (x.schema === 1) {
        Object.assign(x, {
          schema: 2,
          started: true,
          playerName: "",
          siteNumber: 1,
          monuments: [],
          campPeak: x.workers,
          hireBonus: null,
          celebrationDone: false,
        });
      }
      if (
        typeof x.started !== "boolean" ||
        typeof x.celebrationDone !== "boolean" ||
        typeof x.playerName !== "string" ||
        x.playerName !== cleanName(x.playerName)
      )
        return null;
      if (
        !Number.isInteger(x.siteNumber) ||
        x.siteNumber < 1 ||
        !Number.isFinite(x.campPeak) ||
        x.campPeak < x.workers ||
        x.campPeak > 1e9
      )
        return null;
      if (
        !Array.isArray(x.monuments) ||
        x.monuments.length > 5000 ||
        x.monuments.some(
          (m) =>
            !Number.isInteger(m.site) ||
            m.site < 1 ||
            typeof m.name !== "string" ||
            !m.name ||
            m.name !== cleanName(m.name) ||
            !Number.isFinite(m.time) ||
            m.time < 0 ||
            !Number.isFinite(m.workers) ||
            m.workers < 0 ||
            !Number.isInteger(m.ufoHits) ||
            m.ufoHits < 0,
        )
      )
        return null;
      if (new Set(x.monuments.map((m) => m.site)).size !== x.monuments.length)
        return null;
      if (
        x.hireBonus !== null &&
        (!Number.isInteger(x.hireBonus?.day) ||
          x.hireBonus.day < 0 ||
          !["double", "fixed1000"].includes(x.hireBonus.kind))
      )
        return null;
      if(!M.normalizeLeadership(x,x.schema<3))return null;
      if(x.schema<4){x.mode='normal';x.timerDuration=1500;x.timerRunning=false;}
      if(!['normal','timer'].includes(x.mode)||!Number.isInteger(x.timerDuration)||x.timerDuration<60||x.timerDuration>86400||typeof x.timerRunning!=='boolean')return null;
      if(x.mode==='normal'&&x.timerRunning)return null;
      if(x.mode==='timer'){
        if(x.elapsed>x.timerDuration||x.timerRunning&&(!x.started||x.doneAt!==null)||!x.started&&x.elapsed!==0)return null;
        if(Math.abs(x.stones-TARGET*x.elapsed/x.timerDuration)>.001)return null;
        if(x.doneAt!==null&&x.doneAt!==x.timerDuration||x.doneAt===null&&x.elapsed>=x.timerDuration)return null;
      }
      if(x.pendingBonus!==undefined&&typeof x.pendingBonus!=='boolean')return null;
      x.schema=4;
      return x;
    } catch (_) {
      return null;
    }
  }
  Object.assign(M, {
    cleanName,
    setName,
    royalName,
    bonusFor,
    act,
    hash,
    ufoAt,
    ufoFleet,
    moveWorker,
    claimUfo,
    workerVisuals,
    campFor,
    recordCompletion,
    nextSite,
    decode,
  });
  if (typeof module !== "undefined" && module.exports) module.exports = M;
})(globalThis);
