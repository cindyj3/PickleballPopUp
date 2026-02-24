import { useState } from 'react';
import { Calendar, MapPin, Star, Edit2, TrendingUp, Trophy } from 'lucide-react';
import { currentUser, mockGames } from '../data/mockData';
import { GameCard } from '../components/GameCard';

export function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState(currentUser);

  const myGames = mockGames.filter(game => 
    game.players.some(player => player.id === currentUser.id)
  );

  const handleSave = () => {
    setIsEditing(false);
    alert('Profile updated! (This is a demo)');
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-24 md:pb-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Profile Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="relative">
              <img
                src={userData.avatar}
                alt={userData.name}
                className="w-32 h-32 rounded-full object-cover"
              />
              {isEditing && (
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center hover:bg-emerald-700">
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex justify-between items-start mb-4">
                <div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={userData.name}
                      onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                      className="text-2xl font-bold text-gray-900 border-b-2 border-emerald-600 focus:outline-none mb-2"
                    />
                  ) : (
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{userData.name}</h1>
                  )}
                  <div className="flex items-center gap-2 text-gray-600">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span>{userData.rating.toFixed(1)} rating</span>
                  </div>
                </div>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors inline-flex items-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setUserData(currentUser);
                        setIsEditing(false);
                      }}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                    >
                      Save
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-emerald-600 mb-4">
                <TrendingUp className="w-4 h-4" />
                {isEditing ? (
                  <select
                    value={userData.skillLevel}
                    onChange={(e) => setUserData({ ...userData, skillLevel: e.target.value as any })}
                    className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Pro">Pro</option>
                  </select>
                ) : (
                  <span className="font-medium">{userData.skillLevel}</span>
                )}
              </div>

              {isEditing ? (
                <textarea
                  value={userData.bio}
                  onChange={(e) => setUserData({ ...userData, bio: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  rows={3}
                />
              ) : (
                <p className="text-gray-600 mb-4">{userData.bio}</p>
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Trophy className="w-4 h-4 text-emerald-600" />
                    <p className="text-2xl font-bold text-gray-900">{userData.gamesPlayed}</p>
                  </div>
                  <p className="text-sm text-gray-600">Games Played</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <p className="text-2xl font-bold text-gray-900">{myGames.length}</p>
                  </div>
                  <p className="text-sm text-gray-600">Upcoming</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <p className="text-2xl font-bold text-gray-900">{userData.favoriteSpots.length}</p>
                  </div>
                  <p className="text-sm text-gray-600">Favorite Spots</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Favorite Spots */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Favorite Playing Spots</h2>
          <div className="space-y-2">
            {userData.favoriteSpots.map((spot, index) => (
              <div key={index} className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>{spot}</span>
              </div>
            ))}
          </div>
        </div>

        {/* My Games */}
        <div>
          <h2 className="font-semibold text-gray-900 mb-4">My Upcoming Games</h2>
          {myGames.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {myGames.map(game => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">You haven't joined any games yet</p>
              <a
                href="/browse"
                className="text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Browse Available Games
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
