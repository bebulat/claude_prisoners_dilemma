function getNextMove(strategy, myLastMove, theirLastMove) {
  if (myLastMove === 'confess' && theirLastMove === 'confess') return strategy.afterBothConfess;
  if (myLastMove === 'confess' && theirLastMove === 'silent') return strategy.afterIConfessTheySilent;
  if (myLastMove === 'silent' && theirLastMove === 'confess') return strategy.afterISilentTheyConfess;
  return strategy.afterBothSilent;
}

function getRoundScores(p1Move, p2Move, payoff) {
  if (p1Move === 'confess' && p2Move === 'confess') {
    return [payoff.bothConfess, payoff.bothConfess];
  }
  if (p1Move === 'confess' && p2Move === 'silent') {
    return [payoff.iConfessTheySilent, payoff.iSilentTheyConfess];
  }
  if (p1Move === 'silent' && p2Move === 'confess') {
    return [payoff.iSilentTheyConfess, payoff.iConfessTheySilent];
  }
  return [payoff.bothSilent, payoff.bothSilent];
}

function runMatch(p1, p2, rounds, payoff) {
  const history = [];
  let p1Total = 0;
  let p2Total = 0;

  for (let r = 0; r < rounds; r++) {
    let p1Move, p2Move;
    if (r === 0) {
      p1Move = p1.strategy.firstRound;
      p2Move = p2.strategy.firstRound;
    } else {
      const prev = history[r - 1];
      p1Move = getNextMove(p1.strategy, prev.p1Move, prev.p2Move);
      p2Move = getNextMove(p2.strategy, prev.p2Move, prev.p1Move);
    }

    const [s1, s2] = getRoundScores(p1Move, p2Move, payoff);
    p1Total += s1;
    p2Total += s2;
    history.push({ round: r + 1, p1Move, p2Move, p1Score: s1, p2Score: s2 });
  }

  return { history, p1Total, p2Total };
}

function runAllMatches(players, rounds, payoff) {
  const matches = [];
  const totals = {};
  players.forEach((p) => (totals[p.id] = 0));

  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      const p1 = players[i];
      const p2 = players[j];
      const { history, p1Total, p2Total } = runMatch(p1, p2, rounds, payoff);

      totals[p1.id] += p1Total;
      totals[p2.id] += p2Total;

      matches.push({
        player1: { id: p1.id, name: p1.name },
        player2: { id: p2.id, name: p2.name },
        rounds: history,
        scores: { p1: p1Total, p2: p2Total },
      });
    }
  }

  // Build leaderboard with strategies revealed
  const leaderboard = players
    .map((p) => ({
      id: p.id,
      name: p.name,
      totalScore: totals[p.id],
      strategy: p.strategy,
    }))
    .sort((a, b) => a.totalScore - b.totalScore)
    .map((p, i) => ({ ...p, rank: i + 1 }));

  return { leaderboard, matches };
}

module.exports = { runAllMatches };
