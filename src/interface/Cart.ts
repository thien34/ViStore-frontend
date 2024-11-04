import { ProductResponseDetails, } from "./Product";

export interface ShoppingCart {
    cartUUID: string;
    productId: number | null;
    quantity: number;
    customerId: number;
    isAdmin: boolean;
}


export interface CartResponse {
    id: number;
    cartUUID: string;
    isAdmin: boolean;
    parentId: string;
    quantity: number;
    productResponse: ProductResponseDetails;
}
