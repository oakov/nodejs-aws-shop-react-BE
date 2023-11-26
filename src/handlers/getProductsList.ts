import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { sendResponse } from './utils';
import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from "@aws-sdk/util-dynamodb";
import * as dotenv from "dotenv";

dotenv.config();

export const handler = async ( event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log(`REQUEST: ${event.httpMethod}, ${event.path}`);
  const productParams = {
    TableName: "ProductTable" //process.env.PRODUCTS_TABLE_NAME || "",
  };
  const stockParams = {
    TableName: "StockTable" //process.env.STOCKS_TABLE_NAME || "",
  };
  
  try {
    const client = new DynamoDBClient();
    const productRes = (await client.send(new ScanCommand(productParams))).Items!;
    const stockRes = (await client.send(new ScanCommand(stockParams))).Items!; 
    const productItems = productRes.map((Item) => unmarshall(Item));
    const stockItems = stockRes.map((Item) => unmarshall(Item));
  
    const joinedResult = stockItems?.reduce((resultArr, stock) => {
      const relatedProduct = productItems?.find(
        (product) => stock.product_id === product.id
      );
      resultArr.push({ ...relatedProduct, count: stock.count });
      return resultArr;
    }, []);
    return sendResponse(200, joinedResult);
  } catch (err: unknown) {
    const error = err as Error;
    return sendResponse(500, error.message);
  }
};
