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

function BiInput({ label, keyBase, vals, set, ta }) {
  return (
    <div className="a-g2" style={{ marginBottom: 14 }}>
      <div className="a-field">
        <div className="a-lbl">{label} (TR)</div>
        {ta
          ? <textarea className="a-ta" value={vals[`${keyBase}_tr`] || ''} onChange={set(`${keyBase}_tr`)} />
          : <input className="a-input" value={vals[`${keyBase}_tr`] || ''} onChange={set(`${keyBase}_tr`)} />}
      </div>
      <div className="a-field">
        <div className="a-lbl">{label} (EN)</div>
        {ta
          ? <textarea className="a-ta" value={vals[`${keyBase}_en`] || ''} onChange={set(`${keyBase}_en`)} />
          : <input className="a-input" value={vals[`${keyBase}_en`] || ''} onChange={set(`${keyBase}_en`)} />}
      </div>
    </div>
  );
}

export default function ContactPageEditor() {
  const [vals, setVals] = useState({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    aGet('/api/admin/settings').then(setVals).catch(() => {});
  }, []);

  const set = (key) => (e) => setVals(v => ({ ...v, [key]: e.target.value }));

  function showToast(msg, type = 'ok') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await aPut('/api/admin/settings', vals);
      showToast('İletişim sayfası kaydedildi.');
    } catch (e) { showToast(e.message, 'err'); }
    finally { setSaving(false); }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  return (
    <AdminShell
      title="İletişim Sayfası"
      actions={
        <div style={{ display: 'flex', gap: 8 }}>
          <a href={`${siteUrl}/contact`} target="_blank" className="a-btn ghost">Önizle ↗</a>
          <button className="a-btn" onClick={handleSave} disabled={saving}>
            {saving ? 'Kaydediliyor…' : 'Kaydet'}
          </button>
        </div>
      }
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, opacity: .5 }}>
        <Link href="/pages" style={{ fontSize: 12 }}>← Sayfalar</Link>
        <span style={{ fontSize: 12 }}>/ İletişim</span>
      </div>

      {/* ── GENEL ── */}
      <Section num="01 ·" title="Genel Bilgiler" tag="Formlarda, footer'da ve hero'da görünür">
        <div className="a-g2" style={{ marginBottom: 14 }}>
          <div className="a-field">
            <div className="a-lbl">Stüdyo e-postası</div>
            <input className="a-input" value={vals.studio_email || ''} onChange={set('studio_email')} placeholder="studio@limyra.studio" />
          </div>
          <div className="a-field">
            <div className="a-lbl">Stüdyo telefonu</div>
            <input className="a-input" value={vals.studio_phone || ''} onChange={set('studio_phone')} placeholder="+90 242 000 00 00" />
          </div>
        </div>
        <div className="a-g2" style={{ marginBottom: 14 }}>
          <div className="a-field">
            <div className="a-lbl">Instagram</div>
            <input className="a-input" value={vals.studio_instagram || ''} onChange={set('studio_instagram')} placeholder="@limyrastudio" />
          </div>
          <div className="a-field">
            <div className="a-lbl">Söyleşiyi yapan kişi (adı)</div>
            <input className="a-input" value={vals.contact_person || ''} onChange={set('contact_person')} placeholder="Eda" />
          </div>
        </div>
        <BiInput label="Genel adres" keyBase="studio_address" vals={vals} set={set} />
      </Section>

      {/* ── İSTANBUL OFİSİ ── */}
      <Section num="02 ·" title="İstanbul Ofisi" tag="İletişim sayfasındaki ofis kartı">
        <BiInput label="Adres" keyBase="istanbul_address" vals={vals} set={set} />
        <div className="a-g2" style={{ marginBottom: 14 }}>
          <div className="a-field">
            <div className="a-lbl">Telefon</div>
            <input className="a-input" value={vals.istanbul_phone || ''} onChange={set('istanbul_phone')} placeholder="+90 212 000 00 00" />
          </div>
          <div className="a-field">
            <div className="a-lbl">Yetkili adı</div>
            <input className="a-input" value={vals.istanbul_contact || ''} onChange={set('istanbul_contact')} placeholder="Mert Yıldız" />
          </div>
        </div>
        <div className="a-g2">
          <div className="a-field">
            <div className="a-lbl">Çalışma saatleri (TR)</div>
            <input className="a-input" value={vals.istanbul_hours_tr || ''} onChange={set('istanbul_hours_tr')} placeholder="Pzt – Cum · 10–18" />
          </div>
          <div className="a-field">
            <div className="a-lbl">Çalışma saatleri (EN)</div>
            <input className="a-input" value={vals.istanbul_hours_en || ''} onChange={set('istanbul_hours_en')} placeholder="Mon – Fri · 10–18" />
          </div>
        </div>
      </Section>

      {/* ── ANTALYA OFİSİ ── */}
      <Section num="03 ·" title="Antalya Ofisi" tag="İletişim sayfasındaki ofis kartı">
        <BiInput label="Adres" keyBase="antalya_address" vals={vals} set={set} />
        <div className="a-g2" style={{ marginBottom: 14 }}>
          <div className="a-field">
            <div className="a-lbl">Telefon</div>
            <input className="a-input" value={vals.antalya_phone || ''} onChange={set('antalya_phone')} placeholder="+90 242 000 00 00" />
          </div>
          <div className="a-field">
            <div className="a-lbl">Yetkili adı</div>
            <input className="a-input" value={vals.antalya_contact || ''} onChange={set('antalya_contact')} placeholder="Eda Aksel" />
          </div>
        </div>
        <div className="a-g2">
          <div className="a-field">
            <div className="a-lbl">Çalışma saatleri (TR)</div>
            <input className="a-input" value={vals.antalya_hours_tr || ''} onChange={set('antalya_hours_tr')} placeholder="Pzt – Cum · 09–17" />
          </div>
          <div className="a-field">
            <div className="a-lbl">Çalışma saatleri (EN)</div>
            <input className="a-input" value={vals.antalya_hours_en || ''} onChange={set('antalya_hours_en')} placeholder="Mon – Fri · 09–17" />
          </div>
        </div>
      </Section>

      {/* ── HERO METİNLERİ ── */}
      <Section num="04 ·" title="Hero Metinleri" tag="Sayfanın üst kısmı">
        <BiInput label="Kısa metin (lede)" keyBase="contact_hero_lede" vals={vals} set={set} ta />
        <div className="a-g4" style={{ marginBottom: 14 }}>
          <div className="a-field">
            <div className="a-lbl">Yanıt günü (sayı)</div>
            <input className="a-input" value={vals.contact_response_days || ''} onChange={set('contact_response_days')} placeholder="7" />
          </div>
          <div className="a-field">
            <div className="a-lbl">Stüdyo sayısı</div>
            <input className="a-input" value={vals.contact_studio_count || ''} onChange={set('contact_studio_count')} placeholder="2" />
          </div>
        </div>
      </Section>

      {/* ── FORM ALINTI ── */}
      <Section num="05 ·" title="Form Kenar Alıntısı" tag="Formun sağında görünen tırnak içi metin">
        <BiInput label="Alıntı" keyBase="contact_quote" vals={vals} set={set} ta />
      </Section>

      {/* ── MESAJLAR ── */}
      <Section num="·" title="Gelen Mesajlar" tag="Form üzerinden gelen müvekkil mesajları">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link href="/contacts" className="a-btn">Mesajları Görüntüle →</Link>
          <span style={{ fontSize: 12, opacity: .5 }}>Gelen brief&apos;leri ve iletişim formlarını buradan okuyabilirsiniz.</span>
        </div>
      </Section>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingBottom: 48 }}>
        <a href={`${siteUrl}/contact`} target="_blank" className="a-btn ghost">Önizle ↗</a>
        <button className="a-btn" onClick={handleSave} disabled={saving}>
          {saving ? 'Kaydediliyor…' : 'Kaydet'}
        </button>
      </div>

      {toast && <Toast {...toast} />}
    </AdminShell>
  );
}
