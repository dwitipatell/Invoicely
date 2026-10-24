import { useState } from 'react';
import { api } from '../api';
import Notice from './Notice';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { token } = await api.login(username, password);
      localStorage.setItem('token', token);
      onLogin(token);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-wrap">
      <form className="box stack login" onSubmit={submit}>
        <h1>Sign in</h1>
        <p className="muted">Super Market Billing System</p>
        <input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required autoFocus />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button className="primary" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        <Notice notice={error ? { type: 'error', text: error } : null} />
      </form>
    </div>
  );
}
