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
    createdBy: string
    updatedBy: string
    createdDate: string
    updatedDate: string
}

export interface CustomerOrder {
    id: number
    customerName: string
    customerPhone: string
    addressOrder: string
    addressId: number
}

export interface CustomerOrderResponse {
    id: number
    customerId: number
    billId: string;
    firstName: string;
    lastName: string;
    phoneNumber: string
    delivery: string
    orderStatusType: number
    paymentStatusType: number
    paymentMethod: number
}

