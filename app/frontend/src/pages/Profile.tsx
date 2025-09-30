import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { useParams } from 'react-router-dom';
import {
  Trophy,
  CheckCircle,
} from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
}

interface UserProfile {
  user: {
    id: string;
    name: string;
    email: string;
    points: number;
    level: number;
    department: string;
    rank: number;
  };
  badges: Badge[];
  trainingProgress: any[];
  recentQuizzes: any[];
}

const Profile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const response = await api.get(`/gamification/profile/${userId}`);
      setProfile(response.data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!profile) {
    return <div>Profil non trouvé</div>;
  }

  const skillsData = [
    { skill: 'Vigilance', value: Math.min((profile.user.points / 1000) * 100, 100) },
    { skill: 'Formation', value: (profile.trainingProgress.filter(p => p.completed).length / profile.trainingProgress.length) * 100 },
    { skill: 'Réactivité', value: profile.recentQuizzes.length > 0 ? profile.recentQuizzes[0].score : 0 },
    { skill: 'Signalements', value: Math.min((profile.badges.length / 7) * 100, 100) },
  ];

  const progressData = profile.recentQuizzes.slice(0, 5).reverse().map((quiz, idx) => ({
    quiz: `Quiz ${idx + 1}`,
    score: quiz.score,
  }));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profil</h1>
        <p className="text-gray-600 mt-2">Vue d'ensemble de vos performances</p>
      </div>

      <div className="bg-gradient-to-r from-primary-600 to-blue-600 rounded-lg shadow-lg p-8 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-4xl font-bold text-primary-600">
              {profile.user.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-3xl font-bold">{profile.user.name}</h2>
              <p className="text-blue-100 mt-1">{profile.user.email}</p>
              <p className="text-blue-200 mt-1">{profile.user.department || 'Département non spécifié'}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end space-x-2 mb-2">
              <Trophy className="h-8 w-8" />
              <span className="text-4xl font-bold">{profile.user.points}</span>
            </div>
            <p className="text-blue-100">Points</p>
            <div className="mt-4 flex items-center space-x-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{profile.user.level}</p>
                <p className="text-sm text-blue-200">Niveau</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">#{profile.user.rank}</p>
                <p className="text-sm text-blue-200">Classement</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Badges Débloqués</h3>
            <span className="text-sm text-gray-600">{profile.badges.length} / 7</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {profile.badges.map((badge) => (
              <div
                key={badge.id}
                className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-300 rounded-lg text-center"
              >
                <div className="text-4xl mb-2">{badge.icon}</div>
                <p className="font-bold text-gray-900 text-sm">{badge.name}</p>
                <p className="text-xs text-gray-600 mt-1">{badge.description}</p>
                <p className="text-xs text-yellow-700 font-medium mt-2">+{badge.points} pts</p>
              </div>
            ))}
            {Array.from({ length: 7 - profile.badges.length }).map((_, idx) => (
              <div
                key={`locked-${idx}`}
                className="p-4 bg-gray-100 border-2 border-gray-200 rounded-lg text-center opacity-50"
              >
                <div className="text-4xl mb-2">🔒</div>
                <p className="font-bold text-gray-500 text-sm">Verrouillé</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Progression Niveau</h3>
          <div className="text-center mb-6">
            <div className="relative inline-block">
              <svg className="w-32 h-32">
                <circle
                  className="text-gray-200"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                  r="56"
                  cx="64"
                  cy="64"
                />
                <circle
                  className="text-primary-600"
                  strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 56}
                  strokeDashoffset={2 * Math.PI * 56 * (1 - ((profile.user.points % 100) / 100))}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="56"
                  cx="64"
                  cy="64"
                  style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-gray-900">{profile.user.level}</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              {profile.user.points % 100} / 100 XP vers le niveau {profile.user.level + 1}
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Points totaux</span>
              <span className="font-bold text-gray-900">{profile.user.points}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Badges</span>
              <span className="font-bold text-gray-900">{profile.badges.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Formations</span>
              <span className="font-bold text-gray-900">
                {profile.trainingProgress.filter(p => p.completed).length} / {profile.trainingProgress.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Compétences</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={skillsData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="skill" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar
                name="Score"
                dataKey="value"
                stroke="#0ea5e9"
                fill="#0ea5e9"
                fillOpacity={0.6}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Progression Quiz</h3>
          {progressData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="quiz" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              Aucun quiz complété
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Progression des Formations</h3>
        <div className="space-y-4">
          {profile.trainingProgress.map((progress) => (
            <div key={progress.id} className="flex items-center">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">{progress.module.title}</span>
                  {progress.completed ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <span className="text-xs text-gray-500">En cours</span>
                  )}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      progress.completed ? 'bg-green-600' : 'bg-blue-600'
                    }`}
                    style={{ width: progress.completed ? '100%' : '50%' }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;