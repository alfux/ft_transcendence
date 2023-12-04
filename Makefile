include .env
export

DATABASE_NAME = $(POSTGRES_SERVICE)
COLOR_BOLD_BLACK=\033[1;30m
COLOR_BOLD_RED=\033[1;31m
COLOR_BOLD_GREEN=\033[1;32m
COLOR_BOLD_YELLOW=\033[1;33m
COLOR_BOLD_BLUE=\033[1;34m
COLOR_BOLD_MAGENTA=\033[1;35m
COLOR_BOLD_CYAN=\033[1;36m
COLOR_BOLD_WHITE=\033[1;37m
build:
	@echo "Building Docker images..."
	docker compose -f docker-compose-prod.yml build
	@echo "Launching Docker containers..."
	docker compose -f docker-compose-prod.yml up -d

rebuild:
	@echo "Stopping Docker containers..."
	docker compose down
	@echo "Rebuilding Docker images..."
	docker compose -f docker-compose-prod.yml build
	@echo "Relaunching Docker containers..."
	docker compose -f docker-compose-prod.yml up -d

run:
	@echo "Launching Docker containers..."
	docker compose -f docker-compose-prod.yml up -d

stop:
	@echo "Stopping Docker containers..."
	docker compose -f docker-compose-prod.yml down

clean:
	@echo "Removing Docker containers and images..."
	docker compose down --volumes
	docker network prune -f
	docker system prune -af

backend-logs:
	@echo "Showing logs for the backend service..."
	docker compose logs -f $(BACKEND_SERVICE)

frontend-logs:
	@echo "Showing logs for the frontend service..."
	docker compose logs -f $(FRONTEND_SERVICE)

run-dev:
	@echo "Building Dev images..."
	docker compose -f docker-compose-dev.yml up -d
	@echo "$(COLOR_BOLD_YELLOW)"
	@echo "Database IP: $$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $(DATABASE_NAME))"
	@echo "Don't forget to change the host of <./backend/src/app.module.ts> in case the backend can't connect to the database."

run-ip:
	@echo "$(COLOR_BOLD_YELLOW)"
	@echo "Database IP: $$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $(DATABASE_NAME))"
stop-dev:
	@echo "Stopping Dev containers..."
	docker compose -f docker-compose-dev.yml down

.PHONY: build run stop clean