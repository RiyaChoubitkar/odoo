
import { User } from '../types';
import { SkillTag } from './SkillTag';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, MessageCircle, Star, Users, Wifi, WifiOff } from 'lucide-react';

interface UserCardProps {
  user: User;
  onConnect?: (userId: string) => void;
  onMessage?: (userId: string) => void;
  showActions?: boolean;
  compatibilityScore?: number;
}

export function UserCard({ 
  user, 
  onConnect, 
  onMessage, 
  showActions = true, 
  compatibilityScore 
}: UserCardProps) {
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm border-0 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="relative">
            <img
              src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
              alt={user.name}
              className="w-16 h-16 rounded-full object-cover border-3 border-white shadow-lg"
            />
            <div
              className={cn(
                'absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white',
                user.isOnline ? 'bg-green-400' : 'bg-gray-400'
              )}
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-bold text-lg text-gray-900 truncate">{user.name}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{user.rating}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{user.totalConnections}</span>
                  </div>
                  {user.isOnline ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">
                      <Wifi className="w-3 h-3 mr-1" />
                      Online
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                      <WifiOff className="w-3 h-3 mr-1" />
                      Offline
                    </Badge>
                  )}
                </div>
              </div>
              
              {compatibilityScore && (
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600">{compatibilityScore}%</div>
                  <div className="text-xs text-gray-500">Match</div>
                </div>
              )}
            </div>
            
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{user.bio}</p>
            
            <div className="space-y-3">
              <div>
                <h4 className="text-xs font-semibold text-emerald-700 mb-2 flex items-center gap-1">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  OFFERS
                </h4>
                <div className="flex flex-wrap gap-1">
                  {user.skillsOffered.slice(0, 3).map((skill) => (
                    <SkillTag key={skill} skill={skill} variant="offered" size="sm" />
                  ))}
                  {user.skillsOffered.length > 3 && (
                    <span className="text-xs text-gray-500 px-2">+{user.skillsOffered.length - 3} more</span>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="text-xs font-semibold text-blue-700 mb-2 flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  WANTS
                </h4>
                <div className="flex flex-wrap gap-1">
                  {user.skillsWanted.slice(0, 3).map((skill) => (
                    <SkillTag key={skill} skill={skill} variant="wanted" size="sm" />
                  ))}
                  {user.skillsWanted.length > 3 && (
                    <span className="text-xs text-gray-500 px-2">+{user.skillsWanted.length - 3} more</span>
                  )}
                </div>
              </div>
            </div>
            
            {showActions && (
              <div className="flex gap-2 mt-4">
                <Button
                  onClick={() => onConnect?.(user.id)}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
                  size="sm"
                >
                  <Heart className="w-4 h-4 mr-1" />
                  Connect
                </Button>
                <Button
                  onClick={() => onMessage?.(user.id)}
                  variant="outline"
                  size="sm"
                  className="border-purple-200 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
                >
                  <MessageCircle className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}
