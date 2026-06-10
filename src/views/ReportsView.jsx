import { fmtEur } from '../lib/format';
import { useRefData, useSectorColor } from '../lib/refData';

function Kpi({ label, value, sub, accent }) {
  return (
    <div className="kpi">
      <div className="kpi-k">{label}</div>
      <div className={'kpi-v' + (accent ? ' accent' : '')}>{value}</div>
      {sub && <div className="kpi-sub">{sub}</div>}
    </div>
  );
}

function BarRow({ label, value, display, max, color, dot }) {
  const pct = max > 0 ? Math.max(4, (value / max) * 100) : 0;
  return (
    <div className="barrow">
      <div className="barrow-label">
        {dot && <span className="sector-dot" style={{ background: dot }} />}
        {label}
      </div>
      <div className="barrow-track">
        <div className="barrow-fill" style={{ width: pct + '%', background: color }} />
      </div>
      <div className="barrow-val">{display}</div>
    </div>
  );
}

export function ReportsView({ deals }) {
  const { stages: STAGES } = useRefData();
  const sectorColor = useSectorColor();
  const total = deals.reduce((s, d) => s + d.size, 0);
  const weighted = deals.reduce((s, d) => s + (d.size * d.prob) / 100, 0);
  const avgDays = deals.length ? Math.round(deals.reduce((s, d) => s + d.days, 0) / deals.length) : 0;
  const avgProb = deals.length ? Math.round(deals.reduce((s, d) => s + d.prob, 0) / deals.length) : 0;

  const byStage = STAGES.map((s) => {
    const ds = deals.filter((d) => d.stage === s.id);
    return { id: s.id, name: s.name, count: ds.length, value: ds.reduce((a, d) => a + d.size, 0) };
  });
  const maxStageVal = Math.max(...byStage.map((s) => s.value), 1);
  const maxCount = Math.max(...byStage.map((s) => s.count), 1);

  const sectors = {};
  deals.forEach((d) => { sectors[d.sector] = (sectors[d.sector] || 0) + d.size; });
  const bySector = Object.entries(sectors).map(([k, v]) => ({ name: k, value: v })).sort((a, b) => b.value - a.value);
  const maxSectorVal = Math.max(...bySector.map((s) => s.value), 1);

  return (
    <div className="view">
      <div className="view-head">
        <div>
          <h1 className="view-title">Pipeline reports</h1>
          <p className="view-sub">Live snapshot across all stages · weighted by deal probability.</p>
        </div>
        <div className="view-actions">
          <div className="seg">
            <button className="seg-b on">Quarter</button>
            <button className="seg-b">Year</button>
            <button className="seg-b">All time</button>
          </div>
        </div>
      </div>

      <div className="kpi-row">
        <Kpi label="Total pipeline value" value={fmtEur(Math.round(total))} sub={deals.length + ' active deals'} />
        <Kpi label="Probability-weighted" value={fmtEur(Math.round(weighted))} sub="expected close value" accent />
        <Kpi label="Avg. probability" value={avgProb + '%'} sub="across pipeline" />
        <Kpi label="Avg. days in stage" value={avgDays} sub="velocity indicator" />
      </div>

      <div className="report-grid">
        <section className="panel">
          <h3 className="panel-title">Value by stage</h3>
          <div className="bars">
            {byStage.map((s, i) => (
              <BarRow key={s.id} label={s.name} value={s.value} display={fmtEur(s.value)} max={maxStageVal}
                color={i === byStage.length - 1 ? 'var(--accent)' : 'var(--navy-2)'} />
            ))}
          </div>
        </section>

        <section className="panel">
          <h3 className="panel-title">Deal count funnel</h3>
          <div className="funnel">
            {byStage.map((s) => {
              const w = Math.max(18, (s.count / maxCount) * 100);
              return (
                <div key={s.id} className="funnel-row">
                  <span className="funnel-label">{s.name}</span>
                  <div className="funnel-bar-wrap">
                    <div className="funnel-bar" style={{ width: w + '%' }}><span>{s.count}</span></div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="panel wide">
          <h3 className="panel-title">Pipeline value by sector</h3>
          <div className="bars">
            {bySector.map((s) => (
              <BarRow key={s.name} label={s.name} value={s.value} display={fmtEur(s.value)} max={maxSectorVal}
                color={sectorColor(s.name)} dot={sectorColor(s.name)} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
