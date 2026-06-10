import { useState } from 'react';
import { useRefData } from '../lib/refData';

export function NewDeal({ onClose, onCreate, initialStage = 'sourcing' }) {
  const { stages, sectors, leads } = useRefData();
  const [form, setForm] = useState({
    name: '', sector: 'Technology', size: '', stage: initialStage, lead: 'ml', prob: 20, priority: false, next: '', due: '',
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const valid = form.name.trim() && Number(form.size) > 0;
  const sectorNames = Object.keys(sectors);

  return (
    <div className="overlay center" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <header className="modal-head">
          <h3>New deal</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </button>
        </header>

        <div className="modal-body">
          <label className="field">
            <span>Target company</span>
            <input autoFocus value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Helvar Robotics" />
          </label>

          <div className="field-row">
            <label className="field">
              <span>Sector</span>
              <select value={form.sector} onChange={(e) => set('sector', e.target.value)}>
                {sectorNames.map((s) => <option key={s}>{s}</option>)}
              </select>
            </label>
            <label className="field sz">
              <span>Deal size (€M)</span>
              <input type="number" min="1" value={form.size} onChange={(e) => set('size', e.target.value)} placeholder="25" />
            </label>
          </div>

          <div className="field-row">
            <label className="field">
              <span>Stage</span>
              <select value={form.stage} onChange={(e) => set('stage', e.target.value)}>
                {stages.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </label>
            <label className="field">
              <span>Deal lead</span>
              <select value={form.lead} onChange={(e) => set('lead', e.target.value)}>
                {leads.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </label>
          </div>

          <div className="field-row">
            <label className="field">
              <span>Probability — {form.prob}%</span>
              <input type="range" min="0" max="100" step="5" value={form.prob} onChange={(e) => set('prob', Number(e.target.value))} />
            </label>
            <label className="field check">
              <input type="checkbox" checked={form.priority} onChange={(e) => set('priority', e.target.checked)} />
              <span>High priority</span>
            </label>
          </div>
        </div>

        <footer className="modal-foot">
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn primary" disabled={!valid} onClick={() => onCreate({
            ...form, size: Number(form.size), days: 0, next: form.next || 'Set next action', due: form.due || 'TBD',
          })}>Create deal</button>
        </footer>
      </div>
    </div>
  );
}
