'use client'
import { useState } from 'react'
import OrderList from './_components/OrderList'
import { useMountEffect } from 'primereact/hooks'
import { OrderFilter, OrderResponse, OrderStatusType } from '@/interface/order.interface'
import OrderService from '@/service/order.service'
import { TabView, TabPanel, TabViewTabChangeEvent } from 'primereact/tabview'
import { IconType } from 'react-icons'
import { FaRegCalendarCheck, FaRegClock, FaRegCheckCircle, FaTruck, FaTimesCircle, FaListAlt } from 'react-icons/fa'
import { InputText } from 'primereact/inputtext'
export default function Orders() {
    const [orders, setOrders] = useState<OrderResponse[]>([])
    const [filterData, setFilterData] = useState<OrderResponse[]>(orders)
    const [activeIndex, setActiveIndex] = useState(0);
    const [filter, setFilter] = useState<OrderFilter>({})
    const fetchData = async () => {
        OrderService.getOrders(filter).then((response) => {
            setOrders(response.payload)
            if (!filterData.length) setFilterData(response.payload)
            countStatusOrder()
        })
    }
    useMountEffect(() => {
        fetchData()
    })

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value.toLowerCase();
        if (query === '') {
            setFilterData(orders);
        } else {
            const filtered = orders.filter(item =>
                item.customerName.toLowerCase().includes(query) || item.billCode.toString().includes(query)
            );
            setFilterData(filtered);
        }
    };
    const countStatusOrder = () => {
        const status = orders.map(order => order.orderStatus)
        const count = status.reduce((acc: Record<number, number>, cur) => {
            acc[cur] = (acc[cur] || 0) + 1
            return acc
        }, {})
        return count
    }

    const getStatusCount = (status: OrderStatusType) => {
        const count = countStatusOrder()[status]
        return count || 0
    }
    const getStatusTypeByLabel = (label: string) => {
        if (label === 'Tất cả') return undefined;
        return Object.keys(statusConfig).find(key => statusConfig[key as unknown as OrderStatusType].label === label);
    }
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
    const handleTabChange = (e: TabViewTabChangeEvent) => {
        setActiveIndex(e.index);
        const index = getStatusTypeByLabel((e.originalEvent.target as HTMLElement).innerText);
        if (index !== undefined) {
            const status = Number.parseInt(index);
            const filtered = orders.filter(item => item.orderStatus === status);
            setFilterData(filtered);
        } else setFilterData(orders);
    }
    return (
        <>
            <div className="card">
                <h3 className='text-xl font-bold'>Danh sách đơn hàng</h3>
                <TabView className="overflow-visible pr-2"
                    scrollable
                    activeIndex={activeIndex}
                    onTabChange={handleTabChange}
                >
                    {[
                        { label: 'Tất cả', icon: FaListAlt },
                        ...Object.values(statusConfig)].map((status) => {
                            return (
                                <TabPanel
                                    header={
                                        <div className="flex items-center space-x-2">
                                            <status.icon className="text-blue-500" />
                                            <span>{status.label}</span>
                                            <span className='text-red-500'>
                                                {
                                                    getStatusTypeByLabel(status.label) !== undefined &&
                                                        getStatusCount(getStatusTypeByLabel(status.label) as unknown as OrderStatusType) > 0
                                                        ? `(${getStatusCount(getStatusTypeByLabel(status.label) as unknown as OrderStatusType)})`
                                                        : ''
                                                }
                                            </span>
                                        </div>
                                    }
                                    key={status.label} >
                                    <div className="p-inputgroup flex-1 mb-2">
                                        <span className="p-inputgroup-addon">
                                            <i className="pi pi-search"></i>
                                        </span>
                                        <InputText placeholder="Tìm kiếm theo Mã hóa đơn và tên khách hàng" className="w-full"
                                            onChange={handleSearch}
                                        />
                                    </div>
                                    <OrderList orders={filterData} />
                                </TabPanel>
                            )
                        })}
                </TabView>
            </div>
        </>
    )
}
