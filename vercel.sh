#!/bin/bash

echo "VERCEL_GIT_COMMIT_REF: $VERCEL_GIT_COMMIT_REF"

if [[ "$VERCEL_GIT_COMMIT_REF" == "master" ]]; then
  echo "✅ - Building on master branch..."
  exit 1 # Proceed with the build

else
  echo "🛑 - Build cancelled for branch $VERCEL_GIT_COMMIT_REF (Only master builds are allowed)"
  exit 0 # Cancel the build
fi