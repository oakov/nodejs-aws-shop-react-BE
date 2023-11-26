import * as cdk from 'aws-cdk-lib';
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { Cors, LambdaIntegration, LambdaIntegrationOptions, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Construct } from "constructs";
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import path = require('path');

export class NodejsAwsShopReactBeStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'NodejsAwsShopReactBeQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });

    // const getAllProducts = new Function(this, "GetAllProducts", {
    //     runtime: Runtime.NODEJS_18_X,
    //     code: Code.fromAsset("./dist/getProductsList"),
    //     handler: "getProductsList.handler"
    // })
      
    // const getOneProduct = new Function(this, "GetOneProduct", {
    //     runtime: Runtime.NODEJS_18_X,
    //     code: Code.fromAsset("./dist/getProductsById"),
    //     handler: "getProductsById.handler"
    // })

    const lambdaGeneralProps = {
        runtime: Runtime.NODEJS_18_X,
        handler: "handler",
      };

    const getAllProducts = new NodejsFunction(this, "getProductsList", {
        ...lambdaGeneralProps,
        entry: path.join(__dirname + "/../src/handlers/getProductsList.ts"),
      });
  
    const getOneProduct = new NodejsFunction(this, "getProductsById", {
        ...lambdaGeneralProps,
        entry: path.join(__dirname + "/../src/handlers/getProductsById.ts"),
      });
      
    const integrationOptions = <LambdaIntegrationOptions>{
        allowTestInvoke: false,
    }
    const getAllProductsIntegration = new LambdaIntegration(getAllProducts, integrationOptions);
    const getOneProductIntegration = new LambdaIntegration(getOneProduct, integrationOptions);
      
    const api = new RestApi(this, "ProductApi", {
        restApiName: "Products",
        deployOptions: {
            stageName: "dev",
        },
        defaultCorsPreflightOptions: {
            allowOrigins: Cors.ALL_ORIGINS,
            allowMethods: ["GET", "OPTIONS"]
        }
    });
              
    const products = api.root.addResource("products");
    products.addMethod("GET", getAllProductsIntegration);
      
    const oneProduct = products.addResource("{id}");
    oneProduct.addMethod("GET", getOneProductIntegration);
  }
}
