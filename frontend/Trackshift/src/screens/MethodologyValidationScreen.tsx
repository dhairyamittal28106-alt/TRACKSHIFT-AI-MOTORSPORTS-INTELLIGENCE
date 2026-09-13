import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
} from 'recharts';
import {
  CheckCircle2, XCircle, ArrowRight, ShieldCheck, Database,
  Layers, AlertTriangle, GitCommit, FileSpreadsheet, Check,
} from 'lucide-react';
import SideNav from '../components/shared/SideNav';
import HeaderBar from '../components/shared/HeaderBar';
import {
  DEGRADATION_RATES,
  DEGRADATION_BY_YEAR,
  CV_FOLD_RESULTS,
  CV_SUMMARY,
  ERROR_BY_AGE,
} from '../services/dataService';
import { TYRE_COLORS } from '../design/tokens';

const yearlyChartData = [2022, 2023, 2024, 2025].map(year => {
  const soft = DEGRADATION_BY_YEAR.find(d => d.year === year && d.compound === 'SOFT');
  const medium = DEGRADATION_BY_YEAR.find(d => d.year === year && d.compound === 'MEDIUM');
  const hard = DEGRADATION_BY_YEAR.find(d => d.year === year && d.compound === 'HARD');
  return {
    year: String(year),
    soft: soft ? parseFloat(soft.medianDegradation.toFixed(4)) : 0,
    medium: medium ? parseFloat(medium.medianDegradation.toFixed(4)) : 0,
    hard: hard ? parseFloat(hard.medianDegradation.toFixed(4)) : 0,
  };
});

const foldChartData = CV_FOLD_RESULTS.map(f => ({
  fold: `Fold ${f.fold}`,
  trainRows: f.trainRows,
  testRows: f.testRows,
  mae: parseFloat(f.mae.toFixed(3)),
  rmse: parseFloat(f.rmse.toFixed(3)),
  r2: parseFloat(f.r2.toFixed(4)),
}));

