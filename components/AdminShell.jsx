'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { getToken, clearToken, getUser, aGet } from '../lib/admin-api';

const NAV = [
  { href: '/',          label: 'Dashboard',       icon: '▣' },
  { sep: 'İÇERİK' },
  { href: '/projects',  label: 'Projeler',         icon: '◫' },
  { href: '/journal',   label: 'Günce',            icon: '◱' },
  { href: '/team',      label: 'Ekip',             icon: '◯' },
  { href: '/press',     label: 'Basın',            icon: '◻' },
  { href: '/contacts',  label: 'Mesajlar',         icon: '◈', key: 'contacts' },
  { sep: 'SAYFALAR' },
  { href: '/pages',          label: 'Tüm Sayfalar',    icon: '⊞' },
  { href: '/pages/home',     label: 'Ana Sayfa',        icon: '⌂',  indent: true },
  { href: '/pages/work',     label: 'İşler',            icon: '◧',  indent: true },
  { href: '/approach',       label: 'Yaklaşım',         icon: '◬',  indent: true },
  { href: '/pages/contact',  label: 'İletişim',         icon: '◉',  indent: true },
  { sep: 'SİSTEM' },
  { href: '/settings',  label: 'Ayarlar',          icon: '◎' },
];

export default function AdminShell({ title, actions, children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [unread, setUnread] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) { router.replace('/login'); return; }
    setUser(getUser());
    setReady(true);
    aGet('/api/admin/stats').then(d => setUnread(d.unread || 0)).catch(() => {});
  }, []);

  function isActive(href) {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(href + '/');
  }

  if (!ready) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 16, color: 'var(--text-3)' }}>
        Yükleniyor…
      </div>
    );
  }

  return (
    <div className="a-wrap">
      <aside className="a-sidebar">
        <div className="a-brand">
          <div className="a-brand-mark">L</div>
          <div>
            <div className="a-brand-name">Limyra Studio</div>
            <div className="a-brand-sub">Admin</div>
          </div>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: 8 }}>
          <ul className="a-nav" style={{ flex: 1 }}>
            {NAV.map((l, i) => {
              if (l.sep) return (
                <li key={`sep-${i}`} className="a-nav-sep">{l.sep}</li>
              );
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className={isActive(l.href) ? 'act' : ''}
                    style={l.indent ? { paddingLeft: 22, fontSize: 12 } : {}}
                  >
                    <span className="a-nav-icon" style={l.indent ? { opacity: .35 } : {}}>{l.icon}</span>
                    <span>{l.label}</span>
                    {l.key === 'contacts' && unread > 0 && <span className="badge">{unread}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
          <ul className="a-nav" style={{ borderTop: '1px solid rgba(255,255,255,.07)', paddingTop: 6, marginTop: 4 }}>
            <li>
              <Link href={process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'} target="_blank">
                <span className="a-nav-icon" style={{ opacity: .4 }}>↗</span>
                <span>Siteyi Gör</span>
              </Link>
            </li>
          </ul>
        </nav>

        <div className="a-sidebar-foot">
          {user && <>
            <div className="a-user-name">{user.name}</div>
            <div className="a-user-email">{user.email}</div>
          </>}
          <button className="a-logout" onClick={() => { clearToken(); router.push('/login'); }}>
            Çıkış Yap
          </button>
        </div>
      </aside>

      <main className="a-main">
        <div className="a-topbar">
          <h1 className="a-page-title">{title}</h1>
          <div className="a-topbar-actions">{actions}</div>
        </div>
        <div className="a-content">{children}</div>
      </main>
    </div>
  );
}
