class Logger {
    private $db;
    
    public function __construct($database) {
        $this->db = $database;
    }
    
    public function logActivity($user_id, $action, $description, $entity_type = null, $entity_id = null) {
        try {
            $query = "INSERT INTO activity_log (user_id, action, description, entity_type, entity_id) 
                      VALUES (:user_id, :action, :description, :entity_type, :entity_id)";
            
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':user_id', $user_id);
            $stmt->bindParam(':action', $action);
            $stmt->bindParam(':description', $description);
            $stmt->bindParam(':entity_type', $entity_type);
            $stmt->bindParam(':entity_id', $entity_id);
            
            return $stmt->execute();
        } catch (Exception $e) {
            error_log("Erreur logging: " . $e->getMessage());
            return false;
        }
    }
}
