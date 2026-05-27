'use client';
import { useEffect, useState } from 'react';
import AdminShell from '../../../../components/AdminShell';
import Link from 'next/link';
import { aGet, aPut, aUpload } from '../../../../lib/admin-api';

function Toast({ msg, type }) {
  if (!msg) return null;
  return <div className={`a-toast ${type}`}>{msg}</div>;
}

/* ── Mini preview shell ─────────────────────────────────── */
function Preview({ children }) {
  return (
    <div style={{
      width: 200, flexShrink: 0,
      border: '1px solid var(--border)', borderRadius: 8,
      overflow: 'hidden', background: '#f9f7f3',
      alignSelf: 'flex-start', position: 'sticky', top: 0,
    }}>
      <div style={{ padding: '6px 10px', background: 'var(--border)', fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', opacity: .6 }}>
        Önizleme
      </div>
      <div style={{ padding: 10, fontFamily: 'Georgia, serif' }}>
        {children}
      </div>
    </div>
  );
}

/* ── Section wrapper ────────────────────────────────────── */
function Section({ num, title, tag, children, previewNode }) {
  return (
    <div className="a-card" style={{ marginBottom: 20, padding: 0, overflow: 'hidden' }}>
      <div style={{
        padding: '14px 20px 12px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'baseline', gap: 10,
      }}>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 10, opacity: .35, letterSpacing: '.1em' }}>{num}</span>
        <span style={{ fontFamily: 'var(--serif)', fontSize: 18 }}>{title}</span>
        {tag && <span style={{ fontFamily: 'var(--sans)', fontSize: 11, opacity: .4 }}>— {tag}</span>}
      </div>
      <div style={{ padding: '18px 20px', display: 'flex', gap: 20, alignItems: 'flex-start' }}>
        {previewNode && <Preview>{previewNode}</Preview>}
        <div style={{ flex: 1, minWidth: 0 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ── Field helpers ──────────────────────────────────────── */
function Field({ label, children, hint }) {
  return (
    <div className="a-field" style={{ marginBottom: 14 }}>
      <div className="a-lbl">{label}{hint && <span style={{ fontWeight: 400, opacity: .45, textTransform: 'none', letterSpacing: 0, marginLeft: 6 }}>— {hint}</span>}</div>
      {children}
    </div>
  );
}

function BiInput({ label, keyBase, vals, set, ta, placeholder_tr, placeholder_en }) {
  return (
    <div className="a-g2" style={{ marginBottom: 14 }}>
      <div className="a-field">
        <div className="a-lbl">{label} (TR)</div>
        {ta
          ? <textarea className="a-ta" value={vals[`${keyBase}_tr`] || ''} onChange={set(`${keyBase}_tr`)} placeholder={placeholder_tr} />
          : <input className="a-input" value={vals[`${keyBase}_tr`] || ''} onChange={set(`${keyBase}_tr`)} placeholder={placeholder_tr} />}
      </div>
      <div className="a-field">
        <div className="a-lbl">{label} (EN)</div>
        {ta
          ? <textarea className="a-ta" value={vals[`${keyBase}_en`] || ''} onChange={set(`${keyBase}_en`)} placeholder={placeholder_en} />
          : <input className="a-input" value={vals[`${keyBase}_en`] || ''} onChange={set(`${keyBase}_en`)} placeholder={placeholder_en} />}
      </div>
    </div>
  );
}

/* ── Image upload field ─────────────────────────────────── */
function ImageField({ label, hint, value, onChange, shape = 'flat' }) {
  const [uploading, setUploading] = useState(false);

  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await aUpload(file);
      onChange(url);
    } catch { alert('Yükleme başarısız.'); }
    finally { setUploading(false); }
  }

  const r = shape === 'arch' ? '40px 40px 0 0' : shape === 'round' ? '50%' : '6px';
  const aspect = shape === 'arch' ? '75%' : shape === 'round' ? '100%' : '65%';

  return (
    <div className="a-field" style={{ marginBottom: 14 }}>
      <div className="a-lbl">{label}{hint && <span style={{ fontWeight: 400, opacity: .45, textTransform: 'none', letterSpacing: 0, marginLeft: 6 }}>— {hint}</span>}</div>
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <div style={{ width: 110, flexShrink: 0 }}>
          <div style={{ position: 'relative', paddingBottom: aspect, borderRadius: r, overflow: 'hidden', background: 'var(--border)' }}>
            {value
              ? <img src={value} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, opacity: .2 }}>🖼</div>}
          </div>
          <div style={{ fontSize: 9, opacity: .4, textAlign: 'center', marginTop: 4, fontFamily: 'var(--mono)', letterSpacing: '.04em', textTransform: 'uppercase' }}>
            {shape === 'arch' ? 'Arch · 4:3' : shape === 'round' ? 'Yuvarlak · 1:1' : 'Flat · 4:3'}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 4 }}>
          <label className="a-btn ghost" style={{ cursor: 'pointer' }}>
            {uploading ? 'Yükleniyor…' : value ? 'Değiştir' : 'Görsel Yükle'}
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
          </label>
          {value && (
            <button className="a-btn ghost" style={{ fontSize: 11 }} onClick={() => onChange('')}>
              Kaldır
            </button>
          )}
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, opacity: .4, maxWidth: 160, wordBreak: 'break-all' }}>
            {value ? value.split('/').pop().slice(0, 30) + '…' : 'Henüz görsel yok'}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Auto-section note ─────────────────────────────────── */
