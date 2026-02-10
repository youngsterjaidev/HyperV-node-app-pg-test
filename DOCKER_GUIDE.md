# Docker Setup Guide

This guide explains how to build and run the Express + PostgreSQL application using Docker.

## Files Created

1. **Dockerfile** - Containerizes the Node.js application
2. **docker-compose.yml** - Orchestrates both app and PostgreSQL containers
3. **.dockerignore** - Excludes unnecessary files from the image

## Prerequisites

- Docker Desktop installed and running
- Docker Compose (included with Docker Desktop)

## Quick Start with Docker Compose

The easiest way to run the entire stack (Node.js + PostgreSQL):

```bash
# 1. Start both services
docker-compose up -d

# 2. View logs
docker-compose logs -f

# 3. Stop services
docker-compose down

# 4. Stop and remove volumes
docker-compose down -v
```

## Building the Docker Image Manually

```bash
# Build the image
docker build -t express-pg-app:latest .

# Run the container (without Docker Compose)
docker run -p 3000:3000 \
  -e DB_HOST=host.docker.internal \
  -e DB_USER=postgres \
  -e DB_PASSWORD=password \
  -e DB_NAME=test_db \
  express-pg-app:latest
```

## Docker Commands

### View running containers
```bash
docker-compose ps
```

### View container logs
```bash
docker-compose logs app
docker-compose logs postgres
docker-compose logs -f app  # Follow logs
```

### Execute commands in container
```bash
# Access PostgreSQL CLI
docker-compose exec postgres psql -U postgres -d test_db

# Query users table
docker-compose exec postgres psql -U postgres -d test_db -c "SELECT * FROM users;"
```

### Rebuild after code changes
```bash
docker-compose up -d --build
```

### Remove all containers and volumes
```bash
docker-compose down -v
```

## Testing the Application

Once running, test the endpoints:

```bash
# Health check
curl http://localhost:3000/health

# Create a user
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","age":30}'

# Get all users
curl http://localhost:3000/users

# Get specific user
curl http://localhost:3000/users/1

# Update user
curl -X PUT http://localhost:3000/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","age":28}'

# Delete user
curl -X DELETE http://localhost:3000/users/1
```

## Environment Variables

The Docker Compose file automatically sets environment variables for the containers:

**App Container:**
- `DB_USER`: postgres
- `DB_PASSWORD`: password
- `DB_HOST`: postgres (Docker service name)
- `DB_PORT`: 5432
- `DB_NAME`: test_db
- `PORT`: 3000
- `NODE_ENV`: production

**PostgreSQL Container:**
- `POSTGRES_USER`: postgres
- `POSTGRES_PASSWORD`: password
- `POSTGRES_DB`: test_db

## Accessing PostgreSQL

### From host machine
```bash
psql -h localhost -U postgres -d test_db
```

### From inside Docker
```bash
docker-compose exec postgres psql -U postgres -d test_db
```

## Viewing Container Details

```bash
# Inspect app container
docker inspect express_app

# Check network
docker network ls
docker network inspect hyperv-node-app-pg-test_app-network
```

## Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose logs app

# Rebuild
docker-compose down
docker-compose up -d --build
```

### Database connection issues
```bash
# Verify PostgreSQL is running and healthy
docker-compose ps

# Check PostgreSQL logs
docker-compose logs postgres
```

### Permission issues
```bash
# On Linux, may need sudo
sudo docker-compose up
```

## Pushing to Docker Registry

### Push to Docker Hub
```bash
# Login to Docker Hub
docker login

# Tag image
docker tag express-pg-app:latest yourusername/express-pg-app:latest

# Push image
docker push yourusername/express-pg-app:latest
```

### Pull and run from registry
```bash
docker pull yourusername/express-pg-app:latest
docker run -p 3000:3000 yourusername/express-pg-app:latest
```

## Performance Tips

1. Use `.dockerignore` to exclude unnecessary files
2. Use multi-stage builds for smaller images (advanced)
3. Keep Node.js packages lean - remove devDependencies in production
4. Use specific version tags instead of `latest`

## Next Steps

- Customize environment variables in `docker-compose.yml`
- Add persistent volumes for database backups
- Configure additional services (nginx reverse proxy, redis cache, etc.)
- Set up CI/CD to automatically build and push images
