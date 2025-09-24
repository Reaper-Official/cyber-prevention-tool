<?php
// api/auth/logout.php - Déconnexion des utilisateurs
session_start();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once '../../config/database.php';
require_once '../../utils/logger.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    $logger = new Logger($db);

    $user_id = $_SESSION['user_id'] ?? null;
    $username = $_SESSION['username'] ?? 'Inconnu';
    $ip_address = $_SERVER['REMOTE_ADDR'] ?? 'unknown';

    // Log de déconnexion
    if ($user_id) {
        $logger->logActivity(
            $user_id,
            'logout',
            "Déconnexion de: {$username} depuis IP: {$ip_address}",
            'auth',
            $user_id
        );
    }

    // Destruction de la session
    session_destroy();

    // Suppression des cookies
    if (isset($_COOKIE['phishguard_session'])) {
        setcookie(
            'phishguard_session',
            '',
            [
                'expires' => time() - 3600,
                'path' => '/',
                'secure' => isset($_SERVER['HTTPS']),
                'httponly' => true,
                'samesite' => 'Strict'
            ]
        );
    }

    echo json_encode([
        'success' => true,
        'message' => 'Déconnexion réussie',
        'redirect_url' => '/login.html'
    ]);

} catch (Exception $e) {
    error_log("Erreur logout.php: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erreur lors de la déconnexion'
    ]);
}
?>
