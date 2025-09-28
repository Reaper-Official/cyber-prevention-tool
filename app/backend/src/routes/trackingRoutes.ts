import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { TrackingService } from '../services/trackingService';
import { TrainingService } from '../services/trainingService';

const router = Router();
const prisma = new PrismaClient();
const trackingService = new TrackingService(prisma);
const trainingService = new TrainingService(prisma);

// Tracking pixel pour l'ouverture d'email
router.get('/open/:trackingId', async (req, res) => {
  try {
    await trackingService.trackOpen(req.params.trackingId, req.ip);
    
    // Retourner un pixel transparent 1x1
    const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    res.writeHead(200, {
      'Content-Type': 'image/gif',
      'Content-Length': pixel.length,
      'Cache-Control': 'no-store, no-cache, must-revalidate, private'
    });
    res.end(pixel);
  } catch (error) {
    console.error('Open tracking error:', error);
    res.status(200).send();
  }
});

// Tracking des clics sur liens
router.get('/click/:trackingId', async (req, res) => {
  try {
    const target = await trackingService.trackClick(req.params.trackingId, req.ip);
    
    if (target) {
      // Rediriger vers la page de landing
      res.redirect(`/landing/${req.params.trackingId}`);
    } else {
      res.redirect('/404');
    }
  } catch (error) {
    console.error('Click tracking error:', error);
    res.redirect('/404');
  }
});

// Tracking de la lecture (temps passé sur l'email)
router.post('/reading', async (req, res) => {
  try {
    const {
      trackingId,
      timeSpent,
      wordCount,
      scrollDepth,
      focusTime
    } = req.body;

    // Calculer les métriques de lecture
    const secondsPerWord = wordCount > 0 ? timeSpent / wordCount : 0;
    const minSecondsPerWord = parseFloat(process.env.MIN_SECONDS_PER_WORD || '3');
    const fastRead = secondsPerWord < minSecondsPerWord && scrollDepth < 80;

    const target = await trackingService.trackReading(trackingId, {
      timeSpent,
      wordCount,
      scrollDepth,
      focusTime,
      secondsPerWord,
      fastRead
    });

    // Si lecture rapide détectée, préparer la formation renforcée
    if (fastRead && target) {
      await trainingService.scheduleReinforcedTraining(target.userId, target.campaignId);
    }

    res.json({ 
      success: true, 
      fastRead,
      message: fastRead ? 'Formation renforcée programmée' : 'Lecture enregistrée'
    });
  } catch (error) {
    console.error('Reading tracking error:', error);
    res.status(500).json({ success: false });
  }
});

// Tracking de soumission de formulaire
router.post('/submit/:trackingId', async (req, res) => {
  try {
    const { formData } = req.body;
    
    // NE JAMAIS stocker de vraies données sensibles
    // Enregistrer seulement le fait qu'il y a eu soumission
    await trackingService.trackSubmission(req.params.trackingId, {
      submitted: true,
      fieldCount: Object.keys(formData || {}).length,
      timestamp: new Date()
    });

    // Rediriger vers la page de formation
    res.json({
      success: true,
      redirect: `/training/${req.params.trackingId}`
    });
  } catch (error) {
    console.error('Submit tracking error:', error);
    res.status(500).json({ success: false });
  }
});

// Analytics endpoint pour le dashboard
router.get('/analytics/:campaignId', async (req, res) => {
  try {
    const analytics = await trackingService.getCampaignAnalytics(req.params.campaignId);
    res.json(analytics);
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

export default router;