'use client'

import { useState } from 'react'
import OrderItemList from './_components/OrderItemList'
import { OrderItemsResponse, OrderStatusHistoryResponse } from '@/interface/orderItem.interface'
import OrderService from '@/service/order.service'
import { useMountEffect } from 'primereact/hooks'
import HistoryOrder from './_components/HistoryOrder'

interface Props {
    params: {
        id: string
    }
}

export default function OrderDetail({ params }: Props) {
    const { id } = params
    const [orderItemsResponse, setOrderItemsResponse] = useState<OrderItemsResponse[]>([])
    const [orderStatusHistoryResponses, setOrderStatusHistoryResponses] = useState<OrderStatusHistoryResponse[]>([])

    useMountEffect(() => {
        OrderService.getOrderItems(id).then((response) => {
            setOrderItemsResponse(response.payload)
            console.log(response.payload)
        })
        OrderService.getOrderStatusHistory(id).then((response) => {
            setOrderStatusHistoryResponses(response.payload)
            console.log(response.payload)
        })
    })
    return (
        <>
            <HistoryOrder orderStatusHistoryResponses={orderStatusHistoryResponses} />
            <OrderItemList orderItemsResponse={orderItemsResponse} />
        </>
    )
}
