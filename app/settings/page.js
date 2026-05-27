'use client';
import { useEffect, useState } from 'react';
import AdminShell from '../../components/AdminShell';
import { aGet, aPut } from '../../lib/admin-api';

const GROUPS = [
  {
    title: 'Site Başlığı & Meta',
    fields: [
      { key: 'site_title_tr',       label: 'Site Başlığı (TR)' },
      { key: 'site_title_en',       label: 'Site Başlığı (EN)' },
      { key: 'meta_description_tr', label: 'Meta Açıklama (TR)', ta: true },
      { key: 'meta_description_en', label: 'Meta Açıklama (EN)', ta: true },
    ],
  },
  {
    title: 'Ana Sayfa Hero',
    fields: [
      { key: 'hero_title_tr', label: 'Hero Başlık (TR)' },
      { key: 'hero_title_en', label: 'Hero Başlık (EN)' },
      { key: 'hero_lede_tr',  label: 'Hero Metin (TR)', ta: true },
      { key: 'hero_lede_en',  label: 'Hero Metin (EN)', ta: true },
    ],
  },
  {
    title: 'İstatistikler',
    inline: true,
    fields: [
      { key: 'stats_built',       label: 'Tamamlanan Proje' },
      { key: 'stats_in_progress', label: 'Devam Eden' },
      { key: 'stats_awards',      label: 'Ödül' },
      { key: 'stats_projects',    label: 'Toplam Proje' },
    ],
  },
  {
    title: 'Bülten & İletişim',
    inline: true,
    fields: [
      { key: 'newsletter_count',      label: 'Bülten Okuyucu Sayısı' },
      { key: 'contact_response_days', label: 'Yanıt Günü' },
    ],
  },
  {
    title: 'Stüdyo Bilgileri',
    fields: [
      { key: 'studio_address_tr', label: 'Adres (TR)' },
      { key: 'studio_address_en', label: 'Adres (EN)' },
      { key: 'studio_email',      label: 'E-posta' },
      { key: 'studio_phone',      label: 'Telefon' },
      { key: 'studio_instagram',  label: 'Instagram' },
    ],
  },
  {
    title: 'Yaklaşım Sayfası — Hero',
    fields: [
      { key: 'approach_hero_lede_tr', label: 'Hero Metin (TR)', ta: true },
      { key: 'approach_hero_lede_en', label: 'Hero Metin (EN)', ta: true },
      { key: 'approach_hero_body_tr', label: 'Hero Alt Metin (TR)', ta: true },
      { key: 'approach_hero_body_en', label: 'Hero Alt Metin (EN)', ta: true },
    ],
  },
  {
    title: 'Yaklaşım Sayfası — Manifesto & CTA',
    fields: [
      { key: 'approach_manifesto_tr',    label: 'Manifesto Alıntısı (TR)' },
      { key: 'approach_manifesto_en',    label: 'Manifesto Alıntısı (EN)' },
      { key: 'approach_process_duration',label: 'Süreç Toplam Süre' },
      { key: 'approach_cta_title_tr',    label: 'CTA Başlık (TR)' },
      { key: 'approach_cta_title_en',    label: 'CTA Başlık (EN)' },
      { key: 'approach_cta_body_tr',     label: 'CTA Metin (TR)', ta: true },
      { key: 'approach_cta_body_en',     label: 'CTA Metin (EN)', ta: true },
    ],
  },
];

function Toast({ msg, type }) {
  if (!msg) return null;
  return <div className={`a-toast ${type}`}>{msg}</div>;
}

export default function SettingsPage() {
  const [vals, setVals] = useState({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    aGet('/api/admin/settings').then(setVals).catch(() => {});
  }, []);

  function set(key) {
    return (e) => setVals(v => ({ ...v, [key]: e.target.value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await aPut('/api/admin/settings', vals);
      setToast({ msg: 'Ayarlar kaydedildi.', type: 'ok' });
      setTimeout(() => setToast(null), 3000);
    } catch (e) {
      setToast({ msg: e.message, type: 'err' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminShell
      title="Ayarlar"
      actions={
        <button className="a-btn" onClick={handleSave} disabled={saving}>
          {saving ? 'Kaydediliyor…' : 'Kaydet'}
        </button>
      }
    >
      {GROUPS.map(g => (
        <div className="a-card" key={g.title}>
          <div className="a-card-hd">{g.title}</div>
          <div className={g.inline ? 'a-g4' : 'a-g2'} style={{ gap: 14 }}>
            {g.fields.map(f => (
              <div className="a-field" key={f.key}>
                <div className="a-lbl">{f.label}</div>
                {f.ta
                  ? <textarea className="a-ta" value={vals[f.key] || ''} onChange={set(f.key)} />
                  : <input className="a-input" value={vals[f.key] || ''} onChange={set(f.key)} />}
              </div>
            ))}
          </div>
        </div>
      ))}
      {toast && <Toast {...toast} />}
    </AdminShell>
  );
}
