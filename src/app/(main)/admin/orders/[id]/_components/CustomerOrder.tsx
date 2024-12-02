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
                <h4> Order information</h4>
                <Button type='button' label='Update' icon={<FaEdit />} />
            </div>
            <hr className='my-2 border-gray-400' />
            <div className='grid grid-cols-3 gap-4 justify-items-center justify-between mt-4'>
                {customerOrder?.firstName === 'Retail' ? (
                    <>
                        <div className='flex flex-col gap-2'>
                            <span>Bill ID: {customerOrder?.billId}</span>
                        </div>
                        <div className='flex flex-col gap-2'>
                            <span>
                                Customer Name: {customerOrder?.firstName} {customerOrder?.lastName}
                            </span>
                            <span>
                                Type of delivery: <Tag className='w-fit' value={customerOrder?.delivery} />
                            </span>
                        </div>
                        <div className=''>
                            <span>Order Status: </span>
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
                            <span>Bill ID: {customerOrder?.billId}</span>
                            <span>Phone Number: {customerOrder?.phoneNumber}</span>
                        </div>
                        <div className='flex flex-col gap-2'>
                            <span>
                                Customer Name: {customerOrder?.firstName} {customerOrder?.lastName}
                            </span>
                            <span>
                                Type of delivery: <Tag className='w-fit' value={customerOrder?.delivery} />
                            </span>
                        </div>
                        <div className=''>
                            <span>Order Status: </span>
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
