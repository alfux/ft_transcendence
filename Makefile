-include .env
export
.DEFAULT_GOAL := build

COMPOSE=docker compose
DOCKER_COMPOSE_YML=docker-compose.yml

DATABASE_NAME = $(POSTGRES_SERVICE)
COLOR_BOLD_BLACK=\033[1;30m
COLOR_BOLD_RED=\033[1;31m
COLOR_BOLD_GREEN=\033[1;32m
COLOR_BOLD_YELLOW=\033[1;33m
COLOR_BOLD_BLUE=\033[1;34m
COLOR_BOLD_MAGENTA=\033[1;35m
COLOR_BOLD_CYAN=\033[1;36m
COLOR_BOLD_WHITE=\033[1;37m

.PHONY: dockerfile dockerfile_clean

build:
	@echo "$(COLOR_BOLD_BLUE)"
	@echo "Checking for .env file..."
	@echo "$(COLOR_BOLD_YELLOW)"
	@if [ ! -f .env ]; then \
		echo "Please user <make env-dev> to generate first a env file."; \
		exit 1; \
	fi
	@echo "Building..."
	$(COMPOSE) -f $(DOCKER_COMPOSE_YML) up -d --build
	
clean-env:
	rm .env

stop:
	@echo "Stopping Docker containers..."
	$(COMPOSE) -f $(DOCKER_COMPOSE_YML) down
	@echo ".env deleted" 

clean: dockerfile_clean
	@echo "Removing Docker containers and images..."
	$(COMPOSE) down --volumes

fclean:clean
	docker network prune -f
	docker system prune -af
	rm .env
