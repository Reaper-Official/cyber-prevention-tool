<?php
// api/update_campaign.php - Mise à jour et contrôle des campagnes
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, PUT');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config/database.php';
require_once '../utils/logger.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    $logger = new Logger($db);

    $campaign_id = intval($_POST['campaign_id'] ?? $_GET['id'] ?? 0);
    $action = $_POST['action'] ?? '';

    if (!$campaign_id) {
        throw new InvalidArgumentException('ID de campagne requis');
    }

    // Vérifier que la campagne existe
    $check_query = "SELECT status, name FROM campaigns WHERE id = :id";
    $check_stmt = $db->prepare($check_query);
    $check_stmt->bindParam(':id', $campaign_id);
    $check_stmt->execute();
    $campaign = $check_stmt->fetch(PDO::FETCH_ASSOC);

    if (!$campaign) {
        throw new Exception('Campagne non trouvée', 404);
    }

    switch ($action) {
        case 'pause':
            if ($campaign['status'] !== 'active') {
                throw new InvalidArgumentException('Seules les campagnes actives peuvent être pausées');
            }
            
            $update_query = "UPDATE campaigns SET status = 'paused', updated_at = NOW() WHERE id = :id";
            $message = "Campagne '{$campaign['name']}' pausée";
            $log_action = 'campaign_paused';
            break;

        case 'resume':
            if ($campaign['status'] !== 'paused') {
                throw new InvalidArgumentException('Seules les campagnes pausées peuvent être relancées');
            }
            
            $update_query = "UPDATE campaigns SET status = 'active', updated_at = NOW() WHERE id = :id";
            $message = "Campagne '{$campaign['name']}' relancée";
            $log_action = 'campaign_resumed';
            break;

        case 'complete':
            if (!in_array($campaign['status'], ['active', 'paused'])) {
                throw new InvalidArgumentException('Seules les campagnes actives ou pausées peuvent être terminées');
            }
            
            $update_query = "UPDATE campaigns SET status = 'completed', updated_at = NOW() WHERE id = :id";
            $message = "Campagne '{$campaign['name']}' terminée";
            $log_action = 'campaign_completed';
            break;

        case 'delete':
            // Vérifications de sécurité
            $results_check = "SELECT COUNT(*) as count FROM campaign_results WHERE campaign_id = :id";
            $results_stmt = $db->prepare($results_check);
            $results_stmt->bindParam(':id', $campaign_id);
            $results_stmt->execute();
            $results_count = $results_stmt->fetch(PDO::FETCH_ASSOC)['count'];

            if ($results_count > 0 && $campaign['status'] !== 'draft') {
                throw new InvalidArgumentException('Impossible de supprimer une campagne avec des résultats');
            }

            $db->beginTransaction();
            try {
                // Supprimer les résultats d'abord
                $delete_results = "DELETE FROM campaign_results WHERE campaign_id = :id";
                $delete_results_stmt = $db->prepare($delete_results);
                $delete_results_stmt->bindParam(':id', $campaign_id);
                $delete_results_stmt->execute();

                // Supprimer la campagne
                $delete_campaign = "DELETE FROM campaigns WHERE id = :id";
                $delete_campaign_stmt = $db->prepare($delete_campaign);
                $delete_campaign_stmt->bindParam(':id', $campaign_id);
                $delete_campaign_stmt->execute();

                $db->commit();
                
                $logger->logActivity(1, 'campaign_deleted', "Campagne '{$campaign['name']}' supprimée", 'campaign', $campaign_id);
                
                echo json_encode([
                    'success' => true,
                    'message' => "Campagne '{$campaign['name']}' supprimée avec succès"
                ]);
                exit;
                
            } catch (Exception $e) {
                $db->rollback();
                throw $e;
            }
            break;

        case 'update_details':
            $name = trim($_POST['name'] ?? '');
            $description = trim($_POST['description'] ?? '');
            
            if (empty($name)) {
                throw new InvalidArgumentException('Le nom est obligatoire');
            }

            $update_query = "
                UPDATE campaigns 
                SET name = :name, description = :description, updated_at = NOW() 
                WHERE id = :id
            ";
            
            $update_stmt = $db->prepare($update_query);
            $update_stmt->bindParam(':name', $name);
            $update_stmt->bindParam(':description', $description);
            $update_stmt->bindParam(':id', $campaign_id);
            $update_stmt->execute();

            $message = "Détails de la campagne mis à jour";
            $log_action = 'campaign_updated';
            break;

        default:
            throw new InvalidArgumentException('Action non reconnue');
    }

    if (isset($update_query)) {
        $update_stmt = $db->prepare($update_query);
        $update_stmt->bindParam(':id', $campaign_id);
        $update_stmt->execute();
    }

    // Log de l'activité
    $logger->logActivity(1, $log_action, $message, 'campaign', $campaign_id);

    echo json_encode([
        'success' => true,
        'message' => $message
    ], JSON_PRETTY_PRINT);

} catch (InvalidArgumentException $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
} catch (Exception $e) {
    error_log("Erreur update_campaign.php: " . $e->getMessage());
    http_response_code($e->getCode() === 404 ? 404 : 500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
