import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iot from 'aws-cdk-lib/aws-iot';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export interface IoTStreamingStackProps extends cdk.StackProps {
  appSyncApiUrl: string;
  appSyncApiKey: string;
  appSyncApiId: string;
}

export class IoTStreamingStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: IoTStreamingStackProps) {
    super(scope, id, props);

    // Lambda function for Amazing Hand to AppSync integration
    const amazingHandToAppSyncFunction = new lambda.Function(this, 'AmazingHandToAppSyncFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda/amazing-hand-to-appsync'),
      timeout: cdk.Duration.seconds(30),
      environment: {
        APPSYNC_API_URL: props.appSyncApiUrl,
        APPSYNC_API_KEY: props.appSyncApiKey,
        APPSYNC_API_ID: props.appSyncApiId
      }
    });

    // IAM permissions for Amazing Hand Lambda AppSync access
    amazingHandToAppSyncFunction.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'appsync:GraphQL'
      ],
      resources: [
        `arn:aws:appsync:${this.region}:${this.account}:apis/${props.appSyncApiId}/*`
      ]
    }));

    // IoT Topic Rule for Amazing Hand
    const amazingHandStateRule = new iot.CfnTopicRule(this, 'AmazingHandStateRule', {
      ruleName: 'AmazingHandStateStreamingRule',
      topicRulePayload: {
        awsIotSqlVersion: '2016-03-23',
        sql: "SELECT gesture, letter, ts, fingers, topic(3) AS device_name FROM 'the-project/robotic-hand/+/state'",
        actions: [{
          lambda: {
            functionArn: amazingHandToAppSyncFunction.functionArn
          }
        }]
      }
    });

    // Grant IoT permission to invoke Amazing Hand Lambda
    amazingHandToAppSyncFunction.addPermission('IoTInvokeAmazingHandPermission', {
      principal: new iam.ServicePrincipal('iot.amazonaws.com'),
      action: 'lambda:InvokeFunction',
      sourceArn: amazingHandStateRule.attrArn
    });

    // Outputs
    new cdk.CfnOutput(this, 'AmazingHandIoTRuleArn', {
      value: amazingHandStateRule.attrArn,
      description: 'IoT Rule ARN for amazing hand state streaming'
    });

    new cdk.CfnOutput(this, 'AmazingHandLambdaFunctionArn', {
      value: amazingHandToAppSyncFunction.functionArn,
      description: 'Lambda function ARN for amazing hand to AppSync integration'
    });
  }
}
