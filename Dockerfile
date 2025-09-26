FROM php:8.2-fpm-alpine

# Installation des dépendances
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
    netcat-openbsd

# Extensions PHP
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        pdo pdo_pgsql pgsql gd bcmath pcntl intl mbstring

# Redis extension
RUN pecl install redis && docker-php-ext-enable redis

# Composer
COPY --from=composer:2.6 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copie de l'application
COPY app-full/ /var/www/html/

# Permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html

# Installation Composer si nécessaire
RUN if [ -f composer.json ]; then \
        composer install --no-dev --optimize-autoloader; \
    fi

EXPOSE 9000

CMD ["php-fpm"]
