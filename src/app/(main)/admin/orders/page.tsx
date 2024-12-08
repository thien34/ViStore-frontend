'use client'
import { useEffect, useState } from 'react'
import OrderList from './_components/OrderList'
import { useMountEffect } from 'primereact/hooks'
import { OrderFilter, OrderResponse } from '@/interface/order.interface'
import OrderService from '@/service/order.service'
import OrderStatusTaskbar from './_components/OrderStatusTasbar'

export default function Orders() {
    const [orders, setOrders] = useState<OrderResponse[]>([])
    const [allOrders, setAllOrders] = useState<OrderResponse[]>([])
    const [filter, setFilter] = useState<OrderFilter>({})
    const fetchData = async () => {
        OrderService.getOrders(filter).then((response) => {
            setOrders(response.payload)
            if (!allOrders.length) setAllOrders(response.payload)
        })
    }
    useMountEffect(() => {
        fetchData()
    })
    useEffect(() => {
        fetchData()
    }, [filter])
    return (
        <>
            <div className='card'>
                <h3 className='text-xl font-bold'>Manage Orders</h3>
            </div>
            {/* <div className='card' >
                <OrderFilterTaskbar cancelFilter={cancelFilter} applyFilter={applyFilter} orderFilter={filter} setFilter={setFilter} />
            </div> */}
            <div className="card w-full">
                <OrderStatusTaskbar allOrders={allOrders} setFilter={setFilter} filter={filter} />
            </div>
            <div className='card'>
                <OrderList orders={orders} />
            </div>

        </>
    )
}
