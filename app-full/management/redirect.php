<?php
// app-full/management/redirect.php - Gestion des redirections de tracking
require_once 'config/database.php';
require_once 'utils/logger.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    $logger = new Logger($db);
    
    // Récupération du token depuis l'URL
    $request_uri = $_SERVER['REQUEST_URI'];
    $token = null;
    
    // Gestion des différents types d'URLs
    if (preg_match('/\/t\/([a-zA-Z0-9]{32})/', $request_uri, $matches)) {
        // URL de clic : /t/token
        $token = $matches[1];
        $action = 'click';
    } elseif (preg_match('/\/p\/([a-zA-Z0-9]{32})\.gif/', $request_uri, $matches)) {
        // Pixel de tracking : /p/token.gif
        $token = $matches[1];
        $action = 'open';
    } else {
        // URL invalide
        http_response_code(404);
        exit('Not Found');
    }
    
    if (!$token) {
        http_response_code(400);
        exit('Invalid token');
    }
    
    // Recherche du token en base
    $token_query = "
        SELECT 
            tt.campaign_id, 
            tt.employee_id, 
            tt.expires_at,
            tt.click_count,
            e.full_name,
            e.department,
            c.name as campaign_name,
            c.status as campaign_status
        FROM tracking_tokens tt
        JOIN employees e ON tt.employee_id = e.id
        JOIN campaigns c ON tt.campaign_id = c.id
        WHERE tt.token = :token
    ";
    
    $token_stmt = $db->prepare($token_query);
    $token_stmt->bindParam(':token', $token);
    $token_stmt->execute();
    $token_data = $token_stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$token_data) {
        http_response_code(404);
        exit('Token not found');
    }
    
    // Vérification de l'expiration
    if (strtotime($token_data['expires_at']) < time()) {
        http_response_code(410);
        exit('Token expired');
    }
    
    // Vérification du statut de la campagne
    if ($token_data['campaign_status'] !== 'active') {
        http_response_code(410);
        exit('Campaign inactive');
    }
    
    $campaign_id = $token_data['campaign_id'];
    $employee_id = $token_data['employee_id'];
    
    if ($action === 'open') {
        // Tracking de l'ouverture d'email (pixel invisible)
        trackEmailOpen($db, $logger, $token_data, $token);
        
        // Retourner un pixel transparent
        header('Content-Type: image/gif');
        header('Cache-Control: no-cache, no-store, must-revalidate');
        header('Expires: 0');
        
        // Pixel GIF 1x1 transparent
        echo base64_decode('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
        exit;
        
    } elseif ($action === 'click') {
        // Tracking du clic sur lien
        trackLinkClick($db, $logger, $token_data, $token);
        
        // Redirection vers la page d'avertissement
        $redirect_url = "/management/warning.php?c=$campaign_id&e=$employee_id";
        header("Location: $redirect_url");
        exit;
    }
    
} catch (Exception $e) {
    error_log("Erreur redirect.php: " . $e->getMessage());
    http_response_code(500);
    exit('Server error');
}

function trackEmailOpen($db, $logger, $token_data, $token) {
    try {
        // Vérifier si l'ouverture n'a pas déjà été enregistrée
        $check_query = "SELECT email_opened FROM campaign_results WHERE campaign_id = :cid AND employee_id = :eid";
        $check_stmt = $db->prepare($check_query);
        $check_stmt->bindParam(':cid', $token_data['campaign_id']);
        $check_stmt->bindParam(':eid', $token_data['employee_id']);
        $check_stmt->execute();
        $result = $check_stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$result || !$result['email_opened']) {
            // Enregistrer l'ouverture
            $update_query = "
                UPDATE campaign_results 
                SET email_opened = TRUE, opened_at = NOW() 
                WHERE campaign_id = :cid AND employee_id = :eid
            ";
            $update_stmt = $db->prepare($update_query);
            $update_stmt->bindParam(':cid', $token_data['campaign_id']);
            $update_stmt->bindParam(':eid', $token_data['employee_id']);
            $update_stmt->execute();
            
            // Log de l'activité
            $logger->logActivity(
                null,
                'email_opened',
                "Email ouvert par {$token_data['full_name']} ({$token_data['department']}) - Campagne: {$token_data['campaign_name']}",
                'tracking',
                $token_data['campaign_id']
            );
        }
    } catch (Exception $e) {
        error_log("Erreur trackEmailOpen: " . $e->getMessage());
    }
}

function trackLinkClick($db, $logger, $token_data, $token) {
    try {
        // Incrémenter le compteur de clics
        $update_token_query = "
            UPDATE tracking_tokens 
            SET click_count = click_count + 1, used_at = NOW() 
            WHERE token = :token
        ";
        $update_token_stmt = $db->prepare($update_token_query);
        $update_token_stmt->bindParam(':token', $token);
        $update_token_stmt->execute();
        
        // Vérifier si le clic n'a pas déjà été enregistré
        $check_query = "SELECT link_clicked FROM campaign_results WHERE campaign_id = :cid AND employee_id = :eid";
        $check_stmt = $db->prepare($check_query);
        $check_stmt->bindParam(':cid', $token_data['campaign_id']);
        $check_stmt->bindParam(':eid', $token_data['employee_id']);
        $check_stmt->execute();
        $result = $check_stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$result || !$result['link_clicked']) {
            // Enregistrer le clic
            $update_query = "
                UPDATE campaign_results 
                SET link_clicked = TRUE, clicked_at = NOW() 
                WHERE campaign_id = :cid AND employee_id = :eid
            ";
            $update_stmt = $db->prepare($update_query);
            $update_stmt->bindParam(':cid', $token_data['campaign_id']);
            $update_stmt->bindParam(':eid', $token_data['employee_id']);
            $update_stmt->execute();
            
            // Log détaillé avec informations techniques
            $ip_address = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
            $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';
            
            $logger->logActivity(
                null,
                'link_clicked',
                "Lien cliqué par {$token_data['full_name']} ({$token_data['department']}) - Campagne: {$token_data['campaign_name']} - IP: $ip_address",
                'tracking',
                $token_data['campaign_id']
            );
            
            // Enregistrement des détails techniques
            $tech_query = "
                INSERT INTO tracking_details (campaign_result_id, action_type, ip_address, user_agent, created_at)
                SELECT cr.id, 'click', :ip, :ua, NOW()
                FROM campaign_results cr
                WHERE cr.campaign_id = :cid AND cr.employee_id = :eid
            ";
            $tech_stmt = $db->prepare($tech_query);
            $tech_stmt->bindParam(':cid', $token_data['campaign_id']);
            $tech_stmt->bindParam(':eid', $token_data['employee_id']);
            $tech_stmt->bindParam(':ip', $ip_address);
            $tech_stmt->bindParam(':ua', $user_agent);
            $tech_stmt->execute();
        }
    } catch (Exception $e) {
        error_log("Erreur trackLinkClick: " . $e->getMessage());
    }
}
?>
