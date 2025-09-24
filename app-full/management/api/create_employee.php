<?php
// api/create_employee.php - Création et gestion des employés
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Gestion des requêtes OPTIONS (CORS preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../config/database.php';
require_once '../utils/logger.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();
    $logger = new Logger($db);

    // Récupération et validation des données
    $full_name = trim($_POST['fullName'] ?? '');
    $email = filter_var(trim($_POST['email'] ?? ''), FILTER_SANITIZE_EMAIL);
    $department = trim($_POST['department'] ?? '');
    $position = trim($_POST['position'] ?? '');
    $manager_id = !empty($_POST['manager_id']) ? intval($_POST['manager_id']) : null;
    $risk_level = $_POST['risk_level'] ?? 'medium';
    $phone = trim($_POST['phone'] ?? '');
    $location = trim($_POST['location'] ?? '');

    // Validation stricte des données
    $errors = [];
    
    if (empty($full_name) || strlen($full_name) < 2) {
        $errors[] = 'Le nom complet est obligatoire (minimum 2 caractères)';
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = 'Adresse email invalide';
    }

    if (empty($department)) {
        $errors[] = 'Le département est obligatoire';
    }

    if (empty($position)) {
        $errors[] = 'Le poste est obligatoire';
    }

    if (!in_array($risk_level, ['low', 'medium', 'high'])) {
        $risk_level = 'medium';
    }

    // Validation du numéro de téléphone (optionnel)
    if (!empty($phone) && !preg_match('/^[\+]?[0-9\s\-\(\)]{10,}$/', $phone)) {
        $errors[] = 'Format de téléphone invalide';
    }

    if (!empty($errors)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Données invalides',
            'messages' => $errors
        ]);
        exit;
    }

    // Vérifier l'unicité de l'email
    $check_query = "SELECT id, full_name FROM employees WHERE email = :email";
    $check_stmt = $db->prepare($check_query);
    $check_stmt->bindParam(':email', $email);
    $check_stmt->execute();

    if ($check_stmt->rowCount() > 0) {
        $existing = $check_stmt->fetch(PDO::FETCH_ASSOC);
        http_response_code(409);
        echo json_encode([
            'success' => false,
            'error' => 'Email déjà utilisé',
            'message' => "Un employé ({$existing['full_name']}) avec cet email existe déjà"
        ]);
        exit;
    }

    // Vérifier que le manager existe (si spécifié)
    if ($manager_id) {
        $manager_check = "SELECT id, full_name FROM employees WHERE id = :manager_id AND status = 'active'";
        $manager_stmt = $db->prepare($manager_check);
        $manager_stmt->bindParam(':manager_id', $manager_id);
        $manager_stmt->execute();

        if ($manager_stmt->rowCount() === 0) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => 'Manager invalide',
                'message' => 'Le manager spécifié est introuvable ou inactif'
            ]);
            exit;
        }
    }

    // Transaction pour l'insertion
    $db->beginTransaction();

    try {
        // Insertion de l'employé
        $insert_query = "
            INSERT INTO employees (
                full_name, email, department, position, 
                manager_id, risk_level, phone, location,
                status, created_at, updated_at
            ) VALUES (
                :full_name, :email, :department, :position, 
                :manager_id, :risk_level, :phone, :location,
                'active', NOW(), NOW()
            )
        ";

        $insert_stmt = $db->prepare($insert_query);
        $insert_stmt->bindParam(':full_name', $full_name);
        $insert_stmt->bindParam(':email', $email);
        $insert_stmt->bindParam(':department', $department);
        $insert_stmt->bindParam(':position', $position);
        $insert_stmt->bindParam(':manager_id', $manager_id);
        $insert_stmt->bindParam(':risk_level', $risk_level);
        $insert_stmt->bindParam(':phone', $phone);
        $insert_stmt->bindParam(':location', $location);

        if (!$insert_stmt->execute()) {
            throw new Exception('Erreur lors de l\'insertion en base de données');
        }

        $employee_id = $db->lastInsertId();

        // Log de l'activité
        $logger->logActivity(
            1, // ID admin par défaut (à adapter selon votre système d'auth)
            'employee_created',
            "Employé créé : {$full_name} ({$email}) - Département: {$department}, Poste: {$position}",
            'employee',
            $employee_id
        );

        // Validation de la transaction
        $db->commit();

        // Récupération des données complètes de l'employé créé
        $select_query = "
            SELECT 
                e.*,
                m.full_name as manager_name
            FROM employees e
            LEFT JOIN employees m ON e.manager_id = m.id
            WHERE e.id = :id
        ";
        
        $select_stmt = $db->prepare($select_query);
        $select_stmt->bindParam(':id', $employee_id);
        $select_stmt->execute();
        $employee_data = $select_stmt->fetch(PDO::FETCH_ASSOC);

        // Réponse de succès
        echo json_encode([
            'success' => true,
            'message' => 'Employé créé avec succès',
            'employee_id' => $employee_id,
            'data' => [
                'id' => $employee_data['id'],
                'full_name' => $employee_data['full_name'],
                'email' => $employee_data['email'],
                'department' => $employee_data['department'],
                'position' => $employee_data['position'],
                'risk_level' => $employee_data['risk_level'],
                'manager_name' => $employee_data['manager_name'],
                'status' => $employee_data['status'],
                'created_at' => $employee_data['created_at']
            ]
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

    } catch (Exception $e) {
        $db->rollback();
        throw $e;
    }

} catch (Exception $e) {
    error_log("Erreur create_employee.php: " . $e->getMessage());

    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erreur serveur',
        'message' => 'Une erreur interne s\'est produite lors de la création de l\'employé',
        'debug' => $_ENV['APP_DEBUG'] === 'true' ? $e->getMessage() : null
    ], JSON_PRETTY_PRINT);
}
?>
