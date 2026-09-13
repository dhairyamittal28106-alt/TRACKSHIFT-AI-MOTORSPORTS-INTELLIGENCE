import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { soundService } from '../services/soundService';

export default function OpeningScreen() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<'video' | 'hud' | 'logo' | 'enter'>('video');
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('hud'), 800);
    const t2 = setTimeout(() => setPhase('logo'), 2200);
    const t3 = setTimeout(() => setPhase('enter'), 3400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
      });
    }
  }, []);

  return (
    <div
      className="relative w-full h-screen overflow-hidden bg-trackbg scanlines cursor-pointer select-none"
      onClick={() => navigate('/menu')}
    >
      {}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          poster="/videos/rb22-poster.jpg"
          className="absolute inset-0 w-full h-full object-cover object-center scale-105"
        >
          <source src="/videos/rb22-bg-h264.mp4" type="video/mp4" />
          <source src="/videos/rb22-bg.mp4" type="video/mp4" />
        </video>

        {}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 95% 75% at 50% 50%, rgba(6, 8, 12, 0.15) 0%, rgba(4, 5, 7, 0.72) 100%),
              linear-gradient(180deg, rgba(5, 7, 10, 0.65) 0%, rgba(5, 7, 10, 0.1) 40%, rgba(5, 7, 10, 0.75) 100%)
            `,
          }}
        />
      </div>

      {}
      <AnimatePresence>
        {(phase === 'hud' || phase === 'logo' || phase === 'enter') && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            {}
            <motion.div
              className="absolute top-8 left-8"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.6 }}
            >
              <div className="space-y-3">
                <HudStat label="SPEED" value="287" unit="KM/H" accent />
                <HudStat label="RPM" value="12,400" unit="" />
                <HudStat label="GEAR" value="7" unit="" accent />
              </div>
            </motion.div>

            {}
            <motion.div
              className="absolute top-8 right-8 text-right"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <div className="space-y-3">
                <HudStat label="LAP" value="18/58" unit="" accent />
                <HudStat label="TYRE" value="MEDIUM" unit="" />
                <HudStat label="SECTOR" value="01:21.842" unit="" accent />
              </div>
            </motion.div>

            {}
            <motion.div
              className="absolute bottom-[24%] left-1/2 -translate-x-1/2 w-[360px]"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <div className="text-[10px] font-black tracking-[0.22em] text-center mb-1.5 text-gray-400 uppercase">
                RPM
              </div>
              <div className="h-1.5 bg-black/60 rounded-full overflow-hidden p-0.5 border border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, #5A5A5A, #E10600, #F59E0B, #FF4D4D)',
                    boxShadow: '0 0 10px rgba(225, 6, 0, 0.7)',
                  }}
                  initial={{ width: '0%' }}
                  animate={{ width: '82%' }}
                  transition={{ delay: 0.6, duration: 1.2, ease: 'easeOut' }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="font-mono text-[9px] font-bold text-gray-500">0</span>
                <span className="font-mono text-[10px] font-black text-accent drop-shadow-[0_0_8px_rgba(225,6,0,0.8)]">
                  12,400
                </span>
                <span className="font-mono text-[9px] font-bold text-gray-500">15,000</span>
              </div>
            </motion.div>

            {}
            {['top-4 left-4', 'top-4 right-4', 'bottom-4 left-4', 'bottom-4 right-4'].map((pos, i) => (
              <div key={i} className={`absolute ${pos} w-8 h-8`}>
                <svg viewBox="0 0 32 32" fill="none" className="w-full h-full opacity-40">
                  {i === 0 && <path d="M 0 14 L 0 0 L 14 0" stroke="#E10600" strokeWidth="1.5" />}
                  {i === 1 && <path d="M 32 14 L 32 0 L 18 0" stroke="#E10600" strokeWidth="1.5" />}
                  {i === 2 && <path d="M 0 18 L 0 32 L 14 32" stroke="#E10600" strokeWidth="1.5" />}
                  {i === 3 && <path d="M 32 18 L 32 32 L 18 32" stroke="#E10600" strokeWidth="1.5" />}
                </svg>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {}
      <AnimatePresence>
        {(phase === 'logo' || phase === 'enter') && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            {}
            <div
              className="absolute"
              style={{
                width: '640px',
                height: '240px',
                background: 'radial-gradient(ellipse at center, rgba(225, 6, 0, 0.16) 0%, rgba(225, 6, 0, 0.03) 50%, transparent 75%)',
              }}
            />

            {}
            <div className="relative text-center">
              <motion.div
                className="flex items-baseline justify-center"
                initial={{ letterSpacing: '0.4em', opacity: 0 }}
                animate={{ letterSpacing: '0.12em', opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.1 }}
              >
                <span
                  className="text-7xl lg:text-8xl font-black text-[#F5F5F5]"
                  style={{
                    letterSpacing: '0.1em',
                    lineHeight: 1,
                    textShadow: '0 4px 16px rgba(0, 0, 0, 0.9)',
                  }}
                >
                  TRACK
                </span>
                <span
                  className="text-7xl lg:text-8xl font-black"
                  style={{
                    color: '#FFFFFF',
                    WebkitTextStroke: '2.5px #FF1A1A',
                    paintOrder: 'stroke fill',
                    letterSpacing: '0.1em',
                    lineHeight: 1,
                    textShadow: '0 0 35px rgba(255, 26, 26, 0.9), 0 0 70px rgba(225, 6, 0, 0.6)',
                  }}
                >
                  SHIFT
                </span>
              </motion.div>

              {}
              <motion.div
                className="mt-3.5 text-xs font-black text-gray-300 tracking-[0.35em] uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.6 }}
              >
                AI MOTORSPORT INTELLIGENCE
              </motion.div>

              {}
              <motion.div
                className="mt-4 mx-auto h-0.5 bg-accent"
                style={{
                  boxShadow: '0 0 12px rgba(225, 6, 0, 0.8)',
                }}
                initial={{ width: 0 }}
                animate={{ width: 260 }}
                transition={{ delay: 0.65, duration: 0.6 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {}
      <AnimatePresence>
        {phase === 'enter' && (
          <motion.div
            className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                soundService.playEngineRoar();
                navigate('/menu');
              }}
              className="group flex items-center gap-3.5 px-9 py-3.5 rounded-md text-white text-xs font-black tracking-[0.25em] uppercase transition-all duration-300 relative overflow-hidden"
              style={{
                background: 'linear-gradient(180deg, rgba(28, 20, 20, 0.9) 0%, rgba(18, 12, 12, 0.95) 100%)',
                border: '1px solid rgba(225, 6, 0, 0.55)',
                boxShadow: '0 0 24px rgba(225, 6, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.25), 0 4px 16px rgba(0, 0, 0, 0.6)',
              }}
            >
              <span className="relative z-10 group-hover:text-accent transition-colors">
                ENTER
              </span>
              <motion.span
                className="relative z-10 text-accent"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
              >
                →
              </motion.span>
              <div className="absolute inset-0 bg-accent/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function HudStat({ label, value, unit, accent }: {
  label: string; value: string; unit: string; accent?: boolean;
}) {
  return (
    <div className="drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">
      <div className="text-[9.5px] font-black tracking-[0.2em] uppercase text-gray-400 mb-0.5">
        {label}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span
          className="text-xl font-black tabular-nums font-mono uppercase"
          style={{
            color: accent ? '#E10600' : '#F5F5F5',
            textShadow: accent ? '0 0 10px rgba(225, 6, 0, 0.8)' : '0 1px 3px rgba(0,0,0,0.9)',
          }}
        >
          {value}
        </span>
        {unit && (
          <span className="text-[10px] font-black uppercase text-accent/80 tracking-wider">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}