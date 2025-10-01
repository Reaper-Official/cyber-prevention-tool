import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/services/api';
import { BookOpen, Clock, Award, CheckCircle, Lock } from 'lucide-react';

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration: number;
  points: number;
  order: number;
}

interface ModuleProgress {
  moduleId: string;
  completed: boolean;
  score?: number;
  needsFollowUp: boolean;
}

const Training: React.FC = () => {
  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [progress, setProgress] = useState<ModuleProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [modulesRes, progressRes] = await Promise.all([
        api.get('/training/modules'),
        api.get('/training/progress'),
      ]);
      setModules(modulesRes.data);
      setProgress(progressRes.data);
    } catch (error) {
      console.error('Failed to fetch training data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getModuleProgress = (moduleId: string) => {
    return progress.find(p => p.moduleId === moduleId);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER':
        return 'bg-green-100 text-green-800';
      case 'INTERMEDIATE':
        return 'bg-yellow-100 text-yellow-800';
      case 'ADVANCED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'BASICS':
        return '🎯';
      case 'TECHNICAL':
        return '⚙️';
      case 'AWARENESS':
        return '👁️';
      case 'ADVANCED':
        return '🚀';
      default:
        return '📚';
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
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Formation à la Cybersécurité</h1>
        <p className="text-gray-600">
          Complétez les modules de formation pour améliorer vos compétences en sécurité et gagner des points.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {modules.map((module) => {
          const moduleProgress = getModuleProgress(module.id);
          const isCompleted = moduleProgress?.completed || false;
          const needsFollowUp = moduleProgress?.needsFollowUp || false;

          return (
            <Link
              key={module.id}
              to={`/training/${module.id}`}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">{getCategoryIcon(module.category)}</div>
                  {isCompleted && (
                    <div className={`flex items-center ${needsFollowUp ? 'text-yellow-600' : 'text-green-600'}`}>
                      <CheckCircle className="h-6 w-6" />
                    </div>
                  )}
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-2">{module.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{module.description}</p>

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{module.duration} min</span>
                  </div>
                  <div className="flex items-center">
                    <Award className="h-4 w-4 mr-1" />
                    <span>{module.points} pts</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(module.difficulty)}`}>
                    {module.difficulty}
                  </span>
                  {needsFollowUp && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Suivi requis
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 px-6 py-3 flex items-center justify-between">
                <span className="text-sm font-medium text-primary-600">
                  {isCompleted ? 'Revoir le module' : 'Commencer'}
                </span>
                <BookOpen className="h-5 w-5 text-primary-600" />
              </div>
            </Link>
          );
        })}
      </div>

      {modules.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun module disponible</h3>
          <p className="text-gray-600">Les modules de formation seront bientôt disponibles.</p>
        </div>
      )}
    </div>
  );
};

export default Training;