import { CartResponse, ShoppingCart } from '@/interface/cart.interface'
import http from '@/libs/http'

class CartService {
    private static basePath = '/api/admin/carts'

    static async addProductToCart(cart: ShoppingCart, parentId: string) {
        return await http.post<ShoppingCart>(`${this.basePath}/${parentId}`, cart)
    }

    static async addBill(billId: string) {
        return await http.post<void>(`${this.basePath}/add-bill/${billId}`, {})
    }

    static async getCart(billId: string): Promise<CartResponse[]> {
        const response = await http.get<CartResponse[]>(`${this.basePath}/${billId}`)

        return response.payload
    }

    static async getBills(): Promise<string[]> {
        const response = await http.get<string[]>(`${this.basePath}/get-bills`)
        return response.payload
    }

    static async deleteBill(billId: string): Promise<void> {
        const response = await http.delete<void>(`${this.basePath}/${billId}`)
        return response.payload
    }

    static async deleteItemInBill(billId: string): Promise<void> {
        const response = await http.delete<void>(`${this.basePath}/delete-item-in-bill/${billId}`)
        return response.payload
    }

    static async updateCartQuantity(id: number, newQuantity: number): Promise<void> {
        const response = await http.put<void>(`${this.basePath}/updateQuantity/${id}?quantity=${newQuantity}`, {})
        return response.payload
    }
}

export default CartService
