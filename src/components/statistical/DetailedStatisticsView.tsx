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
import { Calendar } from 'primereact/calendar'
import { Divider } from 'primereact/divider'
import { DetailedStatistics } from '@/interface/statistical.interface'
import { StatisticalService } from '@/service/statistical.service'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import FilterOptions from './FilterOptions'
import LoadingState from './LoadingState'
import RevenueOverview from './RevenueOverview'
import OrderStatusChart from './OrderStatusChart'
import BestSellingProducts from './BestSellingProducts'
import OutOfStockProducts from './OutOfStockProducts'
ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels)

const DetailedStatisticsView = () => {
    const [detailedStatistics, setDetailedStatistics] = useState<DetailedStatistics | null>(null)
    const [filter, setFilter] = useState('today')
    const [customStartDate, setCustomStartDate] = useState<Date | null>(null)
    const [customEndDate, setCustomEndDate] = useState<Date | null>(null)

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

    if (!detailedStatistics) {
        return <LoadingState />
    }

    const { totalRevenue, bestSellingProducts, outOfStockProducts, orderStatusChart } = detailedStatistics

    return (
        <div className='container mx-auto mt-6'>
            <h2 className='text-2xl font-bold mb-4'>Bộ lọc</h2>
            <FilterOptions filter={filter} setFilter={setFilter} />
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
                <RevenueOverview totalRevenue={totalRevenue} />
                <OrderStatusChart orderStatusChart={orderStatusChart} />
            </div>
            <Divider />
            <BestSellingProducts products={bestSellingProducts} />
            <OutOfStockProducts products={outOfStockProducts} />
        </div>
    )
}

export default DetailedStatisticsView
