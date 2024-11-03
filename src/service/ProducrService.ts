import { ProductRequest, ProductResponse, ProductResponseDetails } from '@/interface/Product'

class ProductService {
    static async addProducts(productsData: ProductRequest[], uploadedFiles: File[][]) {
        const formData = new FormData()

        formData.append('products', JSON.stringify(productsData))

        uploadedFiles.forEach((files) => {
            files.forEach((file) => {
                formData.append('images', file, file.name)
            })
        })

        const response = await fetch('http://localhost:8080/api/admin/products', {
            method: 'POST',
            body: formData
        })

        if (!response.ok) {
            const errorResponse = await response.json()
            throw new Error(`Failed to add products: ${errorResponse.message || 'Unknown error'}`)
        }

        return response.json()
    }

    static async getAllProducts(): Promise<ProductResponse[]> {
        const response = await fetch('http://localhost:8080/api/admin/products', { cache: 'no-store' })

        if (!response.ok) {
            const errorResponse = await response.json()
            throw new Error(`Failed to get products: ${errorResponse.message || 'Unknown error'}`)
        }

        const result = await response.json()
        return result.data
    }

    static async getProductById(id: number): Promise<ProductResponse> {
        const response = await fetch(`http://localhost:8080/api/admin/products/${id}`, { cache: 'no-store' })

        if (!response.ok) {
            const errorResponse = await response.json()
            throw new Error(`Failed to get product: ${errorResponse.message || 'Unknown error'}`)
        }

        const result = await response.json()
        return result.data
    }

    static async getProductsByParentId(parentId: number): Promise<ProductResponseDetails[]> {
        const response = await fetch(`http://localhost:8080/api/admin/products/parent/${parentId}`, {
            cache: 'no-store'
        })

        if (!response.ok) {
            const errorResponse = await response.json()
            throw new Error(`Failed to get products by parent ID: ${errorResponse.message || 'Unknown error'}`)
        }

        const result = await response.json()
        return result.data
    }

    static async getProductDetails(id: number): Promise<ProductResponseDetails> {
        const response = await fetch(`http://localhost:8080/api/admin/products/details/${id}`, { cache: 'no-store' })

        if (!response.ok) {
            const errorResponse = await response.json()
            throw new Error(`Failed to get product details: ${errorResponse.message || 'Unknown error'}`)
        }

        const result = await response.json()
        return result.data
    }

    static async updateProduct(id: number, productData: Partial<ProductRequest>) {
        const response = await fetch(`http://localhost:8080/api/admin/products/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData)
        })

        if (!response.ok) {
            const errorResponse = await response.json()
            throw new Error(`Failed to update product: ${errorResponse.message || 'Unknown error'}`)
        }

        return response.json()
    }
}

export default ProductService
