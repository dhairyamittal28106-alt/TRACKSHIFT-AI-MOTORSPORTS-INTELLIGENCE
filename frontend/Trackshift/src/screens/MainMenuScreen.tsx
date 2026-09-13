import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, Layers, CheckCircle, ChevronRight, ShieldCheck } from 'lucide-react';
import { soundService } from '../services/soundService';

const MENU_ITEMS = [
  {
    label: 'Race Control',
    sub: 'Live telemetry · Tyre data · Driver positions',
    path: '/race-control',
    icon: Activity,
    num: '01',
  },
  {
    label: 'Tyre Intelligence',
    sub: 'Degradation curves · ML model output · Compound analysis',
    path: '/tyre-intelligence',
    icon: Layers,
    num: '02',
  },
  {
    label: 'Practice → Race',
    sub: 'Strategy input · Pace-cost calculator · Race-day bridge',
    path: '/validation',
    icon: CheckCircle,
    num: '03',
  },
  {
    label: 'Methodology & Validation',
    sub: 'Data pipeline · Stint quarantine · Grouped ML evaluation',
    path: '/methodology-validation',
    icon: ShieldCheck,
    num: '04',
  },
];

export default function MainMenuScreen() {
  const [selectedPath, setSelectedPath] = useState<string>('/race-control');
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  const activePath = hoveredPath ?? selectedPath;

  return (
    <div className="relative w-full h-screen overflow-hidden bg-trackbg flex select-none">
      {}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {}
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          poster="/videos/menu-bg-poster.jpg"
          className="absolute inset-0 w-full h-full object-cover object-center scale-105"
        >
          <source src="/videos/menu-bg.mp4" type="video/mp4" />
          <source src="/videos/Video_Generation_Prompt__Cinem.mp4" type="video/mp4" />
        </video>

        {}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 90% 80% at 30% 50%, rgba(10, 10, 10, 0.1) 0%, rgba(10, 10, 10, 0.55) 100%),
              linear-gradient(180deg, rgba(10, 10, 10, 0.6) 0%, rgba(10, 10, 10, 0.05) 30%, rgba(10, 10, 10, 0.75) 100%)
            `,
          }}
        />

        {}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(90deg, rgba(10,10,10,0) 0%, rgba(10,10,10,0.2) 20%, rgba(10,10,10,0.7) 42%, #0A0A0A 62%)',
          }}
        />

        {}
        {[
          { width: '24%', left: '4%', top: '64%', color: '#FF1A1A', opacity: 0.25 },
          { width: '18%', left: '2%', top: '66%', color: '#E10600', opacity: 0.2 },
          { width: '28%', left: '16%', top: '62%', color: '#ff4d4d', opacity: 0.18 },
        ].map((s, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              width: s.width,
              height: '1px',
              left: s.left,
              top: s.top,
              background: `linear-gradient(90deg, transparent, ${s.color} 75%, transparent)`,
              opacity: s.opacity,
            }}
          />
        ))}
      </div>

      {}
      <div className="absolute right-0 top-0 bottom-0 w-[54%] max-w-[640px] flex flex-col z-10">
        {}
        <motion.div
          className="px-10 pt-10 pb-6 flex-shrink-0"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          {}
          <h1 className="text-4xl lg:text-5xl font-black tracking-[0.2em] leading-none uppercase select-none">
            <span className="text-[#F5F5F5] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">TRACK</span>
            <span
              className="font-black"
              style={{
                color: '#FFFFFF',
                WebkitTextStroke: '2px #FF1A1A',
                paintOrder: 'stroke fill',
                textShadow: '0 0 16px rgba(255, 26, 26, 0.9), 0 0 32px rgba(225, 6, 0, 0.65)',
              }}
            >
              SHIFT
            </span>
          </h1>

          {}
          <p className="text-[10px] lg:text-[10.5px] font-black tracking-[0.28em] uppercase text-gray-400 mt-2.5">
            AI MOTORSPORT INTELLIGENCE
          </p>

          {}
          <div
            className="mt-3.5 h-0.5 w-16"
            style={{
              background: '#FF1A1A',
              boxShadow: '0 0 12px rgba(255, 26, 26, 0.9), 0 0 20px rgba(225, 6, 0, 0.5)',
            }}
          />
        </motion.div>

        {}
        <nav className="flex-1 px-10 space-y-3 overflow-y-auto py-1 flex flex-col justify-center">
          {MENU_ITEMS.map((item, i) => {
            const isActive = item.path === activePath;

            return (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.12 + i * 0.07, duration: 0.35 }}
              >
                <Link
                  to={item.path}
                  onClick={() => {
                    soundService.playInterfaceTone();
                    setSelectedPath(item.path);
                  }}
                  onMouseEnter={() => setHoveredPath(item.path)}
                  onMouseLeave={() => setHoveredPath(null)}
                  className="group block relative"
                >
                  <div
                    className="relative flex items-center gap-4 px-5 py-3.5 rounded-lg transition-all duration-200 overflow-hidden"
                    style={{
                      background: isActive
                        ? 'linear-gradient(90deg, rgba(225, 6, 0, 0.15) 0%, rgba(225, 6, 0, 0.02) 100%), linear-gradient(180deg, #1e1414 0%, #141414 100%)'
                        : 'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.012) 100%), #141414',
                      border: isActive
                        ? '1px solid rgba(225, 6, 0, 0.65)'
                        : '1px solid #3A3A3A',
                      borderLeft: isActive
                        ? '3px solid #E10600'
                        : '3px solid transparent',
                      boxShadow: isActive
                        ? '0 0 24px rgba(225, 6, 0, 0.35), inset 0 0 14px rgba(225, 6, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                        : 'inset 0 1px 0 rgba(255, 255, 255, 0.09), 0 4px 14px rgba(0, 0, 0, 0.5)',
                      transform: isActive ? 'translateY(-1px)' : 'none',
                    }}
                  >
                    {}
                    <span
                      className="font-mono tabular-nums text-xs font-black tracking-wider shrink-0 transition-colors"
                      style={{
                        color: isActive ? '#E10600' : '#8A8A8A',
                        textShadow: isActive ? '0 0 8px rgba(225,6,0,0.8)' : 'none',
                      }}
                    >
                      {item.num}
                    </span>

                    {}
                    <div
                      className="w-10 h-10 rounded-md flex items-center justify-center shrink-0 transition-all duration-200"
                      style={{
                        background: isActive
                          ? 'rgba(225, 6, 0, 0.15)'
                          : 'rgba(255, 255, 255, 0.025)',
                        border: isActive
                          ? '1px solid rgba(225, 6, 0, 0.5)'
                          : '1px solid #3A3A3A',
                        boxShadow: isActive
                          ? '0 0 10px rgba(225, 6, 0, 0.35)'
                          : 'none',
                      }}
                    >
                      <item.icon
                        size={17}
                        className={isActive ? 'text-accent' : 'text-gray-400 group-hover:text-gray-200'}
                        style={isActive ? { filter: 'drop-shadow(0 0 6px rgba(225, 6, 0, 0.8))' } : {}}
                      />
                    </div>

                    {}
                    <div className="flex-1 min-w-0 pr-2">
                      <div
                        className="text-sm font-black uppercase tracking-wider transition-colors truncate"
                        style={{
                          color: isActive ? '#ffffff' : '#cbd5e1',
                          textShadow: isActive ? '0 1px 3px rgba(0,0,0,0.9)' : 'none',
                        }}
                      >
                        {item.label}
                      </div>
                      <div
                        className="text-[10px] font-medium tracking-wide mt-0.5 transition-colors truncate"
                        style={{
                          color: isActive ? '#CFCFCF' : '#8A8A8A',
                        }}
                      >
                        {item.sub}
                      </div>
                    </div>

                    {}
                    <div className="shrink-0 flex items-center pl-1">
                      <ChevronRight
                        size={16}
                        className="transition-all duration-200"
                        style={{
                          color: isActive ? '#E10600' : '#5A5A5A',
                          transform: isActive ? 'translateX(2px)' : 'none',
                          filter: isActive ? 'drop-shadow(0 0 6px rgba(225,6,0,0.8))' : 'none',
                        }}
                      />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {}
        <motion.div
          className="px-10 py-5 flex items-center gap-6 flex-shrink-0"
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.55) 100%)',
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.08)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45, duration: 0.4 }}
        >
          <div className="text-[10px] font-black tracking-[0.2em] uppercase text-gray-400">
            2026 SEASON
          </div>
          <div className="w-px h-3.5 bg-white/[0.12]" />
          <div className="flex items-center gap-2">
            <span className="led-3d-green animate-pulse-slow" />
            <span className="text-[9.5px] font-black tracking-[0.2em] uppercase text-gray-400">
              AI ENGINE: READY
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="led-3d-green animate-pulse-slow" />
            <span className="text-[9.5px] font-black tracking-[0.2em] uppercase text-gray-400">
              DATA ENGINE: READY
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}