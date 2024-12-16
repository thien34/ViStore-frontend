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

    setVisible: (visible: boolean) => void
    checkStatusPaid: boolean
}

export default function ChangeStatusOrderHistory({
    visibleConfirm,
    setVisibleConfirm,
    handleConfirmNext,
    latestStatus,
    reason,
    setReason,
    handleConfirmPrevious,
    setVisible,
    checkStatusPaid
}: ChangeStatusOrderHistoryProps) {
    const handleConfirm = () => {
        handleConfirmNext()
    }
    enum OrderStatusType {
        CREATED = 0, // Mới tạo
        PENDING = 1, // Chờ xử lý
        CONFIRMED = 2, // Đã xác nhận
        SHIPPING_PENDING = 3, // Chờ vận chuyển
        SHIPPING_CONFIRMED = 4, // Đã xác nhận vận chuyển
        DELIVERING = 5, // Đang giao hàng
        DELIVERED = 6, // Đã giao hàng
        PAID = 7, // Đã thanh toán
        COMPLETED = 8, // Thành công
        CANCELLED = 9 // Đã hủy
    }

    const getButtonLabel = (status: OrderStatusType): string => {
        if (status === OrderStatusType.DELIVERED && checkStatusPaid) {
            return 'Hoàn Thành Đơn Hàng'
        }
        switch (status) {
            case OrderStatusType.CREATED:
                return 'Xác Nhận Đơn Hàng'
            case OrderStatusType.PENDING:
                return 'Xác Nhận Vận Chuyển'
            case OrderStatusType.CONFIRMED:
                return 'Xác Nhận Giao Hàng'
            case OrderStatusType.SHIPPING_PENDING:
                return 'Xác Nhận Lấy Hàng'
            case OrderStatusType.SHIPPING_CONFIRMED:
                return 'Bắt Đầu Giao Hàng'
            case OrderStatusType.DELIVERING:
                return 'Hoàn Thành Giao Hàng'
            case OrderStatusType.DELIVERED:
                return 'Xác Nhận Thanh Toán'
            case OrderStatusType.PAID:
                return 'Xác Nhận Thanh Toán'
            case OrderStatusType.COMPLETED:
                return 'Hoàn Thành Đơn Hàng'
            case OrderStatusType.CANCELLED:
                return 'Đơn Hàng Đã Hủy'
            default:
                return 'Thực Hiện Hành Động'
        }
    }
    const shouldHideCard = (status: OrderStatusType): boolean => {
        if (status === OrderStatusType.COMPLETED || status === OrderStatusType.CANCELLED) {
            return true
        }
        return status > OrderStatusType.COMPLETED
    }
    return (
        <>
            {!shouldHideCard(latestStatus) && (
                <div className='card'>
                    <div className='flex justify-between'>
                        <div className='w-1/2 flex gap-2'>
                            {latestStatus !== OrderStatusType.COMPLETED &&
                                latestStatus !== OrderStatusType.CANCELLED && (
                                    <Button
                                        type='button'
                                        severity='success'
                                        label={getButtonLabel(latestStatus)}
                                        onClick={() => setVisibleConfirm(true)}
                                    />
                                )}

                            {latestStatus <= OrderStatusType.CONFIRMED && (
                                <Button
                                    type='button'
                                    severity='danger'
                                    label='Hủy Đơn Hàng'
                                    onClick={() => setVisible(true)}
                                />
                            )}
                        </div>
                        {!(
                            latestStatus === OrderStatusType.SHIPPING_CONFIRMED ||
                            latestStatus === OrderStatusType.DELIVERING ||
                            latestStatus === OrderStatusType.DELIVERED ||
                            latestStatus === OrderStatusType.COMPLETED ||
                            latestStatus === OrderStatusType.CANCELLED ||
                            latestStatus === OrderStatusType.CREATED ||
                            latestStatus === OrderStatusType.PAID ||
                            latestStatus === OrderStatusType.PENDING
                        ) && (
                            <Button
                                onClick={() => handleConfirmPrevious()}
                                className='ms-auto flex items-center gap-2 bg-gray-200 text-gray-500 hover:bg-gray-300 border-none font-semibold'
                            >
                                <FaArrowLeft /> Trở Lại
                            </Button>
                        )}
                    </div>
                </div>
            )}
            <Dialog
                header={getButtonLabel(latestStatus)}
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
                <h4>Nội dung</h4>
                <InputTextarea
                    placeholder='Nhập nội dung ...'
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
