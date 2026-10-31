# ─────────────────────────────────────────
#  ClinicaFácil — Makefile de comandos úteis
# ─────────────────────────────────────────

.PHONY: help install dev test build docker seed

help:
	@echo ""
	@echo "  ClinicaFácil — Comandos disponíveis"
	@echo "  ────────────────────────────────────"
	@echo "  make install   Instala dependências do backend e frontend"
	@echo "  make dev       Inicia backend e frontend em modo desenvolvimento"
	@echo "  make test      Executa testes do backend"
	@echo "  make coverage  Executa testes com relatório de cobertura"
	@echo "  make seed      Popula o banco com dados de demonstração"
	@echo "  make build     Faz build de produção do frontend"
	@echo "  make docker    Sobe todos os containers com docker-compose"
	@echo "  make docker-down  Para os containers"
	@echo ""

install:
	@echo "📦 Instalando dependências..."
	cd backend && npm install
	cd frontend && npm install
	@echo "✅ Dependências instaladas!"

dev:
	@echo "🚀 Iniciando servidores de desenvolvimento..."
	@echo "   Backend:  http://localhost:3000"
	@echo "   Frontend: http://localhost:5173"
	@(cd backend && npm run dev) & (cd frontend && npm run dev)

test:
	@echo "🧪 Executando testes..."
	cd backend && npm test

coverage:
	@echo "🧪 Executando testes com cobertura..."
	cd backend && npm run test:coverage

seed:
	@echo "🌱 Populando banco de dados..."
	cd backend && node ../seed.js

build:
	@echo "🏗️  Fazendo build do frontend..."
	cd frontend && npm run build
	@echo "✅ Build gerado em frontend/dist/"

docker:
	@echo "🐳 Subindo containers..."
	docker-compose up --build -d
	@echo "✅ Sistema disponível em http://localhost"

docker-down:
	docker-compose down

docker-logs:
	docker-compose logs -f
