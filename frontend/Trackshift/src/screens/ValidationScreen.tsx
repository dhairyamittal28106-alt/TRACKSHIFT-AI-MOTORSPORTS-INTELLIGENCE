import { useState, useMemo } from 'react';
import {
  Layers, ArrowRight, ShieldAlert, CheckCircle2,
  Cpu, GitBranch, Terminal, Radio, Sliders,
} from 'lucide-react';
import SideNav from '../components/shared/SideNav';
import HeaderBar from '../components/shared/HeaderBar';
import { DEGRADATION_RATES } from '../services/dataService';
import { type Compound } from '../services/tyreData';
import { TYRE_COLORS } from '../design/tokens';
import { soundService } from '../services/soundService';

export default function ValidationScreen() {
  const [selectedCompound, setSelectedCompound] = useState<Compound>('MEDIUM');
  const [currentAge, setCurrentAge] = useState<number>(18);
  const [extensionLaps, setExtensionLaps] = useState<number>(5);

  const paceCost = useMemo(() => {
    const rate = DEGRADATION_RATES[selectedCompound].rate;
    return rate * extensionLaps;
  }, [selectedCompound, extensionLaps]);

  const severitySignal = useMemo(() => {
    if (paceCost < 0.10) return { label: 'LOW', color: '#22C55E', bg: 'rgba(34, 197, 94, 0.1)', border: 'rgba(34, 197, 94, 0.3)' };
    if (paceCost <= 0.25) return { label: 'MODERATE', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.3)' };
    return { label: 'HIGH', color: '#FF4D4D', bg: 'rgba(255, 77, 77, 0.1)', border: 'rgba(255, 77, 77, 0.3)' };
  }, [paceCost]);

  return (
    <div className="flex h-screen bg-trackbg overflow-hidden text-gray-200 select-none">
      <SideNav />

      <div className="flex flex-col flex-1 min-w-0">
        <HeaderBar
          left={
            <>
              <span className="text-[#8A8A8A]">TRACKSHIFT</span>
              <span className="text-[#5A5A5A]">/</span>
              <span className="text-white font-black">PRACTICE → RACE</span>
            </>
          }
          right={
            <div className="flex items-center gap-2.5">
              <span className="px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 font-mono text-[10px] font-bold">
                PRACTICE DATA → RACE APPLICATION
              </span>
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-amber-950/30 border border-amber-500/30 text-amber-400 font-mono text-[10px] font-bold">
                <Radio size={12} className="animate-pulse text-amber-400" />
                <span>RACE-DAY DATA INTEGRATION: NOT YET CONNECTED</span>
              </div>
            </div>
          }
        />

        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {}
          <div className="panel p-6 border-l-4 border-l-cyan-400 relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <Cpu size={17} className="text-cyan-400" />
                  <span className="tech-label text-cyan-400 text-xs tracking-[0.2em]">INTELLIGENCE BRIDGE</span>
                </div>
                <h1 className="text-2xl lg:text-3xl font-black tracking-[0.1em] text-white uppercase">
                  PRACTICE → RACE
                </h1>
                <p className="text-xs text-gray-300 font-medium tracking-wide mt-1 max-w-2xl leading-relaxed">
                  Translate practice-session tyre intelligence into race-day decision support.
                </p>
                <p className="text-[11px] text-gray-500 mt-2 max-w-3xl leading-relaxed">
                  Current intelligence is derived from historical practice-session data and is designed to feed future race-day decision systems. TrackShift does not currently ingest Sunday Grand Prix race laps.
                </p>
              </div>

              {}
              <div className="p-3.5 bg-black/40 border border-amber-500/30 rounded md:max-w-xs shrink-0">
                <div className="flex items-center gap-2 text-amber-400 font-mono text-[10px] font-bold tracking-wider uppercase mb-1">
                  <ShieldAlert size={14} className="shrink-0" />
                  <span>RACE-DAY DATA INTEGRATION</span>
                </div>
                <div className="text-[10px] font-mono text-gray-400 leading-snug">
                  NOT YET CONNECTED · Practice intelligence is isolated and ready to serve as the tyre layer for full race-day strategic models.
                </div>
              </div>
            </div>
          </div>

          {}
          <div className="panel p-6">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <GitBranch size={15} className="text-cyan-400" />
                <h2 className="tech-label text-gray-200 tracking-wider">PRACTICE → RACE INTELLIGENCE PIPELINE</h2>
              </div>
              <span className="text-[10px] font-mono text-gray-500">END-TO-END METHODOLOGICAL TRANSLATION</span>
            </div>
            <p className="tech-label-sm text-gray-500 mb-5">
              From empirical practice evidence (Stages 01–04) to live race-day strategy decision support (Stages 05–06)
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
              {[
                {
                  step: '01',
                  name: 'PRACTICE DATA',
                  sub: 'EVIDENCE-BACKED',
                  desc: 'Historical representative dry-session laps from FP1, FP2, and FP3.',
                  status: 'BUILT',
                  color: '#22D3EE',
                },
                {
                  step: '02',
                  name: 'TYRE BEHAVIOR',
                  sub: 'EVIDENCE-BACKED',
                  desc: 'Compound-specific pace response across Soft, Medium, and Hard.',
                  status: 'BUILT',
                  color: '#22D3EE',
                },
                {
                  step: '03',
                  name: 'DEGRADATION ESTIMATE',
                  sub: 'EVIDENCE-BACKED',
                  desc: 'Observed pace loss per additional tyre-age lap from robust stint regression.',
                  status: 'BUILT',
                  color: '#22D3EE',
                },
                {
                  step: '04',
                  name: 'UNCERTAINTY',
                  sub: 'EVIDENCE-BACKED',
                  desc: 'Bootstrap confidence intervals around compound degradation slopes.',
                  status: 'BUILT',
                  color: '#22D3EE',
                },
                {
                  step: '05',
                  name: 'RACE-DAY INPUTS',
                  sub: 'APPLICATION STAGE',
                  desc: 'Live tyre state + race context (fuel, traffic, track temp, delta).',
                  status: 'FUTURE INTEGRATION',
                  color: '#F59E0B',
                },
                {
                  step: '06',
                  name: 'DECISION SUPPORT',
                  sub: 'APPLICATION STAGE',
                  desc: 'Quantify strategy trade-offs: stay out vs pit window pace penalty.',
                  status: 'FUTURE INTEGRATION',
                  color: '#F59E0B',
                },
              ].map((stage, idx) => (
                <div
                  key={stage.step}
                  className="bg-black/40 border p-3.5 rounded flex flex-col justify-between relative group transition-colors"
                  style={{ borderColor: stage.status === 'BUILT' ? 'rgba(34, 211, 238, 0.2)' : 'rgba(245, 158, 11, 0.2)' }}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[10px] font-black" style={{ color: stage.color }}>{stage.step}</span>
                      {idx < 5 && <ArrowRight size={11} className="text-gray-600 hidden lg:block -mr-1.5" />}
                    </div>
                    <div className="text-[11px] font-black tracking-wider text-white mb-1 uppercase leading-tight">
                      {stage.name}
                    </div>
                    <div className="text-[9px] font-mono font-bold tracking-wider uppercase mb-2" style={{ color: stage.color }}>
                      {stage.sub}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 leading-snug mb-2">
                      {stage.desc}
                    </p>
                    <div className="text-[8.5px] font-mono font-bold px-1.5 py-0.5 rounded inline-block" style={{
                      background: stage.status === 'BUILT' ? 'rgba(34, 211, 238, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      color: stage.color,
                      border: `1px solid ${stage.color}30`,
                    }}>
                      {stage.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Layers size={15} className="text-cyan-400" />
              <h2 className="tech-label text-gray-200 tracking-wider">WHAT TRANSFERS TO RACE DAY?</h2>
            </div>
            <p className="tech-label-sm text-gray-500">
              Three foundational intelligence outputs derived from practice data that directly inform race-day models
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">

              {}
              <div className="panel p-5 bg-black/40 border border-white/[0.08] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-black tracking-widest text-white uppercase">01 / TYRE BEHAVIOR</span>
                    <span className="tech-label-sm text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 px-2 py-0.5 rounded">
                      OBSERVED DEGRADATION
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed mb-4">
                    Compound-specific empirical degradation slopes calculated from representative practice runs:
                  </p>

                  <div className="space-y-2.5 bg-black/60 p-3 rounded border border-white/[0.05] mb-4">
                    {(['SOFT', 'MEDIUM', 'HARD'] as const).map(c => (
                      <div key={c} className="flex items-center justify-between text-xs font-mono">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ background: TYRE_COLORS[c] }} />
                          <span className="font-bold text-gray-300">{c}</span>
                        </div>
                        <span className="font-black" style={{ color: TYRE_COLORS[c] }}>
                          +{DEGRADATION_RATES[c].rate.toFixed(4)} s/lap
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-[10px] font-mono text-gray-500 border-t border-white/[0.06] pt-2.5">
                  2022–2025 practice-session analysis · 1,970 qualified stints
                </div>
              </div>

              {}
              <div className="panel p-5 bg-black/40 border border-cyan-500/30 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-black tracking-widest text-white uppercase">02 / STINT EXTENSION</span>
                    <span className="tech-label-sm text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 px-2 py-0.5 rounded font-mono">
                      MEDIUM · +5 LAPS
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed mb-3">
                    Estimated cumulative pace loss from extending the current stint by five laps:
                  </p>

                  <div className="p-3.5 bg-cyan-950/20 border border-cyan-500/20 rounded mb-3 text-center">
                    <div className="tech-label-sm text-gray-400 mb-0.5">EXPECTED ADDITIONAL PACE LOSS</div>
                    <div className="text-3xl font-black font-mono text-cyan-400 tracking-tight">
                      +0.247 <span className="text-sm font-normal text-gray-400">s</span>
                    </div>
                    <div className="text-[11px] font-mono text-gray-400 mt-1">
                      0.0493 s/lap × 5 laps = +0.247 s
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-gray-400 border-t border-white/[0.06] pt-2.5 leading-snug">
                  Deterministic application of the observed degradation rate, not a complete race strategy recommendation.
                </div>
              </div>

              {}
              <div className="panel p-5 bg-black/40 border border-white/[0.08] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-black tracking-widest text-white uppercase">03 / UNCERTAINTY</span>
                    <span className="tech-label-sm text-amber-400 bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded">
                      95% BOOTSTRAP CI
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed mb-3">
                    Degradation is an empirical statistical estimate rather than an exact physical measurement:
                  </p>

                  <div className="space-y-2 text-[11px] font-mono bg-black/60 p-3 rounded border border-white/[0.05] mb-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Soft:</span>
                      <span className="text-gray-200 font-bold">+0.0811 → +0.1147 s/lap</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Medium:</span>
                      <span className="text-gray-200 font-bold">+0.0373 → +0.0613 s/lap</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Hard:</span>
                      <span className="text-amber-300 font-bold">−0.0235 → +0.0228 s/lap</span>
                    </div>
                  </div>

                  <div className="p-2 bg-amber-950/25 border border-amber-500/30 rounded text-[10px] text-amber-200 leading-snug">
                    <strong className="text-amber-400">HARD CI CROSSES ZERO:</strong> No statistically clear positive degradation signal was established for Hard in this dataset.
                  </div>
                </div>

                <div className="text-[10px] font-mono text-gray-500 border-t border-white/[0.06] pt-2.5">
                  Analytical slope bounds derived from 1,000 bootstrap iterations
                </div>
              </div>

            </div>
          </div>

          {}
          <div className="panel p-6 border-l-4 border-l-cyan-400">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-2">
                <Sliders size={16} className="text-cyan-400" />
                <h2 className="tech-label text-gray-200 tracking-wider">RACE-DAY INPUT SIMULATION</h2>
              </div>
              <span className="px-2.5 py-0.5 rounded bg-black/60 border border-white/[0.08] text-[10px] font-mono text-gray-400">
                DETERMINISTIC RATE APPLICATION · NOT A LIVE PREDICTION
              </span>
            </div>
            <p className="tech-label-sm text-gray-500 mb-6">
              Illustrative application of the observed degradation model to hypothetical race stint extension scenarios
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">

              {}
              <div className="lg:col-span-7 space-y-5 bg-black/30 p-5 rounded border border-white/[0.06]">

                {}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="tech-label text-gray-300 text-xs font-bold">1. SELECT COMPOUND</span>
                    <span className="font-mono text-xs font-bold" style={{ color: TYRE_COLORS[selectedCompound] }}>
                      {selectedCompound} (+{DEGRADATION_RATES[selectedCompound].rate.toFixed(4)} s/lap)
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2.5">
                    {(['SOFT', 'MEDIUM', 'HARD'] as const).map(c => {
                      const isSelected = selectedCompound === c;
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => {
                            soundService.playUIClick();
                            setSelectedCompound(c);
                          }}
                          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded transition-all font-mono text-xs font-bold"
                          style={{
                            background: isSelected ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                            border: isSelected ? `2px solid ${TYRE_COLORS[c]}` : '1px solid #3A3A3A',
                            color: isSelected ? '#FFFFFF' : '#8A8A8A',
                            boxShadow: isSelected ? `0 0 12px ${TYRE_COLORS[c]}30` : 'none',
                          }}
                        >
                          <span className="w-2.5 h-2.5 rounded-full" style={{ background: TYRE_COLORS[c] }} />
                          <span>{c}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="tech-label text-gray-300 text-xs font-bold">2. CURRENT TYRE AGE (RACE CONTEXT)</span>
                    <span className="font-mono text-xs text-cyan-400 font-bold">{currentAge} LAPS</span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={30}
                    value={currentAge}
                    onChange={e => setCurrentAge(parseInt(e.target.value))}
                    onPointerUp={() => soundService.playInterfaceTone()}
                    className="w-full accent-cyan-400 bg-white/[0.1] h-1.5 rounded cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] font-mono text-gray-500 mt-1">
                    <span>2 LAPS (FRESH)</span>
                    <span>18 LAPS (DEFAULT)</span>
                    <span>30 LAPS (EXTENDED)</span>
                  </div>
                </div>

                {}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="tech-label text-gray-300 text-xs font-bold">3. STINT EXTENSION (ADDITIONAL LAPS)</span>
                    <span className="font-mono text-xs text-cyan-400 font-bold">+{extensionLaps} LAPS</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={15}
                    value={extensionLaps}
                    onChange={e => setExtensionLaps(parseInt(e.target.value))}
                    onPointerUp={() => soundService.playInterfaceTone()}
                    className="w-full accent-cyan-400 bg-white/[0.1] h-1.5 rounded cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] font-mono text-gray-500 mt-1">
                    <span>+1 LAP</span>
                    <span>+5 LAPS (DEFAULT)</span>
                    <span>+15 LAPS</span>
                  </div>
                </div>

              </div>

              {}
              <div className="lg:col-span-5 flex flex-col justify-between p-6 bg-black/60 rounded border border-white/[0.08] space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="tech-label-sm text-gray-400">EXPECTED PACE COST</span>
                    <span
                      className="px-2.5 py-0.5 rounded font-mono text-[10px] font-bold"
                      style={{
                        background: severitySignal.bg,
                        color: severitySignal.color,
                        border: `1px solid ${severitySignal.border}`,
                      }}
                    >
                      {severitySignal.label} PENALTY
                    </span>
                  </div>

                  <div className="text-4xl lg:text-5xl font-black font-mono tracking-tight my-2" style={{ color: severitySignal.color }}>
                    +{paceCost.toFixed(3)} <span className="text-base font-normal text-gray-400">s</span>
                  </div>

                  <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded space-y-1 text-xs font-mono text-gray-300">
                    <div className="text-gray-400 text-[10px]">FORMULA TRACE:</div>
                    <div>
                      {DEGRADATION_RATES[selectedCompound].rate.toFixed(4)} s/lap × {extensionLaps} additional laps = <strong className="text-white">+{paceCost.toFixed(4)} s</strong>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 border-t border-white/[0.06] pt-3">
                  <div className="flex items-center justify-between text-[10px] font-mono text-gray-400">
                    <span>Signal Threshold:</span>
                    <span>Low &lt;0.10s · Moderate 0.10–0.25s · High &gt;0.25s</span>
                  </div>
                  <p className="text-[10px] text-gray-500 leading-tight">
                    This quantifies tyre-related pace cost only. Complete race strategy requires race-state information (fuel load, pit-loss delta, safety cars) not currently available in the dataset.
                  </p>
                </div>
              </div>

            </div>
          </div>

          {}
          <div className="panel p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Terminal size={15} className="text-cyan-400" />
                <h2 className="tech-label text-gray-200 tracking-wider">RACE-DAY DATA REQUIREMENTS MATRIX</h2>
              </div>
              <span className="text-[10px] font-mono text-gray-500">SPECIFICATION FOR FULL RACE INTEGRATION</span>
            </div>
            <p className="tech-label-sm text-gray-500 mb-4">
              Distinguishing evidence currently supplied by TrackShift versus inputs required from a live race telemetry feed
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-[11px] font-mono text-left">
                <thead>
                  <tr className="border-b border-white/[0.08] text-gray-500 tech-label-sm">
                    <th className="py-2 px-3">INPUT PARAMETER</th>
                    <th className="py-2 px-3">INTEGRATION STATUS</th>
                    <th className="py-2 px-3">SYSTEM ROLE IN STRATEGY</th>
                    <th className="py-2 px-3 text-right">TRACKSHIFT STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] text-gray-300">
                  {[
                    { input: 'Compound', status: 'AVAILABLE', role: 'Compound-specific tyre behavior & pace baseline', current: true },
                    { input: 'Tyre age', status: 'AVAILABLE', role: 'Degradation progression & stint wear state', current: true },
                    { input: 'Track temperature', status: 'AVAILABLE', role: 'Environmental context & thermal baseline', current: true },
                    { input: 'Session progress', status: 'AVAILABLE', role: 'Track evolution proxy across session timeline', current: true },
                    { input: 'Traffic delta', status: 'AVAILABLE', role: 'Pace adjustment for non-free-air laps', current: true },
                    { input: 'Fuel load (kg)', status: 'NOT CURRENTLY AVAILABLE', role: 'Dynamic car-weight correction', current: false },
                    { input: 'Pit-loss delta (sec)', status: 'NOT CURRENTLY AVAILABLE', role: 'Total pitlane transit time loss for undercut calculations', current: false },
                    { input: 'Safety Car / VSC', status: 'NOT CURRENTLY AVAILABLE', role: 'Race-state adjustment', current: false },
                    { input: 'Rival strategy', status: 'NOT CURRENTLY AVAILABLE', role: 'Opponent tyre age, compound choice, and track position', current: false },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-white/[0.02]">
                      <td className="py-2.5 px-3 font-bold text-white flex items-center gap-2">
                        {row.current ? (
                          <CheckCircle2 size={13} className="text-cyan-400 shrink-0" />
                        ) : (
                          <span className="w-3 h-3 rounded-full border border-gray-600 shrink-0" />
                        )}
                        <span>{row.input}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[9.5px] font-bold ${
                          row.current
                            ? 'bg-status-green/15 text-status-green border border-status-green/30'
                            : 'bg-white/[0.03] text-gray-500 border border-white/[0.08]'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-gray-400 font-sans text-xs">{row.role}</td>
                      <td className="py-2.5 px-3 text-right">
                        <span className={row.current ? 'text-cyan-400 font-bold' : 'text-gray-600'}>
                          {row.current ? 'SUPPLIED BY TRACKSHIFT' : 'REQUIRES LIVE RACE API'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {}
          <div className="panel p-6 bg-black/40 border border-white/[0.08]">
            <div className="flex items-center gap-2 mb-2">
              <Cpu size={15} className="text-cyan-400" />
              <h2 className="tech-label text-gray-200 tracking-wider">FROM PRACTICE SIGNAL TO RACE DECISION</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 text-xs leading-relaxed text-gray-300">
              <div className="space-y-2">
                <div className="font-mono text-cyan-400 font-bold text-[11px] uppercase">01 / HISTORICAL EVIDENCE</div>
                <p className="text-gray-400">
                  Practice sessions provide comparable dry-running data for estimating how tyre age relates to lap pace.
                </p>
              </div>

              <div className="space-y-2">
                <div className="font-mono text-cyan-400 font-bold text-[11px] uppercase">02 / DEGRADATION INTELLIGENCE</div>
                <p className="text-gray-400">
                  TrackShift converts this empirical telemetry into compound-specific degradation estimates and bootstrap confidence intervals, isolating the true pace loss per lap.
                </p>
              </div>

              <div className="space-y-2">
                <div className="font-mono text-cyan-400 font-bold text-[11px] uppercase">03 / RACE-DAY APPLICATION</div>
                <p className="text-gray-400">
                  These degradation slopes can then be consumed by a race-day strategy system alongside live fuel load, pit deltas, and rival positions to determine optimal pit windows.
                </p>
              </div>
            </div>

            <div className="mt-5 p-3.5 bg-cyan-950/20 border border-cyan-500/25 rounded text-center">
              <span className="font-mono text-xs text-white font-bold tracking-wide">
                Key Scope Definition: TrackShift supplies the tyre intelligence layer — not the entire race strategy.
              </span>
            </div>
          </div>

          {}
          <div className="panel p-6">
            <div className="flex items-center gap-2 mb-1">
              <GitBranch size={15} className="text-cyan-400" />
              <h2 className="tech-label text-gray-200 tracking-wider">TRACKSHIFT END-TO-END SYSTEM ARCHITECTURE</h2>
            </div>
            <p className="tech-label-sm text-gray-500 mb-6">
              How TrackShift connects historical analysis to tactical race engineering
            </p>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
              {[
                {
                  verb: 'LEARN',
                  title: 'HISTORICAL PRACTICE',
                  desc: '2022–2025 FP1, FP2, FP3 telemetry runs — 74,951 laps loaded from FastF1 before quality filtering.',
                  scope: 'EVIDENCE',
                  color: '#22D3EE',
                },
                {
                  verb: 'ESTIMATE',
                  title: 'TYRE DEGRADATION',
                  desc: 'Robust Huber linear regression isolating empirical seconds/lap pace loss.',
                  scope: 'INTELLIGENCE',
                  color: '#22D3EE',
                },
                {
                  verb: 'VALIDATE',
                  title: 'STINT QUARANTINE',
                  desc: '5-fold GroupKFold by stint ID + 95% bootstrap uncertainty envelopes.',
                  scope: 'QUALIFICATION',
                  color: '#22D3EE',
                },
                {
                  verb: 'APPLY',
                  title: 'RACE-DAY TYRE STATE',
                  desc: 'Current compound selection, tyre age, and stint extension scenarios.',
                  scope: 'INTEGRATION',
                  color: '#F59E0B',
                },
                {
                  verb: 'DECIDE',
                  title: 'STRATEGY TRADE-OFFS',
                  desc: 'Quantified pace cost for extending stints vs taking pitstop track loss.',
                  scope: 'OPERATIONS',
                  color: '#F59E0B',
                },
              ].map((step, idx) => (
                <div
                  key={step.verb}
                  className="bg-black/40 border border-white/[0.08] p-4 rounded flex flex-col justify-between relative group hover:border-cyan-400/40 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black font-mono tracking-widest" style={{ color: step.color }}>
                        {step.verb}
                      </span>
                      {idx < 4 && <ArrowRight size={13} className="text-gray-600 hidden md:block" />}
                    </div>
                    <div className="text-xs font-black tracking-wider text-white mb-2 uppercase">
                      {step.title}
                    </div>
                    <p className="text-[10px] text-gray-400 leading-snug mb-3">
                      {step.desc}
                    </p>
                  </div>
                  <div className="text-[9px] font-mono font-bold tracking-wider text-gray-500 uppercase border-t border-white/[0.05] pt-2">
                    SCOPE: {step.scope}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {}
          <div className="panel p-6 bg-gradient-to-r from-black/60 via-black/40 to-black/60 border border-white/[0.08] text-center space-y-4">
            <blockquote className="text-sm md:text-base font-bold text-gray-200 max-w-3xl mx-auto leading-relaxed italic">
              “TrackShift does not claim to predict the entire race. It provides an evidence-based tyre intelligence layer that can feed race strategy decisions.”
            </blockquote>

            <div className="flex flex-wrap items-center justify-center gap-6 pt-2 border-t border-white/[0.06] text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span className="text-gray-400">CURRENT SCOPE:</span>
                <span className="text-white font-bold">Practice-session tyre intelligence</span>
              </div>
              <div className="w-px h-3.5 bg-white/[0.12] hidden md:block" />
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-gray-400">FUTURE INTEGRATION:</span>
                <span className="text-white font-bold">Live race-state strategy optimization</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}