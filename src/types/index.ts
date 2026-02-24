export interface User {
  id: string;
  name: string;
  email: string;
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Pro';
  bio: string;
  avatar: string;
  gamesPlayed: number;
  favoriteSpots: string[];
  rating: number;
}

export interface Game {
  id: string;
  title: string;
  sport: string;
  location: {
    name: string;
    address: string;
    lat: number;
    lng: number;
  };
  date: string;
  time: string;
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Pro' | 'All Levels';
  playersNeeded: number;
  playersJoined: number;
  organizer: User;
  players: User[];
  description: string;
  status: 'open' | 'full' | 'cancelled';
}

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  timestamp: string;
  read: boolean;
}
