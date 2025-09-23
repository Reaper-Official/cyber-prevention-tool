<?php
// api/get_campaign_details.php - Détails complets d'une campagne
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

require_once '../config/database.php';

try {
    $campaign_id = intval($_GET['id'] ?? 0);
    
    if (!$campaign_id) {
        throw new InvalidArgumentException('ID de campagne requis');
    }

    $database = new Database();
    $db = $database->getConnection();

    // Informations de base de la campagne
    $campaign_query = "
        SELECT 
            c.*,
            u.username as created_by_name,
            et.name as template_name,
            et.subject as template_subject,
            et.content as template_content
        FROM campaigns c
        LEFT JOIN users u ON c.created_by = u.id
        LEFT JOIN email_templates et ON et.template_type = c.template AND et.is_active = TRUE
        WHERE c.id = :id
    ";
    
    $campaign_stmt = $db->prepare($campaign_query);
    $campaign_stmt->bindParam(':id', $campaign_id);
    $campaign_stmt->execute();
    $campaign = $campaign_stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$campaign) {
        throw new Exception('Campagne non trouvée', 404);
    }

    // Statistiques détaillées
    $stats_query = "
        SELECT 
            COUNT(*) as total_targets,
            COUNT(CASE WHEN email_sent = TRUE THEN 1 END) as emails_sent,
            COUNT(CASE WHEN email_opened = TRUE THEN 1 END) as emails_opened,
            COUNT(CASE WHEN link_clicked = TRUE THEN 1 END) as links_clicked,
            COUNT(CASE WHEN form_submitted = TRUE THEN 1 END) as forms_submitted,
            COUNT(CASE WHEN training_completed = TRUE THEN 1 END) as trainings_completed,
            AVG(CASE 
                WHEN training_completed = TRUE AND clicked_at IS NOT NULL AND completed_at IS NOT NULL
                THEN TIMESTAMPDIFF(MINUTE, clicked_at, completed_at)
                ELSE NULL 
            END) as avg_training_time
        FROM campaign_results 
        WHERE campaign_id = :campaign_id
    ";
    
    $stats_stmt = $db->prepare($stats_query);
    $stats_stmt->bindParam(':campaign_id', $campaign_id);
    $stats_stmt->execute();
    $stats = $stats_stmt->fetch(PDO::FETCH_ASSOC);

    // Résultats par employé
    $results_query = "
        SELECT 
            cr.*,
            e.full_name,
            e.email,
            e.department,
            e.position,
            CASE 
                WHEN cr.training_completed = TRUE THEN 'Formé'
                WHEN cr.link_clicked = TRUE THEN 'Vulnérable'
                WHEN cr.email_opened = TRUE THEN 'Méfiant'
                WHEN cr.email_sent = TRUE THEN 'Non ouvert'
                ELSE 'Non envoyé'
            END as result_status,
            CASE 
                WHEN cr.training_completed = TRUE THEN 'success'
                WHEN cr.link_clicked = TRUE THEN 'danger'
                WHEN cr.email_opened = TRUE THEN 'warning'
                WHEN cr.email_sent = TRUE THEN 'secondary'
                ELSE 'light'
            END as result_color
        FROM campaign_results cr
        JOIN employees e ON cr.employee_id = e.id
        WHERE cr.campaign_id = :campaign_id
        ORDER BY 
            CASE 
                WHEN cr.link_clicked = TRUE THEN 1
                WHEN cr.email_opened = TRUE AND cr.link_clicked = FALSE THEN 2
                WHEN cr.email_sent = TRUE AND cr.email_opened = FALSE THEN 3
                ELSE 4
            END,
            e.full_name
    ";
    
    $results_stmt = $db->prepare($results_query);
    $results_stmt->bindParam(':campaign_id', $campaign_id);
    $results_stmt->execute();
    $results = $results_stmt->fetchAll(PDO::FETCH_ASSOC);

    // Analyse par département
    $dept_analysis_query = "
        SELECT 
            e.department,
            COUNT(*) as total,
            COUNT(CASE WHEN cr.link_clicked = TRUE THEN 1 END) as clicked,
            COUNT(CASE WHEN cr.training_completed = TRUE THEN 1 END) as trained,
            ROUND((COUNT(CASE WHEN cr.link_clicked = TRUE THEN 1 END) / COUNT(*)) * 100, 1) as vulnerability_rate
        FROM campaign_results cr
        JOIN employees e ON cr.employee_id = e.id
        WHERE cr.campaign_id = :campaign_id
        GROUP BY e.department
        ORDER BY vulnerability_rate DESC
    ";
    
    $dept_stmt = $db->prepare($dept_analysis_query);
    $dept_stmt->bindParam(':campaign_id', $campaign_id);
    $dept_stmt->execute();
    $department_analysis = $dept_stmt->fetchAll(PDO::FETCH_ASSOC);

    // Timeline des événements
    $timeline_query = "
        SELECT 
            'campaign_created' as event_type,
            c.created_at as event_time,
            'Campagne créée' as description,
            1 as priority
        FROM campaigns c WHERE c.id = :campaign_id
        
        UNION ALL
        
        SELECT 
            'email_sent' as event_type,
            cr.sent_at as event_time,
            CONCAT('Email envoyé à ', e.full_name) as description,
            2 as priority
        FROM campaign_results cr
        JOIN employees e ON cr.employee_id = e.id
        WHERE cr.campaign_id = :campaign_id AND cr.sent_at IS NOT NULL
        
        UNION ALL
        
        SELECT 
            'email_opened' as event_type,
            cr.opened_at as event_time,
            CONCAT('Email ouvert par ', e.full_name) as description,
            3 as priority
        FROM campaign_results cr
        JOIN employees e ON cr.employee_id = e.id
        WHERE cr.campaign_id = :campaign_id AND cr.opened_at IS NOT NULL
        
        UNION ALL
        
        SELECT 
            'link_clicked' as event_type,
            cr.clicked_at as event_time,
            CONCAT('Lien cliqué par ', e.full_name, ' (', e.department, ')') as description,
            4 as priority
        FROM campaign_results cr
        JOIN employees e ON cr.employee_id = e.id
        WHERE cr.campaign_id = :campaign_id AND cr.clicked_at IS NOT NULL
        
        UNION ALL
        
        SELECT 
            'training_completed' as event_type,
            cr.completed_at as event_time,
            CONCAT('Formation terminée par ', e.full_name) as description,
            5 as priority
        FROM campaign_results cr
        JOIN employees e ON cr.employee_id = e.id
        WHERE cr.campaign_id = :campaign_id AND cr.completed_at IS NOT NULL
        
        ORDER BY event_time DESC
        LIMIT 100
    ";
    
    $timeline_stmt = $db->prepare($timeline_query);
    $timeline_stmt->bindParam(':campaign_id', $campaign_id);
    $timeline_stmt->execute();
    $timeline = $timeline_stmt->fetchAll(PDO::FETCH_ASSOC);

    // Formatage des résultats
    foreach ($results as &$result) {
        $result['sent_at_formatted'] = $result['sent_at'] ? date('d/m/Y H:i', strtotime($result['sent_at'])) : null;
        $result['opened_at_formatted'] = $result['opened_at'] ? date('d/m/Y H:i', strtotime($result['opened_at'])) : null;
        $result['clicked_at_formatted'] = $result['clicked_at'] ? date('d/m/Y H:i', strtotime($result['clicked_at'])) : null;
        $result['completed_at_formatted'] = $result['completed_at'] ? date('d/m/Y H:i', strtotime($result['completed_at'])) : null;
    }

    foreach ($timeline as &$event) {
        $event['event_time_formatted'] = date('d/m/Y H:i:s', strtotime($event['event_time']));
        $event['event_time_relative'] = time_elapsed_string($event['event_time']);
    }

    echo json_encode([
        'success' => true,
        'campaign' => $campaign,
        'stats' => $stats,
        'results' => $results,
        'department_analysis' => $department_analysis,
        'timeline' => $timeline
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

} catch (InvalidArgumentException $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
} catch (Exception $e) {
    $code = $e->getCode() === 404 ? 404 : 500;
    http_response_code($code);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

function time_elapsed_string($datetime) {
    $time = time() - strtotime($datetime);
    
    if ($time < 60) return 'À l\'instant';
    if ($time < 3600) return floor($time/60) . ' min';
    if ($time < 86400) return floor($time/3600) . ' h';
    if ($time < 2592000) return floor($time/86400) . ' j';
    if ($time < 31104000) return floor($time/2592000) . ' mois';
    
    return floor($time/31104000) . ' an' . (floor($time/31104000) > 1 ? 's' : '');
}
?>
