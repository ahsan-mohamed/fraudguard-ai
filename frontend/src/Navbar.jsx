import { ShieldAlert, LogOut, User } from 'lucide-react';

export default function Navbar({ user, onLogout }) {
  return (
    <div style={{
      background: '#111827', borderBottom: '1px solid #1f2937',
      padding: '14px 32px', display: 'flex',
      justifyContent: 'space-between', alignItems: 'center',
      position: 'sticky', top: 0, zIndex: 100,
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'linear-gradient(135deg, #1d4ed8, #065f46)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <ShieldAlert size={20} color="white" />
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#f9fafb' }}>FraudGuard AI</div>
          <div style={{ fontSize: 10, color: '#6b7280' }}>Detection & Explainability Platform</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(135deg, #3b82f6, #10b981)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <User size={16} color="white" />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#f9fafb' }}>{user.username}</div>
            <div style={{ fontSize: 11, color: '#6b7280' }}>{user.role}</div>
          </div>
        </div>

        <button onClick={onLogout} style={{
          background: '#1f2937', border: '1px solid #374151',
          borderRadius: 8, padding: '7px 14px', color: '#9ca3af',
          cursor: 'pointer', display: 'flex', alignItems: 'center',
          gap: 6, fontSize: 13, fontWeight: 500
        }}>
          <LogOut size={14} />
          Logout
        </button>
      </div>
    </div>
  );
}