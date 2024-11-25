export interface OrderItemsResponse {
    id: number
    orderCode: string
    orderItemGuid: string
    quantity: number
    unitPrice: number
    priceTotal: number
    discountAmount: number
    originalProductCost: number
    attributeDescription: string
    productJson: string
    itemWeight: number
    deliveryStatus: number
    orderStatusHistoryResponses: OrderStatusHistoryResponse[]
    customerOrder: CustomerOrder | null
}

export interface OrderStatusHistoryResponse {
    id: number
    orderId: number
    status: number
    notes: string
    paidDate: string
}

export interface CustomerOrder {
    id: number
    customerName: string
    customerPhone: string
    addressOrder: string
    addressId: number
}
