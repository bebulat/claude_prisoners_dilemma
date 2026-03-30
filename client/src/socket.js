import { io } from 'socket.io-client';

// In development, Vite proxies /socket.io to localhost:3001
// In production, the server serves everything from the same origin
const socket = io({ autoConnect: false });

export default socket;
