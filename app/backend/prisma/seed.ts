import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { emailTemplates } from './templates-seed.js';

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
      points: 500,
      level: 5,
      badges: ['first_report', 'training_complete'],
    },
  });

  console.log('✅ Admin user created:', admin.email);

  const hrUser = await prisma.user.upsert({
    where: { email: 'hr@local.test' },
    update: {},
    create: {
      email: 'hr@local.test',
      password: await bcrypt.hash('HR123!', 12),
      name: 'RH Manager',
      role: 'HR',
      department: 'Ressources Humaines',
      points: 250,
      level: 3,
    },
  });

  console.log('✅ HR user created:', hrUser.email);

  // Templates d'emails
  for (const template of emailTemplates) {
    await prisma.emailTemplate.upsert({
      where: { id: template.name },
      update: template,
      create: {
        id: template.name,
        ...template,
      },
    });
    console.log(`✅ Template created: ${template.name}`);
  }

  // Modules de formation ultra-complets
  const trainingModules = [
    {
      title: 'Introduction au Phishing : Protégez-vous des Arnaques en Ligne',
      description: 'Découvrez ce qu\'est le phishing et comment vous protéger au quotidien',
      category: 'BASICS',
      difficulty: 'BEGINNER',
      duration: 15,
      minReadingTime: 300,
      points: 10,
      order: 1,
      content: `
        <div class="training-content">
          <h2>🎯 Qu'est-ce que le Phishing ?</h2>
          
          <div class="intro-box">
            <p><strong>Le phishing</strong> (ou "hameçonnage" en français) est une technique utilisée par des criminels pour vous voler vos informations personnelles en se faisant passer pour quelqu'un de confiance.</p>
            
            <p>Imaginez qu'on vous envoie un email qui semble provenir de votre banque, mais c'est en fait un faux email créé par des escrocs. C'est ça, le phishing !</p>
          </div>

          <h3>📊 Quelques Chiffres qui Font Réfléchir</h3>
          <div class="stats-box">
            <ul>
              <li><strong>91%</strong> des cyberattaques commencent par un email de phishing</li>
              <li><strong>1 email sur 99</strong> est une tentative de phishing</li>
              <li><strong>30%</strong> des emails de phishing sont ouverts par leurs cibles</li>
              <li><strong>12%</strong> des personnes cliquent sur les liens malveillants</li>
            </ul>
          </div>

          <h3>🎭 Comment Fonctionnent les Escroqueries par Phishing ?</h3>
          
          <p>Les cybercriminels utilisent plusieurs techniques pour vous tromper :</p>

          <div class="technique-card">
            <h4>1. L'Usurpation d'Identité</h4>
            <p>Ils se font passer pour :</p>
            <ul>
              <li>Votre banque (Crédit Agricole, BNP, Société Générale...)</li>
              <li>Des services populaires (Amazon, Netflix, Free...)</li>
              <li>L'administration (impôts, sécurité sociale, CAF...)</li>
              <li>Votre employeur ou un collègue</li>
            </ul>
          </div>

          <div class="technique-card">
            <h4>2. L'Urgence Artificielle</h4>
            <p>Ils créent un faux sentiment d'urgence pour vous pousser à agir vite sans réfléchir :</p>
            <ul>
              <li>"Votre compte sera fermé dans 24h !"</li>
              <li>"Action immédiate requise !"</li>
              <li>"Dernière chance de sauvegarder vos données !"</li>
              <li>"Colis en attente - paiement urgent !"</li>
            </ul>
          </div>

          <h3>🚨 Les Signes d'Alerte à Reconnaître</h3>

          <div class="alert-signs">
            <div class="sign-item">
              <strong>📧 L'Adresse Email Bizarre</strong>
              <p>Exemple : <code>service-clientpaypal@secure-payment-verify.xyz</code></p>
              <p>Au lieu de : <code>service@paypal.com</code></p>
              <p class="tip">💡 Passez votre souris sur le nom de l'expéditeur pour voir la vraie adresse email !</p>
            </div>

            <div class="sign-item">
              <strong>⚠️ Les Fautes d'Orthographe</strong>
              <p>Les grandes entreprises relisent leurs emails. Si vous voyez "Bonjour chere cliente" ou "Nous avont detecté", méfiez-vous !</p>
            </div>

            <div class="sign-item">
              <strong>🔗 Les Liens Suspects</strong>
              <p>Survolez TOUJOURS un lien avant de cliquer. L'adresse affichée en bas de votre navigateur révèle la vraie destination.</p>
              <div class="example-bad">
                ❌ www.amaz0n-secure.xyz (notez le zéro au lieu du "o")
              </div>
              <div class="example-good">
                ✅ www.amazon.fr
              </div>
            </div>

            <div class="sign-item">
              <strong>💰 Les Demandes d'Argent ou d'Informations</strong>
              <p>AUCUNE entreprise légitime ne vous demandera jamais par email :</p>
              <ul>
                <li>Votre mot de passe complet</li>
                <li>Vos codes de carte bancaire (CVV)</li>
                <li>Un virement d'argent urgent</li>
                <li>Vos codes de sécurité à 2 facteurs</li>
              </ul>
            </div>

            <div class="sign-item">
              <strong>📎 Les Pièces Jointes Inattendues</strong>
              <p>Méfiez-vous particulièrement des fichiers :</p>
              <ul>
                <li>.exe (programmes)</li>
                <li>.zip (archives compressées)</li>
                <li>.doc ou .xlsx avec macros</li>
              </ul>
            </div>
          </div>

          <h3>📖 Cas Pratique : Décryptage d'un Email de Phishing</h3>

          <div class="case-study">
            <div class="email-example">
              <div class="email-header">
                <strong>De :</strong> Support Amazon &lt;service-client@amaz0n-verify.xyz&gt;<br>
                <strong>Objet :</strong> URGENT : Votre compte a été suspendu !
              </div>
              <div class="email-body">
                <p>Cher client,</p>
                <p>Nous avons detecté une activité suspecte sur votre compte Amazon. Pour des raisons de sécurite, votre compte a été temporairement suspendu.</p>
                <p><strong style="color: red;">Vous devez vérifier votre identité dans les 24 heures</strong> sinon votre compte sera définitivement fermé et vos commandes annulées.</p>
                <p style="text-align: center; margin: 20px 0;">
                  <a href="#" style="background: #ff9900; color: white; padding: 10px 20px; text-decoration: none;">
                    Vérifier Mon Compte Maintenant
                  </a>
                </p>
                <p>Cordialement,<br>L'équipe Amazon</p>
              </div>
            </div>

            <div class="analysis">
              <h4>🔍 Analyse : Pourquoi est-ce du phishing ?</h4>
              <ol>
                <li><strong>Email suspect :</strong> "amaz0n" avec un zéro, domaine ".xyz" au lieu de ".fr"</li>
                <li><strong>Fautes d'orthographe :</strong> "detecté" sans accent, "sécurite" sans accent</li>
                <li><strong>Urgence excessive :</strong> "24 heures" pour créer la panique</li>
                <li><strong>Menace :</strong> "définitivement fermé" pour vous faire peur</li>
                <li><strong>Lien douteux :</strong> ne mène pas vers amazon.fr</li>
              </ol>
            </div>
          </div>

          <h3>✅ La Bonne Réaction en 4 Étapes</h3>

          <div class="steps-container">
            <div class="step">
              <div class="step-number">1</div>
              <div class="step-content">
                <h4>STOP - Ne Cliquez Pas !</h4>
                <p>Prenez le temps de respirer et d'analyser l'email calmement.</p>
              </div>
            </div>

            <div class="step">
              <div class="step-number">2</div>
              <div class="step-content">
                <h4>Vérifiez l'Expéditeur</h4>
                <p>Regardez attentivement l'adresse email complète. Est-elle vraiment officielle ?</p>
              </div>
            </div>

            <div class="step">
              <div class="step-number">3</div>
              <div class="step-content">
                <h4>Contactez Directement l'Entreprise</h4>
                <p>Si vous avez un doute, appelez le service client en utilisant le numéro sur leur site officiel (pas celui dans l'email !)</p>
              </div>
            </div>

            <div class="step">
              <div class="step-number">4</div>
              <div class="step-content">
                <h4>Signalez l'Email</h4>
                <p>Transférez l'email suspect à signal-spam@signal-spam.fr ou utilisez le bouton "Signaler" de votre messagerie.</p>
              </div>
            </div>
          </div>

          <h3>🛡️ Vos Outils de Protection</h3>

          <div class="protection-tools">
            <div class="tool">
              <h4>✉️ Avant de Cliquer</h4>
              <ul>
                <li>Survolez le lien avec votre souris (sans cliquer)</li>
                <li>Vérifiez l'URL affichée en bas à gauche de votre navigateur</li>
                <li>Tapez l'adresse vous-même dans le navigateur</li>
              </ul>
            </div>

            <div class="tool">
              <h4>🔍 Pour Vérifier un Lien</h4>
              <p>Utilisez des services gratuits comme :</p>
              <ul>
                <li><strong>VirusTotal</strong> (virustotal.com) - analyse les liens suspects</li>
                <li><strong>URLVoid</strong> (urlvoid.com) - vérifie la réputation des sites</li>
              </ul>
              <p class="warning">⚠️ Copiez/collez le lien, ne cliquez jamais dessus directement !</p>
            </div>

            <div class="tool">
              <h4>📞 En Cas de Doute</h4>
              <p>Rappelez-vous : <strong>il vaut mieux poser une question "bête" que de se faire pirater !</strong></p>
              <ul>
                <li>Contactez votre service IT</li>
                <li>Appelez le service client officiel</li>
                <li>Demandez à un collègue</li>
              </ul>
            </div>
          </div>

          <div class="remember-box">
            <h4>💪 Ce Qu'il Faut Retenir</h4>
            <ul>
              <li>Le phishing exploite votre confiance et votre stress</li>
              <li>Les cybercriminels sont de plus en plus doués pour imiter les vraies entreprises</li>
              <li>Prenez TOUJOURS le temps de vérifier avant de cliquer</li>
              <li>En cas de doute, contactez directement l'entreprise</li>
              <li>Signalez les tentatives de phishing</li>
              <li><strong>Vous êtes la première ligne de défense de votre sécurité !</strong></li>
            </ul>
          </div>

          <div class="next-steps">
            <h4>📚 Pour Aller Plus Loin</h4>
            <p>Dans le prochain module, nous verrons en détail comment analyser une URL et détecter les sites web dangereux.</p>
          </div>
        </div>

        <style>
          .training-content {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            line-height: 1.8;
            color: #1f2937;
          }
          
          .intro-box {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 25px;
            border-radius: 10px;
            margin: 25px 0;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          
          .stats-box {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
          }
          
          .stats-box ul {
            list-style: none;
            padding: 0;
          }
          
          .stats-box li {
            padding: 8px 0;
            font-size: 1.05em;
          }
          
          .technique-card {
            background: #f0f9ff;
            border: 2px solid #0ea5e9;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
          }
          
          .alert-signs {
            margin: 30px 0;
          }
          
          .sign-item {
            background: white;
            border-left: 4px solid #ef4444;
            padding: 20px;
            margin: 15px 0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            border-radius: 5px;
          }
          
          .sign-item .tip {
            background: #d1fae5;
            padding: 10px;
            border-radius: 5px;
            margin-top: 10px;
            font-size: 0.95em;
          }
          
          .example-bad {
            background: #fee2e2;
            padding: 10px;
            border-radius: 5px;
            margin: 10px 0;
            font-family: monospace;
          }
          
          .example-good {
            background: #d1fae5;
            padding: 10px;
            border-radius: 5px;
            margin: 10px 0;
            font-family: monospace;
          }
          
          .case-study {
            margin: 30px 0;
            padding: 20px;
            background: #f9fafb;
            border-radius: 10px;
          }
          
          .email-example {
            background: white;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            overflow: hidden;
            margin-bottom: 20px;
          }
          
          .email-header {
            background: #f3f4f6;
            padding: 15px;
            border-bottom: 1px solid #d1d5db;
            font-size: 0.9em;
          }
          
          .email-body {
            padding: 20px;
          }
          
          .analysis {
            background: #fef3c7;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #f59e0b;
          }
          
          .steps-container {
            margin: 30px 0;
          }
          
          .step {
            display: flex;
            align-items: start;
            margin: 20px 0;
            padding: 20px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          
          .step-number {
            background: #0ea5e9;
            color: white;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 1.2em;
            flex-shrink: 0;
            margin-right: 20px;
          }
          
          .step-content h4 {
            margin-top: 0;
            color: #0ea5e9;
          }
          
          .protection-tools {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 30px 0;
          }
          
          .tool {
            background: white;
            padding: 20px;
            border-radius: 8px;
            border: 2px solid #e5e7eb;
          }
          
          .tool h4 {
            color: #10b981;
            margin-top: 0;
          }
          
          .warning {
            background: #fee2e2;
            padding: 10px;
            border-radius: 5px;
            margin-top: 10px;
            border-left: 3px solid #ef4444;
          }
          
          .remember-box {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 25px;
            border-radius: 10px;
            margin: 30px 0;
          }
          
          .remember-box h4 {
            margin-top: 0;
          }
          
          .next-steps {
            background: #ede9fe;
            border-left: 4px solid #8b5cf6;
            padding: 20px;
            border-radius: 5px;
            margin: 30px 0;
          }
        </style>
      `,
      quiz: {
        title: 'Quiz : Les Bases du Phishing',
        passingScore: 70,
        questions: [
          {
            question: 'Qu\'est-ce que le phishing?',
            options: [
              'Une technique de pêche sportive',
              'Une arnaque pour voler vos informations en se faisant passer pour quelqu\'un de confiance',
              'Un type de virus informatique',
              'Un logiciel de protection',
            ],
            correctAnswer: 1,
            explanation: 'Le phishing est bien une arnaque où des criminels se font passer pour des entités de confiance afin de voler vos informations personnelles.',
          },
          {
            question: 'Quel est le signe le plus évident d\'un email de phishing?',
            options: [
              'Un email trop long',
              'Des images en haute résolution',
              'Une urgence artificielle et des fautes d\'orthographe',
              'L\'absence de logo',
            ],
            correctAnswer: 2,
            explanation: 'Les emails de phishing utilisent souvent l\'urgence pour vous pousser à agir vite, et contiennent des fautes car ils sont mal traduits ou mal rédigés.',
          },
          {
            question: 'Que devez-vous faire en PREMIER si vous recevez un email suspect?',
            options: [
              'Cliquer pour voir ce que c\'est',
              'Ne rien faire et analyser calmement l\'email',
              'Le supprimer immédiatement',
              'Répondre pour demander confirmation',
            ],
            correctAnswer: 1,
            explanation: 'La première chose à faire est de rester calme et d\'analyser l\'email sans cliquer sur rien. La réflexion avant l\'action est cruciale.',
          },
          {
            question: 'Comment vérifier si un lien est dangereux avant de cliquer?',
            options: [
              'Cliquer dessus rapidement',
              'Survoler le lien avec la souris pour voir l\'URL réelle',
              'L\'ouvrir dans un nouvel onglet',
              'Demander à un collègue de cliquer',
            ],
            correctAnswer: 1,
            explanation: 'En survolant un lien sans cliquer, votre navigateur affiche l\'URL réelle en bas de la fenêtre. C\'est le meilleur moyen de vérifier avant d\'agir.',
          },
          {
            question: 'Une entreprise légitime vous demandera-t-elle votre mot de passe par email?',
            options: [
              'Oui, pour vérifier votre identité',
              'Oui, mais seulement en cas d\'urgence',
              'Non, JAMAIS',
              'Oui, si le email vient du service technique',
            ],
            correctAnswer: 2,
            explanation: 'AUCUNE entreprise légitime ne vous demandera JAMAIS votre mot de passe par email, SMS ou téléphone. C\'est toujours un signe de phishing.',
          },
        ],
      },
    },
    // Continuez avec d'autres modules...
  ];

  for (const moduleData of trainingModules) {
    const { quiz, ...moduleInfo } = moduleData;
    
    const module = await prisma.trainingModule.upsert({
      where: { id: moduleData.title },
      update: moduleInfo,
      create: {
        id: moduleData.title,
        ...moduleInfo,
      },
    });

    if (quiz) {
      await prisma.quiz.upsert({
        where: { id: `${module.id}-quiz` },
        update: {
          title: quiz.title,
          questions: quiz.questions,
          passingScore: quiz.passingScore,
        },
        create: {
          id: `${module.id}-quiz`,
          moduleId: module.id,
          title: quiz.title,
          questions: quiz.questions,
          passingScore: quiz.passingScore,
        },
      });
    }

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
      companyName: 'PhishGuard',
      primaryColor: '#0ea5e9',
      pointsPerReport: 50,
      pointsPerTraining: 10,
    },
  });

  console.log('✅ Settings created');
  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });