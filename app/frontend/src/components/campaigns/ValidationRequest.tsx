import React from 'react';

interface ValidationRequestProps {
  campaignId: string | null;
  campaignName: string;
}

const ValidationRequest: React.FC<ValidationRequestProps> = ({ campaignId, campaignName }) => {
  if (!campaignId) {
    return <div>Erreur: Pas de campagne</div>;
  }

  return (
    <div className="text-center py-12">
      <h2>Campagne: {campaignName}</h2>
      <p>ID: {campaignId}</p>
      <div className="mt-8">
        <a href="/campaigns" className="px-6 py-2 bg-gray-200">
          Retour
        </a>
      </div>
    </div>
  );
};

export default ValidationRequest;