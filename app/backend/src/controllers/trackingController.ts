import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export const trackOpen = async (req: Request, res: Response) => {
  try {
    const { targetId, campaignId } = req.body;

    await prisma.campaignTarget.update({
      where: { id: targetId },
      data: {
        status: 'OPENED',
        openedAt: new Date(),
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('TrackOpen error:', error);
    res.status(500).json({ message: 'Erreur de tracking' });
  }
};

export const trackClick = async (req: Request, res: Response) => {
  try {
    const { targetId, campaignId } = req.body;

    await prisma.campaignTarget.update({
      where: { id: targetId },
      data: {
        status: 'CLICKED',
        clickedAt: new Date(),
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('TrackClick error:', error);
    res.status(500).json({ message: 'Erreur de tracking' });
  }
};

export const trackReading = async (req: Request, res: Response) => {
  try {
    const { targetId, timeSpent, secondsPerWord, fastRead, scrollEvents, focusTime } = req.body;

    await prisma.campaignTarget.update({
      where: { id: targetId },
      data: {
        readingMetrics: {
          timeSpent,
          secondsPerWord,
          fastRead,
          scrollEvents,
          focusTime,
        },
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('TrackReading error:', error);
    res.status(500).json({ message: 'Erreur de tracking' });
  }
};