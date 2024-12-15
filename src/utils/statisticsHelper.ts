import { differenceInDays, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { DetailedStatistics } from '@/interface/statistical.interface'

export const processRevenueData = (statistics: DetailedStatistics, startDate: Date, endDate: Date, filter: string) => {
    const daysDiff = differenceInDays(endDate, startDate)

    if (filter === 'thisYear' || daysDiff > 31) {
        // Xử lý theo tháng
        const months = eachMonthOfInterval({ start: startDate, end: endDate })
        return {
            labels: months.map((date) => format(date, 'MMMM', { locale: vi })),
            data: months.map(() => statistics.totalRevenue.doanhThu / months.length)
        }
    } else if (filter === 'thisMonth' || daysDiff > 7) {
        // Xử lý theo tuần
        const weeks = eachWeekOfInterval({ start: startDate, end: endDate })
        return {
            labels: weeks.map((_, index) => `Tuần ${index + 1}`),
            data: weeks.map(() => statistics.totalRevenue.doanhThu / weeks.length)
        }
    } else {
        // Xử lý theo ngày
        const days = eachDayOfInterval({ start: startDate, end: endDate })
        return {
            labels: days.map((date) => format(date, 'EEEE', { locale: vi })),
            data: days.map(() => statistics.totalRevenue.doanhThu / days.length)
        }
    }
}
