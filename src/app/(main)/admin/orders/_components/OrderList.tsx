'use client'
import { OrderResponse, OrderStatusType } from '@/interface/order.interface'
import Link from 'next/dist/client/link'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { Tag } from 'primereact/tag'
import { FaTimesCircle } from 'react-icons/fa'
import { FaRegCheckCircle, FaTruck } from 'react-icons/fa'
import { FaRegClock } from 'react-icons/fa'
import { FaRegCalendarCheck } from 'react-icons/fa'
import { TbEyeEdit } from 'react-icons/tb'

interface Props {
    orders: OrderResponse[]
}

export default function OrderList({ orders }: Props) {
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
        const status = statusConfig[row.orderStatus as OrderStatusType]
        if (!status) {
            return <Tag value='Trạng thái không xác định' />
        }
        return <Tag value={status.label} severity={getSeverity(row.orderStatus)} />
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

    const orderDetailBody = (row: OrderResponse) => {
        return (
            <Link href={`/admin/orders/${row.id}`} className='inline-block'>
                <TbEyeEdit className='text-blue-500' style={{ cursor: 'pointer', width: '25px', height: '25px' }} />
            </Link>
        )
    }

    const customerNameBody = (row: OrderResponse) => {
        if (row.customerId == 1) {
            return <Tag value='Khách lẻ' severity='info' />
        }
        return <span>{row.customerName}</span>
    }

    return (
        <div className='card'>
            <DataTable
                value={orders}
                removableSort
                resizableColumns
                showGridlines
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 25]}
                paginatorTemplate='FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'
                currentPageReportTemplate='Hiển thị từ {first} đến {last} trong tổng số {totalRecords} đơn hàng'
                emptyMessage='Không có đơn đơn hàng nào'
            >
                <Column body={(_, { rowIndex }) => rowIndex + 1} header='#' />
                <Column align='center' field='billCode' header='Mã Hóa Đơn' />
                <Column align='center' field='customerName' header='Khách Hàng' body={customerNameBody} />
                <Column align='center' field='orderStatus' header='Trạng Thái' body={orderStatusBody} />
                <Column
                    sortable
                    align='center'
                    field='orderTotal'
                    header='Tổng Tiền'
                    body={(row) => `${row.orderTotal.toLocaleString('vi-VN')}₫`}
                />

                <Column
                    field='paidDateUtc'
                    align='center'
                    header='Ngày Thanh Toán'
                    sortable
                    body={(row) => formatDate(row.paidDateUtc)}
                />
                <Column align='center' field='action' body={orderDetailBody} />
            </DataTable>
        </div>
    )
}
