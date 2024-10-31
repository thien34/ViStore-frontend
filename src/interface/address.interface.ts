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

export interface AddressRequest {
    firstName: string
    lastName: string
    email: string
    company?: string
    districtId: string
    provinceId: string
    wardId: string
    addressName: string
    phoneNumber: string
    customerId: number
}

export type AddressPagingResponse = PagingResponse<AddressesResponse>

export interface AddressSearch extends PagingRequest {
    customerId: number
}

export interface Province {
    code: string
    fullName: string
}

export interface District {
    code: string
    fullName: string
}

export interface Ward {
    code: string
    fullName: string
}
