import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as AWS from 'aws-sdk';
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new AWS.S3();

export const handler = async ( event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        // Получаем имя файла из параметра запроса
        const fileName = event.queryStringParameters?.name;

        if (!fileName) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing file name parameter' }),
            };
        }

        // Создаем Signed URL
        // const signedUrl = await generateSignedUrl(fileName);
        const s3Client = new S3Client();
        const command = new PutObjectCommand({
        Bucket: 'rss-import-service',
        Key: `uploaded/${fileName}`,
    });

    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3000,
    });

        // Возвращаем Signed URL в ответе
        return {
            statusCode: 200,
            body: JSON.stringify({ signedUrl }),
        };
    } catch (error: unknown) {
        // В случае ошибки возвращаем соответствующий статус и сообщение об ошибке
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};

// Функция для создания Signed URL
const generateSignedUrl = async (fileName: string): Promise<string> => {
    // Устанавливаем параметры для создания Signed URL
    const params: AWS.S3.PresignedPost.Params = {
        Bucket: 'rss-import-service',
        Fields: {
            key: `uploaded/${fileName}`,
            'Content-Type': 'text/csv',
            // acl: 'private',
        },
        Expires: 60, // Время жизни URL в секундах
    };

    // Получаем Signed URL
    const signedUrl = await s3.createPresignedPost(params);

    return signedUrl.url;
};
