import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Templates d'emails
const emailTemplates = [
  {
    name: 'Fausse alerte bancaire',
    subject: 'Action urgente requise - Votre compte bancaire',
    body: `Bonjour,

Nous avons détecté une activité suspecte sur votre compte. Pour des raisons de sécurité, nous devons vérifier votre identité.

Cliquez ici pour valider vos informations : [LINK]

Si vous ne répondez pas dans les 24h, votre compte sera suspendu.

Cordialement,
Service Sécurité`,
    difficulty: 'EASY',
    indicators: ['Urgence excessive', 'Menace de suspension', 'Demande de clic immédiat'],
  },
];

// Modules de formation (inline pour éviter les problèmes d'import)
const trainingModulesData = [
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
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #0ea5e9; border-bottom: 3px solid #0ea5e9; padding-bottom: 10px;">Reconnaître un Email de Phishing</h1>
        
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; margin: 30px 0;">
          <h2 style="margin-top: 0;">Le Phishing : Comprendre la Menace</h2>
          <p style="font-size: 1.1em;">91% des cyberattaques commencent par un email de phishing. Apprenez à les reconnaître pour vous protéger.</p>
        </div>

        <h2 style="color: #0ea5e9;">Les 7 Signaux d'Alerte</h2>
        
        <div style="background: #f0f9ff; border-left: 5px solid #0ea5e9; padding: 20px; margin: 20px 0; border-radius: 5px;">
          <h3 style="color: #0284c7; margin-top: 0;">1. Adresse Email Suspecte</h3>
          <p>Vérifiez toujours l'adresse complète de l'expéditeur, pas seulement le nom affiché.</p>
          <div style="background: #fee2e2; padding: 15px; border-radius: 5px; margin: 10px 0;">
            <strong>Exemple suspect :</strong> <code>service-paypal@secure-verification.xyz</code>
          </div>
          <div style="background: #d1fae5; padding: 15px; border-radius: 5px; margin: 10px 0;">
            <strong>Adresse légitime :</strong> <code>service@paypal.com</code>
          </div>
        </div>

        <div style="background: #fef3c7; border-left: 5px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 5px;">
          <h3 style="color: #92400e; margin-top: 0;">2. Urgence Artificielle</h3>
          <p>Les cybercriminels créent une fausse urgence pour vous empêcher de réfléchir.</p>
          <ul>
            <li>"Votre compte sera fermé dans 24h"</li>
            <li>"Action IMMÉDIATE requise"</li>
            <li>"Dernier avertissement"</li>
          </ul>
        </div>

        <div style="background: #f0f9ff; border-left: 5px solid #0ea5e9; padding: 20px; margin: 20px 0; border-radius: 5px;">
          <h3 style="color: #0284c7; margin-top: 0;">3. Fautes d'Orthographe</h3>
          <p>Les grandes entreprises relisent leurs emails. Des fautes basiques sont un signal d'alarme.</p>
        </div>

        <div style="background: #fee2e2; border-left: 5px solid #dc2626; padding: 20px; margin: 20px 0; border-radius: 5px;">
          <h3 style="color: #991b1b; margin-top: 0;">4. Demande d'Informations Sensibles</h3>
          <p><strong>Une entreprise légitime ne vous demandera JAMAIS par email :</strong></p>
          <ul>
            <li>Votre mot de passe complet</li>
            <li>Votre numéro de carte bancaire avec CVV</li>
            <li>Votre code PIN</li>
          </ul>
        </div>

        <h2 style="color: #0ea5e9;">Protocole de Sécurité</h2>
        
        <div style="display: grid; gap: 15px; margin: 20px 0;">
          <div style="background: white; border: 2px solid #e5e7eb; padding: 20px; border-radius: 10px;">
            <h3 style="color: #059669; margin-top: 0;">Étape 1 : STOP</h3>
            <p>Ne cliquez sur rien. Prenez 30 secondes pour analyser l'email.</p>
          </div>
          <div style="background: white; border: 2px solid #e5e7eb; padding: 20px; border-radius: 10px;">
            <h3 style="color: #059669; margin-top: 0;">Étape 2 : VÉRIFIER</h3>
            <p>Allez directement sur le site officiel (tapez l'URL vous-même).</p>
          </div>
          <div style="background: white; border: 2px solid #e5e7eb; padding: 20px; border-radius: 10px;">
            <h3 style="color: #059669; margin-top: 0;">Étape 3 : CONTACTER</h3>
            <p>Appelez le service client officiel pour confirmer.</p>
          </div>
          <div style="background: white; border: 2px solid #e5e7eb; padding: 20px; border-radius: 10px;">
            <h3 style="color: #059669; margin-top: 0;">Étape 4 : SIGNALER</h3>
            <p>Transférez l'email suspect au service IT.</p>
          </div>
        </div>

        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 25px; border-radius: 10px; margin: 30px 0;">
          <h3 style="margin-top: 0;">Points Clés à Retenir</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li>Vérifiez toujours l'adresse email complète</li>
            <li>Méfiez-vous de l'urgence excessive</li>
            <li>Ne cliquez jamais sur les liens suspects</li>
            <li>Contactez directement l'entreprise en cas de doute</li>
          </ul>
        </div>
      </div>
    `,
    quiz: {
      title: 'Quiz : Phishing',
      passingScore: 70,
      questions: [
        {
          question: 'Comment vérifier un lien avant de cliquer ?',
          options: [
            'Cliquer rapidement',
            'Survoler avec la souris pour voir l\'URL',
            'Regarder la couleur du lien',
            'Vérifier le logo',
          ],
          correctAnswer: 1,
          explanation: 'Survoler le lien affiche l\'URL réelle en bas du navigateur.',
        },
        {
          question: 'Un email contient plusieurs fautes. Quelle est votre réaction ?',
          options: [
            'Normal, tout le monde fait des fautes',
            'Signal d\'alerte - les entreprises relisent leurs emails',
            'Pas important si urgent',
            'Je clique pour vérifier',
          ],
          correctAnswer: 1,
          explanation: 'Les grandes entreprises ont des processus de relecture. Les fautes indiquent du phishing.',
        },
      ],
    },
  },
  {
    title: 'Mots de Passe Sécurisés',
    description: 'Créer et gérer des mots de passe incassables',
    category: 'BASICS',
    difficulty: 'BEGINNER',
    duration: 10,
    minReadingTime: 200,
    points: 10,
    order: 2,
    content: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #8b5cf6; border-bottom: 3px solid #8b5cf6; padding-bottom: 10px;">Créer des Mots de Passe Sécurisés</h1>
        
        <div style="background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); color: white; padding: 30px; border-radius: 10px; margin: 30px 0;">
          <h2 style="margin-top: 0;">La Force d'un Bon Mot de Passe</h2>
          <p style="font-size: 1.1em;">Un mot de passe faible peut être cassé en secondes. Un mot de passe fort peut prendre des millions d'années.</p>
        </div>

        <h2 style="color: #8b5cf6;">Comparaison : Faible vs Fort</h2>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0;">
          <div style="background: #fee2e2; border: 3px solid #dc2626; padding: 20px; border-radius: 10px;">
            <h3 style="color: #991b1b;">❌ Faible</h3>
            <div style="font-family: monospace; font-size: 1.2em; background: rgba(0,0,0,0.6); color: white; padding: 15px; border-radius: 5px; text-align: center;">Pass1234</div>
            <div style="font-size: 2em; font-weight: bold; text-align: center; margin: 15px 0; color: #dc2626;">&lt; 1 seconde</div>
            <p style="text-align: center; font-weight: bold;">Temps pour le casser</p>
          </div>
          
          <div style="background: #d1fae5; border: 3px solid #10b981; padding: 20px; border-radius: 10px;">
            <h3 style="color: #065f46;">✓ Fort</h3>
            <div style="font-family: monospace; font-size: 1.2em; background: rgba(0,0,0,0.6); color: white; padding: 15px; border-radius: 5px; text-align: center;">J@dm3Ch@ts24!</div>
            <div style="font-size: 2em; font-weight: bold; text-align: center; margin: 15px 0; color: #10b981;">34 000 ans</div>
            <p style="text-align: center; font-weight: bold;">Temps pour le casser</p>
          </div>
        </div>

        <h2 style="color: #8b5cf6;">Les 4 Règles d'Or</h2>
        
        <div style="background: #faf5ff; border-left: 5px solid #8b5cf6; padding: 20px; margin: 20px 0; border-radius: 5px;">
          <h3 style="color: #6d28d9; margin-top: 0;">1. Minimum 12 Caractères</h3>
          <p>Chaque caractère supplémentaire multiplie la difficulté de piratage.</p>
        </div>

        <div style="background: #faf5ff; border-left: 5px solid #8b5cf6; padding: 20px; margin: 20px 0; border-radius: 5px;">
          <h3 style="color: #6d28d9; margin-top: 0;">2. Mélangez Tout</h3>
          <ul>
            <li><strong>Majuscules :</strong> A, B, C</li>
            <li><strong>Minuscules :</strong> a, b, c</li>
            <li><strong>Chiffres :</strong> 0, 1, 2</li>
            <li><strong>Symboles :</strong> !, @, #, $</li>
          </ul>
        </div>

        <div style="background: #faf5ff; border-left: 5px solid #8b5cf6; padding: 20px; margin: 20px 0; border-radius: 5px;">
          <h3 style="color: #6d28d9; margin-top: 0;">3. Aucune Info Personnelle</h3>
          <div style="background: #fee2e2; padding: 15px; border-radius: 5px; margin-top: 10px;">
            <strong>Ne JAMAIS utiliser :</strong>
            <ul>
              <li>Votre prénom ou nom</li>
              <li>Votre date de naissance</li>
              <li>Le nom de vos enfants/animaux</li>
            </ul>
          </div>
        </div>

        <div style="background: #faf5ff; border-left: 5px solid #8b5cf6; padding: 20px; margin: 20px 0; border-radius: 5px;">
          <h3 style="color: #6d28d9; margin-top: 0;">4. Unique par Compte</h3>
          <p>Un site piraté = un seul compte compromis (si mots de passe différents)</p>
        </div>

        <h2 style="color: #8b5cf6;">La Méthode de la Phrase Secrète</h2>
        
        <div style="background: #f0f9ff; border: 2px solid #0ea5e9; padding: 25px; border-radius: 10px; margin: 30px 0;">
          <h3 style="color: #0284c7; margin-top: 0;">Technique Simple et Efficace</h3>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 15px 0;">
            <strong style="color: #0284c7;">Étape 1 :</strong> Choisissez une phrase personnelle
            <div style="background: #f8fafc; padding: 15px; border-radius: 5px; margin-top: 10px; font-style: italic;">
              "J'adore manger des pizzas le vendredi soir"
            </div>
          </div>

          <div style="background: white; padding: 20px; border-radius: 8px; margin: 15px 0;">
            <strong style="color: #0284c7;">Étape 2 :</strong> Prenez la première lettre de chaque mot
            <div style="background: #f8fafc; padding: 15px; border-radius: 5px; margin-top: 10px;">
              J a m d p l v s → <strong>JamdplVs</strong>
            </div>
          </div>

          <div style="background: white; padding: 20px; border-radius: 8px; margin: 15px 0;">
            <strong style="color: #0284c7;">Étape 3 :</strong> Ajoutez chiffres et symboles
            <div style="background: #f8fafc; padding: 15px; border-radius: 5px; margin-top: 10px;">
              JamdplVs → <strong>J@mdplV2024!</strong>
            </div>
          </div>

          <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 20px; border-radius: 8px; text-align: center; margin-top: 20px;">
            <div style="font-size: 1.2em; font-weight: bold; margin-bottom: 10px;">Résultat Final</div>
            <div style="font-family: monospace; font-size: 1.5em; letter-spacing: 0.1em;">J@mdplV2024!</div>
            <p style="margin-top: 15px; font-size: 1.1em;">Vous retenez la phrase, donc vous retenez le mot de passe !</p>
          </div>
        </div>

        <h2 style="color: #8b5cf6;">Double Authentification (2FA)</h2>
        
        <div style="background: #dbeafe; border-left: 5px solid #3b82f6; padding: 20px; margin: 20px 0; border-radius: 5px;">
          <h3 style="color: #1e40af; margin-top: 0;">Une Barrière Supplémentaire Indispensable</h3>
          <p>Même si quelqu'un vole votre mot de passe, il ne pourra PAS se connecter sans le code 2FA.</p>
          
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-top: 20px;">
            <div style="background: white; padding: 15px; border-radius: 8px; text-align: center;">
              <div style="font-size: 2em; margin-bottom: 10px;">📱</div>
              <strong>SMS</strong>
              <div style="margin-top: 5px;">⭐⭐⭐</div>
            </div>
            <div style="background: white; padding: 15px; border-radius: 8px; text-align: center; border: 2px solid #10b981;">
              <div style="font-size: 2em; margin-bottom: 10px;">🔐</div>
              <strong>Application</strong>
              <div style="margin-top: 5px;">⭐⭐⭐⭐⭐</div>
              <div style="background: #d1fae5; color: #065f46; padding: 5px; border-radius: 5px; margin-top: 5px; font-size: 0.9em; font-weight: bold;">RECOMMANDÉ</div>
            </div>
            <div style="background: white; padding: 15px; border-radius: 8px; text-align: center;">
              <div style="font-size: 2em; margin-bottom: 10px;">🔑</div>
              <strong>Clé USB</strong>
              <div style="margin-top: 5px;">⭐⭐⭐⭐⭐</div>
            </div>
          </div>
        </div>

        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 25px; border-radius: 10px; margin: 30px 0;">
          <h3 style="margin-top: 0;">Points Clés à Retenir</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li>12 caractères minimum</li>
            <li>Mélangez majuscules, minuscules, chiffres, symboles</li>
            <li>Méthode de la phrase secrète</li>
            <li>Un mot de passe unique par compte</li>
            <li>Activez la 2FA partout</li>
          </ul>
        </div>
      </div>
    `,
    quiz: {
      title: 'Quiz : Mots de Passe',
      passingScore: 70,
      questions: [
        {
          question: 'Longueur minimale recommandée pour un mot de passe en 2024 ?',
          options: ['6 caractères', '8 caractères', '12 caractères', '20 caractères'],
          correctAnswer: 2,
          explanation: '12 caractères est le minimum recommandé. Plus c\'est long, plus c\'est sûr.',
        },
        {
          question: 'Pourquoi ne jamais utiliser le même mot de passe partout ?',
          options: [
            'Plus facile à retenir',
            'Si un site est piraté, tous vos comptes sont compromis',
            'Les sites ne l\'acceptent pas',
            'Ce n\'est pas vraiment nécessaire',
          ],
          correctAnswer: 1,
          explanation: 'Un site compromis = tous vos comptes à risque si vous utilisez le même mot de passe.',
        },
      ],
    },
  },
];

