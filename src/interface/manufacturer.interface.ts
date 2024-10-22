import { PagingRequest, PagingResponse } from './paging.interface'

export interface Manufacturer {
    id?: number
    name: string
    description: string
}

export interface ManufacturerName {
    id: number
    name: string
}

export type ManufacturerPagingResponse = PagingResponse<Manufacturer>

export interface ManufacturerSearch extends PagingRequest {
    name?: string
}
