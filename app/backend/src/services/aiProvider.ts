import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { AppError } from '../middleware/errorHandler';

interface AIConfig {
  provider: string;
  apiKey: string;
  model?: string;
}

interface TemplateGenerationParams {
  prompt?: string;
  targetProfiles: any;
  campaignName: string;
}

export class AIProvider {
  private provider: string;
  private client: any;
  private model: string;

  constructor() {
    this.provider = process.env.AI_PROVIDER || 'GEMINI';
    const apiKey = process.env.AI_API_KEY;

    if (!apiKey) {
      throw new Error('AI_API_KEY not configured');
    }

    switch (this.provider) {
      case 'GEMINI':
        this.client = new GoogleGenerativeAI(apiKey);
        this.model = 'gemini-pro';
        break;
      
      case 'OPENAI':
        this.client = new OpenAI({ apiKey });
        this.model = 'gpt-4';
        break;
      
      case 'CLAUDE':
        this.client = new Anthropic({ apiKey });
        this.model = 'claude-3-opus-20240229';
        break;
      
      case 'OLLAMA':
        // Configuration pour serveur Ollama local
        this.client = null; // Implémenter client HTTP pour Ollama
        this.model = process.env.OLLAMA_MODEL || 'llama2';
        break;
      
      default:
        throw new Error(`Unsupported AI provider: ${this.provider}`);
    }
  }

  async generateCampaignTemplate(params: TemplateGenerationParams) {
    const prompt = this.buildTemplatePrompt(params);

    try {
      let response;

      switch (this.provider) {
        case 'GEMINI':
          const model = this.client.getGenerativeModel({ model: this.model });
          const result = await model.generateContent(prompt);
          response = result.response.text();
          break;

        case 'OPENAI':
          const completion = await this.client.chat.completions.create({
            model: this.model,
            messages: [
              {
                role: 'system',
                content: 'Vous êtes un expert en sécurité informatique créant des simulations de phishing éthiques pour la formation.'
              },
              { role: 'user', content: prompt }
            ],
            temperature: 0.7
          });
          response = completion.choices[0].message.content;
          break;

        case 'CLAUDE':
          const message = await this.client.messages.create({
            model: this.model,
            max_tokens: 2000,
            messages: [{ role: 'user', content: prompt }]
          });
          response = message.content[0].text;
          break;

        case 'OLLAMA':
          response = await this.callOllama(prompt);
          break;
      }

      return this.parseTemplateResponse(response);
    } catch (error) {
      console.error('AI Generation Error:', error);
      throw new AppError(500, 'Failed to generate template via AI');
    }
  }

  async generateTrainingContent(userProfile: any, campaignResults: any) {
    const prompt = this.buildTrainingPrompt(userProfile, campaignResults);

    try {
      let response;

      switch (this.provider) {
        case 'GEMINI':
          const model = this.client.getGenerativeModel({ model: this.model });
          const result = await model.generateContent(prompt);
          response = result.response.text();
          break;

        case 'OPENAI':
          const completion = await this.client.chat.completions.create({
            model: this.model,
            messages: [
              {
                role: 'system',
                content: 'Vous êtes un formateur en cybersécurité créant du contenu pédagogique personnalisé.'
              },
              { role: 'user', content: prompt }
            ],
            temperature: 0.6
          });
          response = completion.choices[0].message.content;
          break;

        case 'CLAUDE':
          const message = await this.client.messages.create({
            model: this.model,
            max_tokens: 3000,
            messages: [{ role: 'user', content: prompt }]
          });
          response = message.content[0].text;
          break;

        case 'OLLAMA':
          response = await this.callOllama(prompt);
          break;
      }

      return this.parseTrainingResponse(response);
    } catch (error) {
      console.error('AI Training Content Error:', error);
      throw new AppError(500, 'Failed to generate training content');
    }
  }

