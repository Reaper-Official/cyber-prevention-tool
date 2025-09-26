#!/bin/sh
# docker/init.sh - Script d'initialisation du conteneur PHP

set -e

echo "🚀 Initialisation du conteneur PhishGuard..."

# Attendre que la base de données soit prête
echo "⏳ Attente de la base de données..."
while ! nc -z db 5432; do
    sleep 1
done
echo "✅ Base de données prête"

# Vérification des permissions
echo "🔧 Configuration des permissions..."
chown -R www-data:www-data /var/www/html/storage
chmod -R 775 /var/www/html/storage

# Création des répertoires manquants
mkdir -p /var/www/html/storage/{logs,cache,uploads,backups,reports}
chown -R www-data:www-data /var/www/html/storage

# Test de la configuration PHP
echo "🧪 Test de la configuration PHP..."
php -v
php -m | grep -E "(pdo|pgsql|redis)" || echo "⚠️ Extensions manquantes détectées"

# Vérification de la connectivité base de données
echo "🗄️ Test de connexion à la base de données..."
php -r "
try {
    \$pdo = new PDO('pgsql:host=db;port=5432;dbname='.\$_ENV['DB_NAME'], \$_ENV['DB_USER'], \$_ENV['DB_PASSWORD']);
    echo '✅ Connexion base de données: OK' . PHP_EOL;
} catch(Exception \$e) {
    echo '❌ Erreur connexion DB: ' . \$e->getMessage() . PHP_EOL;
    exit(1);
}
"

# Initialisation automatique si nécessaire
if [ ! -f "/var/www/html/.initialized" ]; then
    echo "🔧 Première initialisation détectée..."
    if [ -f "/var/www/html/setup.php" ]; then
        php /var/www/html/setup.php
        touch /var/www/html/.initialized
        echo "✅ Initialisation terminée"
    fi
fi

# Nettoyage des fichiers temporaires
echo "🧹 Nettoyage des fichiers temporaires..."
find /var/www/html/storage/cache -type f -mtime +7 -delete 2>/dev/null || true
find /var/www/html/storage/logs -name "*.log" -mtime +30 -delete 2>/dev/null || true

# Démarrage de PHP-FPM
echo "🎯 Démarrage de PHP-FPM..."
exec php-fpm
