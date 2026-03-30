import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleJoin(e) {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;

    try {
      const res = await fetch(`/api/games/${trimmed}`);
      if (!res.ok) {
        setError('Game not found. Check the code and try again.');
        return;
      }
      const game = await res.json();
      if (game.status === 'complete') {
        navigate(`/game/${trimmed}`);
        return;
      }
      if (game.status !== 'waiting') {
        setError('This game has already started.');
        return;
      }
      navigate(`/game/${trimmed}`);
    } catch {
      setError('Could not connect to the server.');
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-3">Prisoner's Dilemma</h1>
          <p className="text-slate-400 text-lg">
            You have the code. Will you cooperate?
          </p>
        </div>

        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8">
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Game Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(''); }}
                placeholder="e.g. A3F9B2"
                maxLength={6}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white text-center text-2xl tracking-widest font-mono placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 uppercase"
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Join Game
            </button>
          </form>
        </div>

        <div className="text-center mt-6">
          <a href="/admin" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
            Admin access
          </a>
        </div>
      </div>
    </div>
  );
}
