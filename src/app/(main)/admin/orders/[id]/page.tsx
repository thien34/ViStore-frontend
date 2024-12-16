'use client'
import { useRef, useState } from 'react'
import OrderService from '@/service/order.service'
import { useUpdateEffect } from 'primereact/hooks'
import HistoryOrder from './_components/HistoryOrder'
import { CustomerOrderResponse, OrderStatusHistoryResponse } from '@/interface/orderItem.interface'
import ProductOrderList from './_components/ProductOrderList'
import { InvoiceData, OrderFilter, OrderResponse, OrderStatusType } from '@/interface/order.interface'
import ChangeStatusOrderHistory from './_components/ChangeStatusOrderHistory'
import CustomerOrderInfo from './_components/CustomerOrder'
import OrderToltalPrice from './_components/OrderToltalPrice'
import { Toast } from 'primereact/toast'
import { ConfirmDialog } from 'primereact/confirmdialog'
import { Dialog } from 'primereact/dialog'
import { InputTextarea } from 'primereact/inputtextarea'
import { Button } from 'primereact/button'

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
    const [visible, setVisible] = useState(false)
    const [customerOrder, setCustomerOrder] = useState<CustomerOrderResponse>()
    const [checkStatusPaid, setCheckStatusPaid] = useState(false)
    useUpdateEffect(() => {
        fetchOrderStatusHistory()
        fetchOrder()
    }, [id])
    const [invoiceData, setInvoiceData] = useState<InvoiceData>()

    const fetchOrderStatusHistory = async () => {
        OrderService.getOrderStatusHistory(id).then((response) => {
            setOrderStatusHistoryResponses(response.payload)
            setLatestStatus(response.payload[response.payload.length - 1])
            setCheckStatusPaid(response.payload.some((status) => status.status === OrderStatusType.PAID))
            getCustomerOrder()
            fetchInvoiceData()
        })
    }

    const fetchOrder = async () => {
        OrderService.getOrders(filter).then((response) => {
            setOrder(response.payload.find((order) => order.id === Number(id)))
            setFilter({})
        })
    }

    const handleUpdateQuantity = async (id: number, quantity: number) => {
        await OrderService.updateOrderItem(Number(id), quantity)
    }
    const getCustomerOrder = () => {
        OrderService.getCustomerOrder(Number(id)).then((res) => setCustomerOrder(res.payload))
    }

    const handleNextStatus = async () => {
        if (latestStatus?.status && reason) {
            let nextStatus: OrderStatusType = (latestStatus?.status as OrderStatusType) + 1
            if (nextStatus == OrderStatusType.PAID && checkStatusPaid) {
                nextStatus = OrderStatusType.COMPLETED
            }

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

        await OrderService.cancelOrder(Number(id), reason).then((response) => {
            if (response.status === 200) {
                toast.current?.show({
                    severity: 'success',
                    summary: 'Thành công',
                    detail: 'Hủy đơn hàng thành công!',
                    life: 3000
                })
                fetchOrderStatusHistory()
            }
        })
        setVisible(false)
    }

    const fetchInvoiceData = async () => {
        OrderService.getInvoiceData(Number(id))
            .then((response) => setInvoiceData(response.payload))
            .catch((error) => {
                console.log(error)
            })
    }

    return (
        <>
            <div className='card'>
                <h4 className='text-xl font-semibold'>Chi tiết đơn hàng</h4>
                <ConfirmDialog />
                <Dialog
                    header='Hủy đơn hàng'
                    visible={visible}
                    onHide={() => {
                        if (!visible) return
                        setVisible(false)
                    }}
                    footer={<Button type='button' label='Xác Nhận' onClick={() => cancelOrder(reason)} />}
                    position='top'
                    style={{ width: '30vw' }}
                >
                    <h4>Lý do hủy đơn hàng</h4>
                    <InputTextarea
                        placeholder='Nhập lý do hủy đơn hàng ...'
                        className='w-full h-32'
                        minLength={30}
                        maxLength={255}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    />
                </Dialog>
                <Toast ref={toast} />
                <HistoryOrder
                    orderStatusHistoryResponses={orderStatusHistoryResponses}
                    orderId={Number(id)}
                    handleConfirmPrevious={handleConfirmPrevious}
                    latestStatus={latestStatus?.status as OrderStatusType}
                    invoiceData={invoiceData}
                />
                <ChangeStatusOrderHistory
                    visibleConfirm={visibleConfirm}
                    setVisibleConfirm={setVisibleConfirm}
                    handleConfirmNext={handleConfirmNext}
                    handleConfirmPrevious={handleConfirmPrevious}
                    latestStatus={latestStatus?.status as OrderStatusType}
                    reason={reason}
                    setReason={setReason}
                    setVisible={setVisible}
                    checkStatusPaid={checkStatusPaid}
                />
                {customerOrder && (
                    <CustomerOrderInfo customerOrder={customerOrder} setCustomerOrder={setCustomerOrder} />
                )}
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
