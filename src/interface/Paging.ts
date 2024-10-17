/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Paging {
    totalItems: number
    totalPages: number
    items: any[]
}

export interface PagingResponse extends Response {
    data: Paging
}

export interface PagingRequest {
    start: number
    length: number
    sort?: string
    orderBy?: number
    filters?: any
    keywords?: string
}

export interface FabricFilterPagingRequest extends PagingRequest {
    manufacturerId?: string
}
