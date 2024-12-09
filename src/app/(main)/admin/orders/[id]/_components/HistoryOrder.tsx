import { Event, Subtitle, Timeline, Title } from '@reactuiutils/horizontal-timeline'
import {
    FaBug,
    FaRegCalendarCheck,
    FaTimesCircle,
    FaTruck,
    FaRegCheckCircle,
    FaRegClock,
    FaPrint,
    FaHistory
} from 'react-icons/fa'
import { InvoiceData, OrderStatusType } from '@/interface/order.interface'
import '@reactuiutils/horizontal-timeline/timeline.css'
import { OrderStatusHistoryResponse } from '@/interface/orderItem.interface'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { useRef, useState } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Tag } from 'primereact/tag'
import InvoiceComponent from '@/components/invoice/InvoiceComponent'
import { useReactToPrint } from 'react-to-print'

const statusConfig = {
    [OrderStatusType.CREATED]: { label: 'Tạo', icon: FaRegCalendarCheck, color: 'blue' },
    [OrderStatusType.PENDING]: { label: 'Chờ xử lý', icon: FaRegClock, color: 'orange' },
    [OrderStatusType.CONFIRMED]: { label: 'Đã xác nhận', icon: FaRegCheckCircle, color: 'cyan' },
    [OrderStatusType.SHIPPING_PENDING]: { label: 'Chờ vận chuyển', icon: FaTruck, color: 'teal' },
    [OrderStatusType.SHIPPING_CONFIRMED]: { label: 'Đã xác nhận vận chuyển', icon: FaTruck, color: 'purple' },
    [OrderStatusType.DELIVERING]: { label: 'Đang giao hàng', icon: FaTruck, color: 'gold' },
    [OrderStatusType.DELIVERED]: { label: 'Đã giao hàng', icon: FaRegCheckCircle, color: 'green' },
    [OrderStatusType.PAID]: { label: 'Đã thanh toán', icon: FaRegCalendarCheck, color: 'darkgreen' },
    [OrderStatusType.COMPLETED]: { label: 'Thành công', icon: FaRegCheckCircle, color: 'darkblue' },
    [OrderStatusType.CANCELLED]: { label: 'Đã hủy', icon: FaTimesCircle, color: 'red' }
}

interface Props {
    orderStatusHistoryResponses: OrderStatusHistoryResponse[]
    orderId: number
    handleConfirmPrevious: () => Promise<void>
    latestStatus: OrderStatusType
    invoiceData?: InvoiceData
}

