/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import React, { useState, useEffect } from 'react'
import {
    startOfDay,
    endOfDay,
    startOfMonth,
    endOfMonth,
    startOfYear,
    endOfYear,
    startOfISOWeek,
    endOfISOWeek
} from 'date-fns'

import { Card } from 'primereact/card'
import { RadioButton } from 'primereact/radiobutton'
import { Calendar } from 'primereact/calendar'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Divider } from 'primereact/divider'
import { Skeleton } from 'primereact/skeleton'
import {
    FaCalendarDay,
    FaCalendarWeek,
    FaCalendarAlt,
    FaCalendarMinus,
    FaDollarSign,
    FaBoxOpen,
    FaCheckCircle,
    FaTimesCircle
} from 'react-icons/fa'
import { DetailedStatistics } from '@/interface/statistical.interface'
import { StatisticalService } from '@/service/statistical.service'
import { formatCurrency } from '@/utils/format'
import { Pie } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import Image from 'next/image'
ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels)

const DetailedStatisticsView = () => {
    const [detailedStatistics, setDetailedStatistics] = useState<DetailedStatistics | null>(null)
    const [filter, setFilter] = useState('today')
    const [customStartDate, setCustomStartDate] = useState<Date | null>(null)
    const [customEndDate, setCustomEndDate] = useState<Date | null>(null)

    const filterOptions = [
        { value: 'today', label: 'Hôm nay', icon: <FaCalendarDay className='text-blue-600' /> },
        { value: 'thisWeek', label: 'Tuần này', icon: <FaCalendarWeek className='text-green-600' /> },
        { value: 'thisMonth', label: 'Tháng này', icon: <FaCalendarMinus className='text-yellow-600' /> },
        { value: 'thisYear', label: 'Năm này', icon: <FaCalendarAlt className='text-red-600' /> },
        { value: 'custom', label: 'Tùy chọn', icon: <FaCalendarAlt className='text-purple-600' /> }
    ]

    const getDateRange = React.useCallback(() => {
        const today = new Date()
        switch (filter) {
            case 'today':
                return {
                    startDate: startOfDay(today),
                    endDate: endOfDay(today)
                }
            case 'thisWeek':
                return {
                    startDate: startOfISOWeek(today),
                    endDate: endOfISOWeek(today)
                }
            case 'thisMonth':
                return {
                    startDate: startOfMonth(today),
                    endDate: endOfMonth(today)
                }
            case 'thisYear':
                return {
                    startDate: startOfYear(today),
                    endDate: endOfYear(today)
                }
            case 'custom':
                return {
                    startDate: customStartDate ? startOfDay(customStartDate) : null,
                    endDate: customEndDate ? endOfDay(customEndDate) : null
                }
            default:
                return {
                    startDate: startOfDay(today),
                    endDate: endOfDay(today)
                }
        }
    }, [filter, customStartDate, customEndDate])

    useEffect(() => {
        const { startDate, endDate } = getDateRange()
        setCustomStartDate(startDate)
        setCustomEndDate(endDate)
    }, [filter])

    useEffect(() => {
        const fetchDetailedStatistics = async () => {
            const { startDate, endDate } = getDateRange()
            if (!startDate || !endDate) return

            const formattedStartDate = startDate.toISOString()
            const formattedEndDate = endDate.toISOString()

            try {
                const { payload: response } = await StatisticalService.getDetailedStatistics(
                    formattedStartDate,
                    formattedEndDate
                )
                setDetailedStatistics(response)
            } catch (error) {
                console.error('Error fetching detailed statistics:', error)
            }
        }

        fetchDetailedStatistics()
    }, [filter, customStartDate, customEndDate])

    // Loading state
    if (!detailedStatistics) {
        return (
            <div className='container mx-auto p-6'>
                <div className='grid md:grid-cols-2 gap-6'>
                    {[1, 2, 3, 4].map((item) => (
                        <Card key={item} className='mb-4'>
                            <Skeleton height='200px' />
                        </Card>
                    ))}
                </div>
            </div>
        )
    }

    const { totalRevenue, bestSellingProducts, outOfStockProducts, orderStatusChart } = detailedStatistics

    const getOrderStatusChartData = () => {
        return {
            labels: orderStatusChart.map((status) => status.status),
            datasets: [
                {
                    data: orderStatusChart.map((status) => status.count),
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
                    hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40']
                }
            ]
        }
    }

    interface PieOptions {
        plugins: {
            datalabels: {
                color: string
                formatter: (value: number) => string
                font: {
                    weight: 'bold' | 'normal' | 'bolder' | 'lighter' | number
                }
            }
            legend: {
                position: 'bottom'
            }
        }
    }

    const pieOptions: PieOptions = {
        plugins: {
            datalabels: {
                color: '#fff',
                formatter: (value) => value.toLocaleString(),
                font: {
                    weight: 'bold'
                }
            },
            legend: {
                position: 'bottom'
            }
        }
    }

    return (
        <div className='container mx-auto mt-6'>
            <h2 className='text-2xl font-bold mb-4'>Bộ lọc</h2>
            <div className='card flex flex-wrap gap-4 mb-4 justify-between'>
                {filterOptions.map((option) => (
                    <div key={option.value} className='flex align-items-center'>
                        <RadioButton
                            inputId={option.value}
                            name='filter'
                            value={option.value}
                            onChange={() => setFilter(option.value)}
                            checked={filter === option.value}
                        />
                        <label htmlFor={option.value} className='ml-2 mr-4 flex align-items-center gap-1'>
                            {option.icon} <span className='font-semibold'>{option.label}</span>
                        </label>
                    </div>
                ))}
            </div>

            {filter === 'custom' && (
                <div className='flex gap-4'>
                    <div>
                        <label className='block mb-2 font-semibold'>Ngày bắt đầu</label>
                        <Calendar
                            value={customStartDate}
                            onChange={(e) => setCustomStartDate(e.value || null)}
                            dateFormat='dd/mm/yy'
                        />
                    </div>
                    <div>
                        <label className='block mb-2 font-semibold'>Ngày kết thúc</label>
                        <Calendar
                            value={customEndDate}
                            onChange={(e) => setCustomEndDate(e.value || null)}
                            dateFormat='dd/mm/yy'
                        />
                    </div>
                </div>
            )}

            <Divider />

            <div className='grid md:grid-cols-2 gap-6'>
                <Card title='Tổng quan doanh thu' className='p-4'>
                    <div className='space-y-2'>
                        <p className='text-lg flex items-center'>
                            <FaDollarSign className='mr-2 text-green-600' /> Doanh thu:
                            <span className='font-bold text-blue-700 ml-2'>
                                {formatCurrency(totalRevenue.doanhThu)}
                            </span>
                        </p>
                        <p className='text-lg flex items-center'>
                            <FaBoxOpen className='mr-2 text-yellow-600' /> Số lượng sản phẩm bán được:
                            <span className='font-bold ml-2'>
                                {totalRevenue.soLuongSanPhamBanDuoc.toLocaleString()}
                            </span>
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
                <Card title='Biểu đồ trạng thái đơn hàng' className='p-4'>
                    <Pie data={getOrderStatusChartData()} options={pieOptions} />
                </Card>
            </div>

            <Divider />

            <Card title='Sản phẩm bán chạy' className='mb-6 p-4'>
                <DataTable
                    value={bestSellingProducts}
                    dataKey='id'
                    removableSort
                    resizableColumns
                    showGridlines
                    paginator
                    rows={5}
                    rowsPerPageOptions={[5, 10, 25]}
                    paginatorTemplate='FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'
                    tableStyle={{ minWidth: '50rem' }}
                    currentPageReportTemplate='Hiển thị từ {first} đến {last} trong tổng số {totalRecords} sản phẩm'
                >
                    <Column field='productName' header='Tên sản phẩm' />
                    <Column
                        field='totalQuantitySold'
                        header='Tổng số lượng bán'
                        body={(rowData) => rowData.totalQuantitySold.toLocaleString()}
                    />
                    <Column
                        field='totalRevenue'
                        header='Tổng doanh thu'
                        body={(rowData) => `${formatCurrency(rowData.totalRevenue)}`}
                    />
                </DataTable>
            </Card>

            <Card title='Sản phẩm hết hàng' className='p-4'>
                <DataTable
                    removableSort
                    resizableColumns
                    showGridlines
                    paginator
                    rows={5}
                    rowsPerPageOptions={[5, 10, 25]}
                    paginatorTemplate='FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'
                    currentPageReportTemplate='Hiển thị từ {first} đến {last} trong tổng số {totalRecords} sản phẩm'
                    value={outOfStockProducts}
                >
                    <Column
                        header='Ảnh'
                        field='anh'
                        align={'center'}
                        bodyStyle={{ width: '80px', textAlign: 'center' }}
                        body={(rowData) => (
                            <Image
                                src={rowData.anh || '/demo/images/default/—Pngtree—sneakers_3989154.png'}
                                width={50}
                                height={50}
                                className='rounded-lg'
                                alt={rowData.name ?? 'Product Image'}
                                onError={(e) =>
                                    ((e.target as HTMLImageElement).src =
                                        '/demo/images/default/—Pngtree—sneakers_3989154.png')
                                }
                            />
                        )}
                    />
                    <Column field='tenSanPham' header='Tên sản phẩm' />
                    <Column field='soLuong' header='Số lượng' body={(rowData) => rowData.soLuong.toLocaleString()} />
                    <Column
                        field='giaTien'
                        header='Giá tiền'
                        body={(rowData) => `${formatCurrency(rowData.giaTien)}`}
                    />
                </DataTable>
            </Card>
        </div>
    )
}

export default DetailedStatisticsView
