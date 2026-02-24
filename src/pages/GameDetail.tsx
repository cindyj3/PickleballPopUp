import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, TrendingUp, MessageSquare, ArrowLeft, UserPlus } from 'lucide-react';
import { mockGames } from '../data/mockData';

export function GameDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const game = mockGames.find(g => g.id === id);

  if (!game) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 pb-24 md:pb-8 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Game Not Found</h2>
          <button
            onClick={() => navigate('/browse')}
            className="text-emerald-600 hover:text-emerald-700"
          >
            Back to Browse
          </button>
        </div>
      </div>
    );
  }

  const spotsLeft = game.playersNeeded - game.playersJoined;
  const canJoin = game.status === 'open';

  const handleJoinGame = () => {
    alert('You\'ve joined the game! (This is a demo)');
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-24 md:pb-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Game Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{game.title}</h1>
              <div className="flex items-center gap-2 text-gray-600">
                <img
                  src={game.organizer.avatar}
                  alt={game.organizer.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span>Organized by {game.organizer.name}</span>
              </div>
            </div>
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium ${
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

          {/* Game Details */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="font-medium text-gray-900">{game.location.name}</p>
                <p className="text-sm text-gray-600">{game.location.address}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Date & Time</p>
                <p className="font-medium text-gray-900">
                  {new Date(game.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
                <p className="text-sm text-gray-600">{game.time}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Skill Level</p>
                <p className="font-medium text-gray-900">{game.skillLevel}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Players</p>
                <p className="font-medium text-gray-900">
                  {game.playersJoined} / {game.playersNeeded} joined
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          {game.description && (
            <div className="pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">About this game</h3>
              <p className="text-gray-600">{game.description}</p>
            </div>
          )}
        </div>

        {/* Players List */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Players ({game.playersJoined})</h2>
          <div className="space-y-3">
            {game.players.map((player) => (
              <div key={player.id} className="flex items-center gap-3">
                <img
                  src={player.avatar}
                  alt={player.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{player.name}</p>
                  <p className="text-sm text-gray-600">{player.skillLevel}</p>
                </div>
                {player.id === game.organizer.id && (
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                    Organizer
                  </span>
                )}
              </div>
            ))}
            {spotsLeft > 0 && (
              <div className="flex items-center gap-3 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg p-3">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <p className="text-sm">{spotsLeft} {spotsLeft === 1 ? 'spot' : 'spots'} available</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => alert('Message feature coming soon!')}
            className="flex-1 px-6 py-4 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors inline-flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-5 h-5" />
            Message Organizer
          </button>
          {canJoin && (
            <button
              onClick={handleJoinGame}
              className="flex-1 px-6 py-4 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors inline-flex items-center justify-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              Join Game
            </button>
          )}
        </div>

        {/* Location Map Placeholder */}
        <div className="mt-6 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="h-64 bg-gray-100 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Map View</p>
              <p className="text-sm text-gray-500">{game.location.address}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
