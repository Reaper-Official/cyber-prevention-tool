export const emailTemplates = [
  {
    name: "Réinitialisation de mot de passe - Banque",
    category: "BANKING",
    difficulty: "EASY",
    subject: "Action requise: Vérifiez votre compte bancaire",
    description: "Email frauduleux imitant une banque demandant une vérification de compte",
    indicators: ["Urgence", "Lien suspect", "Demande d'informations"],
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #003d6b; color: white; padding: 20px;">
          <h2>Votre Banque</h2>
        </div>
        <div style="padding: 20px; background: #f5f5f5;">
          <p>Cher client,</p>
          <p><strong style="color: red;">URGENT:</strong> Nous avons détecté une activité suspecte sur votre compte.</p>
          <p>Pour des raisons de sécurité, votre compte a été temporairement suspendu.</p>
          <p>Veuillez cliquer sur le lien ci-dessous pour vérifier votre identité et réactiver votre compte:</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="#" style="background: #003d6b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px;">
              Vérifier mon compte
            </a>
          </p>
          <p style="color: red;"><strong>Attention:</strong> Si vous ne vérifiez pas votre compte sous 24 heures, il sera définitivement fermé.</p>
          <p>Cordialement,<br>Le service de sécurité</p>
        </div>
      </div>
    `
  },
  {
    name: "Livraison de colis - FedEx",
    category: "DELIVERY",
    difficulty: "MEDIUM",
    subject: "Votre colis est en attente - Action requise",
    description: "Faux email de livraison demandant des frais supplémentaires",
    indicators: ["Frais inattendus", "Domaine suspect", "Pression temporelle"],
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 2px solid #4d148c;">
        <div style="background: #4d148c; color: white; padding: 20px;">
          <h2>FedEx Express</h2>
        </div>
        <div style="padding: 20px;">
          <p>Bonjour,</p>
          <p>Votre colis avec le numéro de suivi <strong>FX-8472-9183-FR</strong> est actuellement bloqué à notre centre de tri.</p>
          <p>Des frais de dédouanement de <strong>2,99 €</strong> doivent être réglés pour que nous puissions procéder à la livraison.</p>
          <p style="background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107;">
            <strong>⚠️ Attention:</strong> Votre colis sera retourné à l'expéditeur si le paiement n'est pas effectué sous 48h.
          </p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="#" style="background: #4d148c; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px;">
              Payer les frais de livraison
            </a>
          </p>
          <p style="font-size: 12px; color: #666;">
            Numéro de suivi: FX-8472-9183-FR<br>
            Date d'expédition: Il y a 3 jours
          </p>
        </div>
      </div>
    `
  },
  {
    name: "Mise à jour Microsoft - Fausse alerte",
    category: "IT_SECURITY",
    difficulty: "HARD",
    subject: "Action de sécurité Microsoft requise",
    description: "Email sophistiqué imitant Microsoft avec techniques avancées",
    indicators: ["Logo officiel", "Langage technique", "Faux sentiment d'urgence"],
    body: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 650px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #0078d4 0%, #00bcf2 100%); padding: 30px; color: white;">
          <h1 style="margin: 0; font-weight: 300;">Microsoft Security</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Centre de sécurité et conformité</p>
        </div>
        <div style="padding: 30px; background: white;">
          <p>Bonjour,</p>
          <p>Notre système de sécurité a détecté une tentative de connexion à votre compte Microsoft 365 depuis un appareil non reconnu.</p>
          
          <div style="background: #f3f2f1; padding: 20px; margin: 20px 0; border-left: 4px solid #0078d4;">
            <p style="margin: 0 0 10px 0;"><strong>Détails de la connexion:</strong></p>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Emplacement: Moscou, Russie</li>
              <li>Appareil: Windows 10 - Chrome</li>
              <li>Date: Aujourd'hui à 14:32</li>
              <li>Adresse IP: 185.234.xxx.xxx</li>
            </ul>
          </div>
          
          <p><strong>Si ce n'était pas vous, veuillez sécuriser votre compte immédiatement.</strong></p>
          
          <p style="text-align: center; margin: 30px 0;">
            <a href="#" style="background: #0078d4; color: white; padding: 15px 40px; text-decoration: none; border-radius: 2px; display: inline-block;">
              Vérifier l'activité de sécurité
            </a>
          </p>
          
          <p style="font-size: 13px; color: #605e5c; margin-top: 30px;">
            Vous recevez cet email car vous utilisez Microsoft 365. Pour plus d'informations sur la sécurité de votre compte, visitez le Centre de sécurité Microsoft.
          </p>
        </div>
        <div style="background: #f3f2f1; padding: 20px; text-align: center; font-size: 12px; color: #605e5c;">
          <p>© 2025 Microsoft Corporation. Tous droits réservés.</p>
        </div>
      </div>
    `
  },
  {
    name: "Remboursement d'impôts",
    category: "GOVERNMENT",
    difficulty: "MEDIUM",
    subject: "Vous avez droit à un remboursement de 487,50 €",
    description: "Fausse notification de remboursement d'impôts",
    indicators: ["Montant précis", "Urgence", "Demande de données bancaires"],
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #000091; color: white; padding: 20px;">
          <h2>RÉPUBLIQUE FRANÇAISE</h2>
          <p style="margin: 5px 0 0 0;">Direction Générale des Finances Publiques</p>
        </div>
        <div style="padding: 20px;">
          <p>Madame, Monsieur,</p>
          <p>Suite à la révision de votre déclaration de revenus 2024, nous avons le plaisir de vous informer que vous êtes éligible à un <strong>remboursement d'impôt de 487,50 €</strong>.</p>
          
          <div style="background: #e3f2fd; padding: 15px; margin: 20px 0; border-left: 4px solid #000091;">
            <p style="margin: 0;"><strong>Référence du dossier:</strong> RF-2024-FR-984721</p>
            <p style="margin: 10px 0 0 0;"><strong>Montant à rembourser:</strong> 487,50 €</p>
          </div>
          
          <p>Pour recevoir votre remboursement par virement bancaire, veuillez confirmer vos coordonnées bancaires en cliquant sur le bouton ci-dessous:</p>
          
          <p style="text-align: center; margin: 30px 0;">
            <a href="#" style="background: #000091; color: white; padding: 15px 30px; text-decoration: none;">
              Confirmer mes coordonnées bancaires
            </a>
          </p>
          
          <p style="background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107;">
            <strong>⚠️ Important:</strong> Cette demande expire dans 7 jours. Passé ce délai, vous devrez effectuer une nouvelle demande par courrier.
          </p>
          
          <p>Cordialement,<br>
          Le service des impôts</p>
          
          <p style="font-size: 11px; color: #666; margin-top: 30px;">
            Ce message a été généré automatiquement. Merci de ne pas y répondre.
          </p>
        </div>
      </div>
    `
  },
  {
    name: "RH - Mise à jour du règlement intérieur",
    category: "INTERNAL",
    difficulty: "HARD",
    subject: "Action requise: Signature électronique du nouveau règlement",
    description: "Email interne sophistiqué demandant des identifiants",
    indicators: ["Expéditeur interne", "Document officiel", "Deadline courte"],
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #2c3e50; color: white; padding: 20px;">
          <h2 style="margin: 0;">Ressources Humaines</h2>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Service du Personnel</p>
        </div>
        <div style="padding: 20px;">
          <p>Bonjour,</p>
          <p>Dans le cadre de la mise à jour de notre règlement intérieur conforme aux nouvelles réglementations RGPD, nous vous demandons de procéder à la <strong>signature électronique</strong> de la nouvelle version.</p>
          
          <div style="background: #ecf0f1; padding: 15px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0;"><strong>📄 Document:</strong> Règlement_Interieur_2025_v2.pdf</p>
            <p style="margin: 0;"><strong>⏰ Deadline:</strong> Vendredi 3 janvier 2025 - 17h00</p>
          </div>
          
          <p><strong>Procédure de signature:</strong></p>
          <ol>
            <li>Cliquez sur le bouton ci-dessous</li>
            <li>Connectez-vous avec vos identifiants habituels</li>
            <li>Lisez le document</li>
            <li>Signez électroniquement</li>
          </ol>
          
          <p style="text-align: center; margin: 30px 0;">
            <a href="#" style="background: #e74c3c; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px;">
              Accéder au portail RH et signer
            </a>
          </p>
          
          <p style="background: #ffeaa7; padding: 15px; border-left: 4px solid #fdcb6e;">
            <strong>⚠️ Important:</strong> Votre accès aux services internes sera suspendu si la signature n'est pas effectuée avant la deadline.
          </p>
          
          <p>Pour toute question, contactez le service RH au poste 2847.</p>
          
          <p>Cordialement,<br>
          Sophie Martin<br>
          Responsable Ressources Humaines</p>
          
          <p style="font-size: 10px; color: #7f8c8d; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ecf0f1;">
            Cet email a été envoyé depuis le serveur RH interne (rh-server-01.company.local)<br>
            Pour des raisons de sécurité, ce lien expirera dans 48 heures.
          </p>
        </div>
      </div>
    `
  }
];