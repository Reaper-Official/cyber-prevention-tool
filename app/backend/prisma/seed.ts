import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const adminPassword = await bcrypt.hash('Admin123!', 12);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@local.test' },
    update: {},
    create: {
      email: 'admin@local.test',
      password: adminPassword,
      name: 'Administrateur',
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin user created:', admin.email);

  const trainingModules = [
    {
      title: 'Les Bases du Phishing : Reconnaître les Menaces',
      description: 'Apprenez à identifier les tentatives de phishing avant qu\'il ne soit trop tard',
      content: `
        <div class="training-module">
          <h2>🎯 Qu'est-ce que le Phishing?</h2>
          <p>Le phishing est une technique d'escroquerie en ligne où des cybercriminels se font passer pour des entités légitimes afin de voler vos informations personnelles.</p>
          
          <div class="alert alert-warning">
            <strong>💡 Le saviez-vous?</strong> 91% des cyberattaques commencent par un email de phishing.
          </div>

          <h3>🔍 Les Signes d'Alerte</h3>
          <ul class="checklist">
            <li><strong>Urgence artificielle:</strong> "Votre compte sera fermé sous 24h!"</li>
            <li><strong>Erreurs grammaticales:</strong> Fautes d'orthographe inhabituelles</li>
            <li><strong>Expéditeur suspect:</strong> support@amaz0n.com au lieu de amazon.com</li>
            <li><strong>Liens étranges:</strong> URLs raccourcies ou domaines similaires</li>
            <li><strong>Pièces jointes inattendues:</strong> Fichiers .exe, .zip non sollicités</li>
          </ul>

          <h3>📧 Exemple Concret</h3>
          <div class="example-box">
            <p><strong>Objet:</strong> URGENT - Vérification de votre compte bancaire</p>
            <p><strong>De:</strong> securite@banque-populaire-fr.xyz</p>
            <p><strong>Message:</strong> "Votre compte a été temporairement bloqué pour des raisons de sécurité. Cliquez ici pour le débloquer dans les 2 heures..."</p>
          </div>

          <div class="quiz">
            <p><strong>🤔 Réflexion:</strong> Que feriez-vous dans cette situation?</p>
            <ol>
              <li>Cliquer sur le lien immédiatement</li>
              <li>Appeler votre banque directement</li>
              <li>Ignorer l'email</li>
            </ol>
            <p class="answer"><strong>✅ Bonne réponse:</strong> Option 2 - Toujours contacter l'organisation directement via leurs canaux officiels.</p>
          </div>

          <h3>🛡️ Que Faire si Vous Recevez un Email Suspect?</h3>
          <ol>
            <li><strong>Ne cliquez pas</strong> sur les liens ou pièces jointes</li>
            <li><strong>Vérifiez l'expéditeur</strong> attentivement</li>
            <li><strong>Signalez</strong> l'email à votre service IT</li>
            <li><strong>Supprimez</strong> le message</li>
          </ol>

          <div class="remember-box">
            <h4>💪 À Retenir</h4>
            <p>Les organisations légitimes ne vous demanderont JAMAIS de:</p>
            <ul>
              <li>Confirmer votre mot de passe par email</li>
              <li>Fournir des informations sensibles via un lien</li>
              <li>Agir dans l'urgence sans vérification</li>
            </ul>
          </div>
        </div>
      `,
      duration: 8,
      minReadingTime: 180,
      order: 1,
    },
    {
      title: 'Anatomie d\'une URL: Détecter les Liens Malveillants',
      description: 'Maîtrisez l\'art de décrypter les URLs pour vous protéger',
      content: `
        <div class="training-module">
          <h2>🔗 Comprendre les URLs</h2>
          <p>Une URL est comme une adresse postale du web. Savoir la lire peut vous sauver de nombreuses cyberattaques.</p>

          <h3>📐 Structure d'une URL</h3>
          <div class="url-anatomy">
            <code>https://www.example.com:443/page?param=value#section</code>
            <ul>
              <li><strong>https://</strong> - Protocole sécurisé (🔒 le cadenas)</li>
              <li><strong>www.example.com</strong> - Domaine principal</li>
              <li><strong>:443</strong> - Port (optionnel)</li>
              <li><strong>/page</strong> - Chemin</li>
              <li><strong>?param=value</strong> - Paramètres</li>
            </ul>
          </div>

          <h3>⚠️ URLs Malveillantes: Les Pièges Courants</h3>
          
          <div class="danger-examples">
            <h4>1. Substitution de Caractères</h4>
            <ul>
              <li>❌ paypаl.com (le 'a' est cyrillique)</li>
              <li>❌ g00gle.com (zéros au lieu de 'o')</li>
              <li>✅ paypal.com (véritable site)</li>
            </ul>

            <h4>2. Sous-domaines Trompeurs</h4>
            <ul>
              <li>❌ amazon.com.phishing-site.xyz</li>
              <li>❌ secure-netflix.fake-site.com</li>
              <li>✅ netflix.com</li>
            </ul>

            <h4>3. Raccourcisseurs d'URLs</h4>
            <ul>
              <li>⚠️ bit.ly/xyz123</li>
              <li>⚠️ tinyurl.com/abc456</li>
              <li>💡 Survolez avant de cliquer!</li>
            </ul>
          </div>

          <h3>🔍 Technique: Vérifier une URL</h3>
          <ol>
            <li><strong>Survolez</strong> le lien sans cliquer</li>
            <li><strong>Regardez</strong> en bas à gauche de votre navigateur</li>
            <li><strong>Vérifiez</strong> le domaine principal</li>
            <li><strong>Méfiez-vous</strong> des URLs trop longues ou complexes</li>
          </ol>

          <div class="practice-box">
            <h4>🎯 Exercice Pratique</h4>
            <p>Lesquelles de ces URLs sont suspectes?</p>
            <ol>
              <li>https://www.microsoft.com/fr-fr/support</li>
              <li>http://microsoft-secure-login.xyz/verify</li>
              <li>https://support.apple.com/fr-fr</li>
              <li>https://www.appIe.com/icloud (notez le "I" majuscule)</li>
            </ol>
            <p class="answer"><strong>✅ Réponses:</strong> Les URLs 2 et 4 sont suspectes</p>
          </div>

          <div class="pro-tip">
            <h4>💡 Astuce Pro</h4>
            <p>Tapez toujours les URLs importantes directement dans votre navigateur plutôt que de cliquer sur des liens dans des emails.</p>
          </div>
        </div>
      `,
      duration: 10,
      minReadingTime: 240,
      order: 2,
    },
    {
      title: 'Protection des Données: Les Bonnes Pratiques',
      description: 'Sécurisez vos informations personnelles et professionnelles',
      content: `
        <div class="training-module">
          <h2>🔐 La Sécurité des Données Commence par Vous</h2>
          <p>Vos données ont de la valeur. Les cybercriminels le savent et cherchent constamment à les obtenir.</p>

          <h3>🚫 Ce Qu'il Ne Faut JAMAIS Partager</h3>
          <div class="never-share">
            <ul>
              <li>❌ Mots de passe</li>
              <li>❌ Numéros de carte bancaire</li>
              <li>❌ Numéros de sécurité sociale</li>
              <li>❌ Codes de vérification 2FA</li>
              <li>❌ Questions de sécurité et leurs réponses</li>
            </ul>
          </div>

          <div class="alert alert-danger">
            <strong>⚠️ Attention:</strong> Aucune entreprise légitime ne vous demandera jamais votre mot de passe par email, téléphone ou message.
          </div>

          <h3>🔑 Gestion des Mots de Passe</h3>
          
          <h4>Créer un Mot de Passe Fort</h4>
          <div class="password-guide">
            <p><strong>❌ Mauvais:</strong></p>
            <ul>
              <li>motdepasse123</li>
              <li>Jean2024</li>
              <li>azerty</li>
            </ul>

            <p><strong>✅ Bon:</strong></p>
            <ul>
              <li>P@$$w0rd_S3cur3_2024!</li>
              <li>M0n-Ch@t-S@pp3ll3-Minou!</li>
              <li>J'@ime_L3_Café_#2024</li>
            </ul>

            <div class="password-rules">
              <h5>Règles d'Or:</h5>
              <ul>
                <li>Minimum 12 caractères</li>
                <li>Majuscules ET minuscules</li>
                <li>Chiffres ET symboles</li>
                <li>Unique pour chaque site</li>
                <li>Changé régulièrement</li>
              </ul>
            </div>
          </div>

          <h4>💪 Gestionnaires de Mots de Passe</h4>
          <p>Utilisez un gestionnaire de mots de passe comme:</p>
          <ul>
            <li>1Password</li>
            <li>Bitwarden</li>
            <li>LastPass</li>
            <li>Dashlane</li>
          </ul>

          <h3>🛡️ Authentification à Deux Facteurs (2FA)</h3>
          <p>Ajoutez une couche de sécurité supplémentaire:</p>
          <ol>
            <li><strong>SMS:</strong> Code envoyé sur votre téléphone</li>
            <li><strong>Application:</strong> Google Authenticator, Authy</li>
            <li><strong>Clé physique:</strong> YubiKey (le plus sécurisé)</li>
          </ol>

          <div class="scenario-box">
            <h4>📖 Scénario Réel</h4>
            <p><strong>Situation:</strong> Vous recevez un SMS: "Votre code de vérification Amazon est: 483921"</p>
            <p><strong>Problème:</strong> Vous n'avez rien demandé!</p>
            <p><strong>Action:</strong></p>
            <ol>
              <li>NE partagez PAS ce code</li>
              <li>Changez immédiatement votre mot de passe Amazon</li>
              <li>Activez la 2FA si ce n'est pas fait</li>
              <li>Vérifiez les activités suspectes sur votre compte</li>
            </ol>
          </div>

          <h3>📱 Sécurité Mobile</h3>
          <ul>
            <li>✅ Verrouillez votre téléphone (PIN/biométrie)</li>
            <li>✅ Installez les mises à jour</li>
            <li>✅ Téléchargez uniquement depuis les stores officiels</li>
            <li>✅ Vérifiez les permissions des applications</li>
            <li>❌ Ne vous connectez pas aux WiFi publics non sécurisés</li>
          </ul>

          <div class="checklist-final">
            <h4>✅ Checklist de Sécurité Hebdomadaire</h4>
            <ul>
              <li>□ Vérifier les connexions récentes sur vos comptes</li>
              <li>□ Examiner les emails suspects reçus</li>
              <li>□ Mettre à jour vos appareils</li>
              <li>□ Vérifier les autorisations d'applications</li>
              <li>□ Faire une sauvegarde de vos données importantes</li>
            </ul>
          </div>
        </div>
      `,
      duration: 12,
      minReadingTime: 300,
      order: 3,
    },
  ];

  for (const module of trainingModules) {
    await prisma.trainingModule.upsert({
      where: { id: module.title },
      update: module,
      create: {
        id: module.title,
        ...module,
      },
    });
    console.log(`✅ Training module created: ${module.title}`);
  }

  await prisma.settings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      minSecondsPerWord: 0.25,
      alertThresholds: {
        clickRate: 0.8,
        fastRead: 0.8,
      },
      sandboxMode: true,
      requireApproval: true,
      aiProvider: 'GEMINI',
    },
  });

  console.log('✅ Settings created');
  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });