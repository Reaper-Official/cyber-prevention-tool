import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { emailTemplates } from './templates-seed.js';

const prisma = new PrismaClient();

const trainingModules = [
  // Module 1 (déjà fourni ci-dessus)
  {
    title: 'Reconnaître un Email de Phishing',
    description: 'Apprenez à identifier les signaux d\'alerte dans vos emails',
    category: 'BASICS',
    difficulty: 'BEGINNER',
    duration: 12,
    minReadingTime: 240,
    points: 10,
    order: 1,
    content: `[contenu du module 1 ci-dessus]`,
    quiz: { /* quiz module 1 */ },
  },

  // Module 2 - URLs
  {
    title: 'Décoder les URLs : Ne Vous Faites Plus Piéger',
    description: 'Apprenez à lire et analyser les adresses web',
    category: 'TECHNICAL',
    difficulty: 'BEGINNER',
    duration: 10,
    minReadingTime: 200,
    points: 15,
    order: 2,
    content: `
      <div class="training">
        <h2>Comprendre les Adresses Web (URLs)</h2>
        <p>Les cybercriminels créent des sites qui ressemblent exactement aux vrais. La seule différence ? L'adresse web (URL). Apprenons à la décoder.</p>

        <h3>Anatomie d'une URL</h3>
        <div class="url-anatomy">
          <div class="url-example">https://www.amazon.fr/mon-compte/commandes</div>
          <div class="url-parts">
            <div class="part">
              <span class="highlight protocol">https://</span>
              <p><strong>Protocole</strong><br>Le "s" = sécurisé</p>
            </div>
            <div class="part">
              <span class="highlight domain">amazon.fr</span>
              <p><strong>Domaine</strong><br>LA PARTIE IMPORTANTE</p>
            </div>
            <div class="part">
              <span class="highlight path">/mon-compte</span>
              <p><strong>Chemin</strong><br>La page</p>
            </div>
          </div>
        </div>

        <div class="golden-rule">
          <p>Le vrai nom de domaine se lit <strong>juste avant la première barre /</strong></p>
          <p>Exemple : dans "www.paypal.com.verify.tk", le vrai domaine est "verify.tk" (pas paypal !)</p>
        </div>

        <h3>Les 5 Pièges à Connaître</h3>

        <div class="trap">
          <h4>1. Le Sous-domaine Trompeur</h4>
          <p class="fake">❌ www.paypal.com.verification.tk</p>
          <p class="explanation">Le vrai domaine : verification.tk</p>
          <p class="real">✅ www.paypal.com</p>
        </div>

        <div class="trap">
          <h4>2. La Lettre Remplacée</h4>
          <p class="fake">❌ www.amaz0n.com (zéro au lieu de O)</p>
          <p class="fake">❌ www.g00gle.com (zéros au lieu de OO)</p>
          <p class="real">✅ www.amazon.com</p>
        </div>

        <div class="trap">
          <h4>3. Le Trait d'Union Ajouté</h4>
          <p class="fake">❌ www.face-book.com</p>
          <p class="real">✅ www.facebook.com</p>
        </div>

        <div class="trap">
          <h4>4. L'Extension Bizarre</h4>
          <p class="fake">❌ www.netflix.tk / .ml / .ga</p>
          <p class="real">✅ www.netflix.com / .fr</p>
          <p class="tip">Les .tk, .ml, .ga sont souvent gratuits et utilisés par les escrocs</p>
        </div>

        <div class="trap">
          <h4>5. L'Adresse IP au Lieu du Nom</h4>
          <p class="fake">❌ http://185.234.52.18/paypal</p>
          <p class="explanation">Les vraies entreprises utilisent des noms, pas des chiffres</p>
        </div>

        <h3>Test Rapide en 3 Secondes</h3>
        <div class="quick-test">
          <div class="step"><span>1</span> Trouvez la première barre /</div>
          <div class="step"><span>2</span> Regardez juste avant</div>
          <div class="step"><span>3</span> C'est le vrai domaine !</div>
        </div>

        <h3>Outils Gratuits</h3>
        <div class="tools">
          <div class="tool">
            <strong>VirusTotal.com</strong>
            <p>Collez l'URL (sans cliquer) pour l'analyser</p>
          </div>
          <div class="tool">
            <strong>URLVoid.com</strong>
            <p>Vérifie la réputation du site</p>
          </div>
        </div>

        <div class="remember">
          <h3>À Retenir</h3>
          <ul>
            <li>Le vrai domaine = juste avant la première /</li>
            <li>Attention aux lettres remplacées</li>
            <li>Méfiez-vous des extensions bizarres</li>
            <li>En cas de doute, tapez l'adresse vous-même</li>
          </ul>
        </div>
      </div>

      <style>
        .training { max-width: 850px; margin: 0 auto; font-family: sans-serif; line-height: 1.7; }
        .url-anatomy { background: #f0f9ff; padding: 25px; border-radius: 10px; margin: 30px 0; }
        .url-example { background: white; padding: 15px; border-radius: 8px; font-family: monospace; font-size: 1.2em; text-align: center; margin-bottom: 20px; border: 2px solid #0ea5e9; }
        .url-parts { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; }
        .part { text-align: center; background: white; padding: 15px; border-radius: 8px; }
        .highlight { display: block; padding: 10px; border-radius: 5px; margin: 10px 0; font-family: monospace; font-weight: bold; }
        .protocol { background: #dbeafe; color: #1e40af; }
        .domain { background: #fef3c7; color: #92400e; border: 3px solid #f59e0b; }
        .path { background: #f3e8ff; color: #6b21a8; }
        .golden-rule { background: linear-gradient(135deg, #fbbf24, #f59e0b); color: white; padding: 25px; border-radius: 10px; margin: 30px 0; text-align: center; font-size: 1.1em; }
        .trap { background: white; border-left: 5px solid #ef4444; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .trap h4 { color: #dc2626; margin-top: 0; }
        .fake { color: #dc2626; font-family: monospace; padding: 10px; background: #fee2e2; border-radius: 5px; margin: 8px 0; display: block; }
        .real { color: #16a34a; font-family: monospace; padding: 10px; background: #dcfce7; border-radius: 5px; margin: 8px 0; display: block; }
        .explanation { background: #fef3c7; padding: 10px; border-radius: 5px; margin: 10px 0; font-style: italic; }
        .tip { background: #dbeafe; padding: 10px; border-radius: 5px; margin: 10px 0; }
        .quick-test { background: #ede9fe; padding: 20px; border-radius: 10px; margin: 30px 0; }
        .quick-test .step { display: flex; align-items: center; margin: 15px 0; padding: 15px; background: white; border-radius: 8px; }
        .quick-test .step span { background: #8b5cf6; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 15px; }
        .tools { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
        .tool { background: white; padding: 20px; border-radius: 8px; border: 2px solid #e5e7eb; }
        .tool strong { color: #0ea5e9; display: block; margin-bottom: 10px; }
        .remember { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 25px; border-radius: 10px; margin: 30px 0; }
        .remember h3 { margin-top: 0; }
        .remember ul { margin: 0; padding-left: 25px; }
        .remember li { margin: 10px 0; }
      </style>
    `,
    quiz: {
      title: 'Quiz : Les URLs',
      passingScore: 60,
      questions: [
        {
          question: 'Dans l\'URL "www.amazon.com.secure-login.tk", quel est le VRAI domaine ?',
          options: ['amazon.com', 'secure-login.tk', 'www.amazon.com.secure-login.tk', 'com.secure-login'],
          correctAnswer: 1,
          explanation: 'Le vrai domaine est toujours juste avant la première /. Ici c\'est "secure-login.tk". Tout ce qui est avant n\'est qu\'un sous-domaine trompeur.',
        },
        {
          question: 'Quelle extension de domaine est la plus suspecte ?',
          options: ['.com', '.fr', '.tk', '.org'],
          correctAnswer: 2,
          explanation: 'Les extensions .tk, .ml, .ga sont souvent gratuites et très utilisées par les cybercriminels. Les .com et .fr sont plus fiables.',
        },
        {
          question: 'Vous voyez "g00gle.com" (avec des zéros). C\'est Google ?',
          options: ['Oui, c\'est juste une variante', 'Non, c\'est un site complètement différent', 'Oui si le site ressemble à Google', 'Ça dépend du contenu'],
          correctAnswer: 1,
          explanation: 'Même si ça ressemble à "google", c\'est un domaine complètement différent. Les cybercriminels comptent sur votre inattention.',
        },
        {
          question: 'Que faire avant de cliquer sur un lien ?',
          options: ['Cliquer rapidement', 'Survoler le lien pour voir l\'URL réelle', 'Vérifier si l\'email a un logo', 'Demander à un ami'],
          correctAnswer: 1,
          explanation: 'Survolez toujours le lien (sans cliquer) pour voir l\'URL réelle affichée en bas de votre navigateur.',
        },
      ],
    },
  },

  // Module 3 - Mots de passe
  {
    title: 'Créer des Mots de Passe Incassables',
    description: 'Protégez vos comptes avec des mots de passe forts et faciles à retenir',
    category: 'BASICS',
    difficulty: 'BEGINNER',
    duration: 8,
    minReadingTime: 180,
    points: 10,
    order: 3,
    content: `
      <div class="training">
        <h2>La Vérité sur les Mots de Passe</h2>

        <div class="intro-fact">
          <p>Un mot de passe de 8 caractères peut être cassé en quelques heures par un ordinateur moderne.</p>
          <p>Un mot de passe de 12 caractères bien construit prendrait des millions d'années.</p>
        </div>

        <h3>Pourquoi "123456" et "password" Ne Suffisent Pas</h3>

        <div class="bad-passwords">
          <h4>Les 10 pires mots de passe (encore utilisés par des millions de personnes) :</h4>
          <ol>
            <li>123456</li>
            <li>password</li>
            <li>123456789</li>
            <li>12345678</li>
            <li>12345</li>
            <li>qwerty</li>
            <li>abc123</li>
            <li>azerty (France)</li>
            <li>motdepasse</li>
            <li>Votre prénom + année de naissance</li>
          </ol>
          <p class="warning">Un pirate met moins de 1 seconde pour les deviner !</p>
        </div>

        <h3>Les 4 Règles d'un Bon Mot de Passe</h3>

        <div class="rules">
          <div class="rule">
            <div class="rule-number">1</div>
            <div class="rule-content">
              <h4>Au moins 12 caractères</h4>
              <p>Plus c'est long, plus c'est solide</p>
              <div class="comparison">
                <p class="weak">Faible (8 car) : Pass1234</p>
                <p class="strong">Fort (14 car) : J'adore2Chats!</p>
              </div>
            </div>
          </div>

          <div class="rule">
            <div class="rule-number">2</div>
            <div class="rule-content">
              <h4>Mélangez tout</h4>
              <p>Majuscules + minuscules + chiffres + symboles</p>
              <div class="comparison">
                <p class="weak">Faible : motdepasse</p>
                <p class="strong">Fort : M0tD3P@ss3!</p>
              </div>
            </div>
          </div>

          <div class="rule">
            <div class="rule-number">3</div>
            <div class="rule-content">
              <h4>Rien de personnel</h4>
              <p>Évitez : prénom, date de naissance, nom de votre chien...</p>
              <div class="why-bad">
                Pourquoi ? Ces infos sont faciles à trouver sur vos réseaux sociaux !
              </div>
            </div>
          </div>

          <div class="rule">
            <div class="rule-number">4</div>
            <div class="rule-content">
              <h4>Un mot de passe différent partout</h4>
              <p>Si un site se fait pirater, les autres restent protégés</p>
            </div>
          </div>
        </div>

        <h3>La Méthode de la Phrase Secrète</h3>

        <div class="method">
          <p>La technique la plus simple pour créer un mot de passe fort ET facile à retenir :</p>
          
          <div class="method-steps">
            <div class="step">
              <strong>Étape 1 :</strong> Choisissez une phrase qui vous parle
              <p class="example">"J'adore manger des pizza le vendredi soir"</p>
            </div>
            
            <div class="step">
              <strong>Étape 2 :</strong> Prenez la première lettre de chaque mot
              <p class="example">JamdplvS</p>
            </div>
            
            <div class="step">
              <strong>Étape 3 :</strong> Ajoutez des chiffres et des symboles
              <p class="example">J@mdplvS2024!</p>
            </div>
            
            <div class="result">
              <strong>Résultat :</strong> Un mot de passe de 12 caractères, complexe, mais vous vous souvenez de la phrase !
              <p class="password-display">J@mdplvS2024!</p>
            </div>
          </div>
        </div>

        <h3>Exemples de Phrases Secrètes</h3>

        <div class="examples">
          <div class="example-item">
            <p class="phrase">"Mon chat Félix a 3 ans et dort tout le temps"</p>
            <p class="arrow">↓</p>
            <p class="password">McFa3aedtlt!</p>
          </div>

          <div class="example-item">
            <p class="phrase">"Je prends 2 cafés chaque matin depuis 2020"</p>
            <p class="arrow">↓</p>
            <p class="password">Jp2ccmd2020#</p>
          </div>

          <div class="example-item">
            <p class="phrase">"Ma série préférée est Breaking Bad saison 5"</p>
            <p class="arrow">↓</p>
            <p class="password">MspeBBs5*</p>
          </div>
        </div>

        <h3>Les Gestionnaires de Mots de Passe</h3>

        <div class="password-managers">
          <p>Trop de comptes à gérer ? Utilisez un gestionnaire de mots de passe !</p>
          
          <div class="managers">
            <div class="manager">
              <h4>Bitwarden (Gratuit)</h4>
              <p>Open source, très sécurisé</p>
            </div>
            <div class="manager">
              <h4>1Password (Payant)</h4>
              <p>Interface simple, parfait pour débutants</p>
            </div>
            <div class="manager">
              <h4>Dashlane (Freemium)</h4>
              <p>Version gratuite pour 50 mots de passe</p>
            </div>
          </div>

          <div class="how-it-works">
            <h4>Comment ça marche ?</h4>
            <ol>
              <li>Vous créez UN mot de passe maître très fort</li>
              <li>Le gestionnaire crée des mots de passe complexes pour tous vos comptes</li>
              <li>Vous n'avez à retenir que le mot de passe maître</li>
              <li>Le gestionnaire remplit automatiquement vos identifiants</li>
            </ol>
          </div>
        </div>

        <h3>La Double Authentification (2FA)</h3>

        <div class="two-factor">
          <p>Ajoutez une deuxième barrière de sécurité : même si quelqu'un vole votre mot de passe, il ne pourra pas se connecter sans le deuxième code.</p>
          
          <div class="two-factor-types">
            <div class="type">
              <h4>SMS</h4>
              <p>Vous recevez un code par SMS</p>
              <p class="rating">Sécurité : ⭐⭐⭐</p>
            </div>
            <div class="type">
              <h4>Application</h4>
              <p>Google Authenticator, Authy...</p>
              <p class="rating">Sécurité : ⭐⭐⭐⭐⭐</p>
            </div>
            <div class="type">
              <h4>Clé Physique</h4>
              <p>Yubikey, clé USB...</p>
              <p class="rating">Sécurité : ⭐⭐⭐⭐⭐</p>
            </div>
          </div>

          <p class="tip">Activez la 2FA au minimum sur : email, banque, réseaux sociaux</p>
        </div>

        <h3>Que Faire si Votre Mot de Passe a Été Volé ?</h3>

        <div class="emergency">
          <div class="emergency-step">
            <span>1</span>
            <p>Changez immédiatement le mot de passe du compte compromis</p>
          </div>
          <div class="emergency-step">
            <span>2</span>
            <p>Changez le mot de passe de tous les comptes utilisant le même mot de passe</p>
          </div>
          <div class="emergency-step">
            <span>3</span>
            <p>Vérifiez l'activité récente de vos comptes</p>
          </div>
          <div class="emergency-step">
            <span>4</span>
            <p>Activez la double authentification partout où c'est possible</p>
          </div>
        </div>

        <h3>Vérifiez si Vous Avez Été Piraté</h3>

        <div class="check-breach">
          <p>Le site <strong>HaveIBeenPwned.com</strong> vous permet de vérifier gratuitement si votre email a été compromis dans une fuite de données.</p>
          <p class="how">Comment ? Entrez votre email, le site vous dira si vos données ont fuité et sur quels sites.</p>
        </div>

        <div class="remember">
          <h3>Checklist Mot de Passe Sécurisé</h3>
          <ul>
            <li>☐ Au moins 12 caractères</li>
            <li>☐ Mélange de majuscules, minuscules, chiffres, symboles</li>
            <li>☐ Pas d'infos personnelles</li>
            <li>☐ Un mot de passe différent par site</li>
            <li>☐ Utilisez la méthode de la phrase secrète</li>
            <li>☐ Envisagez un gestionnaire de mots de passe</li>
            <li>☐ Activez la 2FA partout</li>
          </ul>
        </div>
      </div>

      <style>
        .training { max-width: 850px; margin: 0 auto; font-family: sans-serif; line-height: 1.7; }
        .intro-fact { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 25px; border-radius: 10px; margin: 30px 0; text-align: center; font-size: 1.1em; }
        .bad-passwords { background: #fee2e2; border-left: 5px solid #dc2626; padding: 20px; border-radius: 8px; margin: 30px 0; }
        .bad-passwords h4 { color: #dc2626; margin-top: 0; }
        .bad-passwords .warning { background: #7f1d1d; color: white; padding: 15px; border-radius: 5px; margin-top: 15px; text-align: center; font-weight: bold; }
        .rules { margin: 30px 0; }
        .rule { display: flex; align-items: start; background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .rule-number { background: #0ea5e9; color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5em; font-weight: bold; flex-shrink: 0; margin-right: 20px; }
        .rule-content h4 { margin-top: 0; color: #0ea5e9; }
        .comparison { margin: 15px 0; }
        .weak { background: #fee2e2; color: #dc2626; padding: 10px; border-radius: 5px; margin: 5px 0; font-family: monospace; }
        .strong { background: #dcfce7; color: #16a34a; padding: 10px; border-radius: 5px; margin: 5px 0; font-family: monospace; font-weight: bold; }
        .why-bad { background: #fef3c7; padding: 12px; border-radius: 5px; margin-top: 10px; font-style: italic; }
        .method { background: #f0f9ff; padding: 25px; border-radius: 10px; margin: 30px 0; }
        .method-steps { margin: 20px 0; }
        .step { background: white; padding: 15px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #0ea5e9; }
        .step strong { color: #0ea5e9; display: block; margin-bottom: 8px; }
        .example { font-family: monospace; background: #f9fafb; padding: 10px; border-radius: 5px; margin-top: 10px; }
        .result { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 20px; border-radius: 8px; margin-top: 20px; text-align: center; }
        .password-display { font-family: monospace; font-size: 1.5em; font-weight: bold; margin-top: 15px; letter-spacing: 3px; }
        .examples { margin: 30px 0; }
        .example-item { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center; }
        .phrase { color: #6b7280; font-style: italic; }
        .arrow { font-size: 2em; color: #0ea5e9; margin: 10px 0; }
        .password { font-family: monospace; font-size: 1.3em; font-weight: bold; color: #10b981; background: #dcfce7; padding: 10px; border-radius: 5px; }
        .password-managers { background: #ede9fe; padding: 25px; border-radius: 10px; margin: 30px 0; }
        .managers { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
        .manager { background: white; padding: 20px; border-radius: 8px; text-align: center; }
        .manager h4 { color: #8b5cf6; margin-top: 0; }
        .how-it-works { background: white; padding: 20px; border-radius: 8px; margin-top: 20px; }
        .two-factor { margin: 30px 0; }
        .two-factor-types { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
        .type { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center; }
        .type h4 { color: #0ea5e9; margin-top: 0; }
        .rating { margin-top: 10px; font-size: 1.2em; }
        .tip { background: #dbeafe; padding: 15px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #0ea5e9; }
        .emergency { background: #fef3c7; padding: 25px; border-radius: 10px; margin: 30px 0; }
        .emergency-step { display: flex; align-items: start; margin: 15px 0; padding: 15px; background: white; border-radius: 8px; }
        .emergency-step span { background: #f59e0b; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0; margin-right: 15px; }
        .check-breach { background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #0ea5e9; }
        .check-breach strong { color: #0284c7; }
        .how { margin-top: 15px; font-style: italic; color: #64748b; }
        .remember { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 25px; border-radius: 10px; margin: 30px 0; }
        .remember h3 { margin-top: 0; }
        .remember ul { list-style: none; margin: 0; padding: 0; }
        .remember li { margin: 12px 0; font-size: 1.05em; }
      </style>
    `,
    quiz: {
      title: 'Quiz : Mots de Passe',
      passingScore: 70,
      questions: [
        {
          question: 'Quelle longueur minimum pour un mot de passe sécurisé ?',
          options: ['6 caractères', '8 caractères', '12 caractères', '20 caractères'],
          correctAnswer: 2,
          explanation: '12 caractères est le minimum recommandé aujourd\'hui. Plus c\'est long, plus c\'est difficile à casser.',
        },
        {
          question: 'Quel mot de passe est le plus fort ?',
          options: ['Password123', 'Jean1985', 'J@dm3Ch@ts!', 'azerty'],
          correctAnswer: 2,
          explanation: 'J@dm3Ch@ts! mélange majuscules, minuscules, chiffres et symboles, sans être une information personnelle évidente.',
        },
        {question: 'Quel mot de passe est le plus fort ?',
          options: ['Password123', 'Jean1985', 'J@dm3Ch@ts!', 'azerty'],
          correctAnswer: 2,
          explanation: 'J@dm3Ch@ts! mélange majuscules, minuscules, chiffres et symboles, sans être une information personnelle évidente.',
        },
        {
          question: 'Pourquoi ne faut-il PAS utiliser le même mot de passe partout ?',
          options: [
            'C\'est trop facile à retenir',
            'Si un site se fait pirater, tous vos comptes sont compromis',
            'Les sites ne l\'acceptent pas',
            'C\'est moins sécurisé pour vos emails',
          ],
          correctAnswer: 1,
          explanation: 'Si vous utilisez le même mot de passe partout et qu\'un site se fait pirater, les hackers essaieront ce mot de passe sur tous vos autres comptes.',
        },
        {
          question: 'La double authentification (2FA), c\'est quoi ?',
          options: [
            'Deux mots de passe différents',
            'Un mot de passe + un code temporaire',
            'Se connecter deux fois',
            'Avoir deux comptes',
          ],
          correctAnswer: 1,
          explanation: 'La 2FA ajoute une deuxième barrière : même si quelqu\'un vole votre mot de passe, il lui faut aussi le code temporaire (SMS, app...) pour se connecter.',
        },
        {
          question: 'Quelle phrase secrète donnerait le mot de passe le plus fort ?',
          options: [
            'Jean Dupont 1985',
            'J\'adore manger des pizzas le vendredi',
            'password',
            'Mon chien s\'appelle Max',
          ],
          correctAnswer: 1,
          explanation: 'Une phrase longue et personnelle (mais pas évidente) crée un mot de passe fort. Vous retiendrez "JamdplV2024!" car vous connaissez la phrase.',
        },
      ],
    },
  },

  // Module 4 - Réseaux sociaux
  {
    title: 'Protéger Votre Vie Privée sur les Réseaux Sociaux',
    description: 'Ce que vous partagez en dit long sur vous - apprenez à vous protéger',
    category: 'AWARENESS',
    difficulty: 'BEGINNER',
    duration: 10,
    minReadingTime: 200,
    points: 10,
    order: 4,
    content: `
      <div class="training">
        <h2>Vos Réseaux Sociaux = Mine d'Or pour les Hackers</h2>

        <div class="intro-warning">
          <p>Saviez-vous que 80% des pirates utilisent les réseaux sociaux pour préparer leurs attaques ?</p>
          <p>Chaque photo, chaque statut, chaque check-in donne des indices sur vous.</p>
        </div>

        <h3>Ce Que les Hackers Cherchent sur Vos Profils</h3>

        <div class="info-grid">
          <div class="info-card danger">
            <h4>🎂 Date de Naissance</h4>
            <p>Utilisée dans 60% des mots de passe</p>
            <p class="example">"Jean1985", "Marie2490"</p>
          </div>

          <div class="info-card danger">
            <h4>🐕 Nom de Votre Animal</h4>
            <p>Question secrète très courante</p>
            <p class="example">"Rex", "Minou"</p>
          </div>

          <div class="info-card danger">
            <h4>🏠 Votre Adresse</h4>
            <p>Check-ins, photos devant chez vous</p>
            <p class="example">Cambriolages quand vous êtes en vacances</p>
          </div>

          <div class="info-card danger">
            <h4>👨‍👩‍👧 Noms de Famille</h4>
            <p>Nom de jeune fille de la mère</p>
            <p class="example">Question de sécurité classique</p>
          </div>

          <div class="info-card danger">
            <h4>🎓 Votre École/Entreprise</h4>
            <p>Pour du phishing ciblé</p>
            <p class="example">"Bonjour, je suis de votre entreprise..."</p>
          </div>

          <div class="info-card danger">
            <h4>✈️ Vos Vacances</h4>
            <p>Maison vide = cible facile</p>
            <p class="example">Posts en temps réel dangereux</p>
          </div>
        </div>

        <h3>Cas Réel : Comment un Profil Public a Conduit à un Piratage</h3>

        <div class="real-case">
          <div class="case-story">
            <p><strong>Marie, 34 ans, partage sur Facebook :</strong></p>
            <ul>
              <li>Photo avec son chien "Bella" (visible publiquement)</li>
              <li>Date de naissance complète sur son profil</li>
              <li>Poste "En vacances à Barcelone !" avec photo d'avion</li>
              <li>Travaille chez "Entreprise X" (indiqué dans son profil)</li>
            </ul>

            <div class="hacker-process">
              <h4>Le hacker collecte ces infos et :</h4>
              <ol>
                <li>Essaie "Bella1990" comme mot de passe (date de naissance + nom du chien)</li>
                <li>Ça fonctionne sur son email !</li>
                <li>Demande une réinitialisation de mot de passe sur tous ses comptes</li>
                <li>Répond à la question secrète : "Nom de votre animal ? Bella"</li>
                <li>Accède à sa banque en ligne, Amazon, Netflix...</li>
              </ol>
            </div>

            <div class="lesson">
              <strong>Résultat :</strong> 3000€ volés, identité usurpée, 6 mois pour tout récupérer.
            </div>
          </div>
        </div>

        <h3>Les 7 Règles de Sécurité sur les Réseaux Sociaux</h3>

        <div class="security-rules">
          <div class="rule-item">
            <div class="rule-icon">🔒</div>
            <div class="rule-text">
              <h4>1. Profil Privé par Défaut</h4>
              <p><strong>Facebook :</strong> Paramètres → Confidentialité → "Amis uniquement"</p>
              <p><strong>Instagram :</strong> Paramètres → Confidentialité → Compte privé</p>
              <p><strong>Twitter/X :</strong> Paramètres → Confidentialité → Protéger vos tweets</p>
            </div>
          </div>

          <div class="rule-item">
            <div class="rule-icon">👤</div>
            <div class="rule-text">
              <h4>2. Limitez les Informations Personnelles</h4>
              <p>Ne partagez PAS publiquement :</p>
              <ul>
                <li>Date de naissance complète</li>
                <li>Adresse précise</li>
                <li>Numéro de téléphone</li>
                <li>Numéro de plaque d'immatriculation</li>
                <li>Photos de cartes d'identité/bancaires</li>
              </ul>
            </div>
          </div>

          <div class="rule-item">
            <div class="rule-icon">📸</div>
            <div class="rule-text">
              <h4>3. Attention aux Photos</h4>
              <p>Vérifiez avant de poster :</p>
              <ul>
                <li>Pas d'adresse visible (boîte aux lettres, plaque de rue)</li>
                <li>Pas de codes/mots de passe visibles en arrière-plan</li>
                <li>Pas de badges professionnels</li>
                <li>Pas de clés de voiture/maison</li>
              </ul>
            </div>
          </div>

          <div class="rule-item">
            <div class="rule-icon">✈️</div>
            <div class="rule-text">
              <h4>4. Vacances : Postez APRÈS</h4>
              <p class="bad-idea">❌ "Partir 2 semaines aux Maldives demain !"</p>
              <p class="good-idea">✅ "Super séjour aux Maldives" (après votre retour)</p>
            </div>
          </div>

          <div class="rule-item">
            <div class="rule-icon">👥</div>
            <div class="rule-text">
              <h4>5. Triez Vos Amis</h4>
              <p>Acceptez-vous vraiment cette personne que vous avez rencontrée 5 minutes en soirée ?</p>
              <p><strong>Conseil :</strong> Faites un grand ménage tous les 6 mois</p>
            </div>
          </div>

          <div class="rule-item">
            <div class="rule-icon">🎯</div>
            <div class="rule-text">
              <h4>6. Désactivez la Géolocalisation</h4>
              <p>Ne laissez pas vos photos révéler où vous habitez</p>
              <p><strong>iPhone :</strong> Réglages → Confidentialité → Services de localisation → Appareil photo → Jamais</p>
              <p><strong>Android :</strong> Paramètres → Applications → Appareil photo → Autorisations → Position → Refuser</p>
            </div>
          </div>

          <div class="rule-item">
            <div class="rule-icon">🎲</div>
            <div class="rule-text">
              <h4>7. Méfiez-vous des Quiz et Jeux</h4>
              <p class="quiz-trap">"Quel était le nom de votre premier animal ? Commentez !"</p>
              <p>C'est une question de sécurité courante ! Ne répondez JAMAIS à ces posts.</p>
            </div>
          </div>
        </div>

        <h3>Vérifier Vos Paramètres de Confidentialité</h3>

        <div class="privacy-check">
          <h4>Checklist Facebook</h4>
          <ul>
            <li>☐ Qui peut voir vos publications futures ? → Amis</li>
            <li>☐ Qui peut voir votre liste d'amis ? → Moi uniquement</li>
            <li>☐ Qui peut vous rechercher avec votre email/téléphone ? → Amis</li>
            <li>☐ Les moteurs de recherche peuvent-ils montrer votre profil ? → Non</li>
            <li>☐ Revue de toutes les publications anciennes → Mettre en "Amis"</li>
          </ul>

          <h4>Checklist Instagram</h4>
          <ul>
            <li>☐ Compte privé activé</li>
            <li>☐ Masquer votre story aux non-abonnés</li>
            <li>☐ Ne pas afficher le statut d'activité</li>
            <li>☐ Limiter qui peut vous identifier</li>
            <li>☐ Désactiver le partage automatique vers Facebook</li>
          </ul>

          <h4>Checklist LinkedIn</h4>
          <ul>
            <li>☐ Masquer votre email</li>
            <li>☐ Masquer votre numéro de téléphone</li>
            <li>☐ Limiter qui peut voir vos relations</li>
            <li>☐ Ne pas afficher quand vous êtes en ligne</li>
          </ul>
        </div>

        <h3>Le Piège des "Amis d'Amis"</h3>

        <div class="friend-trap">
          <p>Vous acceptez quelqu'un parce que vous avez 15 amis en commun ?</p>
          <p class="warning-box">ATTENTION : Les hackers créent de faux profils en copiant vos amis pour gagner votre confiance.</p>
          
          <h4>Vérifications avant d'accepter :</h4>
          <ul>
            <li>Le profil est-il récent ? (moins de 6 mois = suspect)</li>
            <li>Y a-t-il peu de contenu/photos ?</li>
            <li>Les photos semblent-elles volées ? (recherche Google image)</li>
            <li>Connaissez-vous vraiment cette personne ?</li>
          </ul>
        </div>

        <h3>Que Faire si Vous Êtes Victime d'Usurpation d'Identité ?</h3>

        <div class="identity-theft">
          <h4>Actions immédiates :</h4>
          <div class="action-steps">
            <div class="action">
              <span>1</span>
              <p>Signalez le faux profil à la plateforme</p>
            </div>
            <div class="action">
              <span>2</span>
              <p>Prévenez vos amis via un autre canal (SMS, appel)</p>
            </div>
            <div class="action">
              <span>3</span>
              <p>Changez tous vos mots de passe</p>
            </div>
            <div class="action">
              <span>4</span>
              <p>Activez la double authentification</p>
            </div>
            <div class="action">
              <span>5</span>
              <p>Déposez plainte si nécessaire (commissariat ou en ligne)</p>
            </div>
          </div>
        </div>

        <div class="remember">
          <h3>À Retenir</h3>
          <ul>
            <li>Profil privé par défaut sur tous les réseaux</li>
            <li>Évitez de partager infos personnelles publiquement</li>
            <li>Postez vos vacances APRÈS votre retour</li>
            <li>Désactivez la géolocalisation sur vos photos</li>
            <li>Méfiez-vous des quiz qui posent des questions de sécurité</li>
            <li>Faites le ménage dans vos amis régulièrement</li>
            <li>Vérifiez vos paramètres de confidentialité tous les 6 mois</li>
          </ul>
        </div>
      </div>

      <style>
        .training { max-width: 850px; margin: 0 auto; font-family: sans-serif; line-height: 1.7; }
        .intro-warning { background: linear-gradient(135deg, #dc2626, #991b1b); color: white; padding: 25px; border-radius: 10px; margin: 30px 0; text-align: center; }
        .intro-warning p { font-size: 1.1em; margin: 10px 0; }
        .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 30px 0; }
        .info-card { padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .info-card.danger { background: #fee2e2; border-left: 5px solid #dc2626; }
        .info-card h4 { color: #dc2626; margin-top: 0; }
        .info-card .example { background: white; padding: 10px; border-radius: 5px; margin-top: 10px; font-size: 0.9em; color: #6b7280; }
        .real-case { background: #fef3c7; padding: 25px; border-radius: 10px; margin: 30px 0; border-left: 5px solid #f59e0b; }
        .case-story { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .hacker-process { background: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .hacker-process h4 { color: #dc2626; margin-top: 0; }
        .lesson { background: #7f1d1d; color: white; padding: 15px; border-radius: 8px; text-align: center; font-size: 1.1em; font-weight: bold; }
        .security-rules { margin: 30px 0; }
        .rule-item { display: flex; align-items: start; background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .rule-icon { font-size: 2.5em; margin-right: 20px; flex-shrink: 0; }
        .rule-text h4 { color: #0ea5e9; margin-top: 0; }
        .rule-text ul { margin: 10px 0; padding-left: 20px; }
        .bad-idea { background: #fee2e2; color: #dc2626; padding: 10px; border-radius: 5px; margin: 10px 0; }
        .good-idea { background: #dcfce7; color: #16a34a; padding: 10px; border-radius: 5px; margin: 10px 0; }
        .quiz-trap { background: #fee2e2; color: #dc2626; padding: 15px; border-radius: 8px; margin: 10px 0; font-weight: bold; text-align: center; }
        .privacy-check { background: #f0f9ff; padding: 25px; border-radius: 10px; margin: 30px 0; }
        .privacy-check h4 { color: #0284c7; margin-top: 20px; }
        .privacy-check ul { list-style: none; padding: 0; }
        .privacy-check li { padding: 10px; background: white; margin: 8px 0; border-radius: 5px; }
        .friend-trap { background: #fef3c7; padding: 25px; border-radius: 10px; margin: 30px 0; border-left: 5px solid #f59e0b; }
        .warning-box { background: #dc2626; color: white; padding: 15px; border-radius: 8px; margin: 15px 0; font-weight: bold; text-align: center; }
        .identity-theft { margin: 30px 0; }
        .action-steps { display: grid; gap: 15px; margin: 20px 0; }
        .action { display: flex; align-items: center; background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .action span { background: #ef4444; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 15px; flex-shrink: 0; }
        .remember { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 25px; border-radius: 10px; margin: 30px 0; }
        .remember h3 { margin-top: 0; }
        .remember ul { margin: 0; padding-left: 25px; }
        .remember li { margin: 10px 0; }
      </style>
    `,
    quiz: {
      title: 'Quiz : Réseaux Sociaux',
      passingScore: 60,
      questions: [
        {
          question: 'Quand devriez-vous poster vos photos de vacances ?',
          options: [
            'Avant de partir pour montrer votre excitation',
            'En temps réel pendant le voyage',
            'Après votre retour à la maison',
            'Peu importe le moment',
          ],
          correctAnswer: 2,
          explanation: 'Poster pendant vos vacances annonce publiquement que votre maison est vide. Attendez votre retour pour partager vos photos.',
        },
        {
          question: 'Que révèle un post "Quel était le nom de votre premier animal ?" ?',
          options: [
            'Rien de dangereux',
            'Une question de sécurité bancaire courante',
            'Juste un jeu amusant',
            'Votre amour des animaux',
          ],
          correctAnswer: 1,
          explanation: 'C\'est une question secrète très utilisée par les banques et services en ligne. Ne répondez jamais à ces "jeux" sur les réseaux sociaux.',
        },
        {
          question: 'Pourquoi désactiver la géolocalisation sur vos photos ?',
          options: [
            'Pour économiser la batterie',
            'Pour empêcher qu\'on sache où vous habitez/vous trouvez',
            'C\'est inutile',
            'Pour avoir de meilleures photos',
          ],
          correctAnswer: 1,
          explanation: 'Les métadonnées des photos contiennent votre position GPS exacte. Un étranger pourrait savoir où vous habitez en analysant vos photos.',
        },
        {
          question: 'Quel paramètre de confidentialité Facebook est le plus sûr ?',
          options: [
            'Public',
            'Amis d\'amis',
            'Amis uniquement',
            'Personnalisé',
          ],
          correctAnswer: 2,
          explanation: '"Amis uniquement" limite votre contenu aux personnes que vous avez acceptées. C\'est le réglage le plus sûr pour vos publications.',
        },
      ],
    },
  },

  // Module 5 - WiFi public
  {
    title: 'Les Dangers du WiFi Public',
    description: 'Comment vous connecter en toute sécurité aux réseaux WiFi gratuits',
    category: 'TECHNICAL',
    difficulty: 'INTERMEDIATE',
    duration: 8,
    minReadingTime: 180,
    points: 15,
    order: 5,
    content: `
      <div class="training">
        <h2>WiFi Gratuit = Danger Gratuit ?</h2>

        <div class="intro-scenario">
          <p>Vous êtes au café. Vous vous connectez au WiFi gratuit. Vous consultez votre banque.</p>
          <p><strong>À la table d'à côté, quelqu'un voit TOUT ce que vous faites.</strong></p>
          <p>Bienvenue dans le monde du WiFi public non sécurisé.</p>
        </div>

        <h3>Qu'est-ce qu'un Réseau WiFi Public ?</h3>

        <div class="wifi-types">
          <div class="wifi-type dangerous">
            <h4>❌ WiFi Dangereux</h4>
            <ul>
              <li>Pas de mot de passe</li>
              <li>Nom générique ("WiFi gratuit", "Free WiFi")</li>
              <li>Dans un lieu public (gare, aéroport, café...)</li>
            </ul>
          </div>

          <div class="wifi-type safe">
            <h4>✅ WiFi Sûr</h4>
            <ul>
              <li>Mot de passe requis</li>
              <li>Nom officiel de l'établissement</li>
              <li>Chez vous ou au travail</li>
            </ul>
          </div>
        </div>

        <h3>Les 3 Attaques Principales</h3>

        <div class="attack">
          <h4>1. L'Homme du Milieu (Man-in-the-Middle)</h4>
          <div class="attack-explain">
            <p>Le hacker intercepte tout ce qui transite entre vous et Internet :</p>
            <div class="schema">
              <div class="schema-item">VOUS</div>
              <div class="arrow">→</div>
              <div class="schema-item hacker">HACKER</div>
              <div class="arrow">→</div>
              <div class="schema-item">INTERNET</div>
            </div>
            <p class="consequence">Il voit vos mots de passe, emails, messages...</p>
          </div>
        </div>

        <div class="attack">
          <h4>2. Le Faux Point d'Accès (Evil Twin)</h4>
          <div class="attack-explain">
            <p>Le hacker crée un faux WiFi avec un nom identique au vrai :</p>
            <div class="comparison-wifi">
              <p class="real-wifi">WiFi du Café : "Starbucks_WiFi"</p>
              <p class="fake-wifi">Faux WiFi du hacker : "Starbucks_WiFi"</p>
            </div>
            <p class="consequence">Vous vous connectez au faux, il contrôle tout votre trafic.</p>
          </div>
        </div>

        <div class="attack">
          <h4>3. Le Reniflage de Données (Sniffing)</h4>
          <div class="attack-explain">
            <p>Le hacker utilise un logiciel qui "écoute" tout le réseau WiFi :</p>
            <ul>
              <li>Vos identifiants de connexion</li>
              <li>Les sites que vous visitez</li>
              <li>Vos messages non chiffrés</li>
              <li>Vos fichiers téléchargés</li>
            </ul>
          </div>
        </div>

        <h3>Cas Réel : Piraté à l'Aéroport</h3>

        <div class="real-story">
          <div class="story-content">
            <p><strong>Marc, consultant, aéroport Charles de Gaulle :</strong></p>
            <p>En attente de vol, se connecte au WiFi "CDG_Free_WiFi"</p>
            <p>Consulte ses emails professionnels</p>
            <p>Se connecte à son compte bancaire</p>
            <p>Achète un billet d'avion pour sa prochaine mission</p>
            
            <div class="story-result">
              <p><strong>48h plus tard :</strong></p>
              <ul>
                <li>Son compte email pro est piraté</li>
                <li>3 virements de 1000€ depuis sa banque</li>
                <li>Ses données de carte bancaire vendues sur le dark web</li>
              </ul>
              <p class="cost"><strong>Coût total : 5000€ + usurpation d'identité</strong></p>
            </div>

            <div class="what-happened">
              <p><strong>Ce qui s'est passé :</strong> "CDG_Free_WiFi" était un faux réseau créé par un hacker. Tout le trafic de Marc passait par l'ordinateur du pirate.</p>
            </div>
          </div>
        </div>

        <h3>Les 8 Règles d'Or du WiFi Public</h3>

        <div class="golden-rules">
          <div class="golden-rule">
            <span class="rule-num">1</span>
            <div class="rule-content">
              <h4>Évitez Complètement si Possible</h4>
              <p>Utilisez votre forfait 4G/5G plutôt que le WiFi public</p>
              <p class="tip">💡 Activez le partage de connexion depuis votre téléphone</p>
            </div>
          </div>

          <div class="golden-rule">
            <span class="rule-num">2</span>
            <div class="rule-content">
              <h4>Vérifiez le Nom du Réseau</h4>
              <p>Demandez au personnel le nom exact du WiFi officiel</p>
              <p class="danger">⚠️ "Free WiFi", "WiFi gratuit" = très suspect</p>
            </div>
          </div>

          <div class="golden-rule">
            <span class="rule-num">3</span>
            <div class="rule-content">
              <h4>HTTPS Obligatoire</h4>
              <p>Vérifiez que l'URL commence par <span class="https">https://</span> (avec le cadenas 🔒)</p>
              <p class="danger">Ne vous connectez JAMAIS sur un site en HTTP sur WiFi public</p>
            </div>
          </div>

          <div class="golden-rule">
            <span class="rule-num">4</span>
            <div class="rule-content">
              <h4>Pas de Banque/Achats</h4>
              <p>N'accédez jamais à :</p>
              <ul>
                <li>Votre banque en ligne</li>
                <li>Sites de paiement (Amazon, etc.)</li>
                <li>Comptes avec carte bancaire enregistrée</li>
              </ul>
            </div>
          </div>

          <div class="golden-rule">
            <span class="rule-num">5</span>
            <div class="rule-content">
              <h4>Utilisez un VPN</h4>
              <p>Un VPN (Virtual Private Network) chiffre tout votre trafic</p>
              <p class="vpn-reco">VPN recommandés : NordVPN, ExpressVPN, ProtonVPN (gratuit)</p>
            </div>
          </div>

<div class="golden-rule">
            <span class="rule-num">6</span>
            <div class="rule-content">
              <h4>Désactivez le Partage</h4>
              <p><strong>Windows :</strong> Panneau de configuration → Réseau → Désactiver la découverte</p>
              <p><strong>Mac :</strong> Préférences → Partage → Tout décocher</p>
              <p><strong>Téléphone :</strong> AirDrop sur "Personne" / Bluetooth désactivé</p>
            </div>
          </div>

          <div class="golden-rule">
            <span class="rule-num">7</span>
            <div class="rule-content">
              <h4>"Oublier ce Réseau" Après Usage</h4>
              <p>Ne laissez pas votre appareil se reconnecter automatiquement</p>
              <p class="how-to">Paramètres WiFi → Clic sur le réseau → Oublier</p>
            </div>
          </div>

          <div class="golden-rule">
            <span class="rule-num">8</span>
            <div class="rule-content">
              <h4>Pare-feu Activé</h4>
              <p>Vérifiez que votre pare-feu est actif</p>
              <p><strong>Windows :</strong> Windows Defender</p>
              <p><strong>Mac :</strong> Sécurité et confidentialité → Pare-feu</p>
            </div>
          </div>
        </div>

        <h3>Le VPN Expliqué Simplement</h3>

        <div class="vpn-explain">
          <div class="without-vpn">
            <h4>Sans VPN (Dangereux)</h4>
            <div class="connection-schema">
              <span class="device">Votre appareil</span>
              <span class="arrow-red">→</span>
              <span class="wifi-danger">WiFi Public</span>
              <span class="arrow-red">→</span>
              <span class="internet">Internet</span>
            </div>
            <p class="risk">Le hacker voit tout en clair</p>
          </div>

          <div class="with-vpn">
            <h4>Avec VPN (Sécurisé)</h4>
            <div class="connection-schema">
              <span class="device">Votre appareil</span>
              <span class="arrow-green">→ CHIFFRÉ →</span>
              <span class="vpn-box">Serveur VPN</span>
              <span class="arrow-green">→</span>
              <span class="internet">Internet</span>
            </div>
            <p class="secure">Le hacker ne voit que du charabia chiffré</p>
          </div>

          <div class="vpn-options">
            <h4>VPN Gratuits et Fiables</h4>
            <div class="vpn-choice">
              <strong>ProtonVPN</strong>
              <p>Gratuit, illimité, sans pub</p>
              <p class="limit">Limite : vitesse réduite</p>
            </div>
            <div class="vpn-choice">
              <strong>Windscribe</strong>
              <p>10 GB/mois gratuit</p>
              <p class="limit">Suffisant pour usage occasionnel</p>
            </div>
          </div>
        </div>

        <h3>Checklist Avant de Vous Connecter</h3>

        <div class="checklist">
          <h4>Questions à vous poser :</h4>
          <div class="check-item">
            <input type="checkbox" disabled>
            <span>Puis-je utiliser ma 4G au lieu du WiFi ?</span>
          </div>
          <div class="check-item">
            <input type="checkbox" disabled>
            <span>Ai-je vraiment besoin d'Internet maintenant ?</span>
          </div>
          <div class="check-item">
            <input type="checkbox" disabled>
            <span>Le nom du réseau est-il celui de l'établissement ?</span>
          </div>
          <div class="check-item">
            <input type="checkbox" disabled>
            <span>Mon VPN est-il activé ?</span>
          </div>
          <div class="check-item">
            <input type="checkbox" disabled>
            <span>Vais-je éviter banque/achats/mots de passe ?</span>
          </div>
        </div>

        <h3>Que Faire Si Vous Pensez Avoir Été Piraté</h3>

        <div class="emergency-wifi">
          <div class="emergency-action">
            <span>1</span>
            <p><strong>Déconnectez-vous immédiatement</strong> du WiFi</p>
          </div>
          <div class="emergency-action">
            <span>2</span>
            <p><strong>Passez en 4G</strong> et changez tous vos mots de passe</p>
          </div>
          <div class="emergency-action">
            <span>3</span>
            <p><strong>Surveillez vos comptes bancaires</strong> pendant 1 mois</p>
          </div>
          <div class="emergency-action">
            <span>4</span>
            <p><strong>Activez la double authentification</strong> partout</p>
          </div>
          <div class="emergency-action">
            <span>5</span>
            <p><strong>Vérifiez sur HaveIBeenPwned.com</strong> si vos données ont fuité</p>
          </div>
        </div>

        <div class="remember">
          <h3>À Retenir</h3>
          <ul>
            <li>WiFi public = risque élevé de piratage</li>
            <li>Privilégiez toujours votre 4G/5G</li>
            <li>JAMAIS de banque ou d'achats sur WiFi public</li>
            <li>Utilisez un VPN pour chiffrer votre connexion</li>
            <li>Vérifiez toujours le nom officiel du réseau</li>
            <li>HTTPS obligatoire (cadenas dans l'URL)</li>
            <li>Oubliez le réseau après utilisation</li>
          </ul>
        </div>
      </div>

      <style>
        .training { max-width: 850px; margin: 0 auto; font-family: sans-serif; line-height: 1.7; color: #1f2937; }
        .intro-scenario { background: linear-gradient(135deg, #dc2626, #991b1b); color: white; padding: 30px; border-radius: 10px; margin: 30px 0; text-align: center; font-size: 1.1em; }
        .intro-scenario strong { font-size: 1.3em; display: block; margin: 15px 0; }
        .wifi-types { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 30px 0; }
        .wifi-type { padding: 20px; border-radius: 8px; }
        .wifi-type.dangerous { background: #fee2e2; border: 3px solid #dc2626; }
        .wifi-type.safe { background: #dcfce7; border: 3px solid #16a34a; }
        .wifi-type h4 { margin-top: 0; }
        .attack { background: white; border-left: 5px solid #ef4444; padding: 25px; margin: 25px 0; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .attack h4 { color: #dc2626; margin-top: 0; font-size: 1.2em; }
        .attack-explain { background: #fef3c7; padding: 20px; border-radius: 8px; margin-top: 15px; }
        .schema { display: flex; align-items: center; justify-content: center; gap: 10px; margin: 20px 0; flex-wrap: wrap; }
        .schema-item { background: #3b82f6; color: white; padding: 15px 20px; border-radius: 8px; font-weight: bold; }
        .schema-item.hacker { background: #dc2626; animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        .arrow { font-size: 2em; color: #dc2626; }
        .consequence { background: #fee2e2; padding: 15px; border-radius: 5px; margin-top: 15px; font-weight: bold; text-align: center; }
        .comparison-wifi { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .real-wifi { background: #dcfce7; color: #166534; padding: 10px; border-radius: 5px; margin: 5px 0; font-family: monospace; }
        .fake-wifi { background: #fee2e2; color: #dc2626; padding: 10px; border-radius: 5px; margin: 5px 0; font-family: monospace; font-weight: bold; }
        .real-story { background: #fef3c7; padding: 25px; border-radius: 10px; margin: 30px 0; border-left: 5px solid #f59e0b; }
        .story-content { background: white; padding: 20px; border-radius: 8px; }
        .story-result { background: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .story-result ul { margin: 10px 0; }
        .cost { background: #7f1d1d; color: white; padding: 15px; border-radius: 5px; margin-top: 15px; text-align: center; font-size: 1.1em; }
        .what-happened { background: #dbeafe; padding: 15px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #3b82f6; }
        .golden-rules { margin: 30px 0; }
        .golden-rule { display: flex; align-items: start; background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .rule-num { background: linear-gradient(135deg, #fbbf24, #f59e0b); color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5em; font-weight: bold; flex-shrink: 0; margin-right: 20px; }
        .rule-content h4 { color: #f59e0b; margin-top: 0; }
        .tip { background: #dbeafe; padding: 10px; border-radius: 5px; margin-top: 10px; }
        .danger { background: #fee2e2; color: #dc2626; padding: 10px; border-radius: 5px; margin-top: 10px; font-weight: bold; }
        .https { background: #dcfce7; color: #166534; padding: 3px 8px; border-radius: 4px; font-family: monospace; font-weight: bold; }
        .vpn-reco { background: #f0f9ff; padding: 10px; border-radius: 5px; margin-top: 10px; border-left: 3px solid #0ea5e9; }
        .vpn-explain { background: #f3f4f6; padding: 25px; border-radius: 10px; margin: 30px 0; }
        .without-vpn, .with-vpn { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; }
        .without-vpn h4 { color: #dc2626; }
        .with-vpn h4 { color: #16a34a; }
        .connection-schema { display: flex; align-items: center; justify-content: center; gap: 10px; margin: 20px 0; flex-wrap: wrap; font-size: 0.9em; }
        .device, .wifi-danger, .wifi-safe, .vpn-box, .internet { padding: 10px 15px; border-radius: 5px; font-weight: bold; }
        .device { background: #e0e7ff; color: #4338ca; }
        .wifi-danger { background: #fee2e2; color: #dc2626; }
        .vpn-box { background: #dcfce7; color: #166534; }
        .internet { background: #dbeafe; color: #0284c7; }
        .arrow-red { color: #dc2626; font-weight: bold; }
        .arrow-green { color: #16a34a; font-weight: bold; }
        .risk { background: #fee2e2; color: #dc2626; padding: 10px; border-radius: 5px; text-align: center; font-weight: bold; }
        .secure { background: #dcfce7; color: #166534; padding: 10px; border-radius: 5px; text-align: center; font-weight: bold; }
        .vpn-options { margin-top: 25px; }
        .vpn-choice { background: #f0f9ff; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #0ea5e9; }
        .vpn-choice strong { color: #0284c7; display: block; font-size: 1.1em; margin-bottom: 5px; }
        .limit { font-size: 0.9em; color: #6b7280; font-style: italic; margin-top: 5px; }
        .checklist { background: #ede9fe; padding: 25px; border-radius: 10px; margin: 30px 0; }
        .checklist h4 { color: #7c3aed; margin-top: 0; }
        .check-item { display: flex; align-items: center; background: white; padding: 15px; margin: 10px 0; border-radius: 8px; }
        .check-item input { margin-right: 15px; width: 20px; height: 20px; }
        .emergency-wifi { background: #fef3c7; padding: 25px; border-radius: 10px; margin: 30px 0; }
        .emergency-action { display: flex; align-items: start; background: white; padding: 15px; margin: 15px 0; border-radius: 8px; }
        .emergency-action span { background: #f59e0b; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0; margin-right: 15px; }
        .remember { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 25px; border-radius: 10px; margin: 30px 0; }
        .remember h3 { margin-top: 0; }
        .remember ul { margin: 0; padding-left: 25px; }
        .remember li { margin: 10px 0; }
      </style>
    `,
    quiz: {
      title: 'Quiz : WiFi Public',
      passingScore: 70,
      questions: [
        {
          question: 'Quelle est l\'alternative la plus sûre au WiFi public ?',
          options: ['Se connecter sans mot de passe', 'Utiliser sa connexion 4G/5G', 'Utiliser un réseau avec mot de passe', 'Éteindre le WiFi'],
          correctAnswer: 1,
          explanation: 'Votre connexion mobile (4G/5G) est personnelle et chiffrée. C\'est toujours plus sûr qu\'un WiFi public.',
        },
        {
          question: 'Que signifie "HTTPS" dans une URL ?',
          options: ['Hypertext Transfer Protocol Secure - connexion chiffrée', 'High Technology Protection System', 'HTTP version Suisse', 'Rien de particulier'],
          correctAnswer: 0,
          explanation: 'Le "S" de HTTPS signifie "Secure" (sécurisé). Cela indique que la connexion est chiffrée entre vous et le site.',
        },
        {
          question: 'Qu\'est-ce qu\'un VPN ?',
          options: ['Un antivirus', 'Un tunnel chiffré qui protège votre connexion', 'Un type de WiFi', 'Un navigateur sécurisé'],
          correctAnswer: 1,
          explanation: 'Un VPN (Virtual Private Network) crée un tunnel chiffré entre votre appareil et Internet, rendant vos données illisibles pour les hackers.',
        },
        {
          question: 'Pourquoi ne faut-il jamais consulter sa banque sur WiFi public ?',
          options: ['C\'est trop lent', 'Un hacker peut intercepter vos identifiants', 'C\'est interdit', 'La banque ne fonctionne pas sur WiFi public'],
          correctAnswer: 1,
          explanation: 'Sur un WiFi public non sécurisé, un hacker peut intercepter vos identifiants bancaires et vos mots de passe.',
        },
      ],
    },
  },

  // Module 6 - Télétravail sécurisé
  {
    title: 'Télétravail Sécurisé : Protéger les Données de l\'Entreprise',
    description: 'Les bonnes pratiques pour travailler à distance en toute sécurité',
    category: 'AWARENESS',
    difficulty: 'INTERMEDIATE',
    duration: 10,
    minReadingTime: 200,
    points: 15,
    order: 6,
    content: `
      <div class="training">
        <h2>Télétravailler Sans Mettre l'Entreprise en Danger</h2>

        <div class="intro-stats">
          <p>Depuis le COVID, le télétravail a explosé.</p>
          <p><strong>70% des attaques informatiques ciblent maintenant les télétravailleurs.</strong></p>
          <p>Pourquoi ? Parce que votre domicile est moins sécurisé que le bureau.</p>
        </div>

        <h3>Les 7 Erreurs Fatales du Télétravailleur</h3>

        <div class="mistakes">
          <div class="mistake">
            <div class="mistake-icon">1</div>
            <div class="mistake-content">
              <h4>Travailler au Café sur WiFi Public</h4>
              <div class="why-bad-tele">
                <p><strong>Le risque :</strong> Quelqu'un intercepte vos données confidentielles</p>
                <p><strong>La solution :</strong> VPN obligatoire ou utilisez votre 4G</p>
              </div>
            </div>
          </div>

          <div class="mistake">
            <div class="mistake-icon">2</div>
            <div class="mistake-content">
              <h4>Laisser l'Ordinateur Pro Sans Surveillance</h4>
              <div class="why-bad-tele">
                <p><strong>Le risque :</strong> Vol physique ou accès par une personne non autorisée</p>
                <p><strong>La solution :</strong> Verrouillez TOUJOURS (Windows+L ou Ctrl+Cmd+Q sur Mac)</p>
              </div>
            </div>
          </div>

          <div class="mistake">
            <div class="mistake-icon">3</div>
            <div class="mistake-content">
              <h4>Parler de Dossiers Confidentiels en Public</h4>
              <div class="why-bad-tele">
                <p><strong>Le risque :</strong> Espionnage industriel, fuite d'informations</p>
                <p><strong>La solution :</strong> Téléphonez depuis un espace privé</p>
              </div>
            </div>
          </div>

          <div class="mistake">
            <div class="mistake-icon">4</div>
            <div class="mistake-content">
              <h4>Utiliser l'Ordinateur Pro pour un Usage Personnel</h4>
              <div class="why-bad-tele">
                <p><strong>Le risque :</strong> Télécharger un virus sur un site perso</p>
                <p><strong>La solution :</strong> Utilisez votre ordi personnel pour Netflix/réseaux sociaux</p>
              </div>
            </div>
          </div>

          <div class="mistake">
            <div class="mistake-icon">5</div>
            <div class="mistake-content">
              <h4>Partager des Fichiers par Gmail Personnel</h4>
              <div class="why-bad-tele">
                <p><strong>Le risque :</strong> Fuite de données, perte de contrôle sur les documents</p>
                <p><strong>La solution :</strong> Utilisez les outils officiels (OneDrive, Google Drive pro, etc.)</p>
              </div>
            </div>
          </div>

          <div class="mistake">
            <div class="mistake-icon">6</div>
            <div class="mistake-content">
              <h4>Laisser la Famille Utiliser l'Ordi Pro</h4>
              <div class="why-bad-tele">
                <p><strong>Le risque :</strong> Enfants qui téléchargent des jeux infectés</p>
                <p><strong>La solution :</strong> Ordinateur pro = usage professionnel UNIQUEMENT</p>
              </div>
            </div>
          </div>

          <div class="mistake">
            <div class="mistake-icon">7</div>
            <div class="mistake-content">
              <h4>Imprimer des Documents Confidentiels à la Maison</h4>
              <div class="why-bad-tele">
                <p><strong>Le risque :</strong> Oubli, vol, poubelle non sécurisée</p>
                <p><strong>La solution :</strong> Évitez d'imprimer ou détruisez immédiatement</p>
              </div>
            </div>
          </div>
        </div>

        <h3>La Checklist du Télétravailleur Sécurisé</h3>

        <div class="tele-checklist">
          <div class="checklist-section">
            <h4>Avant de Commencer</h4>
            <div class="check-box">☐ WiFi maison sécurisé (mot de passe WPA3 ou WPA2)</div>
            <div class="check-box">☐ Antivirus à jour sur l'ordinateur</div>
            <div class="check-box">☐ VPN d'entreprise connecté</div>
            <div class="check-box">☐ Espace de travail isolé (pas dans un lieu de passage)</div>
          </div>

          <div class="checklist-section">
            <h4>Pendant le Travail</h4>
            <div class="check-box">☐ Écran pas visible depuis l'extérieur (fenêtre/porte)</div>
            <div class="check-box">☐ Verrouiller l'ordinateur à chaque pause</div>
            <div class="check-box">☐ Appels confidentiels dans une pièce fermée</div>
            <div class="check-box">☐ Webcam couverte quand non utilisée</div>
          </div>

          <div class="checklist-section">
            <h4>Fin de Journée</h4>
            <div class="check-box">☐ Documents rangés hors de vue</div>
            <div class="check-box">☐ Ordinateur éteint (pas juste en veille)</div>
            <div class="check-box">☐ Documents imprimés détruits si confidentiels</div>
            <div class="check-box">☐ Déconnexion des outils professionnels</div>
          </div>
        </div>

        <h3>Sécuriser Votre WiFi Maison</h3>

        <div class="wifi-home">
          <p>Votre WiFi maison = porte d'entrée vers les données de l'entreprise</p>
          
          <div class="wifi-steps">
            <div class="wifi-step">
              <h4>Étape 1 : Changez le Mot de Passe Par Défaut</h4>
              <p>Le mot de passe de votre box ("admin", "password") est connu de tous</p>
              <p class="how-to-wifi">Connectez-vous à l'interface de votre box (généralement 192.168.1.1) → Sécurité → Changer mot de passe</p>
            </div>

            <div class="wifi-step">
              <h4>Étape 2 : Utilisez WPA3 ou au Minimum WPA2</h4>
              <p>WEP et WPA sont obsolètes et cassables en quelques minutes</p>
              <p class="how-to-wifi">Interface box → WiFi → Sécurité → Choisir WPA3 (ou WPA2 si WPA3 indisponible)</p>
            </div>

            <div class="wifi-step">
              <h4>Étape 3 : Créez un Réseau Invité</h4>
              <p>Pour vos amis/famille : ne donnez PAS le mot de passe de votre WiFi principal</p>
              <p class="how-to-wifi">Interface box → Réseau invité → Activer</p>
            </div>

            <div class="wifi-step">
              <h4>Étape 4 : Mettez à Jour le Firmware</h4>
              <p>Les mises à jour corrigent les failles de sécurité</p>
              <p class="how-to-wifi">Interface box → Administration → Mise à jour</p>
            </div>
          </div>
        </div>

        <h3>Visioconférence Sécurisée</h3>

        <div class="visio-security">
          <div class="visio-rule">
            <h4>Avant la Réunion</h4>
            <ul>
              <li>Vérifiez ce qui est visible derrière vous (pas de documents confidentiels au mur)</li>
              <li>Fermez les applications/onglets non nécessaires</li>
              <li>Couvrez votre webcam quand elle n'est pas utilisée</li>
            </ul>
          </div>

          <div class="visio-rule">
            <h4>Pendant la Réunion</h4>
            <ul>
              <li>Utilisez un arrière-plan flou si disponible</li>
              <li>Ne partagez que la fenêtre nécessaire (pas tout l'écran)</li>
              <li>Coupez le micro quand vous ne parlez pas</li>
              <li>Vérifiez que personne n'écoute derrière vous</li>
            </ul>
          </div>

          <div class="visio-rule">
            <h4>Sécurité des Liens</h4>
            <ul>
              <li>Utilisez un mot de passe pour les réunions sensibles</li>
              <li>Activez la salle d'attente</li>
              <li>Ne partagez pas les liens de réunion publiquement</li>
            </ul>
          </div>
        </div>

        <h3>Que Faire en Cas d'Incident ?</h3>

        <div class="incident-response">
          <div class="incident-scenario">
            <h4>Scénario 1 : Ordinateur Volé</h4>
            <div class="action-immediate">
              <strong>Action immédiate :</strong>
              <ol>
                <li>Contactez IMMÉDIATEMENT votre service IT</li>
                <li>Changez tous vos mots de passe depuis un autre appareil</li>
                <li>Déposez plainte au commissariat</li>
                <li>Informez votre manager</li>
              </ol>
            </div>
          </div>

          <div class="incident-scenario">
            <h4>Scénario 2 : Clic sur un Lien Suspect</h4>
            <div class="action-immediate">
              <strong>Action immédiate :</strong>
              <ol>
                <li>Déconnectez-vous d'Internet</li>
                <li>Prévenez votre service IT</li>
                <li>Ne supprimez rien (pour l'analyse)</li>
                <li>Changez vos mots de passe depuis un autre appareil</li>
              </ol>
            </div>
          </div>

          <div class="incident-scenario">
            <h4>Scénario 3 : Fuite de Données Accidentelle</h4>
            <div class="action-immediate">
              <strong>Action immédiate :</strong>
              <ol>
                <li>Informez votre manager ET le service IT</li>
                <li>Documentez ce qui s'est passé</li>
                <li>Ne tentez pas de "réparer" seul</li>
                <li>Suivez la procédure d'incident de l'entreprise</li>
              </ol>
            </div>
          </div>
        </div>

        <div class="remember">
          <h3>Les 10 Commandements du Télétravailleur</h3>
          <ol>
            <li>Le VPN d'entreprise tu utiliseras</li>
            <li>Ton WiFi maison tu sécuriseras</li>
            <li>Ton écran tu verrouilleras</li>
            <li>Sur WiFi public jamais tu ne travailleras</li>
            <li>Les données pros tu ne mélangeras pas avec le perso</li>
            <li>Ta famille sur l'ordi pro tu ne laisseras pas</li>
            <li>Les appels confidentiels dans un lieu privé tu passeras</li>
            <li>Les documents sensibles tu détruiras</li>
            <li>En cas de doute le service IT tu contacteras</li>
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