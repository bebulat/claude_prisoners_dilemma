const express = require('express');
const router = express.Router();
const store = require('../gameStore');

// Get public game info (for joining)
router.get('/:code', (req, res) => {
  const game = store.getGame(req.params.code);
  if (!game) return res.status(404).json({ error: 'Game not found' });
  res.json({
    code: game.code,
    status: game.status,
    playerCount: game.players.length,
    settings: game.settings,
  });
});

// Get results of a completed game
router.get('/:code/results', (req, res) => {
  const game = store.getGame(req.params.code);
  if (!game) return res.status(404).json({ error: 'Game not found' });
  if (!game.results) return res.status(404).json({ error: 'Results not yet available' });
  res.json(game.results);
});

module.exports = router;
