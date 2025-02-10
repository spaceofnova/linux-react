#!/bin/bash

echo "VERCEL_GIT_COMMIT_REF: $VERCEL_GIT_COMMIT_REF"

if [[ "$VERCEL_GIT_COMMIT_REF" == "master" ]]; then
  git fetch origin
  git checkout master
  git merge origin/master  # Or git rebase origin/master

  if git diff-tree --no-commit-id --name-only -r origin/master HEAD -- ./src > /dev/null; then
    echo "🛑 - No changes in source directory. Build cancelled."
    exit 0
  else
    echo "✅ - Changes found in source directory. Build can proceed."
    exit 1
  fi

else
  echo "🛑 - Build cancelled for branch $VERCEL_GIT_COMMIT_REF"
  exit 0
fi