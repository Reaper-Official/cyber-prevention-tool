<?php
// api/tracking.php - Système de tracking complet des interactions
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');

require_once '../config/database.php';
require_once '../utils/logger.php';

$action = $_GET['action'] ?? $_POST['action'] ?? '';
$campaign_id = intval($_GET['c'] ?? $_POST['c'] ?? 0);
$employee_id = intval($_GET['e'] ?? $_POST['e'] ?? 0);
$token = $_GET['token'] ?? $_POST['token'] ?? '';
$user_agent = $_SERVER['HTTP_USER_AGENT'] ?? '';
$ip_address = $_SERVER['REMOTE_ADDR'] ?? '';

// Validation des paramètres
if (!$action || !$campaign_id || !$employee_id) {
    http_response_code(400);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Paramètres manquants']);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();
    $logger = new Logger($db);

    // Vérifier que la combinaison campagne/employé existe
    $check_query = "
        SELECT 
            cr.id,
            cr.email_sent,
            cr.email_opened,
            cr.link_clicked,
            e.full_name,
            e.department,
            c.name as campaign_name,
            c.status as campaign_status
        FROM campaign_results cr
        JOIN employees e ON cr.employee_id = e.id
        JOIN campaigns c ON cr.campaign_id = c.id
        WHERE cr.campaign_id = :campaign_id AND cr.employee_id = :employee_id
    ";
    
    $check_stmt = $db->prepare($check_query);
    $check_stmt->bindParam(':campaign_id', $campaign_id);
    $check_stmt->bindParam(':employee_id', $employee_id);
    $check_stmt->execute();
    $record = $check_stmt->fetch(PDO::FETCH_ASSOC);

    if (!$record) {
        http_response_code(404);
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Enregistrement non trouvé']);
        exit;
    }

    // Vérifier que la campagne est active
    if ($record['campaign_status'] !== 'active') {
        http_response_code(410);
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Campagne inactive']);
        exit;
    }

    $updated = false;
    $redirect_url = null;
    $response_data = ['success' => true, 'action' => $action];

    switch ($action) {
        case 'open':
            // Tracking de l'ouverture d'email (pixel invisible)
            if (!$record['email_opened']) {
                $update_query = "
                    UPDATE campaign_results 
                    SET email_opened = TRUE, opened_at = NOW() 
                    WHERE campaign_id = :campaign_id AND employee_id = :employee_id
                ";
                $update_stmt = $db->prepare($update_query);
                $update_stmt->bindParam(':campaign_id', $campaign_id);
                $update_stmt->bindParam(':employee_id', $employee_id);
                $updated = $update_stmt->execute();

                if ($updated) {
                    $logger->logActivity(
                        null,
                        'email_opened',
                        "Email ouvert par {$record['full_name']} ({$record['department']}) - Campagne: {$record['campaign_name']}",
                        'tracking',
                        $record['id']
                    );
                }
            }

            // Retourner un pixel transparent
            header('Content-Type: image/gif');
            header('Cache-Control: no-cache, no-store, must-revalidate');
            header('Expires: 0');
            
            // Pixel GIF 1x1 transparent
            echo base64_decode('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
            exit;

        case 'click':
            // Tracking du clic sur lien
            if (!$record['link_clicked']) {
                $update_query = "
                    UPDATE campaign_results 
                    SET link_clicked = TRUE, clicked_at = NOW() 
                    WHERE campaign_id = :campaign_id AND employee_id = :employee_id
                ";
                $update_stmt = $db->prepare($update_query);
                $update_stmt->bindParam(':campaign_id', $campaign_id);
                $update_stmt->bindParam(':employee_id', $employee_id);
                $updated = $update_stmt->execute();

                if ($updated) {
                    // Log détaillé avec informations techniques
                    $logger->logActivity(
                        null,
                        'link_clicked',
                        "Lien cliqué par {$record['full_name']} ({$record['department']}) - Campagne: {$record['campaign_name']} - IP: $ip_address",
                        'tracking',
                        $record['id']
                    );

                    // Enregistrement des détails techniques
                    $tech_query = "
                        INSERT INTO tracking_details (campaign_result_id, action_type, ip_address, user_agent, created_at)
                        VALUES (:result_id, 'click', :ip, :ua, NOW())
                    ";
                    $tech_stmt = $db->prepare($tech_query);
                    $tech_stmt->bindParam(':result_id', $record['id']);
                    $tech_stmt->bindParam(':ip', $ip_address);
                    $tech_stmt->bindParam(':ua', $user_agent);
                    $tech_stmt->execute();
                }
            }

            // Redirection vers la page de formation
            $redirect_url = "../training.php?c=$campaign_id&e=$employee_id&t=" . urlencode($token);
            break;

        case 'submit':
            // Tracking de la soumission de formulaire
            if (!$record['form_submitted']) {
                $form_data = $_POST['form_data'] ?? '';
                
                $update_query = "
                    UPDATE campaign_results 
                    SET form_submitted = TRUE, submitted_at = NOW() 
                    WHERE campaign_id = :campaign_id AND employee_id = :employee_id
                ";
                $update_stmt = $db->prepare($update_query);
                $update_stmt->bindParam(':campaign_id', $campaign_id);
                $update_stmt->bindParam(':employee_id', $employee_id);
                $updated = $update_stmt->execute();

                if ($updated) {
                    $logger->logActivity(
                        null,
                        'form_submitted',
                        "Formulaire soumis par {$record['full_name']} ({$record['department']}) - Campagne: {$record['campaign_name']}",
                        'tracking',
                        $record['id']
                    );

                    // Enregistrer les données soumises (anonymisées)
                    $form_query = "
                        INSERT INTO form_submissions (campaign_result_id, submitted_data, ip_address, created_at)
                        VALUES (:result_id, :data, :ip, NOW())
                    ";
                    $form_stmt = $db->prepare($form_query);
                    $form_stmt->bindParam(':result_id', $record['id']);
                    $form_stmt->bindParam(':data', $form_data);
                    $form_stmt->bindParam(':ip', $ip_address);
                    $form_stmt->execute();
                }
            }

            $redirect_url = "../training.php?c=$campaign_id&e=$employee_id&submitted=1";
            break;

        case 'download':
            // Tracking de téléchargement de fichier
            $filename = $_GET['file'] ?? '';
            
            $download_query = "
                INSERT INTO download_tracking (campaign_result_id, filename, ip_address, user_agent, created_at)
                VALUES (:result_id, :filename, :ip, :ua, NOW())
            ";
            $download_stmt = $db->prepare($download_query);
            $download_stmt->bindParam(':result_id', $record['id']);
            $download_stmt->bindParam(':filename', $filename);
            $download_stmt->bindParam(':ip', $ip_address);
            $download_stmt->bindParam(':ua', $user_agent);
            $download_stmt->execute();

            $logger->logActivity(
                null,
                'file_downloaded',
                "Fichier '$filename' téléchargé par {$record['full_name']} - Campagne: {$record['campaign_name']}",
                'tracking',
                $record['id']
            );

            // Redirection vers un fichier factice ou page d'avertissement
            $redirect_url = "../warning.php?c=$campaign_id&e=$employee_id&file=" . urlencode($filename);
            break;

        default:
            http_response_code(400);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Action invalide']);
            exit;
    }

    // Gestion de la redirection
    if ($redirect_url) {
        // Si c'est une requête AJAX, retourner l'URL
        if (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && 
            strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
            header('Content-Type: application/json');
            echo json_encode(['success' => true, 'redirect' => $redirect_url]);
        } else {
            // Redirection normale
            header("Location: $redirect_url");
        }
        exit;
    }

    // Réponse JSON pour les autres actions
    header('Content-Type: application/json');
    echo json_encode($response_data);

} catch (Exception $e) {
    error_log("Erreur tracking.php: " . $e->getMessage());
    
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Erreur serveur']);
}
?>
