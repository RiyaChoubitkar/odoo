
import { useAuth } from '../hooks/useAuth';
import { UserCard } from './UserCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  TrendingUp, 
  Users, 
  MessageCircle, 
  BookOpen,
  Star,
  Play,
  Clock,
  ChevronRight,
  Sparkles,
  Target,
  Award
} from 'lucide-react';
import { useState, useEffect } from 'react';
import apiClient from '../utils/apiClient';

interface DashboardProps {
  onPageChange: (page: string) => void;
}

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

interface Course {
  _id: string;
  title: string;
  instructor: {
    name: string;
    avatar?: string;
  };
  duration: string;
  totalLessons: number;
  image: string;
  category: string;
  rating: {
    average: number;
  };
}

export function Dashboard({ onPageChange }: DashboardProps) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [recommendedUsers, setRecommendedUsers] = useState<User[]>([]);
  const [trendingCourses, setTrendingCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch potential matches
      const matchesResponse = await apiClient.getPotentialMatches({ limit: 3 });
      if (matchesResponse.success) {
        setRecommendedUsers(matchesResponse.data.matches.map((match: any) => match.user));
      }
      
      // Fetch trending courses
      const coursesResponse = await apiClient.getCourses({ 
        limit: 3, 
        sortBy: 'rating',
        sortOrder: 'desc'
      });
      if (coursesResponse.success) {
        setTrendingCourses(coursesResponse.data.courses);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (userId: string) => {
    try {
      // Find a matching skill to create a match
      const targetUser = recommendedUsers.find(u => u._id === userId);
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
      }
    } catch (error) {
      console.error('Error creating match:', error);
    }
  };

  const handleMessage = (userId: string) => {
    console.log('Messaging user:', userId);
    onPageChange('messages');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <img
                    src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
                    alt={user?.name}
                    className="w-12 h-12 rounded-full"
                  />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Hi, {user?.name?.split(' ')[0]}! 👋</h1>
                  <p className="text-purple-100">Ready to share skills and find people?</p>
                </div>
              </div>
              
              <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/70 w-5 h-5" />
                <Input
                  placeholder="Explore a skill here"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 bg-white/20 border-white/30 text-white placeholder:text-white/70 backdrop-blur-sm h-12 rounded-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm">Skills Offered</p>
                  <p className="text-2xl font-bold">{user?.skillsOffered?.length || 0}</p>
                </div>
                <Target className="w-8 h-8 text-emerald-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Skills Wanted</p>
                  <p className="text-2xl font-bold">{user?.skillsWanted?.length || 0}</p>
                </div>
                <Sparkles className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Connections</p>
                  <p className="text-2xl font-bold">{user?.totalConnections || 0}</p>
                </div>
                <Users className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-orange-500 to-red-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Rating</p>
                  <p className="text-2xl font-bold">{user?.rating || 0}</p>
                </div>
                <Award className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Find Your Perfect Skill Exchange Partner */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    Find your perfect skill exchange partner
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onPageChange('browse')}
                    className="text-purple-600 hover:text-purple-700"
                  >
                    View matches <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recommendedUsers.length > 0 ? (
                    recommendedUsers.map((recommendedUser) => {
                      // Calculate compatibility score based on matching skills
                      const matchingSkills = recommendedUser.skillsOffered.filter(skill =>
                        user?.skillsWanted?.includes(skill)
                      ).length;
                      const compatibilityScore = Math.min(95, 60 + (matchingSkills * 15));
                      
                      return (
                        <UserCard
                          key={recommendedUser._id}
                          user={recommendedUser}
                          onConnect={handleConnect}
                          onMessage={handleMessage}
                          compatibilityScore={compatibilityScore}
                        />
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No potential matches found yet.</p>
                      <p className="text-sm">Try updating your skills or check back later!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Trending Courses */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-orange-500" />
                  Trending Courses
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onPageChange('courses')}
                    className="ml-auto text-orange-600 hover:text-orange-700"
                  >
                    View more <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {trendingCourses.length > 0 ? (
                    trendingCourses.map((course) => (
                      <div key={course._id} className="bg-white rounded-xl p-4 shadow-sm border">
                        <div className="relative mb-3">
                          <img
                            src={course.image}
                            alt={course.title}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <div className="absolute top-2 right-2 bg-white/90 rounded-full px-2 py-1 text-xs font-medium">
                            {course.category}
                          </div>
                        </div>
                        
                        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                          {course.title}
                        </h3>
                        
                        <div className="flex items-center gap-2 mb-2">
                          <img
                            src={course.instructor.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${course.instructor.name}`}
                            alt={course.instructor.name}
                            className="w-5 h-5 rounded-full"
                          />
                          <span className="text-sm text-gray-600">{course.instructor.name}</span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{course.duration}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            <span>{course.totalLessons} lessons</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm font-medium">{course.rating.average.toFixed(1)}</span>
                          </div>
                          <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
                            <Play className="w-3 h-3 mr-1" />
                            Start
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 text-center py-8 text-gray-500">
                      <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No courses available yet.</p>
                      <p className="text-sm">Check back later for new courses!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => onPageChange('browse')}
                  className="w-full justify-start bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  <Users className="w-4 h-4 mr-3" />
                  Browse Users
                </Button>
                <Button 
                  onClick={() => onPageChange('messages')}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <MessageCircle className="w-4 h-4 mr-3" />
                  View Messages
                </Button>
                <Button 
                  onClick={() => onPageChange('courses')}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <BookOpen className="w-4 h-4 mr-3" />
                  Explore Courses
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">New potential match</p>
                      <p className="text-xs text-gray-500">Someone wants to learn from you</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <MessageCircle className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">New message</p>
                      <p className="text-xs text-gray-500">From your skill exchange partner</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <Star className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Rating received</p>
                      <p className="text-xs text-gray-500">5 stars for your teaching</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
