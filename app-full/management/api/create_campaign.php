<?php
// api/create_campaign.php - API complète de création de campagne
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config/database.php';
require_once '../utils/logger.php';
require_once '../utils/email_sender.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();
    $logger = new Logger($db);
    
    // Récupération et validation des données
    $campaign_name = trim($_POST['campaignName'] ?? '');
    $email_template = $_POST['emailTemplate'] ?? '';
    $target_type = $_POST['target'] ?? '';
    $description = trim($_POST['description'] ?? '');
    $schedule_date = $_POST['scheduleDate'] ?? null;
    
    // Validation stricte
    if (empty($campaign_name)) {
        throw new InvalidArgumentException('Le nom de la campagne est obligatoire');
    }
    
    if (strlen($campaign_name) < 3 || strlen($campaign_name) > 100) {
        throw new InvalidArgumentException('Le nom doit contenir entre 3 et 100 caractères');
    }
    
    if (!in_array($email_template, ['banking', 'social', 'it', 'custom'])) {
        throw new InvalidArgumentException('Template invalide');
    }
    
    if (!in_array($target_type, ['all', 'department', 'custom'])) {
        throw new InvalidArgumentException('Type de cible invalide');
    }

    // Vérifier l'unicité du nom
    $check_query = "SELECT id FROM campaigns WHERE name = :name";
    $check_stmt = $db->prepare($check_query);
    $check_stmt->bindParam(':name', $campaign_name);
    $check_stmt->execute();
    
    if ($check_stmt->rowCount() > 0) {
        throw new InvalidArgumentException('Une campagne avec ce nom existe déjà');
    }

    // Récupérer le template d'email
    $template_query = "SELECT subject, content FROM email_templates WHERE template_type = :type AND is_active = TRUE LIMIT 1";
    $template_stmt = $db->prepare($template_query);
    $template_stmt->bindParam(':type', $email_template);
    $template_stmt->execute();
    $template_data = $template_stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$template_data) {
        throw new InvalidArgumentException('Template d\'email non trouvé');
    }

    // Démarrer la transaction
    $db->beginTransaction();

    try {
        // 1. Créer la campagne
        $campaign_query = "
            INSERT INTO campaigns (name, description, template, target_type, status, created_by, created_at) 
            VALUES (:name, :description, :template, :target_type, 'draft', 1, NOW())
        ";
        
        $campaign_stmt = $db->prepare($campaign_query);
        $campaign_stmt->bindParam(':name', $campaign_name);
        $campaign_stmt->bindParam(':description', $description);
        $campaign_stmt->bindParam(':template', $email_template);
        $campaign_stmt->bindParam(':target_type', $target_type);
        $campaign_stmt->execute();
        
        $campaign_id = $db->lastInsertId();

        // 2. Identifier les employés cibles
        $target_employees = [];
        
        switch ($target_type) {
            case 'all':
                $target_query = "SELECT id, email, full_name FROM employees WHERE status = 'active'";
                $target_stmt = $db->prepare($target_query);
                $target_stmt->execute();
                $target_employees = $target_stmt->fetchAll(PDO::FETCH_ASSOC);
                break;
                
            case 'department':
                $department = $_POST['department'] ?? '';
                if (empty($department)) {
                    throw new InvalidArgumentException('Département non spécifié');
                }
                
                $target_query = "SELECT id, email, full_name FROM employees WHERE status = 'active' AND department = :dept";
                $target_stmt = $db->prepare($target_query);
                $target_stmt->bindParam(':dept', $department);
                $target_stmt->execute();
                $target_employees = $target_stmt->fetchAll(PDO::FETCH_ASSOC);
                break;
                
            case 'custom':
                $employee_ids = $_POST['employee_ids'] ?? [];
                if (empty($employee_ids)) {
                    throw new InvalidArgumentException('Aucun employé sélectionné');
                }
                
                $placeholders = str_repeat('?,', count($employee_ids) - 1) . '?';
                $target_query = "SELECT id, email, full_name FROM employees WHERE status = 'active' AND id IN ($placeholders)";
                $target_stmt = $db->prepare($target_query);
                $target_stmt->execute($employee_ids);
                $target_employees = $target_stmt->fetchAll(PDO::FETCH_ASSOC);
                break;
        }
        
        if (empty($target_employees)) {
            throw new InvalidArgumentException('Aucun employé cible trouvé');
        }

        // 3. Créer les enregistrements de résultats pour chaque cible
        $result_query = "
            INSERT INTO campaign_results (campaign_id, employee_id, email_sent, sent_at) 
            VALUES (:campaign_id, :employee_id, FALSE, NULL)
        ";
        $result_stmt = $db->prepare($result_query);
        
        foreach ($target_employees as $employee) {
            $result_stmt->bindParam(':campaign_id', $campaign_id);
            $result_stmt->bindParam(':employee_id', $employee['id']);
            $result_stmt->execute();
        }

        // 4. Marquer la campagne comme active et lancer les envois
        $activate_query = "UPDATE campaigns SET status = 'active' WHERE id = :id";
        $activate_stmt = $db->prepare($activate_query);
        $activate_stmt->bindParam(':id', $campaign_id);
        $activate_stmt->execute();

        // 5. Envoi des emails (en mode asynchrone idéalement)
        $email_sender = new EmailSender();
        $sent_count = 0;
        $failed_count = 0;
        
        foreach ($target_employees as $employee) {
            $tracking_data = [
                'campaign_id' => $campaign_id,
                'employee_id' => $employee['id']
            ];
            
            $success = $email_sender->sendPhishingEmail(
                $employee['email'], 
                $template_data['subject'], 
                $template_data['content'], 
                $tracking_data
            );
            
            if ($success) {
                // Marquer comme envoyé
                $update_sent = "UPDATE campaign_results SET email_sent = TRUE, sent_at = NOW() 
                               WHERE campaign_id = :cid AND employee_id = :eid";
                $update_stmt = $db->prepare($update_sent);
                $update_stmt->bindParam(':cid', $campaign_id);
                $update_stmt->bindParam(':eid', $employee['id']);
                $update_stmt->execute();
                
                $sent_count++;
            } else {
                $failed_count++;
            }
            
            // Petite pause pour éviter le spam
            usleep(100000); // 100ms
        }

        // 6. Log de l'activité
        $logger->logActivity(
            1, 
            'campaign_created', 
            "Campagne '{$campaign_name}' créée avec {$sent_count} emails envoyés, {$failed_count} échecs", 
            'campaign', 
            $campaign_id
        );

        // Valider la transaction
        $db->commit();

        // Réponse de succès
        echo json_encode([
            'success' => true,
            'message' => 'Campagne créée et lancée avec succès',
            'campaign_id' => $campaign_id,
            'stats' => [
                'total_targets' => count($target_employees),
                'emails_sent' => $sent_count,
                'emails_failed' => $failed_count,
                'success_rate' => count($target_employees) > 0 
                    ? round(($sent_count / count($target_employees)) * 100, 1) 
                    : 0
            ]
        ], JSON_PRETTY_PRINT);

    } catch (Exception $e) {
        $db->rollback();
        throw $e;
    }

} catch (InvalidArgumentException $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Données invalides',
        'message' => $e->getMessage()
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    error_log("Erreur create_campaign.php: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erreur serveur',
        'message' => 'Une erreur interne s\'est produite'
    ], JSON_PRETTY_PRINT);
}
?>
