'use client'
import { useState } from 'react'
import OrderList from './_components/OrderList'
import { useMountEffect } from 'primereact/hooks'
import { OrderFilter, OrderResponse } from '@/interface/order.interface'
import OrderService from '@/service/order.service'
import OrderFilterTaskbar from './_components/OrderFilter'
import { Button } from 'primereact/button'

export default function Orders() {
    const [orders, setOrders] = useState<OrderResponse[]>([])
    const [filter, setFilter] = useState<OrderFilter>({})
    const fetchData = async () => {
        OrderService.getOrders(filter).then((response) => {
            setOrders(response.payload)
        })
    }
    useMountEffect(() => {
        fetchData()
    })

    const applyFilter = () => {
        fetchData()
    }
    const cancelFilter = () => {
        setFilter({})
        fetchData()
    }
    return (
        <>
            <div className='card'>
                <h3 className='text-xl font-bold'>Manage Orders</h3>
            </div>
            <div className='card' >
                <OrderFilterTaskbar cancelFilter={cancelFilter} applyFilter={applyFilter} orderFilter={filter} setFilter={setFilter} />
            </div>
            <div className='card'>
                <OrderList orders={orders} />
            </div>

        </>
    )
}
