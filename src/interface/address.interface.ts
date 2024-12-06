import { PagingRequest, PagingResponse } from './paging.interface'

export interface AddressesResponse {
    id?: number
    firstName: string
    lastName: string
    email: string
    company: string
    addressDetail: string
    phoneNumber: string
    note?: string
}

export interface AddressRequest {
    id?: number
    firstName: string
    lastName: string
    email: string
    company?: string
    districtId: string
    provinceId: string
    wardId: string
    addressName: string
    phoneNumber: string
    customerId?: number
}

export interface Address {
    provinceId: string
    districtId: string
    wardId: string
    address: string
}

export type AddressPagingResponse = PagingResponse<AddressesResponse>

export interface AddressSearch extends PagingRequest {
    customerId: number
}

export interface Province {
    code: string
    name: string
}

export interface District {
    code: string
    name: string
}

export interface Ward {
    code: string
    name: string
}

export interface ShippingFee {
    province: string
    district: string
    weight: number
    address: string
}
