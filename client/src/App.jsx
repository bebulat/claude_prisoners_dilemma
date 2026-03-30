import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Admin from './pages/Admin';
import AdminGame from './pages/AdminGame';
import GamePage from './pages/GamePage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/game/:code" element={<AdminGame />} />
        <Route path="/game/:code" element={<GamePage />} />
      </Routes>
    </BrowserRouter>
  );
}
