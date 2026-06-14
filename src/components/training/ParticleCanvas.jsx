import React, { useEffect, useRef } from "react";

export default function ParticleCanvas({ theme, color }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    const onResize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;
    };
    window.addEventListener("resize", onResize);

    // Parse shift color
    const cr = parseInt(color.slice(1, 3), 16);
    const cg = parseInt(color.slice(3, 5), 16);
    const cb = parseInt(color.slice(5, 7), 16);

    let animId;
    let state = {};

    // ---- COSMIC: drifting star field ----
    if (theme === "cosmic") {
      const particles = Array.from({ length: 120 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        opacity: 0.1 + Math.random() * 0.4,
        size: 0.5 + Math.random() * 2
      }));
      state = { particles };

      const draw = () => {
        ctx.clearRect(0, 0, W, H);
        for (const p of state.particles) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0) p.x = W;
          if (p.x > W) p.x = 0;
          if (p.y < 0) p.y = H;
          if (p.y > H) p.y = 0;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${p.opacity})`;
          ctx.fill();
        }
        animId = requestAnimationFrame(draw);
      };
      draw();
    }

    // ---- CRYSTAL: hex grid + drifting shards ----
    else if (theme === "crystal") {
      const shards = Array.from({ length: 8 }, () => ({
        x: Math.random() * W,
        y: H * 0.3 + Math.random() * H * 0.7,
        vy: -(0.3 + Math.random() * 0.5),
        rotation: Math.random() * Math.PI * 2,
        rotV: (Math.random() - 0.5) * 0.01,
        size: 6 + Math.random() * 10,
        opacity: 0.2 + Math.random() * 0.3
      }));
      state = { shards };

      const drawHex = (cx, cy, r) => {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = (i * Math.PI) / 3 - Math.PI / 6;
          i === 0
            ? ctx.moveTo(cx + r * Math.cos(a), cy + r * Math.sin(a))
            : ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
        }
        ctx.closePath();
        ctx.stroke();
      };

      const draw = () => {
        ctx.clearRect(0, 0, W, H);

        // Hex grid
        ctx.strokeStyle = `rgba(${cr},${cg},${cb},0.04)`;
        ctx.lineWidth = 0.5;
        const hexR = 30;
        const hexW = hexR * 2;
        const hexH = Math.sqrt(3) * hexR;
        for (let row = -1; row < H / hexH + 1; row++) {
          for (let col = -1; col < W / (hexW * 0.75) + 1; col++) {
            const cx = col * hexW * 0.75;
            const cy = row * hexH + (col % 2 === 0 ? 0 : hexH / 2);
            drawHex(cx, cy, hexR);
          }
        }

        // Crystal shards
        for (const s of state.shards) {
          s.y += s.vy;
          s.rotation += s.rotV;
          s.opacity -= 0.001;
          if (s.y < -s.size * 3 || s.opacity <= 0) {
            s.x = Math.random() * W;
            s.y = H + s.size;
            s.opacity = 0.2 + Math.random() * 0.3;
          }
          ctx.save();
          ctx.translate(s.x, s.y);
          ctx.rotate(s.rotation);
          ctx.beginPath();
          ctx.moveTo(0, -s.size);
          ctx.lineTo(s.size * 0.6, s.size);
          ctx.lineTo(-s.size * 0.6, s.size);
          ctx.closePath();
          ctx.fillStyle = `rgba(${cr},${cg},${cb},${s.opacity})`;
          ctx.fill();
          ctx.restore();
        }
        animId = requestAnimationFrame(draw);
      };
      draw();
    }

    // ---- NEURAL: node mesh ----
    else if (theme === "neural") {
      const nodes = Array.from({ length: 60 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        phase: Math.random() * Math.PI * 2,
        speed: 0.01 + Math.random() * 0.02
      }));
      state = { nodes };

      const draw = () => {
        ctx.clearRect(0, 0, W, H);
        for (const n of state.nodes) {
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < 0 || n.x > W) n.vx *= -1;
          if (n.y < 0 || n.y > H) n.vy *= -1;
          n.phase += n.speed;
        }

        // Lines
        for (let i = 0; i < state.nodes.length; i++) {
          for (let j = i + 1; j < state.nodes.length; j++) {
            const a = state.nodes[i], b = state.nodes[j];
            const dx = a.x - b.x, dy = a.y - b.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 80) {
              const alpha = (1 - dist / 80) * 0.2;
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.strokeStyle = `rgba(${cr},${cg},${cb},${alpha})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        }

        // Nodes
        for (const n of state.nodes) {
          const op = 0.4 + 0.4 * Math.sin(n.phase);
          ctx.beginPath();
          ctx.arc(n.x, n.y, 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${cr},${cg},${cb},${op})`;
          ctx.fill();
        }
        animId = requestAnimationFrame(draw);
      };
      draw();
    }

    // ---- SHADOW: smoke + embers ----
    else if (theme === "shadow") {
      const smoke = Array.from({ length: 40 }, () => ({
        x: Math.random() * W,
        y: H * 0.5 + Math.random() * H * 0.5,
        vy: -(0.2 + Math.random() * 0.5),
        size: 20 + Math.random() * 40,
        opacity: 0.05 + Math.random() * 0.1,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: (Math.random() - 0.5) * 0.01
      }));
      const embers = Array.from({ length: 20 }, () => ({
        x: Math.random() * W,
        y: H * 0.4 + Math.random() * H * 0.6,
        vx: (Math.random() - 0.5) * 0.5,
        vy: -(0.5 + Math.random() * 1),
        size: 1.5 + Math.random() * 2.5,
        opacity: 0.5 + Math.random() * 0.5,
        life: Math.random()
      }));
      state = { smoke, embers };

      const draw = () => {
        ctx.clearRect(0, 0, W, H);

        for (const s of state.smoke) {
          s.wobble += s.wobbleSpeed;
          s.x += Math.sin(s.wobble) * 0.3;
          s.y += s.vy;
          s.opacity -= 0.0003;
          if (s.y < -s.size || s.opacity <= 0) {
            s.x = Math.random() * W;
            s.y = H + s.size;
            s.opacity = 0.05 + Math.random() * 0.08;
          }
          const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size);
          grad.addColorStop(0, `rgba(80,20,120,${s.opacity})`);
          grad.addColorStop(1, `rgba(80,20,120,0)`);
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
          ctx.fill();
        }

        for (const e of state.embers) {
          e.x += e.vx;
          e.y += e.vy;
          e.life -= 0.008;
          if (e.life <= 0 || e.y < -10) {
            e.x = Math.random() * W;
            e.y = H * 0.5 + Math.random() * H * 0.5;
            e.life = 0.5 + Math.random() * 0.5;
            e.opacity = 0.5 + Math.random() * 0.5;
          }
          const op = e.life * e.opacity;
          ctx.beginPath();
          ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,140,50,${op})`;
          ctx.fill();
        }
        animId = requestAnimationFrame(draw);
      };
      draw();
    }

    // ---- LIGHTNING: electric arc flashes ----
    else if (theme === "lightning") {
      let nextFlash = 2000 + Math.random() * 2000;
      let flashPath = null;
      let flashOpacity = 0;
      let lastTime = null;

      const buildArc = () => {
        const side = Math.floor(Math.random() * 4);
        let sx, sy;
        if (side === 0) { sx = Math.random() * W; sy = 0; }
        else if (side === 1) { sx = W; sy = Math.random() * H; }
        else if (side === 2) { sx = Math.random() * W; sy = H; }
        else { sx = 0; sy = Math.random() * H; }
        const ex = W * 0.3 + Math.random() * W * 0.4;
        const ey = H * 0.3 + Math.random() * H * 0.4;
        const steps = 8 + Math.floor(Math.random() * 6);
        const pts = [{ x: sx, y: sy }];
        for (let i = 1; i < steps; i++) {
          const t = i / steps;
          const mx = sx + (ex - sx) * t + (Math.random() - 0.5) * 80;
          const my = sy + (ey - sy) * t + (Math.random() - 0.5) * 80;
          pts.push({ x: mx, y: my });
        }
        pts.push({ x: ex, y: ey });
        return pts;
      };

      const draw = (time) => {
        ctx.clearRect(0, 0, W, H);
        const dt = lastTime ? time - lastTime : 16;
        lastTime = time;
        nextFlash -= dt;

        if (nextFlash <= 0) {
          flashPath = buildArc();
          flashOpacity = 1;
          nextFlash = 2000 + Math.random() * 2000;
        }

        if (flashPath && flashOpacity > 0) {
          ctx.beginPath();
          ctx.moveTo(flashPath[0].x, flashPath[0].y);
          for (let i = 1; i < flashPath.length; i++) {
            ctx.lineTo(flashPath[i].x, flashPath[i].y);
          }
          ctx.strokeStyle = `rgba(${cr},${cg},${cb},${flashOpacity})`;
          ctx.lineWidth = 1.5;
          ctx.shadowColor = `rgba(${cr},${cg},${cb},${flashOpacity * 0.5})`;
          ctx.shadowBlur = 8;
          ctx.stroke();
          ctx.shadowBlur = 0;
          flashOpacity -= dt / 300;
        }
        animId = requestAnimationFrame(draw);
      };
      draw(0);
    }

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
    };
  }, [theme, color]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        display: "block"
      }}
    />
  );
}
