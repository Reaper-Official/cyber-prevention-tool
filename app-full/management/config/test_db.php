<?php
// app-full/management/config/test_db.php - Test de connectivité
require_once 'database.php';

try {
    echo "🧪 Test de connectivité PostgreSQL\n";
    echo "==================================\n\n";

    $database = new Database();
    $result = $database->testConnection();

    if ($result['success']) {
        echo "✅ Connexion PostgreSQL: OK\n";
        echo "📊 Version: {$result['version']}\n";
        echo "🗄️ Base de données: {$result['database']}\n\n";

        // Test des requêtes de base
        $conn = $database->getConnection();
        
        echo "🔍 Test des tables principales:\n";
        
        $tables = ['users', 'employees', 'campaigns', 'email_templates', 'tracking_tokens'];
        foreach ($tables as $table) {
            try {
                $stmt = $conn->query("SELECT COUNT(*) FROM $table");
                $count = $stmt->fetchColumn();
                echo "   ✅ Table '$table': $count enregistrements\n";
            } catch (Exception $e) {
                echo "   ❌ Table '$table': {$e->getMessage()}\n";
            }
        }
        
        echo "\n🎉 Base de données opérationnelle!\n";
        
    } else {
        echo "❌ Erreur de connexion: {$result['error']}\n";
        exit(1);
    }

} catch (Exception $e) {
    echo "❌ Erreur critique: " . $e->getMessage() . "\n";
    exit(1);
}
?>
