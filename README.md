# CRM Application

A modular, self-hosted Customer Relationship Management (CRM) system designed to manage prospects, automate email workflows, and synchronize data with external sources.

## Overview

This project is structured as a monorepo containing both the frontend client and the backend API. It relies entirely on Docker for both development and production environments, eliminating the need for local Node.js or database installations.

## Architecture & Tech Stack

### Frontend (`/frontend`)

- **Framework:** Next.js (React)
- **Language:** TypeScript
- **Styling:** Tailwind CSS

### Backend (`/backend`)

- **Framework:** Express (Node.js)
- **Language:** TypeScript
- **Database:** MariaDB 10.11

### Infrastructure

- **Containerization:** Docker & Docker Compose
- **Task Automation:** Makefile
- **Network (Production):** Cloudflare Tunnel (Zero Trust) for secure public access.

## Prerequisites

- Docker and Docker Compose plugin installed.
- `make` utility installed on your host machine.
- A Cloudflare account (for production deployment).

## Environment Configuration

You need to set up environment variables for the containers to run correctly.

Create a `.env` file for development and a `.env.prod` file for production at the root of the repository. Include the following necessary keys in both files, adjusting values appropriately for the target environment:

```env
# Database
MYSQL_ROOT_PASSWORD=
MYSQL_DATABASE=
MYSQL_USER=
MYSQL_PASSWORD=

# Ports (Used in dev environment)
DB_PORT=3306
BACKEND_PORT=5000
FRONTEND_PORT=3000

# Backend Services
JWT_SECRET=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=

# External API Synchronization
LEXPRESS_API_URL=
LEXPRESS_USER=
LEXPRESS_API_KEY=
```

## Development Workflow

The development environment uses Docker volume mounts to enable hot-reloading. You do not need to install local dependencies.

Use the provided `Makefile` to manage the development lifecycle:

- **`make dev-build`**: Builds the development Docker images.
- **`make dev-up`**: Starts the database, backend, and frontend containers in the background. The backend waits for the database healthcheck to pass before starting.
- **`make dev-logs`**: Displays real-time logs for all development containers.
- **`make dev-down`**: Stops and removes the development containers.

Once running, the frontend is accessible at `http://localhost:<FRONTEND_PORT>` and the API at `http://localhost:<BACKEND_PORT>`.

## Production Deployment & Cloudflare Zero Trust

The production setup uses optimized builds and relies on a secure Cloudflare Zero Trust architecture. The production frontend container exposes port `80` to the host machine.

### 1. Launch Production Containers

Use the `Makefile` to build and start the production stack:

- **`make prod-build`**: Builds the production Docker images.
- **`make prod-up`**: Starts the production containers.
- **`make prod-logs`**: Displays real-time logs.
- **`make prod-down`**: Stops the production containers.

### 2. Configure Cloudflare Zero Trust

To safely expose the CRM to the internet without opening router ports or exposing your host IP:

1. Install the `cloudflared` daemon on your host server.
2. Authenticate `cloudflared` with your Cloudflare account.
3. Create a new Zero Trust Tunnel via the Cloudflare Dashboard or CLI.
4. Configure the tunnel's Public Hostname to route traffic to your local production frontend:

- **Public Hostname:** `crm.yourdomain.com`
- **Service:** `http://localhost:80`

5. If your frontend requires direct external API calls from the client browser, route an API subdomain to the backend container (requires exposing the backend port in `docker-compose.prod.yml` or routing the tunnel into the Docker network).
6. Apply Zero Trust policies (e.g., Email OTP, Access Groups) in the Cloudflare Dashboard to restrict access to the CRM interface.

## Customization and Adoption

This CRM is designed as a foundational template.

1. **Data Models:** Modify the SQL schema and TypeScript interfaces (`backend/models/types.ts` and `frontend/types/index.ts`) to track specific lead attributes.
2. **Email Templates:** Update the regex parser (`utils/templateParser.ts`) to inject your specific business logic and variables into email campaigns.
3. **External Integrations:** Adapt the synchronization service (`backend/services/lexpressService.ts`) to fetch data from your specific lead generation sources.
