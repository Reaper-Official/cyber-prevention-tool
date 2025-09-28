import React, { useState, useEffect } from 'react';
import { Users, Building, UserCheck, Search } from 'lucide-react';
import { api } from '../../services/api';

interface TargetSelectionProps {
  targetType: 'department' | 'specific_users' | 'all';
  targetIds: string[];
  onChange: (type: 'department' | 'specific_users' | 'all', ids: string[]) => void;
}

const TargetSelection: React.FC<TargetSelectionProps> = ({
  targetType,
  targetIds,
  onChange
}) => {
  const [departments, setDepartments] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [_loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [deptsResponse, usersResponse] = await Promise.all([
        api.get('/api/departments'),
        api.get('/api/users')
      ]);
      setDepartments(deptsResponse.data);
      setUsers(usersResponse.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTargetTypeChange = (type: 'department' | 'specific_users' | 'all') => {
    onChange(type, []);
  };

  const handleDepartmentToggle = (deptId: string) => {
    const newIds = targetIds.includes(deptId)
      ? targetIds.filter(id => id !== deptId)
      : [...targetIds, deptId];
    onChange(targetType, newIds);
  };

  const handleUserToggle = (userId: string) => {
    const newIds = targetIds.includes(userId)
      ? targetIds.filter(id => id !== userId)
      : [...targetIds, userId];
    onChange(targetType, newIds);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">
        Sélection des destinataires
      </h2>

      {/* Type de ciblage */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          className={`p-4 border-2 rounded-lg transition-all ${
            targetType === 'department'
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => handleTargetTypeChange('department')}
        >
          <Building className="w-8 h-8 mx-auto mb-2 text-primary-600" />
          <h3 className="font-semibold">Pôle spécifique</h3>
          <p className="text-sm text-gray-600 mt-1">Cibler par département</p>
        </button>

        <button
          className={`p-4 border-2 rounded-lg transition-all ${
            targetType === 'specific_users'
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => handleTargetTypeChange('specific_users')}
        >
          <UserCheck className="w-8 h-8 mx-auto mb-2 text-primary-600" />
          <h3 className="font-semibold">Employés ciblés</h3>
          <p className="text-sm text-gray-600 mt-1">Sélection manuelle</p>
        </button>

        <button
          className={`p-4 border-2 rounded-lg transition-all ${
            targetType === 'all'
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => handleTargetTypeChange('all')}
        >
          <Users className="w-8 h-8 mx-auto mb-2 text-primary-600" />
          <h3 className="font-semibold">Tous les employés</h3>
          <p className="text-sm text-gray-600 mt-1">Organisation complète</p>
        </button>
      </div>

      {/* Sélection selon le type */}
      {targetType === 'department' && (
        <div>
          <h3 className="text-lg font-medium mb-4">Sélectionner les départements</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {departments.map(dept => (
              <label
                key={dept.id}
                className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={targetIds.includes(dept.id)}
                  onChange={() => handleDepartmentToggle(dept.id)}
                  className="mr-3"
                />
                <div className="flex-1">
                  <p className="font-medium">{dept.name}</p>
                  <p className="text-sm text-gray-600">
                    {dept.userCount} employés • Risque: {dept.riskLevel}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {targetType === 'specific_users' && (
        <div>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un employé..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto border rounded-lg">
            {filteredUsers.map(user => (
              <label
                key={user.id}
                className="flex items-center p-3 border-b hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={targetIds.includes(user.id)}
                  onChange={() => handleUserToggle(user.id)}
                  className="mr-3"
                />
                <div className="flex-1">
                  <p className="font-medium">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-sm text-gray-600">
                    {user.email} • {user.department?.name}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {targetType === 'all' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <Users className="w-12 h-12 text-blue-600 mx-auto mb-3" />
          <h3 className="font-semibold text-lg mb-2">
            Campagne pour toute l'organisation
          </h3>
          <p className="text-gray-600">
            {users.length} employés seront ciblés par cette campagne
          </p>
        </div>
      )}

      {/* Résumé de la sélection */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium mb-2">Résumé de la sélection</h4>
        <p className="text-sm text-gray-600">
          {targetType === 'all' 
            ? `Tous les employés (${users.length})`
            : targetType === 'department'
            ? `${targetIds.length} département(s) sélectionné(s)`
            : `${targetIds.length} employé(s) sélectionné(s)`
          }
        </p>
      </div>
    </div>
  );
};

export default TargetSelection;