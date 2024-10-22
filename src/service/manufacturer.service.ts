import { Manufacturer, ManufacturerName, ManufacturerPagingResponse } from '@/interface/manufacturer.interface'
import http from '@/libs/http'

class ManufacturerService {
    private basePath = '/api/admin/manufacturers'

    async getAll() {
        const response = await http.get<ManufacturerPagingResponse>(this.basePath)
        return response
    }

    async getListName() {
        const response = await http.get<ManufacturerName[]>(`${this.basePath}/list-name`)
        return response
    }

    async getById(id: number): Promise<Manufacturer> {
        const response = await http.get<Manufacturer>(`${this.basePath}/${id}`)
        return response.payload
    }

    async create(manufacturer: Omit<Manufacturer, 'id'>): Promise<Manufacturer> {
        const response = await http.post<Manufacturer>(`${this.basePath}`, manufacturer)
        return response.payload
    }

    async update(id: number, manufacturer: Omit<Manufacturer, 'id'>): Promise<Manufacturer> {
        const response = await http.put<Manufacturer>(`${this.basePath}/${id}`, manufacturer)
        return response.payload
    }

    async delete(id: number): Promise<void> {
        await http.delete<void>(`${this.basePath}/${id}`)
    }
}

const manufacturerService = new ManufacturerService()
export default manufacturerService
