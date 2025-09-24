<?php
// warning.php - Page d'avertissement immédiate après clic
$campaign_id = intval($_GET['c'] ?? 0);
$employee_id = intval($_GET['e'] ?? 0);
$file = $_GET['file'] ?? '';

if (!$campaign_id || !$employee_id) {
    header('Location: /error.html');
    exit;
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🚨 ALERTE SÉCURITÉ - PhishGuard</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #ff4757, #ff3742);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow-x: hidden;
        }

        .warning-container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 30px 60px rgba(0,0,0,0.3);
            max-width: 700px;
            width: 95%;
            overflow: hidden;
            animation: emergencyPulse 0.8s ease-out;
            position: relative;
        }

        @keyframes emergencyPulse {
            0% { 
                opacity: 0; 
                transform: scale(0.8) rotate(-2deg); 
            }
            50% { 
                transform: scale(1.05) rotate(1deg); 
            }
            100% { 
                opacity: 1; 
                transform: scale(1) rotate(0deg); 
            }
        }

        .alert-header {
            background: linear-gradient(135deg, #ff4757, #c44569);
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
            background: 
                repeating-linear-gradient(
                    45deg,
                    transparent,
                    transparent 15px,
                    rgba(255,255,255,0.1) 15px,
                    rgba(255,255,255,0.1) 30px
                );
            animation: warningSlide 3s linear infinite;
        }

        @keyframes warningSlide {
            0% { transform: translateX(-30px); }
            100% { transform: translateX(30px); }
        }

        .danger-icon {
            font-size: 5rem;
            margin-bottom: 1rem;
            animation: dangerShake 0.8s ease-in-out infinite alternate;
            position: relative;
            z-index: 2;
            text-shadow: 0 0 20px rgba(255,255,255,0.5);
        }

        @keyframes dangerShake {
            0% { 
                transform: rotate(-8deg) scale(1); 
                filter: drop-shadow(0 0 10px rgba(255,255,255,0.8));
            }
            100% { 
                transform: rotate(8deg) scale(1.1); 
                filter: drop-shadow(0 0 20px rgba(255,255,255,1));
            }
        }

        .warning-title {
            font-size: 3rem;
            font-weight: 900;
            margin-bottom: 0.5rem;
            position: relative;
            z-index: 2;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            letter-spacing: 2px;
        }

        .warning-subtitle {
            font-size: 1.3rem;
            opacity: 0.95;
            position: relative;
            z-index: 2;
            font-weight: 600;
        }

        .content {
            padding: 2.5rem;
        }

        .critical-alert {
            background: linear-gradient(135deg, #fff5f5, #fed7d7);
            border: 3px solid #fc8181;
            border-radius: 15px;
            padding: 2rem;
            margin: 2rem 0;
            text-align: center;
            position: relative;
            overflow: hidden;
        }

        .critical-alert::before {
            content: '⚠️';
            position: absolute;
            top: -10px;
            left: -10px;
            font-size: 8rem;
            opacity: 0.1;
            animation: rotate 4s linear infinite;
        }

        @keyframes rotate {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .alert-text {
            font-size: 1.3rem;
            font-weight: 700;
            color: #c53030;
            margin-bottom: 1rem;
            position: relative;
            z-index: 2;
        }

        .alert-description {
            font-size: 1.1rem;
            color: #4a5568;
            position: relative;
            z-index: 2;
            line-height: 1.6;
        }

        .consequences-box {
            background: linear-gradient(135deg, #fffbf0, #fef5e7);
            border-radius: 15px;
            padding: 2rem;
            margin: 2rem 0;
            border-left: 6px solid #ed8936;
        }

        .consequences-title {
            color: #c05621;
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 1.5rem;
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .danger-list {
            list-style: none;
            padding: 0;
        }

        .danger-list li {
            padding: 1rem 0;
            display: flex;
            align-items: flex-start;
            gap: 1rem;
            border-bottom: 1px solid rgba(237,137,54,0.2);
            animation: slideIn 0.5s ease-out forwards;
            opacity: 0;
            transform: translateX(-20px);
        }

        .danger-list li:nth-child(1) { animation-delay: 0.1s; }
        .danger-list li:nth-child(2) { animation-delay: 0.2s; }
        .danger-list li:nth-child(3) { animation-delay: 0.3s; }
        .danger-list li:nth-child(4) { animation-delay: 0.4s; }
        .danger-list li:nth-child(5) { animation-delay: 0.5s; }

        @keyframes slideIn {
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }

        .danger-list li:last-child {
            border-bottom: none;
        }

        .danger-icon {
            color: #e53e3e;
            font-size: 1.3rem;
            margin-top: 0.2rem;
            min-width: 25px;
        }

        .immediate-action {
            background: linear-gradient(135deg, #e6fffa, #b2f5ea);
            border-radius: 15px;
            padding: 2rem;
            margin: 2rem 0;
            border-left: 6px solid #38b2ac;
        }

        .action-title {
            color: #2c7a7b;
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 1.5rem;
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .countdown-container {
            text-align: center;
            margin: 2rem 0;
            padding: 1.5rem;
            background: linear-gradient(135deg, #f7fafc, #edf2f7);
            border-radius: 15px;
            border: 2px dashed #a0aec0;
        }

        .countdown-text {
            font-size: 1.2rem;
            color: #4a5568;
            margin-bottom: 1rem;
        }

        .countdown-timer {
            font-size: 2.5rem;
            font-weight: 900;
            color: #e53e3e;
            font-family: 'Courier New', monospace;
            margin: 1rem 0;
            animation: countdownPulse 1s ease-in-out infinite alternate;
        }

        @keyframes countdownPulse {
            0% { transform: scale(1); opacity: 1; }
            100% { transform: scale(1.1); opacity: 0.8; }
        }

        .btn-container {
            text-align: center;
            margin: 2rem 0;
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
            justify-content: center;
        }

        .btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 1rem 2rem;
            border: none;
            border-radius: 50px;
            font-size: 1.1rem;
            font-weight: 600;
            text-decoration: none;
            cursor: pointer;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 1px;
            min-width: 200px;
            justify-content: center;
        }

        .btn-primary {
            background: linear-gradient(135deg, #4299e1, #3182ce);
            color: white;
            box-shadow: 0 4px 15px rgba(66,153,225,0.4);
        }

        .btn-primary:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 25px rgba(66,153,225,0.6);
        }

        .btn-secondary {
            background: linear-gradient(135deg, #ed8936, #dd6b20);
            color: white;
            box-shadow: 0 4px 15px rgba(237,137,54,0.4);
        }

        .btn-secondary:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 25px rgba(237,137,54,0.6);
        }

        .footer {
            background: linear-gradient(135deg, #f7fafc, #edf2f7);
            padding: 2rem;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }

        .footer-text {
            color: #4a5568;
            font-size: 0.95rem;
            line-height: 1.6;
        }

        .footer-highlight {
            color: #2d3748;
            font-weight: 700;
        }

        /* Effets de particules d'alerte */
        .particle {
            position: absolute;
            color: rgba(255,255,255,0.8);
            font-size: 1rem;
            animation: floatUp 3s linear infinite;
            pointer-events: none;
        }

        @keyframes floatUp {
            0% {
                opacity: 1;
                transform: translateY(0) rotate(0deg);
            }
            100% {
                opacity: 0;
                transform: translateY(-100px) rotate(360deg);
            }
        }

        @media (max-width: 768px) {
            .warning-container {
                width: 100%;
                margin: 0;
                border-radius: 0;
            }
            
            .content {
                padding: 1.5rem;
            }
            
            .warning-title {
                font-size: 2rem;
            }
            
            .countdown-timer {
                font-size: 2rem;
            }
            
            .btn-container {
                flex-direction: column;
                align-items: center;
            }
            
            .btn {
                width: 100%;
                max-width: 300px;
            }
        }

        /* Animation des éléments au chargement */
        .fade-in {
            animation: fadeInUp 0.8s ease-out forwards;
            opacity: 0;
            transform: translateY(30px);
        }

        .fade-in-delay-1 { animation-delay: 0.2s; }
        .fade-in-delay-2 { animation-delay: 0.4s; }
        .fade-in-delay-3 { animation-delay: 0.6s; }

        @keyframes fadeInUp {
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    </style>
</head>
<body>
    <div class="warning-container">
        <div class="alert-header">
            <div class="danger-icon">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <h1 class="warning-title">DANGER!</h1>
            <p class="warning-subtitle">Simulation de Phishing - Test de Sécurité</p>
        </div>

        <div class="content">
            <div class="critical-alert fade-in">
                <div class="alert-text">
                    🚨 VOUS VENEZ DE TOMBER DANS UN PIÈGE DE PHISHING!
                </div>
                <p class="alert-description">
                    Si ceci avait été une vraie attaque, votre entreprise serait maintenant compromise. 
                    Heureusement, c'était une simulation contrôlée pour tester votre vigilance.
                </p>
            </div>

            <div class="consequences-box fade-in fade-in-delay-1">
                  <h3 class="consequences-title">
                    <i class="fas fa-skull-crossbones"></i>
                    Conséquences possibles d'une vraie attaque :
                </h3>
                <ul class="danger-list">
                    <li>
                        <i class="fas fa-virus danger-icon"></i>
                        <div>
                            <strong>Infection par malware :</strong> 
                            Installation de logiciels malveillants sur votre ordinateur et le réseau de l'entreprise
                        </div>
                    </li>
                    <li>
                        <i class="fas fa-key danger-icon"></i>
                        <div>
                            <strong>Vol d'identifiants :</strong> 
                            Capture de vos mots de passe, codes d'accès et informations personnelles
                        </div>
                    </li>
                    <li>
                        <i class="fas fa-database danger-icon"></i>
                        <div>
                            <strong>Accès aux données :</strong> 
                            Compromission des données confidentielles clients et de l'entreprise
                        </div>
                    </li>
                    <li>
                        <i class="fas fa-money-bill-wave danger-icon"></i>
                        <div>
                            <strong>Pertes financières :</strong> 
                            Fraudes, rançongiciels et coûts de récupération pouvant atteindre des millions
                        </div>
                    </li>
                    <li>
                        <i class="fas fa-gavel danger-icon"></i>
                        <div>
                            <strong>Sanctions légales :</strong> 
                            Amendes RGPD, poursuites judiciaires et responsabilité personnelle
                        </div>
                    </li>
                </ul>
            </div>

            <div class="immediate-action fade-in fade-in-delay-2">
                <h3 class="action-title">
                    <i class="fas fa-exclamation-circle"></i>
                    Action immédiate requise :
                </h3>
                <p style="font-size: 1.1rem; line-height: 1.6; color: #2c7a7b;">
                    <strong>1. Formation obligatoire :</strong> Vous devez suivre le module de formation de sécurité (10-15 minutes)<br>
                    <strong>2. Quiz de validation :</strong> Démontrez que vous maîtrisez les bonnes pratiques<br>
                    <strong>3. Engagement :</strong> Appliquez ces connaissances dans votre travail quotidien
                </p>
            </div>

            <div class="countdown-container fade-in fade-in-delay-3">
                <p class="countdown-text">
                    <strong>Redirection automatique vers la formation dans :</strong>
                </p>
                <div class="countdown-timer" id="countdown">15</div>
                <p style="color: #e53e3e; font-weight: 600;">
                    Cette formation est obligatoire et sera enregistrée dans votre dossier
                </p>
            </div>

            <div class="btn-container">
                <button class="btn btn-primary" onclick="startTrainingNow()">
                    <i class="fas fa-play-circle"></i>
                    Commencer la formation maintenant
                </button>
                <button class="btn btn-secondary" onclick="reportIssue()">
                    <i class="fas fa-bug"></i>
                    Signaler un problème technique
                </button>
            </div>

            <?php if ($file): ?>
            <div class="critical-alert" style="margin-top: 2rem;">
                <div class="alert-text">⚠️ ATTENTION - TÉLÉCHARGEMENT BLOQUÉ</div>
                <p class="alert-description">
                    Vous avez tenté de télécharger le fichier : <strong><?= htmlspecialchars($file) ?></strong><br>
                    Dans un vrai scénario, ce fichier aurait pu contenir un virus ou un rançongiciel.
                </p>
            </div>
            <?php endif; ?>
        </div>

        <div class="footer">
            <p class="footer-text">
                <span class="footer-highlight">Cette simulation était autorisée par votre entreprise</span><br>
                dans le cadre de l'amélioration continue de la cybersécurité.<br><br>
                <strong>Aucune donnée personnelle n'a été collectée ou compromise.</strong><br>
                L'objectif est purement éducatif pour renforcer vos défenses contre les vraies menaces.
            </p>
        </div>
    </div>

    <script>
        // Variables globales
        const campaignId = <?= $campaign_id ?>;
        const employeeId = <?= $employee_id ?>;
        let countdownValue = 15;
        let countdownInterval;
        
        // Initialisation
        document.addEventListener('DOMContentLoaded', function() {
            initializePage();
            startCountdown();
            createParticleEffect();
            
            // Empêcher le retour en arrière
            preventBackButton();
            
            // Bloquer certaines actions
            blockDevTools();
        });

        function initializePage() {
            // Ajouter des animations aux éléments
            const elements = document.querySelectorAll('.fade-in');
            elements.forEach(el => {
                el.style.opacity = '0';
                el.style.transform = 'translateY(30px)';
            });
            
            // Déclencher les animations
            setTimeout(() => {
                elements.forEach((el, index) => {
                    setTimeout(() => {
                        el.style.transition = 'all 0.8s ease-out';
                        el.style.opacity = '1';
                        el.style.transform = 'translateY(0)';
                    }, index * 200);
                });
            }, 100);
        }

        function startCountdown() {
            const countdownElement = document.getElementById('countdown');
            
            countdownInterval = setInterval(() => {
                countdownValue--;
                countdownElement.textContent = countdownValue;
                
                // Changement de couleur selon le temps restant
                if (countdownValue <= 5) {
                    countdownElement.style.color = '#e53e3e';
                    countdownElement.style.fontSize = '3rem';
                } else if (countdownValue <= 10) {
                    countdownElement.style.color = '#ed8936';
                }
                
                // Redirection automatique
                if (countdownValue <= 0) {
                    clearInterval(countdownInterval);
                    startTrainingNow();
                }
            }, 1000);
        }

        function startTrainingNow() {
            // Arrêter le countdown
            if (countdownInterval) {
                clearInterval(countdownInterval);
            }
            
            // Afficher un message de transition
            showTransitionMessage();
            
            // Redirection vers la formation
            setTimeout(() => {
                window.location.href = `training.php?c=${campaignId}&e=${employeeId}`;
            }, 2000);
        }

        function showTransitionMessage() {
            const overlay = document.createElement('div');
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                animation: fadeIn 0.5s ease-out;
            `;
            
            overlay.innerHTML = `
                <div style="text-align: center; color: white; padding: 2rem;">
                    <div style="font-size: 4rem; margin-bottom: 1rem;">
                        <i class="fas fa-graduation-cap"></i>
                    </div>
                    <h2 style="font-size: 2rem; margin-bottom: 1rem;">Chargement de la formation...</h2>
                    <div style="display: flex; justify-content: center; gap: 0.5rem;">
                        <div class="loading-dot" style="width: 10px; height: 10px; background: #4299e1; border-radius: 50%; animation: bounce 1.4s ease-in-out infinite both;"></div>
                        <div class="loading-dot" style="width: 10px; height: 10px; background: #4299e1; border-radius: 50%; animation: bounce 1.4s ease-in-out 0.16s infinite both;"></div>
                        <div class="loading-dot" style="width: 10px; height: 10px; background: #4299e1; border-radius: 50%; animation: bounce 1.4s ease-in-out 0.32s infinite both;"></div>
                    </div>
                    <p style="margin-top: 1rem; opacity: 0.8;">Préparation du module de formation personnalisé...</p>
                </div>
            `;
            
            // Styles pour l'animation de loading
            const style = document.createElement('style');
            style.textContent = `
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes bounce {
                    0%, 80%, 100% { 
                        transform: scale(0);
                    } 40% { 
                        transform: scale(1);
                    }
                }
            `;
            document.head.appendChild(style);
            document.body.appendChild(overlay);
        }

        function reportIssue() {
            const subject = encodeURIComponent('Problème technique - Simulation PhishGuard');
            const body = encodeURIComponent(`Bonjour,

Je signale un problème technique avec la simulation de phishing :

Campagne ID: ${campaignId}
Employé ID: ${employeeId}
Navigateur: ${navigator.userAgent}
Heure: ${new Date().toLocaleString()}

Description du problème:
[Veuillez décrire le problème ici]

Merci`);
            
            // Ouvrir le client email par défaut
            window.location.href = `mailto:support-it@votre-entreprise.com?subject=${subject}&body=${body}`;
            
            // Ou afficher un modal avec les instructions
            showContactModal();
        }

        function showContactModal() {
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                animation: fadeIn 0.3s ease-out;
            `;
            
            modal.innerHTML = `
                <div style="background: white; padding: 2rem; border-radius: 15px; max-width: 500px; width: 90%; text-align: center;">
                    <h3 style="color: #2d3748; margin-bottom: 1rem;">
                        <i class="fas fa-headset" style="color: #4299e1; margin-right: 0.5rem;"></i>
                        Support Technique
                    </h3>
                    <p style="margin-bottom: 1.5rem; line-height: 1.6;">
                        Pour signaler un problème technique avec cette formation :
                    </p>
                    <div style="background: #f7fafc; padding: 1rem; border-radius: 8px; margin: 1rem 0; text-align: left;">
                        <strong>📧 Email :</strong> reaper@etik.com <br>
                    </div>
                    <button onclick="this.parentElement.parentElement.remove()" 
                            style="background: #4299e1; color: white; border: none; padding: 0.75rem 1.5rem; 
                                   border-radius: 25px; cursor: pointer; font-weight: 600;">
                        <i class="fas fa-times"></i> Fermer
                    </button>
                </div>
            `;
            
            document.body.appendChild(modal);
        }

        function createParticleEffect() {
            const header = document.querySelector('.alert-header');
            const particles = ['⚠️', '🚨', '⚡', '🔥', '💀'];
            
            setInterval(() => {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.textContent = particles[Math.floor(Math.random() * particles.length)];
                particle.style.left = Math.random() * 100 + '%';
                particle.style.animationDuration = (Math.random() * 3 + 2) + 's';
                
                header.appendChild(particle);
                
                setTimeout(() => {
                    if (particle.parentNode) {
                        particle.parentNode.removeChild(particle);
                    }
                }, 5000);
            }, 1500);
        }

        function preventBackButton() {
            // Empêcher le retour en arrière
            history.pushState(null, null, location.href);
            window.onpopstate = function(event) {
                history.go(1);
            };
        }

        function blockDevTools() {
            // Désactiver le clic droit
            document.addEventListener('contextmenu', function(e) {
                e.preventDefault();
                return false;
            });
            
            // Désactiver les raccourcis clavier de développeur
            document.addEventListener('keydown', function(e) {
                // F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, Ctrl+Shift+C
                if (e.key === 'F12' || 
                    (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
                    (e.ctrlKey && e.key === 'U')) {
                    e.preventDefault();
                    
                    // Afficher un message d'avertissement
                    showDevToolsWarning();
                    return false;
                }
            });
        }

        function showDevToolsWarning() {
            const warning = document.createElement('div');
            warning.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #fed7d7;
                color: #c53030;
                padding: 1rem;
                border-radius: 8px;
                border: 2px solid #fc8181;
                z-index: 10000;
                font-weight: 600;
                animation: slideIn 0.3s ease-out;
            `;
            warning.innerHTML = `
                <i class="fas fa-exclamation-triangle"></i>
                Les outils de développement sont désactivés pendant la formation
            `;
            
            document.body.appendChild(warning);
            
            setTimeout(() => {
                if (warning.parentNode) {
                    warning.style.animation = 'slideOut 0.3s ease-in';
                    setTimeout(() => {
                        warning.parentNode.removeChild(warning);
                    }, 300);
                }
            }, 3000);
        }

        // Suivi du temps passé sur la page
        const startTime = Date.now();
        window.addEventListener('beforeunload', function() {
            const timeSpent = Math.floor((Date.now() - startTime) / 1000);
            
            // Envoyer les données de tracking (si nécessaire)
            if (navigator.sendBeacon) {
                const data = new FormData();
                data.append('action', 'warning_page_time');
                data.append('campaign_id', campaignId);
                data.append('employee_id', employeeId);
                data.append('time_spent', timeSpent);
                
                navigator.sendBeacon('api/tracking.php', data);
            }
        });

        // Sons d'alerte (optionnel)
        function playAlertSound() {
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
                oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
                
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.setValueAtTime(0, audioContext.currentTime + 0.3);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.3);
            } catch (e) {
                console.log('Audio not supported');
            }
        }

        // Jouer le son d'alerte au chargement (après interaction utilisateur)
        document.addEventListener('click', function() {
            playAlertSound();
        }, { once: true });
    </script>
</body>
</html>
