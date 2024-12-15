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

export interface DetailedStatistics {
    totalRevenue: TotalRevenue
    bestSellingProducts: BestSellingProduct[]
    outOfStockProducts: OutOfStockProduct[]
    orderStatusChart: OrderStatus[]
}

export interface TotalRevenue {
    doanhThu: number
    soLuongSanPhamBanDuoc: number
    donHangThanhCong: number
    donHuy: number
}

export interface OutOfStockProduct {
    tenSanPham: string
    soLuong: number
    giaTien: number
    anh: string
}

export interface BestSellingProduct {
    productId: number
    productName: string
    totalQuantitySold: number
    totalRevenue: number
}

export interface OrderStatus {
    status: string
    count: number
    percent: number
}
