<?php
// training.php - Page de formation interactive après phishing
$campaign_id = intval($_GET['c'] ?? 0);
$employee_id = intval($_GET['e'] ?? 0);
$token = $_GET['t'] ?? '';

if (!$campaign_id || !$employee_id) {
    header('Location: /error.html');
    exit;
}

// Récupération des informations de la campagne
try {
    require_once 'config/database.php';
    $database = new Database();
    $db = $database->getConnection();
    
    $campaign_query = "
        SELECT c.name, c.template, e.full_name, e.department
        FROM campaigns c
        JOIN campaign_results cr ON c.id = cr.campaign_id
        JOIN employees e ON cr.employee_id = e.id
        WHERE c.id = :cid AND e.id = :eid AND cr.link_clicked = TRUE
    ";
    
    $campaign_stmt = $db->prepare($campaign_query);
    $campaign_stmt->bindParam(':cid', $campaign_id);
    $campaign_stmt->bindParam(':eid', $employee_id);
    $campaign_stmt->execute();
    $campaign_info = $campaign_stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$campaign_info) {
        header('Location: /error.html');
        exit;
    }
} catch (Exception $e) {
    error_log("Erreur training.php: " . $e->getMessage());
    $campaign_info = ['name' => 'Formation Sécurité', 'template' => 'generic'];
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Formation Sécurité - PhishGuard</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        :root {
            --primary: #0b046d;
            --danger: #dc2626;
            --warning: #f59e0b;
            --success: #059669;
            --info: #0ea5e9;
            --gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #334155;
            background: var(--gradient);
            min-height: 100vh;
            padding: 20px;
        }

        .training-container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 25px 50px rgba(0,0,0,0.15);
            overflow: hidden;
            animation: slideUp 0.8s ease-out;
        }

        @keyframes slideUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .alert-header {
            background: linear-gradient(135deg, #ff6b6b, #ffa500);
            color: white;
            padding: 3rem 2rem;
            text-align: center;
            position: relative;
            overflow: hidden;
        }

        .alert-header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: repeating-linear-gradient(
                45deg,
                transparent,
                transparent 20px,
                rgba(255,255,255,0.1) 20px,
                rgba(255,255,255,0.1) 40px
            );
            animation: slide 4s linear infinite;
        }

        @keyframes slide {
            0% { transform: translateX(-40px); }
            100% { transform: translateX(40px); }
        }

        .alert-icon {
            font-size: 4rem;
            margin-bottom: 1rem;
            animation: shake 1.5s ease-in-out infinite alternate;
            position: relative;
            z-index: 2;
        }

        @keyframes shake {
            0% { transform: rotate(-3deg) scale(1); }
            100% { transform: rotate(3deg) scale(1.05); }
        }

        .alert-title {
            font-size: 2.5rem;
            font-weight: 800;
            margin-bottom: 0.5rem;
            position: relative;
            z-index: 2;
        }

        .alert-subtitle {
            font-size: 1.2rem;
            opacity: 0.95;
            position: relative;
            z-index: 2;
        }

        .content {
            padding: 2.5rem;
        }

        .section {
            margin: 2rem 0;
            padding: 1.5rem;
            border-radius: 12px;
            border-left: 4px solid;
        }

        .section-danger {
            background: #fef2f2;
            border-left-color: var(--danger);
        }

        .section-info {
            background: #f0f9ff;
            border-left-color: var(--info);
        }

        .section-success {
            background: #f0fdf4;
            border-left-color: var(--success);
        }

        .section-warning {
            background: #fffbeb;
            border-left-color: var(--warning);
        }

        .section-title {
            font-size: 1.3rem;
            font-weight: 700;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .section-title i {
            font-size: 1.5rem;
        }

        .tips-list {
            list-style: none;
            padding: 0;
        }

        .tips-list li {
            padding: 0.75rem 0;
            display: flex;
            align-items: flex-start;
            gap: 1rem;
            border-bottom: 1px solid rgba(0,0,0,0.1);
        }

        .tips-list li:last-child {
            border-bottom: none;
        }

        .tips-list .icon {
            font-size: 1.2rem;
            margin-top: 0.2rem;
            min-width: 20px;
        }

        .quiz-container {
            background: #f8fafc;
            border-radius: 12px;
            padding: 2rem;
            margin: 2rem 0;
            border: 2px solid #e2e8f0;
        }

        .progress-bar {
            background: #e2e8f0;
            height: 12px;
            border-radius: 6px;
            overflow: hidden;
            margin: 1rem 0;
        }

        .progress-fill {
            background: var(--gradient);
            height: 100%;
            width: 0;
            transition: width 0.5s ease;
        }

        .question {
            background: white;
            border-radius: 8px;
            padding: 1.5rem;
            margin: 1rem 0;
            border: 1px solid #e2e8f0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .question h4 {
            color: var(--primary);
            margin-bottom: 1rem;
            font-size: 1.1rem;
        }

        .answers {
            margin-top: 1rem;
        }

        .answer {
            display: block;
            margin: 0.75rem 0;
            padding: 1rem;
            background: #f8fafc;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
        }

        .answer:hover {
            background: #e0e7ff;
            border-color: var(--primary);
            transform: translateX(5px);
        }

        .answer.selected {
            background: #dbeafe;
            border-color: var(--info);
        }

        .answer input[type="radio"] {
            margin-right: 1rem;
            transform: scale(1.2);
        }

        .btn {
            background: var(--gradient);
            color: white;
            border: none;
            padding: 1rem 2rem;
            border-radius: 50px;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            margin: 1rem 0.5rem 1rem 0;
        }

        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        }

        .btn:disabled {
            opacity: 0
