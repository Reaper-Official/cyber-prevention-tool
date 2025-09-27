# Utiliser l'image PHP-FPM officielle
FROM php:8.2-fpm-alpine

# Définir le répertoire de travail
WORKDIR /var/www/html

# Installer les dépendances système et les bibliothèques de développement
RUN apk add --no-cache \
    # Dépendances pour les extensions PHP
    postgresql-dev \
    freetype-dev \
    libjpeg-turbo-dev \
    libpng-dev \
    libzip-dev \
    icu-dev \
    oniguruma-dev \
    # Outils de build
    autoconf \
    g++ \
    make \
    # Utilitaires
    git \
    curl \
    zip \
    unzip \
    && rm -rf /var/cache/apk/*

# Configurer et installer les extensions PHP
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        pdo \
        pdo_pgsql \
        pgsql \
        gd \
        bcmath \
        pcntl \
        intl \
        mbstring \
        zip

# Installer Redis via PECL
RUN pecl install redis \
    && docker-php-ext-enable redis

# Installer Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copier les fichiers de configuration PHP personnalisés (optionnel)
# COPY ./php.ini /usr/local/etc/php/conf.d/custom.ini

# Copier le code de l'application
COPY . /var/www/html

# Définir les permissions appropriées
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html

# Installer les dépendances Composer
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Exposer le port 9000 pour PHP-FPM
EXPOSE 9000

# Commande de démarrage
CMD ["php-fpm"]
