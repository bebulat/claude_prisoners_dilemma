const express = require('express');
const router = express.Router();
const store = require('../gameStore');
const { runAllMatches } = require('../gameLogic');

function adminAuth(req, res, next) {
  const password = req.headers['x-admin-password'];
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// Verify admin password
router.post('/login', (req, res) => {
  const { password } = req.body;
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid password' });
  }
  res.json({ success: true });
});

// Create a new game session
router.post('/games', adminAuth, (req, res) => {
  const { rounds, payoff } = req.body;
  if (!rounds || !payoff) {
    return res.status(400).json({ error: 'Missing rounds or payoff configuration' });
  }
  const game = store.createGame({ rounds, payoff });
  res.json(game);
});

// List all games
router.get('/games', adminAuth, (req, res) => {
  res.json(store.getAllGames());
});

// Get a single game with full player details
router.get('/games/:code', adminAuth, (req, res) => {
  const game = store.getGame(req.params.code);
  if (!game) return res.status(404).json({ error: 'Game not found' });
  res.json(game);
});

// Start a game: run all matches and broadcast results
router.post('/games/:code/start', adminAuth, (req, res) => {
  const game = store.getGame(req.params.code);
  if (!game) return res.status(404).json({ error: 'Game not found' });
  if (game.status !== 'waiting') {
    return res.status(400).json({ error: 'Game has already started' });
  }

  const readyPlayers = game.players.filter((p) => p.ready);
  if (readyPlayers.length < 2) {
    return res.status(400).json({ error: 'Need at least 2 players with strategies submitted' });
  }

  store.setGameStatus(game.code, 'playing');

  const io = req.app.get('io');
  io.to(game.code).emit('game:started');

  const results = runAllMatches(readyPlayers, game.settings.rounds, game.settings.payoff);
  store.setGameResults(game.code, results);

  io.to(game.code).emit('game:results', results);

  res.json({ success: true, results });
});

module.exports = router;
