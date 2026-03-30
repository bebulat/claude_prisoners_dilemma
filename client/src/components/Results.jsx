import Leaderboard from './Leaderboard';
import MatchBreakdown from './MatchBreakdown';

export default function Results({ results, settings, myId }) {
  if (!results) return null;
  const { leaderboard, matches } = results;

  return (
    <div className="space-y-8">
      <Leaderboard entries={leaderboard} myId={myId} />
      <MatchBreakdown matches={matches} leaderboard={leaderboard} settings={settings} myId={myId} />
    </div>
  );
}
