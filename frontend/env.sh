#!/bin/sh
set -e
echo "API_URL is: $VITE_API_URL"
echo "WEBSOCKET_URL is: $VITE_WEBSOCKET_URL"

cat <<EOF > /usr/share/nginx/html/env-config.js
window.env_ = {
  VITE_API_URL: "${VITE_API_URL}",
  VITE_WEBSOCKET_URL: "${VITE_WEBSOCKET_URL}"
};

console.log("Loaded env config:", window.env_);
EOF

exec "$@"