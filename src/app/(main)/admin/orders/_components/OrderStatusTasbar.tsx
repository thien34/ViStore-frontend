import { OrderFilter, OrderResponse } from "@/interface/order.interface";
import { count } from "console";
import { TabMenu } from "primereact/tabmenu";
import { useEffect, useState } from "react";

const statusOptions = [
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
    orderResponse: OrderResponse[]
    filter: OrderFilter
}
interface StatusLabel {
    label: string,
    value: number | undefined
    filter: string | undefined
    count: number
}
const OrderStatusTaskbar = ({ filter, setFilter, orderResponse }: Props) => {
    const [label, setLabel] = useState<StatusLabel[]>(statusOptions);
    const [activeIndex, setActiveIndex] = useState(0);
    const statusCount = orderResponse.reduce((acc, order) => {
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
            label: `${status.label}${status.value !== undefined && statusCount[status.value] > 0 ? ` (${statusCount[status.value]})` : ''}`
        })));
    }

    useEffect(() => {
        countValue();
    }, []);
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