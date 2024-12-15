import React from 'react'
import { Card } from 'primereact/card'
import { FaDollarSign, FaBoxOpen, FaCheckCircle, FaTimesCircle } from 'react-icons/fa'
import { formatCurrency } from '@/utils/format'
import { TotalRevenue } from '@/interface/statistical.interface'

const RevenueOverview = ({ totalRevenue }: { totalRevenue: TotalRevenue }) => {
    return (
        <Card title='Tổng quan doanh thu' className='p-4'>
            <div className='space-y-2'>
                <p className='text-lg flex items-center'>
                    <FaDollarSign className='mr-2 text-green-600' /> Doanh thu:
                    <span className='font-bold text-blue-700 ml-2'>{formatCurrency(totalRevenue.doanhThu)}</span>
                </p>
                <p className='text-lg flex items-center'>
                    <FaBoxOpen className='mr-2 text-yellow-600' /> Số lượng sản phẩm bán được:
                    <span className='font-bold ml-2'>{totalRevenue.soLuongSanPhamBanDuoc.toLocaleString()}</span>
                </p>
                <p className='text-lg flex items-center'>
                    <FaCheckCircle className='mr-2 text-green-700' /> Đơn hàng thành công:
                    <span className='font-bold text-green-700 ml-2'>
                        {totalRevenue.donHangThanhCong.toLocaleString()}
                    </span>
                </p>
                <p className='text-lg flex items-center'>
                    <FaTimesCircle className='mr-2 text-red-700' /> Đơn hủy:
                    <span className='font-bold text-red-700 ml-2'>{totalRevenue.donHuy.toLocaleString()}</span>
                </p>
            </div>
        </Card>
    )
}

export default RevenueOverview
