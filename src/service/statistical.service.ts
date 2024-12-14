import { SalesStatistics, SalesSummary } from '@/interface/statistical.interface'
import http from '@/libs/http'

export class StatisticalService {
    private static basePath = '/api/admin/sales/statistics'

    static async getStatistics() {
        const response = await http.get<SalesStatistics>(this.basePath)
        return response
    }

    static async getSalesSummary(startDate: string, endDate: string) {
        const response = await http.get<SalesSummary>(
            `${this.basePath}/summary?startDate=${startDate}&endDate=${endDate}`
        )
        return response
    }
}
