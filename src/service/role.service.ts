import { Role, RoleName, RolePagingResponse } from '@/interface/role.interface'
import http from '@/libs/http'

class RoleService {
    private basePath = '/api/admin/customer-roles'

    async getAll() {
        const response = await http.get<RolePagingResponse>(this.basePath)
        return response
    }

    async getListName() {
        const response = await http.get<RoleName[]>(`${this.basePath}/list-name`)
        return response
    }

    async getById(id: number): Promise<Role> {
        const response = await http.get<Role>(`${this.basePath}/${id}`)
        return response.payload
    }

    async create(role: Omit<Role, 'id'>): Promise<Role> {
        const response = await http.post<Role>(`${this.basePath}`, role)
        return response.payload
    }

    async update(id: number, role: Omit<Role, 'id'>): Promise<Role> {
        const response = await http.put<Role>(`${this.basePath}/${id}`, role)
        return response.payload
    }

    async delete(id: number): Promise<void> {
        await http.delete<void>(`${this.basePath}/${id}`)
    }
}

const roleService = new RoleService()
export default roleService
