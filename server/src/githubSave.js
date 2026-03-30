async function saveResultsToGitHub(game, results) {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO; // e.g. bebulat/claude_prisoners_dilemma

  if (!token || !repo) {
    console.log('GitHub save skipped: GITHUB_TOKEN or GITHUB_REPO not set');
    return;
  }

  const timestamp = new Date().toISOString().slice(0, 19).replace('T', '_').replace(/:/g, '-');
  const path = `results/${timestamp}_${game.code}.json`;

  const data = {
    gameCode: game.code,
    playedAt: new Date().toISOString(),
    settings: game.settings,
    leaderboard: results.leaderboard,
    matches: results.matches,
  };

  const response = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'prisoners-dilemma-server',
    },
    body: JSON.stringify({
      message: `results: game ${game.code} (${results.leaderboard.length} players)`,
      content: Buffer.from(JSON.stringify(data, null, 2)).toString('base64'),
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GitHub API ${response.status}: ${text}`);
  }

  console.log(`Results saved to GitHub: ${path}`);
}

module.exports = { saveResultsToGitHub };
