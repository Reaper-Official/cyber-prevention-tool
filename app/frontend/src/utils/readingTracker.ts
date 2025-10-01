export class ReadingTracker {
  private startTime: number;
  private focusTime: number = 0;
  private lastFocusStart: number = 0;
  private scrollEvents: number = 0;
  private minWordsPerMinute: number = 150;
  private maxWordsPerMinute: number = 400;
  
  constructor(private wordCount: number) {
    this.startTime = Date.now();
    this.lastFocusStart = Date.now();
    this.setupTracking();
  }

  private setupTracking() {
    const handleFocus = () => {
      this.lastFocusStart = Date.now();
    };

    const handleBlur = () => {
      if (this.lastFocusStart > 0) {
        this.focusTime += Date.now() - this.lastFocusStart;
        this.lastFocusStart = 0;
      }
    };

    let scrollTimeout: ReturnType<typeof setTimeout>;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.scrollEvents++;
      }, 150);
    };

    const handleVisibilityChange = () => {
      if (document.hidden && this.lastFocusStart > 0) {
        this.focusTime += Date.now() - this.lastFocusStart;
        this.lastFocusStart = 0;
      } else if (!document.hidden) {
        this.lastFocusStart = Date.now();
      }
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('scroll', handleScroll);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    this.cleanup = () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }

  private cleanup: () => void = () => {};

  getReadingStats() {
    const totalTime = (Date.now() - this.startTime) / 1000;
    
    let activeFocusTime = this.focusTime;
    if (this.lastFocusStart > 0) {
      activeFocusTime += Date.now() - this.lastFocusStart;
    }
    const focusTimeSeconds = activeFocusTime / 1000;

    const wordsPerMinute = (this.wordCount / focusTimeSeconds) * 60;

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
    this.cleanup();
  }
}