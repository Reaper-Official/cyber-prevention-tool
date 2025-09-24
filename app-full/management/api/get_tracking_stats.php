<?php
// app-full/management/api/get_tracking_stats.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once '../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    $campaign_id = intval($_GET['campaign_id'] ?? 0);
    
    if (!$campaign_id) {
        throw new InvalidArgumentException('ID de campagne requis');
    }
    
    // Statistiques détaillées des tokens
    $tokens_query = "
        SELECT 
            tt.token,
            tt.click_count,
            tt.created_at,
            tt.used_at,
            e.full_name,
            e.email,
            e.department,
            cr.email_opened,
            cr.link_clicked,
            cr.opened_at,
            cr.clicked_at
        FROM tracking_tokens tt
        JOIN employees e ON tt.employee_id = e.id
        JOIN campaign_results cr ON tt.campaign_id = cr.campaign_id AND tt.employee_id = cr.employee_id
        WHERE tt.campaign_id = :campaign_id
        ORDER BY tt.created_at DESC
    ";
    
    $tokens_stmt = $db->prepare($tokens_query);
    $tokens_stmt->bindParam(':campaign_id', $campaign_id);
    $tokens_stmt->execute();
    $tracking_data = $tokens_stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Statistiques globales
    $stats_query = "
        SELECT 
            COUNT(*) as total_tokens,
            COUNT(CASE WHEN used_at IS NOT NULL THEN 1 END) as tokens_used,
            SUM(click_count) as total_clicks,
            AVG(click_count) as avg_clicks_per_token
        FROM tracking_tokens
        WHERE campaign_id = :campaign_id
    ";
    
    $stats_stmt = $db->prepare($stats_query);
    $stats_stmt->bindParam(':campaign_id', $campaign_id);
    $stats_stmt->execute();
    $global_stats = $stats_stmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'tracking_data' => $tracking_data,
        'statistics' => $global_stats
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
