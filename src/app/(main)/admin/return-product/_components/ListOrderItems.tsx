'use client'
import { OrderItemInfoResponse, ReturnItem } from "@/interface/returnProduct.interface";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useEffect, useState } from "react";

interface OrderItemProps {
    initialData: OrderItemInfoResponse[]
    onSelectedOrderItems: (orderItems: OrderItemInfoResponse[]) => void
}

const ListOrderItems = ({ initialData, onSelectedOrderItems }: OrderItemProps) => {
    const [selectedOrderItems, setSelectedOrderItems] = useState<OrderItemInfoResponse[]>([])

    useEffect(() => {
        onSelectedOrderItems(selectedOrderItems);
    }, [selectedOrderItems]);
    
    return (
        <div>
            <DataTable
                value={initialData}
                dataKey='productId'
                selection={selectedOrderItems}
                selectionMode="multiple"
                onSelectionChange={(e) => setSelectedOrderItems(e.value)}
                onRowClick={(e) => {
                    e.originalEvent.preventDefault();
                }}
                removableSort
                resizableColumns
                showGridlines
                paginatorTemplate='FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'
                currentPageReportTemplate='Showing {first} to {last} of {totalRecords} Return Items'
                emptyMessage='No Return Items found.'
            >
                <Column
                    selectionMode='multiple'
                    headerStyle={{
                        width: '4rem'
                    }}
                ></Column>
                <Column field="productName" header="Product Name" />
                <Column field="productPrice" header="Price" />
                <Column field="quantity" header="Quantity" />
                <Column field="discountAmount" header="Discount" />
            </DataTable>
        </div>
    )
}
export default ListOrderItems