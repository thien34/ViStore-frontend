import React from 'react'
import { Card } from 'primereact/card'
import { Pie } from 'react-chartjs-2'
import { OrderStatus } from '@/interface/statistical.interface'

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

interface OrderStatusChartProps {
    orderStatusChart: OrderStatus[]
}

const OrderStatusChart = ({ orderStatusChart }: OrderStatusChartProps) => {
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

    return (
        <Card title='Biểu đồ trạng thái đơn hàng' className='p-4'>
            <Pie data={getOrderStatusChartData()} options={pieOptions} />
        </Card>
    )
}

export default OrderStatusChart
