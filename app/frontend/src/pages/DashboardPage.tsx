import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Mail, TrendingUp } from 'lucide-react';
export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/campaigns');
        setStats({ total: res.data.length, active: res.data.filter((c: any) => c.status === 'published').length });
      } catch (error) {
        console.error(error);
      }
    };
    load();
  }, []);
  return (
    <div className="space-y-8">
      <div><h1 className="text-3xl font-bold">Dashboard</h1><p className="text-gray-600 mt-2">Phishing awareness overview</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-600">Total Campaigns</p><p className="text-3xl font-bold mt-1">{stats?.total || 0}</p></div>
            <Mail className="w-12 h-12 text-primary-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-600">Active</p><p className="text-3xl font-bold mt-1">{stats?.active || 0}</p></div>
            <TrendingUp className="w-12 h-12 text-green-600" />
          </div>
        </div>
      </div>
    </div>
  );
}