export default function HistoryOrder({ orderStatusHistoryResponses, invoiceData, latestStatus }: Props) {
    const [visible, setVisible] = useState(false)
    const [notes, setNotes] = useState('')
    const [historyVisible, setHistoryVisible] = useState(false)

    const handleViewNotes = (note: string) => {
        setNotes(note)
        setVisible(true)
    }

    const renderStatus = (rowData: OrderStatusHistoryResponse) => {
        const config = statusConfig[rowData.status as keyof typeof statusConfig] || {
            label: 'Trạng thái không xác định',
            icon: FaBug,
            color: 'gray'
        }

        const currentIndex = orderStatusHistoryResponses.findIndex((item) => item.id === rowData.id)
        const previousStatus = currentIndex !== 0 ? orderStatusHistoryResponses[currentIndex + 1]?.status : null

        return (
            <div className='flex items-center gap-2'>
                {previousStatus && (
                    <>
                        <Tag
                            value={statusConfig[previousStatus as keyof typeof statusConfig]?.label}
                            severity={getSeverity(previousStatus)}
                        />
                        <span className='font-bold'>→</span>
                    </>
                )}
                <Tag value={config.label} severity={getSeverity(rowData.status)} />
            </div>
        )
    }
    const getSeverity = (orderStatus: OrderStatusType) => {
        switch (orderStatus) {
            case OrderStatusType.PENDING:
                return 'info'
            case OrderStatusType.CONFIRMED:
            case OrderStatusType.DELIVERED:
            case OrderStatusType.COMPLETED:
            case OrderStatusType.PAID:
                return 'success'
            case OrderStatusType.SHIPPING_PENDING:
            case OrderStatusType.SHIPPING_CONFIRMED:
            case OrderStatusType.DELIVERING:
                return 'warning'
            case OrderStatusType.CANCELLED:
                return 'danger'
            default:
                return 'info'
        }
    }
    const renderDate = (rowData: OrderStatusHistoryResponse) => {
        return (
            <div>
                {new Date(rowData.updatedDate).toLocaleString('vi-VN', {
                    year: 'numeric',
                    month: 'numeric',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                })}
            </div>
        )
    }
    const renderIndex = (rowData: OrderStatusHistoryResponse) => {
        return <div>{orderStatusHistoryResponses.findIndex((item) => item.id === rowData.id) + 1}</div>
    }

    const componentRef = useRef<HTMLDivElement>(null)
    const reactToPrintFn = useReactToPrint({
        contentRef: componentRef,
        onAfterPrint: () => {
            if (componentRef.current) {
                componentRef.current.classList.add('hidden')
            }
        }
    })
    const handlePrint = () => {
        if (componentRef.current) {
            componentRef.current.classList.remove('hidden')
        }
        reactToPrintFn()
    }

    return (
        <>
            <div className='card'>
                <h4 className='text-xl font-semibold'>Lịch sử đơn hàng</h4>
                <Timeline minEvents={6}>
                    {orderStatusHistoryResponses.map((status) => {
                        const config = statusConfig[status.status as keyof typeof statusConfig] || {
                            label: 'Trạng thái không xác định',
                            icon: FaBug,
                            color: 'gray'
                        }
                        return (
                            <Event key={status.id} color={config.color} icon={config.icon}>
                                <Title className='text-[12px] mb-2 mx-5 w-full'>{config.label}</Title>
                                <div className='flex flex-col'>
                                    <Subtitle>
                                        {new Date(status.paidDate).toLocaleString('vi-VN', {
                                            year: 'numeric',
                                            month: 'numeric',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hour12: false
                                        })}
                                    </Subtitle>
                                </div>
                                {status.notes && (
                                    <Button className='h-4 my-3' onClick={() => handleViewNotes(status.notes)}>
                                        Xem nội dung
                                    </Button>
                                )}
                            </Event>
                        )
                    })}
                </Timeline>
                <div className='flex justify-between'>
                    {latestStatus === OrderStatusType.COMPLETED && (
                        <Button
                            className='gap-2 mt-5 bg-blue-500 text-white hover:bg-blue-600 border-none font-semibold'
                            label='In hóa đơn'
                            icon={<FaPrint />}
                            onClick={handlePrint}
                        />
                    )}
                    <Button
                        icon={<FaHistory />}
                        onClick={() => setHistoryVisible(true)}
                        className='ms-auto flex items-center gap-2 mt-5 bg-blue-500 text-white hover:bg-blue-600 border-none font-semibold'
                    >
                        Lịch sử đơn hàng
                    </Button>
                </div>

                <div ref={componentRef} style={{ display: 'none' }}>
                    {invoiceData && <InvoiceComponent data={invoiceData} />}
                </div>

                <style jsx>{`
                    @media print {
                        div {
                            display: block !important;
                        }
                    }
                `}</style>
                <Dialog
                    visible={visible}
                    modal
                    header='Nội dung'
                    position='top'
                    style={{ width: '30rem' }}
                    onHide={() => {
                        if (!visible) return
                        setVisible(false)
                    }}
                >
                    <p className='m-0'>{notes}</p>
                </Dialog>
                <Dialog
                    visible={historyVisible}
                    modal
                    header='Lịch sử đơn hàng'
                    position='top'
                    style={{ width: '75rem' }}
                    onHide={() => {
                        if (!historyVisible) return
                        setHistoryVisible(false)
                    }}
                >
                    <DataTable value={orderStatusHistoryResponses} showGridlines>
                        <Column field='#' header='' body={renderIndex}></Column>
                        <Column field='createdBy' header='Người tạo'></Column>
                        <Column field='createdDate' header='Thời gian' body={renderDate}></Column>
                        <Column field='updatedBy' header='Người cập nhật'></Column>
                        <Column field='updatedDate' header='Thời gian' body={renderDate}></Column>
                        <Column field='status' header='Trạng thái' body={renderStatus}></Column>
                        <Column field='notes' header='Nội dung'></Column>
                    </DataTable>
                </Dialog>
            </div>
        </>
    )
}
