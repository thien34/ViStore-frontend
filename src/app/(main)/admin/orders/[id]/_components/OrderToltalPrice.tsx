import { OrderResponse } from '@/interface/order.interface'
import React from 'react'

type Props = {
    order: OrderResponse
}

export default function OrderToltalPrice({ order }: Props) {
    const formatPrice = (price: number) => {
        return price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
    }
    return (
        <div className='card flex justify-between p-4 shadow-lg rounded-lg bg-white'>
            {/* Phần thông tin bên trái */}
            <div className='flex flex-col'>
                <div className='text-gray-700 font-medium text-lg'>
                    <span>Vouchers</span>
                </div>
            </div>

            {/* Phần thông tin bên phải */}
            <div className='space-y-4'>
                <div className='flex justify-between items-center'>
                    <span className='text-gray-600'>Total Order Price: </span>
                    <span className='text-gray-900 font-semibold'>{formatPrice(order.orderTotal)}</span>
                </div>
                <div className='flex justify-between items-center'>
                    <span className='text-gray-600'>Discount Amount: </span>
                    <span className='text-red-500 font-semibold'>{formatPrice(order.orderDiscountTotal)}</span>
                </div>
                <div className='flex justify-between items-center'>
                    <span className='text-gray-600'>Shipping Amount: </span>
                    <span className='text-blue-500 font-semibold'>{formatPrice(order.orderShippingTotal)}</span>
                </div>
                <div className='flex justify-between items-center border-t pt-2'>
                    <span className='text-gray-800 font-bold'>Total Amount: </span>
                    <span className='text-green-600 font-bold'>{formatPrice(order.orderSubtotalDiscount)}</span>
                </div>
            </div>
        </div>
    )
}
