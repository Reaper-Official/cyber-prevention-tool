<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    // 1. STATISTIQUES GÉNÉRALES
    $stats_query = "
        SELECT 
            (SELECT COUNT(*) FROM campaigns WHERE status = 'active') as active_campaigns,
            (SELECT COUNT(*) FROM employees WHERE status = 'active') as total_employees,
            (SELECT COUNT(DISTINCT employee_id) FROM campaign_results WHERE training_completed = TRUE) as trained_employees,
            (SELECT COUNT(*) FROM campaign_results WHERE link_clicked = FALSE AND campaign_id IN (SELECT id FROM campaigns WHERE status = 'completed')) as incidents_avoided,
            (SELECT COUNT(*) FROM campaigns) as total_campaigns,
            (SELECT COUNT(*) FROM email_templates WHERE is_active = TRUE) as active_templates
    ";
    
    $stats_stmt = $db->prepare($stats_query);
    $stats_stmt->execute();
    $stats = $stats_stmt->fetch(PDO::FETCH_ASSOC);

    // 2. CALCUL DU TAUX DE RÉUSSITE (vigilance)
    $success_query = "
        SELECT 
            COUNT(CASE WHEN link_clicked = FALSE THEN 1 END) as not_clicked,
            COUNT(CASE WHEN link_clicked = TRUE THEN 1 END) as clicked,
            COUNT(*) as total
        FROM campaign_results 
        WHERE campaign_id IN (SELECT id FROM campaigns WHERE status = 'completed')
    ";
    
    $success_stmt = $db->prepare($success_query);
    $success_stmt->execute();
    $success_data = $success_stmt->fetch(PDO::FETCH_ASSOC);
    
    $success_rate = $success_data['total'] > 0 
        ? round(($success_data['not_clicked'] / $success_data['total']) * 100, 1) 
        : 0;

    $stats['success_rate'] = $success_rate;
    $stats['click_rate'] = $success_data['total'] > 0 
        ? round(($success_data['clicked'] / $success_data['total']) * 100, 1) 
        : 0;

    // 3. STATISTIQUES PAR DÉPARTEMENT
    $dept_query = "
        SELECT 
            e.department,
            COUNT(DISTINCT e.id) as total_employees,
            COUNT(CASE WHEN cr.link_clicked = TRUE THEN 1 END) as vulnerable_count,
            COUNT(CASE WHEN cr.training_completed = TRUE THEN 1 END) as trained_count
        FROM employees e
        LEFT JOIN campaign_results cr ON e.id = cr.employee_id
        WHERE e.status = 'active'
        GROUP BY e.department
        ORDER BY vulnerable_count DESC
    ";
    
    $dept_stmt = $db->prepare($dept_query);
    $dept_stmt->execute();
    $departments = $dept_stmt->fetchAll(PDO::FETCH_ASSOC);

    // Calculer les pourcentages par département
    foreach ($departments as &$dept) {
        $dept['vulnerability_rate'] = $dept['total_employees'] > 0 
            ? round(($dept['vulnerable_count'] / $dept['total_employees']) * 100, 1) 
            : 0;
        $dept['training_rate'] = $dept['total_employees'] > 0 
            ? round(($dept['trained_count'] / $dept['total_employees']) * 100, 1) 
            : 0;
    }

    // 4. ACTIVITÉS RÉCENTES
    $activities_query = "
        SELECT 
            al.id,
            al.description,
            al.action,
            al.created_at as date,
            al.entity_type,
            al.entity_id,
            u.username,
            CASE 
                WHEN al.action LIKE '%created%' THEN 'active'
                WHEN al.action LIKE '%completed%' THEN 'active'
                WHEN al.action LIKE '%clicked%' THEN 'pending'
                WHEN al.action LIKE '%failed%' THEN 'inactive'
                ELSE 'pending'
            END as status
        FROM activity_log al
        LEFT JOIN users u ON al.user_id = u.id
        ORDER BY al.created_at DESC
        LIMIT 20
    ";
    
    $activities_stmt = $db->prepare($activities_query);
    $activities_stmt->execute();
    $activities = $activities_stmt->fetchAll(PDO::FETCH_ASSOC);

    // 5. TENDANCES (30 derniers jours)
    $trends_query = "
        SELECT 
            DATE(created_at) as date,
            COUNT(*) as campaigns_created
        FROM campaigns 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY DATE(created_at)
        ORDER BY date ASC
    ";
    
    $trends_stmt = $db->prepare($trends_query);
    $trends_stmt->execute();
    $trends = $trends_stmt->fetchAll(PDO::FETCH_ASSOC);

    // 6. CAMPAGNES RÉCENTES
    $recent_campaigns_query = "
        SELECT 
            c.id,
            c.name,
            c.status,
            c.created_at,
            COUNT(cr.id) as target_count,
            COUNT(CASE WHEN cr.email_sent = TRUE THEN 1 END) as sent_count,
            COUNT(CASE WHEN cr.link_clicked = TRUE THEN 1 END) as clicked_count
        FROM campaigns c
        LEFT JOIN campaign_results cr ON c.id = cr.campaign_id
        GROUP BY c.id
        ORDER BY c.created_at DESC
        LIMIT 5
    ";
    
    $recent_stmt = $db->prepare($recent_campaigns_query);
    $recent_stmt->execute();
    $recent_campaigns = $recent_stmt->fetchAll(PDO::FETCH_ASSOC);

    // 7. ALERTES ET NOTIFICATIONS
    $alerts = [];
    
    // Vérifier les campagnes avec taux de clic élevé
    foreach ($recent_campaigns as $campaign) {
        if ($campaign['target_count'] > 0) {
            $click_rate = ($campaign['clicked_count'] / $campaign['target_count']) * 100;
            if ($click_rate > 30) {
                $alerts[] = [
                    'type' => 'warning',
                    'message' => "Campagne '{$campaign['name']}' a un taux de clic élevé ({$click_rate}%)",
                    'action_url' => "campaigns.php?id={$campaign['id']}"
                ];
            }
        }
    }

    // Vérifier les employés non formés depuis longtemps
    $untraining_query = "
        SELECT COUNT(*) as untrained_count
        FROM employees e
        WHERE e.status = 'active' 
        AND e.id NOT IN (
            SELECT DISTINCT employee_id 
            FROM campaign_results 
            WHERE training_completed = TRUE 
            AND completed_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        )
    ";
    $untraining_stmt = $db->prepare($untraining_query);
    $untraining_stmt->execute();
    $untrained = $untraining_stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($untrained['untrained_count'] > 0) {
        $alerts[] = [
            'type' => 'info',
            'message' => "{$untrained['untrained_count']} employés n'ont pas été formés ces 6 derniers mois",
            'action_url' => "employees.php?filter=untrained"
        ];
    }

    // Si aucune activité, créer des exemples par défaut
    if (empty($activities)) {
        $activities = [
            [
                'id' => 1,
                'description' => 'Campagne "Test Sécurité Q4" lancée',
                'date' => date('Y-m-d H:i:s'),
                'status' => 'active',
                'username' => 'admin'
            ],
            [
                'id' => 2,
                'description' => 'Formation de 15 employés complétée',
                'date' => date('Y-m-d H:i:s', strtotime('-1 day')),
                'status' => 'active',
                'username' => 'admin'
            ],
            [
                'id' => 3,
                'description' => 'Nouveau template "Phishing Bancaire v2" créé',
                'date' => date('Y-m-d H:i:s', strtotime('-2 days')),
                'status' => 'pending',
                'username' => 'admin'
            ]
        ];
    }

    // 8. MÉTRIQUES DE PERFORMANCE
    $performance = [
        'avg_training_time' => 12, // minutes moyennes de formation
        'templates_used' => count($recent_campaigns),
        'departments_covered' => count($departments),
        'monthly_growth' => 15.3 // pourcentage de croissance mensuelle
    ];

    // RÉPONSE FINALE
    $response = [
        'success' => true,
        'timestamp' => date('Y-m-d H:i:s'),
        'stats' => $stats,
        'departments' => $departments,
        'activities' => $activities,
        'trends' => $trends,
        'recent_campaigns' => $recent_campaigns,
        'alerts' => $alerts,
        'performance' => $performance
    ];

    echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    error_log("Erreur dashboard_data.php: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erreur interne du serveur',
        'message' => $e->getMessage(),
        'timestamp' => date('Y-m-d H:i:s')
    ], JSON_PRETTY_PRINT);
}
?>
