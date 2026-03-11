FROM php:8.2-apache

RUN apt-get update \
    && apt-get install -y --no-install-recommends default-mysql-client \
    && docker-php-ext-install pdo_mysql mysqli \
    && a2enmod rewrite headers \
    && rm -rf /var/lib/apt/lists/*

RUN sed -ri -e "s!/var/www/html!/workspace/htdocs!g" \
    /etc/apache2/sites-available/*.conf \
    /etc/apache2/apache2.conf \
    /etc/apache2/conf-available/*.conf

COPY docker/php/workspace-htdocs.conf /etc/apache2/conf-available/workspace-htdocs.conf
RUN a2enconf workspace-htdocs

WORKDIR /workspace
