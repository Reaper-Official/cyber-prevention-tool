<?php
// config/init_db.sql - Script de création de base de données complet
/*
CREATE DATABASE IF NOT EXISTS phishguard_basic CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE phishguard_basic;

-- Table des utilisateurs administrateurs
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'reviewer', 'hr', 'employee') DEFAULT 'employee',
    full_name VARCHAR(100),
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- Table des employés
CREATE TABLE IF NOT EXISTS employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    department VARCHAR(50) NOT NULL,
    position VARCHAR(100) NOT NULL,
    manager_id INT NULL,
    hire_date DATE NULL,
    phone VARCHAR(20),
    location VARCHAR(100),
    risk_level ENUM('low', 'medium', 'high') DEFAULT 'medium',
    status ENUM('active', 'inactive', 'pending') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (manager_id) REFERENCES employees(id) ON DELETE SET NULL,
    INDEX idx_email (email),
    INDEX idx_department (department),
    INDEX idx_status (status)
);

-- Table des templates d'emails
CREATE TABLE IF NOT EXISTS email_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    template_type VARCHAR(50) NOT NULL,
    language VARCHAR(5) DEFAULT 'fr',
    difficulty_level ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
    tags JSON,
    is_active BOOLEAN DEFAULT TRUE,
    usage_count INT DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0.00,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_template_type (template_type),
    INDEX idx_active (is_active)
);

-- Table des campagnes
CREATE TABLE IF NOT EXISTS campaigns (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    template VARCHAR(50) NOT NULL,
    target_type ENUM('all', 'department', 'position', 'custom', 'random') NOT NULL,
    target_value TEXT,
    target_count INT DEFAULT 0,
    schedule_type ENUM('immediate', 'scheduled', 'recurring') DEFAULT 'immediate',
    scheduled_at TIMESTAMP NULL,
    recurrence_pattern VARCHAR(100) NULL,
    status ENUM('draft', 'scheduled', 'active', 'paused', 'completed', 'cancelled') DEFAULT 'draft',
    landing_page_url VARCHAR(500),
    redirect_url VARCHAR(500),
    enable_attachments BOOLEAN DEFAULT FALSE,
    enable_forms BOOLEAN DEFAULT FALSE,
    track_downloads BOOLEAN DEFAULT TRUE,
    send_rate_per_hour INT DEFAULT 50,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_status (status),
    INDEX idx_created_by (created_by),
    INDEX idx_scheduled_at (scheduled_at)
);

-- Table des résultats de campagne
CREATE TABLE IF NOT EXISTS campaign_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    campaign_id INT NOT NULL,
    employee_id INT NOT NULL,
    email_sent BOOLEAN DEFAULT FALSE,
    email_opened BOOLEAN DEFAULT FALSE,
    link_clicked BOOLEAN DEFAULT FALSE,
    form_submitted BOOLEAN DEFAULT FALSE,
    attachment_downloaded BOOLEAN DEFAULT FALSE,
    training_completed BOOLEAN DEFAULT FALSE,
    quiz_score INT NULL,
    training_duration INT NULL, -- en secondes
    sent_at TIMESTAMP NULL,
    opened_at TIMESTAMP NULL,
    clicked_at TIMESTAMP NULL,
    submitted_at TIMESTAMP NULL,
    downloaded_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    UNIQUE KEY unique_campaign_employee (campaign_id, employee_id),
    INDEX idx_campaign_id (campaign_id),
    INDEX idx_employee_id (employee_id),
    INDEX idx_email_sent (email_sent),
    INDEX idx_link_clicked (link_clicked),
    INDEX idx_training_completed (training_completed)
);

-- Table des modules de formation
CREATE TABLE IF NOT EXISTS training_modules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    module_type ENUM('text', 'video', 'interactive', 'quiz') NOT NULL,
    difficulty_level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
    estimated_duration INT DEFAULT 10, -- en minutes
    is_active BOOLEAN DEFAULT TRUE,
    order_index INT DEFAULT 0,
    prerequisites JSON,
    learning_objectives JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_active (is_active),
    INDEX idx_type (module_type),
    INDEX idx_order (order_index)
);

-- Table des journaux d'activité
CREATE TABLE IF NOT EXISTS activity_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    action VARCHAR(100) NOT NULL,
    description TEXT,
    entity_type VARCHAR(50),
    entity_id INT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_created_at (created_at)
);

-- Table des détails de tracking
CREATE TABLE IF NOT EXISTS tracking_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    campaign_result_id INT NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    referer VARCHAR(500),
    geolocation VARCHAR(100),
    device_type VARCHAR(50),
    browser VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (campaign_result_id) REFERENCES campaign_results(id) ON DELETE CASCADE,
    INDEX idx_campaign_result_id (campaign_result_id),
    INDEX idx_action_type (action_type),
    INDEX idx_created_at (created_at)
);

-- Table des soumissions de formulaires
CREATE TABLE IF NOT EXISTS form_submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    campaign_result_id INT NOT NULL,
    submitted_data JSON,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (campaign_result_id) REFERENCES campaign_results(id) ON DELETE CASCADE,
    INDEX idx_campaign_result_id (campaign_result_id)
);

-- Table des téléchargements
CREATE TABLE IF NOT EXISTS download_tracking (
    id INT AUTO_INCREMENT PRIMARY KEY,
    campaign_result_id INT NOT NULL,
    filename VARCHAR(255),
    file_size INT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (campaign_result_id) REFERENCES campaign_results(id) ON DELETE CASCADE,
    INDEX idx_campaign_result_id (campaign_result_id)
);

-- Table des complétions de formation
CREATE TABLE IF NOT EXISTS training_completions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    campaign_result_id INT NOT NULL,
    module_name VARCHAR(100),
    time_spent INT, -- en secondes
    score INT,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (campaign_result_id) REFERENCES campaign_results(id) ON DELETE CASCADE,
    INDEX idx_campaign_result_id (campaign_result_id)
);

-- Table des paramètres système
CREATE TABLE IF NOT EXISTS system_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type ENUM('string', 'integer', 'boolean', 'json') DEFAULT 'string',
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    updated_by INT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_key (setting_key)
);

-- Table des notifications
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    action_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
);

-- DONNÉES D'EXEMPLE ET CONFIGURATION INITIALE

-- Utilisateur admin par défaut
INSERT INTO users (username, email, password, role, full_name) VALUES 
('admin', 'admin@phishguard.local', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'Administrateur PhishGuard');

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
    '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Mise à jour Sécurité</title></head><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;"><div style="background: #fff3cd; border: 1px solid #ffeaa7; padding:<?php
// config/database.php - Configuration de base de données
class Database {
