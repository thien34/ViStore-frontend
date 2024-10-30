import { AddressPagingResponse } from '@/interface/address.interface'
import http from '@/libs/http'
import { Address } from 'cluster'

class AddressService {
    private basePath = '/api/admin/addresses'

    async getAll(customerId: number) {
        const response = await http.get<AddressPagingResponse>(`${this.basePath}?customerId=${customerId}`)
        return response
    }

    async getById(id: number): Promise<Address> {
        const response = await http.get<Address>(`${this.basePath}/${id}`)
        return response.payload
    }

    async create(address: Omit<Address, 'id'>): Promise<Address> {
        const response = await http.post<Address>(`${this.basePath}`, address)
        return response.payload
    }

    async update(id: number, address: Omit<Address, 'id'>): Promise<Address> {
        const response = await http.put<Address>(`${this.basePath}/${id}`, address)
        return response.payload
    }

    async delete(id: number): Promise<void> {
        await http.delete<void>(`${this.basePath}/${id}`)
    }
}

const addressService = new AddressService()
export default addressService
