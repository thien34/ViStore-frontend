import React from 'react'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { InputTextarea } from 'primereact/inputtextarea'
import { OrderStatusType } from '@/interface/order.interface'
import { FaArrowLeft } from 'react-icons/fa'

interface ChangeStatusOrderHistoryProps {
    visibleConfirm: boolean
    setVisibleConfirm: (visible: boolean) => void
    handleConfirmNext: () => void
    latestStatus: OrderStatusType
    reason: string
    setReason: (reason: string) => void
    handleConfirmPrevious: () => void
    cancelOrder: (reason: string) => void
}

export default function ChangeStatusOrderHistory({
    visibleConfirm,
    setVisibleConfirm,
    handleConfirmNext,
    latestStatus,
    reason,
    setReason,
    handleConfirmPrevious,
    cancelOrder
}: ChangeStatusOrderHistoryProps) {
    const handleConfirm = () => {
        handleConfirmNext()
    }
    return (
        <>
            <div className='card'>
                <div className='flex justify-between'>
                    <div className='w-1/2 flex gap-2'>
                        <Button
                            type='button'
                            severity='success'
                            label='Xác Nhận Giao Hàng'
                            onClick={() => setVisibleConfirm(true)}
                            disabled={
                                latestStatus === OrderStatusType.COMPLETED || latestStatus === OrderStatusType.CANCELLED
                            }
                        />
                        <Button
                            type='button'
                            severity='danger'
                            label='Hủy Đơn Hàng'
                            onClick={() => cancelOrder(reason)}
                            disabled={
                                latestStatus !== OrderStatusType.CREATED && latestStatus !== OrderStatusType.PENDING
                            }
                        />
                    </div>
                    <Button
                        disabled={
                            latestStatus === OrderStatusType.SHIPPING_CONFIRMED ||
                            latestStatus === OrderStatusType.DELIVERING ||
                            latestStatus === OrderStatusType.DELIVERED ||
                            latestStatus === OrderStatusType.COMPLETED ||
                            latestStatus === OrderStatusType.CANCELLED ||
                            latestStatus === OrderStatusType.CREATED ||
                            latestStatus === OrderStatusType.PAID ||
                            latestStatus === OrderStatusType.PENDING
                        }
                        onClick={() => handleConfirmPrevious()}
                        className='ms-auto flex items-center gap-2 bg-gray-200 text-gray-500 hover:bg-gray-300 border-none font-semibold'
                    >
                        <FaArrowLeft /> Previous Status
                    </Button>
                </div>
            </div>
            <Dialog
                header='Xác Nhận Giao Hàng'
                visible={visibleConfirm}
                footer={<Button type='button' label='Xác Nhận' onClick={handleConfirm} />}
                position='top'
                style={{ width: '30vw' }}
                onHide={() => {
                    if (!visibleConfirm) return
                    setVisibleConfirm(false)
                    setReason('')
                }}
            >
                <h4>Lý Do Trả Hàng</h4>
                <InputTextarea
                    placeholder='Nhập lý do ...'
                    className='w-full h-32'
                    minLength={30}
                    maxLength={255}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                />
            </Dialog>
        </>
    )
}
