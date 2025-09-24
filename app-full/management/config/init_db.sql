-- app-full/management/config/init_db.sql - Version PostgreSQL pure
-- Script de création de base de données PhishGuard BASIC
-- ====================================================

-- Extensions PostgreSQL nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Table des utilisateurs administrateurs
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'employee' CHECK (role IN ('admin', 'reviewer', 'hr', 'employee')),
    full_name VARCHAR(100),
    last_login TIMESTAMP WITH TIME ZONE NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour users
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Trigger pour updated_at automatique
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Table des employés
CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    department VARCHAR(50) NOT NULL,
    position VARCHAR(100) NOT NULL,
    manager_id INTEGER REFERENCES employees(id) ON DELETE SET NULL,
    hire_date DATE NULL,
    phone VARCHAR(20),
    location VARCHAR(100),
    risk_level VARCHAR(10) DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'deleted')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour employees
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);

-- Trigger pour employees updated_at
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Table des templates d'emails
CREATE TABLE IF NOT EXISTS email_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    template_type VARCHAR(50) NOT NULL,
    language VARCHAR(5) DEFAULT 'fr',
    difficulty_level VARCHAR(10) DEFAULT 'medium' CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
    tags JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    usage_count INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0.00,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour email_templates
CREATE INDEX IF NOT EXISTS idx_email_templates_type ON email_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_email_templates_active ON email_templates(is_active);

-- Trigger pour email_templates updated_at
CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Table des campagnes
CREATE TABLE IF NOT EXISTS campaigns (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    template VARCHAR(50) NOT NULL,
    target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('all', 'department', 'position', 'custom', 'random')),
    target_value TEXT,
    target_count INTEGER DEFAULT 0,
    schedule_type VARCHAR(20) DEFAULT 'immediate' CHECK (schedule_type IN ('immediate', 'scheduled', 'recurring')),
    scheduled_at TIMESTAMP WITH TIME ZONE NULL,
    recurrence_pattern VARCHAR(100) NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'active', 'paused', 'completed', 'cancelled')),
    landing_page_url VARCHAR(500),
    redirect_url VARCHAR(500),
    enable_attachments BOOLEAN DEFAULT FALSE,
    enable_forms BOOLEAN DEFAULT FALSE,
    track_downloads BOOLEAN DEFAULT TRUE,
    send_rate_per_hour INTEGER DEFAULT 50,
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour campaigns
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_by ON campaigns(created_by);
CREATE INDEX IF NOT EXISTS idx_campaigns_scheduled_at ON campaigns(scheduled_at);

-- Trigger pour campaigns updated_at
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Table des résultats de campagne
CREATE TABLE IF NOT EXISTS campaign_results (
    id SERIAL PRIMARY KEY,
    campaign_id INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    email_sent BOOLEAN DEFAULT FALSE,
    email_opened BOOLEAN DEFAULT FALSE,
    link_clicked BOOLEAN DEFAULT FALSE,
    form_submitted BOOLEAN DEFAULT FALSE,
    attachment_downloaded BOOLEAN DEFAULT FALSE,
    training_completed BOOLEAN DEFAULT FALSE,
    quiz_score INTEGER NULL,
    training_duration INTEGER NULL, -- en secondes
    sent_at TIMESTAMP WITH TIME ZONE NULL,
    opened_at TIMESTAMP WITH TIME ZONE NULL,
    clicked_at TIMESTAMP WITH TIME ZONE NULL,
    submitted_at TIMESTAMP WITH TIME ZONE NULL,
    downloaded_at TIMESTAMP WITH TIME ZONE NULL,
    completed_at TIMESTAMP WITH TIME ZONE NULL,
    UNIQUE(campaign_id, employee_id)
);

