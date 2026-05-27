'use client';
export const runtime = 'edge';
import { useEffect, useState } from 'react';
import AdminShell from '../../components/AdminShell';
import { aGet, aPost, aPut, aDelete } from '../../lib/admin-api';

const EMPTY = { year: new Date().getFullYear(), project_name: '', source: '', note: '', sort_order: 0 };

function Toast({ msg, type }) {
  if (!msg) return null;
  return <div className={`a-toast ${type}`}>{msg}</div>;
}

function PressForm({ data, onChange, onSave, onCancel, saving }) {
  const set = (k) => (e) => onChange({ ...data, [k]: e.target.value });
  return (
    <div style={{ padding: '14px 0' }}>
      <div className="a-g4" style={{ marginBottom: 10 }}>
        <div className="a-field">
          <div className="a-lbl">Yıl</div>
          <input className="a-input" type="number" value={data.year} onChange={set('year')} />
        </div>
        <div className="a-field">
          <div className="a-lbl">Proje Adı</div>
          <input className="a-input" value={data.project_name} onChange={set('project_name')} placeholder="Karaköy Apartmanı" />
        </div>
        <div className="a-field">
          <div className="a-lbl">Kaynak</div>
          <input className="a-input" value={data.source} onChange={set('source')} placeholder="Architectural Digest · Türkiye" />
        </div>
        <div className="a-field">
          <div className="a-lbl">Not</div>
          <input className="a-input" value={data.note} onChange={set('note')} placeholder="Cover · Mayıs" />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="a-btn sm" onClick={onSave} disabled={saving}>{saving ? '…' : 'Kaydet'}</button>
        <button className="a-btn ghost sm" onClick={onCancel}>İptal</button>
      </div>
    </div>
  );
}

export default function PressPage() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => { aGet('/api/admin/press').then(setItems).catch(() => {}); }, []);

  function showToast(msg, type = 'ok') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (editing === 'new') {
        const p = await aPost('/api/admin/press', form);
        setItems(prev => [...prev, p].sort((a, b) => a.sort_order - b.sort_order));
      } else {
        const p = await aPut(`/api/admin/press/${editing}`, form);
        setItems(prev => prev.map(x => x.id === editing ? p : x));
      }
      setEditing(null);
      showToast('Kaydedildi.');
    } catch (e) { showToast(e.message, 'err'); }
    finally { setSaving(false); }
  }

  async function handleDelete(id) {
    if (!confirm('Silmek istediğinize emin misiniz?')) return;
    await aDelete(`/api/admin/press/${id}`).catch(() => {});
    setItems(prev => prev.filter(x => x.id !== id));
    showToast('Silindi.');
  }

  return (
    <AdminShell
      title="Basın & Tanınma"
      actions={<button className="a-btn" onClick={() => { setForm(EMPTY); setEditing('new'); }}>+ Ekle</button>}
    >
      <div className="a-card" style={{ padding: 0, overflow: 'hidden' }}>
        {editing === 'new' && (
          <div style={{ padding: '4px 20px 0', borderBottom: '1px solid #f0ede8' }}>
            <PressForm data={form} onChange={setForm} onSave={handleSave} onCancel={() => setEditing(null)} saving={saving} />
          </div>
        )}
        {items.length === 0 && editing !== 'new'
          ? <div className="a-empty">Henüz basın kaydı yok.</div>
          : (
            <table className="a-table">
              <thead>
                <tr><th>Yıl</th><th>Proje</th><th>Kaynak</th><th>Not</th><th></th></tr>
              </thead>
              <tbody>
                {items.map(p => (
                  editing === p.id ? (
                    <tr key={p.id}>
                      <td colSpan={5} style={{ padding: '4px 12px 0' }}>
                        <PressForm data={form} onChange={setForm} onSave={handleSave} onCancel={() => setEditing(null)} saving={saving} />
                      </td>
                    </tr>
                  ) : (
                    <tr key={p.id}>
                      <td className="td-num">{p.year}</td>
                      <td><strong>{p.project_name}</strong></td>
                      <td>{p.source}</td>
                      <td style={{ opacity: .65, fontStyle: 'italic' }}>{p.note}</td>
                      <td className="td-act">
                        <button className="a-btn ghost sm" onClick={() => { setForm({ ...p }); setEditing(p.id); }}>Düzenle</button>
                        {' '}
                        <button className="a-btn danger sm" onClick={() => handleDelete(p.id)}>Sil</button>
                      </td>
                    </tr>
                  )
                ))}
              </tbody>
            </table>
          )}
      </div>
      {toast && <Toast {...toast} />}
    </AdminShell>
  );
}
