import { fmtEur } from '../lib/format';
import { useLeadById, useSectorColor } from '../lib/refData';

/* ---------- Avatar ---------- */
export function Avatar({ leadId, size = 26 }) {
  const leadById = useLeadById();
  const lead = leadById(leadId);
  const h = lead.hue != null ? lead.hue : 215;
  return (
    <div
      title={lead.name}
      className="avatar"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        fontSize: size * 0.4,
        fontWeight: 600,
        color: '#fff',
        background: `linear-gradient(160deg, hsl(${h} 34% 42%), hsl(${h} 38% 30%))`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: '0 0 auto',
        letterSpacing: '0.02em',
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.12)',
      }}
    >
      {lead.initials}
    </div>
  );
}

/* ---------- Probability meter ---------- */
export function ProbBar({ value, compact }) {
  return (
    <div className="prob" style={{ marginTop: compact ? 0 : 2 }}>
      <div className="prob-track">
        <div className="prob-fill" style={{ width: value + '%' }} />
      </div>
      <span className="prob-label">{value}%</span>
    </div>
  );
}

/* ---------- Sector chip ---------- */
export function SectorChip({ sector }) {
  const sectorColor = useSectorColor();
  const c = sectorColor(sector);
  return (
    <span className="sector-chip">
      <span className="sector-dot" style={{ background: c }} />
      {sector}
    </span>
  );
}

/* ---------- Days badge ---------- */
export function DaysBadge({ days }) {
  const hot = days >= 30;
  const warm = days >= 18 && days < 30;
  const cls = hot ? 'days hot' : warm ? 'days warm' : 'days';
  return (
    <span className={cls} title={days + ' days in this stage'}>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="13" r="8" stroke="currentColor" strokeWidth="2" />
        <path d="M12 9v4l2.5 2.5M9 3h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      {days}d
    </span>
  );
}

/* ---------- Deal card ---------- */
export function DealCard({ deal, variant, onOpen, onDragStart, onDragEnd, dragging }) {
  const cls = ['deal-card', 'v-' + variant, dragging ? 'is-dragging' : ''].join(' ').trim();

  return (
    <article
      className={cls}
      draggable
      onClick={() => onOpen(deal)}
      onDragStart={(e) => onDragStart(e, deal)}
      onDragEnd={onDragEnd}
    >
      {deal.priority && <span className="priority-rail" title="High priority" />}

      <div className="card-top">
        <h4 className="company">{deal.name}</h4>
        {deal.priority && (
          <svg className="flag" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 3v18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M5 4h12l-2.5 4L17 12H5" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
          </svg>
        )}
      </div>

      <SectorChip sector={deal.sector} />

      <div className="size">{fmtEur(deal.size)}</div>

      {variant !== 'compact' && <ProbBar value={deal.prob} />}

      <div className="card-foot">
        <Avatar leadId={deal.lead} size={variant === 'compact' ? 22 : 26} />
        <DaysBadge days={deal.days} />
        {variant === 'detailed' && (
          <span className="next" title={'Next: ' + deal.next}>
            <span className="next-label">{deal.next}</span>
            <span className="next-due">{deal.due}</span>
          </span>
        )}
      </div>
    </article>
  );
}
