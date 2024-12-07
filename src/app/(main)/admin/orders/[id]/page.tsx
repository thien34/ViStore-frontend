'use client'
import { useRef, useState } from 'react'
import OrderService from '@/service/order.service'
import { useUpdateEffect } from 'primereact/hooks'
import HistoryOrder from './_components/HistoryOrder'
import { OrderStatusHistoryResponse } from '@/interface/orderItem.interface'
import ProductOrderList from './_components/ProductOrderList'
import { OrderFilter, OrderResponse, OrderStatusType } from '@/interface/order.interface'
import ChangeStatusOrderHistory from './_components/ChangeStatusOrderHistory'
import CustomerOrderInfo from './_components/CustomerOrder'
import OrderToltalPrice from './_components/OrderToltalPrice'
import { Toast } from 'primereact/toast'
import { confirmDialog, ConfirmDialog } from 'primereact/confirmdialog'

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
    const [order, setOrder] = useState<OrderResponse>()
    const [filter, setFilter] = useState<OrderFilter>({})
    const toast = useRef<Toast>(null)
    useUpdateEffect(() => {
        fetchOrderStatusHistory()
        fetchOrder()
    }, [id])

    const fetchOrderStatusHistory = async () => {
        OrderService.getOrderStatusHistory(id).then((response) => {
            setOrderStatusHistoryResponses(response.payload)
            setLatestStatus(response.payload[response.payload.length - 1])
        })
    }

    const fetchOrder = async () => {
        OrderService.getOrders(filter).then((response) => {
            setOrder(response.payload.find((order) => order.id === Number(id)))
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

    const cancelOrder = async (reason: string) => {
        setVisibleConfirm(false)
        confirmDialog({
            message: 'Are you sure you want to cancel this order?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            defaultFocus: 'accept',
            accept: async () => {
                await OrderService.cancelOrder(Number(id), reason).then((response) => {
                    if (response.status === 200) {
                        toast.current?.show({
                            severity: 'success',
                            summary: 'Success',
                            detail: 'Cancel order successfully!',
                            life: 3000
                        })
                        fetchOrderStatusHistory()
                    }
                })
            }
        })
    }

    return (
        <>
            <div className='card'>
                <h4 className='text-xl font-semibold'>Chi tiết đơn hàng</h4>
                <ConfirmDialog />
                <Toast ref={toast} />
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
                    cancelOrder={cancelOrder}
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
                {order && <OrderToltalPrice order={order} />}
            </div>
        </>
    )
}
