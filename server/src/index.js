require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const store = require('./gameStore');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

app.set('io', io);
app.use(express.json());

if (process.env.NODE_ENV !== 'production') {
  app.use(cors({ origin: 'http://localhost:5173' }));
}

// API routes
app.use('/api/admin', require('./routes/admin'));
app.use('/api/games', require('./routes/game'));

// Serve built client in production
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Socket.io handlers
io.on('connection', (socket) => {
  // Player joins a game room
  socket.on('player:join', ({ gameCode, name, playerId }) => {
    const game = store.getGame(gameCode);
    if (!game) {
      socket.emit('join:error', { message: 'Game not found. Check the code and try again.' });
      return;
    }

    let player;

    // Try to reconnect existing player
    if (playerId) {
      player = store.reconnectPlayer(gameCode, playerId);
    }

    // New player join
    if (!player) {
      const result = store.addPlayer(gameCode, { name });
      if (result.error) {
        socket.emit('join:error', { message: result.error });
        return;
      }
      player = result.player;
    }

    store.updatePlayerSocket(gameCode, player.id, socket.id);
    socket.join(gameCode);

    socket.emit('join:success', {
      playerId: player.id,
      player: { id: player.id, name: player.name, ready: player.ready, strategy: player.strategy },
      game: {
        code: game.code,
        status: game.status,
        settings: game.settings,
        results: game.results,
      },
    });

    io.to(gameCode).emit('lobby:update', {
      players: game.players.map((p) => ({ id: p.id, name: p.name, ready: p.ready })),
      status: game.status,
    });
  });

  // Player submits strategy
  socket.on('player:strategy', ({ gameCode, playerId, strategy }) => {
    const ok = store.setPlayerStrategy(gameCode, playerId, strategy);
    if (!ok) return;

    const game = store.getGame(gameCode);
    if (!game) return;

    io.to(gameCode).emit('lobby:update', {
      players: game.players.map((p) => ({ id: p.id, name: p.name, ready: p.ready })),
      status: game.status,
    });
  });

  // Cleanup on disconnect
  socket.on('disconnect', () => {
    const result = store.clearPlayerSocket(socket.id);
    if (result) {
      const game = store.getGame(result.gameCode);
      if (game) {
        io.to(result.gameCode).emit('lobby:update', {
          players: game.players.map((p) => ({ id: p.id, name: p.name, ready: p.ready })),
          status: game.status,
        });
      }
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
