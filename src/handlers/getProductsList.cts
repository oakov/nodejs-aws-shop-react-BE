import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import productData from '../data/data';
import { sendResponse } from './utils';

export const handler = async ( event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    return sendResponse(200, productData);
  } catch (err: unknown) {
    const error = err as Error;
    return sendResponse(500, error.message);
  }
};
