import { useEffect, useRef } from "react";

const SYMBOLS = ["₿", "Ξ", "◎", "Ł", "✦", "⬡", "◈", "⬢", "▲", "◆"];

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  opacity: number;
  fadeSpeed: number;
  symbol: string;
  rotation: number;
  rotSpeed: number;
  type: "symbol" | "dot" | "ring";
}

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

export function CryptoBackground({ intensity = 1 }: { intensity?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;

    function resize() {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    }

    function spawnParticle(startY?: number): Particle {
      const type =
        Math.random() < 0.35 ? "symbol" : Math.random() < 0.5 ? "dot" : "ring";
      return {
        x: randomBetween(0, width),
        y: startY ?? randomBetween(0, height),
        size: type === "symbol" ? randomBetween(10, 22) : type === "ring" ? randomBetween(6, 18) : randomBetween(1.5, 4),
        speedY: -randomBetween(0.15, 0.55),
        speedX: randomBetween(-0.12, 0.12),
        opacity: 0,
        fadeSpeed: randomBetween(0.003, 0.008),
        symbol: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        rotation: randomBetween(0, Math.PI * 2),
        rotSpeed: randomBetween(-0.005, 0.005),
        type,
      };
    }

    function initParticles() {
      const count = Math.floor(28 * intensity);
      particlesRef.current = Array.from({ length: count }, () => spawnParticle());
    }

    function drawGrid(ctx: CanvasRenderingContext2D) {
      ctx.save();
      ctx.strokeStyle = "rgba(59,130,246,0.035)";
      ctx.lineWidth = 1;
      const spacing = 60;
      for (let x = 0; x <= width; x += spacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y <= height; y += spacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      ctx.restore();
    }

    function drawOrbs(ctx: CanvasRenderingContext2D, t: number) {
      const orbs = [
        { x: width * 0.8, y: height * 0.15, r: 200, c: "rgba(37,99,235,0.055)" },
        { x: width * 0.1, y: height * 0.75, r: 160, c: "rgba(59,130,246,0.045)" },
        { x: width * 0.5, y: height * 0.5, r: 120, c: "rgba(99,102,241,0.03)" },
      ];
      for (const orb of orbs) {
        const pulse = 1 + 0.04 * Math.sin(t / 2800 + orb.x);
        const grad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r * pulse);
        grad.addColorStop(0, orb.c);
        grad.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.r * pulse, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }
    }

    let peakOpacity: Record<number, number> = {};

    function tick(t: number) {
      ctx.clearRect(0, 0, width, height);

      drawGrid(ctx);
      drawOrbs(ctx, t);

      particlesRef.current.forEach((p, i) => {
        // Fade in, then hover near peak, then fade out
        if (!peakOpacity[i]) peakOpacity[i] = randomBetween(0.12, 0.35);
        const peak = peakOpacity[i];

        if (p.opacity < peak) {
          p.opacity = Math.min(peak, p.opacity + p.fadeSpeed);
        } else {
          p.opacity += p.fadeSpeed * 0.4;
        }

        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotSpeed;

        if (p.y < -40 || p.opacity >= peak * 1.8) {
          particlesRef.current[i] = spawnParticle(height + 20);
          peakOpacity[i] = randomBetween(0.12, 0.35);
          return;
        }

        ctx.save();
        ctx.globalAlpha = Math.min(p.opacity, 0.45);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        if (p.type === "symbol") {
          ctx.font = `${p.size}px monospace`;
          ctx.fillStyle = "#3b82f6";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(p.symbol, 0, 0);
        } else if (p.type === "ring") {
          ctx.strokeStyle = "#60a5fa";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.stroke();
          // inner dot
          ctx.fillStyle = "#60a5fa";
          ctx.beginPath();
          ctx.arc(0, 0, 1.5, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = "#93c5fd";
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });

      animRef.current = requestAnimationFrame(tick);
    }

    resize();
    initParticles();
    animRef.current = requestAnimationFrame(tick);

    const ro = new ResizeObserver(() => {
      resize();
      initParticles();
      peakOpacity = {};
    });
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(animRef.current);
      ro.disconnect();
    };
  }, [intensity]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
