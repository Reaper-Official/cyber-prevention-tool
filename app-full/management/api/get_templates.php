<?php
// api/get_templates.php - Récupération des templates d'emails
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once '../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    // Paramètres de filtrage
    $template_type = $_GET['type'] ?? '';
    $difficulty_level = $_GET['difficulty'] ?? '';
    $active_only = isset($_GET['active_only']) ? filter_var($_GET['active_only'], FILTER_VALIDATE_BOOLEAN) : true;
    $include_content = isset($_GET['include_content']) ? filter_var($_GET['include_content'], FILTER_VALIDATE_BOOLEAN) : false;

    // Construction des conditions WHERE
    $where_conditions = [];
    $params = [];

    if ($active_only) {
        $where_conditions[] = "is_active = TRUE";
    }

    if (!empty($template_type) && in_array($template_type, ['banking', 'social', 'it', 'custom'])) {
        $where_conditions[] = "template_type = :type";
        $params[':type'] = $template_type;
    }

    if (!empty($difficulty_level) && in_array($difficulty_level, ['easy', 'medium', 'hard'])) {
        $where_conditions[] = "difficulty_level = :difficulty";
        $params[':difficulty'] = $difficulty_level;
    }

    $where_clause = !empty($where_conditions) ? "WHERE " . implode(" AND ", $where_conditions) : "";

    // Sélection des colonnes
    $select_columns = "
        id, name, subject, template_type, difficulty_level, 
        language, is_active, usage_count, success_rate, 
        created_at, updated_at
    ";
    
    if ($include_content) {
        $select_columns .= ", content";
    }

    // Requête principale
    $templates_query = "
        SELECT {$select_columns}
        FROM email_templates
        {$where_clause}
        ORDER BY template_type ASC, name ASC
    ";

    $templates_stmt = $db->prepare($templates_query);
    foreach ($params as $key => $value) {
        $templates_stmt->bindValue($key, $value);
    }
    $templates_stmt->execute();
    $templates = $templates_stmt->fetchAll(PDO::FETCH_ASSOC);

    // Statistiques d'utilisation par type
    $stats_query = "
        SELECT 
            template_type,
            COUNT(*) as total_templates,
            COUNT(CASE WHEN is_active = TRUE THEN 1 END) as active_templates,
            AVG(success_rate) as avg_success_rate,
            SUM(usage_count) as total_usage
        FROM email_templates
        GROUP BY template_type
        ORDER BY total_usage DESC
    ";
    $stats_stmt = $db->prepare($stats_query);
    $stats_stmt->execute();
    $template_stats = $stats_stmt->fetchAll(PDO::FETCH_ASSOC);

    // Enrichissement des données
    foreach ($templates as &$template) {
        // Labels traduits
        $template['type_label'] = [
            'banking' => 'Phishing Bancaire',
            'social' => 'Réseau Social',
            'it' => 'Support IT',
            'custom' => 'Personnalisé'
        ][$template['template_type']] ?? $template['template_type'];

        $template['difficulty_label'] = [
            'easy' => 'Facile',
            'medium' => 'Moyen',
            'hard' => 'Difficile'
        ][$template['difficulty_level']] ?? $template['difficulty_level'];

        // Couleurs pour l'interface
        $template['type_color'] = [
            'banking' => 'primary',
            'social' => 'info',
            'it' => 'warning',
            'custom' => 'secondary'
        ][$template['template_type']] ?? 'secondary';

        $template['difficulty_color'] = [
            'easy' => 'success',
            'medium' => 'warning',
            'hard' => 'danger'
        ][$template['difficulty_level']] ?? 'secondary';

        // Formatage des dates
        $template['created_at_formatted'] = date('d/m/Y H:i', strtotime($template['created_at']));
        $template['updated_at_formatted'] = $template['updated_at'] ? 
            date('d/m/Y H:i', strtotime($template['updated_at'])) : null;

        // Métriques formatées
        $template['usage_count'] = intval($template['usage_count']);
        $template['success_rate'] = floatval($template['success_rate']);
        $template['success_rate_formatted'] = number_format($template['success_rate'], 1) . '%';

        // Analyse du contenu (si inclus)
        if ($include_content && !empty($template['content'])) {
            $template['content_analysis'] = [
                'has_tracking_url' => strpos($template['content'], '{TRACKING_URL}') !== false,
                'has_images' => preg_match('/<img[^>]+>/i', $template['content']) > 0,
                'has_forms' => preg_match('/<form[^>]*>/i', $template['content']) > 0,
                'word_count' => str_word_count(strip_tags($template['content'])),
                'character_count' => strlen(strip_tags($template['content']))
            ];
        }

        // Preview du contenu (200 premiers caractères)
        if (!$include_content) {
            $preview = strip_tags($template['content'] ?? '');
            $template['content_preview'] = strlen($preview) > 200 ? 
                substr($preview, 0, 200) . '...' : $preview;
        }
    }

    // Formatage des statistiques
    foreach ($template_stats as &$stat) {
        $stat['type_label'] = [
            'banking' => 'Phishing Bancaire',
            'social' => 'Réseau Social',
            'it' => 'Support IT',
            'custom' => 'Personnalisé'
        ][$stat['template_type']] ?? $stat['template_type'];

        $stat['avg_success_rate'] = $stat['avg_success_rate'] ? 
            round(floatval($stat['avg_success_rate']), 1) : 0;
        $stat['total_templates'] = intval($stat['total_templates']);
        $stat['active_templates'] = intval($stat['active_templates']);
        $stat['total_usage'] = intval($stat['total_usage']);
    }

    echo json_encode([
        'success' => true,
        'timestamp' => date('Y-m-d H:i:s'),
        'templates' => $templates,
        'statistics' => $template_stats,
        'filters' => [
            'type' => $template_type,
            'difficulty' => $difficulty_level,
            'active_only' => $active_only,
            'include_content' => $include_content
        ],
        'total_count' => count($templates)
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    error_log("Erreur get_templates.php: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erreur serveur',
        'message' => 'Erreur lors de la récupération des templates'
    ]);
}
?>
