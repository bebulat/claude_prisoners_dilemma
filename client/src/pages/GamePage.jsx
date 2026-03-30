import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import socket from '../socket';
import StrategyForm from '../components/StrategyForm';
import Lobby from '../components/Lobby';
import Results from '../components/Results';

// Persists player identity per game code across page refreshes
function getStoredPlayer(code) {
  try {
    const raw = localStorage.getItem(`pd_player_${code}`);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function storePlayer(code, data) {
  localStorage.setItem(`pd_player_${code}`, JSON.stringify(data));
}

export default function GamePage() {
  const { code } = useParams();
  const [phase, setPhase] = useState('join'); // join | strategy | lobby | results
  const [nameInput, setNameInput] = useState('');
  const [joinError, setJoinError] = useState('');
  const [player, setPlayer] = useState(null);
  const [game, setGame] = useState(null);
  const [lobbyPlayers, setLobbyPlayers] = useState([]);
  const [results, setResults] = useState(null);

  useEffect(() => {
    socket.connect();

    // Try reconnect if we have stored identity for this game
    const stored = getStoredPlayer(code);
    if (stored) {
      socket.emit('player:join', { gameCode: code, name: stored.name, playerId: stored.id });
    }

    socket.on('join:success', ({ playerId, player: p, game: g }) => {
      storePlayer(code, { id: playerId, name: p.name });
      setPlayer(p);
      setGame(g);

      if (g.status === 'complete' && g.results) {
        setResults(g.results);
        setPhase('results');
      } else if (p.ready) {
        setPhase('lobby');
      } else {
        setPhase('strategy');
      }
    });

    socket.on('join:error', ({ message }) => {
      setJoinError(message);
    });

    socket.on('lobby:update', ({ players, status }) => {
      setLobbyPlayers(players);
      if (status === 'complete') setPhase('results');
    });

    socket.on('game:started', () => {
      setPhase('results');
    });

    socket.on('game:results', (r) => {
      setResults(r);
      setPhase('results');
    });

    return () => {
      socket.off('join:success');
      socket.off('join:error');
      socket.off('lobby:update');
      socket.off('game:started');
      socket.off('game:results');
      socket.disconnect();
    };
  }, [code]);

  function handleJoin(e) {
    e.preventDefault();
    const name = nameInput.trim();
    if (!name) return;
    setJoinError('');
    socket.emit('player:join', { gameCode: code, name });
  }

  function handleStrategySubmit(strategy) {
    socket.emit('player:strategy', { gameCode: code, playerId: player.id, strategy });
    setPlayer((p) => ({ ...p, strategy, ready: true }));
    setPhase('lobby');
  }

  if (phase === 'join') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <p className="text-slate-400 text-sm mb-1">Joining game</p>
            <h1 className="text-4xl font-mono font-bold text-white tracking-widest">{code}</h1>
          </div>
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8">
            <form onSubmit={handleJoin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Your Name</label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => { setNameInput(e.target.value); setJoinError(''); }}
                  placeholder="Enter your name"
                  maxLength={30}
                  autoFocus
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              {joinError && <p className="text-red-400 text-sm">{joinError}</p>}
              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Enter
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'strategy') {
    return (
      <div className="min-h-screen px-4 py-8">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-slate-400 text-sm mb-1">
              Playing as <span className="text-white font-medium">{player?.name}</span>
            </p>
            <h1 className="text-3xl font-bold text-white">Define Your Strategy</h1>
            <p className="text-slate-400 mt-2">
              These 5 decisions will determine your behaviour in every match.
            </p>
          </div>
          {game?.settings && (
            <PayoffInfo payoff={game.settings.payoff} rounds={game.settings.rounds} />
          )}
          <StrategyForm onSubmit={handleStrategySubmit} />
        </div>
      </div>
    );
  }

  if (phase === 'lobby') {
    return (
      <Lobby
        player={player}
        players={lobbyPlayers}
        gameCode={code}
        settings={game?.settings}
      />
    );
  }

  if (phase === 'results' && results) {
    return (
      <div className="min-h-screen px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white">Results</h1>
            <p className="text-slate-400 mt-1">Game code: <span className="font-mono text-white">{code}</span></p>
          </div>
          <Results results={results} settings={game?.settings} myId={player?.id} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center text-slate-400">
      Waiting for game...
    </div>
  );
}

function PayoffInfo({ payoff, rounds }) {
  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 mb-6 text-sm">
      <p className="text-slate-400 mb-2 font-medium">Game settings: {rounds} rounds &middot; Years in prison per round (lower is better)</p>
      <div className="grid grid-cols-2 gap-2">
        <div className="flex justify-between">
          <span className="text-slate-400">Both stay silent</span>
          <span className="text-emerald-400 font-semibold">{payoff.bothSilent} yr each</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Both confess</span>
          <span className="text-red-400 font-semibold">{payoff.bothConfess} yrs each</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">You confess, they don't</span>
          <span className="text-amber-400 font-semibold">{payoff.iConfessTheySilent} / {payoff.iSilentTheyConfess} yrs</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">They confess, you don't</span>
          <span className="text-amber-400 font-semibold">{payoff.iSilentTheyConfess} / {payoff.iConfessTheySilent} yrs</span>
        </div>
      </div>
    </div>
  );
}
