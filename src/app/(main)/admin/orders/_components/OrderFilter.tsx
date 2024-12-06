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
    { label: 'Chờ Thanh Toán', value: 'PENDING' },
    { label: 'Đã Thanh Toán', value: 'PAID' },
    { label: 'Đã Hủy', value: 'CANCELLED' },
    { label: 'Thu Hộ Bởi ĐVVC', value: 'CASH_ON_DELIVERY' }
];

const statusOptions = [
    { label: 'Đã Tạo', value: 'CREATED' },
    { label: 'Đang Chờ Xác Nhận', value: 'PENDING' },
    { label: 'Đã Xác Nhận', value: 'CONFIRMED' },
    { label: 'Đang chờ xác nhận vận chuyển', value: 'SHIPPING_PENDING' },
    { label: 'Đã xác nhận vận chuyển', value: 'SHIPPING_CONFIRMED' },
    { label: 'Đang vận chuyển', value: 'DELIVERING' },
    { label: 'Đã giao', value: 'DELIVERED' },
    { label: 'Đã Thanh Toán', value: 'PAID' },
    { label: 'Hoàn Thành', value: 'COMPLETED' },
    { label: 'Đã Hủy', value: 'CANCELLED' },
];

const paymentMethodOptions = [
    { label: 'Tiền Mặt', value: 0 },
    { label: 'Chuyển Khoản', value: 1 },
    { label: 'Thu Hộ Bởi DVVC', value: 2 },
];

const OrderFilterTaskbar = ({ setFilter, orderFilter }: Props) => {
    const op = useRef<any>(null);

    const openCostOverLay = (e: React.MouseEvent) => {
        op?.current?.toggle(e);
    };
    const closeCostOverlay = () => {
        op?.current?.hide();
    };
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
    const isOrderFilterValid = (filter: Record<string, any>): boolean => {
        return Object.values(filter).some(value => value !== undefined);
    };

    const getOrderStatusLabel = (value: string) => {
        const status = statusOptions.find(option => option.value === value);
        return status;
    }
    const getPaymentStatusLabel = (value: string) => {
        const status = paymentStatusOptions.find(option => option.value === value);
        return status;
    }
    const getPaymentMethodLabel = (value: number) => {
        const status = paymentMethodOptions.find(option => option.value === value);
        return status;
    }
    return (
        <>
            <div className="flex items-center gap-4">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '5px' }}>
                    <label htmlFor="customerName" style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                        Tên Khách Hàng
                    </label>
                    <InputText
                        id="customerName"
                        value={orderFilter.name ?? ''}
                        onChange={(e) => setFilter({ ...orderFilter, name: e.target.value })}
                        placeholder="VD: Hào ..."
                        style={{ width: '200px' }}
                    />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '5px' }}>
                    <label htmlFor="cost" style={{ fontWeight: 'bold', marginBottom: '5px' }}>Giá</label>
                    <Button type="button" icon="pi pi-money-bill" label="Cost" onClick={openCostOverLay} />
                    <OverlayPanel ref={op}>
                        <OrderTotalCostRange setTotalCostRange={handleTotalCostRangeChange} totalCost={[orderFilter.startAmount ?? 0, orderFilter.endAmount ?? 500000]} setVisible={closeCostOverlay} />
                    </OverlayPanel>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '5px' }}>
                    <label htmlFor="paymentStatus" style={{ fontWeight: 'bold', marginBottom: '5px' }}>Trạng Thái Thanh Toán</label>
                    <Dropdown
                        id="paymentStatus"
                        value={orderFilter.paymentStatus}
                        options={paymentStatusOptions}
                        onChange={(e) => setFilter({ ...orderFilter, paymentStatus: e.value })}
                        placeholder="Trạng thái thanh toán"
                        style={{ width: '205px' }}
                    />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '5px' }}>
                    <label htmlFor="status" style={{ fontWeight: 'bold', marginBottom: '5px' }}>Trạng Thái</label>
                    <Dropdown
                        id="status"
                        value={orderFilter.status}
                        options={statusOptions}
                        onChange={(e) => setFilter({ ...orderFilter, status: e.value })}
                        placeholder="Trạng thái hóa đơn"
                        style={{ width: '205px' }}
                    />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '5px' }}>
                    <label htmlFor="status" style={{ fontWeight: 'bold', marginBottom: '5px' }}>Phương Thức Thanh Toán</label>
                    <Dropdown
                        id="paymentMethod"
                        value={orderFilter.paymentMode}
                        options={paymentMethodOptions}
                        onChange={(e) => setFilter({ ...orderFilter, paymentMode: e.value ?? undefined })}
                        placeholder="Phương Thức Thanh Toán"
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '5px' }}>
                    <label htmlFor="dateRange" style={{ fontWeight: 'bold', marginBottom: '5px' }}>Ngày Bắt Đầu - Ngày Kết Thúc</label>
                    <Calendar
                        id="dateRange"
                        value={[
                            orderFilter.startDate ? new Date(orderFilter.startDate) : null,
                            orderFilter.endDate ? new Date(orderFilter.endDate) : null,
                        ]}
                        onChange={handleDateChange}
                        selectionMode="range"
                        placeholder="Chọn Khoảng Ngày"
                        dateFormat="dd/mm/yyyyy"
                    />
                </div>
            </div>
            <div>
                {isOrderFilterValid(orderFilter) && (
                    <div className="flex flex-col space-y-2 mt-2">
                        <label htmlFor="example" className=" font-semibold">Lọc Theo</label>
                        <div className=" rounded-md  flex items-center gap-2">
                            {orderFilter.name && (
                                <Button
                                    label={`Tên Khách Hàng: ${orderFilter.name}`}
                                    onClick={() => setFilter({ ...orderFilter, name: '' })}
                                    severity="danger"
                                    icon="pi pi-times"
                                />
                            )}
                            {orderFilter.status && (
                                <Button
                                    label={`Trạng Thái Hóa Đơn: ${getOrderStatusLabel(orderFilter.status)?.label}`}
                                    onClick={() => setFilter({ ...orderFilter, status: undefined })}
                                    severity="danger"
                                    icon="pi pi-times"
                                />
                            )}
                            {orderFilter.startAmount && orderFilter.endAmount && (
                                <Button
                                    label={`Khoảng Giá Từ: ${orderFilter.startAmount.toString()}đ - ${orderFilter.endAmount.toString()}đ`}
                                    onClick={() => setFilter({ ...orderFilter, startAmount: 0, endAmount: 500000 })}
                                    severity="danger"
                                    icon="pi pi-times"
                                />
                            )}
                            {orderFilter.paymentMode !== undefined && (
                                <Button
                                    label={`Phương Thức Thanh Toán: ${getPaymentMethodLabel(orderFilter.paymentMode)?.label}`}
                                    onClick={() => setFilter({ ...orderFilter, paymentMode: undefined })}
                                    severity="danger"
                                    icon="pi pi-times"
                                />
                            )}

                            {orderFilter.paymentStatus && (
                                <Button
                                    label={`Trạng Thái Thanh Toán: ${getPaymentStatusLabel(orderFilter.paymentStatus.toString())?.label}`}
                                    onClick={() => setFilter({ ...orderFilter, paymentStatus: undefined })}
                                    severity="danger"
                                    icon="pi pi-times"
                                />
                            )}
                            <Button label='Bỏ chọn tất cả' severity="danger" onClick={() => setFilter({})} icon="pi pi-times" />
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}
export default OrderFilterTaskbar;