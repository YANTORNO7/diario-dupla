#!/bin/bash
# Script de backup de la base de datos de Diario Dupla
# Uso: ./scripts/backup-db.sh
# Requiere: pg_dump y la variable DATABASE_URL configurada

set -euo pipefail

DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="diario_dupla_backup_${DATE}.sql.gz"
BACKUP_DIR="${BACKUP_DIR:-./backups}"

mkdir -p "$BACKUP_DIR"

echo "Creando backup: ${FILENAME}..."
pg_dump "$DATABASE_URL" | gzip > "${BACKUP_DIR}/${FILENAME}"

echo "Backup creado en: ${BACKUP_DIR}/${FILENAME}"
echo "Tamaño: $(du -h "${BACKUP_DIR}/${FILENAME}" | cut -f1)"
