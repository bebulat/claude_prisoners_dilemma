import { useState } from 'react';

function Move({ move }) {
  if (move === 'confess') {
    return (
      <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-red-900/50 text-red-300">
        C
      </span>
    );
  }
  return (
    <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-emerald-900/50 text-emerald-300">
      S
    </span>
  );
}

function MatchCard({ match, leaderboard, myId }) {
  const [open, setOpen] = useState(false);

  const p1IsMe = match.player1.id === myId;
  const p2IsMe = match.player2.id === myId;

  const p1Strategy = leaderboard.find((e) => e.id === match.player1.id)?.strategy;
  const p2Strategy = leaderboard.find((e) => e.id === match.player2.id)?.strategy;

  const winner =
    match.scores.p1 > match.scores.p2
      ? match.player1.name
      : match.scores.p2 > match.scores.p1
      ? match.player2.name
      : null;

  return (
    <div
      className={`bg-slate-800 rounded-xl border overflow-hidden ${
        p1IsMe || p2IsMe ? 'border-emerald-700' : 'border-slate-700'
      }`}
    >
      {/* Match header */}
      <button
        className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-slate-700/50 transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <PlayerScore
            name={match.player1.name}
            score={match.scores.p1}
            isWinner={match.scores.p1 > match.scores.p2}
            isMe={p1IsMe}
          />
          <span className="text-slate-500 text-sm shrink-0">vs</span>
          <PlayerScore
            name={match.player2.name}
            score={match.scores.p2}
            isWinner={match.scores.p2 > match.scores.p1}
            isMe={p2IsMe}
            reverse
          />
        </div>
        <span className="text-slate-500 ml-4 shrink-0">{open ? '▲' : '▼'}</span>
      </button>

      {/* Expanded detail */}
      {open && (
        <div className="border-t border-slate-700 px-5 py-4">
          {/* Strategy comparison */}
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <StrategyDisplay name={match.player1.name} strategy={p1Strategy} />
            <StrategyDisplay name={match.player2.name} strategy={p2Strategy} />
          </div>

          {/* Round history */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-500 border-b border-slate-700">
                  <th className="py-2 text-left">Round</th>
                  <th className="py-2 text-center">{match.player1.name}</th>
                  <th className="py-2 text-center">{match.player2.name}</th>
                  <th className="py-2 text-right">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {match.rounds.map((r) => (
                  <tr key={r.round} className="text-slate-300">
                    <td className="py-1.5 text-slate-500">{r.round}</td>
                    <td className="py-1.5 text-center">
                      <Move move={r.p1Move} />
                    </td>
                    <td className="py-1.5 text-center">
                      <Move move={r.p2Move} />
                    </td>
                    <td className="py-1.5 text-right font-mono text-xs">
                      +{r.p1Score} / +{r.p2Score}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-slate-600 font-bold">
                  <td className="py-2 text-slate-400" colSpan={3}>Total</td>
                  <td className="py-2 text-right font-mono">
                    {match.scores.p1} / {match.scores.p2}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function PlayerScore({ name, score, isWinner, isMe, reverse }) {
  return (
    <div className={`flex items-center gap-2 min-w-0 ${reverse ? 'flex-row-reverse text-right' : ''}`}>
      <div className="min-w-0">
        <p className={`font-medium truncate ${isMe ? 'text-emerald-300' : 'text-white'}`}>
          {name}
          {isMe && <span className="text-xs text-emerald-500 ml-1">you</span>}
        </p>
        <p className={`text-lg font-bold ${isWinner ? 'text-yellow-400' : 'text-slate-300'}`}>
          {score}
        </p>
      </div>
    </div>
  );
}

const STRATEGY_ROWS = [
  { key: 'firstRound', label: 'First round' },
  { key: 'afterBothConfess', label: 'Both confessed' },
  { key: 'afterIConfessTheySilent', label: 'I confessed, they silent' },
  { key: 'afterISilentTheyConfess', label: 'I silent, they confessed' },
  { key: 'afterBothSilent', label: 'Both silent' },
];

function StrategyDisplay({ name, strategy }) {
  if (!strategy) return null;
  return (
    <div>
      <p className="text-slate-400 text-xs font-medium mb-2">{name}'s strategy</p>
      <div className="space-y-1">
        {STRATEGY_ROWS.map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between gap-2">
            <span className="text-slate-500 text-xs">{label}</span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded ${
                strategy[key] === 'confess'
                  ? 'bg-red-900/50 text-red-300'
                  : 'bg-emerald-900/50 text-emerald-300'
              }`}
            >
              {strategy[key] === 'confess' ? 'Confess' : 'Stay Silent'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MatchBreakdown({ matches, leaderboard, myId }) {
  // Sort: matches involving "me" first
  const sorted = [...matches].sort((a, b) => {
    const aMe = a.player1.id === myId || a.player2.id === myId;
    const bMe = b.player1.id === myId || b.player2.id === myId;
    return aMe === bMe ? 0 : aMe ? -1 : 1;
  });

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-4">Match Breakdown</h2>
      <p className="text-slate-400 text-sm mb-4">
        {matches.length} match{matches.length !== 1 ? 'es' : ''} played. Click a match to see round-by-round detail and strategies.
      </p>
      <div className="space-y-3">
        {sorted.map((match, i) => (
          <MatchCard
            key={i}
            match={match}
            leaderboard={leaderboard}
            myId={myId}
          />
        ))}
      </div>
    </div>
  );
}
