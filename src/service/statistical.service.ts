import { DetailedStatistics, SalesStatistics } from '@/interface/statistical.interface'
import http from '@/libs/http'

export class StatisticalService {
    private static basePath = '/api/admin/sales'

    static async getStatistics() {
        const response = await http.get<SalesStatistics>(`${this.basePath}/statistics`)
        return response
    }

    static async getDetailedStatistics(startDate: string, endDate: string) {
        const response = await http.get<DetailedStatistics>(
            `${this.basePath}/summary?startDate=${startDate}&endDate=${endDate}`
        )
        return response
    }
}
