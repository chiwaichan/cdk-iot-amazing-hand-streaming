#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { IoTStreamingStack } from '../lib/iot-streaming-stack';

const app = new cdk.App();

// Get AppSync details from context or environment
const appSyncApiUrl = app.node.tryGetContext('appSyncApiUrl') || process.env.APPSYNC_API_URL!;
const appSyncApiKey = app.node.tryGetContext('appSyncApiKey') || process.env.APPSYNC_API_KEY!;
const appSyncApiId = app.node.tryGetContext('appSyncApiId') || process.env.APPSYNC_API_ID!;

new IoTStreamingStack(app, 'IoTStreamingStack', {
  appSyncApiUrl,
  appSyncApiKey,
  appSyncApiId,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1'
  }
});
