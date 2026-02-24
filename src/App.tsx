import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Home } from './pages/Home';
import { Browse } from './pages/Browse';
import { CreateGame } from './pages/CreateGame';
import { GameDetail } from './pages/GameDetail';
import { Profile } from './pages/Profile';
import { Messages } from './pages/Messages';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/create" element={<CreateGame />} />
          <Route path="/game/:id" element={<GameDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/messages" element={<Messages />} />
        </Routes>
      </div>
    </Router>
  );
}