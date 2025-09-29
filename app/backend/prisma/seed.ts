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

  const hrUser = await prisma.user.upsert({
    where: { email: 'hr@local.test' },
    update: {},
    create: {
      email: 'hr@local.test',
      password: await bcrypt.hash('HR123!', 12),
      name: 'RH Manager',
      role: 'HR',
    },
  });

  console.log('✅ HR user created:', hrUser.email);

  const trainingModules = [
    {
      title: 'Introduction au Phishing',
      description: 'Comprendre les bases du phishing et comment le reconnaître',
      content: `
        <h2>Qu'est-ce que le phishing?</h2>
        <p>Le phishing est une technique de fraude visant à obtenir des informations personnelles en se faisant passer pour un organisme de confiance.</p>
        
        <h3>Signes d'un email de phishing:</h3>
        <ul>
          <li>Urgence artificielle</li>
          <li>Erreurs grammaticales</li>
          <li>Liens suspects</li>
          <li>Demande d'informations sensibles</li>
        </ul>
        
        <h3>Comment se protéger:</h3>
        <ul>
          <li>Vérifier l'expéditeur</li>
          <li>Ne pas cliquer sur des liens suspects</li>
          <li>Signaler les emails suspects</li>
          <li>Utiliser l'authentification à deux facteurs</li>
        </ul>
      `,
      duration: 10,
      order: 1,
    },
    {
      title: 'Identifier les URL Malveillantes',
      description: 'Apprendre à reconnaître les liens dangereux',
      content: `
        <h2>Analyser les URLs</h2>
        <p>Les attaquants utilisent des URLs trompeuses pour vous diriger vers des sites malveillants.</p>
        
        <h3>Vérifications essentielles:</h3>
        <ul>
          <li>Regarder le domaine complet</li>
          <li>Vérifier le protocole (HTTPS vs HTTP)</li>
          <li>Méfiance envers les raccourcisseurs d'URL</li>
          <li>Survoler les liens avant de cliquer</li>
        </ul>
        
        <h3>Exemples d'URLs suspectes:</h3>
        <ul>
          <li>http://paypa1.com (note le "1" au lieu du "l")</li>
          <li>https://secure-login.company-verify.com</li>
          <li>http://bit.ly/xyz123</li>
        </ul>
      `,
      duration: 15,
      order: 2,
    },
    {
      title: 'Protection des Informations Personnelles',
      description: 'Bonnes pratiques pour protéger vos données',
      content: `
        <h2>Sécurité des Données</h2>
        <p>Vos informations personnelles ont de la valeur. Apprenez à les protéger.</p>
        
        <h3>Ne jamais partager par email:</h3>
        <ul>
          <li>Mots de passe</li>
          <li>Numéros de carte bancaire</li>
          <li>Numéros de sécurité sociale</li>
          <li>Codes de vérification</li>
        </ul>
        
        <h3>Bonnes pratiques:</h3>
        <ul>
          <li>Utiliser des mots de passe uniques</li>
          <li>Activer l'authentification multifacteur</li>
          <li>Mettre à jour régulièrement vos logiciels</li>
          <li>Vérifier les paramètres de confidentialité</li>
        </ul>
      `,
      duration: 12,
      order: 3,
    },
  ];

  for (const module of trainingModules) {
    await prisma.trainingModule.upsert({
      where: { id: module.title },
      update: {},
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
  console.log('\n📋 Default credentials:');
  console.log('   Email: admin@local.test');
  console.log('   Password: Admin123!');
  console.log('\n⚠️  IMPORTANT: Change this password immediately in production!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });