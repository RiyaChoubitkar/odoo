
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { mockMatches, mockMessages, mockUsers } from '../data/mockData';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Search, 
  Phone, 
  Video, 
  MoreVertical,
  ArrowLeft,
  Smile,
  Paperclip,
  MessageCircle,
  Clock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Message {
  id: string;
  matchId: string;
  senderId: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export function Messages() {
  const { user } = useAuth();
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get user's matches
  const userMatches = mockMatches.filter(match => 
    match.user1Id === user?.id || match.user2Id === user?.id
  );

  // Get messages for selected match
  const matchMessages = selectedMatch 
    ? mockMessages.filter(msg => msg.matchId === selectedMatch)
    : [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [matchMessages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedMatch) return;
    
    // TODO: Implement send message functionality
    console.log('Sending message:', newMessage, 'to match:', selectedMatch);
    setNewMessage('');
  };

  const getOtherUser = (match: any) => {
    return match.user1Id === user?.id ? match.user2 : match.user1;
  };

  const filteredMatches = userMatches.filter(match => {
    const otherUser = getOtherUser(match);
    return otherUser.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const selectedMatchData = userMatches.find(match => match.id === selectedMatch);
  const otherUser = selectedMatchData ? getOtherUser(selectedMatchData) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border-0 overflow-hidden h-[calc(100vh-12rem)]">
          <div className="flex h-full">
            {/* Sidebar - Conversations List */}
            <div className={`${selectedMatch && 'hidden md:block'} w-full md:w-80 border-r border-gray-200 flex flex-col`}>
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">Messages</h1>
                    <p className="text-sm text-gray-600">{userMatches.length} conversations</p>
                  </div>
                </div>
                
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-gray-50/50 border-gray-200"
                  />
                </div>
              </div>

              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto">
                {filteredMatches.length === 0 ? (
                  <div className="p-6 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">No conversations yet</h3>
                    <p className="text-sm text-gray-600">Start connecting with people to begin messaging!</p>
                  </div>
                ) : (
                  <div className="space-y-1 p-2">
                    {filteredMatches.map((match) => {
                      const otherUser = getOtherUser(match);
                      const lastMessage = mockMessages
                        .filter(msg => msg.matchId === match.id)
                        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
                      
                      const unreadCount = mockMessages
                        .filter(msg => msg.matchId === match.id && !msg.read && msg.senderId !== user?.id)
                        .length;

                      return (
                        <div
                          key={match.id}
                          onClick={() => setSelectedMatch(match.id)}
                          className={`p-4 rounded-xl cursor-pointer transition-all duration-200 hover:bg-purple-50 ${
                            selectedMatch === match.id ? 'bg-purple-100 border-purple-200' : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <img
                                src={otherUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUser.name}`}
                                alt={otherUser.name}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                              {otherUser.isOnline && (
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white" />
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h3 className="font-semibold text-gray-900 truncate">{otherUser.name}</h3>
                                <div className="flex items-center gap-2">
                                  {lastMessage && (
                                    <span className="text-xs text-gray-500">
                                      {formatDistanceToNow(new Date(lastMessage.timestamp), { addSuffix: true })}
                                    </span>
                                  )}
                                  {unreadCount > 0 && (
                                    <Badge className="bg-purple-600 text-white min-w-[20px] h-5 p-0 flex items-center justify-center text-xs">
                                      {unreadCount}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 truncate">
                                {lastMessage ? lastMessage.message : 'Start a conversation...'}
                              </p>
                              <div className="flex items-center gap-1 mt-1">
                                <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                                  {match.compatibilityScore}% match
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Main Chat Area */}
            <div className={`${!selectedMatch && 'hidden md:block'} flex-1 flex flex-col`}>
              {selectedMatch && otherUser ? (
                <>
                  {/* Chat Header */}
                  <div className="p-6 border-b border-gray-200 bg-white/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedMatch(null)}
                          className="md:hidden"
                        >
                          <ArrowLeft className="w-4 h-4" />
                        </Button>
                        
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img
                              src={otherUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUser.name}`}
                              alt={otherUser.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            {otherUser.isOnline && (
                              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
                            )}
                          </div>
                          
                          <div>
                            <h2 className="font-semibold text-gray-900">{otherUser.name}</h2>
                            <p className="text-sm text-gray-600">
                              {otherUser.isOnline ? 'Online now' : 'Last seen recently'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Phone className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Video className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {matchMessages.length === 0 ? (
                      <div className="text-center">
                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <MessageCircle className="w-8 h-8 text-purple-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">Start your conversation</h3>
                        <p className="text-sm text-gray-600">
                          Say hello to {otherUser.name} and start exchanging skills!
                        </p>
                      </div>
                    ) : (
                      matchMessages.map((message) => {
                        const isOwn = message.senderId === user?.id;
                        const sender = isOwn ? user : otherUser;
                        
                        return (
                          <div
                            key={message.id}
                            className={`flex gap-3 ${isOwn ? 'justify-end' : 'justify-start'}`}
                          >
                            {!isOwn && (
                              <img
                                src={sender?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${sender?.name}`}
                                alt={sender?.name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            )}
                            
                            <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-1' : 'order-2'}`}>
                              <div
                                className={`p-3 rounded-2xl ${
                                  isOwn
                                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-900'
                                }`}
                              >
                                <p className="text-sm">{message.message}</p>
                              </div>
                              <div className={`flex items-center gap-1 mt-1 text-xs text-gray-500 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                <Clock className="w-3 h-3" />
                                {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                              </div>
                            </div>
                            
                            {isOwn && (
                              <img
                                src={sender?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${sender?.name}`}
                                alt={sender?.name}
                                className="w-8 h-8 rounded-full object-cover order-2"
                              />
                            )}
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-6 border-t border-gray-200 bg-white/50">
                    <div className="flex items-center gap-3">
                      <Button variant="ghost" size="sm">
                        <Paperclip className="w-4 h-4" />
                      </Button>
                      
                      <div className="flex-1 relative">
                        <Input
                          placeholder="Type your message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          className="pr-12 bg-gray-50/50 border-gray-200 focus:bg-white"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1/2 transform -translate-y-1/2"
                        >
                          <Smile className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <Button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a conversation</h3>
                    <p className="text-gray-600">Choose from your existing conversations or start a new one</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
