import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';
import {
  BarChart3,
  TrendingUp,
  Users,
  Mail,
  AlertTriangle,
  CheckCircle,
  Trophy,
  Target,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface DashboardStats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalUsers: number;
  clickRate: number;
  reportRate: number;
  trainingCompletion: number;
  recentCampaigns: any[];
  departmentStats: any[];
  trendData: any[];
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, leaderboardRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/gamification/leaderboard?limit=5'),
      ]);
      setStats(statsRes.data);
      setLeaderboard(leaderboardRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
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

  const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord</h1>
        <p className="text-gray-600 mt-2">Vue d'ensemble de vos campagnes de sensibilisation</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Campagnes Totales</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.totalCampaigns || 0}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            {stats?.activeCampaigns || 0} actives
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Utilisateurs</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.totalUsers || 0}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-green-600 mt-4">
            {stats?.trainingCompletion || 0}% formation complétée
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Taux de Clic</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats?.clickRate.toFixed(1) || 0}%
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Target className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            {stats?.clickRate > 30 ? 'À améliorer' : 'Bon résultat'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Taux de Signalement</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats?.reportRate.toFixed(1) || 0}%
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-green-600 mt-4">
            Personnel vigilant
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Trend Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Évolution des Performances</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats?.trendData || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="clickRate" stroke="#ef4444" name="Taux de Clic %" />
              <Line type="monotone" dataKey="reportRate" stroke="#10b981" name="Taux de Signalement %" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Department Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Performance par Département</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats?.departmentStats || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="clickRate" fill="#ef4444" name="Taux de Clic %" />
              <Bar dataKey="reportRate" fill="#10b981" name="Taux de Signalement %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Campaigns */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Campagnes Récentes</h3>
          <div className="space-y-4">
            {stats?.recentCampaigns?.map((campaign) => (
              <div key={campaign.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{campaign.name}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(campaign.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full ${
                      campaign.status === 'COMPLETED'
                        ? 'bg-green-100 text-green-800'
                        : campaign.status === 'ACTIVE'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {campaign.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Top Performers</h3>
            <Trophy className="h-6 w-6 text-yellow-500" />
          </div>
          <div className="space-y-3">
            {leaderboard.map((user, index) => (
              <div key={user.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                    index === 0
                      ? 'bg-yellow-100 text-yellow-600'
                      : index === 1
                      ? 'bg-gray-200 text-gray-600'
                      : index === 2
                      ? 'bg-orange-100 text-orange-600'
                      : 'bg-blue-100 text-blue-600'
                  }`}
                >
                  #{index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.department || 'N/A'}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary-600">{user.points} pts</p>
                  <p className="text-xs text-gray-500">Niveau {user.level}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;