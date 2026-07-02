import { useState } from 'react';
import { ShieldAlert, Lock, User, Eye, EyeOff } from 'lucide-react';

const DEMO_USERS = [
  { username: 'analyst', password: 'fraud123', role: 'Senior Analyst' },
  { username: 'admin', password: 'admin123', role: 'Admin' },
];

export default function Login({ onLogin }) {
  const [form, setForm]       = useState({ username: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    setError('');
    setTimeout(() => {
      const user = DEMO_USERS.find(
        u => u.username === form.username && u.password === form.password
      );
      if (user) {
        onLogin(user);
      } else {
        setError('Invalid username or password');
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#0a0e1a',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Inter, system-ui, sans-serif', padding: 20, position: 'relative', overflow: 'hidden'
    }}>

      {/* Animated background blobs */}
      <div style={{
        position: 'absolute', width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)',
        top: -100, left: -100, animation: 'pulse 4s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute', width: 300, height: 300, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(52,211,153,0.1) 0%, transparent 70%)',
        bottom: -50, right: -50, animation: 'pulse 5s ease-in-out infinite reverse'
      }} />

      <style>{`
        @keyframes pulse { 0%,100% { transform: scale(1); opacity: 0.7; } 50% { transform: scale(1.1); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input::placeholder { color: #4b5563; }
        input:focus { outline: none; border-color: #3b82f6 !important; }
      `}</style>

      <div style={{
        background: '#111827', borderRadius: 20, padding: '40px 36px',
        width: '100%', maxWidth: 420, border: '1px solid #1f2937',
        boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
        animation: 'fadeIn 0.5s ease forwards'
      }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16, margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #1d4ed8, #065f46)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(59,130,246,0.3)'
          }}>
            <ShieldAlert size={32} color="white" />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#f9fafb', marginBottom: 6 }}>
            FraudGuard AI
          </h1>
          <p style={{ color: '#6b7280', fontSize: 13 }}>
            Secure access to fraud detection platform
          </p>
        </div>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          <div>
            <label style={{ fontSize: 12, color: '#9ca3af', display: 'block', marginBottom: 6, fontWeight: 600 }}>
              USERNAME
            </label>
            <div style={{ position: 'relative' }}>
              <User size={15} color="#4b5563" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Enter username"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                style={{
                  width: '100%', padding: '12px 12px 12px 36px', borderRadius: 10,
                  background: '#1f2937', border: '1px solid #374151',
                  color: '#f9fafb', fontSize: 14, boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, color: '#9ca3af', display: 'block', marginBottom: 6, fontWeight: 600 }}>
              PASSWORD
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={15} color="#4b5563" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Enter password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                style={{
                  width: '100%', padding: '12px 40px 12px 36px', borderRadius: 10,
                  background: '#1f2937', border: '1px solid #374151',
                  color: '#f9fafb', fontSize: 14, boxSizing: 'border-box'
                }}
              />
              <button onClick={() => setShowPass(!showPass)} style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: '#4b5563'
              }}>
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              background: '#7f1d1d', border: '1px solid #dc2626',
              borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#fca5a5'
            }}>
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading || !form.username || !form.password}
            style={{
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: 'white', border: 'none', borderRadius: 10,
              padding: '13px', fontSize: 15, fontWeight: 700,
              cursor: (loading || !form.username || !form.password) ? 'not-allowed' : 'pointer',
              opacity: (loading || !form.username || !form.password) ? 0.6 : 1,
              marginTop: 4, display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 8
            }}
          >
            {loading ? (
              <>
                <div style={{ width: 16, height: 16, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                Authenticating...
              </>
            ) : 'Sign In'}
          </button>
        </div>

        {/* Demo credentials hint */}
        <div style={{
          marginTop: 24, padding: 14, background: '#0a0e1a',
          borderRadius: 10, border: '1px solid #1f2937'
        }}>
          <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, marginBottom: 8 }}>DEMO CREDENTIALS</div>
          <div style={{ fontSize: 12, color: '#9ca3af', lineHeight: 1.8 }}>
            <span style={{ color: '#60a5fa' }}>analyst</span> / fraud123<br />
            <span style={{ color: '#60a5fa' }}>admin</span> / admin123
          </div>
        </div>

      </div>
    </div>
  );
}