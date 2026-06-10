import { fmtEur } from '../lib/format';
import { useLeadById, useRefData } from '../lib/refData';
import { Avatar, ProbBar, SectorChip } from './primitives';

export function DealDetail({ deal, stageName, onClose, onAdvance, canAdvance }) {
  const leadById = useLeadById();
  const { stages } = useRefData();
  if (!deal) return null;
  const lead = leadById(deal.lead);
  return (
    <div className="overlay" onMouseDown={onClose}>
      <aside className="detail" onMouseDown={(e) => e.stopPropagation()}>
        <header className="detail-head">
          <div className="detail-stage">
            <span className="stage-pip" />
            {stageName}
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </button>
        </header>

        <div className="detail-body">
          <h2 className="detail-title">{deal.name}</h2>
          <div className="detail-subrow">
            <SectorChip sector={deal.sector} />
            {deal.priority && <span className="prio-tag">High priority</span>}
          </div>

          <div className="detail-size">{fmtEur(deal.size)}<span>enterprise value</span></div>

          <div className="stat-grid">
            <div className="stat">
              <div className="stat-k">Probability</div>
              <div className="stat-v">{deal.prob}%</div>
              <ProbBar value={deal.prob} compact />
            </div>
            <div className="stat">
              <div className="stat-k">Days in stage</div>
              <div className="stat-v">{deal.days}</div>
            </div>
            <div className="stat">
              <div className="stat-k">Deal lead</div>
              <div className="stat-lead"><Avatar leadId={deal.lead} size={24} /><span>{lead.name}</span></div>
            </div>
            <div className="stat">
              <div className="stat-k">Next action</div>
              <div className="stat-v sm">{deal.next || '—'}</div>
              <div className="stat-due">Due {deal.due || '—'}</div>
            </div>
          </div>

          {deal.note && (
            <div className="detail-note">
              <div className="note-k">Deal notes</div>
              <p>{deal.note}</p>
            </div>
          )}

          <div className="timeline">
            <div className="tl-k">Stage progression</div>
            <ol>
              {stages.map((s) => {
                const idx = stages.findIndex((x) => x.id === deal.stage);
                const here = stages.findIndex((x) => x.id === s.id);
                const state = here < idx ? 'done' : here === idx ? 'current' : 'future';
                return (
                  <li key={s.id} className={'tl ' + state}>
                    <span className="tl-dot" />
                    {s.name}
                  </li>
                );
              })}
            </ol>
          </div>
        </div>

        <footer className="detail-foot">
          <button className="btn ghost" onClick={onClose}>Close</button>
          <button className="btn primary" disabled={!canAdvance} onClick={() => onAdvance(deal)}>
            {canAdvance ? 'Advance stage' : 'Final stage'}
          </button>
        </footer>
      </aside>
    </div>
  );
}
