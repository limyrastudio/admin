'use client';
export const runtime = 'edge';
import { useEffect, useState } from 'react';
import AdminShell from '../components/AdminShell';
import Link from 'next/link';
import { aGet } from '../lib/admin-api';

export default function Dashboard() {
  const [stats, setStats] = useState({ projects: 0, journal: 0, contacts: 0, unread: 0 });
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    aGet('/api/admin/stats').then(setStats).catch(() => {});
    aGet('/api/admin/contacts?read=0').then(setContacts).catch(() => {});
  }, []);

  const cards = [
    { href: '/projects', num: stats.projects, lbl: 'Proje',         color: '#0c0c0c' },
    { href: '/journal',  num: stats.journal,  lbl: 'Günce Yazısı',  color: '#0c0c0c' },
    { href: '/contacts', num: stats.unread,   lbl: 'Okunmamış Mesaj', color: stats.unread > 0 ? '#e74c3c' : '#0c0c0c' },
    { href: '/contacts', num: stats.contacts, lbl: 'Toplam Mesaj',   color: '#0c0c0c' },
  ];

  const QUICK = [
    { href: '/projects/new', label: '+ Yeni Proje',    icon: '⬜' },
    { href: '/journal/new',  label: '+ Yeni Yazı',     icon: '◎' },
    { href: '/settings',     label: 'Ayarları Düzenle',icon: '⊕' },
    { href: '/contacts',     label: 'Mesajlar',         icon: '✉' },
  ];

  return (
    <AdminShell title="Dashboard">
      <div className="a-stats">
        {cards.map(c => (
          <Link key={c.lbl} href={c.href} style={{ textDecoration: 'none' }}>
            <div className="a-stat">
              <div className="a-stat-num" style={{ color: c.color }}>{c.num}</div>
              <div className="a-stat-lbl">{c.lbl}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="a-g2" style={{ marginBottom: 20 }}>
        <div className="a-card">
          <div className="a-card-hd">Hızlı İşlemler</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {QUICK.map(q => (
              <Link key={q.href} href={q.href} className="a-btn ghost" style={{ justifyContent: 'flex-start' }}>
                <span>{q.icon}</span> {q.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="a-card">
          <div className="a-card-hd">Son Okunmamış Mesajlar</div>
          {contacts.length === 0
            ? <div className="a-empty">Okunmamış mesaj yok.</div>
            : contacts.slice(0, 5).map(c => (
              <Link key={c.id} href="/contacts" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ padding: '10px 0', borderBottom: '1px solid #f0ede8' }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</div>
                  <div style={{ fontSize: 12, opacity: .55, marginTop: 2 }}>{c.email} · {c.created_at?.slice(0, 10)}</div>
                  <div style={{ fontSize: 13, opacity: .7, marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.message}
                  </div>
                </div>
              </Link>
            ))}
          {contacts.length > 0 && (
            <Link href="/contacts" className="a-btn ghost sm" style={{ marginTop: 12 }}>Tümünü Gör →</Link>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
