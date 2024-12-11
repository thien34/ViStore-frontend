'use client'
import { useEffect, useState } from 'react'
import OrderList from './_components/OrderList'
import { OrderResponse, OrderStatusType } from '@/interface/order.interface'
import OrderService from '@/service/order.service'
import { TabView, TabPanel, TabViewTabChangeEvent } from 'primereact/tabview'
import { IconType } from 'react-icons'
import { FaRegCalendarCheck, FaRegClock, FaRegCheckCircle, FaTruck, FaTimesCircle, FaListAlt } from 'react-icons/fa'

export default function Orders() {
    const [orders, setOrders] = useState<OrderResponse[]>([])
    const [filterData, setFilterData] = useState<OrderResponse[]>([])
    const [activeIndex, setActiveIndex] = useState(0)

    const fetchData = async () => {
        const { payload: response } = await OrderService.getOrders({})
        setOrders(response)
        setFilterData(response)
    }

    useEffect(() => {
        fetchData()
    }, [])

    const statusConfig: Record<OrderStatusType, { label: string; icon: IconType; color: string }> = {
        [OrderStatusType.CREATED]: { label: 'Tạo', icon: FaRegCalendarCheck, color: 'blue' },
        [OrderStatusType.PENDING]: { label: 'Chờ xử lý', icon: FaRegClock, color: 'orange' },
        [OrderStatusType.CONFIRMED]: { label: 'Đã xác nhận', icon: FaRegCheckCircle, color: 'cyan' },
        [OrderStatusType.SHIPPING_PENDING]: { label: 'Chờ vận chuyển', icon: FaTruck, color: 'teal' },
        [OrderStatusType.SHIPPING_CONFIRMED]: { label: 'Đã xác nhận vận chuyển', icon: FaTruck, color: 'purple' },
        [OrderStatusType.DELIVERING]: { label: 'Đang giao hàng', icon: FaTruck, color: 'gold' },
        [OrderStatusType.DELIVERED]: { label: 'Đã giao hàng', icon: FaRegCheckCircle, color: 'green' },
        [OrderStatusType.PAID]: { label: 'Đã thanh toán', icon: FaRegCalendarCheck, color: 'darkgreen' },
        [OrderStatusType.COMPLETED]: { label: 'Thành công', icon: FaRegCheckCircle, color: 'darkblue' },
        [OrderStatusType.CANCELLED]: { label: 'Đã hủy', icon: FaTimesCircle, color: 'red' }
    }

    const getStatusCount = (status?: OrderStatusType) => {
        if (status === undefined) return orders.length
        return orders.filter((order) => order.orderStatus === status).length
    }

    const handleTabChange = (e: TabViewTabChangeEvent) => {
        setActiveIndex(e.index)

        // Get the label of the selected tab
        const selectedLabel = (e.originalEvent.target as HTMLElement).innerText.replace(/\(\d+\)$/, '').trim()

        if (selectedLabel === 'Tất cả') {
            setFilterData(orders)
        } else {
            const matchedStatus = Object.entries(statusConfig).find(([, config]) => config.label === selectedLabel)

            if (matchedStatus) {
                const status = Number(matchedStatus[0]) as OrderStatusType
                const filtered = orders.filter((order) => order.orderStatus === status)
                setFilterData(filtered)
            }
        }
    }

    return (
        <div className='card'>
            <h3 className='text-xl font-bold'>Danh sách đơn hàng</h3>
            <TabView
                className='overflow-visible pr-2'
                scrollable
                activeIndex={activeIndex}
                onTabChange={handleTabChange}
            >
                {[
                    { label: 'Tất cả', icon: FaListAlt },
                    ...Object.values(statusConfig).filter((status) => status.label !== 'Tạo')
                ].map((status) => (
                    <TabPanel
                        header={
                            <div className='flex items-center space-x-2'>
                                <status.icon className='text-blue-500' />
                                <span>{status.label}</span>
                                <span className='text-red-500'>
                                    {status.label !== 'Tất cả'
                                        ? `(${getStatusCount(
                                              Number(
                                                  Object.keys(statusConfig).find(
                                                      (key) =>
                                                          statusConfig[key as unknown as OrderStatusType].label ===
                                                          status.label
                                                  )
                                              ) as OrderStatusType
                                          )})`
                                        : `(${getStatusCount()})`}
                                </span>
                            </div>
                        }
                        key={status.label}
                    >
                        <OrderList orders={filterData} />
                    </TabPanel>
                ))}
            </TabView>
        </div>
    )
}