function AutoNote({ icon, text, link, linkLabel }) {
  return (
    <div style={{
      background: 'var(--bg)', border: '1px solid var(--border)',
      borderRadius: 8, padding: '12px 14px',
      display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14,
    }}>
      <span style={{ fontSize: 16 }}>{icon}</span>
      <div style={{ fontSize: 12, opacity: .7, lineHeight: 1.5 }}>
        {text}
        {link && <Link href={link} style={{ marginLeft: 6, textDecoration: 'underline', opacity: 1 }}>{linkLabel} →</Link>}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ */
export default function HomePageEditor() {
  const [vals, setVals] = useState({});
  const [projects, setProjects] = useState([]);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    Promise.all([
      aGet('/api/admin/settings'),
      aGet('/api/admin/projects'),
    ]).then(([s, p]) => {
      setVals(s || {});
      setProjects(p || []);
    }).catch(() => {});
  }, []);

  const set = (key) => (e) => setVals(v => ({ ...v, [key]: e.target.value }));
  const setV = (key, val) => setVals(v => ({ ...v, [key]: val }));

  function showToast(msg, type = 'ok') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await aPut('/api/admin/settings', vals);
      showToast('Ana sayfa içeriği kaydedildi.');
    } catch (e) { showToast(e.message, 'err'); }
    finally { setSaving(false); }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  /* ── Mini previews ── */
  const heroPreview = (
    <div>
      <div style={{ fontSize: 6, opacity: .5, letterSpacing: '.08em', marginBottom: 5 }}>
        {(vals.hero_eyebrow_tr || 'Architecture · Interiors').slice(0, 28)}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, lineHeight: 1.25, marginBottom: 5 }}>
            {(vals.hero_title_tr || 'Bir eşik,').split(',')[0]},<br />
            <em style={{ opacity: .45 }}>{(vals.hero_title_tr || 'bir oran,').split(',')[1] || 'bir oran,'},</em>
          </div>
          <div style={{ fontSize: 6, opacity: .55, lineHeight: 1.5, marginBottom: 6 }}>
            {(vals.hero_lede_tr || 'Limyra Studio…').slice(0, 50)}…
          </div>
          <div style={{ display: 'flex', gap: 3 }}>
            <span style={{ background: '#111', color: '#f4f1ec', fontSize: 5, padding: '2px 5px', borderRadius: 20 }}>
              {(vals.hero_btn1_tr || 'İşler').slice(0, 10)} →
            </span>
            <span style={{ border: '1px solid #555', fontSize: 5, padding: '2px 4px', borderRadius: 20 }}>
              {(vals.hero_btn2_tr || 'Hakkında').slice(0, 10)}
            </span>
          </div>
        </div>
        <div style={{ width: 50, flexShrink: 0 }}>
          {vals.hero_cover_image
            ? <img src={vals.hero_cover_image} style={{ width: 50, height: 68, objectFit: 'cover', borderRadius: '20px 20px 0 0' }} alt="" />
            : <div style={{ width: 50, height: 68, background: '#d4cfc7', borderRadius: '20px 20px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, opacity: .4 }}>arch</div>}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 6, fontSize: 5, opacity: .35, borderTop: '1px solid #ddd', paddingTop: 5 }}>
        <span>{(vals.hero_meta_est || 'Est. MMXIX · İstanbul').slice(0, 22)}</span>
      </div>
    </div>
  );

  const aboutPreview = (
    <div>
      <div style={{ fontSize: 5, opacity: .35, letterSpacing: '.1em', marginBottom: 4 }}>STÜDYO HAKKINDA</div>
      <div style={{ fontSize: 10, lineHeight: 1.3, marginBottom: 6 }}>
        {(vals.about_title_tr || 'Mimariyi anlatmak yerine işaret ederiz.').slice(0, 35)}
        {vals.about_title_tr?.length > 35 ? '…' : ''}
      </div>
      <div style={{ fontSize: 6, opacity: .55, lineHeight: 1.5 }}>
        {(vals.about_body_tr || '').slice(0, 80)}…
      </div>
    </div>
  );

  const approachPreview = (
    <div>
      <div style={{ fontSize: 5, opacity: .35, letterSpacing: '.1em', marginBottom: 6 }}>YAKLAŞIM</div>
      <div style={{ display: 'flex', gap: 6 }}>
        {[
          { t: vals.approach_col1_title_tr || 'Oran',   b: vals.approach_col1_body_tr },
          { t: vals.approach_col2_title_tr || 'Işık',   b: vals.approach_col2_body_tr },
          { t: vals.approach_col3_title_tr || 'Malzeme',b: vals.approach_col3_body_tr },
        ].map((c, i) => (
          <div key={i} style={{ flex: 1, borderLeft: '1px solid #ddd', paddingLeft: 5 }}>
            <div style={{ fontSize: 8, marginBottom: 4 }}>{c.t}</div>
            <div style={{ fontSize: 5.5, opacity: .5, lineHeight: 1.4 }}>{(c.b || '').slice(0, 30)}…</div>
          </div>
        ))}
      </div>
    </div>
  );

  const studioPreview = (
    <div style={{ background: '#2a2824', color: '#f4f1ec', padding: 8, borderRadius: 4 }}>
      <div style={{ fontSize: 5, opacity: .4, letterSpacing: '.1em', marginBottom: 4 }}>STÜDYO</div>
      <div style={{ fontSize: 11, lineHeight: 1.2, marginBottom: 5 }}>
        {vals.stats_built || '24'} <em style={{ opacity: .6 }}>{(vals.studio_subtitle_tr || 'sessiz bir atölye').slice(0, 16)}</em>
      </div>
      <div style={{ fontSize: 5.5, opacity: .5, lineHeight: 1.5 }}>
        {(vals.studio_body_tr || '').slice(0, 60)}…
      </div>
    </div>
  );

  const footerPreview = (
    <div style={{ borderTop: '2px solid #ddd', paddingTop: 8 }}>
      <div style={{ fontSize: 7, fontStyle: 'italic', opacity: .55, lineHeight: 1.4, marginBottom: 6 }}>
        &ldquo;{(vals.footer_tagline_tr || 'Az olanın ağırlığı…').slice(0, 45)}…&rdquo;
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 5, opacity: .3, borderTop: '1px solid #eee', paddingTop: 5 }}>
        <span>{(vals.footer_copy || '© MMXXVI Limyra').slice(0, 20)}</span>
        <span>İstanbul</span>
      </div>
    </div>
  );

  return (
    <AdminShell
      title="Ana Sayfa"
      actions={
        <div style={{ display: 'flex', gap: 8 }}>
          <a href={siteUrl} target="_blank" className="a-btn ghost">Önizle ↗</a>
          <button className="a-btn" onClick={handleSave} disabled={saving}>
            {saving ? 'Kaydediliyor…' : 'Kaydet'}
          </button>
        </div>
      }
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, opacity: .5 }}>
        <Link href="/pages" style={{ fontSize: 12 }}>← Sayfalar</Link>
        <span style={{ fontSize: 12 }}>/ Ana Sayfa</span>
      </div>

      {/* ── 01 HERO ── */}
      <Section num="01 ·" title="Hero" tag="İlk ekran — büyük başlık ve görsel" previewNode={heroPreview}>
        <BiInput label="Üst yazı (eyebrow)" keyBase="hero_eyebrow" vals={vals} set={set}
          placeholder_tr="Architecture · Interiors · Spatial Design"
          placeholder_en="Architecture · Interiors · Spatial Design" />
        <BiInput label="Ana başlık (h1)" keyBase="hero_title" vals={vals} set={set}
          placeholder_tr="Bir eşik, bir oran, bir ev."
          placeholder_en="A threshold, a ratio, a home." />
        <BiInput label="Kısa metin (lede)" keyBase="hero_lede" vals={vals} set={set} ta
          placeholder_tr="Limyra Studio, sade ve dayanıklı mekânlar tasarlar…"
          placeholder_en="Limyra Studio designs simple and enduring spaces…" />
        <div className="a-g2" style={{ marginBottom: 14 }}>
          <BiInput label="Düğme 1 (İşler)" keyBase="hero_btn1" vals={vals} set={set}
            placeholder_tr="Seçilmiş İşler" placeholder_en="Selected Works" />
        </div>
        <div className="a-g2" style={{ marginBottom: 14 }}>
          <BiInput label="Düğme 2 (Hakkında)" keyBase="hero_btn2" vals={vals} set={set}
            placeholder_tr="Stüdyo Hakkında" placeholder_en="About Studio" />
        </div>

        <ImageField
          label="Hero görseli"
          hint="Sayfanın sağındaki kemer çerçevede görünür"
          value={vals.hero_cover_image || ''}
          onChange={v => setV('hero_cover_image', v)}
          shape="arch"
        />

        <div className="a-g2">
          <Field label="Alt bar — Kuruluş / Şehirler">
            <input className="a-input" value={vals.hero_meta_est || ''} onChange={set('hero_meta_est')} placeholder="Est. MMXIX · Antalya · İstanbul" />
          </Field>
          <Field label="Alt bar — Tanınma notu">
            <input className="a-input" value={vals.hero_meta_recognition || ''} onChange={set('hero_meta_recognition')} placeholder="Recognised by AD & Wallpaper*" />
          </Field>
        </div>
      </Section>

      {/* ── 02 MARQUEE ── */}
      <Section num="02 ·" title="Marquee / Kayan Şerit" tag="Otomatik">
        <AutoNote icon="◫" text="Bu bölüm proje listenizdeki ilk 5 projenin başlığını otomatik olarak gösterir. Projelerin sırasını değiştirmek için:" link="/pages/work" linkLabel="İşler sayfasına gidin" />
      </Section>

      {/* ── 03 HAKKIMIZDA ── */}
      <Section num="03 ·" title="Hakkımızda" tag="Stüdyo tanıtım bölümü" previewNode={aboutPreview}>
        <BiInput label="Başlık" keyBase="about_title" vals={vals} set={set}
          placeholder_tr="Mimariyi anlatmak yerine işaret ederiz."
          placeholder_en="We point to architecture, rather than explain it." />
        <BiInput label="Paragraf" keyBase="about_body" vals={vals} set={set} ta />
        <BiInput label="Düğme etiketi" keyBase="about_btn" vals={vals} set={set}
          placeholder_tr="Felsefemizi Oku" placeholder_en="Read our philosophy" />
      </Section>

      {/* ── 04 SEÇİLMİŞ İŞLER ── */}
      <Section num="04 ·" title="Seçilmiş İşler" tag="Otomatik — ilk 3 proje">
        <AutoNote icon="◫" text="Bu bölüm proje listenizdeki ilk 3 projeyi otomatik olarak gösterir. Hangi projeler görünsün diye düzenlemek için:" link="/pages/work" linkLabel="İşler sayfasına gidin" />
        <div className="a-g4">
          <Field label="Bölüm başlığı (TR)">
            <input className="a-input" value={vals.works_section_title_tr || ''} onChange={set('works_section_title_tr')} placeholder="Seçilmiş İşler" />
          </Field>
          <Field label="Bölüm başlığı (EN)">
            <input className="a-input" value={vals.works_section_title_en || ''} onChange={set('works_section_title_en')} placeholder="Selected Works" />
          </Field>
        </div>
      </Section>

      {/* ── 05 ÖNE ÇIKAN ── */}
      <Section num="05 ·" title="Öne Çıkan Proje" tag="Karanlık bölüm">
        <AutoNote icon="◧" text="Bu bölüm &ldquo;In Progress&rdquo; durumundaki ilk projeyi otomatik olarak spotlight olarak gösterir. Projenin durumunu değiştirmek için:" link="/projects" linkLabel="Projeler listesine gidin" />
      </Section>

      {/* ── 06 YAKLAŞIM ── */}
      <Section num="06 ·" title="Yaklaşım" tag="Üç sütunlu ilkeler önizlemesi" previewNode={approachPreview}>
        <BiInput label="Sütun 1 başlık" keyBase="approach_col1_title" vals={vals} set={set}
          placeholder_tr="Oran" placeholder_en="Proportion" />
        <BiInput label="Sütun 1 açıklama" keyBase="approach_col1_body" vals={vals} set={set} ta />
        <BiInput label="Sütun 2 başlık" keyBase="approach_col2_title" vals={vals} set={set}
          placeholder_tr="Işık" placeholder_en="Light" />
        <BiInput label="Sütun 2 açıklama" keyBase="approach_col2_body" vals={vals} set={set} ta />
        <BiInput label="Sütun 3 başlık" keyBase="approach_col3_title" vals={vals} set={set}
          placeholder_tr="Malzeme" placeholder_en="Matter" />
        <BiInput label="Sütun 3 açıklama" keyBase="approach_col3_body" vals={vals} set={set} ta />
        <AutoNote icon="◬" text="Yaklaşım sayfasının tam içeriği (Sabitler, Süreç, İlkeler) için:" link="/approach" linkLabel="Yaklaşım editörüne gidin" />
      </Section>

      {/* ── 07 STÜDYO ── */}
      <Section num="07 ·" title="Stüdyo" tag="Koyu arka planlı bölüm" previewNode={studioPreview}>
        <BiInput label="Alt başlık metni" keyBase="studio_subtitle" vals={vals} set={set}
          placeholder_tr="sessiz bir atölye." placeholder_en="quiet projects." />
        <BiInput label="Paragraf" keyBase="studio_body" vals={vals} set={set} ta />
        <BiInput label="Düğme etiketi" keyBase="studio_btn" vals={vals} set={set}
          placeholder_tr="Stüdyoyu Tanı" placeholder_en="Meet the Studio" />
        <AutoNote icon="◯" text="Ekip üyeleri ve fotoğrafları için:" link="/team" linkLabel="Ekip sayfasına gidin" />
      </Section>

      {/* ── 08 GÜNCE ── */}
      <Section num="08 ·" title="Günce / Journal" tag="Otomatik — son 3 yazı">
        <AutoNote icon="◱" text="Bu bölüm en son 3 yazıyı otomatik olarak gösterir. Yazıları düzenlemek için:" link="/journal" linkLabel="Günce sayfasına gidin" />
      </Section>

      {/* ── 09 İSTATİSTİKLER ── */}
      <Section num="·" title="İstatistikler" tag="Hero ve diğer sayfalarda görünen sayılar">
        <div className="a-g4">
          {[
            { key: 'stats_built',       label: 'Tamamlanan Proje', ph: '24' },
            { key: 'stats_in_progress', label: 'Devam Eden',       ph: '03' },
            { key: 'stats_awards',      label: 'Ödül',             ph: '09' },
            { key: 'newsletter_count',  label: 'Bülten Okuyucu',   ph: '1 200' },
          ].map(f => (
            <div className="a-field" key={f.key}>
              <div className="a-lbl">{f.label}</div>
              <input className="a-input" value={vals[f.key] || ''} onChange={set(f.key)} placeholder={f.ph} />
            </div>
          ))}
        </div>
      </Section>

      {/* ── 10 FOOTER ── */}
      <Section num="·" title="Footer" tag="Sayfa altı — slogan ve telif" previewNode={footerPreview}>
        <BiInput label="Slogan (tırnak içinde gösterilir)" keyBase="footer_tagline" vals={vals} set={set}
          placeholder_tr="Az olanın ağırlığı, çok olanın gürültüsünden daima daha uzun yaşar."
          placeholder_en="The weight of less always outlasts the noise of more." />
        <Field label="Telif notu">
          <input className="a-input" value={vals.footer_copy || ''} onChange={set('footer_copy')} placeholder="© MMXXVI · Limyra Studio Mimarlık A.Ş." />
        </Field>
      </Section>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingBottom: 48 }}>
        <a href={siteUrl} target="_blank" className="a-btn ghost">Önizle ↗</a>
        <button className="a-btn" onClick={handleSave} disabled={saving}>
          {saving ? 'Kaydediliyor…' : 'Kaydet'}
        </button>
      </div>

      {toast && <Toast {...toast} />}
    </AdminShell>
  );
}
