<?php
// setup.php - Configuration initiale automatique de PhishGuard BASIC

echo "🔧 Configuration initiale de PhishGuard BASIC\n";
echo "============================================\n\n";

try {
    // Inclusion des fichiers nécessaires
    require_once 'app-full/management/config/database.php';

    $database = new Database();
    $db = $database->getConnection();

    echo "✅ Connexion à la base de données: OK\n";

    // 1. Création de l'utilisateur admin par défaut
    echo "👤 Création de l'utilisateur administrateur...\n";
    
    $admin_password = password_hash('admin', PASSWORD_DEFAULT);
    $admin_query = "
        INSERT INTO users (username, email, password, role, full_name, is_active, created_at) 
        VALUES ('admin', 'admin@phishguard.local', :password, 'admin', 'Administrateur PhishGuard', TRUE, NOW())
        ON CONFLICT (username) DO UPDATE SET
            password = :password,
            updated_at = NOW()
    ";
    
    $admin_stmt = $db->prepare($admin_query);
    $admin_stmt->bindParam(':password', $admin_password);
    $admin_stmt->execute();
    echo "✅ Utilisateur admin créé/mis à jour\n";

    // 2. Insertion des templates d'email par défaut
    echo "📧 Installation des templates d'email...\n";
    
    $templates = [
        [
            'name' => 'Phishing Bancaire Standard',
            'subject' => 'Action urgente requise - Vérification de votre compte',
            'content' => file_get_contents('templates/banking-template.html') ?: 'Template bancaire par défaut',
            'type' => 'banking',
            'difficulty' => 'medium'
        ],
        [
            'name' => 'Support IT - Mise à jour sécurité',
            'subject' => 'URGENT: Mise à jour de sécurité obligatoire',
            'content' => file_get_contents('templates/it-template.html') ?: 'Template IT par défaut',
            'type' => 'it',
            'difficulty' => 'easy'
        ],
        [
            'name' => 'Réseau Social - Notification',
            'subject' => 'Nouvelle connexion détectée sur votre compte',
            'content' => '<html><body><h2>Nouvelle connexion</h2><p>Une nouvelle connexion a été détectée. <a href="{TRACKING_URL}">Cliquez ici pour vérifier</a></p></body></html>',
            'type' => 'social',
            'difficulty' => 'hard'
        ]
    ];

    foreach ($templates as $template) {
        $template_query = "
            INSERT INTO email_templates (name, subject, content, template_type, difficulty_level, is_active, created_by, created_at)
            VALUES (:name, :subject, :content, :type, :difficulty, TRUE, 1, NOW())
            ON CONFLICT (name) DO UPDATE SET
                subject = :subject,
                content = :content,
                updated_at = NOW()
        ";
        
        $template_stmt = $db->prepare($template_query);
        $template_stmt->bindParam(':name', $template['name']);
        $template_stmt->bindParam(':subject', $template['subject']);
        $template_stmt->bindParam(':content', $template['content']);
        $template_stmt->bindParam(':type', $template['type']);
        $template_stmt->bindParam(':difficulty', $template['difficulty']);
        $template_stmt->execute();
    }
    echo "✅ Templates d'email installés\n";

    // 3. Configuration des paramètres système
    echo "⚙️  Configuration des paramètres système...\n";
    
    $settings = [
        ['smtp_host', 'localhost', 'string'],
        ['smtp_port', '587', 'integer'],
        ['smtp_encryption', 'tls', 'string'],
        ['app_name', 'PhishGuard BASIC', 'string'],
        ['app_version', '1.0.0', 'string'],
        ['default_language', 'fr', 'string'],
        ['session_timeout', '1440', 'integer'],
        ['max_upload_size', '10485760', 'integer'],
        ['backup_retention_days', '30', 'integer'],
        ['log_retention_days', '90', 'integer'],
        ['gdpr_enabled', 'true', 'boolean'],
        ['data_retention_days', '365', 'integer'],
        ['email_rate_limit', '50', 'integer'],
        ['campaign_auto_complete_days', '30', 'integer']
    ];

    foreach ($settings as $setting) {
        $setting_query = "
            INSERT INTO system_settings (setting_key, setting_value, setting_type, updated_at)
            VALUES (:key, :value, :type, NOW())
            ON CONFLICT (setting_key) DO UPDATE SET
                setting_value = :value,
                updated_at = NOW()
        ";
        
        $setting_stmt = $db->prepare($setting_query);
        $setting_stmt->bindParam(':key', $setting[0]);
        $setting_stmt->bindParam(':value', $setting[1]);
        $setting_stmt->bindParam(':type', $setting[2]);
        $setting_stmt->execute();
    }
    echo "✅ Paramètres système configurés\n";

    // 4. Création des modules de formation par défaut
    echo "🎓 Installation des modules de formation...\n";
    
    $training_modules = [
        [
            'title' => 'Reconnaître les emails de phishing',
            'description' => 'Apprenez à identifier les signes d\'un email de phishing',
            'content' => 'Contenu du module de reconnaissance des emails de phishing...',
            'type' => 'interactive',
            'difficulty' => 'beginner',
            'duration' => 10
        ],
        [
            'title' => 'Bonnes pratiques de sécurité',
            'description' => 'Les réflexes à adopter au quotidien',
            'content' => 'Contenu du module des bonnes pratiques...',
            'type' => 'text',
            'difficulty' => 'beginner',
            'duration' => 15
        ],
        [
            'title' => 'Que faire en cas de suspicion ?',
            'description' => 'Procédures à suivre si vous suspectez une attaque',
            'content' => 'Contenu du module de procédures d\'urgence...',
            'type' => 'quiz',
            'difficulty' => 'intermediate',
            'duration' => 5
        ]
    ];

    foreach ($training_modules as $index => $module) {
        $module_query = "
            INSERT INTO training_modules (title, description, content, module_type, difficulty_level, estimated_duration, order_index, is_active, created_at)
            VALUES (:title, :description, :content, :type, :difficulty, :duration, :order_index, TRUE, NOW())
            ON CONFLICT (title) DO UPDATE SET
                description = :description,
                content = :content,
                updated_at = NOW()
        ";
        
        $module_stmt = $db->prepare($module_query);
        $module_stmt->bindParam(':title', $module['title']);
        $module_stmt->bindParam(':description', $module['description']);
        $module_stmt->bindParam(':content', $module['content']);
        $module_stmt->bindParam(':type', $module['type']);
        $module_stmt->bindParam(':difficulty', $module['difficulty']);
        $module_stmt->bindParam(':duration', $module['duration']);
        $module_stmt->bindParam(':order_index', $index);
        $module_stmt->execute();
    }
    echo "✅ Modules de formation installés\n";

    // 5. Création des répertoires de logs et permissions
    echo "📁 Configuration des répertoires...\n";
    
    $directories = [
        'storage/logs',
        'storage/cache', 
        'storage/uploads',
        'storage/backups',
        'storage/reports',
        'storage/exports'
    ];
    
    foreach ($directories as $dir) {
        if (!is_dir($dir)) {
            if (mkdir($dir, 0755, true)) {
                echo "   ✅ Répertoire créé: $dir\n";
            } else {
                echo "   ⚠️  Impossible de créer: $dir\n";
            }
        } else {
            echo "   ✅ Répertoire existant: $dir\n";
        }
    }

    // 6. Création d'employés d'exemple (optionnel)
    echo "👥 Création d'employés d'exemple...\n";
    
    $sample_employees = [
        [
            'full_name' => 'Jean Dupont',
            'email' => 'jean.dupont@exemple.com',
            'department' => 'IT',
            'position' => 'Développeur Senior',
            'risk_level' => 'low'
        ],
        [
            'full_name' => 'Marie Martin',
            'email' => 'marie.martin@exemple.com',
            'department' => 'RH',
            'position' => 'Responsable Ressources Humaines',
            'risk_level' => 'medium'
        ],
        [
            'full_name' => 'Pierre Leroy',
            'email' => 'pierre.leroy@exemple.com',
            'department' => 'Finance',
            'position' => 'Comptable',
            'risk_level' => 'high'
        ]
    ];

    foreach ($sample_employees as $employee) {
        $employee_query = "
            INSERT INTO employees (full_name, email, department, position, risk_level, status, created_at)
            VALUES (:name, :email, :dept, :position, :risk, 'active', NOW())
            ON CONFLICT (email) DO NOTHING
        ";
        
        $employee_stmt = $db->prepare($employee_query);
        $employee_stmt->bindParam(':name', $employee['full_name']);
        $employee_stmt->bindParam(':email', $employee['email']);
        $employee_stmt->bindParam(':dept', $employee['department']);
        $employee_stmt->bindParam(':position', $employee['position']);
        $employee_stmt->bindParam(':risk', $employee['risk_level']);
        $employee_stmt->execute();
    }
    echo "✅ Employés d'exemple créés\n";

    // 7. Log de l'initialisation
    $init_log_query = "
        INSERT INTO activity_log (user_id, action, description, entity_type, created_at)
        VALUES (1, 'system_initialized', 'Initialisation complète du système PhishGuard BASIC', 'system', NOW())
    ";
    $db->prepare($init_log_query)->execute();

    echo "\n🎉 Configuration terminée avec succès!\n";
    echo "=====================================\n";
    echo "📊 Résumé de l'installation:\n";
    echo "   • Utilisateur admin: créé\n";
    echo "   • Templates d'email: " . count($templates) . " installés\n";
    echo "   • Modules de formation: " . count($training_modules) . " créés\n";
    echo "   • Employés d'exemple: " . count($sample_employees) . " ajoutés\n";
    echo "   • Paramètres système: " . count($settings) . " configurés\n";
    echo "\n📱 Vous pouvez maintenant accéder à PhishGuard\n";
    echo "👤 Identifiants: admin / admin\n";
    echo "🔧 N'oubliez pas de changer le mot de passe!\n\n";

} catch (Exception $e) {
    echo "❌ Erreur lors de la configuration: " . $e->getMessage() . "\n";
    echo "📋 Trace de l'erreur:\n" . $e->getTraceAsString() . "\n";
    exit(1);
}
?>
