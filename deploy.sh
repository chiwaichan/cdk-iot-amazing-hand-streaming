#!/bin/bash

set -e

echo "🚀 Starting local CDK deployment..."

# Check if required environment variables are set
if [ -z "$APPSYNC_API_ID" ] || [ -z "$APPSYNC_API_URL" ] || [ -z "$APPSYNC_API_KEY" ]; then
    echo "❌ Error: Required environment variables are missing"
    echo "Set them with:"
    echo "  export APPSYNC_API_ID=your_api_id"
    echo "  export APPSYNC_API_URL=your_api_url"
    echo "  export APPSYNC_API_KEY=your_api_key"
    exit 1
fi

# Install AWS CDK globally if not already installed
if ! command -v cdk &> /dev/null; then
    echo "📦 Installing AWS CDK..."
    npm install -g aws-cdk
fi

# Install project dependencies
echo "📦 Installing project dependencies..."
npm install

# Install Lambda dependencies
echo "📦 Installing Lambda dependencies..."
cd lambda/amazing-hand-to-appsync && npm install && cd ../..

echo "✅ Environment configured:"
echo "  APPSYNC_API_URL: ${APPSYNC_API_URL}"
echo "  APPSYNC_API_KEY: ${APPSYNC_API_KEY}"
echo "  APPSYNC_API_ID: ${APPSYNC_API_ID}"

# Bootstrap and deploy
echo "🏗️  Bootstrapping CDK..."
cdk bootstrap

echo "🚀 Deploying CDK stacks..."
cdk deploy --all --require-approval never --concurrency 5

echo "✅ Deployment complete!"
