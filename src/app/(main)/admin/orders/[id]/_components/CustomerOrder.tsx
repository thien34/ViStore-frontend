import { Button } from 'primereact/button'
import React, { useState } from 'react'
import { FaEdit } from 'react-icons/fa'
import OrderService from '@/service/order.service'
import { CustomerOrderResponse } from '@/interface/orderItem.interface'
import { useParams } from 'next/dist/client/components/navigation'
import { useMountEffect } from 'primereact/hooks'
import { OrderStatusType } from '@/interface/order.interface'
import { Tag } from 'primereact/tag'

const CustomerOrderInfo = () => {
    const [customerOrder, setCustomerOrder] = useState<CustomerOrderResponse>()
    const { id } = useParams()

    useMountEffect(() => {
        getCustomerOrder()
    })

    const getCustomerOrder = () => {
        OrderService.getCustomerOrder(Number(id)).then((res) => setCustomerOrder(res.payload))
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
                            <span>ID Hóa Đơn: {customerOrder?.billId}</span>
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
                                        ? OrderStatusType[customerOrder.orderStatusType]
                                        : ''
                                }
                            />
                        </div>
                    </>
                ) : (
                    <>
                        <div className='flex flex-col gap-2'>
                            <span>ID Hóa Đơn: {customerOrder?.billId}</span>
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
                                        ? OrderStatusType[customerOrder.orderStatusType]
                                        : ''
                                }
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default CustomerOrderInfo
