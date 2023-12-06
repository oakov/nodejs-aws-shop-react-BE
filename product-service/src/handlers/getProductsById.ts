import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { sendResponse } from './utils';
import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log(`REQUEST: ${event.httpMethod}, ${event.path} ID: ${event.pathParameters?.id}`);
  const productParams = {
    TableName: "ProductTable", //process.env.PRODUCTS_TABLE_NAME || "",
    Key: marshall({ id: event.pathParameters?.id }),
  };
  const stockParams = {
    TableName: "StockTable", //process.env.STOCKS_TABLE_NAME || "",
    Key: marshall({ product_id: event.pathParameters?.id }),
  };

  try {
    const client = new DynamoDBClient({});
    const productRes = await client.send(new GetItemCommand(productParams));
    const stockRes = await client.send(new GetItemCommand(stockParams));

    if (!productRes.Item || !stockRes.Item) {
      return sendResponse(401, 'Product not found');
    }

    const result = { ...productRes.Item, count: stockRes.Item.count };

    return sendResponse(200, unmarshall(result));
  } catch (err: unknown) {
    const error = err as Error;
    return sendResponse(500, error.message);
  }
};