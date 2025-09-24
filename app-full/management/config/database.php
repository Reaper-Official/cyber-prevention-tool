<?php
// app-full/management/config/database.php - Version corrigée PostgreSQL
class Database {
    private $host;
    private $db_name;
    private $username;
    private $password;
    private $port;
    private $conn;

    public function __construct() {
        // Configuration depuis les variables d'environnement
        $this->host = $_ENV['DB_HOST'] ?? 'localhost';
        $this->db_name = $_ENV['DB_NAME'] ?? 'phishguard_basic';
        $this->username = $_ENV['DB_USER'] ?? 'phishguard';
        $this->password = $_ENV['DB_PASSWORD'] ?? 'secure_password';
        $this->port = $_ENV['DB_PORT'] ?? '5432';
    }

    public function getConnection() {
        $this->conn = null;

        try {
            // Configuration PostgreSQL
            $dsn = "pgsql:host=" . $this->host . 
                   ";port=" . $this->port . 
                   ";dbname=" . $this->db_name . 
                   ";options='--client_encoding=UTF8'";
            
            $this->conn = new PDO(
                $dsn,
                $this->username,
                $this->password,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                    PDO::ATTR_STRINGIFY_FETCHES => false,
                    PDO::ATTR_TIMEOUT => 30
                ]
            );
            
            // Configuration PostgreSQL spécifique
            $this->conn->exec("SET NAMES 'UTF8'");
            $this->conn->exec("SET timezone = 'Europe/Paris'");
            
        } catch(PDOException $exception) {
            error_log("Erreur de connexion PostgreSQL: " . $exception->getMessage());
            throw new Exception("Erreur de connexion à la base de données PostgreSQL");
        }

        return $this->conn;
    }

    public function testConnection() {
        try {
            $conn = $this->getConnection();
            $stmt = $conn->query("SELECT version()");
            $version = $stmt->fetchColumn();
            return [
                'success' => true,
                'version' => $version,
                'database' => $this->db_name
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
}
?>
