import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

export class RagImplementationStack112020251229 extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const suffix = '112020251229';

    // S3 bucket for documents
    const documentsBucket = new s3.Bucket(this, `DocumentsBucket${suffix}`, {
      bucketName: `rag-documents-${suffix}`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      cors: [{
        allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.POST, s3.HttpMethods.PUT],
        allowedOrigins: ['*'],
        allowedHeaders: ['*'],
      }]
    });

    // DynamoDB table for query history
    const queryHistoryTable = new dynamodb.Table(this, `QueryHistoryTable${suffix}`, {
      tableName: `rag-query-history-${suffix}`,
      partitionKey: { name: 'queryId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PROVISIONED,
      readCapacity: 5,
      writeCapacity: 5,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Enable auto scaling
    queryHistoryTable.autoScaleReadCapacity({
      minCapacity: 1,
      maxCapacity: 10,
    });
    queryHistoryTable.autoScaleWriteCapacity({
      minCapacity: 1,
      maxCapacity: 10,
    });

    // Kendra service role
    const kendraRole = new iam.Role(this, `KendraRole${suffix}`, {
      assumedBy: new iam.ServicePrincipal('kendra.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('CloudWatchLogsFullAccess'),
      ],
      inlinePolicies: {
        S3Access: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ['s3:GetObject', 's3:ListBucket'],
              resources: [documentsBucket.bucketArn, `${documentsBucket.bucketArn}/*`],
            }),
          ],
        }),
      },
    });

    // Kendra Index
    const kendraIndex = new cdk.aws_kendra.CfnIndex(this, `KendraIndex${suffix}`, {
      name: `rag-index-${suffix}`,
      edition: 'DEVELOPER_EDITION',
      roleArn: kendraRole.roleArn,
    });

    // Lambda layer for AWS SDK v3
    const awsSdkLayer = new lambda.LayerVersion(this, `AwsSdkLayer${suffix}`, {
      code: lambda.Code.fromAsset('../lambda-layer'),
      compatibleRuntimes: [lambda.Runtime.NODEJS_22_X],
      description: 'AWS SDK v3 for Lambda functions',
    });

    // Lambda execution role
    const lambdaRole = new iam.Role(this, `LambdaRole${suffix}`, {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
      inlinePolicies: {
        KendraAccess: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ['kendra:Query', 'kendra:Retrieve', 'kendra:BatchPutDocument'],
              resources: [kendraIndex.attrArn],
            }),
          ],
        }),
        BedrockAccess: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ['bedrock:InvokeModel'],
              resources: [
                'arn:aws:bedrock:*:*:inference-profile/global.anthropic.claude-sonnet-4-20250514-v1:0',
                'arn:aws:bedrock:*::foundation-model/anthropic.claude-sonnet-4-20250514-v1:0'
              ],
            }),
          ],
        }),
        S3Access: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ['s3:GetObject', 's3:PutObject', 's3:ListBucket'],
              resources: [documentsBucket.bucketArn, `${documentsBucket.bucketArn}/*`],
            }),
          ],
        }),
        DynamoDBAccess: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ['dynamodb:PutItem', 'dynamodb:GetItem', 'dynamodb:Query'],
              resources: [queryHistoryTable.tableArn],
            }),
          ],
        }),
      },
    });

    // Query processing Lambda
    const queryLambda = new lambda.Function(this, `QueryLambda${suffix}`, {
      functionName: `rag-query-${suffix}`,
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'index.handler',
      layers: [awsSdkLayer],
      code: lambda.Code.fromInline(`
        const { KendraClient, RetrieveCommand } = require('@aws-sdk/client-kendra');
        const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
        const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');

        const kendra = new KendraClient({ region: process.env.AWS_REGION });
        const bedrock = new BedrockRuntimeClient({ region: process.env.AWS_REGION });
        const dynamodb = new DynamoDBClient({ region: process.env.AWS_REGION });

        exports.handler = async (event) => {
          const headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
          };

          if (event.httpMethod === 'OPTIONS') {
            return { statusCode: 200, headers, body: '' };
          }

          try {
            const { question } = JSON.parse(event.body);
            const startTime = Date.now();

            console.log('Processing question:', question);

            // Retrieve from Kendra using Retrieve API for comprehensive content
            const retrieveParams = {
              IndexId: process.env.KENDRA_INDEX_ID,
              QueryText: question,
              PageSize: 10
            };

            console.log('Calling Kendra Retrieve API...');
            const retrieveResult = await kendra.send(new RetrieveCommand(retrieveParams));
            
            let context = '';
            const sources = [];
            
            if (retrieveResult.ResultItems && retrieveResult.ResultItems.length > 0) {
              console.log('Found', retrieveResult.ResultItems.length, 'result items');
              retrieveResult.ResultItems.forEach(item => {
                if (item.Content) {
                  context += item.Content + '\\n\\n';
                  if (item.DocumentTitle) {
                    sources.push(item.DocumentTitle);
                  } else if (item.DocumentURI) {
                    sources.push(item.DocumentURI.split('/').pop() || 'Unknown Document');
                  }
                }
              });
            } else {
              console.log('No results found from Kendra');
              context = 'No relevant documents found for this question.';
            }

            console.log('Context length:', context.length);

            // Generate response with Bedrock
            const prompt = \`Based on the following context from the documents, please provide a comprehensive and detailed answer to the question. If the context doesn't contain relevant information, please say so.

Context:
\${context}

Question: \${question}

Answer:\`;

            console.log('Calling Bedrock...');
            const bedrockParams = {
              modelId: 'global.anthropic.claude-sonnet-4-20250514-v1:0',
              contentType: 'application/json',
              accept: 'application/json',
              body: JSON.stringify({
                anthropic_version: 'bedrock-2023-05-31',
                max_tokens: 4000,
                temperature: 0.1,
                messages: [{
                  role: 'user',
                  content: prompt
                }]
              })
            };

            const bedrockResult = await bedrock.send(new InvokeModelCommand(bedrockParams));
            const responseBody = JSON.parse(new TextDecoder().decode(bedrockResult.body));
            const answer = responseBody.content[0].text;

            console.log('Generated answer length:', answer.length);

            // Save to DynamoDB
            const queryId = \`query-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`;
            const responseTime = Date.now() - startTime;

            try {
              await dynamodb.send(new PutItemCommand({
                TableName: process.env.QUERY_HISTORY_TABLE,
                Item: {
                  queryId: { S: queryId },
                  timestamp: { N: startTime.toString() },
                  question: { S: question },
                  response: { S: answer },
                  documentsUsed: { SS: sources.length > 0 ? sources : ['No sources'] },
                  responseTime: { N: responseTime.toString() }
                }
              }));
            } catch (dbError) {
              console.error('DynamoDB error:', dbError);
              // Continue even if DynamoDB fails
            }

            return {
              statusCode: 200,
              headers,
              body: JSON.stringify({
                response: answer,
                sources: [...new Set(sources)],
                queryId,
                responseTime
              })
            };
          } catch (error) {
            console.error('Error:', error);
            return {
              statusCode: 500,
              headers,
              body: JSON.stringify({ 
                error: error.message,
                details: 'Check CloudWatch logs for more information'
              })
            };
          }
        };
      `),
      environment: {
        KENDRA_INDEX_ID: kendraIndex.attrId,
        QUERY_HISTORY_TABLE: queryHistoryTable.tableName,
      },
      role: lambdaRole,
      timeout: cdk.Duration.seconds(30),
      memorySize: 1024,
    });

    // Document ingestion Lambda
    const ingestLambda = new lambda.Function(this, `IngestLambda${suffix}`, {
      functionName: `rag-ingest-${suffix}`,
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'index.handler',
      layers: [awsSdkLayer],
      code: lambda.Code.fromInline(`
        const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
        const { KendraClient, BatchPutDocumentCommand } = require('@aws-sdk/client-kendra');

        const s3 = new S3Client({ region: process.env.AWS_REGION });
        const kendra = new KendraClient({ region: process.env.AWS_REGION });

        exports.handler = async (event) => {
          const headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
          };

          if (event.httpMethod === 'OPTIONS') {
            return { statusCode: 200, headers, body: '' };
          }

          try {
            return {
              statusCode: 200,
              headers,
              body: JSON.stringify({ 
                status: 'success',
                message: 'Document ingestion endpoint ready',
                indexId: process.env.KENDRA_INDEX_ID
              })
            };
          } catch (error) {
            console.error('Error:', error);
            return {
              statusCode: 500,
              headers,
              body: JSON.stringify({ error: error.message })
            };
          }
        };
      `),
      environment: {
        KENDRA_INDEX_ID: kendraIndex.attrId,
        DOCUMENTS_BUCKET: documentsBucket.bucketName,
      },
      role: lambdaRole,
      timeout: cdk.Duration.seconds(30),
      memorySize: 1024,
    });

    // API Gateway
    const api = new apigateway.RestApi(this, `RagApi${suffix}`, {
      restApiName: `rag-api-${suffix}`,
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key'],
      },
    });

    const apiResource = api.root.addResource('api');
    const queryResource = apiResource.addResource('query');
    const ingestResource = apiResource.addResource('ingest');

    queryResource.addMethod('POST', new apigateway.LambdaIntegration(queryLambda));
    ingestResource.addMethod('POST', new apigateway.LambdaIntegration(ingestLambda));

    // Outputs
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'API Gateway URL',
    });

    new cdk.CfnOutput(this, 'KendraIndexId', {
      value: kendraIndex.attrId,
      description: 'Kendra Index ID',
    });

    new cdk.CfnOutput(this, 'DocumentsBucketName', {
      value: documentsBucket.bucketName,
      description: 'Documents S3 Bucket Name',
    });
  }
}
