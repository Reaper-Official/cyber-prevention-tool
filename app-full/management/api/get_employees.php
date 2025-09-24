<?php
// api/get_employees.php - Récupération de la liste des employés
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Gestion des requêtes OPTIONS (CORS preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    // Paramètres de pagination et filtrage
    $page = max(1, intval($_GET['page'] ?? 1));
    $limit = min(100, max(5, intval($_GET['limit'] ?? 20)));
    $offset = ($page - 1) * $limit;
    
    // Filtres
    $department_filter = trim($_GET['department'] ?? '');
    $status_filter = trim($_GET['status'] ?? '');
    $search = trim($_GET['search'] ?? '');
    $risk_level = trim($_GET['risk_level'] ?? '');
    $sort_by = $_GET['sort_by'] ?? 'created_at';
    $sort_order = strtoupper($_GET['sort_order'] ?? 'DESC') === 'ASC' ? 'ASC' : 'DESC';

    // Validation du tri
    $allowed_sort_fields = ['full_name', 'email', 'department', 'position', 'created_at', 'updated_at', 'risk_level'];
    if (!in_array($sort_by, $allowed_sort_fields)) {
        $sort_by = 'created_at';
    }

    // Construction des conditions WHERE
    $where_conditions = ["e.status != 'deleted'"];
    $params = [];

    if (!empty($department_filter)) {
        $where_conditions[] = "e.department = :department";
        $params[':department'] = $department_filter;
    }

    if (!empty($status_filter) && in_array($status_filter, ['active', 'inactive', 'pending'])) {
        $where_conditions[] = "e.status = :status";
        $params[':status'] = $status_filter;
    }

    if (!empty($risk_level) && in_array($risk_level, ['low', 'medium', 'high'])) {
        $where_conditions[] = "e.risk_level = :risk_level";
        $params[':risk_level'] = $risk_level;
    }

    if (!empty($search)) {
        $where_conditions[] = "(
            e.full_name ILIKE :search 
            OR e.email ILIKE :search 
            OR e.position ILIKE :search
            OR e.department ILIKE :search
        )";
        $params[':search'] = "%{$search}%";
    }

    $where_clause = "WHERE " . implode(" AND ", $where_conditions);

    // Requête principale avec statistiques
    $employees_query = "
        SELECT 
            e.id,
            e.full_name,
            e.email,
            e.department,
            e.position,
            e.risk_level,
            e.status,
            e.phone,
            e.location,
            e.hire_date,
            e.created_at,
            e.updated_at,
            m.full_name as manager_name,
            m.id as manager_id,
            COUNT(DISTINCT cr.id) as campaigns_participated,
            COUNT(CASE WHEN cr.training_completed = TRUE THEN 1 END) as trainings_completed,
            COUNT(CASE WHEN cr.link_clicked = TRUE THEN 1 END) as phishing_clicked,
            AVG(CASE WHEN cr.quiz_score IS NOT NULL THEN cr.quiz_score END) as avg_quiz_score
        FROM employees e
        LEFT JOIN employees m ON e.manager_id = m.id
        LEFT JOIN campaign_results cr ON e.id = cr.employee_id
        {$where_clause}
        GROUP BY e.id, m.full_name, m.id
        ORDER BY e.{$sort_by} {$sort_order}
        LIMIT :limit OFFSET :offset
    ";

    $employees_stmt = $db->prepare($employees_query);
    
    // Bind des paramètres
    foreach ($params as $key => $value) {
        $employees_stmt->bindValue($key, $value);
    }
    $employees_stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $employees_stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    
    $employees_stmt->execute();
    $employees = $employees_stmt->fetchAll(PDO::FETCH_ASSOC);

    // Requête pour le total (pour pagination)
    $count_query = "SELECT COUNT(*) as total FROM employees e {$where_clause}";
    $count_stmt = $db->prepare($count_query);
    foreach ($params as $key => $value) {
        $count_stmt->bindValue($key, $value);
    }
    $count_stmt->execute();
    $total_employees = $count_stmt->fetch(PDO::FETCH_ASSOC)['total'];

    // Statistiques globales
    $stats_query = "
        SELECT 
            COUNT(*) as total,
            COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
            COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive,
            COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
            COUNT(CASE WHEN risk_level = 'high' THEN 1 END) as high_risk,
            COUNT(CASE WHEN risk_level = 'medium' THEN 1 END) as medium_risk,
            COUNT(CASE WHEN risk_level = 'low' THEN 1 END) as low_risk
        FROM employees 
        WHERE status != 'deleted'
    ";
    $stats_stmt = $db->prepare($stats_query);
    $stats_stmt->execute();
    $global_stats = $stats_stmt->fetch(PDO::FETCH_ASSOC);

    // Enrichissement et formatage des données
    foreach ($employees as &$employee) {
        // Formatage des dates
        $employee['created_at_formatted'] = $employee['created_at'] ? 
            date('d/m/Y H:i', strtotime($employee['created_at'])) : null;
        $employee['updated_at_formatted'] = $employee['updated_at'] ? 
            date('d/m/Y H:i', strtotime($employee['updated_at'])) : null;
        $employee['hire_date_formatted'] = $employee['hire_date'] ? 
            date('d/m/Y', strtotime($employee['hire_date'])) : null;

        // Labels traduits
        $employee['status_label'] = [
            'active' => 'Actif',
            'inactive' => 'Inactif',
            'pending' => 'En attente'
        ][$employee['status']] ?? $employee['status'];

        $employee['risk_level_label'] = [
            'low' => 'Faible',
            'medium' => 'Moyen',
            'high' => 'Élevé'
        ][$employee['risk_level']] ?? $employee['risk_level'];

        // Couleurs pour l'interface
        $employee['status_color'] = [
            'active' => 'success',
            'inactive' => 'secondary',
            'pending' => 'warning'
        ][$employee['status']] ?? 'secondary';

        $employee['risk_color'] = [
            'low' => 'success',
            'medium' => 'warning',
            'high' => 'danger'
        ][$employee['risk_level']] ?? 'secondary';

        // Calculs de sécurité
        $total_campaigns = intval($employee['campaigns_participated']);
        $clicked_campaigns = intval($employee['phishing_clicked']);
        
        if ($total_campaigns > 0) {
            $employee['vulnerability_rate'] = round(($clicked_campaigns / $total_campaigns) * 100, 1);
        } else {
            $employee['vulnerability_rate'] = 0;
        }

        $employee['training_completion_rate'] = $clicked_campaigns > 0 ? 
            round((intval($employee['trainings_completed']) / $clicked_campaigns) * 100, 1) : 0;

        // Score moyen formaté
        $employee['avg_quiz_score'] = $employee['avg_quiz_score'] ? 
            round(floatval($employee['avg_quiz_score']), 1) : null;

        // Conversion en entiers
        $employee['campaigns_participated'] = intval($employee['campaigns_participated']);
        $employee['trainings_completed'] = intval($employee['trainings_completed']);
        $employee['phishing_clicked'] = intval($employee['phishing_clicked']);
    }

    // Récupération de la liste des départements (pour filtres)
    $departments_query = "
        SELECT department, COUNT(*) as count 
        FROM employees 
        WHERE status != 'deleted' 
        GROUP BY department 
        ORDER BY count DESC, department ASC
    ";
    $departments_stmt = $db->prepare($departments_query);
    $departments_stmt->execute();
    $departments = $departments_stmt->fetchAll(PDO::FETCH_ASSOC);

    // Métadonnées de pagination
    $pagination = [
        'current_page' => $page,
        'per_page' => $limit,
        'total' => intval($total_employees),
        'total_pages' => ceil($total_employees / $limit),
        'has_more' => ($page * $limit) < $total_employees,
        'from' => $offset + 1,
        'to' => min($offset + $limit, $total_employees)
    ];

    // Réponse finale
    echo json_encode([
        'success' => true,
        'timestamp' => date('Y-m-d H:i:s'),
        'employees' => $employees,
        'pagination' => $pagination,
        'filters' => [
            'department' => $department_filter,
            'status' => $status_filter,
            'search' => $search,
            'risk_level' => $risk_level,
            'sort_by' => $sort_by,
            'sort_order' => $sort_order
        ],
        'statistics' => [
            'global' => $global_stats,
            'departments' => $departments
        ]
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    error_log("Erreur get_employees.php: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erreur serveur',
        'message' => 'Erreur lors de la récupération des employés',
        'timestamp' => date('Y-m-d H:i:s')
    ], JSON_PRETTY_PRINT);
}
?>
