import { CustomerPagingResponse, Customer } from '@/interface/customer.interface'
import http from '@/libs/http'

class CustomerService {
    private basePath = '/api/admin/customers'

    async getAll() {
        const response = await http.get<CustomerPagingResponse>(this.basePath)
        return response
    }

    async getById(id: number) {
        const response = await http.get<Customer>(`${this.basePath}/${id}`)
        return response
    }

    async create(customer: Omit<Customer, 'id'>): Promise<Customer> {
        const response = await http.post<Customer>(`${this.basePath}`, customer)
        return response.payload
    }
}

const customerService = new CustomerService()
export default customerService
