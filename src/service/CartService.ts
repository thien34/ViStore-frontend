import { CartResponse, ShoppingCart } from "@/interface/Cart";
import http from '@/libs/http';
class CartService {
    private static basePath = '/api/admin/carts';

    static async addProductToCart(cart: ShoppingCart, parentId: string) {
        const response = await http.post<ShoppingCart>(`${this.basePath}/${parentId}`, cart);
        return response;
    }
    static async addBill(billId: string) {
        const response = await http.post<void>(`${this.basePath}/add-bill/${billId}`, {});
        return response;
    }

    static async getCart(billId: string): Promise<CartResponse[]> {
        const response = await http.get<CartResponse[]>(`${this.basePath}/${billId}`);

        return response.payload
    }

    static async getBills(): Promise<string[]> {
        const response = await http.get<string[]>(`${this.basePath}/get-bills`);
        return response.payload;
    }

    static async deleteBill(billId: string): Promise<void> {
        const response = await http.delete<void>(`${this.basePath}/${billId}`);
        return response.payload
    }
}

export default CartService
