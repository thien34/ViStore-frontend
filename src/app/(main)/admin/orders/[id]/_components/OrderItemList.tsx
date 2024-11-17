import React from 'react'
import { OrderItemsResponse } from '@/interface/orderItem.interface'

type Props = {
    orderItemsResponse: OrderItemsResponse[]
}

export default function OrderItemList({ orderItemsResponse }: Props) {
    return (
        <div className='card'>
            {orderItemsResponse.map((item) => (
                <div key={item.id}>{item.id}</div>
            ))}
        </div>
    )
}
