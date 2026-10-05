#!/usr/bin/env bash
set -euo pipefail
SERVER="${SERVER:?usage: SERVER=root@IP ./deploy.sh}"
ssh "$SERVER" "mkdir -p /opt/horilux"
rsync -az --files-from=<(git ls-files) ./ "$SERVER:/opt/horilux/"
ssh "$SERVER" "cd /opt/horilux && docker compose up -d --build && docker image prune -f"
