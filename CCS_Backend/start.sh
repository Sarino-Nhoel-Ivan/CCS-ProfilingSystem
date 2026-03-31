#!/bin/bash
set -e

echo "Starting Laravel on port $PORT"

php artisan config:clear
php artisan cache:clear
php artisan optimize
php artisan storage:link --force

exec php -S 0.0.0.0:$PORT -t public
