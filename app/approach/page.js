'use client';
import { useEffect, useState } from 'react';
import AdminShell from '../../components/AdminShell';
import { aGet, aPost, aPut, aDelete } from '../../lib/admin-api';

/* Two-column TR / EN field pair */
function BiField({ label, keyBase, vals, set, ta }) {
  return (
    <div className="a-g2" style={{ marginBottom: 14 }}>
      <div className="a-field">
        <div className="a-lbl">{label} (TR)</div>
        {ta
          ? <textarea className="a-ta" value={vals[`${keyBase}_tr`] || ''} onChange={set(`${keyBase}_tr`)} />
          : <input className="a-input" value={vals[`${keyBase}_tr`] || ''} onChange={set(`${keyBase}_tr`)} />}
      </div>
      <div className="a-field">
        <div className="a-lbl">{label} (EN)</div>
        {ta
          ? <textarea className="a-ta" value={vals[`${keyBase}_en`] || ''} onChange={set(`${keyBase}_en`)} />
          : <input className="a-input" value={vals[`${keyBase}_en`] || ''} onChange={set(`${keyBase}_en`)} />}
      </div>
    </div>
  );
}

function Toast({ msg, type }) {
  if (!msg) return null;
  return <div className={`a-toast ${type}`}>{msg}</div>;
}

/* ── Rules editor for a single pillar ── */
function RulesEditor({ value, onChange }) {
  let rules = [];
  try { rules = JSON.parse(value || '[]'); } catch { rules = []; }

  function update(i, field, v) {
    const next = rules.map((r, idx) => idx === i ? { ...r, [field]: v } : r);
    onChange(JSON.stringify(next));
  }
  function add() {
    onChange(JSON.stringify([...rules, { key: `§${String(rules.length + 1).padStart(2, '0')}`, value: '' }]));
  }
  function remove(i) {
    onChange(JSON.stringify(rules.filter((_, idx) => idx !== i)));
  }

  return (
    <div>
      {rules.map((r, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
          <input className="a-input" value={r.key} onChange={e => update(i, 'key', e.target.value)}
            style={{ width: 64, flexShrink: 0 }} placeholder="§01" />
          <input className="a-input" value={r.value} onChange={e => update(i, 'value', e.target.value)}
            style={{ flex: 1 }} placeholder="Kural metni…" />
          <button className="a-btn danger xs" onClick={() => remove(i)}>×</button>
        </div>
      ))}
      <button className="a-btn ghost sm" style={{ marginTop: 4 }} onClick={add}>+ Kural Ekle</button>
    </div>
  );
}

