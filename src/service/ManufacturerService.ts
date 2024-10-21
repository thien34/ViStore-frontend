import { ManufacturerNameResponse } from '@/interface/Manufacture'

class ManufacturerService {
    static async getAllManufacturerNames(): Promise<ManufacturerNameResponse[]> {
        try {
            const response = await fetch('http://localhost:8080/api/admin/manufacturers/list-name')
            if (!response.ok) {
                throw new Error('Failed to fetch manufacturer names')
            }
            const result = await response.json()
            return result.data
        } catch (error) {
            console.error('Error fetching manufacturer names:', error)
            return []
        }
    }
}

export default ManufacturerService
