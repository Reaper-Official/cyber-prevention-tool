import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import { ReadingTracker } from '@/utils/readingTracker';
import { CheckCircle, AlertTriangle, Clock } from 'lucide-react';

interface TrainingModule {
  id: string;
  title: string;
  content: string;
  duration: number;
  points: number;
}

const TrainingReader: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [module, setModule] = useState<TrainingModule | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const trackerRef = useRef<ReadingTracker | null>(null);

  useEffect(() => {
    fetchModule();
  }, [id]);

  const fetchModule = async () => {
    try {
      const response = await api.get(`/training/modules/${id}`);
      setModule(response.data);
      
      // Calculer le nombre de mots dans le contenu
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = response.data.content;
      const text = tempDiv.textContent || tempDiv.innerText || '';
      const wordCount = text.trim().split(/\s+/).length;
      
      // Initialiser le tracker
      trackerRef.current = new ReadingTracker(wordCount);
    } catch (error) {
      console.error('Failed to fetch module:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!trackerRef.current || !module) return;

    setCompleting(true);
    const stats = trackerRef.current.getReadingStats();

    try {
      await api.post(`/training/modules/${id}/complete`, {
        readingStats: stats,
      });

      if (stats.suspicious) {
        // Afficher un avertissement
        alert(
          `Attention : Votre temps de lecture semble insuffisant (${stats.wordsPerMinute} mots/min).\n\n` +
          `Pour une formation efficace, prenez le temps de lire attentivement le contenu.\n` +
          `Cette formation sera marquée comme nécessitant un suivi supplémentaire.`
        );
      }

      navigate('/training');
    } catch (error) {
      console.error('Failed to complete module:', error);
      alert('Erreur lors de la validation de la formation');
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!module) {
    return <div>Module non trouvé</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-blue-600 text-white p-8">
          <h1 className="text-3xl font-bold mb-2">{module.title}</h1>
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              <span>{module.duration} minutes</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              <span>{module.points} points</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div 
          className="prose prose-lg max-w-none p-8"
          dangerouslySetInnerHTML={{ __html: module.content }}
        />

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-6 border-t">
          <div className="flex items-start space-x-3 mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
            <AlertTriangle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-700">
              <p className="font-medium mb-1">Prenez le temps de lire attentivement</p>
              <p>Votre temps de lecture est enregistré pour garantir une formation efficace. Une lecture trop rapide sera signalée et nécessitera un suivi supplémentaire.</p>
            </div>
          </div>

          <button
            onClick={handleComplete}
            disabled={completing}
            className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {completing ? 'Validation en cours...' : 'J\'ai terminé la lecture'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrainingReader;