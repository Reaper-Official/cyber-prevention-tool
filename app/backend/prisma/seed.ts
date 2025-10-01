import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { emailTemplates } from './templates-seed.js';

const prisma = new PrismaClient();

// Import des modules depuis un fichier séparé
import { trainingModulesData } from './training-modules.js';

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
      department: 'IT',
      points: 500,
      level: 5,
      badges: ['first_report', 'training_complete'],
    },
  });
  console.log('✅ Admin user created');

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
  console.log('✅ HR user created');

  for (const template of emailTemplates) {
    await prisma.emailTemplate.upsert({
      where: { id: template.name },
      update: template,
      create: { id: template.name, ...template },
    });
    console.log(`✅ Template: ${template.name}`);
  }

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
