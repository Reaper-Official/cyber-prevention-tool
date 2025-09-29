export interface ReadingMetrics {
  openedAt: number;
  closedAt?: number;
  timeSpent: number;
  visibleWords: number;
  secondsPerWord: number;
  fastRead: boolean;
  scrollEvents: number;
  focusTime: number;
  blurTime: number;
}

export class ReadingDetector {
  private openedAt: number;
  private focusStartTime: number | null = null;
  private totalFocusTime = 0;
  private totalBlurTime = 0;
  private scrollEvents = 0;
  private minSecondsPerWord: number;
  private active = true;

  constructor(minSecondsPerWord = 0.25) {
    this.openedAt = Date.now();
    this.minSecondsPerWord = minSecondsPerWord;
    this.setupListeners();
  }

  private setupListeners() {
    window.addEventListener('focus', this.handleFocus);
    window.addEventListener('blur', this.handleBlur);
    window.addEventListener('scroll', this.handleScroll);
    window.addEventListener('beforeunload', this.handleUnload);
    this.handleFocus();
  }

  private handleFocus = () => {
    if (this.active) {
      this.focusStartTime = Date.now();
    }
  };

  private handleBlur = () => {
    if (this.focusStartTime && this.active) {
      this.totalFocusTime += Date.now() - this.focusStartTime;
      this.focusStartTime = null;
    }
  };

  private handleScroll = () => {
    if (this.active) {
      this.scrollEvents++;
    }
  };

  private handleUnload = () => {
    this.cleanup();
  };

  private countVisibleWords(): number {
    const bodyText = document.body.innerText || '';
    const words = bodyText.trim().split(/\s+/);
    return words.filter((w) => w.length > 0).length;
  }

  public getMetrics(): ReadingMetrics {
    const now = Date.now();
    if (this.focusStartTime) {
      this.totalFocusTime += now - this.focusStartTime;
      this.focusStartTime = now;
    }

    const timeSpent = (now - this.openedAt) / 1000;
    const visibleWords = this.countVisibleWords();
    const secondsPerWord = visibleWords > 0 ? timeSpent / visibleWords : 0;
    const fastRead = secondsPerWord < this.minSecondsPerWord && visibleWords > 50;

    return {
      openedAt: this.openedAt,
      closedAt: now,
      timeSpent,
      visibleWords,
      secondsPerWord,
      fastRead,
      scrollEvents: this.scrollEvents,
      focusTime: this.totalFocusTime / 1000,
      blurTime: this.totalBlurTime / 1000,
    };
  }

  public cleanup() {
    this.active = false;
    window.removeEventListener('focus', this.handleFocus);
    window.removeEventListener('blur', this.handleBlur);
    window.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('beforeunload', this.handleUnload);
  }
}