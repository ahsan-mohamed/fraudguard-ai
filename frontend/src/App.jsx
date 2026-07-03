import { useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ShieldAlert, ShieldCheck, Loader2, Search, SendHorizonal, Activity, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import Login from './Login';
import Navbar from './Navbar';

const API_URL = 'https://fraudguard-ai-backend-rqus.onrender.com';
const defaultForm = {
  amount: '', time: '',
  ...Object.fromEntries(Array.from({ length: 28 }, (_, i) => [`V${i + 1}`, '']))
};

function StatCard({ icon, label, value, color }) {
  return (
    <div style={{
      background: '#111827', borderRadius: 14, padding: '20px 24px',
      border: '1px solid #1f2937', display: 'flex', alignItems: 'center', gap: 16
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#f9fafb' }}>{value}</div>
        <div style={{ fontSize: 12, color: '#6b7280' }}>{label}</div>
      </div>
    </div>
  );
}

function ResultCard({ item }) {
  const isFraud = item.prediction === 'FRAUD';
  return (
    <div style={{
      background: '#111827', borderRadius: 16, padding: 24,
      border: `1px solid ${isFraud ? '#dc2626' : '#10b981'}`,
      marginTop: 20, animation: 'fadeIn 0.4s ease forwards'
    }}>
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {isFraud ? <ShieldAlert size={28} color="#dc2626" /> : <ShieldCheck size={28} color="#10b981" />}
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: isFraud ? '#f87171' : '#34d399' }}>
              {item.prediction}
            </div>
            {item.sample_type && (
              <div style={{ fontSize: 12, color: '#9ca3af', textTransform: 'capitalize' }}>
                {item.sample_type} sample transaction
              </div>
            )}
          </div>
        </div>
        <div style={{ fontSize: 28, fontWeight: 800, color: isFraud ? '#f87171' : '#34d399' }}>
          {item.confidence}%
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ height: 8, borderRadius: 99, background: '#1f2937', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 99,
            width: `${item.confidence}%`,
            background: isFraud
              ? 'linear-gradient(90deg, #dc2626, #f87171)'
              : 'linear-gradient(90deg, #059669, #34d399)',
            transition: 'width 1.2s ease'
          }} />
        </div>
        <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>Fraud Confidence Score</div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <span style={{
          background: isFraud ? '#7f1d1d' : '#064e3b',
          color: isFraud ? '#fca5a5' : '#6ee7b7',
          border: `1px solid ${isFraud ? '#dc2626' : '#10b981'}`,
          borderRadius: 99, padding: '4px 14px', fontSize: 12, fontWeight: 600
        }}>
          {item.confidence > 80 ? '🔴 HIGH RISK' : item.confidence > 40 ? '🟡 MEDIUM RISK' : '🟢 LOW RISK'}
        </span>
      </div>

      <p style={{
        fontSize: 14, lineHeight: 1.7, color: '#d1d5db',
        background: '#0a0e1a', padding: 16, borderRadius: 10, marginBottom: 20
      }}>
        {item.explanation}
      </p>

      <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 8, fontWeight: 600, letterSpacing: 1 }}>
        TOP CONTRIBUTING FEATURES
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart
          data={Object.entries(item.top_features).map(([name, value]) => ({
            name, value: Number(value.toFixed(4))
          }))}
          layout="vertical" margin={{ left: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis type="number" stroke="#6b7280" fontSize={11} />
          <YAxis type="category" dataKey="name" stroke="#6b7280" fontSize={12} width={40} />
          <Tooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: 8, color: '#fff' }} />
          <Bar dataKey="value" fill={isFraud ? '#ef4444' : '#10b981'} radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function App() {
  const [user, setUser]           = useState(null);
  const [loading, setLoading]     = useState(false);
  const [results, setResults]     = useState(null);
  const [singleResult, setSingle] = useState(null);
  const [error, setError]         = useState(null);
  const [form, setForm]           = useState(defaultForm);
  const [activeTab, setActiveTab] = useState('sample');
  const [stats, setStats]         = useState({ total: 0, fraud: 0, normal: 0 });

  if (!user) return <Login onLogin={setUser} />;

  const fetchSample = async () => {
    setLoading(true); setError(null); setResults(null); setSingle(null);
    try {
      const res = await axios.get(`${API_URL}/predict/sample`);
      setResults(res.data.results);
      setStats(prev => ({ total: prev.total + 2, fraud: prev.fraud + 1, normal: prev.normal + 1 }));
    } catch {
      setError('Could not connect to backend. Make sure Flask is running on port 5000.');
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    setLoading(true); setError(null); setResults(null); setSingle(null);
    try {
      const payload = { amount: form.amount, time: form.time };
      for (let i = 1; i <= 28; i++) payload[`V${i}`] = form[`V${i}`] || 0;
      const res = await axios.post(`${API_URL}/predict`, payload);
      setSingle(res.data);
      setStats(prev => ({
        total: prev.total + 1,
        fraud: res.data.prediction === 'FRAUD' ? prev.fraud + 1 : prev.fraud,
        normal: res.data.prediction === 'NORMAL' ? prev.normal + 1 : prev.normal
      }));
    } catch {
      setError('Prediction failed. Check inputs and make sure Flask is running.');
    }
    setLoading(false);
  };

  const tabStyle = (tab) => ({
    padding: '10px 24px', borderRadius: 8, border: 'none', cursor: 'pointer',
    fontWeight: 600, fontSize: 14, transition: 'all 0.2s',
    background: activeTab === tab ? '#3b82f6' : '#1f2937',
    color: activeTab === tab ? 'white' : '#9ca3af'
  });

  const inputStyle = {
    background: '#1f2937', border: '1px solid #374151', borderRadius: 8,
    color: '#e5e7eb', padding: '8px 12px', fontSize: 13,
    width: '100%', boxSizing: 'border-box'
  };

  const spinnerStyle = {
    width: 16, height: 16, border: '2px solid white',
    borderTopColor: 'transparent', borderRadius: '50%',
    animation: 'spin 0.7s linear infinite'
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0e1a', color: '#e5e7eb', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Navbar user={user} onLogout={() => { setUser(null); setStats({ total: 0, fraud: 0, normal: 0 }); }} />

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 20px' }}>

        {/* Welcome */}
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#f9fafb', marginBottom: 4 }}>
            Welcome back, {user.username} 👋
          </h2>
          <p style={{ color: '#6b7280', fontSize: 14 }}>
            Analyze transactions and get AI-powered fraud explanations
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
          <StatCard icon={<Activity size={22} color="#3b82f6" />}      label="Total Analyzed"       value={stats.total}   color="#3b82f6" />
          <StatCard icon={<AlertTriangle size={22} color="#ef4444" />}  label="Fraud Detected"       value={stats.fraud}   color="#ef4444" />
          <StatCard icon={<CheckCircle size={22} color="#10b981" />}    label="Normal Transactions"  value={stats.normal}  color="#10b981" />
          <StatCard icon={<TrendingUp size={22} color="#f59e0b" />}     label="Model ROC-AUC"        value="97.45%"        color="#f59e0b" />
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          <button style={tabStyle('sample')} onClick={() => setActiveTab('sample')}>Sample Detection</button>
          <button style={tabStyle('custom')} onClick={() => setActiveTab('custom')}>Custom Transaction</button>
        </div>

        {/* Sample Tab */}
        {activeTab === 'sample' && (
          <div style={{ background: '#111827', borderRadius: 16, padding: 28, border: '1px solid #1f2937' }}>
            <h3 style={{ color: '#f9fafb', fontWeight: 700, marginBottom: 8 }}>Sample Transaction Analysis</h3>
            <p style={{ color: '#6b7280', fontSize: 13, marginBottom: 20 }}>
              Runs one real fraud + one real normal transaction from the Kaggle Credit Card Fraud dataset
            </p>
            <button onClick={fetchSample} disabled={loading} style={{
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: 'white', border: 'none', padding: '12px 28px',
              borderRadius: 10, fontSize: 15, fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 8,
              opacity: loading ? 0.6 : 1
            }}>
              {loading ? <><div style={spinnerStyle} /> Analyzing...</> : <><Search size={18} /> Run Sample Detection</>}
            </button>
          </div>
        )}

        {/* Custom Tab */}
        {activeTab === 'custom' && (
          <div style={{ background: '#111827', borderRadius: 16, padding: 28, border: '1px solid #1f2937' }}>
            <h3 style={{ color: '#f9fafb', fontWeight: 700, marginBottom: 8 }}>Custom Transaction Analysis</h3>
            <p style={{ color: '#6b7280', fontSize: 13, marginBottom: 20 }}>
              Enter transaction details. V1–V28 are PCA components (leave blank to default 0).
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              <div>
                <label style={{ fontSize: 12, color: '#9ca3af', display: 'block', marginBottom: 4 }}>Amount ($) *</label>
                <input style={inputStyle} type="number" placeholder="e.g. 150.00"
                  value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#9ca3af', display: 'block', marginBottom: 4 }}>Time (seconds) *</label>
                <input style={inputStyle} type="number" placeholder="e.g. 3600"
                  value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} />
              </div>
            </div>

            <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 10, fontWeight: 600 }}>
              PCA COMPONENTS (V1–V28)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 24 }}>
              {Array.from({ length: 28 }, (_, i) => i + 1).map(i => (
                <div key={i}>
                  <label style={{ fontSize: 11, color: '#6b7280', display: 'block', marginBottom: 3 }}>V{i}</label>
                  <input style={inputStyle} type="number" placeholder="0.00"
                    value={form[`V${i}`]} onChange={e => setForm({ ...form, [`V${i}`]: e.target.value })} />
                </div>
              ))}
            </div>

            <button onClick={handleSubmit} disabled={loading || !form.amount || !form.time} style={{
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: 'white', border: 'none', padding: '12px 28px',
              borderRadius: 10, fontSize: 15, fontWeight: 600,
              cursor: (loading || !form.amount || !form.time) ? 'not-allowed' : 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 8,
              opacity: (loading || !form.amount || !form.time) ? 0.5 : 1
            }}>
              {loading ? <><div style={spinnerStyle} /> Analyzing...</> : <><SendHorizonal size={18} /> Analyze Transaction</>}
            </button>
          </div>
        )}

        {error && (
          <div style={{
            background: '#7f1d1d', border: '1px solid #dc2626',
            padding: 16, borderRadius: 10, marginTop: 20, fontSize: 14
          }}>
            {error}
          </div>
        )}

        {results && results.map((item, idx) => <ResultCard key={idx} item={item} />)}
        {singleResult && <ResultCard item={singleResult} />}

      </div>
    </div>
  );
}