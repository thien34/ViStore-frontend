import { PagingRequest, PagingResponse } from './paging.interface'

export interface ProductAttribute {
    id?: number
    name: string
    description: string
}

export interface ProductAttributeName {
    id: number
    name: string
    value?: string
}

export type ProductAttributePagingResponse = PagingResponse<ProductAttribute>

export interface ProductAttributeSearch extends PagingRequest {
    name?: string
}
