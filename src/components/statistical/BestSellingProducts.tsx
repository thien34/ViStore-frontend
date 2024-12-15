import React from 'react'
import { Card } from 'primereact/card'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { formatCurrency } from '@/utils/format'
import { BestSellingProduct } from '@/interface/statistical.interface'

const BestSellingProducts = ({ products }: { products: BestSellingProduct[] }) => {
    return (
        <Card title='Sản phẩm bán chạy' className='mb-6 p-4'>
            <DataTable
                value={products}
                dataKey='id'
                removableSort
                resizableColumns
                showGridlines
                paginator
                rows={5}
                rowsPerPageOptions={[5, 10, 25]}
                paginatorTemplate='FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'
                tableStyle={{ minWidth: '50rem' }}
                currentPageReportTemplate='Hiển thị từ {first} đến {last} trong tổng số {totalRecords} sản phẩm'
            >
                <Column field='productName' header='Tên sản phẩm' />
                <Column
                    field='totalQuantitySold'
                    header='Tổng số lượng bán'
                    body={(rowData) => rowData.totalQuantitySold.toLocaleString()}
                />
                <Column
                    field='totalRevenue'
                    header='Tổng doanh thu'
                    body={(rowData) => `${formatCurrency(rowData.totalRevenue)}`}
                />
            </DataTable>
        </Card>
    )
}

export default BestSellingProducts
