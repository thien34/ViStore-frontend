import { PagingResponse } from "./paging.interface"

export interface ReturnInvoice {
    id?: number,
    returnRequestId: number,
    orderId: number,
    refundAmount: number,
}

export interface ReturnInvoiceRequest {
    returnRequestId: number,
    orderId: number,
    refundAmount: number,
}

export interface ReturnItem {
    id?: number,
    productId: number,
    productName: string,
    quantity: number,
    oldUnitPrice: number,
    discountAmountPerItem: number,
    refundTotal: number,
}


export interface ReturnItemRequest {
    returnRequestId?: number,
    orderItemId: number,
    productId: number,
    oldUnitPrice: number,
    quantity: number
    discountAmountPerItem: number,
    refundTotal: number,
}

export interface ReturnRequest {
    id?: number,
    customerId: number,
    orderId: number,
    reasonForReturn: string,
    requestAction: string,
    totalReturnQuantity: number,
    customerComments: string,
    staffNotes: string,
    returnRequestStatusId: string
}

export interface ReturnRequestRequest {
    customerId?: number,
    orderId?: number,
    reasonForReturn: string,
    requestAction: string,
    totalReturnQuantity: number,
    customerComments: string,
    staffNotes: string,
    returnRequestStatusId: string
}

export interface OrderResponse {
    orderId: number,
    customerId: number,
    firstName: string,
    lastName: string,
    orderTotal: number,
}

export interface ReturnTimeLine {

}

export interface OrderItemInfoResponse {
    orderItemId?: number,
    productId: number,
    productName: string,
    quantity: number,
    productPrice: number,
    discountAmount: number
}

export interface PictureReTurnProductResponse {
    id: number,
    returnItemId: number,
    mimeType: string,
    linkImg: string;
}


export type OrderPagingResponse = PagingResponse<OrderResponse>
export type ReturnInvoicePagingResponse = PagingResponse<ReturnInvoice>
export type ReturnRequestPagingResponse = PagingResponse<ReturnRequest>
export type OrderItemInfoPagingResponse = PagingResponse<OrderItemInfoResponse>
export type ReturnItemPagingResponse = PagingResponse<ReturnItem>