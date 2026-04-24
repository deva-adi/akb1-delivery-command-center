# AKB1 Delivery Command Center v1
# Makefile for common developer commands
# Placeholder authored 2026-04-24. Targets expand as milestones land.

.PHONY: help setup install seed test test-backend test-frontend test-e2e \
        lint format build up down logs clean reset benchmark scan

help:
	@echo "AKB1 Delivery Command Center v1"
	@echo ""
	@echo "Usage: make <target>"
	@echo ""
	@echo "Setup and install:"
	@echo "  make setup          Install pre-commit hooks (and git init if needed)"
	@echo "  make install        Install backend and frontend dependencies"
	@echo "  make seed           Generate deterministic seed data (10 programmes, 300 people)"
	@echo ""
	@echo "Test:"
	@echo "  make test           Run all tests"
	@echo "  make test-backend   Run pytest"
	@echo "  make test-frontend  Run Vitest"
	@echo "  make test-e2e       Run Playwright"
	@echo ""
	@echo "Lint and format:"
	@echo "  make lint           Run all linters"
	@echo "  make format         Format code"
	@echo ""
	@echo "Docker:"
	@echo "  make build          Build all Docker images"
	@echo "  make up             Start local stack"
	@echo "  make down           Stop local stack"
	@echo "  make logs           Tail logs"
	@echo "  make clean          Remove containers and volumes"
	@echo "  make reset          Full reset: stop, clean, rebuild, seed"
	@echo ""
	@echo "Quality:"
	@echo "  make benchmark      Run Locust performance benchmark"
	@echo "  make scan           Run trivy and bandit security scans"

# Populated at M0 (this session)
setup:
	@echo "Installing pre-commit hooks"
	pre-commit install || echo "Install pre-commit first: pip install pre-commit"

# Populated at M6 onward
install:
	@echo "Not yet implemented. Populated at M6 when backend and frontend exist."

seed:
	@echo "Not yet implemented. Populated at M6 when seed generator lands."

test:
	@echo "Not yet implemented. Populated at M6."

test-backend:
	@echo "Not yet implemented. Populated at M6."

test-frontend:
	@echo "Not yet implemented. Populated at M7."

test-e2e:
	@echo "Not yet implemented. Populated at M8."

lint:
	@echo "Not yet implemented. Populated at M6."

format:
	@echo "Not yet implemented. Populated at M6."

build:
	docker compose build

up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f

clean:
	docker compose down -v

reset: clean build up seed
	@echo "Full reset complete"

benchmark:
	@echo "Not yet implemented. Populated at M8."

scan:
	@echo "Not yet implemented. Populated at M8."
