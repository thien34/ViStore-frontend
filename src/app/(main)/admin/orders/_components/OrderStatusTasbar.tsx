import { OrderFilter, OrderResponse, OrderStatusType } from "@/interface/order.interface";
import { useMountEffect } from "primereact/hooks";
import { TabMenu } from "primereact/tabmenu";
import { useEffect, useState } from "react";
import { IconType } from "react-icons";
import { FaRegCalendarCheck, FaRegCheckCircle, FaRegClock, FaTimesCircle, FaTruck } from "react-icons/fa";

export const statusOptions = [
    { label: 'Tất Cả', value: undefined, filter: undefined, count: 0 },
    { label: 'Đã Tạo', value: 0, filter: 'CREATED', count: 0 },
    { label: 'Chờ Xác Nhận', value: 1, filter: 'PENDING', count: 0 },
    { label: 'Xác Nhận', value: 2, filter: 'CONFIRMED', count: 0 },
    { label: 'Chờ vận chuyển', value: 3, filter: 'SHIPPING_PENDING', count: 0 },
    { label: 'Đã nhận vận chuyển', value: 4, filter: 'SHIPPING_CONFIRMED', count: 0 },
    { label: 'Vận chuyển', value: 5, filter: 'DELIVERING', count: 0 },
    { label: 'Đã giao', value: 6, filter: 'DELIVERED', count: 0 },
    { label: 'Đã Thanh Toán', value: 7, filter: 'PAID', count: 0 },
    { label: 'Hoàn Thành', value: 8, filter: 'COMPLETED', count: 0 },
    { label: 'Đã Hủy', value: 9, filter: 'CANCELLED', count: 0 },
];

interface Props {
    setFilter: (filter: OrderFilter) => void,
    allOrders: OrderResponse[]
    filter: OrderFilter
}
interface StatusLabel {
    label: string,
    value: number | undefined
    filter: string | undefined
    count: number
}
const OrderStatusTaskbar = ({ allOrders, filter, setFilter }: Props) => {
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
    const [label, setLabel] = useState<StatusLabel[]>(statusOptions);
    const [activeIndex, setActiveIndex] = useState(0);
    const statusCount = allOrders.reduce((acc, order) => {
        acc[order.orderStatus] = (acc[order.orderStatus] || 0) + 1;
        return acc;
    }, {} as Record<number, number>);

    const setStatus = (value: number | undefined) => {
        if (value === undefined) return setFilter({});
        const label = statusOptions.find((option) => option.value === value);
        setFilter({ ...filter, status: label?.filter });
    }
    const countValue = () => {
        setLabel(statusOptions.map(status => ({
            ...status,
            count: status.value !== undefined ? statusCount[status.value] || 0 : 0,
            label: `${status.label}${status.value !== undefined && statusCount[status.value] > 0 ? `(${statusCount[status.value]})` : ''}`
        })));
    }
    useMountEffect(() => {
        countValue()
    })

    useEffect(() => {
        countValue()
    }, [allOrders])
    return (
        <>
            <div className="flex  gap-2 ">
                <TabMenu
                    activeIndex={activeIndex}
                    className="text-black"
                    model={label}
                    onTabChange={(e) => {
                        if (e.value === undefined) {
                            setFilter({})
                        } else setStatus((e.value as StatusLabel).value)
                        setActiveIndex(e.index)
                    }}
                />
            </div>
        </>
    )
}

export default OrderStatusTaskbar;