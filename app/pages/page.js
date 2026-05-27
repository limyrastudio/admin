'use client';
import AdminShell from '../../components/AdminShell';
import Link from 'next/link';

const PAGES = [
  {
    href: '/pages/home',
    num: '01',
    title: 'Ana Sayfa',
    slug: '/',
    desc: 'Hero başlık & görsel, Hakkımızda, Yaklaşım sütunları, Stüdyo, Footer — tüm statik metin ve görseller.',
    sections: ['Hero', 'Hakkımızda', 'Yaklaşım (3 sütun)', 'Stüdyo', 'Footer'],
    color: '#e8f4e8',
  },
  {
    href: '/pages/work',
    num: '02',
    title: 'İşler',
    slug: '/work',
    desc: 'Proje spotlight seçimi, sıralama, arşiv ayarları ve sayfa istatistikleri.',
    sections: ['Hero istatistikler', 'Spotlight projesi', 'Proje sıralaması', 'Arşiv yönetimi'],
    color: '#e8ecf4',
  },
  {
    href: '/approach',
    num: '03',
    title: 'Yaklaşım',
    slug: '/approach',
    desc: 'Sabitler, Süreç aşamaları, İlkeler, Malzeme kütüphanesi ve sayfa metinleri.',
    sections: ['Sayfa metinleri', 'Sabitler (3 adet)', 'Süreç aşamaları', 'İlkeler', 'Malzeme kütüphanesi'],
    color: '#f4ece8',
  },
  {
    href: '/pages/contact',
    num: '04',
    title: 'İletişim',
    slug: '/contact',
    desc: 'Ofis bilgileri, yanıt süresi, söyleşi yapan kişi ve sayfa metinleri.',
    sections: ['Hero', 'İstanbul ofisi', 'Antalya ofisi', 'Sonraki adımlar metni'],
    color: '#f4f0e8',
  },
  {
    href: '/journal',
    num: '05',
    title: 'Günce',
    slug: '/journal',
    desc: 'Tüm yazılar, bölümler ve yayın durumu. Yeni yazı ekle ya da mevcut olanı düzenle.',
    sections: ['Yazı listesi', 'Yeni yazı ekle', 'Arşiv'],
    color: '#f0e8f4',
  },
];

export default function PagesHubPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  return (
    <AdminShell title="Sayfalar">
      <p style={{ fontFamily: 'var(--sans)', fontSize: 13, opacity: .5, marginBottom: 28, lineHeight: 1.6 }}>
        Her sayfanın içeriğini buradan düzenleyebilirsiniz. Değişiklikler kaydedildikten sonra siteye yansır.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
        {PAGES.map(p => (
          <div key={p.href} className="a-card" style={{ padding: 0, overflow: 'hidden' }}>
            {/* Color top strip */}
            <div style={{ height: 4, background: p.color, borderBottom: '1px solid var(--border)' }} />
            <div style={{ padding: '18px 20px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10 }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 10, opacity: .35 }}>{p.num}</span>
                <span style={{ fontFamily: 'var(--serif)', fontSize: 20 }}>{p.title}</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 10, opacity: .4, marginLeft: 'auto' }}>{p.slug}</span>
              </div>
              <p style={{ fontSize: 12, opacity: .6, lineHeight: 1.6, marginBottom: 14 }}>{p.desc}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 18 }}>
                {p.sections.map(s => (
                  <span key={s} style={{
                    fontSize: 10, padding: '2px 8px', borderRadius: 20,
                    background: 'var(--bg)', border: '1px solid var(--border)',
                    fontFamily: 'var(--mono)', opacity: .7,
                  }}>{s}</span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Link href={p.href} className="a-btn" style={{ flex: 1, justifyContent: 'center', display: 'flex' }}>
                  Düzenle →
                </Link>
                <a
                  href={`${siteUrl}${p.slug}`}
                  target="_blank"
                  className="a-btn ghost"
                  style={{ flexShrink: 0 }}
                >
                  Önizle ↗
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
