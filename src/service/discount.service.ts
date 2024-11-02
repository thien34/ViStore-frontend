import { Promotion, PromotionsPagingResponse } from '@/interface/discount.interface';
import http from '@/libs/http';
class DiscountService {
    private basePath = '/api/admin/discounts';
    async getAll() {
        const response = await http.get<PromotionsPagingResponse>(this.basePath);
        return response;
    }
    async createDiscount(discountData: Promotion) {
        const response = await fetch('http://localhost:8080/api/admin/discounts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(discountData),
        });

        if (!response.ok) {
            const errorResponse = await response.json();
            throw new Error(`Failed to create discount: ${errorResponse.message || 'Unknown error'}`);
        }

        return response.json();
    }
}

const discountService = new DiscountService();
export default discountService;
