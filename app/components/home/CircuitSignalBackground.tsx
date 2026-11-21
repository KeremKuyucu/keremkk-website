"use client";

import React, { useEffect, useRef } from "react";

interface BusNode {
  x: number;
  y: number;
  isPad: boolean;
  glow: number;
  traceIndices: number[];
}

interface BusTrace {
  points: { x: number; y: number }[];
  lengths: number[];
  totalLength: number;
  startNode: number;
  endNode: number;
  lane: number;
}

interface OpticalPacket {
  traceIndex: number;
  progress: number;
  speed: number;
  dir: 1 | -1;
  color: [number, number, number];
  tailLength: number;
}

interface SyncWave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
}

const PACKET_RGB_DARK: [number, number, number][] = [
  [139, 92, 246], // violet
  [217, 70, 239], // fuchsia
  [56, 189, 248], // electric cyan
  [236, 72, 153], // pink
];

const PACKET_RGB_LIGHT: [number, number, number][] = [
  [124, 58, 237], // violet-600
  [192, 38, 211], // fuchsia-600
  [14, 165, 233], // sky-500
  [219, 39, 119], // pink-600
];

const CircuitSignalBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    let isDark =
      darkQuery.matches || document.documentElement.classList.contains("dark");
    let reducedMotion = reducedMotionQuery.matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let rafId = 0;

    let nodes: BusNode[] = [];
    let traces: BusTrace[] = [];
    let packets: OpticalPacket[] = [];
    const syncWaves: SyncWave[] = [];
    const mouse = { x: -9999, y: -9999, active: false };
    let lastHoverEmit = 0;

    const addNode = (x: number, y: number, isPad: boolean): number => {
      for (let i = 0; i < nodes.length; i++) {
        if (Math.hypot(nodes[i].x - x, nodes[i].y - y) < 8) {
          if (isPad) nodes[i].isPad = true;
          return i;
        }
      }
      nodes.push({ x, y, isPad, glow: 0, traceIndices: [] });
      return nodes.length - 1;
    };

    const addTrace = (pts: { x: number; y: number }[], lane: number) => {
      if (pts.length < 2) return;
      const lengths: number[] = [];
      let totalLength = 0;
      for (let i = 1; i < pts.length; i++) {
        const seg = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
        lengths.push(seg);
        totalLength += seg;
      }
      if (totalLength < 20) return;

      const startNode = addNode(pts[0].x, pts[0].y, true);
      const endNode = addNode(pts[pts.length - 1].x, pts[pts.length - 1].y, true);
      const traceIdx = traces.length;
      traces.push({ points: pts, lengths, totalLength, startNode, endNode, lane });
      nodes[startNode].traceIndices.push(traceIdx);
      nodes[endNode].traceIndices.push(traceIdx);

      for (let i = 1; i < pts.length - 1; i++) {
        const viaIdx = addNode(pts[i].x, pts[i].y, false);
        nodes[viaIdx].traceIndices.push(traceIdx);
      }
    };

    const spawnPacket = (
      traceIndex: number,
      dir: 1 | -1 = 1,
      initialProgress?: number
    ) => {
      if (packets.length > 70 || traceIndex < 0 || traceIndex >= traces.length) return;
      const palette = isDark ? PACKET_RGB_DARK : PACKET_RGB_LIGHT;
      const color = palette[Math.floor(Math.random() * palette.length)];
      packets.push({
        traceIndex,
        progress: initialProgress ?? (dir === 1 ? 0 : 1),
        speed: 0.0045 + Math.random() * 0.0055,
        dir,
        color,
        tailLength: 0.16 + Math.random() * 0.14,
      });
    };

    // Architectural multi-lane 45°/90° microchip bus traces radiating outward from center die
    const buildArchitecture = () => {
      nodes = [];
      traces = [];
      packets = [];

      const cx = width * 0.5;
      const cy = height * 0.48;
      const dieW = Math.min(width * 0.32, 340);
      const dieH = Math.min(height * 0.28, 220);
      const laneGap = 15;

      const buildHorizontalBus = (
        side: -1 | 1,
        yRatio: number,
        bendDir: -1 | 1,
        lanes: number
      ) => {
        for (let l = 0; l < lanes; l++) {
          const offset = (l - (lanes - 1) / 2) * laneGap;
          const startX = cx + side * (dieW * 0.42);
          const startY = cy + yRatio * dieH + offset;
          const midX1 = cx + side * (dieW * 0.62 + l * 14);
          const diag = 46 + l * 12;
          const midX2 = midX1 + side * diag;
          const midY2 = startY + bendDir * diag;
          const endX = side === 1 ? width + 10 : -10;
          const endX2 = cx + side * (width * 0.39 + l * 16);
          const finalY = midY2 + bendDir * 32;

          if (Math.abs(endX2 - midX2) > 40) {
            addTrace(
              [
                { x: startX, y: startY },
                { x: midX1, y: startY },
                { x: midX2, y: midY2 },
                { x: endX2, y: midY2 },
                { x: endX2 + side * 32, y: finalY },
                { x: endX, y: finalY },
              ],
              l
            );
          } else {
            addTrace(
              [
                { x: startX, y: startY },
                { x: midX1, y: startY },
                { x: midX2, y: midY2 },
                { x: endX, y: midY2 },
              ],
              l
            );
          }
        }
      };

      const buildVerticalBus = (
        side: -1 | 1,
        xRatio: number,
        bendDir: -1 | 1,
        lanes: number
      ) => {
        for (let l = 0; l < lanes; l++) {
          const offset = (l - (lanes - 1) / 2) * laneGap;
          const startX = cx + xRatio * dieW + offset;
          const startY = cy + side * (dieH * 0.48);
          const midY1 = cy + side * (dieH * 0.72 + l * 12);
          const diag = 42 + l * 10;
          const midX2 = startX + bendDir * diag;
          const midY2 = midY1 + side * diag;
          const endY = side === 1 ? height + 10 : -10;

          addTrace(
            [
              { x: startX, y: startY },
              { x: startX, y: midY1 },
              { x: midX2, y: midY2 },
              { x: midX2, y: endY },
            ],
            l
          );
        }
      };

      buildHorizontalBus(-1, -0.55, -1, 3);
      buildHorizontalBus(-1, 0.0, 1, 2);
      buildHorizontalBus(-1, 0.58, 1, 3);

      buildHorizontalBus(1, -0.55, -1, 3);
      buildHorizontalBus(1, 0.0, -1, 2);
      buildHorizontalBus(1, 0.58, 1, 3);

      buildVerticalBus(-1, -0.5, -1, 2);
      buildVerticalBus(-1, 0.5, 1, 2);
      buildVerticalBus(1, -0.5, -1, 2);
      buildVerticalBus(1, 0.5, 1, 2);

      for (let i = 0; i < Math.min(24, traces.length); i++) {
        spawnPacket(i % traces.length, Math.random() > 0.35 ? 1 : -1, Math.random());
      }
    };

    const sampleTrace = (trace: BusTrace, t: number) => {
      const clamped = Math.max(0, Math.min(1, t));
      let dist = clamped * trace.totalLength;
      for (let i = 0; i < trace.lengths.length; i++) {
        const seg = trace.lengths[i];
        if (dist <= seg || i === trace.lengths.length - 1) {
          const r = seg > 0 ? dist / seg : 0;
          const p0 = trace.points[i];
          const p1 = trace.points[i + 1];
          return {
            x: p0.x + (p1.x - p0.x) * r,
            y: p0.y + (p1.y - p0.y) * r,
          };
        }
        dist -= seg;
      }
      return trace.points[0];
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildArchitecture();
    };

    const handlePointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const inside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      if (!inside) {
        mouse.active = false;
        return;
      }

      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;

      const now = performance.now();
      if (!reducedMotion && now - lastHoverEmit > 110) {
        let nearestNode = -1;
        let minDist = 125;
        for (let i = 0; i < nodes.length; i++) {
          const d = Math.hypot(nodes[i].x - mouse.x, nodes[i].y - mouse.y);
          if (d < minDist) {
            minDist = d;
            nearestNode = i;
          }
        }
        if (nearestNode !== -1) {
          const n = nodes[nearestNode];
          n.glow = 1;
          if (n.traceIndices.length > 0) {
            const tIdx =
              n.traceIndices[Math.floor(Math.random() * n.traceIndices.length)];
            spawnPacket(tIdx, Math.random() > 0.5 ? 1 : -1);
            lastHoverEmit = now;
          }
        }
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (reducedMotion) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest("a, button")) return;

      const rect = canvas.getBoundingClientRect();
      if (
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom
      ) {
        return;
      }

      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;

      syncWaves.push({
        x: cx,
        y: cy,
        radius: 12,
        maxRadius: Math.max(width, height) * 0.75,
        alpha: 0.9,
      });

      for (let i = 0; i < traces.length; i += 2) {
        spawnPacket(i, 1, 0);
      }
    };

    const handleThemeChange = (e: MediaQueryListEvent) => {
      isDark = e.matches || document.documentElement.classList.contains("dark");
      if (reducedMotion) {
        render(performance.now());
      }
    };

    const handleMotionChange = (e: MediaQueryListEvent) => {
      reducedMotion = e.matches;
      if (!reducedMotion) {
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(render);
      }
    };

    const startTime = performance.now();

    const drawCarrierWave = (t: number) => {
      ctx.save();
      if (isDark) ctx.globalCompositeOperation = "lighter";

      const baseY = height * 0.53;
      const samples = 160;
      const layers = [
        {
          freq: 2.3,
          amp: 34,
          speed: 1.4,
          width: 6,
          alpha: isDark ? 0.1 : 0.08,
          rgb: "139, 92, 246",
        },
        {
          freq: 2.3,
          amp: 34,
          speed: 1.4,
          width: 1.6,
          alpha: isDark ? 0.42 : 0.28,
          rgb: "217, 70, 239",
        },
        {
          freq: 3.6,
          amp: 20,
          speed: -1.1,
          width: 1.2,
          alpha: isDark ? 0.25 : 0.18,
          rgb: "56, 189, 248",
        },
      ];

      for (const layer of layers) {
        ctx.beginPath();
        for (let i = 0; i <= samples; i++) {
          const u = i / samples;
          const x = u * width;
          const env = Math.sin(u * Math.PI);
          const y =
            baseY +
            Math.sin(u * Math.PI * 2 * layer.freq + t * layer.speed) *
              layer.amp *
              (0.2 + 0.8 * env);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(${layer.rgb}, ${layer.alpha})`;
        ctx.lineWidth = layer.width;
        ctx.stroke();
      }
      ctx.restore();
    };

    const render = (now: number) => {
      const t = reducedMotion ? 0 : (now - startTime) * 0.001;
      ctx.clearRect(0, 0, width, height);

      // 1. Subtle solder-mask micro-grid dots
      ctx.fillStyle = isDark
        ? "rgba(139, 92, 246, 0.11)"
        : "rgba(109, 40, 217, 0.09)";
      const dotStep = 44;
      for (let x = dotStep / 2; x < width; x += dotStep) {
        for (let y = dotStep / 2; y < height; y += dotStep) {
          ctx.fillRect(x, y, 1.2, 1.2);
        }
      }

      // 2. Synchronized live electromagnetic carrier wave behind circuit
      drawCarrierWave(t);

      // 3. Base architectural PCB bus traces
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = 1.25;
      ctx.strokeStyle = isDark
        ? "rgba(139, 92, 246, 0.18)"
        : "rgba(109, 40, 217, 0.16)";
      ctx.beginPath();
      for (let i = 0; i < traces.length; i++) {
        const pts = traces[i].points;
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let j = 1; j < pts.length; j++) {
          ctx.lineTo(pts[j].x, pts[j].y);
        }
      }
      ctx.stroke();

      // 4. Cursor-proximity illuminated bus highlights
      if (mouse.active) {
        for (let i = 0; i < traces.length; i++) {
          const mid = sampleTrace(traces[i], 0.5);
          const d = Math.hypot(mid.x - mouse.x, mid.y - mouse.y);
          if (d < 260) {
            const a = (1 - d / 260) * (isDark ? 0.42 : 0.32);
            ctx.strokeStyle = isDark
              ? `rgba(217, 70, 239, ${a})`
              : `rgba(124, 58, 237, ${a})`;
            ctx.lineWidth = 1.7;
            ctx.beginPath();
            const pts = traces[i].points;
            ctx.moveTo(pts[0].x, pts[0].y);
            for (let j = 1; j < pts.length; j++) {
              ctx.lineTo(pts[j].x, pts[j].y);
            }
            ctx.stroke();
          }
        }
      }

      // 5. Electromagnetic click sync shockwaves
      for (let i = syncWaves.length - 1; i >= 0; i--) {
        const sw = syncWaves[i];
        sw.radius += 9.5;
        sw.alpha = Math.max(0, (1 - sw.radius / sw.maxRadius) * 0.75);

        ctx.save();
        if (isDark) ctx.globalCompositeOperation = "lighter";
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.strokeStyle = isDark
          ? `rgba(217, 70, 239, ${sw.alpha})`
          : `rgba(124, 58, 237, ${sw.alpha * 0.8})`;
        ctx.lineWidth = 2.2;
        ctx.stroke();
        ctx.restore();

        for (let nIdx = 0; nIdx < nodes.length; nIdx++) {
          const d = Math.hypot(nodes[nIdx].x - sw.x, nodes[nIdx].y - sw.y);
          if (Math.abs(d - sw.radius) < 18) {
            nodes[nIdx].glow = Math.max(nodes[nIdx].glow, 0.95);
          }
        }

        if (sw.radius >= sw.maxRadius) syncWaves.splice(i, 1);
      }

      // 6. Pads & double-ring copper vias with realistic glow halos
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        let prox = 0;
        if (mouse.active) {
          const d = Math.hypot(n.x - mouse.x, n.y - mouse.y);
          if (d < 180) prox = 1 - d / 180;
        }
        n.glow = Math.max(0, n.glow * 0.93);
        const energy = Math.max(prox, n.glow);

        if (energy > 0.08) {
          const halo = ctx.createRadialGradient(
            n.x,
            n.y,
            1,
            n.x,
            n.y,
            16 + energy * 16
          );
          halo.addColorStop(
            0,
            isDark
              ? `rgba(217, 70, 239, ${energy * 0.65})`
              : `rgba(124, 58, 237, ${energy * 0.42})`
          );
          halo.addColorStop(1, "rgba(139, 92, 246, 0)");
          ctx.fillStyle = halo;
          ctx.beginPath();
          ctx.arc(n.x, n.y, 16 + energy * 16, 0, Math.PI * 2);
          ctx.fill();
        }

        const r = n.isPad ? 3.0 + energy * 1.6 : 2.1 + energy * 1.4;
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fillStyle =
          energy > 0.25
            ? isDark
              ? `rgba(255, 245, 255, ${0.65 + energy * 0.35})`
              : `rgba(124, 58, 237, ${0.55 + energy * 0.45})`
            : isDark
            ? "rgba(139, 92, 246, 0.35)"
            : "rgba(109, 40, 217, 0.28)";
        ctx.fill();

        if (n.isPad) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, r + 3.2, 0, Math.PI * 2);
          ctx.strokeStyle = isDark
            ? `rgba(139, 92, 246, ${0.22 + energy * 0.55})`
            : `rgba(124, 58, 237, ${0.18 + energy * 0.45})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // 7. Optical-fiber additive light packets (multi-pass bloom + white-hot core)
      if (!reducedMotion) {
        ctx.save();
        if (isDark) ctx.globalCompositeOperation = "lighter";

        for (let i = packets.length - 1; i >= 0; i--) {
          const pk = packets[i];
          const tr = traces[pk.traceIndex];
          if (!tr) {
            packets.splice(i, 1);
            continue;
          }

          pk.progress += pk.speed * pk.dir;

          const steps = 10;
          const tailStart = pk.progress - pk.dir * pk.tailLength;
          const headPos = sampleTrace(tr, pk.progress);
          const [r, g, b] = pk.color;

          // Pass A: wide soft bloom ribbon
          ctx.beginPath();
          for (let s = 0; s <= steps; s++) {
            const frac = s / steps;
            const pt = sampleTrace(tr, tailStart + (pk.progress - tailStart) * frac);
            if (s === 0) ctx.moveTo(pt.x, pt.y);
            else ctx.lineTo(pt.x, pt.y);
          }
          const tailPos = sampleTrace(tr, tailStart);
          const bloomGrad = ctx.createLinearGradient(
            tailPos.x,
            tailPos.y,
            headPos.x,
            headPos.y
          );
          bloomGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0)`);
          bloomGrad.addColorStop(1, `rgba(${r}, ${g}, ${b}, ${isDark ? 0.35 : 0.24})`);
          ctx.strokeStyle = bloomGrad;
          ctx.lineWidth = 7.5;
          ctx.stroke();

          // Pass B: crisp neon optical core
          const coreGrad = ctx.createLinearGradient(
            tailPos.x,
            tailPos.y,
            headPos.x,
            headPos.y
          );
          coreGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0)`);
          coreGrad.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, ${isDark ? 0.9 : 0.78})`);
          coreGrad.addColorStop(
            1,
            isDark ? "rgba(255, 250, 255, 1)" : `rgba(${r}, ${g}, ${b}, 1)`
          );
          ctx.strokeStyle = coreGrad;
          ctx.lineWidth = 2.2;
          ctx.stroke();

          // Pass C: white-hot luminous packet head
          const headGlow = ctx.createRadialGradient(
            headPos.x,
            headPos.y,
            0.5,
            headPos.x,
            headPos.y,
            12
          );
          headGlow.addColorStop(
            0,
            isDark ? "rgba(255,255,255,0.95)" : `rgba(${r}, ${g}, ${b}, 0.95)`
          );
          headGlow.addColorStop(0.35, `rgba(${r}, ${g}, ${b}, ${isDark ? 0.65 : 0.45})`);
          headGlow.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
          ctx.fillStyle = headGlow;
          ctx.beginPath();
          ctx.arc(headPos.x, headPos.y, 12, 0, Math.PI * 2);
          ctx.fill();

          if (pk.progress > 1.15 || pk.progress < -0.15) {
            const endN = pk.dir === 1 ? nodes[tr.endNode] : nodes[tr.startNode];
            if (endN) endN.glow = 0.9;
            packets.splice(i, 1);
          }
        }
        ctx.restore();

        if (packets.length < 22 && traces.length > 0 && Math.random() < 0.22) {
          spawnPacket(
            Math.floor(Math.random() * traces.length),
            Math.random() > 0.3 ? 1 : -1
          );
        }

        rafId = requestAnimationFrame(render);
      }
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("click", handleClick);
    darkQuery.addEventListener("change", handleThemeChange);
    reducedMotionQuery.addEventListener("change", handleMotionChange);

    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("click", handleClick);
      darkQuery.removeEventListener("change", handleThemeChange);
      reducedMotionQuery.removeEventListener("change", handleMotionChange);
    };
  }, []);

  return (
    <>
      {/* High-DPI Optical PCB + Signal Canvas */}
      <div className="absolute inset-0 z-0 [mask-image:linear-gradient(to_bottom,black_82%,transparent_100%)]">
        <canvas
          ref={canvasRef}
          className="w-full h-full block"
          aria-hidden="true"
        />
      </div>

      {/* Soft Radial Sanctuary Mask Behind Hero Typography (Light & Dark Adaptive) */}
      <div
        className="pointer-events-none absolute inset-0 z-10 dark:hidden"
        style={{
          background:
            "radial-gradient(ellipse 48% 44% at 50% 48%, rgba(249,250,251,0.92) 0%, rgba(249,250,251,0.58) 55%, rgba(249,250,251,0.04) 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 z-10 hidden dark:block"
        style={{
          background:
            "radial-gradient(ellipse 48% 44% at 50% 48%, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.04) 100%)",
        }}
      />
    </>
  );
};

export default CircuitSignalBackground;
