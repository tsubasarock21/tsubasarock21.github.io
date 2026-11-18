/* 石を積む v0.7.0 — canvas primitives and little workers. */
(function (root) {
  "use strict";
  root.PyramidArt = {
    create(canvas, getState) {
      const M = root.PyramidModel,
        ctx = canvas.getContext("2d");
      let W = 650,
        H = 420;
      const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
      const brickOrder = Array.from({ length: 24 }, (_, r) =>
        Array.from({ length: 24 - r }, (_, i) => i).sort(
          (a, b) =>
            Math.abs(a - (23 - r) / 2) - Math.abs(b - (23 - r) / 2) || a - b,
        ),
      );
      function resize() {
        const r = canvas.getBoundingClientRect(),
          dpr = Math.min(devicePixelRatio || 1, 2);
        W = r.width;
        H = r.height;
        canvas.width = Math.round(W * dpr);
        canvas.height = Math.round(H * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      function roundRect(x, y, w, h, r, fill) {
        ctx.fillStyle = fill;
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, r);
        ctx.fill();
      }
      function line(x, y, xx, yy, color, width = 1) {
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(xx, yy);
        ctx.stroke();
      }
      function ellipse(x, y, rx, ry, color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      function person(
        x,
        y,
        scale,
        walk,
        id,
        load = false,
        sleep = false,
        happy = false,
        sulk = false,
        skinOverride = null,
      ) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);
        if (sleep) {
          ctx.rotate(-Math.PI / 2);
          ctx.translate(0, 4);
        }
        const bob = walk ? Math.sin(walk * 2) * 0.5 : 0;
        ctx.translate(0, bob);
        ellipse(0, 1, 5.5, 1.5, "#7e654422");
        const skin = skinOverride || ["#bf8253", "#d09a68", "#a76c45", "#daa87b"][id % 4],
          cloth = ["#f5e7c3", "#d6b270", "#b8c4a3", "#e9cf9e"][id % 4];
        const leg = walk ? Math.sin(walk) * 2 : 0;
        line(-2, -3, -3 + leg, 1, "#715438", 2);
        line(2, -3, 3 - leg, 1, "#715438", 2);
        roundRect(-5, -12, 10, 9, 3, skin);
        ctx.fillStyle = cloth;
        ctx.fillRect(-5, -7, 10, 4);
        if(sulk){line(-5,-10,4,-7,skin,2.5);line(5,-10,-4,-7,skin,2.5);}
        else if (!load) {
          line(-4, -10, -8, happy ? -19 : -6 - leg * 0.4, skin, 2.5);
          line(4, -10, 8, happy ? -19 : -7 + leg * 0.4, skin, 2.5);
        }
        ellipse(0, -17, 6.2, 6.5, skin);
        ellipse(-1, -23, 5.9, 2, cloth);
        ctx.fillStyle = "#4d3d2b";
        if (!sleep) {
          ctx.fillRect(-3, -18, 1, 1);
          ctx.fillRect(2, -18, 1, 1);
        } else {
          line(-3, -18, -1, -18, "#4d3d2b");
          line(1, -18, 3, -18, "#4d3d2b");
        }
        if(sulk){line(-4,-20,-1,-19,"#4d3d2b",1);line(1,-19,4,-20,"#4d3d2b",1);}
        ellipse(0, -14.5, 2.5, 0.9, "#66503a");
        if (id % 3 === 0) ctx.fillRect(-6, -21, 2, 4);
        if (load) {
          roundRect(-5, -30, 10, 6, 1, "#c7ad7c");
          ctx.fillStyle = "#e3cea5";
          ctx.fillRect(-5, -30, 10, 2);
          line(-6, -8, -5, -25, skin, 2);
          line(6, -8, 5, -25, skin, 2);
        }
        ctx.restore();
      }
      function pyramidGeometry() {
        const state = getState();
        const levels = 24,
          baseY = H * 0.71,
          fullW = W * 0.59,
          blockW = fullW / levels,
          blockH = Math.min((H * 0.43) / levels, blockW * 0.9),
          total = (levels * (levels + 1)) / 2,
          blocks = Math.min(
            total,
            Math.floor((state.stones / M.TARGET) * total),
          ),
          rows = [];
        let n = blocks;
        for (let row = 0; row < levels; row++) {
          const count = Math.min(levels - row, n);
          rows.push(count);
          n -= count;
        }
        let level = 0;
        while (level < levels - 1 && rows[level] === levels - level) level++;
        return {
          levels,
          baseY,
          fullW,
          blockW,
          blockH,
          total,
          blocks,
          rows,
          level,
          targetX:
            W * 0.52 -
            ((levels - level) * blockW) / 2 +
            (brickOrder[level][Math.min(rows[level], levels - level - 1)] +
              0.5) *
              blockW,
          targetY: baseY - level * blockH,
        };
      }

      return {
        ctx,
        canvas,
        get W() {
          return W;
        },
        get H() {
          return H;
        },
        resize,
        roundRect,
        line,
        ellipse,
        person,
        pyramidGeometry,
        brickOrder,
      };
    },
  };
})(globalThis);
