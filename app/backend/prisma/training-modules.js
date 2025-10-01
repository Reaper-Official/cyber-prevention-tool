<li>La sécurité tu prendras au sérieux</li>
          </ol>
        </div>
      </div>

      <style>
        .training { max-width: 850px; margin: 0 auto; font-family: sans-serif; line-height: 1.7; color: #1f2937; }
        .intro-stats { background: linear-gradient(135deg, #3b82f6, #1e40af); color: white; padding: 30px; border-radius: 10px; margin: 30px 0; text-align: center; font-size: 1.1em; }
        .intro-stats strong { display: block; font-size: 1.4em; margin: 15px 0; }
        .mistakes { margin: 30px 0; }
        .mistake { display: flex; align-items: start; background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-left: 5px solid #ef4444; }
        .mistake-icon { background: #dc2626; color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5em; font-weight: bold; flex-shrink: 0; margin-right: 20px; }
        .mistake-content h4 { color: #dc2626; margin-top: 0; }
        .why-bad-tele { background: #fef3c7; padding: 15px; border-radius: 8px; margin-top: 15px; }
        .why-bad-tele p { margin: 8px 0; }
        .why-bad-tele strong { color: #92400e; }
        .tele-checklist { background: #f0f9ff; padding: 25px; border-radius: 10px; margin: 30px 0; }
        .checklist-section { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #0ea5e9; }
        .checklist-section h4 { color: #0284c7; margin-top: 0; }
        .check-box { background: #f9fafb; padding: 12px; margin: 8px 0; border-radius: 5px; border-left: 3px solid #10b981; }
        .wifi-home { background: #ede9fe; padding: 25px; border-radius: 10px; margin: 30px 0; }
        .wifi-home > p { font-size: 1.1em; font-weight: bold; color: #7c3aed; margin-bottom: 20px; }
        .wifi-steps { margin: 20px 0; }
        .wifi-step { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #8b5cf6; }
        .wifi-step h4 { color: #7c3aed; margin-top: 0; }
        .how-to-wifi { background: #f3f4f6; padding: 12px; border-radius: 5px; margin-top: 10px; font-size: 0.95em; font-style: italic; }
        .visio-security { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 30px 0; }
        .visio-rule { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border-top: 4px solid #0ea5e9; }
        .visio-rule h4 { color: #0284c7; margin-top: 0; }
        .visio-rule ul { margin: 10px 0; padding-left: 20px; }
        .visio-rule li { margin: 8px 0; }
        .incident-response { margin: 30px 0; }
        .incident-scenario { background: #fef3c7; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 5px solid #f59e0b; }
        .incident-scenario h4 { color: #92400e; margin-top: 0; }
        .action-immediate { background: white; padding: 15px; border-radius: 8px; margin-top: 15px; }
        .action-immediate strong { color: #dc2626; display: block; margin-bottom: 10px; font-size: 1.1em; }
        .action-immediate ol { margin: 5px 0; padding-left: 25px; }
        .action-immediate li { margin: 8px 0; }
        .remember { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 25px; border-radius: 10px; margin: 30px 0; }
        .remember h3 { margin-top: 0; }
        .remember ol { margin: 0; padding-left: 25px; }
        .remember li { margin: 12px 0; font-size: 1.05em; }
      </style>
    `,
    quiz: {
      title: 'Quiz : Télétravail Sécurisé',
      passingScore: 70,
      questions: [
        {
          question: 'Vous êtes au café et devez accéder à un document confidentiel. Que faites-vous ?',
          options: [
            'Je me connecte au WiFi du café',
            'J\'utilise ma 4G ou un VPN d\'entreprise',
            'Je demande le mot de passe WiFi',
            'J\'attends d\'être chez moi',
          ],
          correctAnswer: 1,
          explanation: 'Toujours privilégier votre connexion 4G ou utiliser le VPN d\'entreprise. Le WiFi public est trop risqué pour des documents confidentiels.',
        },
        {
          question: 'Votre enfant veut jouer sur votre ordinateur professionnel. Vous dites :',
          options: [
            'OK, mais juste 10 minutes',
            'Non, cet ordinateur est uniquement pour le travail',
            'OK si c\'est un jeu éducatif',
            'OK si je surveille',
          ],
          correctAnswer: 1,
          explanation: 'L\'ordinateur professionnel ne doit JAMAIS être utilisé à des fins personnelles. Les enfants peuvent télécharger des virus sans le savoir.',
        },
        {
          question: 'Quelle est la bonne pratique pour sécuriser votre WiFi maison ?',
          options: [
            'Garder le mot de passe par défaut',
            'Utiliser WPA3 ou WPA2 avec un mot de passe fort',
            'Désactiver le mot de passe pour plus de simplicité',
            'Utiliser WEP',
          ],
          correctAnswer: 1,
          explanation: 'WPA3 (ou WPA2 minimum) avec un mot de passe fort est essentiel. WEP est obsolète et facilement cassable.',
        },
        {
          question: 'Que faire si vous cliquez accidentellement sur un lien suspect au travail ?',
          options: [
            'Éteindre l\'ordinateur et ne rien dire',
            'Déconnecter Internet et prévenir le service IT immédiatement',
            'Faire un scan antivirus et continuer de travailler',
            'Supprimer l\'email et oublier',
          ],
          correctAnswer: 1,
          explanation: 'Déconnectez-vous immédiatement et prévenez le service IT. Ils pourront isoler l\'incident avant qu\'il ne se propage.',
        },
      ],
    },
  },
];

async function main() {
  console.log('🌱 Seeding database with complete training modules...');

  // Create admin user
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
      badges: ['first_report', 'training_complete', 'security_champion'],
    },
  });
  console.log('✅ Admin user created');

  // Create HR user
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
      badges: ['first_campaign'],
    },
  });
  console.log('✅ HR user created');

  // Create email templates
  for (const template of emailTemplates) {
    await prisma.emailTemplate.upsert({
      where: { id: template.name },
      update: template,
      create: {
        id: template.name,
        ...template,
      },
    });
    console.log(`✅ Template: ${template.name}`);
  }

  // Create training modules with quizzes
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

    console.log(`✅ Module: ${module.title}`);
  }

  // Create settings
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

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });