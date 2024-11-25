'use client'
import { useState } from 'react'
import OrderService from '@/service/order.service'
import { useMountEffect } from 'primereact/hooks'
import HistoryOrder from './_components/HistoryOrder'
import { OrderItemsResponse, OrderStatusHistoryResponse } from '@/interface/orderItem.interface'
import ProductOrderList from './_components/ProductOrderList'
import { OrderStatusType } from '@/interface/order.interface'

interface Props {
    params: {
        id: string
    }
}

export default function OrderDetail({ params }: Props) {
    const { id } = params
    const [orderStatusHistoryResponses, setOrderStatusHistoryResponses] = useState<OrderStatusHistoryResponse[]>([])
    const [customerInfo, setCustomerInfo] = useState<OrderItemsResponse[]>([])

    useMountEffect(() => {
        OrderService.getOrderStatusHistory(id).then((response) => {
            setOrderStatusHistoryResponses(response.payload)
        })
        OrderService.getOrderItems(id).then((res) => setCustomerInfo(res.payload))
    })

    const handleUpdateQuantity = async (id: number, quantity: number) => {
        await OrderService.updateOrderItem(Number(id), quantity)
    }

    const latestStatus = orderStatusHistoryResponses[orderStatusHistoryResponses.length - 1]

    return (
        <>
            <HistoryOrder orderStatusHistoryResponses={orderStatusHistoryResponses} orderId={Number(id)} />
            {orderStatusHistoryResponses.length > 0 && (
                <ProductOrderList
                    onDelete={() => {}}
                    onUpdateQuantity={handleUpdateQuantity}
                    id={id}
                    status={latestStatus.status as OrderStatusType}
                />
            )}
        </>
    )
}
