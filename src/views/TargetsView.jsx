import { useState } from 'react';
import { fmtEur } from '../lib/format';
import { Avatar, SectorChip } from '../components/primitives';

function FitDots({ n }) {
  return (
    <span className="fit" title={n + ' / 5 strategic fit'}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={'fit-dot' + (i <= n ? ' on' : '')} />
      ))}
    </span>
  );
}

function TargetStatus({ status }) {
  const map = { Tracking: 'track', Contacted: 'contact', Qualified: 'qual', Passed: 'passed' };
  return <span className={'tg-status ' + (map[status] || 'track')}>{status}</span>;
}

export function TargetsView({ targets, onPromote }) {
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');
  const all = targets;
  const statuses = ['All', 'Tracking', 'Contacted', 'Qualified', 'Passed'];

  let rows = filter === 'All' ? all : all.filter((t) => t.status === filter);
  if (query.trim()) rows = rows.filter((t) => (t.name + ' ' + t.sector + ' ' + t.hq).toLowerCase().includes(query.toLowerCase()));

  const counts = statuses.reduce((m, s) => {
    m[s] = s === 'All' ? all.length : all.filter((t) => t.status === s).length;
    return m;
  }, {});

  return (
    <div className="view">
      <div className="view-head">
        <div>
          <h1 className="view-title">Target research</h1>
          <p className="view-sub">{all.length} companies tracked across sourcing channels — promote qualified targets into the pipeline.</p>
        </div>
        <div className="view-actions">
          <label className="search light">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" /><path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search targets" />
          </label>
          <button className="btn primary"><svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>Add target</button>
        </div>
      </div>

      <div className="chips">
        {statuses.map((s) => (
          <button key={s} className={'chip' + (filter === s ? ' on' : '')} onClick={() => setFilter(s)}>
            {s}<span className="chip-n">{counts[s]}</span>
          </button>
        ))}
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Company</th><th>Sector</th><th className="num">Revenue</th><th className="num">EBITDA %</th>
              <th>HQ</th><th>Fit</th><th>Owner</th><th>Status</th><th>Last contact</th><th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((t) => (
              <tr key={t.id}>
                <td className="td-company">{t.name}</td>
                <td><SectorChip sector={t.sector} /></td>
                <td className="num strong">{fmtEur(t.revenue)}</td>
                <td className="num">{t.margin}%</td>
                <td className="muted">{t.hq}</td>
                <td><FitDots n={t.fit} /></td>
                <td><Avatar leadId={t.owner} size={26} /></td>
                <td><TargetStatus status={t.status} /></td>
                <td className="muted sm">{t.contact}</td>
                <td className="td-action">
                  <button className="promote" disabled={t.status === 'Passed'} onClick={() => onPromote(t)} title="Promote to pipeline">
                    Promote
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
