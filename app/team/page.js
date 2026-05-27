'use client';
export const runtime = 'edge';
import { useEffect, useState } from 'react';
import AdminShell from '../../components/AdminShell';
import { aGet, aPost, aPut, aDelete, aUpload } from '../../lib/admin-api';

const EMPTY = { name: '', role_tr: '', role_en: '', avatar: null, sort_order: 0 };

function Toast({ msg, type }) {
  if (!msg) return null;
  return <div className={`a-toast ${type}`}>{msg}</div>;
}

function MemberForm({ data, onChange, onSave, onCancel, saving }) {
  const set = (k) => (e) => onChange({ ...data, [k]: e.target.value });

  async function handleAvatar(e) {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const { url } = await aUpload(file);
      onChange({ ...data, avatar: url });
    } catch {}
  }

  return (
    <div className="a-card">
      <div className="a-g2">
        <div className="a-field">
          <div className="a-lbl">İsim<span className="req"> ·</span></div>
          <input className="a-input" value={data.name} onChange={set('name')} placeholder="Eda Aksel" />
        </div>
        <div className="a-field">
          <div className="a-lbl">Sıralama</div>
          <input className="a-input" type="number" value={data.sort_order} onChange={set('sort_order')} />
        </div>
        <div className="a-field">
          <div className="a-lbl">Rol (TR)</div>
          <input className="a-input" value={data.role_tr} onChange={set('role_tr')} placeholder="Kurucu Ortak · Mimar" />
        </div>
        <div className="a-field">
          <div className="a-lbl">Rol (EN)</div>
          <input className="a-input" value={data.role_en} onChange={set('role_en')} placeholder="Founding Partner · Architect" />
        </div>
      </div>
      <div className="a-field" style={{ marginTop: 14 }}>
        <div className="a-lbl">Avatar</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {data.avatar && <img src={data.avatar} alt="" style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', border: '1px solid #e8e4de' }} />}
          <label className="a-btn ghost sm" style={{ cursor: 'pointer' }}>
            {data.avatar ? 'Değiştir' : 'Yükle'}
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatar} />
          </label>
          {data.avatar && <button className="a-btn ghost sm" onClick={() => onChange({ ...data, avatar: null })}>Kaldır</button>}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button className="a-btn" onClick={onSave} disabled={saving}>{saving ? 'Kaydediliyor…' : 'Kaydet'}</button>
        <button className="a-btn ghost" onClick={onCancel}>İptal</button>
      </div>
    </div>
  );
}

export default function TeamPage() {
  const [members, setMembers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => { aGet('/api/admin/team').then(setMembers).catch(() => {}); }, []);

  function showToast(msg, type = 'ok') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (editing === 'new') {
        const m = await aPost('/api/admin/team', form);
        setMembers(prev => [...prev, m]);
      } else {
        const m = await aPut(`/api/admin/team/${editing}`, form);
        setMembers(prev => prev.map(x => x.id === editing ? m : x));
      }
      setEditing(null);
      showToast('Kaydedildi.');
    } catch (e) { showToast(e.message, 'err'); }
    finally { setSaving(false); }
  }

  async function handleDelete(id) {
    if (!confirm('Bu üyeyi silmek istediğinize emin misiniz?')) return;
    await aDelete(`/api/admin/team/${id}`).catch(() => {});
    setMembers(prev => prev.filter(m => m.id !== id));
    showToast('Silindi.');
  }

  return (
    <AdminShell
      title="Ekip"
      actions={
        <button className="a-btn" onClick={() => { setForm(EMPTY); setEditing('new'); }}>+ Üye Ekle</button>
      }
    >
      {editing === 'new' && (
        <MemberForm data={form} onChange={setForm} onSave={handleSave} onCancel={() => setEditing(null)} saving={saving} />
      )}

      <div className="a-card" style={{ padding: 0, overflow: 'hidden' }}>
        {members.length === 0 ? (
          <div className="a-empty">Ekip üyesi yok.</div>
        ) : (
          <table className="a-table">
            <thead>
              <tr>
                <th>Avatar</th>
                <th>İsim</th>
                <th>Rol (TR)</th>
                <th>Rol (EN)</th>
                <th>Sıra</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {members.sort((a, b) => a.sort_order - b.sort_order).map(m => (
                editing === m.id ? (
                  <tr key={m.id}>
                    <td colSpan={6} style={{ padding: 0 }}>
                      <div style={{ padding: 16 }}>
                        <MemberForm data={form} onChange={setForm} onSave={handleSave} onCancel={() => setEditing(null)} saving={saving} />
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={m.id}>
                    <td>
                      {m.avatar
                        ? <img src={m.avatar} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                        : <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#f0ede8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#999' }}>{m.name?.charAt(0)}</div>}
                    </td>
                    <td><strong>{m.name}</strong></td>
                    <td>{m.role_tr}</td>
                    <td style={{ opacity: .65 }}>{m.role_en}</td>
                    <td className="td-num">{m.sort_order}</td>
                    <td className="td-act">
                      <button className="a-btn ghost sm" onClick={() => { setForm({ ...m }); setEditing(m.id); }}>Düzenle</button>
                      {' '}
                      <button className="a-btn danger sm" onClick={() => handleDelete(m.id)}>Sil</button>
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
