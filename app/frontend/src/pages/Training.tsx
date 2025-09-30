import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { BookOpen, CheckCircle, Clock, ArrowLeft, AlertTriangle } from 'lucide-react';
import { ReadingDetector } from '@/utils/readingDetector';

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  content: string;
  duration: number;
  minReadingTime: number;
  completed: boolean;
}

const Training: React.FC = () => {
  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [selectedModule, setSelectedModule] = useState<TrainingModule | null>(null);
  const [loading, setLoading] = useState(true);
  const [readingTime, setReadingTime] = useState(0);
  const [readingDetector, setReadingDetector] = useState<ReadingDetector | null>(null);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    fetchModules();
  }, []);

  useEffect(() => {
    let interval: number;
    
    if (selectedModule && !selectedModule.completed) {
      const detector = new ReadingDetector(0.25);
      setReadingDetector(detector);
      
      interval = window.setInterval(() => {
        setReadingTime((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) window.clearInterval(interval);
      if (readingDetector) readingDetector.cleanup();
    };
  }, [selectedModule]);

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

  const handleComplete = async () => {
    if (!selectedModule || !readingDetector) return;

    const metrics = readingDetector.getMetrics();
    
    if (readingTime < selectedModule.minReadingTime) {
      setShowWarning(true);
      return;
    }

    try {
      await api.post(`/training/modules/${selectedModule.id}/complete`, {
        readingTime,
        metrics,
      });
      fetchModules();
      setSelectedModule(null);
      setReadingTime(0);
    } catch (error) {
      console.error('Failed to complete module:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (!selectedModule) return 0;
    return Math.min((readingTime / selectedModule.minReadingTime) * 100, 100);
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
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {module.duration} min
                </div>
                {!module.completed && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                    À faire
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  setSelectedModule(null);
                  setReadingTime(0);
                  setShowWarning(false);
                }}
                className="flex items-center text-primary-600 hover:text-primary-700"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Retour aux modules
              </button>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm text-gray-600">Temps de lecture</div>
                  <div className="text-2xl font-bold text-primary-600">
                    {formatTime(readingTime)}
                  </div>
                  <div className="text-xs text-gray-500">
                    Minimum: {formatTime(selectedModule.minReadingTime)}
                  </div>
                </div>
              </div>
            </div>

            {!selectedModule.completed && (
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getProgressPercentage()}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {getProgressPercentage().toFixed(0)}% du temps minimum de lecture
                </p>
              </div>
            )}
          </div>

          <div className="p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{selectedModule.title}</h2>
            
            <div 
              className="prose max-w-none training-content"
              dangerouslySetInnerHTML={{ __html: selectedModule.content }}
            />
          </div>

          <div className="p-6 border-t border-gray-200 bg-gray-50">
            {showWarning && (
              <div className="mb-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 flex items-start">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    Temps de lecture insuffisant
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Pour valider ce module, nous vous recommandons de prendre le temps de lire
                    attentivement tout le contenu. Il vous reste{' '}
                    {formatTime(selectedModule.minReadingTime - readingTime)} de lecture.
                  </p>
                </div>
              </div>
            )}

            {!selectedModule.completed && (
              <button
                onClick={handleComplete}
                disabled={readingTime < selectedModule.minReadingTime}
                className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${
                  readingTime >= selectedModule.minReadingTime
                    ? 'bg-primary-600 text-white hover:bg-primary-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {readingTime >= selectedModule.minReadingTime
                  ? 'Marquer comme terminé'
                  : `Lisez encore ${formatTime(selectedModule.minReadingTime - readingTime)}`}
              </button>
            )}

            {selectedModule.completed && (
              <div className="flex items-center justify-center text-green-600">
                <CheckCircle className="h-6 w-6 mr-2" />
                <span className="font-medium">Module terminé</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Training;