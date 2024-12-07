import { Button } from 'primereact/button'
import React, { useState } from 'react'
import { FaEdit, FaRegCalendarCheck, FaRegCheckCircle, FaRegClock, FaTimesCircle, FaTruck } from 'react-icons/fa'
import OrderService from '@/service/order.service'
import { CustomerOrderResponse } from '@/interface/orderItem.interface'
import { useParams } from 'next/dist/client/components/navigation'
import { useMountEffect } from 'primereact/hooks'
import { OrderStatusType } from '@/interface/order.interface'
import { Tag } from 'primereact/tag'
import { IconType } from 'react-icons'
import { Dialog } from 'primereact/dialog'

const CustomerOrderInfo = () => {
    const [customerOrder, setCustomerOrder] = useState<CustomerOrderResponse>()
    const { id } = useParams()
    const [visible, setVisible] = useState(false)

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
    return (
        <div className='card'>
            <div className='flex justify-between items-center'>
                <h4> Thông tin đơn hàng </h4>
                <Button type='button' label='Cập Nhật' icon={<FaEdit />} />
            </div>
            <hr className='my-2 border-gray-400' />
            <div className='grid grid-cols-3 gap-4 justify-items-center justify-between mt-4'>
                {customerOrder?.firstName === 'Retail' ? (
                    <>
                        <div className='flex flex-col gap-2'>
                            <span>Mã Hóa Đơn: {customerOrder?.billId}</span>
                        </div>
                        <div className='flex flex-col gap-2'>
                            <span>
                                Tên Khách Hàng: {customerOrder?.firstName} {customerOrder?.lastName}
                            </span>
                            <span>
                                Hình Thức Giao Hàng: <Tag className='w-fit' value={customerOrder?.delivery} />
                            </span>
                        </div>
                        <div className=''>
                            <span>Trạng Thái Đơn Hàng: </span>
                            <Tag
                                value={
                                    customerOrder?.orderStatusType !== undefined
                                        ? statusConfig[customerOrder.orderStatusType as OrderStatusType]?.label || ''
                                        : ''
                                }
                            />
                        </div>
                    </>
                ) : (
                    <>
                        <div className='flex flex-col gap-2'>
                            <span>Mã Hóa Đơn: {customerOrder?.billId}</span>
                            <span>Số Điện Thoại: {customerOrder?.phoneNumber}</span>
                        </div>
                        <div className='flex flex-col gap-2'>
                            <span>
                                Tên khách hàng: {customerOrder?.firstName} {customerOrder?.lastName}
                            </span>
                            <span>
                                Hình thức giao hàng: <Tag className='w-fit' value={customerOrder?.delivery} />
                            </span>
                        </div>
                        <div className=''>
                            <span>Trạng thái đơn hàng: </span>
                            <Tag
                                value={
                                    customerOrder?.orderStatusType !== undefined
                                        ? statusConfig[customerOrder.orderStatusType as OrderStatusType]?.label || ''
                                        : ''
                                }
                            />
                        </div>
                    </>
                )}
            </div>
            <Dialog
                header='Cập Nhật Địa Chỉ'
                visible={visible}
                style={{ width: '50vw' }}
                onHide={() => {
                    if (!visible) return
                    setVisible(false)
                }}
            >
                <p className='m-0'></p>
            </Dialog>
        </div>
    )
}

export default CustomerOrderInfo
