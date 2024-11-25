import React from 'react'
import { Action, Event, Subtitle, Timeline, Title } from '@reactuiutils/horizontal-timeline'
import { FaBug, FaRegCalendarCheck, FaTimesCircle, FaTruck, FaRegCheckCircle, FaRegClock } from 'react-icons/fa'
import { OrderStatusType } from '@/interface/order.interface'
import '@reactuiutils/horizontal-timeline/timeline.css'
import { OrderStatusHistoryResponse } from '@/interface/orderItem.interface'

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
}

export default function HistoryOrder({ orderStatusHistoryResponses }: Props) {
    return (
        <>
            <div className='card'>
                <h4>Order History</h4>
                <Timeline minEvents={6}>
                    {orderStatusHistoryResponses.map((status) => {
                        const config = statusConfig[status.status as keyof typeof statusConfig] || {
                            label: 'Unknown Status',
                            icon: FaBug,
                            color: 'gray'
                        }
                        return (
                            <Event key={status.id} color={config.color} icon={config.icon}>
                                <Title>{config.label}</Title>
                                <Subtitle>
                                    {new Date(status.paidDate).toLocaleString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </Subtitle>
                                {status.notes && (
                                    <Action onClick={() => alert(`Details: ${status.notes}`)}>View Notes</Action>
                                )}
                            </Event>
                        )
                    })}
                </Timeline>
            </div>
        </>
    )
}
