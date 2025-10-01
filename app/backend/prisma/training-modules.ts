export const trainingModulesData = [
  {
    title: 'Reconnaître un Email de Phishing',
    description: 'Maîtrisez l\'identification des emails malveillants',
    category: 'BASICS',
    difficulty: 'BEGINNER',
    duration: 12,
    minReadingTime: 240,
    points: 10,
    order: 1,
    content: `
      <style>
        .training-module {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          line-height: 1.8;
          color: #1e293b;
        }
        .hero-section {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: white;
          padding: 3rem;
          border-radius: 1rem;
          margin-bottom: 3rem;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }
        .hero-title {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 1rem;
          letter-spacing: -0.025em;
        }
        .hero-subtitle {
          font-size: 1.25rem;
          opacity: 0.9;
          line-height: 1.6;
        }
        .stat-box {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin: 2rem 0;
        }
        .stat-item {
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 0.75rem;
          padding: 1.5rem;
          text-align: center;
          transition: all 0.3s ease;
        }
        .stat-item:hover {
          border-color: #0ea5e9;
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
        .stat-number {
          font-size: 2.5rem;
          font-weight: 800;
          color: #0ea5e9;
          display: block;
          margin-bottom: 0.5rem;
        }
        .stat-label {
          color: #64748b;
          font-size: 0.875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .section-title {
          font-size: 1.875rem;
          font-weight: 700;
          color: #0f172a;
          margin: 3rem 0 1.5rem 0;
          padding-bottom: 0.75rem;
          border-bottom: 3px solid #0ea5e9;
        }
        .warning-card {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border-left: 4px solid #f59e0b;
          border-radius: 0.75rem;
          padding: 1.5rem;
          margin: 2rem 0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .danger-card {
          background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
          border-left: 4px solid #ef4444;
          border-radius: 0.75rem;
          padding: 1.5rem;
          margin: 2rem 0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .success-card {
          background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
          border-left: 4px solid #10b981;
          border-radius: 0.75rem;
          padding: 1.5rem;
          margin: 2rem 0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .info-card {
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
          border-left: 4px solid #3b82f6;
          border-radius: 0.75rem;
          padding: 1.5rem;
          margin: 2rem 0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .signal-grid {
          display: grid;
          gap: 1.5rem;
          margin: 2rem 0;
        }
        .signal-item {
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 0.75rem;
          padding: 1.5rem;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .signal-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 100%;
          background: linear-gradient(180deg, #f59e0b, #d97706);
          transition: width 0.3s ease;
        }
        .signal-item:hover::before {
          width: 100%;
          opacity: 0.05;
        }
        .signal-item:hover {
          border-color: #f59e0b;
          transform: translateX(4px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
        .signal-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #f59e0b;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .signal-icon {
          font-size: 1.5rem;
        }
        .code-example {
          background: #1e293b;
          color: #e2e8f0;
          padding: 1rem 1.5rem;
          border-radius: 0.5rem;
          font-family: 'Monaco', 'Courier New', monospace;
          font-size: 0.875rem;
          margin: 1rem 0;
          overflow-x: auto;
        }
        .code-bad {
          background: #7f1d1d;
          color: #fecaca;
          border: 2px solid #991b1b;
        }
        .code-good {
          background: #064e3b;
          color: #a7f3d0;
          border: 2px solid #047857;
        }
        .example-box {
          background: #f8fafc;
          border: 2px solid #cbd5e1;
          border-radius: 0.75rem;
          padding: 1.5rem;
          margin: 2rem 0;
        }
        .example-header {
          background: #0f172a;
          color: white;
          padding: 1rem 1.5rem;
          border-radius: 0.5rem 0.5rem 0 0;
          font-size: 0.875rem;
          font-family: monospace;
          margin: -1.5rem -1.5rem 1.5rem -1.5rem;
        }
        .example-body {
          line-height: 1.8;
        }
        .analysis-box {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border: 2px solid #f59e0b;
          border-radius: 0.75rem;
          padding: 1.5rem;
          margin-top: 1.5rem;
        }
        .analysis-title {
          font-weight: 700;
          color: #92400e;
          margin-bottom: 1rem;
          font-size: 1.125rem;
        }
        .analysis-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .analysis-list li {
          padding: 0.75rem 0;
          border-bottom: 1px solid rgba(146, 64, 14, 0.2);
          display: flex;
          align-items: start;
          gap: 0.75rem;
        }
        .analysis-list li:last-child {
          border-bottom: none;
        }
        .analysis-number {
          background: #92400e;
          color: white;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.875rem;
          flex-shrink: 0;
        }
        .protocol-steps {
          display: grid;
          gap: 1rem;
          margin: 2rem 0;
        }
        .protocol-step {
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 0.75rem;
          padding: 1.5rem;
          display: flex;
          align-items: start;
          gap: 1.5rem;
          transition: all 0.3s ease;
        }
        .protocol-step:hover {
          border-color: #0ea5e9;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }
        .step-number {
          background: linear-gradient(135deg, #0ea5e9, #0284c7);
          color: white;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 1.5rem;
          flex-shrink: 0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .step-content h4 {
          font-size: 1.125rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 0.5rem 0;
        }
        .step-content p {
          color: #64748b;
          margin: 0;
          line-height: 1.6;
        }
        .key-takeaways {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: white;
          padding: 2.5rem;
          border-radius: 1rem;
          margin: 3rem 0;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }
        .key-takeaways h3 {
          font-size: 1.875rem;
          font-weight: 800;
          margin: 0 0 1.5rem 0;
        }
        .key-takeaways ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .key-takeaways li {
          padding: 0.875rem 0;
          padding-left: 2rem;
          position: relative;
          font-size: 1.125rem;
          line-height: 1.6;
        }
        .key-takeaways li::before {
          content: '✓';
          position: absolute;
          left: 0;
          color: #10b981;
          font-weight: 800;
          font-size: 1.25rem;
        }
        .tip-box {
          background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);
          border-left: 4px solid #8b5cf6;
          border-radius: 0.75rem;
          padding: 1.5rem;
          margin: 1.5rem 0;
        }
        .tip-label {
          font-weight: 700;
          color: #6b21a8;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        @media (max-width: 768px) {
          .hero-title {
            font-size: 1.875rem;
          }
          .section-title {
            font-size: 1.5rem;
          }
        }
      </style>

      <div class="training-module">
        <div class="hero-section">
          <h1 class="hero-title">Reconnaître un Email de Phishing</h1>
          <p class="hero-subtitle">
            Apprenez à identifier les signaux d'alerte dans vos emails professionnels et personnels pour protéger vos données et celles de l'entreprise.
          </p>
        </div>

        <div class="stat-box">
          <div class="stat-item">
            <span class="stat-number">91%</span>
            <span class="stat-label">Des cyberattaques commencent par un email</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">1/99</span>
            <span class="stat-label">Emails est une tentative de phishing</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">30%</span>
            <span class="stat-label">Des emails de phishing sont ouverts</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">12%</span>
            <span class="stat-label">Des personnes cliquent sur les liens malveillants</span>
          </div>
        </div>

        <h2 class="section-title">Les 7 Signaux d'Alerte Essentiels</h2>

        <div class="signal-grid">
          <div class="signal-item">
            <h3 class="signal-title">
              <span class="signal-icon">📧</span>
              1. L'Adresse Email Suspecte
            </h3>
            <p>L'adresse de l'expéditeur est le premier indicateur à vérifier. Cliquez sur le nom pour révéler l'adresse complète.</p>
            <div class="code-example code-bad">❌ service-paypal@secure-verification-2024.xyz</div>
            <div class="code-example code-good">✓ service@paypal.com</div>
            <div class="tip-box">
              <div class="tip-label">💡 Astuce Professionnelle</div>
              <p>Les entreprises légitimes utilisent leur propre nom de domaine. Tout ce qui vient après le @ doit correspondre exactement au site officiel.</p>
            </div>
          </div>

          <div class="signal-item">
            <h3 class="signal-title">
              <span class="signal-icon">⚡</span>
              2. L'Urgence Artificielle
            </h3>
            <p>Les cybercriminels créent une pression temporelle pour vous empêcher de réfléchir.</p>
            <div class="warning-card">
              <strong>Phrases d'alerte :</strong>
              <ul style="margin: 0.5rem 0 0 1.5rem;">
                <li>"Votre compte sera supprimé dans 24h"</li>
                <li>"Action IMMÉDIATE requise"</li>
                <li>"Dernier avertissement"</li>
                <li>"Validez maintenant ou perdez l'accès"</li>
              </ul>
            </div>
            <p><strong>Pourquoi ?</strong> Pour court-circuiter votre esprit critique et vous pousser à agir impulsivement.</p>
          </div>

          <div class="signal-item">
            <h3 class="signal-title">
              <span class="signal-icon">✍️</span>
              3. Les Fautes d'Orthographe et de Grammaire
            </h3>
            <p>Les grandes entreprises ont des équipes de rédaction professionnelles. Des fautes basiques sont un signal d'alarme immédiat.</p>
            <div class="code-example code-bad">❌ "Nous avont detecté une activité suspecte sur votre compte"</div>
            <div class="code-example code-good">✓ "Nous avons détecté une activité suspecte sur votre compte"</div>
          </div>

          <div class="signal-item">
            <h3 class="signal-title">
              <span class="signal-icon">🔐</span>
              4. Demande d'Informations Sensibles
            </h3>
            <div class="danger-card">
              <strong>Une entreprise légitime ne vous demandera JAMAIS par email :</strong>
              <ul style="margin: 0.5rem 0 0 1.5rem;">
                <li>Votre mot de passe complet</li>
                <li>Votre numéro de carte bancaire avec CVV</li>
                <li>Votre code PIN</li>
                <li>Vos codes de vérification à deux facteurs</li>
                <li>Une copie de votre pièce d'identité</li>
              </ul>
            </div>
          </div>

          <div class="signal-item">
            <h3 class="signal-title">
              <span class="signal-icon">🔗</span>
              5. Le Lien Ne Correspond Pas
            </h3>
            <p><strong>Méthode de vérification en 3 secondes :</strong></p>
            <ol style="margin: 1rem 0; padding-left: 1.5rem;">
              <li>Positionnez votre souris sur le lien (sans cliquer)</li>
              <li>Observez l'URL qui apparaît en bas à gauche de votre navigateur</li>
              <li>Comparez avec le texte affiché</li>
            </ol>
            <div class="example-box">
              <p><strong>Texte affiché :</strong> www.amazon.fr/mon-compte</p>
              <div class="code-example code-bad">Vraie destination : www.amaz0n-livraison-secure.tk ❌</div>
              <p style="margin-top: 1rem; color: #dc2626; font-weight: 600;">C'est du phishing ! Le zéro remplace le "o" et le domaine est .tk au lieu de .fr</p>
            </div>
          </div>

          <div class="signal-item">
            <h3 class="signal-title">
              <span class="signal-icon">👤</span>
              6. Salutation Générique ou Impersonnelle
            </h3>
            <div class="code-example code-bad">❌ "Cher client" / "Bonjour utilisateur"</div>
            <div class="code-example code-good">✓ "Bonjour Jean Dupont"</div>
            <p style="margin-top: 1rem;">Les services avec lesquels vous avez un compte connaissent votre nom et l'utilisent dans leurs communications officielles.</p>
          </div>

          <div class="signal-item">
            <h3 class="signal-title">
              <span class="signal-icon">📎</span>
              7. Pièce Jointe Inattendue
            </h3>
            <div class="warning-card">
              <strong>Extensions dangereuses à éviter :</strong>
              <ul style="margin: 0.5rem 0 0 1.5rem;">
                <li><strong>.exe</strong> - Programmes exécutables</li>
                <li><strong>.zip / .rar</strong> - Archives compressées</li>
                <li><strong>.doc / .xls</strong> avec demande d'activer les macros</li>
                <li><strong>.scr</strong> - Économiseurs d'écran (souvent malveillants)</li>
              </ul>
            </div>
          </div>
        </div>

        <h2 class="section-title">Cas Pratique : Analyse d'un Email de Phishing</h2>

        <div class="example-box">
          <div class="example-header">
            <strong>De :</strong> Service Client Netflix &lt;support@netflix-renewal-fr.com&gt;<br>
            <strong>Objet :</strong> Echec du paiement - Action requise immédiatement
          </div>
          <div class="example-body">
            <p>Bonjour,</p>
            <p>Votre dernier paiement à échouer. Votre compte Netflix sera suspendu dans les 24 heures si vous ne réglez pas ce problème.</p>
            <p><strong>Montant dû : 11,99 €</strong></p>
            <p>Pour éviter la suspension de votre compte, veuillez mettre à jour vos informations de paiement en cliquant sur le lien ci-dessous :</p>
            <p style="text-align: center; margin: 1.5rem 0;">
              <a href="#" style="background: #e50914; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Mettre à jour mon mode de paiement</a>
            </p>
            <p>Cordialement,<br>L'équipe Netflix</p>
          </div>

          <div class="analysis-box">
            <div class="analysis-title">🔍 Analyse : Combien de signaux d'alerte avez-vous identifiés ?</div>
            <ul class="analysis-list">
              <li>
                <span class="analysis-number">1</span>
                <div><strong>Domaine suspect :</strong> netflix-renewal-fr.com n'est pas le domaine officiel (netflix.com)</div>
              </li>
              <li>
                <span class="analysis-number">2</span>
                <div><strong>Fautes d'orthographe :</strong> "à échouer" au lieu de "a échoué", "réglez" inapproprié</div>
              </li>
              <li>
                <span class="analysis-number">3</span>
                <div><strong>Urgence excessive :</strong> "24 heures", "immédiatement"</div>
              </li>
              <li>
                <span class="analysis-number">4</span>
                <div><strong>Menace :</strong> "suspendu" pour créer la panique</div>
              </li>
              <li>
                <span class="analysis-number">5</span>
                <div><strong>Demande de paiement :</strong> Netflix prélève automatiquement, ils n'envoient pas ce type d'email</div>
              </li>
            </ul>
            <div class="danger-card" style="margin-top: 1.5rem;">
              <strong>Verdict :</strong> C'est clairement du phishing ! 5 signaux d'alerte majeurs identifiés.
            </div>
          </div>
        </div>

        <h2 class="section-title">Le Protocole de Sécurité en 4 Étapes</h2>

        <div class="protocol-steps">
          <div class="protocol-step">
            <div class="step-number">1</div>
            <div class="step-content">
              <h4>STOP - Ne Cliquez Sur Rien</h4>
              <p>Prenez 30 secondes pour analyser l'email calmement. La plupart des urgences sont artificielles.</p>
            </div>
          </div>

          <div class="protocol-step">
            <div class="step-number">2</div>
            <div class="step-content">
              <h4>VÉRIFIER - Allez Directement sur le Site Officiel</h4>
              <p>Ouvrez un nouvel onglet et tapez vous-même l'adresse du site. Ne cliquez jamais sur les liens dans l'email suspect.</p>
            </div>
          </div>

          <div class="protocol-step">
            <div class="step-number">3</div>
            <div class="step-content">
              <h4>CONTACTER - Appelez le Service Client</h4>
              <p>Utilisez le numéro de téléphone officiel (sur leur site web ou votre carte bancaire). Demandez confirmation.</p>
            </div>
          </div>

          <div class="protocol-step">
            <div class="step-number">4</div>
            <div class="step-content">
              <h4>SIGNALER - Transmettez l'Email Suspect</h4>
              <p>Transférez à : signal-spam@signal-spam.fr ou utilisez le bouton "Signaler comme spam" de votre messagerie. Au travail, prévenez votre service IT.</p>
            </div>
          </div>
        </div>

        <div class="info-card">
          <h3 style="margin-top: 0; color: #1e40af;">📊 Impact d'un Signalement</h3>
          <p>Chaque email de phishing que vous signalez aide à :</p>
          <ul style="margin: 0.5rem 0 0 1.5rem;">
            <li>Bloquer le domaine malveillant</li>
            <li>Protéger d'autres utilisateurs</li>
            <li>Alimenter les bases de données anti-spam</li>
            <li>Renforcer la sécurité collective</li>
          </ul>
        </div>

        <div class="key-takeaways">
          <h3>Points Clés à Retenir</h3>
          <ul>
            <li>Vérifiez toujours l'adresse email complète de l'expéditeur</li>
            <li>Survolez les liens avant de cliquer pour voir la vraie destination</li>
            <li>Méfiez-vous de toute urgence excessive ou menace</li>
            <li>Aucune entreprise légitime ne demande vos mots de passe par email</li>
            <li>Les fautes d'orthographe sont un signal d'alarme immédiat</li>
            <li>En cas de doute : STOP, VÉRIFIER, CONTACTER, SIGNALER</li>
            <li>Prenez toujours le temps de la réflexion avant d'agir</li>
          </ul>
        </div>

        <div class="success-card">
          <h3 style="margin-top: 0; color: #065f46;">🎯 Prochaine Étape</h3>
          <p style="margin-bottom: 0;">Maintenant que vous maîtrisez l'identification des emails de phishing, le prochain module vous enseignera comment décoder les URLs et repérer les faux sites web.</p>
        </div>
      </div>
    `,
    quiz: {
      title: 'Évaluation : Reconnaître le Phishing',
      passingScore: 70,
      questions: [
        {
          question: 'Quelle est la méthode la plus fiable pour vérifier un lien avant de cliquer ?',
          options: [
            'Cliquer dessus rapidement pour voir où il mène',
            'Vérifier si le lien est en couleur bleue',
            'Survoler le lien avec la souris et lire l\'URL complète en bas du navigateur',
            'Regarder si l\'email contient le logo de l\'entreprise',
          ],
          correctAnswer: 2,
          explanation: 'En survolant un lien sans cliquer, votre navigateur affiche l\'URL réelle en bas de la fenêtre. C\'est le seul moyen fiable de vérifier la destination avant de cliquer.',
        },
        {
          question: 'Un email de votre "banque" contient plusieurs fautes d\'orthographe. Quelle est votre réaction ?',
          options: [
            'C\'est normal, les fautes arrivent à tout le monde',
            'C\'est un signal d\'alerte fort - les banques relisent systématiquement leurs communications',
            'Ce n\'est pas important si le message semble urgent',
            'Je clique sur le lien pour vérifier sur mon compte',
          ],
          correctAnswer: 1,
          explanation: 'Les institutions financières et grandes entreprises ont des processus de relecture rigoureux. Des fautes basiques indiquent clairement du phishing.',
        },
        {
          question: 'Vous recevez un email disant "Votre compte sera fermé dans 24h - agissez maintenant !". Quelle technique de manipulation est utilisée ?',
          options: [
            'Une vraie urgence nécessitant une action rapide',
            'Un rappel amical du service client',
            'Une urgence artificielle pour vous empêcher de réfléchir calmement',
            'Une procédure normale de sécurité',
          ],
          correctAnswer: 2,
          explanation: 'Les cybercriminels créent une fausse urgence pour court-circuiter votre esprit critique et vous pousser à agir impulsivement sans vérifier.',
        },
        {
          question: 'L\'email provient de "service@amazon-livraison-france.com". Est-ce suspect ?',
          options: [
            'Non, c\'est clairement Amazon',
            'Oui, le domaine officiel d\'Amazon est amazon.fr ou amazon.com uniquement',
            'Non si l\'email contient le logo Amazon',
            'Cela dépend du contenu du message',
          ],
          correctAnswer: 1,
          explanation: 'Amazon utilise exclusivement ses propres domaines officiels (amazon.fr, amazon.com, etc.). Tout autre domaine, même s\'il contient "amazon", est frauduleux.',
        },
        {
          question: 'Quelle est la première action à prendre si vous recevez un email suspect ?',
          options: [
            'Cliquer sur le lien pour en savoir plus',
            'Répondre à l\'email pour demander des clarifications',
            'Ne rien cliquer et vérifier par vous-même en allant sur le site officiel',
            'Transférer l\'email à vos collègues pour avoir leur avis',
          ],
          correctAnswer: 2,
          explanation: 'En cas de doute, ne cliquez jamais sur les liens dans l\'email. Ouvrez un nouvel onglet, tapez vous-même l\'adresse du site officiel, et vérifiez directement votre compte.',
        },
      ],
    },
  },

  {
    title: 'Maîtriser la Sécurité des Mots de Passe',
    description: 'Créez et gérez des mots de passe incassables',
    category: 'BASICS',
    difficulty: 'BEGINNER',
    duration: 10,
    minReadingTime: 200,
    points: 10,
    order: 2,
    content: `
      <style>
        .training-module { font-family: 'Inter', -apple-system, sans-serif; line-height: 1.8; color: #1e293b; }
        .hero-section { background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%); color: white; padding: 3rem; border-radius: 1rem; margin-bottom: 3rem; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); }
        .hero-title { font-size: 2.5rem; font-weight: 800; margin-bottom: 1rem; letter-spacing: -0.025em; }
        .hero-subtitle { font-size: 1.25rem; opacity: 0.9; line-height: 1.6; }
        .comparison-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin: 2rem 0; }
        .comparison-card { border-radius: 1rem; padding: 2rem; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
        .weak-card { background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); border: 3px solid #dc2626; }
        .strong-card { background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border: 3px solid #10b981; }
        .comparison-title { font-size: 1.5rem; font-weight: 800; margin-bottom: 1rem; }
        .password-display { background: rgba(0, 0, 0, 0.6); color: white; padding: 1rem 1.5rem; border-radius: 0.5rem; font-family: 'Monaco', monospace; font-size: 1.125rem; text-align: center; margin: 1rem 0; letter-spacing: 0.1em; }
        .time-indicator { font-size: 2rem; font-weight: 800; text-align: center; margin: 1rem 0; }
        .rule-grid { display: grid; gap: 1.5rem; margin: 2rem 0; }
        .rule-card { background: white; border: 2px solid #e2e8f0; border-radius: 1rem; padding: 2rem; transition: all 0.3s ease; position: relative; overflow: hidden; }
        .rule-card::before { content: ''; position: absolute; top: 0; left: 0; width: 6px; height: 100%; background: linear-gradient(180deg, #8b5cf6, #6d28d9); }
        .rule-card:hover { border-color: #8b5cf6; transform: translateY(-4px); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); }
        .rule-number { background: linear-gradient(135deg, #8b5cf6, #6d28d9); color: white; width: 60px; height: 60px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.75rem; margin-bottom: 1rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .rule-title { font-size: 1.375rem; font-weight: 700; color: #0f172a; margin-bottom: 1rem; }
        .method-section { background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 2px solid #0ea5e9; border-radius: 1rem; padding: 2.5rem; margin: 3rem 0; }
        .method-step { background: white; border-radius: 0.75rem; padding: 1.5rem; margin: 1.5rem 0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .method-step-label { font-weight: 800; color: #0284c7; font-size: 1.125rem; margin-bottom: 0.75rem; display: block; }
        .phrase-example { background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 0.5rem; padding: 1rem; font-size: 1.125rem; font-style: italic; color: #475569; margin: 1rem 0; }
        .password-result { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 1.5rem; border-radius: 0.75rem; text-align: center; margin-top: 1.5rem; }
        .password-result-display { font-family: 'Monaco', monospace; font-size: 1.75rem; font-weight: 800; letter-spacing: 0.15em; margin-top: 1rem; }
        .dos-donts { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem; margin: 2rem 0; }
        .do-card { background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border-left: 6px solid #10b981; border-radius: 0.75rem; padding: 1.5rem; }
        .dont-card { background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); border-left: 6px solid #ef4444; border-radius: 0.75rem; padding: 1.5rem; }
        .card-icon { font-size: 2.5rem; margin-bottom: 0.5rem; }
        .card-title { font-size: 1.25rem; font-weight: 700; margin-bottom: 1rem; }
        .manager-section { background: #faf5ff; border: 2px solid #a855f7; border-radius: 1rem; padding: 2.5rem; margin: 3rem 0; }
        .manager-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin: 2rem 0; }
        .manager-card { background: white; border-radius: 0.75rem; padding: 1.5rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); text-align: center; }
        .manager-icon { font-size: 3rem; margin-bottom: 1rem; }
        .manager-name { font-size: 1.25rem; font-weight: 700; color: #7c3aed; margin-bottom: 0.5rem; }
        .fa-section { background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border: 2px solid #3b82f6; border-radius: 1rem; padding: 2.5rem; margin: 3rem 0; }
        .fa-types { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin: 2rem 0; }
        .fa-type { background: white; border-radius: 0.75rem; padding: 1.5rem; text-align: center; transition: all 0.3s ease; }
        .fa-type:hover { transform: translateY(-4px); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
        .security-level { font-size: 1.5rem; margin-top: 0.5rem; }
        .checklist-box { background: white; border: 2px solid #e2e8f0; border-radius: 1rem; padding: 2rem; margin: 2rem 0; }
        .checklist-item { padding: 1rem; margin: 0.5rem 0; background: #f8fafc; border-radius: 0.5rem; display: flex; align-items: center; gap: 1rem; transition: all 0.3s ease; }
        .checklist-item:hover { background: #f0f9ff; border-left: 4px solid #0ea5e9; }
        .checkbox-icon { width: 28px; height: 28px; border: 3px solid #cbd5e1; border-radius: 0.375rem; flex-shrink: 0; }
        .section-title { font-size: 1.875rem; font-weight: 700; color: #0f172a; margin: 3rem 0 1.5rem 0; padding-bottom: 0.75rem; border-bottom: 3px solid #8b5cf6; }
        .key-takeaways { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: white; padding: 2.5rem; border-radius: 1rem; margin: 3rem 0; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); }
        .key-takeaways h3 { font-size: 1.875rem; font-weight: 800; margin: 0 0 1.5rem 0; }
        .key-takeaways ul { list-style: none; padding: 0; margin: 0; }
        .key-takeaways li { padding: 0.875rem 0; padding-left: 2rem; position: relative; font-size: 1.125rem; }
        .key-takeaways li::before { content: '✓'; position: absolute; left: 0; color: #10b981; font-weight: 800; font-size: 1.25rem; }
      </style>

      <div class="training-module">
        <div class="hero-section">
          <h1 class="hero-title">Maîtriser la Sécurité des Mots de Passe</h1>
          <p class="hero-subtitle">
            Apprenez à créer des mots de passe incassables tout en gardant une méthode simple et mémorable. Protégez vos comptes personnels et professionnels efficacement.
          </p>
        </div>

        <h2 class="section-title">La Réalité des Mots de Passe Faibles</h2>

        <div class="comparison-grid">
          <div class="comparison-card weak-card">
            <div class="comparison-title" style="color: #991b1b;">⚠️ Mot de Passe Faible</div>
            <div class="password-display">Pass1234</div>
            <div class="time-indicator" style="color: #dc2626;">< 1 seconde</div>
            <p style="color: #7f1d1d; font-weight: 600; text-align: center;">Temps pour le casser avec un ordinateur moderne</p>
            <ul style="margin-top: 1rem; color: #991b1b;">
              <li>8 caractères seulement</li>
              <li>Mot de dictionnaire</li>
              <li>Chiffres prévisibles</li>
              <li>Aucune sécurité réelle</li>
            </ul>
          </div>

          <div class="comparison-card strong-card">
            <div class="comparison-title" style="color: #065f46;">✓ Mot de Passe Fort</div>
            <div class="password-display">J@dm3Ch@ts2024!</div>
            <div class="time-indicator" style="color: #059669;">34 000 ans</div>
            <p style="color: #064e3b; font-weight: 600; text-align: center;">Temps pour le casser avec un ordinateur moderne</p>
            <ul style="margin-top: 1rem; color: #065f46;">
              <li>14 caractères</li>
              <li>Majuscules et minuscules</li>
              <li>Chiffres et symboles</li>
              <li>Pas dans le dictionnaire</li>
            </ul>
          </div>
        </div>

        <div class="danger-card">
          <h3 style="margin-top: 0; color: #7f1d1d;">🚨 Les 10 Pires Mots de Passe (Encore Utilisés !)</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-top: 1rem;">
            <div style="background: #7f1d1d; color: white; padding: 0.75rem; border-radius: 0.5rem; text-align: center; font-family: monospace;">123456</div>
            <div style="background: #7f1d1d; color: white; padding: 0.75rem; border-radius: 0.5rem; text-align: center; font-family: monospace;">password</div>
            <div style="background: #7f1d1d; color: white; padding: 0.75rem; border-radius: 0.5rem; text-align: center; font-family: monospace;">123456789</div>
            <div style="background: #7f1d1d; color: white; padding: 0.75rem; border-radius: 0.5rem; text-align: center; font-family: monospace;">azerty</div>
            <div style="background: #7f1d1d; color: white; padding: 0.75rem; border-radius: 0.5rem; text-align: center; font-family: monospace;">motdepasse</div>
            <div style="background: #7f1d1d; color: white; padding: 0.75rem; border-radius: 0.5rem; text-align: center; font-family: monospace;">qwerty</div>
          </div>
          <p style="margin-top: 1rem; font-weight: 700; text-align: center;">Un pirate met moins de 1 seconde pour deviner ces mots de passe !</p>
        </div>

        <h2 class="section-title">Les 4 Règles d'Or</h2>

        <div class="rule-grid">
          <div class="rule-card">
            <span class="rule-number">1</span>
            <h3 class="rule-title">Minimum 12 Caractères</h3>
            <p>La longueur est le facteur le plus important. Chaque caractère supplémentaire multiplie exponentiellement la difficulté de piratage.</p>
            <div class="comparison-grid" style="margin-top: 1.5rem;">
              <div>
                <div class="password-display" style="background: #7f1d1d;">Pass1234</div>
                <p style="text-align: center; color: #dc2626; font-weight: 600;">8 caractères = Faible</p>
              </div>
              <div>
                <div class="password-display" style="background: #065f46;">J'adore2Chats!</div>
                <p style="text-align: center; color: #059669; font-weight: 600;">14 caractères = Fort</p>
              </div>
            </div>
          </div>

          <div class="rule-card">
            <span class="rule-number">2</span>
            <h3 class="rule-title">Mélangez Tous les Types de Caractères</h3>
            <p>Combinez quatre types de caractères pour maximiser la complexité :</p>
            <ul style="margin: 1rem 0 0 1.5rem; line-height: 2;">
              <li><strong>Majuscules :</strong> A, B, C, D...</li>
              <li><strong>Minuscules :</strong> a, b, c, d...</li>
              <li><strong>Chiffres :</strong> 0, 1, 2, 3...</li>
              <li><strong>Symboles :</strong> !, @, #, $, %, &...</li>
            </ul>
          </div>

          <div class="rule-card">
            <span class="rule-number">3</span>
            <h3 class="rule-title">Évitez Toute Information Personnelle</h3>
            <div class="warning-card">
              <strong>Ne jamais utiliser :</strong>
              <ul style="margin: 0.5rem 0 0 1.5rem;">
                <li>Votre prénom ou nom de famille</li>
                <li>Votre date de naissance</li>
                <li>Le nom de vos enfants ou animaux</li>
                <li>Votre adresse ou ville</li>
                <li>Votre équipe de sport favorite</li>
              </ul>
              <p style="margin-top: 1rem; font-style: italic;">Ces informations sont facilement trouvables sur vos réseaux sociaux !</p>
            </div>
          </div>

          <div class="rule-card">
            <span class="rule-number">4</span>
            <h3 class="rule-title">Un Mot de Passe Unique par Compte</h3>
            <p><strong>Pourquoi c'est crucial :</strong></p>
            <p>Si un site se fait pirater et que vous utilisez le même mot de passe partout, les hackers essaieront ce mot de passe sur tous vos autres comptes (email, banque, réseaux sociaux...).</p>
            <div class="success-card" style="margin-top: 1rem;">
              <p style="margin: 0; font-weight: 600;">✓ Un site piraté = un seul compte compromis (si mots de passe différents)</p>
            </div>
            <div class="danger-card" style="margin-top: 0.5rem;">
              <p style="margin: 0; font-weight: 600;">✗ Un site piraté = TOUS vos comptes compromis (si même mot de passe partout)</p>
            </div>
          </div>
        </div>

        <h2 class="section-title">La Méthode de la Phrase Secrète</h2>

        <div class="method-section">
          <h3 style="color: #0284c7; font-size: 1.5rem; margin-top: 0;">La Technique la Plus Simple et la Plus Efficace</h3>
          <p style="font-size: 1.125rem; margin-bottom: 2rem;">Cette méthode vous permet de créer des mots de passe très forts que vous pouvez facilement mémoriser.</p>

          <div class="method-step">
            <span class="method-step-label">Étape 1 : Choisissez une Phrase Personnelle</span>
            <p>Pensez à une phrase qui a du sens pour vous, mais qui n'est pas évidente pour les autres.</p>
            <div class="phrase-example">"J'adore manger des pizzas le vendredi soir avec mes amis"</div>
          </div>

          <div class="method-step">
            <span class="method-step-label">Étape 2 : Prenez la Première Lettre de Chaque Mot</span>
            <p>Conservez les majuscules et minuscules de la phrase originale.</p>
            <div class="phrase-example">J a m d p l v s a m a → <strong>JamdplVsamA</strong></div>
          </div>

          <div class="method-step">
            <span class="method-step-label">Étape 3 : Ajoutez des Chiffres et des Symboles</span>
            <p>Remplacez certaines lettres ou ajoutez des chiffres significatifs pour vous.</p>
            <div class="phrase-example">JamdplVsamA → <strong>J@mdplV2024!</strong></div>
          </div>

          <div class="password-result">
            <div style="font-size: 1.25rem; font-weight: 700;">Résultat Final</div>
            <div class="password-result-display">J@mdplV2024!</div>
            <p style="margin-top: 1rem; font-size: 1.125rem;">✓ 13 caractères • ✓ Majuscules & minuscules • ✓ Chiffres • ✓ Symboles</p>
            <p style="margin-top: 0.5rem; font-weight: 700;">Vous vous souvenez de la phrase, donc vous vous souvenez du mot de passe !</p>
          </div>
        </div>

        <h2 class="section-title">À Faire vs À Ne Pas Faire</h2>

        <div class="dos-donts">
          <div class="do-card">
            <div class="card-icon">✓</div>
            <div class="card-title" style="color: #065f46;">À FAIRE</div>
            <ul style="list-style: none; padding: 0; margin: 0;">
              <li style="padding: 0.5rem 0;">✓ Utiliser 12+ caractères</li>
              <li style="padding: 0.5rem 0;">✓ Mélanger majuscules, minuscules, chiffres, symboles</li>
              <li style="padding: 0.5rem 0;">✓ Utiliser la méthode de la phrase secrète</li>
              <li style="padding: 0.5rem 0;">✓ Un mot de passe différent par site</li>
              <li style="padding: 0.5rem 0;">✓ Changer vos mots de passe si un site est piraté</li>
            </ul>
          </div>

          <div class="dont-card">
            <div class="card-icon">✗</div>
            <div class="card-title" style="color: #991b1b;">À NE PAS FAIRE</div>
            <ul style="list-style: none; padding: 0; margin: 0;">
              <li style="padding: 0.5rem 0;">✗ Utiliser des mots du dictionnaire</li>
              <li style="padding: 0.5rem 0;">✗ Inclure des infos personnelles</li>
              <li style="padding: 0.5rem 0;">✗ Réutiliser le même mot de passe</li>
              <li style="padding: 0.5rem 0;">✗ Écrire vos mots de passe sur un post-it</li>
              <li style="padding: 0.5rem 0;">✗ Partager vos mots de passe par email</li>
            </ul>
          </div>
        </div>

        <h2 class="section-title">Les Gestionnaires de Mots de Passe</h2>

        <div class="manager-section">
          <h3 style="color: #7c3aed; font-size: 1.5rem; margin-top: 0;">La Solution Pour Gérer Des Dizaines de Mots de Passe</h3>
          <p style="font-size: 1.125rem;">Un gestionnaire de mots de passe est un coffre-fort numérique sécurisé qui :</p>
          <ul style="margin: 1rem 0 2rem 1.5rem; font-size: 1.0625rem;">
            <li>Génère des mots de passe ultra-forts automatiquement</li>
            <li>Les stocke de manière chiffrée</li>
            <li>Les remplit automatiquement quand vous en avez besoin</li>
            <li>Vous n'avez à retenir qu'UN SEUL mot de passe maître</li>
          </ul>

          <div class="manager-grid">
            <div class="manager-card">
              <div class="manager-icon">🔐</div>
              <div class="manager-name">Bitwarden</div>
              <p style="color: #64748b; margin: 0.5rem 0;">Gratuit, open source</p>
              <div style="background: #dcfce7; color: #166534; padding: 0.5rem; border-radius: 0.375rem; font-weight: 600; margin-top: 1rem;">Recommandé</div>
            </div>

            <div class="manager-card">
              <div class="manager-icon">🛡️</div>
              <div class="manager-name">1Password</div>
              <p style="color: #64748b; margin: 0.5rem 0;">Payant, très ergonomique</p>
              <div style="background: #dbeafe; color: #1e40af; padding: 0.5rem; border-radius: 0.375rem; font-weight: 600; margin-top: 1rem;">Premium</div>
            </div>

            <div class="manager-card">
              <div class="manager-icon">🔑</div>
              <div class="manager-name">Dashlane</div>
              <p style="color: #64748b; margin: 0.5rem 0;">Freemium (50 mots de passe gratuits)</p>
              <div style="background: #fef3c7; color: #92400e; padding: 0.5rem; border-radius: 0.375rem; font-weight: 600; margin-top: 1rem;">Mixte</div>
            </div>
          </div>
        </div>

        <h2 class="section-title">La Double Authentification (2FA)</h2>

        <div class="fa-section">
          <h3 style="color: #1e40af; font-size: 1.5rem; margin-top: 0;">Une Deuxième Barrière Indispensable</h3>
          <p style="font-size: 1.125rem; margin-bottom: 2rem;">
            Même si quelqu'un vole votre mot de passe, il ne pourra PAS se connecter sans le code temporaire de la double authentification.
          </p>

          <div class="fa-types">
            <div class="fa-type">
              <div style="font-size: 3rem; margin-bottom: 1rem;">📱</div>
              <h4 style="color: #0284c7; margin: 0.5rem 0;">SMS</h4>
              <p style="color: #64748b; font-size: 0.9375rem;">Code reçu par SMS</p>
              <div class="security-level">⭐⭐⭐</div>
            </div>

            <div class="fa-type" style="border: 2px solid #10b981;">
              <div style="font-size: 3rem; margin-bottom: 1rem;">🔐</div>
              <h4 style="color: #059669; margin: 0.5rem 0;">Application</h4>
              <p style="color: #64748b; font-size: 0.9375rem;">Google Authenticator, Authy</p>
              <div class="security-level">⭐⭐⭐⭐⭐</div>
              <div style="background: #dcfce7; color: #065f46; padding: 0.5rem; border-radius: 0.375rem; margin-top: 0.5rem; font-weight: 600; font-size: 0.875rem;">Recommandé</div>
            </div>

            <div class="fa-type">
              <div style="font-size: 3rem; margin-bottom: 1rem;">🔑</div>
              <h4 style="color: #0284c7; margin: 0.5rem 0;">Clé Physique</h4>
              <p style="color: #64748b; font-size: 0.9375rem;">Yubikey, clé USB</p>
              <div class="security-level">⭐⭐⭐⭐⭐</div>
            </div>
          </div>

          <div class="info-card" style="margin-top: 2rem;">
            <h4 style="margin-top: 0; color: #1e40af;">🎯 Où Activer la 2FA en Priorité</h4>
            <ul style="margin: 0.5rem 0 0 1.5rem; font-size: 1.0625rem;">
              <li>Votre adresse email principale</li>
              <li>Vos comptes bancaires</li>
              <li>Vos réseaux sociaux (Facebook, Instagram, LinkedIn...)</li>
              <li>Vos comptes professionnels</li>
              <li>Vos services cloud (Google Drive, Dropbox...)</li>
            </ul>
          </div>
        </div>

        <h2 class="section-title">Checklist de Sécurité</h2>

        <div class="checklist-box">
          <div class="checklist-item">
            <div class="checkbox-icon"></div>
            <span>Mes mots de passe font au moins 12 caractères</span>
          </div>
          <div class="checklist-item">
            <div class="checkbox-icon"></div>
            <span>J'utilise un mélange de majuscules, minuscules, chiffres et symboles</span>
          </div>
          <div class="checklist-item">
            <div class="checkbox-icon"></div>
            <span>Je n'utilise aucune information personnelle</span>
          </div>
          <div class="checklist-item">
            <div class="checkbox-icon"></div>
            <span>Chaque compte a un mot de passe différent</span>
          </div>
          <div class="checklist-item">
            <div class="checkbox-icon"></div>
            <span>J'ai activé la double authentification sur mes comptes importants</span>
          </div>
          <div class="checklist-item">
            <div class="checkbox-icon"></div>
            <span>J'utilise (ou j'envisage) un gestionnaire de mots de passe</span>
          </div>
          <div class="checklist-item">
            <div class="checkbox-icon"></div>
            <span>Je ne partage jamais mes mots de passe par email ou SMS</span>
          </div>
        </div>

        <div class="key-takeaways">
          <h3>Points Clés à Retenir</h3>
          <ul>
            <li>La longueur est plus importante que la complexité : visez 12 caractères minimum</li>
            <li>Utilisez la méthode de la phrase secrète pour créer des mots de passe forts et mémorables</li>
            <li>Mélangez majuscules, minuscules, chiffres et symboles</li>
            <li>Un mot de passe unique par compte - ne jamais réutiliser</li>
            <li>Évitez toute information personnelle (dates, noms, lieux)</li>
            <li>Activez la double authentification sur tous les comptes importants</li>
            <li>Envisagez un gestionnaire de mots de passe pour simplifier la gestion</li>
          </ul>
        </div>

        <div class="success-card">
          <h3 style="margin-top: 0; color: #065f46;">🎯 Prochaine Étape</h3>
          <p style="margin-bottom: 0;">Le prochain module vous apprendra à protéger votre vie privée sur les réseaux sociaux et à éviter de divulguer des informations sensibles en ligne.</p>
        </div>
      </div>
    `,
    quiz: {
      title: 'Évaluation : Sécurité des Mots de Passe',
      passingScore: 70,
      questions: [
        {
          question: 'Quelle est la longueur MINIMALE recommandée pour un mot de passe sécurisé en 2024 ?',
          options: [
            '6 caractères',
            '8 caractères',
            '12 caractères',
            '20 caractères',
          ],
          correctAnswer: 2,
          explanation: '12 caractères est le minimum recommandé aujourd\'hui. Plus c\'est long, plus c\'est difficile à casser. Un mot de passe de 12 caractères bien construit prendrait des millions d\'années à pirater.',
        },
        {
          question: 'Pourquoi ne faut-il JAMAIS utiliser le même mot de passe sur plusieurs sites ?',
          options: [
            'C\'est plus facile à retenir',
            'Si un site se fait pirater, tous vos comptes sont compromis',
            'Les sites ne l\'acceptent pas',
            'C\'est une recommandation mais pas vraiment nécessaire',
          ],
          correctAnswer: 1,
          explanation: 'Si vous utilisez le même mot de passe partout et qu\'un site se fait pirater, les hackers essaieront ce mot de passe sur tous vos autres comptes (email, banque, réseaux sociaux). Un site compromis = tous vos comptes à risque.',
        },
        {
          question: 'La double authentification (2FA), c\'est quoi exactement ?',
          options: [
            'Deux mots de passe différents',
            'Un mot de passe plus un code temporaire (SMS, app)',
            'Se connecter deux fois',
            'Avoir deux comptes séparés',
          ],
          correctAnswer: 1,
          explanation: 'La 2FA ajoute une deuxième barrière de sécurité : un code temporaire (reçu par SMS ou généré par une app) en plus de votre mot de passe. Même si quelqu\'un vole votre mot de passe, il ne peut pas se connecter sans ce code.',
        },
        {
          question: 'Quelle méthode est recommandée pour créer un mot de passe fort et mémorable ?',
          options: [
            'Utiliser votre date de naissance',
            'La méthode de la phrase secrète (première lettre de chaque mot)',
            'Utiliser le nom de votre animal',
            'Ajouter "123" à la fin d\'un mot',
          ],
          correctAnswer: 1,
          explanation: 'La méthode de la phrase secrète est idéale : vous créez une phrase personnelle, prenez la première lettre de chaque mot, et ajoutez des chiffres/symboles. Vous retenez la phrase, donc vous retenez le mot de passe !',
        },
        {
          question: 'Parmi ces informations, laquelle ne devrait JAMAIS être dans un mot de passe ?',
          options: [
            'Des symboles comme @ ou !',
            'Le nom de votre animal de compagnie',
            'Des majuscules et minuscules mélangées',
            'Des chiffres aléatoires',
          ],
          correctAnswer: 1,
          explanation: 'Le nom de votre animal (comme toute info personnelle) est facilement trouvable sur vos réseaux sociaux. Les hackers essaient systématiquement ces informations. De plus, c\'est souvent une question de sécurité bancaire.',
        },
      ],
    },
  },

{
    title: 'Protéger Votre Vie Privée sur les Réseaux Sociaux',
    description: 'Maîtrisez vos paramètres de confidentialité et évitez les fuites d\'informations',
    category: 'AWARENESS',
    difficulty: 'BEGINNER',
    duration: 12,
    minReadingTime: 240,
    points: 10,
    order: 3,
    content: `
      <style>
        .training-module { font-family: 'Inter', -apple-system, sans-serif; line-height: 1.8; color: #1e293b; }
        .hero-section { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 3rem; border-radius: 1rem; margin-bottom: 3rem; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); }
        .hero-title { font-size: 2.5rem; font-weight: 800; margin-bottom: 1rem; letter-spacing: -0.025em; }
        .hero-subtitle { font-size: 1.25rem; opacity: 0.9; line-height: 1.6; }
        .alert-stat { background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(10px); border: 2px solid rgba(255, 255, 255, 0.3); border-radius: 1rem; padding: 2rem; margin: 2rem 0; text-align: center; }
        .alert-number { font-size: 3.5rem; font-weight: 900; display: block; margin-bottom: 0.5rem; }
        .threat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin: 2rem 0; }
        .threat-card { background: white; border: 2px solid #e2e8f0; border-radius: 1rem; padding: 1.5rem; transition: all 0.3s ease; position: relative; overflow: hidden; }
        .threat-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 6px; background: linear-gradient(90deg, #dc2626, #ef4444); }
        .threat-card:hover { transform: translateY(-4px); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); border-color: #dc2626; }
        .threat-icon { font-size: 2.5rem; margin-bottom: 1rem; }
        .threat-title { font-size: 1.25rem; font-weight: 700; color: #dc2626; margin-bottom: 1rem; }
        .case-study { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 3px solid #f59e0b; border-radius: 1rem; padding: 2.5rem; margin: 3rem 0; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
        .case-timeline { margin: 2rem 0; }
        .timeline-item { background: white; border-left: 4px solid #f59e0b; border-radius: 0.5rem; padding: 1.5rem; margin: 1rem 0; position: relative; }
        .timeline-item::before { content: '●'; position: absolute; left: -12px; top: 1.5rem; font-size: 1.5rem; color: #f59e0b; }
        .hacker-process { background: #fee2e2; border: 2px solid #dc2626; border-radius: 0.75rem; padding: 1.5rem; margin: 1.5rem 0; }
        .security-rules { margin: 2rem 0; }
        .security-rule { background: white; border: 2px solid #e2e8f0; border-radius: 1rem; padding: 2rem; margin: 1.5rem 0; transition: all 0.3s ease; display: flex; gap: 1.5rem; align-items: start; }
        .security-rule:hover { border-color: #10b981; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
        .rule-emoji { font-size: 3rem; flex-shrink: 0; }
        .rule-content h3 { color: #10b981; margin: 0 0 1rem 0; font-size: 1.375rem; }
        .platform-guide { background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 2px solid #0ea5e9; border-radius: 1rem; padding: 2.5rem; margin: 3rem 0; }
        .platform-section { background: white; border-radius: 0.75rem; padding: 1.5rem; margin: 1.5rem 0; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); }
        .checklist-item { background: #f8fafc; border-left: 4px solid #10b981; border-radius: 0.5rem; padding: 1rem 1rem 1rem 1.5rem; margin: 0.5rem 0; display: flex; align-items: center; gap: 0.75rem; transition: all 0.2s ease; }
        .checklist-item:hover { background: #f0f9ff; }
        .checkbox { width: 24px; height: 24px; border: 3px solid #cbd5e1; border-radius: 0.375rem; flex-shrink: 0; }
        .quiz-trap { background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); border: 3px solid #dc2626; border-radius: 1rem; padding: 2rem; margin: 2rem 0; text-align: center; }
        .quiz-warning { font-size: 1.5rem; font-weight: 800; color: #7f1d1d; margin-bottom: 1rem; }
        .do-dont-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin: 2rem 0; }
        .do-card { background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border: 3px solid #10b981; border-radius: 1rem; padding: 2rem; }
        .dont-card { background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); border: 3px solid #ef4444; border-radius: 1rem; padding: 2rem; }
        .card-header { font-size: 1.5rem; font-weight: 800; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.75rem; }
        .section-title { font-size: 1.875rem; font-weight: 700; color: #0f172a; margin: 3rem 0 1.5rem 0; padding-bottom: 0.75rem; border-bottom: 3px solid #dc2626; }
        .key-takeaways { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: white; padding: 2.5rem; border-radius: 1rem; margin: 3rem 0; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); }
        .key-takeaways h3 { font-size: 1.875rem; font-weight: 800; margin: 0 0 1.5rem 0; }
        .key-takeaways ul { list-style: none; padding: 0; margin: 0; }
        .key-takeaways li { padding: 0.875rem 0; padding-left: 2rem; position: relative; font-size: 1.125rem; }
        .key-takeaways li::before { content: '✓'; position: absolute; left: 0; color: #10b981; font-weight: 800; font-size: 1.25rem; }
      </style>

      <div class="training-module">
        <div class="hero-section">
          <h1 class="hero-title">Protéger Votre Vie Privée sur les Réseaux Sociaux</h1>
          <p class="hero-subtitle">
            Apprenez à sécuriser vos profils Facebook, Instagram, LinkedIn et autres pour éviter les fuites d'informations qui peuvent compromettre votre sécurité personnelle et professionnelle.
          </p>
          <div class="alert-stat">
            <span class="alert-number">80%</span>
            <p style="font-size: 1.25rem; margin: 0;">des cyberattaques utilisent les informations trouvées sur les réseaux sociaux</p>
          </div>
        </div>

        <h2 class="section-title">Ce Que les Hackers Cherchent sur Vos Profils</h2>

        <div class="threat-grid">
          <div class="threat-card">
            <div class="threat-icon">🎂</div>
            <h3 class="threat-title">Date de Naissance</h3>
            <p>Utilisée dans 60% des mots de passe et comme question de sécurité bancaire.</p>
            <div style="background: #fef3c7; padding: 1rem; border-radius: 0.5rem; margin-top: 1rem;">
              <strong>Exemples :</strong>
              <div style="font-family: monospace; margin-top: 0.5rem;">"Jean1985", "Marie2490"</div>
            </div>
          </div>

          <div class="threat-card">
            <div class="threat-icon">🐕</div>
            <h3 class="threat-title">Nom de Votre Animal</h3>
            <p>Question secrète très courante sur les sites bancaires et d'assurance.</p>
            <div style="background: #fef3c7; padding: 1rem; border-radius: 0.5rem; margin-top: 1rem;">
              <strong>Question typique :</strong>
              <div style="margin-top: 0.5rem;">"Quel était le nom de votre premier animal de compagnie ?"</div>
            </div>
          </div>

          <div class="threat-card">
            <div class="threat-icon">🏠</div>
            <h3 class="threat-title">Votre Adresse</h3>
            <p>Check-ins, photos devant chez vous, géolocalisation active...</p>
            <div style="background: #fee2e2; padding: 1rem; border-radius: 0.5rem; margin-top: 1rem;">
              <strong>Risque :</strong> Cambriolages pendant vos vacances annoncées publiquement
            </div>
          </div>

          <div class="threat-card">
            <div class="threat-icon">👨‍👩‍👧</div>
            <h3 class="threat-title">Noms de Famille</h3>
            <p>Nom de jeune fille de votre mère, ville de naissance...</p>
            <div style="background: #fef3c7; padding: 1rem; border-radius: 0.5rem; margin-top: 1rem;">
              <strong>Usage :</strong> Questions de sécurité classiques pour réinitialiser les mots de passe
            </div>
          </div>

          <div class="threat-card">
            <div class="threat-icon">🎓</div>
            <h3 class="threat-title">École / Entreprise</h3>
            <p>Permet du phishing ultra-ciblé et crédible.</p>
            <div style="background: #fef3c7; padding: 1rem; border-radius: 0.5rem; margin-top: 1rem;">
              <strong>Exemple :</strong> "Bonjour, je suis du service RH de votre entreprise..."
            </div>
          </div>

          <div class="threat-card">
            <div class="threat-icon">✈️</div>
            <h3 class="threat-title">Vos Vacances</h3>
            <p>Posts en temps réel = maison vide annoncée publiquement.</p>
            <div style="background: #fee2e2; padding: 1rem; border-radius: 0.5rem; margin-top: 1rem;">
              <strong>Risque :</strong> Cible facile pour les cambrioleurs
            </div>
          </div>
        </div>

        <h2 class="section-title">Cas Réel : Du Profil Public au Piratage</h2>

        <div class="case-study">
          <h3 style="color: #92400e; font-size: 1.5rem; margin-top: 0;">L'Histoire de Marie, 34 ans</h3>
          
          <div class="case-timeline">
            <div class="timeline-item">
              <strong>Informations publiques sur Facebook :</strong>
              <ul style="margin: 0.5rem 0 0 1.5rem;">
                <li>Photo avec son chien "Bella"</li>
                <li>Date de naissance complète : 12/06/1990</li>
                <li>Post : "En vacances à Barcelone du 15 au 29 août !"</li>
                <li>Profil d'entreprise : "Travaille chez Entreprise X"</li>
              </ul>
            </div>

            <div class="hacker-process">
              <strong style="color: #7f1d1d; font-size: 1.125rem; display: block; margin-bottom: 1rem;">Le hacker collecte et exploite :</strong>
              <ol style="margin: 0; padding-left: 1.5rem;">
                <li style="margin: 0.75rem 0;"><strong>Étape 1 :</strong> Essaie "Bella1990" comme mot de passe</li>
                <li style="margin: 0.75rem 0;"><strong>Étape 2 :</strong> Ça fonctionne sur son email !</li>
                <li style="margin: 0.75rem 0;"><strong>Étape 3 :</strong> Demande réinitialisation mot de passe sur tous ses comptes</li>
                <li style="margin: 0.75rem 0;"><strong>Étape 4 :</strong> Question secrète : "Nom de votre animal ? Bella" ✓</li>
                <li style="margin: 0.75rem 0;"><strong>Étape 5 :</strong> Accède à sa banque, Amazon, Netflix...</li>
              </ol>
            </div>

            <div style="background: #7f1d1d; color: white; padding: 1.5rem; border-radius: 0.75rem; text-align: center; font-size: 1.25rem; font-weight: 700;">
              Résultat : 3 000€ volés, identité usurpée, 6 mois pour tout récupérer
            </div>
          </div>
        </div>

        <h2 class="section-title">Les 7 Règles de Sécurité Essentielles</h2>

        <div class="security-rules">
          <div class="security-rule">
            <div class="rule-emoji">🔒</div>
            <div class="rule-content">
              <h3>1. Profil Privé par Défaut</h3>
              <p>Rendez vos profils accessibles uniquement à vos contacts approuvés.</p>
              <div style="background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 1rem; border-radius: 0.5rem; margin-top: 1rem;">
                <strong>Configuration :</strong>
                <ul style="margin: 0.5rem 0 0 1.5rem;">
                  <li><strong>Facebook :</strong> Paramètres → Confidentialité → Publications futures : "Amis uniquement"</li>
                  <li><strong>Instagram :</strong> Paramètres → Confidentialité → Compte privé</li>
                  <li><strong>Twitter/X :</strong> Paramètres → Confidentialité → Protéger vos tweets</li>
                </ul>
              </div>
            </div>
          </div>

          <div class="security-rule">
            <div class="rule-emoji">👤</div>
            <div class="rule-content">
              <h3>2. Limitez les Informations Personnelles</h3>
              <p>Ne partagez JAMAIS publiquement :</p>
              <ul style="margin: 1rem 0 0 1.5rem; line-height: 2;">
                <li>Date de naissance complète (mois et année suffisent)</li>
                <li>Adresse précise (ville maximum)</li>
                <li>Numéro de téléphone</li>
                <li>Numéro de plaque d'immatriculation</li>
                <li>Photos de cartes d'identité ou bancaires</li>
                <li>Billets d'avion ou de train (codes-barres visibles)</li>
              </ul>
            </div>
          </div>

          <div class="security-rule">
            <div class="rule-emoji">📸</div>
            <div class="rule-content">
              <h3>3. Attention aux Photos</h3>
              <p>Avant de poster, vérifiez qu'il n'y a pas :</p>
              <ul style="margin: 1rem 0 0 1.5rem;">
                <li>Adresse visible (boîte aux lettres, plaque de rue)</li>
                <li>Codes ou mots de passe en arrière-plan</li>
                <li>Documents confidentiels sur votre bureau</li>
                <li>Badges professionnels</li>
                <li>Clés de voiture ou de maison</li>
                <li>Informations sur écrans d'ordinateur</li>
              </ul>
            </div>
          </div>

          <div class="security-rule">
            <div class="rule-emoji">✈️</div>
            <div class="rule-content">
              <h3>4. Vacances : Postez APRÈS Votre Retour</h3>
              <div class="do-dont-grid" style="margin-top: 1rem;">
                <div style="background: #fee2e2; padding: 1rem; border-radius: 0.5rem; border-left: 4px solid #dc2626;">
                  <strong style="color: #7f1d1d;">❌ Dangereux</strong>
                  <p style="margin: 0.5rem 0 0 0;">"Partir 2 semaines aux Maldives demain ! Trop hâte !"</p>
                </div>
                <div style="background: #d1fae5; padding: 1rem; border-radius: 0.5rem; border-left: 4px solid #10b981;">
                  <strong style="color: #065f46;">✓ Sécurisé</strong>
                  <p style="margin: 0.5rem 0 0 0;">"Super séjour aux Maldives ! De retour avec plein de souvenirs"</p>
                </div>
              </div>
            </div>
          </div>

          <div class="security-rule">
            <div class="rule-emoji">👥</div>
            <div class="rule-content">
              <h3>5. Triez Vos Contacts Régulièrement</h3>
              <p>Acceptez-vous vraiment des inconnus ou des personnes rencontrées 5 minutes en soirée ?</p>
              <div style="background: #fef3c7; padding: 1rem; border-radius: 0.5rem; margin-top: 1rem; border-left: 4px solid #f59e0b;">
                <strong>Conseil :</strong> Faites un grand ménage tous les 6 mois. Supprimez les contacts que vous ne connaissez pas vraiment.
              </div>
            </div>
          </div>

          <div class="security-rule">
            <div class="rule-emoji">🎯</div>
            <div class="rule-content">
              <h3>6. Désactivez la Géolocalisation</h3>
              <p>Ne laissez pas vos photos révéler où vous habitez ou vous trouvez.</p>
              <div style="background: #f0f9ff; padding: 1rem; border-radius: 0.5rem; margin-top: 1rem;">
                <strong>Configuration :</strong>
                <ul style="margin: 0.5rem 0 0 1.5rem;">
                  <li><strong>iPhone :</strong> Réglages → Confidentialité → Services de localisation → Appareil photo → Jamais</li>
                  <li><strong>Android :</strong> Paramètres → Applications → Appareil photo → Autorisations → Position → Refuser</li>
                </ul>
              </div>
            </div>
          </div>

          <div class="security-rule">
            <div class="rule-emoji">🎲</div>
            <div class="rule-content">
              <h3>7. Méfiez-vous des Quiz et Jeux</h3>
              <div class="quiz-trap">
                <div class="quiz-warning">"Quel était le nom de votre premier animal ? Commentez !"</div>
                <p style="color: #7f1d1d; font-weight: 600; margin: 0;">C'est une question de sécurité bancaire courante ! Ne répondez JAMAIS à ces posts.</p>
              </div>
              <p>Autres exemples de questions piège :</p>
              <ul style="margin: 0.5rem 0 0 1.5rem;">
                <li>"Quel est votre prénom + votre mois de naissance = votre nom de rockstar"</li>
                <li>"Rue où vous avez grandi + votre premier animal = votre surnom"</li>
                <li>"Votre premier concert + votre âge = votre titre de film"</li>
              </ul>
            </div>
          </div>
        </div>

        <h2 class="section-title">Vérifier Vos Paramètres de Confidentialité</h2>

        <div class="platform-guide">
          <h3 style="color: #0284c7; font-size: 1.5rem; margin-top: 0;">Checklists par Plateforme</h3>

          <div class="platform-section">
            <h4 style="color: #1e40af; margin-top: 0; font-size: 1.25rem;">Facebook</h4>
            <div class="checklist-item">
              <div class="checkbox"></div>
              <span>Qui peut voir vos publications futures ? → <strong>Amis uniquement</strong></span>
            </div>
            <div class="checklist-item">
              <div class="checkbox"></div>
              <span>Qui peut voir votre liste d'amis ? → <strong>Moi uniquement</strong></span>
            </div>
            <div class="checklist-item">
              <div class="checkbox"></div>
              <span>Qui peut vous rechercher avec votre email/téléphone ? → <strong>Amis</strong></span>
            </div>
            <div class="checklist-item">
              <div class="checkbox"></div>
              <span>Les moteurs de recherche peuvent-ils afficher votre profil ? → <strong>Non</strong></span>
            </div>
            <div class="checklist-item">
              <div class="checkbox"></div>
              <span>Revoir toutes vos anciennes publications → <strong>Mettre en "Amis"</strong></span>
            </div>
          </div>

          <div class="platform-section">
            <h4 style="color: #1e40af; margin-top: 0; font-size: 1.25rem;">Instagram</h4>
            <div class="checklist-item">
              <div class="checkbox"></div>
              <span>Compte privé activé</span>
            </div>
            <div class="checklist-item">
              <div class="checkbox"></div>
              <span>Masquer votre story aux non-abonnés</span>
            </div>
            <div class="checklist-item">
              <div class="checkbox"></div>
              <span>Ne pas afficher le statut d'activité</span>
            </div>
            <div class="checklist-item">
              <div class="checkbox"></div>
              <span>Limiter qui peut vous identifier sur des photos</span>
            </div>
            <div class="checklist-item">
              <div class="checkbox"></div>
              <span>Désactiver le partage automatique vers Facebook</span>
            </div>
          </div>

          <div class="platform-section">
            <h4 style="color: #1e40af; margin-top: 0; font-size: 1.25rem;">LinkedIn</h4>
            <div class="checklist-item">
              <div class="checkbox"></div>
              <span>Masquer votre email</span>
            </div>
            <div class="checklist-item">
              <div class="checkbox"></div>
              <span>Masquer votre numéro de téléphone</span>
            </div>
            <div class="checklist-item">
              <div class="checkbox"></div>
              <span>Limiter qui peut voir vos relations</span>
            </div>
            <div class="checklist-item">
              <div class="checkbox"></div>
              <span>Ne pas afficher quand vous êtes en ligne</span>
            </div>
          </div>
        </div>

        <div class="key-takeaways">
          <h3>Points Clés à Retenir</h3>
          <ul>
            <li>Profil privé par défaut sur tous les réseaux sociaux</li>
            <li>Ne jamais partager d'informations sensibles publiquement</li>
            <li>Postez vos photos de vacances après votre retour</li>
            <li>Désactivez la géolocalisation sur vos photos</li>
            <li>Méfiez-vous des quiz qui posent des questions de sécurité</li>
            <li>Faites le tri dans vos contacts tous les 6 mois</li>
            <li>Vérifiez vos paramètres de confidentialité régulièrement</li>
          </ul>
        </div>

        <div style="background: linear-gradient(135deg, #dcfce7 0%, #a7f3d0 100%); border: 2px solid #10b981; border-radius: 1rem; padding: 2rem; margin: 2rem 0;">
          <h3 style="margin-top: 0; color: #065f46;">🎯 Prochaine Étape</h3>
          <p style="margin-bottom: 0;">Le prochain module vous enseignera les dangers du WiFi public et comment vous protéger lorsque vous travaillez en mobilité.</p>
        </div>
      </div>
    `,
    quiz: {
      title: 'Évaluation : Réseaux Sociaux',
      passingScore: 70,
      questions: [
        {
          question: 'Quand devriez-vous poster vos photos de vacances sur les réseaux sociaux ?',
          options: [
            'Avant de partir pour partager votre excitation',
            'En temps réel pendant le voyage',
            'Après votre retour à la maison',
            'Le moment importe peu',
          ],
          correctAnswer: 2,
          explanation: 'Poster pendant vos vacances annonce publiquement que votre maison est vide, ce qui en fait une cible facile pour les cambrioleurs. Attendez toujours votre retour.',
        },
        {
          question: 'Un post Facebook dit "Quel était le nom de votre premier animal ? Commentez !". Que devez-vous faire ?',
          options: [
            'Répondre, c\'est juste un jeu amusant',
            'Ne JAMAIS répondre - c\'est une question de sécurité bancaire courante',
            'Répondre en message privé seulement',
            'Répondre avec un faux nom',
          ],
          correctAnswer: 1,
          explanation: 'C\'est une question secrète très utilisée par les banques et services en ligne pour réinitialiser les mots de passe. Ne répondez jamais à ces "jeux" publiquement.',
        },
        {
          question: 'Pourquoi faut-il désactiver la géolocalisation sur vos photos ?',
          options: [
            'Pour économiser la batterie du téléphone',
            'Pour empêcher que vos photos révèlent où vous habitez',
            'Ce n\'est pas nécessaire',
            'Uniquement pour les photos de vacances',
          ],
          correctAnswer: 1,
          explanation: 'Les métadonnées (EXIF) des photos contiennent votre position GPS exacte. Un étranger pourrait localiser précisément votre domicile en analysant vos photos.',
        },
        {
          question: 'Quel paramètre Facebook est le plus sûr pour vos publications ?',
          options: [
            'Public - pour partager avec tout le monde',
            'Amis d\'amis - pour élargir votre réseau',
            'Amis uniquement - pour limiter l\'accès',
            'Personnalisé au cas par cas',
          ],
          correctAnswer: 2,
          explanation: '"Amis uniquement" limite votre contenu aux personnes que vous avez explicitement acceptées. C\'est le réglage le plus sûr pour protéger votre vie privée.',
        },
        {
          question: 'À quelle fréquence devriez-vous vérifier vos paramètres de confidentialité ?',
          options: [
            'Une fois à la création du compte, puis jamais',
            'Tous les 6 mois minimum',
            'Seulement si vous avez un problème',
            'Une fois par an suffit',
          ],
          correctAnswer: 1,
          explanation: 'Les plateformes changent régulièrement leurs paramètres et politiques. Vérifiez vos réglages de confidentialité tous les 6 mois pour vous assurer qu\'ils correspondent toujours à vos besoins de sécurité.',
        },
      ],
    },
  },

  {
    title: 'WiFi Public : Naviguer en Sécurité',
    description: 'Protégez-vous sur les réseaux WiFi gratuits des cafés, gares et aéroports',
    category: 'TECHNICAL',
    difficulty: 'INTERMEDIATE',
    duration: 10,
    minReadingTime: 200,
    points: 15,
    order: 4,
    content: `
      <style>
        .training-module { font-family: 'Inter', -apple-system, sans-serif; line-height: 1.8; color: #1e293b; }
        .hero-section { background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%); color: white; padding: 3rem; border-radius: 1rem; margin-bottom: 3rem; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); }
        .hero-title { font-size: 2.5rem; font-weight: 800; margin-bottom: 1rem; letter-spacing: -0.025em; }
        .hero-subtitle { font-size: 1.25rem; opacity: 0.9; line-height: 1.6; }
        .scenario-box { background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(10px); border: 2px solid rgba(255, 255, 255, 0.3); border-radius: 1rem; padding: 2rem; margin: 2rem 0; }
        .scenario-text { font-size: 1.25rem; line-height: 1.8; }
        .attack-section { margin: 3rem 0; }
        .attack-card { background: white; border: 3px solid #e2e8f0; border-radius: 1rem; padding: 2rem; margin: 2rem 0; transition: all 0.3s ease; }
        .attack-card:hover { border-color: #ef4444; transform: translateY(-4px); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); }
        .attack-title { font-size: 1.5rem; font-weight: 800; color: #dc2626; margin: 0 0 1.5rem 0; display: flex; align-items: center; gap: 0.75rem; }
        .attack-icon { font-size: 2rem; }
        .flow-diagram { background: #f8fafc; border: 2px solid #cbd5e1; border-radius: 0.75rem; padding: 2rem; margin: 1.5rem 0; display: flex; align-items: center; justify-content: center; gap: 1rem; flex-wrap: wrap; }
        .flow-item { background: white; padding: 1rem 1.5rem; border-radius: 0.5rem; font-weight: 700; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); }
        .flow-you { background: #dbeafe; color: #1e40af; }
        .flow-hacker { background: #fee2e2; color: #991b1b; animation: pulse 2s infinite; }
        .flow-internet { background: #d1fae5; color: #065f46; }
        .flow-arrow { font-size: 2rem; color: #dc2626; font-weight: 900; }
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        .golden-rules { margin: 3rem 0; }
        .golden-rule { background: white; border: 2px solid #e2e8f0; border-radius: 1rem; padding: 2rem; margin: 1.5rem 0; display: flex; gap: 1.5rem; align-items: start; transition: all 0.3s ease; position: relative; overflow: hidden; }
        .golden-rule::before { content: ''; position: absolute; top: 0; left: 0; width: 6px; height: 100%; background: linear-gradient(180deg, #f59e0b, #d97706); }
        .golden-rule:hover { transform: translateX(8px); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); border-color: #f59e0b; }
        .rule-badge { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; min-width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 1.75rem; flex-shrink: 0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .rule-content h3 { color: #f59e0b; margin: 0 0 1rem 0; font-size: 1.375rem; }
        .vpn-comparison { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin: 3rem 0; }
        .vpn-card { border-radius: 1rem; padding: 2rem; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
        .without-vpn { background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); border: 3px solid #dc2626; }
        .with-vpn { background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border: 3px solid #10b981; }
        .vpn-title { font-size: 1.5rem; font-weight: 800; margin: 0 0 1.5rem 0; }
        .connection-flow { background: white; border-radius: 0.75rem; padding: 1.5rem; margin: 1rem 0; }
        .risk-badge { padding: 1rem 1.5rem; border-radius: 0.5rem; text-align: center; font-weight: 700; margin-top: 1.5rem; }
        .providers-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin: 2rem 0; }
        .provider-card { background: white; border: 2px solid #e2e8f0; border-radius: 0.75rem; padding: 1.5rem; text-align: center; transition: all 0.3s ease; }
        .provider-card:hover { border-color: #8b5cf6; transform: translateY(-4px); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
        .provider-icon { font-size: 3rem; margin-bottom: 1rem; }
        .provider-name { font-size: 1.25rem; font-weight: 700; color: #7c3aed; margin-bottom: 0.5rem; }
        .checklist-section { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 3px solid #f59e0b; border-radius: 1rem; padding: 2.5rem; margin: 3rem 0; }
        .checklist-title { font-size: 1.5rem; font-weight: 800; color: #92400e; margin: 0 0 1.5rem 0; }
        .checklist-items { display: grid; gap: 1rem; }
        .checklist-item { background: white; border-radius: 0.5rem; padding: 1rem 1rem 1rem 3rem; position: relative; transition: all 0.2s ease; }
        .checklist-item:hover { transform: translateX(4px); box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); }
        .checklist-item::before { content: '□'; position: absolute; left: 1rem; font-size: 1.5rem; color: #f59e0b; font-weight: 700; }
        .section-title { font-size: 1.875rem; font-weight: 700; color: #0f172a; margin: 3rem 0 1.5rem 0; padding-bottom: 0.75rem; border-bottom: 3px solid #f59e0b; }
        .key-takeaways { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: white; padding: 2.5rem; border-radius: 1rem; margin: 3rem 0; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); }
        .key-takeaways h3 { font-size: 1.875rem; font-weight: 800; margin: 0 0 1.5rem 0; }
        .key-takeaways ul { list-style: none; padding: 0; margin: 0; }
        .key-takeaways li { padding: 0.875rem 0; padding-left: 2rem; position: relative; font-size: 1.125rem; }
        .key-takeaways li::before { content: '✓'; position: absolute; left: 0; color: #10b981; font-weight: 800; font-size: 1.25rem; }
      </style>

      <div class="training-module">
        <div class="hero-section">
          <h1 class="hero-title">WiFi Public : Naviguer en Sécurité</h1>
          <p class="hero-subtitle">
            Apprenez à identifier les risques des réseaux WiFi gratuits et à vous protéger efficacement lors de vos déplacements professionnels et personnels.
          </p>
          <div class="scenario-box">
            <p class="scenario-text">
              Vous êtes au café. Vous vous connectez au WiFi gratuit. Vous consultez votre banque.<br><br>
              <strong style="font-size: 1.5rem;">À la table d'à côté, quelqu'un voit TOUT ce que vous faites.</strong>
            </p>
          </div>
        </div>

        <h2 class="section-title">Les 3 Attaques Principales sur WiFi Public</h2>

        <div class="attack-section">
          <div class="attack-card">
            <h3 class="attack-title">
              <span class="attack-icon">🎭</span>
              1. L'Attaque de l'Homme du Milieu (MITM)
            </h3>
            <p style="font-size: 1.125rem; margin-bottom: 1.5rem;">Le hacker s'intercale entre vous et Internet pour espionner tout votre trafic.</p>
            
            <div class="flow-diagram">
              <div class="flow-item flow-you">VOUS</div>
              <span class="flow-arrow">→</span>
              <div class="flow-item flow-hacker">HACKER</div>
              <span class="flow-arrow">→</span>
              <div class="flow-item flow-internet">INTERNET</div>
            </div>

            <div style="background: #fee2e2; border-left: 4px solid #dc2626; padding: 1.5rem; border-radius: 0.5rem; margin-top: 1.5rem;">
              <strong style="color: #7f1d1d; font-size: 1.125rem;">Ce que le hacker peut voir :</strong>
              <ul style="margin: 0.5rem 0 0 1.5rem; color: #991b1b;">
                <li>Vos mots de passe non chiffrés</li>
                <li>Vos emails et messages</li>
                <li>Les sites que vous visitez</li>
                <li>Vos informations bancaires</li>
                <li>Tout ce que vous tapez</li>
              </ul>
            </div>
          </div>

          <div class="attack-card">
            <h3 class="attack-title">
              <span class="attack-icon">👯</span>
              2. Le Faux Point d'Accès (Evil Twin)
            </h3>
            <p style="font-size: 1.125rem;">Le hacker crée un WiFi avec un nom identique ou très similaire au réseau légitime.</p>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin: 1.5rem 0;">
              <div style="background: #d1fae5; border: 2px solid #10b981; border-radius: 0.5rem; padding: 1.5rem; text-align: center;">
                <div style="font-size: 1.5rem; font-weight: 700; color: #065f46; margin-bottom: 0.5rem;">WiFi Légitime</div>
                <div style="font-family: monospace; font-size: 1.125rem;">Starbucks_WiFi</div>
              </div>
              <div style="background: #fee2e2; border: 2px solid #dc2626; border-radius: 0.5rem; padding: 1.5rem; text-align: center;">
                <div style="font-size: 1.5rem; font-weight: 700; color: #7f1d1d; margin-bottom: 0.5rem;">WiFi Pirate</div>
                <div style="font-family: monospace; font-size: 1.125rem;">Starbucks_WiFi</div>
              </div>
            </div>

            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 1.5rem; border-radius: 0.5rem; margin-top: 1.5rem;">
              <strong style="color: #92400e;">Le piège :</strong> Vous ne pouvez pas faire la différence ! Le faux WiFi peut même avoir un signal plus fort. Une fois connecté, le hacker contrôle tout votre trafic.
            </div>
          </div>

          <div class="attack-card">
            <h3 class="attack-title">
              <span class="attack-icon">👂</span>
              3. Le Reniflage de Données (Packet Sniffing)
            </h3>
            <p style="font-size: 1.125rem;">Le hacker utilise un logiciel qui "écoute" toutes les données circulant sur le réseau WiFi.</p>
            
            <div style="background: #f8fafc; border: 2px solid #cbd5e1; border-radius: 0.75rem; padding: 1.5rem; margin: 1.5rem 0;">
              <strong style="font-size: 1.125rem; display: block; margin-bottom: 1rem;">Données capturées :</strong>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                <div style="background: white; padding: 1rem; border-radius: 0.5rem; text-align: center; border: 2px solid #e2e8f0;">
                  <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">🔑</div>
                  <div>Identifiants de connexion</div>
                </div>
                <div style="background: white; padding: 1rem; border-radius: 0.5rem; text-align: center; border: 2px solid #e2e8f0;">
                  <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">🌐</div>
                  <div>Historique de navigation</div>
                </div>
                <div style="background: white; padding: 1rem; border-radius: 0.5rem; text-align: center; border: 2px solid #e2e8f0;">
                  <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">💬</div>
                  <div>Messages non chiffrés</div>
                </div>
                <div style="background: white; padding: 1rem; border-radius: 0.5rem; text-align: center; border: 2px solid #e2e8f0;">
                  <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">📁</div>
                  <div>Fichiers téléchargés</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <h2 class="section-title">Les 8 Règles d'Or du WiFi Public</h2>

        <div class="golden-rules">
          <div class="golden-rule">
            <div class="rule-badge">1</div>
            <div class="rule-content">
              <h3>Privilégiez Votre Connexion Mobile (4G/5G)</h3>
              <p>Votre forfait mobile est personnel, chiffré et beaucoup plus sûr qu'un WiFi public.</p>
              <div style="background: #dbeafe; border-left: 4px solid #0ea5e9; padding: 1rem; border-radius: 0.5rem; margin-top: 1rem;">
                <strong>Astuce :</strong> Activez le partage de connexion depuis votre téléphone pour utiliser votre ordinateur portable en toute sécurité.
              </div>
            </div>
          </div>

          <div class="golden-rule">
            <div class="rule-badge">2</div>
            <div class="rule-content">
              <h3>Vérifiez le Nom Exact du Réseau</h3>
              <p>Demandez au personnel de l'établissement le nom EXACT du WiFi officiel.</p>
              <div style="background: #fee2e2; padding: 1rem; border-radius: 0.5rem; margin-top: 1rem; border-left: 4px solid #dc2626;">
                <strong style="color: #7f1d1d;">⚠️ Très suspect :</strong> "Free WiFi", "WiFi gratuit", "Public_WiFi"
              </div>
            </div>
          </div>

          <div class="golden-rule">
            <div class="rule-badge">3</div>
            <div class="rule-content">
              <h3>HTTPS Obligatoire</h3>
              <p>Vérifiez que chaque site visité commence par <strong style="color: #10b981;">https://</strong> (avec le cadenas 🔒)</p>
              <div style="background: #d1fae5; padding: 1rem; border-radius: 0.5rem; margin-top: 1rem;">
                ✓ Le "S" signifie "Secure" - la connexion est chiffrée entre vous et le site
              </div>
              <div style="background: #fee2e2; padding: 1rem; border-radius: 0.5rem; margin-top: 0.5rem;">
                ✗ Ne vous connectez JAMAIS à un site en HTTP sur WiFi public
              </div>
            </div>
          </div>

          <div class="golden-rule">
            <div class="rule-badge">4</div>
            <div class="rule-content">
              <h3>Zéro Opération Bancaire ou Achat</h3>
              <p><strong>N'accédez JAMAIS à :</strong></p>
              <ul style="margin: 1rem 0 0 1.5rem; line-height: 2;">
                <li>Votre banque en ligne</li>
                <li>Sites de paiement (Amazon, PayPal...)</li>
                <li>Comptes avec carte bancaire enregistrée</li>
                <li>Services financiers sensibles</li>
              </ul>
            </div>
          </div>

          <div class="golden-rule">
            <div class="rule-badge">5</div>
            <div class="rule-content">
              <h3>Utilisez un VPN</h3>
              <p>Un VPN (Virtual Private Network) chiffre TOUT votre trafic Internet, le rendant illisible pour les hackers.</p>
            </div>
          </div>
        </div>

        <h2 class="section-title">Le VPN Expliqué Simplement</h2>

        <div class="vpn-comparison">
          <div class="vpn-card without-vpn">
            <h3 class="vpn-title" style="color: #7f1d1d;">Sans VPN (Dangereux)</h3>
            <div class="connection-flow">
              <div style="text-align: center; font-family: monospace; line-height: 2;">
                Votre appareil<br>
                ↓<br>
                <span style="background: #7f1d1d; color: white; padding: 0.5rem 1rem; border-radius: 0.5rem;">WiFi Public Non Sécurisé</span><br>
                ↓<br>
                Internet
              </div>
            </div>
            <div class="risk-badge" style="background: #7f1d1d; color: white;">
              Le hacker voit TOUT en clair
            </div>
          </div>

          <div class="vpn-card with-vpn">
            <h3 class="vpn-title" style="color: #065f46;">Avec VPN (Sécurisé)</h3>
            <div class="connection-flow">
              <div style="text-align: center; font-family: monospace; line-height: 2;">
                Votre appareil<br>
                ↓ <span style="color: #10b981; font-weight: 700;">CHIFFRÉ</span> ↓<br>
                <span style="background: #065f46; color: white; padding: 0.5rem 1rem; border-radius: 0.5rem;">Serveur VPN Sécurisé</span><br>
                ↓<br>
                Internet
              </div>
            </div>
            <div class="risk-badge" style="background: #065f46; color: white;">
              Le hacker ne voit que du charabia chiffré
            </div>
          </div>
        </div>

        <h3 style="color: #7c3aed; font-size: 1.5rem; margin: 3rem 0 1.5rem 0;">VPN Recommandés</h3>

        <div class="providers-grid">
          <div class="provider-card" style="border-color: #10b981; border-width: 3px;">
            <div class="provider-icon">🔐</div>
            <div class="provider-name">ProtonVPN</div>
            <div style="color: #64748b; margin: 0.5rem 0;">Version gratuite illimitée</div>
            <div style="background: #d1fae5; color: #065f46; padding: 0.5rem; border-radius: 0.375rem; font-weight: 600; margin-top: 1rem; font-size: 0.875rem;">RECOMMANDÉ</div>
          </div>

          <div class="provider-card">
            <div class="provider-icon">🛡️</div>
            <div class="provider-name">NordVPN</div>
            <div style="color: #64748b; margin: 0.5rem 0;">Payant, très rapide</div>
            <div style="background: #dbeafe; color: #1e40af; padding: 0.5rem; border-radius: 0.375rem; font-weight: 600; margin-top: 1rem; font-size: 0.875rem;">PREMIUM</div>
          </div>

          <div class="provider-card">
            <div class="provider-icon">🌐</div>
            <div class="provider-name">Windscribe</div>
            <div style="color: #64748b; margin: 0.5rem 0;">10 GB/mois gratuit</div>
            <div style="background: #fef3c7; color: #92400e; padding: 0.5rem; border-radius: 0.375rem; font-weight: 600; margin-top: 1rem; font-size: 0.875rem;">FREEMIUM</div>
          </div>
        </div>

        <h2 class="section-title">Checklist Avant Connexion</h2>

        <div class="checklist-section">
          <h3 class="checklist-title">Questions à Vous Poser</h3>
          <div class="checklist-items">
            <div class="checklist-item">Puis-je utiliser ma 4G/5G au lieu du WiFi ?</div>
            <div class="checklist-item">Ai-je vraiment besoin d'Internet maintenant ?</div>
            <div class="checklist-item">Le nom du réseau correspond-il à l'établissement ?</div>
            <div class="checklist-item">Mon VPN est-il activé et connecté ?</div>
            <div class="checklist-item">Vais-je éviter banque, achats et mots de passe ?</div>
            <div class="checklist-item">Les sites que je visite sont-ils en HTTPS ?</div>
          </div>
        </div>

        <div class="key-takeaways">
          <h3>Points Clés à Retenir</h3>
          <ul>
            <li>WiFi public = risque élevé de piratage et d'espionnage</li>
            <li>Privilégiez TOUJOURS votre connexion mobile 4G/5G</li>
            <li>JAMAIS de banque, achats ou opérations sensibles sur WiFi public</li>
            <li>Utilisez un VPN pour chiffrer tout votre trafic</li>
            <li>Vérifiez le nom officiel du réseau auprès du personnel</li>
            <li>HTTPS obligatoire (cadenas) sur tous les sites visités</li>
            <li>Oubliez le réseau après utilisation</li>
          </ul>
        </div>

        <div style="background: linear-gradient(135deg, #dcfce7 0%, #a7f3d0 100%); border: 2px solid #10b981; border-radius: 1rem; padding: 2rem; margin: 2rem 0;">
          <h3 style="margin-top: 0; color: #065f46;">🎯 Prochaine Étape</h3>
          <p style="margin-bottom: 0;">Le dernier module vous enseignera les bonnes pratiques du télétravail sécurisé pour protéger les données de l'entreprise.</p>
        </div>
      </div>
    `,
    quiz: {
      title: 'Évaluation : WiFi Public',
      passingScore: 70,
      questions: [
        {
          question: 'Quelle est l\'alternative la PLUS sûre au WiFi public ?',
          options: [
            'Se connecter à n\'importe quel WiFi avec mot de passe',
            'Utiliser votre connexion mobile 4G/5G',
            'Utiliser le WiFi de l\'hôtel',
            'Désactiver complètement le WiFi',
          ],
          correctAnswer: 1,
          explanation: 'Votre connexion mobile (4G/5G) est personnelle, chiffrée et contrôlée par votre opérateur. C\'est toujours plus sûr qu\'un WiFi public, même avec mot de passe.',
        },
        {
          question: 'Que signifie exactement "HTTPS" dans une URL ?',
          options: [
            'Hypertext Transfer Protocol Secure - connexion chiffrée',
            'High Technology Protection System',
            'HTTP version Swiss (Suisse)',
            'Rien de particulier, c\'est juste une norme',
          ],
          correctAnswer: 0,
          explanation: 'Le "S" de HTTPS signifie "Secure". Cela indique que la connexion entre vous et le site web est chiffrée, protégeant vos données des regards indiscrets.',
        },
        {
          question: 'Qu\'est-ce qu\'un VPN et à quoi sert-il ?',
          options: [
            'Un type d\'antivirus très puissant',
            'Un tunnel chiffré qui protège tout votre trafic Internet',
            'Un navigateur web sécurisé',
            'Un type de WiFi professionnel',
          ],
          correctAnswer: 1,
          explanation: 'Un VPN (Virtual Private Network) crée un tunnel chiffré entre votre appareil et Internet. Même sur WiFi public, vos données deviennent illisibles pour les hackers.',
        },
        {
          question: 'Pourquoi ne faut-il JAMAIS consulter sa banque sur WiFi public ?',
          options: [
            'C\'est trop lent pour charger les pages',
            'Un hacker peut intercepter vos identifiants et mots de passe',
            'C\'est interdit par la loi',
            'Les banques bloquent les connexions WiFi public',
          ],
          correctAnswer: 1,
          explanation: 'Sur un WiFi public non sécurisé, un hacker peut facilement intercepter vos identifiants bancaires, mots de passe et informations financières. C\'est un risque majeur.',
        },
        {
          question: 'Comment vérifier que vous vous connectez au BON réseau WiFi ?',
          options: [
            'Choisir celui avec le signal le plus fort',
            'Demander au personnel le nom EXACT du réseau officiel',
            'Se connecter au premier réseau gratuit disponible',
            'Vérifier qu\'il n\'y a pas de mot de passe',
          ],
          correctAnswer: 1,
          explanation: 'Les hackers créent des faux réseaux WiFi avec des noms similaires. Demandez toujours au personnel le nom exact et officiel du réseau légitime avant de vous connecter.',
        },
      ],
    },
  },

  {
    title: 'Télétravail Sécurisé : Protéger l\'Entreprise à Distance',
    description: 'Maîtrisez les bonnes pratiques pour travailler en toute sécurité depuis chez vous',
    category: 'AWARENESS',
    difficulty: 'INTERMEDIATE',
    duration: 12,
    minReadingTime: 240,
    points: 15,
    order: 5,
    content: `
      <style>
        .training-module { font-family: 'Inter', -apple-system, sans-serif; line-height: 1.8; color: #1e293b; }
        .hero-section { background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: white; padding: 3rem; border-radius: 1rem; margin-bottom: 3rem; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); }
        .hero-title { font-size: 2.5rem; font-weight: 800; margin-bottom: 1rem; letter-spacing: -0.025em; }
        .hero-subtitle { font-size: 1.25rem; opacity: 0.9; line-height: 1.6; }
        .stat-alert { background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(10px); border: 2px solid rgba(255, 255, 255, 0.3); border-radius: 1rem; padding: 2rem; margin: 2rem 0; text-align: center; }
        .stat-number { font-size: 3.5rem; font-weight: 900; display: block; margin-bottom: 0.5rem; }
        .mistake-grid { display: grid; gap: 1.5rem; margin: 2rem 0; }
        .mistake-card { background: white; border: 2px solid #e2e8f0; border-radius: 1rem; padding: 2rem; display: flex; gap: 1.5rem; align-items: start; transition: all 0.3s ease; }
        .mistake-card:hover { border-color: #dc2626; transform: translateY(-4px); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
        .mistake-number { background: linear-gradient(135deg, #dc2626, #991b1b); color: white; min-width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 1.75rem; flex-shrink: 0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .mistake-content h3 { color: #dc2626; margin: 0 0 1rem 0; font-size: 1.375rem; }
        .risk-solution { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 1rem; border-radius: 0.5rem; margin-top: 1rem; }
        .risk-solution p { margin: 0.5rem 0; }
        .risk-label { font-weight: 700; color: #92400e; }
        .solution-label { font-weight: 700; color: #065f46; }
        .checklist-section { background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 3px solid #0ea5e9; border-radius: 1rem; padding: 2.5rem; margin: 3rem 0; }
        .checklist-category { background: white; border-radius: 0.75rem; padding: 1.5rem; margin: 1.5rem 0; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); }
        .checklist-category h4 { color: #0284c7; margin: 0 0 1rem 0; font-size: 1.25rem; }
        .check-item { background: #f8fafc; border-left: 4px solid #10b981; border-radius: 0.5rem; padding: 1rem; margin: 0.5rem 0; transition: all 0.2s ease; }
        .check-item:hover { background: #f0f9ff; transform: translateX(4px); }
        .commandments { background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%); color: white; padding: 2.5rem; border-radius: 1rem; margin: 3rem 0; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); }
        .commandments h3 { font-size: 1.875rem; font-weight: 800; margin: 0 0 1.5rem 0; }
        .commandments ol { margin: 0; padding-left: 2rem; }
        .commandments li { padding: 0.75rem 0; font-size: 1.125rem; line-height: 1.6; }
        .incident-grid { display: grid; gap: 2rem; margin: 3rem 0; }
        .incident-card { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 3px solid #f59e0b; border-radius: 1rem; padding: 2rem; }
        .incident-title { color: #92400e; font-size: 1.375rem; font-weight: 800; margin: 0 0 1.5rem 0; }
        .incident-steps { display: grid; gap: 1rem; margin-top: 1rem; }
        .incident-step { background: white; border-radius: 0.5rem; padding: 1rem; display: flex; align-items: center; gap: 1rem; }
        .step-badge { background: #f59e0b; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; flex-shrink: 0; }
        .section-title { font-size: 1.875rem; font-weight: 700; color: #0f172a; margin: 3rem 0 1.5rem 0; padding-bottom: 0.75rem; border-bottom: 3px solid #3b82f6; }
        .key-takeaways { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: white; padding: 2.5rem; border-radius: 1rem; margin: 3rem 0; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); }
        .key-takeaways h3 { font-size: 1.875rem; font-weight: 800; margin: 0 0 1.5rem 0; }
        .key-takeaways ul { list-style: none; padding: 0; margin: 0; }
        .key-takeaways li { padding: 0.875rem 0; padding-left: 2rem; position: relative; font-size: 1.125rem; }
        .key-takeaways li::before { content: '✓'; position: absolute; left: 0; color: #10b981; font-weight: 800; font-size: 1.25rem; }
      </style>

      <div class="training-module">
        <div class="hero-section">
          <h1 class="hero-title">Télétravail Sécurisé : Protéger l'Entreprise à Distance</h1>
          <p class="hero-subtitle">
            Maîtrisez les bonnes pratiques pour travailler en toute sécurité depuis votre domicile et protéger les données sensibles de l'entreprise.
          </p>
          <div class="stat-alert">
            <span class="stat-number">70%</span>
            <p style="font-size: 1.25rem; margin: 0;">des cyberattaques ciblent maintenant les télétravailleurs</p>
            <p style="font-size: 1rem; margin-top: 1rem; opacity: 0.9;">Pourquoi ? Votre domicile est moins sécurisé que le bureau</p>
          </div>
        </div>

        <h2 class="section-title">Les 7 Erreurs Fatales du Télétravailleur</h2>

        <div class="mistake-grid">
          <div class="mistake-card">
            <div class="mistake-number">1</div>
            <div class="mistake-content">
              <h3>Travailler au Café sur WiFi Public</h3>
              <p>Consulter des documents confidentiels sur un réseau non sécurisé expose l'entreprise à l'espionnage industriel.</p>
              <div class="risk-solution">
                <p><span class="risk-label">Risque :</span> Interception de données confidentielles, vol d'identifiants</p>
                <p><span class="solution-label">Solution :</span> VPN d'entreprise obligatoire ou utilisez votre 4G/5G</p>
              </div>
            </div>
          </div>

          <div class="mistake-card">
            <div class="mistake-number">2</div>
            <div class="mistake-content">
              <h3>Laisser l'Ordinateur Pro Sans Surveillance</h3>
              <p>Même chez vous, un ordinateur déverrouillé est une porte ouverte.</p>
              <div class="risk-solution">
                <p><span class="risk-label">Risque :</span> Vol physique, accès par une personne non autorisée (visiteurs, famille)</p>
                <p><span class="solution-label">Solution :</span> Verrouillez TOUJOURS (Windows+L ou Ctrl+Cmd+Q sur Mac)</p>
              </div>
            </div>
          </div>

          <div class="mistake-card">
            <div class="mistake-number">3</div>
            <div class="mistake-content">
              <h3>Parler de Dossiers Confidentiels en Public</h3>
              <p>Les appels téléphoniques dans les espaces ouverts peuvent être entendus et enregistrés.</p>
              <div class="risk-solution">
                <p><span class="risk-label">Risque :</span> Espionnage industriel, fuite d'informations stratégiques</p>
                <p><span class="solution-label">Solution :</span> Téléphonez depuis une pièce fermée, loin des fenêtres ouvertes</p>
              </div>
            </div>
          </div>

          <div class="mistake-card">
            <div class="mistake-number">4</div>
            <div class="mistake-content">
              <h3>Utiliser l'Ordinateur Pro pour Usage Personnel</h3>
              <p>Naviguer sur des sites personnels avec l'ordinateur professionnel introduit des risques.</p>
              <div class="risk-solution">
                <p><span class="risk-label">Risque :</span> Télécharger un virus depuis un site de streaming ou de téléchargement</p>
                <p><span class="solution-label">Solution :</span> Ordinateur personnel pour Netflix, réseaux sociaux, téléchargements</p>
              </div>
            </div>
          </div>

          <div class="mistake-card">
            <div class="mistake-number">5</div>
            <div class="mistake-content">
              <h3>Partager des Fichiers par Email Personnel</h3>
              <p>Envoyer des documents professionnels sur votre Gmail personnel crée une faille de sécurité.</p>
              <div class="risk-solution">
                <p><span class="risk-label">Risque :</span> Fuite de données, perte de contrôle sur les documents sensibles</p>
                <p><span class="solution-label">Solution :</span> Utilisez uniquement les outils officiels (OneDrive, Google Drive pro, SharePoint)</p>
              </div>
            </div>
          </div>

          <div class="mistake-card">
            <div class="mistake-number">6</div>
            <div class="mistake-content">
              <h3>Laisser la Famille Utiliser l'Ordi Pro</h3>
              <p>Les enfants peuvent innocemment télécharger des jeux infectés ou cliquer sur des liens dangereux.</p>
              <div class="risk-solution">
                <p><span class="risk-label">Risque :</span> Installation de malwares, accès aux données professionnelles</p>
                <p><span class="solution-label">Solution :</span> Ordinateur pro = usage professionnel UNIQUEMENT (règle stricte)</p>
              </div>
            </div>
          </div>

          <div class="mistake-card">
            <div class="mistake-number">7</div>
            <div class="mistake-content">
              <h3>Imprimer des Documents Confidentiels à Domicile</h3>
              <p>Les documents papier peuvent être oubliés, volés ou jetés à la poubelle non sécurisée.</p>
              <div class="risk-solution">
                <p><span class="risk-label">Risque :</span> Vol de documents, récupération dans les poubelles</p>
                <p><span class="solution-label">Solution :</span> Évitez d'imprimer ou détruisez immédiatement (destructeur de documents)</p>
              </div>
            </div>
          </div>
        </div>

        <h2 class="section-title">La Checklist Quotidienne du Télétravailleur</h2>

        <div class="checklist-section">
          <div class="checklist-category">
            <h4>Avant de Commencer la Journée</h4>
            <div class="check-item">WiFi maison sécurisé (mot de passe WPA3 ou WPA2)</div>
            <div class="check-item">Antivirus à jour sur l'ordinateur</div>
            <div class="check-item">VPN d'entreprise connecté et fonctionnel</div>
            <div class="check-item">Espace de travail isolé (pas dans un lieu de passage)</div>
            <div class="check-item">Écran non visible depuis l'extérieur (fenêtres, portes)</div>
          </div>

          <div class="checklist-category">
            <h4>Pendant le Travail</h4>
            <div class="check-item">Verrouiller l'ordinateur à chaque pause (Windows+L)</div>
            <div class="check-item">Appels confidentiels dans une pièce fermée</div>
            <div class="check-item">Webcam couverte quand non utilisée</div>
            <div class="check-item">Pas d'usage personnel de l'ordinateur professionnel</div>
            <div class="check-item">Documents sensibles rangés hors de vue</div>
          </div>

          <div class="checklist-category">
            <h4>Fin de Journée</h4>
            <div class="check-item">Ordinateur éteint complètement (pas juste en veille)</div>
            <div class="check-item">Documents imprimés détruits si confidentiels</div>
            <div class="check-item">Déconnexion des outils professionnels</div>
            <div class="check-item">Espace de travail rangé et sécurisé</div>
          </div>
        </div>

        <h2 class="section-title">Que Faire en Cas d'Incident ?</h2>

        <div class="incident-grid">
          <div class="incident-card">
            <h3 class="incident-title">Scénario 1 : Ordinateur Volé ou Perdu</h3>
            <div class="incident-steps">
              <div class="incident-step">
                <div class="step-badge">1</div>
                <div><strong>Immédiat :</strong> Contactez votre service IT sans délai</div>
              </div>
              <div class="incident-step">
                <div class="step-badge">2</div>
                <div>Changez tous vos mots de passe depuis un autre appareil</div>
              </div>
              <div class="incident-step">
                <div class="step-badge">3</div>
                <div>Déposez plainte au commissariat</div>
              </div>
              <div class="incident-step">
                <div class="step-badge">4</div>
                <div>Informez votre manager et suivez la procédure interne</div>
              </div>
            </div>
          </div>

          <div class="incident-card">
            <h3 class="incident-title">Scénario 2 : Clic sur un Lien Suspect</h3>
            <div class="incident-steps">
              <div class="incident-step">
                <div class="step-badge">1</div>
                <div>Déconnectez-vous immédiatement d'Internet</div>
              </div>
              <div class="incident-step">
                <div class="step-badge">2</div>
                <div>Prévenez le service IT sans tarder</div>
              </div>
              <div class="incident-step">
                <div class="step-badge">3</div>
                <div>Ne supprimez rien (pour permettre l'analyse)</div>
              </div>
              <div class="incident-step">
                <div class="step-badge">4</div>
                <div>Changez vos mots de passe depuis un appareil sain</div>
              </div>
            </div>
          </div>

          <div class="incident-card">
            <h3 class="incident-title">Scénario 3 : Fuite de Données Accidentelle</h3>
            <div class="incident-steps">
              <div class="incident-step">
                <div class="step-badge">1</div>
                <div>Informez immédiatement manager ET service IT</div>
              </div>
              <div class="incident-step">
                <div class="step-badge">2</div>
                <div>Documentez précisément ce qui s'est passé</div>
              </div>
              <div class="incident-step">
                <div class="step-badge">3</div>
                <div>Ne tentez pas de "réparer" seul</div>
              </div>
              <div class="incident-step">
                <div class="step-badge">4</div>
                <div>Suivez strictement la procédure d'incident</div>
              </div>
            </div>
          </div>
        </div>

        <div class="commandments">
          <h3>Les 10 Commandements du Télétravailleur Sécurisé</h3>
          <ol>
            <li>Le VPN d'entreprise systématiquement tu utiliseras</li>
            <li>Ton WiFi maison tu sécuriseras avec WPA2/WPA3</li>
            <li>Ton écran à chaque absence tu verrouilleras</li>
            <li>Sur WiFi public jamais tu ne travailleras</li>
            <li>Les données professionnelles et personnelles tu ne mélangeras pas</li>
            <li>Ta famille sur l'ordinateur professionnel tu ne laisseras pas</li>
            <li>Les appels confidentiels dans un lieu privé tu passeras</li>
            <li>Les documents sensibles tu détruiras correctement</li>
            <li>En cas de doute le service IT immédiatement tu contacteras</li>
            <li>La sécurité de l'entreprise comme une priorité tu considéreras</li>
          </ol>
        </div>

        <div class="key-takeaways">
          <h3>Points Clés à Retenir</h3>
          <ul>
            <li>VPN d'entreprise obligatoire pour toute connexion</li>
            <li>WiFi maison sécurisé avec mot de passe fort</li>
            <li>Écran verrouillé à chaque absence, même courte</li>
            <li>Jamais de travail sur WiFi public sans VPN</li>
            <li>Séparation stricte usage pro/perso de l'équipement</li>
            <li>Famille et visiteurs ne touchent jamais l'ordinateur professionnel</li>
            <li>Appels confidentiels dans un espace isolé</li>
            <li>Destruction sécurisée des documents sensibles</li>
            <li>Signalement immédiat de tout incident au service IT</li>
          </ul>
        </div>

        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 2rem; border-radius: 1rem; margin: 2rem 0; text-align: center;">
          <h3 style="margin: 0 0 1rem 0; font-size: 1.5rem;">Félicitations !</h3>
          <p style="font-size: 1.125rem; margin: 0;">Vous avez complété l'ensemble du parcours de formation sur la cybersécurité. Vous êtes maintenant équipé pour protéger vos données et celles de l'entreprise au quotidien.</p>
        </div>
      </div>
    `,
    quiz: {
      title: 'Évaluation : Télétravail Sécurisé',
      passingScore: 70,
      questions: [
        {
          question: 'Vous êtes dans un café et devez accéder à un document confidentiel de l\'entreprise. Que faites-vous ?',
          options: [
            'Je me connecte au WiFi du café avec mon VPN d\'entreprise',
            'J\'utilise ma connexion 4G/5G ou mon VPN d\'entreprise',
            'Je demande le mot de passe du WiFi au personnel',
            'J\'attends d\'être au bureau le lendemain',
          ],
          correctAnswer: 1,
          explanation: 'La meilleure pratique est d\'utiliser votre connexion mobile 4G/5G ou le VPN d\'entreprise. Évitez les WiFi publics pour les données sensibles, même avec un VPN.',
        },
        {
          question: 'Votre enfant veut jouer 10 minutes sur votre ordinateur professionnel. Vous répondez :',
          options: [
            'OK, mais juste 10 minutes',
            'Non, cet ordinateur est strictement réservé au travail',
            'OK si je surveille ce qu\'il fait',
            'OK si c\'est un jeu éducatif',
          ],
          correctAnswer: 1,
          explanation: 'L\'ordinateur professionnel ne doit JAMAIS être utilisé à des fins personnelles, même sous surveillance. Les enfants peuvent involontairement télécharger des malwares.',
        },
        {
          question: 'Que faire IMMÉDIATEMENT si vous cliquez accidentellement sur un lien suspect au travail ?',
          options: [
            'Éteindre l\'ordinateur et ne rien dire',
            'Déconnecter Internet et prévenir le service IT immédiatement',
            'Faire un scan antivirus et continuer',
            'Supprimer l\'email et oublier',
          ],
          correctAnswer: 1,
          explanation: 'Déconnectez immédiatement Internet pour isoler la menace, puis contactez le service IT sans délai. Ils pourront contenir l\'incident avant qu\'il ne se propage.',
        },
        {
          question: 'Quelle est la configuration WiFi MINIMALE acceptable pour le télétravail sécurisé ?',
          options: [
            'Pas de mot de passe (pour faciliter les connexions)',
            'WPA2 ou WPA3 avec un mot de passe fort',
            'WEP avec n\'importe quel mot de passe',
            'Le mot de passe par défaut de la box suffit',
          ],
          correctAnswer: 1,
          explanation: 'WPA2 (ou mieux, WPA3) avec un mot de passe fort est le minimum requis. WEP est obsolète et facilement cassable. Ne jamais garder le mot de passe par défaut.',
        },
        {
          question: 'Quand devez-vous verrouiller votre ordinateur professionnel ?',
          options: [
            'Seulement en fin de journée',
            'À chaque pause, même de 30 secondes',
            'Uniquement si vous quittez la maison',
            'Jamais nécessaire si vous êtes chez vous',
          ],
          correctAnswer: 1,
          explanation: 'Verrouillez systématiquement votre ordinateur à chaque absence, même très courte. Un ordinateur déverrouillé est une porte ouverte aux accès non autorisés.',
        },
      ],
    },
  },
];
