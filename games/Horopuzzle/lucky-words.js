/* Daily words based on the fortune's celestial theme, in a stable run-specific rotation. */
(() => {
  const words = {
    Sun: [['自信','輝き','決意','自分らしさ'],['小さな一歩','希望','深呼吸','マイペース']],
    Moon: [['安心','ぬくもり','心の余裕','やさしさ'],['ひと休み','いたわり','心の声','ゆとり']],
    Mercury: [['ひらめき','発見','伝える','好奇心'],['整理','聞く力','メモ','確認']],
    Venus: [['感謝','ときめき','笑顔','ご縁'],['思いやり','心地よさ','素直さ','大切にする']],
    Mars: [['挑戦','勇気','行動','突破'],['一歩ずつ','落ち着き','準備','自分のペース']],
    Jupiter: [['可能性','冒険','成長','新しい景色'],['学び','視点を変える','柔軟さ','気づき']],
    Saturn: [['積み重ね','継続','誠実','実り'],['丁寧さ','焦らず','小さな習慣','着実に']]
  };
  function hash(s) { let h=2166136261; for(const c of String(s)) h=Math.imul(h^c.charCodeAt(0),16777619); return h>>>0; }
  function appears(run) { return hash('planet-guest:'+run)%100 < 30; }
  function daily(row, day) {
    const pool = words[row.planet][row.rank <= 6 ? 0 : 1];
    return pool[hash('word:'+day+':'+row.sign+':'+row.planet)%pool.length];
  }
  function encouragement(row, day, mode, event) {
    const a=mode==='adult', word=daily(row,day), i=hash('cheer:'+day+':'+row.sign)%3;
    const greeting = event==='daily' ? (a?'今日も会えてうれしいわ。':'今日も会えてうれしいな！') :
      event==='week' ? (a?'久しぶりね、会えてうれしいわ。':'久しぶり！また会えたね。') :
      event==='fortnight' ? (a?'おかえりなさい、再会がうれしいわ。':'おかえり！会えてとってもうれしいよ！') : '';
    const lines = a ? ['今日もあなたの一歩を応援するわ。','この言葉をお守りに、あなたらしく進んでね。','素敵な一日になるよう、星から見守るわ。'] :
      ['今日もあなたのこと、応援してるよ！','この言葉をお守りに、がんばろうね！','素敵な一日になるよう、星から見守るね！'];
    return {word, message:greeting+lines[i]};
  }
  globalThis.HoroLuckyWords = {appears,daily,encouragement};
})();
