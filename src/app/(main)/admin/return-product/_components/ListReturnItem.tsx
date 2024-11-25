'use client'

import { ReturnItem } from "@/interface/returnProduct.interface"
import { Column } from "primereact/column"
import { DataTable } from "primereact/datatable"

export interface ReturnItemProps {
    initialData: ReturnItem[]
}

const ListReturnItems = ({ initialData }: ReturnItemProps) => {
    return (
        <div>
            <DataTable
                value={initialData}
                dataKey='id'
                removableSort
                resizableColumns
                showGridlines
                paginatorTemplate='FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'
                currentPageReportTemplate='Showing {first} to {last} of {totalRecords} Return Items'
                emptyMessage='No Return Items found.'
            >
                <Column
                    header="STT"
                    body={(rowData, options) => options.rowIndex + 1}
                ></Column>
                <Column field="productName" header="Product Name" />
                <Column field="oldUnitPrice" header="Price" />
                <Column field="quantity" header="Quantity" />
                <Column field="discountAmountPerItem" header="Discount" />
                <Column field="refundTotal" header="Refund Total" />
            </DataTable>          
        </div>
    )
}
export default ListReturnItems