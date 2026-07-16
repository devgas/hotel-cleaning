#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROD_ENV_FILE="${PROD_ENV_FILE:-$ROOT_DIR/.env.local}"
VERCEL_ENV_FILE="${VERCEL_ENV_FILE:-$ROOT_DIR/.env.vercel.pull.local}"
USE_VERCEL_CLI="${USE_VERCEL_CLI:-1}"
VERCEL_ENVIRONMENT="${VERCEL_ENVIRONMENT:-development}"
LOCAL_ENV_FILE="${LOCAL_ENV_FILE:-$ROOT_DIR/.env.localdb}"
TEST_ENV_FILE="${TEST_ENV_FILE:-$ROOT_DIR/.env.test.local}"
DUMP_DIR="${DUMP_DIR:-$ROOT_DIR/tmp}"
DUMP_FILE="${DUMP_FILE:-$DUMP_DIR/hotel-cleaning-prod.dump}"
POSTGRES_CONTAINER_NAME="${POSTGRES_CONTAINER_NAME:-hotel-cleaning-postgres}"
POSTGRES_IMAGE="${POSTGRES_IMAGE:-postgres:17}"
LOCAL_POSTGRES_PORT="${LOCAL_POSTGRES_PORT:-54329}"
LOCAL_POSTGRES_DB="${LOCAL_POSTGRES_DB:-hotel_cleaning_local}"
LOCAL_POSTGRES_USER="${LOCAL_POSTGRES_USER:-hotel_cleaning}"
LOCAL_POSTGRES_PASSWORD="${LOCAL_POSTGRES_PASSWORD:-hotel_cleaning}"
SOURCE_ENV_FILE="$PROD_ENV_FILE"

if [[ "$USE_VERCEL_CLI" == "1" ]]; then
  if ! command -v vercel >/dev/null 2>&1; then
    echo "Vercel CLI is not installed." >&2
    exit 1
  fi

  vercel env pull "$VERCEL_ENV_FILE" --environment="$VERCEL_ENVIRONMENT" --yes >/dev/null
  SOURCE_ENV_FILE="$VERCEL_ENV_FILE"
fi

if [[ ! -f "$SOURCE_ENV_FILE" ]]; then
  echo "Source env file not found: $SOURCE_ENV_FILE" >&2
  exit 1
fi

mkdir -p "$DUMP_DIR"

set -a
source "$SOURCE_ENV_FILE"
set +a

PROD_DATABASE_URL="${DATABASE_URL:-}"
if [[ -z "$PROD_DATABASE_URL" ]]; then
  echo "DATABASE_URL is missing in $SOURCE_ENV_FILE" >&2
  exit 1
fi

if [[ "$PROD_DATABASE_URL" == *"127.0.0.1"* || "$PROD_DATABASE_URL" == *"localhost"* ]]; then
  echo "Refusing to clone because the source DATABASE_URL already points to localhost." >&2
  exit 1
fi

LOCAL_DATABASE_URL="postgresql://${LOCAL_POSTGRES_USER}:${LOCAL_POSTGRES_PASSWORD}@127.0.0.1:${LOCAL_POSTGRES_PORT}/${LOCAL_POSTGRES_DB}?schema=public"

existing_image="$(docker inspect -f {{.Config.Image}} "$POSTGRES_CONTAINER_NAME" 2>/dev/null || true)"
if [[ -n "$existing_image" && "$existing_image" != "$POSTGRES_IMAGE" ]]; then
  docker rm -f "$POSTGRES_CONTAINER_NAME" >/dev/null
fi

if ! docker container inspect "$POSTGRES_CONTAINER_NAME" >/dev/null 2>&1; then
  docker run -d \
    --name "$POSTGRES_CONTAINER_NAME" \
    -e POSTGRES_DB="$LOCAL_POSTGRES_DB" \
    -e POSTGRES_USER="$LOCAL_POSTGRES_USER" \
    -e POSTGRES_PASSWORD="$LOCAL_POSTGRES_PASSWORD" \
    -p "${LOCAL_POSTGRES_PORT}:5432" \
    "$POSTGRES_IMAGE" >/dev/null
else
  docker start "$POSTGRES_CONTAINER_NAME" >/dev/null || true
fi

for _ in {1..30}; do
  if docker exec "$POSTGRES_CONTAINER_NAME" pg_isready -U "$LOCAL_POSTGRES_USER" -d postgres >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

docker exec "$POSTGRES_CONTAINER_NAME" psql -U "$LOCAL_POSTGRES_USER" -d postgres -c "DROP DATABASE IF EXISTS ${LOCAL_POSTGRES_DB};" >/dev/null
docker exec "$POSTGRES_CONTAINER_NAME" psql -U "$LOCAL_POSTGRES_USER" -d postgres -c "CREATE DATABASE ${LOCAL_POSTGRES_DB};" >/dev/null

docker run --rm "$POSTGRES_IMAGE" pg_dump --help >/dev/null 2>&1

docker run --rm "$POSTGRES_IMAGE" \
  pg_dump \
  --dbname="$PROD_DATABASE_URL" \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  > "$DUMP_FILE"

docker exec -i "$POSTGRES_CONTAINER_NAME" psql -U "$LOCAL_POSTGRES_USER" -d "$LOCAL_POSTGRES_DB" < "$DUMP_FILE"

cat > "$LOCAL_ENV_FILE" <<EOF
ADMIN_PASSWORD="${ADMIN_PASSWORD:-admin123}"
AUTH_SECRET="${AUTH_SECRET:-}"
DATABASE_URL="${LOCAL_DATABASE_URL}"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_DEFAULT_HOTEL_ID="${NEXT_PUBLIC_DEFAULT_HOTEL_ID:-1}"
NEXT_PUBLIC_VAPID_PUBLIC_KEY="${NEXT_PUBLIC_VAPID_PUBLIC_KEY:-}"
VAPID_PRIVATE_KEY="${VAPID_PRIVATE_KEY:-}"
VAPID_EMAIL="${VAPID_EMAIL:-mailto:admin@hotel.local}"
EOF

cat > "$TEST_ENV_FILE" <<EOF
ADMIN_PASSWORD="${ADMIN_PASSWORD:-admin123}"
AUTH_SECRET="${AUTH_SECRET:-}"
DATABASE_URL="${LOCAL_DATABASE_URL}"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_DEFAULT_HOTEL_ID="${NEXT_PUBLIC_DEFAULT_HOTEL_ID:-1}"
NEXT_PUBLIC_VAPID_PUBLIC_KEY="${NEXT_PUBLIC_VAPID_PUBLIC_KEY:-}"
VAPID_PRIVATE_KEY="${VAPID_PRIVATE_KEY:-}"
VAPID_EMAIL="${VAPID_EMAIL:-mailto:admin@hotel.local}"
EOF

echo "Local database refreshed at $LOCAL_DATABASE_URL"
echo "Local env written to $LOCAL_ENV_FILE"
echo "Test env written to $TEST_ENV_FILE"
