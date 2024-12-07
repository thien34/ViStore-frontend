'use client'

import { ReturnInvoice, ReturnItem, ReturnItemRequest } from "@/interface/returnProduct.interface"
import { Button } from "primereact/button"
import { Column } from "primereact/column"
import { DataTable } from "primereact/datatable"
import { useEffect, useRef, useState } from "react"
import ReturnInvoiceModal from "./ReturnInvoiceModal"

interface ReturnInvoiceProps {
    initialData: ReturnInvoice[]
}

const ListReturnInvoices = ({ initialData }: ReturnInvoiceProps) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [returnInvoices, setReturnInvoices] = useState<ReturnInvoice[]>(initialData)

    useEffect(() => {
        setReturnInvoices(initialData)
    }, [initialData])

    const data = useRef<DataTable<ReturnInvoice[]>>(null)
    const calculateRefundTotal = (item: ReturnItem): number => {
        return item.quantity * (item.oldUnitPrice - item.discountAmountPerItem);
    };

    const totalCost = (returnInvoice: ReturnInvoice): number => {
        if (!Array.isArray(returnInvoice.returnItems)) {
            return 0;
        }
        return returnInvoice.returnItems.reduce((total, item: ReturnItem) => {
            return total + calculateRefundTotal(item);
        }, 0);
    }
    const actionBodyTemplate = (rowData: ReturnInvoice) => {
        return (
            <>
                <Button label="Hiển Thị" icon="pi pi-expand" onClick={() => setModalVisible(true)} />
                <ReturnInvoiceModal visible={modalVisible} onHide={() => { if (!modalVisible) return; setModalVisible(false); }} returnInvoiceData={rowData} />
            </>
        )
    }

    return (
        <div className='card'>
            <DataTable
                ref={data}
                value={returnInvoices}
                dataKey='id'
                removableSort
                resizableColumns
                showGridlines
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 25]}
                paginatorTemplate='FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'
                currentPageReportTemplate='Hiển thị từ {first} đến {last} trong tổng số {totalRecords} hóa đơn trả'
                emptyMessage='Không tìm thấy hóa đơn trả nào'
            >
                <Column
                    selectionMode='multiple'
                    headerStyle={{
                        width: '4rem'
                    }}
                ></Column>
                <Column
                    header="Khách Hàng"
                    body={(rowData) => `${rowData.firstName} ${rowData.lastName}`}
                />
                <Column field='billCode' header='Hóa Đơn' />
                <Column field='refundAmount' header='Tiền Hoàn'
                    body={(rowData: ReturnInvoice) => {
                        return `${rowData.refundAmount}$`
                    }}
                />
                <Column header='Thao Tác' body={actionBodyTemplate} />
            </DataTable>
        </div>
    )
}

export default ListReturnInvoices
