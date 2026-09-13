import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ResponsiveContainer, ComposedChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Area,
} from 'recharts';
import { ChevronDown, ChevronUp, CheckCircle, Info, AlertCircle } from 'lucide-react';
import SideNav from '../components/shared/SideNav';
import HeaderBar from '../components/shared/HeaderBar';
import { getAllTyreDegradationCurves, DEGRADATION_RATES, DATASET_PROVENANCE } from '../services/dataService';
import { soundService } from '../services/soundService';

type Compound = 'SOFT' | 'MEDIUM' | 'HARD';
type CompoundFilter = 'ALL' | Compound;

const COMPOUNDS: Compound[] = ['SOFT', 'MEDIUM', 'HARD'];

const COMPOUND_META: Record<Compound, {
  color: string;
  name: string;
  badge: string;
  summary: string;
  detail: string;
  tag: string;
}> = {
  SOFT: {
    color: '#FF4D4D',
    name: 'SOFT',
    badge: 'C3–C5',
    summary: 'Higher observed degradation',
    detail: 'Expected pace loss accumulates most rapidly as tyre age increases (+0.0951 s/lap). Produces the largest pace penalty over extended stints.',
    tag: 'HIGHER OBSERVED DEGRADATION',
  },
  MEDIUM: {
    color: '#F59E0B',
    name: 'MEDIUM',
    badge: 'C2–C4',
    summary: 'Moderate observed degradation',
    detail: 'Steady, predictable pace loss (+0.0493 s/lap) — approximately half the pace loss rate of the Soft compound across representative stints.',
    tag: 'MODERATE OBSERVED DEGRADATION',
  },
  HARD: {
    color: '#E2E8F0',
    name: 'HARD',
    badge: 'C1–C3',
    summary: 'Little measurable degradation',
    detail: 'Pace loss slope is practically flat (+0.0009 s/lap). The 95% confidence interval crosses zero, indicating minimal measurable pace deterioration.',
    tag: 'LITTLE MEASURABLE DEGRADATION · CI CROSSES ZERO',
  },
};

const METHODOLOGY_STEPS = [
  { step: '1', title: 'RAW LAP DATA', desc: 'Full lap telemetry extracted from all 2022–2025 dry Grand Prix race and practice sessions.' },
  { step: '2', title: 'CLEAN REPRESENTATIVE LAPS', desc: 'Removal of in-laps, out-laps, VSC/Safety Car periods, red flags, pit stops, and severe traffic outliers.' },
  { step: '3', title: 'IDENTIFY TYRE STINTS', desc: 'Stints partitioned by car, driver, session, and fitted tyre compound with minimum lap thresholds.' },
  { step: '4', title: 'NORMALIZE WITHIN STINT', desc: 'Stint baseline normalization to detrend fuel burn-off (~0.06s/lap) and ambient track evolution.' },
  { step: '5', title: 'ROBUST REGRESSION', desc: 'Theil-Sen robust linear slope estimation to isolate tyre age pace loss from single-lap driver lockups.' },
  { step: '6', title: 'DEGRADATION RATE + CI', desc: '1,000 non-parametric bootstrap resamples to compute authoritative degradation rates and 95% CIs.' },
];