  async generateReportAnalysis(data: any) {
    const prompt = this.buildReportPrompt(data);

    try {
      let response;

      switch (this.provider) {
        case 'GEMINI':
          const model = this.client.getGenerativeModel({ model: this.model });
          const result = await model.generateContent(prompt);
          response = result.response.text();
          break;

        case 'OPENAI':
          const completion = await this.client.chat.completions.create({
            model: this.model,
            messages: [
              {
                role: 'system',
                content: 'Vous êtes un analyste en cybersécurité générant des rapports professionnels.'
              },
              { role: 'user', content: prompt }
            ],
            temperature: 0.5
          });
          response = completion.choices[0].message.content;
          break;

        case 'CLAUDE':
          const message = await this.client.messages.create({
            model: this.model,
            max_tokens: 4000,
            messages: [{ role: 'user', content: prompt }]
          });
          response = message.content[0].text;
          break;

        case 'OLLAMA':
          response = await this.callOllama(prompt);
          break;
      }

      return this.parseReportResponse(response);
    } catch (error) {
      console.error('AI Report Analysis Error:', error);
      throw new AppError(500, 'Failed to generate report analysis');
    }
  }

  private buildTemplatePrompt(params: TemplateGenerationParams): string {
    const { prompt, targetProfiles, campaignName } = params;
    
    return `
Créez un template d'email de phishing éthique pour une campagne de sensibilisation.

Campagne: ${campaignName}
${prompt ? `Instructions spécifiques: ${prompt}` : ''}
Profils cibles: ${JSON.stringify(targetProfiles)}

IMPORTANT: Ceci est pour une formation interne UNIQUEMENT. L'email doit être réaliste mais éthique.

Générez un JSON avec la structure suivante:
{
  "subject": "Sujet de l'email",
  "body": "Corps HTML de l'email",
  "landingPage": "Contenu HTML de la page de destination",
  "personalized": true/false,
  "difficulty": "easy/medium/hard",
  "category": "credentials/attachment/link"
}

Le corps doit inclure:
- Un prétexte crédible adapté au contexte professionnel
- Un appel à l'action (lien ou bouton)
- Des éléments de personnalisation si applicable
- Signature réaliste

La page de destination doit:
- Ressembler à une vraie page (login, formulaire, etc.)
- Inclure un message de formation après soumission
- Tracker les interactions

Répondez UNIQUEMENT avec le JSON, sans texte supplémentaire.
`;
  }

  private buildTrainingPrompt(userProfile: any, campaignResults: any): string {
    return `
Créez un module de formation personnalisé en cybersécurité.

Profil utilisateur:
- Département: ${userProfile.department}
- Rôle: ${userProfile.role}
- Niveau actuel: ${userProfile.securityLevel || 'débutant'}

Résultats de la campagne:
- A cliqué: ${campaignResults.clicked ? 'Oui' : 'Non'}
- A soumis des données: ${campaignResults.submitted ? 'Oui' : 'Non'}
- Lecture rapide détectée: ${campaignResults.fastRead ? 'Oui' : 'Non'}
- Temps de lecture: ${campaignResults.readingTime}s

Générez un JSON avec:
{
  "title": "Titre du module",
  "objectives": ["objectif1", "objectif2"],
  "content": {
    "introduction": "Texte",
    "lessons": [
      {
        "title": "Titre de la leçon",
        "content": "Contenu HTML",
        "keyPoints": ["point1", "point2"]
      }
    ],
    "quiz": [
      {
        "question": "Question",
        "options": ["A", "B", "C", "D"],
        "correct": 0,
        "explanation": "Explication"
      }
    ]
  },
  "duration": "Durée estimée en minutes",
  "reinforcement": ${campaignResults.fastRead},
  "nextSteps": ["action1", "action2"]
}

Adaptez le contenu au niveau et aux erreurs commises.
Répondez UNIQUEMENT avec le JSON.
`;
  }

  private buildReportPrompt(data: any): string {
    return `
Analysez les résultats de cette campagne de phishing et générez un rapport exécutif.

Statistiques de la campagne:
${JSON.stringify(data.stats, null, 2)}

Détails des fast readers:
${JSON.stringify(data.fastReaderDetails, null, 2)}

Générez un JSON avec:
{
  "executiveSummary": "Résumé exécutif (3-4 phrases)",
  "riskAssessment": {
    "level": "low/medium/high/critical",
    "score": 0-100,
    "justification": "Explication"
  },
  "keyFindings": ["finding1", "finding2", "finding3"],
  "vulnerableDepartments": ["dept1", "dept2"],
  "recommendations": [
    {
      "priority": "high/medium/low",
      "action": "Action recommandée",
      "timeline": "Délai suggéré",
      "resources": "Ressources nécessaires"
    }
  ],
  "trainingPlan": {
    "immediate": ["action1", "action2"],
    "shortTerm": ["action3", "action4"],
    "longTerm": ["action5", "action6"]
  },
  "metrics": {
    "complianceScore": 0-100,
    "improvementNeeded": true/false,
    "estimatedTrainingHours": number
  }
}

Basez votre analyse sur les meilleures pratiques en cybersécurité.
Répondez UNIQUEMENT avec le JSON.
`;
  }

