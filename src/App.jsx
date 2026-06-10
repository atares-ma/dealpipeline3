import { useEffect, useMemo, useState } from 'react';
import { supabase } from './lib/supabase';
import { RefDataProvider } from './lib/refData';
import { fmtEur } from './lib/format';
import { Avatar } from './components/primitives';
import { Column } from './components/Column';
import { DealDetail } from './components/DealDetail';
import { NewDeal } from './components/NewDeal';
import { TargetsView } from './views/TargetsView';
import { MandatesView } from './views/MandatesView';
import { ReportsView } from './views/ReportsView';

// Baked-in design defaults (the prototype's Tweaks panel is a design-tool
// scaffold and is intentionally not shipped).
const DEFAULTS = {
  cardStyle: 'detailed',
  accent: '#A8CE3A',
  showSummaryValue: true,
  boardDensity: 'regular',
  firmName: 'atares',
};

const NAV = [
  { id: 'pipeline', label: 'Pipeline' },
  { id: 'targets', label: 'Targets' },
  { id: 'mandates', label: 'Mandates' },
  { id: 'reports', label: 'Reports' },
];

// Columns selected from the deals table, in card field order.
const DEAL_COLS = 'id,name,sector,size,stage,lead,days,prob,priority,next,due,note';

export default function App() {
  const t = DEFAULTS;
  const [ref, setRef] = useState({ stages: [], sectors: {}, leads: [] });
  const [deals, setDeals] = useState([]);
  const [targets, setTargets] = useState([]);
  const [mandates, setMandates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [open, setOpen] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [newStage, setNewStage] = useState('sourcing');
  const [dragId, setDragId] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);
  const [query, setQuery] = useState('');
  const [view, setView] = useState('pipeline');

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', t.accent);
  }, [t.accent]);

  // Initial load from Supabase.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [stagesR, sectorsR, leadsR, dealsR, targetsR, mandatesR] = await Promise.all([
          supabase.from('stages').select('*').order('sort_order'),
          supabase.from('sectors').select('*'),
          supabase.from('leads').select('*'),
          supabase.from('deals').select(DEAL_COLS).order('created_at', { ascending: false }),
          supabase.from('targets').select('*').order('id'),
          supabase.from('mandates').select('*').order('id'),
        ]);
        const firstErr = [stagesR, sectorsR, leadsR, dealsR, targetsR, mandatesR].find((r) => r.error);
        if (firstErr) throw firstErr.error;
        if (cancelled) return;
        const sectorMap = Object.fromEntries((sectorsR.data || []).map((s) => [s.name, s.color]));
        setRef({ stages: stagesR.data || [], sectors: sectorMap, leads: leadsR.data || [] });
        setDeals((dealsR.data || []).map((d) => ({ ...d, size: Number(d.size) })));
        setTargets((targetsR.data || []).map((x) => ({ ...x, revenue: Number(x.revenue) })));
        setMandates(mandatesR.data || []);
      } catch (e) {
        if (!cancelled) setError(e.message || String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const STAGES = ref.stages;
  const stageName = (id) => (STAGES.find((s) => s.id === id) || {}).name;

  const filtered = query.trim()
    ? deals.filter((d) => (d.name + ' ' + d.sector).toLowerCase().includes(query.toLowerCase()))
    : deals;
  const byStage = (sid) => filtered.filter((d) => d.stage === sid);
  const totalValue = deals.reduce((s, d) => s + d.size, 0);

  /* ---- mutations (optimistic local update + Supabase persist) ---- */
  const persistStage = async (id, stage) => {
    const { error: e } = await supabase.from('deals').update({ stage, days: 0 }).eq('id', id);
    if (e) console.error('Failed to move deal', e);
  };

  const onDragStartCard = (e, deal) => {
    setDragId(deal.id);
    e.dataTransfer.effectAllowed = 'move';
    try { e.dataTransfer.setData('text/plain', deal.id); } catch (_) {}
  };
  const onDragEndCard = () => { setDragId(null); setDragOverStage(null); };
  const onDropStage = (sid) => {
    if (!dragId) return;
    const id = dragId;
    setDeals((ds) => ds.map((d) => (d.id === id ? { ...d, stage: sid, days: d.stage === sid ? d.days : 0 } : d)));
    const moved = deals.find((d) => d.id === id);
    if (moved && moved.stage !== sid) persistStage(id, sid);
    setDragId(null); setDragOverStage(null);
  };

  const advance = (deal) => {
    const idx = STAGES.findIndex((s) => s.id === deal.stage);
    if (idx < STAGES.length - 1) {
      const next = STAGES[idx + 1].id;
      setDeals((ds) => ds.map((d) => (d.id === deal.id ? { ...d, stage: next, days: 0 } : d)));
      setOpen((o) => (o ? { ...o, stage: next, days: 0 } : o));
      persistStage(deal.id, next);
    }
  };

  const createDeal = async (form) => {
    const payload = {
      name: form.name, sector: form.sector, size: form.size, stage: form.stage || newStage,
      lead: form.lead, days: 0, prob: form.prob, priority: form.priority, next: form.next, due: form.due,
    };
    setShowNew(false);
    const { data, error: e } = await supabase.from('deals').insert(payload).select(DEAL_COLS).single();
    if (e) { console.error('Failed to create deal', e); return; }
    setDeals((ds) => [{ ...data, size: Number(data.size) }, ...ds]);
  };

  const openNew = (sid) => { setNewStage(sid || 'sourcing'); setShowNew(true); };

  const promoteTarget = async (tg) => {
    const payload = {
      name: tg.name, sector: tg.sector, size: tg.revenue, stage: 'sourcing',
      lead: tg.owner, days: 0, prob: tg.fit * 8, priority: tg.fit >= 5,
      next: 'Open dialogue', due: 'TBD', note: 'Promoted from target research. HQ: ' + tg.hq + '.',
    };
    setView('pipeline');
    const { data, error: e } = await supabase.from('deals').insert(payload).select(DEAL_COLS).single();
    if (e) { console.error('Failed to promote target', e); return; }
    setDeals((ds) => [{ ...data, size: Number(data.size) }, ...ds]);
  };

  const refValue = useMemo(() => ref, [ref]);

  return (
    <RefDataProvider value={refValue}>
      <div className="app">
        <header className="topbar">
          <div className="brand">
            <span className="brand-mark">
              <svg width="30" height="30" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <g stroke="currentColor" strokeWidth="1.1" strokeLinecap="round">
                  <line x1="16" y1="16" x2="16" y2="2.5" />
                  <line x1="16" y1="16" x2="27.5" y2="8" />
                  <line x1="16" y1="16" x2="29.5" y2="19" />
                  <line x1="16" y1="16" x2="18.5" y2="29.5" />
                  <line x1="16" y1="16" x2="6" y2="26.5" />
                  <line x1="16" y1="16" x2="3" y2="13" />
                  <line x1="16" y1="16" x2="8.5" y2="4.5" />
                </g>
                <circle cx="16" cy="2.5" r="1.5" fill="currentColor" />
                <circle cx="29.5" cy="19" r="1.3" fill="currentColor" />
                <circle cx="6" cy="26.5" r="1.2" fill="currentColor" />
                <circle cx="16" cy="16" r="1.7" fill="currentColor" />
              </svg>
            </span>
            <div className="brand-text">
              <span className="brand-name">{t.firmName}</span>
              <span className="brand-sub">passion for tech M&amp;A</span>
            </div>
          </div>

          <nav className="topnav">
            {NAV.map((n) => (
              <a key={n.id} className={view === n.id ? 'active' : ''} onClick={() => setView(n.id)}>{n.label}</a>
            ))}
          </nav>

          <div className="top-actions">
            {view === 'pipeline' && (
              <label className="search">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" /><path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search deals" />
              </label>
            )}
            <button className="btn primary" onClick={() => openNew('sourcing')}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>
              New Deal
            </button>
          </div>
        </header>

        {error && (
          <div style={{ padding: '12px 26px', background: '#FBEAE5', color: '#C0492E', fontSize: 13, fontWeight: 600 }}>
            Failed to load data: {error}
          </div>
        )}

        {view === 'pipeline' && (
          <div className="subbar">
            <div className="sub-stats">
              <span className="sub-stat"><strong>{deals.length}</strong> active deals</span>
              <span className="sub-div" />
              <span className="sub-stat"><strong>{fmtEur(totalValue)}</strong> total pipeline value</span>
            </div>
            <div className="legend">
              {ref.leads.slice(0, 6).map((l) => <Avatar key={l.id} leadId={l.id} size={24} />)}
            </div>
          </div>
        )}

        {view === 'pipeline' && (
          <main className="board">
            {STAGES.map((s) => (
              <Column
                key={s.id}
                stage={s}
                deals={byStage(s.id)}
                accent={t.accent}
                showVal={t.showSummaryValue}
                density={t.boardDensity}
                cardStyle={t.cardStyle}
                dragId={dragId}
                dragOverStage={dragOverStage}
                onOpen={setOpen}
                onDragStartCard={onDragStartCard}
                onDragEndCard={onDragEndCard}
                onDropStage={onDropStage}
                onDragOverStage={setDragOverStage}
                onDragLeaveStage={() => setDragOverStage(null)}
                onNewInStage={openNew}
              />
            ))}
            {!loading && STAGES.length === 0 && (
              <div className="col-empty" style={{ margin: 'auto' }}>No stages configured</div>
            )}
          </main>
        )}

        {view === 'targets' && <TargetsView targets={targets} onPromote={promoteTarget} />}
        {view === 'mandates' && <MandatesView mandates={mandates} />}
        {view === 'reports' && <ReportsView deals={deals} />}

        {open && (
          <DealDetail
            deal={open}
            stageName={stageName(open.stage)}
            canAdvance={STAGES.findIndex((s) => s.id === open.stage) < STAGES.length - 1}
            onClose={() => setOpen(null)}
            onAdvance={advance}
          />
        )}

        {showNew && (
          <NewDeal
            initialStage={newStage}
            onClose={() => setShowNew(false)}
            onCreate={createDeal}
          />
        )}
      </div>
    </RefDataProvider>
  );
}
