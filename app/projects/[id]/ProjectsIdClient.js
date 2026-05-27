'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AdminShell from '../../../components/AdminShell';
import Link from 'next/link';
import { aGet, aPost, aPut, aDelete, aUpload } from '../../../lib/admin-api';

/* ── helpers ─────────────────────────────────── */
const EMPTY_PROJECT = {
  slug: '', number: '', title_tr: '', title_en: '',
  subtitle_tr: '', subtitle_en: '', year: new Date().getFullYear(),
  location_tr: '', location_en: '', tag: 'Residential',
  area_m2: '', status: 'Completed', description_tr: '',
  description_en: '', essay_tr: '', essay_en: '',
  cover_image: null, sort_order: 0, published: 1,
};

function autoSlug(str) {
  return str.toLowerCase()
    .replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ş/g,'s')
    .replace(/ı/g,'i').replace(/ö/g,'o').replace(/ç/g,'c')
    .replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
}

/* ── Toast ─────────────────────────────────── */
function Toast({ msg, type }) {
  if (!msg) return null;
  return <div className={`a-toast ${type}`}>{msg}</div>;
}

/* ── Toggle ─────────────────────────────────── */
function Toggle({ on, onChange }) {
  return (
    <div className="a-toggle" onClick={() => onChange(!on)}>
      <div className={`a-toggle-track ${on ? 'on' : ''}`}><div className="a-toggle-thumb" /></div>
      <span className="a-toggle-lbl">{on ? 'Yayında' : 'Taslak'}</span>
    </div>
  );
}

