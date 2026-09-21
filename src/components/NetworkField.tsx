"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import gsap from "gsap";

const WORD = "DIST";
const MAX_NODES = 520;
// drawn on the midnight page: ivory, brass and slate nodes; brass packets and dot
const IVORY = "#F5F1E8";
const GOLD = "#D4A574";
const SLATE = "#8B8D9A";

export interface NetworkFieldHandle {
  /** cream dot -> network spreads out -> links form -> nodes settle into a mesh spelling DIST. Labels: "fracture", "form", "settle". */
  buildIntro(opts?: { restingOpacity?: number }): gsap.core.Timeline;
  /** reverse: mesh -> scattered network -> collapses back into the single gold dot. */
  playOutro(): Promise<void>;
}

interface GraphNode { sx: number; sy: number; lx: number; ly: number; r: number; c: string; ph: number }
interface Pulse { e: number; t: number; speed: number; dir: 1 | -1 }

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Even dot-matrix sample of the word, plus the grid-neighbour links that make it read as a network. */
function buildGraph(w: number, h: number, anchor: HTMLElement | null) {
  const font = getComputedStyle(document.documentElement).getPropertyValue("--font-display").trim() || "Impact, sans-serif";
  const c = document.createElement("canvas");
  const g = c.getContext("2d")!;
  // size and centre the letters to match the on-page title, so the mesh becomes that exact word
  let px: number, tx: number, ty: number;
  if (anchor) {
    const r = anchor.getBoundingClientRect();
    px = parseFloat(getComputedStyle(anchor).fontSize);
    tx = r.left + r.width / 2 - w / 2;
    ty = r.top + r.height / 2 - h / 2 + px * 0.145; // canvas em-box vs CSS line-box centring
  } else {
    g.font = `400 100px ${font}`;
    px = 100 * Math.min((w * 0.6) / (g.measureText(WORD).width || 200), (h * 0.5) / 100);
    tx = 0; ty = -h * 0.05;
  }
  g.font = `400 ${px}px ${font}`;
  const base = g.measureText(WORD).width || 200;
  c.width = Math.ceil(base) + 20;
  c.height = Math.ceil(px * 1.3);
  g.font = `400 ${px}px ${font}`;
  g.textBaseline = "middle";
  g.textAlign = "center";
  g.fillText(WORD, c.width / 2, c.height / 2);
  const data = g.getImageData(0, 0, c.width, c.height).data;

  const gather = (step: number) => {
    const out: { x: number; y: number }[] = [];
    for (let y = 0; y < c.height; y += step)
      for (let x = 0; x < c.width; x += step)
        if (data[(y * c.width + x) * 4 + 3] > 128) out.push({ x: x - c.width / 2 + tx, y: y - c.height / 2 + ty });
    return out;
  };
  let step = 4;
  let pts = gather(step);
  while (pts.length > MAX_NODES && step < 60) pts = gather(++step);

  const nodes: GraphNode[] = pts.map((p, i) => {
    const a = rand(0, Math.PI * 2), r = rand(0.25, 1);
    return {
      lx: p.x, ly: p.y,
      sx: Math.cos(a) * r * w * 0.55, sy: Math.sin(a) * r * h * 0.5,
      r: 2 + Math.random() * 1.8,
      c: i % 4 === 0 ? GOLD : i % 4 === 1 ? IVORY : SLATE,
      ph: Math.random() * Math.PI * 2,
    };
  });

  const edges: [number, number][] = [];
  const link = step * 1.5;
  for (let i = 0; i < nodes.length; i++)
    for (let j = i + 1; j < nodes.length; j++)
      if (Math.hypot(nodes[i].lx - nodes[j].lx, nodes[i].ly - nodes[j].ly) <= link) edges.push([i, j]);
  return { nodes, edges, step };
}

