#!/bin/bash

# Build the client
cd client
npm run build
cd ..

# Copy the client build to the root to help Vercel find it
if [ ! -d "build" ]; then
  mkdir -p build
fi

cp -r client/dist/* build/

# Make sure the api directory exists
if [ ! -d "api" ]; then
  mkdir -p api
fi

# Success message
echo "✅ Build completed successfully. Files copied to build/ directory."