import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Radio, Thermometer, Wind, Droplets, Flag, AlertTriangle, Volume2, VolumeX } from 'lucide-react';
import SideNav from '../components/shared/SideNav';
import { getAllDrivers, getDriverTelemetry, type DriverTelemetry } from '../services/dataService';
import { DEGRADATION_RATES } from '../services/tyreData';
import { TYRE_COLORS as COMPOUND_COLORS } from '../design/tokens';
import { soundService } from '../services/soundService';

const DRIVER_POSITIONS = [
  { num: '01', name: 'VER', x: 360, y: 200 },
  { num: '04', name: 'NOR', x: 415, y: 144 },
  { num: '02', name: 'PIA', x: 593, y: 111 },
  { num: '03', name: 'LEC', x: 188, y: 344 },
  { num: '05', name: 'HAM', x: 471, y: 350 },
];

const DRIVER_STINTS: Record<string, { compound: string; start: number; end: number }[]> = {
  '01': [{ compound: 'MEDIUM', start: 1, end: 18 }],
  '02': [{ compound: 'SOFT', start: 1, end: 8 }],
  '03': [
    { compound: 'SOFT', start: 1, end: 6 },
    { compound: 'MEDIUM', start: 7, end: 18 },
  ],
  '04': [{ compound: 'HARD', start: 1, end: 18 }],
  '05': [
    { compound: 'MEDIUM', start: 1, end: 10 },
    { compound: 'SOFT', start: 11, end: 18 },
  ],
};

const DRIVER_POSITIONS_RACE: Record<string, number> = {
  '01': 2, '02': 4, '03': 3, '04': 1, '05': 5,
};

const DRIVER_BEST_LAPS: Record<string, number> = {
  '01': 81.008, '02': 81.642, '03': 81.431, '04': 82.218, '05': 82.874,
};

const DRIVER_GAP: Record<string, string> = {
  '01': '+0.812s', '02': '+4.219s', '03': '+2.104s', '04': 'LEADER', '05': '+9.441s',
};

type SignalLevel = 'LOW' | 'MODERATE' | 'HIGH';
function getSignalLevel(paceLoss5: number): SignalLevel {
  if (paceLoss5 < 0.10) return 'LOW';
  if (paceLoss5 < 0.25) return 'MODERATE';
  return 'HIGH';
}
const SIGNAL_COLORS: Record<SignalLevel, string> = {
  LOW: '#22C55E',
  MODERATE: '#F59E0B',
  HIGH: '#FF4D4D',
};
const SIGNAL_LED: Record<SignalLevel, string> = {
  LOW: 'led-3d-green',
  MODERATE: 'led-3d-amber',
  HIGH: 'led-3d-red',
};

function fmtLap(s: number): string {
  const m = Math.floor(s / 60);
  const r = (s % 60).toFixed(3).padStart(6, '0');
  return `${m}:${r}`;
}

