FROM php:8.2-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libzip-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip

# Get Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /app

# Copy composer files
COPY composer.json composer.lock ./

# Install dependencies
RUN composer install --optimize-autoloader --no-dev --no-scripts

# Copy application
COPY . .

# Copy custom fonts
RUN cp storage/app/fonts/BOOKOS*.php vendor/setasign/fpdf/font/ 2>/dev/null || true
RUN cp storage/app/fonts/BOOKOS*.z vendor/setasign/fpdf/font/ 2>/dev/null || true

# Optimize autoloader
RUN composer dump-autoload --optimize

# Create directories and set permissions
RUN mkdir -p storage/framework/{sessions,views,cache,testing} \
    storage/logs \
    storage/app/templates \
    bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache

# Clear caches
RUN php artisan config:clear || true
RUN php artisan route:clear || true
RUN php artisan view:clear || true

# Expose port (Railway assigns this dynamically)
EXPOSE 8080

# Start command
CMD php artisan config:cache && \
    php artisan route:cache && \
    php artisan view:cache && \
    php artisan migrate --force && \
    php artisan queue:work --daemon --tries=3 & \
    php artisan serve --host=0.0.0.0 --port=${PORT:-8080}