FROM php:8.2-fpm-alpine

# Installation des extensions PHP nécessaires
RUN apk add --no-cache \
    postgresql-dev \
    redis \
    curl \
    git \
    zip \
    unzip \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    icu-dev \
    oniguruma-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        pdo \
        pdo_pgsql \
        pgsql \
        gd \
        bcmath \
        pcntl \
        intl \
        mbstring

# Installation de Redis extension
RUN pecl install redis && docker-php-ext-enable redis

# Installation de Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Création du répertoire de travail
WORKDIR /var/www/html

# Copie des fichiers de configuration PHP
COPY docker/php/php.ini /usr/local/etc/php/php.ini
COPY docker/php/php-fpm.conf /usr/local/etc/php-fpm.d/www.conf

# Création des répertoires nécessaires
RUN mkdir -p storage/{logs,cache,uploads,backups} \
    && chmod -R 775 storage \
    && chown -R www-data:www-data storage

# Copie du code source
COPY . .

# Installation des dépendances Composer (si composer.json existe)
RUN if [ -f composer.json ]; then \
        composer install --no-dev --optimize-autoloader --no-interaction; \
    fi

# Configuration des permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html \
    && chmod +x docker/init.sh

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:9000/ping || exit 1

# Port exposé
EXPOSE 9000

# Commande de démarrage
CMD ["docker/init.sh"]
