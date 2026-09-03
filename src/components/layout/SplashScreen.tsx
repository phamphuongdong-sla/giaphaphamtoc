import { useState, useEffect, useRef } from 'react';
import { Icon } from '@/components/ui/Icon';

interface SplashScreenProps {
  onEnter: () => void;
  currentTheme?: 'dark' | 'light';
  onThemeChange?: (theme: 'dark' | 'light') => void;
}

// 🌿 Harmonic Lineage Algorithmic Canvas Component (Mạch Cội Nguồn Sinh Khí Thuật Toán 60fps)
const HarmonicLineageCanvas = ({ isWhite = false, exiting = false }: { isWhite?: boolean; exiting?: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      if (!canvas) return;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildBranches();
    };

    // Pointer tracking for interactive resonance
    const pointer = { x: width / 2, y: height * 0.42, active: false };
    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0]?.clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0]?.clientY : e.clientY;
      if (clientX !== undefined && clientY !== undefined) {
        pointer.x = clientX;
        pointer.y = clientY;
        pointer.active = true;
      }
    };
    const onPointerLeave = () => {
      pointer.active = false;
    };
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('mouseleave', onPointerLeave);

    // Theme color palettes
    const palette = isWhite
      ? ['#c9923a', '#8a5e1c', '#e2b96f', '#b87c2b']
      : ['#f0d090', '#ffffff', '#c9923a', '#e2b96f', '#8b1a1a'];
    const primaryStroke = isWhite ? 'rgba(201, 146, 58, ' : 'rgba(240, 208, 144, ';

    // Precompute Recursive Lineage Tree Branches (Nhánh Huyết Mạch Tỷ Lệ Vàng)
    interface Branch {
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      cpx: number;
      cpy: number;
      weight: number;
      alpha: number;
    }

    const branches: Branch[] = [];
    const buildBranches = () => {
      branches.length = 0;
      const cx = width / 2;
      const cy = height * 0.42;
      const count = 10; // 10 sacred directions
      const maxLen = Math.min(width, height) * 0.62;

      const addBranch = (
        x: number,
        y: number,
        angle: number,
        len: number,
        depth: number,
        weight: number
      ) => {
        if (depth <= 0 || len < 16) return;
        const midAngle = angle + Math.sin(depth * 1.5) * 0.16;
        const cpx = x + Math.cos(midAngle) * (len * 0.5);
        const cpy = y + Math.sin(midAngle) * (len * 0.5);
        const endX = x + Math.cos(angle) * len;
        const endY = y + Math.sin(angle) * len;

        branches.push({
          x1: x,
          y1: y,
          cpx,
          cpy,
          x2: endX,
          y2: endY,
          weight,
          alpha: depth === 3 ? 0.35 : depth === 2 ? 0.22 : 0.12,
        });

        const spread = 0.38;
        const lenRatio = 0.68; // Golden ratio decay
        addBranch(endX, endY, angle - spread, len * lenRatio, depth - 1, weight * 0.68);
        addBranch(endX, endY, angle + spread, len * lenRatio, depth - 1, weight * 0.68);
      };

      for (let i = 0; i < count; i++) {
        const angle = ((Math.PI * 2) / count) * i;
        addBranch(cx, cy, angle, maxLen * 0.45, 3, 1.4);
      }
    };

    resize();
    window.addEventListener('resize', resize);

    // Linh Khí Spirit Particles (Hạt Sinh Khí Hoàng Kim)
    const PARTICLE_COUNT = 160;
    class SpiritParticle {
      x: number = 0;
      y: number = 0;
      prevX: number = 0;
      prevY: number = 0;
      speed: number = 1;
      life: number = 100;
      maxLife: number = 100;
      size: number = 2;
      color: string = palette[0];
      angle: number = 0;
      swirl: number = 0;

      constructor() {
        this.reset(true);
      }

      reset(init = false) {
        const cx = width / 2;
        const cy = height * 0.42;
        this.angle = Math.random() * Math.PI * 2;
        const startR = init ? Math.random() * Math.min(width, height) * 0.48 : Math.random() * 50;
        this.x = cx + Math.cos(this.angle) * startR;
        this.y = cy + Math.sin(this.angle) * startR;
        this.prevX = this.x;
        this.prevY = this.y;
        this.speed = 0.7 + Math.random() * 1.5;
        this.life = 120 + Math.random() * 200;
        this.maxLife = this.life;
        this.size = 1.0 + Math.random() * 2.2;
        this.color = palette[Math.floor(Math.random() * palette.length)];
        this.swirl = (Math.random() - 0.5) * 0.08;
      }

      update(t: number, speedMultiplier: number) {
        this.prevX = this.x;
        this.prevY = this.y;

        const cx = width / 2;
        const cy = height * 0.42;
        const dx = this.x - cx;
        const dy = this.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Vector flow field guided by harmonic waves
        let flowAngle = Math.atan2(dy, dx);
        flowAngle += Math.sin(this.x * 0.004 + t * 0.6) * 0.35 + Math.cos(this.y * 0.004 + t * 0.6) * 0.35;
        flowAngle += this.swirl;

        // Pointer resonance
        if (pointer.active) {
          const pdx = pointer.x - this.x;
          const pdy = pointer.y - this.y;
          const pdist = Math.sqrt(pdx * pdx + pdy * pdy);
          if (pdist < 220 && pdist > 10) {
            const pull = (1 - pdist / 220) * 0.25;
            flowAngle += Math.atan2(pdy, pdx) * pull;
          }
        }

        const currentSpeed = this.speed * speedMultiplier;
        this.x += Math.cos(flowAngle) * currentSpeed;
        this.y += Math.sin(flowAngle) * currentSpeed;

        this.life -= speedMultiplier;
        if (this.life <= 0 || dist > Math.max(width, height) * 0.8) {
          this.reset();
        }
      }

      draw(ctx: CanvasRenderingContext2D) {
        const progress = this.life / this.maxLife;
        const alpha = Math.sin(progress * Math.PI) * (isWhite ? 0.75 : 0.85);

        ctx.strokeStyle = this.color;
        ctx.globalAlpha = alpha;
        ctx.lineWidth = this.size;
        ctx.beginPath();
        ctx.moveTo(this.prevX, this.prevY);
        ctx.lineTo(this.x, this.y);
        ctx.stroke();

        // Glowing core head
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 0.9, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const particles: SpiritParticle[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new SpiritParticle());
    }

    let time = 0;
    const render = () => {
      time += 0.016;
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height * 0.42;
      const speedMultiplier = exiting ? 4.5 : 1.0;

      // 1. Draw Lineage Tree Branches
      ctx.lineCap = 'round';
      for (let i = 0; i < branches.length; i++) {
        const b = branches[i];
        ctx.lineWidth = b.weight;
        ctx.strokeStyle = `${primaryStroke}${b.alpha})`;
        ctx.beginPath();
        ctx.moveTo(b.x1, b.y1);
        ctx.quadraticCurveTo(b.cpx, b.cpy, b.x2, b.y2);
        ctx.stroke();
      }

      // 2. Draw Pulsing Harmonic Rings (Vòng Sóng Nhịp Thở Cội Nguồn)
      const basePulse = Math.sin(time * 1.1) * 14;
      const rings = [
        { r: 85 + basePulse, dash: [4, 6], alpha: isWhite ? 0.4 : 0.55, width: 1.2 },
        { r: 160 + basePulse * 0.6, dash: [2, 8], alpha: isWhite ? 0.25 : 0.35, width: 0.8 },
        { r: 250 + basePulse * 0.3, dash: [], alpha: isWhite ? 0.15 : 0.22, width: 0.6 },
        { r: 360 + basePulse * 0.15, dash: [3, 10], alpha: isWhite ? 0.08 : 0.14, width: 0.5 },
      ];

      for (const ring of rings) {
        ctx.strokeStyle = `${primaryStroke}${ring.alpha})`;
        ctx.lineWidth = ring.width;
        ctx.setLineDash(ring.dash);
        ctx.lineDashOffset = -time * 8;
        ctx.beginPath();
        ctx.arc(cx, cy, ring.r, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.setLineDash([]); // Reset dash

      // 3. Draw Spirit Particles (Linh Khí Chạy Dọc Mạch)
      for (let i = 0; i < particles.length; i++) {
        particles[i].update(time, speedMultiplier);
        particles[i].draw(ctx);
      }
      ctx.globalAlpha = 1.0;

      // 4. Pointer Aura on interaction
      if (pointer.active && !exiting) {
        const rad = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 75);
        rad.addColorStop(0, isWhite ? 'rgba(201, 146, 58, 0.16)' : 'rgba(240, 208, 144, 0.18)');
        rad.addColorStop(1, 'transparent');
        ctx.fillStyle = rad;
        ctx.beginPath();
        ctx.arc(pointer.x, pointer.y, 75, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('mouseleave', onPointerLeave);
    };
  }, [isWhite, exiting]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 2,
        width: '100%',
        height: '100%',
        transition: exiting ? 'opacity 0.7s ease' : 'none',
        opacity: exiting ? 0 : 1,
      }}
    />
  );
};

// ☁️ Ethereal Oriental Cloud Wave SVG Component (Hài Hòa Êm Dịu Tông Đen)
const EtherealCloudWave = ({ opacity = 0.65, isWhite = false, speed = '32s', reverse = false }: { opacity?: number; isWhite?: boolean; speed?: string; reverse?: boolean }) => (
  <div
    style={{
      position: 'absolute',
      bottom: 0,
      left: '-25%',
      width: '150%',
      height: 190,
      pointerEvents: 'none',
      opacity,
      animation: `${reverse ? 'cloudFloatRight' : 'cloudFloatLeft'} ${speed} ease-in-out infinite`,
      filter: isWhite ? 'none' : 'drop-shadow(0 -3px 10px rgba(201,146,58,0.22))',
      zIndex: 1,
    }}
  >
    <svg viewBox="0 0 1440 220" fill="none" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
      <path
        d="M0 220C140 180 220 120 360 140C500 160 580 200 720 170C860 140 940 80 1080 110C1220 140 1300 190 1440 160V220H0Z"
        fill={isWhite ? 'url(#cloudGradWhite1)' : 'url(#cloudGradDark1)'}
      />
      <path
        d="M0 220C180 160 280 90 440 120C600 150 680 190 840 150C1000 110 1080 60 1240 100C1340 130 1400 160 1440 180V220H0Z"
        fill={isWhite ? 'url(#cloudGradWhite2)' : 'url(#cloudGradDark2)'}
      />
      <defs>
        <linearGradient id="cloudGradWhite1" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#ede8dc" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id="cloudGradWhite2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(201,146,58,0.3)" />
          <stop offset="100%" stopColor="rgba(247,244,236,0.9)" />
        </linearGradient>

        <linearGradient id="cloudGradDark1" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(240, 208, 144, 0.45)" />
          <stop offset="40%" stopColor="rgba(201, 146, 58, 0.25)" />
          <stop offset="100%" stopColor="#0c0a08" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id="cloudGradDark2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(226, 185, 111, 0.35)" />
          <stop offset="50%" stopColor="rgba(139, 26, 26, 0.2)" />
          <stop offset="100%" stopColor="#070707" stopOpacity="0.95" />
        </linearGradient>
      </defs>
    </svg>
  </div>
);

