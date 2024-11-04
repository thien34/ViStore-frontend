import { PagingRequest, PagingResponse } from './paging.interface'

export interface Customer {
    id?: number | null
    customerGuid?: string
    email: string
    firstName: string
    lastName: string
    gender?: string
    dateOfBirth?: Date | null
    customerRoles: number[]
    active?: boolean
}
export type CustomerPagingResponse = PagingResponse<Customer>

export interface CustomerSearch extends PagingRequest {
    name?: string
}
