import { fmtEur } from '../lib/format';
import { DealCard } from './primitives';

export function Column({
  stage, deals, accent, showVal, density, cardStyle, dragId, dragOverStage,
  onOpen, onDragStartCard, onDragEndCard, onDropStage, onDragOverStage, onDragLeaveStage, onNewInStage,
}) {
  const total = deals.reduce((s, d) => s + d.size, 0);
  const isOver = dragOverStage === stage.id && dragId;
  return (
    <section
      className={'column' + (isOver ? ' over' : '')}
      onDragOver={(e) => { e.preventDefault(); onDragOverStage(stage.id); }}
      onDragLeave={(e) => { if (e.currentTarget === e.target) onDragLeaveStage(); }}
      onDrop={(e) => { e.preventDefault(); onDropStage(stage.id); }}
    >
      <header className="col-head">
        <div className="col-title">
          <span className="col-name">{stage.name}</span>
          <span className="col-count">{deals.length}</span>
        </div>
        {showVal && <div className="col-value">{fmtEur(total)}</div>}
        <div className="col-bar"><div className="col-bar-fill" style={{ background: accent }} /></div>
      </header>

      <div className={'col-list ' + density}>
        {deals.map((d) => (
          <DealCard
            key={d.id}
            deal={d}
            variant={cardStyle}
            dragging={dragId === d.id}
            onOpen={onOpen}
            onDragStart={onDragStartCard}
            onDragEnd={onDragEndCard}
          />
        ))}
        {deals.length === 0 && <div className="col-empty">Drop a deal here</div>}
        <button className="col-add" onClick={() => onNewInStage(stage.id)}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg>
          Add deal
        </button>
      </div>
    </section>
  );
}
