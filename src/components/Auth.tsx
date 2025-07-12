
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SkillTag } from './SkillTag';
import { 
  Mail, 
  Lock, 
  User, 
  Plus, 
  ArrowRight,
  Sparkles,
  Users,
  MessageCircle,
  Target,
  AlertCircle
} from 'lucide-react';

export function Auth() {
  const { login, register, error } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    bio: '',
    skillsOffered: [] as string[],
    skillsWanted: [] as string[]
  });
  const [newSkill, setNewSkill] = useState('');
  const [skillType, setSkillType] = useState<'offered' | 'wanted'>('offered');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        // For registration, we need to include password
        await register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          bio: formData.bio,
          skillsOffered: formData.skillsOffered,
          skillsWanted: formData.skillsWanted
        });
      }
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addSkill = () => {
    if (!newSkill.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      [skillType === 'offered' ? 'skillsOffered' : 'skillsWanted']: [
        ...prev[skillType === 'offered' ? 'skillsOffered' : 'skillsWanted'],
        newSkill.trim()
      ]
    }));
    setNewSkill('');
  };

  const removeSkill = (skill: string, type: 'offered' | 'wanted') => {
    setFormData(prev => ({
      ...prev,
      [type === 'offered' ? 'skillsOffered' : 'skillsWanted']: 
        prev[type === 'offered' ? 'skillsOffered' : 'skillsWanted'].filter(s => s !== skill)
    }));
  };

  const popularSkills = [
    'Guitar', 'Piano', 'Cooking', 'Photography', 'Programming', 'Design',
    'Dancing', 'Languages', 'Yoga', 'Writing', 'Marketing', 'Art'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left side - Hero content */}
          <div className="text-white space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold">SkillSwap</h1>
            </div>
            
            <h2 className="text-5xl font-bold leading-tight">
              Exchange Skills.<br />
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Expand Horizons.
              </span>
            </h2>
            
            <p className="text-xl text-purple-100 leading-relaxed">
              Your one-stop app to learn, teach, and grow through skill sharing with a vibrant community of learners and experts.
            </p>

            {/* Feature highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <Users className="w-8 h-8 mx-auto mb-2 text-yellow-300" />
                <h3 className="font-semibold">Find Partners</h3>
                <p className="text-sm text-purple-100">Connect with skilled individuals</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 text-green-300" />
                <h3 className="font-semibold">Easy Communication</h3>
                <p className="text-sm text-purple-100">Chat and coordinate learning</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <Target className="w-8 h-8 mx-auto mb-2 text-blue-300" />
                <h3 className="font-semibold">Skill Matching</h3>
                <p className="text-sm text-purple-100">AI-powered compatibility</p>
              </div>
            </div>
          </div>

          {/* Right side - Auth form */}
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl font-bold text-gray-900">
                {isLogin ? 'Welcome Back!' : 'Join SkillSwap'}
              </CardTitle>
              <p className="text-gray-600">
                {isLogin 
                  ? 'Sign in to continue your learning journey' 
                  : 'Create your account and start exchanging skills'
                }
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          type="text"
                          placeholder="Enter your name"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          className="pl-10 h-12"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bio
                      </label>
                      <textarea
                        placeholder="Tell us about yourself and your interests..."
                        value={formData.bio}
                        onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                        rows={3}
                        required
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="pl-10 h-12"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className="pl-10 h-12"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                {!isLogin && (
                  <div className="space-y-6">
                    {/* Skills Section */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Add Your Skills
                      </label>
                      
                      <div className="flex gap-2 mb-4">
                        <select
                          value={skillType}
                          onChange={(e) => setSkillType(e.target.value as 'offered' | 'wanted')}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="offered">Skills I Offer</option>
                          <option value="wanted">Skills I Want</option>
                        </select>
                        <Input
                          placeholder="Add a skill..."
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                          className="flex-1"
                        />
                        <Button type="button" onClick={addSkill} size="sm">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Popular Skills */}
                      <div className="mb-4">
                        <p className="text-xs text-gray-600 mb-2">Popular skills:</p>
                        <div className="flex flex-wrap gap-1">
                          {popularSkills.map((skill) => (
                            <Badge
                              key={skill}
                              variant="outline"
                              className="cursor-pointer hover:bg-purple-50 text-xs"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  [skillType === 'offered' ? 'skillsOffered' : 'skillsWanted']: [
                                    ...prev[skillType === 'offered' ? 'skillsOffered' : 'skillsWanted'],
                                    skill
                                  ]
                                }));
                              }}
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Skills Display */}
                      {formData.skillsOffered.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-emerald-700 mb-2">Skills I Offer:</p>
                          <div className="flex flex-wrap gap-1">
                            {formData.skillsOffered.map((skill) => (
                              <SkillTag
                                key={skill}
                                skill={skill}
                                variant="offered"
                                size="sm"
                                removable
                                onRemove={() => removeSkill(skill, 'offered')}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {formData.skillsWanted.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-blue-700 mb-2">Skills I Want:</p>
                          <div className="flex flex-wrap gap-1">
                            {formData.skillsWanted.map((skill) => (
                              <SkillTag
                                key={skill}
                                skill={skill}
                                variant="wanted"
                                size="sm"
                                removable
                                onRemove={() => removeSkill(skill, 'wanted')}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold"
                >
                  {isLoading ? (
                    'Please wait...'
                  ) : (
                    <>
                      {isLogin ? 'Sign In' : 'Create Account'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  {isLogin 
                    ? "Don't have an account? Sign up" 
                    : 'Already have an account? Sign in'
                  }
                </button>
              </div>

              {isLogin && (
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-3">Quick login for demo:</p>
                  <div className="space-y-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          email: 'shreya@example.com',
                          password: 'password123'
                        }));
                      }}
                      className="w-full"
                    >
                      Login as Shreya (Fashion Designer)
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          email: 'arjun@example.com',
                          password: 'password123'
                        }));
                      }}
                      className="w-full"
                    >
                      Login as Arjun (Guitar Teacher)
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
