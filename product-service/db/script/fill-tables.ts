import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { v1 as uuidv1 } from 'uuid';
import * as dotenv from "dotenv";

dotenv.config();

const docClient = DynamoDBDocument.from(new DynamoDB({ region: process.env.AWS_REGION }));

for (let i = 0; i <= 29; i++) {
  const id = uuidv1();
  const productItem = {
      id: id,
      title: "ProductName" + i,
      description:"ProductDescription" + i,
      price: (i+1)*10
  };
  docClient.put({TableName: process.env.PRODUCTS_TABLE_NAME, Item: productItem});
  const stockItem = {
    product_id: id,
    count: Math.floor(Math.random() * 100)
  };
  docClient.put({TableName: process.env.STOCKS_TABLE_NAME, Item: stockItem});
}
