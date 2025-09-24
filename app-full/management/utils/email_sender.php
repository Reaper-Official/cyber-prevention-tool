<?php
// app-full/management/utils/email_sender.php (version complète)
class EmailSender {
    private $smtp_host;
    private $smtp_port;
    private $smtp_user;
    private $smtp_pass;
    private $db;
    
    public function __construct($config = null, $database = null) {
        $this->smtp_host = $config['smtp_host'] ?? 'localhost';
        $this->smtp_port = $config['smtp_port'] ?? 587;
        $this->smtp_user = $config['smtp_user'] ?? '';
        $this->smtp_pass = $config['smtp_pass'] ?? '';
        $this->db = $database;
    }
    
    public function sendPhishingEmail($to, $subject, $content, $tracking_data) {
        try {
            // 1. Génération d'un token unique et sécurisé
            $unique_token = $this->generateUniqueToken($tracking_data['campaign_id'], $tracking_data['employee_id']);
            
            // 2. Stockage du token en base de données
            $this->storeTrackingToken($tracking_data['campaign_id'], $tracking_data['employee_id'], $unique_token);
            
            // 3. Génération des URLs de tracking
            $base_url = $_ENV['APP_URL'] ?? 'https://votre-domaine.com';
            
            // URL de clic (lien principal)
            $click_url = $base_url . "/t/" . $unique_token;
            
            // URL de pixel de tracking (ouverture email)
            $pixel_url = $base_url . "/p/" . $unique_token . ".gif";
            
            // 4. Remplacement des variables dans le template
            $content = str_replace('{TRACKING_URL}', $click_url, $content);
            $content = $this->addTrackingPixel($content, $pixel_url);
            
            // 5. Envoi de l'email
            $headers = $this->buildEmailHeaders($tracking_data);
            
            if ($this->smtp_host === 'localhost') {
                // Mode simulation pour développement
                error_log("SIMULATION EMAIL - To: $to, Subject: $subject, Click URL: $click_url");
                return true;
            } else {
                return mail($to, $subject, $content, $headers);
            }
            
        } catch (Exception $e) {
            error_log("Erreur envoi email: " . $e->getMessage());
            return false;
        }
    }
    
    private function generateUniqueToken($campaign_id, $employee_id) {
        // Génération d'un token unique et sécurisé
        $data = $campaign_id . '|' . $employee_id . '|' . time() . '|' . uniqid();
        $hash = hash('sha256', $data . ($_ENV['ENCRYPTION_KEY'] ?? 'default_key'));
        return substr($hash, 0, 32); // Token de 32 caractères
    }
    
    private function storeTrackingToken($campaign_id, $employee_id, $token) {
        if (!$this->db) return false;
        
        try {
            $query = "
                INSERT INTO tracking_tokens (campaign_id, employee_id, token, created_at, expires_at)
                VALUES (:campaign_id, :employee_id, :token, NOW(), NOW() + INTERVAL '30 days')
                ON CONFLICT (campaign_id, employee_id) 
                DO UPDATE SET token = :token, created_at = NOW(), expires_at = NOW() + INTERVAL '30 days'
            ";
            
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':campaign_id', $campaign_id);
            $stmt->bindParam(':employee_id', $employee_id);
            $stmt->bindParam(':token', $token);
            
            return $stmt->execute();
        } catch (Exception $e) {
            error_log("Erreur stockage token: " . $e->getMessage());
            return false;
        }
    }
    
    private function addTrackingPixel($content, $pixel_url) {
        // Ajouter le pixel de tracking juste avant la fermeture du body
        $pixel_html = '<img src="' . $pixel_url . '" width="1" height="1" style="display:none;" alt="">';
        
        if (strpos($content, '</body>') !== false) {
            return str_replace('</body>', $pixel_html . '</body>', $content);
        } else {
            return $content . $pixel_html;
        }
    }
    
    private function buildEmailHeaders($tracking_data) {
        $headers = "MIME-Version: 1.0\r\n";
        $headers .= "Content-type: text/html; charset=UTF-8\r\n";
        $headers .= "From: PhishGuard Test <noreply@votre-domaine.com>\r\n";
        
        // Headers personnalisés pour le tracking
        $headers .= "X-Campaign-ID: {$tracking_data['campaign_id']}\r\n";
        $headers .= "X-Tracking-ID: " . uniqid() . "\r\n";
        
        return $headers;
    }
}
?>
