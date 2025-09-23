<?php
// api/complete_training.php - Finalisation de formation
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

require_once '../config/database.php';
require_once '../utils/logger.php';

$campaign_id = intval($_GET['c'] ?? $_POST['c'] ?? 0);
$employee_id = intval($_GET['e'] ?? $_POST['e'] ?? 0);
$quiz_score = intval($_POST['quiz_score'] ?? 0);
$training_time = intval($_POST['training_time'] ?? 0); // en secondes
$modules_completed = $_POST['modules_completed'] ?? [];

if (!$campaign_id || !$employee_id) {
    http_response_code(400);
    echo json_encode(['error' => 'Paramètres manquants']);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();
    $logger = new Logger($db);

    // Vérifier que l'enregistrement existe et que l'employé a cliqué
    $check_query = "
        SELECT 
            cr.id,
            cr.link_clicked,
            cr.training_completed,
            e.full_name,
            e.department,
            c.name as campaign_name
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
        echo json_encode(['error' => 'Enregistrement non trouvé']);
        exit;
    }

    if (!$record['link_clicked']) {
        http_response_code(400);
        echo json_encode(['error' => 'Formation non disponible - lien non cliqué']);
        exit;
    }

    if ($record['training_completed']) {
        echo json_encode(['success' => true, 'message' => 'Formation déjà terminée']);
        exit;
    }

    // Démarrer transaction
    $db->beginTransaction();

    try {
        // Mettre à jour le statut de formation
        $update_query = "
            UPDATE campaign_results 
            SET 
                training_completed = TRUE, 
                completed_at = NOW(),
                quiz_score = :quiz_score,
                training_duration = :training_time
            WHERE campaign_id = :campaign_id AND employee_id = :employee_id
        ";
        
        $update_stmt = $db->prepare($update_query);
        $update_stmt->bindParam(':quiz_score', $quiz_score);
        $update_stmt->bindParam(':training_time', $training_time);
        $update_stmt->bindParam(':campaign_id', $campaign_id);
        $update_stmt->bindParam(':employee_id', $employee_id);
        $update_stmt->execute();

        // Enregistrer les détails de la formation
        if (!empty($modules_completed)) {
            $modules_query = "
                INSERT INTO training_completions (campaign_result_id, module_name, completed_at)
                VALUES (:result_id, :module, NOW())
            ";
            $modules_stmt = $db->prepare($modules_query);
            
            foreach ($modules_completed as $module) {
                $modules_stmt->bindParam(':result_id', $record['id']);
                $modules_stmt->bindParam(':module', $module);
                $modules_stmt->execute();
            }
        }

        // Log de l'activité
        $score_text = $quiz_score > 0 ? " (Score: $quiz_score%)" : "";
        $time_text = $training_time > 0 ? " (Durée: " . gmdate("i:s", $training_time) . ")" : "";
        
        $logger->logActivity(
            null,
            'training_completed',
            "Formation terminée par {$record['full_name']} ({$record['department']}) - Campagne: {$record['campaign_name']}{$score_text}{$time_text}",
            'training',
            $record['id']
        );

        $db->commit();

        // Déterminer le niveau de réussite
        $performance_level = 'basic';
        if ($quiz_score >= 90) {
            $performance_level = 'excellent';
        } elseif ($quiz_score >= 75) {
            $performance_level = 'good';
        } elseif ($quiz_score >= 60) {
            $performance_level = 'satisfactory';
        }

        // Générer des recommandations personnalisées
        $recommendations = [];
        if ($quiz_score < 70) {
            $recommendations[] = "Réviser les signes de reconnaissance du phishing";
            $recommendations[] = "Pratiquer l'identification des liens suspects";
        }
        if ($training_time < 300) { // moins de 5 minutes
            $recommendations[] = "Prendre plus de temps pour assimiler le contenu";
        }

        echo json_encode([
            'success' => true,
            'message' => 'Formation terminée avec succès',
            'performance' => [
                'level' => $performance_level,
                'score' => $quiz_score,
                'training_time' => $training_time,
                'recommendations' => $recommendations
            ],
            'certificate_available' => $quiz_score >= 75
        ]);

    } catch (Exception $e) {
        $db->rollback();
        throw $e;
    }

} catch (Exception $e) {
    error_log("Erreur complete_training.php: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode(['error' => 'Erreur serveur: ' . $e->getMessage()]);
}
?>
