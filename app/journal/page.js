'use client';
import { useEffect, useState } from 'react';
import AdminShell from '../../components/AdminShell';
import Link from 'next/link';
import { aGet, aDelete } from '../../lib/admin-api';

function Toast({ msg, type }) {
  if (!msg) return null;
  return <div className={`a-toast ${type}`}>{msg}</div>;
}

const KIND_LABELS = { Essay: 'Essay', 'Field Note': 'Alan Notu', Konuşma: 'Konuşma', Book: 'Kitap' };
const KIND_COLORS = { Essay: '#0c0c0c', 'Field Note': '#946800', Konuşma: '#1a7f37', Book: '#5b3ea6' };

export default function JournalListPage() {
  const [posts, setPosts] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => { aGet('/api/admin/journal').then(setPosts).catch(() => {}); }, []);

  function showToast(msg, type = 'ok') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleDelete(id, e) {
    e.preventDefault();
    if (!confirm('Bu yazıyı silmek istediğinize emin misiniz?')) return;
    await aDelete(`/api/admin/journal/${id}`).catch(() => {});
    setPosts(prev => prev.filter(p => p.id !== id));
    showToast('Yazı silindi.');
  }

  return (
    <AdminShell
      title="Günce Yazıları"
      actions={<Link href="/journal/new" className="a-btn">+ Yeni Yazı</Link>}
    >
      <div className="a-card" style={{ padding: 0, overflow: 'hidden' }}>
        {posts.length === 0
          ? <div className="a-empty">Henüz yazı yok. İlk yazıyı ekleyin.</div>
          : (
            <table className="a-table">
              <thead>
                <tr>
                  <th>Tür</th>
                  <th>Başlık</th>
                  <th>Yazar</th>
                  <th>Tarih</th>
                  <th>Okuma</th>
                  <th>Durum</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {posts.map(p => (
                  <tr key={p.id}>
                    <td>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: KIND_COLORS[p.kind] || '#0c0c0c', fontWeight: 600 }}>
                        {p.kind}
                      </span>
                    </td>
                    <td>
                      <Link href={`/journal/${p.id}`} style={{ color: 'inherit', fontWeight: 600 }}>
                        {p.title_tr}
                      </Link>
                      {p.title_en && <div style={{ fontSize: 12, opacity: .5, marginTop: 1 }}>{p.title_en}</div>}
                    </td>
                    <td style={{ opacity: .65 }}>{p.author}</td>
                    <td className="td-num">{p.published_at?.slice(0, 10)}</td>
                    <td className="td-num">{p.read_time} dk</td>
                    <td>
                      {p.published
                        ? <span className="a-pill pub">Yayında</span>
                        : <span className="a-pill draft">Taslak</span>}
                    </td>
                    <td className="td-act">
                      <Link href={`/journal/${p.id}`} className="a-btn ghost sm">Düzenle</Link>
                      {' '}
                      <button className="a-btn danger sm" onClick={(e) => handleDelete(p.id, e)}>Sil</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
      </div>
      {toast && <Toast {...toast} />}
    </AdminShell>
  );
}
