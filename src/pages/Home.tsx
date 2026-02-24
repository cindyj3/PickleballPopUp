import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Users, Calendar, MessageSquare, Star, Zap } from 'lucide-react';
import { mockGames, currentUser } from '../data/mockData';
import { GameCard } from '../components/GameCard';

export function Home() {
  const upcomingGames = mockGames.filter(game => game.status === 'open').slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            <span>Game On, Anytime, Anywhere</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Find Your Next
            <span className="block text-emerald-600">Pickleball Game</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Connect with players in your community, organize pick-up games, and enjoy the thrill of friendly competition.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/browse"
              className="px-8 py-4 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors inline-flex items-center justify-center gap-2"
            >
              Browse Games
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/create"
              className="px-8 py-4 bg-white text-emerald-600 border-2 border-emerald-600 rounded-xl font-semibold hover:bg-emerald-50 transition-colors"
            >
              Create a Game
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Everything You Need to Play
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Find Games Nearby</h3>
              <p className="text-gray-600">Discover pick-up games happening in your local area with our map and list views.</p>
            </div>

            <div className="text-center p-6">
              <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Create & Organize</h3>
              <p className="text-gray-600">Set up games in minutes by choosing location, time, and skill level.</p>
            </div>

            <div className="text-center p-6">
              <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Build Community</h3>
              <p className="text-gray-600">Connect with fellow players, rate games, and grow your local pickleball network.</p>
            </div>

            <div className="text-center p-6">
              <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Stay Connected</h3>
              <p className="text-gray-600">Coordinate with players through in-app messaging and get push notifications.</p>
            </div>

            <div className="text-center p-6">
              <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Star className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Track Progress</h3>
              <p className="text-gray-600">Build your player profile and showcase your experience and skill level.</p>
            </div>

            <div className="text-center p-6">
              <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Instant Play</h3>
              <p className="text-gray-600">Join games quickly and never miss an opportunity to play and improve.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Games Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Games Near You
            </h2>
            <Link
              to="/browse"
              className="text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center gap-1"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {upcomingGames.map(game => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-emerald-600 to-teal-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Play?
          </h2>
          <p className="text-xl text-emerald-100 mb-8">
            Join {currentUser.name} and hundreds of other players in your community.
          </p>
          <Link
            to="/create"
            className="px-8 py-4 bg-white text-emerald-600 rounded-xl font-semibold hover:bg-emerald-50 transition-colors inline-flex items-center gap-2"
          >
            Create Your First Game
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
