export const trainingModulesData = [
  {
    title: 'Reconnaître un Email de Phishing',
    description: 'Les signaux d\'alerte pour détecter les emails malveillants',
    category: 'BASICS',
    difficulty: 'BEGINNER',
    duration: 12,
    minReadingTime: 240,
    points: 10,
    order: 1,
    content: `
      <div style="max-width: 800px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #1e40af;">Comment Reconnaître un Faux Email</h2>
        
        <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Le phishing</strong> est une technique où des criminels se font passer pour quelqu'un de confiance (votre banque, Amazon, etc.) pour voler vos informations.</p>
        </div>

        <h3 style="color: #0ea5e9;">Les 7 Signaux d'Alerte</h3>

        <div style="background: white; border-left: 5px solid #f59e0b; padding: 20px; margin: 15px 0; border-radius: 5px;">
          <h4 style="color: #ea580c; margin-top: 0;">1. L'Adresse Email Bizarre</h4>
          <p>Cliquez sur le nom de l'expéditeur pour voir l'adresse complète :</p>
          <p style="background: #fee2e2; padding: 10px; border-radius: 5px; font-family: monospace;">❌ service-paypal@secure-verify.xyz</p>
          <p style="background: #dcfce7; padding: 10px; border-radius: 5px; font-family: monospace;">✅ service@paypal.com</p>
        </div>

        <div style="background: white; border-left: 5px solid #f59e0b; padding: 20px; margin: 15px 0; border-radius: 5px;">
          <h4 style="color: #ea580c; margin-top: 0;">2. L'Urgence Excessive</h4>
          <p>Phrases typiques :</p>
          <ul>
            <li>"Votre compte sera fermé dans 24h"</li>
            <li>"Action IMMÉDIATE requise"</li>
            <li>"Dernière chance"</li>
          </ul>
          <p style="background: #fef3c7; padding: 10px; border-radius: 5px;"><strong>Pourquoi ?</strong> Pour vous empêcher de réfléchir calmement.</p>
        </div>

        <div style="background: white; border-left: 5px solid #f59e0b; padding: 20px; margin: 15px 0; border-radius: 5px;">
          <h4 style="color: #ea580c; margin-top: 0;">3. Les Fautes d'Orthographe</h4>
          <p>Les grandes entreprises relisent leurs emails. Si vous voyez "Nous avont detecté" ou "Votre facture à regler", c'est louche !</p>
        </div>

        <div style="background: white; border-left: 5px solid #f59e0b; padding: 20px; margin: 15px 0; border-radius: 5px;">
          <h4 style="color: #ea580c; margin-top: 0;">4. Demande d'Informations Sensibles</h4>
          <p><strong>Une vraie entreprise ne vous demandera JAMAIS par email :</strong></p>
          <ul>
            <li>Votre mot de passe</li>
            <li>Votre numéro de carte bancaire complet</li>
            <li>Votre code PIN</li>
            <li>Vos codes de sécurité</li>
          </ul>
        </div>

        <div style="background: white; border-left: 5px solid #f59e0b; padding: 20px; margin: 15px 0; border-radius: 5px;">
          <h4 style="color: #ea580c; margin-top: 0;">5. Le Lien Suspect</h4>
          <p><strong>Test simple :</strong> Survolez le lien avec votre souris (sans cliquer). L'adresse qui s'affiche en bas correspond-elle au texte ?</p>
          <p style="background: #dbeafe; padding: 10px; border-radius: 5px;">💡 <strong>Astuce :</strong> Si le lien dit "paypal.com" mais mène vers "paypa1-secure.tk", c'est du phishing !</p>
        </div>

        <div style="background: white; border-left: 5px solid #f59e0b; padding: 20px; margin: 15px 0; border-radius: 5px;">
          <h4 style="color: #ea580c; margin-top: 0;">6. Salutation Générique</h4>
          <p style="background: #fee2e2; padding: 10px; border-radius: 5px;">❌ "Cher client"</p>
          <p style="background: #dcfce7; padding: 10px; border-radius: 5px;">✅ "Bonjour Jean Dupont"</p>
        </div>

        <div style="background: white; border-left: 5px solid #f59e0b; padding: 20px; margin: 15px 0; border-radius: 5px;">
          <h4 style="color: #ea580c; margin-top: 0;">7. Pièce Jointe Inattendue</h4>
          <p>Méfiez-vous des fichiers .exe, .zip, .doc avec macros</p>
        </div>

        <h3 style="color: #0ea5e9;">Que Faire en Cas de Doute ?</h3>

        <div style="background: linear-gradient(135deg, #0ea5e9, #0284c7); color: white; padding: 25px; border-radius: 10px; margin: 30px 0;">
          <div style="display: flex; align-items: center; margin: 15px 0;">
            <div style="background: white; color: #0284c7; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 15px; flex-shrink: 0;">1</div>
            <div><strong>STOP</strong> - Ne cliquez sur rien</div>
          </div>
          <div style="display: flex; align-items: center; margin: 15px 0;">
            <div style="background: white; color: #0284c7; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 15px; flex-shrink: 0;">2</div>
            <div><strong>VÉRIFIER</strong> - Allez directement sur le site officiel</div>
          </div>
          <div style="display: flex; align-items: center; margin: 15px 0;">
            <div style="background: white; color: #0284c7; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 15px; flex-shrink: 0;">3</div>
            <div><strong>CONTACTER</strong> - Appelez le service client</div>
          </div>
          <div style="display: flex; align-items: center; margin: 15px 0;">
            <div style="background: white; color: #0284c7; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 15px; flex-shrink: 0;">4</div>
            <div><strong>SIGNALER</strong> - Transférez l'email suspect</div>
          </div>
        </div>

        <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 25px; border-radius: 10px; margin: 30px 0;">
          <h3 style="margin-top: 0;">À Retenir</h3>
          <ul style="margin: 0; padding-left: 25px;">
            <li>Vérifiez toujours l'adresse email complète</li>
            <li>Survolez les liens avant de cliquer</li>
            <li>Aucune entreprise ne demande votre mot de passe par email</li>
            <li>En cas de doute, vérifiez par vous-même</li>
          </ul>
        </div>
      </div>
    `,
    quiz: {
      title: 'Quiz : Reconnaître le Phishing',
      passingScore: 60,
      questions: [
        {
          question: 'Comment vérifier si un lien est dangereux AVANT de cliquer ?',
          options: [
            'Cliquer dessus rapidement',
            'Survoler le lien avec la souris et lire l\'URL en bas du navigateur',
            'Regarder si le lien est en bleu',
            'Vérifier si l\'email a un logo',
          ],
          correctAnswer: 1,
          explanation: 'En survolant un lien sans cliquer, votre navigateur affiche l\'URL réelle en bas de la fenêtre.',
        },
        {
          question: 'Un email dit "Votre compte sera fermé dans 24h". C\'est quel type de technique ?',
          options: [
            'Une vraie urgence',
            'Une urgence artificielle pour vous faire paniquer',
            'Un service client normal',
            'Un rappel amical',
          ],
          correctAnswer: 1,
          explanation: 'Les cybercriminels créent une fausse urgence pour vous empêcher de réfléchir calmement.',
        },
        {
          question: 'Que faire en premier si vous recevez un email suspect ?',
          options: [
            'Cliquer pour en savoir plus',
            'Ne rien faire et vérifier par vous-même sur le site officiel',
            'Répondre à l\'email',
            'Le transférer à vos amis',
          ],
          correctAnswer: 1,
          explanation: 'Ne cliquez jamais. Allez directement sur le site officiel ou appelez le service client.',
        },
      ],
    },
  },

  {
    title: 'Créer des Mots de Passe Sécurisés',
    description: 'Protégez vos comptes avec des mots de passe forts',
    category: 'BASICS',
    difficulty: 'BEGINNER',
    duration: 10,
    minReadingTime: 200,
    points: 10,
    order: 2,
    content: `
      <div style="max-width: 800px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #1e40af;">La Vérité sur les Mots de Passe</h2>

        <div style="background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 25px; border-radius: 10px; text-align: center; margin: 30px 0;">
          <p style="font-size: 1.1em;">Un mot de passe de 8 caractères = cassé en quelques heures</p>
          <p style="font-size: 1.3em; font-weight: bold; margin: 15px 0;">Un mot de passe de 12 caractères bien construit = des millions d'années</p>
        </div>

        <h3 style="color: #0ea5e9;">Les 10 Pires Mots de Passe (encore utilisés !)</h3>

        <div style="background: #fee2e2; border-left: 5px solid #dc2626; padding: 20px; border-radius: 8px;">
          <ol>
            <li>123456</li>
            <li>password</li>
            <li>123456789</li>
            <li>azerty</li>
            <li>motdepasse</li>
          </ol>
          <p style="background: #7f1d1d; color: white; padding: 15px; border-radius: 5px; text-align: center; font-weight: bold;">Un pirate met moins de 1 seconde pour les deviner !</p>
        </div>

        <h3 style="color: #0ea5e9;">Les 4 Règles d'un Bon Mot de Passe</h3>

        <div style="display: flex; align-items: start; background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <div style="background: #0ea5e9; color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5em; font-weight: bold; flex-shrink: 0; margin-right: 20px;">1</div>
          <div>
            <h4 style="color: #0ea5e9; margin-top: 0;">Au moins 12 caractères</h4>
            <p style="background: #fee2e2; padding: 10px; border-radius: 5px; font-family: monospace;">❌ Pass1234</p>
            <p style="background: #dcfce7; padding: 10px; border-radius: 5px; font-family: monospace;">✅ J'adore2Chats!</p>
          </div>
        </div>

        <div style="display: flex; align-items: start; background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <div style="background: #0ea5e9; color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5em; font-weight: bold; flex-shrink: 0; margin-right: 20px;">2</div>
          <div>
            <h4 style="color: #0ea5e9; margin-top: 0;">Mélangez tout</h4>
            <p>Majuscules + minuscules + chiffres + symboles</p>
            <p style="background: #dcfce7; padding: 10px; border-radius: 5px; font-family: monospace;">✅ M0tD3P@ss3!</p>
          </div>
        </div>

        <div style="display: flex; align-items: start; background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <div style="background: #0ea5e9; color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5em; font-weight: bold; flex-shrink: 0; margin-right: 20px;">3</div>
          <div>
            <h4 style="color: #0ea5e9; margin-top: 0;">Rien de personnel</h4>
            <p>Évitez : prénom, date de naissance, nom de votre chien</p>
            <p style="background: #fef3c7; padding: 10px; border-radius: 5px;">Ces infos sont faciles à trouver sur vos réseaux sociaux !</p>
          </div>
        </div>

        <div style="display: flex; align-items: start; background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <div style="background: #0ea5e9; color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5em; font-weight: bold; flex-shrink: 0; margin-right: 20px;">4</div>
          <div>
            <h4 style="color: #0ea5e9; margin-top: 0;">Un mot de passe différent partout</h4>
            <p>Si un site se fait pirater, les autres restent protégés</p>
          </div>
        </div>

        <h3 style="color: #0ea5e9;">La Méthode de la Phrase Secrète</h3>

        <div style="background: #f0f9ff; padding: 25px; border-radius: 10px; margin: 30px 0;">
          <p><strong>La technique la plus simple :</strong></p>
          
          <div style="background: white; padding: 15px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #0ea5e9;">
            <strong>Étape 1 :</strong> Choisissez une phrase
            <p style="font-family: monospace; background: #f9fafb; padding: 10px; border-radius: 5px; margin-top: 10px;">"J'adore manger des pizzas le vendredi soir"</p>
          </div>

          <div style="background: white; padding: 15px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #0ea5e9;">
            <strong>Étape 2 :</strong> Prenez la première lettre de chaque mot
            <p style="font-family: monospace; background: #f9fafb; padding: 10px; border-radius: 5px; margin-top: 10px;">JamdplvS</p>
          </div>

          <div style="background: white; padding: 15px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #0ea5e9;">
            <strong>Étape 3 :</strong> Ajoutez des chiffres et symboles
            <p style="font-family: monospace; background: #f9fafb; padding: 10px; border-radius: 5px; margin-top: 10px;">J@mdplvS2024!</p>
          </div>

          <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 20px; border-radius: 8px; text-align: center;">
            <strong>Résultat :</strong> 12 caractères, complexe, mais vous vous souvenez de la phrase !
            <p style="font-family: monospace; font-size: 1.5em; font-weight: bold; margin-top: 15px; letter-spacing: 3px;">J@mdplvS2024!</p>
          </div>
        </div>

        <h3 style="color: #0ea5e9;">La Double Authentification (2FA)</h3>

        <div style="background: #ede9fe; padding: 25px; border-radius: 10px; margin: 30px 0;">
          <p>Ajoutez une deuxième barrière : même si quelqu'un vole votre mot de passe, il ne pourra pas se connecter sans le deuxième code.</p>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0;">
            <div style="background: white; padding: 20px; border-radius: 8px; text-align: center;">
              <h4 style="color: #8b5cf6; margin-top: 0;">SMS</h4>
              <p>Code par SMS</p>
              <p>Sécurité : ⭐⭐⭐</p>
            </div>
            <div style="background: white; padding: 20px; border-radius: 8px; text-align: center;">
              <h4 style="color: #8b5cf6; margin-top: 0;">Application</h4>
              <p>Google Authenticator</p>
              <p>Sécurité : ⭐⭐⭐⭐⭐</p>
            </div>
          </div>

          <p style="background: #dbeafe; padding: 15px; border-radius: 8px; border-left: 4px solid #0ea5e9;">Activez la 2FA au minimum sur : email, banque, réseaux sociaux</p>
        </div>

        <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 25px; border-radius: 10px; margin: 30px 0;">
          <h3 style="margin-top: 0;">Checklist Mot de Passe Sécurisé</h3>
          <ul style="list-style: none; margin: 0; padding: 0;">
            <li>☐ Au moins 12 caractères</li>
            <li>☐ Mélange majuscules, minuscules, chiffres, symboles</li>
            <li>☐ Pas d'infos personnelles</li>
            <li>☐ Un mot de passe différent par site</li>
            <li>☐ Méthode de la phrase secrète</li>
            <li>☐ Double authentification activée</li>
          </ul>
        </div>
      </div>
    `,
    quiz: {
      title: 'Quiz : Mots de Passe',
      passingScore: 70,
      questions: [
        {
          question: 'Quelle longueur minimum pour un mot de passe sécurisé ?',
          options: ['6 caractères', '8 caractères', '12 caractères', '20 caractères'],
          correctAnswer: 2,
          explanation: '12 caractères est le minimum recommandé. Plus c\'est long, plus c\'est difficile à casser.',
        },
        {
          question: 'Pourquoi ne faut-il PAS utiliser le même mot de passe partout ?',
          options: [
            'C\'est trop facile à retenir',
            'Si un site se fait pirater, tous vos comptes sont compromis',
            'Les sites ne l\'acceptent pas',
            'C\'est moins sécurisé',
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
          explanation: 'La 2FA ajoute un code temporaire (SMS, app...) en plus de votre mot de passe pour se connecter.',
        },
      ],
    },
  },

  {
    title: 'Sécuriser Vos Réseaux Sociaux',
    description: 'Protégez votre vie privée sur Facebook, Instagram, LinkedIn',
    category: 'AWARENESS',
    difficulty: 'BEGINNER',
    duration: 10,
    minReadingTime: 200,
    points: 10,
    order: 3,
    content: `
      <div style="max-width: 800px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #1e40af;">Vos Réseaux Sociaux = Mine d'Or pour les Hackers</h2>

        <div style="background: linear-gradient(135deg, #dc2626, #991b1b); color: white; padding: 25px; border-radius: 10px; text-align: center; margin: 30px 0;">
          <p style="font-size: 1.1em;">80% des pirates utilisent les réseaux sociaux pour préparer leurs attaques</p>
          <p>Chaque photo, chaque statut donne des indices sur vous</p>
        </div>

        <h3 style="color: #0ea5e9;">Ce Que les Hackers Cherchent</h3>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 30px 0;">
          <div style="background: #fee2e2; padding: 20px; border-radius: 8px; border-left: 5px solid #dc2626;">
            <h4 style="color: #dc2626; margin-top: 0;">Date de Naissance</h4>
            <p>Utilisée dans 60% des mots de passe</p>
            <p style="font-family: monospace; background: white; padding: 8px; border-radius: 5px;">"Jean1985", "Marie2490"</p>
          </div>

          <div style="background: #fee2e2; padding: 20px; border-radius: 8px; border-left: 5px solid #dc2626;">
            <h4 style="color: #dc2626; margin-top: 0;">Nom de Votre Animal</h4>
            <p>Question secrète très courante</p>
            <p style="font-family: monospace; background: white; padding: 8px; border-radius: 5px;">"Rex", "Minou"</p>
          </div>

          <div style="background: #fee2e2; padding: 20px; border-radius: 8px; border-left: 5px solid #dc2626;">
            <h4 style="color: #dc2626; margin-top: 0;">Vos Vacances</h4>
            <p>Maison vide = cible facile</p>
            <p style="font-family: monospace; background: white; padding: 8px; border-radius: 5px;">Posts en temps réel dangereux</p>
          </div>
        </div>

        <h3 style="color: #0ea5e9;">Les 7 Règles de Sécurité</h3>

        <div style="display: flex; align-items: start; background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <div style="font-size: 2.5em; margin-right: 20px;">🔒</div>
          <div>
            <h4 style="color: #0ea5e9; margin-top: 0;">1. Profil Privé par Défaut</h4>
            <p><strong>Facebook :</strong> Paramètres → Confidentialité → "Amis uniquement"</p>
            <p><strong>Instagram :</strong> Paramètres → Compte privé</p>
          </div>
        </div>

        <div style="display: flex; align-items: start; background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <div style="font-size: 2.5em; margin-right: 20px;">👤</div>
          <div>
            <h4 style="color: #0ea5e9; margin-top: 0;">2. Limitez les Infos Personnelles</h4>
            <p>Ne partagez PAS publiquement :</p>
            <ul>
              <li>Date de naissance complète</li>
              <li>Adresse précise</li>
              <li>Numéro de téléphone</li>
              <li>Photos de cartes d'identité/bancaires</li>
            </ul>
          </div>
        </div>

        <div style="display: flex; align-items: start; background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <div style="font-size: 2.5em; margin-right: 20px;">✈️</div>
          <div>
            <h4 style="color: #0ea5e9; margin-top: 0;">3. Vacances : Postez APRÈS</h4>
            <p style="background: #fee2e2; padding: 10px; border-radius: 5px;">❌ "Partir 2 semaines aux Maldives demain !"</p>
            <p style="background: #dcfce7; padding: 10px; border-radius: 5px;">✅ "Super séjour aux Maldives" (après votre retour)</p>
          </div>
        </div>

        <div style="display: flex; align-items: start; background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <div style="font-size: 2.5em; margin-right: 20px;">👥</div>
          <div>
            <h4 style="color: #0ea5e9; margin-top: 0;">4. Triez Vos Amis</h4>
            <p>Acceptez-vous vraiment cette personne rencontrée 5 minutes en soirée ?</p>
            <p><strong>Conseil :</strong> Grand ménage tous les 6 mois</p>
          </div>
        </div>

        <div style="display: flex; align-items: start; background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <div style="font-size: 2.5em; margin-right: 20px;">🎯</div>
            <h4 style="color: #0ea5e9; margin-top: 0;">5. Désactivez la Géolocalisation</h4>
            <p>Ne laissez pas vos photos révéler où vous habitez</p>
            <p><strong>iPhone :</strong> Réglages → Confidentialité → Services de localisation → Appareil photo → Jamais</p>
            <p><strong>Android :</strong> Paramètres → Apps → Appareil photo → Autorisations → Position → Refuser</p>
          </div>
        </div>

        <div style="display: flex; align-items: start; background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <div style="font-size: 2.5em; margin-right: 20px;">📸</div>
          <div>
            <h4 style="color: #0ea5e9; margin-top: 0;">6. Attention aux Photos</h4>
            <p>Vérifiez avant de poster :</p>
            <ul>
              <li>Pas d'adresse visible</li>
              <li>Pas de codes/mots de passe en arrière-plan</li>
              <li>Pas de badges professionnels</li>
              <li>Pas de clés de voiture/maison</li>
            </ul>
          </div>
        </div>

        <div style="display: flex; align-items: start; background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <div style="font-size: 2.5em; margin-right: 20px;">🎲</div>
          <div>
            <h4 style="color: #0ea5e9; margin-top: 0;">7. Méfiez-vous des Quiz</h4>
            <p style="background: #fee2e2; color: #dc2626; padding: 15px; border-radius: 8px; font-weight: bold; text-align: center;">"Quel était le nom de votre premier animal ?"</p>
            <p>C'est une question de sécurité courante ! Ne répondez JAMAIS.</p>
          </div>
        </div>

        <h3 style="color: #0ea5e9;">Vérifier Vos Paramètres</h3>

        <div style="background: #f0f9ff; padding: 25px; border-radius: 10px; margin: 30px 0;">
          <h4 style="color: #0284c7;">Checklist Facebook</h4>
          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #0ea5e9;">
            <div style="background: #f9fafb; padding: 12px; margin: 8px 0; border-radius: 5px;">☐ Qui peut voir vos publications ? → Amis</div>
            <div style="background: #f9fafb; padding: 12px; margin: 8px 0; border-radius: 5px;">☐ Qui peut voir votre liste d'amis ? → Moi uniquement</div>
            <div style="background: #f9fafb; padding: 12px; margin: 8px 0; border-radius: 5px;">☐ Les moteurs de recherche peuvent-ils montrer votre profil ? → Non</div>
          </div>

          <h4 style="color: #0284c7; margin-top: 20px;">Checklist Instagram</h4>
          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #0ea5e9;">
            <div style="background: #f9fafb; padding: 12px; margin: 8px 0; border-radius: 5px;">☐ Compte privé activé</div>
            <div style="background: #f9fafb; padding: 12px; margin: 8px 0; border-radius: 5px;">☐ Masquer votre story aux non-abonnés</div>
            <div style="background: #f9fafb; padding: 12px; margin: 8px 0; border-radius: 5px;">☐ Ne pas afficher le statut d'activité</div>
          </div>
        </div>

        <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 25px; border-radius: 10px; margin: 30px 0;">
          <h3 style="margin-top: 0;">À Retenir</h3>
          <ul style="margin: 0; padding-left: 25px;">
            <li>Profil privé par défaut</li>
            <li>Évitez infos personnelles publiquement</li>
            <li>Postez vos vacances APRÈS</li>
            <li>Désactivez la géolocalisation</li>
            <li>Méfiez-vous des quiz</li>
            <li>Faites le ménage dans vos amis</li>
          </ul>
        </div>
      </div>
    `,
    quiz: {
      title: 'Quiz : Réseaux Sociaux',
      passingScore: 60,
      questions: [
        {
          question: 'Quand devriez-vous poster vos photos de vacances ?',
          options: [
            'Avant de partir',
            'En temps réel pendant le voyage',
            'Après votre retour',
            'Peu importe',
          ],
          correctAnswer: 2,
          explanation: 'Poster pendant vos vacances annonce que votre maison est vide. Attendez votre retour.',
        },
        {
          question: 'Que révèle "Quel était le nom de votre premier animal ?" ?',
          options: [
            'Rien de dangereux',
            'Une question de sécurité bancaire courante',
            'Juste un jeu amusant',
            'Votre amour des animaux',
          ],
          correctAnswer: 1,
          explanation: 'C\'est une question secrète utilisée par les banques. Ne répondez jamais à ces quiz.',
        },
        {
          question: 'Pourquoi désactiver la géolocalisation sur vos photos ?',
          options: [
            'Pour économiser la batterie',
            'Pour empêcher qu\'on sache où vous habitez',
            'C\'est inutile',
            'Pour de meilleures photos',
          ],
          correctAnswer: 1,
          explanation: 'Les métadonnées des photos contiennent votre position GPS exacte.',
        },
      ],
    },
  },

  {
    title: 'WiFi Public : Les Dangers Cachés',
    description: 'Comment vous protéger sur les réseaux WiFi gratuits',
    category: 'TECHNICAL',
    difficulty: 'INTERMEDIATE',
    duration: 8,
    minReadingTime: 180,
    points: 15,
    order: 4,
    content: `
      <div style="max-width: 800px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #1e40af;">WiFi Gratuit = Danger Gratuit ?</h2>

        <div style="background: linear-gradient(135deg, #dc2626, #991b1b); color: white; padding: 30px; border-radius: 10px; text-align: center; margin: 30px 0;">
          <p style="font-size: 1.1em;">Vous êtes au café. Vous vous connectez au WiFi gratuit.</p>
          <p style="font-size: 1.4em; font-weight: bold; margin: 15px 0;">À la table d'à côté, quelqu'un voit TOUT ce que vous faites.</p>
        </div>

        <h3 style="color: #0ea5e9;">Les 3 Attaques Principales</h3>

        <div style="background: white; border-left: 5px solid #ef4444; padding: 25px; margin: 25px 0; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <h4 style="color: #dc2626; margin-top: 0;">1. L'Homme du Milieu</h4>
          <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin: 20px 0; flex-wrap: wrap;">
            <div style="background: #3b82f6; color: white; padding: 15px 20px; border-radius: 8px; font-weight: bold;">VOUS</div>
            <div style="font-size: 2em; color: #dc2626;">→</div>
            <div style="background: #dc2626; color: white; padding: 15px 20px; border-radius: 8px; font-weight: bold;">HACKER</div>
            <div style="font-size: 2em; color: #dc2626;">→</div>
            <div style="background: #3b82f6; color: white; padding: 15px 20px; border-radius: 8px; font-weight: bold;">INTERNET</div>
          </div>
          <p style="background: #fee2e2; padding: 15px; border-radius: 5px; font-weight: bold; text-align: center;">Il voit vos mots de passe, emails, messages...</p>
        </div>

        <div style="background: white; border-left: 5px solid #ef4444; padding: 25px; margin: 25px 0; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <h4 style="color: #dc2626; margin-top: 0;">2. Le Faux Point d'Accès</h4>
          <p>Le hacker crée un faux WiFi identique :</p>
          <p style="background: #dcfce7; color: #166534; padding: 10px; border-radius: 5px; font-family: monospace;">WiFi du Café : "Starbucks_WiFi"</p>
          <p style="background: #fee2e2; color: #dc2626; padding: 10px; border-radius: 5px; font-family: monospace; font-weight: bold;">Faux WiFi : "Starbucks_WiFi"</p>
          <p style="background: #fee2e2; padding: 15px; border-radius: 5px; margin-top: 15px;">Vous vous connectez au faux, il contrôle tout !</p>
        </div>

        <div style="background: white; border-left: 5px solid #ef4444; padding: 25px; margin: 25px 0; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <h4 style="color: #dc2626; margin-top: 0;">3. Le Reniflage de Données</h4>
          <p>Un logiciel "écoute" tout le réseau WiFi :</p>
          <ul>
            <li>Vos identifiants de connexion</li>
            <li>Les sites que vous visitez</li>
            <li>Vos messages non chiffrés</li>
            <li>Vos fichiers téléchargés</li>
          </ul>
        </div>

        <h3 style="color: #0ea5e9;">Les 8 Règles d'Or</h3>

        <div style="margin: 30px 0;">
          <div style="display: flex; align-items: start; background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #fbbf24, #f59e0b); color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5em; font-weight: bold; flex-shrink: 0; margin-right: 20px;">1</div>
            <div>
              <h4 style="color: #f59e0b; margin-top: 0;">Évitez Complètement si Possible</h4>
              <p>Utilisez votre 4G/5G plutôt que le WiFi public</p>
              <p style="background: #dbeafe; padding: 10px; border-radius: 5px;">Activez le partage de connexion depuis votre téléphone</p>
            </div>
          </div>

          <div style="display: flex; align-items: start; background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #fbbf24, #f59e0b); color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5em; font-weight: bold; flex-shrink: 0; margin-right: 20px;">2</div>
            <div>
              <h4 style="color: #f59e0b; margin-top: 0;">Vérifiez le Nom du Réseau</h4>
              <p>Demandez au personnel le nom exact du WiFi officiel</p>
              <p style="background: #fee2e2; color: #dc2626; padding: 10px; border-radius: 5px; font-weight: bold;">"Free WiFi", "WiFi gratuit" = très suspect</p>
            </div>
          </div>

          <div style="display: flex; align-items: start; background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #fbbf24, #f59e0b); color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5em; font-weight: bold; flex-shrink: 0; margin-right: 20px;">3</div>
            <div>
              <h4 style="color: #f59e0b; margin-top: 0;">HTTPS Obligatoire</h4>
              <p>Vérifiez que l'URL commence par <span style="background: #dcfce7; color: #166534; padding: 3px 8px; border-radius: 4px; font-family: monospace; font-weight: bold;">https://</span> (avec le cadenas)</p>
              <p style="background: #fee2e2; color: #dc2626; padding: 10px; border-radius: 5px;">Ne vous connectez JAMAIS sur un site HTTP</p>
            </div>
          </div>

          <div style="display: flex; align-items: start; background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #fbbf24, #f59e0b); color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5em; font-weight: bold; flex-shrink: 0; margin-right: 20px;">4</div>
            <div>
              <h4 style="color: #f59e0b; margin-top: 0;">Pas de Banque/Achats</h4>
              <p>N'accédez jamais à :</p>
              <ul>
                <li>Votre banque en ligne</li>
                <li>Sites de paiement (Amazon, etc.)</li>
                <li>Comptes avec carte bancaire</li>
              </ul>
            </div>
          </div>

          <div style="display: flex; align-items: start; background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #fbbf24, #f59e0b); color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5em; font-weight: bold; flex-shrink: 0; margin-right: 20px;">5</div>
            <div>
              <h4 style="color: #f59e0b; margin-top: 0;">Utilisez un VPN</h4>
              <p>Un VPN chiffre tout votre trafic</p>
              <p style="background: #f0f9ff; padding: 10px; border-radius: 5px; border-left: 3px solid #0ea5e9;">VPN recommandés : NordVPN, ProtonVPN (gratuit)</p>
            </div>
          </div>
        </div>

        <h3 style="color: #0ea5e9;">Le VPN Expliqué Simplement</h3>

        <div style="background: #f3f4f6; padding: 25px; border-radius: 10px; margin: 30px 0;">
          <div style="background: white; padding: 20px; margin: 15px 0; border-radius: 8px;">
            <h4 style="color: #dc2626;">Sans VPN (Dangereux)</h4>
            <p style="background: #fee2e2; padding: 10px; border-radius: 5px; text-align: center; font-weight: bold;">Le hacker voit tout en clair</p>
          </div>

          <div style="background: white; padding: 20px; margin: 15px 0; border-radius: 8px;">
            <h4 style="color: #16a34a;">Avec VPN (Sécurisé)</h4>
            <p style="background: #dcfce7; padding: 10px; border-radius: 5px; text-align: center; font-weight: bold;">Le hacker ne voit que du charabia chiffré</p>
          </div>
        </div>

        <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 25px; border-radius: 10px; margin: 30px 0;">
          <h3 style="margin-top: 0;">À Retenir</h3>
          <ul style="margin: 0; padding-left: 25px;">
            <li>WiFi public = risque élevé</li>
            <li>Privilégiez votre 4G/5G</li>
            <li>JAMAIS de banque ou achats</li>
            <li>Utilisez un VPN</li>
            <li>HTTPS obligatoire</li>
          </ul>
        </div>
      </div>
    `,
    quiz: {
      title: 'Quiz : WiFi Public',
      passingScore: 70,
      questions: [
        {
          question: 'Quelle est l\'alternative la plus sûre au WiFi public ?',
          options: [
            'Se connecter sans mot de passe',
            'Utiliser sa connexion 4G/5G',
            'Utiliser un réseau avec mot de passe',
            'Éteindre le WiFi',
          ],
          correctAnswer: 1,
          explanation: 'Votre connexion mobile (4G/5G) est personnelle et chiffrée. C\'est toujours plus sûr qu\'un WiFi public.',
        },
        {
          question: 'Que signifie "HTTPS" dans une URL ?',
          options: [
            'Connexion chiffrée et sécurisée',
            'High Technology Protection',
            'HTTP version Suisse',
            'Rien de particulier',
          ],
          correctAnswer: 0,
          explanation: 'Le "S" signifie "Secure". La connexion est chiffrée entre vous et le site.',
        },
        {
          question: 'Qu\'est-ce qu\'un VPN ?',
          options: [
            'Un antivirus',
            'Un tunnel chiffré qui protège votre connexion',
            'Un type de WiFi',
            'Un navigateur',
          ],
          correctAnswer: 1,
          explanation: 'Un VPN crée un tunnel chiffré, rendant vos données illisibles pour les hackers.',
        },
      ],
    },
  },

  {
    title: 'Télétravail Sécurisé',
    description: 'Protéger les données de l\'entreprise en travaillant à distance',
    category: 'AWARENESS',
    difficulty: 'INTERMEDIATE',
    duration: 10,
    minReadingTime: 200,
    points: 15,
    order: 5,
    content: `
      <div style="max-width: 800px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #1e40af;">Télétravailler Sans Mettre l'Entreprise en Danger</h2>

        <div style="background: linear-gradient(135deg, #3b82f6, #1e40af); color: white; padding: 30px; border-radius: 10px; text-align: center; margin: 30px 0;">
          <p style="font-size: 1.1em;">Depuis le COVID, le télétravail a explosé.</p>
          <p style="font-size: 1.4em; font-weight: bold; margin: 15px 0;">70% des attaques ciblent maintenant les télétravailleurs.</p>
          <p>Pourquoi ? Votre domicile est moins sécurisé que le bureau.</p>
        </div>

        <h3 style="color: #0ea5e9;">Les 7 Erreurs Fatales</h3>

        <div style="display: flex; align-items: start; background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-left: 5px solid #ef4444;">
          <div style="background: #dc2626; color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5em; font-weight: bold; flex-shrink: 0; margin-right: 20px;">1</div>
          <div>
            <h4 style="color: #dc2626; margin-top: 0;">Travailler au Café sur WiFi Public</h4>
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin-top: 15px;">
              <p><strong style="color: #92400e;">Le risque :</strong> Interception de données confidentielles</p>
              <p><strong style="color: #92400e;">La solution :</strong> VPN obligatoire ou utilisez votre 4G</p>
            </div>
          </div>
        </div>

        <div style="display: flex; align-items: start; background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-left: 5px solid #ef4444;">
          <div style="background: #dc2626; color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5em; font-weight: bold; flex-shrink: 0; margin-right: 20px;">2</div>
          <div>
            <h4 style="color: #dc2626; margin-top: 0;">Laisser l'Ordinateur Pro Sans Surveillance</h4>
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin-top: 15px;">
              <p><strong style="color: #92400e;">Le risque :</strong> Vol physique ou accès non autorisé</p>
              <p><strong style="color: #92400e;">La solution :</strong> Verrouillez TOUJOURS (Windows+L ou Cmd+Ctrl+Q sur Mac)</p>
            </div>
          </div>
        </div>

        <div style="display: flex; align-items: start; background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-left: 5px solid #ef4444;">
          <div style="background: #dc2626; color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5em; font-weight: bold; flex-shrink: 0; margin-right: 20px;">3</div>
          <div>
            <h4 style="color: #dc2626; margin-top: 0;">Utiliser l'Ordi Pro pour Usage Personnel</h4>
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin-top: 15px;">
              <p><strong style="color: #92400e;">Le risque :</strong> Télécharger un virus sur un site perso</p>
              <p><strong style="color: #92400e;">La solution :</strong> Ordi perso pour Netflix/réseaux sociaux</p>
            </div>
          </div>
        </div>

        <div style="display: flex; align-items: start; background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-left: 5px solid #ef4444;">
          <div style="background: #dc2626; color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5em; font-weight: bold; flex-shrink: 0; margin-right: 20px;">4</div>
          <div>
            <h4 style="color: #dc2626; margin-top: 0;">Laisser la Famille Utiliser l'Ordi Pro</h4>
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin-top: 15px;">
              <p><strong style="color: #92400e;">Le risque :</strong> Enfants qui téléchargent des jeux infectés</p>
              <p><strong style="color: #92400e;">La solution :</strong> Ordinateur pro = usage professionnel UNIQUEMENT</p>
            </div>
          </div>
        </div>

        <h3 style="color: #0ea5e9;">Checklist du Télétravailleur Sécurisé</h3>

        <div style="background: #f0f9ff; padding: 25px; border-radius: 10px; margin: 30px 0;">
          <div style="background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #0ea5e9;">
            <h4 style="color: #0284c7; margin-top: 0;">Avant de Commencer</h4>
            <div style="background: #f9fafb; padding: 12px; margin: 8px 0; border-radius: 5px; border-left: 3px solid #10b981;">☐ WiFi maison sécurisé (WPA2/WPA3)</div>
            <div style="background: #f9fafb; padding: 12px; margin: 8px 0; border-radius: 5px; border-left: 3px solid #10b981;">☐ Antivirus à jour</div>
            <div style="background: #f9fafb; padding: 12px; margin: 8px 0; border-radius: 5px; border-left: 3px solid #10b981;">☐ VPN d'entreprise connecté</div>
            <div style="background: #f9fafb; padding: 12px; margin: 8px 0; border-radius: 5px; border-left: 3px solid #10b981;">☐ Espace de travail isolé</div>
          </div>

          <div style="background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #0ea5e9;">
            <h4 style="color: #0284c7; margin-top: 0;">Pendant le Travail</h4>
            <div style="background: #f9fafb; padding: 12px; margin: 8px 0; border-radius: 5px; border-left: 3px solid #10b981;">☐ Écran pas visible de l'extérieur</div>
            <div style="background: #f9fafb; padding: 12px; margin: 8px 0; border-radius: 5px; border-left: 3px solid #10b981;">☐ Verrouiller à chaque pause</div>
            <div style="background: #f9fafb; padding: 12px; margin: 8px 0; border-radius: 5px; border-left: 3px solid #10b981;">☐ Webcam couverte quand non utilisée</div>
          </div>

          <div style="background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #0ea5e9;">
            <h4 style="color: #0284c7; margin-top: 0;">Fin de Journée</h4>
<div style="background: #f9fafb; padding: 12px; margin: 8px 0; border-radius: 5px; border-left: 3px solid #10b981;">☐ Documents rangés hors de vue</div>
            <div style="background: #f9fafb; padding: 12px; margin: 8px 0; border-radius: 5px; border-left: 3px solid #10b981;">☐ Ordinateur éteint (pas en veille)</div>
            <div style="background: #f9fafb; padding: 12px; margin: 8px 0; border-radius: 5px; border-left: 3px solid #10b981;">☐ Documents imprimés détruits</div>
          </div>
        </div>

        <h3 style="color: #0ea5e9;">Que Faire en Cas d'Incident ?</h3>

        <div style="background: #fef3c7; padding: 25px; border-radius: 10px; margin: 30px 0;">
          <h4 style="color: #92400e;">Scénario : Clic sur un Lien Suspect</h4>
          <div style="background: white; padding: 15px; margin: 15px 0; border-radius: 8px;">
            <strong style="color: #dc2626;">Action immédiate :</strong>
            <div style="display: flex; align-items: center; margin: 15px 0;">
              <div style="background: #f59e0b; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0; margin-right: 15px;">1</div>
              <p style="margin: 0;">Déconnectez-vous d'Internet</p>
            </div>
            <div style="display: flex; align-items: center; margin: 15px 0;">
              <div style="background: #f59e0b; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0; margin-right: 15px;">2</div>
              <p style="margin: 0;">Prévenez votre service IT</p>
            </div>
            <div style="display: flex; align-items: center; margin: 15px 0;">
              <div style="background: #f59e0b; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0; margin-right: 15px;">3</div>
              <p style="margin: 0;">Ne supprimez rien</p>
            </div>
            <div style="display: flex; align-items: center; margin: 15px 0;">
              <div style="background: #f59e0b; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0; margin-right: 15px;">4</div>
              <p style="margin: 0;">Changez vos mots de passe depuis un autre appareil</p>
            </div>
          </div>
        </div>

        <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 25px; border-radius: 10px; margin: 30px 0;">
          <h3 style="margin-top: 0;">Les 10 Commandements du Télétravailleur</h3>
          <ol style="margin: 0; padding-left: 25px;">
            <li style="margin: 12px 0;">Le VPN d'entreprise tu utiliseras</li>
            <li style="margin: 12px 0;">Ton WiFi maison tu sécuriseras</li>
            <li style="margin: 12px 0;">Ton écran tu verrouilleras</li>
            <li style="margin: 12px 0;">Sur WiFi public jamais tu ne travailleras</li>
            <li style="margin: 12px 0;">Les données pros tu ne mélangeras pas avec le perso</li>
            <li style="margin: 12px 0;">Ta famille sur l'ordi pro tu ne laisseras pas</li>
            <li style="margin: 12px 0;">Les appels confidentiels dans un lieu privé tu passeras</li>
            <li style="margin: 12px 0;">Les documents sensibles tu détruiras</li>
            <li style="margin: 12px 0;">En cas de doute le service IT tu contacteras</li>
            <li style="margin: 12px 0;">La sécurité tu prendras au sérieux</li>
          </ol>
        </div>
      </div>
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
          explanation: 'Toujours privilégier votre 4G ou le VPN d\'entreprise. Le WiFi public est trop risqué.',
        },
        {
          question: 'Votre enfant veut jouer sur votre ordinateur professionnel. Vous dites :',
          options: [
            'OK, mais 10 minutes',
            'Non, cet ordinateur est uniquement pour le travail',
            'OK si c\'est un jeu éducatif',
            'OK si je surveille',
          ],
          correctAnswer: 1,
          explanation: 'L\'ordinateur professionnel ne doit JAMAIS être utilisé pour un usage personnel.',
        },
        {
          question: 'Que faire si vous cliquez sur un lien suspect au travail ?',
          options: [
            'Éteindre l\'ordinateur et ne rien dire',
            'Déconnecter Internet et prévenir le service IT',
            'Faire un scan antivirus',
            'Supprimer l\'email',
          ],
          correctAnswer: 1,
          explanation: 'Déconnectez immédiatement et prévenez le service IT pour isoler l\'incident.',
        },
      ],
    },
  },
];