function useSessionClock(startSeconds: number) {
  const [elapsed, setElapsed] = useState(startSeconds);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    ref.current = setInterval(() => setElapsed(p => p + 1), 1000);
    return () => { if (ref.current) clearInterval(ref.current); };
  }, []);
  const m = Math.floor(elapsed / 60);
  const s = elapsed % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function RaceControlScreen() {
  const [selectedDriver, setSelectedDriver] = useState('01');
  const [drivers, setDrivers] = useState<DriverTelemetry[]>([]);
  const [driverData, setDriverData] = useState<DriverTelemetry | null>(null);
  const sessionTime = useSessionClock(28 * 60 + 14);

  useEffect(() => {
    getAllDrivers().then(setDrivers);
  }, []);

  useEffect(() => {
    getDriverTelemetry(selectedDriver).then(setDriverData);
  }, [selectedDriver]);

  return (
    <div
      className="flex flex-col md:flex-row h-screen overflow-hidden relative"
      style={{ background: 'radial-gradient(ellipse at 50% 30%, #0d121c 0%, #040507 100%)' }}
    >
      <SideNav />

      <div className="flex flex-col flex-1 min-w-0 overflow-y-auto lg:overflow-hidden">
        {/* Top Command Bar */}
        <CommandBar sessionTime={sessionTime} driverData={driverData} />

        {/* Safety Alert Banner */}
        <div
          className="flex-shrink-0 flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-1.5 relative z-10 text-[9.5px] sm:text-[10px]"
          style={{
            background: 'linear-gradient(90deg, rgba(217,119,6,0.12) 0%, rgba(217,119,6,0.06) 60%, transparent 100%)',
            borderBottom: '1px solid rgba(217,119,6,0.35)',
          }}
        >
          <AlertTriangle size={11} className="text-amber-400 flex-shrink-0 drop-shadow-[0_0_5px_rgba(217,119,6,0.8)]" />
          <span className="font-black tracking-[0.18em] uppercase text-amber-400 drop-shadow-[0_0_5px_rgba(217,119,6,0.6)] truncate">
            SIMULATED SCENARIO — ILLUSTRATIVE RACE DATA
          </span>
          <span className="text-gray-600 text-[9px] flex-shrink-0 hidden sm:inline">·</span>
          <span className="text-gray-500 font-medium tracking-wide truncate hidden sm:inline">
            Live race telemetry is not connected. Tyre degradation intelligence derived from historical dataset.
          </span>
        </div>

        {/* Main Workspace */}
        <div className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-y-auto lg:overflow-hidden">

          {/* Left Driver Selector Bar */}
          <div
            className="flex flex-row lg:flex-col flex-shrink-0 overflow-x-auto lg:overflow-y-auto relative z-10 w-full lg:w-[172px] p-2 gap-2"
            style={{
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              borderRight: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'linear-gradient(180deg, #111520 0%, #080a0f 100%)',
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.12), 4px 0 20px rgba(0, 0, 0, 0.5)',
            }}
          >
            {/* Grid Title Header */}
            <div
              className="hidden lg:flex px-3.5 py-2.5 flex-shrink-0"
              style={{
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%)',
              }}
            >
              <div className="flex items-center gap-2">
                <Radio size={11} className="text-accent drop-shadow-[0_0_6px_rgba(0,245,212,0.8)]" />
                <span className="text-[10px] font-black tracking-[0.22em] uppercase text-gray-300">
                  GRID — P2
                </span>
              </div>
            </div>

            {/* Drivers List */}
            <div className="flex flex-row lg:flex-col gap-2 w-full">
              {drivers.map(d => {
                const isSelected = d.driverNumber === selectedDriver;
                const pos = DRIVER_POSITIONS_RACE[d.driverNumber] ?? '—';
                return (
                  <button
                    key={d.driverNumber}
                    onClick={() => {
                      soundService.playUIClick();
                      setSelectedDriver(d.driverNumber);
                    }}
                    className="w-36 lg:w-full flex-shrink-0 text-left transition-all duration-200 relative overflow-hidden rounded-md group"
                    style={{
                      background: isSelected
                        ? 'linear-gradient(90deg, rgba(225, 6, 0, 0.18) 0%, rgba(225, 6, 0, 0.03) 100%), linear-gradient(180deg, #1e1414 0%, #141414 100%)'
                        : 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
                      border: isSelected ? '1px solid rgba(225, 6, 0, 0.55)' : '1px solid #3A3A3A',
                      borderLeft: isSelected ? '3px solid #E10600' : '3px solid transparent',
                      boxShadow: isSelected
                        ? '0 0 20px rgba(225, 6, 0, 0.32), inset 0 0 14px rgba(225, 6, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.25)'
                        : 'inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 2px 6px rgba(0, 0, 0, 0.4)',
                      padding: '6px 8px',
                    }}
                  >
                    {/* Position + Name + Tyre */}
                    <div className="flex items-center gap-1.5">
                      <span
                        className="font-mono tabular-nums flex-shrink-0 text-center"
                        style={{
                          fontSize: '9px', fontWeight: 900,
                          color: isSelected ? '#E10600' : '#555',
                          letterSpacing: '0.05em',
                          minWidth: '14px',
                        }}
                      >
                        P{pos}
                      </span>
                      <span
                        className="font-black tracking-widest flex-1 truncate uppercase"
                        style={{
                          fontSize: '11.5px',
                          color: isSelected ? '#ffffff' : '#cbd5e1',
                          letterSpacing: '0.14em',
                        }}
                      >
                        {d.driverName}
                      </span>
                      <span
                        className="flex-shrink-0 rounded-sm compound-bead"
                        style={{
                          width: '7px', height: '7px',
                          background: `radial-gradient(circle at 35% 30%, #ffffff 0%, ${COMPOUND_COLORS[d.tyreCompound]} 40%, ${COMPOUND_COLORS[d.tyreCompound]}bb 100%)`,
                          boxShadow: isSelected
                            ? `0 0 8px ${COMPOUND_COLORS[d.tyreCompound]}, inset 0 1px 1px rgba(255,255,255,0.7)`
                            : `inset 0 1px 1px rgba(255,255,255,0.5), 0 1px 3px rgba(0,0,0,0.5)`,
                        }}
                      />
                    </div>
                    {/* Compound + Age + Pace */}
                    <div className="flex items-center gap-1.5 mt-1">
                      <span
                        className="font-black tracking-widest"
                        style={{ color: COMPOUND_COLORS[d.tyreCompound], fontSize: '8px', letterSpacing: '0.15em' }}
                      >
                        {d.tyreCompound[0]}
                      </span>
                      <span
                        className="font-mono font-bold tracking-wider"
                        style={{ fontSize: '8px', color: isSelected ? '#94a3b8' : '#64748b' }}
                      >
                        {d.tyreAge}L
                      </span>
                      <span
                        className="ml-auto font-mono font-bold tabular-nums"
                        style={{ fontSize: '9px', color: isSelected ? '#ffffff' : '#94a3b8' }}
                      >
                        {d.currentPace.toFixed(1)}s
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Center Circuit View */}
          <div
            className="flex-1 flex flex-col min-w-0 min-h-[340px] lg:min-h-0 overflow-hidden relative"
            style={{ borderRight: '1px solid rgba(255, 255, 255, 0.08)' }}
          >
            {/* Circuit Header */}
            <div
              className="flex-1 relative flex items-center justify-center min-h-0 overflow-hidden"
              style={{
                background: `
                  radial-gradient(ellipse 75% 65% at 50% 50%, rgba(0, 245, 212, 0.035) 0%, transparent 65%),
                  radial-gradient(ellipse 100% 100% at 50% 50%, rgba(17, 23, 34, 0.6) 0%, #05070a 100%)
                `,
              }}
            >
              {/* Header Bar */}
              <div
                className="absolute top-0 left-0 right-0 px-5 py-2 flex items-center justify-between z-10"
                style={{
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  background: 'linear-gradient(180deg, rgba(17, 22, 32, 0.9) 0%, rgba(10, 13, 19, 0.6) 100%)',
                  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.12)',
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black tracking-[0.22em] uppercase text-gray-400">
                    CIRCUIT VIEW
                  </span>
                  <span className="text-[10px] font-black tracking-[0.22em] uppercase text-accent drop-shadow-[0_0_8px_rgba(225,6,0,0.5)] truncate">
                    2026 AUSTRALIAN GP · ALBERT PARK
                  </span>
                  <span className="text-[9px] font-bold tracking-wider text-gray-600 hidden sm:inline">
                    5.278 KM
                  </span>
                </div>
                <div className="hidden sm:flex items-center gap-4">
                  {['S1', 'S2', 'S3'].map(s => (
                    <span key={s} className="text-[9px] font-black tracking-[0.2em] uppercase text-gray-500">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Map SVG */}
              <div className="relative w-full h-full flex items-center justify-center p-4 sm:p-6 pt-10">
                <CircuitMap
                  selectedDriver={selectedDriver}
                  onSelect={setSelectedDriver}
                  drivers={drivers}
                />
              </div>

              {/* Viewport Corners */}
              {(['top-3 left-3', 'top-3 right-3', 'bottom-3 left-3', 'bottom-3 right-3'] as const).map((pos, i) => (
                <div key={i} className={`absolute ${pos} opacity-40 pointer-events-none`}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    {i === 0 && <path d="M0 5 L0 0 L5 0" stroke="#E10600" strokeWidth="1.5" />}
                    {i === 1 && <path d="M12 5 L12 0 L7 0" stroke="#E10600" strokeWidth="1.5" />}
                    {i === 2 && <path d="M0 7 L0 12 L5 12" stroke="#E10600" strokeWidth="1.5" />}
                    {i === 3 && <path d="M12 7 L12 12 L7 12" stroke="#E10600" strokeWidth="1.5" />}
                  </svg>
                </div>
              ))}
            </div>

            {/* Stint Timeline */}
            <div
              className="flex-shrink-0 px-5 py-3 relative z-10"
              style={{
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                background: 'linear-gradient(180deg, #181414 0%, #100a0a 100%)',
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.14), 0 -6px 20px rgba(0, 0, 0, 0.5)',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black tracking-[0.22em] uppercase text-gray-300">
                    RACE TIMELINE
                  </span>
                  {driverData && (
                    <span className="text-accent font-black text-[10px] drop-shadow-[0_0_8px_rgba(225,6,0,0.5)]">
                      — {driverData.driverName}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {driverData && (
                    <span className="font-mono text-[9.5px] font-black tracking-widest text-gray-400">
                      {driverData.totalLaps} LAPS TOTAL
                    </span>
                  )}
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-2 h-1.5"
                      style={{ background: 'rgba(225,6,0,0.7)', border: '1px solid #E10600' }}
                    />
                    <span className="text-[8.5px] font-black tracking-widest text-gray-500 uppercase">
                      PIT WINDOW
                    </span>
                  </div>
                </div>
              </div>
              <StintTimeline driverData={driverData} stints={DRIVER_STINTS[selectedDriver] ?? []} />
            </div>
          </div>

          {/* Right Live Telemetry Panel */}
          <div
            className="flex flex-col flex-shrink-0 overflow-visible lg:overflow-hidden relative z-10 w-full lg:w-[268px] border-t lg:border-t-0 lg:border-l border-white/10"
            style={{
              background: 'linear-gradient(180deg, #0e1119 0%, #080a0f 100%)',
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.12), -4px 0 20px rgba(0, 0, 0, 0.5)',
            }}
          >
            <AnimatePresence mode="wait">
              {driverData ? (
                <motion.div
                  key={selectedDriver}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className="flex flex-col flex-1 min-h-0 overflow-y-auto"
                >
                  {}
                  <PanelA driverData={driverData} selectedDriver={selectedDriver} />

                  {}
                  <PanelB driverData={driverData} selectedDriver={selectedDriver} />

                  {}
                  <PanelC driverData={driverData} />

                  {}
                  <PanelD />

                  {}
                  <PanelE driverData={driverData} />
                </motion.div>
              ) : (
                <div className="flex flex-1 items-center justify-center">
                  <span className="text-[10px] font-black tracking-widest uppercase text-gray-600">
                    SELECT DRIVER
                  </span>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function CommandBar({ sessionTime, driverData }: { sessionTime: string; driverData: DriverTelemetry | null }) {
  const [isTrackAudioOn, setIsTrackAudioOn] = useState(false);

  useEffect(() => {
    return () => {
      soundService.stopTrackAudio();
    };
  }, []);

  const handleAudioToggle = () => {
    const next = !isTrackAudioOn;
    setIsTrackAudioOn(next);
    soundService.toggleTrackAudio(next);
  };

  return (
    <header
      className="flex items-center flex-shrink-0 relative z-10"
      style={{
        height: '40px',
        background: 'linear-gradient(180deg, #141820 0%, #0d1117 100%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 4px 16px rgba(0, 0, 0, 0.6)',
      }}
    >
      <div
        className="flex items-center gap-0 h-full px-4 flex-shrink-0"
        style={{ borderRight: '1px solid rgba(255, 255, 255, 0.08)' }}
      >
        <span className="text-[11px] font-black tracking-[0.22em] uppercase text-gray-500">TRACK</span>
        <span
          className="text-[11px] font-black tracking-[0.22em] uppercase"
          style={{
            color: '#ffffff',
            WebkitTextStroke: '0.7px #FF1A1A',
            paintOrder: 'stroke fill',
            textShadow: '0 0 8px rgba(225,6,0,0.7)',
          }}
        >
          SHIFT
        </span>
        <span className="text-gray-700 mx-2">/</span>
        <span className="text-[11px] font-black tracking-[0.22em] uppercase text-white">
          RACE CONTROL
        </span>
      </div>

      <div className="flex items-center flex-1 h-full divide-x divide-white/[0.07]">
        <div className="flex items-center gap-2 px-4 h-full">
          <span className="text-[9px] font-black tracking-[0.2em] uppercase text-gray-500">CIRCUIT</span>
          <span className="text-[10px] font-black tracking-[0.15em] uppercase text-accent drop-shadow-[0_0_6px_rgba(225,6,0,0.6)]">
            AUSTRALIAN GP
          </span>
        </div>

        <div className="flex items-center gap-2 px-4 h-full">
          <span className="text-[9px] font-black tracking-[0.2em] uppercase text-gray-500">SESSION</span>
          <span className="text-[10px] font-black tracking-[0.15em] uppercase text-gray-200">PRACTICE 2</span>
        </div>

        <div className="flex items-center gap-2 px-4 h-full">
          <span className="text-[9px] font-black tracking-[0.2em] uppercase text-gray-500">LAP</span>
          <span className="font-mono text-[13px] font-black tabular-nums text-white">
            {driverData?.lap ?? '—'}<span className="text-gray-600">/{driverData?.totalLaps ?? '—'}</span>
          </span>
        </div>

        <div className="flex items-center gap-2 px-4 h-full">
          <span className="text-[9px] font-black tracking-[0.2em] uppercase text-gray-500">TIME</span>
          <span className="font-mono text-[11px] font-black tabular-nums text-gray-200">{sessionTime}</span>
        </div>

        <div className="flex items-center gap-2 px-4 h-full">
          <Flag size={10} className="text-[#22C55E] drop-shadow-[0_0_6px_rgba(34,197,94,0.8)]" />
          <span className="text-[10px] font-black tracking-[0.18em] uppercase text-[#22C55E] drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]">
            GREEN FLAG
          </span>
        </div>

        <div className="flex items-center gap-2 px-4 h-full">
          <Thermometer size={10} className="text-amber-400" />
          <span className="text-[9px] font-black tracking-[0.15em] uppercase text-gray-400">
            TRK <span className="text-amber-400 font-mono">38°C</span>
          </span>
          <span className="text-gray-700 text-[9px]">·</span>
          <span className="text-[9px] font-black tracking-[0.15em] uppercase text-gray-400">
            AIR <span className="text-gray-300 font-mono">24°C</span>
          </span>
        </div>
      </div>

      <div
        className="flex items-center gap-3 px-4 h-full flex-shrink-0"
        style={{ borderLeft: '1px solid rgba(255, 255, 255, 0.08)' }}
      >
        <button
          onClick={handleAudioToggle}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-black tracking-[0.15em] uppercase transition-all"
          style={{
            background: isTrackAudioOn ? 'rgba(225, 6, 0, 0.2)' : 'rgba(255, 255, 255, 0.05)',
            border: isTrackAudioOn ? '1px solid rgba(225, 6, 0, 0.6)' : '1px solid #3A3A3A',
            color: isTrackAudioOn ? '#FF4D4D' : '#8A8A8A',
          }}
        >
          {isTrackAudioOn ? <Volume2 size={11} /> : <VolumeX size={11} />}
          <span>TRACK AUDIO</span>
        </button>

        <div className="flex items-center gap-1.5">
          <span className="led-3d-green animate-pulse" />
          <span className="text-[9px] font-black tracking-[0.2em] uppercase text-gray-400">
            AI ENGINE: <span className="text-[#22C55E]">ONLINE</span>
          </span>
        </div>
      </div>
    </header>
  );
}

function PanelA({ driverData, selectedDriver }: { driverData: DriverTelemetry; selectedDriver: string }) {
  const pos = DRIVER_POSITIONS_RACE[selectedDriver] ?? '—';
  const bestLap = DRIVER_BEST_LAPS[selectedDriver] ?? driverData.currentPace;
  const gap = DRIVER_GAP[selectedDriver] ?? '—';
  const stints = DRIVER_STINTS[selectedDriver] ?? [];
  const stintNum = stints.length;

  return (
    <div
      className="flex-shrink-0"
      style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}
    >
      {}
      <PanelHeader label="CAR STATUS" accentColor="#E10600" />

      {}
      <div
        className="px-4 pt-3 pb-2"
        style={{
          background: 'linear-gradient(180deg, rgba(225,6,0,0.06) 0%, rgba(0,0,0,0) 100%)',
        }}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span
                className="font-black uppercase leading-none"
                style={{ fontSize: '26px', color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.9)' }}
              >
                {driverData.driverName}
              </span>
              <span
                className="font-black"
                style={{ fontSize: '13px', color: '#E10600', textShadow: '0 0 10px rgba(225,6,0,0.7)' }}
              >
                #{driverData.driverNumber}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span
                className="font-mono font-black tabular-nums"
                style={{ fontSize: '18px', color: '#E10600', textShadow: '0 0 12px rgba(225,6,0,0.8)' }}
              >
                P{pos}
              </span>
              <span className="text-gray-600 text-sm">·</span>
              <span className="text-[9px] font-black tracking-widest uppercase text-gray-500">
                LAP {driverData.lap}/{driverData.totalLaps}
              </span>
              <span className="text-gray-600 text-sm">·</span>
              <span className="text-[9px] font-black tracking-widest uppercase text-gray-500">
                STINT {stintNum}
              </span>
            </div>
          </div>

          {}
          <div
            className="flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-sm flex-shrink-0"
            style={{
              background: `linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(0,0,0,0.3) 100%), ${COMPOUND_COLORS[driverData.tyreCompound]}18`,
              border: `1px solid ${COMPOUND_COLORS[driverData.tyreCompound]}60`,
              boxShadow: `inset 0 1px 0 rgba(255,255,255,0.3), 0 0 14px ${COMPOUND_COLORS[driverData.tyreCompound]}35`,
            }}
          >
            <span
              className="font-black tracking-widest uppercase"
              style={{
                fontSize: '10px',
                color: COMPOUND_COLORS[driverData.tyreCompound],
                textShadow: `0 0 8px ${COMPOUND_COLORS[driverData.tyreCompound]}80`,
                letterSpacing: '0.12em',
              }}
            >
              {driverData.tyreCompound}
            </span>
            <span
              className="font-mono font-black tabular-nums"
              style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em' }}
            >
              AGE {driverData.tyreAge}L
            </span>
          </div>
        </div>
      </div>

      {}
      <div
        className="grid grid-cols-3"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
      >
        <div style={{ borderRight: '1px solid rgba(255,255,255,0.07)' }}>
          <StatCell label="CURRENT LAP" value={fmtLap(driverData.currentPace)} mono large />
        </div>
        <div style={{ borderRight: '1px solid rgba(255,255,255,0.07)' }}>
          <StatCell label="BEST LAP" value={fmtLap(bestLap)} mono dimmed />
        </div>
        <div>
          <StatCell label="GAP" value={gap} mono accent={gap === 'LEADER'} />
        </div>
      </div>
    </div>
  );
}

function PanelB({ driverData, selectedDriver }: { driverData: DriverTelemetry; selectedDriver: string }) {
  const compound: string = driverData.tyreCompound;
  const tyreColor: string = COMPOUND_COLORS[compound] ?? '#8b95a3';

  const mlCompound = (['SOFT', 'MEDIUM', 'HARD'].includes(compound) ? compound : 'MEDIUM') as 'SOFT' | 'MEDIUM' | 'HARD';
  const mlRate = DEGRADATION_RATES[mlCompound]?.rate ?? driverData.degradationRate;

  const stints = DRIVER_STINTS[selectedDriver] ?? [];
  const currentStint = stints[stints.length - 1];
  const stintAge = currentStint ? driverData.lap - currentStint.start + 1 : driverData.tyreAge;

  return (
    <div
      className="flex-shrink-0"
      style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}
    >
      <PanelHeader label="TYRE STATUS" accentColor={tyreColor} />

      <div className="px-4 py-2.5 space-y-2.5">
        {}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-sm compound-bead flex-shrink-0"
              style={{
                background: `radial-gradient(circle at 35% 30%, #ffffff 0%, ${tyreColor} 40%, ${tyreColor}bb 100%)`,
                boxShadow: `0 0 8px ${tyreColor}`,
              }}
            />
            <span
              className="font-black tracking-widest uppercase"
              style={{ fontSize: '13px', color: tyreColor, textShadow: `0 0 10px ${tyreColor}80`, letterSpacing: '0.12em' }}
            >
              {compound}
            </span>
          </div>
          <div className="text-right">
            <span className="font-mono font-black tabular-nums text-white" style={{ fontSize: '15px' }}>
              {driverData.tyreAge}
            </span>
            <span className="text-[9px] font-black uppercase text-gray-500 ml-1">LAPS</span>
          </div>
        </div>

        {}
        <div
          className="rounded-sm px-2.5 py-2"
          style={{
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-black tracking-[0.2em] uppercase text-gray-500">STINT AGE</span>
            <span className="text-[9px] font-black tracking-widest uppercase text-gray-500">
              {stintAge} LAPS ON CURRENT STINT
            </span>
          </div>
          {}
          <div className="flex flex-wrap gap-0.5">
            {Array.from({ length: Math.min(stintAge, 30) }).map((_, i) => (
              <span
                key={i}
                className="inline-block rounded-full flex-shrink-0"
                style={{
                  width: '5px',
                  height: '5px',
                  background: i < stintAge - 1
                    ? `radial-gradient(circle at 35% 30%, #ffffff 0%, ${tyreColor} 45%, ${tyreColor}99 100%)`
                    : `radial-gradient(circle at 35% 30%, #ffffff 0%, ${tyreColor} 45%, ${tyreColor}99 100%)`,
                  boxShadow: i === stintAge - 1 ? `0 0 6px ${tyreColor}` : 'none',
                  opacity: i === stintAge - 1 ? 1 : 0.35 + (i / stintAge) * 0.5,
                }}
              />
            ))}
            {stintAge > 30 && (
              <span className="text-[8px] font-black text-gray-600 ml-1 self-center">+{stintAge - 30}</span>
            )}
          </div>
        </div>

        {}
        <div
          className="rounded-sm p-2.5 space-y-1.5"
          style={{
            background: 'rgba(0,0,0,0.35)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          {}
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black tracking-[0.2em] uppercase text-gray-500">
                OBSERVED DEGRADATION
              </span>
              <span
                className="font-mono font-black tabular-nums"
                style={{ fontSize: '12px', color: '#F59E0B', textShadow: '0 0 8px rgba(245,158,11,0.6)' }}
              >
                +{mlRate.toFixed(4)} s/lap
              </span>
            </div>
            <div className="text-[8px] text-gray-600 mt-0.5">
              2022–2025 dry-session dataset · {mlCompound} compound
            </div>
          </div>

          {}
          <div
            className="pt-1.5"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black tracking-[0.2em] uppercase text-gray-500">
                ESTIMATED PACE IMPACT
              </span>
              <span
                className="font-mono font-black tabular-nums"
                style={{ fontSize: '12px', color: '#F59E0B', textShadow: '0 0 8px rgba(245,158,11,0.6)' }}
              >
                +{(mlRate * stintAge).toFixed(3)}s
              </span>
            </div>
            <div className="text-[8px] text-gray-600 mt-0.5">
              {mlRate.toFixed(4)} s/lap × {stintAge} laps
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PanelC({ driverData }: { driverData: DriverTelemetry }) {
  const speedPct = Math.min(100, (driverData.speed / 360) * 100);
  const rpmPct = Math.min(100, (driverData.rpm / 15000) * 100);

  return (
    <div
      className="flex-shrink-0"
      style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}
    >
      <PanelHeader label="TELEMETRY" accentColor="#E10600" />

      <div className="px-4 py-2.5 space-y-2">
        {}
        <GaugeRow
          label="SPEED"
          value={`${driverData.speed}`}
          unit="KM/H"
          pct={speedPct}
          barColor="#E10600"
          valueSize={16}
        />

        {}
        <GaugeRow
          label="RPM"
          value={driverData.rpm.toLocaleString()}
          unit=""
          pct={rpmPct}
          barColor="#22D3EE"
          valueSize={14}
        />

        {}
        <div className="grid grid-cols-2 gap-2 pt-0.5">
          {}
          <div
            className="flex flex-col items-center justify-center py-2 rounded-sm"
            style={{
              background: 'rgba(0,0,0,0.35)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <span className="text-[8.5px] font-black tracking-[0.2em] uppercase text-gray-500 mb-0.5">GEAR</span>
            <span
              className="font-mono font-black tabular-nums"
              style={{ fontSize: '28px', color: '#E10600', textShadow: '0 0 16px rgba(225,6,0,0.7)', lineHeight: 1 }}
            >
              {driverData.gear}
            </span>
          </div>

          {}
          <div
            className="flex flex-col items-center justify-center py-2 rounded-sm"
            style={{
              background: 'rgba(0,0,0,0.35)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <span className="text-[8.5px] font-black tracking-[0.2em] uppercase text-gray-500 mb-0.5">DRS</span>
            <span
              className="text-[11px] font-black tracking-widest"
              style={{ color: '#22C55E', textShadow: '0 0 10px rgba(34,197,94,0.7)' }}
            >
              OPEN
            </span>
          </div>
        </div>

        {}
        <div
          className="flex items-center justify-between px-2.5 py-2 rounded-sm"
          style={{
            background: 'rgba(0,0,0,0.25)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <span className="text-[9px] font-black tracking-[0.2em] uppercase text-gray-500">SECTOR TIME</span>
          <span
            className="font-mono font-black tabular-nums"
            style={{ fontSize: '13px', color: '#E10600', textShadow: '0 0 8px rgba(225,6,0,0.7)' }}
          >
            {driverData.sectorTime}
          </span>
        </div>

        {}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] font-black tracking-[0.2em] uppercase text-gray-500">MODEL CONFIDENCE</span>
            <span
              className="font-mono font-black tabular-nums"
              style={{ fontSize: '13px', color: '#22D3EE', textShadow: '0 0 8px rgba(34,211,238,0.7)' }}
            >
              {Math.round(driverData.confidence * 100)}%
            </span>
          </div>
          <div
            className="h-1.5 rounded-full overflow-hidden"
            style={{ background: '#07090e', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.9)' }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #0284c7 0%, #22D3EE 100%)', boxShadow: '0 0 8px rgba(34,211,238,0.7)' }}
              initial={{ width: 0 }}
              animate={{ width: `${driverData.confidence * 100}%` }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function PanelD() {
  return (
    <div
      className="flex-shrink-0"
      style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}
    >
      <PanelHeader label="TRACK & ENVIRONMENT" accentColor="#3B82F6" />

      <div className="px-4 py-2 space-y-0">
        <EnvRow icon={<Thermometer size={9} className="text-amber-400" />} label="TRACK TEMP" value="38°C" valueColor="#F59E0B" />
        <EnvRow icon={<Thermometer size={9} className="text-gray-400" />} label="AIR TEMP" value="24°C" />
        <EnvRow icon={<Droplets size={9} className="text-blue-400" />} label="HUMIDITY" value="58%" />
        <EnvRow icon={<Wind size={9} className="text-blue-300" />} label="WIND" value="12 KM/H NW" />
        <div
          className="flex items-center justify-between py-1.5"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
        >
          <div className="flex items-center gap-1.5">
            <Flag size={9} className="text-[#22C55E]" />
            <span className="text-[9px] font-black tracking-[0.18em] uppercase text-gray-500">CONDITIONS</span>
          </div>
          <span
            className="text-[9px] font-black tracking-widest uppercase"
            style={{ color: '#22C55E', textShadow: '0 0 8px rgba(34,197,94,0.6)' }}
          >
            DRY · GREEN FLAG
          </span>
        </div>
        <div className="pt-1 pb-0.5">
          <span className="text-[7.5px] font-bold tracking-wider text-gray-700 uppercase">SIMULATION — 2026 Australian GP Environmental Data</span>
        </div>
      </div>
    </div>
  );
}

function PanelE({ driverData }: { driverData: DriverTelemetry }) {
  const compound = driverData.tyreCompound;
  const mlCompound = ['SOFT', 'MEDIUM', 'HARD'].includes(compound) ? compound as 'SOFT' | 'MEDIUM' | 'HARD' : 'MEDIUM';
  const mlRate = DEGRADATION_RATES[mlCompound]?.rate ?? driverData.degradationRate;
  const paceLoss5 = mlRate * 5;
  const signal = getSignalLevel(paceLoss5);
  const signalColor = SIGNAL_COLORS[signal];
  const signalLed = SIGNAL_LED[signal];

  return (
    <div className="flex-shrink-0 p-3">
      <div
        className="p-3 rounded-sm"
        style={{
          background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.06) 0%, rgba(10, 12, 18, 0.98) 100%)',
          border: '1px solid rgba(34, 211, 238, 0.25)',
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 6px 18px rgba(0, 0, 0, 0.5)',
        }}
      >
        {}
        <div className="flex items-center gap-2 mb-2.5">
          <Sparkles size={11} className="text-[#22D3EE] drop-shadow-[0_0_8px_rgba(34,211,238,0.9)]" />
          <span
            className="text-[9.5px] font-black text-[#22D3EE] uppercase"
            style={{ letterSpacing: '0.22em', textShadow: '0 0 8px rgba(34, 211, 238, 0.7)' }}
          >
            TRACKSHIFT INTELLIGENCE
          </span>
        </div>

        {}
        <div className="mb-2">
          <span className="text-[10px] font-black tracking-[0.15em] uppercase text-white">
            TYRE EXTENSION ANALYSIS
          </span>
        </div>

        {}
        <div
          className="flex items-center justify-between mb-2 px-2.5 py-1.5 rounded-sm"
          style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <span className="text-[9px] font-black tracking-widest uppercase text-gray-500">CURRENT TYRE</span>
          <span
            className="font-black tracking-widest uppercase"
            style={{
              fontSize: '10px',
              color: COMPOUND_COLORS[compound],
              textShadow: `0 0 8px ${COMPOUND_COLORS[compound]}80`,
            }}
          >
            {compound} — {driverData.tyreAge} LAPS
          </span>
        </div>

        {}
        <div className="space-y-1 mb-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black tracking-[0.18em] uppercase text-gray-500">
              NEXT 5 LAPS
            </span>
            <div className="flex items-center gap-1">
              <AlertTriangle size={9} className="text-amber-400" />
              <span className="text-[9px] font-black tracking-widest uppercase text-amber-400">
                EST. PACE LOSS
              </span>
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span
              className="font-mono font-black tabular-nums"
              style={{ fontSize: '22px', color: '#F59E0B', textShadow: '0 0 14px rgba(245,158,11,0.7)', lineHeight: 1 }}
            >
              +{paceLoss5.toFixed(3)}s
            </span>
          </div>
          <div className="text-[8px] font-bold text-gray-600">
            {mlRate.toFixed(4)} s/lap × 5 laps · MODELLED PACE LOSS
          </div>
        </div>

        {}
        <div
          className="flex items-center justify-between px-2.5 py-1.5 rounded-sm"
          style={{
            background: `${signalColor}14`,
            border: `1px solid ${signalColor}40`,
          }}
        >
          <span className="text-[9px] font-black tracking-[0.2em] uppercase text-gray-500">SIGNAL</span>
          <div className="flex items-center gap-2">
            <span className={signalLed} />
            <span
              className="text-[10px] font-black tracking-widest uppercase"
              style={{ color: signalColor, textShadow: `0 0 8px ${signalColor}80` }}
            >
              {signal}
            </span>
          </div>
        </div>

        {}
        <div className="mt-2.5 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <p
            className="text-gray-400 italic leading-relaxed"
            style={{ fontSize: '9.5px', lineHeight: '1.55' }}
          >
            {driverData.aiInsight}
          </p>
        </div>
      </div>
    </div>
  );
}


function PanelHeader({ label, accentColor }: { label: string; accentColor: string }) {
  return (
    <div
      className="flex items-center gap-2.5 px-4 py-2 flex-shrink-0"
      style={{
        borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(0,0,0,0) 100%)',
      }}
    >
      <div
        className="w-1.5 h-3 rounded-sm flex-shrink-0"
        style={{ background: accentColor, boxShadow: `0 0 8px ${accentColor}cc` }}
      />
      <span className="text-[9.5px] font-black tracking-[0.22em] uppercase text-gray-400">{label}</span>
    </div>
  );
}

function StatCell({
  label, value, mono, large, dimmed, accent,
}: {
  label: string; value: string; mono?: boolean; large?: boolean; dimmed?: boolean; accent?: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-2 px-1">
      <span className="text-[8px] font-black tracking-[0.2em] uppercase text-gray-500 mb-1 text-center">{label}</span>
      <span
        className={`${mono ? 'font-mono tabular-nums' : 'font-black'} uppercase`}
        style={{
          fontSize: large ? '13px' : '11px',
          fontWeight: 900,
          color: accent ? '#22C55E' : dimmed ? '#64748b' : '#f1f5f9',
          textShadow: accent ? '0 0 8px rgba(34,197,94,0.7)' : dimmed ? 'none' : '0 1px 3px rgba(0,0,0,0.8)',
          letterSpacing: '0.04em',
        }}
      >
        {value}
      </span>
    </div>
  );
}

function GaugeRow({
  label, value, unit, pct, barColor, valueSize,
}: {
  label: string; value: string; unit: string; pct: number; barColor: string; valueSize: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[9px] font-black tracking-[0.2em] uppercase text-gray-500">{label}</span>
        <div className="flex items-baseline gap-1">
          <span
            className="font-mono font-black tabular-nums"
            style={{ fontSize: `${valueSize}px`, color: barColor, textShadow: `0 0 8px ${barColor}70`, lineHeight: 1 }}
          >
            {value}
          </span>
          {unit && <span className="text-[8px] font-black text-gray-600 uppercase">{unit}</span>}
        </div>
      </div>
      <div
        className="h-1.5 rounded-full overflow-hidden"
        style={{ background: '#07090e', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.9)' }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${barColor}aa 0%, ${barColor} 100%)`, boxShadow: `0 0 8px ${barColor}50` }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

function EnvRow({
  icon, label, value, valueColor,
}: {
  icon: React.ReactNode; label: string; value: string; valueColor?: string;
}) {
  return (
    <div
      className="flex items-center justify-between py-1.5"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
    >
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-[9px] font-black tracking-[0.18em] uppercase text-gray-500">{label}</span>
      </div>
      <span
        className="font-mono font-black tabular-nums"
        style={{ fontSize: '10px', color: valueColor ?? '#94a3b8' }}
      >
        {value}
      </span>
    </div>
  );
}

function CircuitMap({
  selectedDriver,
  onSelect,
}: {
  selectedDriver: string;
  onSelect: (d: string) => void;
  drivers?: DriverTelemetry[];
}) {
  const W = 720, H = 400;

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-xl" style={{ maxWidth: '720px', maxHeight: '400px' }}>
      <video
        src="/videos/Top_down_bird_s_eye_static_vie.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-contain pointer-events-none rounded-xl"
      />
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height="100%"
        className="relative z-10 overflow-visible"
        style={{ display: 'block' }}
      >
        <defs>
          <filter id="rc-glow-sel-aaa" x="-120%" y="-120%" width="340%" height="340%">
            <feGaussianBlur stdDeviation="4" result="blur1" />
            <feGaussianBlur stdDeviation="10" result="blur2" />
            <feGaussianBlur stdDeviation="20" result="blur3" />
            <feMerge>
              <feMergeNode in="blur3" />
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {}
        {DRIVER_POSITIONS.map(pos => {
          const isSelected = pos.num === selectedDriver;
          return (
            <g
              key={pos.num}
              style={{ cursor: 'pointer' }}
              onClick={() => {
                soundService.playRacecarPass();
                onSelect(pos.num);
              }}
              className="group"
            >
              {}
              {isSelected && (
                <motion.ellipse
                  cx={pos.x}
                  cy={pos.y}
                  rx={34}
                  ry={22}
                  fill="rgba(225, 6, 0, 0.15)"
                  stroke="#E10600"
                  strokeWidth="1.5"
                  initial={{ opacity: 0.6, scale: 0.9 }}
                  animate={{ opacity: [0.6, 1, 0.6], scale: [0.95, 1.05, 0.95] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ filter: 'drop-shadow(0 0 10px rgba(225,6,0,0.8))' }}
                />
              )}
              {}
              <ellipse
                cx={pos.x}
                cy={pos.y}
                rx={40}
                ry={26}
                fill="transparent"
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function StintTimeline({
  driverData,
  stints,
}: {
  driverData: DriverTelemetry | null;
  stints: { compound: string; start: number; end: number }[];
}) {
  if (!driverData) return null;

  const totalLaps = driverData.totalLaps;
  const currentLap = driverData.lap;

  return (
    <div>
      {}
      <div className="flex items-center gap-3 mb-2">
        {stints.map((s, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-sm flex-shrink-0 compound-bead"
              style={{
                background: `radial-gradient(circle at 35% 30%, #ffffff 0%, ${COMPOUND_COLORS[s.compound]} 40%, ${COMPOUND_COLORS[s.compound]}bb 100%)`,
                boxShadow: `0 0 6px ${COMPOUND_COLORS[s.compound]}`,
              }}
            />
            <span className="text-[8.5px] font-bold uppercase tracking-wider text-gray-300">
              {s.compound} ({s.start}–{s.end})
            </span>
          </div>
        ))}
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-2.5 h-1 bg-white rounded-full shadow-[0_0_6px_#ffffff]" />
          <span className="text-[8.5px] font-black uppercase tracking-widest text-gray-400">NOW</span>
        </div>
      </div>

      {}
      <div
        className="relative overflow-hidden rounded-md"
        style={{
          height: '25px',
          background: 'rgba(0, 0, 0, 0.7)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: 'inset 0 2px 5px rgba(0, 0, 0, 0.9), inset 0 0 1px rgba(255, 255, 255, 0.2), 0 4px 12px rgba(0, 0, 0, 0.5)',
        }}
      >
        {stints.map((s, i) => {
          const left = ((s.start - 1) / totalLaps) * 100;
          const width = ((s.end - s.start + 1) / totalLaps) * 100;
          return (
            <div
              key={i}
              className="absolute top-0 h-full flex items-center"
              style={{
                left: `${left}%`,
                width: `${width}%`,
                background: `linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.06) 45%, rgba(0,0,0,0.35) 100%), linear-gradient(90deg, ${COMPOUND_COLORS[s.compound]}, ${COMPOUND_COLORS[s.compound]}dd)`,
                borderRight: i < stints.length - 1 ? '1.5px solid rgba(0,0,0,0.7)' : 'none',
                boxShadow: `0 0 10px ${COMPOUND_COLORS[s.compound]}50`,
              }}
            >
              <span
                className="font-black tracking-widest ml-2 uppercase"
                style={{ fontSize: '8.5px', color: '#000000', letterSpacing: '0.14em', textShadow: '0 1px 0 rgba(255,255,255,0.5)' }}
              >
                {s.compound[0]}
              </span>
            </div>
          );
        })}

        {}
        <div
          className="absolute top-0 h-full"
          style={{
            left: `${(currentLap / totalLaps) * 100}%`,
            right: 0,
            background: 'rgba(255, 255, 255, 0.02)',
            borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        />

        {}
        <div
          className="absolute top-0 bottom-0 z-10"
          style={{
            left: `${(currentLap / totalLaps) * 100}%`,
            width: '2px',
            background: '#ffffff',
            boxShadow: '0 0 8px #ffffff, 0 0 16px rgba(255, 255, 255, 0.9)',
            transform: 'translateX(-1px)',
          }}
        />

        {}
        <div
          className="absolute top-0 h-full"
          style={{
            left: `${(22 / totalLaps) * 100}%`,
            width: `${(2 / totalLaps) * 100}%`,
            background: 'rgba(225, 6, 0, 0.22)',
            borderLeft: '2px solid #E10600',
            borderRight: '2px solid #E10600',
            boxShadow: '0 0 14px rgba(225, 6, 0, 0.6)',
          }}
        />
      </div>

      {}
      <div className="relative mt-1.5" style={{ height: '16px' }}>
        {[1, 10, 20, 30, 40, 50, totalLaps].map(lap => {
          const pct = ((lap - 1) / (totalLaps - 1)) * 100;
          return (
            <span
              key={lap}
              className="absolute font-mono font-bold tabular-nums"
              style={{
                left: `${pct}%`,
                transform: 'translateX(-50%)',
                fontSize: '9px',
                color: 'rgba(255,255,255,0.45)',
                letterSpacing: '0.04em',
              }}
            >
              {lap}
            </span>
          );
        })}
        {[1, 10, 20, 30, 40, 50, totalLaps].map(lap => {
          const pct = ((lap - 1) / (totalLaps - 1)) * 100;
          return (
            <div
              key={`tick-${lap}`}
              className="absolute top-0"
              style={{
                left: `${pct}%`,
                width: '1px',
                height: '4px',
                background: 'rgba(255,255,255,0.25)',
                transform: 'translateX(-50%)',
              }}
            />
          );
        })}
      </div>
    </div>
  );
}