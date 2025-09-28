import { PrismaClient } from '@prisma/client';
import { AIProvider } from './aiProvider';
import { EmailService } from './emailService';

export class TrainingService {
  constructor(
    private prisma: PrismaClient,
    private aiProvider: AIProvider = new AIProvider(),
    private emailService: EmailService = new EmailService()
  ) {}

  async scheduleReinforcedTraining(userId: string, campaignId: string) {
    // Récupérer le profil utilisateur et les résultats de la campagne
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { 
        department: true,
        role: true
      }
    });

    const campaignTarget = await this.prisma.campaignTarget.findFirst({
      where: {
        userId,
        campaignId
      }
    });

    if (!user || !campaignTarget) return;

    // Générer le contenu de formation via IA
    const trainingContent = await this.aiProvider.generateTrainingContent(
      {
        department: user.department?.name,
        role: user.role.name,
        securityLevel: user.securityLevel
      },
      {
        clicked: campaignTarget.clickedAt !== null,
        submitted: campaignTarget.submittedAt !== null,
        fastRead: campaignTarget.fastRead,
        readingTime: campaignTarget.readingTime
      }
    );

    // Créer la session de formation
    const trainingSession = await this.prisma.trainingSession.create({
      data: {
        userId,
        campaignId,
        type: campaignTarget.fastRead ? 'reinforced' : 'standard',
        content: trainingContent,
        nextSessionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Dans 7 jours
      }
    });

    // Envoyer la notification
    await this.emailService.sendTrainingNotification(userId, trainingSession);

    // Créer une alerte si lecture rapide détectée
    if (campaignTarget.fastRead) {
      await this.prisma.securityAlert.create({
        data: {
          type: 'fast_read_detected',
          severity: 'medium',
          campaignId,
          userId,
          message: `Lecture rapide détectée pour ${user.email}. Formation renforcée programmée.`
        }
      });
    }

    return trainingSession;
  }

  async getTrainingContent(sessionId: string) {
    const session = await this.prisma.trainingSession.findUnique({
      where: { id: sessionId },
      include: { user: true }
    });

    if (!session) {
      throw new Error('Training session not found');
    }

    return session;
  }

  async completeTraining(sessionId: string, quizAnswers: any) {
    const session = await this.prisma.trainingSession.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      throw new Error('Training session not found');
    }

    // Calculer le score
    const content = session.content as any;
    let correctAnswers = 0;
    const totalQuestions = content.quiz?.length || 0;

    if (content.quiz && quizAnswers) {
      content.quiz.forEach((question: any, index: number) => {
        if (quizAnswers[index] === question.correct) {
          correctAnswers++;
        }
      });
    }

    const score = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    const passed = score >= 70;

    // Mettre à jour la session
    await this.prisma.trainingSession.update({
      where: { id: sessionId },
      data: {
        completedAt: new Date(),
        score,
        passed
      }
    });

    // Mettre à jour le niveau de sécurité de l'utilisateur
    if (passed) {
      await this.updateUserSecurityLevel(session.userId);
    } else {
      // Programmer une nouvelle session si échec
      await this.scheduleRetakeSession(session.userId, session.campaignId || '');
    }

    return { score, passed, correctAnswers, totalQuestions };
  }

  private async updateUserSecurityLevel(userId: string) {
    const completedSessions = await this.prisma.trainingSession.count({
      where: {
        userId,
        passed: true
      }
    });

    let newLevel = 'beginner';
    if (completedSessions >= 10) {
      newLevel = 'expert';
    } else if (completedSessions >= 5) {
      newLevel = 'advanced';
    } else if (completedSessions >= 2) {
      newLevel = 'intermediate';
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { securityLevel: newLevel }
    });
  }

  private async scheduleRetakeSession(userId: string, campaignId: string) {
    // Programmer une nouvelle session dans 3 jours
    await this.prisma.trainingSession.create({
      data: {
        userId,
        campaignId,
        type: 'reinforced',
        content: { message: 'Retake required' },
        nextSessionDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      }
    });
  }
}