// Sparkle Particle Specs
const SPARKLES = [
  { left: '8%', size: 4, duration: '14s', delay: '0s' },
  { left: '20%', size: 3, duration: '18s', delay: '2s' },
  { left: '34%', size: 5, duration: '13s', delay: '4s' },
  { left: '52%', size: 3, duration: '16s', delay: '1s' },
  { left: '68%', size: 4, duration: '15s', delay: '5s' },
  { left: '82%', size: 5, duration: '12s', delay: '3s' },
  { left: '92%', size: 3, duration: '17s', delay: '0.5s' },
];



export const SplashScreen = ({ onEnter, currentTheme = 'light', onThemeChange }: SplashScreenProps) => {
  const [exiting, setExiting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark'>(() => {
    return currentTheme || (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(timer);
  }, []);

  const handleEnter = () => {
    if (exiting) return;
    setExiting(true);
    setTimeout(() => {
      if (typeof onEnter === 'function') {
        onEnter();
      }
    }, 700);
  };

  const handleSelectTheme = (t: 'light' | 'dark') => {
    setSelectedTheme(t);
    onThemeChange?.(t);
  };

  const isWhiteTheme = selectedTheme === 'light';
  const logoFile = isWhiteTheme ? 'logotrang.png' : 'logoden.png';

  return (
    <div
      onClick={handleEnter}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: isWhiteTheme ? '#f7f4ec' : '#070707',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        cursor: 'pointer',
        userSelect: 'none',
        opacity: exiting ? 0 : 1,
        pointerEvents: exiting ? 'none' : 'auto',
        transition: exiting ? 'opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
      }}
    >
      {/* ── LAYER 1: BOTTOM ETHEREAL CLOUDS (Mây Cổ Cảnh Lướt Nhẹ) ── */}
      <EtherealCloudWave isWhite={isWhiteTheme} opacity={isWhiteTheme ? 0.65 : 0.6} speed="36s" />
      <EtherealCloudWave isWhite={isWhiteTheme} opacity={isWhiteTheme ? 0.45 : 0.4} speed="26s" reverse />

      {/* ── LAYER 2: MIDDLE SPARKLES / DUST PARTICLES (Đốm Sáng Linh Khí) ── */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2 }}>
        {SPARKLES.map((sp, idx) => (
          <div
            key={`sparkle-${idx}`}
            className="splash-sparkle"
            style={{
              position: 'absolute',
              left: sp.left,
              bottom: '-10px',
              width: sp.size,
              height: sp.size,
              borderRadius: '50%',
              backgroundColor: isWhiteTheme ? '#c9923a' : '#f0d090',
              boxShadow: isWhiteTheme
                ? '0 0 10px rgba(201,146,58,0.8)'
                : '0 0 12px rgba(240,208,144,0.9)',
              animation: `sparkleRise ${sp.duration} ease-in-out infinite`,
              animationDelay: sp.delay,
              opacity: mounted ? 1 : 0,
            }}
          />
        ))}
      </div>

      {/* ── LAYER 3: HARMONIC LINEAGE ALGORITHMIC CANVAS (Huyết Mạch Cội Nguồn Thuật Toán 60fps) ── */}
      <HarmonicLineageCanvas isWhite={isWhiteTheme} exiting={exiting} />

      {/* Ambient center background glow */}
      <div style={{
        position: 'absolute',
        top: '40%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '80vw', height: '80vw',
        maxWidth: 800, maxHeight: 800,
        background: isWhiteTheme
          ? 'radial-gradient(circle, rgba(201,146,58,0.18) 0%, rgba(240,208,144,0.08) 50%, transparent 70%)'
          : 'radial-gradient(circle, rgba(201,146,58,0.12) 0%, rgba(139,26,26,0.05) 50%, transparent 70%)',
        filter: 'blur(50px)',
        opacity: mounted ? 1 : 0,
        transition: 'opacity 2.5s ease',
        pointerEvents: 'none',
      }} />

      {/* CỔNG HÀO QUANG (PORTAL RADIANCE BLOOM) */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: exiting
            ? 'translate(-50%, -50%) scale(10)'
            : 'translate(-50%, -50%) scale(1)',
          width: 220,
          height: 220,
          borderRadius: '50%',
          background: isWhiteTheme
            ? 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(226,185,111,0.65) 35%, rgba(201,146,58,0.25) 65%, transparent 100%)'
            : 'radial-gradient(circle, rgba(240,208,144,0.9) 0%, rgba(201,146,58,0.55) 35%, rgba(139,26,26,0.25) 65%, transparent 100%)',
          filter: 'blur(30px)',
          opacity: exiting ? 0.95 : (mounted ? (isWhiteTheme ? 0.6 : 0.45) : 0),
          transition: 'transform 0.75s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.75s ease',
          pointerEvents: 'none',
          zIndex: 4,
        }}
      />

      {/* PORTAL EXPANDING RING FX */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: exiting
            ? 'translate(-50%, -50%) scale(6.5)'
            : 'translate(-50%, -50%) scale(1)',
          width: 320,
          height: 320,
          borderRadius: '50%',
          border: isWhiteTheme ? '2px solid rgba(201, 146, 58, 0.5)' : '2px solid rgba(240, 208, 144, 0.65)',
          boxShadow: isWhiteTheme ? '0 0 50px rgba(201, 146, 58, 0.3)' : '0 0 60px rgba(201, 146, 58, 0.6)',
          opacity: exiting ? 0 : (mounted ? 0.35 : 0),
          transition: 'transform 0.75s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.6s ease',
          pointerEvents: 'none',
          zIndex: 4,
        }}
      />

      {/* THU PHÓNG (PORTAL ZOOM CONTAINER) */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: '0 24px',
        width: '100%',
        maxWidth: 520,
        transform: exiting ? 'scale(2.2) translateY(-20px)' : 'scale(1) translateY(0)',
        opacity: exiting ? 0 : 1,
        filter: exiting ? 'blur(10px)' : 'none',
        transition: 'transform 0.75s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.65s ease, filter 0.65s ease',
      }}>
        {/* Logo box with luxury glow */}
        <div style={{ position: 'relative', marginBottom: 32 }}>
          {/* Pulse rings */}
          <div className="splash-ring splash-ring-1" style={{
            position: 'absolute',
            top: '50%', left: '50%',
            transform: 'translate(-50%,-50%)',
            width: 165, height: 165,
            borderRadius: 46,
            border: isWhiteTheme ? '1px solid rgba(201,146,58,0.4)' : '1px solid rgba(201,146,58,0.35)',
            opacity: mounted ? 1 : 0,
          }} />
          <div className="splash-ring splash-ring-2" style={{
            position: 'absolute',
            top: '50%', left: '50%',
            transform: 'translate(-50%,-50%)',
            width: 165, height: 165,
            borderRadius: 46,
            border: isWhiteTheme ? '1px solid rgba(201,146,58,0.25)' : '1px solid rgba(201,146,58,0.2)',
            opacity: mounted ? 1 : 0,
          }} />

          {/* Logo container */}
          <div style={{
            position: 'relative',
            width: 144, height: 144,
            borderRadius: 40,
            background: isWhiteTheme
              ? 'linear-gradient(145deg, #ffffff 0%, #f4eee2 100%)'
              : 'linear-gradient(145deg, rgba(201,146,58,0.35) 0%, rgba(201,146,58,0.08) 100%)',
            border: isWhiteTheme
              ? '1px solid rgba(201,146,58,0.45)'
              : '1px solid rgba(201,146,58,0.4)',
            boxShadow: isWhiteTheme
              ? '0 20px 50px rgba(180,140,80,0.25), 0 0 35px rgba(201,146,58,0.2), inset 0 1px 0 rgba(255,255,255,0.8)'
              : '0 25px 60px rgba(0,0,0,0.8), 0 0 40px rgba(201,146,58,0.2), inset 0 1px 0 rgba(255,255,255,0.25)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.88)',
            transition: 'all 1.2s cubic-bezier(0.16,1,0.3,1) 0.1s',
          }}>
            <img
              src={`${import.meta.env.BASE_URL}${logoFile}`}
              alt="Gia Phả Phạm Tộc"
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 39 }}
            />
            {/* Shine sweep */}
            <div className="splash-shine" style={{
              position: 'absolute', top: 0, left: '-200%',
              width: '60%', height: '100%',
              background: 'linear-gradient(to right, transparent 0%, rgba(255,255,255,0.35) 50%, transparent 100%)',
              transform: 'skewX(-20deg)',
              opacity: mounted ? 1 : 0,
            }} />
          </div>
        </div>

        {/* Kicker */}
        <p style={{
          fontFamily: "'Be Vietnam Pro', sans-serif",
          letterSpacing: '5px',
          fontSize: '10px',
          color: isWhiteTheme ? '#8a5e1c' : 'rgba(201,146,58,0.85)',
          fontWeight: 700,
          textTransform: 'uppercase',
          margin: '0 0 14px 0',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'none' : 'translateY(20px)',
          transition: 'all 1s cubic-bezier(0.16,1,0.3,1) 0.4s',
        }}>
          Gia tộc · Truyền thống · Tâm linh
        </p>

        {/* Main title */}
        <h1 style={{
          fontFamily: "'Playfair Display', 'Noto Serif', serif",
          fontSize: 'clamp(36px, 8vw, 54px)',
          color: isWhiteTheme ? '#2b2118' : '#f2edd8',
          lineHeight: 1.1,
          margin: '0 0 16px 0',
          fontWeight: 700,
          letterSpacing: '0.02em',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'none' : 'translateY(24px)',
          transition: 'all 1.1s cubic-bezier(0.16,1,0.3,1) 0.55s',
        }}>
          Gia Phả <br />
          <span
            className={isWhiteTheme ? 'splash-title-gold-dark' : 'splash-title-gold'}
            style={{ fontWeight: 900 }}
          >
            Phạm Tộc
          </span>
        </h1>

        {/* Divider */}
        <div style={{
          width: 60, height: 1,
          background: isWhiteTheme
            ? 'linear-gradient(90deg, transparent, rgba(201,146,58,0.9), transparent)'
            : 'linear-gradient(90deg, transparent, rgba(201,146,58,0.8), transparent)',
          marginBottom: 16,
          opacity: mounted ? 1 : 0,
          transition: 'opacity 1s ease 0.7s',
        }} />

        {/* Year */}
        <p style={{
          color: isWhiteTheme ? 'rgba(43,33,24,0.6)' : 'rgba(242,237,216,0.45)',
          fontSize: '10.5px',
          letterSpacing: '5px',
          fontWeight: 600,
          margin: '0 0 20px 0',
          textTransform: 'uppercase',
          fontFamily: "'Be Vietnam Pro', sans-serif",
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'none' : 'translateY(16px)',
          transition: 'all 1s cubic-bezier(0.16,1,0.3,1) 0.8s',
        }}>
          THỦY TỔ 1891 · TÂN MÃO
        </p>

        {/* Quote */}
        <div style={{
          position: 'relative',
          padding: '0 24px',
          margin: '0 0 24px 0',
          maxWidth: 420,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'none' : 'translateY(16px)',
          transition: 'all 1s cubic-bezier(0.16,1,0.3,1) 1s',
        }}>
          <span style={{
            position: 'absolute', left: 4, top: -4,
            fontSize: 26,
            color: isWhiteTheme ? 'rgba(201,146,58,0.5)' : 'rgba(201,146,58,0.35)',
            fontFamily: 'Georgia, serif', lineHeight: 1,
          }}>"</span>
          <p style={{
            fontSize: '14px',
            fontStyle: 'italic',
            color: isWhiteTheme ? 'rgba(43,33,24,0.78)' : 'rgba(242,237,216,0.65)',
            lineHeight: 1.8,
            margin: 0,
            letterSpacing: '0.3px',
            fontFamily: "'Playfair Display', 'Noto Serif', serif",
          }}>
            Tổ tiên là cội nguồn, con cháu là nhánh lá,<br />phúc đức là hoa trái.
          </p>
        </div>

        {/* Theme Selection Segmented Control */}
        <div style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'none' : 'translateY(16px)',
          transition: 'all 1s cubic-bezier(0.16,1,0.3,1) 1.1s',
          marginBottom: 20,
        }}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '3px',
              borderRadius: 999,
              backgroundColor: isWhiteTheme ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.06)',
              border: isWhiteTheme ? '1px solid rgba(201,146,58,0.35)' : '1px solid rgba(201,146,58,0.25)',
              boxShadow: isWhiteTheme ? 'inset 0 1px 3px rgba(0,0,0,0.04)' : 'inset 0 1px 3px rgba(0,0,0,0.5)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <button
              type="button"
              onClick={() => handleSelectTheme('light')}
              style={{
                padding: '7px 18px',
                borderRadius: 999,
                border: 'none',
                backgroundColor: isWhiteTheme ? '#ffffff' : 'transparent',
                color: isWhiteTheme ? '#6b450a' : 'rgba(242,237,216,0.55)',
                boxShadow: isWhiteTheme ? '0 3px 12px rgba(180,140,80,0.2), 0 1px 2px rgba(0,0,0,0.05)' : 'none',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                fontFamily: "'Be Vietnam Pro', sans-serif",
                letterSpacing: '0.03em',
              }}
            >
              <Icon name="sun" size={13} />
              <span>Tông Trắng</span>
            </button>
            <button
              type="button"
              onClick={() => handleSelectTheme('dark')}
              style={{
                padding: '7px 18px',
                borderRadius: 999,
                border: 'none',
                backgroundColor: !isWhiteTheme ? 'rgba(201,146,58,0.28)' : 'transparent',
                color: !isWhiteTheme ? '#f0d090' : 'rgba(43,33,24,0.55)',
                boxShadow: !isWhiteTheme ? '0 3px 14px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)' : 'none',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                fontFamily: "'Be Vietnam Pro', sans-serif",
                letterSpacing: '0.03em',
              }}
            >
              <Icon name="moon" size={13} />
              <span>Tông Tối</span>
            </button>
          </div>
        </div>

        {/* Enter button */}
        <div style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'none' : 'translateY(16px)',
          transition: 'all 1s cubic-bezier(0.16,1,0.3,1) 1.2s',
        }}>
          <button
            className="splash-enter-btn"
            onClick={(e) => { e.stopPropagation(); handleEnter(); }}
            style={{
              padding: '14px 40px',
              borderRadius: 999,
              backgroundColor: isWhiteTheme ? 'rgba(201,146,58,0.14)' : 'rgba(201,146,58,0.1)',
              border: isWhiteTheme ? '1px solid rgba(201,146,58,0.6)' : '1px solid rgba(201,146,58,0.5)',
              color: isWhiteTheme ? '#6b450a' : '#f0d090',
              fontSize: '12px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              cursor: 'pointer',
              transition: 'all 0.35s ease',
              textTransform: 'uppercase',
              letterSpacing: '3px',
              fontFamily: "'Be Vietnam Pro', sans-serif",
              boxShadow: isWhiteTheme
                ? '0 8px 25px rgba(180,140,80,0.25), inset 0 1px 0 rgba(255,255,255,0.6)'
                : '0 8px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15)',
            }}
          >
            <Icon name="sparkles" size={17} />
            <span>Khám Phá Gia Phả</span>
          </button>
        </div>
      </div>

      <p style={{
        position: 'absolute', bottom: 18, left: 0, right: 0,
        textAlign: 'center',
        fontSize: '10px', fontWeight: 500,
        color: isWhiteTheme ? 'rgba(43,33,24,0.45)' : 'rgba(242,237,216,0.22)',
        letterSpacing: '0.12em',
        opacity: mounted && !exiting ? 1 : 0,
        transition: 'opacity 1.5s ease 1.4s',
        fontFamily: "'Be Vietnam Pro', sans-serif",
        zIndex: 10,
        pointerEvents: 'none',
      }}>
        Chạm bất kỳ đâu để bắt đầu
      </p>

      <style dangerouslySetInnerHTML={{ __html: `
        /* 1. Mây cổ cảnh lướt nhẹ */
        @keyframes cloudFloatLeft {
          0%   { transform: translateX(-5%) scaleY(1); }
          50%  { transform: translateX(10%) scaleY(1.08); }
          100% { transform: translateX(-5%) scaleY(1); }
        }
        @keyframes cloudFloatRight {
          0%   { transform: translateX(5%) scaleY(1.06); }
          50%  { transform: translateX(-10%) scaleY(0.94); }
          100% { transform: translateX(5%) scaleY(1.06); }
        }

        /* 2. Đốm sáng linh khí bẩy nhẹ lên */
        @keyframes sparkleRise {
          0% {
            transform: translateY(105vh) scale(0.6);
            opacity: 0;
          }
          20% {
            opacity: 0.75;
          }
          80% {
            opacity: 0.75;
          }
          100% {
            transform: translateY(-10vh) scale(1.2);
            opacity: 0;
          }
        }

        /* 3. 3D Lineage Tree Network Pulse Ring Animation */
        .pulse-ring-slow {
          animation: pulseRingSlow 7s ease-in-out infinite;
          transform-origin: 400px 400px;
        }
        @keyframes pulseRingSlow {
          0%   { transform: scale(0.92); opacity: 0.35; }
          50%  { transform: scale(1.12); opacity: 0.75; }
          100% { transform: scale(0.92); opacity: 0.35; }
        }

        .splash-title-gold {
          background: linear-gradient(135deg, #f0d090 0%, #c9923a 50%, #e2b96f 100%);
          -webkit-background-clip: text !important;
          -webkit-text-fill-color: transparent !important;
          background-clip: text !important;
          color: transparent !important;
          display: inline-block;
        }
        .splash-title-gold-dark {
          background: linear-gradient(135deg, #8a5e1c 0%, #c9923a 50%, #6b450a 100%);
          -webkit-background-clip: text !important;
          -webkit-text-fill-color: transparent !important;
          background-clip: text !important;
          color: transparent !important;
          display: inline-block;
        }
        .splash-ring-1 {
          animation: splashRingPulse 3s cubic-bezier(0.215,0.61,0.355,1) infinite;
          animation-delay: 1.5s;
        }
        .splash-ring-2 {
          animation: splashRingPulse 3s cubic-bezier(0.215,0.61,0.355,1) infinite;
          animation-delay: 3s;
        }
        @keyframes splashRingPulse {
          0%   { transform: translate(-50%,-50%) scale(1); opacity: 0.5; }
          100% { transform: translate(-50%,-50%) scale(1.8); opacity: 0; }
        }
        .splash-shine {
          animation: splashShine 5s infinite;
          animation-delay: 2s;
        }
        @keyframes splashShine {
          0%   { left: -200%; }
          20%  { left: 250%; }
          100% { left: 250%; }
        }
        .splash-enter-btn:hover {
          background: ${isWhiteTheme ? 'rgba(201,146,58,0.25)' : 'rgba(201,146,58,0.22)'} !important;
          border-color: rgba(201,146,58,0.85) !important;
          box-shadow: ${isWhiteTheme ? '0 0 35px rgba(201,146,58,0.3), 0 8px 24px rgba(180,140,80,0.3)' : '0 0 35px rgba(201,146,58,0.4), 0 8px 32px rgba(0,0,0,0.6)'} !important;
          transform: translateY(-2px);
        }
        .splash-enter-btn:active {
          transform: scale(0.97) !important;
        }
      `}} />
    </div>
  );
};