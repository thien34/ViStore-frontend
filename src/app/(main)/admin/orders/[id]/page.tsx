'use client'
import { useState } from 'react'
import OrderService from '@/service/order.service'
import { useUpdateEffect } from 'primereact/hooks'
import HistoryOrder from './_components/HistoryOrder'
import { OrderStatusHistoryResponse } from '@/interface/orderItem.interface'
import ProductOrderList from './_components/ProductOrderList'
import { OrderStatusType } from '@/interface/order.interface'
import ChangeStatusOrderHistory from './_components/ChangeStatusOrderHistory'
import CustomerOrderInfo from './_components/CustomerOrder'

interface Props {
    params: {
        id: string
    }
}

export default function OrderDetail({ params }: Props) {
    const { id } = params
    const [orderStatusHistoryResponses, setOrderStatusHistoryResponses] = useState<OrderStatusHistoryResponse[]>([])
    const [visibleConfirm, setVisibleConfirm] = useState(false)
    const [latestStatus, setLatestStatus] = useState<OrderStatusHistoryResponse>()
    const [reason, setReason] = useState('')
    const [isPrevious, setIsPrevious] = useState(false)

    useUpdateEffect(() => {
        fetchOrderStatusHistory()
    }, [id])

    const fetchOrderStatusHistory = async () => {
        OrderService.getOrderStatusHistory(id).then((response) => {
            setOrderStatusHistoryResponses(response.payload)
            setLatestStatus(response.payload[response.payload.length - 1])
        })
    }

    const handleUpdateQuantity = async (id: number, quantity: number) => {
        await OrderService.updateOrderItem(Number(id), quantity)
    }

    const handleNextStatus = async () => {
        if (latestStatus?.status && reason) {
            const nextStatus: OrderStatusType = (latestStatus?.status as OrderStatusType) + 1
            await OrderService.changeStatusOrder(Number(id), reason, nextStatus).then((response) => {
                if (response.status === 200) {
                    setVisibleConfirm(false)
                    fetchOrderStatusHistory()
                    setReason('')
                }
            })
        }
    }

    const handlePreviousStatus = async () => {
        if (latestStatus?.status && reason) {
            const previousStatus: OrderStatusType = (latestStatus?.status as OrderStatusType) - 1
            await OrderService.changeStatusOrder(Number(id), reason, previousStatus).then((response) => {
                if (response.status === 200) {
                    setVisibleConfirm(false)
                    fetchOrderStatusHistory()
                    setReason('')
                }
            })
        }
    }

    const handleConfirmNext = async () => {
        if (isPrevious) {
            handlePreviousStatus()
            setIsPrevious(false)
        } else {
            handleNextStatus()
            setIsPrevious(false)
        }
    }

    const handleConfirmPrevious = async () => {
        setVisibleConfirm(true)
        setIsPrevious(true)
    }

    return (
        <>
            <div className='card'>
                <h4 className='text-xl font-semibold'>Order Detail</h4>
                <HistoryOrder
                    orderStatusHistoryResponses={orderStatusHistoryResponses}
                    orderId={Number(id)}
                    handleConfirmPrevious={handleConfirmPrevious}
                    latestStatus={latestStatus?.status as OrderStatusType}
                />
                <ChangeStatusOrderHistory
                    visibleConfirm={visibleConfirm}
                    setVisibleConfirm={setVisibleConfirm}
                    handleConfirmNext={handleConfirmNext}
                    handleConfirmPrevious={handleConfirmPrevious}
                    latestStatus={latestStatus?.status as OrderStatusType}
                    reason={reason}
                    setReason={setReason}
                />
                <CustomerOrderInfo />
                {orderStatusHistoryResponses.length > 0 && (
                    <ProductOrderList
                        onDelete={() => {}}
                        onUpdateQuantity={handleUpdateQuantity}
                        id={id}
                        status={latestStatus?.status as OrderStatusType}
                    />
                )}
            </div>
        </>
    )
}
