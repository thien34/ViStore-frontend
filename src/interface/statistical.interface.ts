export interface SalesMetrics {
    totalInvoices: number
    totalRevenue: number
    successfulOrders: number
    cancelledOrders: number
    totalProducts: number
}

export interface GrowthRate {
    revenueGrowthRate: number
    orderGrowthRate: number
    productGrowthRate: number
}

export interface SalesStatistics {
    todaySales: SalesMetrics
    weekSales: SalesMetrics
    monthSales: SalesMetrics
    yearSales: SalesMetrics
    growthRate: {
        todayGrowthRate: GrowthRate
        weekGrowthRate: GrowthRate
        monthGrowthRate: GrowthRate
        yearGrowthRate: GrowthRate
    }
}

export interface SalesSummary {
    dailySales: DailySales[]
    totalRevenue: number
    totalOrders: number
    averageOrderValue: number
}

export interface DailySales {
    date: string
    revenue: number
    orders: number
    products: number
}

export type DateRangeType = 'day' | 'week' | 'month' | 'year' | 'custom'
