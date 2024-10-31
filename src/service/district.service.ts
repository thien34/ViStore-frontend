import { District } from '@/interface/address.interface'
import http from '@/libs/http'

class DistrictService {
    private basePath = '/api/admin/districts'

    async getAll(provinceCode: string) {
        const response = await http.get<District[]>(`${this.basePath}/${provinceCode}`)
        return response
    }
}

const districtService = new DistrictService()
export default districtService
