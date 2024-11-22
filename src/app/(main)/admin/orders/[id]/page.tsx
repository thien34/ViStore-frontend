'use client'

import React, { useState } from 'react'
import OrderService from '@/service/order.service'
import { useMountEffect } from 'primereact/hooks'
import HistoryOrder from './_components/HistoryOrder'
import { OrderStatusHistoryResponse } from '@/interface/orderItem.interface'

interface Props {
    params: {
        id: string
    }
}

export default function OrderDetail({ params }: Props) {
    const { id } = params
    const [orderStatusHistoryResponses, setOrderStatusHistoryResponses] = useState<OrderStatusHistoryResponse[]>([])

    useMountEffect(() => {
        OrderService.getOrderStatusHistory(id).then((response) => {
            setOrderStatusHistoryResponses(response.payload)
            console.log(response.payload)
        })
    })

    const handleUpdateQuantity = async (id: number, quantity: number) => {
        await OrderService.updateOrderItem(Number(id), quantity)
    }

    return (
        <>
            <HistoryOrder
                orderStatusHistoryResponses={orderStatusHistoryResponses}
                orderId={Number(id)}
                onUpdateQuantity={handleUpdateQuantity}
                id={id}
            />
        </>
    )
}
