# CarXpert Makefile
# أوامر سهلة لإدارة Docker

.PHONY: help build up down restart logs shell db-shell mongo-shell backup restore clean dev tools

# Default target
help:
	@echo "📦 CarXpert Docker Commands"
	@echo ""
	@echo "الأوامر المتاحة:"
	@echo "  make build     - بناء الصور"
	@echo "  make up        - تشغيل كل الخدمات"
	@echo "  make down      - إيقاف كل الخدمات"
	@echo "  make restart   - إعادة تشغيل"
	@echo "  make logs      - عرض السجلات"
	@echo "  make shell     - دخول shell التطبيق"
	@echo "  make db-shell  - دخول PostgreSQL"
	@echo "  make mongo-shell - دخول MongoDB"
	@echo "  make backup    - نسخة احتياطية"
	@echo "  make restore   - استعادة نسخة"
	@echo "  make clean     - تنظيف كامل"
	@echo "  make dev       - تشغيل للتطوير"
	@echo "  make tools     - تشغيل أدوات الإدارة"
	@echo ""

# Build images
build:
	docker-compose build

# Start all services
up:
	docker-compose up -d

# Start with build
up-build:
	docker-compose up -d --build

# Stop all services
down:
	docker-compose down

# Restart services
restart:
	docker-compose restart

# View logs
logs:
	docker-compose logs -f

# App logs only
logs-app:
	docker-compose logs -f app

# Shell into app container
shell:
	docker-compose exec app sh

# PostgreSQL shell
db-shell:
	docker-compose exec postgres psql -U carxpert -d carxpert

# MongoDB shell
mongo-shell:
	docker-compose exec mongodb mongosh -u carxpert -p carxpert123 --authenticationDatabase admin

# Backup PostgreSQL
backup:
	@mkdir -p backups
	docker-compose exec postgres pg_dump -U carxpert carxpert > backups/backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "✅ Backup created in backups/"

# Restore PostgreSQL (usage: make restore FILE=backups/backup.sql)
restore:
	@if [ -z "$(FILE)" ]; then echo "❌ Usage: make restore FILE=backups/backup.sql"; exit 1; fi
	cat $(FILE) | docker-compose exec -T postgres psql -U carxpert carxpert
	@echo "✅ Restore completed"

# Clean everything (WARNING: removes data!)
clean:
	docker-compose down -v
	docker image prune -af
	@echo "✅ Cleanup completed"

# Development mode (databases only)
dev:
	docker-compose -f docker-compose.dev.yml up -d

# Development with admin tools
tools:
	docker-compose -f docker-compose.dev.yml --profile tools up -d
	@echo ""
	@echo "🔧 Admin Tools:"
	@echo "  pgAdmin: http://localhost:8080 (admin@carxpert.com / admin123)"
	@echo "  Mongo Express: http://localhost:8081 (admin / admin123)"

# Stop development
dev-down:
	docker-compose -f docker-compose.dev.yml --profile tools down

# Health check
health:
	@curl -s http://localhost:5000/api/health | python3 -m json.tool || echo "❌ Service not responding"

# Show status
status:
	docker-compose ps
