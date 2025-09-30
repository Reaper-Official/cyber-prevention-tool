import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { emailTemplates } from './templates-seed.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Users
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

  // Email Templates
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

  // Training Modules with Quizzes
  const trainingModules = [
    {
      title: 'Les Bases du Phishing : Reconnaître les Menaces',
      description: 'Apprenez à identifier les tentatives de phishing',
      category: 'BASICS',
      difficulty: 'BEGINNER',
      duration: 8,
      minReadingTime: 180,
      points: 10,
      order: 1,
      content: `[Contenu HTML du module...]`,
      quiz: {
        title: 'Quiz : Les Bases du Phishing',
        passingScore: 70,
        questions: [
          {
            question: 'Qu\'est-ce que le phishing?',
            options: [
              'Une technique de pêche',
              'Une escroquerie pour voler des informations',
              'Un type de virus informatique',
              'Un logiciel de sécurité',
            ],
            correctAnswer: 1,
            explanation: 'Le phishing est une technique d\'escroquerie visant à obtenir des informations personnelles.',
          },
          {
            question: 'Quel est le principal signe d\'un email de phishing?',
            options: [
              'Une police d\'écriture élégante',
              'Des images de haute qualité',
              'Un sentiment d\'urgence artificielle',
              'Un long contenu',
            ],
            correctAnswer: 2,
            explanation: 'Les cybercriminels créent souvent un sentiment d\'urgence pour pousser à l\'action rapide.',
          },
          {
            question: 'Que devez-vous faire si vous recevez un email suspect?',
            options: [
              'Cliquer pour voir ce que c\'est',
              'Le signaler immédiatement',
              'Le supprimer sans rien dire',
              'Répondre pour demander des clarifications',
            ],
            correctAnswer: 1,
            explanation: 'Signaler un email suspect aide à protéger toute l\'organisation.',
          },
        ],
      },
    },
    {
      title: 'Anatomie d\'une URL: Détecter les Liens Malveillants',
      description: 'Maîtrisez l\'art de décrypter les URLs',
      category: 'TECHNICAL',
      difficulty: 'INTERMEDIATE',
      duration: 10,
      minReadingTime: 240,
      points: 15,
      order: 2,
      content: `[Contenu HTML du module...]`,
      quiz: {
        title: 'Quiz : Analyse des URLs',
        passingScore: 75,
        questions: [
          {
            question: 'Quelle URL est suspecte?',
            options: [
              'https://www.google.com',
              'https://g00gle-secure.xyz',
              'https://gmail.google.com',
              'https://drive.google.com',
            ],
            correctAnswer: 1,
            explanation: 'Le domaine utilise des zéros au lieu de "o" et un domaine .xyz suspect.',
          },
          {
            question: 'Que signifie "https" dans une URL?',
            options: [
              'Hyper Text Transfer Protocol Secure',
              'High Technology Protocol System',
              'Hyper Transfer Protection Secure',
              'Hidden Text Protection Service',
            ],
            correctAnswer: 0,
            explanation: 'HTTPS signifie Hyper Text Transfer Protocol Secure - une connexion chiffrée.',
          },
        ],
      },
    },
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

  // Settings
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