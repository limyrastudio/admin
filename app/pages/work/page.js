'use client';
import { useEffect, useState } from 'react';
import AdminShell from '../../../../components/AdminShell';
import Link from 'next/link';
import { aGet, aPut } from '../../../../lib/admin-api';

function Toast({ msg, type }) {
  if (!msg) return null;
  return <div className={`a-toast ${type}`}>{msg}</div>;
}

function Section({ num, title, tag, children }) {
  return (
    <div className="a-card" style={{ marginBottom: 20, padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '14px 20px 12px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 10, opacity: .35, letterSpacing: '.1em' }}>{num}</span>
        <span style={{ fontFamily: 'var(--serif)', fontSize: 18 }}>{title}</span>
        {tag && <span style={{ fontFamily: 'var(--sans)', fontSize: 11, opacity: .4 }}>— {tag}</span>}
      </div>
      <div style={{ padding: '18px 20px' }}>{children}</div>
    </div>
  );
}

const STATUS_LABELS = { 'In Progress': 'Devam Ediyor', 'Completed': 'Tamamlandı' };
const TAG_COLORS = { Residential: '#1a7f37', Workspace: '#946800', Cultural: '#5b3ea6' };

export default function WorkPageEditor() {
  const [projects, setProjects] = useState([]);
  const [vals, setVals] = useState({});
  const [saving, setSaving] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    Promise.all([
      aGet('/api/admin/projects'),
      aGet('/api/admin/settings'),
    ]).then(([p, s]) => {
      const sorted = [...(p || [])].sort((a, b) => b.sort_order - a.sort_order);
      setProjects(sorted);
      setVals(s || {});
    }).catch(() => {});
  }, []);

  const set = (key) => (e) => setVals(v => ({ ...v, [key]: e.target.value }));

  function showToast(msg, type = 'ok') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function saveSettings() {
    setSaving(true);
    try {
      await aPut('/api/admin/settings', vals);
      showToast('Ayarlar kaydedildi.');
    } catch (e) { showToast(e.message, 'err'); }
    finally { setSaving(false); }
  }

  /* ── Move project up/down in sort order ── */
  async function move(idx, dir) {
    const next = [...projects];
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= next.length) return;

    setReordering(true);
    const a = next[idx];
    const b = next[swapIdx];

    // Swap sort_order values
    const tmpOrder = a.sort_order;
    try {
      await Promise.all([
        aPut(`/api/admin/projects/${a.id}`, { ...a, sort_order: b.sort_order }),
        aPut(`/api/admin/projects/${b.id}`, { ...b, sort_order: tmpOrder }),
      ]);
      next[idx] = { ...a, sort_order: b.sort_order };
      next[swapIdx] = { ...b, sort_order: tmpOrder };
      next.sort((x, y) => y.sort_order - x.sort_order);
      setProjects(next);
      showToast('Sıralama güncellendi.');
    } catch (e) { showToast(e.message, 'err'); }
    finally { setReordering(false); }
  }

  /* ── Toggle archive status (stored in settings) ── */
  const archiveNums = (vals.archive_project_numbers || '006,005,004,003,002,001').split(',').map(s => s.trim()).filter(Boolean);

  function toggleArchive(num) {
    const next = archiveNums.includes(num)
      ? archiveNums.filter(n => n !== num)
      : [...archiveNums, num];
    setVals(v => ({ ...v, archive_project_numbers: next.join(',') }));
  }

  /* ── Spotlight project ── */
  const spotlightSlug = vals.spotlight_project_slug || '';
  const activeProjects = projects.filter(p => !archiveNums.includes(p.number));
  const autoSpotlight = activeProjects.find(p => p.status === 'In Progress') || activeProjects[0];

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  return (
    <AdminShell
      title="İşler Sayfası"
      actions={
        <div style={{ display: 'flex', gap: 8 }}>
          <a href={`${siteUrl}/work`} target="_blank" className="a-btn ghost">Önizle ↗</a>
          <button className="a-btn" onClick={saveSettings} disabled={saving}>
            {saving ? 'Kaydediliyor…' : 'Kaydet'}
          </button>
        </div>
      }
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, opacity: .5 }}>
        <Link href="/pages" style={{ fontSize: 12 }}>← Sayfalar</Link>
        <span style={{ fontSize: 12 }}>/ İşler</span>
      </div>

      {/* ── HERO İSTATİSTİKLER ── */}
      <Section num="01 ·" title="Hero İstatistikler" tag="Sayfanın üstündeki sayılar">
        <div className="a-g4">
          {[
            { key: 'stats_built',       label: 'Tamamlanan (Built)',   ph: '24' },
            { key: 'stats_in_progress', label: 'Devam Eden (In Progress)', ph: '03' },
            { key: 'stats_awards',      label: 'Ödül (Awards)',        ph: '09' },
          ].map(f => (
            <div className="a-field" key={f.key}>
              <div className="a-lbl">{f.label}</div>
              <input className="a-input" value={vals[f.key] || ''} onChange={set(f.key)} placeholder={f.ph} />
            </div>
          ))}
        </div>
      </Section>

      {/* ── SPOTLIGHT ── */}
      <Section num="02 ·" title="Spotlight Projesi" tag="Sayfanın büyük öne çıkan bölümü">
        <p style={{ fontSize: 12, opacity: .6, marginBottom: 14, lineHeight: 1.6 }}>
          Varsayılan olarak <strong>&ldquo;In Progress&rdquo;</strong> durumundaki ilk proje spotlight&apos;ta görünür.
          {autoSpotlight && (
            <span style={{ marginLeft: 6, color: 'var(--success)', fontWeight: 500 }}>
              Şu an: {autoSpotlight.title_tr}
            </span>
          )}
        </p>
        <div className="a-field">
          <div className="a-lbl">Spotlight projesini manuel seç <span style={{ fontWeight: 400, opacity: .45, textTransform: 'none', letterSpacing: 0 }}>— boş bırakırsan otomatik seçilir</span></div>
          <select className="a-sel" value={spotlightSlug} onChange={set('spotlight_project_slug')}>
            <option value="">Otomatik (In Progress olan proje)</option>
            {activeProjects.map(p => (
              <option key={p.slug} value={p.slug}>
                No. {p.number} — {p.title_tr} ({STATUS_LABELS[p.status] || p.status})
              </option>
            ))}
          </select>
        </div>
      </Section>

      {/* ── PROJE SIRALAMASI ── */}
      <Section num="03 ·" title="Proje Sıralaması" tag="Yukarı/aşağı ok ile sırala — en üstteki grid'de ilk görünür">
        <p style={{ fontSize: 12, opacity: .6, marginBottom: 14 }}>
          Projeler sitede sort_order değerine göre büyükten küçüğe sıralanır. Arşivdekiler tabloda ayrı gösterilir.
        </p>
        <div className="a-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="a-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}>Sıra</th>
                <th style={{ width: 50 }}>Kapak</th>
                <th style={{ width: 40 }}>No.</th>
                <th>Proje Adı</th>
                <th style={{ width: 90 }}>Kategori</th>
                <th style={{ width: 100 }}>Durum</th>
                <th style={{ width: 70 }}>Arşiv</th>
                <th style={{ width: 80 }}></th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p, idx) => {
                const isArchived = archiveNums.includes(p.number);
                return (
                  <tr key={p.id} style={{ opacity: isArchived ? .5 : 1 }}>
                    <td className="td-num" style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>
                      {p.sort_order}
                    </td>
                    <td>
                      {p.cover_image
                        ? <img src={p.cover_image} alt="" style={{ width: 38, height: 50, objectFit: 'cover', borderRadius: 3 }} />
                        : <div style={{ width: 38, height: 50, background: 'var(--bg)', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, opacity: .3 }}>▭</div>}
                    </td>
                    <td className="td-num">{p.number}</td>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{p.title_tr}</div>
                      {p.title_en && <div style={{ fontSize: 11, opacity: .4 }}>{p.title_en}</div>}
                    </td>
                    <td>
                      <span style={{ color: TAG_COLORS[p.tag] || '#555', fontFamily: 'var(--mono)', fontSize: 11 }}>{p.tag}</span>
                    </td>
                    <td>
                      <span className={`a-pill ${p.status === 'In Progress' ? 'prog' : 'draft'}`}>
                        {STATUS_LABELS[p.status] || p.status}
                      </span>
                    </td>
                    <td>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', userSelect: 'none' }}>
                        <input
                          type="checkbox"
                          checked={isArchived}
                          onChange={() => toggleArchive(p.number)}
                          style={{ width: 14, height: 14, cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: 11, opacity: .6 }}>Arşiv</span>
                      </label>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 3 }}>
                        <button
                          className="a-btn ghost sm"
                          disabled={idx === 0 || reordering}
                          onClick={() => move(idx, -1)}
                          title="Yukarı taşı"
                          style={{ padding: '3px 7px', fontSize: 12 }}
                        >▲</button>
                        <button
                          className="a-btn ghost sm"
                          disabled={idx === projects.length - 1 || reordering}
                          onClick={() => move(idx, 1)}
                          title="Aşağı taşı"
                          style={{ padding: '3px 7px', fontSize: 12 }}
                        >▼</button>
                        <Link href={`/projects/${p.id}`} className="a-btn ghost sm" style={{ fontSize: 11 }}>Düzenle</Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: 11, opacity: .45, marginTop: 10 }}>
          Arşiv kutucuğunu işaretlediğinizde proje, ana gridde değil sayfanın altındaki Arşiv tablosunda görünür. Değişiklikleri kaydetmeyi unutmayın.
        </p>
      </Section>

      {/* ── SAYFA METİNLERİ ── */}
      <Section num="04 ·" title="Sayfa Metinleri" tag="Hero başlık ve lede metni">
        <div className="a-g2" style={{ marginBottom: 14 }}>
          <div className="a-field">
            <div className="a-lbl">Hero lede (TR)</div>
            <textarea className="a-ta" value={vals.work_hero_lede_tr || ''} onChange={set('work_hero_lede_tr')} placeholder="On dört projelik bir okuma listesi…" />
          </div>
          <div className="a-field">
            <div className="a-lbl">Hero lede (EN)</div>
            <textarea className="a-ta" value={vals.work_hero_lede_en || ''} onChange={set('work_hero_lede_en')} placeholder="A reading list of fourteen projects…" />
          </div>
        </div>
      </Section>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingBottom: 48 }}>
        <a href={`${siteUrl}/work`} target="_blank" className="a-btn ghost">Önizle ↗</a>
        <button className="a-btn" onClick={saveSettings} disabled={saving}>
          {saving ? 'Kaydediliyor…' : 'Kaydet'}
        </button>
      </div>

      {toast && <Toast {...toast} />}
    </AdminShell>
  );
}
