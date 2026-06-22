#!/bin/sh
set -e

# Authenticate to Infisical via the machine identity, then run the app with
# secrets injected as env vars. Falls back to plain env if Infisical isn't
# configured (e.g. someone runs the prod image without machine-identity creds).
if [ -n "$INFISICAL_CLIENT_ID" ] && [ -n "$INFISICAL_CLIENT_SECRET" ]; then
  export INFISICAL_TOKEN="$(infisical login \
    --method=universal-auth \
    --client-id="$INFISICAL_CLIENT_ID" \
    --client-secret="$INFISICAL_CLIENT_SECRET" \
    --domain="$INFISICAL_API_URL" \
    --silent --plain)"

  exec infisical run \
    --projectId="$INFISICAL_PROJECT_ID" \
    --env="$INFISICAL_ENV" \
    --domain="$INFISICAL_API_URL" \
    -- sh -c 'alembic upgrade head && exec uvicorn app.main:app --host 0.0.0.0 --port 8001 --workers 4'
fi

alembic upgrade head
exec uvicorn app.main:app --host 0.0.0.0 --port 8001 --workers 4
