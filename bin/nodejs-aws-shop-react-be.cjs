#!/usr/bin/env node
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// bin/nodejs-aws-shop-react-be.ts
var cdk2 = __toESM(require("aws-cdk-lib"), 1);

// lib/nodejs-aws-shop-react-be-stack.ts
var cdk = __toESM(require("aws-cdk-lib"), 1);
var import_aws_lambda = require("aws-cdk-lib/aws-lambda");
var import_aws_apigateway = require("aws-cdk-lib/aws-apigateway");
var NodejsAwsShopReactBeStack = class extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);
    const getAllProducts = new import_aws_lambda.Function(this, "GetAllProducts", {
      runtime: import_aws_lambda.Runtime.NODEJS_18_X,
      code: import_aws_lambda.Code.fromAsset("./dist/getProductsList"),
      handler: "getProductsList.handler"
    });
    const getOneProduct = new import_aws_lambda.Function(this, "GetOneProduct", {
      runtime: import_aws_lambda.Runtime.NODEJS_18_X,
      code: import_aws_lambda.Code.fromAsset("./dist/getProductsById"),
      handler: "getProductsById.handler"
    });
    const integrationOptions = {
      allowTestInvoke: false
    };
    const getAllProductsIntegration = new import_aws_apigateway.LambdaIntegration(getAllProducts, integrationOptions);
    const getOneProductIntegration = new import_aws_apigateway.LambdaIntegration(getOneProduct, integrationOptions);
    const api = new import_aws_apigateway.RestApi(this, "ProductApi", {
      restApiName: "Products",
      deployOptions: {
        stageName: "dev"
      },
      defaultCorsPreflightOptions: {
        allowOrigins: import_aws_apigateway.Cors.ALL_ORIGINS,
        allowMethods: ["GET", "OPTIONS"]
      }
    });
    const products = api.root.addResource("products");
    products.addMethod("GET", getAllProductsIntegration);
    const oneProduct = products.addResource("{id}");
    oneProduct.addMethod("GET", getOneProductIntegration);
  }
};

// bin/nodejs-aws-shop-react-be.ts
var app = new cdk2.App();
new NodejsAwsShopReactBeStack(app, "NodejsAwsShopReactBeStack", {
  /* If you don't specify 'env', this stack will be environment-agnostic.
   * Account/Region-dependent features and context lookups will not work,
   * but a single synthesized template can be deployed anywhere. */
  /* Uncomment the next line to specialize this stack for the AWS Account
   * and Region that are implied by the current CLI configuration. */
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
  /* Uncomment the next line if you know exactly what Account and Region you
   * want to deploy the stack to. */
  // env: { account: '123456789012', region: 'us-east-1' },
  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
});
