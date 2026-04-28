#!/bin/bash
set -e

LISTEN_PORT=${PORT:-8080}
echo "Starting Laravel on port $LISTEN_PORT"

php artisan config:clear

# Run migrations first — cache table must exist before cache:clear
php artisan migrate --force
php artisan db:seed --class=DatabaseSeeder --force

php artisan cache:clear
php artisan optimize
php artisan storage:link --force

exec php -S 0.0.0.0:$LISTEN_PORT -t public
