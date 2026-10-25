import { useState } from 'react';
import { api } from '../api';
import Notice from './Notice';

export default function Login({ onLogin }) {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const isRegister = mode === 'register';

  function switchMode() {
    setMode(isRegister ? 'login' : 'register');
    setError('');
  }

  async function submit(e) {
    e.preventDefault();
    setError('');

    if (isRegister && password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setBusy(true);
    try {
      const data = isRegister
        ? await api.register(username, password)
        : await api.login(username, password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username);
      onLogin(data.token);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="login-wrap">
      <form className="box stack login" onSubmit={submit}>
        <p className="muted">INVOICELY</p>
        <p className='tagline'>Smarter billing for growing businesses</p>
        <h1>{isRegister ? 'Create account' : 'Sign in'}</h1>

        <input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)}
          autoComplete="username" required autoFocus />
        <input type="password" placeholder="Password (min 6 characters)" value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={isRegister ? 'new-password' : 'current-password'} required />
        {isRegister && (
          <input type="password" placeholder="Confirm password" value={confirm}
            onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" required />
        )}

        <button className="primary" disabled={busy}>
          {busy ? 'Please wait…' : isRegister ? 'Create account' : 'Sign in'}
        </button>

        <button type="button" onClick={switchMode}
          style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', font: 'inherit', padding: 0 }}>
          {isRegister ? 'Already have an account? Sign in' : 'New here? Create an account'}
        </button>

        <Notice notice={error ? { type: 'error', text: error } : null} />
      </form>
    </div>
  );
}
