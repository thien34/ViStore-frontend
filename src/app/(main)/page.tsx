'use client'
import { useEffect, useState } from 'react'
import { SalesMetrics, SalesStatistics } from '@/interface/statistical.interface'
import { StatisticalService } from '@/service/statistical.service'
import { IoStatsChartOutline, IoCartOutline, IoCardOutline, IoGiftOutline } from 'react-icons/io5'
import SalesMetricsCard from '@/components/statistical/SalesMetricsCard'
import GrowthRatesCard from '@/components/statistical/GrowthRatesCard'
import DetailedStatisticsView from '@/components/statistical/DetailedStatisticsView'

const salesMetricEmty: SalesMetrics = {
    totalInvoices: 0,
    totalRevenue: 0,
    successfulOrders: 0,
    cancelledOrders: 0,
    totalProducts: 0
}

const Dashboard = () => {
    const [statistics, setStatistics] = useState<SalesStatistics>()

    useEffect(() => {
        const fetchData = async () => {
            const { payload: data } = await StatisticalService.getStatistics()
            setStatistics(data)
        }
        fetchData()
    }, [])

    return (
        <div className='card mb-5'>
            <div className='min-h-screen'>
                <div className='container mx-auto'>
                    <h1 className='text-3xl font-bold text-gray-800 mb-6 flex items-center'>
                        <IoStatsChartOutline className='mr-4 text-primary-500' size={36} />
                        Thống kê bán hàng
                    </h1>
                    <div className='mb-7'>
                        <div className='flex justify-between mb-4 gap-5'>
                            <SalesMetricsCard
                                title='Hôm nay'
                                icon={IoCartOutline}
                                data={statistics?.todaySales ?? salesMetricEmty}
                            />
                            <SalesMetricsCard
                                title='Tuần này'
                                icon={IoCardOutline}
                                data={statistics?.weekSales ?? salesMetricEmty}
                            />
                        </div>
                        <div className='flex justify-between gap-5'>
                            <SalesMetricsCard
                                title='Tháng này'
                                icon={IoGiftOutline}
                                data={statistics?.monthSales ?? salesMetricEmty}
                            />
                            <SalesMetricsCard
                                title='Năm nay'
                                icon={IoStatsChartOutline}
                                data={statistics?.yearSales ?? salesMetricEmty}
                            />
                        </div>
                    </div>
                    <div className=''>
                        <GrowthRatesCard statistics={statistics} />
                    </div>
                </div>
            </div>
            <DetailedStatisticsView />
        </div>
    )
}

export default Dashboard
