import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Trophy, Medal, Award } from 'lucide-react';

interface LeaderboardUser {
  id: string;
  name: string;
  email: string;
  points: number;
  level: number;
  badges: string[];
  department: string | null;
}

const Leaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await api.get('/gamification/leaderboard?limit=50');
      setLeaderboard(response.data);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMedalIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-8 w-8 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-8 w-8 text-gray-400" />;
    if (rank === 3) return <Award className="h-8 w-8 text-orange-500" />;
    return <span className="text-lg font-bold text-gray-500">#{rank}</span>;
  };

  const getRowClass = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-300';
    if (rank === 2) return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300';
    if (rank === 3) return 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-300';
    return 'bg-white border-gray-200';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Classement</h1>
        <p className="text-gray-600 mt-2">Les champions de la cybersécurité</p>
      </div>

      <div className="mb-12">
        <div className="flex items-end justify-center space-x-4">
          {leaderboard[1] && (
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center text-3xl font-bold text-gray-700 mb-2">
                {leaderboard[1].name.charAt(0)}
              </div>
              <Medal className="h-10 w-10 text-gray-400 mb-2" />
              <p className="font-bold text-gray-900">{leaderboard[1].name}</p>
              <p className="text-sm text-gray-600">{leaderboard[1].points} pts</p>
              <div className="mt-4 w-32 h-24 bg-gradient-to-t from-gray-200 to-gray-100 rounded-t-lg flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-600">#2</span>
              </div>
            </div>
          )}

          {leaderboard[0] && (
            <div className="flex flex-col items-center -mt-8">
              <div className="w-32 h-32 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center text-4xl font-bold text-white mb-2 shadow-lg">
                {leaderboard[0].name.charAt(0)}
              </div>
              <Trophy className="h-12 w-12 text-yellow-500 mb-2" />
              <p className="font-bold text-gray-900 text-lg">{leaderboard[0].name}</p>
              <p className="text-sm text-gray-600">{leaderboard[0].points} pts</p>
              <div className="mt-4 w-36 h-32 bg-gradient-to-t from-yellow-300 to-yellow-200 rounded-t-lg flex items-center justify-center shadow-lg">
                <span className="text-3xl font-bold text-yellow-700">#1</span>
              </div>
            </div>
          )}

          {leaderboard[2] && (
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-gradient-to-br from-orange-300 to-orange-400 rounded-full flex items-center justify-center text-3xl font-bold text-white mb-2">
                {leaderboard[2].name.charAt(0)}
              </div>
              <Award className="h-10 w-10 text-orange-500 mb-2" />
              <p className="font-bold text-gray-900">{leaderboard[2].name}</p>
              <p className="text-sm text-gray-600">{leaderboard[2].points} pts</p>
              <div className="mt-4 w-32 h-20 bg-gradient-to-t from-orange-300 to-orange-200 rounded-t-lg flex items-center justify-center">
                <span className="text-2xl font-bold text-orange-700">#3</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rang</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilisateur</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Département</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Niveau</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Badges</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {leaderboard.map((user, index) => (
              <tr key={user.id} className={`border-l-4 ${getRowClass(index + 1)}`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center justify-center w-12">
                    {getMedalIcon(index + 1)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.department || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                    Niv. {user.level}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.badges.length}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-lg font-bold text-primary-600">{user.points}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;