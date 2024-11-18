'use client'

import { OrderResponse, OrderStatusType, PaymentMethodType, PaymentModeType } from '@/interface/order.interface'
import Link from 'next/dist/client/link'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { Tag } from 'primereact/tag'
import React from 'react'
import { TbEyeEdit } from 'react-icons/tb'

interface Props {
    orders: OrderResponse[]
}

export default function OrderList({ orders }: Props) {
    const formatDate = (date: string) => {
        if (!date) return ''
        const dateObj = new Date(date)
        const dateStr = dateObj.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        })
        const timeStr = dateObj.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        })
        return `${dateStr} ${timeStr}`
    }

    const orderStatusBody = (row: OrderResponse) => {
        switch (row.orderStatus) {
            case OrderStatusType.PENDING:
                return <Tag value='Pending' severity='info' />
            case OrderStatusType.CONFIRMED:
                return <Tag value='Confirmed' severity='success' />
            case OrderStatusType.SHIPPING_PENDING:
                return <Tag value='Shipping Pending' severity='warning' />
            case OrderStatusType.SHIPPING_CONFIRMED:
                return <Tag value='Shipping Confirmed' severity='info' />
            case OrderStatusType.DELIVERING:
                return <Tag value='Delivering' severity='info' />
            case OrderStatusType.DELIVERED:
                return <Tag value='Delivered' severity='success' />
            case OrderStatusType.PAID:
                return <Tag value='Paid' severity='success' />
            case OrderStatusType.COMPLETED:
                return <Tag value='Completed' severity='success' />
            case OrderStatusType.CANCELLED:
                return <Tag value='Cancelled' severity='danger' />
            default:
                return <Tag value={OrderStatusType[row.orderStatus]} />
        }
    }

    const paymentMethodBody = (row: OrderResponse) => {
        switch (row.paymentMethod) {
            case PaymentMethodType.Cash:
                return <Tag value='Cash' severity='info' />
            case PaymentMethodType.BankTransfer:
                return <Tag value='Bank Transfer' severity='info' />
            case PaymentMethodType.Cod:
                return <Tag value='Cash on Delivery' severity='info' />
            default:
                return <Tag value={PaymentMethodType[row.paymentMethod]} />
        }
    }
    const paymentModeBody = (row: OrderResponse) => {
        console.log(row.paymentMode)
        switch (row.paymentMode) {
            case PaymentModeType.Online:
                return <Tag value='Online' severity='info' />
            case PaymentModeType.IN_STORE:
                return <Tag value='In Store' severity='info' />
            default:
                return <Tag value={PaymentModeType[row.paymentMode]} />
        }
    }

    const orderDetailBody = (row: OrderResponse) => {
        return (
            <Link href={`/admin/orders/${row.id}`}>
                <TbEyeEdit className='text-blue-500' style={{ cursor: 'pointer', width: '25px', height: '25px' }} />
            </Link>
        )
    }

    const customerNameBody = (row: OrderResponse) => {
        if (row.customerId == 1) {
            return <Tag value='Guest' severity='info' />
        }
        return <span>{row.customerName}</span>
    }

    return (
        <div>
            <DataTable value={orders} paginator rows={10} rowsPerPageOptions={[10, 20, 50]}>
                <Column body={(_, { rowIndex }) => rowIndex + 1} header='#' />
                <Column align='center' field='billCode' header='Bill Code' />
                <Column align='center' field='customerName' header='Customer Name' body={customerNameBody} />
                <Column align='center' field='orderStatus' header='Order Status' body={orderStatusBody} />
                <Column align='center' field='totalItem' header='Total Item' />
                <Column align='center' field='orderTotal' header='Price Total' body={(row) => `$${row.orderTotal} `} />
                <Column align='center' field='paymentMethod' header='Payment Method' body={paymentMethodBody} />
                <Column align='center' field='paymentMode' header='Payment Mode' body={paymentModeBody} />
                <Column
                    align='center'
                    field='paidDateUtc'
                    header='Paid Date'
                    body={(row) => formatDate(row.paidDateUtc)}
                />
                <Column align='center' field='action' header='Action' body={orderDetailBody} />
            </DataTable>
        </div>
    )
}
