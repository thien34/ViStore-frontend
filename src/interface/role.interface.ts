import { PagingRequest, PagingResponse } from './paging.interface'

export interface Role {
    id?: number
    name: string
    active: boolean
}

export interface RoleName {
    id: number
    name: string
}

export type RolePagingResponse = PagingResponse<Role>

export interface RoleSearch extends PagingRequest {
    name?: string
    active?: boolean
}
