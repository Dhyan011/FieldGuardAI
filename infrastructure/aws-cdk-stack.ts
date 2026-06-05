import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as appsync from 'aws-cdk-lib/aws-appsync';

export class FieldGuardStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Cognito User Pool for Admin Dashboard
    const adminPool = new cognito.UserPool(this, 'FieldGuardAdminPool', {
      userPoolName: 'fieldguard-admin-pool',
      selfSignUpEnabled: false,
      signInAliases: { email: true },
    });

    // DynamoDB Table: Attendance Logs
    const attendanceTable = new dynamodb.Table(this, 'FieldGuardAttendance', {
      tableName: 'fieldguard-attendance',
      partitionKey: { name: 'device_id', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'timestamp', type: dynamodb.AttributeType.NUMBER },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      stream: dynamodb.StreamViewType.NEW_IMAGE,
    });

    // DynamoDB Table: Workers
    const workersTable = new dynamodb.Table(this, 'FieldGuardWorkers', {
      tableName: 'fieldguard-workers',
      partitionKey: { name: 'worker_id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    // S3 Bucket for Logs & Future Federated Learning Updates
    const logsBucket = new s3.Bucket(this, 'FieldGuardLogs', {
      bucketName: 'fieldguard-logs-storage',
      versioned: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
    });

    // Lambda: Conflict Resolver for Duplicate offline sync records
    const conflictResolver = new lambda.Function(this, 'ConflictResolverLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        exports.handler = async (event) => {
          // Logic to resolve 60s duplicate window
          console.log("Processing stream events", JSON.stringify(event));
        };
      `),
    });

    // AppSync GraphQL API for the Web Dashboard
    const api = new appsync.GraphqlApi(this, 'FieldGuardApi', {
      name: 'fieldguard-api',
      schema: appsync.SchemaFile.fromAsset('schema.graphql'),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.USER_POOL,
          userPoolConfig: { userPool: adminPool },
        },
      },
    });

    api.addDynamoDbDataSource('AttendanceDataSource', attendanceTable);
  }
}
