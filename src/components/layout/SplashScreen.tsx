import { useState, useEffect } from 'react';
import { Icon } from '@/components/ui/Icon';

interface SplashScreenProps {
  onEnter: () => void;
  currentTheme?: 'dark' | 'light';
  onThemeChange?: (theme: 'dark' | 'light') => void;
}

// 🌿 Lineage Tree Pulse Network Component (Mạch Cội Nguồn Gia Tộc 3D)
const LineageTreeNetwork = ({ isWhite = false }: { isWhite?: boolean }) => {
  const primaryColor = isWhite ? 'rgba(201, 146, 58, 0.45)' : 'rgba(240, 208, 144, 0.55)';
  const nodeGlow = isWhite ? '#c9923a' : '#f0d090';

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 2,
        overflow: 'hidden',
      }}
    >
      <svg
        viewBox="0 0 800 800"
        fill="none"
        style={{
          width: '100%',
          height: '100%',
          opacity: 0.88,
          filter: isWhite ? 'drop-shadow(0 0 10px rgba(201,146,58,0.25))' : 'drop-shadow(0 0 14px rgba(240,208,144,0.35))',
        }}
      >
        {/* Central Ancestral Lineage Pulse Rings */}
        <circle cx="400" cy="400" r="90" stroke={primaryColor} strokeWidth="1" strokeDasharray="4 6" className="pulse-ring-slow" />
        <circle cx="400" cy="400" r="160" stroke={primaryColor} strokeWidth="0.75" opacity="0.5" />
        <circle cx="400" cy="400" r="240" stroke={primaryColor} strokeWidth="0.5" strokeDasharray="2 8" opacity="0.35" />

        {/* Curved Tree Lineage Branches (Mạch Cội Nguồn Tỏa Rạng) */}
        <path d="M400 360 C 350 260, 260 180, 140 100 C 90 60, 40 40, 0 20" stroke={primaryColor} strokeWidth="1.5" />
        <path d="M260 180 C 200 140, 150 80, 90 20" stroke={primaryColor} strokeWidth="1" opacity="0.6" />

        <path d="M400 360 C 450 260, 540 180, 660 100 C 710 60, 760 40, 800 20" stroke={primaryColor} strokeWidth="1.5" />
        <path d="M540 180 C 600 140, 650 80, 710 20" stroke={primaryColor} strokeWidth="1" opacity="0.6" />

        <path d="M400 440 C 340 540, 240 620, 120 700 C 60 740, 30 760, 0 780" stroke={primaryColor} strokeWidth="1.5" />
        <path d="M240 620 C 180 660, 120 720, 60 780" stroke={primaryColor} strokeWidth="1" opacity="0.6" />

        <path d="M400 440 C 460 540, 560 620, 680 700 C 740 740, 770 760, 800 780" stroke={primaryColor} strokeWidth="1.5" />
        <path d="M560 620 C 620 660, 680 720, 740 780" stroke={primaryColor} strokeWidth="1" opacity="0.6" />

        <path d="M350 400 C 250 400, 150 360, 0 320" stroke={primaryColor} strokeWidth="1.2" opacity="0.65" />
        <path d="M450 400 C 550 400, 650 440, 800 480" stroke={primaryColor} strokeWidth="1.2" opacity="0.65" />

        {/* Glowing Energy Pulse Particles (Hạt Ánh Sáng Chạy Dọc Mạch) */}
        <circle cx="0" cy="0" r="4.5" fill="#ffffff" filter={`drop-shadow(0 0 10px ${nodeGlow})`}>
          <animateMotion path="M400 360 C 350 260, 260 180, 140 100 C 90 60, 40 40, 0 20" dur="6.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="0" cy="0" r="4.5" fill="#ffffff" filter={`drop-shadow(0 0 10px ${nodeGlow})`}>
          <animateMotion path="M400 360 C 450 260, 540 180, 660 100 C 710 60, 760 40, 800 20" dur="8s" repeatCount="indefinite" />
        </circle>
        <circle cx="0" cy="0" r="4" fill={nodeGlow} filter={`drop-shadow(0 0 8px ${nodeGlow})`}>
          <animateMotion path="M400 440 C 340 540, 240 620, 120 700 C 60 740, 30 760, 0 780" dur="8.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="0" cy="0" r="4" fill={nodeGlow} filter={`drop-shadow(0 0 8px ${nodeGlow})`}>
          <animateMotion path="M400 440 C 460 540, 560 620, 680 700 C 740 740, 770 760, 800 780" dur="7s" repeatCount="indefinite" />
        </circle>
        <circle cx="0" cy="0" r="3.5" fill="#ffffff" filter={`drop-shadow(0 0 6px ${nodeGlow})`}>
          <animateMotion path="M350 400 C 250 400, 150 360, 0 320" dur="9.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="0" cy="0" r="3.5" fill="#ffffff" filter={`drop-shadow(0 0 6px ${nodeGlow})`}>
          <animateMotion path="M450 400 C 550 400, 650 440, 800 480" dur="10s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
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



export const SplashScreen = ({ onEnter, onFinish, currentTheme = 'light', onThemeChange }: SplashScreenProps) => {
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
      if (typeof onFinish === 'function') {
        onFinish();
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

      {/* ── LAYER 3: 3D LINEAGE TREE PULSE NETWORK (Mạch Cội Nguồn Gia Tộc 3D) ── */}
      <LineageTreeNetwork isWhite={isWhiteTheme} />

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