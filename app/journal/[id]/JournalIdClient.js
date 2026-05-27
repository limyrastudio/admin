'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminShell from '../../../components/AdminShell';
import Link from 'next/link';
import { aGet, aPost, aPut, aUpload } from '../../../lib/admin-api';

const EMPTY = {
  slug: '', kind: 'Essay', title_tr: '', title_en: '',
  excerpt_tr: '', excerpt_en: '', body_tr: '', body_en: '',
  author: '', cover_image: null, read_time: 5,
  published_at: new Date().toISOString().slice(0, 16), published: 1,
};

function Toast({ msg, type }) {
  if (!msg) return null;
  return <div className={`a-toast ${type}`}>{msg}</div>;
}

function Toggle({ on, onChange, label }) {
  return (
    <div className="a-toggle" onClick={() => onChange(!on)}>
      <div className={`a-toggle-track ${on ? 'on' : ''}`}>
        <div className="a-toggle-thumb" />
      </div>
      <span className="a-toggle-lbl">{label || (on ? 'Yayında' : 'Taslak')}</span>
    </div>
  );
}

export default function JournalIdClient() {
  const router = useRouter();
  const [id, setId] = useState('new');
  const isNew = id === 'new';
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState(null);

  // Read real ID from actual browser URL (useParams returns baked build-time value)
  useEffect(() => {
    const parts = window.location.pathname.replace(/\/+$/, '').split('/').filter(Boolean);
    setId(parts[parts.length - 1] || 'new');
  }, []);

  useEffect(() => {
    if (id === 'new') return;
    aGet(`/api/admin/journal`).then(posts => {
      const p = posts.find(x => x.id === Number(id));
      if (p) setForm({ ...EMPTY, ...p, published_at: p.published_at?.slice(0, 16) || EMPTY.published_at });
      else router.replace('/journal');
    }).catch(() => router.replace('/journal'));
  }, [id]);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const setV = (k, v) => setForm(f => ({ ...f, [k]: v }));

  function autoSlug(title) {
    return title.toLowerCase()
      .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
      .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  function showToast(msg, type = 'ok') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleCoverUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await aUpload(file);
      setV('cover_image', url);
    } catch (err) { showToast(err.message, 'err'); }
    finally { setUploading(false); }
  }

  async function handleSave() {
    if (!form.title_tr) { showToast('Başlık zorunludur.', 'err'); return; }
    if (!form.slug) { showToast('Slug zorunludur.', 'err'); return; }
    setSaving(true);
    try {
      const payload = { ...form, published: form.published ? 1 : 0 };
      if (isNew) {
        const p = await aPost('/api/admin/journal', payload);
        showToast('Yazı oluşturuldu.');
        router.replace(`/journal/${p.id}`);
      } else {
        await aPut(`/api/admin/journal/${id}`, payload);
        showToast('Kaydedildi.');
      }
    } catch (e) { showToast(e.message, 'err'); }
    finally { setSaving(false); }
  }

  const title = isNew ? 'Yeni Yazı' : (form.title_tr || 'Yazı Düzenle');

  return (
    <AdminShell
      title={title}
      actions={
        <div className="a-editor-actions">
          <Toggle on={!!form.published} onChange={v => setV('published', v ? 1 : 0)} />
          <button className="a-btn" onClick={handleSave} disabled={saving}>
            {saving ? 'Kaydediliyor…' : 'Kaydet'}
          </button>
        </div>
      }
    >
      <Link href="/journal" className="a-back">← Yazılara Dön</Link>

      {/* Temel Bilgiler */}
      <div className="a-card">
        <div className="a-card-hd">Temel Bilgiler</div>
        <div className="a-g4" style={{ marginBottom: 14 }}>
          <div className="a-field">
            <div className="a-lbl">Tür</div>
            <select className="a-sel" value={form.kind} onChange={set('kind')}>
              <option>Essay</option>
              <option>Field Note</option>
              <option>Konuşma</option>
              <option>Book</option>
            </select>
          </div>
          <div className="a-field">
            <div className="a-lbl">Yazar</div>
            <input className="a-input" value={form.author} onChange={set('author')} placeholder="Eda Aksel" />
          </div>
          <div className="a-field">
            <div className="a-lbl">Okuma Süresi (dk)</div>
            <input className="a-input" type="number" value={form.read_time} onChange={set('read_time')} />
          </div>
          <div className="a-field">
            <div className="a-lbl">Yayın Tarihi</div>
            <input className="a-input" type="datetime-local" value={form.published_at} onChange={set('published_at')} />
          </div>
        </div>
        <div className="a-field">
          <div className="a-lbl">Slug (URL) <span style={{ opacity: .5, fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>— /journal/…</span></div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="a-input" value={form.slug} onChange={set('slug')} placeholder="bir-esigin-kisa-tarihi" />
            <button className="a-btn ghost sm" onClick={() => setV('slug', autoSlug(form.title_tr))}>
              Otomatik
            </button>
          </div>
        </div>
      </div>

      {/* Başlık */}
      <div className="a-card">
        <div className="a-card-hd">Başlık</div>
        <div className="a-g2">
          <div className="a-field">
            <div className="a-lbl">Başlık (TR) <span className="req">·</span></div>
            <input className="a-input" value={form.title_tr} onChange={set('title_tr')} placeholder="Bir eşiğin kısa tarihi" />
          </div>
          <div className="a-field">
            <div className="a-lbl">Başlık (EN)</div>
            <input className="a-input" value={form.title_en} onChange={set('title_en')} placeholder="A brief history of a threshold" />
          </div>
        </div>
      </div>

      {/* Özet */}
      <div className="a-card">
        <div className="a-card-hd">Özet (Kart Görünümünde Gösterilir)</div>
        <div className="a-g2">
          <div className="a-field">
            <div className="a-lbl">Özet (TR)</div>
            <textarea className="a-ta" value={form.excerpt_tr} onChange={set('excerpt_tr')} placeholder="Kısa özet…" />
          </div>
          <div className="a-field">
            <div className="a-lbl">Özet (EN)</div>
            <textarea className="a-ta" value={form.excerpt_en} onChange={set('excerpt_en')} placeholder="Short excerpt…" />
          </div>
        </div>
      </div>

      {/* Kapak Fotoğrafı */}
      <div className="a-card">
        <div className="a-card-hd">Kapak Fotoğrafı</div>
        <div className="a-cover-box">
          <div className="a-cover-prev">
            {form.cover_image
              ? <img src={form.cover_image} alt="Kapak" />
              : <div className="a-cover-empty">🖼</div>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 8 }}>
            <label className="a-btn ghost" style={{ cursor: 'pointer' }}>
              {uploading ? 'Yükleniyor…' : (form.cover_image ? 'Görseli Değiştir' : 'Görsel Yükle')}
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCoverUpload} />
            </label>
            {form.cover_image && (
              <button className="a-btn ghost" onClick={() => setV('cover_image', null)}>Kaldır</button>
            )}
          </div>
        </div>
      </div>

      {/* İçerik */}
      <div className="a-card">
        <div className="a-card-hd">İçerik</div>
        <div className="a-field" style={{ marginBottom: 18 }}>
          <div className="a-lbl">İçerik (TR)</div>
          <textarea className="a-ta xl" value={form.body_tr} onChange={set('body_tr')} placeholder="Yazının Türkçe içeriği. Paragrafları boş satırla ayırın." />
        </div>
        <div className="a-field">
          <div className="a-lbl">İçerik (EN)</div>
          <textarea className="a-ta xl" value={form.body_en} onChange={set('body_en')} placeholder="English content. Separate paragraphs with blank lines." />
        </div>
      </div>

      {/* Save bottom */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingBottom: 40 }}>
        <Toggle on={!!form.published} onChange={v => setV('published', v ? 1 : 0)} />
        <button className="a-btn" onClick={handleSave} disabled={saving}>
          {saving ? 'Kaydediliyor…' : 'Kaydet'}
        </button>
      </div>

      {toast && <Toast {...toast} />}
    </AdminShell>
  );
}
