import { NavLink, useNavigate } from 'react-router-dom';
import { Activity, Layers, CheckCircle, ChevronLeft, ShieldCheck } from 'lucide-react';
import { soundService } from '../../services/soundService';

const NAV_ITEMS = [
  { label: 'Race Control', path: '/race-control', icon: Activity },
  { label: 'Tyre Intelligence', path: '/tyre-intelligence', icon: Layers },
  { label: 'Practice → Race', path: '/validation', icon: CheckCircle },
  { label: 'Methodology & Validation', path: '/methodology-validation', icon: ShieldCheck },
];

export default function SideNav() {
  const navigate = useNavigate();
  return (
    <nav
      className="flex flex-col w-52 h-full flex-shrink-0 relative z-20"
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

      {}
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
  );
}