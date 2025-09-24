<?php
// api/auth/login.php - Authentification des utilisateurs
session_start();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Gestion des requêtes OPTIONS (CORS preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../../config/database.php';
require_once '../../utils/logger.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();
    $logger = new Logger($db);

    // Récupération des données de connexion
    $input = json_decode(file_get_contents('php://input'), true);
    
    $username = trim($input['username'] ?? $_POST['username'] ?? '');
    $password = $input['password'] ?? $_POST['password'] ?? '';
    $remember_me = $input['remember'] ?? $_POST['remember'] ?? false;
    $ip_address = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';

    // Validation des données
    if (empty($username) || empty($password)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Données manquantes',
            'message' => 'Nom d\'utilisateur et mot de passe requis'
        ]);
        exit;
    }

    // Vérification du nombre de tentatives récentes (protection brute force)
    $attempt_check_query = "
        SELECT COUNT(*) as attempt_count
        FROM activity_log 
        WHERE action = 'login_failed' 
            AND description LIKE :username_pattern
            AND created_at > NOW() - INTERVAL '15 minutes'
    ";
    $attempt_stmt = $db->prepare($attempt_check_query);
    $attempt_stmt->bindValue(':username_pattern', "%{$username}%");
    $attempt_stmt->execute();
    $attempt_count = $attempt_stmt->fetch(PDO::FETCH_ASSOC)['attempt_count'];

    if ($attempt_count >= 5) {
        // Log de tentative bloquée
        $logger->logActivity(
            null,
            'login_blocked',
            "Tentatives de connexion bloquées pour: {$username} (IP: {$ip_address})",
            'security',
            null
        );

        http_response_code(429);
        echo json_encode([
            'success' => false,
            'error' => 'Trop de tentatives',
            'message' => 'Compte temporairement bloqué. Réessayez dans 15 minutes.',
            'retry_after' => 900 // 15 minutes
        ]);
        exit;
    }

    // Récupération de l'utilisateur
    $user_query = "
        SELECT 
            id, username, email, password, role, full_name, 
            is_active, last_login, created_at
        FROM users 
        WHERE (username = :username OR email = :username) 
            AND is_active = TRUE
    ";
    
    $user_stmt = $db->prepare($user_query);
    $user_stmt->bindParam(':username', $username);
    $user_stmt->execute();
    $user = $user_stmt->fetch(PDO::FETCH_ASSOC);

    // Vérification des identifiants
    if (!$user || !password_verify($password, $user['password'])) {
        // Log de tentative de connexion échouée
        $logger->logActivity(
            null,
            'login_failed',
            "Tentative de connexion échouée pour: {$username} (IP: {$ip_address})",
            'security',
            null
        );

        http_response_code(401);
        echo json_encode([
            'success' => false,
            'error' => 'Identifiants incorrects',
            'message' => 'Nom d\'utilisateur ou mot de passe invalide'
        ]);
        exit;
    }

    // Mise à jour de la dernière connexion
    $update_query = "UPDATE users SET last_login = NOW() WHERE id = :id";
    $update_stmt = $db->prepare($update_query);
    $update_stmt->bindParam(':id', $user['id']);
    $update_stmt->execute();

    // Génération d'un token de session sécurisé
    $session_token = bin2hex(random_bytes(32));
    $expires_at = $remember_me ? 
        date('Y-m-d H:i:s', strtotime('+30 days')) : 
        date('Y-m-d H:i:s', strtotime('+8 hours'));

    // Stockage de la session
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['username'] = $user['username'];
    $_SESSION['role'] = $user['role'];
    $_SESSION['full_name'] = $user['full_name'];
    $_SESSION['login_time'] = time();
    $_SESSION['session_token'] = $session_token;
    $_SESSION['expires_at'] = $expires_at;

    // Log de connexion réussie
    $logger->logActivity(
        $user['id'],
        'login_success',
        "Connexion réussie: {$user['full_name']} ({$user['role']}) depuis IP: {$ip_address}",
        'auth',
        $user['id']
    );

    // Préparation des données utilisateur (sans informations sensibles)
    $user_data = [
        'id' => $user['id'],
        'username' => $user['username'],
        'email' => $user['email'],
        'full_name' => $user['full_name'],
        'role' => $user['role'],
        'last_login' => $user['last_login'],
        'session_expires' => $expires_at,
        'permissions' => getUserPermissions($user['role'])
    ];

    // Configuration du cookie de session (si remember me)
    if ($remember_me) {
        setcookie(
            'phishguard_session',
            $session_token,
            [
                'expires' => strtotime('+30 days'),
                'path' => '/',
                'secure' => isset($_SERVER['HTTPS']),
                'httponly' => true,
                'samesite' => 'Strict'
            ]
        );
    }

    echo json_encode([
        'success' => true,
        'message' => 'Connexion réussie',
        'user' => $user_data,
        'session_token' => $session_token,
        'redirect_url' => '/management/index.html'
    ], JSON_PRETTY_PRINT);

} catch (Exception $e) {
    error_log("Erreur login.php: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erreur serveur',
        'message' => 'Une erreur interne s\'est produite'
    ]);
}

// Fonction helper pour les permissions
function getUserPermissions($role) {
    $permissions = [
        'admin' => [
            'campaigns' => ['create', 'read', 'update', 'delete'],
            'employees' => ['create', 'read', 'update', 'delete'],
            'templates' => ['create', 'read', 'update', 'delete'],
            'reports' => ['create', 'read', 'export'],
            'settings' => ['read', 'update'],
            'users' => ['create', 'read', 'update', 'delete']
        ],
        'reviewer' => [
            'campaigns' => ['read', 'update'],
            'employees' => ['read'],
            'templates' => ['read'],
            'reports' => ['read', 'export'],
            'settings' => ['read']
        ],
        'hr' => [
            'campaigns' => ['read'],
            'employees' => ['create', 'read', 'update'],
            'templates' => ['read'],
            'reports' => ['read']
        ],
        'employee' => [
            'training' => ['read', 'complete']
        ]
    ];

    return $permissions[$role] ?? [];
}
?>
