interface ReadingMetrics {
  openedAt: number;
  closedAt?: number;
  timeSpent: number;
  wordCount: number;
  scrollDepth: number;
  focusTime: number;
  blurCount: number;
  secondsPerWord: number;
  fastRead: boolean;
}

export class ReadingDetector {
  private metrics: ReadingMetrics;
  private focusTimer: NodeJS.Timeout | null = null;
  private scrollHandler: ((e: Event) => void) | null = null;
  private trackingId: string;
  private minSecondsPerWord: number;

  constructor(trackingId: string, minSecondsPerWord: number = 3) {
    this.trackingId = trackingId;
    this.minSecondsPerWord = minSecondsPerWord;
    
    this.metrics = {
      openedAt: Date.now(),
      timeSpent: 0,
      wordCount: 0,
      scrollDepth: 0,
      focusTime: 0,
      blurCount: 0,
      secondsPerWord: 0,
      fastRead: false
    };

    this.initialize();
  }

  private initialize() {
    // Compter les mots dans le contenu visible
    this.metrics.wordCount = this.countVisibleWords();

    // Tracking du focus/blur
    this.setupFocusTracking();

    // Tracking du scroll
    this.setupScrollTracking();

    // Envoyer les métriques quand l'utilisateur quitte
    this.setupUnloadTracking();
  }

  private countVisibleWords(): number {
    const content = document.querySelector('.email-content, .landing-content, article');
    if (!content) return 0;

    const text = content.textContent || '';
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    return words.length;
  }

  private setupFocusTracking() {
    let focusStartTime = Date.now();

    const handleFocus = () => {
      focusStartTime = Date.now();
    };

    const handleBlur = () => {
      this.metrics.focusTime += Date.now() - focusStartTime;
      this.metrics.blurCount++;
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    // Considérer la page comme ayant le focus au départ
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        handleBlur();
      } else {
        handleFocus();
      }
    });
  }

  private setupScrollTracking() {
    let maxScroll = 0;

    this.scrollHandler = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;
      const scrollPercentage = scrollHeight > 0 ? (currentScroll / scrollHeight) * 100 : 0;

      if (scrollPercentage > maxScroll) {
        maxScroll = scrollPercentage;
        this.metrics.scrollDepth = Math.min(100, Math.round(scrollPercentage));
      }
    };

    window.addEventListener('scroll', this.scrollHandler, { passive: true });
  }

  private setupUnloadTracking() {
    const sendMetrics = () => {
      this.calculateFinalMetrics();
      this.sendToBackend();
    };

    // Envoyer quand l'utilisateur quitte la page
    window.addEventListener('beforeunload', sendMetrics);
    window.addEventListener('pagehide', sendMetrics);

    // Envoyer périodiquement (toutes les 30 secondes)
    setInterval(() => {
      this.calculateFinalMetrics();
      this.sendToBackend();
    }, 30000);
  }

  private calculateFinalMetrics() {
    this.metrics.closedAt = Date.now();
    this.metrics.timeSpent = Math.round((this.metrics.closedAt - this.metrics.openedAt) / 1000);

    // Calculer le temps par mot
    if (this.metrics.wordCount > 0 && this.metrics.timeSpent > 0) {
      this.metrics.secondsPerWord = this.metrics.timeSpent / this.metrics.wordCount;
    }

    // Déterminer si c'est une lecture rapide
    const tooFast = this.metrics.secondsPerWord < this.minSecondsPerWord;
    const lowScroll = this.metrics.scrollDepth < 50;
    const shortFocus = this.metrics.focusTime < (this.metrics.timeSpent * 0.5 * 1000);
    const manyBlurs = this.metrics.blurCount > 5;

    // Lecture rapide si plusieurs indicateurs sont présents
    this.metrics.fastRead = (tooFast && lowScroll) || (tooFast && shortFocus) || (tooFast && manyBlurs);
  }

  public async sendToBackend() {
    try {
      const response = await fetch('/api/track/reading', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          trackingId: this.trackingId,
          timeSpent: this.metrics.timeSpent,
          wordCount: this.metrics.wordCount,
          scrollDepth: this.metrics.scrollDepth,
          focusTime: Math.round(this.metrics.focusTime / 1000),
          secondsPerWord: this.metrics.secondsPerWord,
          fastRead: this.metrics.fastRead
        })
      });

      const data = await response.json();
      
      // Si lecture rapide détectée, afficher un message
      if (data.fastRead) {
        this.showFastReadWarning();
      }
    } catch (error) {
      console.error('Failed to send reading metrics:', error);
    }
  }

  private showFastReadWarning() {
    // Créer un toast ou modal pour informer l'utilisateur
    const warning = document.createElement('div');
    warning.className = 'fast-read-warning';
    warning.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: #FEF3C7;
        border: 1px solid #F59E0B;
        border-radius: 8px;
        padding: 16px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 9999;
        max-width: 400px;
      ">
        <h4 style="margin: 0 0 8px 0; color: #92400E;">
          ⚠️ Lecture rapide détectée
        </h4>
        <p style="margin: 0; color: #78350F; font-size: 14px;">
          Une formation complémentaire sera programmée pour améliorer votre vigilance face au phishing.
        </p>
      </div>
    `;
    
    document.body.appendChild(warning);
    
    // Retirer l'avertissement après 5 secondes
    setTimeout(() => {
      warning.remove();
    }, 5000);
  }

  public destroy() {
    // Nettoyer les event listeners
    if (this.scrollHandler) {
      window.removeEventListener('scroll', this.scrollHandler);
    }
    
    if (this.focusTimer) {
      clearInterval(this.focusTimer);
    }
  }
}

// Fonction utilitaire pour initialiser le tracking sur une page
export function initializeReadingTracking(trackingId: string): ReadingDetector {
  return new ReadingDetector(trackingId);
}