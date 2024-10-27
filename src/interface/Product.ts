import { ProductAttributeName } from './productAttribute.interface'

export interface ProductRequest {
    id?: number
    name: string
    sku?: string
    gtin?: string
    fullDescription?: string
    quantity?: number
    unitPrice?: number
    productCost?: number
    weight?: number
    published?: boolean
    deleted?: boolean
    categoryId?: number
    manufacturerId?: number
    attributes?: ProductAttribute[]
    image?: File
}

export interface ProductAttribute {
    id?: number
    productId?: number
    value?: string
}

export interface ProductAttributeValueResponse {
    id: number
    value: string
    imageUrl?: string
}
export interface ProductResponse {
    id: number
    name: string
    deleted: boolean
    categoryId: number
    manufacturerId: number
    weight: number
    description: string
    categoryName: number
    manufacturerName: number
}

export interface ProductResponseDetails {
    id: number
    name: string
    deleted: boolean
    categoryId: number
    manufacturerId: number
    sku: string
    price: number
    quantity: number
    productCost: number
    imageUrl: string
    gtin: string
    attributes: ProductAttributeName[]
}