  private parseTemplateResponse(response: string): any {
    try {
      // Nettoyer la réponse si elle contient du texte avant/après le JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(response);
    } catch (error) {
      console.error('Failed to parse AI template response:', response);
      // Retourner un template par défaut en cas d'erreur
      return {
        subject: 'Action requise: Mise à jour de sécurité',
body: '<p>Bonjour,</p><p>Une mise à jour de sécurité importante nécessite votre attention.</p><p><a href="{{tracking_link}}">Cliquez ici pour mettre à jour vos informations</a></p>',
        landingPage: '<h2>Connexion sécurisée</h2><form><input type="email" placeholder="Email"><input type="password" placeholder="Mot de passe"><button>Se connecter</button></form>',
        personalized: false,
        difficulty: 'medium',
        category: 'credentials'
      };
    }
  }

  private parseTrainingResponse(response: string): any {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(response);
    } catch (error) {
      console.error('Failed to parse AI training response:', response);
      return this.getDefaultTrainingContent();
    }
  }

  private parseReportResponse(response: string): any {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(response);
    } catch (error) {
      console.error('Failed to parse AI report response:', response);
      return this.getDefaultReportAnalysis();
    }
  }

    private async callOllama(prompt: string): Promise<string> {
    // Implémentation pour Ollama (serveur local)
    const response = await fetch(`${process.env.OLLAMA_URL || 'http://localhost:11434'}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        prompt: prompt,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error('Ollama request failed');
    }

    const data: any = await response.json();
    return data.response;
  }

  private getDefaultTrainingContent(): any {
    return {
      title: 'Formation de sensibilisation au phishing',
      objectives: [
        'Identifier les signes d\'un email de phishing',
        'Comprendre les risques de sécurité',
        'Adopter les bonnes pratiques'
      ],
      content: {
        introduction: 'Cette formation vous aidera à mieux identifier et éviter les tentatives de phishing.',
        lessons: [
          {
            title: 'Reconnaître un email suspect',
            content: '<h3>Points d\'attention</h3><ul><li>Vérifier l\'expéditeur</li><li>Analyser le contenu</li><li>Examiner les liens</li></ul>',
            keyPoints: ['Toujours vérifier l\'adresse email', 'Ne jamais cliquer sur des liens suspects']
          }
        ],
        quiz: [
          {
            question: 'Que faire face à un email suspect?',
            options: ['Cliquer pour vérifier', 'Ignorer et supprimer', 'Signaler au service IT', 'Transférer à un collègue'],
            correct: 2,
            explanation: 'Toujours signaler les emails suspects au service IT pour protéger l\'organisation.'
          }
        ]
      },
      duration: 15,
      reinforcement: false,
      nextSteps: ['Réviser régulièrement', 'Participer aux formations']
    };
  }

  private getDefaultReportAnalysis(): any {
    return {
      executiveSummary: 'La campagne révèle des vulnérabilités significatives nécessitant une action immédiate.',
      riskAssessment: {
        level: 'medium',
        score: 65,
        justification: 'Taux de clic élevé indiquant un manque de vigilance'
      },
      keyFindings: [
        'Manque de sensibilisation générale',
        'Lecture trop rapide des communications',
        'Confiance excessive dans les emails internes'
      ],
      vulnerableDepartments: [],
      recommendations: [
        {
          priority: 'high',
          action: 'Formation immédiate pour tous les employés',
          timeline: '2 semaines',
          resources: 'Formateur externe + plateforme e-learning'
        }
      ],
      trainingPlan: {
        immediate: ['Session de sensibilisation urgente'],
        shortTerm: ['Modules e-learning obligatoires'],
        longTerm: ['Programme de formation continue']
      },
      metrics: {
        complianceScore: 35,
        improvementNeeded: true,
        estimatedTrainingHours: 8
      }
    };
  }
}