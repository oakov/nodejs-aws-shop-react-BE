import * as cdk from 'aws-cdk-lib';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import path = require('path');
import { PolicyStatement, Effect } from 'aws-cdk-lib/aws-iam';
import { LambdaIntegration, RestApi, Cors } from 'aws-cdk-lib/aws-apigateway';
import { Bucket, EventType, HttpMethods } from 'aws-cdk-lib/aws-s3';
import { LambdaDestination } from "aws-cdk-lib/aws-s3-notifications";

export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const lambdaGeneralProps = {
      runtime: Runtime.NODEJS_18_X,
      handler: "handler",
    };

    const importProducts = new NodejsFunction(this, "importProducts", {
      ...lambdaGeneralProps,
      entry: path.join(__dirname + "/../src/handlers/importProductsFile.ts"),
    });

    const importFileParser = new NodejsFunction(this, "importFileParser", {
      ...lambdaGeneralProps,
      entry: path.join(__dirname + "/../src/handlers/importFileParser.ts"),
    });

    // Добавляем политику для доступа к S3
    importProducts.addToRolePolicy(new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ['s3:PutObject'],
      resources: ['arn:aws:s3:::rss-import-service/*'],
    }));

    // const integrationOptions = <LambdaIntegrationOptions>{
    //   allowTestInvoke: false,
    // }
    const importProductsIntegration = new LambdaIntegration(importProducts);
    
    const api = new RestApi(this, "ImportApi", {
      restApiName: "Import",
      deployOptions: {
          stageName: "dev",
      },
      defaultCorsPreflightOptions: {
        allowHeaders: ['*'],
        allowOrigins: ['*'],
        allowMethods: [HttpMethods.GET, HttpMethods.PUT]
    },
    });
            
    const products = api.root.addResource("import");
    products.addMethod('GET', importProductsIntegration );

    const s3Bucket = Bucket.fromBucketName(
      this,
      "ImportProductsBucket",
      "rss-import-service"
    );

    s3Bucket.addEventNotification(
      EventType.OBJECT_CREATED,
      new LambdaDestination(importFileParser),
      { prefix: "uploaded/" }
    );

    s3Bucket.grantReadWrite(importProducts);
    s3Bucket.grantReadWrite(importFileParser);
    s3Bucket.grantDelete(importFileParser);
  }
}
