class EmailSender {
    private $smtp_host;
    private $smtp_port;
    private $smtp_user;
    private $smtp_pass;
    
    public function __construct($config = null) {
        // Configuration par défaut ou depuis base de données
        $this->smtp_host = $config['smtp_host'] ?? 'localhost';
        $this->smtp_port = $config['smtp_port'] ?? 587;
        $this->smtp_user = $config['smtp_user'] ?? '';
        $this->smtp_pass = $config['smtp_pass'] ?? '';
    }
    
    public function sendPhishingEmail($to, $subject, $content, $tracking_data) {
        try {
            // Remplacer les variables de tracking dans le contenu
            $tracking_url = "https://your-domain.com/api/tracking.php?action=click&c={$tracking_data['campaign_id']}&e={$tracking_data['employee_id']}&token=" . $this->generateToken();
            $pixel_url = "https://your-domain.com/api/tracking.php?action=open&c={$tracking_data['campaign_id']}&e={$tracking_data['employee_id']}";
            
            $content = str_replace('{TRACKING_URL}', $tracking_url, $content);
            $content .= '<img src="' . $pixel_url . '" width="1" height="1" style="display:none;">';
            
            // Headers pour email HTML
            $headers = "MIME-Version: 1.0" . "\r\n";
            $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
            $headers .= "From: PhishGuard Test <noreply@your-domain.com>" . "\r\n";
            
            // Simulation d'envoi (remplacer par vraie implémentation SMTP)
            if ($this->smtp_host === 'localhost') {
                // Mode simulation pour développement
                error_log("SIMULATION EMAIL - To: $to, Subject: $subject");
                return true;
            } else {
                // Utiliser PHPMailer ou Swift Mailer ici pour vrai envoi SMTP
                return mail($to, $subject, $content, $headers);
            }
            
        } catch (Exception $e) {
            error_log("Erreur envoi email: " . $e->getMessage());
            return false;
        }
    }
    
    private function generateToken() {
        return bin2hex(random_bytes(16));
    }
