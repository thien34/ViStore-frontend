import { InvoiceData, OrderFilter, OrderItemRequest, OrderRequest, OrderResponse, OrderStatusType } from '@/interface/order.interface'
import { OrderItemsResponse, OrderStatusHistoryResponse, CustomerOrderResponse } from '@/interface/orderItem.interface'
import http from '@/libs/http'

class OrderService {
    private static basePath = '/api/admin/orders'

    static async createOrder(order: OrderRequest) {
        return await http.post<OrderRequest>(`${this.basePath}`, order)
    }
    static async addProductToOrder(orderId: string, order: OrderItemRequest) {
        return await http.put(`${this.basePath}/addMoreProduct/${orderId}`, order)
    }
    static async getOrders(filter: OrderFilter) {
        const params = new URLSearchParams(filter as Record<string, string>)
        return await http.get<OrderResponse[]>(`${this.basePath}?${params}`)
    }
    static async getOrderItems(orderId: string) {
        return await http.get<OrderItemsResponse[]>(`${this.basePath}/${orderId}/order-items`)
    }
    static async getOrderStatusHistory(orderId: string) {
        return await http.get<OrderStatusHistoryResponse[]>(`${this.basePath}/${orderId}/order-status-history`)
    }
    static async updateOrderItem(orderId: number, quantity: number) {
        return await http.put(`${this.basePath}/updateQuantity/${orderId}?quantity=${quantity}`, {})
    }
    static async changeStatusOrder(orderId: number, reason: string, status: OrderStatusType) {
        return await http.get(`${this.basePath}/change-status/${status}?reason=${reason}&orderId=${orderId}`, {})
    }
    static async getCustomerOrder(orderId: number) {
        return await http.get<CustomerOrderResponse>(`${this.basePath}/customer/order/${orderId}`)
    }
    static async getDiscountsByOrderId(orderId: number) {
        return await http.get<string[]>(`${this.basePath}/discounts/${orderId}`)
    }
    static async cancelOrder(orderId: number, reason: string) {
        return await http.get(`${this.basePath}/cancel-order/${orderId}?note=${reason}`, {})
    }
    static async getInvoiceData(orderId: number) {
        return await http.get<InvoiceData>(`${this.basePath}/invoice/${orderId}`, {})
    }
}

export default OrderService
