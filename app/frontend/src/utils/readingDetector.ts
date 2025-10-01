export class ReadingTracker {
  private startTime: number;
  private focusTime: number = 0;
  private lastFocusStart: number = 0;
  private scrollEvents: number = 0;
  private minWordsPerMinute: number = 150; // Lecture minimale acceptable
  private maxWordsPerMinute: number = 400; // Lecture maximale réaliste
  
  constructor(private wordCount: number) {
    this.startTime = Date.now();
    this.lastFocusStart = Date.now();
    this.setupTracking();
  }

  private setupTracking() {
    // Détection du focus/blur de la fenêtre
    window.addEventListener('focus', () => {
      this.lastFocusStart = Date.now();
    });

    window.addEventListener('blur', () => {
      if (this.lastFocusStart > 0) {
        this.focusTime += Date.now() - this.lastFocusStart;
        this.lastFocusStart = 0;
      }
    });

    // Détection du scroll (interaction)
    let scrollTimeout: NodeJS.Timeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.scrollEvents++;
      }, 150);
    });

    // Détection de la visibilité de la page
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.lastFocusStart > 0) {
        this.focusTime += Date.now() - this.lastFocusStart;
        this.lastFocusStart = 0;
      } else if (!document.hidden) {
        this.lastFocusStart = Date.now();
      }
    });
  }

  getReadingStats() {
    // Temps total passé sur la page
    const totalTime = (Date.now() - this.startTime) / 1000; // en secondes
    
    // Temps réel de focus (fenêtre active)
    let activeFocusTime = this.focusTime;
    if (this.lastFocusStart > 0) {
      activeFocusTime += Date.now() - this.lastFocusStart;
    }
    const focusTimeSeconds = activeFocusTime / 1000;

    // Calcul de la vitesse de lecture
    const wordsPerMinute = (this.wordCount / focusTimeSeconds) * 60;

    // Détermination si la lecture est suspecte
    const isTooFast = wordsPerMinute > this.maxWordsPerMinute;
    const isTooSlow = wordsPerMinute < this.minWordsPerMinute && totalTime < 60;
    const hasMinimalInteraction = this.scrollEvents < 3;

    const suspicious = isTooFast || (isTooSlow && hasMinimalInteraction);

    return {
      totalTimeSeconds: Math.round(totalTime),
      focusTimeSeconds: Math.round(focusTimeSeconds),
      wordsPerMinute: Math.round(wordsPerMinute),
      scrollEvents: this.scrollEvents,
      suspicious,
      reason: suspicious 
        ? isTooFast 
          ? 'READING_TOO_FAST' 
          : 'INSUFFICIENT_ENGAGEMENT'
        : null,
    };
  }

  destroy() {
    // Cleanup des event listeners si nécessaire
  }
}