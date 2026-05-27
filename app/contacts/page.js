'use client';
import React, { useEffect, useState } from 'react';
import AdminShell from '../../components/AdminShell';
import { aGet, aPut, aDelete } from '../../lib/admin-api';

function Toast({ msg, type }) {
  if (!msg) return null;
  return <div className={`a-toast ${type}`}>{msg}</div>;
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [open, setOpen] = useState(null);
  const [filter, setFilter] = useState('all');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    aGet('/api/admin/contacts').then(setContacts).catch(() => {});
  }, []);

  async function markRead(id) {
    await aPut(`/api/admin/contacts/${id}/read`).catch(() => {});
    setContacts(c => c.map(m => m.id === id ? { ...m, read: 1 } : m));
  }

  async function handleDelete(id) {
    if (!confirm('Bu mesajı silmek istediğinize emin misiniz?')) return;
    await aDelete(`/api/admin/contacts/${id}`).catch(() => {});
    setContacts(c => c.filter(m => m.id !== id));
    if (open === id) setOpen(null);
  }

  function openMsg(id) {
    setOpen(open === id ? null : id);
    const c = contacts.find(m => m.id === id);
    if (c && !c.read) markRead(id);
  }

  const filtered = filter === 'unread'
    ? contacts.filter(c => !c.read)
    : contacts;

  const unreadCount = contacts.filter(c => !c.read).length;

  const TYPE_LABELS = {
    residential: 'Konut', workspace: 'Çalışma', hospitality: 'Konaklama',
    cultural: 'Kamusal', other: 'Diğer',
  };
  const SCOPE_LABELS = { concept: 'Kavram', design: 'Tasarım', full: 'Tam Süreç' };
  const TIMELINE_LABELS = { now: 'Şimdi', q2: '3 Ay', q4: '6+ Ay', flex: 'Esnek' };

  return (
    <AdminShell
      title="Mesajlar"
      actions={
        <div style={{ display: 'flex', gap: 8 }}>
          <button className={`a-btn sm ${filter === 'all' ? '' : 'ghost'}`} onClick={() => setFilter('all')}>
            Tümü ({contacts.length})
          </button>
          <button className={`a-btn sm ${filter === 'unread' ? '' : 'ghost'}`} onClick={() => setFilter('unread')}>
            Okunmamış ({unreadCount})
          </button>
        </div>
      }
    >
      <div className="a-card" style={{ padding: 0, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div className="a-empty">Mesaj yok.</div>
        ) : (
          <table className="a-table">
            <thead>
              <tr>
                <th>Tarih</th>
                <th>İsim</th>
                <th>E-posta</th>
                <th>Proje Türü</th>
                <th>Durum</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <React.Fragment key={c.id}>
                  <tr className={`a-msg-row ${!c.read ? 'unread' : ''}`} onClick={() => openMsg(c.id)}>
                    <td className="td-num">{c.created_at?.slice(0, 10)}</td>
                    <td>{c.name}</td>
                    <td style={{ opacity: .7 }}>{c.email}</td>
                    <td>{TYPE_LABELS[c.project_type] || c.project_type || '—'}</td>
                    <td>
                      {c.read
                        ? <span className="a-pill draft">Okundu</span>
                        : <span className="a-pill pub">Yeni</span>}
                    </td>
                    <td className="td-act" onClick={e => e.stopPropagation()}>
                      <button className="a-btn danger xs" onClick={() => handleDelete(c.id)}>Sil</button>
                    </td>
                  </tr>
                  {open === c.id && (
                    <tr key={`${c.id}-body`}>
                      <td colSpan={6} style={{ background: '#fafaf8', padding: '16px 20px 20px' }}>
                        <div className="a-msg-meta">
                          {c.phone && <span className="a-msg-meta-item"><strong>Tel:</strong> {c.phone}</span>}
                          {c.company && <span className="a-msg-meta-item"><strong>Şirket:</strong> {c.company}</span>}
                          {c.location && <span className="a-msg-meta-item"><strong>Konum:</strong> {c.location}</span>}
                          {c.area && <span className="a-msg-meta-item"><strong>Alan:</strong> {c.area} m²</span>}
                          {c.scope && <span className="a-msg-meta-item"><strong>Kapsam:</strong> {SCOPE_LABELS[c.scope] || c.scope}</span>}
                          {c.timeline && <span className="a-msg-meta-item"><strong>Zaman:</strong> {TIMELINE_LABELS[c.timeline] || c.timeline}</span>}
                        </div>
                        <div className="a-msg-body">{c.message || '(Mesaj içeriği yok)'}</div>
                        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                          <a href={`mailto:${c.email}`} className="a-btn sm">E-posta Gönder →</a>
                          {!c.read && (
                            <button className="a-btn ghost sm" onClick={() => markRead(c.id)}>Okundu İşaretle</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {toast && <Toast {...toast} />}
    </AdminShell>
  );
}
