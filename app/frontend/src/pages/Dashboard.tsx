import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/services/api';
import { Mail, Users, TrendingUp, AlertTriangle, Plus } from 'lucide-react';

interface Stats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalTargets: number;
  averageClickRate: number;
  averageFastReadRate: number;
  alertCount: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-600 mt-2">Vue d'ensemble des campagnes de sensibilisation</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Campagnes totales</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalCampaigns || 0}</p>
            </div>
            <Mail className="h-10 w-10 text-primary-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cibles totales</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalTargets || 0}</p>
            </div>
            <Users className="h-10 w-10 text-primary-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Taux de clic moyen</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.averageClickRate.toFixed(1) || 0}%
              </p>
            </div>
            <TrendingUp className="h-10 w-10 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Alertes</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.alertCount || 0}</p>
            </div>
            <AlertTriangle className="h-10 w-10 text-red-600" />
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <p className="text-sm text-yellow-700">
          <strong>Lecture rapide détectée:</strong> {stats?.averageFastReadRate.toFixed(1) || 0}%
          des utilisateurs lisent trop rapidement. Formation recommandée.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Actions rapides</h2>
          <Link
            to="/campaigns/create"
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nouvelle campagne
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;