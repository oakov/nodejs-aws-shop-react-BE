import "dotenv/config";
import * as cdk from 'aws-cdk-lib';
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { Cors, LambdaIntegration, LambdaIntegrationOptions, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Construct } from "constructs";
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';
import { Role, ServicePrincipal, PolicyStatement } from 'aws-cdk-lib/aws-iam';

export class NodejsAwsShopReactBeStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    
    const role = new Role(this, "dynamodbAccessRole", {
      assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
    });
    
    role.addToPolicy(
      new PolicyStatement({
        actions: ["dynamodb:*", "logs:PutLogEvents"],
        resources: ["*"],
      })
      );
      
      const lambdaGeneralProps = {
          runtime: Runtime.NODEJS_18_X,
          handler: "handler",
          environment: {
            PRODUCTS_TABLE_NAME: process.env.PRODUCTS_TABLE_NAME!,
            STOCKS_TABLE_NAME: process.env.STOCKS_TABLE_NAME!,
          },
          role,
        };
    const getAllProducts = new NodejsFunction(this, "getProductsList", {
        ...lambdaGeneralProps,
        entry: path.join(__dirname + "/../src/handlers/getProductsList.ts"),
      });
  
    const getOneProduct = new NodejsFunction(this, "getProductsById", {
        ...lambdaGeneralProps,
        entry: path.join(__dirname + "/../src/handlers/getProductsById.ts"),
      });

      const createProduct = new NodejsFunction(this, "createProduct", {
        ...lambdaGeneralProps,
        entry: path.join(__dirname + "/../src/handlers/createProduct.ts"),
      });
      
    const integrationOptions = <LambdaIntegrationOptions>{
        allowTestInvoke: false,
    }
    const getAllProductsIntegration = new LambdaIntegration(getAllProducts, integrationOptions);
    const getOneProductIntegration = new LambdaIntegration(getOneProduct, integrationOptions);
    const createProductIntegration = new LambdaIntegration(createProduct);
      
    const api = new RestApi(this, "ProductApi", {
        restApiName: "Products",
        deployOptions: {
            stageName: "dev",
        },
        defaultCorsPreflightOptions: {
            allowOrigins: Cors.ALL_ORIGINS,
            allowMethods: ["GET", "OPTIONS", "PUT"]
        }
    });
              
    const products = api.root.addResource("products");
    products.addMethod("GET", getAllProductsIntegration);
    products.addMethod("PUT", createProductIntegration);
      
    const oneProduct = products.addResource("{id}");
    oneProduct.addMethod("GET", getOneProductIntegration);
  }
}
