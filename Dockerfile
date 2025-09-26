FROM php:8.2-fpm-alpine

# Installer les dépendances système nécessaires
RUN apk add --no-cache \
    postgresql-dev \
    freetype-dev \
    libjpeg-turbo-dev \
    libpng-dev \
    libzip-dev \
    icu-dev \
    autoconf \
    g++ \
    make \
    git \
    bash

# Configurer et installer les extensions PHP
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        pdo pdo_pgsql pgsql gd bcmath pcntl intl mbstring zip \
    && pecl install redis \
    && docker-php-ext-enable redis

# Installer Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Définir le répertoire de travail
WORKDIR /var/www

# Copier les fichiers de l'application
COPY . .

# Installer les dépendances PHP
RUN composer install --no-dev --optimize-autoloader

# Définir les permissions appropriées
RUN chown -R www-data:www-data /var/www \
    && chmod -R 755 /var/www/storage

# Exposer le port
EXPOSE 9000

CMD ["php-fpm"]
