#!/bin/bash

echo "VERCEL_GIT_COMMIT_REF: $VERCEL_GIT_COMMIT_REF"

if [[ "$VERCEL_GIT_COMMIT_REF" == "master" ]]; then
  # Check for changes in the master branch's source directory
  if git diff-tree --no-commit-id --name-only -r origin/master HEAD -- <path/to/your/source/directory> > /dev/null; then
    # No changes in the source directory
    echo "🛑 - No changes in source directory. Build cancelled."
    exit 0
  else
    # Changes found in the source directory
    echo "✅ - Changes found in source directory. Build can proceed."
    exit 1  # Exit with a non-zero code to proceed with the build (Vercel treats non-zero as success)
  fi

else
  # Don't build for other branches
  echo "🛑 - Build cancelled for branch $VERCEL_GIT_COMMIT_REF"
  exit 0
fi