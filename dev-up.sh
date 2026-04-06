#!/usr/bin/env bash

pnpm install --frozen-lockfile

cp -n .env.example .env

pkill -f "pnpm dev:api" || true
pkill -f "pnpm dev:web" || true
pkill -f "pnpm dev:admin" || true

fuser -k 3000/tcp || true
fuser -k 3001/tcp || true
fuser -k 3002/tcp || true

mkdir -p .tmp/dev-up

nohup pnpm dev:api > .tmp/dev-up/api.log 2>&1 &
echo $! > .tmp/dev-up/api.pid

nohup pnpm dev:web > .tmp/dev-up/web.log 2>&1 &
echo $! > .tmp/dev-up/web.pid

nohup pnpm dev:admin > .tmp/dev-up/admin.log 2>&1 &
echo $! > .tmp/dev-up/admin.pid

sleep 6

curl -sS -o /dev/null -w "api=%{http_code}\n" http://localhost:3002/health
curl -sS -o /dev/null -w "web=%{http_code}\n" http://localhost:3000/
curl -sS -o /dev/null -w "admin=%{http_code}\n" http://localhost:3001/painel/login

echo "LOGIN: http://localhost:3001/painel/login"
echo "EMAIL: admin@local.test"
echo "SENHA: ChangeMe123!"