/* ── Pillar editor (expand/collapse) ── */
function PillarCard({ pillar, onSave, saving }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(pillar);

  useEffect(() => { setForm(pillar); }, [pillar]);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div className="a-card" style={{ padding: 0, overflow: 'hidden', marginBottom: 0 }}>
      <div
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', cursor: 'pointer', borderBottom: open ? '1px solid #f0ede8' : 'none' }}
        onClick={() => setOpen(o => !o)}
      >
        <div>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, opacity: .5, marginRight: 12 }}>{form.num}</span>
          <span style={{ fontFamily: 'var(--serif)', fontSize: 18 }}>{form.title_tr}</span>
          <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14, opacity: .5, marginLeft: 8 }}>{form.title_en}</span>
        </div>
        <span style={{ opacity: .4, fontSize: 12 }}>{open ? '▲' : '▼'}</span>
      </div>

      {open && (
        <div style={{ padding: '20px 20px 24px' }}>
          <div className="a-g4" style={{ marginBottom: 14 }}>
            <div className="a-field">
              <div className="a-lbl">Num</div>
              <input className="a-input" value={form.num} onChange={set('num')} placeholder="i" />
            </div>
            <div className="a-field">
              <div className="a-lbl">Etiket (TR)</div>
              <input className="a-input" value={form.label_tr} onChange={set('label_tr')} placeholder="Sabit · 01" />
            </div>
            <div className="a-field">
              <div className="a-lbl">Etiket (EN)</div>
              <input className="a-input" value={form.label_en} onChange={set('label_en')} placeholder="Constant · 01" />
            </div>
          </div>
          <div className="a-g2" style={{ marginBottom: 14 }}>
            <div className="a-field">
              <div className="a-lbl">Başlık (TR)</div>
              <input className="a-input" value={form.title_tr} onChange={set('title_tr')} />
            </div>
            <div className="a-field">
              <div className="a-lbl">Başlık (EN)</div>
              <input className="a-input" value={form.title_en} onChange={set('title_en')} />
            </div>
          </div>
          <div className="a-g2" style={{ marginBottom: 14 }}>
            <div className="a-field">
              <div className="a-lbl">Lede (TR)</div>
              <textarea className="a-ta" value={form.lede_tr} onChange={set('lede_tr')} />
            </div>
            <div className="a-field">
              <div className="a-lbl">Lede (EN)</div>
              <textarea className="a-ta" value={form.lede_en} onChange={set('lede_en')} />
            </div>
          </div>
          <div className="a-g2" style={{ marginBottom: 14 }}>
            <div className="a-field">
              <div className="a-lbl">Gövde (TR)</div>
              <textarea className="a-ta" value={form.body_tr} onChange={set('body_tr')} />
            </div>
            <div className="a-field">
              <div className="a-lbl">Gövde (EN)</div>
              <textarea className="a-ta" value={form.body_en} onChange={set('body_en')} />
            </div>
          </div>
          <div className="a-g2" style={{ marginBottom: 14 }}>
            <div className="a-field">
              <div className="a-lbl">Kurallar (TR)</div>
              <RulesEditor value={form.rules_tr} onChange={v => setForm(f => ({ ...f, rules_tr: v }))} />
            </div>
            <div className="a-field">
              <div className="a-lbl">Kurallar (EN)</div>
              <RulesEditor value={form.rules_en} onChange={v => setForm(f => ({ ...f, rules_en: v }))} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="a-btn sm" disabled={saving} onClick={() => onSave(form)}>
              {saving ? '…' : 'Kaydet'}
            </button>
            <button className="a-btn ghost sm" onClick={() => { setForm(pillar); setOpen(false); }}>İptal</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Stage editor row ── */
function StageRow({ stage, onSave, onDelete, saving }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(stage);
  useEffect(() => { setForm(stage); }, [stage]);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div style={{ borderBottom: '1px solid #f0ede8' }}>
      <div
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', cursor: 'pointer' }}
        onClick={() => setOpen(o => !o)}
      >
        <div>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, opacity: .5, marginRight: 10 }}>{form.num}</span>
          <span style={{ fontFamily: 'var(--serif)', fontSize: 16 }}>{form.title_tr}</span>
          <span style={{ fontFamily: 'var(--sans)', fontSize: 11, opacity: .5, marginLeft: 10 }}>~ {form.duration}</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {stage.id && <button className="a-btn danger xs" onClick={e => { e.stopPropagation(); onDelete(stage.id); }}>Sil</button>}
          <span style={{ opacity: .4, fontSize: 12 }}>{open ? '▲' : '▼'}</span>
        </div>
      </div>
      {open && (
        <div style={{ padding: '4px 20px 20px' }}>
          <div className="a-g4" style={{ marginBottom: 12 }}>
            <div className="a-field">
              <div className="a-lbl">No</div>
              <input className="a-input" value={form.num} onChange={set('num')} />
            </div>
            <div className="a-field">
              <div className="a-lbl">Süre</div>
              <input className="a-input" value={form.duration} onChange={set('duration')} placeholder="4–6 hafta" />
            </div>
            <div className="a-field">
              <div className="a-lbl">Başlık (TR)</div>
              <input className="a-input" value={form.title_tr} onChange={set('title_tr')} />
            </div>
            <div className="a-field">
              <div className="a-lbl">Başlık (EN)</div>
              <input className="a-input" value={form.title_en} onChange={set('title_en')} />
            </div>
          </div>
          <div className="a-g2" style={{ marginBottom: 12 }}>
            <div className="a-field">
              <div className="a-lbl">Açıklama (TR)</div>
              <textarea className="a-ta" value={form.description_tr} onChange={set('description_tr')} />
            </div>
            <div className="a-field">
              <div className="a-lbl">Açıklama (EN)</div>
              <textarea className="a-ta" value={form.description_en} onChange={set('description_en')} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="a-btn sm" disabled={saving} onClick={() => onSave(form)}>
              {saving ? '…' : 'Kaydet'}
            </button>
            <button className="a-btn ghost sm" onClick={() => { setForm(stage); setOpen(false); }}>İptal</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Principle row ── */
function PrincipleRow({ item, onSave, onDelete }) {
  const [form, setForm] = useState(item);
  useEffect(() => { setForm(item); }, [item]);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <tr>
      <td><input className="a-input" value={form.yes_tr} onChange={set('yes_tr')} /></td>
      <td><input className="a-input" value={form.yes_en} onChange={set('yes_en')} /></td>
      <td><input className="a-input" value={form.no_tr} onChange={set('no_tr')} /></td>
      <td><input className="a-input" value={form.no_en} onChange={set('no_en')} /></td>
      <td className="td-act" style={{ whiteSpace: 'nowrap' }}>
        <button className="a-btn ghost sm" onClick={() => onSave(form)}>Kaydet</button>
        {' '}
        {item.id && <button className="a-btn danger sm" onClick={() => onDelete(item.id)}>Sil</button>}
      </td>
    </tr>
  );
}

/* ── Material row ── */
function MaterialRow({ item, onSave, onDelete }) {
  const [form, setForm] = useState(item);
  useEffect(() => { setForm(item); }, [item]);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <tr>
      <td>
        <div style={{ width: 36, height: 36, borderRadius: 4, background: form.bg_gradient || '#e8e4de', border: '1px solid #e8e4de', flexShrink: 0 }} />
      </td>
      <td><input className="a-input" value={form.name_tr} onChange={set('name_tr')} /></td>
      <td><input className="a-input" value={form.name_en} onChange={set('name_en')} /></td>
      <td><input className="a-input" value={form.subtitle} onChange={set('subtitle')} /></td>
      <td>
        <input className="a-input" value={form.bg_gradient} onChange={set('bg_gradient')} placeholder="linear-gradient(…)" style={{ fontFamily: 'var(--mono)', fontSize: 11 }} />
      </td>
      <td><input className="a-input" value={form.caption} onChange={set('caption')} /></td>
      <td className="td-act" style={{ whiteSpace: 'nowrap' }}>
        <button className="a-btn ghost sm" onClick={() => onSave(form)}>Kaydet</button>
        {' '}
        {item.id && <button className="a-btn danger sm" onClick={() => onDelete(item.id)}>Sil</button>}
      </td>
    </tr>
  );
}

const EMPTY_STAGE = { num: '', title_tr: '', title_en: '', duration: '', description_tr: '', description_en: '', sort_order: 0 };
const EMPTY_PRINCIPLE = { yes_tr: '', yes_en: '', no_tr: '', no_en: '', sort_order: 0 };
const EMPTY_MATERIAL = { name_tr: '', name_en: '', subtitle: '', bg_gradient: '', caption: '', sort_order: 0 };

export default function ApproachAdminPage() {
  const [data, setData] = useState({ settings: {}, pillars: [], stages: [], principles: [], materials: [] });
  const [svals, setSvals] = useState({});
  const [saving, setSaving] = useState(null);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    aGet('/api/admin/approach').then(setData).catch(() => {});
    aGet('/api/admin/settings').then(setSvals).catch(() => {});
  }, []);

  const setS = (key) => (e) => setSvals(v => ({ ...v, [key]: e.target.value }));

  async function saveSettings() {
    setSettingsSaving(true);
    try {
      await aPut('/api/admin/settings', svals);
      showToast('Sayfa metinleri kaydedildi.');
    } catch (e) { showToast(e.message, 'err'); }
    finally { setSettingsSaving(false); }
  }

  function showToast(msg, type = 'ok') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  /* --- Pillars --- */
  async function savePillar(form) {
    setSaving(`pillar-${form.id}`);
    try {
      const r = await aPut(`/api/admin/approach/pillars/${form.id}`, form);
      setData(d => ({ ...d, pillars: d.pillars.map(p => p.id === r.id ? r : p) }));
      showToast('Sabit kaydedildi.');
    } catch (e) { showToast(e.message, 'err'); }
    finally { setSaving(null); }
  }

  /* --- Stages --- */
  async function saveStage(form) {
    setSaving(`stage-${form.id || 'new'}`);
    try {
      if (form.id) {
        const r = await aPut(`/api/admin/approach/stages/${form.id}`, form);
        setData(d => ({ ...d, stages: d.stages.map(s => s.id === r.id ? r : s) }));
      } else {
        const r = await aPost('/api/admin/approach/stages', form);
        setData(d => ({ ...d, stages: [...d.stages.filter(s => !s._new), r] }));
      }
      showToast('Aşama kaydedildi.');
    } catch (e) { showToast(e.message, 'err'); }
    finally { setSaving(null); }
  }

  async function deleteStage(id) {
    if (!confirm('Bu aşamayı silmek istediğinize emin misiniz?')) return;
    await aDelete(`/api/admin/approach/stages/${id}`).catch(() => {});
    setData(d => ({ ...d, stages: d.stages.filter(s => s.id !== id) }));
    showToast('Aşama silindi.');
  }

  /* --- Principles --- */
  async function savePrinciple(form) {
    setSaving(`principle-${form.id || 'new'}`);
    try {
      if (form.id) {
        const r = await aPut(`/api/admin/approach/principles/${form.id}`, form);
        setData(d => ({ ...d, principles: d.principles.map(p => p.id === r.id ? r : p) }));
      } else {
        const r = await aPost('/api/admin/approach/principles', form);
        setData(d => ({ ...d, principles: [...d.principles.filter(p => !p._new), r] }));
      }
      showToast('İlke kaydedildi.');
    } catch (e) { showToast(e.message, 'err'); }
    finally { setSaving(null); }
  }

  async function deletePrinciple(id) {
    if (!confirm('Silmek istediğinize emin misiniz?')) return;
    await aDelete(`/api/admin/approach/principles/${id}`).catch(() => {});
    setData(d => ({ ...d, principles: d.principles.filter(p => p.id !== id) }));
    showToast('Silindi.');
  }

  /* --- Materials --- */
  async function saveMaterial(form) {
    setSaving(`mat-${form.id || 'new'}`);
    try {
      if (form.id) {
        const r = await aPut(`/api/admin/approach/materials/${form.id}`, form);
        setData(d => ({ ...d, materials: d.materials.map(m => m.id === r.id ? r : m) }));
      } else {
        const r = await aPost('/api/admin/approach/materials', form);
        setData(d => ({ ...d, materials: [...d.materials.filter(m => !m._new), r] }));
      }
      showToast('Malzeme kaydedildi.');
    } catch (e) { showToast(e.message, 'err'); }
    finally { setSaving(null); }
  }

  async function deleteMaterial(id) {
    if (!confirm('Silmek istediğinize emin misiniz?')) return;
    await aDelete(`/api/admin/approach/materials/${id}`).catch(() => {});
    setData(d => ({ ...d, materials: d.materials.filter(m => m.id !== id) }));
    showToast('Silindi.');
  }

  return (
    <AdminShell
      title="Yaklaşım Sayfası"
      actions={
        <a href={`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/approach`} target="_blank" className="a-btn ghost">Sayfayı Önizle ↗</a>
      }
    >

      {/* ── SAYFA METİNLERİ ── */}
      <div className="a-card" style={{ marginBottom: 24 }}>
        <div className="a-card-hd">Sayfa Metinleri</div>
        <BiField label="Hero üst metin (lede)" keyBase="approach_hero_lede" vals={svals} set={setS} ta />
        <BiField label="Hero alt metin (body)" keyBase="approach_hero_body" vals={svals} set={setS} ta />
        <BiField label="Manifesto alıntısı" keyBase="approach_manifesto" vals={svals} set={setS} />
        <div className="a-field" style={{ marginBottom: 14 }}>
          <div className="a-lbl">Süreç toplam süresi</div>
          <input className="a-input" style={{ maxWidth: 200 }} value={svals.approach_process_duration || ''} onChange={setS('approach_process_duration')} placeholder="14–20 hafta" />
        </div>
        <BiField label="CTA başlık" keyBase="approach_cta_title" vals={svals} set={setS} />
        <BiField label="CTA paragraf" keyBase="approach_cta_body" vals={svals} set={setS} ta />
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="a-btn" onClick={saveSettings} disabled={settingsSaving}>
            {settingsSaving ? 'Kaydediliyor…' : 'Metinleri Kaydet'}
          </button>
        </div>
      </div>

      {/* ── PILLARS ── */}
      <div className="a-card-hd" style={{ marginBottom: 12 }}>Sabitler <span style={{ fontFamily: 'var(--mono)', fontSize: 11, opacity: .45 }}>— Üç Sabit</span></div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 32 }}>
        {data.pillars.map(p => (
          <PillarCard key={p.id} pillar={p} onSave={savePillar} saving={saving === `pillar-${p.id}`} />
        ))}
      </div>

      {/* ── PROCESS STAGES ── */}
      <div className="a-card-hd" style={{ marginBottom: 12 }}>Süreç Aşamaları <span style={{ fontFamily: 'var(--mono)', fontSize: 11, opacity: .45 }}>— Beş Aşama</span></div>
      <div className="a-card" style={{ padding: 0, overflow: 'hidden', marginBottom: 32 }}>
        {data.stages.map(s => (
          <StageRow
            key={s.id || s._new}
            stage={s}
            onSave={saveStage}
            onDelete={deleteStage}
            saving={saving === `stage-${s.id || 'new'}`}
          />
        ))}
        <div style={{ padding: '12px 20px', borderTop: data.stages.length ? '1px solid #f0ede8' : 'none' }}>
          <button className="a-btn ghost sm" onClick={() => setData(d => ({ ...d, stages: [...d.stages, { ...EMPTY_STAGE, _new: Date.now(), sort_order: d.stages.length * 10 + 10 }] }))}>
            + Aşama Ekle
          </button>
        </div>
      </div>

      {/* ── PRINCIPLES ── */}
      <div className="a-card-hd" style={{ marginBottom: 12 }}>İlkeler <span style={{ fontFamily: 'var(--mono)', fontSize: 11, opacity: .45 }}>— Tuttuğumuz / Bıraktığımız</span></div>
      <div className="a-card" style={{ padding: 0, overflow: 'hidden', marginBottom: 32 }}>
        <table className="a-table">
          <thead>
            <tr>
              <th>Tuttuğumuz (TR)</th>
              <th>Tuttuğumuz (EN)</th>
              <th>Bıraktığımız (TR)</th>
              <th>Bıraktığımız (EN)</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.principles.map(p => (
              <PrincipleRow key={p.id || p._new} item={p} onSave={savePrinciple} onDelete={deletePrinciple} />
            ))}
          </tbody>
        </table>
        <div style={{ padding: '12px 20px', borderTop: '1px solid #f0ede8' }}>
          <button className="a-btn ghost sm" onClick={() => setData(d => ({ ...d, principles: [...d.principles, { ...EMPTY_PRINCIPLE, _new: Date.now(), sort_order: d.principles.length * 10 + 10 }] }))}>
            + İlke Ekle
          </button>
        </div>
      </div>

      {/* ── MATERIALS ── */}
      <div className="a-card-hd" style={{ marginBottom: 12 }}>Malzeme Kütüphanesi <span style={{ fontFamily: 'var(--mono)', fontSize: 11, opacity: .45 }}>— bg_gradient CSS değeri</span></div>
      <div className="a-card" style={{ padding: 0, overflow: 'hidden', marginBottom: 32 }}>
        <table className="a-table">
          <thead>
            <tr>
              <th>Önizleme</th>
              <th>İsim (TR)</th>
              <th>İsim (EN)</th>
              <th>Alt Başlık</th>
              <th>Gradient</th>
              <th>Açıklama</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.materials.map(m => (
              <MaterialRow key={m.id || m._new} item={m} onSave={saveMaterial} onDelete={deleteMaterial} />
            ))}
          </tbody>
        </table>
        <div style={{ padding: '12px 20px', borderTop: '1px solid #f0ede8' }}>
          <button className="a-btn ghost sm" onClick={() => setData(d => ({ ...d, materials: [...d.materials, { ...EMPTY_MATERIAL, _new: Date.now(), sort_order: d.materials.length * 10 + 10 }] }))}>
            + Malzeme Ekle
          </button>
        </div>
      </div>

      {toast && <Toast {...toast} />}
    </AdminShell>
  );
}
