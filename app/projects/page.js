'use client';
import { useEffect, useState } from 'react';
import AdminShell from '../../components/AdminShell';
import Link from 'next/link';
import { aGet, aDelete } from '../../lib/admin-api';

function Toast({ msg, type }) {
  if (!msg) return null;
  return <div className={`a-toast ${type}`}>{msg}</div>;
}

const TAG_COLORS = {
  Residential: '#1a7f37', Workspace: '#946800',
  Cultural: '#5b3ea6', Founding: '#0c0c0c',
};

export default function ProjectsListPage() {
  const [projects, setProjects] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => { aGet('/api/admin/projects').then(setProjects).catch(() => {}); }, []);

  function showToast(msg, type = 'ok') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleDelete(id, e) {
    e.preventDefault();
    if (!confirm('Bu projeyi ve tüm bağlı verileri (görsel, malzeme, künye) silmek istediğinize emin misiniz?')) return;
    await aDelete(`/api/admin/projects/${id}`).catch(() => {});
    setProjects(prev => prev.filter(p => p.id !== id));
    showToast('Proje silindi.');
  }

  const sorted = [...projects].sort((a, b) => b.sort_order - a.sort_order);

  return (
    <AdminShell
      title="Projeler"
      actions={<Link href="/projects/new" className="a-btn">+ Yeni Proje</Link>}
    >
      <div className="a-card" style={{ padding: 0, overflow: 'hidden' }}>
        {projects.length === 0
          ? <div className="a-empty">Henüz proje yok. İlk projeyi ekleyin.</div>
          : (
            <table className="a-table">
              <thead>
                <tr>
                  <th>Kapak</th>
                  <th>No.</th>
                  <th>Başlık</th>
                  <th>Kategori</th>
                  <th>Konum</th>
                  <th>Yıl</th>
                  <th>Durum</th>
                  <th>Yayın</th>
                  <th>Sıra</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(p => (
                  <tr key={p.id}>
                    <td>
                      {p.cover_image
                        ? <img src={p.cover_image} alt="" style={{ width: 44, height: 58, objectFit: 'cover', borderRadius: 4, border: '1px solid #e8e4de' }} />
                        : <div style={{ width: 44, height: 58, background: '#f0ede8', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, opacity: .35 }}>▭</div>}
                    </td>
                    <td className="td-num">{p.number}</td>
                    <td>
                      <Link href={`/projects/${p.id}`} style={{ color: 'inherit', fontWeight: 600, fontSize: 14 }}>
                        {p.title_tr}
                      </Link>
                      {p.title_en && <div style={{ fontSize: 11, opacity: .45, marginTop: 1 }}>{p.title_en}</div>}
                    </td>
                    <td>
                      <span style={{ color: TAG_COLORS[p.tag] || '#0c0c0c', fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 600 }}>
                        {p.tag}
                      </span>
                    </td>
                    <td style={{ opacity: .65 }}>{p.location_tr}</td>
                    <td className="td-num">{p.year}</td>
                    <td>
                      {p.status === 'In Progress'
                        ? <span className="a-pill prog">Devam Ediyor</span>
                        : <span className="a-pill draft">Tamamlandı</span>}
                    </td>
                    <td>
                      {p.published
                        ? <span className="a-pill pub">Yayında</span>
                        : <span className="a-pill draft">Gizli</span>}
                    </td>
                    <td className="td-num">{p.sort_order}</td>
                    <td className="td-act">
                      <Link href={`/projects/${p.id}`} className="a-btn ghost sm">Düzenle</Link>
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
