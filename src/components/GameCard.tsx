import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, TrendingUp } from 'lucide-react';
import { Game } from '../types';

interface GameCardProps {
  game: Game;
}

export function GameCard({ game }: GameCardProps) {
  const spotsLeft = game.playersNeeded - game.playersJoined;
  
  return (
    <Link
      to={`/game/${game.id}`}
      className="block bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-shadow"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-gray-900 mb-1">{game.title}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{game.location.name}</span>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            game.status === 'open'
              ? 'bg-emerald-100 text-emerald-700'
              : game.status === 'full'
              ? 'bg-gray-100 text-gray-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {game.status === 'open' ? `${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} left` : game.status}
        </span>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>{new Date(game.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
          <Clock className="w-4 h-4 ml-2" />
          <span>{game.time}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <TrendingUp className="w-4 h-4" />
          <span>Skill Level: {game.skillLevel}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="w-4 h-4" />
          <span>{game.playersJoined} / {game.playersNeeded} players</span>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
        <img
          src={game.organizer.avatar}
          alt={game.organizer.name}
          className="w-6 h-6 rounded-full object-cover"
        />
        <span className="text-sm text-gray-600">Organized by {game.organizer.name}</span>
      </div>
    </Link>
  );
}
