import { describe, expect, test } from "vitest";
import { handler as getAllProducts } from "../dist/getProductsList/getProductsList.js";
import { handler as getOneProduct } from "../dist/getProductsById/getProductsById.js";
// import {Product, ProductApiFailedResponse} from "../src/types.js"
import { APIGatewayProxyEvent } from "aws-lambda";

describe("Unit tests for Lambdas", () => {
    test("Get all products", async () => {
        const productsResponse = await getAllProducts();
        const products = productsResponse.body;

        expect(productsResponse.statusCode).toBe(200);
        expect(products.length).toBeGreaterThan(1)
    })

    test("Get one product (200)", async () => {
        const validProductId = "1"
        const productsResponse = await getOneProduct({
            pathParameters: {
                id: validProductId
            }
        });
        const product = JSON.parse(productsResponse.body);

        expect(productsResponse.statusCode).toBe(200);   
        expect(product).toMatchObject({
            id: "1",
            title: "ProductName1",
            description: "ProductDescription1",
            price: 2
        })
    })

    test("Get one product (401)", async () => {
        const invalidProductId = ""
        const productsResponse = await getOneProduct({
            pathParameters: {
                id: invalidProductId
            }
        });
        const product = JSON.parse(productsResponse.body);

        expect(productsResponse.statusCode).toBe(401);
        expect(product).toMatchObject("Product not found")
    })

    test("Get one product (404)", async () => {
        const invalidProductId = "101"
        const productsResponse = await getOneProduct({
            pathParameters: {
                id: invalidProductId
            }
        });
        const product = JSON.parse(productsResponse.body);

        expect(productsResponse.statusCode).toBe(404);
        expect(product).toMatchObject("Product not found")
    })
})