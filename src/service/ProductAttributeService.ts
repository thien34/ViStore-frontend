import { Attribute } from '@/interface/ProductAttribute'

class ProductAttributeService {
    static async getAllProductAttributeNames(): Promise<Attribute[]> {
        try {
            const response = await fetch('http://localhost:8080/api/admin/product-attributes/list-name')
            if (!response.ok) {
                throw new Error('Failed to fetch product-attributes names')
            }
            const result = await response.json()
            return result.data
        } catch (error) {
            console.error('Error fetching product-attributes names:', error)
            return []
        }
    }
}

export default ProductAttributeService
