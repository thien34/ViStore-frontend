import React from 'react'
import { CustomerOrder } from '@/interface/orderItem.interface'

interface CustomerOrderInfoProps {
    customerInfo: CustomerOrder
}

const CustomerOrderInfo = ({ customerInfo }: CustomerOrderInfoProps) => {
    return (
        <div className='mb-4'>
            <div className=''>
                <div className='p-2'>
                    <div className='text-gray-600 text-sm'>Customer Name</div>
                    <div className='font-medium text-lg'>{customerInfo.customerName}</div>
                </div>
                <div className='p-2'>
                    <div className='text-gray-600 text-sm'>Phone Number</div>
                    <div className='font-medium text-lg'>{customerInfo.customerPhone ?? '0123456798'}</div>
                </div>
                <div className='p-2 md:col-span-2'>
                    <div className='text-gray-600 text-sm'>Delivery Address</div>
                    <div className='font-medium text-lg'>{customerInfo.addressOrder}</div>
                </div>
            </div>
        </div>
    )
}

export default CustomerOrderInfo
