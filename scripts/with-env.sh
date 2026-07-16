#!/usr/bin/env bash
set -euo pipefail

ENV_FILE="${1:?Usage: with-env.sh <env-file> <command> [args...]}"
shift

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Env file not found: $ENV_FILE" >&2
  exit 1
fi

set -a
source "$ENV_FILE"
set +a

exec "$@"
