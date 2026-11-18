/* 石を積む v0.7.0 — landscape, growing camp, royal inscription. */
(function (root) {
  "use strict";
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  function paintCamp(a, camp, night) {
    const { ctx, W, H, line, ellipse, roundRect } = a;
    for (let t = 0; t < camp.tents; t++) {
      const col = t % 3,
        row = Math.floor(t / 3),
        x = W * (0.73 + col * 0.085),
        y = H * (0.78 + row * 0.075),
        size = camp.level >= 3 ? 17 : 14;
      if (camp.level >= 3)
        roundRect(
          x - size,
          y - 7,
          size * 2,
          10,
          2,
          night ? "#7f8068" : "#c8b98c",
        );
      ctx.fillStyle = night
        ? "#a59470"
        : camp.level >= 2
          ? "#d7e2c0"
          : "#edddb5";
      ctx.beginPath();
      ctx.moveTo(x, y - size * 1.4);
      ctx.lineTo(x - size, y);
      ctx.lineTo(x + size, y);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = night ? "#454d42" : "#99815c";
      ctx.beginPath();
      ctx.moveTo(x, y - size * 0.8);
      ctx.lineTo(x - 5, y);
      ctx.lineTo(x + 5, y);
      ctx.closePath();
      ctx.fill();
      line(x, y - size * 1.4, x + size, y, "#bba47c");
      if (night) ellipse(x - size + 3, y - 3, 2, 2, "#ffd48c");
      if (camp.level >= 2) {
        line(x, y - size * 1.4, x, y - size * 2.1, "#76694f");
        ctx.fillStyle = camp.level === 4 ? "#d0a955" : "#6a8c7a";
        ctx.beginPath();
        ctx.moveTo(x, y - size * 2.1);
        ctx.lineTo(x + 10, y - size * 1.9);
        ctx.lineTo(x, y - size * 1.7);
        ctx.closePath();
        ctx.fill();
      }
    }
    if (camp.level >= 1) {
      const x = W * 0.7,
        y = H * 0.81;
      line(x, y, x, y - 30, "#aa9566");
      line(x + W * 0.23, y, x + W * 0.23, y - 30, "#aa9566");
      ctx.fillStyle = night ? "#8d8b70" : "#b4c5a0";
      ctx.beginPath();
      ctx.moveTo(x - 3, y - 29);
      ctx.lineTo(x + W * 0.23 + 3, y - 29);
      ctx.lineTo(x + W * 0.23, y - 18);
      ctx.lineTo(x, y - 18);
      ctx.closePath();
      ctx.fill();
    }
    if (camp.level >= 3) {
      for (let i = 0; i < 5; i++) {
        const x = W * (0.71 + i * 0.055);
        ellipse(x, H * 0.74, 1.8, 2.2, night ? "#ffdf9a" : "#d6b16c");
      }
    }
    if (camp.level >= 4) {
      roundRect(
        W * 0.82,
        H * 0.69,
        W * 0.15,
        H * 0.07,
        2,
        night ? "#a69c73" : "#ead397",
      );
      line(W * 0.815, H * 0.69, W * 0.975, H * 0.69, "#b58e47", 3);
      ctx.fillStyle = "#8f6a37";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("王", W * 0.895, H * 0.735);
    }
  }
  function paint(art, state, time, effect, endingAge = null) {
    const { ctx, W, H, roundRect, line, ellipse, pyramidGeometry, brickOrder } =
        art,
      M = root.PyramidModel,
      night = M.night(state),
      done = M.completed(state);
    ctx.clearRect(0, 0, W, H);
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, night ? "#18394c" : "#e5e3cb");
    sky.addColorStop(1, night ? "#58716a" : "#f2dbaf");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);
    if (night) {
      for (let i = 0; i < 35; i++) {
        const x = M.hash(i * 71 + 33) * W,
          y = M.hash(i * 91 + 5) * H * 0.42;
        ellipse(
          x,
          y,
          i % 5 === 0 ? 1 : 0.6,
          i % 5 === 0 ? 1 : 0.6,
          "#e4e7ccbb",
        );
      }
      ellipse(W * 0.83, H * 0.17, 24, 24, "#d3d5b7");
      ellipse(W * 0.83 + 13, H * 0.17 - 7, 20, 20, "#244552");
    } else {
      ellipse(W * 0.83, H * 0.17, 23, 23, "#e4bd72");
      ellipse(W * 0.83, H * 0.17, 32, 32, "#eac98e22");
    }
    ctx.beginPath();
    ctx.moveTo(0, H * 0.47);
    ctx.bezierCurveTo(
      W * 0.18,
      H * 0.3,
      W * 0.32,
      H * 0.55,
      W * 0.54,
      H * 0.43,
    );
    ctx.bezierCurveTo(W * 0.77, H * 0.3, W * 0.85, H * 0.42, W, H * 0.39);
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.fillStyle = night ? "#4f6257" : "#d6c69d";
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, H * 0.6);
    ctx.bezierCurveTo(W * 0.35, H * 0.48, W * 0.56, H * 0.67, W, H * 0.5);
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.fillStyle = night ? "#746e53" : "#e3c79a";
    ctx.fill();
    const p = pyramidGeometry();
    if (!done) {
      ctx.save();
      ctx.setLineDash([4, 5]);
      ctx.strokeStyle = night ? "#bec7ab22" : "#a88d5740";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(W * 0.52 - p.fullW / 2, p.baseY);
      ctx.lineTo(W * 0.52, p.baseY - p.levels * p.blockH);
      ctx.lineTo(W * 0.52 + p.fullW / 2, p.baseY);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }
    ellipse(
      W * 0.53,
      p.baseY + 7,
      p.fullW * 0.62,
      H * 0.035,
      night ? "#273c3555" : "#ba995e44",
    );
    // Quarry, camp and the little kitchen live around the construction site.
    for (let i = 0; i < 8; i++) {
      const x = W * 0.05 + (i % 3) * 14,
        y = H * 0.76 + Math.floor(i / 3) * 9;
      roundRect(x, y, 15, 9, 1, night ? "#8d835f" : "#c9ab77");
      ctx.fillStyle = night ? "#a99a72" : "#dfc391";
      ctx.fillRect(x, y, 15, 2);
    }
    paintCamp(art, M.campFor(state), night);
    ellipse(W * 0.9, H * 0.91, 15, 10, night ? "#685449" : "#ad7755");
    roundRect(
      W * 0.9 - 13,
      H * 0.91 - 17,
      26,
      18,
      9,
      night ? "#79634c" : "#c08b62",
    );
    roundRect(W * 0.9 - 7, H * 0.91 - 8, 14, 8, 5, "#5e4b39");
    if (effect?.type === "feed") {
      ellipse(W * 0.9, H * 0.91 - 20, 12, 2, "#efdfb455");
    }
    for (let row = 0; row < p.levels; row++) {
      const width = (p.levels - row) * p.blockW,
        start = W * 0.52 - width / 2;
      for (let col = 0; col < p.rows[row]; col++) {
        const x = start + brickOrder[row][col] * p.blockW,
          y = p.baseY - (row + 1) * p.blockH,
          shade = M.hash(row * 31 + col * 17);
        ctx.fillStyle = night
          ? `hsl(39 23% ${42 + shade * 9}%)`
          : `hsl(37 43% ${63 + shade * 11}%)`;
        ctx.fillRect(x + 0.2, y + 0.2, p.blockW - 0.3, p.blockH - 0.3);
        ctx.fillStyle = night ? "#c2b58c66" : "#f9e8bf88";
        ctx.fillRect(
          x + 0.5,
          y + 0.3,
          p.blockW - 1,
          Math.max(0.6, p.blockH * 0.18),
        );
        ctx.strokeStyle = night ? "#5e604e44" : "#9d805233";
        ctx.lineWidth = 0.5;
        ctx.strokeRect(x, y, p.blockW, p.blockH);
      }
    }

    if(!done){p.workerRoute=root.PyramidRoutes.geometry(art,state,p);root.PyramidRoutes.paint(art,state,p,p.workerRoute);}
    root.PyramidVignettes?.milestones(art,state,p);
    if(done)root.PyramidInscription.paint(art,state,p,endingAge);
    return p;
  }
  root.PyramidScene = { paint };
})(globalThis);