/* ── ImageUpload ─────────────────────────────── */
function ImageSection({ projectId, images, setImages, onToast }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef();

  async function upload(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    for (const file of files) {
      try {
        const { url } = await aUpload(file);
        const img = await aPost(`/api/admin/projects/${projectId}/images`, {
          url, caption_tr: '', caption_en: '', sort_order: images.length * 10,
        });
        setImages(prev => [...prev, img]);
      } catch (err) { onToast(err.message, 'err'); }
    }
    setUploading(false);
    e.target.value = '';
  }

  async function removeImage(id) {
    if (!confirm('Bu görseli silmek istediğinize emin misiniz?')) return;
    await aDelete(`/api/admin/images/${id}`).catch(() => {});
    setImages(prev => prev.filter(i => i.id !== id));
  }

  function updateCaption(id, key, val) {
    setImages(prev => prev.map(i => i.id === id ? { ...i, [key]: val } : i));
  }

  async function saveCaption(img) {
    await aPut(`/api/admin/images/${img.id}`, img).catch(() => {});
  }

  return (
    <div>
      <div className="a-img-grid">
        {images.map(img => (
          <div key={img.id}>
            <div className="a-img-item">
              <img src={img.url} alt="" />
              <button className="a-img-del" onClick={() => removeImage(img.id)} title="Sil">×</button>
            </div>
            <input
              className="a-input a-img-caption"
              placeholder="Açıklama (TR)…"
              value={img.caption_tr || ''}
              onChange={e => updateCaption(img.id, 'caption_tr', e.target.value)}
              onBlur={() => saveCaption(img)}
              style={{ marginTop: 4, fontSize: 11, padding: '4px 8px' }}
            />
          </div>
        ))}
        <div>
          <div className="a-img-add" onClick={() => inputRef.current?.click()}>
            {uploading ? <span style={{ fontSize: 13 }}>Yükleniyor…</span> : <>+<span style={{ fontSize: 11 }}>Görsel Ekle</span></>}
          </div>
          <input ref={inputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={upload} />
        </div>
      </div>
    </div>
  );
}

/* ── Materials ─────────────────────────────────── */
function MaterialsSection({ projectId, items, setItems, onToast }) {
  function add() {
    setItems(prev => [...prev, { _local: Date.now(), name_tr: '', name_en: '', subtitle_tr: '', subtitle_en: '', bg_gradient: '', note: '', sort_order: prev.length * 10 }]);
  }

  async function remove(item) {
    if (item.id) {
      if (!confirm('Silinsin mi?')) return;
      await aDelete(`/api/admin/materials/${item.id}`).catch(() => {});
    }
    setItems(prev => prev.filter(x => (x.id || x._local) !== (item.id || item._local)));
  }

  function update(item, key, val) {
    setItems(prev => prev.map(x => (x.id || x._local) === (item.id || item._local) ? { ...x, [key]: val } : x));
  }

  return (
    <div>
      <div className="a-rows">
        {items.map((m, i) => (
          <div className="a-row-item" key={m.id || m._local}>
            <button className="a-row-del" onClick={() => remove(m)} title="Sil">×</button>
            <div className="a-g3" style={{ marginBottom: 8 }}>
              <div className="a-field">
                <div className="a-lbl">Malzeme Adı (TR)</div>
                <input className="a-input" value={m.name_tr} onChange={e => update(m, 'name_tr', e.target.value)} placeholder="Travertin" />
              </div>
              <div className="a-field">
                <div className="a-lbl">Malzeme Adı (EN)</div>
                <input className="a-input" value={m.name_en} onChange={e => update(m, 'name_en', e.target.value)} placeholder="Travertine" />
              </div>
              <div className="a-field">
                <div className="a-lbl">Alt Başlık (TR)</div>
                <input className="a-input" value={m.subtitle_tr} onChange={e => update(m, 'subtitle_tr', e.target.value)} placeholder="Antalya · No. 04" />
              </div>
            </div>
            <div className="a-g3">
              <div className="a-field">
                <div className="a-lbl">Alt Başlık (EN)</div>
                <input className="a-input" value={m.subtitle_en} onChange={e => update(m, 'subtitle_en', e.target.value)} placeholder="Antalya · No. 04" />
              </div>
              <div className="a-field">
                <div className="a-lbl">Not / Özellik</div>
                <input className="a-input" value={m.note} onChange={e => update(m, 'note', e.target.value)} placeholder="mat · 60 mm" />
              </div>
              <div className="a-field">
                <div className="a-lbl">Renk Gradyanı (CSS)</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div className="a-swatch" style={{ background: m.bg_gradient || '#ccc' }} />
                  <input className="a-input" value={m.bg_gradient} onChange={e => update(m, 'bg_gradient', e.target.value)} placeholder="linear-gradient(135deg,#ece6dc,#d6cdbe)" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button className="a-btn ghost sm a-row-add" onClick={add}>+ Malzeme Ekle</button>
    </div>
  );
}

/* ── Key Facts ─────────────────────────────────── */
function KeyFactsSection({ projectId, items, setItems }) {
  function add() {
    setItems(prev => [...prev, { _local: Date.now(), key_tr: '', key_en: '', value_tr: '', value_en: '', sort_order: prev.length * 10 }]);
  }

  async function remove(item) {
    if (item.id) {
      if (!confirm('Silinsin mi?')) return;
      await aDelete(`/api/admin/key-facts/${item.id}`).catch(() => {});
    }
    setItems(prev => prev.filter(x => (x.id || x._local) !== (item.id || item._local)));
  }

  function update(item, key, val) {
    setItems(prev => prev.map(x => (x.id || x._local) === (item.id || item._local) ? { ...x, [key]: val } : x));
  }

  return (
    <div>
      <div className="a-rows">
        {items.map(kf => (
          <div className="a-row-item" key={kf.id || kf._local}>
            <button className="a-row-del" onClick={() => remove(kf)}>×</button>
            <div className="a-g4">
              <div className="a-field">
                <div className="a-lbl">Başlık (TR)</div>
                <input className="a-input" value={kf.key_tr} onChange={e => update(kf, 'key_tr', e.target.value)} placeholder="Konum" />
              </div>
              <div className="a-field">
                <div className="a-lbl">Başlık (EN)</div>
                <input className="a-input" value={kf.key_en} onChange={e => update(kf, 'key_en', e.target.value)} placeholder="Location" />
              </div>
              <div className="a-field">
                <div className="a-lbl">Değer (TR)</div>
                <input className="a-input" value={kf.value_tr} onChange={e => update(kf, 'value_tr', e.target.value)} placeholder="Karaköy · İstanbul" />
              </div>
              <div className="a-field">
                <div className="a-lbl">Değer (EN)</div>
                <input className="a-input" value={kf.value_en} onChange={e => update(kf, 'value_en', e.target.value)} placeholder="Karaköy · Istanbul" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <button className="a-btn ghost sm a-row-add" onClick={add}>+ Bilgi Satırı Ekle</button>
    </div>
  );
}

/* ── Credits ─────────────────────────────────── */
function CreditsSection({ projectId, items, setItems }) {
  function add() {
    setItems(prev => [...prev, { _local: Date.now(), role_tr: '', role_en: '', value: '', sort_order: prev.length * 10 }]);
  }

  async function remove(item) {
    if (item.id) {
      if (!confirm('Silinsin mi?')) return;
      await aDelete(`/api/admin/credits/${item.id}`).catch(() => {});
    }
    setItems(prev => prev.filter(x => (x.id || x._local) !== (item.id || item._local)));
  }

  function update(item, key, val) {
    setItems(prev => prev.map(x => (x.id || x._local) === (item.id || item._local) ? { ...x, [key]: val } : x));
  }

  return (
    <div>
      <div className="a-rows">
        {items.map(cr => (
          <div className="a-row-item" key={cr.id || cr._local}>
            <button className="a-row-del" onClick={() => remove(cr)}>×</button>
            <div className="a-g3">
              <div className="a-field">
                <div className="a-lbl">Rol (TR)</div>
                <input className="a-input" value={cr.role_tr} onChange={e => update(cr, 'role_tr', e.target.value)} placeholder="Mimar" />
              </div>
              <div className="a-field">
                <div className="a-lbl">Rol (EN)</div>
                <input className="a-input" value={cr.role_en} onChange={e => update(cr, 'role_en', e.target.value)} placeholder="Architect" />
              </div>
              <div className="a-field">
                <div className="a-lbl">Değer / İsim</div>
                <input className="a-input" value={cr.value} onChange={e => update(cr, 'value', e.target.value)} placeholder="Limyra Studio" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <button className="a-btn ghost sm a-row-add" onClick={add}>+ Künye Satırı Ekle</button>
    </div>
  );
}

/* ── Main Editor ─────────────────────────────── */
export default function ProjectEditor() {
  const router = useRouter();
  const [id, setId] = useState('new');
  const isNew = id === 'new';

  const [project, setProject] = useState(EMPTY_PROJECT);
  const [images, setImages] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [keyFacts, setKeyFacts] = useState([]);
  const [credits, setCredits] = useState([]);
  const [savedId, setSavedId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [toast, setToast] = useState(null);

  // Read real ID from actual browser URL (useParams returns baked build-time value)
  useEffect(() => {
    const parts = window.location.pathname.replace(/\/+$/, '').split('/').filter(Boolean);
    const realId = parts[parts.length - 1] || 'new';
    setId(realId);
    if (realId !== 'new') setSavedId(Number(realId));
  }, []);

  useEffect(() => {
    if (id === 'new') return;
    aGet(`/api/admin/projects/${id}`)
      .then(data => {
        if (!data || data.error) { router.replace('/projects'); return; }
        setProject({ ...EMPTY_PROJECT, ...data });
        setImages(data.images || []);
        setMaterials(data.materials || []);
        setKeyFacts(data.key_facts || []);
        setCredits(data.credits || []);
      }).catch(() => router.replace('/projects'));
  }, [id]);

  const set = (k) => (e) => setProject(p => ({ ...p, [k]: e.target.value }));
  const setV = (k, v) => setProject(p => ({ ...p, [k]: v }));

  function showToast(msg, type = 'ok') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleCoverUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setCoverUploading(true);
    try {
      const { url } = await aUpload(file);
      setV('cover_image', url);
    } catch (err) { showToast(err.message, 'err'); }
    finally { setCoverUploading(false); }
  }

  async function handleSave() {
    if (!project.title_tr) { showToast('Türkçe başlık zorunludur.', 'err'); return; }
    if (!project.slug) { showToast('Slug zorunludur.', 'err'); return; }
    setSaving(true);
    try {
      let pid = savedId;
      const payload = { ...project, published: project.published ? 1 : 0 };

      if (isNew && !savedId) {
        const p = await aPost('/api/admin/projects', payload);
        pid = p.id;
        setSavedId(pid);
      } else {
        await aPut(`/api/admin/projects/${pid}`, payload);
      }

      // Save materials
      for (const m of materials) {
        if (m.id) {
          await aPut(`/api/admin/materials/${m.id}`, m).catch(() => {});
        } else {
          const created = await aPost(`/api/admin/projects/${pid}/materials`, { ...m, sort_order: materials.indexOf(m) * 10 }).catch(() => null);
          if (created) setMaterials(prev => prev.map(x => x._local === m._local ? created : x));
        }
      }

      // Save key facts
      for (const kf of keyFacts) {
        if (kf.id) {
          await aPut(`/api/admin/key-facts/${kf.id}`, kf).catch(() => {});
        } else {
          const created = await aPost(`/api/admin/projects/${pid}/key-facts`, { ...kf, sort_order: keyFacts.indexOf(kf) * 10 }).catch(() => null);
          if (created) setKeyFacts(prev => prev.map(x => x._local === kf._local ? created : x));
        }
      }

      // Save credits
      for (const cr of credits) {
        if (cr.id) {
          await aPut(`/api/admin/credits/${cr.id}`, cr).catch(() => {});
        } else {
          const created = await aPost(`/api/admin/projects/${pid}/credits`, { ...cr, sort_order: credits.indexOf(cr) * 10 }).catch(() => null);
          if (created) setCredits(prev => prev.map(x => x._local === cr._local ? created : x));
        }
      }

      showToast('Proje kaydedildi.');
      if (isNew) router.replace(`/projects/${pid}`);
    } catch (e) { showToast(e.message, 'err'); }
    finally { setSaving(false); }
  }

  const pageTitle = isNew ? 'Yeni Proje' : (project.title_tr || 'Proje Düzenle');

  return (
    <AdminShell
      title={pageTitle}
      actions={
        <div className="a-editor-actions">
          <Toggle on={!!project.published} onChange={v => setV('published', v ? 1 : 0)} />
          <button className="a-btn" onClick={handleSave} disabled={saving}>
            {saving ? 'Kaydediliyor…' : 'Kaydet'}
          </button>
        </div>
      }
    >
      <Link href="/projects" className="a-back">← Projelere Dön</Link>

      {isNew && !savedId && (
        <div className="a-notice">
          Projeyi kaydettikten sonra görsel, malzeme ve künye ekleyebilirsiniz.
        </div>
      )}

      {/* ─── 1. Temel Bilgiler ─────────────── */}
      <div className="a-card">
        <div className="a-card-hd">Temel Bilgiler</div>
        <div className="a-g4" style={{ marginBottom: 14 }}>
          <div className="a-field">
            <div className="a-lbl">Proje No.</div>
            <input className="a-input" value={project.number} onChange={set('number')} placeholder="014" />
          </div>
          <div className="a-field">
            <div className="a-lbl">Yıl</div>
            <input className="a-input" type="number" value={project.year} onChange={set('year')} />
          </div>
          <div className="a-field">
            <div className="a-lbl">Alan (m²)</div>
            <input className="a-input" type="number" value={project.area_m2 || ''} onChange={set('area_m2')} placeholder="240" />
          </div>
          <div className="a-field">
            <div className="a-lbl">Sıralama</div>
            <input className="a-input" type="number" value={project.sort_order} onChange={set('sort_order')} />
          </div>
        </div>
        <div className="a-g3" style={{ marginBottom: 14 }}>
          <div className="a-field">
            <div className="a-lbl">Kategori</div>
            <select className="a-sel" value={project.tag} onChange={set('tag')}>
              <option>Residential</option>
              <option>Workspace</option>
              <option>Cultural</option>
              <option>Founding</option>
            </select>
          </div>
          <div className="a-field">
            <div className="a-lbl">Durum</div>
            <select className="a-sel" value={project.status} onChange={set('status')}>
              <option value="Completed">Tamamlandı</option>
              <option value="In Progress">Devam Ediyor</option>
            </select>
          </div>
          <div className="a-field">
            <div className="a-lbl">Slug (URL)</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="a-input" value={project.slug} onChange={set('slug')} placeholder="karakoy-014" />
              <button className="a-btn ghost sm" onClick={() => setV('slug', autoSlug(project.title_tr))}>
                Otomatik
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 2. Başlık & Konum ─────────────── */}
      <div className="a-card">
        <div className="a-card-hd">Başlık & Konum</div>
        <div className="a-g2" style={{ marginBottom: 14 }}>
          <div className="a-field">
            <div className="a-lbl">Başlık (TR) <span className="req">·</span></div>
            <input className="a-input" value={project.title_tr} onChange={set('title_tr')} placeholder="Karaköy Apartmanı" />
          </div>
          <div className="a-field">
            <div className="a-lbl">Başlık (EN)</div>
            <input className="a-input" value={project.title_en} onChange={set('title_en')} placeholder="Karaköy Apartment" />
          </div>
          <div className="a-field">
            <div className="a-lbl">Alt Başlık (TR)</div>
            <input className="a-input" value={project.subtitle_tr} onChange={set('subtitle_tr')} placeholder="Levanten bir yapının yeniden yorumu" />
          </div>
          <div className="a-field">
            <div className="a-lbl">Alt Başlık (EN)</div>
            <input className="a-input" value={project.subtitle_en} onChange={set('subtitle_en')} placeholder="Reinterpretation of a Levantine building" />
          </div>
          <div className="a-field">
            <div className="a-lbl">Konum (TR)</div>
            <input className="a-input" value={project.location_tr} onChange={set('location_tr')} placeholder="İstanbul" />
          </div>
          <div className="a-field">
            <div className="a-lbl">Konum (EN)</div>
            <input className="a-input" value={project.location_en} onChange={set('location_en')} placeholder="Istanbul" />
          </div>
        </div>
      </div>

      {/* ─── 3. Kapak Fotoğrafı ─────────────── */}
      <div className="a-card">
        <div className="a-card-hd">Kapak Fotoğrafı</div>
        <div className="a-cover-box">
          <div className="a-cover-prev">
            {project.cover_image
              ? <img src={project.cover_image} alt="Kapak" />
              : <div className="a-cover-empty" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, opacity: .25 }}>▭</div>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 8 }}>
            <label className="a-btn ghost" style={{ cursor: 'pointer' }}>
              {coverUploading ? 'Yükleniyor…' : (project.cover_image ? 'Kapak Fotoğrafını Değiştir' : 'Kapak Fotoğrafı Yükle')}
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCoverUpload} disabled={coverUploading} />
            </label>
            {project.cover_image && (
              <button className="a-btn ghost" onClick={() => setV('cover_image', null)}>Kaldır</button>
            )}
            <p style={{ fontSize: 12, opacity: .45, margin: 0, maxWidth: 220 }}>
              JPG, PNG veya WebP. Önerilen oran: 2:3 (dikey).
            </p>
          </div>
        </div>
      </div>

      {/* ─── 4. Açıklama ─────────────── */}
      <div className="a-card">
        <div className="a-card-hd">Kısa Açıklama (Listede ve Spotlight&apos;ta Gösterilir)</div>
        <div className="a-g2">
          <div className="a-field">
            <div className="a-lbl">Açıklama (TR)</div>
            <textarea className="a-ta lg" value={project.description_tr} onChange={set('description_tr')} placeholder="Projenin kısa Türkçe açıklaması…" />
          </div>
          <div className="a-field">
            <div className="a-lbl">Açıklama (EN)</div>
            <textarea className="a-ta lg" value={project.description_en} onChange={set('description_en')} placeholder="Short project description in English…" />
          </div>
        </div>
      </div>

      {/* ─── 5. Essay ─────────────── */}
      <div className="a-card">
        <div className="a-card-hd">Proje Yazısı / Essay (Proje Detay Sayfasında Görünür)</div>
        <div className="a-field" style={{ marginBottom: 16 }}>
          <div className="a-lbl">Essay (TR)</div>
          <textarea className="a-ta xl" value={project.essay_tr} onChange={set('essay_tr')} placeholder="Projenin Türkçe anlatımı. Paragrafları boş satırla ayırın." />
        </div>
        <div className="a-field">
          <div className="a-lbl">Essay (EN)</div>
          <textarea className="a-ta xl" value={project.essay_en} onChange={set('essay_en')} placeholder="Project essay in English. Separate paragraphs with blank lines." />
        </div>
      </div>

      {/* ─── 6. Galeri ─────────────── */}
      <div className="a-card">
        <div className="a-card-hd">Proje Galerisi</div>
        {!savedId
          ? <div className="a-notice" style={{ marginBottom: 0 }}>Önce projeyi kaydedin, ardından görsel ekleyebilirsiniz.</div>
          : <ImageSection projectId={savedId} images={images} setImages={setImages} onToast={showToast} />}
      </div>

      {/* ─── 7. Önemli Detaylar ─────────────── */}
      <div className="a-card">
        <div className="a-card-hd">Önemli Detaylar (Bilgi Kutusu)</div>
        {!savedId
          ? <div className="a-notice" style={{ marginBottom: 0 }}>Önce projeyi kaydedin.</div>
          : <KeyFactsSection projectId={savedId} items={keyFacts} setItems={setKeyFacts} />}
      </div>

      {/* ─── 8. Malzemeler ─────────────── */}
      <div className="a-card">
        <div className="a-card-hd">Kullanılan Malzemeler</div>
        {!savedId
          ? <div className="a-notice" style={{ marginBottom: 0 }}>Önce projeyi kaydedin.</div>
          : <MaterialsSection projectId={savedId} items={materials} setItems={setMaterials} onToast={showToast} />}
      </div>

      {/* ─── 9. Künye ─────────────── */}
      <div className="a-card">
        <div className="a-card-hd">Künye (Credits)</div>
        {!savedId
          ? <div className="a-notice" style={{ marginBottom: 0 }}>Önce projeyi kaydedin.</div>
          : <CreditsSection projectId={savedId} items={credits} setItems={setCredits} />}
      </div>

      {/* ─── Save Bottom ─────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 48 }}>
        <a href={savedId ? `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/work/${project.slug}` : '#'} target="_blank" className="a-btn ghost sm">
          Siteyi Önizle →
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Toggle on={!!project.published} onChange={v => setV('published', v ? 1 : 0)} />
          <button className="a-btn" onClick={handleSave} disabled={saving}>
            {saving ? 'Kaydediliyor…' : 'Kaydet'}
          </button>
        </div>
      </div>

      {toast && <Toast {...toast} />}
    </AdminShell>
  );
}
