import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DEFAULT_PAYOFF = {
  bothConfess: 2,
  iConfessTheySilent: 0,
  iSilentTheyConfess: 3,
  bothSilent: 1,
};

function useAdminAuth() {
  const [password, setPasswordState] = useState(() => sessionStorage.getItem('adminPassword') || '');
  const setPassword = (p) => { setPasswordState(p); sessionStorage.setItem('adminPassword', p); };
  const clearPassword = () => { setPasswordState(''); sessionStorage.removeItem('adminPassword'); };
  return { password, setPassword, clearPassword };
}

export default function Admin() {
  const { password, setPassword, clearPassword } = useAdminAuth();
  const [loginInput, setLoginInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [games, setGames] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ rounds: 10, payoff: DEFAULT_PAYOFF });
  const navigate = useNavigate();

  useEffect(() => {
    if (password) loadGames();
  }, [password]);

  async function handleLogin(e) {
    e.preventDefault();
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: loginInput }),
    });
    if (res.ok) {
      setPassword(loginInput);
      setLoginError('');
    } else {
      setLoginError('Invalid password');
    }
  }

  async function loadGames() {
    const res = await fetch('/api/admin/games', {
      headers: { 'x-admin-password': password },
    });
    if (res.ok) setGames(await res.json());
  }

  async function createGame(e) {
    e.preventDefault();
    setCreating(true);
    const res = await fetch('/api/admin/games', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify(form),
    });
    setCreating(false);
    if (res.ok) {
      setShowCreate(false);
      loadGames();
    }
  }

  function updatePayoff(field, value) {
    setForm((f) => ({ ...f, payoff: { ...f.payoff, [field]: Number(value) } }));
  }

  if (!password) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white">Admin</h1>
          </div>
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                <input
                  type="password"
                  value={loginInput}
                  onChange={(e) => setLoginInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                  placeholder="Admin password"
                />
              </div>
              {loginError && <p className="text-red-400 text-sm">{loginError}</p>}
              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Sign In
              </button>
            </form>
          </div>
          <div className="text-center mt-4">
            <a href="/" className="text-slate-500 hover:text-slate-300 text-sm">Back to home</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <div className="flex gap-3">
            <button
              onClick={() => { setShowCreate(true); }}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-5 py-2 rounded-lg transition-colors"
            >
              New Game
            </button>
            <button
              onClick={clearPassword}
              className="text-slate-400 hover:text-white text-sm px-3 py-2 rounded-lg border border-slate-700 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>

        {/* Create game modal */}
        {showCreate && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 w-full max-w-md">
              <h2 className="text-xl font-bold text-white mb-6">New Game Session</h2>
              <form onSubmit={createGame} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Number of Rounds
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={form.rounds}
                    onChange={(e) => setForm((f) => ({ ...f, rounds: Number(e.target.value) }))}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Years in Prison per Round
                  </label>
                  <p className="text-slate-500 text-xs mb-3">Lower = less time served = better outcome</p>
                  <div className="space-y-2">
                    {[
                      { key: 'bothSilent', label: 'Both stay silent (both cooperate)' },
                      { key: 'iConfessTheySilent', label: 'I confess, they stay silent (I go free)' },
                      { key: 'iSilentTheyConfess', label: 'I stay silent, they confess (I get max)' },
                      { key: 'bothConfess', label: 'Both confess (both betray)' },
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center justify-between gap-4">
                        <span className="text-slate-300 text-sm flex-1">{label}</span>
                        <input
                          type="number"
                          value={form.payoff[key]}
                          onChange={(e) => updatePayoff(key, e.target.value)}
                          className="w-20 bg-slate-900 border border-slate-600 rounded px-3 py-1 text-white text-center focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreate(false)}
                    className="flex-1 py-2 rounded-lg border border-slate-600 text-slate-300 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {creating ? 'Creating...' : 'Create Game'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Games list */}
        {games.length === 0 ? (
          <div className="text-center text-slate-500 py-16">
            No games yet. Create one to get started.
          </div>
        ) : (
          <div className="space-y-3">
            {games.map((game) => (
              <div
                key={game.code}
                className="bg-slate-800 rounded-xl border border-slate-700 p-5 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-mono text-lg font-bold text-white tracking-widest">
                      {game.code}
                    </span>
                    <StatusBadge status={game.status} />
                  </div>
                  <p className="text-slate-400 text-sm">
                    {game.players.length} player{game.players.length !== 1 ? 's' : ''} &middot;{' '}
                    {game.settings.rounds} rounds &middot;{' '}
                    {new Date(game.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => navigate(`/admin/game/${game.code}`)}
                  className="text-emerald-400 hover:text-emerald-300 text-sm font-medium"
                >
                  Manage &rarr;
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    waiting: 'bg-yellow-900/50 text-yellow-300 border-yellow-700',
    playing: 'bg-blue-900/50 text-blue-300 border-blue-700',
    complete: 'bg-emerald-900/50 text-emerald-300 border-emerald-700',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${styles[status]}`}>
      {status}
    </span>
  );
}
