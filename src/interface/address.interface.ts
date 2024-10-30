import { PagingRequest, PagingResponse } from './paging.interface'

export interface AddressesResponse {
    id?: number
    firstName: string
    lastName: string
    email: string
    company: string
    addressDetail: string
    phoneNumber: string
}

export type AddressPagingResponse = PagingResponse<AddressesResponse>

export interface AddressSearch extends PagingRequest {
    customerId: number
}
