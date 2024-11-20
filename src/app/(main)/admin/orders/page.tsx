'use client'
import React, { useState } from 'react'
import OrderList from './_components/OrderList'
import { useMountEffect } from 'primereact/hooks'
import { OrderFilter, OrderResponse } from '@/interface/order.interface'
import OrderService from '@/service/order.service'

export default function Orders() {
    const [orders, setOrders] = useState<OrderResponse[]>([])
    const [filter, setFilter] = useState<OrderFilter>({})

    useMountEffect(() => {
        OrderService.getOrders(filter).then((response) => {
            setOrders(response.payload)
        })
    })
    return (
        <>
            <div className='card'>
                <h3 className='text-xl font-bold'>Manage Orders</h3>
            </div>

            <div className='card'>
                <OrderList orders={orders} />
            </div>
        </>
    )
}
