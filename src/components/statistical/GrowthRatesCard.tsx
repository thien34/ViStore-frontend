'use client'
import { IoTrendingUpOutline, IoTrendingDownOutline } from 'react-icons/io5'
import { Panel } from 'primereact/panel'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { SalesStatistics } from '@/interface/statistical.interface'

interface GrowthRatesProps {
    statistics?: SalesStatistics
}

const GrowthRatesCard = ({ statistics }: GrowthRatesProps) => {
    const GrowthIndicator = ({ rate }: { rate: number }) => {
        const isPositive = rate >= 0
        return (
            <div className='flex items-center'>
                {isPositive ? (
                    <IoTrendingUpOutline className='text-emerald-500 mr-2' size={24} />
                ) : (
                    <IoTrendingDownOutline className='text-rose-500 mr-2' size={24} />
                )}
                <span className={`font-bold text-base ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {Math.abs(rate).toFixed(2)}%
                </span>
            </div>
        )
    }

    const growthRateData = statistics?.growthRate
        ? [
              { period: 'Hôm nay', ...statistics.growthRate.todayGrowthRate },
              { period: 'Tuần này', ...statistics.growthRate.weekGrowthRate },
              { period: 'Tháng này', ...statistics.growthRate.monthGrowthRate },
              { period: 'Năm nay', ...statistics.growthRate.yearGrowthRate }
          ]
        : []

    return (
        <Panel
            header={
                <div className='flex items-center p-2'>
                    <IoTrendingUpOutline className='mr-3 text-primary-600' size={28} />
                    <span className='text-xl font-bold text-gray-800'>Bảng thống kê tăng trưởng cửa hàng</span>
                </div>
            }
            className='bg-white shadow-lg rounded-xl border border-gray-100'
        >
            <DataTable
                value={growthRateData}
                showGridlines
                className='text-base'
                tableClassName='border-separate border-spacing-0 rounded-xl overflow-hidden'
            >
                <Column
                    field='period'
                    header='Thời gian'
                    className='bg-gray-50 font-bold text-gray-700 p-4'
                    headerClassName='bg-gray-100 text-gray-800 font-bold p-4'
                />
                <Column
                    field='revenueGrowthRate'
                    header='Tăng trưởng doanh thu'
                    body={(rowData) => <GrowthIndicator rate={rowData.revenueGrowthRate} />}
                    className='p-4'
                    headerClassName='bg-gray-100 text-gray-800 font-bold p-4'
                />
                <Column
                    field='orderGrowthRate'
                    header='Tăng trưởng đơn hàng'
                    body={(rowData) => <GrowthIndicator rate={rowData.orderGrowthRate} />}
                    className='p-4'
                    headerClassName='bg-gray-100 text-gray-800 font-bold p-4'
                />
                <Column
                    field='productGrowthRate'
                    header='Tăng trưởng sản phẩm'
                    body={(rowData) => <GrowthIndicator rate={rowData.productGrowthRate} />}
                    className='p-4'
                    headerClassName='bg-gray-100 text-gray-800 font-bold p-4'
                />
            </DataTable>
        </Panel>
    )
}

export default GrowthRatesCard
