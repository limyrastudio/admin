'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminLogin } from '../../lib/admin-api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      await adminLogin(email, password);
      router.push('/');
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="a-login-page">
      <div className="a-login-box">
        <div className="a-login-logo">Limyra Studio</div>
        <div className="a-login-sub">Admin Panel</div>

        <form onSubmit={handleSubmit}>
          <div className="a-login-field">
            <div className="a-lbl">E-posta</div>
            <input
              className="a-input" type="email" placeholder="eda@limyra.studio"
              value={email} onChange={e => setEmail(e.target.value)} required autoFocus
            />
          </div>
          <div className="a-login-field">
            <div className="a-lbl">Şifre</div>
            <input
              className="a-input" type="password" placeholder="••••••••"
              value={password} onChange={e => setPassword(e.target.value)} required
            />
          </div>
          {err && <p style={{ color: '#e74c3c', fontSize: 13, marginBottom: 12 }}>{err}</p>}
          <button className="a-btn" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
            {loading ? 'Giriş yapılıyor…' : 'Giriş Yap →'}
          </button>
        </form>
      </div>
    </div>
  );
}
