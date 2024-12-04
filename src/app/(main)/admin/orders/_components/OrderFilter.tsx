import { OrderFilter, OrderResponse } from "@/interface/order.interface"
import { Button } from "primereact/button"
import { Calendar } from "primereact/calendar"
import { Dropdown } from "primereact/dropdown"
import { InputNumber } from "primereact/inputnumber"
import { InputText } from "primereact/inputtext"
import { useRef, useState } from "react"
import OrderTotalCostRange from "./OrderTotalCostRange"
import { OverlayPanel } from "primereact/overlaypanel"

interface Props {
    setFilter: (filter: OrderFilter) => void
    applyFilter: () => void
    cancelFilter: () => void
    orderFilter: OrderFilter
}
const paymentStatusOptions = [
    { label: 'Payment Status', value: undefined },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Paid', value: 'PAID' },
    { label: 'Cancelled', value: 'CANCELLED' },
    { label: 'Cash on Delivery', value: 'CASH_ON_DELIVERY' }
];

const statusOptions = [
    { label: 'Choose Order Status', value: undefined },
    { label: 'Created', value: 'CREATED' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Confirmed', value: 'CONFIRMED' },
    { label: 'Shipping Pending', value: 'SHIPPING_PENDING' },
    { label: 'Shipping Confirmed', value: 'SHIPPING_CONFIRMED' },
    { label: 'Delivering', value: 'DELIVERING' },
    { label: 'Delivered', value: 'DELIVERED' },
    { label: 'Paid', value: 'PAID' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Cancelled', value: 'CANCELLED' },
];

// const paymentMethodOptions = [
//     { label: 'Cash', value: 'CASH' },
//     { label: 'Bank Transfer', value: 'TRANSFER' },
//     { label: 'Cash on Delivery', value: 'COD' },
// ];

const OrderFilterTaskbar = ({ setFilter, applyFilter, orderFilter, cancelFilter }: Props) => {
    const [usedFilter, setUsedFilter] = useState<boolean>(false);
    const op = useRef<any>(null);

    const openCostOverLay = (e: React.MouseEvent) => {
        op?.current?.toggle(e);
    };
    const closeCostOverlay = () => {
        op?.current?.hide();
    };
    const handleFilter = () => {
        setUsedFilter(true);
        console.log(orderFilter);
        applyFilter();
    }
    const handleCancelFilter = () => {
        cancelFilter();
        setUsedFilter(false);
    }
    const handleDateChange = (e: any) => {
        setFilter({
            ...orderFilter,
            startDate: e.value ? e.value[0] : undefined,
            endDate: e.value ? e.value[1] : undefined,
        });
    };
    const handleTotalCostRangeChange = (value: [number, number]) => {
        setFilter({
            ...orderFilter,
            startAmount: value[0],
            endAmount: value[1],
        });
    };
    return (
        <>
            <div className="flex items-center gap-4">
                <InputText
                    id="Customer Name"
                    value={orderFilter.name ?? ''}
                    onChange={(e) => setFilter({ ...orderFilter, name: e.target.value })}
                    placeholder="Customer Name"
                    style={{ width: '150px' }}
                />
                <div>
                    <Button type="button" icon="pi pi-money-bill" label="Cost" onClick={openCostOverLay} />
                    <OverlayPanel ref={op}>
                        <OrderTotalCostRange setTotalCostRange={handleTotalCostRangeChange} totalCost={[orderFilter.startAmount ?? 0, orderFilter.endAmount ?? 5000]} setVisible={closeCostOverlay} />
                    </OverlayPanel>
                </div>
                <Dropdown
                    id="paymentStatus"
                    value={orderFilter.paymentStatus}
                    options={paymentStatusOptions}
                    onChange={(e) => setFilter({ ...orderFilter, paymentStatus: e.value })}
                    placeholder="Choose Payment Status"
                    style={{ width: '205px' }}
                />
                <Dropdown
                    id="status"
                    value={orderFilter.status}
                    options={statusOptions}
                    onChange={(e) => setFilter({ ...orderFilter, status: e.value })}
                    placeholder="Choose Order Status"
                    style={{ width: '205px' }}
                />
                {/* <Dropdown
                    id="paymentMethod"
                    value={orderFilter.paymentMode}
                    options={paymentMethodOptions}
                    onChange={(e) => setFilter({ ...orderFilter, paymentMode: e.value ?? undefined })}
                    placeholder="Payment Method"
                /> */}
                <Calendar
                    id="dateRange"
                    value={[
                        orderFilter.startDate ? new Date(orderFilter.startDate) : null,
                        orderFilter.endDate ? new Date(orderFilter.endDate) : null,
                    ]}
                    onChange={handleDateChange}
                    selectionMode="range"
                    placeholder="Select Date Range"
                    dateFormat="mm/dd/yy"
                />
                {!usedFilter ? (
                    <Button label="Filter" icon="pi pi-filter" onClick={handleFilter} />
                ) : (
                    <Button label="Filter" icon="pi pi-times" onClick={handleCancelFilter} />
                )}
            </div>
        </>
    )
}
export default OrderFilterTaskbar;