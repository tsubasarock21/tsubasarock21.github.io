/* Per-zodiac clear history; local to this browser. */
(() => {
  const key = 'starMemory.v1.affinity';
  const thresholds = [1, 5, 15, 30, 50];
  const tier = n => thresholds.reduce((t, v) => t + Number(n >= v), 0);
  const normal = [
    ['遊びに来てくれてありがとう！','はじめまして、よろしくね！','今日も素敵な星を探そうね。','会えてうれしいな！','きれいな星が見つかったね。'],
    ['また会えたね！','一緒に遊ぶの、楽しいな。','今日も来てくれたんだね！','少しずつ仲良くなれたね。','あなたのこと、覚えてきたよ。'],
    ['会えるのを楽しみにしてたよ！','今日も一緒に星を見られてうれしいな。','あなたの頑張り、ちゃんと見てるよ。','星を見る時間がもっと好きになったよ。','また素敵な思い出が増えたね。'],
    ['あなたに会うと元気が出るよ！','今日もとっておきの星を見つけようね。','いつもありがとう、大切な星の仲間だよ。','一緒に過ごす時間が宝物だよ。','あなたの笑顔がもっと増えますように。'],
    ['今日も最高にうれしいよ！','あなたとの思い出は星いっぱいだね。','これからも素敵な毎日を応援するね。','星空の下で出会えて本当によかった！','今日もあなたに幸せが届きますように。']
  ];
  const adult = [
    ['来てくれてありがとう。','お会いできてうれしいわ。','今日の星を一緒に楽しみましょう。','素敵な時間になったわね。','あなたの一日を応援しているわ。'],
    ['また会えたわね、うれしいわ。','今日も来てくれたのね。','少しずつ仲良くなれてうれしいわ。','あなたと星を見るのは楽しいわね。','今日もよく頑張ったわね。'],
    ['会えるのを楽しみにしていたわ。','あなたの頑張りをいつも応援しているわ。','今日も素敵な思い出が増えたわね。','あなたと過ごす時間は心が和むわ。','星が結ぶ縁って素敵ね。'],
    ['今日も会えて心が弾むわ。','あなたの笑顔をもっと見られますように。','いつもありがとう、大切な星の仲間よ。','一緒に過ごす時間を大事にしたいわ。','あなたの幸せを願っているわ。'],
    ['あなたに出会えて本当によかったわ。','今日もあなたに素敵な星を贈りたいわ。','これからもあなたの歩みを応援するわ。','重ねた思い出が星のように輝いているわ。','今日もとびきりの幸せが訪れますように。']
  ];
  // Each sign has its own two characteristic wishes per artwork.
  const wishes = [
    ['勇気を届けるね！','元気いっぱい応援するよ！','勇気が湧くよう応援するわ。','新しい一歩を祝福するわ。'],
    ['穏やかな一日になりますように。','小さな幸せを見つけようね。','心安らぐ時間を願うわ。','あなたに豊かな実りがありますように。'],
    ['楽しい発見がいっぱいあるといいね！','きらっとしたひらめきを届けるよ。','素敵な出会いがありますように。','新しい発見を楽しんでね。'],
    ['あったかい気持ちを届けるね。','笑顔で帰れる一日になるといいな。','心に温かな光が灯りますように。','ほっとできる時間を大切にね。'],
    ['キラキラ輝く一日を応援するよ！','自信を持って進もうね！','あなたらしく輝いてね。','堂々と一歩を踏み出してね。'],
    ['小さな頑張りも応援するね。','今日の努力が実りますように。','あなたの努力をそっと見守るわ。','丁寧な一歩が実りますように。'],
    ['素敵なご縁がありますように！','きれいな星を届けるね。','心地よい調和が訪れますように。','素敵な縁を願っているわ。'],
    ['願いが叶うよう見守るね。','あなたの力を信じてるよ。','あなたの願いを応援しているわ。','心の強さを信じて進んでね。'],
    ['わくわくする冒険が待ってるといいな！','新しい景色を楽しもうね。','自由な心で未来を楽しんで。','素敵な冒険を応援するわ。'],
    ['一歩ずつ、がんばろうね。','積み重ねた努力が輝くよ。','あなたの歩みを見守っているわ。','努力が実を結びますように。'],
    ['ひらめきの星を届けるね！','あなたらしい未来を応援するよ。','あなたの個性が輝きますように。','自由な発想を大切にね。'],
    ['やさしい夢が叶いますように。','幸せの星を探しておくね。','やさしい光があなたを包みますように。','あなたの未来に幸せを願うわ。']
  ];
  const special = {
    daily: [['今日も会えたね！毎日ありがとう。','連日会えてうれしいな！','毎日星を見に来てくれてありがとう！'],['今日も会えたわね。毎日ありがとう。','毎日会えるのは素敵なことね。','今日も星を見に来てくれてうれしいわ。']],
    week: [['わあ、また会えたね！','久しぶりだね、来てくれてありがとう！','また一緒に星を見られてうれしいよ！'],['久しぶりね、会えてうれしいわ。','また星を見に来てくれたのね。','こうして再会できてうれしいわ。']],
    fortnight: [['おかえり！また会えてとってもうれしいな！','久しぶりの再会だね！素敵な星を探そう。','今日また会えたことが宝物だよ！'],['おかえりなさい。再会できて本当にうれしいわ。','またあなたと星を見られるなんて素敵ね。','今日の再会を星と一緒に喜びたいわ。']]
  };
  let fallback = {};
  function read() {
    try { const v = JSON.parse(localStorage.getItem(key)); return v && typeof v === 'object' && !Array.isArray(v) ? v : fallback; } catch { return fallback; }
  }
  const dayNumber = d => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d) ? Date.parse(d+'T00:00:00Z')/86400000 : NaN;
  function validCount(n) { return Number.isFinite(n) && n >= 0 && Number.isSafeInteger(n*2); }
  function count(sign) {
    const n = read()[sign]?.count;
    return validCount(n) ? n : 0;
  }
  function record(sign, day, run, others = []) {
    const all = read(), old = all[sign] || {};
    if (old.run === run && run) return old;
    const gap = dayNumber(day)-dayNumber(old.day);
    const streak = gap === 1 ? (Number.isSafeInteger(old.streak) && old.streak > 0 ? old.streak : 1)+1 : gap <= 0 ? (old.streak || 1) : 1;
    const event = gap >= 14 ? 'fortnight' : gap >= 7 ? 'week' : gap === 1 ? 'daily' : '';
    const previous = validCount(old.count) ? old.count : 0;
    const entry = {count:Math.min(Number.MAX_SAFE_INTEGER/2,previous+1),day:gap<0?old.day:day,streak,event,run};
    all[sign]=entry;
    for (const other of new Set(others)) {
      if (!Number.isInteger(other) || other < 0 || other >= 12 || other === sign) continue;
      const v = all[other] || {};
      all[other] = {...v, count: Math.min(Number.MAX_SAFE_INTEGER/2, (validCount(v.count) ? v.count : 0)+0.5)};
    }
    fallback=all;
    try { localStorage.setItem(key,JSON.stringify(all)); } catch {}
    return entry;
  }
  function message(sign, entry, mode) {
    const t = Math.max(0,tier(entry.count)-1), a = mode === 'adult' ? 1 : 0;
    const index = Math.max(0,Math.floor(entry.count-1))%10;
    const lines = special[entry.event]?.[a] || (a?adult:normal)[t];
    return lines[index%lines.length] + ' ' + wishes[sign][a*2+Math.floor(index/5)];
  }
  globalThis.HoroAffinity = {tier,count,record,message};
})();
