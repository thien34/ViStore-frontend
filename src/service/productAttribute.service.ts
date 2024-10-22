import {
    ProductAttribute,
    ProductAttributeName,
    ProductAttributePagingResponse
} from '@/interface/productAttribute.interface'
import http from '@/libs/http'

class ProductAttributeService {
    private basePath = '/api/admin/product-attributes'

    async getAll() {
        const response = await http.get<ProductAttributePagingResponse>(this.basePath)
        return response
    }

    async getListName() {
        const response = await http.get<ProductAttributeName[]>(`${this.basePath}/list-name`)
        return response
    }

    async getById(id: number): Promise<ProductAttribute> {
        const response = await http.get<ProductAttribute>(`${this.basePath}/${id}`)
        return response.payload
    }

    async create(productAttribute: Omit<ProductAttribute, 'id'>): Promise<ProductAttribute> {
        const response = await http.post<ProductAttribute>(`${this.basePath}`, productAttribute)
        return response.payload
    }

    async update(id: number, productAttribute: Omit<ProductAttribute, 'id'>): Promise<ProductAttribute> {
        const response = await http.put<ProductAttribute>(`${this.basePath}/${id}`, productAttribute)
        return response.payload
    }

    async delete(id: number): Promise<void> {
        await http.delete<void>(`${this.basePath}/${id}`)
    }
}

const productAttributeService = new ProductAttributeService()
export default productAttributeService
