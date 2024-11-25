'use client'

import { ReturnInvoice, ReturnItem, ReturnItemRequest } from "@/interface/returnProduct.interface"
import returnProductService from "@/service/returnProduct.service"
import { init } from "next/dist/compiled/webpack/webpack"
import { Button } from "primereact/button"
import { Column } from "primereact/column"
import { DataTable } from "primereact/datatable"
import { Dialog } from "primereact/dialog"
import { use, useRef, useState } from "react"
import ListOrder from "./ListOrder"
import ListReturnItems from "./ListReturnItem"

interface ReturnInvoiceProps {
    initialData: ReturnInvoice[]
}

const ListReturnInvoices = ({ initialData }: ReturnInvoiceProps) => {
    const [returnInvoices, setReturnInvoices] = useState<ReturnInvoice[]>(initialData)
    const [returnItems, setReturnItems] = useState<ReturnItem[]>([])
    const [visible, setVisible] = useState(false)
    const data = useRef<DataTable<ReturnInvoice[]>>(null)

    const fetchOrderItems = async (returnRequestId: number) => {
        const { payload: result } = await returnProductService.getAllReturnItem(returnRequestId);
        setReturnItems(result.items);
    }

    const showModal = async (returnRequestId: number) => {
        try {
            setVisible(false);
            await fetchOrderItems(returnRequestId);
            setVisible(true);

        } catch (error) {
            setVisible(true);
            console.error('Error fetch order items data:', error);
        }
    }
    const calculateRefundTotal = (item: ReturnItem): number => {
        return item.quantity * (item.oldUnitPrice - item.discountAmountPerItem);
    };

    const totalRefund = returnItems.reduce((total, item: ReturnItem) => {
        return total + calculateRefundTotal(item);
    }, 0);
    const actionBodyTemplate = (rowData: { returnRequestId: number, initialData: ReturnItem[] }) => {
        return (
            <>
                <Button label="Show" icon="pi pi-expand" onClick={() => showModal(rowData.returnRequestId)} />
                <Dialog header="List Returned Items" visible={visible} onHide={() => { if (!visible) return; setVisible(false); }} >
                    <ListReturnItems initialData={returnItems} />
                    <div className="flex  gap-5 mt-4">
                        <label htmlFor="" className="font-bold">Total Return : ${totalRefund}</label>
                    </div>
                    <div className="flex flex-row gap-5 mt-5">
                        <Button label="Print Returned Invoiced" />
                        <Button label="Close" onClick={() => setVisible(false)} />
                    </div>

                </Dialog>
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
                currentPageReportTemplate='Showing {first} to {last} of {totalRecords} Return Invoices'
                emptyMessage='No Return Invoices found.'
            >
                <Column
                    selectionMode='multiple'
                    headerStyle={{
                        width: '4rem'
                    }}
                ></Column>
                <Column
                    header="Customer"
                    body={(rowData) => `${rowData.firstName} ${rowData.lastName}`}
                />
                <Column field='orderId' header='Order' />
                <Column field='refundAmount' header='Refund Amount'
                    body={(rowData: ReturnInvoice) => {
                        return `${rowData.refundAmount}$`
                    }}
                />
                <Column header='Action' body={actionBodyTemplate} />
            </DataTable>
        </div>
    )
}

export default ListReturnInvoices