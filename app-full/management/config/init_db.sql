<?php
// config/database.php
class Database {
    private $host = 'localhost';
    private $db_name = 'phishguard_basic';
    private $username = 'root';
    private $password = '';
    private $conn;

    public function getConnection() {
        $this->conn = null;

        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name,
                $this->username,
                $this->password
            );
            $this->conn->exec("set names utf8");
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch(PDOException $exception) {
            echo "Erreur de connexion: " . $exception->getMessage();
        }

        return $this->conn;
    }
}

// config/init_db.sql
/*
CREATE DATABASE IF NOT EXISTS phishguard_basic;
USE phishguard_basic;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'hr', 'employee') DEFAULT 'employee',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    department VARCHAR(50) NOT NULL,
    position VARCHAR(100) NOT NULL,
    status ENUM('active', 'inactive', 'pending') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS campaigns (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    template VARCHAR(50) NOT NULL,
    target_type ENUM('all', 'department', 'custom') NOT NULL,
    target_value TEXT,
    status ENUM('draft', 'active', 'completed', 'paused') DEFAULT 'draft',
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS email_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    template_type VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS campaign_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    campaign_id INT NOT NULL,
    employee_id INT NOT NULL,
    email_sent BOOLEAN DEFAULT FALSE,
    email_opened BOOLEAN DEFAULT FALSE,
    link_clicked BOOLEAN DEFAULT FALSE,
    form_submitted BOOLEAN DEFAULT FALSE,
    training_completed BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP NULL,
    opened_at TIMESTAMP NULL,
    clicked_at TIMESTAMP NULL,
    submitted_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);

CREATE TABLE IF NOT EXISTS training_modules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    module_type VARCHAR(50) NOT NULL,
    duration_minutes INT DEFAULT 10,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS activity_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    description TEXT,
    entity_type VARCHAR(50),
    entity_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Données d'exemple
INSERT INTO users (username, email, password, role) VALUES 
('admin', 'admin@phishguard.local', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

INSERT INTO email_templates (name, subject, content, template_type) VALUES 
('Phishing Bancaire', 'Mise à jour importante de votre compte', '<html><body><h2>Action requise sur votre compte</h2><p>Cliquez ici pour vérifier: <a href="{TRACKING_URL}">Vérifier maintenant</a></p></body></html>', 'banking'),
('Support IT', 'Mise à jour système requise', '<html><body><h2>Mise à jour de sécurité</h2><p>Cliquez pour installer: <a href="{TRACKING_URL}">Installer</a></p></body></html>', 'it'),
('Réseau Social', 'Nouvelle notification', '<html><body><h2>Vous avez une nouvelle notification</h2><p>Voir: <a href="{TRACKING_URL}">Cliquer ici</a></p></body></html>', 'social');

INSERT INTO training_modules (title, content, module_type) VALUES 
('Reconnaissance du Phishing', 'Apprenez à identifier les tentatives de phishing...', 'interactive'),
('Sécurité des Mots de Passe', 'Les bonnes pratiques pour créer des mots de passe sécurisés...', 'video'),
('Navigation Sécurisée', 'Comment naviguer en toute sécurité sur Internet...', 'quiz');
*/

// api/dashboard_data.php
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

require_once '../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    // Statistiques générales
    $stats_query = "
        SELECT 
            (SELECT COUNT(*) FROM campaigns WHERE status = 'active') as active_campaigns,
            (SELECT COUNT(*) FROM employees WHERE status = 'active') as total_employees,
            (SELECT COUNT(DISTINCT employee_id) FROM campaign_results WHERE training_completed = TRUE) as trained_employees,
            (SELECT COUNT(*) FROM campaign_results WHERE link_clicked = FALSE) as incidents_avoided
    ";
    
    $stats_stmt = $db->prepare($stats_query);
    $stats_stmt->execute();
    $stats = $stats_stmt->fetch(PDO::FETCH_ASSOC);

    // Calcul du taux de réussite
    $success_query = "
        SELECT 
            COUNT(CASE WHEN link_clicked = FALSE THEN 1 END) as not_clicked,
            COUNT(*) as total
        FROM campaign_results 
        WHERE campaign_id IN (SELECT id FROM campaigns WHERE status = 'completed')
    ";
    
    $success_stmt = $db->prepare($success_query);
    $success_stmt->execute();
    $success_data = $success_stmt->fetch(PDO::FETCH_ASSOC);
    
    $success_rate = $success_data['total'] > 0 
        ? round(($success_data['not_clicked'] / $success_data['total']) * 100, 1) 
        : 0;

    $stats['success_rate'] = $success_rate;

    //
