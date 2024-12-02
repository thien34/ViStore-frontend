import { Event, Subtitle, Timeline, Title } from '@reactuiutils/horizontal-timeline'
import { FaBug, FaRegCalendarCheck, FaTimesCircle, FaTruck, FaRegCheckCircle, FaRegClock } from 'react-icons/fa'
import { OrderStatusType } from '@/interface/order.interface'
import '@reactuiutils/horizontal-timeline/timeline.css'
import { OrderStatusHistoryResponse } from '@/interface/orderItem.interface'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { useState } from 'react'

const statusConfig = {
    [OrderStatusType.CREATED]: { label: 'Created', icon: FaRegCalendarCheck, color: 'blue' },
    [OrderStatusType.PENDING]: { label: 'Pending', icon: FaRegClock, color: 'orange' },
    [OrderStatusType.CONFIRMED]: { label: 'Confirmed', icon: FaRegCheckCircle, color: 'cyan' },
    [OrderStatusType.SHIPPING_PENDING]: { label: 'Shipping Pending', icon: FaTruck, color: 'teal' },
    [OrderStatusType.SHIPPING_CONFIRMED]: { label: 'Shipping Confirmed', icon: FaTruck, color: 'purple' },
    [OrderStatusType.DELIVERING]: { label: 'Delivering', icon: FaTruck, color: 'gold' },
    [OrderStatusType.DELIVERED]: { label: 'Delivered', icon: FaRegCheckCircle, color: 'green' },
    [OrderStatusType.PAID]: { label: 'Paid', icon: FaRegCalendarCheck, color: 'darkgreen' },
    [OrderStatusType.COMPLETED]: { label: 'Completed', icon: FaRegCheckCircle, color: 'darkblue' },
    [OrderStatusType.CANCELLED]: { label: 'Cancelled', icon: FaTimesCircle, color: 'red' }
}

interface Props {
    orderStatusHistoryResponses: OrderStatusHistoryResponse[]
    orderId: number
    handleConfirmPrevious: () => Promise<void>
    latestStatus: OrderStatusType
}

export default function HistoryOrder({ orderStatusHistoryResponses }: Props) {
    const [visible, setVisible] = useState(false)
    const [notes, setNotes] = useState('')

    const handleViewNotes = (note: string) => {
        setNotes(note)
        setVisible(true)
    }
    return (
        <>
            <div className='card'>
                <h4 className='text-xl font-semibold'>Order History</h4>
                <Timeline minEvents={6}>
                    {orderStatusHistoryResponses.map((status) => {
                        const config = statusConfig[status.status as keyof typeof statusConfig] || {
                            label: 'Unknown Status',
                            icon: FaBug,
                            color: 'gray'
                        }
                        return (
                            <Event key={status.id} color={config.color} icon={config.icon}>
                                <Title className='text-[15px] mb-2 mx-5 w-full'>{config.label}</Title>
                                <div className='flex flex-col'>
                                    <Subtitle>
                                        {new Date(status.paidDate).toLocaleString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </Subtitle>
                                </div>
                                {status.notes && (
                                    <Button className='h-4 my-3' onClick={() => handleViewNotes(status.notes)}>
                                        View Notes
                                    </Button>
                                )}
                            </Event>
                        )
                    })}
                </Timeline>
                {/* <Button
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
                    className='ms-auto flex items-center gap-2 mt-5 bg-gray-200 text-gray-500 hover:bg-gray-300 border-none font-semibold'
                >
                    <FaArrowLeft /> Previous Status
                </Button> */}
                <Dialog
                    visible={visible}
                    modal
                    header='Notes Order'
                    position='top'
                    style={{ width: '30rem' }}
                    onHide={() => {
                        if (!visible) return
                        setVisible(false)
                    }}
                >
                    <p className='m-0'>{notes}</p>
                </Dialog>
            </div>
        </>
    )
}
