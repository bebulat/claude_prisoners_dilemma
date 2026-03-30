const STRATEGY_LABELS = {
  firstRound: '1st',
  afterBothConfess: 'CC',
  afterIConfessTheySilent: 'CS',
  afterISilentTheyConfess: 'SC',
  afterBothSilent: 'SS',
};

const SITUATIONS = ['firstRound', 'afterBothConfess', 'afterIConfessTheySilent', 'afterISilentTheyConfess', 'afterBothSilent'];

export default function Leaderboard({ entries, myId }) {
  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-700">
        <h2 className="text-xl font-bold text-white">Leaderboard</h2>
        <p className="text-slate-400 text-sm mt-1">Total score across all matches</p>
      </div>

      {/* Strategy key */}
      <div className="px-6 py-3 bg-slate-900/50 border-b border-slate-700 text-xs text-slate-500 flex gap-4 flex-wrap">
        <span className="font-medium text-slate-400">Strategy key:</span>
        <span>1st = first round</span>
        <span>CC = both confessed</span>
        <span>CS = I confessed, they silent</span>
        <span>SC = I silent, they confessed</span>
        <span>SS = both silent</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider border-b border-slate-700">
              <th className="px-6 py-3">#</th>
              <th className="px-6 py-3">Player</th>
              <th className="px-6 py-3">Score</th>
              <th className="px-6 py-3">Strategy</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {entries.map((entry, i) => (
              <tr
                key={entry.id}
                className={`${entry.id === myId ? 'bg-emerald-900/20' : ''} ${i === 0 ? 'bg-yellow-900/10' : ''}`}
              >
                <td className="px-6 py-4">
                  <span className={`text-lg font-bold ${i === 0 ? 'text-yellow-400' : 'text-slate-400'}`}>
                    {entry.rank}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-white font-medium">{entry.name}</span>
                  {entry.id === myId && (
                    <span className="text-emerald-400 text-xs ml-2">you</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className="text-white font-bold text-lg">{entry.totalScore}</span>
                </td>
                <td className="px-6 py-4">
                  {entry.strategy ? (
                    <div className="flex gap-1">
                      {SITUATIONS.map((key) => (
                        <span
                          key={key}
                          title={`${STRATEGY_LABELS[key]}: ${entry.strategy[key]}`}
                          className={`inline-flex flex-col items-center text-xs rounded px-1.5 py-0.5 font-mono font-bold ${
                            entry.strategy[key] === 'confess'
                              ? 'bg-red-900/50 text-red-300'
                              : 'bg-emerald-900/50 text-emerald-300'
                          }`}
                        >
                          <span className="text-slate-500 text-[9px] leading-none">{STRATEGY_LABELS[key]}</span>
                          <span>{entry.strategy[key] === 'confess' ? 'C' : 'S'}</span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-500 text-sm">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
