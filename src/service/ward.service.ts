import { Ward } from '@/interface/address.interface'
import http from '@/libs/http'

class WardService {
    private basePath = '/api/admin/wards'

    async getAll(districtCode: string) {
        const response = await http.get<Ward[]>(`${this.basePath}/${districtCode}`)
        return response
    }
}

const wardService = new WardService()
export default wardService
