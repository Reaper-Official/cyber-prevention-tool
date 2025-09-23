
<?php
// api/generate_report.php - Génération de rapports avancés
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

require_once '../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    $report_type = $_POST['report_type'] ?? 'global';
    $date_from = $_POST['date_from'] ?? date('Y-m-01'); // Premier jour du mois
    $date_to = $_POST['date_to'] ?? date('Y-m-d'); // Aujourd'hui
    $department = $_POST['department'] ?? '';
    $campaign_ids = $_POST['campaign_ids'] ?? [];

    // Construction des conditions WHERE
    $where_conditions = ["c.created_at BETWEEN :date_from AND :date_to"];
    $params = [
        ':date_from' => $date_from,
        ':date_to' => $date_to
    ];

    if (!empty($department)) {
        $where_conditions[] = "e.department = :department";
        $params[':department'] = $department;
    }

    if (!empty($campaign_ids) && is_array($campaign_ids)) {
        $placeholders = str_repeat('?,', count($campaign_ids) - 1) . '?';
        $where_conditions[] = "c.id IN ($placeholders)";
        $params = array_merge($params, $campaign_ids);
    }

    $where_clause = "WHERE " . implode(" AND ", $where_conditions);

    // Données pour le rapport
    $report_data = [];

    // 1. Statistiques générales
    $general_stats_query = "
        SELECT 
            COUNT(DISTINCT c.id) as total_campaigns,
            COUNT(DISTINCT e.id) as total_employees,
            COUNT(DISTINCT cr.id) as total_tests,
            COUNT(CASE WHEN cr.email_sent = TRUE THEN 1 END) as emails_sent,
            COUNT(CASE WHEN cr.email_opened = TRUE THEN 1 END) as emails_opened,
            COUNT(CASE WHEN cr.link_clicked = TRUE THEN 1 END) as links_clicked,
            COUNT(CASE WHEN cr.form_submitted = TRUE THEN 1 END) as forms_submitted,
            COUNT(CASE WHEN cr.training_completed = TRUE THEN 1 END) as trainings_completed
        FROM campaigns c
        LEFT JOIN campaign_results cr ON c.id = cr.campaign_id
        LEFT JOIN employees e ON cr.employee_id = e.id
        {$where_clause}
    ";

    $stmt = $db->prepare($general_stats_query);
    foreach ($params as $key => $value) {
        if (is_string($key)) {
            $stmt->bindValue($key, $value);
        } else {
            $stmt->bindValue($key + 1, $value);
        }
    }
    $stmt->execute();
    $report_data['general_stats'] = $stmt->fetch(PDO::FETCH_ASSOC);

    // Calculs de taux
    $stats = &$report_data['general_stats'];
    $stats['open_rate'] = $stats['emails_sent'] > 0 
        ? round(($stats['emails_opened'] / $stats['emails_sent']) * 100, 1) 
        : 0;
    $stats['click_rate'] = $stats['emails_sent'] > 0 
        ? round(($stats['links_clicked'] / $stats['emails_sent']) * 100, 1) 
        : 0;
    $stats['vulnerability_rate'] = $stats['total_tests'] > 0 
        ? round(($stats['links_clicked'] / $stats['total_tests']) * 100, 1) 
        : 0;
    $stats['training_completion_rate'] = $stats['links_clicked'] > 0 
        ? round(($stats['trainings_completed'] / $stats['links_clicked']) * 100, 1) 
        : 0;

    // 2. Analyse par département
    $dept_analysis_query = "
        SELECT 
            e.department,
            COUNT(DISTINCT cr.id) as total_tests,
            COUNT(CASE WHEN cr.link_clicked = TRUE THEN 1 END) as vulnerable_employees,
            COUNT(CASE WHEN cr.training_completed = TRUE THEN 1 END) as trained_employees,
            ROUND((COUNT(CASE WHEN cr.link_clicked = TRUE THEN 1 END) / COUNT(DISTINCT cr.id)) * 100, 1) as vulnerability_rate,
            ROUND((COUNT(CASE WHEN cr.training_completed = TRUE THEN 1 END) / COUNT(CASE WHEN cr.link_clicked = TRUE THEN 1 END)) * 100, 1) as training_rate
        FROM campaigns c
        JOIN campaign_results cr ON c.id = cr.campaign_id
        JOIN employees e ON cr.employee_id = e.id
        {$where_clause}
        GROUP BY e.department
        ORDER BY vulnerability_rate DESC
    ";

    $stmt = $db->prepare($dept_analysis_query);
    foreach ($params as $key => $value) {
        if (is_string($key)) {
            $stmt->bindValue($key, $value);
        } else {
            $stmt->bindValue($key + 1, $value);
        }
    }
    $stmt->execute();
    $report_data['department_analysis'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 3. Top 10 des employés les plus vulnérables
    $vulnerable_employees_query = "
        SELECT 
            e.full_name,
            e.department,
            e.position,
            COUNT(CASE WHEN cr.link_clicked = TRUE THEN 1 END) as clicks_count,
            COUNT(CASE WHEN cr.training_completed = TRUE THEN 1 END) as trainings_count,
            COUNT(cr.id) as total_tests
        FROM employees e
        JOIN campaign_results cr ON e.id = cr.employee_id
        JOIN campaigns c ON cr.campaign_id = c.id
        {$where_clause}
        GROUP BY e.id, e.full_name, e.department, e.position
        HAVING clicks_count > 0
        ORDER BY clicks_count DESC, trainings_count ASC
        LIMIT 10
    ";

    $stmt = $db->prepare($vulnerable_employees_query);
    foreach ($params as $key => $value) {
        if (is_string($key)) {
            $stmt->bindValue($key, $value);
        } else {
            $stmt->bindValue($key + 1, $value);
        }
    }
    $stmt->execute();
    $report_data['vulnerable_employees'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 4. Évolution temporelle
    $temporal_analysis_query = "
        SELECT 
            DATE_FORMAT(c.created_at, '%Y-%m') as month,
            COUNT(DISTINCT c.id) as campaigns_count,
            COUNT(CASE WHEN cr.link_clicked = TRUE THEN 1 END) as clicks_count,
            COUNT(CASE WHEN cr.training_completed = TRUE THEN 1 END) as trainings_count
        FROM campaigns c
        LEFT JOIN campaign_results cr ON c.id = cr.campaign_id
        LEFT JOIN employees e ON cr.employee_id = e.id
        {$where_clause}
        GROUP BY DATE_FORMAT(c.created_at, '%Y-%m')
        ORDER BY month ASC
    ";

    $stmt = $db->prepare($temporal_analysis_query);
    foreach ($params as $key => $value) {
        if (is_string($key)) {
            $stmt->bindValue($key, $value);
        } else {
            $stmt->bindValue($key + 1, $value);
        }
    }
    $stmt->execute();
    $report_data['temporal_analysis'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 5. Recommandations automatiques
    $recommendations = [];
    
    if ($stats['vulnerability_rate'] > 30) {
        $recommendations[] = [
            'type' => 'critical',
            'title' => 'Taux de vulnérabilité élevé',
            'description' => "Le taux de vulnérabilité ({$stats['vulnerability_rate']}%) est supérieur à 30%. Une formation renforcée est recommandée.",
            'actions' => ['Organiser des sessions de formation supplémentaires', 'Réviser les templates pour les rendre plus réalistes']
        ];
    }

    if ($stats['training_completion_rate'] < 70) {
        $recommendations[] = [
            'type' => 'warning', 
            'title' => 'Faible taux de completion de formation',
            'description' => "Seulement {$stats['training_completion_rate']}% des employés vulnérables terminent leur formation.",
            'actions' => ['Simplifier les modules de formation', 'Ajouter des rappels automatiques']
        ];
    }

    // Recommandations par département
    foreach ($report_data['department_analysis'] as $dept) {
        if ($dept['vulnerability_rate'] > 40) {
            $recommendations[] = [
                'type' => 'department',
                'title' => "Attention au département {$dept['department']}",
                'description' => "Le département {$dept['department']} présente un taux de vulnérabilité de {$dept['vulnerability_rate']}%.",
                'actions' => ["Formation ciblée pour le département {$dept['department']}", 'Sensibilisation spécifique aux risques métier']
            ];
        }
    }

    $report_data['recommendations'] = $recommendations;

    // Génération du contenu selon le format demandé
    $format = $_POST['format'] ?? 'json';

    switch ($format) {
        case 'pdf':
            header('Content-Type: application/pdf');
            header('Content-Disposition: attachment; filename="PhishGuard_Report_' . date('Y-m-d_H-i') . '.pdf"');
            
            // Génération PDF basique (pour l'exemple)
            $pdf_content = generatePDFReport($report_data, $date_from, $date_to);
            echo $pdf_content;
            break;

        case 'csv':
            header('Content-Type: text/csv');
            header('Content-Disposition: attachment; filename="PhishGuard_Export_' . date('Y-m-d_H-i') . '.csv"');
            
            echo generateCSVReport($report_data);
            break;

        case 'json':
        default:
            header('Content-Type: application/json');
            echo json_encode([
                'success' => true,
                'report_data' => $report_data,
                'parameters' => [
                    'report_type' => $report_type,
                    'date_from' => $date_from,
                    'date_to' => $date_to,
                    'department' => $department
                ],
                'generated_at' => date('Y-m-d H:i:s')
            ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
            break;
    }

} catch (Exception $e) {
    error_log("Erreur generate_report.php: " . $e->getMessage());
    
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erreur lors de la génération du rapport',
        'message' => $e->getMessage()
    ]);
}

function generatePDFReport($data, $date_from, $date_to) {
    // Génération PDF simplifiée pour l'exemple
    $content = "
PHISHGUARD BASIC - RAPPORT DE SÉCURITÉ
=====================================

Période: du " . date('d/m/Y', strtotime($date_from)) . " au " . date('d/m/Y', strtotime($date_to)) . "
Généré le: " . date('d/m/Y à H:i') . "

RÉSUMÉ EXÉCUTIF
--------------
- Campagnes lancées: {$data['general_stats']['total_campaigns']}
- Employés testés: {$data['general_stats']['total_employees']}
- Taux de vulnérabilité: {$data['general_stats']['vulnerability_rate']}%
- Formations complétées: {$data['general_stats']['trainings_completed']}

ANALYSE PAR DÉPARTEMENT
----------------------
";

    foreach ($data['department_analysis'] as $dept) {
        $content .= "- {$dept['department']}: {$dept['vulnerability_rate']}% de vulnérabilité\n";
    }

    $content .= "
RECOMMANDATIONS
--------------
";

    foreach ($data['recommendations'] as $rec) {
        $content .= "• {$rec['title']}: {$rec['description']}\n";
        foreach ($rec['actions'] as $action) {
            $content .= "  - $action\n";
        }
        $content .= "\n";
    }

    $content .= "
EMPLOYÉS À RISQUE
----------------
";

    foreach ($data['vulnerable_employees'] as $emp) {
        $content .= "- {$emp['full_name']} ({$emp['department']}): {$emp['clicks_count']} clic(s)\n";
    }

    $content .= "

Ce rapport a été généré automatiquement par PhishGuard BASIC
Pour plus d'informations, consultez le tableau de bord.
";

    return $content;
}

function generateCSVReport($data) {
    $csv = "Type,Nom,Département,Poste,Tests,Clics,Formations,Taux Vulnérabilité\n";
    
    foreach ($data['vulnerable_employees'] as $emp) {
        $vulnerability_rate = $emp['total_tests'] > 0 
            ? round(($emp['clicks_count'] / $emp['total_tests']) * 100, 1)
            : 0;
            
        $csv .= "Employé,\"" . addslashes($emp['full_name']) . "\",\"" . 
                addslashes($emp['department']) . "\",\"" . 
                addslashes($emp['position']) . "\"," .
                $emp['total_tests'] . "," . 
                $emp['clicks_count'] . "," . 
                $emp['trainings_count'] . "," . 
                $vulnerability_rate . "%\n";
    }
    
    $csv .= "\nType,Département,Employés Testés,Vulnérables,Formés,Taux Vulnérabilité\n";
    
    foreach ($data['department_analysis'] as $dept) {
        $csv .= "Département,\"" . addslashes($dept['department']) . "\"," .
                $dept['total_tests'] . "," . 
                $dept['vulnerable_employees'] . "," . 
                $dept['trained_employees'] . "," . 
                $dept['vulnerability_rate'] . "%\n";
    }
    
    return $csv;
}
?>
