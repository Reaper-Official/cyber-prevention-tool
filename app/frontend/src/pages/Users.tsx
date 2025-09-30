import React, { useEffect, useState, useRef } from 'react';
import { api } from '@/services/api';
import { UserPlus, Edit2, Upload, Download, Filter } from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  department: string | null;
  createdAt: string;
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [departments, setDepartments] = useState<string[]>([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [selectedDepartment, users]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
      
      const uniqueDepts = [...new Set(response.data.map((u: User) => u.department).filter(Boolean))];
      setDepartments(uniqueDepts as string[]);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    if (selectedDepartment === 'all') {
      setFilteredUsers(users);
    } else {
      setFilteredUsers(users.filter(u => u.department === selectedDepartment));
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/users/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImportResult(response.data);
      setShowImportModal(true);
      fetchUsers();
    } catch (error) {
      console.error('Import failed:', error);
      alert('Erreur lors de l\'import');
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get('/users/export', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'users_export.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export failed:', error);
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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Utilisateurs</h1>
          <p className="text-gray-600 mt-2">Gérer les utilisateurs de la plateforme</p>
        </div>
        <div className="flex space-x-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImport}
            accept=".json,.csv"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Upload className="h-5 w-5 mr-2" />
            Importer
          </button>
          <button
            onClick={handleExport}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="h-5 w-5 mr-2" />
            Exporter
          </button>
          <button className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
            <UserPlus className="h-5 w-5 mr-2" />
            Nouvel utilisateur
          </button>
        </div>
      </div>

      <div className="mb-6 flex items-center space-x-4">
        <Filter className="h-5 w-5 text-gray-500" />
        <select
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        >
          <option value="all">Tous les départements</option>
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
        <span className="text-sm text-gray-600">
          {filteredUsers.length} utilisateur(s)
        </span>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Nom
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Département
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Rôle
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {user.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.department || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button className="text-primary-600 hover:text-primary-900 flex items-center">
                    <Edit2 className="h-4 w-4 mr-1" />
                    Modifier
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showImportModal && importResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Résultat de l'import</h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Total: {importResult.summary.total} | 
                Succès: <span className="text-green-600">{importResult.summary.success}</span> | 
                Échecs: <span className="text-red-600">{importResult.summary.failed}</span>
              </p>
            </div>

            {importResult.imported.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium mb-2">Utilisateurs importés:</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {importResult.imported.map((user: any, idx: number) => (
                    <div key={idx} className="text-sm bg-green-50 p-2 rounded">
                      {user.email} - Mot de passe temporaire: <code className="bg-green-100 px-1">{user.tempPassword}</code>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {importResult.errors.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium mb-2 text-red-600">Erreurs:</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {importResult.errors.map((error: any, idx: number) => (
                    <div key={idx} className="text-sm bg-red-50 p-2 rounded">
                      {error.email}: {error.error}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setShowImportModal(false)}
              className="w-full mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;