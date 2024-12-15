'use client'
import { SalesMetrics } from '@/interface/statistical.interface'
import { formatCurrency } from '@/utils/format'
import { Card } from 'primereact/card'
import {
    IoReceiptOutline,
    IoWalletOutline,
    IoCheckmarkCircleOutline,
    IoCloseCircleOutline,
    IoBasketOutline
} from 'react-icons/io5'

const SalesMetricsCard = ({
    title,
    data,
    icon: Icon
}: {
    title: string
    data: SalesMetrics
    icon: React.ElementType
}) => {
    return (
        <Card
            title={
                <div className='flex items-center gap-2 mb-2'>
                    <Icon className='text-primary-500' size={28} />
                    <span className='text-xl font-semibold text-gray-700'>{title}</span>
                </div>
            }
            className='bg-white shadow-md hover:shadow-xl transition-all duration-300 rounded-xl border-l-4 border-primary-500 w-full'
        >
            <div className='flex flex-col space-y-4'>
                {/* Main Metrics */}
                <div className='flex justify-between items-center border-b pb-3'>
                    <div className='flex items-center gap-3'>
                        <IoReceiptOutline size={24} className='text-primary-600' />
                        <div>
                            <p className='text-base text-gray-500'>Tổng đơn hàng</p>
                            <p className='text-2xl font-bold text-gray-800'>{data?.totalInvoices || 0}</p>
                        </div>
                    </div>
                    <div className='flex items-center gap-3'>
                        <IoWalletOutline size={24} className='text-primary-600' />
                        <div>
                            <p className='text-base text-gray-500'>Doanh thu</p>
                            <p className='text-2xl font-bold text-primary-600'>
                                {formatCurrency(data?.totalRevenue || 0)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Secondary Metrics */}
                <div className='flex justify-between items-center'>
                    <div className='flex items-center gap-2'>
                        <IoCheckmarkCircleOutline size={20} className='text-green-600' />
                        <div>
                            <p className='text-base text-gray-500'>Đơn thành công</p>
                            <p className='text-lg font-semibold text-green-700'>{data?.successfulOrders || 0}</p>
                        </div>
                    </div>
                    <div className='flex items-center gap-2'>
                        <IoCloseCircleOutline size={20} className='text-rose-600' />
                        <div>
                            <p className='text-base text-gray-500'>Đơn hủy</p>
                            <p className='text-lg font-semibold text-rose-700'>{data?.cancelledOrders || 0}</p>
                        </div>
                    </div>
                    <div className='flex items-center gap-2'>
                        <IoBasketOutline size={20} className='text-blue-600' />
                        <div>
                            <p className='text-base text-gray-500'>Sản phẩm</p>
                            <p className='text-lg font-semibold text-blue-700'>{data?.totalProducts || 0}</p>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    )
}

export default SalesMetricsCard
