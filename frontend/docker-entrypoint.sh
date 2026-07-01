#!/bin/sh
set -e

if [ ! -f node_modules/vite/package.json ]; then
  echo ">> Instalando dependências do frontend (Yarn)..."
  yarn install --network-timeout 600000
fi

exec "$@"
