<?php
// api/get_campaigns.php - API complète de récupération des campagnes
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

require_once '../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    // Paramètres de pagination et filtrage
    $page = max(1, intval($_GET['page'] ?? 1));
    $limit = min(100, max(10, intval($_GET['limit'] ?? 20)));
    $offset = ($page - 1) * $limit;
    $status_filter = $_GET['status'] ?? '';
    $search = $_GET['search'] ?? '';

    // Construction de la requête avec filtres
    $where_conditions = [];
    $params = [];

    if (!empty($status_filter) && in_array($status_filter, ['draft', 'active', 'completed', 'paused'])) {
        $where_conditions[] = "c.status = :status";
        $params[':status'] = $status_filter;
    }

    if (!empty($search)) {
        $where_conditions[] = "(c.name LIKE :search OR c.description LIKE :search)";
        $params[':search'] = "%{$search}%";
    }

    $where_clause = !empty($where_conditions) ? "WHERE " . implode(" AND ", $where_conditions) : "";

    // Requête principale avec statistiques détaillées
    $campaigns_query = "
        SELECT 
            c.id,
            c.name,
            c.description,
            c.template,
            c.target_type,
            c.status,
            c.created_at,
            c.updated_at,
            u.username as created_by_name,
            COUNT(DISTINCT cr.id) as total_targets,
            COUNT(CASE WHEN cr.email_sent = TRUE THEN 1 END) as emails_sent,
            COUNT(CASE WHEN cr.email_opened = TRUE THEN 1 END) as emails_opened,
            COUNT(CASE WHEN cr.link_clicked = TRUE THEN 1 END) as links_clicked,
            COUNT(CASE WHEN cr.form_submitted = TRUE THEN 1 END) as forms_submitted,
            COUNT(CASE WHEN cr.training_completed = TRUE THEN 1 END) as trainings_completed,
            ROUND(
                CASE 
                    WHEN COUNT(CASE WHEN cr.email_sent = TRUE THEN 1 END) > 0 
                    THEN (COUNT(CASE WHEN cr.link_clicked = TRUE THEN 1 END) / COUNT(CASE WHEN cr.email_sent = TRUE THEN 1 END)) * 100
                    ELSE 0 
                END, 1
            ) as click_rate,
            ROUND(
                CASE 
                    WHEN COUNT(CASE WHEN cr.link_clicked = TRUE THEN 1 END) > 0 
                    THEN (COUNT(CASE WHEN cr.training_completed = TRUE THEN 1 END) / COUNT(CASE WHEN cr.link_clicked = TRUE THEN 1 END)) * 100
                    ELSE 0 
                END, 1
            ) as training_completion_rate
        FROM campaigns c
        LEFT JOIN users u ON c.created_by = u.id
        LEFT JOIN campaign_results cr ON c.id = cr.campaign_id
        {$where_clause}
        GROUP BY c.id, u.username
        ORDER BY c.created_at DESC
        LIMIT :limit OFFSET :offset
    ";

    $campaigns_stmt = $db->prepare($campaigns_query);
    
    // Bind des paramètres
    foreach ($params as $key => $value) {
        $campaigns_stmt->bindValue($key, $value);
    }
    $campaigns_stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $campaigns_stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    
    $campaigns_stmt->execute();
    $campaigns = $campaigns_stmt->fetchAll(PDO::FETCH_ASSOC);

    // Requête pour le total (pagination)
    $count_query = "SELECT COUNT(*) as total FROM campaigns c {$where_clause}";
    $count_stmt = $db->prepare($count_query);
    foreach ($params as $key => $value) {
        $count_stmt->bindValue($key, $value);
    }
    $count_stmt->execute();
    $total_campaigns = $count_stmt->fetch(PDO::FETCH_ASSOC)['total'];

    // Enrichissement des données
    foreach ($campaigns as &$campaign) {
        // Calculs supplémentaires
        $campaign['targets'] = intval($campaign['total_targets']);
        $campaign['engagement_score'] = $campaign['total_targets'] > 0 
            ? round((($campaign['emails_opened'] + $campaign['links_clicked'] * 2) / ($campaign['total_targets'] * 2)) * 100, 1)
            : 0;
            
        // Statut formaté
        $campaign['status_label'] = [
            'draft' => 'Brouillon',
            'active' => 'Actif',
            'completed' => 'Terminé',
            'paused' => 'Pausé'
        ][$campaign['status']] ?? $campaign['status'];
        
        // Template formaté
        $campaign['template_label'] = [
            'banking' => 'Phishing Bancaire',
            'social' => 'Réseau Social',
            'it' => 'Support IT',
            'custom' => 'Personnalisé'
        ][$campaign['template']] ?? $campaign['template'];
        
        // Formatage des dates
        $campaign['created_at_formatted'] = date('d/m/Y H:i', strtotime($campaign['created_at']));
        $campaign['updated_at_formatted'] = date('d/m/Y H:i', strtotime($campaign['updated_at']));
        
        // Déterminer la couleur du statut
        $campaign['status_color'] = [
            'draft' => 'secondary',
            'active' => 'primary',
            'completed' => 'success',
            'paused' => 'warning'
        ][$campaign['status']] ?? 'secondary';
    }

    // Métadonnées de pagination
    $pagination = [
        'current_page' => $page,
        'per_page' => $limit,
        'total' => intval($total_campaigns),
        'total_pages' => ceil($total_campaigns / $limit),
        'has_more' => ($page * $limit) < $total_campaigns
    ];

    // Statistiques générales des campagnes
    $stats_query = "
        SELECT 
            COUNT(*) as total_campaigns,
            COUNT(CASE WHEN status = 'active' THEN 1 END) as active_campaigns,
            COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_campaigns,
            COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as recent_campaigns
        FROM campaigns
    ";
    $stats_stmt = $db->prepare($stats_query);
    $stats_stmt->execute();
    $campaign_stats = $stats_stmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'campaigns' => $campaigns,
        'pagination' => $pagination,
        'stats' => $campaign_stats,
        'filters' => [
            'status' => $status_filter,
            'search' => $search
        ]
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    error_log("Erreur get_campaigns.php: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erreur serveur',
        'message' => 'Erreur lors de la récupération des campagnes'
    ], JSON_PRETTY_PRINT);
}
?>
