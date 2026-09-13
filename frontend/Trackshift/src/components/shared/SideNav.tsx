import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Activity, Layers, CheckCircle, ChevronLeft, ShieldCheck, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { soundService } from '../../services/soundService';

const NAV_ITEMS = [
  { label: 'Race Control', path: '/race-control', icon: Activity },
  { label: 'Tyre Intelligence', path: '/tyre-intelligence', icon: Layers },
  { label: 'Practice → Race', path: '/validation', icon: CheckCircle },
  { label: 'Methodology & Validation', path: '/methodology-validation', icon: ShieldCheck },
];

export default function SideNav() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    soundService.playUIClick();
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Mobile Top Header (Mobile only < md) */}
      <div
        className="md:hidden flex items-center justify-between px-4 py-3 border-b border-[#3A3A3A] z-40 relative flex-shrink-0 w-full"
        style={{
          background: 'linear-gradient(180deg, #141414 0%, #0A0A0A 100%)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.6)',
        }}
      >
        <button
          onClick={() => {
            soundService.playSwoosh();
            navigate('/menu');
          }}
          className="flex items-center gap-2"
        >
          <ChevronLeft size={16} className="text-accent opacity-90 drop-shadow-[0_0_8px_rgba(225,6,0,0.6)]" />
          <span className="text-[12px] font-black tracking-[0.22em] uppercase">
            <span className="text-[#F5F5F5]">TRACK</span>
            <span
              className="font-black"
              style={{
                color: '#FFFFFF',
                WebkitTextStroke: '0.9px #FF1A1A',
                paintOrder: 'stroke fill',
                textShadow: '0 0 10px rgba(255, 26, 26, 0.85)',
              }}
            >
              SHIFT
            </span>
          </span>
        </button>

        <button
          onClick={toggleMenu}
          className="p-1.5 rounded text-gray-300 hover:text-white bg-white/5 border border-white/10"
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu Drawer Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="md:hidden fixed inset-0 bg-black/80 z-40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="md:hidden fixed top-[53px] left-0 bottom-0 w-64 z-50 flex flex-col"
              style={{
                background: 'linear-gradient(180deg, #141414 0%, #0A0A0A 100%)',
                borderRight: '1px solid #3A3A3A',
              }}
            >
              <div className="flex-1 py-4 space-y-1 overflow-y-auto">
                {NAV_ITEMS.map(({ label, path, icon: Icon }) => (
                  <NavLink
                    key={path}
                    to={path}
                    onClick={() => {
                      soundService.playInterfaceTone();
                      setIsOpen(false);
                    }}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-5 py-3.5 text-[12px] font-bold tracking-[0.16em] uppercase transition-all duration-200 ${
                        isActive ? 'text-white bg-accent/10 border-l-4 border-accent' : 'text-[#8A8A8A] hover:text-[#F5F5F5]'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon size={16} className={isActive ? 'text-accent' : 'text-gray-500'} />
                        <span>{label}</span>
                      </>
                    )}
                  </NavLink>
                ))}
              </div>

              <div className="px-4 py-4 border-t border-[#3A3A3A] space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className="led-3d-green animate-pulse-slow" />
                  <span className="text-[9.5px] font-bold tracking-[0.2em] uppercase text-[#8A8A8A]">
                    AI ENGINE: READY
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="led-3d-green animate-pulse-slow" />
                  <span className="text-[9.5px] font-bold tracking-[0.2em] uppercase text-[#8A8A8A]">
                    DATA ENGINE: READY
                  </span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Vertical Sidebar (Desktop only >= md) */}
      <nav
        className="hidden md:flex flex-col w-52 h-full flex-shrink-0 relative z-20"
        style={{
          background: 'linear-gradient(180deg, #141414 0%, #0A0A0A 100%)',
          borderRight: '1px solid #3A3A3A',
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.08), 4px 0 20px rgba(0, 0, 0, 0.6)',
        }}
      >
        <button
          onClick={() => {
            soundService.playSwoosh();
            navigate('/menu');
          }}
          className="flex items-center gap-2.5 px-4 py-4 border-b border-[#3A3A3A] hover:bg-white/[0.04] transition-all group relative"
          style={{
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.08)',
          }}
        >
          <ChevronLeft size={15} className="text-accent opacity-75 group-hover:opacity-100 transition-opacity drop-shadow-[0_0_8px_rgba(225,6,0,0.6)]" />
          <span className="text-[12px] font-black tracking-[0.22em] uppercase">
            <span className="text-[#F5F5F5] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">TRACK</span>
            <span
              className="font-black"
              style={{
                color: '#FFFFFF',
                WebkitTextStroke: '0.9px #FF1A1A',
                paintOrder: 'stroke fill',
                textShadow: '0 0 10px rgba(255, 26, 26, 0.85), 0 0 20px rgba(225, 6, 0, 0.5)',
              }}
            >
              SHIFT
            </span>
          </span>
        </button>

        <div className="flex-1 py-3 space-y-1">
          {NAV_ITEMS.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              onClick={() => soundService.playInterfaceTone()}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 text-[11px] font-bold tracking-[0.16em] uppercase transition-all duration-200 relative ${
                  isActive
                    ? 'text-white'
                    : 'text-[#8A8A8A] hover:text-[#F5F5F5] hover:bg-white/[0.03]'
                }`
              }
              style={({ isActive }) =>
                isActive
                  ? {
                      background: 'linear-gradient(90deg, rgba(225, 6, 0, 0.18) 0%, rgba(225, 6, 0, 0.02) 100%)',
                      borderLeft: '3px solid #E10600',
                      boxShadow: 'inset 0 0 14px rgba(225, 6, 0, 0.12), 0 0 18px rgba(225, 6, 0, 0.25)',
                    }
                  : {
                      borderLeft: '3px solid transparent',
                    }
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={15}
                    className={isActive ? 'text-accent' : 'text-gray-500'}
                    style={isActive ? { filter: 'drop-shadow(0 0 8px rgba(225, 6, 0, 0.8))' } : {}}
                  />
                  <span className={isActive ? 'text-white drop-shadow-[0_0_8px_rgba(225,6,0,0.4)]' : ''}>
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>

        <div
          className="px-4 py-3.5 border-t border-[#3A3A3A] space-y-2"
          style={{
            background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 100%)',
          }}
        >
          <div className="flex items-center gap-2.5">
            <span className="led-3d-green animate-pulse-slow" />
            <span className="text-[9.5px] font-bold tracking-[0.2em] uppercase text-[#8A8A8A]">
              AI ENGINE: READY
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="led-3d-green animate-pulse-slow" />
            <span className="text-[9.5px] font-bold tracking-[0.2em] uppercase text-[#8A8A8A]">
              DATA ENGINE: READY
            </span>
          </div>
        </div>
      </nav>
    </>
  );
}