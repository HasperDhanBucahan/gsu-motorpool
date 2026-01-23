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
    libzip-dev

# Clear cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /app

# Copy existing application directory
COPY . .

# Install PHP dependencies only
RUN composer install --optimize-autoloader --no-dev

# Copy custom fonts from storage to vendor
RUN cp storage/app/fonts/BOOKOS*.php vendor/setasign/fpdf/font/
RUN cp storage/app/fonts/BOOKOS*.z vendor/setasign/fpdf/font/

# Create necessary directories
RUN mkdir -p storage/framework/{sessions,views,cache,testing} \
    storage/logs \
    storage/app/templates \
    bootstrap/cache
RUN chmod -R 775 storage bootstrap/cache

# Expose port
EXPOSE 8080

# Start server with migrations
CMD php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=${PORT:-8080}