-- Index pour campaign_results
CREATE INDEX IF NOT EXISTS idx_campaign_results_campaign_id ON campaign_results(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_results_employee_id ON campaign_results(employee_id);
CREATE INDEX IF NOT EXISTS idx_campaign_results_email_sent ON campaign_results(email_sent);
CREATE INDEX IF NOT EXISTS idx_campaign_results_link_clicked ON campaign_results(link_clicked);
CREATE INDEX IF NOT EXISTS idx_campaign_results_training_completed ON campaign_results(training_completed);

-- Table des tokens de tracking (NOUVELLE)
CREATE TABLE IF NOT EXISTS tracking_tokens (
    id SERIAL PRIMARY KEY,
    campaign_id INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    token VARCHAR(64) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE NULL,
    click_count INTEGER DEFAULT 0,
    UNIQUE(campaign_id, employee_id)
);

-- Index pour tracking_tokens
CREATE INDEX IF NOT EXISTS idx_tracking_tokens_token ON tracking_tokens(token);
CREATE INDEX IF NOT EXISTS idx_tracking_tokens_expires ON tracking_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_tracking_tokens_campaign ON tracking_tokens(campaign_id);

-- Table des modules de formation
CREATE TABLE IF NOT EXISTS training_modules (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    module_type VARCHAR(20) NOT NULL CHECK (module_type IN ('text', 'video', 'interactive', 'quiz')),
    difficulty_level VARCHAR(20) DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    estimated_duration INTEGER DEFAULT 10, -- en minutes
    is_active BOOLEAN DEFAULT TRUE,
    order_index INTEGER DEFAULT 0,
    prerequisites JSONB,
    learning_objectives JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour training_modules
CREATE INDEX IF NOT EXISTS idx_training_modules_active ON training_modules(is_active);
CREATE INDEX IF NOT EXISTS idx_training_modules_type ON training_modules(module_type);
CREATE INDEX IF NOT EXISTS idx_training_modules_order ON training_modules(order_index);

-- Trigger pour training_modules updated_at
CREATE TRIGGER update_training_modules_updated_at BEFORE UPDATE ON training_modules 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Table des journaux d'activité
CREATE TABLE IF NOT EXISTS activity_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    description TEXT,
    entity_type VARCHAR(50),
    entity_id INTEGER,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour activity_log
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_action ON activity_log(action);
CREATE INDEX IF NOT EXISTS idx_activity_log_entity ON activity_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at);

-- Table des détails de tracking
CREATE TABLE IF NOT EXISTS tracking_details (
    id SERIAL PRIMARY KEY,
    campaign_result_id INTEGER NOT NULL REFERENCES campaign_results(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    referer VARCHAR(500),
    geolocation VARCHAR(100),
    device_type VARCHAR(50),
    browser VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour tracking_details
CREATE INDEX IF NOT EXISTS idx_tracking_details_campaign_result_id ON tracking_details(campaign_result_id);
CREATE INDEX IF NOT EXISTS idx_tracking_details_action_type ON tracking_details(action_type);
CREATE INDEX IF NOT EXISTS idx_tracking_details_created_at ON tracking_details(created_at);

-- Table des soumissions de formulaires
CREATE TABLE IF NOT EXISTS form_submissions (
    id SERIAL PRIMARY KEY,
    campaign_result_id INTEGER NOT NULL REFERENCES campaign_results(id) ON DELETE CASCADE,
    submitted_data JSONB,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour form_submissions
CREATE INDEX IF NOT EXISTS idx_form_submissions_campaign_result_id ON form_submissions(campaign_result_id);

-- Table des téléchargements
CREATE TABLE IF NOT EXISTS download_tracking (
    id SERIAL PRIMARY KEY,
    campaign_result_id INTEGER NOT NULL REFERENCES campaign_results(id) ON DELETE CASCADE,
    filename VARCHAR(255),
    file_size INTEGER,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour download_tracking
CREATE INDEX IF NOT EXISTS idx_download_tracking_campaign_result_id ON download_tracking(campaign_result_id);

-- Table des complétions de formation
CREATE TABLE IF NOT EXISTS training_completions (
    id SERIAL PRIMARY KEY,
    campaign_result_id INTEGER NOT NULL REFERENCES campaign_results(id) ON DELETE CASCADE,
    module_name VARCHAR(100),
    time_spent INTEGER, -- en secondes
    score INTEGER,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour training_completions
CREATE INDEX IF NOT EXISTS idx_training_completions_campaign_result_id ON training_completions(campaign_result_id);

-- Table des paramètres système
CREATE TABLE IF NOT EXISTS system_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(20) DEFAULT 'string' CHECK (setting_type IN ('string', 'integer', 'boolean', 'json')),
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour system_settings
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(setting_key);

-- Trigger pour system_settings updated_at
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Table des notifications
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    type VARCHAR(20) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    is_read BOOLEAN DEFAULT FALSE,
    action_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- ====================================================
-- DONNÉES D'EXEMPLE ET CONFIGURATION INITIALE
-- ====================================================

-- Utilisateur admin par défaut (mot de passe: admin)
INSERT INTO users (username, email, password, role, full_name) VALUES 
('admin', 'admin@phishguard.local', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'Administrateur PhishGuard')
ON CONFLICT (username) DO NOTHING;

-- Templates d'emails de base
INSERT INTO email_templates (name, subject, content, template_type, difficulty_level, created_by) VALUES 
(
    'Phishing Bancaire - Notification Sécurité', 
    'Action requise : Vérification de votre compte bancaire',
    '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Vérification Compte</title></head><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;"><div style="background: #f8f9fa; padding: 20px; border-radius: 8px;"><h2 style="color: #dc3545;">🏦 Notification Sécurité Bancaire</h2><p>Cher client,</p><p>Nous avons détecté une activité suspecte sur votre compte. Par mesure de sécurité, veuillez <strong>vérifier immédiatement</strong> vos informations.</p><div style="text-align: center; margin: 30px 0;"><a href="{TRACKING_URL}" style="background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">VÉRIFIER MON COMPTE</a></div><p style="color: #666; font-size: 12px;">Si vous ne vérifiez pas dans les 24h, votre compte sera temporairement suspendu.</p><p style="color: #666; font-size: 12px;">Équipe Sécurité Bancaire</p></div></body></html>',
    'banking',
    'medium',
    1
),
(
    'Support IT - Mise à jour Urgente',
    'URGENT: Mise à jour de sécurité requise',
    '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Mise à jour Sécurité</title></head><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;"><div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px;"><h2 style="color: #856404;">⚠️ Mise à Jour Critique Requise</h2><p>Bonjour,</p><p>Une vulnérabilité de sécurité critique a été détectée sur votre poste de travail. Une mise à jour immédiate est nécessaire.</p><div style="text-align: center; margin: 30px 0;"><a href="{TRACKING_URL}" style="background: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">INSTALLER LA MISE À JOUR</a></div><p style="color: #856404; font-size: 12px;">Cette action est obligatoire dans les 2 heures.</p><p style="color: #856404; font-size: 12px;">Service IT</p></div></body></html>',
    'it',
    'hard',
    1
),
(
    'Réseau Social - Connexion Suspecte',
    'Nouvelle connexion détectée sur votre compte',
    '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Alerte Connexion</title></head><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;"><div style="background: #e3f2fd; padding: 20px; border-radius: 8px;"><h2 style="color: #1976d2;">🔐 Nouvelle Connexion Détectée</h2><p>Bonjour,</p><p>Une nouvelle connexion a été effectuée sur votre compte depuis un appareil non reconnu.</p><p><strong>Détails :</strong><br>📍 Localisation : Paris, France<br>🕒 Heure : Il y a 5 minutes<br>📱 Appareil : iPhone 15</p><div style="text-align: center; margin: 30px 0;"><a href="{TRACKING_URL}" style="background: #1976d2; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">SÉCURISER MON COMPTE</a></div><p style="color: #666; font-size: 12px;">Si ce n''était pas vous, agissez immédiatement.</p></div></body></html>',
    'social',
    'easy',
    1
)
ON CONFLICT (name) DO NOTHING;

-- Employés d'exemple
INSERT INTO employees (full_name, email, department, position, risk_level, status) VALUES 
('Jean Dupont', 'jean.dupont@exemple.com', 'IT', 'Développeur Senior', 'low', 'active'),
('Marie Martin', 'marie.martin@exemple.com', 'RH', 'Responsable Ressources Humaines', 'medium', 'active'),
('Pierre Leroy', 'pierre.leroy@exemple.com', 'Finance', 'Comptable', 'high', 'active'),
('Sophie Bernard', 'sophie.bernard@exemple.com', 'Marketing', 'Chef de Projet', 'medium', 'active'),
('Thomas Moreau', 'thomas.moreau@exemple.com', 'Commercial', 'Responsable Ventes', 'high', 'active')
ON CONFLICT (email) DO NOTHING;

-- Modules de formation par défaut
INSERT INTO training_modules (title, description, content, module_type, difficulty_level, estimated_duration, order_index) VALUES
(
    'Reconnaître les emails de phishing',
    'Apprenez à identifier les signes révélateurs d''un email de phishing',
    'Ce module vous apprend à reconnaître les techniques courantes utilisées par les cybercriminels...',
    'interactive',
    'beginner',
    10,
    1
),
(
    'Bonnes pratiques de sécurité',
    'Les réflexes essentiels à adopter au quotidien',
    'Découvrez les gestes simples mais efficaces pour protéger vos données...',
    'text',
    'beginner',
    15,
    2
),
(
    'Que faire en cas de suspicion ?',
    'Procédures à suivre si vous suspectez une tentative d''attaque',
    'Guide pratique des actions à entreprendre face à une menace...',
    'quiz',
    'intermediate',
    5,
    3
)
ON CONFLICT (title) DO NOTHING;

-- Paramètres système par défaut
INSERT INTO system_settings (setting_key, setting_value, setting_type, description) VALUES
('smtp_host', 'localhost', 'string', 'Serveur SMTP'),
('smtp_port', '587', 'integer', 'Port SMTP'),
('smtp_encryption', 'tls', 'string', 'Type de chiffrement SMTP'),
('app_name', 'PhishGuard BASIC', 'string', 'Nom de l''application'),
('app_version', '1.0.0', 'string', 'Version de l''application'),
('default_language', 'fr', 'string', 'Langue par défaut'),
('session_timeout', '1440', 'integer', 'Timeout de session en minutes'),
('max_upload_size', '10485760', 'integer', 'Taille maximale d''upload en octets'),
('backup_retention_days', '30', 'integer', 'Rétention des sauvegardes en jours'),
('log_retention_days', '90', 'integer', 'Rétention des logs en jours'),
('gdpr_enabled', 'true', 'boolean', 'Conformité RGPD activée'),
('data_retention_days', '365', 'integer', 'Rétention des données en jours'),
('email_rate_limit', '50', 'integer', 'Limite d''envoi d''emails par heure'),
('campaign_auto_complete_days', '30', 'integer', 'Complétion automatique des campagnes en jours')
ON CONFLICT (setting_key) DO NOTHING;

-- Création des vues utiles
CREATE OR REPLACE VIEW campaign_statistics AS
SELECT 
    c.id,
    c.name,
    c.status,
    c.created_at,
    COUNT(cr.id) as total_targets,
    COUNT(CASE WHEN cr.email_sent = TRUE THEN 1 END) as emails_sent,
    COUNT(CASE WHEN cr.email_opened = TRUE THEN 1 END) as emails_opened,
    COUNT(CASE WHEN cr.link_clicked = TRUE THEN 1 END) as links_clicked,
    COUNT(CASE WHEN cr.training_completed = TRUE THEN 1 END) as trainings_completed,
    ROUND(
        CASE 
            WHEN COUNT(CASE WHEN cr.email_sent = TRUE THEN 1 END) > 0 
            THEN (COUNT(CASE WHEN cr.link_clicked = TRUE THEN 1 END)::DECIMAL / COUNT(CASE WHEN cr.email_sent = TRUE THEN 1 END)) * 100
            ELSE 0 
        END, 2
    ) as click_rate,
    ROUND(
        CASE 
            WHEN COUNT(CASE WHEN cr.link_clicked = TRUE THEN 1 END) > 0 
            THEN (COUNT(CASE WHEN cr.training_completed = TRUE THEN 1 END)::DECIMAL / COUNT(CASE WHEN cr.link_clicked = TRUE THEN 1 END)) * 100
            ELSE 0 
        END, 2
    ) as training_completion_rate
FROM campaigns c
LEFT JOIN campaign_results cr ON c.id = cr.campaign_id
GROUP BY c.id, c.name, c.status, c.created_at;

-- Vue pour les employés vulnérables
CREATE OR REPLACE VIEW vulnerable_employees AS
SELECT 
    e.id,
    e.full_name,
    e.email,
    e.department,
    e.position,
    COUNT(CASE WHEN cr.link_clicked = TRUE THEN 1 END) as clicks_count,
    COUNT(CASE WHEN cr.training_completed = TRUE THEN 1 END) as trainings_count,
    COUNT(cr.id) as total_tests,
    ROUND(
        CASE 
            WHEN COUNT(cr.id) > 0 
            THEN (COUNT(CASE WHEN cr.link_clicked = TRUE THEN 1 END)::DECIMAL / COUNT(cr.id)) * 100
            ELSE 0 
        END, 2
    ) as vulnerability_rate
FROM employees e
LEFT JOIN campaign_results cr ON e.id = cr.employee_id
WHERE e.status = 'active'
GROUP BY e.id, e.full_name, e.email, e.department, e.position
HAVING COUNT(CASE WHEN cr.link_clicked = TRUE THEN 1 END) > 0
ORDER BY clicks_count DESC, trainings_count ASC;

-- Fonction de nettoyage automatique
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM tracking_tokens WHERE expires_at < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Commentaires sur les tables principales
COMMENT ON TABLE users IS 'Utilisateurs administrateurs du système';
COMMENT ON TABLE employees IS 'Employés cibles des campagnes de phishing';
COMMENT ON TABLE campaigns IS 'Campagnes de simulation de phishing';
COMMENT ON TABLE campaign_results IS 'Résultats individuels des campagnes';
COMMENT ON TABLE tracking_tokens IS 'Tokens uniques pour le tracking des emails';
COMMENT ON TABLE email_templates IS 'Templates d''emails de phishing';
COMMENT ON TABLE training_modules IS 'Modules de formation en cybersécurité';
COMMENT ON TABLE activity_log IS 'Journal d''audit de toutes les activités';
