import { Button } from 'primereact/button'
import React, { useEffect, useState } from 'react'
import { FaEdit, FaRegCalendarCheck, FaRegCheckCircle, FaRegClock, FaTimesCircle, FaTruck } from 'react-icons/fa'
import OrderService from '@/service/order.service'
import { CustomerOrderResponse } from '@/interface/orderItem.interface'
import { useParams } from 'next/dist/client/components/navigation'
import { useMountEffect } from 'primereact/hooks'
import { OrderStatusType, PaymentMethodType, PaymentModeType, PaymentStatusType } from '@/interface/order.interface'
import { Tag } from 'primereact/tag'
import { IconType } from 'react-icons'
import { Province } from '@/interface/address.interface'
import provinceService from '@/service/province.service'
import UpdateAddress from './UpdateAddress'
type CustomerOrderInfoProps = {
    customerOrder: CustomerOrderResponse
    setCustomerOrder: (customerOrder: CustomerOrderResponse) => void
}
const CustomerOrderInfo = ({ customerOrder, setCustomerOrder }: CustomerOrderInfoProps) => {
    const { id } = useParams()
    const [visible, setVisible] = useState(false)
    const [provinces, setProvinces] = useState<Province[]>([])

    useMountEffect(() => {
        getCustomerOrder()
    })

    const getCustomerOrder = () => {
        OrderService.getCustomerOrder(Number(id)).then((res) => setCustomerOrder(res.payload))
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
    useEffect(() => {
        fetchProvinces()
    }, [])
    const fetchProvinces = async () => {
        const { payload: provinces } = await provinceService.getAll()
        setProvinces(provinces)
    }
    const openAddressDialog = () => {
        setVisible(true)
    }
    const hideDialog = () => {
        setVisible(false)
        getCustomerOrder()
    }
    const getSeverity = (orderStatus: OrderStatusType) => {
        switch (orderStatus) {
            case OrderStatusType.PENDING:
                return 'info'
            case OrderStatusType.CONFIRMED:
            case OrderStatusType.DELIVERED:
            case OrderStatusType.COMPLETED:
            case OrderStatusType.PAID:
                return 'success'
            case OrderStatusType.SHIPPING_PENDING:
            case OrderStatusType.SHIPPING_CONFIRMED:
            case OrderStatusType.DELIVERING:
                return 'warning'
            case OrderStatusType.CANCELLED:
                return 'danger'
            default:
                return 'info'
        }
    }
    const paymentMethodBody = (paymentMethod: number) => {
        switch (paymentMethod) {
            case PaymentMethodType.Cash:
                return <Tag value='Tiền Mặt' severity='info' />
            case PaymentMethodType.BankTransfer:
                return <Tag value='Chuyển Khoản' severity='info' />
            case PaymentMethodType.Cod:
                return <Tag style={{ fontSize: '9px' }} value='Thanh Toán Khi Nhận Hàng' severity='info' />
            default:
                return <Tag value={PaymentMethodType[paymentMethod]} />
        }
    }
    // const paymentModeBody = (paymentStatus: number) => {
    //     switch (paymentStatus) {
    //         case PaymentModeType.Online:
    //             return <Tag value='Chờ Thanh Toán' severity='info' />
    //         case PaymentModeType.IN_STORE:
    //             return <Tag value='Đã Thanh Toán' severity='info' />
    //         default:
    //             return <Tag value={PaymentModeType[paymentStatus]} />
    //     }
    // }
    return (
        <div className='card'>
            <div className='flex justify-between items-center'>
                <h4> Thông tin đơn hàng </h4>
                <Button
                    disabled={(customerOrder?.orderStatusType ?? 0) > 3}
                    onClick={openAddressDialog}
                    type='button'
                    label='Cập Nhật'
                    icon={<FaEdit />}
                />
            </div>
            <hr className='my-2 border-gray-400' />
            <div className='grid grid-cols-3 justify-around gap-4 mt-4'>
                {customerOrder?.firstName === 'Khách Lẻ' ? (
                    <>
                        <div className='flex flex-col gap-2'>
                            <span className='font-semibold'>Thông tin đơn hàng</span>
                            <span>Mã Hóa Đơn: {customerOrder?.billId}</span>
                            <span>
                                Tên Khách Hàng: {customerOrder?.firstName} {customerOrder?.lastName}
                            </span>
                        </div>
                        <div className='flex flex-col gap-2'>
                            <span className='font-semibold'>Thông tin giao hàng</span>
                            <span>
                                Hình Thức Giao Hàng: <Tag className='w-fit' value={customerOrder?.delivery} />
                            </span>
                            <span>
                                Trạng Thái Đơn Hàng:
                                <Tag
                                    severity={getSeverity(customerOrder?.orderStatusType ?? OrderStatusType.CREATED)}
                                    value={
                                        customerOrder?.orderStatusType !== undefined
                                            ? statusConfig[customerOrder.orderStatusType as OrderStatusType]?.label ||
                                              ''
                                            : ''
                                    }
                                />
                            </span>
                        </div>
                        <div className='flex flex-col gap-2'>
                            <span className='font-semibold'>Thông tin thanh toán</span>
                            <span>
                                Phương thức thanh toán:{' '}
                                {paymentMethodBody(customerOrder?.paymentMethod ?? PaymentMethodType.Cash)}
                            </span>
                        </div>
                    </>
                ) : (
                    <>
                        <div className='flex flex-col gap-2'>
                            <span className='font-semibold'>Thông tin đơn hàng</span>
                            <span>Mã Hóa Đơn: {customerOrder?.billId}</span>
                            <span>
                                Tên khách hàng: {customerOrder?.firstName} {customerOrder?.lastName}
                            </span>
                            <span>Số Điện Thoại: {customerOrder?.phoneNumber}</span>
                        </div>
                        <div className='flex flex-col gap-2'>
                            <span className='font-semibold'>Thông tin giao hàng</span>
                            <span>
                                Hình thức giao hàng: <Tag className='w-fit' value={customerOrder?.delivery} />
                            </span>
                            <span>
                                Trạng thái đơn hàng:
                                <Tag
                                    severity={getSeverity(customerOrder?.orderStatusType ?? OrderStatusType.CREATED)}
                                    value={
                                        customerOrder?.orderStatusType !== undefined
                                            ? statusConfig[customerOrder.orderStatusType as OrderStatusType]?.label ||
                                              ''
                                            : ''
                                    }
                                />
                            </span>
                        </div>
                        <div className='flex flex-col gap-2'>
                            <span className='font-semibold'>Thông tin thanh toán</span>
                            <span>
                                Phương thức thanh toán:{' '}
                                {paymentMethodBody(customerOrder?.paymentMethod ?? PaymentMethodType.Cash)}
                            </span>
                        </div>
                    </>
                )}
            </div>

            <UpdateAddress
                provinces={provinces}
                customerId={customerOrder?.customerId ?? 1}
                visible={visible}
                setVisible={setVisible}
                idAddress={customerOrder?.id ?? null}
                hideDialog={hideDialog}
            />
        </div>
    )
}

export default CustomerOrderInfo
