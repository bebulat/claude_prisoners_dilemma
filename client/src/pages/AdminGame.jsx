import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Results from '../components/Results';

export default function AdminGame() {
  const { code } = useParams();
  const navigate = useNavigate();
  const password = sessionStorage.getItem('adminPassword') || '';
  const [game, setGame] = useState(null);
  const [error, setError] = useState('');
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState('');

  const loadGame = useCallback(async () => {
    const res = await fetch(`/api/admin/games/${code}`, {
      headers: { 'x-admin-password': password },
    });
    if (!res.ok) {
      setError('Could not load game. Are you signed in as admin?');
      return;
    }
    setGame(await res.json());
  }, [code, password]);

  useEffect(() => {
    if (!password) { navigate('/admin'); return; }
    loadGame();
    const interval = setInterval(loadGame, 3000);
    return () => clearInterval(interval);
  }, [loadGame, password, navigate]);

  async function startGame() {
    setStarting(true);
    setStartError('');
    const res = await fetch(`/api/admin/games/${code}/start`, {
      method: 'POST',
      headers: { 'x-admin-password': password },
    });
    setStarting(false);
    if (!res.ok) {
      const data = await res.json();
      setStartError(data.error || 'Failed to start game');
    } else {
      loadGame();
    }
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400">
        {error}
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        Loading...
      </div>
    );
  }

  const readyCount = game.players.filter((p) => p.ready).length;

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/admin')} className="text-slate-400 hover:text-white">
            &larr; Dashboard
          </button>
          <h1 className="text-3xl font-bold text-white font-mono tracking-widest">{code}</h1>
        </div>

        {/* Settings summary */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 mb-6">
          <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">Settings</h2>
          <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            <div>
              <p className="text-slate-400">Rounds</p>
              <p className="text-white font-semibold">{game.settings.rounds}</p>
            </div>
            <div>
              <p className="text-slate-400">Both confess</p>
              <p className="text-red-400 font-semibold">{game.settings.payoff.bothConfess} yrs</p>
            </div>
            <div>
              <p className="text-slate-400">Both silent</p>
              <p className="text-emerald-400 font-semibold">{game.settings.payoff.bothSilent} yr</p>
            </div>
            <div>
              <p className="text-slate-400">Betray / Suckered</p>
              <p className="text-white font-semibold">
                {game.settings.payoff.iConfessTheySilent} / {game.settings.payoff.iSilentTheyConfess} yrs
              </p>
            </div>
          </div>
        </div>

        {/* Share link */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 mb-6">
          <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">Player Link</h2>
          <div className="flex items-center gap-3">
            <code className="flex-1 text-emerald-300 text-sm bg-slate-900 px-3 py-2 rounded-lg break-all">
              {window.location.origin}/game/{code}
            </code>
            <button
              onClick={() => navigator.clipboard.writeText(`${window.location.origin}/game/${code}`)}
              className="text-slate-400 hover:text-white text-sm px-3 py-2 border border-slate-600 rounded-lg whitespace-nowrap"
            >
              Copy
            </button>
          </div>
        </div>

        {/* Player list */}
        {game.status === 'waiting' && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
                Players ({readyCount}/{game.players.length} ready)
              </h2>
              <button onClick={loadGame} className="text-slate-400 hover:text-white text-sm">
                Refresh
              </button>
            </div>
            {game.players.length === 0 ? (
              <p className="text-slate-500 text-sm">Waiting for players to join...</p>
            ) : (
              <ul className="space-y-2">
                {game.players.map((p) => (
                  <li key={p.id} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0">
                    <span className="text-white">{p.name}</span>
                    {p.ready ? (
                      <span className="text-emerald-400 text-sm">Strategy set</span>
                    ) : (
                      <span className="text-yellow-500 text-sm">Setting strategy...</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Start button */}
        {game.status === 'waiting' && (
          <div className="space-y-2">
            {startError && <p className="text-red-400 text-sm">{startError}</p>}
            <button
              onClick={startGame}
              disabled={starting || readyCount < 2}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl text-lg transition-colors"
            >
              {starting ? 'Starting...' : `Start Game (${readyCount} players ready)`}
            </button>
            {readyCount < 2 && (
              <p className="text-slate-500 text-sm text-center">
                Need at least 2 players with strategies to start
              </p>
            )}
          </div>
        )}

        {/* Results */}
        {game.status === 'complete' && game.results && (
          <Results results={game.results} settings={game.settings} />
        )}
      </div>
    </div>
  );
}
