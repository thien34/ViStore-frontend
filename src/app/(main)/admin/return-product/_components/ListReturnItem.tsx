'use client'

import { ReturnItem } from "@/interface/returnProduct.interface"
import { Column } from "primereact/column"
import { DataTable } from "primereact/datatable"
import { useEffect, useState } from "react"

export interface ReturnItemProps {
    initialData: ReturnItem[]
}

const ListReturnItems = ({ initialData }: ReturnItemProps) => {
    const [returnItems, setReturnItems] = useState<ReturnItem[]>(initialData)
    return (
        <div>
            <DataTable
                value={returnItems}
                dataKey='id'
                removableSort
                resizableColumns
                showGridlines
                paginatorTemplate='FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'
                currentPageReportTemplate='Hiển thị từ {first} đến {last} trong tổng số {totalRecords} sản phẩm trả'
                emptyMessage='Không tìm thấy mặt hàng trả lại.'
            >
                <Column
                    header="#"
                    body={(rowData, options) => options.rowIndex + 1}
                ></Column>
                <Column field="productName" header="Tên Sản Phẩm" />
                <Column field="oldUnitPrice" header="Giá" />
                <Column field="quantity" header="Số Lượng" />
                <Column field="discountAmountPerItem" header="Giảm Giá" />
                <Column field="refundTotal" header="Tổng Đơn Trả" />
            </DataTable>
        </div>
    )
}
export default ListReturnItems
