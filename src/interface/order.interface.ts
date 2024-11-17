export interface OrderRequest {
    customerId: number | null;
    orderGuid: string;
    addressType: number;
    orderId: string;
    pickupInStore: boolean;
    orderStatusId: number;
    paymentStatusId: number;
    paymentMethodId: number;
    orderSubtotal: number;
    orderSubtotalDiscount: number;
    orderShipping: number;
    orderDiscount: number;
    orderTotal: number;
    refundedAmount: number;
    paidDateUtc: string;
    orderItems: OrderItemRequest[];
    addressRequest: AddressRequest | null;
}

export interface OrderItemRequest {
    productId: number;
    orderItemGuid: string;
    quantity: number;
    unitPrice: number;
    priceTotal: number;
    discountAmount: number;
    originalProductCost: number;
    attributeDescription: string;
}

export interface AddressRequest {
    customerId: number | null;
    firstName: string;
    lastName: string;
    email: string;
    addressName: string;
    provinceId: string;
    districtId: string;
    wardId: string;
    phoneNumber: string;
}

export enum PaymentMethodType {
    Cash = 0,
    BankTransfer = 1
}
export enum PaymentStatusType {
    Pending = 0,
    Paid = 1,
    Cancelled = 2,
    CashOnDelivery = 3
}
