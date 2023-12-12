#!/bin/bash

# Replace these with your database name and user
DATABASE_NAME="db_devcraft_recipes_test"
DATABASE_USER="danielbauer"

# Drop the dev database
psql -U "$DATABASE_USER" -c "DROP DATABASE IF EXISTS $DATABASE_NAME;"

# Create the dev database
psql -U "$DATABASE_USER" -c "CREATE DATABASE $DATABASE_NAME;"

# Run Prisma migrations
npx prisma migrate dev --preview-feature
