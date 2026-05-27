'use client';
import { useEffect, useState } from 'react';
import AdminShell from '../../components/AdminShell';
import { aGet, aPut } from '../../lib/admin-api';

function Toast({ msg, type }) {
  if (!msg) return null;
  return <div className={`a-toast ${type}`}>{msg}</div>;
}

/* Two-column TR / EN field pair */
function BiField({ label, keyBase, vals, set, ta }) {
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

function SectionCard({ num, label, hint, children }) {
  return (
    <div className="a-card" style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid var(--border)' }}>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 10, opacity: .4, letterSpacing: '.1em' }}>{num}</span>
        <span style={{ fontFamily: 'var(--serif)', fontSize: 17 }}>{label}</span>
        {hint && <span style={{ fontFamily: 'var(--sans)', fontSize: 11, opacity: .4, marginLeft: 4 }}>— {hint}</span>}
      </div>
      {children}
    </div>
  );
}

export default function HomeContentPage() {
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
      showToast('Ana sayfa içeriği kaydedildi.');
    } catch (e) {
      showToast(e.message, 'err');
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminShell
      title="Ana Sayfa İçeriği"
      actions={
        <div style={{ display: 'flex', gap: 8 }}>
          <a
            href={process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}
            target="_blank"
            className="a-btn ghost"
          >
            Önizle ↗
          </a>
          <button className="a-btn" onClick={handleSave} disabled={saving}>
            {saving ? 'Kaydediliyor…' : 'Kaydet'}
          </button>
        </div>
      }
    >
      <p style={{ fontFamily: 'var(--sans)', fontSize: 12, opacity: .5, marginBottom: 24, lineHeight: 1.6 }}>
        Aşağıdaki her bölüm sitedeki bir seksiyana karşılık gelir. Değişiklik yaptıktan sonra <strong>Kaydet</strong> düğmesine basın.
      </p>

      {/* ── 01 HERO ── */}
      <SectionCard num="01 ·" label="Hero" hint="Sayfanın ilk ekranı — büyük başlık ve görsel">
        <BiField label="Üst yazı (eyebrow)" keyBase="hero_eyebrow" vals={vals} set={set} />
        <BiField label="Ana başlık (h1)" keyBase="hero_title" vals={vals} set={set} />
        <BiField label="Kısa metin (lede)" keyBase="hero_lede" vals={vals} set={set} ta />
        <div className="a-g2" style={{ marginBottom: 14 }}>
          <BiField label="Düğme 1 (İşler)" keyBase="hero_btn1" vals={vals} set={set} />
        </div>
        <div className="a-g2" style={{ marginBottom: 14 }}>
          <BiField label="Düğme 2 (Hakkında)" keyBase="hero_btn2" vals={vals} set={set} />
        </div>
        <div className="a-g2" style={{ marginBottom: 0 }}>
          <div className="a-field">
            <div className="a-lbl">Alt bar — Kuruluş / Şehirler</div>
            <input className="a-input" value={vals.hero_meta_est || ''} onChange={set('hero_meta_est')} placeholder="Est. MMXIX · Antalya · İstanbul" />
          </div>
          <div className="a-field">
            <div className="a-lbl">Alt bar — Tanınma notu</div>
            <input className="a-input" value={vals.hero_meta_recognition || ''} onChange={set('hero_meta_recognition')} placeholder="Recognised by AD & Wallpaper*" />
          </div>
        </div>
      </SectionCard>

      {/* ── 02 HAKKIMIZDA ── */}
      <SectionCard num="02 ·" label="Hakkımızda" hint="Stüdyo tanıtım bölümü">
        <BiField label="Başlık" keyBase="about_title" vals={vals} set={set} />
        <BiField label="Paragraf" keyBase="about_body" vals={vals} set={set} ta />
        <BiField label="Düğme etiketi" keyBase="about_btn" vals={vals} set={set} />
      </SectionCard>

      {/* ── 03 YAKLAŞIM ── */}
      <SectionCard num="03 ·" label="Yaklaşım" hint="Üç sütunlu içerik — homepage önizleme">
        <BiField label="Sütun 1 başlık" keyBase="approach_col1_title" vals={vals} set={set} />
        <BiField label="Sütun 1 açıklama" keyBase="approach_col1_body" vals={vals} set={set} ta />
        <BiField label="Sütun 2 başlık" keyBase="approach_col2_title" vals={vals} set={set} />
        <BiField label="Sütun 2 açıklama" keyBase="approach_col2_body" vals={vals} set={set} ta />
        <BiField label="Sütun 3 başlık" keyBase="approach_col3_title" vals={vals} set={set} />
        <BiField label="Sütun 3 açıklama" keyBase="approach_col3_body" vals={vals} set={set} ta />
        <p style={{ fontFamily: 'var(--sans)', fontSize: 11, opacity: .45, margin: '4px 0 0' }}>
          Yaklaşım sayfasının tam içeriği (Sabitler, Süreç, İlkeler) için sol menüden <a href="/approach" style={{ color: 'inherit', textDecoration: 'underline' }}>Yaklaşım</a> sayfasını kullanın.
        </p>
      </SectionCard>

      {/* ── 04 STÜDYO ── */}
      <SectionCard num="04 ·" label="Stüdyo" hint="Koyu arka planlı stüdyo tanıtım bölümü">
        <BiField label="Alt başlık metni" keyBase="studio_subtitle" vals={vals} set={set} />
        <BiField label="Paragraf" keyBase="studio_body" vals={vals} set={set} ta />
        <BiField label="Düğme etiketi" keyBase="studio_btn" vals={vals} set={set} />
      </SectionCard>

      {/* ── 05 FOOTER ── */}
      <SectionCard num="05 ·" label="Footer" hint="Sayfa altı — slogan ve telif notu">
        <BiField label="Slogan (tırnak içi)" keyBase="footer_tagline" vals={vals} set={set} />
        <div className="a-field" style={{ marginBottom: 0 }}>
          <div className="a-lbl">Telif notu</div>
          <input className="a-input" value={vals.footer_copy || ''} onChange={set('footer_copy')} placeholder="© MMXXVI · Limyra Studio Mimarlık A.Ş." />
        </div>
      </SectionCard>

      {/* ── İSTATİSTİKLER ── */}
      <SectionCard num="·" label="İstatistikler" hint="Hero ve diğer sayfalardaki sayı değerleri">
        <div className="a-g4">
          <div className="a-field">
            <div className="a-lbl">Tamamlanan proje</div>
            <input className="a-input" value={vals.stats_built || ''} onChange={set('stats_built')} placeholder="24" />
          </div>
          <div className="a-field">
            <div className="a-lbl">Devam eden</div>
            <input className="a-input" value={vals.stats_in_progress || ''} onChange={set('stats_in_progress')} placeholder="03" />
          </div>
          <div className="a-field">
            <div className="a-lbl">Ödül</div>
            <input className="a-input" value={vals.stats_awards || ''} onChange={set('stats_awards')} placeholder="09" />
          </div>
          <div className="a-field">
            <div className="a-lbl">Bülten okuyucu</div>
            <input className="a-input" value={vals.newsletter_count || ''} onChange={set('newsletter_count')} placeholder="1 200" />
          </div>
        </div>
      </SectionCard>

      {/* ── STÜDYO İLETİŞİM ── */}
      <SectionCard num="·" label="Stüdyo İletişim Bilgileri" hint="Footer, iletişim sayfası ve form kenarında görünür">
        <div className="a-g2" style={{ marginBottom: 14 }}>
          <div className="a-field">
            <div className="a-lbl">Adres (TR)</div>
            <input className="a-input" value={vals.studio_address_tr || ''} onChange={set('studio_address_tr')} placeholder="Asmalımescit Mah. 42 · Beyoğlu, İstanbul" />
          </div>
          <div className="a-field">
            <div className="a-lbl">Adres (EN)</div>
            <input className="a-input" value={vals.studio_address_en || ''} onChange={set('studio_address_en')} placeholder="Asmalımescit St. 42 · Beyoğlu, Istanbul" />
          </div>
        </div>
        <div className="a-g4">
          <div className="a-field">
            <div className="a-lbl">E-posta</div>
            <input className="a-input" value={vals.studio_email || ''} onChange={set('studio_email')} placeholder="studio@limyra.studio" />
          </div>
          <div className="a-field">
            <div className="a-lbl">Telefon</div>
            <input className="a-input" value={vals.studio_phone || ''} onChange={set('studio_phone')} placeholder="+90 242 000 00 00" />
          </div>
          <div className="a-field">
            <div className="a-lbl">Instagram</div>
            <input className="a-input" value={vals.studio_instagram || ''} onChange={set('studio_instagram')} placeholder="@limyrastudio" />
          </div>
          <div className="a-field">
            <div className="a-lbl">Söyleşi yapan</div>
            <input className="a-input" value={vals.contact_person || ''} onChange={set('contact_person')} placeholder="Eda" />
          </div>
        </div>
      </SectionCard>

      {/* ── İSTANBUL OFİSİ ── */}
      <SectionCard num="·" label="İletişim — İstanbul Ofisi" hint="İletişim sayfasındaki ofis kartı">
        <div className="a-g2" style={{ marginBottom: 14 }}>
          <div className="a-field">
            <div className="a-lbl">Adres (TR)</div>
            <input className="a-input" value={vals.istanbul_address_tr || ''} onChange={set('istanbul_address_tr')} placeholder="Asmalımescit Mah. 42 · 2. Kat" />
          </div>
          <div className="a-field">
            <div className="a-lbl">Adres (EN)</div>
            <input className="a-input" value={vals.istanbul_address_en || ''} onChange={set('istanbul_address_en')} placeholder="Asmalımescit St. 42 · 2nd Floor" />
          </div>
        </div>
        <div className="a-g2">
          <div className="a-field">
            <div className="a-lbl">Telefon</div>
            <input className="a-input" value={vals.istanbul_phone || ''} onChange={set('istanbul_phone')} placeholder="+90 212 000 00 00" />
          </div>
          <div className="a-field">
            <div className="a-lbl">Yetkili adı</div>
            <input className="a-input" value={vals.istanbul_contact || ''} onChange={set('istanbul_contact')} placeholder="Mert Yıldız" />
          </div>
        </div>
      </SectionCard>

      {/* ── ANTALYA OFİSİ ── */}
      <SectionCard num="·" label="İletişim — Antalya Ofisi" hint="İletişim sayfasındaki ofis kartı">
        <div className="a-g2" style={{ marginBottom: 14 }}>
          <div className="a-field">
            <div className="a-lbl">Adres (TR)</div>
            <input className="a-input" value={vals.antalya_address_tr || ''} onChange={set('antalya_address_tr')} placeholder="Kılınçarslan Mah. 14 · Kaleiçi" />
          </div>
          <div className="a-field">
            <div className="a-lbl">Adres (EN)</div>
            <input className="a-input" value={vals.antalya_address_en || ''} onChange={set('antalya_address_en')} placeholder="Kılınçarslan St. 14 · Kaleiçi" />
          </div>
        </div>
        <div className="a-g2">
          <div className="a-field">
            <div className="a-lbl">Telefon</div>
            <input className="a-input" value={vals.antalya_phone || ''} onChange={set('antalya_phone')} placeholder="+90 242 000 00 00" />
          </div>
          <div className="a-field">
            <div className="a-lbl">Yetkili adı</div>
            <input className="a-input" value={vals.antalya_contact || ''} onChange={set('antalya_contact')} placeholder="Eda Aksel" />
          </div>
        </div>
      </SectionCard>

      {/* ── SEO / META ── */}
      <SectionCard num="·" label="SEO & Meta" hint="Tarayıcı sekmesi başlığı ve arama motoru açıklaması">
        <div className="a-g2" style={{ marginBottom: 14 }}>
          <div className="a-field">
            <div className="a-lbl">Site başlığı (TR)</div>
            <input className="a-input" value={vals.site_title_tr || ''} onChange={set('site_title_tr')} placeholder="Limyra Studio — Mimarlık & İç Mimarlık" />
          </div>
          <div className="a-field">
            <div className="a-lbl">Site başlığı (EN)</div>
            <input className="a-input" value={vals.site_title_en || ''} onChange={set('site_title_en')} placeholder="Limyra Studio — Architecture & Interiors" />
          </div>
        </div>
        <div className="a-g2">
          <div className="a-field">
            <div className="a-lbl">Meta açıklama (TR)</div>
            <textarea className="a-ta" value={vals.meta_description_tr || ''} onChange={set('meta_description_tr')} />
          </div>
          <div className="a-field">
            <div className="a-lbl">Meta açıklama (EN)</div>
            <textarea className="a-ta" value={vals.meta_description_en || ''} onChange={set('meta_description_en')} />
          </div>
        </div>
      </SectionCard>

      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: 40 }}>
        <button className="a-btn" onClick={handleSave} disabled={saving}>
          {saving ? 'Kaydediliyor…' : 'Kaydet'}
        </button>
      </div>

      {toast && <Toast {...toast} />}
    </AdminShell>
  );
}
