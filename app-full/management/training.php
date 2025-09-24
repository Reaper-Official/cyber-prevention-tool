<?php
// training.php - Page de formation interactive après phishing
$campaign_id = intval($_GET['c'] ?? 0);
$employee_id = intval($_GET['e'] ?? 0);
$token = $_GET['t'] ?? '';

if (!$campaign_id || !$employee_id) {
    header('Location: /error.html');
    exit;
}

// Récupération des informations de la campagne
try {
    require_once 'config/database.php';
    $database = new Database();
    $db = $database->getConnection();
    
    $campaign_query = "
        SELECT c.name, c.template, e.full_name, e.department
        FROM campaigns c
        JOIN campaign_results cr ON c.id = cr.campaign_id
        JOIN employees e ON cr.employee_id = e.id
        WHERE c.id = :cid AND e.id = :eid AND cr.link_clicked = TRUE
    ";
    
    $campaign_stmt = $db->prepare($campaign_query);
    $campaign_stmt->bindParam(':cid', $campaign_id);
    $campaign_stmt->bindParam(':eid', $employee_id);
    $campaign_stmt->execute();
    $campaign_info = $campaign_stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$campaign_info) {
        header('Location: /error.html');
        exit;
    }
} catch (Exception $e) {
    error_log("Erreur training.php: " . $e->getMessage());
    $campaign_info = ['name' => 'Formation Sécurité', 'template' => 'generic'];
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Formation Sécurité - PhishGuard</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        :root {
            --primary: #0b046d;
            --danger: #dc2626;
            --warning: #f59e0b;
            --success: #059669;
            --info: #0ea5e9;
            --gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #334155;
            background: var(--gradient);
            min-height: 100vh;
            padding: 20px;
        }

        .training-container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 25px 50px rgba(0,0,0,0.15);
            overflow: hidden;
            animation: slideUp 0.8s ease-out;
        }

        @keyframes slideUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .alert-header {
            background: linear-gradient(135deg, #ff6b6b, #ffa500);
            color: white;
            padding: 3rem 2rem;
            text-align: center;
            position: relative;
            overflow: hidden;
        }

        .alert-header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: repeating-linear-gradient(
                45deg,
                transparent,
                transparent 20px,
                rgba(255,255,255,0.1) 20px,
                rgba(255,255,255,0.1) 40px
            );
            animation: slide 4s linear infinite;
        }

        @keyframes slide {
            0% { transform: translateX(-40px); }
            100% { transform: translateX(40px); }
        }

        .alert-icon {
            font-size: 4rem;
            margin-bottom: 1rem;
            animation: shake 1.5s ease-in-out infinite alternate;
            position: relative;
            z-index: 2;
        }

        @keyframes shake {
            0% { transform: rotate(-3deg) scale(1); }
            100% { transform: rotate(3deg) scale(1.05); }
        }

        .alert-title {
            font-size: 2.5rem;
            font-weight: 800;
            margin-bottom: 0.5rem;
            position: relative;
            z-index: 2;
        }

        .alert-subtitle {
            font-size: 1.2rem;
            opacity: 0.95;
            position: relative;
            z-index: 2;
        }

        .content {
            padding: 2.5rem;
        }

        .section {
            margin: 2rem 0;
            padding: 1.5rem;
            border-radius: 12px;
            border-left: 4px solid;
        }

        .section-danger {
            background: #fef2f2;
            border-left-color: var(--danger);
        }

        .section-info {
            background: #f0f9ff;
            border-left-color: var(--info);
        }

        .section-success {
            background: #f0fdf4;
            border-left-color: var(--success);
        }

        .section-warning {
            background: #fffbeb;
            border-left-color: var(--warning);
        }

        .section-title {
            font-size: 1.3rem;
            font-weight: 700;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .section-title i {
            font-size: 1.5rem;
        }

        .tips-list {
            list-style: none;
            padding: 0;
        }

        .tips-list li {
            padding: 0.75rem 0;
            display: flex;
            align-items: flex-start;
            gap: 1rem;
            border-bottom: 1px solid rgba(0,0,0,0.1);
        }

        .tips-list li:last-child {
            border-bottom: none;
        }

        .tips-list .icon {
            font-size: 1.2rem;
            margin-top: 0.2rem;
            min-width: 20px;
        }

        .quiz-container {
            background: #f8fafc;
            border-radius: 12px;
            padding: 2rem;
            margin: 2rem 0;
            border: 2px solid #e2e8f0;
        }

        .progress-bar {
            background: #e2e8f0;
            height: 12px;
            border-radius: 6px;
            overflow: hidden;
            margin: 1rem 0;
        }

        .progress-fill {
            background: var(--gradient);
            height: 100%;
            width: 0;
            transition: width 0.5s ease;
        }

        .question {
            background: white;
            border-radius: 8px;
            padding: 1.5rem;
            margin: 1rem 0;
            border: 1px solid #e2e8f0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .question h4 {
            color: var(--primary);
            margin-bottom: 1rem;
            font-size: 1.1rem;
        }

        .answers {
            margin-top: 1rem;
        }

        .answer {
            display: block;
            margin: 0.75rem 0;
            padding: 1rem;
            background: #f8fafc;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
        }

        .answer:hover {
            background: #e0e7ff;
            border-color: var(--primary);
            transform: translateX(5px);
        }

        .answer.selected {
            background: #dbeafe;
            border-color: var(--info);
        }

        .answer input[type="radio"] {
            margin-right: 1rem;
            transform: scale(1.2);
        }

        .btn {
            background: var(--gradient);
            color: white;
            border: none;
            padding: 1rem 2rem;
            border-radius: 50px;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            margin: 1rem 0.5rem 1rem 0;
        }

        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        }

        .btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        .btn-success {
            background: linear-gradient(135deg, var(--success), #10b981);
        }

        .result-box {
            background: white;
            border-radius: 12px;
            padding: 2rem;
            text-align: center;
            margin: 2rem 0;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }

        .result-excellent {
            border-left: 4px solid var(--success);
            background: #f0fdf4;
        }

        .result-good {
            border-left: 4px solid var(--info);
            background: #f0f9ff;
        }

        .result-poor {
            border-left: 4px solid var(--warning);
            background: #fffbeb;
        }

        .score-display {
            font-size: 3rem;
            font-weight: 800;
            margin: 1rem 0;
        }

        .recommendations {
            background: #f8fafc;
            border-radius: 8px;
            padding: 1.5rem;
            margin: 1rem 0;
            text-align: left;
        }

        .footer {
            background: #f1f5f9;
            padding: 1.5rem;
            text-align: center;
            font-size: 0.9rem;
            color: #64748b;
            border-top: 1px solid #e2e8f0;
        }

        .hidden {
            display: none;
        }

        .timer {
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-weight: 600;
            z-index: 1000;
        }

        @media (max-width: 768px) {
            .training-container {
                margin: 0;
                border-radius: 0;
            }
            
            .content {
                padding: 1.5rem;
            }
            
            .alert-header {
                padding: 2rem 1rem;
            }
            
            .alert-title {
                font-size: 2rem;
            }
        }
    </style>
</head>
<body>
    <div class="timer" id="trainingTimer">
        <i class="fas fa-clock"></i>
        <span id="timerValue">00:00</span>
    </div>

    <div class="training-container">
        <div class="alert-header">
            <div class="alert-icon">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <h1 class="alert-title">Tentative de Phishing Détectée!</h1>
            <p class="alert-subtitle">Formation obligatoire - <?= htmlspecialchars($campaign_info['name'] ?? 'Campagne de sécurité') ?></p>
        </div>

        <div class="content">
            <!-- Que s'est-il passé -->
            <div class="section section-danger">
                <div class="section-title" style="color: var(--danger);">
                    <i class="fas fa-exclamation-circle"></i>
                    Que s'est-il passé ?
                </div>
                <p><strong>Vous venez de cliquer sur un lien dans un email de phishing simulé.</strong></p>
                <p>Dans une situation réelle, cette action aurait pu compromettre gravement la sécurité de votre ordinateur et des données de l'entreprise. Heureusement, c'était un test contrôlé pour évaluer et améliorer votre vigilance.</p>
            </div>

            <!-- Signaux d'alarme -->
            <div class="section section-info">
                <div class="section-title" style="color: var(--info);">
                    <i class="fas fa-search"></i>
                    Signaux d'alarme dans l'email
                </div>
                <ul class="tips-list" id="emailAnalysis">
                    <li>
                        <i class="fas fa-clock icon" style="color: var(--warning);"></i>
                        <span><strong>Urgence artificielle :</strong> Le message créait un sentiment d'urgence pour vous pousser à agir rapidement</span>
                    </li>
                    <li>
                        <i class="fas fa-envelope icon" style="color: var(--danger);"></i>
                        <span><strong>Expéditeur suspect :</strong> L'adresse email peut sembler légitime mais contient des subtilités douteuses</span>
                    </li>
                    <li>
                        <i class="fas fa-link icon" style="color: var(--warning);"></i>
                        <span><strong>Lien malveillant :</strong> Le lien ne dirigeait pas vers le site officiel attendu</span>
                    </li>
                    <li>
                        <i class="fas fa-user-secret icon" style="color: var(--danger);"></i>
                        <span><strong>Demande d'informations :</strong> Tentative de collecte de données personnelles ou professionnelles</span>
                    </li>
                </ul>
            </div>

            <!-- Comment se protéger -->
            <div class="section section-success">
                <div class="section-title" style="color: var(--success);">
                    <i class="fas fa-shield-alt"></i>
                    Comment se protéger à l'avenir ?
                </div>
                <ul class="tips-list">
                    <li>
                        <i class="fas fa-eye icon" style="color: var(--success);"></i>
                        <span><strong>Vérifiez l'expéditeur :</strong> Examinez attentivement l'adresse email et recherchez les fautes ou incohérences</span>
                    </li>
                    <li>
                        <i class="fas fa-pause-circle icon" style="color: var(--success);"></i>
                        <span><strong>Prenez votre temps :</strong> Méfiez-vous des messages urgents qui demandent une action immédiate</span>
                    </li>
                    <li>
                        <i class="fas fa-mouse icon" style="color: var(--success);"></i>
                        <span><strong>Survolez les liens :</strong> Passez la souris sur les liens pour voir leur vraie destination</span>
                    </li>
                    <li>
                        <i class="fas fa-phone icon" style="color: var(--success);"></i>
                        <span><strong>En cas de doute :</strong> Contactez le service IT ou vérifiez via un canal officiel</span>
                    </li>
                    <li>
                        <i class="fas fa-flag icon" style="color: var(--success);"></i>
                        <span><strong>Signalez :</strong> Transmettez les emails suspects à l'équipe sécurité</span>
                    </li>
                </ul>
            </div>

            <!-- Quiz de validation -->
            <div class="quiz-container">
                <div class="section-title" style="color: var(--primary);">
                    <i class="fas fa-question-circle"></i>
                    Quiz de validation - Testez vos connaissances
                </div>
                
                <div class="progress-bar">
                    <div class="progress-fill" id="quizProgress"></div>
                </div>
                
                <form id="securityQuiz">
                    <div class="question" data-question="1">
                        <h4>1. Que devez-vous faire en priorité en recevant un email suspect ?</h4>
                        <div class="answers">
                            <label class="answer">
                                <input type="radio" name="q1" value="a">
                                Cliquer sur le lien pour vérifier s'il est légitime
                            </label>
                            <label class="answer">
                                <input type="radio" name="q1" value="b">
                                Le signaler immédiatement au service IT et l'analyser
                            </label>
                            <label class="answer">
                                <input type="radio" name="q1" value="c">
                                Le transférer à vos collègues pour avoir leur avis
                            </label>
                            <label class="answer">
                                <input type="radio" name="q1" value="d">
                                Le supprimer sans rien faire d'autre
                            </label>
                        </div>
                    </div>

                    <div class="question" data-question="2">
                        <h4>2. Comment identifier un email de phishing ? (Plusieurs réponses possibles)</h4>
                        <div class="answers">
                            <label class="answer">
                                <input type="radio" name="q2" value="a">
                                Par l'urgence artificielle du message
                            </label>
                            <label class="answer">
                                <input type="radio" name="q2" value="b">
                                Par la demande d'informations personnelles
                            </label>
                            <label class="answer">
                                <input type="radio" name="q2" value="c">
                                Par les fautes d'orthographe ou de grammaire
                            </label>
                            <label class="answer">
                                <input type="radio" name="q2" value="d">
                                Toutes les réponses ci-dessus
                            </label>
                        </div>
                    </div>

                    <div class="question" data-question="3">
                        <h4>3. Quelle est la meilleure façon de vérifier un lien suspect ?</h4>
                        <div class="answers">
                            <label class="answer">
                                <input type="radio" name="q3" value="a">
                                Cliquer dessus pour voir où il mène
                            </label>
                            <label class="answer">
                                <input type="radio" name="q3" value="b">
                                Passer la souris dessus pour voir l'URL de destination
                            </label>
                            <label class="answer">
                                <input type="radio" name="q3" value="c">
                                Copier le lien et l'envoyer à des amis
                            </label>
                            <label class="answer">
                                <input type="radio" name="q3" value="d">
                                Faire confiance si l'email semble professionnel
                            </label>
                        </div>
                    </div>

                    <div class="question" data-question="4">
                        <h4>4. En cas de doute sur un email, que devez-vous faire ?</h4>
                        <div class="answers">
                            <label class="answer">
                                <input type="radio" name="q4" value="a">
                                Ignorer l'email et continuer votre travail
                            </label>
                            <label class="answer">
                                <input type="radio" name="q4" value="b">
                                Contacter l'expéditeur par un canal officiel pour vérifier
                            </label>
                            <label class="answer">
                                <input type="radio" name="q4" value="c">
                                Suivre les instructions de l'email par précaution
                            </label>
                            <label class="answer">
                                <input type="radio" name="q4" value="d">
                                Répondre à l'email pour demander des clarifications
                            </label>
                        </div>
                    </div>

                    <button type="submit" class="btn btn-success" id="submitQuiz" disabled>
                        <i class="fas fa-check-double"></i>
                        Terminer la formation
                    </button>
                </form>
            </div>

            <!-- Zone de résultats (cachée initialement) -->
            <div id="quizResults" class="result-box hidden">
                <div class="score-display" id="scoreDisplay">0%</div>
                <div id="resultMessage"></div>
                <div class="recommendations" id="recommendations"></div>
                <button class="btn btn-success" id="completeTraining">
                    <i class="fas fa-graduation-cap"></i>
                    Terminer et obtenir le certificat
                </button>
            </div>
        </div>

        <div class="footer">
            <p><strong>Formation PhishGuard BASIC</strong></p>
            <p>Cette simulation était autorisée par votre entreprise dans le cadre de l'amélioration de la cybersécurité. Aucune donnée personnelle n'a été collectée.</p>
            <p>Département: <?= htmlspecialchars($campaign_info['department'] ?? 'Non spécifié') ?> | 
               Employé: <?= htmlspecialchars($campaign_info['full_name'] ?? 'Non spécifié') ?></p>
        </div>
    </div>

    <script>
        // Variables globales
        const campaignId = <?= $campaign_id ?>;
        const employeeId = <?= $employee_id ?>;
        const sessionStartTime = Date.now();
        let trainingStartTime = Date.now();
        let currentQuestion = 0;
        const totalQuestions = 4;
        
        // Réponses correctes
        const correctAnswers = {
            'q1': 'b',
            'q2': 'd', 
            'q3': 'b',
            'q4': 'b'
        };
        // Initialisation
        document.addEventListener('DOMContentLoaded', function() {
            initializeTraining();
        });

        function initializeTraining() {
            // Démarrage du timer
            startTimer();
            
            // Gestion des réponses du quiz
            setupQuizHandlers();
            
            // Empêcher la fermeture accidentelle
            window.addEventListener('beforeunload', function(e) {
                if (!document.getElementById('quizResults').classList.contains('hidden')) {
                    return; // Formation terminée
                }
                e.preventDefault();
                e.returnValue = 'Êtes-vous sûr de vouloir quitter la formation ?';
            });
        }

        function startTimer() {
            const timerElement = document.getElementById('timerValue');
            
            setInterval(() => {
                const elapsed = Math.floor((Date.now() - trainingStartTime) / 1000);
                const minutes = Math.floor(elapsed / 60);
                const seconds = elapsed % 60;
                timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }, 1000);
        }

        function setupQuizHandlers() {
            const form = document.getElementById('securityQuiz');
            const submitBtn = document.getElementById('submitQuiz');
            
            // Gestion de la sélection des réponses
            form.addEventListener('change', function(e) {
                if (e.target.type === 'radio') {
                    // Marquer la réponse comme sélectionnée
                    const answer = e.target.closest('.answer');
                    const question = e.target.closest('.question');
                    
                    // Retirer la sélection des autres réponses
                    question.querySelectorAll('.answer').forEach(a => a.classList.remove('selected'));
                    answer.classList.add('selected');
                    
                    updateProgress();
                }
            });
            
            // Soumission du quiz
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                submitQuiz();
            });
        }

        function updateProgress() {
            const answeredQuestions = getAnsweredQuestions();
            const progress = (answeredQuestions / totalQuestions) * 100;
            
            document.getElementById('quizProgress').style.width = progress + '%';
            
            // Activer le bouton de soumission si toutes les questions sont répondues
            const submitBtn = document.getElementById('submitQuiz');
            if (answeredQuestions === totalQuestions) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-check-double"></i> Terminer la formation';
            }
        }

        function getAnsweredQuestions() {
            let answered = 0;
            for (let i = 1; i <= totalQuestions; i++) {
                const radios = document.querySelectorAll(`input[name="q${i}"]`);
                for (let radio of radios) {
                    if (radio.checked) {
                        answered++;
                        break;
                    }
                }
            }
            return answered;
        }

        function submitQuiz() {
            const formData = new FormData(document.getElementById('securityQuiz'));
            let score = 0;
            const results = {};
            
            // Calcul du score
            for (let i = 1; i <= totalQuestions; i++) {
                const answer = formData.get(`q${i}`);
                results[`q${i}`] = answer;
                
                if (answer === correctAnswers[`q${i}`]) {
                    score += 25; // 25 points par bonne réponse
                }
            }
            
            displayResults(score, results);
        }

        function displayResults(score, answers) {
            const resultsDiv = document.getElementById('quizResults');
            const scoreDisplay = document.getElementById('scoreDisplay');
            const resultMessage = document.getElementById('resultMessage');
            const recommendations = document.getElementById('recommendations');
            
            // Affichage du score
            scoreDisplay.textContent = score + '%';
            scoreDisplay.style.color = getScoreColor(score);
            
            // Message selon le score
            let message, recommendations_list;
            if (score >= 90) {
                message = "🎉 Excellent ! Vous maîtrisez parfaitement les bonnes pratiques de sécurité.";
                recommendations_list = [
                    "Continuez à appliquer ces bonnes pratiques",
                    "Partagez vos connaissances avec vos collègues",
                    "Restez vigilant face aux nouvelles techniques de phishing"
                ];
                resultsDiv.className = 'result-box result-excellent';
            } else if (score >= 75) {
                message = "👍 Très bien ! Vous avez de bonnes bases, quelques points à renforcer.";
                recommendations_list = [
                    "Révisez les questions où vous avez eu des erreurs",
                    "Pratiquez l'identification des emails suspects",
                    "N'hésitez pas à demander de l'aide en cas de doute"
                ];
                resultsDiv.className = 'result-box result-good';
            } else if (score >= 50) {
                message = "⚠️ Passable. Il est important de renforcer vos connaissances en sécurité.";
                recommendations_list = [
                    "Relisez attentivement les bonnes pratiques ci-dessus",
                    "Suivez une formation complémentaire en sécurité",
                    "Contactez l'équipe IT pour des conseils personnalisés",
                    "Soyez particulièrement vigilant avec vos emails"
                ];
                resultsDiv.className = 'result-box result-poor';
            } else {
                message = "❌ Score insuffisant. Une formation renforcée est nécessaire.";
                recommendations_list = [
                    "Reprenez cette formation dans quelques jours",
                    "Participez à un atelier de sensibilisation",
                    "Consultez les ressources sécurité de l'entreprise",
                    "Demandez un accompagnement personnalisé au service IT"
                ];
                resultsDiv.className = 'result-box result-poor';
            }
            
            resultMessage.innerHTML = `<h3>${message}</h3>`;
            
            // Recommandations
            recommendations.innerHTML = `
                <h4 style="margin-bottom: 1rem;"><i class="fas fa-lightbulb"></i> Recommandations personnalisées :</h4>
                <ul style="text-align: left; margin-left: 1rem;">
                    ${recommendations_list.map(rec => `<li style="margin-bottom: 0.5rem;">${rec}</li>`).join('')}
                </ul>
            `;
            
            // Afficher les résultats
            resultsDiv.classList.remove('hidden');
            
            // Faire défiler vers les résultats
            resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Configurer le bouton de finalisation
            setupCompletionButton(score);
        }

        function getScoreColor(score) {
            if (score >= 90) return '#059669';
            if (score >= 75) return '#0ea5e9';
            if (score >= 50) return '#f59e0b';
            return '#dc2626';
        }

        function setupCompletionButton(score) {
            const completeBtn = document.getElementById('completeTraining');
            
            completeBtn.addEventListener('click', function() {
                completeTraining(score);
            });
        }

        function completeTraining(score) {
            const completeBtn = document.getElementById('completeTraining');
            const originalContent = completeBtn.innerHTML;
            
            // Afficher un indicateur de chargement
            completeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Finalisation...';
            completeBtn.disabled = true;
            
            const trainingTime = Math.floor((Date.now() - trainingStartTime) / 1000);
            
            // Données à envoyer
            const completionData = new FormData();
            completionData.append('c', campaignId);
            completionData.append('e', employeeId);
            completionData.append('quiz_score', score);
            completionData.append('training_time', trainingTime);
            completionData.append('modules_completed', JSON.stringify([
                'phishing_identification',
                'security_best_practices',
                'incident_response'
            ]));
            
            // Envoi des données
            fetch('api/complete_training.php', {
                method: 'POST',
                body: completionData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showCompletionSuccess(score, trainingTime, data.certificate_available);
                } else {
                    throw new Error(data.message || 'Erreur lors de la finalisation');
                }
            })
            .catch(error => {
                console.error('Erreur:', error);
                alert('Erreur lors de la finalisation de la formation. Veuillez réessayer.');
                completeBtn.innerHTML = originalContent;
                completeBtn.disabled = false;
            });
        }

        function showCompletionSuccess(score, trainingTime, certificateAvailable) {
            const minutes = Math.floor(trainingTime / 60);
            const seconds = trainingTime % 60;
            
            // Créer la modal de succès
            const modal = document.createElement('div');
            modal.className = 'completion-modal';
            modal.innerHTML = `
                <div class="modal-overlay">
                    <div class="modal-content">
                        <div class="success-header">
                            <i class="fas fa-check-circle"></i>
                            <h2>Formation Terminée avec Succès!</h2>
                        </div>
                        <div class="success-body">
                            <div class="completion-stats">
                                <div class="stat">
                                    <span class="stat-label">Score Final</span>
                                    <span class="stat-value" style="color: ${getScoreColor(score)}">${score}%</span>
                                </div>
                                <div class="stat">
                                    <span class="stat-label">Temps de Formation</span>
                                    <span class="stat-value">${minutes}:${seconds.toString().padStart(2, '0')}</span>
                                </div>
                            </div>
                            ${certificateAvailable ? `
                                <div class="certificate-info">
                                    <i class="fas fa-certificate"></i>
                                    <p>Félicitations ! Vous avez obtenu votre certificat de formation.</p>
                                </div>
                            ` : ''}
                            <p class="completion-message">
                                Votre formation a été enregistrée avec succès. 
                                Continuez à appliquer ces bonnes pratiques au quotidien !
                            </p>
                        </div>
                        <div class="success-footer">
                            <button class="btn btn-success" onclick="closeTraining()">
                                <i class="fas fa-home"></i>
                                Retour au travail
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            // Styles pour la modal
            const modalStyles = document.createElement('style');
            modalStyles.textContent = `
                .completion-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 10000;
                }
                
                .modal-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                }
                
                .modal-content {
                    background: white;
                    border-radius: 20px;
                    max-width: 500px;
                    width: 100%;
                    overflow: hidden;
                    animation: modalSlideIn 0.5s ease-out;
                }
                
                @keyframes modalSlideIn {
                    from { opacity: 0; transform: scale(0.8); }
                    to { opacity: 1; transform: scale(1); }
                }
                
                .success-header {
                    background: linear-gradient(135deg, #059669, #10b981);
                    color: white;
                    padding: 2rem;
                    text-align: center;
                }
                
                .success-header i {
                    font-size: 3rem;
                    margin-bottom: 1rem;
                    display: block;
                }
                
                .success-body {
                    padding: 2rem;
                }
                
                .completion-stats {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }
                
                .stat {
                    text-align: center;
                    padding: 1rem;
                    background: #f8fafc;
                    border-radius: 8px;
                }
                
                .stat-label {
                    display: block;
                    font-size: 0.9rem;
                    color: #64748b;
                    margin-bottom: 0.5rem;
                }
                
                .stat-value {
                    display: block;
                    font-size: 1.5rem;
                    font-weight: bold;
                }
                
                .certificate-info {
                    background: #f0fdf4;
                    border: 1px solid #bbf7d0;
                    border-radius: 8px;
                    padding: 1rem;
                    margin: 1rem 0;
                    text-align: center;
                }
                
                .certificate-info i {
                    color: #059669;
                    font-size: 1.5rem;
                    margin-bottom: 0.5rem;
                }
                
                .success-footer {
                    padding: 1.5rem 2rem;
                    background: #f8fafc;
                    text-align: center;
                }
            `;
            
            document.head.appendChild(modalStyles);
            document.body.appendChild(modal);
        }

        function closeTraining() {
            // Permettre la fermeture de la page
            window.removeEventListener('beforeunload', null);
            
            // Message de confirmation
            const confirmDiv = document.createElement('div');
            confirmDiv.innerHTML = `
                <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                           background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 25px 50px rgba(0,0,0,0.3);
                           text-align: center; z-index: 20000;">
                    <i class="fas fa-check-circle" style="color: #059669; font-size: 3rem; margin-bottom: 1rem;"></i>
                    <h3 style="margin-bottom: 1rem;">Formation terminée !</h3>
                    <p>Merci d'avoir suivi cette formation de sécurité.</p>
                    <p style="margin-top: 1rem; color: #64748b;">Cette fenêtre va se fermer automatiquement...</p>
                </div>
            `;
            document.body.appendChild(confirmDiv);
            
            // Fermer la fenêtre après 3 secondes
            setTimeout(() => {
                window.close();
                // Si window.close() ne fonctionne pas (certains navigateurs)
                window.location.href = 'about:blank';
            }, 3000);
        }

        // Empêcher la triche (désactiver les outils de développement, etc.)
        document.addEventListener('keydown', function(e) {
            // Désactiver F12, Ctrl+Shift+I, Ctrl+U, etc.
            if (e.key === 'F12' || 
                (e.ctrlKey && e.shiftKey && e.key === 'I') ||
                (e.ctrlKey && e.shiftKey && e.key === 'J') ||
                (e.ctrlKey && e.key === 'U')) {
                e.preventDefault();
                return false;
            }
        });

        // Désactiver le menu contextuel
        document.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            return false;
        });
    </script>
</body>
</html>
