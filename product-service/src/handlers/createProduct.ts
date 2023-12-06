import { v1 as uuidv1 } from 'uuid';
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { sendResponse } from './utils';

export const handler = async ( event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log(`REQUEST: ${event.httpMethod}, ${event.path} BODY: ${event.body}`);
  const data = JSON.parse(event.body || "{}");
  const id = uuidv1();
  const productParams = {
    TableName: "ProductTable", //process.env.PRODUCTS_TABLE_NAME || "",
    Item: marshall({
        id: id,
        title: data.title,
        description: data.description,
        price: data.price,
    }),
  };
  const stockParams = {
    TableName: "StockTable", //process.env.STOCKS_TABLE_NAME || "",
    Item: marshall({
        product_id: id,
        count: data.count,
    }),
  };
  try {
    const client = new DynamoDBClient({});
    await client.send(new PutItemCommand(productParams));
    await client.send(new PutItemCommand(stockParams));
    return sendResponse(200, {...productParams.Item, count: stockParams.Item.count});
  } catch (err: unknown) {
    const error = err as Error;
    return sendResponse(500, error.message);
  }
};