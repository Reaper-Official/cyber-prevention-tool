import axios from 'axios';
import { config } from '../config/index.js';

export interface AIContent {
  subject: string;
  body: string;
  trainingContent?: string;
}

export interface AIProvider {
  generate(templateType: string, context: any): Promise<AIContent>;
}

class GeminiProvider implements AIProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generate(templateType: string, context: any): Promise<AIContent> {
    const prompt = this.buildPrompt(templateType, context);

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.apiKey}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
        }
      );

      const text = response.data.candidates[0].content.parts[0].text;
      return this.parseResponse(text);
    } catch (error) {
      console.error('Gemini API error:', error);
      return this.getFallbackContent(templateType);
    }
  }

  private buildPrompt(templateType: string, context: any): string {
    if (templateType === 'phishing_email') {
      return `Generate a realistic phishing simulation email for security training purposes. 
Scenario: ${context.scenario || 'password reset'}
Include:
1. A compelling subject line
2. Email body with urgency tactics
3. Do NOT include actual malicious links

Return in JSON format:
{
  "subject": "...",
  "body": "..."
}`;
    }
    return '';
  }

  private parseResponse(text: string): AIContent {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('Failed to parse AI response');
    }
    return this.getFallbackContent('phishing_email');
  }

  private getFallbackContent(templateType: string): AIContent {
    return {
      subject: 'Action requise - Vérification de votre compte',
      body: `Bonjour,

Nous avons détecté une activité inhabituelle sur votre compte. Pour des raisons de sécurité, veuillez vérifier vos informations dès que possible.

Cliquez ici pour vérifier votre compte: [LIEN]

Si vous n'effectuez pas cette action sous 24 heures, votre compte sera temporairement suspendu.

Cordialement,
L'équipe Sécurité`,
    };
  }
}

class OpenAIProvider implements AIProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generate(templateType: string, context: any): Promise<AIContent> {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a security training assistant generating phishing simulation emails.',
            },
            {
              role: 'user',
              content: `Generate a phishing email for training. Scenario: ${context.scenario}. Return JSON with subject and body.`,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const text = response.data.choices[0].message.content;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('OpenAI API error:', error);
    }

    return new GeminiProvider('').getFallbackContent(templateType);
  }
}

class AnthropicProvider implements AIProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generate(templateType: string, context: any): Promise<AIContent> {
    try {
      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: 'claude-3-sonnet-20240229',
          max_tokens: 1024,
          messages: [
            {
              role: 'user',
              content: `Generate a phishing simulation email for security training. Scenario: ${context.scenario}. Return JSON with subject and body fields.`,
            },
          ],
        },
        {
          headers: {
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
          },
        }
      );

      const text = response.data.content[0].text;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Anthropic API error:', error);
    }

    return new GeminiProvider('').getFallbackContent(templateType);
  }
}

class OllamaProvider implements AIProvider {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:11434') {
    this.baseUrl = baseUrl;
  }

  async generate(templateType: string, context: any): Promise<AIContent> {
    try {
      const response = await axios.post(`${this.baseUrl}/api/generate`, {
        model: 'llama2',
        prompt: `Generate a phishing simulation email for training. Scenario: ${context.scenario}. Return JSON with subject and body.`,
        stream: false,
      });

      const text = response.data.response;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Ollama API error:', error);
    }

    return new GeminiProvider('').getFallbackContent(templateType);
  }
}

export class AIProviderFactory {
  static create(): AIProvider {
    const provider = config.aiProvider;
    const apiKey = config.aiApiKey;

    switch (provider) {
      case 'OPENAI':
        return new OpenAIProvider(apiKey);
      case 'ANTHROPIC':
        return new AnthropicProvider(apiKey);
      case 'OLLAMA':
        return new OllamaProvider();
      case 'GEMINI':
      default:
        return new GeminiProvider(apiKey);
    }
  }
}