import { Button } from "primereact/button"
import { Column, ColumnSortEvent } from "primereact/column"
import { DataTable } from "primereact/datatable"
import { useEffect, useRef, useState } from "react"
import { OrderItemInfoResponse, CustomerOrderResponse, ReturnInvoiceRequest, ReturnItem, ReturnItemRequest, ReturnRequestRequest } from "@/interface/returnProduct.interface"
import returnProductService from "@/service/returnProduct.service"

interface OrderProps {
    initialData: CustomerOrderResponse[],
    setOrderModalClose: () => void
    setOrder: (order: CustomerOrderResponse) => void
    setOrderItem: (orderItems: OrderItemInfoResponse[]) => void
}
const ListOrder = ({ initialData, setOrderModalClose, setOrderItem, setOrder }: OrderProps) => {
    const [orderItemInfo, setOrderItemInfo] = useState<OrderItemInfoResponse[]>([])
    const [visible, setVisible] = useState(false)
    const [selectOrderItemModal, setSelectOrderItemModal] = useState(false)
    const [returnItemModal, setReturnItemModal] = useState(false)
    const data = useRef<DataTable<CustomerOrderResponse[]>>(null)
    const [selectedOrderItems, setSelectedOrderItems] = useState<OrderItemInfoResponse[]>([])

    const fetchOrderItems = async (orderId: number) => {
        try {
            const { payload: data } = await returnProductService.getOrderItemByOrderId(orderId);
            setOrderItemInfo(data);
            return data;
        } catch (error) {
            console.error("Lỗi khi thêm đơn hàng", error);
        }
    }


    const showModal = async (orderId: number) => {
        try {
            setVisible(false);
            await fetchOrderItems(orderId);
            setSelectOrderItemModal(true);

        } catch (error) {
            setVisible(true);
            console.error('Lỗi khi thêm dữ liệu đơn hàng:', error);
        }
    }

    function convertDateToFormat(dateStr: string) {
        const dateObj = new Date(dateStr);
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const year = dateObj.getFullYear();
        const hours = String(dateObj.getHours()).padStart(2, '0');
        const minutes = String(dateObj.getMinutes()).padStart(2, '0');
        const seconds = String(dateObj.getSeconds()).padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    }

    const returnOrder = async (item: CustomerOrderResponse) => {
        setOrder(item);
        const resultItem = await returnProductService.getOrderItemByOrderId(item.orderId);
        if (resultItem) {
            setOrderItem(resultItem.payload);
        }
        setOrderModalClose();
    }
    const listOrderItems = (rowData: CustomerOrderResponse) => {
        return (
            <>
                <Button label="Chọn" icon="pi pi-verified" onClick={() => returnOrder(rowData)} />
            </>
        )
    }

    return (
        <div className='card'>
            <DataTable
                ref={data}
                value={initialData}
                dataKey='id'
                removableSort
                resizableColumns
                showGridlines
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 25]}
                paginatorTemplate='FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'
                currentPageReportTemplate='Hiển thị từ {first} đến {last} trong tổng số {totalRecords} đơn hàng'
                emptyMessage='Không tìm thấy đơn hàng nào'

            >
                <Column field='orderId' header='Đơn Hàng' />
                <Column field='billCode' header='Mã Hóa Đơn' />
                <Column
                    header='Ngày Đặt Hàng'
                    field="orderDate"
                    sortable
                    body={(rowData) => convertDateToFormat(rowData.orderDate)}
                />
                <Column
                    header="Khách Hàng"
                    body={(rowData) => `${rowData.firstName} ${rowData.lastName}`}
                />
                <Column
                    field="orderTotal"
                    body={(rowData) => `${rowData.orderTotal}$`}
                    header="Tổng Đơn Hàng" />
                <Column body={
                    listOrderItems
                } />
            </DataTable>
        </div>
    )

}
export default ListOrder
