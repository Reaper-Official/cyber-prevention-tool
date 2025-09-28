import React, { useState, useEffect } from 'react';
import { FileText, Shield, AlertTriangle, DollarSign } from 'lucide-react';
import { api } from '../../services/api';

interface Template {
  id: string;
  name: string;
  category: string;
  difficulty: string;
  description: string;
  previewSubject: string;
}

interface TemplateSelectionProps {
  selectedId?: string;
  onSelect: (id: string) => void;
}

const TemplateSelection: React.FC<TemplateSelectionProps> = ({ selectedId, onSelect }) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/campaigns/templates');
      setTemplates(response.data);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'credentials':
        return <Shield className="w-6 h-6" />;
      case 'attachment':
        return <FileText className="w-6 h-6" />;
      case 'link':
        return <AlertTriangle className="w-6 h-6" />;
      default:
        return <DollarSign className="w-6 h-6" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Chargement des templates...</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Templates disponibles</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map(template => (
          <div
            key={template.id}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              selectedId === template.id
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onSelect(template.id)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="text-primary-600">
                  {getCategoryIcon(template.category)}
                </div>
                <div>
                  <h4 className="font-semibold">{template.name}</h4>
                  <p className="text-sm text-gray-600">{template.previewSubject}</p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(template.difficulty)}`}>
                {template.difficulty}
              </span>
            </div>
            
            <p className="text-sm text-gray-600">{template.description}</p>
          </div>
        ))}
      </div>

      {templates.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Aucun template disponible
        </div>
      )}
    </div>
  );
};

export default TemplateSelection;