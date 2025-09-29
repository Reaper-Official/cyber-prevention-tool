import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { BookOpen, CheckCircle, Clock } from 'lucide-react';

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  content: string;
  duration: number;
  completed: boolean;
}

const Training: React.FC = () => {
  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [selectedModule, setSelectedModule] = useState<TrainingModule | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      const response = await api.get('/training/modules');
      setModules(response.data);
    } catch (error) {
      console.error('Failed to fetch training modules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (moduleId: string) => {
    try {
      await api.post(`/training/modules/${moduleId}/complete`);
      fetchModules();
      setSelectedModule(null);
    } catch (error) {
      console.error('Failed to complete module:', error);
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
        <h1 className="text-3xl font-bold text-gray-900">Formation</h1>
        <p className="text-gray-600 mt-2">
          Modules de formation sur la sensibilisation au phishing
        </p>
      </div>

      {!selectedModule ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => (
            <div
              key={module.id}
              className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedModule(module)}
            >
              <div className="flex items-start justify-between mb-4">
                <BookOpen className="h-8 w-8 text-primary-600" />
                {module.completed && <CheckCircle className="h-6 w-6 text-green-600" />}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{module.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{module.description}</p>
              <div className="flex items-center text-xs text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                {module.duration} min
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-8">
          <button
            onClick={() => setSelectedModule(null)}
            className="mb-4 text-primary-600 hover:text-primary-700"
          >
            ← Retour aux modules
          </button>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{selectedModule.title}</h2>
          <div className="prose max-w-none mb-8" dangerouslySetInnerHTML={{ __html: selectedModule.content }} />
          {!selectedModule.completed && (
            <button
              onClick={() => handleComplete(selectedModule.id)}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Marquer comme terminé
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Training;