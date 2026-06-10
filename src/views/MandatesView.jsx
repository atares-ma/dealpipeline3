import { useLeadById } from '../lib/refData';
import { Avatar, SectorChip } from '../components/primitives';

function MandateCard({ m }) {
  const leadById = useLeadById();
  const lead = leadById(m.lead);
  const buy = m.type === 'Buy-side';
  const statusCls = { Active: 'act', Closing: 'close', Pitch: 'pitch', 'On hold': 'hold' }[m.status] || 'act';
  return (
    <article className="mandate">
      <div className="mandate-top">
        <span className={'mtype ' + (buy ? 'buy' : 'sell')}>{m.type}</span>
        <span className={'mstatus ' + statusCls}>{m.status}</span>
      </div>
      <h3 className="mandate-client">{m.client}</h3>
      <div className="mandate-focus">
        <SectorChip sector={m.focus} />
        <span className="mandate-range">{m.range}</span>
      </div>

      <div className="mandate-prog">
        <div className="mandate-prog-row">
          <span>Engagement progress</span><span className="strong">{m.progress}%</span>
        </div>
        <div className="prob-track"><div className="prob-fill" style={{ width: m.progress + '%' }} /></div>
      </div>

      <div className="mandate-foot">
        <div className="mandate-leadinfo">
          <Avatar leadId={m.lead} size={28} />
          <div>
            <div className="ml-name">{lead.name}</div>
            <div className="ml-sub">Mandate lead · since {m.since}</div>
          </div>
        </div>
        <div className="mandate-metrics">
          <div className="mm"><span className="mm-v">{m.deals}</span><span className="mm-k">deals</span></div>
          <div className="mm"><span className="mm-v">{m.fee}</span><span className="mm-k">est. fee</span></div>
        </div>
      </div>
    </article>
  );
}

export function MandatesView({ mandates }) {
  const all = mandates;
  const active = all.filter((m) => m.status === 'Active' || m.status === 'Closing').length;
  const totalDeals = all.reduce((s, m) => s + m.deals, 0);
  const buy = all.filter((m) => m.type === 'Buy-side').length;

  return (
    <div className="view">
      <div className="view-head">
        <div>
          <h1 className="view-title">Client mandates</h1>
          <p className="view-sub">{active} active engagements · {buy} buy-side, {all.length - buy} sell-side · {totalDeals} live deals across mandates.</p>
        </div>
        <div className="view-actions">
          <button className="btn ghost light">Export summary</button>
          <button className="btn primary"><svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>New mandate</button>
        </div>
      </div>

      <div className="mandate-grid">
        {all.map((m) => <MandateCard key={m.id} m={m} />)}
      </div>
    </div>
  );
}