const NetworkField = forwardRef<NetworkFieldHandle, { className?: string; anchor?: () => HTMLElement | null }>(function NetworkField({ className = "", anchor }, ref) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const S = useRef({
    w: 0, h: 0,
    nodes: [] as GraphNode[], edges: [] as [number, number][], step: 10,
    pos: new Float32Array(0),
    pulses: [] as Pulse[],
    // animated by GSAP
    p: { dot: 0, dotScale: 1, nodeAlpha: 0, spread: 0, form: 0, edges: 0, packets: 0, alpha: 1 },
  });

  const layout = () => {
    const s = S.current, el = canvas.current!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    s.w = window.innerWidth; s.h = window.innerHeight;
    el.width = s.w * dpr; el.height = s.h * dpr;
    el.getContext("2d")!.setTransform(dpr, 0, 0, dpr, 0, 0);
    const g = buildGraph(s.w, s.h, anchor?.() ?? null);
    s.nodes = g.nodes; s.edges = g.edges; s.step = g.step;
    s.pos = new Float32Array(g.nodes.length * 2);
    s.pulses = [];
  };

  useEffect(() => {
    layout();
    const onResize = () => layout();
    window.addEventListener("resize", onResize);

    const draw = () => {
      const s = S.current, { p, nodes, edges, pos, w, h } = s;
      const ctx = canvas.current?.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);
      if (p.alpha <= 0.001) return;
      const cx = w / 2, cy = h / 2, t = performance.now() / 1000;
      ctx.globalAlpha = p.alpha;

      // positions: centre -> scattered network -> letters, with a slow breathing drift once formed
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const drift = 1 + p.form * 0.6;
        pos[i * 2] = cx + lerp(n.sx * p.spread, n.lx, p.form) + Math.sin(t * 0.9 + n.ph) * drift;
        pos[i * 2 + 1] = cy + lerp(n.sy * p.spread, n.ly, p.form) + Math.cos(t * 0.8 + n.ph) * drift;
      }

      // links — long stretched ones fade out, so only the local mesh really shows
      if (p.edges > 0.001) {
        const maxLen = s.step * 2.2 + (1 - p.form) * w * 0.12;
        ctx.lineWidth = 0.8;
        for (const [a, b] of edges) {
          const x1 = pos[a * 2], y1 = pos[a * 2 + 1], x2 = pos[b * 2], y2 = pos[b * 2 + 1];
          const k = 1 - Math.hypot(x2 - x1, y2 - y1) / maxLen;
          if (k <= 0) continue;
          ctx.strokeStyle = `rgba(245,241,232,${(k * 0.4 * p.edges * p.nodeAlpha).toFixed(3)})`;
          ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        }
      }

      // data packets travelling the mesh
      if (p.packets > 0.01 && edges.length) {
        if (Math.random() < 0.35 * p.packets) s.pulses.push({ e: (Math.random() * edges.length) | 0, t: 0, speed: rand(0.02, 0.05), dir: Math.random() < 0.5 ? 1 : -1 });
        s.pulses = s.pulses.filter((q) => (q.t += q.speed) < 1);
        for (const q of s.pulses) {
          const [a, b] = edges[q.e];
          const k = q.dir === 1 ? q.t : 1 - q.t;
          const x = lerp(pos[a * 2], pos[b * 2], k), y = lerp(pos[a * 2 + 1], pos[b * 2 + 1], k);
          ctx.fillStyle = "rgba(212,165,116,0.3)"; ctx.beginPath(); ctx.arc(x, y, 6, 0, 7); ctx.fill();
          ctx.fillStyle = GOLD; ctx.beginPath(); ctx.arc(x, y, 2.2, 0, 7); ctx.fill();
        }
      }

      // nodes
      if (p.nodeAlpha > 0.001) {
        for (let i = 0; i < nodes.length; i++) {
          const n = nodes[i], x = pos[i * 2], y = pos[i * 2 + 1];
          ctx.fillStyle = n.c;
          ctx.globalAlpha = p.alpha * p.nodeAlpha * 0.18;
          ctx.beginPath(); ctx.arc(x, y, n.r * 3, 0, 7); ctx.fill();
          ctx.globalAlpha = p.alpha * p.nodeAlpha;
          ctx.beginPath(); ctx.arc(x, y, n.r, 0, 7); ctx.fill();
        }
        ctx.globalAlpha = p.alpha;
      }

      // the single gold dot
      if (p.dot > 0.001) {
        const r = 8 * p.dotScale;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 9);
        grad.addColorStop(0, `rgba(212,165,116,${0.6 * p.dot})`);
        grad.addColorStop(1, "rgba(212,165,116,0)");
        ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(cx, cy, r * 9, 0, 7); ctx.fill();
        ctx.globalAlpha = p.dot; ctx.fillStyle = GOLD;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fill();
      }
      ctx.globalAlpha = 1;
    };
    gsap.ticker.add(draw);
    return () => { gsap.ticker.remove(draw); window.removeEventListener("resize", onResize); };
  }, []);

  useImperativeHandle(ref, () => ({
    buildIntro({ restingOpacity = 0.12 } = {}) {
      layout();
      const { p } = S.current;
      gsap.killTweensOf(p);
      Object.assign(p, { dot: 0, dotScale: 0.3, nodeAlpha: 0, spread: 0, form: 0, edges: 0, packets: 0, alpha: 1 });
      return gsap.timeline()
        .to(p, { dot: 1, dotScale: 1, duration: 0.5, ease: "power3.out" })
        .to(p, { dotScale: 1.4, duration: 0.4, yoyo: true, repeat: 1, ease: "sine.inOut" })
        .addLabel("fracture")
        .to(p, { dot: 0, duration: 0.3 }, "fracture")
        .to(p, { nodeAlpha: 1, duration: 0.5 }, "fracture")
        .to(p, { spread: 1, duration: 1.2, ease: "power3.out" }, "fracture")
        .to(p, { edges: 1, duration: 1, ease: "power2.out" }, "fracture+=0.3")
        .addLabel("form", ">-0.1")
        .to(p, { form: 1, duration: 1.8, ease: "power3.inOut" }, "form")
        .to(p, { packets: 1, duration: 0.3 }, "form+=1.3")
        .addLabel("settle", ">+0.6") // hold on DIST while packets flow
        .to(p, { alpha: restingOpacity, duration: 0.8, ease: "power2.out" }, "settle");
    },

    playOutro() {
      return new Promise<void>((resolve) => {
        const { p } = S.current;
        gsap.killTweensOf(p);
        Object.assign(p, { dot: 0, dotScale: 0.5, nodeAlpha: 0, spread: 1, form: 1, edges: 1, packets: 1, alpha: 1 });
        gsap.timeline({ onComplete: resolve })
          .to(p, { nodeAlpha: 1, duration: 0.3 })
          .to(p, { form: 0, duration: 0.8, ease: "power3.inOut" }, "+=0.35")
          .to(p, { spread: 0, packets: 0, duration: 0.9, ease: "power3.in" })
          .to(p, { nodeAlpha: 0, edges: 0, duration: 0.2 }, ">-0.25")
          .to(p, { dot: 1, dotScale: 1.4, duration: 0.3, ease: "power3.out" }, "<")
          .to(p, { dotScale: 1, duration: 0.3, ease: "sine.inOut" });
      });
    },
  }));

  return <canvas ref={canvas} aria-hidden className={`pointer-events-none fixed inset-0 h-full w-full ${className}`} />;
});

export default NetworkField;