export default function MethodologyValidationScreen() {
  return (
    <div className="flex h-screen bg-trackbg overflow-hidden text-gray-200">
      <SideNav />

      <div className="flex flex-col flex-1 min-w-0">
        <HeaderBar
          left={
            <>
              <span className="text-[#8A8A8A]">TRACKSHIFT</span>
              <span className="text-[#5A5A5A]">/</span>
              <span className="text-white font-black">METHODOLOGY & VALIDATION</span>
            </>
          }
          right={
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="tech-label-sm text-cyan-400 font-bold tracking-wider">
                2022–2025 · DRY PRACTICE DATA · STINT-QUARANTINED VALIDATION
              </span>
            </div>
          }
        />

        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {}
          <div className="panel p-6 border-l-4 border-l-cyan-400 relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5 mb-1.5">
                  <ShieldCheck size={18} className="text-cyan-400" />
                  <span className="tech-label text-cyan-400 text-xs tracking-[0.2em]">EMPIRICAL AUDIT TRAIL</span>
                </div>
                <h1 className="text-2xl lg:text-3xl font-black tracking-[0.1em] text-white uppercase">
                  METHODOLOGY & VALIDATION
                </h1>
                <p className="text-xs text-gray-400 font-medium tracking-wide mt-1 max-w-3xl leading-relaxed">
                  How TrackShift extracts, tests, and qualifies tyre-degradation intelligence across the modern 18-inch Pirelli era.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 items-center">
                <div className="px-3 py-1.5 bg-white/[0.03] border border-white/[0.08] rounded">
                  <div className="tech-label-sm text-gray-500">RAW LAPS LOADED</div>
                  <div className="text-sm font-mono font-black text-white">74,951</div>
                </div>
                <div className="px-3 py-1.5 bg-white/[0.03] border border-white/[0.08] rounded">
                  <div className="tech-label-sm text-gray-500">REPRESENTATIVE LAPS</div>
                  <div className="text-sm font-mono font-black text-cyan-400">30,207</div>
                </div>
                <div className="px-3 py-1.5 bg-white/[0.03] border border-white/[0.08] rounded">
                  <div className="tech-label-sm text-gray-500">QUALIFIED STINTS</div>
                  <div className="text-sm font-mono font-black text-white">1,970</div>
                </div>
              </div>
            </div>
          </div>

          {}
          <div className="panel p-6">
            <div className="flex items-center gap-2 mb-1">
              <Database size={15} className="text-cyan-400" />
              <h2 className="tech-label text-gray-200 tracking-wider">END-TO-END DATA ENGINEERING PIPELINE</h2>
            </div>
            <p className="tech-label-sm text-gray-500 mb-5">
              From raw Grand Prix weekend timing telemetry to quarantined statistical qualification
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
              {[
                {
                  step: '01',
                  name: 'RAW PRACTICE DATA',
                  stat: '74,951 LAPS',
                  desc: 'FP1, FP2, and FP3 dry session timing across 2022–2025 seasons.',
                },
                {
                  step: '02',
                  name: 'CLEANING & FILTER',
                  stat: '30,207 LAPS',
                  desc: 'In/out laps, track-status flags, safety cars, and traffic outliers removed.',
                },
                {
                  step: '03',
                  name: 'STINT CONSTRUCTION',
                  stat: '1,970 STINTS',
                  desc: 'Continuous runs on identical physical tyre sets isolated per driver.',
                },
                {
                  step: '04',
                  name: 'TYRE AGE ISOLATION',
                  stat: 'AGE 2–20 LAPS',
                  desc: 'Accumulated lap count serves as the independent explanatory variable.',
                },
                {
                  step: '05',
                  name: 'DEGRADATION ESTIMATE',
                  stat: 'HUBER / THEIL-SEN',
                  desc: 'Robust linear slopes calculated to isolate tyre-attributable pace loss.',
                },
                {
                  step: '06',
                  name: 'YEAR-OVER-YEAR CHECK',
                  stat: '4 SEASONS',
                  desc: 'Consistency audit across 2022, 2023, 2024, and 2025 compounds.',
                },
                {
                  step: '07',
                  name: 'GROUPED ML AUDIT',
                  stat: '5-FOLD CV',
                  desc: 'GroupKFold quarantined by stint to prevent lap-level data leakage.',
                },
              ].map((p, idx) => (
                <div
                  key={p.step}
                  className="bg-black/40 border border-white/[0.08] p-3.5 rounded flex flex-col justify-between relative group hover:border-cyan-400/40 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[10px] font-black text-cyan-400">{p.step}</span>
                      {idx < 6 && <ArrowRight size={11} className="text-gray-600 hidden lg:block -mr-1.5" />}
                    </div>
                    <div className="text-[11px] font-black tracking-wider text-white mb-1 uppercase leading-tight">
                      {p.name}
                    </div>
                    <div className="text-[10px] font-mono font-bold text-accent mb-2">
                      {p.stat}
                    </div>
                  </div>
                  <div className="text-[10px] text-gray-500 leading-snug">
                    {p.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {}
            <div className="panel p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <GitCommit size={15} className="text-cyan-400" />
                  <h2 className="tech-label text-gray-200 tracking-wider">WHAT IS A STINT?</h2>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed mb-4">
                  A <strong>stint</strong> is the uninterrupted sequence of consecutive laps completed on the same physical set of tyres between pit stops or session stoppages.
                </p>

                {}
                <div className="bg-black/50 border border-white/[0.08] rounded p-4 mb-4">
                  <div className="tech-label-sm text-gray-500 mb-2">STINT EXECUTION TIMELINE</div>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
                    {[1, 2, 3, 4, 5, '...', 18, 19, 20].map((lap, i) => (
                      <div key={i} className="flex flex-col items-center shrink-0">
                        <div className={`w-8 h-8 rounded flex items-center justify-center font-mono text-[10px] font-bold border ${
                          lap === 1
                            ? 'bg-red-500/10 border-red-500/30 text-red-400'
                            : lap === '...'
                            ? 'bg-transparent border-transparent text-gray-600'
                            : 'bg-white/[0.04] border-white/[0.1] text-gray-300'
                        }`}>
                          {lap === '...' ? '...' : `L${lap}`}
                        </div>
                        <span className="text-[8px] font-mono text-gray-500 mt-1">
                          {lap === 1 ? 'Out' : lap === '...' ? '' : `Age ${lap}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-cyan-950/20 border border-cyan-500/20 rounded text-[11px] text-gray-300 leading-relaxed">
                <span className="font-bold text-cyan-400">Scientific Principle:</span> Tyre age provides the independent explanatory variable used to isolate how lap pace degrades as a stint progresses, holding circuit and car configuration constant.
              </div>
            </div>

            {}
            <div className="panel p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck size={15} className="text-accent" />
                  <h2 className="tech-label text-gray-200 tracking-wider">WHY GROUPING MATTERS: AVOIDING DATA LEAKAGE</h2>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed mb-4">
                  Random lap splits create severe data leakage because adjacent laps from the same driver in the same session share identical fuel, weather, and setup conditions.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  {}
                  <div className="p-3.5 bg-red-950/15 border border-red-500/30 rounded">
                    <div className="flex items-center gap-1.5 text-red-400 font-bold text-xs mb-2">
                      <XCircle size={14} />
                      <span>NAIVE RANDOM SPLIT (LEAKAGE)</span>
                    </div>
                    <div className="text-[10px] font-mono text-gray-400 space-y-1 mb-2">
                      <div>STINT A · Lap 5 → <span className="text-green-400 font-bold">TRAIN</span></div>
                      <div>STINT A · Lap 6 → <span className="text-red-400 font-bold">TEST (LEAK)</span></div>
                    </div>
                    <p className="text-[10px] text-gray-500 leading-snug">
                      The model simply memorizes that driver’s immediate car setup rather than generalizing tyre degradation.
                    </p>
                  </div>

                  {}
                  <div className="p-3.5 bg-cyan-950/20 border border-cyan-500/40 rounded">
                    <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-xs mb-2">
                      <CheckCircle2 size={14} />
                      <span>TRACKSHIFT GROUP K-FOLD</span>
                    </div>
                    <div className="text-[10px] font-mono text-gray-300 space-y-1 mb-2">
                      <div>STINT A · All Laps → <span className="text-green-400 font-bold">TRAIN ONLY</span></div>
                      <div>STINT B · All Laps → <span className="text-cyan-400 font-bold">TEST ONLY</span></div>
                    </div>
                    <p className="text-[10px] text-gray-400 leading-snug">
                      TrackShift groups folds by complete stint ID. No laps from a tested stint ever appear in training.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-white/[0.02] border border-white/[0.08] rounded text-[10.5px] text-gray-400">
                TrackShift strictly implemented <code className="text-cyan-300 font-mono">sklearn.model_selection.GroupKFold(n_splits=5)</code> grouped by <code className="text-gray-300 font-mono">StintGroup</code> in <code className="text-gray-300 font-mono">ml/one.ipynb</code>.
              </div>
            </div>

          </div>

          {}
          <div className="panel p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Layers size={15} className="text-cyan-400" />
                  <h2 className="tech-label text-gray-200 tracking-wider">AUTHORITATIVE DEGRADATION ESTIMATES</h2>
                </div>
                <p className="tech-label-sm text-gray-500">
                  Empirical Huber & Theil-Sen regression rates from representative 2022–2025 practice stints
                </p>
              </div>
              <span className="text-[10px] font-mono text-gray-500 border border-white/[0.08] px-2.5 py-1 rounded">
                SOURCE: ml/FINAL_tyre_degradation_rates.csv
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {(['SOFT', 'MEDIUM', 'HARD'] as const).map(c => {
                const r = DEGRADATION_RATES[c];
                const isHard = c === 'HARD';
                return (
                  <div
                    key={c}
                    className="p-5 rounded bg-black/40 border transition-all"
                    style={{ borderColor: isHard ? 'rgba(245, 158, 11, 0.4)' : TYRE_COLORS[c] + '35' }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ background: TYRE_COLORS[c] }}
                        />
                        <span className="text-sm font-black tracking-widest text-white">{c}</span>
                      </div>
                      <span className="tech-label-sm text-gray-500 font-mono">
                        {r.stints.toLocaleString()} STINTS
                      </span>
                    </div>

                    <div className="text-3xl font-black font-mono tracking-tight mb-2" style={{ color: TYRE_COLORS[c] }}>
                      +{r.rate.toFixed(4)} <span className="text-sm font-normal text-gray-400">s/lap</span>
                    </div>

                    <div className="space-y-1.5 text-[11px] font-mono border-t border-white/[0.06] pt-2.5">
                      <div className="flex justify-between text-gray-400">
                        <span>95% Bootstrap CI:</span>
                        <span className="text-gray-200 font-bold">
                          [{r.ciLower >= 0 ? `+${r.ciLower.toFixed(4)}` : r.ciLower.toFixed(4)}, +{r.ciUpper.toFixed(4)}]
                        </span>
                      </div>
                      <div className="flex justify-between text-gray-400">
                        <span>Durability Ranking:</span>
                        <span className="text-gray-200 font-bold">Rank #{r.durabilityRank}</span>
                      </div>
                    </div>

                    {isHard && (
                      <div className="mt-3 p-2.5 bg-amber-950/25 border border-amber-500/30 rounded flex items-start gap-2">
                        <AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5" />
                        <div className="text-[10px] text-amber-200 leading-snug">
                          <strong>CI Crosses Zero:</strong> The lower bound is <code className="font-mono text-amber-300">-0.0235 s/lap</code>. Observed degradation is not statistically distinguishable from zero in this dataset.
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="p-3 bg-white/[0.02] border border-white/[0.08] rounded text-xs text-gray-400 leading-relaxed">
              <strong>Analytical Integrity Disclaimer:</strong> These are observed statistical degradation estimates derived from representative dry stints. They describe the change in lap pace associated with additional tyre age; they are not direct measurements of physical rubber wear or chemical thermal degradation.
            </div>
          </div>

          {}
          <div className="panel p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <FileSpreadsheet size={15} className="text-cyan-400" />
                  <h2 className="tech-label text-gray-200 tracking-wider">YEAR-OVER-YEAR DEGRADATION STABILITY</h2>
                </div>
                <p className="tech-label-sm text-gray-500">
                  Observed median degradation rate by compound across four consecutive Formula 1 seasons (2022–2025)
                </p>
              </div>

              {}
              <div className="flex items-center gap-4 text-[10px] font-bold">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#FF4D4D]" /> SOFT</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#F59E0B]" /> MEDIUM</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#F0F2F5]" /> HARD</span>
              </div>
            </div>

            <div className="h-56 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yearlyChartData} margin={{ top: 10, right: 10, bottom: 5, left: 10 }} barGap={3} barCategoryGap="25%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="year" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false} tickFormatter={v => `${v.toFixed(2)}s`} />
                  <Tooltip
                    contentStyle={{ background: '#111520', border: '1px solid #3A3A3A', borderRadius: 2, fontSize: 11 }}
                    formatter={((v: unknown, name: unknown) => [
                      `${Number(v).toFixed(4)} s/lap`,
                      String(name ?? '').toUpperCase(),
                    ]) as any}
                  />
                  <Bar dataKey="soft" name="Soft" fill="#FF4D4D" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="medium" name="Medium" fill="#F59E0B" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="hard" name="Hard" fill="#F0F2F5" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="p-3.5 bg-black/40 border border-white/[0.08] rounded flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 bg-status-green/20 text-status-green font-mono font-bold text-[10px] rounded">
                  SIGNAL CHECK
                </span>
                <span className="text-xs text-gray-300">
                  Across the comparable 2022–2025 practice data, the degradation ordering remains broadly consistent: <strong>Soft &gt; Medium &gt; Hard</strong>.
                </span>
              </div>
              <span className="text-[10px] font-mono text-gray-500 shrink-0">SOURCE: ml/FINAL_degradation_by_year.csv</span>
            </div>
          </div>

          {}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {}
            <div className="panel p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={15} className="text-cyan-400" />
                  <h2 className="tech-label text-gray-200 tracking-wider">STINT-QUARANTINED MODEL VALIDATION</h2>
                </div>
                <span className="text-[9px] font-mono text-gray-500 border border-white/[0.08] px-2 py-0.5 rounded">
                  LAP-TIME REGRESSION
                </span>
              </div>
              <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                5-Fold GroupKFold cross-validation on <strong>LapTimeSeconds</strong>. The stint identifier was used as the grouping key so no stint appeared in both train and validation folds.
              </p>

              {}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="p-3 bg-black/40 border border-white/[0.08] rounded text-center">
                  <div className="tech-label-sm text-gray-500 mb-0.5">MEAN MAE</div>
                  <div className="text-xl font-black font-mono text-cyan-400">{CV_SUMMARY.meanMAE.toFixed(3)} s</div>
                  <div className="text-[9px] text-gray-600">Mean absolute error</div>
                </div>
                <div className="p-3 bg-black/40 border border-white/[0.08] rounded text-center">
                  <div className="tech-label-sm text-gray-500 mb-0.5">MEAN RMSE</div>
                  <div className="text-xl font-black font-mono text-accent">{CV_SUMMARY.meanRMSE.toFixed(3)} s</div>
                  <div className="text-[9px] text-gray-600">Root mean squared</div>
                </div>
                <div className="p-3 bg-black/40 border border-white/[0.08] rounded text-center">
                  <div className="tech-label-sm text-gray-500 mb-0.5">MEAN R²</div>
                  <div className="text-xl font-black font-mono text-gray-200">{CV_SUMMARY.meanR2.toFixed(4)}</div>
                  <div className="text-[9px] text-gray-600">Variance explained</div>
                </div>
              </div>

              {}
              <div className="overflow-x-auto">
                <table className="w-full text-[11px] font-mono text-left">
                  <thead>
                    <tr className="border-b border-white/[0.08] text-gray-500 tech-label-sm">
                      <th className="py-1.5">FOLD</th>
                      <th className="py-1.5">TRAIN ROWS</th>
                      <th className="py-1.5">TEST ROWS</th>
                      <th className="py-1.5 text-cyan-400">MAE</th>
                      <th className="py-1.5 text-accent">RMSE</th>
                      <th className="py-1.5 text-right">R²</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04] text-gray-300">
                    {foldChartData.map(f => (
                      <tr key={f.fold} className="hover:bg-white/[0.02]">
                        <td className="py-1.5 font-bold text-white">{f.fold}</td>
                        <td className="py-1.5 text-gray-500">{f.trainRows.toLocaleString()}</td>
                        <td className="py-1.5 text-gray-500">{f.testRows.toLocaleString()}</td>
                        <td className="py-1.5 text-cyan-400 font-bold">{f.mae.toFixed(3)}s</td>
                        <td className="py-1.5 text-accent font-bold">{f.rmse.toFixed(3)}s</td>
                        <td className="py-1.5 text-right">{f.r2.toFixed(4)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {}
            <div className="panel p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Layers size={15} className="text-cyan-400" />
                    <h2 className="tech-label text-gray-200 tracking-wider">MODEL ERROR BY TYRE AGE</h2>
                  </div>
                  <span className="text-[9px] font-mono text-gray-500 border border-white/[0.08] px-2 py-0.5 rounded">
                    AGES 2–20 LAPS
                  </span>
                </div>
                <p className="text-xs text-gray-400 mb-3 leading-relaxed">
                  Out-of-fold lap-time MAE across tyre age. Error is elevated during early-stint laps (laps 2–6) due to out-lap tyre warmup and traffic, then settles into a tight 2–3s band for mature stints.
                </p>

                <div className="h-44 mb-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ERROR_BY_AGE} margin={{ top: 5, right: 5, bottom: 0, left: 0 }} barSize={12}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <XAxis dataKey="tyreAge" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 9 }} axisLine={{ stroke: 'rgba(255,255,255,0.08)' }} tickLine={false} />
                      <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 9 }} axisLine={{ stroke: 'rgba(255,255,255,0.08)' }} tickLine={false} tickFormatter={v => `${v.toFixed(0)}s`} />
                      <Tooltip
                        contentStyle={{ background: '#111520', border: '1px solid #3A3A3A', borderRadius: 2, fontSize: 11 }}
                        formatter={((v: unknown) => [`${Number(v).toFixed(2)} s`, 'Lap-Time MAE']) as any}
                        labelFormatter={v => `Tyre Age: ${v} laps`}
                      />
                      <Bar dataKey="mae" name="MAE" radius={[2, 2, 0, 0]}>
                        {ERROR_BY_AGE.map((row, i) => (
                          <Cell
                            key={i}
                            fill={row.mae > 8 ? '#FF4D4D' : row.mae > 5 ? '#F59E0B' : '#22D3EE'}
                            fillOpacity={0.8}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="text-[10.5px] text-gray-400 bg-black/40 border border-white/[0.06] p-2.5 rounded">
                Prediction error varies with tyre age because raw lap times contain substantial environmental variation (driver push level, traffic management, fuel burn) beyond tyre degradation itself.
              </div>
            </div>

          </div>

          {}
          <div className="panel p-6">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck size={16} className="text-cyan-400" />
              <h2 className="tech-label text-gray-200 tracking-wider">SCIENTIFIC SCOPE CONTROL & BOUNDARIES</h2>
            </div>
            <p className="tech-label-sm text-gray-500 mb-5">
              Defensible transparency: explicit boundary definitions between supported conclusions and unvalidated inferences
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {}
              <div className="p-5 bg-status-green/[0.04] border border-status-green/30 rounded">
                <div className="flex items-center gap-2 text-status-green font-bold text-xs tracking-wider uppercase mb-3">
                  <Check size={16} />
                  <span>WHAT THE DATA SUPPORTS</span>
                </div>
                <ul className="space-y-2.5 text-xs text-gray-300">
                  {[
                    'Empirical degradation estimates for dry Free Practice stints',
                    '95% bootstrap confidence interval envelopes for Soft, Medium, and Hard',
                    'Cross-season compound degradation ranking stability (2022–2025)',
                    'Stint-quarantined GroupKFold cross-validation preventing lap leakage',
                    'Out-of-fold lap-time error profiles across tyre age',
                    'Compound durability ordering: Soft degrades fastest, Hard has lowest pace regression',
                  ].map((text, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-status-green shrink-0 mt-0.5 font-bold">✓</span>
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {}
              <div className="p-5 bg-red-950/15 border border-red-500/30 rounded">
                <div className="flex items-center gap-2 text-red-400 font-bold text-xs tracking-wider uppercase mb-3">
                  <XCircle size={16} />
                  <span>WHAT THIS DATASET DOES NOT SUPPORT</span>
                </div>
                <ul className="space-y-2.5 text-xs text-gray-300">
                  {[
                    'Practice → Race transfer validation (dataset contains zero Sunday Grand Prix race laps)',
                    'Sunday race performance validation under full race fuel loads and parc fermé constraints',
                    'Optimal pit-stop timing and full-race Monte Carlo strategic optimization',
                    'Explicit fuel-load mass modeling (proxy only through session progress)',
                    'Multi-car aerodynamic dirty air and dynamic traffic simulation',
                    'Finishing-position or race win probability forecasting',
                    'Direct physical rubber-wear measurement (pace loss reflects operational performance regression)',
                  ].map((text, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-red-400 shrink-0 mt-0.5 font-bold">✕</span>
                      <span className="text-gray-400">{text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {}
          <div className="panel p-4 bg-black/60 border border-white/[0.08]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Database size={14} className="text-gray-500" />
                <span className="tech-label-sm text-gray-400 font-bold">REPOSITORY ARTIFACT PROVENANCE:</span>
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-[10px] font-mono">
                <div><span className="text-gray-500">DATA: </span><span className="text-cyan-300">ENRICHED_TYRE_DATASET_V2.csv</span></div>
                <div><span className="text-gray-500">RATES: </span><span className="text-white">FINAL_tyre_degradation_rates.csv</span></div>
                <div><span className="text-gray-500">SEASONS: </span><span className="text-white">FINAL_degradation_by_year.csv</span></div>
                <div><span className="text-gray-500">VALIDATION: </span><span className="text-cyan-300">model_groupkfold_results.csv</span></div>
                <div><span className="text-gray-500">ERROR: </span><span className="text-white">model_error_by_tyre_age.csv</span></div>
                <div><span className="text-gray-500">PIPELINE: </span><span className="text-accent font-bold">one.ipynb</span></div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}