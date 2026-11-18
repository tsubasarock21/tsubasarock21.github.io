/* 石を積む v0.7.0 — worker animation and celebration movie. */
(function (root) {
  "use strict";
  root.PyramidRenderer = {
    create(canvas, getState) {
      const M = root.PyramidModel,
        A = root.PyramidArt.create(canvas, getState),
        $ = (id) => document.getElementById(id),
        reduce = matchMedia("(prefers-reduced-motion: reduce)").matches,
        clamp = (n, a, b) => Math.max(a, Math.min(b, n));
      let workers = [],
        particles = [],
        effect = null, lastPeople = [];
      function paint(time, dt, endingAge = null) {
        const state = getState(),
          night = M.night(state),
          done = M.completed(state),
          { ctx, W, H, line, ellipse, roundRect, person } = A,
          p = root.PyramidScene.paint(A, state, time, effect, reduce?null:endingAge);
        const count = M.workerVisuals(state.workers),
          sleepers = night ? count : 0;
        while (workers.length < count)
          workers.push({ seed: Math.random(), offset: Math.random() * 100 });
        if (workers.length > count) workers.length = count;
        const people = [];
        for (let i = 0; i < count; i++) {
          const w = workers[i],
            speed = 0.055 + (i % 5) * 0.006,
            phase = (time * speed + w.seed) % 1,
            scale = clamp(W / 540, 0.85, 1.15);
          if (night) {
            if (i >= sleepers) continue;
            const x = W * 0.7 + (i % 9) * Math.min(10, W * 0.025),
              y = H * 0.83 + Math.floor(i / 9) * 4;
            people.push({ x, y, scale, id: i, walk: 0, sleep: true });
            continue;
          }
          if (done) {
            const x = W * 0.26 + ((i % 14) * p.fullW) / 14,
              y = H * 0.8 + Math.floor(i / 14) * 9;
            people.push({
              x,
              y:
                y -
                Math.abs(Math.sin(time * 6 + i)) *
                  (endingAge !== null ? 6 : 1.3),
              scale,
              id: i,
              walk: Math.sin(time * 3 + i),
              load: false,
            });
            continue;
          }
          const forward = phase < 0.5,
            u = forward ? phase * 2 : (1 - phase) * 2,
            foot = root.PyramidRoutes.point(p.workerRoute,u),
            x = foot.x,
            y = foot.y + ((i % 3)-1)*1.1;
          people.push({
            x,
            y,
            scale,
            id: i,
            walk: time * 8 + i,
            load: forward && i % 3 !== 0,
          });
          if (forward && i % 7 === 0 && y > p.baseY + 10) {
            const sx = x - 10,
              sy = y + 3;
            line(x - 3, y - 7, sx, sy - 3, night ? "#8b896f" : "#a38b61", 0.8);
            roundRect(sx - 11, sy - 7, 13, 7, 1, night ? "#9a9071" : "#c3a16a");
            line(sx - 12, sy + 1, sx + 4, sy + 1, "#8c6b43", 1.5);
          }
        }
        const raw=people.map(a=>root.PyramidLife?root.PyramidLife.pose(a,state,time):a).filter(Boolean);
        const drawn=root.PyramidVignettes?root.PyramidVignettes.poses(raw,state,A):raw;
        lastPeople=drawn;
        drawn.sort((a,b)=>a.y-b.y).forEach(a=>{
          person(a.x,a.y,a.scale,a.walk,a.id,a.load,a.sleep,a.happy||done,a.sulk);
          if(a.returning){for(let j=0;j<3;j++)ellipse(a.x+(j-1)*7,a.y-24-(time*22+j*7)%15,1.3,2.2,'#7eb9cd');}
          if(a.sulk){ctx.fillStyle='#ba6d4a';ctx.font='10px sans-serif';ctx.fillText('ぷん',a.x-10,a.y-31);}
        });
        if (night) {
          ctx.fillStyle = "#b3c4b5";
          ctx.font = "9px sans-serif";
          for (let i = 0; i < 3; i++)
            ctx.fillText(
              "z",
              W * (0.75 + i * 0.07),
              H * 0.75 - Math.sin(time + i) * 2,
            );
        }
        if (effect && time * 1000 < effect.until) {
          const progress = 1 - (effect.until - time * 1000) / 3000;
          for (let i = 0; i < 8; i++) {
            const x = W * (0.22 + i * 0.08),
              y = H * 0.66 - progress * 35 - Math.sin(i) * 8;
            ctx.globalAlpha = 1 - progress;
            ctx.fillStyle =
              effect.type === "pay"
                ? "#e9d180"
                : effect.type === "feed"
                  ? "#eac496"
                  : "#e8f1c2";
            if (effect.type === "hire") person(x, y, 0.8, 0, i);
            else {
              ellipse(x, y, 3, 3, ctx.fillStyle);
            }
          }
          ctx.globalAlpha = 1;
        }
        for (const z of particles) {
          z.age += dt;
          z.x += z.vx * dt;
          z.y += z.vy * dt;
          z.vy += 35 * dt;
          ctx.globalAlpha = Math.max(0, 1 - z.age / 1.5);
          ellipse(z.x, z.y, 2, 2, "#e3fcb1");
        }
        ctx.globalAlpha = 1;
        particles = particles.filter((z) => z.age < 1.5);
        for(const ufo of M.ufoFleet(state)){
          const button=$(ufo.pass===0?'ufo':'ufo'+ufo.pass);
          button.hidden=!ufo.active;
          const label=button.querySelector?.('span');if(label)label.textContent=ufo.rush?'石を積む！':'TAP!';
          if(ufo.active){
            const x=ufo.rush ? .18+ufo.pass*.31+(reduce?0:Math.sin(time*1.7+ufo.pass)*.035) : reduce?.5:.12+ufo.travel*.76;
            const y=ufo.rush?.2+(ufo.pass%2)*.18:.23+Math.sin(ufo.travel*Math.PI)*.06;
            button.style.left=x*100+'%';button.style.top=y*100+'%';
          }
        }
        if(!M.ufoAt(state).rush){for(let i=1;i<3;i++)$('ufo'+i).hidden=true;}
        root.PyramidVignettes?.foreground(A,state,time);
        root.PyramidActors?.paint(A,state,time);
        root.PyramidLife?.foreground(A,state,time);

        if (endingAge !== null) {
          ctx.save();
          for (let i = 0; i < 55; i++) {
            const x =
                (M.hash(i * 47 + 19) * W + Math.sin(time + i) * 7 + W) % W,
              y = (endingAge * (22 + (i % 6)) + M.hash(i * 23) * H) % H;
            ctx.fillStyle = ["#c89556", "#70937b", "#f2e0a6", "#d3a589"][i % 4];
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(time * (i % 2 ? 1 : -1));
            ctx.fillRect(-1.8, -2.5, 3.6, 5);
            ctx.restore();
          }
          ctx.restore();
        }
      }
      function setEffect(type) {
        effect = { type, until: performance.now() + 3000 };
      }
      function burst() {
        for (let i = 0; i < 24; i++)
          particles.push({
            x: A.W * 0.5,
            y: A.H * 0.28,
            vx: (Math.random() - 0.5) * 110,
            vy: -20 - Math.random() * 50,
            age: 0,
          });
      }
      const observer = new ResizeObserver(() => A.resize());
      observer.observe(canvas);
      A.resize();
      return {
        paint,
        getPeople:()=>lastPeople,
        setEffect,
        burst,
        resize: A.resize,
        reset() {
          root.PyramidLife?.reset();
          root.PyramidActors?.reset();
          lastPeople=[];
          workers = [];
          particles = [];
          effect = null;
        },
      };
    },
  };
})(globalThis);
