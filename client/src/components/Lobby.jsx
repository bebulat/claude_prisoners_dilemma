export default function Lobby({ player, players, gameCode, settings }) {
  const readyCount = players.filter((p) => p.ready).length;
  const total = players.length;

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <p className="text-slate-400 text-sm mb-1">
            Playing as <span className="text-white font-medium">{player?.name}</span> in game{' '}
            <span className="font-mono text-white">{gameCode}</span>
          </p>
          <h1 className="text-3xl font-bold text-white">Waiting Room</h1>
        </div>

        {/* Strategy locked confirmation */}
        <div className="bg-emerald-900/30 border border-emerald-700 rounded-xl p-4 mb-6 text-center">
          <p className="text-emerald-300 font-medium">Strategy locked in</p>
          <p className="text-emerald-400/70 text-sm mt-1">
            Waiting for the admin to start the game
          </p>
        </div>

        {/* Settings */}
        {settings && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 mb-6 text-sm">
            <p className="text-slate-400">
              <span className="text-white font-medium">{settings.rounds} rounds</span> per match &middot;{' '}
              Round-robin tournament
            </p>
          </div>
        )}

        {/* Player list */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
              Players
            </h2>
            <span className="text-sm text-slate-400">
              {readyCount}/{total} ready
            </span>
          </div>

          {players.length === 0 ? (
            <p className="text-slate-500 text-sm">No players yet...</p>
          ) : (
            <ul className="space-y-2">
              {players.map((p) => (
                <li
                  key={p.id}
                  className={`flex items-center justify-between py-2.5 px-3 rounded-lg ${
                    p.id === player?.id ? 'bg-slate-700' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-white">
                      {p.name}
                      {p.id === player?.id && (
                        <span className="text-slate-400 text-xs ml-2">(you)</span>
                      )}
                    </span>
                  </div>
                  {p.ready ? (
                    <span className="text-emerald-400 text-sm flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                      Ready
                    </span>
                  ) : (
                    <span className="text-yellow-500 text-sm flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-yellow-500 inline-block animate-pulse" />
                      Thinking...
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <p className="text-center text-slate-600 text-sm mt-8">
          Strategies are hidden until the game ends
        </p>
      </div>
    </div>
  );
}
