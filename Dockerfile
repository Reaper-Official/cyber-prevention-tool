FROM php:8.2-fpm-alpine

LABEL maintainer="Reaper Official <reaper@etik.com>"
LABEL description="PhishGuard BASIC - Phishing Simulation Platform"

# Installation des dépendances système
RUN apk add --no-cache --update \
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
    autoconf \
    gcc \
    g++ \
    make \
    netcat-openbsd \
    bash

# Configuration et installation des extensions PHP
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        pdo \
        pdo_pgsql \
        pgsql \
        gd \
        bcmath \
        pcntl \
        intl \
        mbstring

# Installation de l'extension Redis
RUN pecl channel-update pecl.php.net \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && pecl clear-cache

# Installation de Composer
COPY --from=composer:2.6 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copie des configurations PHP
COPY docker/php/php.ini /usr/local/etc/php/conf.d/99-phishguard.ini
COPY docker/php/php-fpm.conf /usr/local/etc/php-fpm.d/zzz-phishguard.conf

# Copie de l'application
COPY app-full/ /var/www/html/

# Installation des dépendances Composer
RUN if [ -f management/composer.json ]; then \
        cd management && composer install --no-dev --optimize-autoloader --no-interaction; \
    fi

# Permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html

# Script d'initialisation
COPY docker/init.sh /usr/local/bin/init.sh
RUN chmod +x /usr/local/bin/init.sh

EXPOSE 9000

ENTRYPOINT ["/usr/local/bin/init.sh"]
CMD ["php-fpm"]
