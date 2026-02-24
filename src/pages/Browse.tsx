import { useState } from 'react';
import { Map, List, Filter } from 'lucide-react';
import { mockGames } from '../data/mockData';
import { GameCard } from '../components/GameCard';

export function Browse() {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [skillFilter, setSkillFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredGames = mockGames.filter(game => {
    const skillMatch = skillFilter === 'all' || game.skillLevel === skillFilter || game.skillLevel === 'All Levels';
    const statusMatch = statusFilter === 'all' || game.status === statusFilter;
    return skillMatch && statusMatch;
  });

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Games</h1>
          <p className="text-gray-600">Find the perfect pickleball game near you</p>
        </div>

        {/* Filters and View Toggle */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div className="flex flex-wrap gap-3 flex-1">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Filters:</span>
              </div>

              <select
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Skill Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Pro">Pro</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Games</option>
                <option value="open">Open</option>
                <option value="full">Full</option>
              </select>
            </div>

            <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="w-4 h-4 inline mr-1" />
                List
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'map'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Map className="w-4 h-4 inline mr-1" />
                Map
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Showing {filteredGames.length} {filteredGames.length === 1 ? 'game' : 'games'}
          </p>
        </div>

        {/* Content */}
        {viewMode === 'list' ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGames.map(game => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Map View */}
            <div className="h-[600px] bg-gray-100 relative">
              {/* Simplified map representation */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-8">
                  <Map className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Interactive Map View</p>
                  <p className="text-sm text-gray-500">In production, this would show games on an interactive map</p>
                </div>
              </div>
              
              {/* Game markers overlay - simplified version */}
              {filteredGames.slice(0, 3).map((game, index) => (
                <div
                  key={game.id}
                  className="absolute bg-white rounded-lg shadow-lg p-3 max-w-xs"
                  style={{
                    top: `${20 + index * 25}%`,
                    left: `${15 + index * 20}%`,
                  }}
                >
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {game.playersJoined}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm text-gray-900 truncate">{game.title}</h4>
                      <p className="text-xs text-gray-600">{game.location.name}</p>
                      <p className="text-xs text-emerald-600 mt-1">{game.playersNeeded - game.playersJoined} spots left</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {filteredGames.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No games found matching your filters.</p>
            <button
              onClick={() => {
                setSkillFilter('all');
                setStatusFilter('all');
              }}
              className="text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
