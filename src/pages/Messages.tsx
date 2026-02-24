import { useState } from 'react';
import { Search, Send } from 'lucide-react';
import { mockUsers } from '../data/mockData';

export function Messages() {
  const [selectedUser, setSelectedUser] = useState(mockUsers[0]);
  const [messageText, setMessageText] = useState('');

  // Mock conversation data
  const mockMessages = [
    { id: '1', senderId: mockUsers[0].id, content: 'Hey! Are you still up for the game tomorrow?', timestamp: '10:30 AM' },
    { id: '2', senderId: '1', content: 'Yes, definitely! I\'ll be there at 9 AM sharp.', timestamp: '10:32 AM' },
    { id: '3', senderId: mockUsers[0].id, content: 'Great! I\'ll bring an extra paddle in case anyone needs one.', timestamp: '10:35 AM' },
    { id: '4', senderId: '1', content: 'Perfect! See you then 🎾', timestamp: '10:36 AM' },
  ];

  const handleSendMessage = () => {
    if (messageText.trim()) {
      alert('Message sent! (This is a demo)');
      setMessageText('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-24 md:pb-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
          <p className="text-gray-600">Stay connected with your fellow players</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="grid md:grid-cols-3 h-[600px]">
            {/* Conversations List */}
            <div className="border-r border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search messages..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {mockUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                      selectedUser.id === user.id ? 'bg-emerald-50' : ''
                    }`}
                  >
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-medium text-gray-900 truncate">{user.name}</p>
                        <span className="text-xs text-gray-500">10:36 AM</span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {user.id === mockUsers[0].id 
                          ? 'Great! I\'ll bring an extra paddle...'
                          : 'Looking forward to the game!'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div className="md:col-span-2 flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 flex items-center gap-3">
                <img
                  src={selectedUser.avatar}
                  alt={selectedUser.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium text-gray-900">{selectedUser.name}</p>
                  <p className="text-sm text-gray-600">{selectedUser.skillLevel}</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {mockMessages.map((message) => {
                  const isMe = message.senderId === '1';
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex gap-2 max-w-[70%] ${isMe ? 'flex-row-reverse' : ''}`}>
                        <img
                          src={isMe ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400' : selectedUser.avatar}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        />
                        <div>
                          <div
                            className={`px-4 py-2 rounded-2xl ${
                              isMe
                                ? 'bg-emerald-600 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 px-2">{message.timestamp}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors inline-flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <h3 className="font-medium text-emerald-900 mb-2">Communication Guidelines</h3>
          <ul className="text-sm text-emerald-800 space-y-1">
            <li>• Be respectful and courteous to all players</li>
            <li>• Confirm your attendance 24 hours before game time</li>
            <li>• Notify organizers immediately if you need to cancel</li>
            <li>• Use messages to coordinate carpools or equipment sharing</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
