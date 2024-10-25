import { ProductTag, ProductTagsPagingResponse } from '@/interface/productTag.interface'
import http from '@/libs/http'

class ProductTagService {
    private basePath = '/api/admin/product-tags'

    async getAll() {
        const response = await http.get<ProductTagsPagingResponse>(this.basePath)
        return response
    }

    async create(productTag: Omit<ProductTag, 'id'>): Promise<ProductTag> {
        const response = await http.post<ProductTag>(`${this.basePath}`, productTag)
        return response.payload
    }

    async update(id: number, productTag: Omit<ProductTag, 'id'>): Promise<ProductTag> {
        const response = await http.put<ProductTag>(`${this.basePath}/${id}`, productTag)
        return response.payload
    }
}

const productTagService = new ProductTagService()
export default productTagService
