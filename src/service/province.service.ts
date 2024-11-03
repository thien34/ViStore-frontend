import { Province } from '@/interface/address.interface'
import http from '@/libs/http'

class ProvinceService {
    private basePath = '/api/admin/provinces'

    async getAll() {
        const response = await http.get<Province[]>(`${this.basePath}`)
        return response
    }
}

const provinceService = new ProvinceService()
export default provinceService