export default function TyreIntelligenceScreen() {
  const [selectedFilter, setSelectedFilter] = useState<CompoundFilter>('ALL');
  const [methodologyOpen, setMethodologyOpen] = useState(false);
  const [allCurves, setAllCurves] = useState<Record<string, {
    points: { lap: number; paceLoss: number }[];
    upperBand: { lap: number; paceLoss: number }[];
    lowerBand: { lap: number; paceLoss: number }[];
    degradationRate: number;
  }>>({});

  useEffect(() => {
    getAllTyreDegradationCurves().then(setAllCurves);
  }, []);

  const chartData = useMemo(() => {
    const soft = allCurves['SOFT'];
    const med  = allCurves['MEDIUM'];
    const hard = allCurves['HARD'];
    if (!soft || !med || !hard) return [];

    const lapsSet = new Set<number>();
    [...soft.points, ...med.points, ...hard.points].forEach(p => lapsSet.add(p.lap));
    const sortedLaps = Array.from(lapsSet).sort((a, b) => a - b);

    const softMap = new Map(soft.points.map(p => [p.lap, p.paceLoss]));
    const softUpMap = new Map(soft.upperBand.map(p => [p.lap, p.paceLoss]));
    const softLoMap = new Map(soft.lowerBand.map(p => [p.lap, p.paceLoss]));

    const medMap = new Map(med.points.map(p => [p.lap, p.paceLoss]));
    const medUpMap = new Map(med.upperBand.map(p => [p.lap, p.paceLoss]));
    const medLoMap = new Map(med.lowerBand.map(p => [p.lap, p.paceLoss]));

    const hardMap = new Map(hard.points.map(p => [p.lap, p.paceLoss]));
    const hardUpMap = new Map(hard.upperBand.map(p => [p.lap, p.paceLoss]));
    const hardLoMap = new Map(hard.lowerBand.map(p => [p.lap, p.paceLoss]));

    return sortedLaps.map(lap => ({
      lap,
      soft: softMap.get(lap),
      softUpper: softUpMap.get(lap),
      softLower: softLoMap.get(lap),
      medium: medMap.get(lap),
      mediumUpper: medUpMap.get(lap),
      mediumLower: medLoMap.get(lap),
      hard: hardMap.get(lap),
      hardUpper: hardUpMap.get(lap),
      hardLower: hardLoMap.get(lap),
    }));
  }, [allCurves]);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-trackbg overflow-hidden">
      <SideNav />

      <div className="flex flex-col flex-1 min-w-0 overflow-y-auto">
        <HeaderBar
          left={
            <>
              <span className="text-gray-500">TRACKSHIFT</span>
              <span className="text-gray-600">/</span>
              <span className="text-gray-200">TYRE INTELLIGENCE</span>
            </>
          }
          right={
            <>
              <span className="tech-label-sm text-gray-500">ERA</span>
              <span className="tech-label text-gray-300">2022–2025 · DRY COMPOUNDS</span>
              <span className="text-gray-600 mx-1">·</span>
              <span className="tech-label-sm text-gray-500">TOTAL STINTS</span>
              <span className="tech-label text-gray-300">{DATASET_PROVENANCE.qualifiedStints.toLocaleString()}</span>
            </>
          }
        />

        {}
        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6 space-y-6">
          <div className="max-w-[1400px] mx-auto space-y-6">

            {}
            <div className="border-b border-white/[0.08] pb-5">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#E10600]/10 border border-[#E10600]/25 text-[10px] font-bold tracking-[0.2em] text-[#E10600] uppercase mb-2">
                    Empirical Analysis & Degradation Modelling
                  </div>
                  <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white uppercase font-display">
                    TYRE DEGRADATION INTELLIGENCE
                  </h1>
                  <p className="text-sm md:text-base text-gray-400 mt-1 font-medium">
                    Observed pace loss as tyre age increases across representative F1 stints.
                  </p>
                  <div className="mt-2 text-[11px] font-mono font-semibold tracking-[0.15em] text-gray-500 uppercase">
                    2022–2025 · DRY SESSIONS · SOFT / MEDIUM / HARD · REPRESENTATIVE STINTS
                  </div>
                </div>

                {}
                <div className="flex items-center gap-1.5 p-1 bg-black/40 border border-white/[0.08] rounded-lg">
                  {(['ALL', 'SOFT', 'MEDIUM', 'HARD'] as const).map(f => {
                    const isSelected = selectedFilter === f;
                    const color = f === 'ALL' ? '#E10600' : COMPOUND_META[f].color;
                    return (
                      <button
                        key={f}
                        onClick={() => {
                          soundService.playUIClick();
                          setSelectedFilter(f);
                        }}
                        className={`px-3 py-1.5 rounded text-[10px] font-bold tracking-wider uppercase transition-all ${
                          isSelected
                            ? 'bg-white/10 text-white shadow-sm'
                            : 'text-gray-500 hover:text-gray-300'
                        }`}
                        style={isSelected ? { color } : {}}
                      >
                        {f === 'ALL' ? 'ALL COMPOUNDS' : `● ${f}`}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {COMPOUNDS.map(c => {
                const rate = DEGRADATION_RATES[c];
                const meta = COMPOUND_META[c];
                const isSelected = selectedFilter === c || selectedFilter === 'ALL';
                const isHighlighted = selectedFilter === c;

                return (
                  <motion.div
                    key={c}
                    onClick={() => {
                      soundService.playConfirmTap();
                      setSelectedFilter(selectedFilter === c ? 'ALL' : c);
                    }}
                    whileHover={{ scale: 1.01 }}
                    className={`cursor-pointer rounded-xl p-5 border transition-all relative overflow-hidden ${
                      isHighlighted
                        ? 'border-white/30 bg-white/[0.04] shadow-lg'
                        : isSelected
                        ? 'border-white/[0.1] bg-[#12161F]/60 hover:border-white/20'
                        : 'border-white/[0.05] bg-[#0E1118]/40 opacity-50'
                    }`}
                    style={isHighlighted ? { borderColor: meta.color + '80', boxShadow: `0 0 24px ${meta.color}20` } : {}}
                  >
                    {}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{
                            background: meta.color,
                            boxShadow: `0 0 10px ${meta.color}`,
                          }}
                        />
                        <span className="text-sm font-black tracking-wider text-white uppercase">
                          {c}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/[0.06] text-gray-400">
                        {rate.stints.toLocaleString()} stints
                      </span>
                    </div>

                    {}
                    <div className="my-2">
                      <div className="flex items-baseline gap-1.5">
                        <span
                          className="text-4xl md:text-5xl font-black font-mono tracking-tight"
                          style={{ color: meta.color }}
                        >
                          +{rate.rate.toFixed(4)}
                        </span>
                        <span className="text-sm md:text-base font-bold text-gray-400 font-mono">
                          s/lap
                        </span>
                      </div>
                      <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mt-1">
                        Estimated Degradation Rate
                      </div>
                    </div>

                    {}
                    <div className="mt-4 pt-3 border-t border-white/[0.06] space-y-1 text-xs">
                      <div className="flex items-center justify-between text-gray-400 font-mono text-[11px]">
                        <span className="text-gray-500 font-sans uppercase text-[10px] font-bold tracking-wider">
                          95% Confidence Interval
                        </span>
                        <span className="font-semibold text-gray-300">
                          {rate.ciLower > 0 ? '+' : ''}{rate.ciLower.toFixed(4)} → {rate.ciUpper > 0 ? '+' : ''}{rate.ciUpper.toFixed(4)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-gray-400 font-mono text-[11px]">
                        <span className="text-gray-500 font-sans uppercase text-[10px] font-bold tracking-wider">
                          Relative Durability
                        </span>
                        <span className="text-gray-300 font-sans font-bold">
                          Rank #{rate.durabilityRank} of 3
                        </span>
                      </div>
                    </div>

                    {}
                    <div className="mt-3">
                      <span
                        className="inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded"
                        style={{
                          background: meta.color + '15',
                          color: meta.color,
                          border: `1px solid ${meta.color}35`,
                        }}
                      >
                        {meta.tag}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {}
              <div className="lg:col-span-2 rounded-xl p-5 border border-white/[0.08] bg-[#0E1118]/80 flex flex-col justify-between">
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                    <div>
                      <h2 className="text-base font-bold text-white tracking-wide uppercase flex items-center gap-2">
                        PACE LOSS VS TYRE AGE
                      </h2>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Observed pace loss relative to the representative stint baseline.
                      </p>
                    </div>

                    {}
                    <div className="flex items-center gap-4 text-xs font-mono">
                      {(['SOFT', 'MEDIUM', 'HARD'] as const).map(c => (
                        <div
                          key={c}
                          onClick={() => setSelectedFilter(selectedFilter === c ? 'ALL' : c)}
                          className="flex items-center gap-1.5 cursor-pointer"
                          style={{ opacity: selectedFilter === 'ALL' || selectedFilter === c ? 1 : 0.3 }}
                        >
                          <span className="w-2.5 h-2.5 rounded-full" style={{ background: COMPOUND_META[c].color }} />
                          <span className="text-[11px] font-bold text-gray-300">{c}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {}
                  <div className="h-[340px] w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={chartData} margin={{ top: 10, right: 20, bottom: 25, left: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis
                          dataKey="lap"
                          tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontFamily: 'Inter' }}
                          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                          tickLine={false}
                          label={{
                            value: 'TYRE AGE (LAPS)',
                            position: 'insideBottom',
                            offset: -12,
                            fill: 'rgba(255,255,255,0.4)',
                            fontSize: 10,
                            fontWeight: 700,
                            letterSpacing: '0.1em',
                          }}
                        />
                        <YAxis
                          tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontFamily: 'Inter' }}
                          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                          tickLine={false}
                          tickFormatter={v => `+${v.toFixed(2)}s`}
                          label={{
                            value: 'PACE LOSS (SECONDS)',
                            angle: -90,
                            position: 'insideLeft',
                            offset: 5,
                            fill: 'rgba(255,255,255,0.4)',
                            fontSize: 10,
                            fontWeight: 700,
                            letterSpacing: '0.1em',
                          }}
                        />
                        <Tooltip
                          contentStyle={{
                            background: '#0c0f17',
                            border: '1px solid rgba(255,255,255,0.15)',
                            borderRadius: '8px',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
                            fontSize: '11px',
                          }}
                          labelStyle={{ color: 'rgba(255,255,255,0.6)', fontWeight: 700, marginBottom: '4px' }}
                          labelFormatter={v => `TYRE AGE: ${v} LAPS`}
                          formatter={((value: unknown, name?: string) => {
                            const nameStr = name ?? '';
                            if (value === undefined || value === null) return ['—', nameStr];
                            const num = Number(value);
                            const cKey = nameStr.toUpperCase() as Compound;
                            const label = COMPOUND_META[cKey]?.name ?? nameStr;
                            return [`+${num.toFixed(4)} s`, `${label} Pace Loss`];
                          }) as any}
                        />

                        {}
                        {(selectedFilter === 'ALL' || selectedFilter === 'SOFT') && (
                          <Area
                            type="monotone"
                            dataKey="softUpper"
                            stroke="#FF4D4D30"
                            strokeWidth={1}
                            fill="#FF4D4D"
                            fillOpacity={0.08}
                            isAnimationActive={false}
                          />
                        )}

                        {}
                        {(selectedFilter === 'ALL' || selectedFilter === 'MEDIUM') && (
                          <Area
                            type="monotone"
                            dataKey="mediumUpper"
                            stroke="#F59E0B30"
                            strokeWidth={1}
                            fill="#F59E0B"
                            fillOpacity={0.08}
                            isAnimationActive={false}
                          />
                        )}

                        {}
                        {(selectedFilter === 'ALL' || selectedFilter === 'HARD') && (
                          <Area
                            type="monotone"
                            dataKey="hardUpper"
                            stroke="#E2E8F030"
                            strokeWidth={1}
                            fill="#E2E8F0"
                            fillOpacity={0.08}
                            isAnimationActive={false}
                          />
                        )}

                        {}
                        <Line
                          type="monotone"
                          dataKey="soft"
                          name="soft"
                          stroke="#FF4D4D"
                          strokeWidth={selectedFilter === 'SOFT' ? 3.5 : 2}
                          dot={false}
                          opacity={selectedFilter === 'ALL' || selectedFilter === 'SOFT' ? 1 : 0.15}
                        />
                        <Line
                          type="monotone"
                          dataKey="medium"
                          name="medium"
                          stroke="#F59E0B"
                          strokeWidth={selectedFilter === 'MEDIUM' ? 3.5 : 2}
                          dot={false}
                          opacity={selectedFilter === 'ALL' || selectedFilter === 'MEDIUM' ? 1 : 0.15}
                        />
                        <Line
                          type="monotone"
                          dataKey="hard"
                          name="hard"
                          stroke="#E2E8F0"
                          strokeWidth={selectedFilter === 'HARD' ? 3.5 : 2}
                          dot={false}
                          opacity={selectedFilter === 'ALL' || selectedFilter === 'HARD' ? 1 : 0.15}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="text-[10px] text-gray-500 font-mono pt-3 border-t border-white/[0.06] flex items-center justify-between">
                  <span>BASELINE: ZERO PACE LOSS AT LAP 2 (FIRST FULL RACING SPEED LAP)</span>
                  <span>SHADED ENVELOPE: 95% BOOTSTRAP CI</span>
                </div>
              </div>

              {}
              <div className="rounded-xl p-5 border border-white/[0.08] bg-[#0E1118]/80 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Info size={16} className="text-[#E10600]" />
                    <h2 className="text-base font-bold text-white tracking-wide uppercase">
                      WHAT THE DATA SAYS
                    </h2>
                  </div>

                  {}
                  <div className="space-y-3.5">
                    {COMPOUNDS.map(c => {
                      const meta = COMPOUND_META[c];
                      const rate = DEGRADATION_RATES[c];
                      return (
                        <div
                          key={c}
                          className="p-3 rounded-lg border border-white/[0.05] bg-white/[0.02]"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-black tracking-wider uppercase flex items-center gap-1.5" style={{ color: meta.color }}>
                              <span className="w-2 h-2 rounded-full" style={{ background: meta.color }} />
                              {meta.name}
                            </span>
                            <span className="text-xs font-mono font-bold text-white">
                              +{rate.rate.toFixed(4)} s/lap
                            </span>
                          </div>
                          <div className="text-xs font-semibold text-gray-200">
                            {meta.summary}.
                          </div>
                          <div className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                            {meta.detail}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {}
                <div className="mt-4 p-3.5 rounded-lg border border-[#E10600]/30 bg-[#E10600]/08">
                  <div className="text-[10px] font-bold text-[#E10600] uppercase tracking-widest mb-1 flex items-center gap-1.5">
                    <CheckCircle size={12} />
                    CRITICAL STRATEGY TAKEAWAY
                  </div>
                  <p className="text-xs text-gray-200 leading-relaxed font-medium italic">
                    "Keeping a Soft tyre on track for longer produces a larger expected pace penalty than extending a Medium or Hard stint, based on the observed degradation estimates."
                  </p>
                </div>
              </div>
            </div>

            {}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {}
              <div className="rounded-xl p-5 border border-white/[0.08] bg-[#0E1118]/80 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide uppercase flex items-center gap-2">
                    DEGRADATION COMPARISON
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Relative observed pace loss per lap across all three dry compounds.
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  {}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-bold flex items-center gap-2 text-white">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#FF4D4D]" />
                        SOFT
                      </span>
                      <div className="font-mono text-xs">
                        <span className="font-bold text-[#FF4D4D] text-sm">+{DEGRADATION_RATES.SOFT.rate.toFixed(4)} s/lap</span>
                        <span className="text-gray-500 ml-2 font-normal text-[10px]">(Baseline: 1.00x)</span>
                      </div>
                    </div>
                    <div className="h-3 bg-white/[0.06] rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-[#FF4D4D]"
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                  </div>

                  {}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-bold flex items-center gap-2 text-white">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                        MEDIUM
                      </span>
                      <div className="font-mono text-xs">
                        <span className="font-bold text-[#F59E0B] text-sm">+{DEGRADATION_RATES.MEDIUM.rate.toFixed(4)} s/lap</span>
                        <span className="text-gray-500 ml-2 font-normal text-[10px]">(51.9% of Soft)</span>
                      </div>
                    </div>
                    <div className="h-3 bg-white/[0.06] rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-[#F59E0B]"
                        initial={{ width: 0 }}
                        animate={{ width: `${(DEGRADATION_RATES.MEDIUM.rate / DEGRADATION_RATES.SOFT.rate) * 100}%` }}
                        transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
                      />
                    </div>
                  </div>

                  {}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-bold flex items-center gap-2 text-white">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#E2E8F0]" />
                        HARD
                      </span>
                      <div className="font-mono text-xs">
                        <span className="font-bold text-[#E2E8F0] text-sm">+{DEGRADATION_RATES.HARD.rate.toFixed(4)} s/lap</span>
                        <span className="text-gray-500 ml-2 font-normal text-[10px]">(1.0% of Soft · Near flat)</span>
                      </div>
                    </div>
                    <div className="h-3 bg-white/[0.06] rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-[#E2E8F0]"
                        initial={{ width: 0 }}
                        animate={{ width: '2.5%' }}
                        transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                </div>

                <div className="text-[9.5px] text-gray-600 italic mt-1">
                  Bar widths are minimum-scaled for visual visibility; see numeric values above for exact rates.
                </div>

                <div className="p-3 rounded bg-white/[0.02] border border-white/[0.05] text-[11px] text-gray-400 leading-relaxed">
                  <span className="font-semibold text-gray-300">Observation: </span>
                  Soft tyres lose pace at roughly double the rate of Medium tyres. Hard tyres show virtually no pace loss across typical stint lengths, giving race strategists maximum stint flexibility with minimum degradation loss.
                </div>
              </div>

              {}
              <div className="rounded-xl p-5 border border-white/[0.08] bg-[#0E1118]/80 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide uppercase flex items-center gap-2">
                    ESTIMATE CONFIDENCE
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    95% bootstrap confidence intervals for estimated degradation rates.
                  </p>
                </div>

                <div className="space-y-3 pt-1">
                  {COMPOUNDS.map(c => {
                    const rate = DEGRADATION_RATES[c];
                    const meta = COMPOUND_META[c];
                    const crossesZero = rate.ciLower < 0 && rate.ciUpper > 0;

                    return (
                      <div
                        key={c}
                        className={`p-3 rounded-lg border ${
                          crossesZero
                            ? 'border-amber-500/30 bg-amber-500/[0.04]'
                            : 'border-white/[0.05] bg-white/[0.02]'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                          <span className="font-bold flex items-center gap-1.5 uppercase" style={{ color: meta.color }}>
                            <span className="w-2 h-2 rounded-full" style={{ background: meta.color }} />
                            {c}
                          </span>
                          <span className="font-bold text-white">
                            +{rate.rate.toFixed(4)} s/lap
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-gray-400 font-mono">
                          <span>95% CI: [{rate.ciLower > 0 ? '+' : ''}{rate.ciLower.toFixed(4)}, {rate.ciUpper > 0 ? '+' : ''}{rate.ciUpper.toFixed(4)}]</span>
                          <span className="text-[10px] text-gray-500">Width: {(rate.ciUpper - rate.ciLower).toFixed(4)}s</span>
                        </div>

                        {}
                        {crossesZero && (
                          <div className="mt-2.5 pt-2 border-t border-amber-500/20 flex items-start gap-1.5 text-[10px] text-amber-300/90 leading-tight font-sans">
                            <AlertCircle size={13} className="text-amber-400 flex-shrink-0 mt-0.5" />
                            <span>
                              <strong>Scientific Note:</strong> The 95% CI crosses zero (-0.0235 to +0.0228). Degradation on Hard is statistically indistinguishable from zero slope in the observed dry dataset.
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="text-[10px] text-gray-500 font-mono">
                  METHOD: NON-PARAMETRIC STRATIFIED BOOTSTRAP (1,000 RESAMPLES PER COMPOUND).
                </div>
              </div>
            </div>

            {}
            <div className="rounded-xl border border-white/[0.08] bg-[#0E1118]/80 overflow-hidden">
              <button
                onClick={() => {
                  soundService.playAccordionChime();
                  setMethodologyOpen(!methodologyOpen);
                }}
                className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors"
              >
                <div>
                  <div className="text-xs font-black tracking-widest text-[#E10600] uppercase font-mono">
                    TECHNICAL SPECIFICATION
                  </div>
                  <h3 className="text-sm md:text-base font-bold text-white tracking-wide uppercase mt-0.5">
                    HOW TRACKSHIFT ESTIMATES DEGRADATION
                  </h3>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
                  <span>{methodologyOpen ? 'HIDE METHODOLOGY' : 'VIEW METHODOLOGY PIPELINE'}</span>
                  {methodologyOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </button>

              <AnimatePresence>
                {methodologyOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="p-5 pt-0 border-t border-white/[0.06] space-y-6">

                      {}
                      <div className="pt-4">
                        <div className="text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-3">
                          DATA PIPELINE WORKFLOW
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                          {METHODOLOGY_STEPS.map((step) => (
                            <div
                              key={step.step}
                              className="p-3 rounded border border-white/[0.06] bg-black/30 flex flex-col justify-between"
                            >
                              <div>
                                <div className="text-[10px] font-mono text-[#E10600] font-bold">
                                  PHASE 0{step.step}
                                </div>
                                <div className="text-xs font-bold text-white tracking-wide uppercase mt-1">
                                  {step.title}
                                </div>
                              </div>
                              <div className="text-[10px] text-gray-400 mt-2 leading-tight">
                                {step.desc}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                        <div className="p-3 rounded-lg border border-white/[0.06] bg-white/[0.01]">
                          <div className="text-xs font-bold text-gray-200 uppercase mb-1">
                            1. Representative Lap Filtering
                          </div>
                          <p className="text-[11px] text-gray-400 leading-relaxed">
                            Data is restricted strictly to dry sessions from the 2022–2025 ground-effect era. Pit in/out laps, safety car deltas, yellow flags, and traffic-impeded laps are cleanly filtered out to isolate genuine tyre pace.
                          </p>
                        </div>

                        <div className="p-3 rounded-lg border border-white/[0.06] bg-white/[0.01]">
                          <div className="text-xs font-bold text-gray-200 uppercase mb-1">
                            2. Stint-Level Normalization
                          </div>
                          <p className="text-[11px] text-gray-400 leading-relaxed">
                            Pace is normalized to each stint's baseline lap (Lap 2). This separates tyre degradation from vehicle fuel mass loss (~0.06s/lap burn-off) and ambient track rubbering without introducing artificial physics assumptions.
                          </p>
                        </div>

                        <div className="p-3 rounded-lg border border-white/[0.06] bg-white/[0.01]">
                          <div className="text-xs font-bold text-gray-200 uppercase mb-1">
                            3. Robust Theil-Sen Estimation
                          </div>
                          <p className="text-[11px] text-gray-400 leading-relaxed">
                            Degradation rates are computed using median-of-slopes robust regression, making the estimates highly resilient to driver lockups or unexpected traffic, accompanied by empirical 95% bootstrap confidence intervals.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {}
            <div className="rounded-xl p-4 border border-white/[0.06] bg-[#0A0D12] text-gray-400">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center sm:text-left">
                <div className="border-r border-white/[0.06] pr-2 last:border-none">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-gray-500 font-bold">DATASET</div>
                  <div className="text-xs font-bold text-gray-200 mt-0.5">2022–2025 F1 Sessions</div>
                  <div className="text-[10px] text-gray-500">30,207 representative laps</div>
                </div>

                <div className="border-r border-white/[0.06] pr-2 last:border-none">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-gray-500 font-bold">COMPOUNDS</div>
                  <div className="text-xs font-bold text-gray-200 mt-0.5">Soft · Medium · Hard</div>
                  <div className="text-[10px] text-gray-500">Pirelli dry slick specs</div>
                </div>

                <div className="border-r border-white/[0.06] pr-2 last:border-none">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-gray-500 font-bold">STINTS</div>
                  <div className="text-xs font-bold text-gray-200 mt-0.5">1,970 Qualified Stints</div>
                  <div className="text-[10px] text-gray-500">525 S · 1,044 M · 401 H</div>
                </div>

                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-gray-500 font-bold">PURPOSE</div>
                  <div className="text-xs font-bold text-gray-200 mt-0.5">Observed Tyre Pace Loss</div>
                  <div className="text-[10px] text-gray-500">Empirical strategy inputs</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}