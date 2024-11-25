import { OrderFilter, OrderRequest, OrderResponse } from '@/interface/order.interface'
import { OrderItemsResponse, OrderStatusHistoryResponse } from '@/interface/orderItem.interface'
import http from '@/libs/http'

class OrderService {
    private static basePath = '/api/admin/orders'

    static async createOrder(order: OrderRequest) {
        return await http.post<OrderRequest>(`${this.basePath}`, order)
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
}

export default OrderService
