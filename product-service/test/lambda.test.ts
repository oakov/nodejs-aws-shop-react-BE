import { describe, expect, test } from "vitest";
import { handler as getAllProducts } from "../src/handlers/getProductsList";
import { handler as getOneProduct } from "../src/handlers/getProductsById";
// import {Product, ProductApiFailedResponse} from "../src/types.js"
import { APIGatewayProxyEvent } from "aws-lambda";
import createEvent from "aws-event-mocks";

describe("Unit tests for Lambdas", () => {
    const mockEvent = createEvent({ template: "aws:apiGateway"});

    test("Get all products", async () => {
        const productsResponse = await getAllProducts(mockEvent);
        const products = productsResponse.body;
        console.log(productsResponse)

        expect(productsResponse.statusCode).toBe(200);
        expect(products.length).toBeGreaterThan(1)
    })

    test("Get one product (200)", async () => {
        const validProductId = "1";
        mockEvent.pathParameters = { id: validProductId };
        const productsResponse = await getOneProduct(mockEvent);
        const product = JSON.parse(productsResponse.body);

        expect(productsResponse.statusCode).toBe(200);   
        expect(product).toMatchObject({
            id: "1",
            title: "ProductName1",
            description: "ProductDescription1",
            price: 2
        })
    })

    // test("Get one product (401)", async () => {
    //     const invalidProductId = ""
    //     const productsResponse = await getOneProduct({
    //         pathParameters: {
    //             id: invalidProductId
    //         }
    //     });
    //     const product = JSON.parse(productsResponse.body);

    //     expect(productsResponse.statusCode).toBe(401);
    //     expect(product).toMatchObject("Product not found")
    // })

    // test("Get one product (404)", async () => {
    //     const invalidProductId = "101"
    //     const productsResponse = await getOneProduct({
    //         pathParameters: {
    //             id: invalidProductId
    //         }
    //     });
    //     const product = JSON.parse(productsResponse.body);

    //     expect(productsResponse.statusCode).toBe(404);
    //     expect(product).toMatchObject("Product not found")
    // })
})