const { randomBytes } = require('crypto');

const games = new Map();

function generateCode() {
  return randomBytes(3).toString('hex').toUpperCase();
}

function generateId() {
  return randomBytes(8).toString('hex');
}

function createGame({ rounds, payoff }) {
  const code = generateCode();
  const game = {
    code,
    settings: { rounds, payoff },
    players: [],
    status: 'waiting', // 'waiting' | 'playing' | 'complete'
    results: null,
    createdAt: new Date().toISOString(),
  };
  games.set(code, game);
  return game;
}

function getGame(code) {
  return games.get(code.toUpperCase()) || null;
}

function getAllGames() {
  return Array.from(games.values()).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
}

function addPlayer(code, { name }) {
  const game = getGame(code);
  if (!game) return { error: 'Game not found' };
  if (game.status !== 'waiting') return { error: 'Game already started' };

  const existing = game.players.find(
    (p) => p.name.toLowerCase() === name.toLowerCase()
  );
  if (existing) return { error: 'Name already taken in this game' };

  const player = {
    id: generateId(),
    name,
    strategy: null,
    ready: false,
    socketId: null,
  };
  game.players.push(player);
  return { player };
}

function reconnectPlayer(code, playerId) {
  const game = getGame(code);
  if (!game) return null;
  return game.players.find((p) => p.id === playerId) || null;
}

function updatePlayerSocket(code, playerId, socketId) {
  const game = getGame(code);
  if (!game) return;
  const player = game.players.find((p) => p.id === playerId);
  if (player) player.socketId = socketId;
}

function clearPlayerSocket(socketId) {
  for (const game of games.values()) {
    const player = game.players.find((p) => p.socketId === socketId);
    if (player) {
      player.socketId = null;
      return { gameCode: game.code };
    }
  }
  return null;
}

function setPlayerStrategy(code, playerId, strategy) {
  const game = getGame(code);
  if (!game) return false;
  const player = game.players.find((p) => p.id === playerId);
  if (!player) return false;
  player.strategy = strategy;
  player.ready = true;
  return true;
}

function setGameStatus(code, status) {
  const game = getGame(code);
  if (game) game.status = status;
}

function setGameResults(code, results) {
  const game = getGame(code);
  if (!game) return;
  game.results = results;
  game.status = 'complete';
}

module.exports = {
  createGame,
  getGame,
  getAllGames,
  addPlayer,
  reconnectPlayer,
  updatePlayerSocket,
  clearPlayerSocket,
  setPlayerStrategy,
  setGameStatus,
  setGameResults,
};
