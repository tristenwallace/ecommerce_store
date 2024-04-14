# Storefront Backend Project

This project implements the backend for a storefront application using Node.js, Express, and PostgreSQL. It provides APIs for managing products, users, and orders.

## Prerequisites

- Node.js (v.20.12.1)
- npm or yarn (v.10.5.0)
- PostgreSQL
- Docker (optional)

## Getting Started

1. **Clone the repository:**

```
git clone https://github.com/yourusername/storefront-backend.git
cd ecommerce-store_backend
```

2. Install dependencies: `npm install`

3. Update .env variables in ./environment by replacing the values if necessary and removing ".template" from the end of each file.

4. Add .env file to root: 

```
NODE_ENV=development
JWT_SECRET=your_jwt_secret
```

## Set up the Database

Before running the application, you need to set up the databases for both development and testing environments. This project uses PostgreSQL as the database system.

### Using Docker

If you prefer to use Docker to run PostgreSQL (docker setup is already provided):

1. Ensure Docker is installed and running on your system. You can download it from [the official Docker website](https://www.docker.com/products/docker-desktop).

2. Navigate to the root directory of the project where the `docker-compose.yml` file is located.

3. Permissions: This setup includes an initialization script for PostgreSQL. Run the following from the root folder to ensure the script is executable:

```
chmod +x ./postgres-init/init-user-db.sh
```

4. Run the following command to start the PostgreSQL containers in detached mode:

```
docker-compose up --build -d
```

This grants the necessary permissions to execute the database initialization script when the PostgreSQL container starts.

### Migrations

After setting up your database environment and ensuring all configurations are in place, proceed to run database migrations to set up the required tables and schemas:

1. Build distrubtion folder with `npm run build` (the migrations rely on a dbConfig.js file)

2. Setup dev db with `npm run migrate:up`

3. Setup test db with `NODE_ENV=test npm run migrate:up`

These commands execute the migrations defined in the project, setting up your database schema according to the defined migrations.

## Testing:

Ensure the following steps above have been completed prior to testing:

1. Setup the test db according to the steps above
2. Add .env to root with `NODE_ENV=test` and `JWT_SECRET=token`
`npm run test`

Run tests with `npm run test`

## Start the application

**For development:**
`npm run start`

**To watch for changes:**
`npm run watch`

## API Overview
View available routes and data shape [here](API_REQUIREMENTS)