async function main() {
  console.log('🌱 Seeding database...');

  // Admin user
  const adminPassword = await bcrypt.hash('Admin123!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@local.test' },
    update: {},
    create: {
      email: 'admin@local.test',
      password: adminPassword,
      name: 'Administrateur',
      role: 'ADMIN',
      department: 'IT',
      points: 500,
      level: 5,
      badges: ['first_report', 'training_complete'],
    },
  });
  console.log('✅ Admin user created');

  // HR user
  await prisma.user.upsert({
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
  console.log('✅ HR user created');

  // Email templates
  for (const template of emailTemplates) {
    await prisma.emailTemplate.upsert({
      where: { id: template.name },
      update: template,
      create: { id: template.name, ...template },
    });
    console.log(`✅ Template: ${template.name}`);
  }

  // Training modules
  for (const moduleData of trainingModulesData) {
    const { quiz, ...moduleInfo } = moduleData;
    const module = await prisma.trainingModule.upsert({
      where: { id: moduleData.title },
      update: moduleInfo,
      create: { id: moduleData.title, ...moduleInfo },
    });

    if (quiz) {
      await prisma.quiz.upsert({
        where: { id: `${module.id}-quiz` },
        update: { title: quiz.title, questions: quiz.questions, passingScore: quiz.passingScore },
        create: {
          id: `${module.id}-quiz`,
          moduleId: module.id,
          title: quiz.title,
          questions: quiz.questions,
          passingScore: quiz.passingScore,
        },
      });
    }
    console.log(`✅ Module: ${module.title}`);
  }

  // Settings
  await prisma.settings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      minSecondsPerWord: 0.25,
      alertThresholds: { clickRate: 0.8, fastRead: 0.8 },
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