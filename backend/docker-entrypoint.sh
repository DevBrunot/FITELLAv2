#!/bin/sh
set -e

if [ ! -f node_modules/@nestjs/core/package.json ]; then
  echo ">> Instalando dependências do backend (Yarn)..."
  yarn install --network-timeout 600000
fi

exec "$@"
