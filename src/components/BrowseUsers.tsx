
import { useState, useEffect } from 'react';
import { UserCard } from './UserCard';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SkillTag } from './SkillTag';
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  Users,
  MapPin,
  Star,
  TrendingUp,
  Loader2
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import apiClient from '../utils/apiClient';

interface User {
  _id: string;
  name: string;
  email: string;
  bio: string;
  avatar?: string;
  skillsOffered: string[];
  skillsWanted: string[];
  rating: number;
  totalConnections: number;
  isOnline: boolean;
}

interface UserWithCompatibility extends User {
  compatibilityScore: number;
  matchingSkills: {
    offered: string[];
    wanted: string[];
  };
}

export function BrowseUsers() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('all');
  const [sortBy, setSortBy] = useState('compatibility');
  const [users, setUsers] = useState<UserWithCompatibility[]>([]);
  const [loading, setLoading] = useState(true);
  const [allSkills, setAllSkills] = useState<string[]>([]);
  
  useEffect(() => {
    fetchUsers();
  }, [searchQuery, selectedSkill]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      const params: Record<string, any> = {};
      if (searchQuery) params.q = searchQuery;
      if (selectedSkill !== 'all') params.skills = selectedSkill;
      
      const response = await apiClient.searchUsers(params);
      if (response.success) {
        const usersWithCompatibility = response.data.docs.map((targetUser: User) => {
          const matchingOffered = targetUser.skillsOffered.filter(skill =>
            user?.skillsWanted?.includes(skill)
          );
          const matchingWanted = targetUser.skillsWanted.filter(skill =>
            user?.skillsOffered?.includes(skill)
          );
          const totalMatches = matchingOffered.length + matchingWanted.length;
          const compatibilityScore = Math.min(95, 45 + (totalMatches * 12));
          
          return {
            ...targetUser,
            compatibilityScore,
            matchingSkills: {
              offered: matchingOffered,
              wanted: matchingWanted
            }
          };
        });

        // Sort users
        const sortedUsers = usersWithCompatibility.sort((a, b) => {
          switch (sortBy) {
            case 'compatibility':
              return b.compatibilityScore - a.compatibilityScore;
            case 'rating':
              return b.rating - a.rating;
            case 'connections':
              return b.totalConnections - a.totalConnections;
            case 'newest':
              return new Date(b.joinedAt || '').getTime() - new Date(a.joinedAt || '').getTime();
            default:
              return 0;
          }
        });

        setUsers(sortedUsers);

        // Extract all unique skills for filtering
        const skills = Array.from(
          new Set([
            ...sortedUsers.flatMap(u => u.skillsOffered),
            ...sortedUsers.flatMap(u => u.skillsWanted)
          ])
        ).sort();
        setAllSkills(skills);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (userId: string) => {
    try {
      const targetUser = users.find(u => u._id === userId);
      if (!targetUser || !user) return;

      // Find a skill that user offers and target wants, or vice versa
      const userSkillOffered = user.skillsOffered.find(skill => 
        targetUser.skillsWanted.includes(skill)
      );
      const userSkillWanted = user.skillsWanted.find(skill => 
        targetUser.skillsOffered.includes(skill)
      );

      if (userSkillOffered && userSkillWanted) {
        await apiClient.createMatch({
          targetUserId: userId,
          userSkillOffered,
          userSkillWanted
        });
        console.log('Match request sent!');
        // Optionally refresh the users list or show a success message
      }
    } catch (error) {
      console.error('Error creating match:', error);
    }
  };

  const handleMessage = (userId: string) => {
    console.log('Messaging user:', userId);
    // TODO: Navigate to messages page
  };

  const popularSkills = [
    'Guitar', 'Cooking', 'Programming', 'Photography', 'Yoga', 
    'Languages', 'Digital Art', 'Dancing', 'Writing', 'Marketing'
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Browse Skill Partners</h1>
              <p className="text-gray-600">Find the perfect person to exchange skills with</p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border-0">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="md:col-span-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search people or skills
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search by name, skill, or keyword..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 bg-gray-50/50 border-gray-200 focus:bg-white"
                  />
                </div>
              </div>
              
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by skill
                </label>
                <Select value={selectedSkill} onValueChange={setSelectedSkill}>
                  <SelectTrigger className="h-12 bg-gray-50/50 border-gray-200">
                    <SelectValue placeholder="All skills" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All skills</SelectItem>
                    {allSkills.map((skill) => (
                      <SelectItem key={skill} value={skill}>
                        {skill}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort by
                </label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-12 bg-gray-50/50 border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compatibility">Best match</SelectItem>
                    <SelectItem value="rating">Highest rated</SelectItem>
                    <SelectItem value="connections">Most connections</SelectItem>
                    <SelectItem value="newest">Newest members</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="md:col-span-1">
                <Button 
                  className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  onClick={fetchUsers}
                >
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {/* Popular Skills */}
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Popular skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {popularSkills.map((skill) => (
                  <SkillTag
                    key={skill}
                    skill={skill}
                    onClick={() => setSelectedSkill(skill)}
                    variant="default"
                    size="sm"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {/* Results Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {users.length} skill partners found
              </h2>
              <p className="text-gray-600">
                {searchQuery && `Results for "${searchQuery}"`}
                {selectedSkill !== 'all' && `Filtered by ${selectedSkill}`}
              </p>
            </div>
          </div>

          {/* Users Grid */}
          {users.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map((userWithCompatibility) => (
                <UserCard
                  key={userWithCompatibility._id}
                  user={userWithCompatibility}
                  onConnect={handleConnect}
                  onMessage={handleMessage}
                  compatibilityScore={userWithCompatibility.compatibilityScore}
                />
              ))}
            </div>
          ) : (
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardContent className="text-center py-12">
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery 
                    ? `No users match your search for "${searchQuery}"`
                    : 'Try adjusting your search criteria or filters'
                  }
                </p>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedSkill('all');
                  }}
                >
                  Clear filters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
